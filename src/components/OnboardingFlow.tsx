import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight, Star, Check } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onBack: () => void;
}

interface OnboardingData {
  identity: string;
  targetDate: string;
  context: string;
  outcome: string;
  currentRole: string;
  timeAvailable: string;
  energyPattern: string;
}

const steps = [
  {
    id: "destination",
    title: "Define Your Destination",
    subtitle: "Who do you want to become?",
  },
  {
    id: "starting-point",
    title: "Understand Your Starting Point",
    subtitle: "No judgment. Just facts.",
  },
  {
    id: "lock-in",
    title: "Lock Your North Star",
    subtitle: "One primary trajectory. Everything else is secondary.",
  },
];

export const OnboardingFlow = ({ onComplete, onBack }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    identity: "",
    targetDate: "",
    context: "",
    outcome: "",
    currentRole: "",
    timeAvailable: "",
    energyPattern: "",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return data.identity && data.targetDate;
      case 1:
        return data.currentRole && data.timeAvailable;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-trajectory-radial pointer-events-none opacity-50" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-1 rounded-full transition-colors",
                i <= currentStep ? "bg-accent" : "bg-border"
              )}
            />
          ))}
        </div>

        <div className="w-16" />
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto w-full">
        <div className="w-full space-y-8 animate-fade-in" key={currentStep}>
          {/* Step header */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              {steps[currentStep].title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {steps[currentStep].subtitle}
            </p>
          </div>

          {/* Step content */}
          <div className="space-y-6 py-8">
            {currentStep === 0 && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Who do you want to become?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Product Manager at a top tech company"
                    value={data.identity}
                    onChange={(e) => updateData("identity", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    By when?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., December 2025"
                    value={data.targetDate}
                    onChange={(e) => updateData("targetDate", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    In which context? (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Remote-first, B2B SaaS, Bay Area network"
                    value={data.context}
                    onChange={(e) => updateData("context", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    What outcome matters most?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Income", "Impact", "Freedom", "Mastery"].map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData("outcome", option)}
                        className={cn(
                          "px-4 py-3 rounded-lg border text-left transition-all",
                          data.outcome === option
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-secondary hover:border-muted-foreground"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Current role / skill level
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Junior Developer, 2 years experience"
                    value={data.currentRole}
                    onChange={(e) => updateData("currentRole", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Time available daily
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["1-2 hours", "2-4 hours", "4+ hours"].map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData("timeAvailable", option)}
                        className={cn(
                          "px-4 py-3 rounded-lg border text-center transition-all",
                          data.timeAvailable === option
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-secondary hover:border-muted-foreground"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Energy pattern
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Morning person", "Night owl"].map((option) => (
                      <button
                        key={option}
                        onClick={() => updateData("energyPattern", option)}
                        className={cn(
                          "px-4 py-3 rounded-lg border text-center transition-all",
                          data.energyPattern === option
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-secondary hover:border-muted-foreground"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Summary card */}
                <div className="p-6 rounded-2xl border border-accent/30 bg-gradient-to-br from-card to-accent/5">
                  <div className="flex items-center gap-2 text-accent mb-4">
                    <Star className="w-5 h-5 fill-accent" />
                    <span className="text-sm font-medium uppercase tracking-wider">
                      Your North Star
                    </span>
                  </div>

                  <h2 className="font-display text-2xl font-bold mb-2">
                    {data.identity || "Your future identity"}
                  </h2>

                  <p className="text-muted-foreground mb-4">
                    {data.context || "Your context"} • Target: {data.targetDate || "Your timeline"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-secondary text-sm">
                      {data.outcome || "Outcome"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-sm">
                      {data.timeAvailable || "Time"}/day
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-sm">
                      {data.energyPattern || "Energy"}
                    </span>
                  </div>
                </div>

                <p className="text-center text-muted-foreground">
                  This is your primary trajectory.
                  <br />
                  <span className="text-foreground font-medium">
                    Everything else is secondary.
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              variant="trajectory"
              size="lg"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="group"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Lock my trajectory
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
