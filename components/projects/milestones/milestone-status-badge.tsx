import { cn } from "@/lib/utils";
import {
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_VARIANTS,
} from "@/lib/milestones/formatters";
import type { MilestoneStatus } from "@/types/api";

type MilestoneStatusBadgeProps = {
  status: MilestoneStatus;
  className?: string;
};

export function MilestoneStatusBadge({
  status,
  className,
}: MilestoneStatusBadgeProps) {
  return (
    <span
      data-slot="milestone-status-badge"
      data-status={status}
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        MILESTONE_STATUS_VARIANTS[status],
        className,
      )}
    >
      {MILESTONE_STATUS_LABELS[status]}
    </span>
  );
}
