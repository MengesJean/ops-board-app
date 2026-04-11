import {
  ArrowRightLeft,
  CheckCircle2,
  CircleDot,
  Flag,
  FolderPlus,
  Pencil,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import type { ActivityLogEntry } from "@/types/api";

export type ActivityIconKey =
  | "created"
  | "updated"
  | "deleted"
  | "completed"
  | "status_changed"
  | "milestone"
  | "project"
  | "default";

export const ACTIVITY_ICONS: Record<ActivityIconKey, LucideIcon> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  completed: CheckCircle2,
  status_changed: ArrowRightLeft,
  milestone: Flag,
  project: FolderPlus,
  default: CircleDot,
};

export const ACTIVITY_TONES: Record<ActivityIconKey, string> = {
  created: "text-sky-600 dark:text-sky-400",
  updated: "text-amber-600 dark:text-amber-400",
  deleted: "text-rose-600 dark:text-rose-400",
  completed: "text-emerald-600 dark:text-emerald-400",
  status_changed: "text-violet-600 dark:text-violet-400",
  milestone: "text-indigo-600 dark:text-indigo-400",
  project: "text-blue-600 dark:text-blue-400",
  default: "text-muted-foreground",
};

export type HumanizedActivity = {
  icon: ActivityIconKey;
  title: string;
  detail?: string;
};

const STATUS_LABEL: Record<string, string> = {
  todo: "to do",
  in_progress: "in progress",
  done: "done",
  pending: "pending",
  draft: "draft",
  planned: "planned",
  active: "active",
  on_hold: "on hold",
  completed: "completed",
  cancelled: "cancelled",
};

function readString(
  properties: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = properties[key];
  return typeof value === "string" ? value : undefined;
}

function statusLabel(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return STATUS_LABEL[value] ?? value.replace(/_/g, " ");
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function fallbackEntityName(entry: ActivityLogEntry): string {
  return (
    entry.subject.label ??
    readString(entry.properties, "label") ??
    `${entry.subject.type} #${entry.subject.id}`
  );
}

export function humanizeActivityEvent(
  entry: ActivityLogEntry,
): HumanizedActivity {
  const name = fallbackEntityName(entry);
  const subjectType = entry.subject.type;
  const event = entry.event;

  switch (event) {
    case "task.created":
      return { icon: "created", title: `Task created: ${name}` };
    case "task.updated":
      return { icon: "updated", title: `Task updated: ${name}` };
    case "task.deleted":
      return { icon: "deleted", title: `Task deleted: ${name}` };
    case "task.completed":
      return { icon: "completed", title: `Task completed: ${name}` };
    case "task.status_changed": {
      const from = statusLabel(readString(entry.properties, "from"));
      const to = statusLabel(readString(entry.properties, "to"));
      return {
        icon: "status_changed",
        title: `Task moved: ${name}`,
        detail: from && to ? `${from} → ${to}` : undefined,
      };
    }
    case "milestone.created":
      return { icon: "milestone", title: `Milestone created: ${name}` };
    case "milestone.updated":
      return { icon: "updated", title: `Milestone updated: ${name}` };
    case "milestone.completed":
      return { icon: "completed", title: `Milestone completed: ${name}` };
    case "milestone.deleted":
      return { icon: "deleted", title: `Milestone deleted: ${name}` };
    case "project.created":
      return { icon: "project", title: `Project created: ${name}` };
    case "project.updated":
      return { icon: "updated", title: `Project updated: ${name}` };
    case "project.status_changed": {
      const from = statusLabel(readString(entry.properties, "from"));
      const to = statusLabel(readString(entry.properties, "to"));
      return {
        icon: "status_changed",
        title: `Project status changed: ${name}`,
        detail: from && to ? `${from} → ${to}` : undefined,
      };
    }
    default: {
      // Fallback: "task.foo_bar" -> "Task foo bar: <name>"
      const [, action] = event.split(".", 2);
      const verb = action ? action.replace(/_/g, " ") : event;
      return {
        icon: "default",
        title: `${titleCase(subjectType)} ${verb}: ${name}`,
      };
    }
  }
}

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(
  iso: string,
  now: number = Date.now(),
): string {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return iso;
  const diff = now - ts;
  if (diff < 0) {
    // future timestamp — show absolute date
    return formatAbsoluteShort(ts);
  }
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return formatAbsoluteShort(ts);
}

export function formatAbsoluteDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAbsoluteShort(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
