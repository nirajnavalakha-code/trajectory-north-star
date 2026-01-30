import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link,
  FileText,
  Video,
  Image as ImageIcon,
  Film,
  File,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  KnowledgeItem,
  KnowledgeItemType,
  KnowledgePriority,
  priorityLabels,
  difficultyLabels,
} from "@/types/knowledge";

interface KnowledgeItemCardProps {
  item: KnowledgeItem;
  onMarkConsumed?: (id: string) => void;
  onChangePriority?: (id: string, priority: KnowledgePriority) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const typeIcons: Record<KnowledgeItemType, React.ReactNode> = {
  link: <Link className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  pdf: <File className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  reel: <Film className="w-4 h-4" />,
};

const priorityColors: Record<KnowledgePriority, string> = {
  now: "bg-trajectory-success/10 text-trajectory-success border-trajectory-success/20",
  later: "bg-accent/10 text-accent border-accent/20",
  ignore: "bg-muted text-muted-foreground border-border",
};

export const KnowledgeItemCard = ({
  item,
  onMarkConsumed,
  onChangePriority,
  onDelete,
  className,
}: KnowledgeItemCardProps) => {
  const displayTitle = item.title || item.url || "Untitled";
  const isProcessing = !item.is_processed;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border bg-card transition-all hover:border-accent/30",
        item.is_consumed && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-secondary shrink-0">
            {typeIcons[item.type]}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium truncate">{displayTitle}</h4>
            {item.source_domain && (
              <p className="text-sm text-muted-foreground">{item.source_domain}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isProcessing ? (
            <Badge variant="outline" className="gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing
            </Badge>
          ) : (
            <Badge className={cn("border", priorityColors[item.priority])}>
              {priorityLabels[item.priority]}
            </Badge>
          )}
        </div>
      </div>

      {/* Content preview */}
      {item.content && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.content}
        </p>
      )}

      {/* AI Insights */}
      {item.extracted_insights && item.extracted_insights.length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-1.5 text-xs text-accent mb-2">
            <Sparkles className="w-3 h-3" />
            Key Insights
          </div>
          <ul className="space-y-1">
            {item.extracted_insights.slice(0, 3).map((insight, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent mt-1">→</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {item.tagged_skills && item.tagged_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tagged_skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        {item.difficulty && (
          <span className="capitalize">{difficultyLabels[item.difficulty]}</span>
        )}
        {item.estimated_read_time && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.estimated_read_time}
          </span>
        )}
        {item.relevance_score !== null && (
          <span>{item.relevance_score}% relevant</span>
        )}
      </div>

      {/* Priority reason */}
      {item.priority_reason && (
        <p className="text-xs text-muted-foreground italic mb-3">
          "{item.priority_reason}"
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex gap-1">
          {item.url && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              asChild
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
                Open
              </a>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="flex gap-1">
          {!item.is_consumed && onMarkConsumed && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => onMarkConsumed(item.id)}
            >
              <CheckCircle2 className="w-3 h-3" />
              Mark Consumed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
