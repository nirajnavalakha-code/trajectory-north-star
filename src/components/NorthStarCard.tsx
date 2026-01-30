import { cn } from "@/lib/utils";
import { Star, Calendar, Target } from "lucide-react";
import { VelocityIndicator } from "./VelocityIndicator";

interface NorthStarCardProps {
  identity: string;
  targetDate: string;
  context: string;
  daysRemaining: number;
  velocity: "ahead" | "on-track" | "behind";
  velocityDays?: number;
  className?: string;
}

export const NorthStarCard = ({
  identity,
  targetDate,
  context,
  daysRemaining,
  velocity,
  velocityDays = 0,
  className,
}: NorthStarCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-card via-card to-accent/5 p-6",
        className
      )}
    >
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-accent">
            <Star className="w-5 h-5 fill-accent" />
            <span className="text-sm font-medium uppercase tracking-wider">
              North Star
            </span>
          </div>
          <VelocityIndicator status={velocity} days={velocityDays} />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {identity}
          </h2>
          <p className="text-muted-foreground">{context}</p>
        </div>

        <div className="flex items-center gap-6 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium">{targetDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{daysRemaining} days remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
};
