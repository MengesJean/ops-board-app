import { apiFetch } from "@/lib/api/client";
import type {
  ApiResource,
  CreateProjectPayload,
  PaginatedResource,
  Project,
  ProjectFilters,
  UpdateProjectPayload,
} from "@/types/api";

type ServerOptions = { cookie?: string };

function buildQueryString(filters: ProjectFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.client_id) params.set("client_id", String(filters.client_id));
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.health) params.set("health", filters.health);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.direction) params.set("direction", filters.direction);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.per_page) params.set("per_page", String(filters.per_page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function fetchProjects(
  filters: ProjectFilters = {},
  options: ServerOptions = {},
): Promise<PaginatedResource<Project>> {
  return apiFetch<PaginatedResource<Project>>(
    `/api/projects${buildQueryString(filters)}`,
    { method: "GET", cookie: options.cookie },
  );
}

export function fetchProject(
  id: number,
  options: ServerOptions = {},
): Promise<ApiResource<Project>> {
  return apiFetch<ApiResource<Project>>(`/api/projects/${id}`, {
    method: "GET",
    cookie: options.cookie,
  });
}

export function createProject(
  payload: CreateProjectPayload,
): Promise<ApiResource<Project>> {
  return apiFetch<ApiResource<Project>>("/api/projects", {
    method: "POST",
    body: payload,
  });
}

export function updateProject(
  id: number,
  payload: UpdateProjectPayload,
): Promise<ApiResource<Project>> {
  return apiFetch<ApiResource<Project>>(`/api/projects/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteProject(id: number): Promise<null> {
  return apiFetch<null>(`/api/projects/${id}`, { method: "DELETE" });
}
