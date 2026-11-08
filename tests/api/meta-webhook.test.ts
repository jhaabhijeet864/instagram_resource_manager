// ==============================================================================
// Meta webhook endpoint tests: hub challenge, signature validation, payload
// parsing, and comment keyword matching.
// ==============================================================================
import crypto from "crypto";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pluginRegistry } from "@/lib/plugins/registry";
import { GET, POST } from "@/app/api/plugins/meta/webhook/route";
import { verifyMetaSignature } from "@/plugins/meta-linkage";
import { RESOURCES } from "@/lib/catalog";

const APP_SECRET = "test_webhook_secret";
const VERIFY_TOKEN = "my_verify_token";

let savedSettings: Record<string, unknown>;
const savedEnvToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
const savedEnvSecret = process.env.META_APP_SECRET;

beforeEach(() => {
  savedSettings = { ...pluginRegistry.getPlugin("meta-linkage")?.settings };
  delete process.env.META_WEBHOOK_VERIFY_TOKEN;
  delete process.env.META_APP_SECRET;
  pluginRegistry.updatePluginSettings("meta-linkage", {
    verifyToken: VERIFY_TOKEN,
    appSecret: "",
  });
});

afterEach(() => {
  if (savedEnvToken !== undefined) process.env.META_WEBHOOK_VERIFY_TOKEN = savedEnvToken;
  if (savedEnvSecret !== undefined) process.env.META_APP_SECRET = savedEnvSecret;
  const plugin = pluginRegistry.getPlugin("meta-linkage");
  if (plugin) plugin.settings = savedSettings;
});

function sign(payload: string, secret: string = APP_SECRET): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(payload, "utf-8").digest("hex");
}

function metaUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params);
  return `http://localhost/api/plugins/meta/webhook?${qs}`;
}

async function post(payload: string, signature: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (signature) headers["x-hub-signature-256"] = signature;
  return POST(new Request("http://localhost/api/plugins/meta/webhook", { method: "POST", headers, body: payload }));
}

const instagramPayload = (text: string): string =>
  JSON.stringify({
    object: "instagram",
    entry: [
      {
        id: "IG1",
        changes: [
          {
            field: "comments",
            value: {
              id: "comment_1",
              media: { id: "media_1" },
              from: { id: "user_1", username: "creator" },
              text,
            },
          },
        ],
      },
    ],
  });

