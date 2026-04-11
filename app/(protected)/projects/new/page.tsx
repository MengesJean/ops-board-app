import { AppHeader } from "@/components/layout/app-header";
import { ProjectFormPage } from "@/components/projects/project-form-page";
import { fetchClients } from "@/lib/api/clients";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import { requireAuth } from "@/lib/auth/guards";

export const metadata = {
  title: "New project · OpsBoard",
};

export default async function NewProjectPage() {
  await requireAuth();
  const cookie = await buildForwardedCookieHeader();
  const clientsResult = await fetchClients({ per_page: 100 }, { cookie });

  return (
    <>
      <AppHeader title="New project" />
      <ProjectFormPage mode="create" clients={clientsResult.data} />
    </>
  );
}
