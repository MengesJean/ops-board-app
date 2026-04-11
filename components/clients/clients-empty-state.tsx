"use client";

import { UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

type ClientsEmptyStateProps = {
  onAdd: () => void;
  filtered?: boolean;
};

export function ClientsEmptyState({
  onAdd,
  filtered = false,
}: ClientsEmptyStateProps) {
  if (filtered) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/40 px-6 py-16 text-center">
        <Users className="size-6 text-muted-foreground" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="font-medium">No clients match these filters</p>
          <p className="text-sm text-muted-foreground">
            Try clearing the search or status filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/40 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Users className="size-6" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-base font-medium">No clients yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add your first business client to start tracking projects and
          interventions.
        </p>
      </div>
      <Button onClick={onAdd}>
        <UserPlus />
        Add your first client
      </Button>
    </div>
  );
}
