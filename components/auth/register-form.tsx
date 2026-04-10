"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { isValidationError } from "@/lib/api/errors";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const FIELDS = ["name", "email", "password", "password_confirmation"] as const;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerCustomer } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterValues> = async (values) => {
    setFormError(null);
    try {
      await registerCustomer(values);
      router.replace("/dashboard");
    } catch (err) {
      if (isValidationError(err)) {
        for (const [field, messages] of Object.entries(err.errors)) {
          if ((FIELDS as readonly string[]).includes(field)) {
            form.setError(field as (typeof FIELDS)[number], {
              message: messages[0],
            });
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
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        {formError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="register-name">Name</FieldLabel>
          <Input
            id="register-name"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <Field data-invalid={errors.email ? true : undefined}>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>
        <Field data-invalid={errors.password ? true : undefined}>
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? true : undefined}
            {...register("password")}
          />
          <FieldError
            errors={errors.password ? [errors.password] : undefined}
          />
        </Field>
        <Field data-invalid={errors.password_confirmation ? true : undefined}>
          <FieldLabel htmlFor="register-password-confirmation">
            Confirm password
          </FieldLabel>
          <Input
            id="register-password-confirmation"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password_confirmation ? true : undefined}
            {...register("password_confirmation")}
          />
          <FieldError
            errors={
              errors.password_confirmation
                ? [errors.password_confirmation]
                : undefined
            }
          />
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </FieldGroup>
    </form>
  );
}
