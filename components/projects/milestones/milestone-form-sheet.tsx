"use client";

import { MilestoneForm } from "@/components/projects/milestones/milestone-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Milestone } from "@/types/api";

type MilestoneFormSheetProps = {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMilestone?: Milestone | null;
  onSuccess: (milestone: Milestone) => void;
};

export function MilestoneFormSheet({
  projectId,
  open,
  onOpenChange,
  initialMilestone,
  onSuccess,
}: MilestoneFormSheetProps) {
  const isEdit = Boolean(initialMilestone);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>
            {isEdit ? "Edit milestone" : "New milestone"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this roadmap milestone."
              : "Add a new step to the project roadmap."}
          </SheetDescription>
        </SheetHeader>
        <MilestoneForm
          projectId={projectId}
          initialMilestone={initialMilestone}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
