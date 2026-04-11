import type {
  Project,
  ProjectHealth,
  ProjectPriority,
  ProjectStatus,
} from "@/types/api";

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  planned: "Planned",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const HEALTH_LABELS: Record<ProjectHealth, string> = {
  good: "On track",
  warning: "At risk",
  critical: "Critical",
};

export const STATUS_VARIANTS: Record<ProjectStatus, string> = {
  draft: "border-border bg-muted text-muted-foreground",
  planned: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  active:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  on_hold:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  completed:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  cancelled:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export const PRIORITY_VARIANTS: Record<ProjectPriority, string> = {
  low: "border-border bg-muted text-muted-foreground",
  medium:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  high: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export const HEALTH_VARIANTS: Record<
  ProjectHealth,
  { dot: string; text: string }
> = {
  good: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
  critical: {
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
  },
};

export function formatBudget(
  value: string | null | undefined,
  options: { currency?: string; locale?: string } = {},
): string {
  if (value === null || value === undefined || value === "") return "—";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "—";
  const { currency = "EUR", locale = "fr-FR" } = options;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(parsed);
  } catch {
    return `${parsed.toFixed(2)} ${currency}`;
  }
}

const TERMINAL_STATUSES: ReadonlySet<ProjectStatus> = new Set([
  "completed",
  "cancelled",
]);

export function isOverdue(project: Pick<Project, "due_date" | "status">): boolean {
  if (!project.due_date) return false;
  if (TERMINAL_STATUSES.has(project.status)) return false;
  const due = new Date(`${project.due_date}T23:59:59`);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}
