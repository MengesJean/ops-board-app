import { cn } from "@/lib/utils";
import {
  TASK_PRIORITY_DOTS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_VARIANTS,
} from "@/lib/tasks/formatters";
import type { TaskPriority } from "@/types/api";

type TaskPriorityPillProps = {
  priority: TaskPriority;
  className?: string;
};

export function TaskPriorityPill({
  priority,
  className,
}: TaskPriorityPillProps) {
  return (
    <span
      data-slot="task-priority-pill"
      data-priority={priority}
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-2 text-xs font-medium",
        TASK_PRIORITY_VARIANTS[priority],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", TASK_PRIORITY_DOTS[priority])}
      />
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}
