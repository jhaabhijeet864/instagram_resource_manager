import { NextResponse } from "next/server";
import { insertEmailSignup } from "@/lib/server/supabase";
import { pluginRegistry } from "@/lib/plugins/registry";

/**
 * POST /api/newsletter
 * Body: { email: string, resourceSlug?: string, source?: string }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; resourceSlug?: string; source?: string };
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
    }

    // Trigger plugins
    try {
      await pluginRegistry.dispatchLeadCaptured({
        email,
        resourceSlug: body.resourceSlug,
        source: body.source || "newsletter_form",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Plugin lead dispatch error:", err);
    }

    const stored = await insertEmailSignup(email, body.resourceSlug || "homepage_newsletter");
    return NextResponse.json({ ok: true, synced: stored });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
