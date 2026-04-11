import Link from "next/link";
import { CalendarClock, CheckCircle2, Flag, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_VARIANTS } from "@/lib/tasks/formatters";
import {
  HEALTH_LABELS,
  HEALTH_VARIANTS,
} from "@/lib/projects/formatters";
import {
  clampPercent,
  formatShortDate,
} from "@/lib/projects/progress-formatters";
import { cn } from "@/lib/utils";
import type {
  DashboardOverdueTask,
  DashboardPriorities as Priorities,
  DashboardProjectSummary,
  DashboardUpcomingMilestone,
} from "@/types/api";

type Props = {
  priorities: Priorities;
};

export function DashboardPriorities({ priorities }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PriorityCard
        title="Overdue tasks"
        icon={CalendarClock}
        tone="rose"
        emptyMessage="Nothing overdue — nice."
        count={priorities.overdue_tasks.length}
      >
        {priorities.overdue_tasks.map((task) => (
          <OverdueTaskRow key={task.id} task={task} />
        ))}
      </PriorityCard>

      <PriorityCard
        title="Due today"
        icon={CheckCircle2}
        tone="amber"
        emptyMessage="Clear for today."
        count={priorities.due_today_tasks.length}
      >
        {priorities.due_today_tasks.map((task) => (
          <OverdueTaskRow key={task.id} task={task} />
        ))}
      </PriorityCard>

      <PriorityCard
        title="Upcoming milestones"
        icon={Flag}
        tone="indigo"
        emptyMessage="No milestones in the next 7 days."
        count={priorities.upcoming_milestones.length}
      >
        {priorities.upcoming_milestones.map((m) => (
          <UpcomingMilestoneRow key={m.id} milestone={m} />
        ))}
      </PriorityCard>

      <PriorityCard
        title="Projects at risk"
        icon={ShieldAlert}
        tone="amber"
        emptyMessage="No project flagged."
        count={priorities.at_risk_projects.length}
      >
        {priorities.at_risk_projects.map((p) => (
          <AtRiskProjectRow key={p.id} project={p} />
        ))}
      </PriorityCard>
    </div>
  );
}

type PriorityCardProps = {
  title: string;
  icon: LucideIcon;
  tone: "rose" | "amber" | "indigo";
  emptyMessage: string;
  count: number;
  children: React.ReactNode;
};

const TONE_ICON: Record<PriorityCardProps["tone"], string> = {
  rose: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-600 dark:text-amber-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
};

function PriorityCard({
  title,
  icon: Icon,
  tone,
  emptyMessage,
  count,
  children,
}: PriorityCardProps) {
  return (
    <Card data-slot="dashboard-priority-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("size-4", TONE_ICON[tone])} aria-hidden />
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {count}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">{children}</ul>
        )}
      </CardContent>
    </Card>
  );
}

function OverdueTaskRow({ task }: { task: DashboardOverdueTask }) {
  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <Link
        href={`/projects/${task.project.id}`}
        className="flex items-start justify-between gap-3 rounded-sm hover:bg-muted/50"
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">
            {task.title}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {task.project.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              TASK_PRIORITY_VARIANTS[task.priority],
            )}
          >
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
          {task.due_date ? (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatShortDate(task.due_date)}
            </span>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

function UpcomingMilestoneRow({
  milestone,
}: {
  milestone: DashboardUpcomingMilestone;
}) {
  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <Link
        href={`/projects/${milestone.project.id}`}
        className="flex items-start justify-between gap-3 rounded-sm hover:bg-muted/50"
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">
            {milestone.title}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {milestone.project.name}
          </span>
        </div>
        {milestone.due_date ? (
          <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
            {formatRelativeOrAbsolute(milestone.due_date)}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function AtRiskProjectRow({ project }: { project: DashboardProjectSummary }) {
  const percent = clampPercent(project.progress.completion_rate);
  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <Link
        href={`/projects/${project.id}`}
        className="flex flex-col gap-1 rounded-sm hover:bg-muted/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">
              {project.name}
            </span>
            {project.client ? (
              <span className="truncate text-xs text-muted-foreground">
                {project.client.name}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              aria-hidden
              className={cn(
                "size-2 rounded-full",
                HEALTH_VARIANTS[project.health].dot,
              )}
            />
            <span
              className={cn(
                "text-[11px] font-medium",
                HEALTH_VARIANTS[project.health].text,
              )}
            >
              {HEALTH_LABELS[project.health]}
            </span>
          </div>
        </div>
        <ProgressBar
          value={percent}
          size="sm"
          tone={project.health === "critical" ? "rose" : "amber"}
        />
      </Link>
    </li>
  );
}

function formatRelativeOrAbsolute(date: string): string {
  // Future dates like upcoming milestones — show as "in N days" if within
  // a week, otherwise the absolute short date.
  const target = new Date(`${date}T23:59:59`).getTime();
  const now = Date.now();
  if (!Number.isFinite(target)) return formatShortDate(date);
  const diff = target - now;
  if (diff < 0) return formatShortDate(date);
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 7) return `in ${days} days`;
  return formatShortDate(date);
}
