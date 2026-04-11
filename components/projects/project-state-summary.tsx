import { AlertTriangle } from "lucide-react";

import { FormattedDate } from "@/components/clients/formatted-date";
import { ProjectHealthIndicator } from "@/components/projects/project-health-indicator";
import { ProjectPriorityBadge } from "@/components/projects/project-priority-badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isOverdue } from "@/lib/projects/formatters";
import type { Project } from "@/types/api";

type ProjectStateSummaryProps = {
  project: Project;
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  );
}

export function ProjectStateSummary({ project }: ProjectStateSummaryProps) {
  const overdue = isOverdue(project);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project state</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Row label="Status">
          <ProjectStatusBadge status={project.status} />
        </Row>
        <Row label="Priority">
          <ProjectPriorityBadge priority={project.priority} />
        </Row>
        <Row label="Health">
          <ProjectHealthIndicator health={project.health} />
        </Row>
        <Row label="Due date">
          {project.due_date ? (
            <span className="text-sm font-medium">
              <FormattedDate iso={project.due_date} />
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </Row>
        {overdue && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300"
          >
            <AlertTriangle className="mt-0.5 size-4" aria-hidden />
            <span>
              This project is past its due date. Update the status or push the
              deadline.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
