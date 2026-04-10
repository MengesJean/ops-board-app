import "server-only";

import { cache } from "react";

import { fetchCurrentCustomer } from "@/lib/api/auth";
import { isUnauthorized } from "@/lib/api/errors";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import type { Customer } from "@/types/api";

export const getCurrentCustomer = cache(async (): Promise<Customer | null> => {
  const cookieHeader = await buildForwardedCookieHeader();

  try {
    const res = await fetchCurrentCustomer({ cookie: cookieHeader });
    return res.data;
  } catch (err) {
    if (isUnauthorized(err)) return null;
    throw err;
  }
});
