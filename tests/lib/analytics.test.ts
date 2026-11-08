// ==============================================================================
// Analytics engine tests: storage resilience, logging, aggregation math.
// The browser globals (window/localStorage/document) are stubbed per-test.
// ==============================================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as analytics from "@/lib/analytics";
import { BENCHMARK_CAMPAIGNS } from "@/lib/catalog";

type Store = Record<string, string>;
let store: Store;
const fetchMock = vi.fn();

function makeGlobals() {
  store = {};
  const ls = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };
  vi.stubGlobal("window", { location: { search: "", origin: "https://test.local" }, localStorage: ls });
  vi.stubGlobal("document", { referrer: "" });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
}

function factoryEvent(partial: Partial<analytics.AnalyticsEvent>): analytics.AnalyticsEvent {
  return {
    id: "evt_x",
    type: "PAGE_VISIT",
    resourceSlug: "rag-starter-kit",
    campaign: "direct",
    utm_source: "instagram",
    utm_medium: "comment_dm",
    referrer: "direct",
    metadata: {},
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

beforeEach(makeGlobals);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("event storage resilience", () => {
  it("returns [] when nothing is stored", () => {
    expect(analytics.getStoredEvents()).toEqual([]);
    expect(analytics.getStoredEmails()).toEqual([]);
  });

  it("returns stored events", () => {
    const evt = factoryEvent({});
    store["creator_hub_analytics_events"] = JSON.stringify([evt]);
    expect(analytics.getStoredEvents()).toEqual([evt]);
  });

  it("returns [] on corrupt JSON instead of throwing", () => {
    store["creator_hub_analytics_events"] = "{not json";
    expect(analytics.getStoredEvents()).toEqual([]);
    store["creator_hub_email_signups"] = "{nope";
    expect(analytics.getStoredEmails()).toEqual([]);
  });

  it("returns [] when stored value is not an array (e.g. object from an old version)", () => {
    store["creator_hub_analytics_events"] = JSON.stringify({ oops: true });
    expect(analytics.getStoredEvents()).toEqual([]);
    store["creator_hub_email_signups"] = JSON.stringify("just a string");
    expect(analytics.getStoredEmails()).toEqual([]);
  });
});

describe("campaign param extraction", () => {
  it("extracts UTMs from a search string", () => {
    const p = analytics.getCampaignParams("?utm_source=instagram&utm_medium=reel&utm_campaign=IG-001");
    expect(p.utm_source).toBe("instagram");
    expect(p.utm_medium).toBe("reel");
    expect(p.utm_campaign).toBe("IG-001");
  });

  it("falls back to defaults when absent", () => {
    const p = analytics.getCampaignParams("");
    expect(p.utm_source).toBe("instagram");
    expect(p.utm_medium).toBe("comment_dm");
    expect(p.utm_campaign).toBe("direct");
  });

  it("accepts legacy 'campaign' param", () => {
    expect(analytics.getCampaignParams("?campaign=IG-009").utm_campaign).toBe("IG-009");
  });
});

describe("logEvent family", () => {
  it("logs a visit with id prefix and CAMPAIGN defaults", () => {
    const evt = analytics.logVisit("rag-starter-kit");
    expect(evt.id).toMatch(/^evt_\d+_/);
    expect(evt.type).toBe("PAGE_VISIT");
    expect(evt.resourceSlug).toBe("rag-starter-kit");
    expect(analytics.getStoredEvents()).toHaveLength(1);
    // fire-and-forget server sync happened
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/track");
  });

  it("distinguishes DOWNLOAD_CLICK from DOWNLOAD_SUCCESS", () => {
    analytics.logDownloadClick("rag-starter-kit");
    analytics.logDownloadServed("rag-starter-kit");
    const types = analytics.getStoredEvents().map((e) => e.type);
    expect(types).toEqual(["DOWNLOAD_CLICK", "DOWNLOAD_SUCCESS"]);
  });

  it("logs email signup locally and as an event with metadata", () => {
    const evt = analytics.logEmailSignup("rag-starter-kit", "a@b.co");
    expect(evt.type).toBe("EMAIL_SIGNUP");
    expect(evt.metadata).toEqual({ email: "a@b.co" });
    expect(analytics.getStoredEmails()).toEqual([
      expect.objectContaining({ email: "a@b.co", resourceSlug: "rag-starter-kit" }),
    ]);
  });

  it("caps stored events at 1500 (keeps most recent)", () => {
    const prefill = [] as analytics.AnalyticsEvent[];
    for (let i = 0; i < 1500; i++) {
      prefill.push(factoryEvent({ id: `old_${i}` }));
    }
    store["creator_hub_analytics_events"] = JSON.stringify(prefill);
    analytics.logVisit("rag-starter-kit");
    const events = analytics.getStoredEvents();
    expect(events).toHaveLength(1500);
    expect(events[0].id).toBe("old_1"); // oldest dropped
    expect(events[1499].type).toBe("PAGE_VISIT"); // newest kept
  });
});

describe("getMetrics aggregation", () => {
  beforeEach(() => {
    store["creator_hub_analytics_events"] = JSON.stringify([]);
  });

  it("seeds benchmark campaigns with zero live events", () => {
    const m = analytics.getMetrics();
    expect(m.totalVisits).toBe(0);
    expect(m.deliveryRate).toBe(100); // no downloads => nothing undelivered
    // every benchmark campaign is present and flagged as benchmark
    const benchIds = BENCHMARK_CAMPAIGNS.map((c) => c.campaign_id);
    const seeded = m.campaigns.filter((c) => c.isBenchmark).map((c) => c.campaign_id);
    expect([...new Set(benchIds)]).toEqual(benchIds); // benchmark ids unique in data
    expect(new Set(seeded)).toEqual(new Set(benchIds));
    const bench = BENCHMARK_CAMPAIGNS[0];
    const ig = m.campaigns.find((c) => c.campaign_id === bench.campaign_id);
    expect(ig?.dm_sent).toBe(bench.dm_sent);
    expect(ig?.page_visits).toBe(bench.page_visits);
  });

  it("counts event types and computes conversion/delivery rates", () => {
    const bench = BENCHMARK_CAMPAIGNS[0];
    const events = [
      factoryEvent({ id: "1", type: "PAGE_VISIT", resourceSlug: "rag-starter-kit", campaign: bench.campaign_id }),
      factoryEvent({ id: "2", type: "PAGE_VISIT", resourceSlug: "rag-starter-kit", campaign: bench.campaign_id }),
      factoryEvent({ id: "3", type: "DOWNLOAD_CLICK", resourceSlug: "rag-starter-kit", campaign: bench.campaign_id }),
      factoryEvent({ id: "4", type: "DOWNLOAD_SUCCESS", resourceSlug: "rag-starter-kit", campaign: bench.campaign_id }),
      factoryEvent({ id: "5", type: "EMAIL_SIGNUP", resourceSlug: "rag-starter-kit", campaign: bench.campaign_id }),
    ];
    store["creator_hub_analytics_events"] = JSON.stringify(events);
    const m = analytics.getMetrics();

    expect(m.totalVisits).toBe(2);
    expect(m.totalDownloads).toBe(1);
    expect(m.totalServed).toBe(1);
    expect(m.totalSignups).toBe(1);
    expect(m.overallConversionRate).toBe(50); // 1 click / 2 visits
    expect(m.deliveryRate).toBe(100); // 1 served / 1 click

    const rag = m.resources.find((r) => r.slug === "rag-starter-kit");
    expect(rag).toEqual({ slug: "rag-starter-kit", visits: 2, downloads: 1, served: 1, signups: 1 });

    // Live events land in the matching benchmark campaign buckets
    const ig = m.campaigns.find((c) => c.campaign_id === bench.campaign_id);
    expect(ig?.page_visits).toBe(bench.page_visits + 2);
    expect(ig?.successful_downloads).toBe(bench.successful_downloads + 1);
  });

  it("creates live campaign buckets for unknown campaigns", () => {
    const events = [
      factoryEvent({ id: "1", type: "PAGE_VISIT", campaign: "NEW-REEL" }),
      factoryEvent({ id: "2", type: "DOWNLOAD_SUCCESS", campaign: "NEW-REEL", resourceSlug: "x" }),
    ];
    store["creator_hub_analytics_events"] = JSON.stringify(events);
    const m = analytics.getMetrics();
    const bucket = m.campaigns.find((c) => c.campaign_id === "NEW-REEL");
    expect(bucket).toBeTruthy();
    expect(bucket?.isBenchmark).toBe(false);
    expect(bucket?.page_visits).toBe(1);
    expect(bucket?.successful_downloads).toBe(1);
    // aggregate live visits (1) + every benchmark's page visits
    const benchVisits = BENCHMARK_CAMPAIGNS.reduce(
      (sum, c) => sum + (c.page_visits || 0),
      0
    );
    expect(m.aggregate.visits).toBe(1 + benchVisits);
  });

  it("tolerates malformed event objects (defensive aggregation)", () => {
    const events = [factoryEvent({ type: "PAGE_VISIT" })];
    // @ts-expect-error deliberately push malformed data
    events.push(null);
    store["creator_hub_analytics_events"] = JSON.stringify(events);
    const m = analytics.getMetrics();
    expect(m.totalVisits).toBeGreaterThanOrEqual(0);
    expect(m.campaigns.length).toBeGreaterThanOrEqual(5);
  });

  it("returns most recent 30 events, newest first", () => {
    const events = [] as analytics.AnalyticsEvent[];
    for (let i = 0; i < 40; i++) events.push(factoryEvent({ id: String(i) }));
    store["creator_hub_analytics_events"] = JSON.stringify(events);
    const m = analytics.getMetrics();
    expect(m.recentEvents).toHaveLength(30);
    expect(m.recentEvents[0].id).toBe("39");
  });
});

describe("buildTrackedUrl", () => {
  const savedSite = process.env.NEXT_PUBLIC_SITE_URL;
  const savedApp = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (savedSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = savedSite;
    if (savedApp === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = savedApp;
  });

  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://creator.example";
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(analytics.buildTrackedUrl("rag-starter-kit", "IG-001")).toBe(
      "https://creator.example/r/rag-starter-kit?utm_source=instagram&utm_medium=comment_dm&utm_campaign=IG-001"
    );
  });

  it("falls back to NEXT_PUBLIC_APP_URL (the documented var) when SITE_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://app-url.example";
    expect(analytics.buildTrackedUrl("rag-starter-kit", "IG-001").startsWith("https://app-url.example/r/")).toBe(true);
  });

  it("falls back to window.location.origin when no env is set and encodes the campaign", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    const url = analytics.buildTrackedUrl("rag-starter-kit", "reel & promo");
    expect(url.startsWith("https://test.local/r/rag-starter-kit")).toBe(true);
    expect(url.endsWith("utm_campaign=reel%20%26%20promo")).toBe(true);
  });
});

describe("clearAnalytics", () => {
  it("clears stored events and emails", () => {
    store["creator_hub_analytics_events"] = "[]";
    store["creator_hub_email_signups"] = "[]";
    analytics.clearAnalytics();
    expect(analytics.getStoredEvents()).toEqual([]);
    expect(analytics.getStoredEmails()).toEqual([]);
  });

  it("is safe to call server-side (no window)", () => {
    vi.unstubAllGlobals(); // window/document no longer defined
    expect(() => analytics.clearAnalytics()).not.toThrow();
  });
});
