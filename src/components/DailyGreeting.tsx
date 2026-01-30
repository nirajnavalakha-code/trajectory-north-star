import { cn } from "@/lib/utils";

interface DailyGreetingProps {
  userName?: string;
  className?: string;
}

export const DailyGreeting = ({ userName = "there", className }: DailyGreetingProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getContextMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Here's what moves the needle today.";
    if (hour < 17) return "Your trajectory continues. Stay focused.";
    return "Review your progress. Tomorrow awaits.";
  };

  return (
    <div className={cn("space-y-1", className)}>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
        {getGreeting()}, {userName}
      </h1>
      <p className="text-muted-foreground text-lg">{getContextMessage()}</p>
    </div>
  );
};
