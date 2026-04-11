import type { DashboardPayload } from "@/types/api";

export const mockDashboard: DashboardPayload = {
  stats: {
    active_projects_count: 2,
    completed_projects_count: 1,
    warning_projects_count: 1,
    critical_projects_count: 1,
    overdue_tasks_count: 1,
    due_today_tasks_count: 1,
    upcoming_milestones_count: 2,
    global_completion_rate: 0.42,
  },
  priorities: {
    overdue_tasks: [
      {
        id: 902,
        title: "Review wireframes with stakeholders",
        status: "todo",
        priority: "medium",
        due_date: "2026-03-20",
        project: { id: 101, name: "Naval retrofit dashboard" },
      },
    ],
    due_today_tasks: [
      {
        id: 901,
        title: "Draft the technical brief",
        status: "in_progress",
        priority: "high",
        due_date: "2026-04-11",
        project: { id: 101, name: "Naval retrofit dashboard" },
      },
    ],
    upcoming_milestones: [
      {
        id: 502,
        title: "Design ready",
        status: "in_progress",
        due_date: "2026-04-30",
        project: { id: 101, name: "Naval retrofit dashboard" },
      },
      {
        id: 503,
        title: "Client UAT",
        status: "pending",
        due_date: "2026-04-15",
        project: { id: 101, name: "Naval retrofit dashboard" },
      },
    ],
    at_risk_projects: [
      {
        id: 103,
        name: "Apollo archive migration",
        status: "on_hold",
        health: "critical",
        priority: "low",
        due_date: "2025-12-15",
        is_overdue: true,
        client: { id: 3, name: "Marie Curie" },
        progress: {
          total_tasks: 8,
          completed_tasks: 2,
          completion_rate: 0.25,
        },
      },
    ],
  },
  projects: [
    {
      id: 101,
      name: "Naval retrofit dashboard",
      status: "active",
      health: "good",
      priority: "high",
      due_date: "2026-06-30",
      is_overdue: false,
      client: { id: 1, name: "Grace Hopper" },
      progress: {
        total_tasks: 4,
        completed_tasks: 1,
        completion_rate: 0.25,
      },
    },
    {
      id: 102,
      name: "Kernel telemetry",
      status: "planned",
      health: "warning",
      priority: "medium",
      due_date: "2026-09-15",
      is_overdue: false,
      client: { id: 2, name: "Linus T." },
      progress: {
        total_tasks: 0,
        completed_tasks: 0,
        completion_rate: 0,
      },
    },
  ],
  recent_activity: [
    {
      id: 9001,
      event: "task.completed",
      subject: {
        type: "task",
        id: 903,
        label: "Set up the project repository",
      },
      project_id: 101,
      actor: { type: "customer", id: 1, name: "Ada Lovelace" },
      properties: { label: "Set up the project repository" },
      created_at: "2026-04-10T15:30:00+00:00",
    },
    {
      id: 9002,
      event: "task.status_changed",
      subject: { type: "task", id: 901, label: "Draft the technical brief" },
      project_id: 101,
      actor: { type: "customer", id: 1, name: "Ada Lovelace" },
      properties: {
        label: "Draft the technical brief",
        from: "todo",
        to: "in_progress",
      },
      created_at: "2026-04-09T11:00:00+00:00",
    },
  ],
};
