"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProject } from "@/lib/api/projects";
import { isValidationError } from "@/lib/api/errors";
import type { Project } from "@/types/api";

type DeleteProjectDialogProps = {
  project: Project | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (project: Project) => void;
};

export function DeleteProjectDialog({
  project,
  onOpenChange,
  onDeleted,
}: DeleteProjectDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = project !== null;

  const onConfirm = async () => {
    if (!project) return;
    setError(null);
    setIsPending(true);
    try {
      await deleteProject(project.id);
      onDeleted(project);
    } catch (err) {
      const message =
        err instanceof Error && !isValidationError(err)
          ? err.message
          : "Could not delete project. Please try again.";
      setError(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        onOpenChange(next);
        if (!next) setError(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            {project ? (
              <>
                <strong className="font-medium text-foreground">
                  {project.name}
                </strong>
                {project.reference ? ` · ${project.reference}` : ""} will be
                permanently deleted. This action cannot be undone.
              </>
            ) : (
              "This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
