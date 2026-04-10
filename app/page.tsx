import { redirect } from "next/navigation";

import { getCurrentCustomer } from "@/lib/auth/session";

export default async function RootPage() {
  const user = await getCurrentCustomer();
  redirect(user ? "/dashboard" : "/login");
}
