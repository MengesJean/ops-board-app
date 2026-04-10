import { http, HttpResponse } from "msw";

import type { Customer } from "@/types/api";

const API = "http://localhost:9999";

export const mockCustomer: Customer = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
  email_verified_at: null,
  created_at: "2026-04-10T12:00:00+00:00",
};

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
];