describe("GET /api/plugins/meta/webhook (hub challenge)", () => {
  it("accepts a valid hub.challenge + verify token", async () => {
    const res = await GET(
      new Request(metaUrl({ "hub.mode": "subscribe", "hub.verify_token": VERIFY_TOKEN, "hub.challenge": "CHALLENGE_123" }))
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("CHALLENGE_123");
  });

  it("rejects a wrong verify token with 403", async () => {
    const res = await GET(
      new Request(metaUrl({ "hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "C" }))
    );
    expect(res.status).toBe(403);
  });

  it("rejects the old hard-coded public default token (fail closed)", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { verifyToken: "" });
    const res = await GET(
      new Request(metaUrl({ "hub.mode": "subscribe", "hub.verify_token": "creator_hub_secret_token", "hub.challenge": "C" }))
    );
    expect(res.status).toBe(403);
  });

  it("falls back to the environment token", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { verifyToken: "" });
    process.env.META_WEBHOOK_VERIFY_TOKEN = "env token";
    const res = await GET(
      new Request(metaUrl({ "hub.mode": "subscribe", "hub.verify_token": "env token", "hub.challenge": "C" }))
    );
    expect(res.status).toBe(200);
  });

  it("rejects non-subscribe mode", async () => {
    const res = await GET(new Request(metaUrl({ "hub.mode": "unsubscribe", "hub.verify_token": VERIFY_TOKEN, "hub.challenge": "C" })));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/plugins/meta/webhook (event receiver)", () => {
  const dispatchSpy = vi.spyOn(pluginRegistry, "dispatchCommentReceived").mockResolvedValue();

  beforeEach(() => {
    dispatchSpy.mockClear();
  });

  it("accepts a correctly signed payload and dispatches comments", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { appSecret: APP_SECRET });
    const payload = instagramPayload("send me the PROMPT");
    const res = await post(payload, sign(payload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "EVENT_RECEIVED" });
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        commentId: "comment_1",
        username: "creator",
        text: "send me the PROMPT",
      })
    );
  });

  it("rejects unsigned payloads when a secret is configured", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { appSecret: APP_SECRET });
    const res = await post(instagramPayload("RAG"), null);
    expect(res.status).toBe(401);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("rejects a tampered payload", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { appSecret: APP_SECRET });
    const res = await post(instagramPayload("RAG"), sign(instagramPayload("TAMPERED")));
    expect(res.status).toBe(401);
  });

  it("malformed-but-signed JSON returns 400 (never 500, so Meta does not retry forever)", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { appSecret: APP_SECRET });
    const res = await post("{not json", sign("{not json"));
    expect(res.status).toBe(400);
  });

  it("ignore unrelated objects/fields gracefully", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { appSecret: "" });
    const payload = JSON.stringify({ object: "page", entry: [{ changes: [{ field: "mentions" }] }] });
    const res = await post(payload, null);
    expect(res.status).toBe(200);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("matches the right resource by keyword (whole-word)", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { appSecret: "" });
    const target = RESOURCES[0];
    await post(instagramPayload(`please send ${target.keyword}`), null);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ matchedResource: expect.objectContaining({ slug: target.slug }) })
    );
  });

  it("does NOT match substring false positives", async () => {
    pluginRegistry.updatePluginSettings("meta-linkage", { appSecret: "" });
    const target = RESOURCES[0];
    // extended words (e.g. "SEARCHED"/"BLENDERPRO") must not match the bare keyword
    await post(instagramPayload(`${target.keyword.toUpperCase()}ED ${target.keyword.toUpperCase()}PRO`), null);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ matchedResource: null })
    );
  });
});

describe("verifyMetaSignature (unit)", () => {
  it("accepts a valid signature", () => {
    const payload = JSON.stringify({ a: 1 });
    expect(verifyMetaSignature(payload, sign(payload), APP_SECRET)).toBe(true);
  });

  it("rejects missing header or secret", () => {
    const payload = "{}";
    expect(verifyMetaSignature(payload, null, APP_SECRET)).toBe(false);
    expect(verifyMetaSignature(payload, sign(payload), "")).toBe(false);
  });

  it("rejects missing sha256= prefix", () => {
    const payload = "{}";
    const hash = crypto.createHmac("sha256", APP_SECRET).update(payload).digest("hex");
    expect(verifyMetaSignature(payload, hash, APP_SECRET)).toBe(false); // no prefix
    expect(verifyMetaSignature(payload, "sha1=" + hash, APP_SECRET)).toBe(false);
  });

  it("rejects a tampered payload", () => {
    expect(verifyMetaSignature("{}{}", sign("{}"), APP_SECRET)).toBe(false);
  });

  it("rejects the wrong secret", () => {
    const payload = "{}";
    expect(verifyMetaSignature(payload, sign(payload, "other-secret"), APP_SECRET)).toBe(false);
  });

  it("rejects garbage in the signature without throwing (timing-safe compare)", () => {
    const payload = "{}";
    expect(verifyMetaSignature(payload, "sha256=not-hex-garbage", APP_SECRET)).toBe(false);
  });
});

describe("verify token config leak check", () => {
  const errSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  it("meta plugin no longer hard-codes a public default verify token", () => {
    const plugin = pluginRegistry.getPlugin("meta-linkage");
    expect(process.env.META_WEBHOOK_VERIFY_TOKEN).toBeUndefined();
    expect(plugin?.settings?.verifyToken).not.toBe("creator_hub_secret_token");
  });
});
