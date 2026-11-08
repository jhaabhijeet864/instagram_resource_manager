// ==============================================================================
// POST /api/newsletter tests.
// ==============================================================================
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/server/supabase")>();
  return { ...actual, insertEmailSignup: vi.fn(async () => true) };
});

vi.mock("@/lib/plugins/registry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/plugins/registry")>();
  return { ...actual, pluginRegistry: Object.assign(Object.create(Object.getPrototypeOf(actual.pluginRegistry)), actual.pluginRegistry, { dispatchLeadCaptured: vi.fn(async () => {}) }) };
});

import { insertEmailSignup } from "@/lib/server/supabase";
import { pluginRegistry } from "@/lib/plugins/registry";
import { POST } from "@/app/api/newsletter/route";

const insertMock = vi.mocked(insertEmailSignup);
const dispatchMock = vi.mocked(pluginRegistry.dispatchLeadCaptured);

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  insertMock.mockClear();
  dispatchMock.mockClear();
});

describe("POST /api/newsletter", () => {
  it("accepts a valid email and normalizes it", async () => {
    const res = await post({ email: "  Creator@Example.COM ", resourceSlug: "rag-starter-kit" });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(insertMock).toHaveBeenCalledWith("creator@example.com", "rag-starter-kit");
  });

  it("dispatches the lead to plugins with defaults", async () => {
    await post({ email: "a@b.co" });
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "a@b.co",
        resourceSlug: undefined,
        source: "newsletter_form",
      })
    );
  });

  it("rejects missing email", async () => {
    const res = await post({});
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects malformed emails", async () => {
    for (const bad of ["nope", "a@b", "@b.co", "a b@c.co"]) {
      const res = await post({ email: bad });
      expect(res.status, `"${bad}" should be rejected`).toBe(400);
    }
  });

  it("falls back to homepage_newsletter storage slug", async () => {
    await post({ email: "a@b.co" });
    expect(insertMock).toHaveBeenCalledWith("a@b.co", "homepage_newsletter");
  });

  it("plugin dispatch failures never break the signup", async () => {
    dispatchMock.mockRejectedValue(new Error("plugin exploded"));
    const res = await post({ email: "a@b.co" });
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const res = await post("{bad");
    expect(res.status).toBe(400);
  });
});
