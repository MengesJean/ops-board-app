import { AlertTriangle, CalendarClock, Flag } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MilestoneProgressRow } from "@/components/projects/progress/milestone-progress-row";
import {
  PROGRESS_KPI_LABELS,
  clampPercent,
  formatRemainingTasks,
  formatShortDate,
} from "@/lib/projects/progress-formatters";
import { cn } from "@/lib/utils";
import type { ProjectProgress, ProjectProgressDetail } from "@/types/api";

type Props = {
  progress: ProjectProgress | null;
  progressDetail: ProjectProgressDetail | null;
  error?: boolean;
};

export function ProjectProgressSection({
  progress,
  progressDetail,
  error,
}: Props) {
  if (error) {
    return (
      <Card data-slot="project-progress-section">
        <CardHeader>
          <CardTitle>Project progression</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="size-4" aria-hidden />
            <AlertTitle>Couldn&apos;t load progression</AlertTitle>
            <AlertDescription>
              The progression data couldn&apos;t be fetched. Refresh to try
              again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const isEmpty = !progress.has_tasks && progress.total_milestones === 0;

  if (isEmpty) {
    return (
      <Card data-slot="project-progress-section">
        <CardHeader>
          <CardTitle>Project progression</CardTitle>
          <CardDescription>
            Track how this project is moving forward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No tasks or milestones yet — add one to start tracking progress.
          </div>
        </CardContent>
      </Card>
    );
  }

  const percent = clampPercent(progress.completion_rate);
  const remaining = formatRemainingTasks(progress);
  const milestones = progressDetail?.milestones ?? [];

  return (
    <Card data-slot="project-progress-section">
      <CardHeader>
        <CardTitle>Project progression</CardTitle>
        <CardDescription>
          Where the project stands across tasks and milestones.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* LEFT — global progress */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Overall completion
              </span>
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {percent}%
              </span>
            </div>
            <ProgressBar
              value={percent}
              size="md"
              tone="emerald"
              label={`${percent}% of tasks done`}
            />
            <p className="text-xs text-muted-foreground">
              {progress.completed_tasks}/{progress.total_tasks} tasks done
              {progress.total_milestones > 0
                ? ` · ${progress.completed_milestones}/${progress.total_milestones} milestones`
                : ""}
            </p>
          </div>

          {/* RIGHT — KPI grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KpiTile
              label={PROGRESS_KPI_LABELS.total}
              value={progress.total_tasks}
            />
            <KpiTile
              label={PROGRESS_KPI_LABELS.completed}
              value={progress.completed_tasks}
              tone="emerald"
            />
            <KpiTile
              label={PROGRESS_KPI_LABELS.in_progress}
              value={progress.in_progress_tasks}
              tone="sky"
            />
            <KpiTile
              label={PROGRESS_KPI_LABELS.todo}
              value={progress.todo_tasks}
            />
            <KpiTile
              label={PROGRESS_KPI_LABELS.remaining}
              value={remaining}
            />
            {progress.overdue_tasks > 0 ? (
              <KpiTile
                label={PROGRESS_KPI_LABELS.overdue}
                value={progress.overdue_tasks}
                tone="rose"
              />
            ) : null}
          </div>
        </div>

        {/* Auxiliary indicators */}
        {(progress.next_due_task ||
          progress.next_due_milestone ||
          progress.is_overdue) && (
          <div className="flex flex-col gap-3">
            {progress.is_overdue ? (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" aria-hidden />
                <AlertTitle>Project is overdue</AlertTitle>
                <AlertDescription>
                  This project has passed its due date and isn&apos;t finished
                  yet.
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              {progress.next_due_task ? (
                <NextDueLine
                  icon={<CalendarClock className="size-3.5" aria-hidden />}
                  label="Next due task"
                  title={progress.next_due_task.title}
                  date={progress.next_due_task.due_date}
                />
              ) : null}
              {progress.next_due_milestone ? (
                <NextDueLine
                  icon={<Flag className="size-3.5" aria-hidden />}
                  label="Next milestone"
                  title={progress.next_due_milestone.title}
                  date={progress.next_due_milestone.due_date}
                />
              ) : null}
            </div>
          </div>
        )}

        {/* Milestones breakdown */}
        {milestones.length > 0 ? (
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Milestones progress
            </h3>
            <ul className="divide-y divide-border">
              {milestones.map((m) => (
                <MilestoneProgressRow key={m.id} milestone={m} />
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

type KpiTileProps = {
  label: string;
  value: number;
  tone?: "default" | "emerald" | "sky" | "rose";
};

const TONE_CLASSES: Record<NonNullable<KpiTileProps["tone"]>, string> = {
  default: "border-border",
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  sky: "border-sky-500/30 bg-sky-500/5",
  rose: "border-rose-500/30 bg-rose-500/5",
};

function KpiTile({ label, value, tone = "default" }: KpiTileProps) {
  return (
    <div
      data-slot="progress-kpi-tile"
      className={cn(
        "flex flex-col gap-0.5 rounded-md border bg-card px-3 py-2",
        TONE_CLASSES[tone],
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

function NextDueLine({
  icon,
  label,
  title,
  date,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-muted-foreground">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-medium text-foreground">{label}:</span>
      <span className="truncate text-foreground">{title}</span>
      <span aria-hidden>·</span>
      <span>{formatShortDate(date)}</span>
    </div>
  );
}
