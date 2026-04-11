import type { Task, TaskStatus } from "@/types/api";

export type TaskStatusCounts = Record<TaskStatus, number> & {
  total: number;
};

export function countTasksByStatus(tasks: readonly Task[]): TaskStatusCounts {
  const counts: TaskStatusCounts = {
    todo: 0,
    in_progress: 0,
    done: 0,
    total: 0,
  };
  for (const task of tasks) {
    counts[task.status] += 1;
    counts.total += 1;
  }
  return counts;
}

export type TaskProgress = {
  done: number;
  total: number;
  ratio: number;
};

export function computeProjectTaskProgress(
  tasks: readonly Task[],
): TaskProgress {
  const total = tasks.length;
  const done = tasks.reduce(
    (acc, task) => (task.status === "done" ? acc + 1 : acc),
    0,
  );
  const ratio = total === 0 ? 0 : done / total;
  return { done, total, ratio };
}
