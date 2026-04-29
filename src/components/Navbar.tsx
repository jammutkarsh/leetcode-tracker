"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Flame,
  Menu,
  CalendarClock,
  CheckCircle2,
  Circle,
  Settings,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTracker } from "../context/TrackerContext";
import ExportImportControls from "./ExportImportControls";
import ReminderButton from "./ReminderButton";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCurrentStreak,
  getTodayString,
  builtinProblemLists,
  calculateNextReviews,
  CUSTOM_TRACKING_LIST,
  getDueReviewCount,
  getProblemProgressKey,
  isReminderDue,
} from "../lib/tracker";

const showReminderNotification = async ({
  title,
  body,
  tag,
}: {
  title: string;
  body: string;
  tag: string;
}) => {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  const registration = await navigator.serviceWorker.ready;
  if (registration.active) {
    registration.active.postMessage({
      type: "SHOW_NOTIFICATION",
      payload: {
        title,
        options: { body, tag, icon: "/icon.png", badge: "/icon.png" },
      },
    });
  }
};

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const {
    trackerState,
    updateTrackerState,
    notificationSettings,
    handleNotificationSettingsChange,
    handleEnableChange,
    mounted,
  } = useTracker();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<"stats" | "settings" | null>(null);
  const statsPanelRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const sentReminderKeysRef = useRef(new Set<string>());

  const activityLog = useMemo(
    () => trackerState?.activityLog || [],
    [trackerState?.activityLog],
  );
  const today = useMemo(() => getTodayString(), []);
  const currentStreak = useMemo(
    () => getCurrentStreak(activityLog, today),
    [activityLog, today],
  );

  const selectedList = trackerState?.uiPreferences?.selectedList || "Blind 75";
  const problemLists = useMemo(
    () => ({
      ...builtinProblemLists,
      [CUSTOM_TRACKING_LIST]: trackerState?.customProblems || [],
    }),
    [trackerState?.customProblems],
  );
  const availableLists = Object.keys(problemLists);
  const listProblems = useMemo(
    () => problemLists[selectedList] || [],
    [problemLists, selectedList],
  );

  const progress = useMemo(
    () => trackerState?.progress ?? {},
    [trackerState?.progress],
  );
  const notificationPermission =
    typeof Notification === "undefined"
      ? "unsupported"
      : Notification.permission;

  const dueTodayCount = useMemo(
    () =>
      trackerState
        ? getDueReviewCount(listProblems, trackerState.progress || {}, today)
        : 0,
    [listProblems, trackerState, today],
  );
  const hasActivityToday = useMemo(
    () => activityLog.some((entry) => entry.date === today),
    [activityLog, today],
  );
  const isHomePage = pathname === "/";
  const solvedStats = useMemo(() => {
    const counts = {
      easy: 0,
      medium: 0,
      hard: 0,
      solved: 0,
      total: listProblems.length,
    };

    if (!trackerState) {
      return counts;
    }

    listProblems.forEach((problem) => {
      const status = trackerState.progress?.[getProblemProgressKey(problem)];
      if (!status?.solved) {
        return;
      }

      counts.solved += 1;

      if (problem.difficulty === "Easy") counts.easy += 1;
      if (problem.difficulty === "Medium") counts.medium += 1;
      if (problem.difficulty === "Hard") counts.hard += 1;
    });

    return counts;
  }, [listProblems, trackerState]);
  const completionPercentage = solvedStats.total
    ? Math.round((solvedStats.solved / solvedStats.total) * 100)
    : 0;
  const statCards = [
    {
      key: "streak",
      label: "Daily Streak",
      value: currentStreak,
      tone: hasActivityToday
        ? "border-amber-500/30 bg-card text-amber-500 shadow-sm"
        : "border-border/70 bg-card text-muted-foreground shadow-sm",
      icon: Flame,
    },
    {
      key: "due",
      label: "Due Today",
      value: dueTodayCount,
      tone: "border-blue-500/30 bg-card text-blue-500 shadow-sm",
      icon: CalendarClock,
    },
    {
      key: "easy",
      label: "Easy Solved",
      value: solvedStats.easy,
      tone: "border-green-500/30 bg-card text-green-500 shadow-sm",
      icon: CheckCircle2,
    },
    {
      key: "medium",
      label: "Medium Solved",
      value: solvedStats.medium,
      tone: "border-yellow-500/30 bg-card text-yellow-500 shadow-sm",
      icon: CheckCircle2,
    },
    {
      key: "hard",
      label: "Hard Solved",
      value: solvedStats.hard,
      tone: "border-red-500/30 bg-card text-red-500 shadow-sm",
      icon: CheckCircle2,
    },
    {
      key: "completion",
      label: "Completion",
      value: `${completionPercentage}%`,
      tone: "border-border/70 bg-card text-foreground shadow-sm",
      icon: Circle,
    },
  ];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        target instanceof Element &&
        target.closest(
          '[data-slot="dialog-content"], [data-slot="alert-dialog-content"]',
        )
      ) {
        return;
      }

      if (statsPanelRef.current?.contains(target)) {
        return;
      }

      if (settingsPanelRef.current?.contains(target)) {
        return;
      }

      setOpenPanel(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setIsMoreOpen(false);
    setOpenPanel(null);
  }, [pathname]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  const notificationSettingsRef = useRef(notificationSettings);
  useEffect(() => {
    notificationSettingsRef.current = notificationSettings;
  });

  const persistNotificationSettingsPatch = useCallback(
    (patch) => {
      handleNotificationSettingsChange({
        ...notificationSettingsRef.current,
        ...patch,
      });
    },
    [handleNotificationSettingsChange],
  );

  useEffect(() => {
    if (!notificationSettings.enabled || notificationPermission !== "granted") {
      return;
    }

    const runReminderCheck = async () => {
      const now = new Date();
      const currentDate = getTodayString();
      const dueProblemKeys = new Set(
        Object.entries(problemLists).flatMap(([, listProblems]) =>
          listProblems
            .filter((problem) => {
              const status = progress[getProblemProgressKey(problem)];
              if (!status?.solved) {
                return false;
              }
              return calculateNextReviews(status.solvedDate).some(
                (date, index) =>
                  !status.reviews?.[index] && date <= currentDate,
              );
            })
            .map((problem) => getProblemProgressKey(problem)),
        ),
      );
      const dueProblemsCount = dueProblemKeys.size;

      const hasActivityToday = activityLog.some(
        (entry) => entry.date === currentDate,
      );

      const streakReminderKey = `streak-${currentDate}`;
      const dueReminderKey = `due-${currentDate}`;

      const streakAlreadySent =
        notificationSettings.lastStreakReminderDate === currentDate ||
        sentReminderKeysRef.current.has(streakReminderKey);
      const dueAlreadySent =
        notificationSettings.lastDueReminderDate === currentDate ||
        sentReminderKeysRef.current.has(dueReminderKey);

      if (
        isReminderDue(now, notificationSettings.streakReminderTime) &&
        !hasActivityToday &&
        !streakAlreadySent
      ) {
        sentReminderKeysRef.current.add(streakReminderKey);
        await showReminderNotification({
          title: "Keep your study streak alive",
          body: "Solve or review one problem today to keep the streak going.",
          tag: "daily-streak-reminder",
        });
        persistNotificationSettingsPatch({
          lastStreakReminderDate: currentDate,
        });
      }

      if (
        isReminderDue(now, notificationSettings.spacedRepetitionReminderTime) &&
        dueProblemsCount > 0 &&
        !dueAlreadySent
      ) {
        sentReminderKeysRef.current.add(dueReminderKey);
        await showReminderNotification({
          title: "Spaced repetition check-in",
          body: `${dueProblemsCount} problem${
            dueProblemsCount === 1 ? "" : "s"
          } need review today.`,
          tag: "spaced-repetition-reminder",
        });
        persistNotificationSettingsPatch({
          lastDueReminderDate: currentDate,
        });
      }
    };

    let timeoutId = null;

    const scheduleNextCheck = () => {
      const now = new Date();
      const delayUntilNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

      timeoutId = window.setTimeout(
        () => {
          runReminderCheck()
            .catch((error) => {
              console.error("Reminder check failed:", error);
            })
            .finally(() => {
              scheduleNextCheck();
            });
        },
        Math.max(1000, delayUntilNextMinute),
      );
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        runReminderCheck().catch((error) => {
          console.error("Reminder check failed:", error);
        });
      }
    };

    runReminderCheck().catch((error) => {
      console.error("Reminder check failed:", error);
    });

    scheduleNextCheck();
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [
    activityLog,
    notificationPermission,
    notificationSettings,
    persistNotificationSettingsPatch,
    problemLists,
    progress,
  ]);

  return (
    <nav className="relative z-40 border-b border-border/80 bg-card shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-transparent px-3 py-1.5 text-lg font-bold text-foreground transition-colors hover:border-border/70 hover:bg-secondary/60 hover:text-primary"
          >
            CodeTrack Pro
          </Link>

          {mounted && isHomePage ? (
            <Select
              value={selectedList}
              onValueChange={(value) => {
                updateTrackerState((prev) => ({
                  ...prev,
                  uiPreferences: {
                    ...prev.uiPreferences,
                    selectedList: value,
                  },
                }));
              }}
            >
              <SelectTrigger className="hidden h-9 min-w-48 border-border/80 bg-background/90 text-sm shadow-sm sm:flex">
                <SelectValue placeholder="Problem List" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableLists.map((listName) => (
                    <SelectItem key={listName} value={listName}>
                      {listName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          {mounted && (
            <div className="relative" ref={statsPanelRef}>
              <Button
                onClick={() =>
                  setOpenPanel((current) =>
                    current === "stats" ? null : "stats",
                  )
                }
                variant="outline"
                size="sm"
                className="h-9 items-center gap-2 rounded-full border-border/80 bg-background/90 px-3 shadow-sm"
              >
                <Flame
                  data-icon="inline-start"
                  className={
                    hasActivityToday
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }
                />
                <span
                  className={
                    hasActivityToday
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {currentStreak}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <CalendarClock className="text-blue-500" />
                <span className="text-foreground">{dueTodayCount}</span>
              </Button>

              {openPanel === "stats" ? (
                <div className="absolute right-0 top-12 z-90 w-[min(22rem,calc(100vw-1rem))] rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Tracker Stats
                    </h3>
                    <Button
                      onClick={() => setOpenPanel(null)}
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close tracker stats"
                    >
                      <X />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {statCards.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div
                          key={stat.key}
                          className={`rounded-xl border px-3 py-3 ${stat.tone}`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-secondary/80">
                              <Icon />
                            </div>
                            <span className="text-xs font-medium leading-tight">
                              {stat.label}
                            </span>
                          </div>
                          <div className="text-lg font-bold">{stat.value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <ReminderButton
            settings={notificationSettings}
            onSettingsChange={handleNotificationSettingsChange}
            onEnableChange={handleEnableChange}
          />

          <div className="relative" ref={settingsPanelRef}>
            <Button
              onClick={() =>
                setOpenPanel((current) =>
                  current === "settings" ? null : "settings",
                )
              }
              variant="outline"
              size="icon"
              className="border-border/80 bg-background/90 shadow-sm"
              aria-label="Open settings"
            >
              <Settings />
            </Button>

            {openPanel === "settings" ? (
              <div className="absolute right-0 top-12 z-90 w-[min(20rem,calc(100vw-1rem))] rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-2xl ring-1 ring-foreground/10">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Settings
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Import, export, or clear your tracked data.
                    </p>
                  </div>
                  <Button
                    onClick={() => setOpenPanel(null)}
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close settings"
                  >
                    <X />
                  </Button>
                </div>

                <ExportImportControls />
              </div>
            ) : null}
          </div>

          {/* Theme Toggle Button */}
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className="border-border/80 bg-background/90 shadow-sm"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="text-yellow-500" /> : <Moon />}
          </Button>

          <DropdownMenu open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 gap-1.5 shadow-sm"
                />
              }
            >
              <span className="hidden sm:inline">More</span>
              <span className="sm:hidden">Menu</span>
              <Menu data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="z-90 w-[min(18rem,calc(100vw-1rem))] rounded-2xl border border-border bg-card p-2 shadow-2xl ring-1 ring-foreground/10"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Explore</DropdownMenuLabel>
                <DropdownMenuItem
                  className="min-h-11 rounded-xl px-3 py-2"
                  render={
                    <Link
                      href="/patterns"
                      onClick={() => setIsMoreOpen(false)}
                    />
                  }
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">
                      Patterns
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Templates and common problem families.
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="min-h-11 rounded-xl px-3 py-2"
                  render={
                    <Link
                      href="/dsa-mindmap"
                      onClick={() => setIsMoreOpen(false)}
                    />
                  }
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">
                      DSA Mind Map
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Browse the decision tree by topic.
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="min-h-11 rounded-xl px-3 py-2"
                  render={
                    <Link
                      href="/job-checklist"
                      onClick={() => setIsMoreOpen(false)}
                    />
                  }
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">
                      Job Checklist
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Follow the interview prep workflow.
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
