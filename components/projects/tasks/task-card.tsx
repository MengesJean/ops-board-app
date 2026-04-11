"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Flag,
  MoreHorizontal,
  Pencil,
  Target,
  Trash2,
} from "lucide-react";

import { FormattedDate } from "@/components/clients/formatted-date";
import { TaskPriorityPill } from "@/components/projects/tasks/task-priority-pill";
import { TaskStatusBadge } from "@/components/projects/tasks/task-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  TASK_STATUS_DOTS,
  TASK_STATUS_LABELS,
  isTaskOverdue,
} from "@/lib/tasks/formatters";
import type { Milestone, Task, TaskStatus } from "@/types/api";
import { TASK_STATUSES } from "@/types/api";

type TaskCardProps = {
  task: Task;
  milestone?: Milestone | null;
  busy?: boolean;
  canReorder: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
  onMoveUp: (task: Task) => void;
  onMoveDown: (task: Task) => void;
};

export function TaskCard({
  task,
  milestone,
  busy = false,
  canReorder,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onChangeStatus,
  onMoveUp,
  onMoveDown,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task);
  const isDone = task.status === "done";

  return (
    <article
      data-slot="task-card"
      data-status={task.status}
      data-priority={task.priority}
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition",
        busy && "opacity-60",
        isDone && "bg-card/60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-2.5 shrink-0 rounded-full",
                TASK_STATUS_DOTS[task.status],
              )}
            />
            <h4
              className={cn(
                "font-heading text-sm font-medium leading-snug",
                isDone && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-2 pl-4">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityPill priority={task.priority} />
            {milestone && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                title={`Milestone: ${milestone.title}`}
              >
                <Target className="size-3" aria-hidden />
                {milestone.title}
              </span>
            )}
            {task.due_date && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs",
                  overdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                <CalendarDays className="size-3" aria-hidden />
                Due <FormattedDate iso={task.due_date} />
                {overdue && (
                  <span className="inline-flex items-center gap-0.5 font-medium">
                    <CircleAlert className="size-3" aria-hidden />
                    Overdue
                  </span>
                )}
              </span>
            )}
            {task.completed_at && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-3" aria-hidden />
                Completed <FormattedDate iso={task.completed_at} />
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${task.title}`}
                disabled={busy}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              <Flag className="mr-1 inline size-3" aria-hidden />
              Status
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={task.status}
              onValueChange={(value) => {
                if (value && value !== task.status) {
                  onChangeStatus(task, value as TaskStatus);
                }
              }}
            >
              {TASK_STATUSES.map((status) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onMoveUp(task)}
              disabled={!canReorder || isFirst}
            >
              <ArrowUp />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onMoveDown(task)}
              disabled={!canReorder || isLast}
            >
              <ArrowDown />
              Move down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(task)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="whitespace-pre-line pl-4 text-sm text-muted-foreground">
          {task.description}
        </p>
      )}
    </article>
  );
}
