import type { ActivityLogEntry, PaginatedResource } from "@/types/api";

export const mockProjectActivity: ActivityLogEntry[] = [
  {
    id: 9001,
    event: "task.completed",
    subject: { type: "task", id: 903, label: "Set up the project repository" },
    project_id: 101,
    actor: { type: "customer", id: 1, name: "Ada Lovelace" },
    properties: { label: "Set up the project repository" },
    created_at: "2026-04-10T15:30:00+00:00",
  },
  {
    id: 9002,
    event: "task.status_changed",
    subject: { type: "task", id: 901, label: "Draft the technical brief" },
    project_id: 101,
    actor: { type: "customer", id: 1, name: "Ada Lovelace" },
    properties: {
      label: "Draft the technical brief",
      from: "todo",
      to: "in_progress",
    },
    created_at: "2026-04-09T11:00:00+00:00",
  },
  {
    id: 9003,
    event: "milestone.created",
    subject: { type: "milestone", id: 503, label: "Client UAT" },
    project_id: 101,
    actor: { type: "customer", id: 1, name: "Ada Lovelace" },
    properties: { label: "Client UAT" },
    created_at: "2026-04-05T09:15:00+00:00",
  },
  {
    id: 9004,
    event: "task.created",
    subject: { type: "task", id: 904, label: "Schedule client UAT kickoff" },
    project_id: 101,
    actor: { type: "customer", id: 1, name: "Ada Lovelace" },
    properties: { label: "Schedule client UAT kickoff" },
    created_at: "2026-04-05T09:10:00+00:00",
  },
  {
    id: 9005,
    event: "project.created",
    subject: { type: "project", id: 101, label: "Naval retrofit dashboard" },
    project_id: 101,
    actor: { type: "customer", id: 1, name: "Ada Lovelace" },
    properties: { label: "Naval retrofit dashboard" },
    created_at: "2026-02-01T09:00:00+00:00",
  },
];

export function paginateActivity(
  entries: ActivityLogEntry[],
  page: number,
  perPage: number,
): PaginatedResource<ActivityLogEntry> {
  const total = entries.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * perPage;
  const data = entries.slice(start, start + perPage);
  return {
    data,
    links: {
      first: `/api/projects/0/activity?page=1`,
      last: `/api/projects/0/activity?page=${lastPage}`,
      prev: currentPage > 1 ? `/api/projects/0/activity?page=${currentPage - 1}` : null,
      next:
        currentPage < lastPage
          ? `/api/projects/0/activity?page=${currentPage + 1}`
          : null,
    },
    meta: {
      current_page: currentPage,
      from: total === 0 ? null : start + 1,
      last_page: lastPage,
      per_page: perPage,
      to: total === 0 ? null : start + data.length,
      total,
      path: `/api/projects/0/activity`,
    },
  };
}
