import { FormattedDate } from "@/components/clients/formatted-date";
import { Card, CardContent } from "@/components/ui/card";
import { formatBudget } from "@/lib/projects/formatters";
import type { Project } from "@/types/api";

type ProjectOverviewCardsProps = {
  project: Project;
};

const EMPTY = "—";

function CardItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground">{children}</span>
      </CardContent>
    </Card>
  );
}

export function ProjectOverviewCards({ project }: ProjectOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <CardItem label="Client">
        {project.client?.company_name || project.client?.name || EMPTY}
      </CardItem>
      <CardItem label="Start date">
        {project.start_date ? (
          <FormattedDate iso={project.start_date} />
        ) : (
          EMPTY
        )}
      </CardItem>
      <CardItem label="Due date">
        {project.due_date ? <FormattedDate iso={project.due_date} /> : EMPTY}
      </CardItem>
      <CardItem label="Budget">{formatBudget(project.budget)}</CardItem>
      <CardItem label="Created">
        <FormattedDate iso={project.created_at} />
      </CardItem>
      <CardItem label="Updated">
        <FormattedDate iso={project.updated_at} />
      </CardItem>
    </div>
  );
}
