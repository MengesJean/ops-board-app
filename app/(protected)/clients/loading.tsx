import { AppHeader } from "@/components/layout/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <>
      <AppHeader title="Clients" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-8 w-full sm:max-w-xs" />
            <Skeleton className="h-8 w-full sm:w-44" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="rounded-xl border bg-card">
          <div className="flex flex-col divide-y">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="size-7" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
