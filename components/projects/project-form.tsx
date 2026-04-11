"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { createProject, updateProject } from "@/lib/api/projects";
import { isValidationError } from "@/lib/api/errors";
import {
  HEALTH_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/projects/formatters";
import type {
  Client,
  CreateProjectPayload,
  Project,
  ProjectHealth,
  ProjectPriority,
  ProjectStatus,
  UpdateProjectPayload,
} from "@/types/api";
import {
  PROJECT_HEALTHS,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
} from "@/types/api";

const projectSchema = z
  .object({
    client_id: z
      .string()
      .min(1, "Client is required"),
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name is too long"),
    reference: z.string().max(100, "Reference is too long").optional(),
    description: z
      .string()
      .max(5000, "Description is too long")
      .optional(),
    status: z.enum(PROJECT_STATUSES),
    priority: z.enum(PROJECT_PRIORITIES),
    health: z.enum(PROJECT_HEALTHS),
    start_date: z.string().optional(),
    due_date: z.string().optional(),
    budget: z.string().optional(),
    notes: z.string().max(5000, "Notes are too long").optional(),
  })
  .superRefine((values, ctx) => {
    if (values.start_date && values.due_date) {
      if (values.due_date < values.start_date) {
        ctx.addIssue({
          code: "custom",
          path: ["due_date"],
          message: "Due date must be on or after the start date",
        });
      }
    }
    if (values.budget && values.budget.trim() !== "") {
      const parsed = Number(values.budget);
      if (!Number.isFinite(parsed)) {
        ctx.addIssue({
          code: "custom",
          path: ["budget"],
          message: "Budget must be a number",
        });
      } else if (parsed < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["budget"],
          message: "Budget must be at least 0",
        });
      }
    }
  });

type ProjectFormValues = z.infer<typeof projectSchema>;

const FIELD_NAMES = [
  "client_id",
  "name",
  "reference",
  "description",
  "status",
  "priority",
  "health",
  "start_date",
  "due_date",
  "budget",
  "notes",
] as const;

type FieldName = (typeof FIELD_NAMES)[number];

