import { cn } from "@/lib/utils";

interface TrajectoryLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const TrajectoryLogo = ({ 
  className, 
  size = "md",
  showText = true 
}: TrajectoryLogoProps) => {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 40, text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Trajectory path arc */}
        <path
          d="M8 32C8 32 12 8 32 8"
          stroke="url(#trajectory-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="animate-trajectory-draw"
          style={{ strokeDasharray: 1000 }}
        />
        {/* Destination point */}
        <circle
          cx="32"
          cy="8"
          r="4"
          fill="hsl(var(--accent))"
          className="animate-glow-pulse"
        />
        {/* Current position */}
        <circle
          cx="8"
          cy="32"
          r="3"
          fill="hsl(var(--foreground))"
          opacity="0.6"
        />
        <defs>
          <linearGradient
            id="trajectory-gradient"
            x1="8"
            y1="32"
            x2="32"
            y2="8"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--muted-foreground))" stopOpacity="0.3" />
            <stop offset="1" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={cn("font-display font-semibold tracking-tight", text)}>
          Trajectory
        </span>
      )}
    </div>
  );
};
