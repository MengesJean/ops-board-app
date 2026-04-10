import "server-only";

import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/session";
import type { Customer } from "@/types/api";

export async function requireAuth(): Promise<Customer> {
  const user = await getCurrentCustomer();
  if (!user) redirect("/login");
  return user;
}

export async function requireGuest(): Promise<void> {
  const user = await getCurrentCustomer();
  if (user) redirect("/dashboard");
}
