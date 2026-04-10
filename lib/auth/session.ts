import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { fetchCurrentCustomer } from "@/lib/api/auth";
import { isUnauthorized } from "@/lib/api/errors";
import type { Customer } from "@/types/api";

function shouldForwardCookie(name: string): boolean {
  if (name === "XSRF-TOKEN") return true;
  // Laravel's session cookie name is configurable (SESSION_COOKIE) and may
  // use either underscore or hyphen separators depending on APP_NAME.
  return /session/i.test(name) || name.startsWith("remember_");
}

export const getCurrentCustomer = cache(async (): Promise<Customer | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .filter((c) => shouldForwardCookie(c.name))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetchCurrentCustomer({ cookie: cookieHeader });
    return res.data;
  } catch (err) {
    if (isUnauthorized(err)) return null;
    throw err;
  }
});
