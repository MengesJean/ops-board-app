"use client";

import { useEffect } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <AppHeader title="Clients" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Couldn&apos;t load clients
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          We weren&apos;t able to reach the API. This is usually temporary — try
          again in a moment.
        </p>
        <Button onClick={reset}>Retry</Button>
      </div>
    </>
  );
}
