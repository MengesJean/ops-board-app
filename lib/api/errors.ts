import type { ValidationErrorBody } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class ValidationError extends ApiError {
  readonly errors: Record<string, string[]>;

  constructor(status: number, body: ValidationErrorBody) {
    super(status, body.message, body);
    this.name = "ValidationError";
    this.errors = body.errors ?? {};
  }
}

export class UnauthorizedError extends ApiError {
  constructor(body: unknown) {
    super(401, "Unauthenticated.", body);
    this.name = "UnauthorizedError";
  }
}

export function isValidationError(err: unknown): err is ValidationError {
  return err instanceof ValidationError;
}

export function isUnauthorized(err: unknown): err is UnauthorizedError {
  return err instanceof UnauthorizedError;
}
