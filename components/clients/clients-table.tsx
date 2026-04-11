"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientRowActions } from "@/components/clients/client-row-actions";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { FormattedDate } from "@/components/clients/formatted-date";
import type { Client } from "@/types/api";

type ClientsTableProps = {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
};

const EMPTY = "—";

export function ClientsTable({
  clients,
  onEdit,
  onDelete,
}: ClientsTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-10" aria-label="Actions" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {client.company_name || EMPTY}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {client.email || EMPTY}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {client.phone || EMPTY}
              </TableCell>
              <TableCell>
                <ClientStatusBadge status={client.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                <FormattedDate iso={client.created_at} />
              </TableCell>
              <TableCell className="text-right">
                <ClientRowActions
                  client={client}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
