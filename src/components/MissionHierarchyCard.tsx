import { cn } from "@/lib/utils";
import { Mission } from "@/types/missions";
import { Check, Clock, Lock, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface MissionHierarchyCardProps {
  mission: Mission;
  onComplete?: () => void;
  className?: string;
}

const impactColors = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  low: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const statusIcons = {
  locked: <Lock className="w-4 h-4" />,
  active: <TrendingUp className="w-4 h-4" />,
  completed: <Check className="w-4 h-4" />,
  missed: <AlertCircle className="w-4 h-4" />,
};

export const MissionHierarchyCard = ({
  mission,
  onComplete,
  className,
}: MissionHierarchyCardProps) => {
  const isLocked = mission.status === "locked";
  const isCompleted = mission.status === "completed";
  const isDaily = mission.timeframe === "daily";

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 transition-all",
        isLocked && "opacity-50 bg-muted/30 border-border/50",
        isCompleted && "bg-trajectory-success/5 border-trajectory-success/20",
        !isLocked && !isCompleted && "bg-card border-border hover:border-accent/30",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Status Indicator */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            isCompleted && "bg-trajectory-success/20 text-trajectory-success",
            isLocked && "bg-muted text-muted-foreground",
            !isCompleted && !isLocked && "bg-accent/10 text-accent"
          )}
        >
          {statusIcons[mission.status]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4
                className={cn(
                  "font-medium leading-tight",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {mission.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{mission.outcome}</p>
            </div>

            {/* Impact Badge */}
            <span
              className={cn(
                "flex-shrink-0 text-xs font-medium px-2 py-1 rounded border",
                impactColors[mission.impact]
              )}
            >
              {mission.impact}
            </span>
          </div>

          {/* Why Now - Only for active missions */}
          {mission.status === "active" && (
            <div className="text-sm text-accent/80 bg-accent/5 px-3 py-2 rounded-md border border-accent/10">
              <span className="font-medium">Why now:</span> {mission.whyNow}
            </div>
          )}

          {/* Meta Row */}
          <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{mission.timeEstimate}</span>
            </div>

            {/* Skill Impacts */}
            {mission.skillImpacts.slice(0, 2).map((skill) => (
              <div key={skill.skillName} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                <span>
                  {skill.skillName} +{skill.contribution}%
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar - Only for non-daily missions */}
          {!isDaily && !isLocked && mission.progressPercent > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{mission.progressPercent}%</span>
              </div>
              <Progress value={mission.progressPercent} className="h-1.5" />
            </div>
          )}

          {/* Complete Button - Only for daily active missions */}
          {isDaily && mission.status === "active" && onComplete && (
            <Button
              size="sm"
              variant="trajectory"
              onClick={onComplete}
              className="mt-2"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
