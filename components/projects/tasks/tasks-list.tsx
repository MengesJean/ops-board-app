"use client";

import { ListChecks, Plus } from "lucide-react";

import { TaskCard } from "@/components/projects/tasks/task-card";
import { Button } from "@/components/ui/button";
import type { Milestone, Task, TaskStatus } from "@/types/api";

type TasksListProps = {
  tasks: Task[];
  milestones: Milestone[];
  busyId: number | null;
  canReorder: boolean;
  hasFilters: boolean;
  onCreate: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
  onMoveUp: (task: Task) => void;
  onMoveDown: (task: Task) => void;
};

export function TasksList({
  tasks,
  milestones,
  busyId,
  canReorder,
  hasFilters,
  onCreate,
  onEdit,
  onDelete,
  onChangeStatus,
  onMoveUp,
  onMoveDown,
}: TasksListProps) {
  if (tasks.length === 0) {
    if (hasFilters) {
      return (
        <div
          data-slot="tasks-empty-filtered"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card/40 px-6 py-10 text-center"
        >
          <p className="text-sm font-medium">No tasks match these filters</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try clearing or relaxing the filters above to see more tasks.
          </p>
        </div>
      );
    }
    return (
      <div
        data-slot="tasks-empty"
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/40 px-6 py-12 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ListChecks className="size-6" aria-hidden />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-heading text-base font-medium">No tasks yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Capture the next concrete steps so the team always knows what to
            pick up.
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus />
          Add the first task
        </Button>
      </div>
    );
  }

  return (
    <ol data-slot="tasks-list" className="flex flex-col gap-3">
      {tasks.map((task, index) => {
        const milestone =
          task.project_milestone_id !== null
            ? milestones.find((m) => m.id === task.project_milestone_id) ?? null
            : null;
        return (
          <li key={task.id}>
            <TaskCard
              task={task}
              milestone={milestone}
              busy={busyId === task.id}
              canReorder={canReorder}
              isFirst={index === 0}
              isLast={index === tasks.length - 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onChangeStatus={onChangeStatus}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          </li>
        );
      })}
    </ol>
  );
}
