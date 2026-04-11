import type { Task, TaskPriority, TaskStatus } from "@/types/api";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TASK_STATUS_VARIANTS: Record<TaskStatus, string> = {
  todo: "border-border bg-muted text-muted-foreground",
  in_progress:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  done:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export const TASK_STATUS_DOTS: Record<TaskStatus, string> = {
  todo: "bg-muted-foreground/40",
  in_progress: "bg-sky-500",
  done: "bg-emerald-500",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TASK_PRIORITY_VARIANTS: Record<TaskPriority, string> = {
  low: "border-border bg-muted text-muted-foreground",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  high:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export const TASK_PRIORITY_DOTS: Record<TaskPriority, string> = {
  low: "bg-muted-foreground/40",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};

export function isTaskOverdue(
  task: Pick<Task, "due_date" | "status">,
): boolean {
  if (!task.due_date) return false;
  if (task.status === "done") return false;
  const due = new Date(`${task.due_date}T23:59:59`);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function sortTasksByPosition(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => a.position - b.position);
}
