"use client";

import { FolderKanban, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ProjectsEmptyStateProps = {
  filtered?: boolean;
};

export function ProjectsEmptyState({
  filtered = false,
}: ProjectsEmptyStateProps) {
  if (filtered) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/40 px-6 py-16 text-center">
        <FolderKanban className="size-6 text-muted-foreground" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="font-medium">No projects match these filters</p>
          <p className="text-sm text-muted-foreground">
            Try clearing the search or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/40 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FolderKanban className="size-6" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-base font-medium">No projects yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Track work for your clients by creating your first project.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/projects/new" />}>
        <Plus />
        Create your first project
      </Button>
    </div>
  );
}
