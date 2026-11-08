// ==============================================================================
// OFFICIAL PLUGIN: Meta & Instagram Account Linkage
// Connects Meta Graph API v19.0+ for Instagram Business accounts.
// Manages OAuth 2.0 tokens, HMAC-SHA256 webhook signatures, and automated comment replies.
// ==============================================================================

import crypto from "crypto";
import { definePlugin } from "@/lib/plugins/sdk";
import type { PluginContext, MetaCommentEvent } from "@/lib/plugins/types";
import { RESOURCES } from "@/lib/catalog";

export interface MetaLinkageSettings {
  appId?: string;
  appSecret?: string;
  verifyToken?: string;
  pageAccessToken?: string;
  instagramAccountId?: string;
  autoReplyComments?: boolean;
}

export const metaLinkagePlugin = definePlugin({
  id: "meta-linkage",
  name: "Meta & Instagram Account Linkage",
  version: "1.2.0",
  author: "Official DevResource Core",
  category: "social",
  description:
    "Direct integration with Meta Graph API for Instagram Business accounts. Automates comment-to-DM triggers and validates real-time webhooks.",
  icon: "meta",
  enabled: true,
  configured: Boolean(process.env.META_APP_ID || process.env.META_PAGE_ACCESS_TOKEN),
  configFields: [
    {
      key: "appId",
      label: "Meta App ID",
      type: "text",
      required: true,
      defaultValue: process.env.META_APP_ID || "",
      placeholder: "e.g. 123456789012345",
      description: "From Meta Developer Dashboard -> App Settings -> Basic",
    },
    {
      key: "appSecret",
      label: "Meta App Secret",
      type: "password",
      required: true,
      defaultValue: process.env.META_APP_SECRET || "",
      placeholder: "App secret string for HMAC-SHA256 validation",
    },
    {
      key: "verifyToken",
      label: "Webhook Verify Token",
      type: "password",
      required: true,
      defaultValue: process.env.META_WEBHOOK_VERIFY_TOKEN || "",
      placeholder: "Random verification string entered in Meta Webhooks dashboard",
    },
    {
      key: "pageAccessToken",
      label: "Page / User Access Token (Long-Lived)",
      type: "password",
      required: false,
      defaultValue: process.env.META_PAGE_ACCESS_TOKEN || "",
      placeholder: "EAA...",
    },
    {
      key: "instagramAccountId",
      label: "Instagram Business Account ID",
      type: "text",
      required: false,
      defaultValue: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || "",
      placeholder: "178414...",
    },
    {
      key: "autoReplyComments",
      label: "Auto-reply to Instagram Reel comments with resource link",
      type: "boolean",
      defaultValue: true,
    },
  ],
  settings: {
    appId: process.env.META_APP_ID || "",
    appSecret: process.env.META_APP_SECRET || "",
    verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || "",
    pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || "",
    instagramAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || "",
    autoReplyComments: true,
  },
  hooks: {
    async onInitialize(context: PluginContext) {
      context.log("Meta Linkage Plugin initialized with app ID:", context.settings.appId || "Not set");
    },

    async onCommentReceived(event: MetaCommentEvent, context: PluginContext) {
      context.log(`Meta Webhook received comment: "${event.text}" from user ${event.userId}`);

      if (!context.settings.autoReplyComments) return;

      // Find matched resource by whole-word keyword (sort by keyword length descending)
      const sortedResources = [...RESOURCES].sort((a, b) => b.keyword.length - a.keyword.length);
      const matched = sortedResources.find((r) => {
        if (!r.keyword || !event.text) return false;
        const escaped = r.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, "i");
        return regex.test(event.text);
      });

      if (matched) {
        context.log(`Keyword matched resource: ${matched.title} (/r/${matched.slug})`);
        // If a real Page Access Token is available, we would dispatch the Graph API Private Reply DM:
        if (context.settings.pageAccessToken && event.commentId) {
          try {
            const endpoint = `https://graph.facebook.com/v19.0/${event.commentId}/replies`;
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://resources.yourdomain.com";
            const deliveryUrl = `${appUrl}/r/${matched.slug}?utm_source=instagram&utm_medium=comment_reply&utm_campaign=reel_comment`;

            await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: `Hey @${event.username || "there"}! Here is the master resource you asked for: ${deliveryUrl}`,
                access_token: context.settings.pageAccessToken,
              }),
            });
            context.log("Successfully dispatched Instagram Graph API reply!");
          } catch (err) {
            context.log("Failed to send Graph API reply:", err);
          }
        }
      }
    },
  },
});

/**
 * Validates Meta Webhook HMAC-SHA256 signature from header X-Hub-Signature-256
 */
export function verifyMetaSignature(payload: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader || !appSecret) return false;
  const parts = signatureHeader.split("sha256=");
  if (parts.length !== 2) return false;
  const expectedHash = parts[1];

  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(payload, "utf-8");
  const calculatedHash = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(calculatedHash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}
