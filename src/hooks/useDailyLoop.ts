import { useState, useEffect, useMemo } from "react";

type DailyLoopState = "none" | "morning" | "evening";

interface UseDailyLoopOptions {
  enabled?: boolean;
  morningHourStart?: number; // Default: 5 (5 AM)
  morningHourEnd?: number;   // Default: 12 (12 PM)
  eveningHourStart?: number; // Default: 21 (9 PM)
  eveningHourEnd?: number;   // Default: 24 (midnight)
}

interface UseDailyLoopResult {
  currentState: DailyLoopState;
  shouldShowMorning: boolean;
  shouldShowEvening: boolean;
  dismissMorning: () => void;
  dismissEvening: () => void;
  triggerMorning: () => void; // For manual testing
  triggerEvening: () => void; // For manual testing
  resetDaily: () => void;
}

const STORAGE_KEY_MORNING = "trajectory_morning_dismissed";
const STORAGE_KEY_EVENING = "trajectory_evening_dismissed";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getDismissedDate(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setDismissedDate(key: string): void {
  try {
    localStorage.setItem(key, getToday());
  } catch {
    // Ignore localStorage errors
  }
}

function clearDismissed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MORNING);
    localStorage.removeItem(STORAGE_KEY_EVENING);
  } catch {
    // Ignore
  }
}

export function useDailyLoop({
  enabled = true,
  morningHourStart = 5,
  morningHourEnd = 12,
  eveningHourStart = 21,
  eveningHourEnd = 24,
}: UseDailyLoopOptions = {}): UseDailyLoopResult {
  const [morningDismissed, setMorningDismissed] = useState(false);
  const [eveningDismissed, setEveningDismissed] = useState(false);
  const [manualState, setManualState] = useState<DailyLoopState>("none");

  // Check localStorage on mount
  useEffect(() => {
    const today = getToday();
    setMorningDismissed(getDismissedDate(STORAGE_KEY_MORNING) === today);
    setEveningDismissed(getDismissedDate(STORAGE_KEY_EVENING) === today);
  }, []);

  const timeBasedState = useMemo((): DailyLoopState => {
    if (!enabled) return "none";
    
    const hour = new Date().getHours();
    
    if (hour >= morningHourStart && hour < morningHourEnd) {
      return "morning";
    }
    
    if (hour >= eveningHourStart && hour < eveningHourEnd) {
      return "evening";
    }
    
    return "none";
  }, [enabled, morningHourStart, morningHourEnd, eveningHourStart, eveningHourEnd]);

  const currentState = manualState !== "none" ? manualState : timeBasedState;

  const shouldShowMorning = currentState === "morning" && !morningDismissed;
  const shouldShowEvening = currentState === "evening" && !eveningDismissed;

  const dismissMorning = () => {
    setMorningDismissed(true);
    setManualState("none");
    setDismissedDate(STORAGE_KEY_MORNING);
  };

  const dismissEvening = () => {
    setEveningDismissed(true);
    setManualState("none");
    setDismissedDate(STORAGE_KEY_EVENING);
  };

  const triggerMorning = () => {
    setMorningDismissed(false);
    setManualState("morning");
  };

  const triggerEvening = () => {
    setEveningDismissed(false);
    setManualState("evening");
  };

  const resetDaily = () => {
    setMorningDismissed(false);
    setEveningDismissed(false);
    setManualState("none");
    clearDismissed();
  };

  return {
    currentState,
    shouldShowMorning,
    shouldShowEvening,
    dismissMorning,
    dismissEvening,
    triggerMorning,
    triggerEvening,
    resetDaily,
  };
}
