"use client";

import { Brain } from "lucide-react";
import dsaMindmap from "../data/dsa-mindmap.json";
import { cn } from "@/lib/utils";

const DsaMindMap = () => {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-linear-to-b from-background via-background to-secondary/10 px-4 py-6 transition-colors">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <h1
              className="text-3xl font-bold text-foreground"
              id="main-content"
            >
              DSA Mind Map
            </h1>
            <Brain
              size={32}
              className="text-primary"
              aria-label="Mind Map Icon"
            />
          </div>
          <p className="text-muted-foreground">
            Follow the topic map to pick the right data structure or algorithm
            faster.
          </p>
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-64 lg:sticky lg:top-18">
            <h3 className="mb-3 pl-2 text-base font-semibold uppercase tracking-wider text-muted-foreground">
              Contents
            </h3>
            <div className="flex flex-wrap gap-2 pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
              {dsaMindmap.sections.map((section, idx) => (
                <a
                  key={section.id}
                  href={`#mindmap-section-${idx}`}
                  className="rounded-full border border-border/70 px-3 py-1.5 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:min-w-0 lg:rounded-md lg:border-transparent lg:px-3"
                  title={section.title}
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {dsaMindmap.sections.map((section, idx) => (
              <div
                key={section.id}
                id={`mindmap-section-${idx}`}
                className="scroll-mt-20 overflow-hidden rounded-xl border border-border bg-card shadow-xs"
              >
                <div className="border-b border-border bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="p-4">
                  {/* No section.description in data, skip */}
                  <MindMapSteps steps={section.content} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper: render indented, emoji-free steps
  function MindMapSteps({ steps }) {
    if (!Array.isArray(steps) || steps.length === 0) return null;
    return (
      <ul className="flex flex-col gap-2 text-lg">
        {steps.map((item, idx) => (
          <li
            key={idx}
            className={cn(
              "leading-relaxed",
              item.type === "question" && "pl-0 font-semibold text-primary",
              item.type === "answer" && "pl-6 text-foreground",
              item.type === "note" &&
                "pl-6 text-yellow-700 dark:text-yellow-300",
              item.type === "use" && "pl-6 text-blue-700 dark:text-blue-300",
              item.type === "info" && "pl-6 text-muted-foreground",
            )}
          >
            {item.type === "question" && <span>Q: </span>}
            {item.type === "answer" && <span>A: </span>}
            {item.type === "note" && <span>Note: </span>}
            {item.type === "use" && <span>Use: </span>}
            {item.type === "info" && <span>Info: </span>}
            {item.text}
          </li>
        ))}
      </ul>
    );
  }
};

export default DsaMindMap;
