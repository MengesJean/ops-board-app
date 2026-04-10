import type { Client, PaginatedResource } from "@/types/api";

export const mockClients: Client[] = [
  {
    id: 1,
    name: "Grace Hopper",
    company_name: "Naval Mechanics Ltd.",
    email: "grace@naval.example",
    phone: "+33 1 23 45 67 89",
    status: "active",
    notes: "Primary contact for retrofit contracts.",
    created_at: "2026-03-20T09:30:00+00:00",
    updated_at: "2026-04-05T14:10:00+00:00",
  },
  {
    id: 2,
    name: "Linus Torvalds",
    company_name: "Kernel & Co.",
    email: "linus@kernel.example",
    phone: null,
    status: "lead",
    notes: null,
    created_at: "2026-04-01T11:00:00+00:00",
    updated_at: "2026-04-01T11:00:00+00:00",
  },
  {
    id: 3,
    name: "Margaret Hamilton",
    company_name: null,
    email: "margaret@apollo.example",
    phone: "+1 555 010 0111",
    status: "inactive",
    notes: "Paused until next fiscal year.",
    created_at: "2025-12-10T08:00:00+00:00",
    updated_at: "2026-02-14T12:00:00+00:00",
  },
];

export function paginate(
  clients: Client[],
  page: number,
  perPage: number,
): PaginatedResource<Client> {
  const total = clients.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * perPage;
  const data = clients.slice(start, start + perPage);
  return {
    data,
    links: {
      first: `/api/clients?page=1`,
      last: `/api/clients?page=${lastPage}`,
      prev: currentPage > 1 ? `/api/clients?page=${currentPage - 1}` : null,
      next: currentPage < lastPage ? `/api/clients?page=${currentPage + 1}` : null,
    },
    meta: {
      current_page: currentPage,
      from: total === 0 ? null : start + 1,
      last_page: lastPage,
      per_page: perPage,
      to: total === 0 ? null : start + data.length,
      total,
      path: "/api/clients",
    },
  };
}
