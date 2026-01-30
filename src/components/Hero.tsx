import { Button } from "./ui/button";
import { TrajectoryLogo } from "./TrajectoryLogo";
import { ArrowRight, Play } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 bg-trajectory-radial pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <TrajectoryLogo />
        <Button variant="trajectory-ghost" onClick={onGetStarted}>
          Sign in
        </Button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <div className="space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-sm">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-muted-foreground">Life Execution Engine</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Stop planning.
            <br />
            <span className="text-accent trajectory-glow-text">Start executing.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
            Trajectory answers three questions every day: What matters? What am I avoiding?
            How does today change my future?
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="trajectory"
              size="xl"
              onClick={onGetStarted}
              className="group"
            >
              Define your trajectory
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="trajectory-outline" size="lg">
              <Play className="w-4 h-4" />
              See how it works
            </Button>
          </div>
        </div>

        {/* Philosophy cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-24 w-full animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {[
            {
              title: "Not a planner",
              description: "Trajectory doesn't store intentions. It drives outcomes.",
            },
            {
              title: "Truth over comfort",
              description: "See the real cost of delays. No sugarcoating, no guilt.",
            },
            {
              title: "One trajectory",
              description: "Focus on who you're becoming. Everything else is secondary.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-left card-hover"
            >
              <h3 className="font-display font-semibold text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer line */}
      <div className="absolute bottom-0 left-0 right-0 h-px trajectory-line opacity-30" />
    </div>
  );
};
