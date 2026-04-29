"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  createInitialState,
  loadTrackerState,
  saveTrackerState,
  sanitizeTrackerState,
} from "../lib/tracker";

type TrackerState = ReturnType<typeof createInitialState>;

interface TrackerContextValue {
  trackerState: TrackerState;
  updateTrackerState: (
    nextStateOrUpdater:
      | TrackerState
      | null
      | ((prev: TrackerState) => TrackerState),
  ) => void;
  notificationSettings: TrackerState["notificationSettings"];
  handleNotificationSettingsChange: (
    settings: TrackerState["notificationSettings"],
  ) => void;
  handleEnableChange: (enabled: boolean) => void;
  mounted: boolean;
}

const TrackerContext = createContext<TrackerContextValue | undefined>(
  undefined,
);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [trackerState, setTrackerState] = useState(createInitialState);
  const [mounted, setMounted] = useState(false);

  const updateTrackerState = useCallback((nextStateOrUpdater) => {
    if (nextStateOrUpdater === null) {
      setTrackerState(createInitialState());
      return;
    }
    setTrackerState((prev) =>
      sanitizeTrackerState(
        typeof nextStateOrUpdater === "function"
          ? nextStateOrUpdater(prev)
          : nextStateOrUpdater,
      ),
    );
  }, []);

  useEffect(() => {
    const state = loadTrackerState();
    setTrackerState(state);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveTrackerState(trackerState);
    }
  }, [trackerState, mounted]);

  const handleNotificationSettingsChange = useCallback(
    (newSettings: TrackerState["notificationSettings"]) => {
      setTrackerState((prev) => ({
        ...prev,
        notificationSettings: newSettings,
      }));
    },
    [],
  );

  const handleEnableChange = useCallback((enabled: boolean) => {
    setTrackerState((prev) => ({
      ...prev,
      notificationSettings: { ...prev.notificationSettings, enabled },
    }));
  }, []);

  const notificationSettings = trackerState.notificationSettings;

  return (
    <TrackerContext.Provider
      value={{
        trackerState,
        updateTrackerState,
        notificationSettings,
        handleNotificationSettingsChange,
        handleEnableChange,
        mounted,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (context === undefined) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
}
