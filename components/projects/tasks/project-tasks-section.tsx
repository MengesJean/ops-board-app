"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DeleteTaskDialog } from "@/components/projects/tasks/delete-task-dialog";
import { TaskFiltersToolbar } from "@/components/projects/tasks/task-filters-toolbar";
import { TaskFormSheet } from "@/components/projects/tasks/task-form-sheet";
import { TaskProgressSummary } from "@/components/projects/tasks/task-progress-summary";
import { TasksList } from "@/components/projects/tasks/tasks-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchProjectTasks, reorderProjectTasks } from "@/lib/api/tasks";
import {
  TASK_STATUS_LABELS,
  sortTasksByPosition,
} from "@/lib/tasks/formatters";
import { updateProjectTask } from "@/lib/api/tasks";
import type {
  Milestone,
  Task,
  TaskFilters,
  TaskStatus,
} from "@/types/api";

type ProjectTasksSectionProps = {
  projectId: number;
  milestones: Milestone[];
  initialTasks: Task[];
};

const EMPTY_FILTERS: TaskFilters = {};

function hasActiveFilters(filters: TaskFilters): boolean {
  return Boolean(
    filters.status ||
      filters.priority ||
      filters.project_milestone_id !== undefined ||
      (filters.search && filters.search.trim() !== ""),
  );
}

