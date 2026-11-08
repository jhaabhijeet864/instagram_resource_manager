"use client";

// ==============================================================================
// ANALYTICS & CAMPAIGN TRACKING ENGINE (Browser side)
// Tracks: Page Visits, Download Click, Download Served, Email Signups, and
// UTM Campaigns (Instagram Reels, Carousels, Manychat DMs).
//
// Dual Storage:
//   1. Instant LocalStorage engine (works with zero configuration)
//   2. Server sync via POST /api/track -> Supabase (if env vars are set).
//
// NOTE: A Download CLICK (user intent) is logged separately from a Download
// SUCCESS (the API route actually redirecting to the stored file). Do not
// treat them as the same metric.
// ==============================================================================

import { BENCHMARK_CAMPAIGNS } from "@/lib/catalog";

export type EventType = "PAGE_VISIT" | "DOWNLOAD_CLICK" | "DOWNLOAD_SUCCESS" | "EMAIL_SIGNUP";

export interface AnalyticsEvent {
  id: string;
  type: EventType; // 'PAGE_VISIT' | 'DOWNLOAD_CLICK' | 'DOWNLOAD_SUCCESS' | 'EMAIL_SIGNUP'
  resourceSlug: string;
  campaign: string;
  utm_source: string;
  utm_medium: string;
  referrer: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface CampaignRecord {
  campaign_id: string;
  campaign: string;
  resource_id: string;
  resourceSlug: string;
  instagram_post: string;
  keyword: string;
  dm_sent: number;
  dm_clicks: number;
  page_visits: number;
  download_clicks: number;
  successful_downloads: number;
  email_signups: number;
  isBenchmark: boolean;
}

const STORAGE_KEY = "creator_hub_analytics_events";
const EMAILS_KEY = "creator_hub_email_signups";

/** Extract UTM & campaign parameters from a URL search string. */
export function getCampaignParams(search?: string) {
  const params = new URLSearchParams(search ?? (typeof window !== "undefined" ? window.location.search : ""));
  return {
    utm_source: params.get("utm_source") || "instagram",
    utm_medium: params.get("utm_medium") || "comment_dm",
    utm_campaign: params.get("utm_campaign") || params.get("campaign") || "direct",
    utm_content: params.get("utm_content") || "",
    referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
  };
}

export function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    // Guard against non-array payloads left by older versions
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

export function getStoredEmails(): { email: string; resourceSlug: string; timestamp: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EMAILS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function recordLocalEvent(event: AnalyticsEvent) {
  try {
    const events = getStoredEvents();
    events.push(event);
    // Keep last 1,500 events to avoid localStorage bloat
    if (events.length > 1500) events.splice(0, events.length - 1500);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    /* storage full or blocked - ignore */
  }
}

/** Fire-and-forget server sync (Supabase via /api/track). */
async function syncToServer(event: AnalyticsEvent) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    /* offline or not configured - local engine still */
  }
}

/** Main event logger */
function logEvent(type: EventType, resourceSlug: string, metadata: Record<string, unknown> = {}): AnalyticsEvent {
  const meta = getCampaignParams();
  const event: AnalyticsEvent = {
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    type,
    resourceSlug: resourceSlug || "unknown",
    campaign: meta.utm_campaign,
    utm_source: meta.utm_source,
    utm_medium: meta.utm_medium,
    referrer: meta.referrer,
    metadata,
    timestamp: new Date().toISOString(),
  };
  recordLocalEvent(event);
  syncToServer(event);
  return event;
}

/** 1. Log a resource page visit */
export function logVisit(resourceSlug: string) {
  return logEvent("PAGE_VISIT", resourceSlug);
}

/** 2. Log download button click (user intent). The server logs the actual
 *  file-serve event separately when it redirects to the stored file. */
export function logDownloadClick(resourceSlug: string) {
  return logEvent("DOWNLOAD_CLICK", resourceSlug);
}

/** 3. Log a successful server response (file served / redirected) */
export function logDownloadServed(resourceSlug: string) {
  return logEvent("DOWNLOAD_SUCCESS", resourceSlug);
}

/** 4. Log email newsletter / update signup */
export function logEmailSignup(resourceSlug: string, email: string) {
  try {
    const emails = getStoredEmails();
    emails.push({ email, resourceSlug, timestamp: new Date().toISOString() });
    window.localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
  } catch {
    /* ignore */
  }
  return logEvent("EMAIL_SIGNUP", resourceSlug, { email });
}

/** Build a Manychat-ready tracked URL for a resource. */
export function buildTrackedUrl(slug: string, campaign: string): string {
  // NEXT_PUBLIC_SITE_URL is preferred; NEXT_PUBLIC_APP_URL is the fallback the
  // rest of the codebase (and .env.example) documents.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/r/${slug}?utm_source=instagram&utm_medium=comment_dm&utm_campaign=${encodeURIComponent(campaign)}`;
}

/** Clear all analytics data (local). Safe to call server-side / from SSR. */
export function clearAnalytics() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(EMAILS_KEY);
}

/** Export events as a downloadable JSON file */
export function exportEventsJson() {
  const events = getStoredEvents();
  if (typeof document === "undefined" || events.length === 0) return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
  const a = document.createElement("a");
  a.href = dataStr;
  a.download = `creator_analytics_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
}

/** Export events as a downloadable CSV file */
export function exportEventsCsv() {
  const events = getStoredEvents();
  if (typeof document === "undefined") return;
  if (events.length === 0) {
    window.alert("No analytics events recorded yet to export.");
    return;
  }
  const headers = ["id", "type", "resourceSlug", "campaign", "utm_source", "utm_medium", "timestamp"];
  const rows = events.map((e) => [e.id, e.type, e.resourceSlug, e.campaign, e.utm_source, e.utm_medium, e.timestamp]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const a = document.createElement("a");
  a.href = encodeURI(csvContent);
  a.download = `creator_analytics_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}

