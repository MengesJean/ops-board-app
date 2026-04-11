import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  HEALTH_LABELS,
  HEALTH_VARIANTS,
  STATUS_LABELS,
  STATUS_VARIANTS,
} from "@/lib/projects/formatters";
import {
  clampPercent,
  formatShortDate,
} from "@/lib/projects/progress-formatters";
import { cn } from "@/lib/utils";
import type { DashboardProjectSummary } from "@/types/api";

type Props = {
  projects: readonly DashboardProjectSummary[];
};

export function DashboardProjects({ projects }: Props) {
  return (
    <Card data-slot="dashboard-projects">
      <CardHeader>
        <CardTitle>Projects to watch</CardTitle>
        <CardDescription>
          Active projects ordered by upcoming deadline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No projects to display yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectRow({ project }: { project: DashboardProjectSummary }) {
  const percent = clampPercent(project.progress.completion_rate);

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <Link
        href={`/projects/${project.id}`}
        className="flex flex-col gap-2 rounded-sm hover:bg-muted/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">
              {project.name}
            </span>
            {project.client ? (
              <span className="truncate text-xs text-muted-foreground">
                {project.client.name}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px]", STATUS_VARIANTS[project.status])}
            >
              {STATUS_LABELS[project.status]}
            </Badge>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full",
                  HEALTH_VARIANTS[project.health].dot,
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  HEALTH_VARIANTS[project.health].text,
                )}
              >
                {HEALTH_LABELS[project.health]}
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar
            value={percent}
            size="sm"
            tone={
              project.health === "critical"
                ? "rose"
                : project.health === "warning"
                  ? "amber"
                  : "emerald"
            }
            className="flex-1"
          />
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {percent}%
          </span>
          {project.due_date ? (
            <span
              className={cn(
                "shrink-0 text-[11px] tabular-nums",
                project.is_overdue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground",
              )}
            >
              {formatShortDate(project.due_date)}
            </span>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
