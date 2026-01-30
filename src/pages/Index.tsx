import { useState } from "react";
import { Hero } from "@/components/Hero";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Dashboard } from "@/components/Dashboard";

type AppState = "hero" | "onboarding" | "dashboard";

interface UserData {
  identity: string;
  targetDate: string;
  context: string;
  outcome: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("hero");
  const [userData, setUserData] = useState<UserData>({
    identity: "",
    targetDate: "",
    context: "",
    outcome: "",
  });

  const handleGetStarted = () => {
    setAppState("onboarding");
  };

  const handleOnboardingComplete = (data: {
    identity: string;
    targetDate: string;
    context: string;
    outcome: string;
  }) => {
    setUserData({
      identity: data.identity,
      targetDate: data.targetDate,
      context: data.context,
      outcome: data.outcome,
    });
    setAppState("dashboard");
  };

  const handleBackToHero = () => {
    setAppState("hero");
  };

  const handleLogout = () => {
    setAppState("hero");
    setUserData({
      identity: "",
      targetDate: "",
      context: "",
      outcome: "",
    });
  };

  return (
    <>
      {appState === "hero" && <Hero onGetStarted={handleGetStarted} />}
      {appState === "onboarding" && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onBack={handleBackToHero}
        />
      )}
      {appState === "dashboard" && (
        <Dashboard onLogout={handleLogout} userData={userData} />
      )}
    </>
  );
};

export default Index;
