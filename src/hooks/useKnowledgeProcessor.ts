import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeItem } from "@/types/knowledge";
import { useToast } from "@/hooks/use-toast";

interface ProcessResult {
  success: boolean;
  analysis?: {
    extracted_insights: string[];
    tagged_skills: string[];
    difficulty: string;
    estimated_read_time: string;
    priority: string;
    priority_reason: string;
    relevance_score: number;
    generated_title?: string;
  };
  error?: string;
}

export const useKnowledgeProcessor = () => {
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const processItem = useCallback(async (
    item: Pick<KnowledgeItem, "id" | "type" | "title" | "content" | "url">
  ): Promise<ProcessResult> => {
    setProcessingItems((prev) => new Set(prev).add(item.id));

    try {
      const { data, error } = await supabase.functions.invoke("process-knowledge", {
        body: {
          item_id: item.id,
          type: item.type,
          title: item.title,
          content: item.content,
          url: item.url,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true, analysis: data.analysis };
    } catch (err) {
      console.error("Process item error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: message };
    } finally {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }, []);

  const processAndNotify = useCallback(async (
    item: Pick<KnowledgeItem, "id" | "type" | "title" | "content" | "url">,
    onSuccess?: (analysis: ProcessResult["analysis"]) => void
  ) => {
    const result = await processItem(item);

    if (result.success && result.analysis) {
      toast({
        title: "AI processed your item",
        description: `Priority: ${result.analysis.priority === "now" ? "Learn Now" : result.analysis.priority === "later" ? "Learn Later" : "Ignore"} — ${result.analysis.priority_reason}`,
      });
      onSuccess?.(result.analysis);
    } else if (result.error) {
      // Don't show error toast for rate limits - they're expected
      if (!result.error.includes("Rate limit")) {
        toast({
          title: "Processing failed",
          description: result.error,
          variant: "destructive",
        });
      }
    }

    return result;
  }, [processItem, toast]);

  const isProcessing = useCallback(
    (itemId: string) => processingItems.has(itemId),
    [processingItems]
  );

  return {
    processItem,
    processAndNotify,
    isProcessing,
    processingCount: processingItems.size,
  };
};
