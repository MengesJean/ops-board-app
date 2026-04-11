"use client";

import { Map, Plus } from "lucide-react";

import { MilestoneCard } from "@/components/projects/milestones/milestone-card";
import { Button } from "@/components/ui/button";
import type { Milestone, MilestoneStatus } from "@/types/api";

type MilestonesTimelineProps = {
  milestones: Milestone[];
  busyId?: number | null;
  onCreate: () => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
  onChangeStatus: (milestone: Milestone, status: MilestoneStatus) => void;
  onMoveUp: (milestone: Milestone) => void;
  onMoveDown: (milestone: Milestone) => void;
};

export function MilestonesTimeline({
  milestones,
  busyId,
  onCreate,
  onEdit,
  onDelete,
  onChangeStatus,
  onMoveUp,
  onMoveDown,
}: MilestonesTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/40 px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Map className="size-6" aria-hidden />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-heading text-base font-medium">
            No milestones yet
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Break this project into clear steps so your team can see what
            comes next.
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus />
          Add the first milestone
        </Button>
      </div>
    );
  }

  return (
    <ol className="flex flex-col">
      {milestones.map((milestone, index) => (
        <li key={milestone.id}>
          <MilestoneCard
            milestone={milestone}
            index={index}
            total={milestones.length}
            busy={busyId === milestone.id}
            onEdit={onEdit}
            onDelete={onDelete}
            onChangeStatus={onChangeStatus}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        </li>
      ))}
    </ol>
  );
}
