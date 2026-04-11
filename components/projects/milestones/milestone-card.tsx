"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";

import { FormattedDate } from "@/components/clients/formatted-date";
import { MilestoneStatusBadge } from "@/components/projects/milestones/milestone-status-badge";
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
  MILESTONE_STATUS_DOTS,
  MILESTONE_STATUS_LABELS,
  isMilestoneOverdue,
} from "@/lib/milestones/formatters";
import type { Milestone, MilestoneStatus } from "@/types/api";
import { MILESTONE_STATUSES } from "@/types/api";

type MilestoneCardProps = {
  milestone: Milestone;
  index: number;
  total: number;
  busy?: boolean;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
  onChangeStatus: (milestone: Milestone, status: MilestoneStatus) => void;
  onMoveUp: (milestone: Milestone) => void;
  onMoveDown: (milestone: Milestone) => void;
  /**
   * Reserved for the next implementation step (`Task`). Renders below the
   * milestone meta as an extension area so the structure does not need to
   * change when tasks ship.
   */
  children?: ReactNode;
};

export function MilestoneCard({
  milestone,
  index,
  total,
  busy = false,
  onEdit,
  onDelete,
  onChangeStatus,
  onMoveUp,
  onMoveDown,
  children,
}: MilestoneCardProps) {
  const overdue = isMilestoneOverdue(milestone);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div
      data-slot="milestone-card"
      data-status={milestone.status}
      className="relative flex gap-4"
    >
      {/* Vertical rail with status dot */}
      <div
        aria-hidden
        className="flex w-6 shrink-0 flex-col items-center"
      >
        <span
          className={cn(
            "mt-3 size-3 rounded-full ring-4 ring-background",
            MILESTONE_STATUS_DOTS[milestone.status],
          )}
        />
        {!isLast && (
          <span className="mt-1 w-px flex-1 bg-border" />
        )}
      </div>

      {/* Card body */}
      <div
        className={cn(
          "mb-6 flex flex-1 flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10",
          busy && "opacity-60",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                #{index + 1}
              </span>
              <h4 className="font-heading text-base font-medium leading-snug">
                {milestone.title}
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <MilestoneStatusBadge status={milestone.status} />
              {milestone.due_date && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs",
                    overdue
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  <CalendarDays className="size-3" aria-hidden />
                  Due <FormattedDate iso={milestone.due_date} />
                  {overdue && (
                    <span className="inline-flex items-center gap-0.5 font-medium">
                      <CircleAlert className="size-3" aria-hidden />
                      Overdue
                    </span>
                  )}
                </span>
              )}
              {milestone.completed_at && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-3" aria-hidden />
                  Completed <FormattedDate iso={milestone.completed_at} />
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
                  aria-label={`Actions for ${milestone.title}`}
                  disabled={busy}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(milestone)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={milestone.status}
                onValueChange={(value) => {
                  if (value && value !== milestone.status) {
                    onChangeStatus(milestone, value as MilestoneStatus);
                  }
                }}
              >
                {MILESTONE_STATUSES.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {MILESTONE_STATUS_LABELS[status]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onMoveUp(milestone)}
                disabled={isFirst}
              >
                <ArrowUp />
                Move up
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onMoveDown(milestone)}
                disabled={isLast}
              >
                <ArrowDown />
                Move down
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(milestone)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {milestone.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {milestone.description}
          </p>
        )}

        {children && (
          <div data-slot="milestone-extension" className="border-t pt-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
