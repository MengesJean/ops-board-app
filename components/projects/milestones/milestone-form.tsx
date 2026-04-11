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
import {
  createProjectMilestone,
  updateProjectMilestone,
} from "@/lib/api/milestones";
import { MILESTONE_STATUS_LABELS } from "@/lib/milestones/formatters";
import type {
  CreateMilestonePayload,
  Milestone,
  MilestoneStatus,
  UpdateMilestonePayload,
} from "@/types/api";
import { MILESTONE_STATUSES } from "@/types/api";

const milestoneSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long"),
  description: z
    .string()
    .max(5000, "Description is too long")
    .optional(),
  status: z.enum(MILESTONE_STATUSES),
  due_date: z.string().optional(),
});

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

const FIELD_NAMES = ["title", "description", "status", "due_date"] as const;
type FieldName = (typeof FIELD_NAMES)[number];

function isFieldName(value: string): value is FieldName {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

function toDefaults(milestone?: Milestone | null): MilestoneFormValues {
  return {
    title: milestone?.title ?? "",
    description: milestone?.description ?? "",
    status: milestone?.status ?? "pending",
    due_date: milestone?.due_date ?? "",
  };
}

function nullableTrim(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toPayload(
  values: MilestoneFormValues,
): CreateMilestonePayload & UpdateMilestonePayload {
  return {
    title: values.title.trim(),
    description: nullableTrim(values.description),
    status: values.status,
    due_date: nullableTrim(values.due_date),
  };
}

export type MilestoneFormProps = {
  projectId: number;
  initialMilestone?: Milestone | null;
  onSuccess: (milestone: Milestone) => void;
  onCancel?: () => void;
};

export function MilestoneForm({
  projectId,
  initialMilestone,
  onSuccess,
  onCancel,
}: MilestoneFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = Boolean(initialMilestone);

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: toDefaults(initialMilestone),
  });

  useEffect(() => {
    form.reset(toDefaults(initialMilestone));
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMilestone?.id]);

  const onSubmit: SubmitHandler<MilestoneFormValues> = async (values) => {
    setFormError(null);
    try {
      const payload = toPayload(values);
      const res = isEdit
        ? await updateProjectMilestone(
            projectId,
            initialMilestone!.id,
            payload,
          )
        : await createProjectMilestone(projectId, payload);
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-1 flex-col gap-6 overflow-y-auto p-4"
      aria-label={isEdit ? "Edit milestone" : "Create milestone"}
    >
      {formError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={errors.title ? true : undefined}>
          <FieldLabel htmlFor="milestone-title" required>
            Title
          </FieldLabel>
          <Input
            id="milestone-title"
            autoComplete="off"
            placeholder="e.g. Design ready"
            aria-invalid={errors.title ? true : undefined}
            {...register("title")}
          />
          <FieldError errors={errors.title ? [errors.title] : undefined} />
        </Field>

        <Field data-invalid={errors.description ? true : undefined}>
          <FieldLabel htmlFor="milestone-description">Description</FieldLabel>
          <Textarea
            id="milestone-description"
            rows={4}
            placeholder="What does this milestone deliver?"
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
            <FieldLabel htmlFor="milestone-status" required>
              Status
            </FieldLabel>
            <Select
              items={MILESTONE_STATUS_LABELS}
              value={statusValue}
              onValueChange={(value) => {
                if (value) {
                  setValue("status", value as MilestoneStatus, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <SelectTrigger id="milestone-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MILESTONE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {MILESTONE_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>

          <Field data-invalid={errors.due_date ? true : undefined}>
            <FieldLabel htmlFor="milestone-due">Due date</FieldLabel>
            <Input
              id="milestone-due"
              type="date"
              aria-invalid={errors.due_date ? true : undefined}
              {...register("due_date")}
            />
            <FieldError
              errors={errors.due_date ? [errors.due_date] : undefined}
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
          {isEdit ? "Save changes" : "Create milestone"}
        </Button>
      </div>
    </form>
  );
}
