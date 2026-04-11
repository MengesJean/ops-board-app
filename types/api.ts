export type Customer = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
};

export type ApiResource<T> = { data: T };

export type ValidationErrorBody = {
  message: string;
  errors: Record<string, string[]>;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  path: string;
};

export type PaginatedResource<T> = {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
};

export const CLIENT_STATUSES = ["lead", "active", "inactive"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export type Client = {
  id: number;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateClientPayload = {
  name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: ClientStatus;
  notes?: string | null;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;

export type ClientFilters = {
  search?: string;
  status?: ClientStatus;
  page?: number;
  per_page?: number;
};

export const PROJECT_STATUSES = [
  "draft",
  "planned",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_PRIORITIES = ["low", "medium", "high"] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export const PROJECT_HEALTHS = ["good", "warning", "critical"] as const;
export type ProjectHealth = (typeof PROJECT_HEALTHS)[number];

export const PROJECT_SORTS = [
  "updated_at",
  "created_at",
  "due_date",
] as const;
export type ProjectSort = (typeof PROJECT_SORTS)[number];

export const PROJECT_DIRECTIONS = ["asc", "desc"] as const;
export type ProjectDirection = (typeof PROJECT_DIRECTIONS)[number];

export type ProjectClientEmbed = {
  id: number;
  name: string;
  company_name: string | null;
};

export type Project = {
  id: number;
  client_id: number;
  name: string;
  reference: string | null;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  health: ProjectHealth;
  start_date: string | null;
  due_date: string | null;
  budget: string | null;
  notes: string | null;
  client?: ProjectClientEmbed;
  created_at: string;
  updated_at: string;
};

export type CreateProjectPayload = {
  client_id: number;
  name: string;
  reference?: string | null;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  health: ProjectHealth;
  start_date?: string | null;
  due_date?: string | null;
  budget?: string | null;
  notes?: string | null;
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export type ProjectFilters = {
  search?: string;
  client_id?: number;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  health?: ProjectHealth;
  sort?: ProjectSort;
  direction?: ProjectDirection;
  page?: number;
  per_page?: number;
};

export const MILESTONE_STATUSES = [
  "pending",
  "in_progress",
  "done",
] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export type Milestone = {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  position: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateMilestonePayload = {
  title: string;
  description?: string | null;
  status: MilestoneStatus;
  due_date?: string | null;
};

export type UpdateMilestonePayload = Partial<CreateMilestonePayload>;

export type ReorderMilestonesPayload = {
  milestone_ids: number[];
};
