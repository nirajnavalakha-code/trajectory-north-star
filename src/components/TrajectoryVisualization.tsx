import { cn } from "@/lib/utils";

interface TrajectoryVisualizationProps {
  progress: number; // 0-100
  className?: string;
}

export const TrajectoryVisualization = ({
  progress,
  className,
}: TrajectoryVisualizationProps) => {
  return (
    <div className={cn("relative w-full h-32", className)}>
      <svg
        viewBox="0 0 400 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Background path */}
        <path
          d="M20 80 Q 100 80 150 50 T 280 20 T 380 10"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
        />

        {/* Progress path */}
        <path
          d="M20 80 Q 100 80 150 50 T 280 20 T 380 10"
          stroke="url(#progress-gradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: 400,
            strokeDashoffset: 400 - (400 * progress) / 100,
          }}
          className="transition-all duration-1000 ease-out"
        />

        {/* Start point */}
        <circle cx="20" cy="80" r="6" fill="hsl(var(--muted-foreground))" opacity="0.5" />

        {/* Current position */}
        <circle
          cx={20 + (360 * progress) / 100}
          cy={80 - (70 * progress) / 100}
          r="8"
          fill="hsl(var(--accent))"
          className="animate-glow-pulse"
        />
        <circle
          cx={20 + (360 * progress) / 100}
          cy={80 - (70 * progress) / 100}
          r="4"
          fill="hsl(var(--background))"
        />

        {/* End point / North Star */}
        <circle cx="380" cy="10" r="10" fill="hsl(var(--accent))" opacity="0.2" />
        <circle cx="380" cy="10" r="6" fill="hsl(var(--accent))" />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">
        Today
      </div>
      <div className="absolute top-0 right-0 flex items-center gap-1.5 text-xs">
        <span className="text-accent font-medium">North Star</span>
        <span className="text-muted-foreground">• {Math.round(progress)}% complete</span>
      </div>
    </div>
  );
};
