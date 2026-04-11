import { cn } from "@/lib/utils";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_VARIANTS,
} from "@/lib/tasks/formatters";
import type { TaskStatus } from "@/types/api";

type TaskStatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  return (
    <span
      data-slot="task-status-badge"
      data-status={status}
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        TASK_STATUS_VARIANTS[status],
        className,
      )}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
