// ==============================================================================
// OFFICIAL PLUGIN: Webhook Dispatcher
// Dispatches outbound JSON payloads on download intent or lead captures to
// Zapier, Make.com, n8n, Discord, Slack, or any custom CRM endpoint.
// ==============================================================================

import { definePlugin } from "@/lib/plugins/sdk";
import type { PluginContext, DownloadIntentEvent, LeadCapturedEvent } from "@/lib/plugins/types";

export const webhookDispatcherPlugin = definePlugin({
  id: "webhook-dispatcher",
  name: "Outbound Webhook Dispatcher",
  version: "1.0.0",
  author: "Official DevResource Core",
  category: "notification",
  description:
    "Dispatches real-time webhooks on download intent or newsletter capture to Zapier, Make.com, Discord, Slack, or custom CRMs.",
  icon: "webhook",
  enabled: false,
  configured: false,
  configFields: [
    {
      key: "endpointUrl",
      label: "Webhook Target URL",
      type: "text",
      required: true,
      placeholder: "https://hooks.zapier.com/hooks/catch/...",
    },
    {
      key: "sendOnDownload",
      label: "Send Webhook on Resource Download",
      type: "boolean",
      defaultValue: true,
    },
    {
      key: "sendOnLead",
      label: "Send Webhook on Newsletter Signup",
      type: "boolean",
      defaultValue: true,
    },
  ],
  settings: {
    endpointUrl: "",
    sendOnDownload: true,
    sendOnLead: true,
  },
  hooks: {
    async onDownloadIntent(event: DownloadIntentEvent, context: PluginContext) {
      if (!context.settings.sendOnDownload || !context.settings.endpointUrl) return;
      try {
        await fetch(context.settings.endpointUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "DOWNLOAD_INTENT", ...event }),
        });
        context.log("Webhook dispatched for download event:", event.slug);
      } catch (err) {
        context.log("Failed to dispatch webhook:", err);
      }
    },
    async onLeadCaptured(event: LeadCapturedEvent, context: PluginContext) {
      if (!context.settings.sendOnLead || !context.settings.endpointUrl) return;
      try {
        await fetch(context.settings.endpointUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "LEAD_CAPTURED", ...event }),
        });
        context.log("Webhook dispatched for lead capture:", event.email);
      } catch (err) {
        context.log("Failed to dispatch webhook:", err);
      }
    },
  },
});
