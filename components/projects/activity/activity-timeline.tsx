import {
  ACTIVITY_ICONS,
  ACTIVITY_TONES,
  formatAbsoluteDateTime,
  formatRelativeTime,
  humanizeActivityEvent,
} from "@/lib/activity/formatters";
import { cn } from "@/lib/utils";
import type { ActivityLogEntry } from "@/types/api";

type Props = {
  entries: readonly ActivityLogEntry[];
  showProject?: boolean;
  projectNames?: Record<number, string>;
  className?: string;
};

export function ActivityTimeline({
  entries,
  showProject,
  projectNames,
  className,
}: Props) {
  return (
    <ol
      data-slot="activity-timeline"
      className={cn("relative flex flex-col", className)}
    >
      {entries.map((entry, idx) => {
        const humanized = humanizeActivityEvent(entry);
        const Icon = ACTIVITY_ICONS[humanized.icon];
        const isLast = idx === entries.length - 1;
        const projectName =
          showProject && projectNames
            ? projectNames[entry.project_id]
            : undefined;

        return (
          <li
            key={entry.id}
            data-slot="activity-item"
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {!isLast ? (
              <span
                aria-hidden
                className="absolute top-7 left-3 h-[calc(100%-1rem)] w-px bg-border"
              />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card",
                ACTIVITY_TONES[humanized.icon],
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">
                {humanized.title}
              </p>
              {humanized.detail ? (
                <p className="text-xs text-muted-foreground">
                  {humanized.detail}
                </p>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                {entry.actor ? (
                  <>
                    <span className="font-medium text-foreground/80">
                      {entry.actor.name}
                    </span>
                    <span aria-hidden> · </span>
                  </>
                ) : null}
                <time
                  dateTime={entry.created_at}
                  title={formatAbsoluteDateTime(entry.created_at)}
                >
                  {formatRelativeTime(entry.created_at)}
                </time>
                {projectName ? (
                  <>
                    <span aria-hidden> · </span>
                    <span>{projectName}</span>
                  </>
                ) : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
