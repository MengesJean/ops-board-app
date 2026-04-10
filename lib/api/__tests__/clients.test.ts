import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  createClient,
  deleteClient,
  fetchClient,
  fetchClients,
  updateClient,
} from "@/lib/api/clients";
import {
  ApiError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/api/errors";
import { server } from "@/test/mocks/server";
import { mockClients } from "@/test/mocks/fixtures/clients";

const API = "http://localhost:9999";

describe("fetchClients", () => {
  it("returns paginated clients with the mocked store", async () => {
    const result = await fetchClients();
    expect(result.data).toHaveLength(mockClients.length);
    expect(result.meta.total).toBe(mockClients.length);
    expect(result.meta.current_page).toBe(1);
    expect(result.meta.last_page).toBeGreaterThanOrEqual(1);
  });

  it("forwards query params for search and status", async () => {
    let capturedUrl: string | null = null;
    server.use(
      http.get(`${API}/api/clients`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(
          {
            data: [],
            links: { first: null, last: null, prev: null, next: null },
            meta: {
              current_page: 2,
              from: null,
              last_page: 5,
              per_page: 15,
              to: null,
              total: 0,
              path: "/api/clients",
            },
          },
          { status: 200 },
        );
      }),
    );
    await fetchClients({ search: "grace", status: "active", page: 2 });
    expect(capturedUrl).not.toBeNull();
    const url = new URL(capturedUrl!);
    expect(url.searchParams.get("search")).toBe("grace");
    expect(url.searchParams.get("status")).toBe("active");
    expect(url.searchParams.get("page")).toBe("2");
  });

  it("throws UnauthorizedError on 401", async () => {
    server.use(
      http.get(`${API}/api/clients`, () =>
        HttpResponse.json({ message: "Unauthenticated." }, { status: 401 }),
      ),
    );
    await expect(fetchClients()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

describe("fetchClient", () => {
  it("returns a single client", async () => {
    const res = await fetchClient(1);
    expect(res.data.id).toBe(1);
    expect(res.data.name).toBe(mockClients[0].name);
  });

  it("throws ApiError on 404", async () => {
    await expect(fetchClient(9999)).rejects.toBeInstanceOf(ApiError);
  });
});

describe("createClient", () => {
  it("creates a client with a valid payload", async () => {
    const res = await createClient({
      name: "New Client",
      status: "lead",
      email: "new@example.com",
    });
    expect(res.data.name).toBe("New Client");
    expect(res.data.status).toBe("lead");
    expect(res.data.id).toBeGreaterThan(0);
  });

  it("throws ValidationError when name is missing", async () => {
    let caught: unknown = null;
    try {
      await createClient({ name: "", status: "lead" });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationError);
    if (caught instanceof ValidationError) {
      expect(caught.errors.name).toBeDefined();
      expect(caught.errors.name[0]).toMatch(/name/i);
    }
  });

  it("bubbles up 422 for taken email", async () => {
    await expect(
      createClient({
        name: "Dup",
        email: "taken@example.com",
        status: "lead",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("updateClient", () => {
  it("updates an existing client", async () => {
    const res = await updateClient(1, { status: "inactive" });
    expect(res.data.status).toBe("inactive");
    expect(res.data.id).toBe(1);
  });

  it("throws ValidationError when clearing name", async () => {
    await expect(updateClient(1, { name: "" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});

describe("deleteClient", () => {
  it("resolves with null on 204", async () => {
    const res = await deleteClient(1);
    expect(res).toBeNull();
  });

  it("rejects when client does not exist", async () => {
    await expect(deleteClient(9999)).rejects.toBeInstanceOf(ApiError);
  });
});
