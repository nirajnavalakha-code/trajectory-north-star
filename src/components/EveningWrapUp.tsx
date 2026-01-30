import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { VelocityIndicator } from "./VelocityIndicator";
import { 
  Moon, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  X,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface CompletedMission {
  id: string;
  title: string;
  duration: string;
}

interface SlippedMission {
  id: string;
  title: string;
  reason?: string;
  rescheduledTo: "tomorrow" | "this_week" | "dropped";
}

interface TomorrowMission {
  id: string;
  title: string;
  duration: string;
  isCarryOver?: boolean;
}

interface EveningWrapUpProps {
  userName?: string;
  identity: string;
  completedMissions: CompletedMission[];
  slippedMissions: SlippedMission[];
  tomorrowMissions: TomorrowMission[];
  velocityStatus: "ahead" | "on-track" | "behind";
  velocityChange: number; // positive = improved, negative = declined
  daysOffset: number;
  onClose: () => void;
  className?: string;
}

export const EveningWrapUp = ({
  userName = "there",
  identity,
  completedMissions,
  slippedMissions,
  tomorrowMissions,
  velocityStatus,
  velocityChange,
  daysOffset,
  onClose,
  className,
}: EveningWrapUpProps) => {
  const [step, setStep] = useState<"review" | "tomorrow">("review");

  const totalCompleted = completedMissions.length;
  const totalSlipped = slippedMissions.length;
  const completionRate = totalCompleted / (totalCompleted + totalSlipped) * 100;

  const getVelocityMessage = () => {
    if (velocityStatus === "ahead") {
      return "You're building momentum. This buffer protects against future setbacks.";
    } else if (velocityStatus === "on-track") {
      return "Steady progress. Consistency beats intensity.";
    } else {
      return "You've slipped. Tomorrow is a chance to course correct.";
    }
  };

  const getVelocityChangeIcon = () => {
    if (velocityChange > 0) return <TrendingUp className="w-4 h-4 text-trajectory-success" />;
    if (velocityChange < 0) return <TrendingDown className="w-4 h-4 text-trajectory-behind" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm",
      className
    )}>
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10">
              <Moon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Evening Wrap-Up</p>
              <h1 className="font-display text-2xl font-bold">
                Day complete, {userName}
              </h1>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {step === "review" ? (
          <>
            {/* Velocity Status */}
            <div className="p-4 rounded-xl border border-border bg-card mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Trajectory Status</span>
                <VelocityIndicator status={velocityStatus} days={daysOffset} />
              </div>
              <p className="text-sm text-muted-foreground">
                {getVelocityMessage()}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                {getVelocityChangeIcon()}
                <span className="text-sm">
                  {velocityChange > 0 && `+${velocityChange}% from yesterday`}
                  {velocityChange < 0 && `${velocityChange}% from yesterday`}
                  {velocityChange === 0 && "No change from yesterday"}
                </span>
              </div>
            </div>

            {/* What Moved */}
            {completedMissions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-trajectory-success" />
                  <h2 className="font-medium">What moved the needle</h2>
                  <span className="text-sm text-muted-foreground">({completedMissions.length})</span>
                </div>
                <div className="space-y-2">
                  {completedMissions.map((mission) => (
                    <div
                      key={mission.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-trajectory-success/5 border border-trajectory-success/20"
                    >
                      <span className="text-sm">{mission.title}</span>
                      <span className="text-xs text-muted-foreground">{mission.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What Slipped */}
            {slippedMissions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-trajectory-behind" />
                  <h2 className="font-medium">What slipped</h2>
                  <span className="text-sm text-muted-foreground">({slippedMissions.length})</span>
                </div>
                <div className="space-y-2">
                  {slippedMissions.map((mission) => (
                    <div
                      key={mission.id}
                      className="p-3 rounded-lg bg-trajectory-behind/5 border border-trajectory-behind/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{mission.title}</span>
                        <span className="text-xs text-trajectory-behind capitalize">
                          → {mission.rescheduledTo.replace("_", " ")}
                        </span>
                      </div>
                      {mission.reason && (
                        <p className="text-xs text-muted-foreground">{mission.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  No judgment. Just reality. Tomorrow's plan has been adjusted.
                </p>
              </div>
            )}

            {/* Completion Rate */}
            <div className="p-4 rounded-xl bg-secondary/50 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Today's completion rate</span>
                <span className={cn(
                  "font-medium",
                  completionRate >= 80 && "text-trajectory-success",
                  completionRate >= 50 && completionRate < 80 && "text-accent",
                  completionRate < 50 && "text-trajectory-behind"
                )}>
                  {Math.round(completionRate)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    completionRate >= 80 && "bg-trajectory-success",
                    completionRate >= 50 && completionRate < 80 && "bg-accent",
                    completionRate < 50 && "bg-trajectory-behind"
                  )}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <Button
              onClick={() => setStep("tomorrow")}
              className="w-full gap-2"
              variant="trajectory"
              size="lg"
            >
              See tomorrow's plan
              <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            {/* Tomorrow's Adjusted Plan */}
            <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Auto-adjusted for tomorrow</p>
              <p className="text-foreground">
                {slippedMissions.filter(m => m.rescheduledTo === "tomorrow").length > 0
                  ? `${slippedMissions.filter(m => m.rescheduledTo === "tomorrow").length} carried over. Focus on high-impact items first.`
                  : "Clean slate. You're on track."}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="font-medium mb-3">Tomorrow's missions</h2>
              <div className="space-y-2">
                {tomorrowMissions.map((mission, index) => (
                  <div
                    key={mission.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      mission.isCarryOver 
                        ? "bg-trajectory-behind/5 border-trajectory-behind/20"
                        : "bg-card border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{index + 1}</span>
                      <span className="text-sm">{mission.title}</span>
                      {mission.isCarryOver && (
                        <span className="text-xs text-trajectory-behind">carried over</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{mission.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full"
              variant="trajectory"
              size="lg"
            >
              Rest well. Tomorrow awaits.
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Every day you execute brings you closer to becoming a {identity}.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
