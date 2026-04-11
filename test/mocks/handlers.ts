import { http, HttpResponse } from "msw";

import type {
  Client,
  ClientStatus,
  CreateClientPayload,
  CreateMilestonePayload,
  CreateProjectPayload,
  CreateTaskPayload,
  Customer,
  Milestone,
  MilestoneProgress,
  MilestoneStatus,
  Project,
  ProjectHealth,
  ProjectPriority,
  ProjectProgress,
  ProjectStatus,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateClientPayload,
  UpdateMilestonePayload,
  UpdateProjectPayload,
  UpdateTaskPayload,
} from "@/types/api";
import {
  MILESTONE_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/types/api";
import { mockClients, paginate } from "@/test/mocks/fixtures/clients";
import { mockMilestones } from "@/test/mocks/fixtures/milestones";
import {
  mockProjects,
  paginateProjects,
} from "@/test/mocks/fixtures/projects";
import { mockTasks } from "@/test/mocks/fixtures/tasks";
import {
  mockProjectActivity,
  paginateActivity,
} from "@/test/mocks/fixtures/activity";
import { mockDashboard } from "@/test/mocks/fixtures/dashboard";

const API = "http://localhost:9999";

export const mockCustomer: Customer = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
  email_verified_at: null,
  created_at: "2026-04-10T12:00:00+00:00",
};

// Mutable in-memory store so handlers can simulate CRUD within a single test.
// Tests that rely on a pristine state should call resetClientsStore() in beforeEach.
let clientsStore: Client[] = [...mockClients];
let nextClientId = clientsStore.reduce((max, c) => Math.max(max, c.id), 0) + 1;

export function resetClientsStore(): void {
  clientsStore = mockClients.map((c) => ({ ...c }));
  nextClientId = clientsStore.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

export function getClientsStore(): Client[] {
  return clientsStore;
}

let projectsStore: Project[] = mockProjects.map((p) => ({ ...p }));
let nextProjectId =
  projectsStore.reduce((max, p) => Math.max(max, p.id), 0) + 1;

export function resetProjectsStore(): void {
  projectsStore = mockProjects.map((p) => ({ ...p }));
  nextProjectId =
    projectsStore.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

export function getProjectsStore(): Project[] {
  return projectsStore;
}

let milestonesStore: Milestone[] = mockMilestones.map((m) => ({ ...m }));
let nextMilestoneId =
  milestonesStore.reduce((max, m) => Math.max(max, m.id), 0) + 1;

export function resetMilestonesStore(): void {
  milestonesStore = mockMilestones.map((m) => ({ ...m }));
  nextMilestoneId =
    milestonesStore.reduce((max, m) => Math.max(max, m.id), 0) + 1;
}

export function getMilestonesStore(): Milestone[] {
  return milestonesStore;
}

let tasksStore: Task[] = mockTasks.map((t) => ({ ...t }));
let nextTaskId = tasksStore.reduce((max, t) => Math.max(max, t.id), 0) + 1;

export function resetTasksStore(): void {
  tasksStore = mockTasks.map((t) => ({ ...t }));
  nextTaskId = tasksStore.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

export function getTasksStore(): Task[] {
  return tasksStore;
}

function isMilestoneStatus(value: unknown): value is MilestoneStatus {
  return (
    typeof value === "string" &&
    (MILESTONE_STATUSES as readonly string[]).includes(value)
  );
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" &&
    (TASK_STATUSES as readonly string[]).includes(value)
  );
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return (
    typeof value === "string" &&
    (TASK_PRIORITIES as readonly string[]).includes(value)
  );
}

function applyTaskCompletedAt(
  previousStatus: TaskStatus | null,
  nextStatus: TaskStatus,
  previousCompletedAt: string | null,
): string | null {
  if (previousStatus === nextStatus) return previousCompletedAt;
  if (nextStatus === "done") return previousCompletedAt ?? nowIso();
  return null;
}

function applyCompletedAtTransition(
  previousStatus: MilestoneStatus | null,
  nextStatus: MilestoneStatus,
  previousCompletedAt: string | null,
): string | null {
  if (previousStatus === nextStatus) return previousCompletedAt;
  if (nextStatus === "done") return previousCompletedAt ?? nowIso();
  return null;
}

function clientEmbed(clientId: number): Project["client"] {
  const client = clientsStore.find((c) => c.id === clientId);
  if (!client) return undefined;
  return {
    id: client.id,
    name: client.name,
    company_name: client.company_name,
  };
}

function nowIso(): string {
  return new Date("2026-04-11T12:00:00+00:00").toISOString();
}

function isTaskOverdueForProgress(task: Task): boolean {
  if (task.status === "done") return false;
  if (!task.due_date) return false;
  const due = new Date(`${task.due_date}T23:59:59`).getTime();
  if (!Number.isFinite(due)) return false;
  return due < new Date("2026-04-11T12:00:00+00:00").getTime();
}

function computeProjectProgress(projectId: number): ProjectProgress {
  const tasks = tasksStore.filter((t) => t.project_id === projectId);
  const milestones = milestonesStore.filter((m) => m.project_id === projectId);
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter(isTaskOverdueForProgress).length;
  const total = tasks.length;
  const completionRate = total === 0 ? 0 : completed / total;
  const completedMilestones = milestones.filter((m) => m.status === "done").length;
  const nextDueTask = tasks
    .filter((t) => t.status !== "done" && t.due_date)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];
  const nextDueMilestone = milestones
    .filter((m) => m.status !== "done" && m.due_date)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];
  const project = projectsStore.find((p) => p.id === projectId);
  const isOverdue = (() => {
    if (!project?.due_date) return false;
    if (project.status === "completed" || project.status === "cancelled") return false;
    const due = new Date(`${project.due_date}T23:59:59`).getTime();
    return due < new Date("2026-04-11T12:00:00+00:00").getTime();
  })();
  return {
    total_tasks: total,
    todo_tasks: todo,
    in_progress_tasks: inProgress,
    completed_tasks: completed,
    overdue_tasks: overdue,
    completion_rate: Math.round(completionRate * 10000) / 10000,
    has_tasks: total > 0,
    total_milestones: milestones.length,
    completed_milestones: completedMilestones,
    next_due_task: nextDueTask
      ? {
          id: nextDueTask.id,
          title: nextDueTask.title,
          due_date: nextDueTask.due_date as string,
        }
      : null,
    next_due_milestone: nextDueMilestone
      ? {
          id: nextDueMilestone.id,
          title: nextDueMilestone.title,
          due_date: nextDueMilestone.due_date as string,
        }
      : null,
    is_overdue: isOverdue,
  };
}

