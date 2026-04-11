import { ProjectDescriptionBlock } from "@/components/projects/project-description-block";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";
import { ProjectOverviewCards } from "@/components/projects/project-overview-cards";
import { ProjectStateSummary } from "@/components/projects/project-state-summary";
import { ProjectMilestonesSection } from "@/components/projects/milestones/project-milestones-section";
import type { Milestone, Project } from "@/types/api";

type ProjectDetailViewProps = {
  project: Project;
  milestones?: Milestone[];
};

export function ProjectDetailView({
  project,
  milestones = [],
}: ProjectDetailViewProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <ProjectDetailHeader project={project} />

      <ProjectOverviewCards project={project} />

      <ProjectMilestonesSection
        projectId={project.id}
        milestones={milestones}
      />

      <ProjectStateSummary project={project} />

      <ProjectDescriptionBlock project={project} />
    </div>
  );
}
