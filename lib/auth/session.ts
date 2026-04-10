import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { fetchCurrentCustomer } from "@/lib/api/auth";
import { isUnauthorized } from "@/lib/api/errors";
import type { Customer } from "@/types/api";

export const getCurrentCustomer = cache(async (): Promise<Customer | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetchCurrentCustomer({ cookie: cookieHeader });
    return res.data;
  } catch (err) {
    if (isUnauthorized(err)) return null;
    // Network or server errors bubble up in dev so we notice them; in prod we
    // still treat the user as unauthenticated to avoid breaking protected pages.
    if (process.env.NODE_ENV === "development") {
      console.error("[getCurrentCustomer]", err);
    }
    return null;
  }
});
