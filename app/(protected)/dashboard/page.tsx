import { AppHeader } from "@/components/layout/app-header";
import { DashboardError } from "@/components/dashboard/dashboard-error";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { fetchDashboard } from "@/lib/api/dashboard";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import { requireAuth } from "@/lib/auth/guards";

export const metadata = {
  title: "Dashboard · OpsBoard",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const cookie = await buildForwardedCookieHeader();

  let dashboard;
  try {
    dashboard = await fetchDashboard({ cookie });
  } catch {
    return (
      <>
        <AppHeader title="Dashboard" />
        <DashboardError />
      </>
    );
  }

  return (
    <>
      <AppHeader title="Dashboard" />
      <DashboardView data={dashboard.data} customer={user} />
    </>
  );
}
