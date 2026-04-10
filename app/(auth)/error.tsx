"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AuthError({
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Sign-in is temporarily unavailable
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We couldn&apos;t reach the authentication service. Please try again in
        a moment.
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
