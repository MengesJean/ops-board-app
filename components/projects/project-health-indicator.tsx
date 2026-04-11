import { cn } from "@/lib/utils";
import { HEALTH_LABELS, HEALTH_VARIANTS } from "@/lib/projects/formatters";
import type { ProjectHealth } from "@/types/api";

type ProjectHealthIndicatorProps = {
  health: ProjectHealth;
  className?: string;
};

export function ProjectHealthIndicator({
  health,
  className,
}: ProjectHealthIndicatorProps) {
  const variant = HEALTH_VARIANTS[health];
  return (
    <span
      data-slot="project-health-indicator"
      data-health={health}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        variant.text,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-2 rounded-full", variant.dot)}
      />
      {HEALTH_LABELS[health]}
    </span>
  );
}
