import { AppHeader } from "@/components/layout/app-header";
import { ProjectsPageShell } from "@/components/projects/projects-page-shell";
import { fetchProjects } from "@/lib/api/projects";
import { buildForwardedCookieHeader } from "@/lib/auth/forward-cookies";
import { requireAuth } from "@/lib/auth/guards";
import {
  PROJECT_HEALTHS,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  type ProjectHealth,
  type ProjectPriority,
  type ProjectStatus,
} from "@/types/api";

export const metadata = {
  title: "Projects · OpsBoard",
};

function parseStatus(
  value: string | string[] | undefined,
): ProjectStatus | null {
  if (typeof value !== "string") return null;
  return (PROJECT_STATUSES as readonly string[]).includes(value)
    ? (value as ProjectStatus)
    : null;
}

function parsePriority(
  value: string | string[] | undefined,
): ProjectPriority | null {
  if (typeof value !== "string") return null;
  return (PROJECT_PRIORITIES as readonly string[]).includes(value)
    ? (value as ProjectPriority)
    : null;
}

function parseHealth(
  value: string | string[] | undefined,
): ProjectHealth | null {
  if (typeof value !== "string") return null;
  return (PROJECT_HEALTHS as readonly string[]).includes(value)
    ? (value as ProjectHealth)
    : null;
}

function parsePage(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? Number(value) : 1;
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}

function parseSearch(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 200);
}

export default async function ProjectsPage(props: PageProps<"/projects">) {
  await requireAuth();
  const sp = await props.searchParams;

  const filters = {
    search: parseSearch(sp.search),
    status: parseStatus(sp.status),
    priority: parsePriority(sp.priority),
    health: parseHealth(sp.health),
    page: parsePage(sp.page),
  };

  const cookie = await buildForwardedCookieHeader();
  const result = await fetchProjects(
    {
      search: filters.search || undefined,
      status: filters.status ?? undefined,
      priority: filters.priority ?? undefined,
      health: filters.health ?? undefined,
      page: filters.page,
      sort: "updated_at",
      direction: "desc",
    },
    { cookie },
  );

  return (
    <>
      <AppHeader title="Projects" />
      <ProjectsPageShell page={result} filters={filters} />
    </>
  );
}
