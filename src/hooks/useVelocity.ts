import { useMemo } from "react";
import { MissionHierarchy } from "@/types/missions";
import { 
  calculateVelocity, 
  VelocityMetrics,
  getVelocitySummary 
} from "@/lib/velocityEngine";
import { subMonths, format } from "date-fns";

interface UseVelocityOptions {
  hierarchy: MissionHierarchy;
  targetDate: string;
  startDate?: string;
}

interface UseVelocityResult {
  metrics: VelocityMetrics;
  summary: string;
  isLoading: boolean;
}

export function useVelocity({ 
  hierarchy, 
  targetDate,
  startDate 
}: UseVelocityOptions): UseVelocityResult {
  const calculatedStartDate = useMemo(() => {
    if (startDate) return startDate;
    // Default to 3 months ago if not provided
    return format(subMonths(new Date(), 3), "yyyy-MM-dd");
  }, [startDate]);

  const metrics = useMemo(() => {
    return calculateVelocity(hierarchy, calculatedStartDate, targetDate);
  }, [hierarchy, calculatedStartDate, targetDate]);

  const summary = useMemo(() => {
    return getVelocitySummary(metrics);
  }, [metrics]);

  return {
    metrics,
    summary,
    isLoading: false,
  };
}
