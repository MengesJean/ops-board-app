import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { fetchProjectActivity } from "@/lib/api/activity";
import { ApiError } from "@/lib/api/errors";
import { fetchProjectMilestones } from "@/lib/api/milestones";
import { fetchProject, fetchProjectProgress } from "@/lib/api/projects";
import { fetchProjectTasks } from "@/lib/api/tasks";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import { requireAuth } from "@/lib/auth/guards";
import { sortMilestonesByPosition } from "@/lib/milestones/formatters";
import { sortTasksByPosition } from "@/lib/tasks/formatters";

export const metadata = {
  title: "Project · OpsBoard",
};

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[id]">,
) {
  await requireAuth();
  const params = await props.params;
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const cookie = await buildForwardedCookieHeader();

  let projectRes;
  let milestonesRes;
  let tasksRes;
  try {
    [projectRes, milestonesRes, tasksRes] = await Promise.all([
      fetchProject(id, { cookie }),
      fetchProjectMilestones(id, { cookie }),
      fetchProjectTasks(id, undefined, { cookie }),
    ]);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    throw err;
  }

  // Non-critical fetches: tolerate failures so a broken progress/activity
  // endpoint doesn't 500 the entire project page.
  const [progressSettled, activitySettled] = await Promise.allSettled([
    fetchProjectProgress(id, { cookie }),
    fetchProjectActivity(id, { per_page: 20 }, { cookie }),
  ]);

  const project = projectRes.data;
  const milestones = sortMilestonesByPosition(milestonesRes.data);
  const tasks = sortTasksByPosition(tasksRes.data);

  const progressDetail =
    progressSettled.status === "fulfilled"
      ? progressSettled.value.data
      : null;
  const progressError = progressSettled.status === "rejected";

  const activity =
    activitySettled.status === "fulfilled"
      ? activitySettled.value.data
      : [];
  const activityError = activitySettled.status === "rejected";

  const inlineProgress = project.progress ?? progressDetail?.project ?? null;

  return (
    <>
      <AppHeader title={project.name} />
      <ProjectDetailView
        project={project}
        milestones={milestones}
        tasks={tasks}
        progress={inlineProgress}
        progressDetail={progressDetail}
        progressError={progressError}
        activity={activity}
        activityError={activityError}
      />
    </>
  );
}
