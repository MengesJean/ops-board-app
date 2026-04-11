import { AppHeader } from "@/components/layout/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <>
      <AppHeader title="Projects" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Skeleton className="h-8 w-full sm:max-w-xs" />
            <Skeleton className="h-8 w-full sm:w-40" />
            <Skeleton className="h-8 w-full sm:w-40" />
            <Skeleton className="h-8 w-full sm:w-40" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="rounded-xl border bg-card">
          <div className="flex flex-col divide-y">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
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
