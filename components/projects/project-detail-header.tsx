"use client";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { ProjectHealthIndicator } from "@/components/projects/project-health-indicator";
import { ProjectPriorityBadge } from "@/components/projects/project-priority-badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/api";

type ProjectDetailHeaderProps = {
  project: Project;
};

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const handleDeleted = (deleted: Project) => {
    toast.success("Project deleted", { description: deleted.name });
    router.push("/projects");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to projects
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {project.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {project.reference && (
                <span className="font-mono">{project.reference}</span>
              )}
              {project.reference && project.client ? " · " : ""}
              {project.client && (
                <>
                  for{" "}
                  <span className="font-medium text-foreground">
                    {project.client.company_name || project.client.name}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <ProjectPriorityBadge priority={project.priority} />
            <ProjectHealthIndicator health={project.health} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/projects/${project.id}/edit`} />}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setPendingDelete(project)}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <DeleteProjectDialog
        project={pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
