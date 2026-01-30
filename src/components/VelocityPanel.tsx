import { useState } from "react";
import { cn } from "@/lib/utils";
import { VelocityMetrics } from "@/lib/velocityEngine";
import { VelocityIndicator } from "./VelocityIndicator";
import { Button } from "./ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Target,
  Zap
} from "lucide-react";
import { format } from "date-fns";

interface VelocityPanelProps {
  metrics: VelocityMetrics;
  className?: string;
}

export const VelocityPanel = ({ metrics, className }: VelocityPanelProps) => {
  const [showRecoveryPlan, setShowRecoveryPlan] = useState(false);

  const progressBarWidth = Math.min(100, Math.max(0, metrics.actualProgress));
  const expectedMarkerPosition = Math.min(100, Math.max(0, metrics.expectedProgress));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Velocity Card */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold text-lg mb-1">Velocity Engine</h3>
            <p className="text-sm text-muted-foreground">
              Expected vs actual progress toward your goal
            </p>
          </div>
          <VelocityIndicator 
            status={metrics.status} 
            days={metrics.daysOffset}
          />
        </div>

        {/* Progress Visualization */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {metrics.actualProgress}% actual / {metrics.expectedProgress}% expected
            </span>
          </div>
          
          <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
            {/* Actual progress bar */}
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                metrics.status === "ahead" && "bg-trajectory-success",
                metrics.status === "on-track" && "bg-accent",
                metrics.status === "behind" && "bg-trajectory-behind"
              )}
              style={{ width: `${progressBarWidth}%` }}
            />
            
            {/* Expected progress marker */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-foreground/50 rounded-full"
              style={{ left: `${expectedMarkerPosition}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-foreground/50 rounded-full" />
              Expected position
            </span>
            <span>Goal</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Target Date</span>
            </div>
            <p className="font-medium">
              {format(metrics.originalTargetDate, "MMM d, yyyy")}
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Projected Completion</span>
            </div>
            <p className={cn(
              "font-medium",
              metrics.status === "ahead" && "text-trajectory-success",
              metrics.status === "behind" && "text-trajectory-behind"
            )}>
              {format(metrics.projectedCompletionDate, "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Delay Cost Card - Only shown when behind */}
      {metrics.delayCost && (
        <div className="p-6 rounded-2xl border border-trajectory-behind/30 bg-trajectory-behind/5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-trajectory-behind/10">
              <AlertTriangle className="w-5 h-5 text-trajectory-behind" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Reality Check</h4>
              <p className="text-sm text-muted-foreground">
                {metrics.delayCost.message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-trajectory-behind">
                {metrics.delayCost.days}
              </p>
              <p className="text-xs text-muted-foreground">days behind</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-trajectory-behind">
                {metrics.delayCost.weeks}
              </p>
              <p className="text-xs text-muted-foreground">weeks delay</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-trajectory-behind">
                {metrics.delayCost.months}
              </p>
              <p className="text-xs text-muted-foreground">month impact</p>
            </div>
          </div>

          {/* Recovery Plan Toggle */}
          {metrics.recoveryPlan && (
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setShowRecoveryPlan(!showRecoveryPlan)}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                View Recovery Plan
              </span>
              {showRecoveryPlan ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      )}

      {/* Recovery Plan Expanded */}
      {metrics.recoveryPlan && showRecoveryPlan && (
        <div className="p-6 rounded-2xl border border-accent/30 bg-accent/5 animate-fade-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Recovery Plan</h4>
              <p className="text-sm text-muted-foreground">
                {metrics.recoveryPlan.message}
              </p>
            </div>
          </div>

          {!metrics.recoveryPlan.achievable && (
            <div className="mb-4 p-3 rounded-lg bg-trajectory-behind/10 border border-trajectory-behind/20">
              <p className="text-sm text-trajectory-behind">
                ⚠️ Required effort exceeds sustainable limits. Consider adjusting your timeline or scope.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span className="text-sm text-muted-foreground">Required daily effort</span>
              <span className="font-medium">{metrics.recoveryPlan.requiredDailyEffort}</span>
            </div>
            
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-sm text-muted-foreground mb-2">Focus areas:</p>
              <ul className="space-y-2">
                {metrics.recoveryPlan.focusAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-0.5">→</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Ahead Celebration - Only shown when ahead */}
      {metrics.status === "ahead" && (
        <div className="p-6 rounded-2xl border border-trajectory-success/30 bg-trajectory-success/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-trajectory-success/10">
              <TrendingUp className="w-5 h-5 text-trajectory-success" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Ahead of Schedule</h4>
              <p className="text-sm text-muted-foreground">
                You're {metrics.daysOffset} days ahead. This buffer protects against unexpected obstacles. 
                Maintain your current pace—consistency beats intensity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
