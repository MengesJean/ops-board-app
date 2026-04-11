import { Clock } from "lucide-react";

import { ActivityTimeline } from "@/components/projects/activity/activity-timeline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityLogEntry, DashboardProjectSummary } from "@/types/api";

type Props = {
  entries: readonly ActivityLogEntry[];
  projects: readonly DashboardProjectSummary[];
};

export function DashboardRecentActivity({ entries, projects }: Props) {
  const projectNames = Object.fromEntries(
    projects.map((p) => [p.id, p.name]),
  ) as Record<number, string>;

  return (
    <Card data-slot="dashboard-recent-activity">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Latest changes across your projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-center">
            <Clock
              className="size-5 text-muted-foreground"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              No recent activity yet.
            </p>
          </div>
        ) : (
          <ActivityTimeline
            entries={entries}
            showProject
            projectNames={projectNames}
          />
        )}
      </CardContent>
    </Card>
  );
}
