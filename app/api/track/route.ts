import { NextResponse } from "next/server";
import { insertAnalyticsEvent, isSupabaseConfigured } from "@/lib/server/supabase";
import type { AnalyticsEvent } from "@/lib/analytics";

/**
 * POST /api/track
 * Server-side analytics event sync endpoint. Syncs one analytics event to
 * Supabase cloud storage. If Supabase is not configured the event is still
 * acknowledged (the browser keeps its own authoritative LocalStorage copy).
 */
const ALLOWED_EVENT_TYPES = new Set(["PAGE_VISIT", "DOWNLOAD_CLICK", "DOWNLOAD_SUCCESS", "EMAIL_SIGNUP"]);

export async function POST(request: Request) {
  try {
    const event = (await request.json()) as AnalyticsEvent;
    if (!event || typeof event !== "object" || Array.isArray(event) || !event.type) {
      return NextResponse.json({ ok: false, error: "Invalid event payload" }, { status: 400 });
    }
    // Event-type allowlist: anything else is rejected so arbitrary client objects
    // cannot flow into storage.
    if (!ALLOWED_EVENT_TYPES.has(event.type)) {
      return NextResponse.json({ ok: false, error: "Unknown event type" }, { status: 400 });
    }
    // metadata, when present, must be a plain object
    if (
      event.metadata !== undefined &&
      (typeof event.metadata !== "object" || event.metadata === null || Array.isArray(event.metadata))
    ) {
      return NextResponse.json({ ok: false, error: "metadata must be an object" }, { status: 400 });
    }
    const synced = await insertAnalyticsEvent(event);
    return NextResponse.json({ ok: true, synced });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** GET /api/track - health probe (used by the docker-compose healthcheck). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "analytics",
    supabase: isSupabaseConfigured() ? "configured" : "local-only",
  });
}
