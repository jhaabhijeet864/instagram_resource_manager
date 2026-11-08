// ==============================================================================
// Plugin SDK defaults + PluginRegistry runtime engine tests.
// ==============================================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { definePlugin } from "@/lib/plugins/sdk";
import { pluginRegistry } from "@/lib/plugins/registry";
import type { PluginDefinition } from "@/lib/plugins/types";

describe("definePlugin", () => {
  it("applies defaults for omitted fields", () => {
    const plugin = definePlugin({
      id: "test",
      name: "Test Plugin",
      version: "1.0.0",
      author: "tester",
      category: "test",
      description: "desc",
      icon: "x",
    } as unknown as PluginDefinition);
    expect(plugin.enabled).toBe(true);
    expect(plugin.configured).toBe(false);
    expect(plugin.settings).toEqual({});
    expect(plugin.configFields).toEqual([]);
  });

  it("keeps provided values", () => {
    const plugin = definePlugin({
      id: "test",
      name: "Test",
      version: "1.0.0",
      author: "a",
      category: "c",
      description: "d",
      icon: "i",
      enabled: false,
      configured: true,
      settings: { foo: 1 },
      configFields: [],
    } as unknown as PluginDefinition);
    expect(plugin.enabled).toBe(false);
    expect(plugin.configured).toBe(true);
    expect(plugin.settings).toEqual({ foo: 1 });
  });
});

describe("pluginRegistry", () => {
  const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    errSpy.mockClear();
    logSpy.mockClear();
  });
  afterEach(() => {
    // remove any fake test plugins so the real registry state is intact
    const fake = pluginRegistry.getPlugin("_test-fake");
    if (fake) {
      // re-register overwrites; the registry has no unregister, so disable instead
      pluginRegistry.setPluginEnabled("_test-fake", false);
    }
  });

  it("contains the four bundled plugins", () => {
    for (const id of ["meta-linkage", "manychat-bridge", "storage-r2-gdrive", "webhook-dispatcher"]) {
      expect(pluginRegistry.getPlugin(id), id).toBeDefined();
    }
  });

  it("setPluginEnabled returns false for unknown plugins", () => {
    expect(pluginRegistry.setPluginEnabled("nope", true)).toBe(false);
  });

  it("setPluginEnabled mutates the plugin and returns true", () => {
    expect(pluginRegistry.setPluginEnabled("manychat-bridge", false)).toBe(true);
    expect(pluginRegistry.getPlugin("manychat-bridge")?.enabled).toBe(false);
    // restore
    pluginRegistry.setPluginEnabled("manychat-bridge", true);
  });

  it("updatePluginSettings merges settings and marks configured", () => {
    const ok = pluginRegistry.updatePluginSettings("manychat-bridge", { foo: "bar" });
    expect(ok).toBe(true);
    expect(pluginRegistry.getPlugin("manychat-bridge")?.settings?.foo).toBe("bar");
    expect(pluginRegistry.getPlugin("manychat-bridge")?.configured).toBe(true);
  });

  it("dispatch calls hooks of enabled plugins in order", async () => {
    const order: string[] = [];
    pluginRegistry.register(
      definePlugin({
        id: "_test-fake",
        name: "Fake",
        version: "0.0.0",
        author: "test",
        category: "test",
        description: "x",
        icon: "x",
        hooks: {
          onDownloadIntent: async () => {
            order.push("fake");
          },
        },
      })
    );
    // real plugins: none define onDownloadIntent except webhook-dispatcher
    await pluginRegistry.dispatchDownloadIntent({
      slug: "rag-starter-kit",
      resource: {} as any,
      utm: { campaign: "t", source: "s", medium: "m" },
      timestamp: new Date().toISOString(),
    });
    expect(order).toContain("fake");
  });

  it("disabled plugins do not run their hooks", async () => {
    const hook = vi.fn();
    pluginRegistry.register(
      definePlugin({
        id: "_test-fake",
        name: "Fake",
        version: "0.0.0",
        author: "test",
        category: "test",
        description: "x",
        icon: "x",
        enabled: false,
        hooks: { onDownloadIntent: hook },
      })
    );
    await pluginRegistry.dispatchDownloadIntent({
      slug: "rag-starter-kit",
      resource: {} as any,
      utm: { campaign: "t", source: "s", medium: "m" },
      timestamp: new Date().toISOString(),
    });
    expect(hook).not.toHaveBeenCalled();
  });

  it("a throwing hook is isolated and does not break the dispatch loop", async () => {
    const boom = vi.fn(async () => {
      throw new Error("boom");
    });
    const after = vi.fn();
    pluginRegistry.register(
      definePlugin({
        id: "_test-fake",
        name: "Fake",
        version: "0.0.0",
        author: "test",
        category: "test",
        description: "x",
        icon: "x",
        hooks: { onLeadCaptured: boom },
      })
    );
    pluginRegistry.register(
      definePlugin({
        id: "_test-fake-2",
        name: "Fake2",
        version: "0.0.0",
        author: "test",
        category: "test",
        description: "x",
        icon: "x",
        hooks: { onLeadCaptured: after },
      })
    );
    await expect(
      pluginRegistry.dispatchLeadCaptured({
        email: "a@b.co",
        resourceSlug: "x",
        source: "test",
        timestamp: "now",
      })
    ).resolves.not.toThrow();
    expect(boom).toHaveBeenCalled();
    expect(after).toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled(); // error was logged, not swallowed silently
  });

  it("getPlugin returns undefined for unknown ids", () => {
    expect(pluginRegistry.getPlugin("does-not-exist")).toBeUndefined();
  });
});
