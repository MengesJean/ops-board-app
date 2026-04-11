import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { ApiError } from "@/lib/api/errors";
import { fetchProjectMilestones } from "@/lib/api/milestones";
import { fetchProject } from "@/lib/api/projects";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import { requireAuth } from "@/lib/auth/guards";
import { sortMilestonesByPosition } from "@/lib/milestones/formatters";

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
  try {
    [projectRes, milestonesRes] = await Promise.all([
      fetchProject(id, { cookie }),
      fetchProjectMilestones(id, { cookie }),
    ]);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    throw err;
  }

  const project = projectRes.data;
  const milestones = sortMilestonesByPosition(milestonesRes.data);

  return (
    <>
      <AppHeader title={project.name} />
      <ProjectDetailView project={project} milestones={milestones} />
    </>
  );
}
