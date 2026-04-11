"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { ProjectsEmptyState } from "@/components/projects/projects-empty-state";
import { ProjectsPagination } from "@/components/projects/projects-pagination";
import { ProjectsTable } from "@/components/projects/projects-table";
import { ProjectsToolbar } from "@/components/projects/projects-toolbar";
import type {
  PaginatedResource,
  Project,
  ProjectHealth,
  ProjectPriority,
  ProjectStatus,
} from "@/types/api";

type ProjectsPageShellProps = {
  page: PaginatedResource<Project>;
  filters: {
    search: string;
    status: ProjectStatus | null;
    priority: ProjectPriority | null;
    health: ProjectHealth | null;
    page: number;
  };
};

export function ProjectsPageShell({ page, filters }: ProjectsPageShellProps) {
  const router = useRouter();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const hasFilters =
    Boolean(filters.search) ||
    filters.status !== null ||
    filters.priority !== null ||
    filters.health !== null;
  const isEmpty = page.data.length === 0;

  const handleDeleted = (project: Project) => {
    setProjectToDelete(null);
    toast.success("Project deleted", { description: project.name });
    router.refresh();
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Projects
        </h2>
        <p className="text-sm text-muted-foreground">
          Track work in progress across all your clients.
        </p>
      </div>

      <ProjectsToolbar
        search={filters.search}
        status={filters.status}
        priority={filters.priority}
        health={filters.health}
      />

      {isEmpty ? (
        <ProjectsEmptyState filtered={hasFilters} />
      ) : (
        <div className="flex flex-col gap-4">
          <ProjectsTable
            projects={page.data}
            onDelete={setProjectToDelete}
          />
          <ProjectsPagination meta={page.meta} />
        </div>
      )}

      <DeleteProjectDialog
        project={projectToDelete}
        onOpenChange={(open) => {
          if (!open) setProjectToDelete(null);
        }}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
