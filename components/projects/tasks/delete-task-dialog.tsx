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
import { isValidationError } from "@/lib/api/errors";
import { deleteProjectTask } from "@/lib/api/tasks";
import type { Task } from "@/types/api";

type DeleteTaskDialogProps = {
  projectId: number;
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (task: Task) => void;
};

export function DeleteTaskDialog({
  projectId,
  task,
  onOpenChange,
  onDeleted,
}: DeleteTaskDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = task !== null;

  const onConfirm = async () => {
    if (!task) return;
    setError(null);
    setIsPending(true);
    try {
      await deleteProjectTask(projectId, task.id);
      onDeleted(task);
    } catch (err) {
      const message =
        err instanceof Error && !isValidationError(err)
          ? err.message
          : "Could not delete task. Please try again.";
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
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            {task ? (
              <>
                <strong className="font-medium text-foreground">
                  {task.title}
                </strong>{" "}
                will be permanently removed from this project. This action
                cannot be undone.
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
            Delete task
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
