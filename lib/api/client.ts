import {
  ApiError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/api/errors";
import type { ValidationErrorBody } from "@/types/api";

// Browser-facing URL — used for client-side calls so the session cookie,
// CSRF cookie, and CORS origin all line up with what the user sees.
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
// Server-only URL used when Next calls the API from inside a container.
// Falls back to the public URL when running outside Docker.
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? PUBLIC_API_URL;
// Public origin of this front (used as Origin header on server-side calls so
// Sanctum's stateful domain check succeeds). Required in Docker.
const PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

function resolveBaseUrl(): string {
  const url = typeof window === "undefined" ? INTERNAL_API_URL : PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined — set it in .env.local (see .env.example).",
    );
  }
  return url;
}

export function getApiBaseUrl(): string {
  return resolveBaseUrl();
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: Method;
  body?: unknown;
  headers?: HeadersInit;
  // Forwarded cookies when calling from the server. Ignored in the browser.
  cookie?: string;
  signal?: AbortSignal;
};

const MUTATING_METHODS: readonly Method[] = ["POST", "PUT", "PATCH", "DELETE"];

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : undefined;
}

let csrfPromise: Promise<void> | null = null;

async function ensureCsrf(): Promise<void> {
  if (typeof window === "undefined") return;
  if (readCookie("XSRF-TOKEN")) return;
  if (!csrfPromise) {
    csrfPromise = fetch(`${resolveBaseUrl()}/sanctum/csrf-cookie`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(() => undefined)
      .finally(() => {
        csrfPromise = null;
      });
  }
  await csrfPromise;
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function looksLikeValidationBody(body: unknown): body is ValidationErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    "errors" in body &&
    typeof (body as { errors: unknown }).errors === "object"
  );
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers, cookie, signal } = options;
  const isMutation = MUTATING_METHODS.includes(method);
  const isServer = typeof window === "undefined";

  if (isMutation) {
    await ensureCsrf();
  }

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!isServer && isMutation) {
    const token = readCookie("XSRF-TOKEN");
    if (token) finalHeaders.set("X-XSRF-TOKEN", token);
  }
  if (cookie) finalHeaders.set("Cookie", cookie);
  // Server-side calls go through the internal hostname, so we need to tell
  // Laravel/Sanctum which public origin we represent to pass the stateful
  // domain check.
  if (isServer && PUBLIC_APP_URL) {
    if (!finalHeaders.has("Origin")) {
      finalHeaders.set("Origin", PUBLIC_APP_URL);
    }
    if (!finalHeaders.has("Referer")) {
      finalHeaders.set("Referer", `${PUBLIC_APP_URL}/`);
    }
  }

  const res = await fetch(`${resolveBaseUrl()}${path}`, {
    method,
    credentials: "include",
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    cache: "no-store",
  });

  if (res.ok) {
    return (await parseBody(res)) as T;
  }

  const errBody = await parseBody(res);

  if (res.status === 401) {
    throw new UnauthorizedError(errBody);
  }
  if (res.status === 422 && looksLikeValidationBody(errBody)) {
    throw new ValidationError(res.status, errBody);
  }
  const message =
    typeof errBody === "object" && errBody && "message" in errBody
      ? String((errBody as { message: unknown }).message)
      : `Request failed with status ${res.status}`;
  throw new ApiError(res.status, message, errBody);
}
