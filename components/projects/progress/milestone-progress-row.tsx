import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import {
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_VARIANTS,
} from "@/lib/milestones/formatters";
import {
  clampPercent,
  formatCompletionPercent,
  formatShortDate,
} from "@/lib/projects/progress-formatters";
import { cn } from "@/lib/utils";
import type { MilestoneProgress } from "@/types/api";

type Props = {
  milestone: MilestoneProgress;
};

export function MilestoneProgressRow({ milestone }: Props) {
  const isEmpty = milestone.completion_rate === null;
  const percent = clampPercent(milestone.completion_rate);
  const tone = milestone.status === "done" ? "emerald" : "sky";

  return (
    <li
      data-slot="milestone-progress-row"
      className="flex flex-col gap-1.5 py-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {milestone.title}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-[10px] uppercase tracking-wide",
              MILESTONE_STATUS_VARIANTS[milestone.status],
            )}
          >
            {MILESTONE_STATUS_LABELS[milestone.status]}
          </Badge>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          {isEmpty ? (
            <span>No tasks yet</span>
          ) : (
            <span className="font-medium text-foreground">
              {milestone.completed_tasks}/{milestone.total_tasks}
            </span>
          )}
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <span>{formatCompletionPercent(milestone.completion_rate)}</span>
        </div>
      </div>
      <ProgressBar
        value={isEmpty ? 0 : percent}
        size="sm"
        tone={tone}
        label={`${milestone.title}: ${formatCompletionPercent(milestone.completion_rate)}`}
      />
      {milestone.due_date ? (
        <p className="text-[11px] text-muted-foreground">
          Due {formatShortDate(milestone.due_date)}
        </p>
      ) : null}
    </li>
  );
}
