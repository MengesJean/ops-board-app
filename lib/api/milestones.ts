import { apiFetch } from "@/lib/api/client";
import type {
  ApiResource,
  CreateMilestonePayload,
  Milestone,
  UpdateMilestonePayload,
} from "@/types/api";

type ServerOptions = { cookie?: string };

export function fetchProjectMilestones(
  projectId: number,
  options: ServerOptions = {},
): Promise<ApiResource<Milestone[]>> {
  return apiFetch<ApiResource<Milestone[]>>(
    `/api/projects/${projectId}/milestones`,
    { method: "GET", cookie: options.cookie },
  );
}

export function createProjectMilestone(
  projectId: number,
  payload: CreateMilestonePayload,
): Promise<ApiResource<Milestone>> {
  return apiFetch<ApiResource<Milestone>>(
    `/api/projects/${projectId}/milestones`,
    { method: "POST", body: payload },
  );
}

export function updateProjectMilestone(
  projectId: number,
  milestoneId: number,
  payload: UpdateMilestonePayload,
): Promise<ApiResource<Milestone>> {
  return apiFetch<ApiResource<Milestone>>(
    `/api/projects/${projectId}/milestones/${milestoneId}`,
    { method: "PUT", body: payload },
  );
}

export function deleteProjectMilestone(
  projectId: number,
  milestoneId: number,
): Promise<null> {
  return apiFetch<null>(
    `/api/projects/${projectId}/milestones/${milestoneId}`,
    { method: "DELETE" },
  );
}

export function reorderProjectMilestones(
  projectId: number,
  milestoneIds: number[],
): Promise<ApiResource<Milestone[]>> {
  return apiFetch<ApiResource<Milestone[]>>(
    `/api/projects/${projectId}/milestones/reorder`,
    { method: "PATCH", body: { milestone_ids: milestoneIds } },
  );
}
