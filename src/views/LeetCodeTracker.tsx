"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTracker } from "../context/TrackerContext";
import { Info } from "lucide-react";
import BackToTopButton from "../components/BackToTopButton";
import CustomSetManager from "../components/CustomSetManager";
import Filters from "../components/Filters";
import ProblemTable from "../components/ProblemTable";
import {
  builtinProblemLists,
  calculateNextReviews,
  CUSTOM_TRACKING_LIST,
  getProblemProgressKey,
  getProblemProgress,
  getTodayString,
  pageSizeOptions,
} from "../lib/tracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LeetCodeTracker = () => {
  const { trackerState, updateTrackerState, mounted } = useTracker();
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { progress, customProblems, uiPreferences } = trackerState || {
    progress: {},
    customProblems: [],
    uiPreferences: {
      pageSize: 20,
      selectedList: "Blind 75",
      showOnlyDueToday: false,
    },
  };

  const problemLists = useMemo(
    () => ({
      ...builtinProblemLists,
      [CUSTOM_TRACKING_LIST]: customProblems,
    }),
    [customProblems],
  );

  const availableLists = Object.keys(problemLists);
  const selectedList = uiPreferences.selectedList || "Blind 75";
  const activeSelectedList = availableLists.includes(selectedList)
    ? selectedList
    : availableLists[0] || "";

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
    setFilterCategory("All");
    setFilterDifficulty("All");
    setFilterStatus("All");
  }, [activeSelectedList]);

  const currentProgress = progress;
  const problems = useMemo(() => {
    const listProblems = problemLists[activeSelectedList] || [];
    if (activeSelectedList !== CUSTOM_TRACKING_LIST) {
      return listProblems;
    }

    return [...listProblems].sort((left, right) => {
      const leftProgress = currentProgress[getProblemProgressKey(left)];
      const rightProgress = currentProgress[getProblemProgressKey(right)];
      const leftSolvedAt = leftProgress?.solvedDate || "";
      const rightSolvedAt = rightProgress?.solvedDate || "";

      if (leftSolvedAt && rightSolvedAt) {
        return rightSolvedAt.localeCompare(leftSolvedAt);
      }

      if (leftSolvedAt) {
        return -1;
      }

      if (rightSolvedAt) {
        return 1;
      }

      return 0;
    });
  }, [activeSelectedList, currentProgress, problemLists]);
  const today = useMemo(() => getTodayString(), []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          problems.flatMap((problem) => {
            const section =
              (problem as any).listMeta?.section ||
              (problem as any).listMeta?.module;
            const topics = problem.topics || [];
            return section && !topics.includes(section)
              ? [section, ...topics]
              : topics;
          }),
        ),
      ),
    ],
    [problems],
  );

  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) => {
        const categoryMatch =
          filterCategory === "All" ||
          (problem.topics || []).includes(filterCategory) ||
          (problem as any).listMeta?.section === filterCategory ||
          (problem as any).listMeta?.module === filterCategory;
        const difficultyMatch =
          filterDifficulty === "All" || problem.difficulty === filterDifficulty;
        const searchMatch =
          !searchQuery.trim() ||
          problem.title.toLowerCase().includes(searchQuery.toLowerCase());

        if (!categoryMatch || !difficultyMatch || !searchMatch) {
          return false;
        }

        if (filterStatus === "All") {
          return true;
        }

        const prob = currentProgress[getProblemProgressKey(problem)];
        const isSolved = prob?.solved || false;

        if (filterStatus === "Solved") {
          return isSolved;
        }

        if (filterStatus === "Unsolved") {
          return !isSolved;
        }

        if (filterStatus === "Due Today") {
          if (!isSolved) return false;
          const nextReviews = calculateNextReviews(prob.solvedDate);
          return nextReviews.some(
            (date, idx) => !prob.reviews?.[idx] && date <= today,
          );
        }

        return true;
      }),
    [
      currentProgress,
      filterCategory,
      filterDifficulty,
      problems,
      today,
      searchQuery,
      filterStatus,
    ],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProblems.length / uiPreferences.pageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProblems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * uiPreferences.pageSize;
    return filteredProblems.slice(
      startIndex,
      startIndex + uiPreferences.pageSize,
    );
  }, [filteredProblems, safeCurrentPage, uiPreferences.pageSize]);
  const rowStart = (safeCurrentPage - 1) * uiPreferences.pageSize;

  const toggleComplete = useCallback(
    (problem, reviewIndex = null) => {
      const progressKey = getProblemProgressKey(problem);

      updateTrackerState((prev) => {
        const latest = getProblemProgress(prev.progress, progressKey);

        let newProgressEntry;
        if (reviewIndex === null) {
          const newSolved = !latest.solved;
          newProgressEntry = {
            ...latest,
            solved: newSolved,
            solvedDate: newSolved ? today : null,
            reviews: newSolved ? latest.reviews : Array(5).fill(false),
            dates: newSolved ? { ...latest.dates, initial: today } : {},
          };
        } else {
          const newReviews = [...latest.reviews];
          newReviews[reviewIndex] = !newReviews[reviewIndex];
          const newDates = { ...latest.dates };
          if (newReviews[reviewIndex]) {
            newDates[`review${reviewIndex + 1}`] = today;
          } else {
            delete newDates[`review${reviewIndex + 1}`];
          }
          newProgressEntry = {
            ...latest,
            reviews: newReviews,
            dates: newDates,
          };
        }

        let newActivityLog = prev.activityLog;
        if (reviewIndex === null) {
          if (!latest.solved) {
            newActivityLog = [
              ...prev.activityLog,
              {
                id: crypto.randomUUID(),
                type: "solve",
                date: today,
                listName: activeSelectedList,
                problemKey: progressKey,
                reviewIndex: undefined,
              },
            ];
          } else {
            const toRemove = new Set([
              [progressKey, "solve", latest.solvedDate || today, ""].join(":"),
              ...Object.entries(latest.dates || {}).flatMap(([key, date]) => {
                const match = key.match(/^review(\d+)$/);
                if (!match || !date) return [];
                return [
                  [progressKey, "review", date, Number(match[1]) - 1].join(":"),
                ];
              }),
            ]);
            newActivityLog = prev.activityLog.filter(
              (entry) =>
                !toRemove.has(
                  [
                    entry.problemKey,
                    entry.type,
                    entry.date,
                    entry.reviewIndex ?? "",
                  ].join(":"),
                ),
            );
          }
        } else if (!latest.reviews?.[reviewIndex]) {
          newActivityLog = [
            ...prev.activityLog,
            {
              id: crypto.randomUUID(),
              type: "review",
              date: today,
              listName: activeSelectedList,
              problemKey: progressKey,
              reviewIndex,
            },
          ];
        } else {
          newActivityLog = prev.activityLog.filter(
            (entry) =>
              !(
                entry.problemKey === progressKey &&
                entry.type === "review" &&
                entry.reviewIndex === reviewIndex
              ),
          );
        }

        return {
          ...prev,
          progress: { ...prev.progress, [progressKey]: newProgressEntry },
          activityLog: newActivityLog,
        };
      });
    },
    [updateTrackerState, activeSelectedList, today],
  );

  const handleAddCustomProblem = useCallback(
    (problem) => {
      const exists = trackerState.customProblems.some(
        (item) =>
          (item.slug && item.slug === problem.slug) || item.url === problem.url,
      );

      if (exists) {
        return { ok: false, error: "This problem is already being tracked." };
      }

      updateTrackerState((prev) => ({
        ...prev,
        customProblems: [...prev.customProblems, problem],
        uiPreferences: {
          ...prev.uiPreferences,
          selectedList: CUSTOM_TRACKING_LIST,
        },
      }));
      return { ok: true };
    },
    [trackerState, updateTrackerState],
  );

  const prepareCustomTrackingList = useCallback(() => {
    updateTrackerState((prev) => ({
      ...prev,
      uiPreferences: {
        ...prev.uiPreferences,
        selectedList: CUSTOM_TRACKING_LIST,
      },
    }));
  }, [updateTrackerState]);

  if (!mounted || !trackerState)
    return (
      <div className="min-h-[calc(100vh-65px)] animate-pulse bg-background px-3 pt-4 pb-4">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
          <div className="h-24 rounded-xl bg-secondary/30" />
          <div className="h-12 rounded-xl bg-secondary/20" />
          <div className="h-96 rounded-xl bg-secondary/20" />
        </div>
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-65px)] bg-linear-to-b from-background via-background to-secondary/10 px-3 pt-4 pb-4 transition-colors">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardHeader className="gap-4 border-b border-border/70 bg-secondary/20">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CardTitle>Problems</CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CustomSetManager
                  onAddProblem={handleAddCustomProblem}
                  selectedList={activeSelectedList}
                  onPrepareList={prepareCustomTrackingList}
                />
                <Tooltip>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 border border-border/70 shadow-sm"
                    aria-label="Review Info"
                  >
                    <TooltipTrigger>
                      <span className="flex items-center">
                        <Info size={14} />
                      </span>
                    </TooltipTrigger>
                  </Button>
                  <TooltipContent className="max-w-xs text-pretty leading-relaxed">
                    <div className="gap-1 text-xs text-background">
                      Solve a problem once, then revisit it after 1, 3, 7, 14,
                      and 30 days. Reviews due today are highlighted, and
                      reminders can notify you when your streak or review queue
                      needs attention.
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4 pt-3 pb-4">
            <Filters
              searchQuery={searchQuery}
              setSearchQuery={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              categories={categories}
              difficulties={difficulties}
              filterCategory={filterCategory}
              setFilterCategory={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
              filterDifficulty={filterDifficulty}
              setFilterDifficulty={(value) => {
                setFilterDifficulty(value);
                setCurrentPage(1);
              }}
              filterStatus={filterStatus}
              setFilterStatus={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
              pageSize={uiPreferences.pageSize}
              setPageSize={(pageSize) => {
                setCurrentPage(1);
                updateTrackerState((prev) => ({
                  ...prev,
                  uiPreferences: { ...prev.uiPreferences, pageSize },
                }));
              }}
              pageSizeOptions={pageSizeOptions}
              showPageSizeControl={filteredProblems.length > 20}
            />

            {/* Review Info now in tooltip */}

            <ProblemTable
              problems={paginatedProblems}
              progress={currentProgress}
              toggleComplete={toggleComplete}
              onCategoryClick={(category) => {
                setFilterCategory(category);
                setCurrentPage(1);
              }}
              calculateNextReviews={calculateNextReviews}
              currentPage={safeCurrentPage}
              rowStart={rowStart}
              totalPages={totalPages}
              totalItems={filteredProblems.length}
              onPageChange={(page) =>
                setCurrentPage(Math.max(1, Math.min(page, totalPages)))
              }
            />
          </CardContent>
        </Card>
      </div>
      <BackToTopButton visible={showBackToTop} />
    </div>
  );
};

export default LeetCodeTracker;
