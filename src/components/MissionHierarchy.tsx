import { useState } from "react";
import { cn } from "@/lib/utils";
import { Mission, MissionTimeframe, getTimeframeLabel } from "@/types/missions";
import { MissionHierarchyCard } from "./MissionHierarchyCard";
import { ChevronRight, Target, Calendar, TrendingUp, Zap, Sun } from "lucide-react";

interface MissionHierarchyProps {
  missions: {
    yearly: Mission[];
    quarterly: Mission[];
    monthly: Mission[];
    weekly: Mission[];
    daily: Mission[];
  };
  onMissionComplete?: (missionId: string) => void;
  className?: string;
}

const timeframeIcons: Record<MissionTimeframe, React.ReactNode> = {
  yearly: <Target className="w-4 h-4" />,
  quarterly: <TrendingUp className="w-4 h-4" />,
  monthly: <Calendar className="w-4 h-4" />,
  weekly: <Zap className="w-4 h-4" />,
  daily: <Sun className="w-4 h-4" />,
};

const timeframeDescriptions: Record<MissionTimeframe, string> = {
  yearly: "Your north star destination",
  quarterly: "Major milestones",
  monthly: "Key deliverables",
  weekly: "Focused sprints",
  daily: "Today's execution",
};

export const MissionHierarchy = ({
  missions,
  onMissionComplete,
  className,
}: MissionHierarchyProps) => {
  const [expandedTimeframe, setExpandedTimeframe] = useState<MissionTimeframe>("daily");

  const timeframes: MissionTimeframe[] = ["yearly", "quarterly", "monthly", "weekly", "daily"];

  const getMissionsForTimeframe = (timeframe: MissionTimeframe): Mission[] => {
    return missions[timeframe] || [];
  };

  const getActiveMissionsCount = (timeframe: MissionTimeframe): number => {
    return getMissionsForTimeframe(timeframe).filter(
      (m) => m.status === "active" || m.status === "completed"
    ).length;
  };

  const getCompletedCount = (timeframe: MissionTimeframe): number => {
    return getMissionsForTimeframe(timeframe).filter((m) => m.status === "completed").length;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {timeframes.map((timeframe) => {
        const isExpanded = expandedTimeframe === timeframe;
        const timeframeMissions = getMissionsForTimeframe(timeframe);
        const activeCount = getActiveMissionsCount(timeframe);
        const completedCount = getCompletedCount(timeframe);
        const totalCount = timeframeMissions.length;

        return (
          <div
            key={timeframe}
            className={cn(
              "rounded-xl border transition-all duration-300",
              isExpanded
                ? "border-accent/30 bg-card"
                : "border-border/50 bg-card/50 hover:border-border"
            )}
          >
            {/* Timeframe Header */}
            <button
              onClick={() => setExpandedTimeframe(timeframe)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isExpanded ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  )}
                >
                  {timeframeIcons[timeframe]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{getTimeframeLabel(timeframe)}</h3>
                    {activeCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {completedCount}/{totalCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {timeframeDescriptions[timeframe]}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-90"
                )}
              />
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {timeframeMissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No missions defined for this timeframe yet.
                  </p>
                ) : (
                  timeframeMissions.map((mission) => (
                    <MissionHierarchyCard
                      key={mission.id}
                      mission={mission}
                      onComplete={() => onMissionComplete?.(mission.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
