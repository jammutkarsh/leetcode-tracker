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
  Brain,
  Rocket,
} from "lucide-react";
import interviewRoadmap from "../data/interview-roadmap.json";
import dsaMindmap from "../data/dsa-mindmap.json";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const iconMap = {
  Briefcase,
  Code,
  MessageSquare,
  DollarSign,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  Brain,
};

const InterviewRoadmap = () => {
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
    <div className="min-h-[calc(100vh-65px)] bg-background px-4 py-6 transition-colors">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              Interview Mastery Roadmap
            </h1>
            <Rocket size={32} className="text-primary" />
          </div>
          <p className="text-muted-foreground">
            Your complete guide from application to offer
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start relative">
          {/* Table of Contents - Sticky Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-6 lg:sticky lg:top-18">
            <div>
              <h3 className="font-semibold text-sm mb-3 pl-2 uppercase text-muted-foreground tracking-wider">
                Process
              </h3>
              <div className="flex flex-col gap-1">
                {interviewRoadmap.map((section) => (
                  <a
                    key={section.id}
                    href={"#" + section.id}
                    className="text-sm py-1.5 px-3 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{section.title}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {getProgress(section.id)}%
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 pl-2 uppercase text-muted-foreground tracking-wider border-t border-border pt-4">
                Resources
              </h3>
              <div className="flex flex-col gap-1">
                <a
                  href="#dsa-mindmap"
                  className="text-sm py-1.5 px-3 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Brain size={14} />
                  <span>DSA Mind Map</span>
                </a>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col gap-8 min-w-0">
            {/* Interview Process Sections */}
            <div className="space-y-6">
              {interviewRoadmap.map((section, idx) => {
                const Icon = iconMap[section.icon];
                const progress = getProgress(section.id);
                const isExpanded = expandedSections[section.id];

                return (
                  <div
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-20 rounded-xl overflow-hidden border border-border bg-card shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className={`${section.color} w-full p-4 text-left hover:opacity-90 transition-opacity`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Icon size={24} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-white leading-tight">
                              {idx + 1}. {section.title}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="bg-white/30 rounded-full h-1.5 w-24 overflow-hidden">
                                <div
                                  className="bg-white h-full transition-[width] duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-white text-xs font-medium">
                                {progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown
                            size={20}
                            className="text-white shrink-0"
                          />
                        ) : (
                          <ChevronRight
                            size={20}
                            className="text-white shrink-0"
                          />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-4 border-t border-border">
                        <div className="grid gap-3">
                          {section.items.map((item) => {
                            const isCompleted = completedItems[item.id];
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleComplete(item.id)}
                                className={`w-full p-3 rounded-lg border text-left transition-[background-color,border-color] ${
                                  isCompleted
                                    ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
                                    : "bg-muted/30 border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 shrink-0 transition-colors">
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
                                  <div className="flex-1 min-w-0">
                                    <h3
                                      className={`font-medium text-sm mb-1 leading-tight transition-colors ${
                                        isCompleted
                                          ? "text-green-700 dark:text-green-400 line-through opacity-80"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {item.title}
                                    </h3>
                                    <p
                                      className={`text-xs transition-colors ${
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
                    )}
                  </div>
                );
              })}
            </div>

            {/* DSA Mind Map Section */}
            <div id="dsa-mindmap" className="pt-16 -mt-16 pb-8">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={24} className="text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  DSA Mind Map
                </h2>
              </div>
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3 border-b border-border bg-muted/20">
                  <CardTitle className="text-lg">{dsaMindmap.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {dsaMindmap.description}
                  </CardDescription>
                </CardHeader>
                <div className="p-4 bg-card grid gap-4 sm:grid-cols-2">
                  {dsaMindmap.sections.map((section) => (
                    <div
                      key={section.id}
                      className="p-3 bg-muted/40 rounded-lg border border-border/50"
                    >
                      <h3 className="font-medium text-foreground text-sm flex items-center gap-2 mb-2">
                        <span
                          className={`w-2 h-2 rounded-full ${section.color} inline-block`}
                        />
                        {section.title}
                      </h3>
                      <div className="flex flex-col gap-1.5 pl-4">
                        {section.content.map((item, i) => (
                          <span
                            key={i}
                            className="text-xs text-muted-foreground"
                          >
                            {item.type === "question"
                              ? "❓ "
                              : item.type === "answer"
                                ? "↳ "
                                : item.type === "note"
                                  ? "⚠️ "
                                  : item.type === "use"
                                    ? "💡 "
                                    : "• "}
                            {item.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoadmap;