function isFieldName(value: string): value is FieldName {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

function toDefaults(project?: Project | null): ProjectFormValues {
  return {
    client_id: project?.client_id ? String(project.client_id) : "",
    name: project?.name ?? "",
    reference: project?.reference ?? "",
    description: project?.description ?? "",
    status: project?.status ?? "draft",
    priority: project?.priority ?? "medium",
    health: project?.health ?? "good",
    start_date: project?.start_date ?? "",
    due_date: project?.due_date ?? "",
    budget: project?.budget ?? "",
    notes: project?.notes ?? "",
  };
}

function nullableTrim(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toPayload(
  values: ProjectFormValues,
): CreateProjectPayload & UpdateProjectPayload {
  return {
    client_id: Number(values.client_id),
    name: values.name.trim(),
    reference: nullableTrim(values.reference),
    description: nullableTrim(values.description),
    status: values.status,
    priority: values.priority,
    health: values.health,
    start_date: nullableTrim(values.start_date),
    due_date: nullableTrim(values.due_date),
    budget: nullableTrim(values.budget),
    notes: nullableTrim(values.notes),
  };
}

export type ProjectFormProps = {
  initialProject?: Project | null;
  clients: Client[];
  onSuccess: (project: Project) => void;
  onCancel?: () => void;
};

export function ProjectForm({
  initialProject,
  clients,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = Boolean(initialProject);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: toDefaults(initialProject),
  });

  useEffect(() => {
    form.reset(toDefaults(initialProject));
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProject?.id]);

  const onSubmit: SubmitHandler<ProjectFormValues> = async (values) => {
    setFormError(null);
    try {
      const payload = toPayload(values);
      const res = isEdit
        ? await updateProject(initialProject!.id, payload)
        : await createProject(payload);
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

  const clientIdValue = watch("client_id");
  const statusValue = watch("status");
  const priorityValue = watch("priority");
  const healthValue = watch("health");

  const clientItems = useMemo(
    () =>
      Object.fromEntries(
        clients.map((client) => [
          String(client.id),
          client.company_name || client.name,
        ]),
      ),
    [clients],
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
      aria-label={isEdit ? "Edit project" : "Create project"}
    >
      {formError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={errors.client_id ? true : undefined}>
          <FieldLabel htmlFor="project-client" required>
            Client
          </FieldLabel>
          <Select
            items={clientItems}
            value={clientIdValue || undefined}
            onValueChange={(value) => {
              if (value) {
                setValue("client_id", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }}
          >
            <SelectTrigger id="project-client" className="w-full">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={String(client.id)}>
                  {client.company_name || client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError
            errors={errors.client_id ? [errors.client_id] : undefined}
          />
        </Field>

        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="project-name" required>
            Name
          </FieldLabel>
          <Input
            id="project-name"
            autoComplete="off"
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <Field data-invalid={errors.reference ? true : undefined}>
          <FieldLabel htmlFor="project-reference">Reference</FieldLabel>
          <Input
            id="project-reference"
            autoComplete="off"
            placeholder="e.g. PRJ-2026-014"
            aria-invalid={errors.reference ? true : undefined}
            {...register("reference")}
          />
          <FieldError
            errors={errors.reference ? [errors.reference] : undefined}
          />
        </Field>

        <Field data-invalid={errors.description ? true : undefined}>
          <FieldLabel htmlFor="project-description">Description</FieldLabel>
          <Textarea
            id="project-description"
            rows={4}
            aria-invalid={errors.description ? true : undefined}
            {...register("description")}
          />
          <FieldError
            errors={errors.description ? [errors.description] : undefined}
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={errors.status ? true : undefined}>
            <FieldLabel htmlFor="project-status" required>
              Status
            </FieldLabel>
            <Select
              items={STATUS_LABELS}
              value={statusValue}
              onValueChange={(value) => {
                if (value) {
                  setValue("status", value as ProjectStatus, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <SelectTrigger id="project-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>

          <Field data-invalid={errors.priority ? true : undefined}>
            <FieldLabel htmlFor="project-priority" required>
              Priority
            </FieldLabel>
            <Select
              items={PRIORITY_LABELS}
              value={priorityValue}
              onValueChange={(value) => {
                if (value) {
                  setValue("priority", value as ProjectPriority, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <SelectTrigger id="project-priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              errors={errors.priority ? [errors.priority] : undefined}
            />
          </Field>

          <Field data-invalid={errors.health ? true : undefined}>
            <FieldLabel htmlFor="project-health" required>
              Health
            </FieldLabel>
            <Select
              items={HEALTH_LABELS}
              value={healthValue}
              onValueChange={(value) => {
                if (value) {
                  setValue("health", value as ProjectHealth, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <SelectTrigger id="project-health" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_HEALTHS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {HEALTH_LABELS[h]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors.health ? [errors.health] : undefined} />
          </Field>
        </div>
      </FieldGroup>

      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={errors.start_date ? true : undefined}>
            <FieldLabel htmlFor="project-start">Start date</FieldLabel>
            <Input
              id="project-start"
              type="date"
              aria-invalid={errors.start_date ? true : undefined}
              {...register("start_date")}
            />
            <FieldError
              errors={errors.start_date ? [errors.start_date] : undefined}
            />
          </Field>

          <Field data-invalid={errors.due_date ? true : undefined}>
            <FieldLabel htmlFor="project-due">Due date</FieldLabel>
            <Input
              id="project-due"
              type="date"
              aria-invalid={errors.due_date ? true : undefined}
              {...register("due_date")}
            />
            <FieldError
              errors={errors.due_date ? [errors.due_date] : undefined}
            />
          </Field>

          <Field data-invalid={errors.budget ? true : undefined}>
            <FieldLabel htmlFor="project-budget">Budget</FieldLabel>
            <Input
              id="project-budget"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              aria-invalid={errors.budget ? true : undefined}
              {...register("budget")}
            />
            <FieldError
              errors={errors.budget ? [errors.budget] : undefined}
            />
          </Field>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Field data-invalid={errors.notes ? true : undefined}>
          <FieldLabel htmlFor="project-notes">Notes</FieldLabel>
          <Textarea
            id="project-notes"
            rows={4}
            aria-invalid={errors.notes ? true : undefined}
            {...register("notes")}
          />
          <FieldError errors={errors.notes ? [errors.notes] : undefined} />
        </Field>
      </FieldGroup>

      <div className="flex items-center justify-end gap-2 border-t pt-4">
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
          {isEdit ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
