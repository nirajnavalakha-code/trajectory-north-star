import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skill, LearningPath, LearningPathItem } from "@/types/skills";
import { useToast } from "@/hooks/use-toast";

interface LearningPathWithItems extends LearningPath {
  items: LearningPathItem[];
}

interface SkillWithPaths extends Skill {
  learning_paths: LearningPath[];
}

export const useSkillLearning = () => {
  const [skills, setSkills] = useState<SkillWithPaths[]>([]);
  const [activePath, setActivePath] = useState<LearningPathWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const loadSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: skillsData, error: skillsError } = await supabase
        .from("skills")
        .select("*")
        .order("updated_at", { ascending: false });

      if (skillsError) throw skillsError;

      // Load learning paths for each skill
      const skillsWithPaths: SkillWithPaths[] = await Promise.all(
        (skillsData || []).map(async (skill) => {
          const { data: paths } = await supabase
            .from("learning_paths")
            .select("*")
            .eq("skill_id", skill.id)
            .order("created_at", { ascending: false });

          return {
            ...skill,
            learning_paths: (paths || []) as LearningPath[],
          } as SkillWithPaths;
        })
      );

      setSkills(skillsWithPaths);
    } catch (err) {
      console.error("Error loading skills:", err);
      toast({
        title: "Error loading skills",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadPathItems = useCallback(async (pathId: string) => {
    try {
      const { data: path, error: pathError } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("id", pathId)
        .single();

      if (pathError) throw pathError;

      const { data: items, error: itemsError } = await supabase
        .from("learning_path_items")
        .select("*")
        .eq("path_id", pathId)
        .order("order_index", { ascending: true });

      if (itemsError) throw itemsError;

      setActivePath({
        ...(path as LearningPath),
        items: (items || []) as LearningPathItem[],
      });
    } catch (err) {
      console.error("Error loading path items:", err);
      toast({
        title: "Error loading path",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [toast]);

  const generatePath = useCallback(async (
    skillName: string,
    skillDescription?: string,
    currentLevel: string = "beginner"
  ) => {
    setIsGenerating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("Please sign in to create learning paths");
      }

      // Get relevant knowledge items for context
      const { data: knowledgeItems } = await supabase
        .from("knowledge_items")
        .select("id, title, type, tagged_skills, difficulty, estimated_read_time")
        .eq("is_processed", true)
        .eq("is_consumed", false)
        .limit(20);

      // Filter to items that might be relevant to the skill
      const relevantItems = (knowledgeItems || []).filter(item => {
        const skills = item.tagged_skills || [];
        return skills.some((s: string) => 
          s.toLowerCase().includes(skillName.toLowerCase()) ||
          skillName.toLowerCase().includes(s.toLowerCase())
        );
      });

      const { data, error } = await supabase.functions.invoke("generate-learning-path", {
        body: {
          skill_name: skillName,
          skill_description: skillDescription,
          user_id: session.session.user.id,
          knowledge_items: relevantItems,
          current_level: currentLevel,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Learning path created",
        description: `${data.items_created} steps designed for "${skillName}"`,
      });

      // Reload skills to show the new path
      await loadSkills();

      // Load the new path
      if (data.path?.id) {
        await loadPathItems(data.path.id);
      }

      return data;
    } catch (err) {
      console.error("Error generating path:", err);
      toast({
        title: "Failed to generate path",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [loadSkills, loadPathItems, toast]);

  const completePathItem = useCallback(async (itemId: string, notes?: string) => {
    try {
      // Get the item to find its path and contribution
      const { data: item, error: itemError } = await supabase
        .from("learning_path_items")
        .select("*, learning_paths!inner(skill_id, user_id)")
        .eq("id", itemId)
        .single();

      if (itemError) throw itemError;

      // Update the item to completed
      const { error: updateError } = await supabase
        .from("learning_path_items")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq("id", itemId);

      if (updateError) throw updateError;

      // Unlock the next item
      const { data: nextItem } = await supabase
        .from("learning_path_items")
        .select("id")
        .eq("path_id", item.path_id)
        .eq("status", "locked")
        .order("order_index", { ascending: true })
        .limit(1)
        .single();

      if (nextItem) {
        await supabase
          .from("learning_path_items")
          .update({ status: "active" })
          .eq("id", nextItem.id);
      }

      // Update path completed count
      await supabase
        .from("learning_paths")
        .update({
          completed_items: (activePath?.completed_items || 0) + 1,
        })
        .eq("id", item.path_id);

      // Update skill mastery
      const pathData = item.learning_paths as { skill_id: string; user_id: string };
      const { data: skill } = await supabase
        .from("skills")
        .select("mastery_level")
        .eq("id", pathData.skill_id)
        .single();

      if (skill) {
        const newMastery = Math.min(100, skill.mastery_level + item.mastery_contribution);
        await supabase
          .from("skills")
          .update({ mastery_level: newMastery })
          .eq("id", pathData.skill_id);
      }

      // Reload the active path
      if (activePath) {
        await loadPathItems(activePath.id);
      }
      await loadSkills();

      toast({
        title: "Step completed",
        description: `+${item.mastery_contribution}% mastery gained`,
      });
    } catch (err) {
      console.error("Error completing item:", err);
      toast({
        title: "Error completing step",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [activePath, loadPathItems, loadSkills, toast]);

  const skipPathItem = useCallback(async (itemId: string) => {
    try {
      await supabase
        .from("learning_path_items")
        .update({ status: "skipped" })
        .eq("id", itemId);

      // Unlock the next item
      const { data: item } = await supabase
        .from("learning_path_items")
        .select("path_id, order_index")
        .eq("id", itemId)
        .single();

      if (item) {
        const { data: nextItem } = await supabase
          .from("learning_path_items")
          .select("id")
          .eq("path_id", item.path_id)
          .eq("status", "locked")
          .order("order_index", { ascending: true })
          .limit(1)
          .single();

        if (nextItem) {
          await supabase
            .from("learning_path_items")
            .update({ status: "active" })
            .eq("id", nextItem.id);
        }
      }

      if (activePath) {
        await loadPathItems(activePath.id);
      }

      toast({ title: "Step skipped" });
    } catch (err) {
      console.error("Error skipping item:", err);
    }
  }, [activePath, loadPathItems, toast]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  return {
    skills,
    activePath,
    isLoading,
    isGenerating,
    loadSkills,
    loadPathItems,
    generatePath,
    completePathItem,
    skipPathItem,
    setActivePath,
  };
};
