"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DeleteMilestoneDialog } from "@/components/projects/milestones/delete-milestone-dialog";
import { MilestoneFormSheet } from "@/components/projects/milestones/milestone-form-sheet";
import { MilestonesTimeline } from "@/components/projects/milestones/milestones-timeline";
import { Button } from "@/components/ui/button";
import {
  reorderProjectMilestones,
  updateProjectMilestone,
} from "@/lib/api/milestones";
import { sortMilestonesByPosition } from "@/lib/milestones/formatters";
import type { Milestone, MilestoneStatus } from "@/types/api";

type ProjectMilestonesSectionProps = {
  projectId: number;
  milestones: Milestone[];
};

export function ProjectMilestonesSection({
  projectId,
  milestones: initialMilestones,
}: ProjectMilestonesSectionProps) {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    sortMilestonesByPosition(initialMilestones),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Milestone | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Resync when SSR refreshes pass new data in.
  useEffect(() => {
    setMilestones(sortMilestonesByPosition(initialMilestones));
  }, [initialMilestones]);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (milestone: Milestone) => {
    setEditing(milestone);
    setSheetOpen(true);
  };

  const handleCreated = (milestone: Milestone) => {
    setMilestones((prev) =>
      sortMilestonesByPosition([
        ...prev.filter((m) => m.id !== milestone.id),
        milestone,
      ]),
    );
    setSheetOpen(false);
    setEditing(null);
    toast.success("Milestone created", { description: milestone.title });
    router.refresh();
  };

  const handleUpdated = (milestone: Milestone) => {
    setMilestones((prev) =>
      sortMilestonesByPosition(
        prev.map((m) => (m.id === milestone.id ? milestone : m)),
      ),
    );
    setSheetOpen(false);
    setEditing(null);
    toast.success("Milestone updated", { description: milestone.title });
    router.refresh();
  };

  const handleDeleted = (deleted: Milestone) => {
    setMilestones((prev) => prev.filter((m) => m.id !== deleted.id));
    setPendingDelete(null);
    toast.success("Milestone deleted", { description: deleted.title });
    router.refresh();
  };

  const handleChangeStatus = async (
    milestone: Milestone,
    status: MilestoneStatus,
  ) => {
    if (busyId !== null) return;
    setBusyId(milestone.id);
    try {
      const res = await updateProjectMilestone(projectId, milestone.id, {
        status,
      });
      setMilestones((prev) =>
        sortMilestonesByPosition(
          prev.map((m) => (m.id === res.data.id ? res.data : m)),
        ),
      );
      toast.success("Status updated", {
        description: `${milestone.title} → ${status.replace("_", " ")}`,
      });
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not update the milestone status.";
      toast.error("Status update failed", { description: message });
    } finally {
      setBusyId(null);
    }
  };

  const move = async (milestone: Milestone, direction: -1 | 1) => {
    if (busyId !== null) return;
    const index = milestones.findIndex((m) => m.id === milestone.id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= milestones.length) {
      return;
    }
    const reordered = [...milestones];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Optimistic
    setBusyId(milestone.id);
    setMilestones(reordered);

    try {
      const res = await reorderProjectMilestones(
        projectId,
        reordered.map((m) => m.id),
      );
      setMilestones(sortMilestonesByPosition(res.data));
      router.refresh();
    } catch (err) {
      // Rollback on failure
      setMilestones(sortMilestonesByPosition(initialMilestones));
      const message =
        err instanceof Error ? err.message : "Could not reorder milestones.";
      toast.error("Reorder failed", { description: message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section
      data-slot="project-milestones-section"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            Roadmap
          </h3>
          <p className="text-sm text-muted-foreground">
            {milestones.length === 0
              ? "Plan the steps that will move this project forward."
              : `${milestones.length} milestone${milestones.length > 1 ? "s" : ""} on the roadmap.`}
          </p>
        </div>
        {milestones.length > 0 && (
          <Button onClick={openCreate}>
            <Plus />
            Add milestone
          </Button>
        )}
      </div>

      <MilestonesTimeline
        milestones={milestones}
        busyId={busyId}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(m) => setPendingDelete(m)}
        onChangeStatus={handleChangeStatus}
        onMoveUp={(m) => void move(m, -1)}
        onMoveDown={(m) => void move(m, 1)}
      />

      <MilestoneFormSheet
        projectId={projectId}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        initialMilestone={editing}
        onSuccess={editing ? handleUpdated : handleCreated}
      />

      <DeleteMilestoneDialog
        projectId={projectId}
        milestone={pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onDeleted={handleDeleted}
      />
    </section>
  );
}
