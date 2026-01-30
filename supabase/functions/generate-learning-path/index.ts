import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateRequest {
  skill_name: string;
  skill_description?: string;
  user_id: string;
  knowledge_items?: Array<{
    id: string;
    title: string;
    type: string;
    tagged_skills: string[];
    difficulty: string;
    estimated_read_time: string;
  }>;
  current_level?: string; // beginner, intermediate, advanced
  target_level?: string;
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
    const { 
      skill_name, 
      skill_description, 
      user_id, 
      knowledge_items = [],
      current_level = "beginner",
      target_level = "advanced"
    } = await req.json() as GenerateRequest;

    if (!skill_name || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "skill_name and user_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context about available knowledge items
    const knowledgeContext = knowledge_items.length > 0
      ? `\n\nAvailable learning resources from user's knowledge base:\n${knowledge_items.map((k, i) => 
          `${i + 1}. "${k.title}" (${k.type}, ${k.difficulty}, ~${k.estimated_read_time})`
        ).join("\n")}`
      : "";

    const systemPrompt = `You are Trajectory's learning path architect. You design structured, dependency-ordered learning paths that convert consumption into mastery.

Core principles:
- Learning without application is incomplete
- Order content by dependency (foundational → advanced)
- Mix learn/practice/apply steps (70% learning, 30% application)
- Be realistic about time estimates
- Speak like a calm senior mentor

Current skill level: ${current_level}
Target skill level: ${target_level}
${knowledgeContext}`;

    const userPrompt = `Create a structured learning path for: "${skill_name}"
${skill_description ? `Description: ${skill_description}` : ""}

Design a path that:
1. Builds from ${current_level} to ${target_level}
2. Orders steps by dependency (prerequisites first)
3. Includes both learning and application steps
4. Converts learning into action missions where possible
5. Is realistic about time investment

If knowledge items are available, incorporate relevant ones. Otherwise, suggest general steps.`;

    // Call Lovable AI with structured output
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
              name: "create_learning_path",
              description: "Create a structured learning path with ordered steps",
              parameters: {
                type: "object",
                properties: {
                  path_title: {
                    type: "string",
                    description: "Clear title for the learning path",
                  },
                  path_description: {
                    type: "string",
                    description: "Brief description of what this path covers and achieves",
                  },
                  estimated_hours: {
                    type: "number",
                    description: "Total estimated hours to complete the path",
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        item_type: {
                          type: "string",
                          enum: ["learn", "practice", "apply", "review"],
                          description: "learn=consume content, practice=exercises, apply=real project, review=revisit",
                        },
                        estimated_minutes: { type: "integer" },
                        mastery_contribution: {
                          type: "integer",
                          minimum: 1,
                          maximum: 20,
                          description: "How much this step contributes to skill mastery (1-20 points)",
                        },
                        knowledge_item_index: {
                          type: "integer",
                          description: "Index of the knowledge item to link (0-based), or null if no match",
                        },
                      },
                      required: ["title", "description", "item_type", "estimated_minutes", "mastery_contribution"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["path_title", "path_description", "estimated_hours", "steps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_learning_path" } },
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
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const pathData = JSON.parse(toolCall.function.arguments);
    console.log("Generated learning path:", pathData);

    // Create or get the skill
    let skillId: string;
    const { data: existingSkill } = await supabase
      .from("skills")
      .select("id")
      .eq("user_id", user_id)
      .eq("name", skill_name)
      .single();

    if (existingSkill) {
      skillId = existingSkill.id;
    } else {
      const { data: newSkill, error: skillError } = await supabase
        .from("skills")
        .insert({
          user_id,
          name: skill_name,
          description: skill_description || pathData.path_description,
        })
        .select("id")
        .single();

      if (skillError) throw new Error(`Failed to create skill: ${skillError.message}`);
      skillId = newSkill.id;
    }

    // Create the learning path
    const { data: learningPath, error: pathError } = await supabase
      .from("learning_paths")
      .insert({
        user_id,
        skill_id: skillId,
        title: pathData.path_title,
        description: pathData.path_description,
        total_items: pathData.steps.length,
        estimated_hours: pathData.estimated_hours,
      })
      .select()
      .single();

    if (pathError) throw new Error(`Failed to create learning path: ${pathError.message}`);

    // Create path items
    const pathItems = pathData.steps.map((step: any, index: number) => ({
      path_id: learningPath.id,
      title: step.title,
      description: step.description,
      item_type: step.item_type,
      order_index: index,
      status: index === 0 ? "active" : "locked",
      mastery_contribution: step.mastery_contribution,
      estimated_minutes: step.estimated_minutes,
      knowledge_item_id: step.knowledge_item_index !== undefined && step.knowledge_item_index !== null
        ? knowledge_items[step.knowledge_item_index]?.id
        : null,
    }));

    const { error: itemsError } = await supabase
      .from("learning_path_items")
      .insert(pathItems);

    if (itemsError) throw new Error(`Failed to create path items: ${itemsError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        skill_id: skillId,
        path: learningPath,
        items_created: pathItems.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-learning-path error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
