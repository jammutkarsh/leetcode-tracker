"use client";

import { useEffect, useMemo, useState } from "react";
import { storage } from "../lib/storage";
import {
  Briefcase,
  Code,
  MessageSquare,
  DollarSign,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  Rocket,
} from "lucide-react";
import interviewRoadmap from "../data/interview-roadmap.json";

const iconMap = {
  Briefcase,
  Code,
  MessageSquare,
  DollarSign,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
};

const JobChecklist = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [completedItems, setCompletedItems] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = storage.getItem("interview-roadmap-progress");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    try {
      storage.setItem(
        "interview-roadmap-progress",
        JSON.stringify(completedItems),
      );
    } catch (error) {
      console.error("Error saving interview progress:", error);
    }
  }, [completedItems]);

  const progressBySection = useMemo(
    () =>
      Object.fromEntries(
        interviewRoadmap.map((section) => {
          const completed = section.items.filter(
            (item) => completedItems[item.id],
          ).length;
          return [
            section.id,
            Math.round((completed / section.items.length) * 100),
          ];
        }),
      ),
    [completedItems],
  );

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleComplete = (id) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getProgress = (sectionId) => progressBySection[sectionId] ?? 0;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-linear-to-b from-background via-background to-secondary/10 px-4 py-6 transition-colors">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              Job Checklist
            </h1>
            <Rocket size={32} className="text-primary" />
          </div>
          <p className="text-muted-foreground">
            Track the interview journey from application through offer
            negotiation.
          </p>
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {interviewRoadmap.map((section, idx) => {
              const Icon = iconMap[section.icon];
              const progress = getProgress(section.id);
              const isExpanded = expandedSections[section.id];

              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-20 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`${section.color} flex w-full items-center justify-between p-4 text-left transition-opacity hover:opacity-90`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-white/20 p-2">
                        <Icon size={22} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold leading-tight text-white">
                          {idx + 1}. {section.title}
                        </h2>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/30">
                            <div
                              className="h-full bg-white transition-[width] duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-white">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={20} className="shrink-0 text-white" />
                    ) : (
                      <ChevronRight size={20} className="shrink-0 text-white" />
                    )}
                  </button>

                  {isExpanded ? (
                    <div className="border-t border-border/70 p-4">
                      <div className="grid gap-3">
                        {section.items.map((item) => {
                          const isCompleted = completedItems[item.id];

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleComplete(item.id)}
                              className={`rounded-xl border p-3 text-left transition-[background-color,border-color] ${
                                isCompleted
                                  ? "border-green-500/30 bg-green-500/5 hover:border-green-500/50"
                                  : "border-border bg-muted/20 hover:border-muted-foreground/30 hover:bg-muted/40"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle
                                      className="text-green-500"
                                      size={18}
                                    />
                                  ) : (
                                    <Circle
                                      className="text-muted-foreground"
                                      size={18}
                                    />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3
                                    className={`mb-1 text-sm font-medium leading-tight ${
                                      isCompleted
                                        ? "text-green-700 line-through opacity-80 dark:text-green-400"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {item.title}
                                  </h3>
                                  <p
                                    className={`text-xs ${
                                      isCompleted
                                        ? "text-muted-foreground/70"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobChecklist;
