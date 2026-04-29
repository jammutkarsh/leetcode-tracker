import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const colorClasses = {
  blue: "text-primary",
  green: "text-green-600 dark:text-green-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  red: "text-red-600 dark:text-red-400",
  purple: "text-purple-600 dark:text-purple-400",
};

const StatsCard = ({ color, value, label }) => (
  <Card>
    <CardContent className={cn(colorClasses[color], "p-4")}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-75">{label}</div>
    </CardContent>
  </Card>
);
export default StatsCard;
