import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Flag,
  FolderKanban,
  Gauge,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { clampPercent } from "@/lib/projects/progress-formatters";
import { cn } from "@/lib/utils";
import type { DashboardStats as Stats } from "@/types/api";

type Props = {
  stats: Stats;
};

export function DashboardStats({ stats }: Props) {
  const atRisk =
    stats.warning_projects_count + stats.critical_projects_count;
  const overallPercent = clampPercent(stats.global_completion_rate);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={FolderKanban}
          label="Active projects"
          value={stats.active_projects_count}
          description={`${stats.completed_projects_count} completed`}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Projects at risk"
          value={atRisk}
          description={
            stats.critical_projects_count > 0
              ? `${stats.critical_projects_count} critical`
              : "All healthy"
          }
          tone={atRisk > 0 ? "amber" : "default"}
        />
        <KpiCard
          icon={CalendarClock}
          label="Overdue tasks"
          value={stats.overdue_tasks_count}
          description={
            stats.overdue_tasks_count > 0 ? "Needs attention" : "Nothing overdue"
          }
          tone={stats.overdue_tasks_count > 0 ? "rose" : "default"}
        />
        <KpiCard
          icon={CheckCircle2}
          label="Due today"
          value={stats.due_today_tasks_count}
          description={
            stats.due_today_tasks_count > 0 ? "Tasks due today" : "Clear today"
          }
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card data-slot="dashboard-substat">
          <CardHeader className="flex-row items-center gap-2">
            <Flag className="size-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
            <CardTitle className="text-sm">Upcoming milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold tabular-nums">
                {stats.upcoming_milestones_count}
              </span>
              <span className="text-xs text-muted-foreground">next 7 days</span>
            </div>
          </CardContent>
        </Card>
        <Card data-slot="dashboard-substat">
          <CardHeader className="flex-row items-center gap-2">
            <Gauge className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <CardTitle className="text-sm">Global completion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold tabular-nums">
                {overallPercent}%
              </span>
              <span className="text-xs text-muted-foreground">across all tasks</span>
            </div>
            <ProgressBar value={overallPercent} size="sm" tone="emerald" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type KpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  description: string;
  tone?: "default" | "amber" | "rose";
};

const TONE_RING: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "",
  amber: "ring-amber-500/30",
  rose: "ring-rose-500/30",
};

const TONE_ICON: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-muted-foreground",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
};

function KpiCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "default",
}: KpiCardProps) {
  return (
    <Card
      data-slot="dashboard-kpi-card"
      className={cn(TONE_RING[tone])}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <Icon className={cn("size-4", TONE_ICON[tone])} aria-hidden />
        </div>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
