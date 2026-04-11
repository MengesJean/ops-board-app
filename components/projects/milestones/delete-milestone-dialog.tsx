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
import { deleteProjectMilestone } from "@/lib/api/milestones";
import type { Milestone } from "@/types/api";

type DeleteMilestoneDialogProps = {
  projectId: number;
  milestone: Milestone | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (milestone: Milestone) => void;
};

export function DeleteMilestoneDialog({
  projectId,
  milestone,
  onOpenChange,
  onDeleted,
}: DeleteMilestoneDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = milestone !== null;

  const onConfirm = async () => {
    if (!milestone) return;
    setError(null);
    setIsPending(true);
    try {
      await deleteProjectMilestone(projectId, milestone.id);
      onDeleted(milestone);
    } catch (err) {
      const message =
        err instanceof Error && !isValidationError(err)
          ? err.message
          : "Could not delete milestone. Please try again.";
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
          <AlertDialogTitle>Delete this milestone?</AlertDialogTitle>
          <AlertDialogDescription>
            {milestone ? (
              <>
                <strong className="font-medium text-foreground">
                  {milestone.title}
                </strong>{" "}
                will be permanently removed from the roadmap. This action
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
            Delete milestone
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
