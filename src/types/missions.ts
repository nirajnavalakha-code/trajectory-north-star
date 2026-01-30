// Mission Hierarchy Types for Trajectory
// Every mission must have: clear outcome, time estimate, skill impact, reason why it matters now

export type MissionTimeframe = "yearly" | "quarterly" | "monthly" | "weekly" | "daily";
export type MissionStatus = "locked" | "active" | "completed" | "missed";
export type ImpactLevel = "critical" | "high" | "medium" | "low";

export interface SkillImpact {
  skillName: string;
  contribution: number; // 0-100 percentage contribution to mastery
}

export interface Mission {
  id: string;
  title: string;
  outcome: string; // Clear, measurable outcome
  timeEstimate: string; // e.g., "2 hours", "3 days", "2 weeks"
  timeframe: MissionTimeframe;
  status: MissionStatus;
  impact: ImpactLevel;
  skillImpacts: SkillImpact[];
  whyNow: string; // Reason why this matters at this moment
  parentId?: string; // Links to parent mission (daily → weekly → monthly, etc.)
  childIds: string[];
  dueDate?: string;
  completedAt?: string;
  progressPercent: number; // 0-100
}

export interface MissionHierarchy {
  yearly: Mission[];
  quarterly: Mission[];
  monthly: Mission[];
  weekly: Mission[];
  daily: Mission[];
}

// Helper to get timeframe label
export const getTimeframeLabel = (timeframe: MissionTimeframe): string => {
  const labels: Record<MissionTimeframe, string> = {
    yearly: "Year",
    quarterly: "Quarter",
    monthly: "Month",
    weekly: "Week",
    daily: "Today",
  };
  return labels[timeframe];
};

// Helper to get timeframe order (for sorting)
export const getTimeframeOrder = (timeframe: MissionTimeframe): number => {
  const order: Record<MissionTimeframe, number> = {
    yearly: 0,
    quarterly: 1,
    monthly: 2,
    weekly: 3,
    daily: 4,
  };
  return order[timeframe];
};
