import { AlertTriangle, Clock } from "lucide-react";

import { ActivityTimeline } from "@/components/projects/activity/activity-timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityLogEntry } from "@/types/api";

type Props = {
  entries: readonly ActivityLogEntry[];
  error?: boolean;
};

export function ProjectActivitySection({ entries, error }: Props) {
  return (
    <Card data-slot="project-activity-section">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          What changed on this project recently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" aria-hidden />
            <AlertTitle>Couldn&apos;t load activity</AlertTitle>
            <AlertDescription>
              The activity feed failed to load. Try refreshing.
            </AlertDescription>
          </Alert>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-center">
            <Clock
              className="size-5 text-muted-foreground"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              No activity yet — actions on this project will appear here.
            </p>
          </div>
        ) : (
          <ActivityTimeline entries={entries} />
        )}
      </CardContent>
    </Card>
  );
}
