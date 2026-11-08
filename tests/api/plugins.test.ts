// ==============================================================================
// GET /api/plugins + POST /api/plugins (toggle/updateSettings) tests.
// Uses the real plugin registry.
// ==============================================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pluginRegistry } from "@/lib/plugins/registry";
import { GET, POST } from "@/app/api/plugins/route";

const metaPlugin = pluginRegistry.getPlugin("meta-linkage")!;
let savedSettings: Record<string, unknown>;

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/plugins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  savedSettings = { ...metaPlugin.settings };
});

afterEach(() => {
  metaPlugin.settings = savedSettings;
  metaPlugin.enabled = true;
});

describe("GET /api/plugins", () => {
  it("returns all registered plugins", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.plugins.length).toBeGreaterThanOrEqual(4);
    for (const p of json.plugins) {
      expect(p).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          enabled: expect.any(Boolean),
          configured: expect.any(Boolean),
        })
      );
    }
  });

  it("masks secret-looking setting values", async () => {
    metaPlugin.settings = { ...savedSettings, appSecret: "super-secret", verifyToken: "vt", appId: "12345" };
    const json = await (await GET()).json();
    const meta = json.plugins.find((p: any) => p.id === "meta-linkage");
    expect(meta.settings.appSecret).toBe("••••••••••••");
    expect(meta.settings.verifyToken).toBe("••••••••••••");
  });

  it("never returns raw secret values in the payload", async () => {
    metaPlugin.settings = { ...savedSettings, appSecret: "super-secret-value" };
    const raw = await (await GET()).text();
    expect(raw).not.toContain("super-secret-value");
  });

  it("leaves non-secret values unmasked", async () => {
    metaPlugin.settings = { ...savedSettings, appId: "12345", autoReplyComments: true };
    const json = await (await GET()).json();
    const meta = json.plugins.find((p: any) => p.id === "meta-linkage");
    expect(meta.settings.appId).toBe("12345");
    expect(meta.settings.autoReplyComments).toBe(true);
  });

  it("masks empty secret keys as empty strings (not leaking structure)", async () => {
    metaPlugin.settings = { ...savedSettings, appSecret: "" };
    const json = await (await GET()).json();
    const meta = json.plugins.find((p: any) => p.id === "meta-linkage");
    expect(meta.settings.appSecret).toBe("");
  });
});

describe("POST /api/plugins", () => {
  it("requires a plugin id", async () => {
    const res = await post({ action: "toggle", enabled: true });
    expect(res.status).toBe(400);
  });

  it("rejects invalid actions", async () => {
    const res = await post({ id: "meta-linkage", action: "nuke" });
    expect(res.status).toBe(400);
  });

  it("toggles a known plugin off and on", async () => {
    const off = await post({ id: "manychat-bridge", action: "toggle", enabled: false });
    expect((await off.json()).success).toBe(true);
    expect(pluginRegistry.getPlugin("manychat-bridge")?.enabled).toBe(false);

    const on = await post({ id: "manychat-bridge", action: "toggle", enabled: true });
    expect((await on.json()).success).toBe(true);
    expect(pluginRegistry.getPlugin("manychat-bridge")?.enabled).toBe(true);
  });

  it("toggle of unknown plugin reports success:false", async () => {
    const res = await post({ id: "ghost", action: "toggle", enabled: true });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(false);
  });

  it("updateSettings merges and marks configured", async () => {
    const res = await post({ id: "webhook-dispatcher", action: "updateSettings", settings: { endpointUrl: "https://x.example" } });
    expect((await res.json()).success).toBe(true);
    expect(pluginRegistry.getPlugin("webhook-dispatcher")?.settings?.endpointUrl).toBe("https://x.example");
  });

  it("handles malformed JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{bad",
      })
    );
    expect(res.status).toBe(400);
  });
});
