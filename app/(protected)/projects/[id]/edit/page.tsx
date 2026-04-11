import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { ProjectFormPage } from "@/components/projects/project-form-page";
import { fetchClients } from "@/lib/api/clients";
import { fetchProject } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/errors";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import { requireAuth } from "@/lib/auth/guards";

export const metadata = {
  title: "Edit project · OpsBoard",
};

export default async function EditProjectPage(
  props: PageProps<"/projects/[id]/edit">,
) {
  await requireAuth();
  const params = await props.params;
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const cookie = await buildForwardedCookieHeader();
  let projectRes;
  let clientsResult;
  try {
    [projectRes, clientsResult] = await Promise.all([
      fetchProject(id, { cookie }),
      fetchClients({ per_page: 100 }, { cookie }),
    ]);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    throw err;
  }

  const project = projectRes.data;

  return (
    <>
      <AppHeader title={`Edit · ${project.name}`} />
      <ProjectFormPage
        mode="edit"
        clients={clientsResult.data}
        initialProject={project}
      />
    </>
  );
}
