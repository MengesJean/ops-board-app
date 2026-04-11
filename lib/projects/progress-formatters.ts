import type { ProjectProgress } from "@/types/api";

export function formatCompletionPercent(rate: number | null): string {
  if (rate === null || rate === undefined || Number.isNaN(rate)) return "—";
  const clamped = Math.max(0, Math.min(1, rate));
  return `${Math.round(clamped * 100)}%`;
}

export function clampPercent(rate: number | null | undefined): number {
  if (rate === null || rate === undefined || Number.isNaN(rate)) return 0;
  return Math.round(Math.max(0, Math.min(1, rate)) * 100);
}

export function formatRemainingTasks(progress: ProjectProgress): number {
  return Math.max(0, progress.total_tasks - progress.completed_tasks);
}

export type ProgressKpiKey =
  | "total"
  | "completed"
  | "in_progress"
  | "todo"
  | "remaining"
  | "overdue";

export const PROGRESS_KPI_LABELS: Record<ProgressKpiKey, string> = {
  total: "Total tasks",
  completed: "Completed",
  in_progress: "In progress",
  todo: "To do",
  remaining: "Remaining",
  overdue: "Overdue",
};

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
