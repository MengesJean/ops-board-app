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
import { deleteClient } from "@/lib/api/clients";
import { isValidationError } from "@/lib/api/errors";
import type { Client } from "@/types/api";

type DeleteClientDialogProps = {
  client: Client | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (client: Client) => void;
};

export function DeleteClientDialog({
  client,
  onOpenChange,
  onDeleted,
}: DeleteClientDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = client !== null;

  const onConfirm = async () => {
    if (!client) return;
    setError(null);
    setIsPending(true);
    try {
      await deleteClient(client.id);
      onDeleted(client);
    } catch (err) {
      const message =
        err instanceof Error && !isValidationError(err)
          ? err.message
          : "Could not delete client. Please try again.";
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
          <AlertDialogTitle>Delete this client?</AlertDialogTitle>
          <AlertDialogDescription>
            {client ? (
              <>
                <strong className="font-medium text-foreground">
                  {client.name}
                </strong>
                {client.company_name ? ` · ${client.company_name}` : ""} will be
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
            Delete client
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
