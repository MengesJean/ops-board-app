import { ClientsPageShell } from "@/components/clients/clients-page-shell";
import { AppHeader } from "@/components/layout/app-header";
import { fetchClients } from "@/lib/api/clients";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import { requireAuth } from "@/lib/auth/guards";
import { CLIENT_STATUSES, type ClientStatus } from "@/types/api";

export const metadata = {
  title: "Clients · OpsBoard",
};

function parseStatus(value: string | string[] | undefined): ClientStatus | null {
  if (typeof value !== "string") return null;
  return (CLIENT_STATUSES as readonly string[]).includes(value)
    ? (value as ClientStatus)
    : null;
}

function parsePage(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? Number(value) : 1;
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}

function parseSearch(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "";
  return value.slice(0, 200);
}

export default async function ClientsPage(props: PageProps<"/clients">) {
  await requireAuth();
  const sp = await props.searchParams;

  const filters = {
    search: parseSearch(sp.search),
    status: parseStatus(sp.status),
    page: parsePage(sp.page),
  };

  const cookie = await buildForwardedCookieHeader();
  const result = await fetchClients(
    {
      search: filters.search || undefined,
      status: filters.status ?? undefined,
      page: filters.page,
    },
    { cookie },
  );

  return (
    <>
      <AppHeader title="Clients" />
      <ClientsPageShell page={result} filters={filters} />
    </>
  );
}
