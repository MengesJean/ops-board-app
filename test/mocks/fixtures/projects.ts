import type { PaginatedResource, Project } from "@/types/api";
import { mockClients } from "@/test/mocks/fixtures/clients";

export const mockProjects: Project[] = [
  {
    id: 101,
    client_id: mockClients[0].id,
    name: "Naval retrofit dashboard",
    reference: "PRJ-2026-001",
    description: "Operational dashboard for the retrofit program.",
    status: "active",
    priority: "high",
    health: "good",
    start_date: "2026-02-01",
    due_date: "2026-06-30",
    budget: "45000.00",
    notes: "Kickoff completed.",
    client: {
      id: mockClients[0].id,
      name: mockClients[0].name,
      company_name: mockClients[0].company_name,
    },
    created_at: "2026-02-01T09:00:00+00:00",
    updated_at: "2026-04-08T11:00:00+00:00",
  },
  {
    id: 102,
    client_id: mockClients[1].id,
    name: "Kernel telemetry",
    reference: "PRJ-2026-002",
    description: null,
    status: "planned",
    priority: "medium",
    health: "warning",
    start_date: "2026-05-01",
    due_date: "2026-09-15",
    budget: null,
    notes: null,
    client: {
      id: mockClients[1].id,
      name: mockClients[1].name,
      company_name: mockClients[1].company_name,
    },
    created_at: "2026-04-02T11:00:00+00:00",
    updated_at: "2026-04-02T11:00:00+00:00",
  },
  {
    id: 103,
    client_id: mockClients[2].id,
    name: "Apollo archive migration",
    reference: null,
    description: "Migrate the historical archives off the legacy NAS.",
    status: "on_hold",
    priority: "low",
    health: "critical",
    start_date: null,
    due_date: "2025-12-15",
    budget: "12000.00",
    notes: "Paused waiting on legal review.",
    client: {
      id: mockClients[2].id,
      name: mockClients[2].name,
      company_name: mockClients[2].company_name,
    },
    created_at: "2025-11-01T08:00:00+00:00",
    updated_at: "2026-01-20T12:00:00+00:00",
  },
];

export function paginateProjects(
  projects: Project[],
  page: number,
  perPage: number,
): PaginatedResource<Project> {
  const total = projects.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * perPage;
  const data = projects.slice(start, start + perPage);
  return {
    data,
    links: {
      first: `/api/projects?page=1`,
      last: `/api/projects?page=${lastPage}`,
      prev: currentPage > 1 ? `/api/projects?page=${currentPage - 1}` : null,
      next:
        currentPage < lastPage
          ? `/api/projects?page=${currentPage + 1}`
          : null,
    },
    meta: {
      current_page: currentPage,
      from: total === 0 ? null : start + 1,
      last_page: lastPage,
      per_page: perPage,
      to: total === 0 ? null : start + data.length,
      total,
      path: "/api/projects",
    },
  };
}
