import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProcessRequest {
  item_id: string;
  type: string;
  title?: string;
  content?: string;
  url?: string;
  user_trajectory?: string; // User's goals/trajectory for relevance scoring
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { item_id, type, title, content, url, user_trajectory } = await req.json() as ProcessRequest;

    if (!item_id) {
      return new Response(
        JSON.stringify({ success: false, error: "item_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build content description for AI
    const contentDescription = buildContentDescription(type, title, content, url);
    
    // Create prompt for structured extraction
    const systemPrompt = `You are an AI assistant for a personal productivity system called Trajectory. 
Your job is to analyze learning content and extract actionable insights.

You must analyze content and determine:
1. Key insights (2-4 actionable takeaways)
2. Relevant skills being taught
3. Difficulty level (beginner, intermediate, advanced)
4. Estimated consumption time
5. Priority recommendation (now, later, ignore) based on user's trajectory

${user_trajectory ? `User's current trajectory/goals: ${user_trajectory}` : "No specific trajectory provided - make general assessments."}

Be concise and practical. Avoid fluff. Speak like a calm senior mentor.`;

    const userPrompt = `Analyze this ${type} content:
${contentDescription}

Provide your analysis in the requested structured format.`;

    // Call Lovable AI with tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_content",
              description: "Analyze learning content and extract structured insights",
              parameters: {
                type: "object",
                properties: {
                  extracted_insights: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-4 key actionable insights or takeaways from the content",
                  },
                  tagged_skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "Skills or topics covered (e.g., 'TypeScript', 'Leadership', 'Marketing')",
                  },
                  difficulty: {
                    type: "string",
                    enum: ["beginner", "intermediate", "advanced"],
                    description: "Difficulty level of the content",
                  },
                  estimated_read_time: {
                    type: "string",
                    description: "Estimated time to consume (e.g., '5 min read', '20 min video')",
                  },
                  priority: {
                    type: "string",
                    enum: ["now", "later", "ignore"],
                    description: "Priority recommendation based on value and relevance",
                  },
                  priority_reason: {
                    type: "string",
                    description: "Brief explanation for the priority decision (1 sentence)",
                  },
                  relevance_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                    description: "How relevant this is to user's trajectory (0-100)",
                  },
                  generated_title: {
                    type: "string",
                    description: "A clear, descriptive title if none was provided",
                  },
                },
                required: [
                  "extracted_insights",
                  "tagged_skills",
                  "difficulty",
                  "estimated_read_time",
                  "priority",
                  "priority_reason",
                  "relevance_score",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_content" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log("AI analysis result:", analysis);

    // Update the knowledge item in the database
    const updateData: Record<string, unknown> = {
      extracted_insights: analysis.extracted_insights,
      tagged_skills: analysis.tagged_skills,
      difficulty: analysis.difficulty,
      estimated_read_time: analysis.estimated_read_time,
      priority: analysis.priority,
      priority_reason: analysis.priority_reason,
      relevance_score: analysis.relevance_score,
      is_processed: true,
    };

    // Only update title if not provided originally
    if (!title && analysis.generated_title) {
      updateData.title = analysis.generated_title;
    }

    const { error: updateError } = await supabase
      .from("knowledge_items")
      .update(updateData)
      .eq("id", item_id);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error(`Failed to update item: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("process-knowledge error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildContentDescription(
  type: string,
  title?: string,
  content?: string,
  url?: string
): string {
  const parts: string[] = [];
  
  if (title) parts.push(`Title: ${title}`);
  if (url) parts.push(`URL: ${url}`);
  if (content) parts.push(`Content: ${content}`);
  
  if (parts.length === 0) {
    return `A ${type} item with no additional details.`;
  }
  
  return parts.join("\n");
}
