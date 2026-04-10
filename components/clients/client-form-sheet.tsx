"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClientForm } from "@/components/clients/client-form";
import type { Client } from "@/types/api";

type ClientFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClient?: Client | null;
  onSuccess: (client: Client) => void;
};

export function ClientFormSheet({
  open,
  onOpenChange,
  initialClient,
  onSuccess,
}: ClientFormSheetProps) {
  const isEdit = Boolean(initialClient);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>{isEdit ? "Edit client" : "New client"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the client information and save your changes."
              : "Add a new business client to your workspace."}
          </SheetDescription>
        </SheetHeader>
        <ClientForm
          initialClient={initialClient}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
