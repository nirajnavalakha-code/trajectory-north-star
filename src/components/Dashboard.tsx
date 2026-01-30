import { useState } from "react";
import { TrajectoryLogo } from "./TrajectoryLogo";
import { DailyGreeting } from "./DailyGreeting";
import { NorthStarCard } from "./NorthStarCard";
import { TrajectoryVisualization } from "./TrajectoryVisualization";
import { MissionCard } from "./MissionCard";
import { VelocityIndicator } from "./VelocityIndicator";
import { Button } from "./ui/button";
import { Settings, Bell, LogOut } from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
  userData: {
    identity: string;
    targetDate: string;
    context: string;
    outcome: string;
  };
}

export const Dashboard = ({ onLogout, userData }: DashboardProps) => {
  const [missions, setMissions] = useState([
    {
      id: "1",
      title: "Complete product strategy document",
      description:
        "Draft the Q1 product roadmap with clear milestones and success metrics. This directly builds your strategic thinking skills.",
      duration: "2 hours",
      impact: "high" as const,
      isPrimary: true,
      isCompleted: false,
    },
    {
      id: "2",
      title: "Review competitor analysis",
      description:
        "Analyze top 3 competitors' recent product launches. Document key insights for your portfolio.",
      duration: "45 min",
      impact: "medium" as const,
      isPrimary: false,
      isCompleted: false,
    },
    {
      id: "3",
      title: "Network outreach",
      description:
        "Send 3 personalized LinkedIn messages to PMs at target companies. Building your network is essential.",
      duration: "20 min",
      impact: "medium" as const,
      isPrimary: false,
      isCompleted: false,
    },
  ]);

  const handleComplete = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isCompleted: true } : m))
    );
  };

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const progress = 34; // Example progress

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-trajectory-radial pointer-events-none opacity-30" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <TrajectoryLogo size="sm" />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-muted-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting */}
        <DailyGreeting />

        {/* North Star & Trajectory */}
        <div className="grid lg:grid-cols-2 gap-6">
          <NorthStarCard
            identity={userData.identity}
            targetDate={userData.targetDate}
            context={userData.context}
            daysRemaining={287}
            velocity="on-track"
          />

          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Your Trajectory</h3>
              <VelocityIndicator status="on-track" showLabel={false} />
            </div>
            <TrajectoryVisualization progress={progress} />
          </div>
        </div>

        {/* Today's Missions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold">Today's Missions</h2>
              <p className="text-muted-foreground">
                {completedCount} of {missions.length} completed
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-1">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className={`w-3 h-3 rounded-full border-2 border-background ${
                      m.isCompleted ? "bg-trajectory-success" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                title={mission.title}
                description={mission.description}
                duration={mission.duration}
                impact={mission.impact}
                isPrimary={mission.isPrimary}
                isCompleted={mission.isCompleted}
                onComplete={() => handleComplete(mission.id)}
              />
            ))}
          </div>
        </div>

        {/* Today → Future connection */}
        <div className="p-6 rounded-xl border border-border bg-card/50">
          <p className="text-center text-muted-foreground">
            Completing today's missions moves you{" "}
            <span className="text-foreground font-medium">0.3%</span> closer to becoming a{" "}
            <span className="text-accent font-medium">{userData.identity}</span>.
          </p>
        </div>
      </main>
    </div>
  );
};
