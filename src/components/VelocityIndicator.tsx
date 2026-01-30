import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type VelocityStatus = "ahead" | "on-track" | "behind";

interface VelocityIndicatorProps {
  status: VelocityStatus;
  days?: number;
  className?: string;
  showLabel?: boolean;
}

export const VelocityIndicator = ({
  status,
  days = 0,
  className,
  showLabel = true,
}: VelocityIndicatorProps) => {
  const config = {
    ahead: {
      icon: TrendingUp,
      label: `${days}d ahead`,
      color: "text-trajectory-success",
      bg: "bg-trajectory-success/10",
      border: "border-trajectory-success/20",
    },
    "on-track": {
      icon: Minus,
      label: "On track",
      color: "text-foreground",
      bg: "bg-secondary",
      border: "border-border",
    },
    behind: {
      icon: TrendingDown,
      label: `${days}d behind`,
      color: "text-trajectory-behind",
      bg: "bg-trajectory-behind/10",
      border: "border-trajectory-behind/20",
    },
  };

  const { icon: Icon, label, color, bg, border } = config[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-medium",
        bg,
        border,
        color,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span>{label}</span>}
    </div>
  );
};
