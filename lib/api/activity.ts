import { apiFetch } from "@/lib/api/client";
import type {
  ActivityFilters,
  ActivityLogEntry,
  PaginatedResource,
} from "@/types/api";

type ServerOptions = { cookie?: string };

function buildQueryString(filters: ActivityFilters): string {
  const params = new URLSearchParams();
  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }
  if (filters.per_page) {
    params.set("per_page", String(filters.per_page));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function fetchProjectActivity(
  projectId: number,
  filters: ActivityFilters = {},
  options: ServerOptions = {},
): Promise<PaginatedResource<ActivityLogEntry>> {
  return apiFetch<PaginatedResource<ActivityLogEntry>>(
    `/api/projects/${projectId}/activity${buildQueryString(filters)}`,
    { method: "GET", cookie: options.cookie },
  );
}
