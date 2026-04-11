import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DashboardError() {
  return (
    <div data-slot="dashboard-error" className="flex flex-1 flex-col gap-4 p-6">
      <Alert variant="destructive">
        <AlertTriangle className="size-4" aria-hidden />
        <AlertTitle>Couldn&apos;t load dashboard</AlertTitle>
        <AlertDescription>
          We weren&apos;t able to fetch your dashboard. Refresh to try again.
        </AlertDescription>
      </Alert>
    </div>
  );
}
