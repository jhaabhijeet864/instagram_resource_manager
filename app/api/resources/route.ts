import { NextResponse } from "next/server";
import { RESOURCES, Resource } from "@/lib/catalog";

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
  try {
    const body = await request.json();

    if (body.action === "validateLink" && body.url) {
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
