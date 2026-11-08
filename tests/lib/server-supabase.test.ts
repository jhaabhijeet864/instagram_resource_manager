// ==============================================================================
// Server Supabase sync helper tests (env config, REST calls, failure paths).
// ==============================================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const ENV_KEYS = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
let savedEnv: Record<string, string | undefined> = {};

const fetchMock = vi.fn();

async function importHelpers() {
  return import("@/lib/server/supabase");
}

function resetEnv() {
  for (const k of ENV_KEYS) delete process.env[k];
}

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  resetEnv();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  vi.unstubAllGlobals();
});

const sampleEvent: any = {
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

describe("isSupabaseConfigured", () => {
  it("is false when nothing is configured", async () => {
    const { isSupabaseConfigured } = await importHelpers();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("is true when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set", async () => {
    process.env.SUPABASE_URL = "https://abc.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-key";
    const { isSupabaseConfigured } = await importHelpers();
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("falls back to NEXT_PUBLIC_SUPABASE_URL when SUPABASE_URL is missing", async () => {
    // .env.example documents NEXT_PUBLIC_SUPABASE_URL, so the module must accept it.
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-key";
    const { isSupabaseConfigured } = await importHelpers();
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("is false when only the service key is present", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-key";
    const { isSupabaseConfigured } = await importHelpers();
    expect(isSupabaseConfigured()).toBe(false);
  });
});

describe("insertAnalyticsEvent", () => {
  it("posts a correctly shaped row to the analytics_events table", async () => {
    process.env.SUPABASE_URL = "https://abc.supabase.co/";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-key";
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));

    const { insertAnalyticsEvent } = await importHelpers();
    const ok = await insertAnalyticsEvent(sampleEvent);

    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://abc.supabase.co/rest/v1/analytics_events");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.apikey).toBe("secret-key");
    expect(headers.Authorization).toBe("Bearer secret-key");
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      event_type: "PAGE_VISIT",
      resource_slug: "rag-starter-kit",
      campaign_name: "IG-001",
      utm_source: "instagram",
      utm_medium: "comment_dm",
      referrer: "direct",
      metadata: { foo: "bar" },
    });
  });

  it("returns false on non-2xx responses", async () => {
    process.env.SUPABASE_URL = "https://abc.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-key";
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    const { insertAnalyticsEvent } = await importHelpers();
    expect(await insertAnalyticsEvent(sampleEvent)).toBe(false);
  });

  it("returns false (never throws) when the network fails", async () => {
    process.env.SUPABASE_URL = "https://abc.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-key";
    fetchMock.mockRejectedValue(new Error("offline"));

    const { insertAnalyticsEvent } = await importHelpers();
    expect(await insertAnalyticsEvent(sampleEvent)).toBe(false);
  });

  it("no-ops and never calls fetch when unconfigured", async () => {
    const { insertAnalyticsEvent } = await importHelpers();
    expect(await insertAnalyticsEvent(sampleEvent)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("insertEmailSignup", () => {
  it("posts to the email_signups table", async () => {
    process.env.SUPABASE_URL = "https://abc.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-key";
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));

    const { insertEmailSignup } = await importHelpers();
    const ok = await insertEmailSignup("a@b.co", "rag-starter-kit");

    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://abc.supabase.co/rest/v1/email_signups");
    expect(JSON.parse(init.body)).toEqual({ email: "a@b.co", resource_slug: "rag-starter-kit" });
  });

  it("no-ops and never calls fetch when unconfigured", async () => {
    const { insertEmailSignup } = await importHelpers();
    expect(await insertEmailSignup("a@b.co", "x")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
