import { ProjectDescriptionBlock } from "@/components/projects/project-description-block";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";
import { ProjectOverviewCards } from "@/components/projects/project-overview-cards";
import { ProjectStateSummary } from "@/components/projects/project-state-summary";
import type { Project } from "@/types/api";

type ProjectDetailViewProps = {
  project: Project;
};

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <ProjectDetailHeader project={project} />

      <ProjectOverviewCards project={project} />

      {/* Future: <ProjectMilestonesSection projectId={project.id} /> goes here */}

      <ProjectStateSummary project={project} />

      <ProjectDescriptionBlock project={project} />
    </div>
  );
}
