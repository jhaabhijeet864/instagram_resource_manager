import { NextResponse } from "next/server";
import { pluginRegistry } from "@/lib/plugins/registry";
import { verifyMetaSignature } from "@/plugins/meta-linkage";
import { findResourceByKeyword } from "@/lib/catalog";

/**
 * GET /api/plugins/meta/webhook
 * Meta Hub Challenge verification endpoint.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const metaPlugin = pluginRegistry.getPlugin("meta-linkage");
  // Fail closed: when no token is configured at all, verification must fail
  // (never fall back to a publicly hard-coded token).
  const expectedVerifyToken =
    metaPlugin?.settings?.verifyToken || process.env.META_WEBHOOK_VERIFY_TOKEN || "";

  if (mode === "subscribe" && token === expectedVerifyToken) {
    console.log("[Meta Webhook] Verification challenge passed successfully.");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed: invalid verify token" }, { status: 403 });
}

/**
 * POST /api/plugins/meta/webhook
 * Real-time event receiver for Instagram Comments and Mentions.
 * Validates HMAC-SHA256 signature using Meta App Secret.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();

  const metaPlugin = pluginRegistry.getPlugin("meta-linkage");
  const appSecret = metaPlugin?.settings?.appSecret || process.env.META_APP_SECRET || "";

  // Signature check (only enforced if appSecret is configured)
  if (appSecret && !verifyMetaSignature(rawBody, signature, appSecret)) {
    console.error("[Meta Webhook] Signature verification failed!");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const data = JSON.parse(rawBody);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      // Not a Meta webhook payload shape at all.
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (data.object === "instagram" && Array.isArray(data.entry)) {
      for (const entry of data.entry) {
        if (Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === "comments" && change.value) {
              const val = change.value;
              const text = val.text || "";
              const commentId = val.id || "";
              const mediaId = val.media?.id || "";
              const userId = val.from?.id || "";
              const username = val.from?.username || "";

              // Whole-word keyword matching (avoids e.g. "SEARCHED" → "SEARCH")
              const matchedResource = findResourceByKeyword(text);

              // Dispatch to plugin hook
              await pluginRegistry.dispatchCommentReceived({
                commentId,
                mediaId,
                userId,
                username,
                text,
                timestamp: new Date().toISOString(),
                matchedResource: matchedResource || null,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" });
  } catch (err: any) {
    console.error("[Meta Webhook] Error processing event:", err);
    // Malformed JSON must be 400 so Meta does not retry forever on 500s.
    return NextResponse.json({ error: "Internal processing error" }, { status: 400 });
  }
}
