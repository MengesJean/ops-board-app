import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, PRIORITY_VARIANTS } from "@/lib/projects/formatters";
import type { ProjectPriority } from "@/types/api";

type ProjectPriorityBadgeProps = {
  priority: ProjectPriority;
  className?: string;
};

export function ProjectPriorityBadge({
  priority,
  className,
}: ProjectPriorityBadgeProps) {
  return (
    <span
      data-slot="project-priority-badge"
      data-priority={priority}
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        PRIORITY_VARIANTS[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