export function ProjectTasksSection({
  projectId,
  milestones,
  initialTasks,
}: ProjectTasksSectionProps) {
  const router = useRouter();

  // Master list of all project tasks (used for the progress summary).
  // Filtered server-side via fetchProjectTasks when filters change.
  const [allTasks, setAllTasks] = useState<Task[]>(() =>
    sortTasksByPosition(initialTasks),
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    sortTasksByPosition(initialTasks),
  );
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Resync when SSR refreshes pass new data in.
  useEffect(() => {
    setAllTasks(sortTasksByPosition(initialTasks));
    if (!hasActiveFilters(filters)) {
      setTasks(sortTasksByPosition(initialTasks));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTasks]);

  const filtersActive = hasActiveFilters(filters);

  // Refetch when filters change. Debounce search.
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refetch = useCallback(
    async (next: TaskFilters) => {
      setIsFiltering(true);
      setError(null);
      try {
        const res = await fetchProjectTasks(projectId, next);
        setTasks(sortTasksByPosition(res.data));
        if (!hasActiveFilters(next)) {
          setAllTasks(sortTasksByPosition(res.data));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not load tasks.";
        setError(message);
      } finally {
        setIsFiltering(false);
      }
    },
    [projectId],
  );

  const handleFiltersChange = (next: TaskFilters) => {
    setFilters(next);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    // Debounce search input only; everything else fires immediately.
    if (
      (next.search ?? "") !== (filters.search ?? "") &&
      next.status === filters.status &&
      next.priority === filters.priority &&
      next.project_milestone_id === filters.project_milestone_id
    ) {
      searchDebounceRef.current = setTimeout(() => {
        void refetch(next);
      }, 250);
      return;
    }
    void refetch(next);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    void refetch(EMPTY_FILTERS);
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setSheetOpen(true);
  };

  const upsertIntoMaster = (task: Task) => {
    setAllTasks((prev) =>
      sortTasksByPosition([
        ...prev.filter((t) => t.id !== task.id),
        task,
      ]),
    );
  };

  const removeFromMaster = (id: number) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const matchesFilters = (task: Task): boolean => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (
      filters.project_milestone_id !== undefined &&
      task.project_milestone_id !== filters.project_milestone_id
    ) {
      return false;
    }
    if (filters.search && filters.search.trim() !== "") {
      const needle = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(needle)) return false;
    }
    return true;
  };

  const handleCreated = (task: Task) => {
    upsertIntoMaster(task);
    if (matchesFilters(task)) {
      setTasks((prev) =>
        sortTasksByPosition([...prev.filter((t) => t.id !== task.id), task]),
      );
    }
    setSheetOpen(false);
    setEditing(null);
    toast.success("Task created", { description: task.title });
    router.refresh();
  };

  const handleUpdated = (task: Task) => {
    upsertIntoMaster(task);
    setTasks((prev) => {
      const without = prev.filter((t) => t.id !== task.id);
      return matchesFilters(task)
        ? sortTasksByPosition([...without, task])
        : without;
    });
    setSheetOpen(false);
    setEditing(null);
    toast.success("Task updated", { description: task.title });
    router.refresh();
  };

  const handleDeleted = (deleted: Task) => {
    removeFromMaster(deleted.id);
    setTasks((prev) => prev.filter((t) => t.id !== deleted.id));
    setPendingDelete(null);
    toast.success("Task deleted", { description: deleted.title });
    router.refresh();
  };

  const handleChangeStatus = async (task: Task, status: TaskStatus) => {
    if (busyId !== null) return;
    setBusyId(task.id);
    try {
      const res = await updateProjectTask(projectId, task.id, { status });
      const updated = res.data;
      upsertIntoMaster(updated);
      setTasks((prev) => {
        const without = prev.filter((t) => t.id !== updated.id);
        return matchesFilters(updated)
          ? sortTasksByPosition([...without, updated])
          : without;
      });
      toast.success("Status updated", {
        description: `${task.title} → ${TASK_STATUS_LABELS[status]}`,
      });
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not update the task status.";
      toast.error("Status update failed", { description: message });
    } finally {
      setBusyId(null);
    }
  };

  const move = async (task: Task, direction: -1 | 1) => {
    if (busyId !== null || filtersActive) return;
    const index = tasks.findIndex((t) => t.id === task.id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= tasks.length) {
      return;
    }
    const reordered = [...tasks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setBusyId(task.id);
    setTasks(reordered);

    try {
      const res = await reorderProjectTasks(
        projectId,
        reordered.map((t) => t.id),
      );
      const sorted = sortTasksByPosition(res.data);
      setTasks(sorted);
      setAllTasks(sorted);
      router.refresh();
    } catch (err) {
      // Rollback
      setTasks(sortTasksByPosition(allTasks));
      const message =
        err instanceof Error ? err.message : "Could not reorder tasks.";
      toast.error("Reorder failed", { description: message });
    } finally {
      setBusyId(null);
    }
  };

  const summaryTasks = useMemo(() => allTasks, [allTasks]);

  return (
    <section
      data-slot="project-tasks-section"
      className="flex flex-col gap-4"
      aria-labelledby="project-tasks-heading"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3
            id="project-tasks-heading"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Tasks
          </h3>
          <p className="text-sm text-muted-foreground">
            {allTasks.length === 0
              ? "Capture the operational steps that move this project forward."
              : `${allTasks.length} task${allTasks.length > 1 ? "s" : ""} on this project.`}
          </p>
        </div>
        {allTasks.length > 0 && (
          <Button onClick={openCreate}>
            <Plus />
            Add task
          </Button>
        )}
      </div>

      {allTasks.length > 0 && <TaskProgressSummary tasks={summaryTasks} />}

      {allTasks.length > 0 && (
        <TaskFiltersToolbar
          filters={filters}
          milestones={milestones}
          hasFilters={filtersActive}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      )}

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        data-slot="tasks-list-wrapper"
        aria-busy={isFiltering ? true : undefined}
        className={isFiltering ? "opacity-60 transition-opacity" : undefined}
      >
        <TasksList
          tasks={tasks}
          milestones={milestones}
          busyId={busyId}
          canReorder={!filtersActive}
          hasFilters={filtersActive}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={(t) => setPendingDelete(t)}
          onChangeStatus={handleChangeStatus}
          onMoveUp={(t) => void move(t, -1)}
          onMoveDown={(t) => void move(t, 1)}
        />
      </div>

      <TaskFormSheet
        projectId={projectId}
        milestones={milestones}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        initialTask={editing}
        defaultMilestoneId={
          editing ? null : (filters.project_milestone_id ?? null)
        }
        onSuccess={editing ? handleUpdated : handleCreated}
      />

      <DeleteTaskDialog
        projectId={projectId}
        task={pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onDeleted={handleDeleted}
      />
    </section>
  );
}
