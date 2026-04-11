import { ProjectDescriptionBlock } from "@/components/projects/project-description-block";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";
import { ProjectOverviewCards } from "@/components/projects/project-overview-cards";
import { ProjectStateSummary } from "@/components/projects/project-state-summary";
import { ProjectActivitySection } from "@/components/projects/activity/project-activity-section";
import { ProjectMilestonesSection } from "@/components/projects/milestones/project-milestones-section";
import { ProjectProgressSection } from "@/components/projects/progress/project-progress-section";
import { ProjectTasksSection } from "@/components/projects/tasks/project-tasks-section";
import type {
  ActivityLogEntry,
  Milestone,
  Project,
  ProjectProgress,
  ProjectProgressDetail,
  Task,
} from "@/types/api";

type ProjectDetailViewProps = {
  project: Project;
  milestones?: Milestone[];
  tasks?: Task[];
  progress?: ProjectProgress | null;
  progressDetail?: ProjectProgressDetail | null;
  progressError?: boolean;
  activity?: readonly ActivityLogEntry[];
  activityError?: boolean;
};

export function ProjectDetailView({
  project,
  milestones = [],
  tasks = [],
  progress = null,
  progressDetail = null,
  progressError = false,
  activity = [],
  activityError = false,
}: ProjectDetailViewProps) {
  const effectiveProgress = progress ?? project.progress ?? null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <ProjectDetailHeader project={project} />

      <ProjectOverviewCards project={project} />

      <ProjectProgressSection
        progress={effectiveProgress}
        progressDetail={progressDetail}
        error={progressError}
      />

      <ProjectMilestonesSection
        projectId={project.id}
        milestones={milestones}
      />

      <ProjectTasksSection
        projectId={project.id}
        milestones={milestones}
        initialTasks={tasks}
      />

      <ProjectActivitySection entries={activity} error={activityError} />

      <ProjectStateSummary project={project} />

      <ProjectDescriptionBlock project={project} />
    </div>
  );
}
