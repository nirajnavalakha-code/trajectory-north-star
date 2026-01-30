import { useState } from "react";
import { TrajectoryLogo } from "@/components/TrajectoryLogo";
import { MissionHierarchy } from "@/components/MissionHierarchy";
import { NorthStarCard } from "@/components/NorthStarCard";
import { VelocityIndicator } from "@/components/VelocityIndicator";
import { createSampleMissions } from "@/data/sampleMissions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Map, TrendingUp } from "lucide-react";
import { MissionHierarchy as MissionHierarchyType } from "@/types/missions";

interface RoadmapViewProps {
  userData: {
    identity: string;
    targetDate: string;
    context: string;
    outcome: string;
  };
  onBack: () => void;
}

export const RoadmapView = ({ userData, onBack }: RoadmapViewProps) => {
  const [missions, setMissions] = useState<MissionHierarchyType>(() =>
    createSampleMissions(userData.identity)
  );

  const handleMissionComplete = (missionId: string) => {
    setMissions((prev) => {
      const updated = { ...prev };
      
      // Find and update the mission across all timeframes
      (Object.keys(updated) as Array<keyof MissionHierarchyType>).forEach((timeframe) => {
        updated[timeframe] = updated[timeframe].map((mission) =>
          mission.id === missionId
            ? { ...mission, status: "completed" as const, progressPercent: 100, completedAt: new Date().toISOString() }
            : mission
        );
      });

      return updated;
    });
  };

  // Calculate overall stats
  const allMissions = [
    ...missions.yearly,
    ...missions.quarterly,
    ...missions.monthly,
    ...missions.weekly,
    ...missions.daily,
  ];
  const completedMissions = allMissions.filter((m) => m.status === "completed");
  const activeMissions = allMissions.filter((m) => m.status === "active");

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-trajectory-radial pointer-events-none opacity-30" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <TrajectoryLogo size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Map className="w-4 h-4" />
              <span>Mission Roadmap</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="text-2xl font-display font-bold">{allMissions.length}</div>
            <div className="text-sm text-muted-foreground">Total Missions</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="text-2xl font-display font-bold text-accent">{activeMissions.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="text-2xl font-display font-bold text-trajectory-success">{completedMissions.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* North Star Summary */}
        <NorthStarCard
          identity={userData.identity}
          targetDate={userData.targetDate}
          context={userData.context}
          daysRemaining={287}
          velocity="on-track"
        />

        {/* Velocity Context */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium">Current Velocity</p>
              <p className="text-sm text-muted-foreground">
                Your mission completion rate is aligned with your timeline
              </p>
            </div>
          </div>
          <VelocityIndicator status="on-track" showLabel />
        </div>

        {/* Mission Hierarchy */}
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold">Mission Hierarchy</h2>
            <p className="text-sm text-muted-foreground">
              From yearly vision to daily execution — every level builds on the next
            </p>
          </div>
          
          <MissionHierarchy
            missions={missions}
            onMissionComplete={handleMissionComplete}
          />
        </div>

        {/* Philosophy Note */}
        <div className="p-6 rounded-xl border border-border bg-card/50">
          <p className="text-center text-muted-foreground text-sm">
            Every daily mission directly contributes to your weekly sprint.
            <br />
            Every weekly sprint moves your monthly deliverable forward.
            <br />
            <span className="text-foreground font-medium">
              Small, consistent actions compound into trajectory-defining outcomes.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};
