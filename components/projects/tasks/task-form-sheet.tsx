"use client";

import { TaskForm } from "@/components/projects/tasks/task-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Milestone, Task } from "@/types/api";

type TaskFormSheetProps = {
  projectId: number;
  milestones: Milestone[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTask?: Task | null;
  defaultMilestoneId?: number | null;
  onSuccess: (task: Task) => void;
};

export function TaskFormSheet({
  projectId,
  milestones,
  open,
  onOpenChange,
  initialTask,
  defaultMilestoneId,
  onSuccess,
}: TaskFormSheetProps) {
  const isEdit = Boolean(initialTask);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>{isEdit ? "Edit task" : "New task"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this task and keep the project moving."
              : "Capture the next concrete step for this project."}
          </SheetDescription>
        </SheetHeader>
        <TaskForm
          projectId={projectId}
          milestones={milestones}
          initialTask={initialTask}
          defaultMilestoneId={defaultMilestoneId}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
