import { DashboardPriorities } from "@/components/dashboard/dashboard-priorities";
import { DashboardProjects } from "@/components/dashboard/dashboard-projects";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import type { Customer, DashboardPayload } from "@/types/api";

type Props = {
  data: DashboardPayload;
  customer: Customer;
};

export function DashboardView({ data, customer }: Props) {
  const firstName = customer.name.split(" ")[0];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a quick snapshot of your operations.
        </p>
      </div>

      <DashboardStats stats={data.stats} />

      <DashboardPriorities priorities={data.priorities} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <DashboardProjects projects={data.projects} />
        <DashboardRecentActivity
          entries={data.recent_activity}
          projects={data.projects}
        />
      </div>
    </div>
  );
}
