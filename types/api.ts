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
  progress?: ProjectProgress;
  tasks_count?: number;
  completed_tasks_count?: number;
  created_at: string;
  updated_at: string;
};

export type NextDueRef = {
  id: number;
  title: string;
  due_date: string;
} | null;

export type ProjectProgress = {
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  has_tasks: boolean;
  total_milestones: number;
  completed_milestones: number;
  next_due_task: NextDueRef;
  next_due_milestone: NextDueRef;
  is_overdue: boolean;
};

export type MilestoneProgress = {
  id: number;
  title: string;
  status: MilestoneStatus;
  position: number;
  due_date: string | null;
  completed_at: string | null;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number | null;
};

export type ProjectProgressDetail = {
  project: ProjectProgress;
  milestones: MilestoneProgress[];
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

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type Task = {
  id: number;
  project_id: number;
  project_milestone_id: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  project_milestone_id?: number | null;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export type ReorderTasksPayload = {
  task_ids: number[];
};

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  project_milestone_id?: number;
  search?: string;
};

export type ActivitySubjectType = "task" | "milestone" | "project" | "client";

export type ActivitySubject = {
  type: ActivitySubjectType;
  id: number;
  label: string | null;
};

export type ActivityActor = {
  type: "customer" | "user";
  id: number;
  name: string;
} | null;

export type ActivityLogEntry = {
  id: number;
  event: string;
  subject: ActivitySubject;
  project_id: number;
  actor: ActivityActor;
  properties: Record<string, unknown>;
  created_at: string;
};

export type ActivityFilters = {
  page?: number;
  per_page?: number;
};

export type DashboardStats = {
  active_projects_count: number;
  completed_projects_count: number;
  warning_projects_count: number;
  critical_projects_count: number;
  overdue_tasks_count: number;
  due_today_tasks_count: number;
  upcoming_milestones_count: number;
  global_completion_rate: number;
};

export type DashboardProjectRef = {
  id: number;
  name: string;
};

export type DashboardOverdueTask = {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  project: DashboardProjectRef;
};

export type DashboardUpcomingMilestone = {
  id: number;
  title: string;
  status: MilestoneStatus;
  due_date: string | null;
  project: DashboardProjectRef;
};

export type DashboardProjectSummary = {
  id: number;
  name: string;
  status: ProjectStatus;
  health: ProjectHealth;
  priority: ProjectPriority;
  due_date: string | null;
  is_overdue: boolean;
  client: { id: number; name: string } | null;
  progress: {
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  };
};

export type DashboardPriorities = {
  overdue_tasks: DashboardOverdueTask[];
  due_today_tasks: DashboardOverdueTask[];
  upcoming_milestones: DashboardUpcomingMilestone[];
  at_risk_projects: DashboardProjectSummary[];
};

export type DashboardPayload = {
  stats: DashboardStats;
  priorities: DashboardPriorities;
  projects: DashboardProjectSummary[];
  recent_activity: ActivityLogEntry[];
};
