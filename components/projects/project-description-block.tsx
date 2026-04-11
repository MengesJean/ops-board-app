import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/types/api";

type ProjectDescriptionBlockProps = {
  project: Project;
};

function EmptyParagraph({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground italic">
      No {label} yet.
    </p>
  );
}

export function ProjectDescriptionBlock({
  project,
}: ProjectDescriptionBlockProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          {project.description ? (
            <p className="text-sm whitespace-pre-wrap text-foreground">
              {project.description}
            </p>
          ) : (
            <EmptyParagraph label="description" />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {project.notes ? (
            <p className="text-sm whitespace-pre-wrap text-foreground">
              {project.notes}
            </p>
          ) : (
            <EmptyParagraph label="notes" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