// ==============================================================================
// AGGREGATED METRICS FOR THE DASHBOARD
// ==============================================================================
export interface Metrics {
  totalVisits: number;
  totalDownloads: number;
  totalServed: number;
  totalSignups: number;
  overallConversionRate: number;
  deliveryRate: number;
  aggregate: {
    dmsSent: number;
    dmClicks: number;
    visits: number;
    downloadClicks: number;
    successfulDownloads: number;
    emailSignups: number;
  };
  resources: { slug: string; visits: number; downloads: number; served: number; signups: number }[];
  campaigns: CampaignRecord[];
  recentEvents: AnalyticsEvent[];
}

export function getMetrics(): Metrics {
  const events = getStoredEvents();

  let totalVisits = 0;
  let totalDownloads = 0;
  let totalServed = 0;
  let totalSignups = 0;

  const resourceMap: Record<string, { slug: string; visits: number; downloads: number; served: number; signups: number }> = {};
  const campaignMap: Record<string, CampaignRecord> = {};

  // Seed benchmark campaigns
  BENCHMARK_CAMPAIGNS.forEach((c) => {
    campaignMap[c.campaign_id] = {
      campaign_id: c.campaign_id,
      campaign: c.campaign_id,
      resource_id: c.resource_id,
      resourceSlug: c.resource_slug,
      instagram_post: c.instagram_post,
      keyword: c.keyword,
      dm_sent: c.dm_sent || 0,
      dm_clicks: c.dm_clicks || 0,
      page_visits: c.page_visits || 0,
      download_clicks: c.download_clicks || 0,
      successful_downloads: c.successful_downloads || 0,
      email_signups: c.email_signups || 0,
      isBenchmark: true,
    };
  });

  events.forEach((evt) => {
    // Defensive: malformed stored entries (null / old versions) must not crash the dashboard
    if (!evt || typeof evt !== "object") return;
    if (evt.type === "PAGE_VISIT") totalVisits++;
    if (evt.type === "DOWNLOAD_CLICK") totalDownloads++;
    if (evt.type === "DOWNLOAD_SUCCESS") totalServed++;
    if (evt.type === "EMAIL_SIGNUP") totalSignups++;

    const slug = evt.resourceSlug || "unknown";
    if (!resourceMap[slug]) resourceMap[slug] = { slug, visits: 0, downloads: 0, served: 0, signups: 0 };
    if (evt.type === "PAGE_VISIT") resourceMap[slug].visits++;
    if (evt.type === "DOWNLOAD_CLICK") resourceMap[slug].downloads++;
    if (evt.type === "DOWNLOAD_SUCCESS") resourceMap[slug].served++;
    if (evt.type === "EMAIL_SIGNUP") resourceMap[slug].signups++;

    const camp = evt.campaign || "direct";
    let target = campaignMap[camp];
    if (!target) {
      target = {
        campaign_id: camp,
        campaign: camp,
        resource_id: "RES-LIVE",
        resourceSlug: slug,
        instagram_post: `Live Campaign (${camp})`,
        keyword: "LINK",
        dm_sent: 0,
        dm_clicks: 0,
        page_visits: 0,
        download_clicks: 0,
        successful_downloads: 0,
        email_signups: 0,
        isBenchmark: false,
      };
      campaignMap[camp] = target;
    }
    if (evt.type === "PAGE_VISIT") target.page_visits++;
    if (evt.type === "DOWNLOAD_CLICK") target.download_clicks++;
    if (evt.type === "DOWNLOAD_SUCCESS") target.successful_downloads++;
    if (evt.type === "EMAIL_SIGNUP") target.email_signups++;
  });

  const campaigns = Object.values(campaignMap);
  let aggregateDMsSent = 0;
  let aggregateDMClicks = 0;
  let aggregateVisits = totalVisits;
  let aggregateDownloads = totalDownloads;
  let aggregateServed = totalServed;
  let aggregateSignups = totalSignups;

  campaigns.forEach((c) => {
    aggregateDMsSent += c.dm_sent || 0;
    aggregateDMClicks += c.dm_clicks || 0;
    if (c.isBenchmark) {
      aggregateVisits += c.page_visits || 0;
      aggregateDownloads += c.download_clicks || 0;
      aggregateServed += c.successful_downloads || 0;
      aggregateSignups += c.email_signups || 0;
    }
  });

  return {
    totalVisits,
    totalDownloads,
    totalServed,
    totalSignups,
    overallConversionRate: totalVisits > 0 ? Math.round((totalDownloads / totalVisits) * 100) : 0,
    deliveryRate: totalDownloads > 0 ? Math.round((totalServed / totalDownloads) * 100) : 100,
    aggregate: {
      dmsSent: aggregateDMsSent,
      dmClicks: aggregateDMClicks,
      visits: aggregateVisits,
      downloadClicks: aggregateDownloads,
      successfulDownloads: aggregateServed,
      emailSignups: aggregateSignups,
    },
    resources: Object.values(resourceMap),
    campaigns,
    recentEvents: events.slice(-30).reverse(),
  };
}
