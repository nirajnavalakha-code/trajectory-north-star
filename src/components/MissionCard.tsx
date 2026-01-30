import { cn } from "@/lib/utils";
import { Clock, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

interface MissionCardProps {
  title: string;
  description: string;
  duration: string;
  impact: "high" | "medium" | "low";
  isCompleted?: boolean;
  isPrimary?: boolean;
  onComplete?: () => void;
  className?: string;
}

export const MissionCard = ({
  title,
  description,
  duration,
  impact,
  isCompleted = false,
  isPrimary = false,
  onComplete,
  className,
}: MissionCardProps) => {
  const impactConfig = {
    high: { label: "High impact", color: "text-accent" },
    medium: { label: "Medium impact", color: "text-foreground" },
    low: { label: "Low impact", color: "text-muted-foreground" },
  };

  return (
    <div
      className={cn(
        "group relative p-5 rounded-xl border transition-all duration-300",
        isCompleted
          ? "bg-secondary/30 border-border opacity-60"
          : isPrimary
          ? "bg-card border-accent/30 card-hover"
          : "bg-card border-border card-hover",
        className
      )}
    >
      {isPrimary && !isCompleted && (
        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isPrimary && !isCompleted && (
              <span className="px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full">
                Primary
              </span>
            )}
            {isCompleted && (
              <CheckCircle2 className="w-4 h-4 text-trajectory-success" />
            )}
          </div>

          <h3
            className={cn(
              "font-display font-semibold text-lg mb-1",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {title}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {description}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className={cn("flex items-center gap-1.5", impactConfig[impact].color)}>
              <Zap className="w-4 h-4" />
              <span>{impactConfig[impact].label}</span>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <Button
            variant="trajectory-subtle"
            size="sm"
            onClick={onComplete}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );
};
