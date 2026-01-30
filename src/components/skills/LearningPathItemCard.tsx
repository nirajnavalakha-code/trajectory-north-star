import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LearningPathItem, 
  LearningPathItemType,
  itemTypeLabels 
} from "@/types/skills";
import { 
  BookOpen, 
  Dumbbell, 
  Rocket, 
  RotateCcw,
  CheckCircle2,
  Lock,
  SkipForward,
  ExternalLink
} from "lucide-react";

interface LearningPathItemCardProps {
  item: LearningPathItem;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  className?: string;
}

const typeIcons: Record<LearningPathItemType, React.ReactNode> = {
  learn: <BookOpen className="w-4 h-4" />,
  practice: <Dumbbell className="w-4 h-4" />,
  apply: <Rocket className="w-4 h-4" />,
  review: <RotateCcw className="w-4 h-4" />,
};

const typeColors: Record<LearningPathItemType, string> = {
  learn: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  practice: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  apply: "bg-trajectory-success/10 text-trajectory-success border-trajectory-success/20",
  review: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export const LearningPathItemCard = ({
  item,
  onComplete,
  onSkip,
  className,
}: LearningPathItemCardProps) => {
  const isActive = item.status === "active";
  const isCompleted = item.status === "completed";
  const isLocked = item.status === "locked";
  const isSkipped = item.status === "skipped";

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border transition-all",
        isActive && "border-accent bg-card shadow-sm",
        isCompleted && "border-trajectory-success/30 bg-trajectory-success/5",
        isLocked && "border-border bg-muted/30 opacity-60",
        isSkipped && "border-muted bg-muted/20 opacity-50",
        className
      )}
    >
      {/* Status indicator line */}
      <div
        className={cn(
          "absolute left-0 top-4 bottom-4 w-1 rounded-r-full",
          isActive && "bg-accent",
          isCompleted && "bg-trajectory-success",
          isLocked && "bg-muted-foreground/30",
          isSkipped && "bg-muted-foreground/20"
        )}
      />

      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg border", typeColors[item.item_type])}>
              {typeIcons[item.item_type]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  "font-medium",
                  (isLocked || isSkipped) && "text-muted-foreground"
                )}>
                  {item.title}
                </h4>
                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-trajectory-success" />
                )}
                {isLocked && (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {itemTypeLabels[item.item_type]}
                </Badge>
                {item.estimated_minutes && (
                  <span>~{item.estimated_minutes} min</span>
                )}
                <span>+{item.mastery_contribution}% mastery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className={cn(
            "text-sm mb-3",
            isActive ? "text-muted-foreground" : "text-muted-foreground/70"
          )}>
            {item.description}
          </p>
        )}

        {/* Completed notes */}
        {isCompleted && item.notes && (
          <div className="p-2 rounded-lg bg-trajectory-success/10 text-sm mb-3">
            <span className="text-trajectory-success font-medium">Notes: </span>
            {item.notes}
          </div>
        )}

        {/* Actions */}
        {isActive && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex gap-2">
              {item.knowledge_item_id && (
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  <ExternalLink className="w-3 h-3" />
                  Open Resource
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-muted-foreground"
                onClick={() => onSkip(item.id)}
              >
                <SkipForward className="w-3 h-3" />
                Skip
              </Button>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => onComplete(item.id)}
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
