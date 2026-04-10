import { AppHeader } from "@/components/layout/app-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/guards";

export const metadata = {
  title: "Dashboard · OpsBoard",
};

const STATS = [
  {
    title: "Open interventions",
    value: "12",
    description: "3 scheduled for today",
  },
  {
    title: "Active clients",
    value: "48",
    description: "+4 this month",
  },
  {
    title: "Revenue (MTD)",
    value: "€ 18,240",
    description: "+12% vs last month",
  },
  {
    title: "Team utilization",
    value: "76%",
    description: "Healthy zone",
  },
];

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here&apos;s a quick snapshot of your operations.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Card key={stat.title}>
              <CardHeader>
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
              </CardHeader>
              <div className="px-4 pb-4 text-xs text-muted-foreground">
                {stat.description}
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Connect real feeds in the next slice.
            </CardDescription>
          </CardHeader>
          <div className="px-4 pb-4 text-sm text-muted-foreground">
            Nothing to show yet.
          </div>
        </Card>
      </div>
    </>
  );
}
