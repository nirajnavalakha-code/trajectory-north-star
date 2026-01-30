import { useState, useMemo } from "react";
import { TrajectoryLogo } from "./TrajectoryLogo";
import { DailyGreeting } from "./DailyGreeting";
import { NorthStarCard } from "./NorthStarCard";
import { TrajectoryVisualization } from "./TrajectoryVisualization";
import { MissionCard } from "./MissionCard";
import { VelocityIndicator } from "./VelocityIndicator";
import { VelocityPanel } from "./VelocityPanel";
import { RoadmapView } from "./RoadmapView";
import { MorningCheckIn } from "./MorningCheckIn";
import { EveningWrapUp } from "./EveningWrapUp";
import { KnowledgeWorkspace } from "./knowledge/KnowledgeWorkspace";
import { Button } from "./ui/button";
import { Settings, Bell, LogOut, Map, Activity, Sun, Moon, BookOpen } from "lucide-react";
import { createSampleMissions } from "@/data/sampleMissions";
import { useVelocity } from "@/hooks/useVelocity";
import { useDailyLoop } from "@/hooks/useDailyLoop";
import { format, addMonths } from "date-fns";

interface DashboardProps {
  onLogout: () => void;
  userData: {
    identity: string;
    targetDate: string;
    context: string;
    outcome: string;
  };
}

type DashboardView = "main" | "roadmap" | "velocity" | "knowledge";

export const Dashboard = ({ onLogout, userData }: DashboardProps) => {
  const [view, setView] = useState<DashboardView>("main");
  
  // Generate missions based on user's identity
  const missionHierarchy = useMemo(() => createSampleMissions(userData.identity), [userData.identity]);
  
  // Calculate velocity metrics
  const startDate = useMemo(() => format(addMonths(new Date(), -3), "yyyy-MM-dd"), []);
  const { metrics: velocityMetrics, summary: velocitySummary } = useVelocity({
    hierarchy: missionHierarchy,
    targetDate: userData.targetDate || format(addMonths(new Date(), 9), "yyyy-MM-dd"),
    startDate,
  });

  // Daily engagement loop
  const {
    shouldShowMorning,
    shouldShowEvening,
    dismissMorning,
    dismissEvening,
    triggerMorning,
    triggerEvening,
  } = useDailyLoop({ enabled: true });
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

  // Show Roadmap View
  if (view === "roadmap") {
    return <RoadmapView userData={userData} onBack={() => setView("main")} />;
  }

  // Show Knowledge Workspace
  if (view === "knowledge") {
    return <KnowledgeWorkspace onBack={() => setView("main")} />;
  }

  // Show Velocity View
  if (view === "velocity") {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 bg-trajectory-radial pointer-events-none opacity-30" />
        <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <TrajectoryLogo size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("main")}
              className="text-muted-foreground"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </header>
        <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Velocity & Reality Engine</h1>
            <p className="text-muted-foreground">
              Truth over comfort. Here's exactly where you stand.
            </p>
          </div>
          <VelocityPanel metrics={velocityMetrics} />
        </main>
      </div>
    );
  }

  // Prepare data for morning check-in
  const morningMissions = missions.map(m => ({
    id: m.id,
    title: m.title,
    duration: m.duration,
    impact: m.impact === "high" ? "critical" as const : m.impact,
    whyNow: m.description.split(".")[0] + ".",
  }));

  const trajectoryLink = `Today's focus directly builds your path to becoming a ${userData.identity}. Each mission compounds toward your goal.`;

  // Prepare data for evening wrap-up
  const completedMissions = missions.filter(m => m.isCompleted).map(m => ({
    id: m.id,
    title: m.title,
    duration: m.duration,
  }));

  const slippedMissions = missions.filter(m => !m.isCompleted).map(m => ({
    id: m.id,
    title: m.title,
    rescheduledTo: "tomorrow" as const,
  }));

  const tomorrowMissions = [
    ...slippedMissions.map(m => ({ id: m.id, title: m.title, duration: "TBD", isCarryOver: true })),
    { id: "new1", title: "Continue building toward trajectory", duration: "2 hours", isCarryOver: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Morning Check-In Modal */}
      {shouldShowMorning && (
        <MorningCheckIn
          userName="there"
          identity={userData.identity}
          missions={morningMissions}
          totalEffort="3 hours 5 min"
          trajectoryLink={trajectoryLink}
          onStart={dismissMorning}
          onDismiss={dismissMorning}
        />
      )}

      {/* Evening Wrap-Up Modal */}
      {shouldShowEvening && (
        <EveningWrapUp
          userName="there"
          identity={userData.identity}
          completedMissions={completedMissions}
          slippedMissions={slippedMissions}
          tomorrowMissions={tomorrowMissions}
          velocityStatus={velocityMetrics.status}
          velocityChange={completedMissions.length > 0 ? 2 : -3}
          daysOffset={velocityMetrics.daysOffset}
          onClose={dismissEvening}
        />
      )}

      {/* Background */}
      <div className="fixed inset-0 bg-trajectory-radial pointer-events-none opacity-30" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <TrajectoryLogo size="sm" />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("velocity")}
              className="text-muted-foreground gap-2"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Velocity</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("roadmap")}
              className="text-muted-foreground gap-2"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Roadmap</span>
            </Button>
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
            daysRemaining={velocityMetrics.daysOffset > 0 ? velocityMetrics.daysOffset : 287}
            velocity={velocityMetrics.status}
          />

          <button
            onClick={() => setView("velocity")}
            className="p-6 rounded-2xl border border-border bg-card hover:border-accent/30 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Your Trajectory</h3>
              <VelocityIndicator status={velocityMetrics.status} days={velocityMetrics.daysOffset} showLabel={true} />
            </div>
            <TrajectoryVisualization progress={velocityMetrics.actualProgress} />
            <p className="text-sm text-muted-foreground mt-4 group-hover:text-foreground transition-colors">
              Click to view detailed velocity analysis →
            </p>
          </button>
        </div>

        {/* Quick Access Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={triggerMorning}
            className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-accent/30 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Morning Brief</h3>
                <p className="text-sm text-muted-foreground">
                  Start your day
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={triggerEvening}
            className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-accent/30 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Evening Wrap</h3>
                <p className="text-sm text-muted-foreground">
                  Review & plan
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setView("knowledge")}
            className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-accent/30 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Dump & learn
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setView("velocity")}
            className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-accent/30 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Velocity</h3>
                <p className="text-sm text-muted-foreground truncate max-w-[120px]">
                  {velocitySummary.split(".")[0]}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setView("roadmap")}
            className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-accent/30 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Roadmap</h3>
                <p className="text-sm text-muted-foreground">
                  Full hierarchy
                </p>
              </div>
            </div>
          </button>
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
