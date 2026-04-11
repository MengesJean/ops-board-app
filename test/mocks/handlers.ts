import { http, HttpResponse } from "msw";

import type {
  Client,
  ClientStatus,
  CreateClientPayload,
  Customer,
  UpdateClientPayload,
} from "@/types/api";
import { mockClients, paginate } from "@/test/mocks/fixtures/clients";

const API = "http://localhost:9999";

export const mockCustomer: Customer = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
  email_verified_at: null,
  created_at: "2026-04-10T12:00:00+00:00",
};

// Mutable in-memory store so handlers can simulate CRUD within a single test.
// Tests that rely on a pristine state should call resetClientsStore() in beforeEach.
let clientsStore: Client[] = [...mockClients];
let nextClientId = clientsStore.reduce((max, c) => Math.max(max, c.id), 0) + 1;

export function resetClientsStore(): void {
  clientsStore = mockClients.map((c) => ({ ...c }));
  nextClientId = clientsStore.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

export function getClientsStore(): Client[] {
  return clientsStore;
}

function nowIso(): string {
  return new Date("2026-04-11T12:00:00+00:00").toISOString();
}

export const handlers = [
  http.get(`${API}/sanctum/csrf-cookie`, () =>
    new HttpResponse(null, {
      status: 204,
      headers: { "Set-Cookie": "XSRF-TOKEN=test-token; Path=/" },
    }),
  ),
  http.post(`${API}/api/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === "correct-password") {
      return HttpResponse.json({ data: mockCustomer }, { status: 200 });
    }
    return HttpResponse.json(
      {
        message: "These credentials do not match our records.",
        errors: {
          email: ["These credentials do not match our records."],
        },
      },
      { status: 422 },
    );
  }),
  http.post(`${API}/api/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      password_confirmation: string;
    };
    if (body.email === "taken@example.com") {
      return HttpResponse.json(
        {
          message: "The email has already been taken.",
          errors: {
            email: ["The email has already been taken."],
          },
        },
        { status: 422 },
      );
    }
    return HttpResponse.json({ data: mockCustomer }, { status: 201 });
  }),
  http.get(`${API}/api/me`, () =>
    HttpResponse.json({ data: mockCustomer }, { status: 200 }),
  ),
  http.post(`${API}/api/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/api/clients`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase().trim() ?? "";
    const status = url.searchParams.get("status") as ClientStatus | null;
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "15");

    let filtered = clientsStore;
    if (status) filtered = filtered.filter((c) => c.status === status);
    if (search) {
      filtered = filtered.filter((c) =>
        [c.name, c.company_name, c.email]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(search)),
      );
    }
    return HttpResponse.json(paginate(filtered, page, perPage), { status: 200 });
  }),

  http.get(`${API}/api/clients/:id`, ({ params }) => {
    const id = Number(params.id);
    const client = clientsStore.find((c) => c.id === id);
    if (!client) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    return HttpResponse.json({ data: client }, { status: 200 });
  }),

  http.post(`${API}/api/clients`, async ({ request }) => {
    const body = (await request.json()) as CreateClientPayload;
    const errors: Record<string, string[]> = {};
    if (!body.name || body.name.trim() === "") {
      errors.name = ["The name field is required."];
    }
    if (body.email === "taken@example.com") {
      errors.email = ["The email has already been taken."];
    }
    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { message: "The given data was invalid.", errors },
        { status: 422 },
      );
    }
    const client: Client = {
      id: nextClientId++,
      name: body.name,
      company_name: body.company_name ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      status: body.status,
      notes: body.notes ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    clientsStore = [client, ...clientsStore];
    return HttpResponse.json({ data: client }, { status: 201 });
  }),

  http.patch(`${API}/api/clients/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as UpdateClientPayload;
    const index = clientsStore.findIndex((c) => c.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    if (body.name !== undefined && body.name.trim() === "") {
      return HttpResponse.json(
        {
          message: "The given data was invalid.",
          errors: { name: ["The name field is required."] },
        },
        { status: 422 },
      );
    }
    const updated: Client = {
      ...clientsStore[index],
      ...body,
      company_name:
        body.company_name === undefined
          ? clientsStore[index].company_name
          : (body.company_name ?? null),
      email:
        body.email === undefined ? clientsStore[index].email : (body.email ?? null),
      phone:
        body.phone === undefined ? clientsStore[index].phone : (body.phone ?? null),
      notes:
        body.notes === undefined ? clientsStore[index].notes : (body.notes ?? null),
      updated_at: nowIso(),
    };
    clientsStore = [
      ...clientsStore.slice(0, index),
      updated,
      ...clientsStore.slice(index + 1),
    ];
    return HttpResponse.json({ data: updated }, { status: 200 });
  }),

  http.delete(`${API}/api/clients/:id`, ({ params }) => {
    const id = Number(params.id);
    const exists = clientsStore.some((c) => c.id === id);
    if (!exists) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    clientsStore = clientsStore.filter((c) => c.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
