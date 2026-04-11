"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ClientFormSheet } from "@/components/clients/client-form-sheet";
import { ClientsEmptyState } from "@/components/clients/clients-empty-state";
import { ClientsPagination } from "@/components/clients/clients-pagination";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientsToolbar } from "@/components/clients/clients-toolbar";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import type { Client, ClientStatus, PaginatedResource } from "@/types/api";

type ClientsPageShellProps = {
  page: PaginatedResource<Client>;
  filters: {
    search: string;
    status: ClientStatus | null;
    page: number;
  };
};

type SheetState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; client: Client };

export function ClientsPageShell({ page, filters }: ClientsPageShellProps) {
  const router = useRouter();
  const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const hasFilters = Boolean(filters.search) || filters.status !== null;
  const isEmpty = page.data.length === 0;

  const openCreate = () => setSheet({ mode: "create" });
  const openEdit = (client: Client) => setSheet({ mode: "edit", client });
  const closeSheet = () => setSheet({ mode: "closed" });

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) closeSheet();
  };

  const handleSuccess = (client: Client) => {
    const wasEdit = sheet.mode === "edit";
    closeSheet();
    toast.success(wasEdit ? "Client updated" : "Client created", {
      description: client.name,
    });
    router.refresh();
  };

  const handleDeleted = (client: Client) => {
    setClientToDelete(null);
    toast.success("Client deleted", { description: client.name });
    router.refresh();
  };

  const initialClient = sheet.mode === "edit" ? sheet.client : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Clients
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage the businesses you work with.
        </p>
      </div>

      <ClientsToolbar
        search={filters.search}
        status={filters.status}
        onAdd={openCreate}
      />

      {isEmpty ? (
        <ClientsEmptyState onAdd={openCreate} filtered={hasFilters} />
      ) : (
        <div className="flex flex-col gap-4">
          <ClientsTable
            clients={page.data}
            onEdit={openEdit}
            onDelete={setClientToDelete}
          />
          <ClientsPagination meta={page.meta} />
        </div>
      )}

      <ClientFormSheet
        open={sheet.mode !== "closed"}
        onOpenChange={handleSheetOpenChange}
        initialClient={initialClient}
        onSuccess={handleSuccess}
      />

      <DeleteClientDialog
        client={clientToDelete}
        onOpenChange={(open) => {
          if (!open) setClientToDelete(null);
        }}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
