import { CircleHelp, Code2 } from "lucide-react";
import patterns from "../data/patterns.json";
import { Badge } from "@/components/ui/badge";
import PatternCodePanel from "@/components/patterns/PatternCodePanel";
import {
  PatternsLanguageProvider,
  PatternsLanguageSelect,
} from "@/components/patterns/PatternsLanguageProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const normalizedPatterns = patterns.map((pattern) => ({
  ...pattern,
  templates: Object.fromEntries(
    Object.entries(pattern.templates).map(([language, template]) => [
      language,
      template.replace(/\\n/g, "\n"),
    ]),
  ),
}));

const Patterns = () => {
  return (
    <PatternsLanguageProvider>
      <div className="min-h-[calc(100vh-65px)] bg-linear-to-b from-background via-background to-secondary/10 px-4 py-6 transition-colors">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                LeetCode Patterns
              </h1>
              <Code2 size={32} className="text-primary" />
            </div>
            <p className="text-muted-foreground">
              Master coding patterns in multiple languages
            </p>
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="w-full shrink-0 lg:w-64 lg:sticky lg:top-18">
              <h3 className="mb-3 pl-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Contents
              </h3>
              <div className="flex flex-wrap gap-2 pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                {normalizedPatterns.map((pattern, idx) => (
                  <a
                    key={pattern.title}
                    href={`#pattern-${idx}`}
                    className="rounded-full border border-border/70 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:min-w-0 lg:rounded-md lg:border-transparent lg:px-3"
                    title={pattern.title}
                  >
                    {pattern.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <div className="flex justify-start lg:justify-end">
                <PatternsLanguageSelect />
              </div>

              {normalizedPatterns.map((pattern, idx) => (
                <div
                  key={pattern.title}
                  id={`pattern-${idx}`}
                  className="scroll-mt-20 overflow-hidden rounded-xl border border-border bg-card shadow-xs"
                >
                  <div className="border-b border-border bg-primary/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">
                        {pattern.title}
                      </h2>
                      <Tooltip>
                        <TooltipTrigger
                          aria-label={`About ${pattern.title}`}
                          className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                        >
                          <CircleHelp size={14} />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm text-pretty leading-relaxed">
                          {pattern.description}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="p-4">
                    <PatternCodePanel
                      patternTitle={pattern.title}
                      templates={pattern.templates}
                    />

                    <div className="pt-2">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Common Problems
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pattern.problems.map((problem) => (
                          <Badge
                            key={problem}
                            variant="secondary"
                            className="border-border bg-background font-normal"
                          >
                            {problem}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PatternsLanguageProvider>
  );
};

export default Patterns;
