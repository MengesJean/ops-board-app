import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import {
  TASK_STATUS_DOTS,
  TASK_STATUS_LABELS,
} from "@/lib/tasks/formatters";
import {
  computeProjectTaskProgress,
  countTasksByStatus,
} from "@/lib/tasks/progress";
import type { Task, TaskStatus } from "@/types/api";

type TaskProgressSummaryProps = {
  tasks: readonly Task[];
  className?: string;
};

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

export function TaskProgressSummary({
  tasks,
  className,
}: TaskProgressSummaryProps) {
  const counts = countTasksByStatus(tasks);
  const { done, total, ratio } = computeProjectTaskProgress(tasks);
  const percent = Math.round(ratio * 100);

  if (total === 0) {
    return null;
  }

  return (
    <div
      data-slot="task-progress-summary"
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {done}/{total} done
        </span>
        <span aria-hidden className="text-muted-foreground/50">
          ·
        </span>
        {STATUS_ORDER.map((status) => (
          <span key={status} className="inline-flex items-center gap-1">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", TASK_STATUS_DOTS[status])}
            />
            {counts[status]} {TASK_STATUS_LABELS[status].toLowerCase()}
          </span>
        ))}
      </div>
      <ProgressBar
        value={percent}
        size="md"
        tone="emerald"
        label={`${percent}% of tasks done`}
      />
    </div>
  );
}
