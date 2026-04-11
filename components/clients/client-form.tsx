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
import { createClient, updateClient } from "@/lib/api/clients";
import { isValidationError } from "@/lib/api/errors";
import type {
  Client,
  ClientStatus,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/types/api";
import { CLIENT_STATUSES } from "@/types/api";

const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  company_name: z.string().max(255, "Company name is too long").optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email is too long")
    .email("Enter a valid email"),
  phone: z.string().max(50, "Phone is too long").optional(),
  status: z.enum(CLIENT_STATUSES),
  notes: z.string().max(2000, "Notes are too long").optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const FIELD_NAMES = [
  "name",
  "company_name",
  "email",
  "phone",
  "status",
  "notes",
] as const;

type FieldName = (typeof FIELD_NAMES)[number];

function isFieldName(value: string): value is FieldName {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

function toDefaults(client?: Client | null): ClientFormValues {
  return {
    name: client?.name ?? "",
    company_name: client?.company_name ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    status: client?.status ?? "lead",
    notes: client?.notes ?? "",
  };
}

function toPayload(
  values: ClientFormValues,
): CreateClientPayload & UpdateClientPayload {
  return {
    name: values.name.trim(),
    company_name: values.company_name?.trim() ? values.company_name.trim() : null,
    email: values.email.trim(),
    phone: values.phone?.trim() ? values.phone.trim() : null,
    status: values.status,
    notes: values.notes?.trim() ? values.notes.trim() : null,
  };
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  lead: "Lead",
  active: "Active",
  inactive: "Inactive",
};

export type ClientFormProps = {
  initialClient?: Client | null;
  onSuccess: (client: Client) => void;
  onCancel?: () => void;
};

export function ClientForm({
  initialClient,
  onSuccess,
  onCancel,
}: ClientFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = Boolean(initialClient);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: toDefaults(initialClient),
  });

  // When `initialClient` changes (e.g. opening the sheet for a different row),
  // reset the form so it reflects the new subject.
  useEffect(() => {
    form.reset(toDefaults(initialClient));
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialClient?.id]);

  const onSubmit: SubmitHandler<ClientFormValues> = async (values) => {
    setFormError(null);
    try {
      const payload = toPayload(values);
      const res = isEdit
        ? await updateClient(initialClient!.id, payload)
        : await createClient(payload);
      onSuccess(res.data);
    } catch (err) {
      if (isValidationError(err)) {
        for (const [field, messages] of Object.entries(err.errors)) {
          const message = messages[0];
          if (message && isFieldName(field)) {
            const name: FieldName = field;
            form.setError(name, { message });
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

  // Subscribe to status so the Select reflects current value.
  const statusValue = watch("status");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
      aria-label={isEdit ? "Edit client" : "Create client"}
    >
      <FieldGroup>
        {formError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="client-name" required>
            Name
          </FieldLabel>
          <Input
            id="client-name"
            autoComplete="off"
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <Field data-invalid={errors.company_name ? true : undefined}>
          <FieldLabel htmlFor="client-company">Company</FieldLabel>
          <Input
            id="client-company"
            autoComplete="off"
            aria-invalid={errors.company_name ? true : undefined}
            {...register("company_name")}
          />
          <FieldError
            errors={errors.company_name ? [errors.company_name] : undefined}
          />
        </Field>

        <Field data-invalid={errors.email ? true : undefined}>
          <FieldLabel htmlFor="client-email" required>
            Email
          </FieldLabel>
          <Input
            id="client-email"
            type="email"
            autoComplete="off"
            aria-invalid={errors.email ? true : undefined}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field data-invalid={errors.phone ? true : undefined}>
          <FieldLabel htmlFor="client-phone">Phone</FieldLabel>
          <Input
            id="client-phone"
            type="tel"
            autoComplete="off"
            aria-invalid={errors.phone ? true : undefined}
            {...register("phone")}
          />
          <FieldError errors={errors.phone ? [errors.phone] : undefined} />
        </Field>

        <Field data-invalid={errors.status ? true : undefined}>
          <FieldLabel htmlFor="client-status" required>
            Status
          </FieldLabel>
          <Select
            value={statusValue}
            onValueChange={(value) => {
              if (value) {
                setValue("status", value as ClientStatus, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }}
          >
            <SelectTrigger id="client-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={errors.status ? [errors.status] : undefined} />
        </Field>

        <Field data-invalid={errors.notes ? true : undefined}>
          <FieldLabel htmlFor="client-notes">Notes</FieldLabel>
          <Textarea
            id="client-notes"
            rows={4}
            aria-invalid={errors.notes ? true : undefined}
            {...register("notes")}
          />
          <FieldError errors={errors.notes ? [errors.notes] : undefined} />
        </Field>
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
          {isEdit ? "Save changes" : "Create client"}
        </Button>
      </div>
    </form>
  );
}
