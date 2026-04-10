import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { requireGuest } from "@/lib/auth/guards";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireGuest();

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="font-heading text-xl font-semibold tracking-tight">
            OpsBoard
          </div>
          <p className="text-sm text-muted-foreground">
            Operations, cleanly managed.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
