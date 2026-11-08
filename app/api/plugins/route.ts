import { NextResponse } from "next/server";
import { pluginRegistry } from "@/lib/plugins/registry";

/**
 * GET /api/plugins
 * Lists all registered plugins with their manifest, category, activation status, and config schema.
 */
export async function GET() {
  const plugins = pluginRegistry.getAllPlugins().map((p) => ({
    id: p.id,
    name: p.name,
    version: p.version,
    author: p.author,
    category: p.category,
    description: p.description,
    enabled: p.enabled,
    configured: p.configured,
    configFields: p.configFields,
    settings: Object.fromEntries(
      Object.entries(p.settings || {}).map(([k, v]) => [
        k,
        // Mask passwords / secrets when returning to client
        typeof v === "string" && (k.toLowerCase().includes("secret") || k.toLowerCase().includes("token") || k.toLowerCase().includes("key"))
          ? v ? "••••••••••••" : ""
          : v,
      ])
    ),
  }));

  return NextResponse.json({ plugins });
}

/**
 * POST /api/plugins
 * Handles toggling plugins and updating settings.
 * Body: { id: string, action: "toggle" | "updateSettings", enabled?: boolean, settings?: Record<string, any> }
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const { id, action, enabled, settings } = body;

    if (!id) {
      return NextResponse.json({ error: "Plugin ID required" }, { status: 400 });
    }

    if (action === "toggle") {
      const ok = pluginRegistry.setPluginEnabled(id, Boolean(enabled));
      return NextResponse.json({ success: ok, id, enabled: Boolean(enabled) });
    }

    if (action === "updateSettings") {
      const ok = pluginRegistry.updatePluginSettings(id, settings || {});
      return NextResponse.json({ success: ok, id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update plugin" }, { status: 500 });
  }
}
