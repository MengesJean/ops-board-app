import { ProjectDescriptionBlock } from "@/components/projects/project-description-block";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";
import { ProjectOverviewCards } from "@/components/projects/project-overview-cards";
import { ProjectStateSummary } from "@/components/projects/project-state-summary";
import { ProjectMilestonesSection } from "@/components/projects/milestones/project-milestones-section";
import { ProjectTasksSection } from "@/components/projects/tasks/project-tasks-section";
import type { Milestone, Project, Task } from "@/types/api";

type ProjectDetailViewProps = {
  project: Project;
  milestones?: Milestone[];
  tasks?: Task[];
};

export function ProjectDetailView({
  project,
  milestones = [],
  tasks = [],
}: ProjectDetailViewProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <ProjectDetailHeader project={project} />

      <ProjectOverviewCards project={project} />

      <ProjectMilestonesSection
        projectId={project.id}
        milestones={milestones}
      />

      <ProjectTasksSection
        projectId={project.id}
        milestones={milestones}
        initialTasks={tasks}
      />

      <ProjectStateSummary project={project} />

      <ProjectDescriptionBlock project={project} />
    </div>
  );
}
