export type Customer = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
};

export type ApiResource<T> = { data: T };

export type ValidationErrorBody = {
  message: string;
  errors: Record<string, string[]>;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  path: string;
};

export type PaginatedResource<T> = {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
};

export const CLIENT_STATUSES = ["lead", "active", "inactive"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export type Client = {
  id: number;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateClientPayload = {
  name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: ClientStatus;
  notes?: string | null;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;

export type ClientFilters = {
  search?: string;
  status?: ClientStatus;
  page?: number;
  per_page?: number;
};
