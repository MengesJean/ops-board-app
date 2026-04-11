import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { fetchProject } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/errors";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import { requireAuth } from "@/lib/auth/guards";

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
  let res;
  try {
    res = await fetchProject(id, { cookie });
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    throw err;
  }

  const project = res.data;

  return (
    <>
      <AppHeader title={project.name} />
      <ProjectDetailView project={project} />
    </>
  );
}
