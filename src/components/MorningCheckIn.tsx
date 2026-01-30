import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sun, Clock, Target, ArrowRight, X } from "lucide-react";

interface DailyMission {
  id: string;
  title: string;
  duration: string;
  impact: "critical" | "high" | "medium";
  whyNow: string;
}

interface MorningCheckInProps {
  userName?: string;
  identity: string;
  missions: DailyMission[];
  totalEffort: string;
  trajectoryLink: string; // One clear sentence linking today → future outcome
  onStart: () => void;
  onDismiss: () => void;
  className?: string;
}

export const MorningCheckIn = ({
  userName = "there",
  identity,
  missions,
  totalEffort,
  trajectoryLink,
  onStart,
  onDismiss,
  className,
}: MorningCheckInProps) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const impactColors = {
    critical: "bg-trajectory-behind/10 text-trajectory-behind border-trajectory-behind/20",
    high: "bg-accent/10 text-accent border-accent/20",
    medium: "bg-secondary text-muted-foreground border-border",
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
              <Sun className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Daily Briefing</p>
              <h1 className="font-display text-2xl font-bold">
                {getGreeting()}, {userName}
              </h1>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDismiss}
            className="text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Trajectory Link - The one clear sentence */}
        <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 mb-6">
          <p className="text-foreground leading-relaxed">
            {trajectoryLink}
          </p>
        </div>

        {/* Today's Missions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-muted-foreground">Today's Focus</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{totalEffort} total</span>
            </div>
          </div>

          <div className="space-y-3">
            {missions.map((mission, index) => (
              <div
                key={mission.id}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-sm font-medium text-muted-foreground shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{mission.title}</h3>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full border shrink-0",
                        impactColors[mission.impact]
                      )}>
                        {mission.impact}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {mission.whyNow}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{mission.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment */}
        <div className="space-y-4">
          {!acknowledged ? (
            <Button
              onClick={() => setAcknowledged(true)}
              className="w-full"
              variant="trajectory"
              size="lg"
            >
              I understand my focus today
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-trajectory-success/10 border border-trajectory-success/20">
                <p className="text-center text-sm text-trajectory-success">
                  Missions locked. Distractions are now the enemy.
                </p>
              </div>
              <Button
                onClick={onStart}
                className="w-full gap-2"
                variant="trajectory"
                size="lg"
              >
                Begin execution
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Focus compounds. Every day you execute brings you closer to becoming a {identity}.
        </p>
      </div>
    </div>
  );
};
