import { apiFetch } from "@/lib/api/client";
import type {
  ApiResource,
  Client,
  ClientFilters,
  CreateClientPayload,
  PaginatedResource,
  UpdateClientPayload,
} from "@/types/api";

type ServerOptions = { cookie?: string };

function buildQueryString(filters: ClientFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.per_page) params.set("per_page", String(filters.per_page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function fetchClients(
  filters: ClientFilters = {},
  options: ServerOptions = {},
): Promise<PaginatedResource<Client>> {
  return apiFetch<PaginatedResource<Client>>(
    `/api/clients${buildQueryString(filters)}`,
    { method: "GET", cookie: options.cookie },
  );
}

export function fetchClient(
  id: number,
  options: ServerOptions = {},
): Promise<ApiResource<Client>> {
  return apiFetch<ApiResource<Client>>(`/api/clients/${id}`, {
    method: "GET",
    cookie: options.cookie,
  });
}

export function createClient(
  payload: CreateClientPayload,
): Promise<ApiResource<Client>> {
  return apiFetch<ApiResource<Client>>("/api/clients", {
    method: "POST",
    body: payload,
  });
}

export function updateClient(
  id: number,
  payload: UpdateClientPayload,
): Promise<ApiResource<Client>> {
  return apiFetch<ApiResource<Client>>(`/api/clients/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteClient(id: number): Promise<null> {
  return apiFetch<null>(`/api/clients/${id}`, { method: "DELETE" });
}
