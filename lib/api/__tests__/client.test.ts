import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { apiFetch } from "@/lib/api/client";
import { ApiError, ValidationError } from "@/lib/api/errors";
import { server } from "@/test/mocks/server";

const API = "http://localhost:9999";

function clearCookies() {
  for (const row of document.cookie.split("; ")) {
    const name = row.split("=")[0];
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  }
}

describe("apiFetch — CSRF preamble", () => {
  afterEach(() => {
    clearCookies();
  });

  it("throws ApiError when /sanctum/csrf-cookie fails", async () => {
    server.use(
      http.get(`${API}/sanctum/csrf-cookie`, () =>
        HttpResponse.text("boom", { status: 500 }),
      ),
      http.post(`${API}/api/ping`, () =>
        HttpResponse.json({ data: null }, { status: 200 }),
      ),
    );

    await expect(
      apiFetch("/api/ping", { method: "POST", body: {} }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe("apiFetch — validation parsing", () => {
  afterEach(() => {
    clearCookies();
  });

  it("does not classify 422 with errors: null as ValidationError", async () => {
    // Pre-seed the XSRF cookie so ensureCsrf short-circuits.
    document.cookie = "XSRF-TOKEN=stub; path=/";

    server.use(
      http.post(`${API}/api/ping`, () =>
        HttpResponse.json(
          { message: "invalid", errors: null },
          { status: 422 },
        ),
      ),
    );

    const promise = apiFetch("/api/ping", { method: "POST", body: {} });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.not.toBeInstanceOf(ValidationError);
  });
});
