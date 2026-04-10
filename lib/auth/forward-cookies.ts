import "server-only";

import { cookies } from "next/headers";

// Laravel's session cookie name is configurable (SESSION_COOKIE) and may use
// either underscore or hyphen separators depending on APP_NAME. We also carry
// XSRF-TOKEN for Sanctum's stateful check and any remember-me cookies.
export function shouldForwardCookie(name: string): boolean {
  if (name === "XSRF-TOKEN") return true;
  return /session/i.test(name) || name.startsWith("remember_");
}

export async function buildForwardedCookieHeader(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .filter((c) => shouldForwardCookie(c.name))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}
