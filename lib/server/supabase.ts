// ==============================================================================
// SERVER-SIDE SUPABASE SYNC HELPERS (API routes only!)
// Reads SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from server environment.
// These credentials are NEVER shipped to the browser.
// If not configured, all endpoints no-op gracefully => local tracking keeps
// working with zero configuration.
// ==============================================================================

import type { AnalyticsEvent } from "@/lib/analytics";

function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

function getServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getServiceKey());
}

function restHeaders(): HeadersInit {
  const key = getServiceKey();
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "return=minimal",
  };
}

function restUrl(path: string): string {
  return `${getSupabaseUrl().replace(/\/$/, "")}/rest/v1/${path}`;
}

/** Insert one analytics event into the `analytics_events` table. */
export async function insertAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(restUrl("analytics_events"), {
      method: "POST",
      headers: restHeaders(),
      body: JSON.stringify({
        event_type: event.type,
        resource_slug: event.resourceSlug,
        campaign_name: event.campaign,
        utm_source: event.utm_source,
        utm_medium: event.utm_medium,
        referrer: event.referrer,
        metadata: event.metadata ?? {},
      }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Insert one newsletter / notification signup into `email_signups`. */
export async function insertEmailSignup(email: string, resourceSlug = ""): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(restUrl("email_signups"), {
      method: "POST",
      headers: restHeaders(),
      body: JSON.stringify({
        email,
        resource_slug: resourceSlug || "general",
      }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
