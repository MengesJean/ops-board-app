import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/auth/guards";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Guard runs first and kicks unauthenticated users to /login.
  await requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
