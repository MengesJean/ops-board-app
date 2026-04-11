import { apiFetch } from "@/lib/api/client";
import type {
  ApiResource,
  CreateTaskPayload,
  Task,
  TaskFilters,
  UpdateTaskPayload,
} from "@/types/api";

type ServerOptions = { cookie?: string };

function buildQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.project_milestone_id !== undefined) {
    params.set(
      "project_milestone_id",
      String(filters.project_milestone_id),
    );
  }
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function fetchProjectTasks(
  projectId: number,
  filters: TaskFilters = {},
  options: ServerOptions = {},
): Promise<ApiResource<Task[]>> {
  return apiFetch<ApiResource<Task[]>>(
    `/api/projects/${projectId}/tasks${buildQueryString(filters)}`,
    { method: "GET", cookie: options.cookie },
  );
}

export function fetchProjectTask(
  projectId: number,
  taskId: number,
  options: ServerOptions = {},
): Promise<ApiResource<Task>> {
  return apiFetch<ApiResource<Task>>(
    `/api/projects/${projectId}/tasks/${taskId}`,
    { method: "GET", cookie: options.cookie },
  );
}

export function createProjectTask(
  projectId: number,
  payload: CreateTaskPayload,
): Promise<ApiResource<Task>> {
  return apiFetch<ApiResource<Task>>(
    `/api/projects/${projectId}/tasks`,
    { method: "POST", body: payload },
  );
}

export function updateProjectTask(
  projectId: number,
  taskId: number,
  payload: UpdateTaskPayload,
): Promise<ApiResource<Task>> {
  return apiFetch<ApiResource<Task>>(
    `/api/projects/${projectId}/tasks/${taskId}`,
    { method: "PATCH", body: payload },
  );
}

export function deleteProjectTask(
  projectId: number,
  taskId: number,
): Promise<null> {
  return apiFetch<null>(
    `/api/projects/${projectId}/tasks/${taskId}`,
    { method: "DELETE" },
  );
}

export function reorderProjectTasks(
  projectId: number,
  taskIds: number[],
): Promise<ApiResource<Task[]>> {
  return apiFetch<ApiResource<Task[]>>(
    `/api/projects/${projectId}/tasks/reorder`,
    { method: "PATCH", body: { task_ids: taskIds } },
  );
}
