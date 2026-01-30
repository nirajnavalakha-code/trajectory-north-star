// Skill Learning Mode Types

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  mastery_level: number; // 0-100
  target_mastery: number; // Default 80
  total_learning_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  user_id: string;
  skill_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'paused';
  total_items: number;
  completed_items: number;
  estimated_hours: number | null;
  created_at: string;
  updated_at: string;
}

export type LearningPathItemType = 'learn' | 'practice' | 'apply' | 'review';
export type LearningPathItemStatus = 'locked' | 'active' | 'completed' | 'skipped';

export interface LearningPathItem {
  id: string;
  path_id: string;
  knowledge_item_id: string | null;
  title: string;
  description: string | null;
  item_type: LearningPathItemType;
  order_index: number;
  status: LearningPathItemStatus;
  mastery_contribution: number;
  estimated_minutes: number | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillApplication {
  id: string;
  user_id: string;
  skill_id: string;
  path_item_id: string | null;
  mission_id: string | null;
  description: string;
  outcome: string | null;
  mastery_gained: number;
  created_at: string;
}

// Item type labels and descriptions
export const itemTypeLabels: Record<LearningPathItemType, string> = {
  learn: 'Learn',
  practice: 'Practice',
  apply: 'Apply',
  review: 'Review',
};

export const itemTypeDescriptions: Record<LearningPathItemType, string> = {
  learn: 'Consume content to understand concepts',
  practice: 'Hands-on exercises to reinforce learning',
  apply: 'Real-world application in a project or mission',
  review: 'Revisit and solidify understanding',
};

// Status labels
export const pathStatusLabels: Record<LearningPath['status'], string> = {
  active: 'In Progress',
  completed: 'Completed',
  paused: 'Paused',
};

export const itemStatusLabels: Record<LearningPathItemStatus, string> = {
  locked: 'Locked',
  active: 'Active',
  completed: 'Completed',
  skipped: 'Skipped',
};

// Helper to calculate path progress
export function calculatePathProgress(path: LearningPath): number {
  if (path.total_items === 0) return 0;
  return Math.round((path.completed_items / path.total_items) * 100);
}

// Helper to get mastery level label
export function getMasteryLabel(level: number): string {
  if (level < 20) return 'Novice';
  if (level < 40) return 'Beginner';
  if (level < 60) return 'Intermediate';
  if (level < 80) return 'Advanced';
  return 'Expert';
}

// Helper to get mastery color class
export function getMasteryColorClass(level: number): string {
  if (level < 20) return 'text-muted-foreground';
  if (level < 40) return 'text-blue-500';
  if (level < 60) return 'text-yellow-500';
  if (level < 80) return 'text-orange-500';
  return 'text-trajectory-success';
}
