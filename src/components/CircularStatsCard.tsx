import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const CircularProgress = ({ solved, total, size = 120 }) => {
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-[stroke-dashoffset] duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {solved}/{total}
          </div>
        </div>
      </div>
    </div>
  );
};

const CircularStatsCard = ({ stats, problems }) => {
  const { totalEasy, totalMedium, totalHard } = problems.reduce(
    (acc, p) => {
      if (p.difficulty === "Easy") acc.totalEasy += 1;
      else if (p.difficulty === "Medium") acc.totalMedium += 1;
      else if (p.difficulty === "Hard") acc.totalHard += 1;
      return acc;
    },
    { totalEasy: 0, totalMedium: 0, totalHard: 0 },
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Progress Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0">
            <CircularProgress solved={stats.solved} total={stats.total} />
          </div>

          <div className="flex-1 w-full flex flex-col gap-4">
            {/* Easy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="size-3 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground font-medium">Easy</span>
              </div>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-[width] duration-500"
                    style={{
                      width: `${totalEasy > 0 ? (stats.easy / totalEasy) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-foreground min-w-15 text-right">
                  {stats.easy}/{totalEasy}
                </span>
              </div>
            </div>

            {/* Medium */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="size-3 rounded-full bg-yellow-500"></div>
                <span className="text-muted-foreground font-medium">
                  Medium
                </span>
              </div>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-[width] duration-500"
                    style={{
                      width: `${totalMedium > 0 ? (stats.medium / totalMedium) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-foreground min-w-15 text-right">
                  {stats.medium}/{totalMedium}
                </span>
              </div>
            </div>

            {/* Hard */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="size-3 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground font-medium">Hard</span>
              </div>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-[width] duration-500"
                    style={{
                      width: `${totalHard > 0 ? (stats.hard / totalHard) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-foreground min-w-15 text-right">
                  {stats.hard}/{totalHard}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.dueToday || 0}
            </div>
            <div className="text-sm text-muted-foreground">Due Today</div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="text-2xl font-bold text-primary">
              {Math.round((stats.solved / stats.total) * 100) || 0}%
            </div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CircularStatsCard;
