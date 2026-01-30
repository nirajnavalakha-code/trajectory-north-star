// Velocity & Reality Engine
// Calculates: Expected progress vs actual, speed (ahead/on-track/behind), delay cost
// Philosophy: Truth > comfort. Never shame. Always offer a path forward.

import { Mission, MissionHierarchy } from "@/types/missions";
import { differenceInDays, differenceInWeeks, differenceInMonths, parseISO, addDays } from "date-fns";

export type VelocityStatus = "ahead" | "on-track" | "behind";

export interface VelocityMetrics {
  status: VelocityStatus;
  daysOffset: number; // positive = ahead, negative = behind
  expectedProgress: number; // 0-100
  actualProgress: number; // 0-100
  projectedCompletionDate: Date;
  originalTargetDate: Date;
  delayCost: DelayCost | null;
  recoveryPlan: RecoveryPlan | null;
}

export interface DelayCost {
  days: number;
  weeks: number;
  months: number;
  message: string; // Human-readable impact statement
}

export interface RecoveryPlan {
  requiredDailyEffort: string; // e.g., "2.5 hours/day"
  additionalWeeklyMissions: number;
  focusAreas: string[];
  message: string; // Calm, actionable guidance
  achievable: boolean;
}

// Calculate days between now and target
export function getDaysRemaining(targetDate: string): number {
  const target = parseISO(targetDate);
  const now = new Date();
  return differenceInDays(target, now);
}

// Calculate expected progress based on elapsed time
export function calculateExpectedProgress(
  startDate: string,
  targetDate: string
): number {
  const start = parseISO(startDate);
  const target = parseISO(targetDate);
  const now = new Date();

  const totalDuration = differenceInDays(target, start);
  const elapsed = differenceInDays(now, start);

  if (totalDuration <= 0) return 100;
  if (elapsed <= 0) return 0;
  if (elapsed >= totalDuration) return 100;

  return Math.round((elapsed / totalDuration) * 100);
}