function computeMilestoneProgressForProject(
  projectId: number,
): MilestoneProgress[] {
  const milestones = milestonesStore
    .filter((m) => m.project_id === projectId)
    .sort((a, b) => a.position - b.position);
  return milestones.map((m) => {
    const linked = tasksStore.filter(
      (t) => t.project_milestone_id === m.id && t.project_id === projectId,
    );
    const total = linked.length;
    const completed = linked.filter((t) => t.status === "done").length;
    return {
      id: m.id,
      title: m.title,
      status: m.status,
      position: m.position,
      due_date: m.due_date,
      completed_at: m.completed_at,
      total_tasks: total,
      completed_tasks: completed,
      completion_rate: total === 0 ? null : Math.round((completed / total) * 10000) / 10000,
    };
  });
}

export const handlers = [
  http.get(`${API}/sanctum/csrf-cookie`, () =>
    new HttpResponse(null, {
      status: 204,
      headers: { "Set-Cookie": "XSRF-TOKEN=test-token; Path=/" },
    }),
  ),
  http.post(`${API}/api/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === "correct-password") {
      return HttpResponse.json({ data: mockCustomer }, { status: 200 });
    }
    return HttpResponse.json(
      {
        message: "These credentials do not match our records.",
        errors: {
          email: ["These credentials do not match our records."],
        },
      },
      { status: 422 },
    );
  }),
  http.post(`${API}/api/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      password_confirmation: string;
    };
    if (body.email === "taken@example.com") {
      return HttpResponse.json(
        {
          message: "The email has already been taken.",
          errors: {
            email: ["The email has already been taken."],
          },
        },
        { status: 422 },
      );
    }
    return HttpResponse.json({ data: mockCustomer }, { status: 201 });
  }),
  http.get(`${API}/api/me`, () =>
    HttpResponse.json({ data: mockCustomer }, { status: 200 }),
  ),
  http.post(`${API}/api/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/clients`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase().trim() ?? "";
    const status = url.searchParams.get("status") as ClientStatus | null;
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "15");

    let filtered = clientsStore;
    if (status) filtered = filtered.filter((c) => c.status === status);
    if (search) {
      filtered = filtered.filter((c) =>
        [c.name, c.company_name, c.email]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(search)),
      );
    }
    return HttpResponse.json(paginate(filtered, page, perPage), { status: 200 });
  }),

  http.get(`${API}/api/clients/:id`, ({ params }) => {
    const id = Number(params.id);
    const client = clientsStore.find((c) => c.id === id);
    if (!client) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    return HttpResponse.json({ data: client }, { status: 200 });
  }),

  http.post(`${API}/api/clients`, async ({ request }) => {
    const body = (await request.json()) as CreateClientPayload;
    const errors: Record<string, string[]> = {};
    if (!body.name || body.name.trim() === "") {
      errors.name = ["The name field is required."];
    }
    if (body.email === "taken@example.com") {
      errors.email = ["The email has already been taken."];
    }
    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { message: "The given data was invalid.", errors },
        { status: 422 },
      );
    }
    const client: Client = {
      id: nextClientId++,
      name: body.name,
      company_name: body.company_name ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      status: body.status,
      notes: body.notes ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    clientsStore = [client, ...clientsStore];
    return HttpResponse.json({ data: client }, { status: 201 });
  }),

  http.patch(`${API}/api/clients/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as UpdateClientPayload;
    const index = clientsStore.findIndex((c) => c.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    if (body.name !== undefined && body.name.trim() === "") {
      return HttpResponse.json(
        {
          message: "The given data was invalid.",
          errors: { name: ["The name field is required."] },
        },
        { status: 422 },
      );
    }
    const updated: Client = {
      ...clientsStore[index],
      ...body,
      company_name:
        body.company_name === undefined
          ? clientsStore[index].company_name
          : (body.company_name ?? null),
      email:
        body.email === undefined ? clientsStore[index].email : (body.email ?? null),
      phone:
        body.phone === undefined ? clientsStore[index].phone : (body.phone ?? null),
      notes:
        body.notes === undefined ? clientsStore[index].notes : (body.notes ?? null),
      updated_at: nowIso(),
    };
    clientsStore = [
      ...clientsStore.slice(0, index),
      updated,
      ...clientsStore.slice(index + 1),
    ];
    return HttpResponse.json({ data: updated }, { status: 200 });
  }),

  http.delete(`${API}/api/clients/:id`, ({ params }) => {
    const id = Number(params.id);
    const exists = clientsStore.some((c) => c.id === id);
    if (!exists) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    clientsStore = clientsStore.filter((c) => c.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/api/projects`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase().trim() ?? "";
    const status = url.searchParams.get("status") as ProjectStatus | null;
    const priority = url.searchParams.get("priority") as ProjectPriority | null;
    const health = url.searchParams.get("health") as ProjectHealth | null;
    const clientId = url.searchParams.get("client_id");
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "15");

    let filtered = projectsStore;
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (priority) filtered = filtered.filter((p) => p.priority === priority);
    if (health) filtered = filtered.filter((p) => p.health === health);
    if (clientId) {
      const cid = Number(clientId);
      filtered = filtered.filter((p) => p.client_id === cid);
    }
    if (search) {
      filtered = filtered.filter((p) =>
        [p.name, p.reference]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(search)),
      );
    }
    return HttpResponse.json(paginateProjects(filtered, page, perPage), {
      status: 200,
    });
  }),

  http.get(`${API}/api/projects/:id`, ({ params }) => {
    const id = Number(params.id);
    const project = projectsStore.find((p) => p.id === id);
    if (!project) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    const progress = computeProjectProgress(id);
    const tasksForProject = tasksStore.filter((t) => t.project_id === id);
    return HttpResponse.json(
      {
        data: {
          ...project,
          tasks_count: tasksForProject.length,
          completed_tasks_count: tasksForProject.filter(
            (t) => t.status === "done",
          ).length,
          progress,
        },
      },
      { status: 200 },
    );
  }),

  http.get(`${API}/api/projects/:id/progress`, ({ params }) => {
    const id = Number(params.id);
    const project = projectsStore.find((p) => p.id === id);
    if (!project) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    return HttpResponse.json(
      {
        data: {
          project: computeProjectProgress(id),
          milestones: computeMilestoneProgressForProject(id),
        },
      },
      { status: 200 },
    );
  }),

  http.get(`${API}/api/projects/:id/activity`, ({ params, request }) => {
    const id = Number(params.id);
    const project = projectsStore.find((p) => p.id === id);
    if (!project) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "20");
    const entries = mockProjectActivity.filter((e) => e.project_id === id);
    return HttpResponse.json(paginateActivity(entries, page, perPage), {
      status: 200,
    });
  }),

  http.get(`${API}/api/dashboard`, () =>
    HttpResponse.json({ data: mockDashboard }, { status: 200 }),
  ),

  http.post(`${API}/api/projects`, async ({ request }) => {
    const body = (await request.json()) as CreateProjectPayload;
    const errors: Record<string, string[]> = {};
    if (!body.name || body.name.trim() === "") {
      errors.name = ["The name field is required."];
    }
    if (!body.client_id) {
      errors.client_id = ["The client id field is required."];
    }
    if (body.name === "Conflict") {
      errors.name = ["The name has already been taken."];
    }
    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { message: "The given data was invalid.", errors },
        { status: 422 },
      );
    }
    const project: Project = {
      id: nextProjectId++,
      client_id: body.client_id,
      name: body.name,
      reference: body.reference ?? null,
      description: body.description ?? null,
      status: body.status,
      priority: body.priority,
      health: body.health,
      start_date: body.start_date ?? null,
      due_date: body.due_date ?? null,
      budget: body.budget ?? null,
      notes: body.notes ?? null,
      client: clientEmbed(body.client_id),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    projectsStore = [project, ...projectsStore];
    return HttpResponse.json({ data: project }, { status: 201 });
  }),

  http.patch(`${API}/api/projects/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as UpdateProjectPayload;
    const index = projectsStore.findIndex((p) => p.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    if (body.name !== undefined && body.name.trim() === "") {
      return HttpResponse.json(
        {
          message: "The given data was invalid.",
          errors: { name: ["The name field is required."] },
        },
        { status: 422 },
      );
    }
    const current = projectsStore[index];
    const nextClientId = body.client_id ?? current.client_id;
    const updated: Project = {
      ...current,
      ...body,
      client_id: nextClientId,
      reference:
        body.reference === undefined ? current.reference : (body.reference ?? null),
      description:
        body.description === undefined
          ? current.description
          : (body.description ?? null),
      start_date:
        body.start_date === undefined
          ? current.start_date
          : (body.start_date ?? null),
      due_date:
        body.due_date === undefined ? current.due_date : (body.due_date ?? null),
      budget:
        body.budget === undefined ? current.budget : (body.budget ?? null),
      notes: body.notes === undefined ? current.notes : (body.notes ?? null),
      client: clientEmbed(nextClientId) ?? current.client,
      updated_at: nowIso(),
    };
    projectsStore = [
      ...projectsStore.slice(0, index),
      updated,
      ...projectsStore.slice(index + 1),
    ];
    return HttpResponse.json({ data: updated }, { status: 200 });
  }),

  http.delete(`${API}/api/projects/:id`, ({ params }) => {
    const id = Number(params.id);
    const exists = projectsStore.some((p) => p.id === id);
    if (!exists) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    projectsStore = projectsStore.filter((p) => p.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // ProjectMilestone — reorder must be declared BEFORE the :milestoneId
  // routes so MSW matches the literal segment first.
  http.patch(
    `${API}/api/projects/:projectId/milestones/reorder`,
    async ({ params, request }) => {
      const projectId = Number(params.projectId);
      const project = projectsStore.find((p) => p.id === projectId);
      if (!project) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      const body = (await request.json()) as { milestone_ids?: unknown };
      const ids = Array.isArray(body.milestone_ids)
        ? body.milestone_ids.filter((v): v is number => typeof v === "number")
        : [];
      const projectMilestones = milestonesStore.filter(
        (m) => m.project_id === projectId,
      );
      const expectedCount = projectMilestones.length;
      const idSet = new Set(ids);
      const allBelong = ids.every((id) =>
        projectMilestones.some((m) => m.id === id),
      );
      if (
        ids.length !== expectedCount ||
        idSet.size !== ids.length ||
        !allBelong
      ) {
        return HttpResponse.json(
          {
            message: `The milestone_ids list must contain exactly ${expectedCount} entries (one per existing milestone).`,
            errors: {
              milestone_ids: [
                `The milestone_ids list must contain exactly ${expectedCount} entries (one per existing milestone).`,
              ],
            },
          },
          { status: 422 },
        );
      }
      const now = nowIso();
      const reordered: Milestone[] = ids.map((id, index) => {
        const current = projectMilestones.find((m) => m.id === id) as Milestone;
        return { ...current, position: index + 1, updated_at: now };
      });
      milestonesStore = [
        ...milestonesStore.filter((m) => m.project_id !== projectId),
        ...reordered,
      ];
      return HttpResponse.json({ data: reordered }, { status: 200 });
    },
  ),

  http.get(
    `${API}/api/projects/:projectId/milestones`,
    ({ params }) => {
      const projectId = Number(params.projectId);
      const project = projectsStore.find((p) => p.id === projectId);
      if (!project) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      const data = milestonesStore
        .filter((m) => m.project_id === projectId)
        .sort((a, b) => a.position - b.position);
      return HttpResponse.json({ data }, { status: 200 });
    },
  ),

  http.post(
    `${API}/api/projects/:projectId/milestones`,
    async ({ params, request }) => {
      const projectId = Number(params.projectId);
      const project = projectsStore.find((p) => p.id === projectId);
      if (!project) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      const body = (await request.json()) as CreateMilestonePayload;
      const errors: Record<string, string[]> = {};
      if (!body.title || body.title.trim() === "") {
        errors.title = ["The title field is required."];
      }
      if (!isMilestoneStatus(body.status)) {
        errors.status = ["The selected status is invalid."];
      }
      if (Object.keys(errors).length > 0) {
        return HttpResponse.json(
          { message: "The given data was invalid.", errors },
          { status: 422 },
        );
      }
      const projectMilestones = milestonesStore.filter(
        (m) => m.project_id === projectId,
      );
      const nextPosition =
        projectMilestones.reduce((max, m) => Math.max(max, m.position), 0) + 1;
      const status = body.status as MilestoneStatus;
      const completed_at =
        status === "done" ? nowIso() : null;
      const milestone: Milestone = {
        id: nextMilestoneId++,
        project_id: projectId,
        title: body.title.trim(),
        description: body.description ?? null,
        status,
        position: nextPosition,
        due_date: body.due_date ?? null,
        completed_at,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      milestonesStore = [...milestonesStore, milestone];
      return HttpResponse.json({ data: milestone }, { status: 201 });
    },
  ),

  http.get(
    `${API}/api/projects/:projectId/milestones/:milestoneId`,
    ({ params }) => {
      const projectId = Number(params.projectId);
      const milestoneId = Number(params.milestoneId);
      const milestone = milestonesStore.find(
        (m) => m.id === milestoneId && m.project_id === projectId,
      );
      if (!milestone) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      return HttpResponse.json({ data: milestone }, { status: 200 });
    },
  ),

  http.put(
    `${API}/api/projects/:projectId/milestones/:milestoneId`,
    async ({ params, request }) => {
      const projectId = Number(params.projectId);
      const milestoneId = Number(params.milestoneId);
      const index = milestonesStore.findIndex(
        (m) => m.id === milestoneId && m.project_id === projectId,
      );
      if (index === -1) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      const body = (await request.json()) as UpdateMilestonePayload;
      const current = milestonesStore[index];
      if (body.title !== undefined && body.title.trim() === "") {
        return HttpResponse.json(
          {
            message: "The given data was invalid.",
            errors: { title: ["The title field is required."] },
          },
          { status: 422 },
        );
      }
      if (body.status !== undefined && !isMilestoneStatus(body.status)) {
        return HttpResponse.json(
          {
            message: "The given data was invalid.",
            errors: { status: ["The selected status is invalid."] },
          },
          { status: 422 },
        );
      }
      const nextStatus =
        body.status !== undefined
          ? (body.status as MilestoneStatus)
          : current.status;
      const completed_at = applyCompletedAtTransition(
        current.status,
        nextStatus,
        current.completed_at,
      );
      const updated: Milestone = {
        ...current,
        title: body.title !== undefined ? body.title.trim() : current.title,
        description:
          body.description === undefined
            ? current.description
            : (body.description ?? null),
        status: nextStatus,
        due_date:
          body.due_date === undefined
            ? current.due_date
            : (body.due_date ?? null),
        completed_at,
        updated_at: nowIso(),
      };
      milestonesStore = [
        ...milestonesStore.slice(0, index),
        updated,
        ...milestonesStore.slice(index + 1),
      ];
      return HttpResponse.json({ data: updated }, { status: 200 });
    },
  ),

  http.delete(
    `${API}/api/projects/:projectId/milestones/:milestoneId`,
    ({ params }) => {
      const projectId = Number(params.projectId);
      const milestoneId = Number(params.milestoneId);
      const exists = milestonesStore.some(
        (m) => m.id === milestoneId && m.project_id === projectId,
      );
      if (!exists) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      milestonesStore = milestonesStore.filter((m) => m.id !== milestoneId);
      return new HttpResponse(null, { status: 204 });
    },
  ),

  // Task — reorder must be declared BEFORE the :taskId routes so MSW
  // matches the literal segment first.
  http.patch(
    `${API}/api/projects/:projectId/tasks/reorder`,
    async ({ params, request }) => {
      const projectId = Number(params.projectId);
      const project = projectsStore.find((p) => p.id === projectId);
      if (!project) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      const body = (await request.json()) as { task_ids?: unknown };
      const ids = Array.isArray(body.task_ids)
        ? body.task_ids.filter((v): v is number => typeof v === "number")
        : [];
      const projectTasks = tasksStore.filter((t) => t.project_id === projectId);
      const expectedCount = projectTasks.length;
      const idSet = new Set(ids);
      const allBelong = ids.every((id) =>
        projectTasks.some((t) => t.id === id),
      );
      if (
        ids.length !== expectedCount ||
        idSet.size !== ids.length ||
        !allBelong
      ) {
        return HttpResponse.json(
          {
            message: `The task_ids list must contain exactly ${expectedCount} entries (one per existing task).`,
            errors: {
              task_ids: [
                `The task_ids list must contain exactly ${expectedCount} entries (one per existing task).`,
              ],
            },
          },
          { status: 422 },
        );
      }
      const now = nowIso();
      const reordered: Task[] = ids.map((id, index) => {
        const current = projectTasks.find((t) => t.id === id) as Task;
        return { ...current, position: index + 1, updated_at: now };
      });
      tasksStore = [
        ...tasksStore.filter((t) => t.project_id !== projectId),
        ...reordered,
      ];
      return HttpResponse.json({ data: reordered }, { status: 200 });
    },
  ),

  http.get(
    `${API}/api/projects/:projectId/tasks`,
    ({ params, request }) => {
      const projectId = Number(params.projectId);
      const project = projectsStore.find((p) => p.id === projectId);
      if (!project) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      const url = new URL(request.url);
      const status = url.searchParams.get("status");
      const priority = url.searchParams.get("priority");
      const milestoneId = url.searchParams.get("project_milestone_id");
      const search = url.searchParams.get("search")?.toLowerCase().trim() ?? "";

      let filtered = tasksStore.filter((t) => t.project_id === projectId);
      if (status && isTaskStatus(status)) {
        filtered = filtered.filter((t) => t.status === status);
      }
      if (priority && isTaskPriority(priority)) {
        filtered = filtered.filter((t) => t.priority === priority);
      }
      if (milestoneId !== null) {
        const mid = Number(milestoneId);
        filtered = filtered.filter((t) => t.project_milestone_id === mid);
      }
      if (search) {
        filtered = filtered.filter((t) =>
          t.title.toLowerCase().includes(search),
        );
      }
      const data = [...filtered].sort((a, b) => a.position - b.position);
      return HttpResponse.json({ data }, { status: 200 });
    },
  ),

  http.post(
    `${API}/api/projects/:projectId/tasks`,
    async ({ params, request }) => {
      const projectId = Number(params.projectId);
      const project = projectsStore.find((p) => p.id === projectId);
      if (!project) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      const body = (await request.json()) as CreateTaskPayload;
      const errors: Record<string, string[]> = {};
      if (!body.title || body.title.trim() === "") {
        errors.title = ["The title field is required."];
      }
      if (!isTaskStatus(body.status)) {
        errors.status = ["The selected status is invalid."];
      }
      if (!isTaskPriority(body.priority)) {
        errors.priority = ["The selected priority is invalid."];
      }
      if (
        body.project_milestone_id !== undefined &&
        body.project_milestone_id !== null
      ) {
        const belongs = milestonesStore.some(
          (m) =>
            m.id === body.project_milestone_id && m.project_id === projectId,
        );
        if (!belongs) {
          errors.project_milestone_id = [
            "The selected milestone does not belong to this project.",
          ];
        }
      }
      if (Object.keys(errors).length > 0) {
        return HttpResponse.json(
          { message: "The given data was invalid.", errors },
          { status: 422 },
        );
      }
      const projectTasks = tasksStore.filter((t) => t.project_id === projectId);
      const nextPosition =
        projectTasks.reduce((max, t) => Math.max(max, t.position), 0) + 1;
      const status = body.status as TaskStatus;
      const completed_at = status === "done" ? nowIso() : null;
      const task: Task = {
        id: nextTaskId++,
        project_id: projectId,
        project_milestone_id: body.project_milestone_id ?? null,
        title: body.title.trim(),
        description: body.description ?? null,
        status,
        priority: body.priority as TaskPriority,
        position: nextPosition,
        due_date: body.due_date ?? null,
        completed_at,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      tasksStore = [...tasksStore, task];
      return HttpResponse.json({ data: task }, { status: 201 });
    },
  ),

  http.get(
    `${API}/api/projects/:projectId/tasks/:taskId`,
    ({ params }) => {
      const projectId = Number(params.projectId);
      const taskId = Number(params.taskId);
      const task = tasksStore.find(
        (t) => t.id === taskId && t.project_id === projectId,
      );
      if (!task) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      return HttpResponse.json({ data: task }, { status: 200 });
    },
  ),

  http.patch(
    `${API}/api/projects/:projectId/tasks/:taskId`,
    async ({ params, request }) => {
      const projectId = Number(params.projectId);
      const taskId = Number(params.taskId);
      const index = tasksStore.findIndex(
        (t) => t.id === taskId && t.project_id === projectId,
      );
      if (index === -1) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      const body = (await request.json()) as UpdateTaskPayload;
      const current = tasksStore[index];
      if (body.title !== undefined && body.title.trim() === "") {
        return HttpResponse.json(
          {
            message: "The given data was invalid.",
            errors: { title: ["The title field is required."] },
          },
          { status: 422 },
        );
      }
      if (body.status !== undefined && !isTaskStatus(body.status)) {
        return HttpResponse.json(
          {
            message: "The given data was invalid.",
            errors: { status: ["The selected status is invalid."] },
          },
          { status: 422 },
        );
      }
      if (body.priority !== undefined && !isTaskPriority(body.priority)) {
        return HttpResponse.json(
          {
            message: "The given data was invalid.",
            errors: { priority: ["The selected priority is invalid."] },
          },
          { status: 422 },
        );
      }
      if (
        body.project_milestone_id !== undefined &&
        body.project_milestone_id !== null
      ) {
        const belongs = milestonesStore.some(
          (m) =>
            m.id === body.project_milestone_id && m.project_id === projectId,
        );
        if (!belongs) {
          return HttpResponse.json(
            {
              message: "The given data was invalid.",
              errors: {
                project_milestone_id: [
                  "The selected milestone does not belong to this project.",
                ],
              },
            },
            { status: 422 },
          );
        }
      }
      const nextStatus =
        body.status !== undefined ? (body.status as TaskStatus) : current.status;
      const completed_at = applyTaskCompletedAt(
        current.status,
        nextStatus,
        current.completed_at,
      );
      const updated: Task = {
        ...current,
        title: body.title !== undefined ? body.title.trim() : current.title,
        description:
          body.description === undefined
            ? current.description
            : (body.description ?? null),
        status: nextStatus,
        priority:
          body.priority !== undefined
            ? (body.priority as TaskPriority)
            : current.priority,
        due_date:
          body.due_date === undefined
            ? current.due_date
            : (body.due_date ?? null),
        project_milestone_id:
          body.project_milestone_id === undefined
            ? current.project_milestone_id
            : (body.project_milestone_id ?? null),
        completed_at,
        updated_at: nowIso(),
      };
      tasksStore = [
        ...tasksStore.slice(0, index),
        updated,
        ...tasksStore.slice(index + 1),
      ];
      return HttpResponse.json({ data: updated }, { status: 200 });
    },
  ),

  http.delete(
    `${API}/api/projects/:projectId/tasks/:taskId`,
    ({ params }) => {
      const projectId = Number(params.projectId);
      const taskId = Number(params.taskId);
      const exists = tasksStore.some(
        (t) => t.id === taskId && t.project_id === projectId,
      );
      if (!exists) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      tasksStore = tasksStore.filter((t) => t.id !== taskId);
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
