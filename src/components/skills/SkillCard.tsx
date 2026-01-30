import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skill, LearningPath, getMasteryLabel, getMasteryColorClass, calculatePathProgress } from "@/types/skills";
import { Target, ChevronRight, BookOpen } from "lucide-react";

interface SkillCardProps {
  skill: Skill & { learning_paths: LearningPath[] };
  onSelectPath: (pathId: string) => void;
  className?: string;
}

export const SkillCard = ({ skill, onSelectPath, className }: SkillCardProps) => {
  const activePath = skill.learning_paths.find(p => p.status === "active");
  const masteryLabel = getMasteryLabel(skill.mastery_level);
  const masteryColor = getMasteryColorClass(skill.mastery_level);

  return (
    <div
      className={cn(
        "p-5 rounded-xl border border-border bg-card transition-all hover:border-accent/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">{skill.name}</h3>
            {skill.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {skill.description}
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline" className={cn("border", masteryColor)}>
          {masteryLabel}
        </Badge>
      </div>

      {/* Mastery Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Mastery</span>
          <span className={masteryColor}>{skill.mastery_level}%</span>
        </div>
        <Progress value={skill.mastery_level} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0%</span>
          <span>Target: {skill.target_mastery}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Active Path */}
      {activePath ? (
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{activePath.title}</span>
            <span className="text-xs text-muted-foreground">
              {activePath.completed_items}/{activePath.total_items} steps
            </span>
          </div>
          <Progress value={calculatePathProgress(activePath)} className="h-1.5 mb-3" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2"
            onClick={() => onSelectPath(activePath.id)}
          >
            <BookOpen className="w-4 h-4" />
            Continue Learning
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-secondary/50 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            No active learning path
          </p>
          <Button variant="outline" size="sm" disabled>
            Create Path
          </Button>
        </div>
      )}

      {/* Stats */}
      {skill.total_learning_time_minutes > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {Math.round(skill.total_learning_time_minutes / 60)} hours invested
          </p>
        </div>
      )}
    </div>
  );
};