// Calculate actual progress from mission hierarchy
export function calculateActualProgress(hierarchy: MissionHierarchy): number {
  // Weight: Yearly missions are most important
  const weights = {
    yearly: 40,
    quarterly: 25,
    monthly: 20,
    weekly: 10,
    daily: 5,
  };

  let weightedProgress = 0;
  let totalWeight = 0;

  for (const [timeframe, missions] of Object.entries(hierarchy)) {
    const weight = weights[timeframe as keyof typeof weights];
    const activeMissions = missions.filter(m => m.status !== "locked");
    
    if (activeMissions.length > 0) {
      const avgProgress = activeMissions.reduce((sum, m) => sum + m.progressPercent, 0) / activeMissions.length;
      weightedProgress += avgProgress * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
}

// Calculate delay cost in human terms
export function calculateDelayCost(
  expectedProgress: number,
  actualProgress: number,
  targetDate: string
): DelayCost | null {
  const gap = expectedProgress - actualProgress;
  
  if (gap <= 5) return null; // Within acceptable range

  const daysRemaining = getDaysRemaining(targetDate);
  const delayDays = Math.round((gap / 100) * daysRemaining);
  
  if (delayDays < 1) return null;

  const weeks = Math.round(delayDays / 7 * 10) / 10;
  const months = Math.round(delayDays / 30 * 10) / 10;

  let message: string;
  if (delayDays <= 7) {
    message = `At current pace, you'll reach your goal ${delayDays} days later than planned.`;
  } else if (delayDays <= 30) {
    message = `Current trajectory adds ${weeks} weeks to your timeline. This is recoverable with focused effort.`;
  } else {
    message = `At this pace, expect a ${months}-month delay. Consider re-evaluating scope or increasing daily commitment.`;
  }

  return {
    days: delayDays,
    weeks: Math.round(weeks),
    months: Math.round(months * 10) / 10,
    message,
  };
}

// Generate a recovery plan (calm, actionable, no guilt)
export function generateRecoveryPlan(
  delayCost: DelayCost,
  currentDailyHours: number = 2,
  daysRemaining: number
): RecoveryPlan {
  const recoveryDays = Math.max(1, daysRemaining - delayCost.days);
  const additionalEffortRatio = daysRemaining / recoveryDays;
  const requiredHours = Math.round(currentDailyHours * additionalEffortRatio * 10) / 10;
  
  const achievable = requiredHours <= 6; // More than 6 hours/day is unsustainable

  let message: string;
  let focusAreas: string[];

  if (achievable) {
    if (delayCost.days <= 7) {
      message = "A small adjustment brings you back on track. Add one focused session this week.";
      focusAreas = ["Complete your current weekly mission first", "Eliminate one low-priority commitment"];
    } else if (delayCost.days <= 21) {
      message = "You've drifted slightly. Two weeks of focused work recovers your trajectory.";
      focusAreas = [
        "Prioritize high-impact missions over medium ones",
        "Block 2-hour deep work sessions daily",
        "Temporarily reduce optional activities",
      ];
    } else {
      message = "The gap is significant but recoverable. Consider this a recalibration, not a failure.";
      focusAreas = [
        "Review and simplify your quarterly goals",
        "Identify and remove blocking dependencies",
        "Increase daily commitment to " + requiredHours + " hours",
        "Consider which skills are essential vs nice-to-have",
      ];
    }
  } else {
    message = "The current gap requires more hours than is sustainable. Let's adjust expectations rather than burn out.";
    focusAreas = [
      "Extend your target date by " + Math.ceil(delayCost.days / 2) + " days",
      "Reduce scope to essential milestones only",
      "Focus on your top 2 skill areas, pause the rest",
    ];
  }

  return {
    requiredDailyEffort: `${requiredHours} hours/day`,
    additionalWeeklyMissions: Math.max(0, Math.ceil(delayCost.days / 7)),
    focusAreas,
    message,
    achievable,
  };
}

// Main velocity calculation
export function calculateVelocity(
  hierarchy: MissionHierarchy,
  startDate: string,
  targetDate: string
): VelocityMetrics {
  const expectedProgress = calculateExpectedProgress(startDate, targetDate);
  const actualProgress = calculateActualProgress(hierarchy);
  const daysRemaining = getDaysRemaining(targetDate);
  
  const progressDiff = actualProgress - expectedProgress;
  const daysOffset = Math.round((progressDiff / 100) * daysRemaining);

  let status: VelocityStatus;
  if (progressDiff >= 5) {
    status = "ahead";
  } else if (progressDiff <= -10) {
    status = "behind";
  } else {
    status = "on-track";
  }

  const delayCost = status === "behind" 
    ? calculateDelayCost(expectedProgress, actualProgress, targetDate)
    : null;

  const recoveryPlan = delayCost 
    ? generateRecoveryPlan(delayCost, 2, daysRemaining)
    : null;

  // Calculate projected completion date
  const projectionOffset = status === "ahead" ? -Math.abs(daysOffset) : Math.abs(daysOffset);
  const projectedCompletionDate = addDays(parseISO(targetDate), projectionOffset);

  return {
    status,
    daysOffset: Math.abs(daysOffset),
    expectedProgress,
    actualProgress,
    projectedCompletionDate,
    originalTargetDate: parseISO(targetDate),
    delayCost,
    recoveryPlan,
  };
}

// Get a calm, mentor-like summary
export function getVelocitySummary(metrics: VelocityMetrics): string {
  if (metrics.status === "ahead") {
    return `You're ${metrics.daysOffset} days ahead of schedule. Maintain this pace.`;
  } else if (metrics.status === "on-track") {
    return "You're tracking as expected. Consistent effort compounds.";
  } else {
    return metrics.delayCost?.message || "You've fallen behind. Let's course correct.";
  }
}
