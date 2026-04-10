import { apiFetch } from "@/lib/api/client";
import type {
  ApiResource,
  Customer,
  LoginPayload,
  RegisterPayload,
} from "@/types/api";

type ServerOptions = { cookie?: string };

export function registerCustomer(
  payload: RegisterPayload,
): Promise<ApiResource<Customer>> {
  return apiFetch<ApiResource<Customer>>("/api/register", {
    method: "POST",
    body: payload,
  });
}

export function loginCustomer(
  payload: LoginPayload,
): Promise<ApiResource<Customer>> {
  return apiFetch<ApiResource<Customer>>("/api/login", {
    method: "POST",
    body: payload,
  });
}

export function fetchCurrentCustomer(
  options: ServerOptions = {},
): Promise<ApiResource<Customer>> {
  return apiFetch<ApiResource<Customer>>("/api/me", {
    method: "GET",
    cookie: options.cookie,
  });
}

export function logoutCustomer(): Promise<null> {
  return apiFetch<null>("/api/logout", { method: "POST" });
}
