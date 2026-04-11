"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isValidationError } from "@/lib/api/errors";
import { createProjectTask, updateProjectTask } from "@/lib/api/tasks";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/tasks/formatters";
import type {
  CreateTaskPayload,
  Milestone,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskPayload,
} from "@/types/api";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/api";

const NO_MILESTONE_VALUE = "__none__";

const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  due_date: z.string().optional(),
  project_milestone_id: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const FIELD_NAMES = [
  "title",
  "description",
  "status",
  "priority",
  "due_date",
  "project_milestone_id",
] as const;
type FieldName = (typeof FIELD_NAMES)[number];

function isFieldName(value: string): value is FieldName {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

function toDefaults(task?: Task | null): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "todo",
    priority: task?.priority ?? "medium",
    due_date: task?.due_date ?? "",
    project_milestone_id:
      task?.project_milestone_id != null
        ? String(task.project_milestone_id)
        : NO_MILESTONE_VALUE,
  };
}

function nullableTrim(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toPayload(
  values: TaskFormValues,
): CreateTaskPayload & UpdateTaskPayload {
  const milestoneRaw = values.project_milestone_id;
  const project_milestone_id =
    milestoneRaw && milestoneRaw !== NO_MILESTONE_VALUE
      ? Number(milestoneRaw)
      : null;
  return {
    title: values.title.trim(),
    description: nullableTrim(values.description),
    status: values.status,
    priority: values.priority,
    due_date: nullableTrim(values.due_date),
    project_milestone_id,
  };
}

export type TaskFormProps = {
  projectId: number;
  milestones: Milestone[];
  initialTask?: Task | null;
  defaultMilestoneId?: number | null;
  onSuccess: (task: Task) => void;
  onCancel?: () => void;
};

export function TaskForm({
  projectId,
  milestones,
  initialTask,
  defaultMilestoneId,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = Boolean(initialTask);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: (() => {
      const base = toDefaults(initialTask);
      if (!initialTask && defaultMilestoneId != null) {
        base.project_milestone_id = String(defaultMilestoneId);
      }
      return base;
    })(),
  });

  useEffect(() => {
    const next = toDefaults(initialTask);
    if (!initialTask && defaultMilestoneId != null) {
      next.project_milestone_id = String(defaultMilestoneId);
    }
    form.reset(next);
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTask?.id, defaultMilestoneId]);

  const onSubmit: SubmitHandler<TaskFormValues> = async (values) => {
    setFormError(null);
    try {
      const payload = toPayload(values);
      const res = isEdit
        ? await updateProjectTask(projectId, initialTask!.id, payload)
        : await createProjectTask(projectId, payload);
      onSuccess(res.data);
    } catch (err) {
      if (isValidationError(err)) {
        for (const [field, messages] of Object.entries(err.errors)) {
          const message = messages[0];
          if (message && isFieldName(field)) {
            form.setError(field, { message });
          }
        }
        setFormError(err.message);
        return;
      }
      setFormError("Something went wrong. Please try again.");
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const statusValue = watch("status");
  const priorityValue = watch("priority");
  const milestoneValue = watch("project_milestone_id");

  const milestoneItems: Record<string, string> = {
    [NO_MILESTONE_VALUE]: "None",
    ...Object.fromEntries(milestones.map((m) => [String(m.id), m.title])),
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-1 flex-col gap-6 overflow-y-auto p-4"
      aria-label={isEdit ? "Edit task" : "Create task"}
    >
      {formError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={errors.title ? true : undefined}>
          <FieldLabel htmlFor="task-title" required>
            Title
          </FieldLabel>
          <Input
            id="task-title"
            autoComplete="off"
            placeholder="e.g. Draft API contract"
            aria-invalid={errors.title ? true : undefined}
            {...register("title")}
          />
          <FieldError errors={errors.title ? [errors.title] : undefined} />
        </Field>

        <Field data-invalid={errors.description ? true : undefined}>
          <FieldLabel htmlFor="task-description">Description</FieldLabel>
          <Textarea
            id="task-description"
            rows={4}
            placeholder="Add the context, acceptance criteria, links…"
            aria-invalid={errors.description ? true : undefined}
            {...register("description")}
          />
          <FieldError
            errors={errors.description ? [errors.description] : undefined}
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.status ? true : undefined}>
            <FieldLabel htmlFor="task-status" required>
              Status
            </FieldLabel>
            <Select
              items={TASK_STATUS_LABELS}
              value={statusValue}
              onValueChange={(value) => {
                if (value) {
                  setValue("status", value as TaskStatus, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>

          <Field data-invalid={errors.priority ? true : undefined}>
            <FieldLabel htmlFor="task-priority" required>
              Priority
            </FieldLabel>
            <Select
              items={TASK_PRIORITY_LABELS}
              value={priorityValue}
              onValueChange={(value) => {
                if (value) {
                  setValue("priority", value as TaskPriority, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <SelectTrigger id="task-priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              errors={errors.priority ? [errors.priority] : undefined}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.due_date ? true : undefined}>
            <FieldLabel htmlFor="task-due">Due date</FieldLabel>
            <Input
              id="task-due"
              type="date"
              aria-invalid={errors.due_date ? true : undefined}
              {...register("due_date")}
            />
            <FieldError
              errors={errors.due_date ? [errors.due_date] : undefined}
            />
          </Field>

          <Field data-invalid={errors.project_milestone_id ? true : undefined}>
            <FieldLabel htmlFor="task-milestone">Milestone</FieldLabel>
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No milestones in this project yet.
              </p>
            ) : (
              <Select
                items={milestoneItems}
                value={milestoneValue}
                onValueChange={(value) => {
                  if (value) {
                    setValue("project_milestone_id", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              >
                <SelectTrigger id="task-milestone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_MILESTONE_VALUE}>None</SelectItem>
                  {milestones.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FieldError
              errors={
                errors.project_milestone_id
                  ? [errors.project_milestone_id]
                  : undefined
              }
            />
          </Field>
        </div>
      </FieldGroup>

      <div className="mt-auto flex items-center justify-end gap-2 border-t pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isEdit ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
