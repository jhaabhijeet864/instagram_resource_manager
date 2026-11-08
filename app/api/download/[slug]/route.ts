import { NextResponse } from "next/server";
import { getResourceBySlug } from "@/lib/catalog";
import { insertAnalyticsEvent } from "@/lib/server/supabase";
import type { AnalyticsEvent } from "@/lib/analytics";
import { pluginRegistry } from "@/lib/plugins/registry";

/**
 * GET /api/download/[slug]
 * Permanent tracked download endpoint.
 *
 * 1. Resolves the resource by slug from the master catalog.
 * 2. Dispatches plugin lifecycle events (DownloadIntent, FileServed).
 * 3. Logs a DOWNLOAD_SUCCESS event server-side (storage delivery truth).
 * 4. 302-redirects to verified master copy (Google Drive / Cloudflare R2).
 */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const resource = getResourceBySlug(params.slug);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const campaign = searchParams.get("utm_campaign") || "direct";
  const utmSource = searchParams.get("utm_source") || "instagram";
  const utmMedium = searchParams.get("utm_medium") || "comment_dm";

  // Trigger plugin hooks
  try {
    await pluginRegistry.dispatchDownloadIntent({
      slug: resource.slug,
      resource,
      utm: {
        campaign,
        source: utmSource,
        medium: utmMedium,
      },
      timestamp: new Date().toISOString(),
    });

    await pluginRegistry.dispatchFileServed({
      slug: resource.slug,
      resource,
      provider: "drive",
      storageUrl: resource.storageUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Plugin dispatch error:", err);
  }

  // Record database event
  try {
    const event: AnalyticsEvent = {
      id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      type: "DOWNLOAD_SUCCESS",
      resourceSlug: resource.slug,
      campaign,
      utm_source: utmSource,
      utm_medium: utmMedium,
      referrer: request.headers.get("referer") || "direct",
      metadata: { fileName: resource.fileName, storage: "google_drive", serverLogged: true },
      timestamp: new Date().toISOString(),
    };
    await insertAnalyticsEvent(event);
  } catch {
    // never block download over analytics failure
  }

  if (/^https?:\/\//i.test(resource.storageUrl)) {
    return NextResponse.redirect(resource.storageUrl, 302);
  }
  return NextResponse.json({ error: "Storage URL not configured for this resource" }, { status: 501 });
}
