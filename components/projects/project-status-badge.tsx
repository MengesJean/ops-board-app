import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_VARIANTS } from "@/lib/projects/formatters";
import type { ProjectStatus } from "@/types/api";

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
  className?: string;
};

export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  return (
    <span
      data-slot="project-status-badge"
      data-status={status}
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        STATUS_VARIANTS[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
