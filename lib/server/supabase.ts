// ==============================================================================
// SERVER-SIDE SUPABASE SYNC HELPERS (API routes only!)
// Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from server environment.
// These credentials are NEVER shipped to the browser.
// If not configured, all endpoints no-op gracefully => local tracking keeps
// working with zero configuration.
// ==============================================================================

import { NextResponse } from "next/server";
import type { AnalyticsEvent } from "@/lib/analytics";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

function restHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    Prefer: "return=minimal",
  };
}

function restUrl(path: string): string {
  return `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
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
    return false; // never break the visitor experience over analytics
  }
}

/** Insert one newsletter email into the `email_signups` table. */
export async function insertEmailSignup(email: string, resourceSlug: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(restUrl("email_signups"), {
      method: "POST",
      headers: restHeaders(),
      body: JSON.stringify({ email, resource_slug: resourceSlug }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function jsonOk(data: Record<string, unknown> = { ok: true }) {
  return NextResponse.json(data);
}
