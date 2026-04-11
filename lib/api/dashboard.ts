import { apiFetch } from "@/lib/api/client";
import type { ApiResource, DashboardPayload } from "@/types/api";

type ServerOptions = { cookie?: string };

export function fetchDashboard(
  options: ServerOptions = {},
): Promise<ApiResource<DashboardPayload>> {
  return apiFetch<ApiResource<DashboardPayload>>("/api/dashboard", {
    method: "GET",
    cookie: options.cookie,
  });
}
