import { memo } from "react";
import {
  CheckCircle2,
  Circle,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  NotebookPen,
} from "lucide-react";
import {
  getProblemIdentifier,
  getProblemProgressKey,
  getTodayString,
} from "../lib/tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const difficultyColor = {
  Easy: "text-green-600",
  Medium: "text-yellow-600",
  Hard: "text-red-600",
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const isOverdue = (date: string, today: string) => date < today;
const isDueToday = (date: string, today: string) => date === today;

interface ProblemTableProps {
  problems: any[];
  progress: Record<string, any>;
  toggleComplete: (problem: any, reviewIndex?: number | null) => void;
  onCategoryClick?: (category: string) => void;
  calculateNextReviews: (solvedDate: string) => string[];
  currentPage: number;
  rowStart: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}

const ProblemTable = memo(function ProblemTable({
  problems,
  progress,
  toggleComplete,
  onCategoryClick,
  calculateNextReviews,
  currentPage,
  rowStart,
  totalPages,
  onPageChange,
  totalItems,
}: ProblemTableProps) {
  const today = getTodayString();

  const content = (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead className="min-w-56">Name</TableHead>
              <TableHead className="w-36">Category</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              {/* Removed Companies column */}
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="min-w-80">
                Reviews &amp; Due Dates
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.map((problem, index) => {
              const problemId = getProblemIdentifier(problem);
              const prob = progress[getProblemProgressKey(problem)] || {};
              const nextReviews = calculateNextReviews(prob.solvedDate);
              const rawSection =
                problem.listMeta?.section || problem.listMeta?.module;
              const sectionLabel: string | undefined =
                rawSection != null ? String(rawSection) : undefined;
              const dedupeTopics = [...new Set<string>(problem.topics || [])];
              const showSection =
                sectionLabel != null && !dedupeTopics.includes(sectionLabel);
              return (
                <TableRow key={problemId}>
                  <TableCell className="text-sm tabular-nums">
                    {rowStart + index + 1}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline flex items-center gap-1"
                        title={`Open ${problem.title} on LeetCode`}
                      >
                        <span className="line-clamp-2">{problem.title}</span>
                        <ExternalLink size={14} className="shrink-0" />
                      </a>
                      {problem.notes ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <span className="text-muted-foreground cursor-default" />
                            }
                          >
                            <NotebookPen size={14} />
                          </TooltipTrigger>
                          <TooltipContent>{problem.notes}</TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-40 flex-wrap gap-1.5">
                      {showSection ? (
                        <button
                          type="button"
                          onClick={() =>
                            onCategoryClick?.(sectionLabel as string)
                          }
                          className="rounded-full"
                        >
                          <Badge
                            variant="outline"
                            className="cursor-pointer transition-colors hover:bg-secondary"
                          >
                            {sectionLabel as string}
                          </Badge>
                        </button>
                      ) : null}
                      {dedupeTopics.map((topic, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onCategoryClick?.(topic)}
                          className="rounded-full"
                        >
                          <Badge
                            variant="outline"
                            className="cursor-pointer transition-colors hover:bg-secondary"
                          >
                            {topic}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-semibold ${difficultyColor[problem.difficulty]}`}
                    >
                      {problem.difficulty}
                    </span>
                  </TableCell>
                  {/* Removed Companies column cell */}
                  <TableCell>
                    <Button
                      onClick={() => toggleComplete(problem)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      {prob.solved ? (
                        <CheckCircle2
                          className="text-green-600 dark:text-green-500"
                          size={20}
                        />
                      ) : (
                        <Circle size={20} />
                      )}
                      <span className="text-xs">
                        {prob.solved ? "Solved" : "Not Solved"}
                      </span>
                    </Button>
                  </TableCell>
                  <TableCell>
                    {prob.solved ? (
                      <div className="grid min-w-80 grid-cols-5 gap-2">
                        {nextReviews.map((date, idx) => {
                          const isCompleted = prob.reviews?.[idx];
                          const overdue =
                            !isCompleted && isOverdue(date, today);
                          const dueToday =
                            !isCompleted && isDueToday(date, today);

                          return (
                            <div
                              key={idx}
                              className="flex min-w-0 flex-col items-center"
                            >
                              <Button
                                onClick={() => toggleComplete(problem, idx)}
                                size="xs"
                                variant={
                                  isCompleted
                                    ? "secondary"
                                    : overdue
                                      ? "destructive"
                                      : dueToday
                                        ? "outline"
                                        : "ghost"
                                }
                                className={`w-full min-w-0 ${dueToday && !isCompleted ? "border-yellow-500 text-yellow-700 dark:text-yellow-400" : ""}`}
                                title={`Review ${idx + 1} - Due: ${formatDate(date)}`}
                              >
                                {`R${idx + 1}`}
                              </Button>
                              <div
                                className={`mt-1 flex items-center gap-0.5 tabular-nums text-[10px] ${
                                  isCompleted
                                    ? "text-green-600 dark:text-green-400"
                                    : overdue
                                      ? "text-red-600 dark:text-red-400"
                                      : dueToday
                                        ? "text-yellow-600 dark:text-yellow-400"
                                        : "text-muted-foreground"
                                }`}
                              >
                                <Calendar size={10} />
                                {formatDate(date)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Complete problem to see review schedule
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {totalItems} problem{totalItems === 1 ? "" : "s"} total
        </p>
        {totalItems > 20 ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ChevronLeft size={16} />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );

  return <div className="min-w-0">{content}</div>;
});

export default ProblemTable;
