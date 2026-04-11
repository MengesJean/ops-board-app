"use client";

import Link from "next/link";

import { FormattedDate } from "@/components/clients/formatted-date";
import { ProjectHealthIndicator } from "@/components/projects/project-health-indicator";
import { ProjectPriorityBadge } from "@/components/projects/project-priority-badge";
import { ProjectRowActions } from "@/components/projects/project-row-actions";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "@/types/api";

type ProjectsTableProps = {
  projects: Project[];
  onDelete: (project: Project) => void;
};

const EMPTY = "—";

export function ProjectsTable({ projects, onDelete }: ProjectsTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-10" aria-label="Actions" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/projects/${project.id}`}
                  className="hover:underline"
                >
                  {project.name}
                </Link>
                {project.reference && (
                  <div className="text-xs text-muted-foreground">
                    {project.reference}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.client?.company_name ||
                  project.client?.name ||
                  EMPTY}
              </TableCell>
              <TableCell>
                <ProjectStatusBadge status={project.status} />
              </TableCell>
              <TableCell>
                <ProjectPriorityBadge priority={project.priority} />
              </TableCell>
              <TableCell>
                <ProjectHealthIndicator health={project.health} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.due_date ? (
                  <FormattedDate iso={project.due_date} />
                ) : (
                  EMPTY
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <FormattedDate iso={project.updated_at} />
              </TableCell>
              <TableCell className="text-right">
                <ProjectRowActions
                  project={project}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
