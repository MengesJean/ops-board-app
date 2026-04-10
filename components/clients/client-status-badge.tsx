import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/types/api";

const STATUS_LABEL: Record<ClientStatus, string> = {
  lead: "Lead",
  active: "Active",
  inactive: "Inactive",
};

const STATUS_CLASS: Record<ClientStatus, string> = {
  lead: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  active:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  inactive: "border-border bg-muted text-muted-foreground",
};

type ClientStatusBadgeProps = {
  status: ClientStatus;
  className?: string;
};

export function ClientStatusBadge({
  status,
  className,
}: ClientStatusBadgeProps) {
  return (
    <span
      data-slot="client-status-badge"
      data-status={status}
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        STATUS_CLASS[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
