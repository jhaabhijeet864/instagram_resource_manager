// ==============================================================================
// POST /api/track + GET /api/track (health probe) tests.
// ==============================================================================
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/server/supabase")>();
  return {
    ...actual,
    insertAnalyticsEvent: vi.fn(async () => true),
    isSupabaseConfigured: vi.fn(() => true),
  };
});

import { insertAnalyticsEvent, isSupabaseConfigured } from "@/lib/server/supabase";
import { POST, GET } from "@/app/api/track/route";

const insertMock = vi.mocked(insertAnalyticsEvent);
const configuredMock = vi.mocked(isSupabaseConfigured);

const validEvent = {
  id: "evt_1",
  type: "PAGE_VISIT",
  resourceSlug: "rag-starter-kit",
  campaign: "IG-001",
  utm_source: "instagram",
  utm_medium: "comment_dm",
  referrer: "direct",
  metadata: { foo: "bar" },
  timestamp: new Date().toISOString(),
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  insertMock.mockClear().mockResolvedValue(true);
  configuredMock.mockClear().mockReturnValue(true);
});

describe("POST /api/track", () => {
  it.each(["PAGE_VISIT", "DOWNLOAD_CLICK", "DOWNLOAD_SUCCESS", "EMAIL_SIGNUP"])(
    "accepts known event type %s",
    async (type) => {
      const res = await post({ ...validEvent, type });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.synced).toBe(true);
      expect(insertMock).toHaveBeenCalledOnce();
    }
  );

  it("rejects unknown event types (allowlist)", async () => {
    const res = await post({ ...validEvent, type: "DELETE_ALL" });
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects non-object payloads", async () => {
    const res = await post("just a string");
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects missing type", async () => {
    const { type: _t, ...noType } = validEvent;
    const res = await post(noType);
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects null", async () => {
    const res = await post(null);
    expect(res.status).toBe(400);
  });

  it("rejects non-object metadata", async () => {
    const res = await post({ ...validEvent, metadata: "not an object" });
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects array metadata", async () => {
    const res = await post({ ...validEvent, metadata: [1, 2] });
    expect(res.status).toBe(400);
  });

  it("handles malformed JSON as 400", async () => {
    const res = await post("{bad json");
    expect(res.status).toBe(400);
  });

  it("reports server sync status (synced=false tolerated)", async () => {
    insertMock.mockResolvedValue(false);
    const res = await post(validEvent);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.synced).toBe(false);
  });
});

describe("GET /api/track (health probe)", () => {
  it("returns ok:true and service name", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.service).toBe("analytics");
  });

  it("reports supabase state", async () => {
    configuredMock.mockReturnValue(false);
    const json = await (await GET()).json();
    expect(json.supabase).toBe("local-only");
  });
});
