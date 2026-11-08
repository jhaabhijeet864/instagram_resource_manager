import { NextResponse } from "next/server";
import { RESOURCES, Resource } from "@/lib/catalog";
import { isSafePublicHttpUrl } from "@/lib/server/url-guard";

/**
 * In-memory copy of catalog with live mutations for this runtime.
 */
let liveCatalog: Resource[] = [...RESOURCES];

/**
 * GET /api/resources
 * Returns all resources in the catalog.
 */
export async function GET() {
  return NextResponse.json({ resources: liveCatalog });
}

/**
 * POST /api/resources
 * Creates a new resource or validates storage link.
 * Body: { action: "create" | "validateLink", resource?: Resource, url?: string }
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.action === "validateLink" && body.url) {
      // SSRF guard: only public http(s) URLs may be fetched server-side.
      if (!isSafePublicHttpUrl(body.url)) {
        return NextResponse.json(
          { ok: false, error: "URL blocked: must be a public http(s) URL" },
          { status: 400 }
        );
      }
      try {
        const res = await fetch(body.url, { method: "HEAD", redirect: "follow" });
        return NextResponse.json({
          status: res.status,
          ok: res.ok || res.status === 302 || res.status === 303,
          contentType: res.headers.get("content-type"),
        });
      } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
      }
    }

    if (body.action === "create" && body.resource) {
      const newRes = body.resource as Resource;
      if (!newRes.slug || !newRes.title || !newRes.storageUrl) {
        return NextResponse.json({ error: "slug, title, and storageUrl are required" }, { status: 400 });
      }
      // Slug must be URL-safe so /r/<slug> links and lookups never break.
      if (!/^[a-z0-9-]+$/.test(newRes.slug)) {
        return NextResponse.json(
          { error: "slug must be lowercase alphanumeric with dashes (use slugify())" },
          { status: 400 }
        );
      }
      // Storage URL must be a public http(s) URL (also blocks private/SSRF URLs
      // from being installed into the catalog and later redirected to).
      if (!isSafePublicHttpUrl(newRes.storageUrl)) {
        return NextResponse.json(
          { error: "storageUrl must be a public http(s) URL" },
          { status: 400 }
        );
      }

      // Check duplicate slug
      const existingIdx = liveCatalog.findIndex((r) => r.slug === newRes.slug);
      if (existingIdx >= 0) {
        liveCatalog[existingIdx] = { ...liveCatalog[existingIdx], ...newRes };
      } else {
        liveCatalog.unshift(newRes);
      }

      return NextResponse.json({ success: true, resource: newRes });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process resource" }, { status: 500 });
  }
}
