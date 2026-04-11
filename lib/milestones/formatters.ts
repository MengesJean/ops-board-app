import type { Milestone, MilestoneStatus } from "@/types/api";

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

export const MILESTONE_STATUS_VARIANTS: Record<MilestoneStatus, string> = {
  pending: "border-border bg-muted text-muted-foreground",
  in_progress:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  done:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export const MILESTONE_STATUS_DOTS: Record<MilestoneStatus, string> = {
  pending: "bg-muted-foreground/40",
  in_progress: "bg-sky-500",
  done: "bg-emerald-500",
};

export function isMilestoneOverdue(
  milestone: Pick<Milestone, "due_date" | "status">,
): boolean {
  if (!milestone.due_date) return false;
  if (milestone.status === "done") return false;
  const due = new Date(`${milestone.due_date}T23:59:59`);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function sortMilestonesByPosition(
  milestones: readonly Milestone[],
): Milestone[] {
  return [...milestones].sort((a, b) => a.position - b.position);
}
