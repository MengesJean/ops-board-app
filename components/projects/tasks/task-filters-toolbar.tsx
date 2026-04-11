"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/tasks/formatters";
import type {
  Milestone,
  TaskFilters,
  TaskPriority,
  TaskStatus,
} from "@/types/api";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/api";

const ALL_VALUE = "__all__";

type TaskFiltersToolbarProps = {
  filters: TaskFilters;
  milestones: Milestone[];
  hasFilters: boolean;
  onChange: (next: TaskFilters) => void;
  onReset: () => void;
};

export function TaskFiltersToolbar({
  filters,
  milestones,
  hasFilters,
  onChange,
  onReset,
}: TaskFiltersToolbarProps) {
  const handleStatusClick = (status: TaskStatus | undefined) => {
    onChange({ ...filters, status });
  };

  const priorityItems: Record<string, string> = {
    [ALL_VALUE]: "All priorities",
    ...Object.fromEntries(
      TASK_PRIORITIES.map((p) => [p, TASK_PRIORITY_LABELS[p]]),
    ),
  };

  const milestoneItems: Record<string, string> = {
    [ALL_VALUE]: "All milestones",
    ...Object.fromEntries(milestones.map((m) => [String(m.id), m.title])),
  };

  return (
    <div
      data-slot="task-filters-toolbar"
      className="flex flex-col gap-3 rounded-xl border bg-card/30 p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex overflow-hidden rounded-lg border bg-background"
        >
          <FilterChip
            active={filters.status === undefined}
            onClick={() => handleStatusClick(undefined)}
          >
            All
          </FilterChip>
          {TASK_STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={filters.status === s}
              onClick={() => handleStatusClick(s)}
            >
              {TASK_STATUS_LABELS[s]}
            </FilterChip>
          ))}
        </div>

        <Select
          items={priorityItems}
          value={filters.priority ?? ALL_VALUE}
          onValueChange={(value) => {
            if (!value) return;
            onChange({
              ...filters,
              priority:
                value === ALL_VALUE ? undefined : (value as TaskPriority),
            });
          }}
        >
          <SelectTrigger
            aria-label="Filter by priority"
            className="h-8 min-w-32"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All priorities</SelectItem>
            {TASK_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {milestones.length > 0 && (
          <Select
            items={milestoneItems}
            value={
              filters.project_milestone_id !== undefined
                ? String(filters.project_milestone_id)
                : ALL_VALUE
            }
            onValueChange={(value) => {
              if (!value) return;
              onChange({
                ...filters,
                project_milestone_id:
                  value === ALL_VALUE ? undefined : Number(value),
              });
            }}
          >
            <SelectTrigger
              aria-label="Filter by milestone"
              className="h-8 min-w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All milestones</SelectItem>
              {milestones.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="relative ml-auto w-full max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={filters.search ?? ""}
            placeholder="Search by title…"
            aria-label="Search tasks"
            onChange={(e) =>
              onChange({
                ...filters,
                search: e.target.value === "" ? undefined : e.target.value,
              })
            }
            className="pl-7"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            aria-label="Clear filters"
          >
            <X />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 px-3 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
