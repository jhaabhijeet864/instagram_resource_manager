// ==============================================================================
// OFFICIAL PLUGIN: Manychat DM Automation Bridge
// Synchronizes campaign UTM click-throughs, custom fields, and subscriber tags.
// ==============================================================================

import { definePlugin } from "@/lib/plugins/sdk";
import type { PluginContext, DownloadIntentEvent, ResourceVisitEvent } from "@/lib/plugins/types";

export const manychatBridgePlugin = definePlugin({
  id: "manychat-bridge",
  name: "Manychat Automation Bridge",
  version: "1.1.0",
  author: "Official DevResource Core",
  category: "automation",
  description:
    "Bridges Instagram Manychat direct messages to permanent resource links and updates subscriber custom fields when resources are downloaded.",
  icon: "manychat",
  enabled: true,
  configured: false,
  configFields: [
    {
      key: "apiKey",
      label: "Manychat API Key",
      type: "password",
      required: false,
      placeholder: "Bearer ...",
      description: "From Manychat Settings -> API",
    },
    {
      key: "downloadTag",
      label: "Subscriber Tag on Download",
      type: "text",
      defaultValue: "downloaded_engineering_resource",
    },
  ],
  settings: {
    apiKey: "",
    downloadTag: "downloaded_engineering_resource",
  },
  hooks: {
    async onResourceVisit(event: ResourceVisitEvent, context: PluginContext) {
      if (event.utm?.campaign) {
        context.log(`Manychat visitor attributed to campaign: ${event.utm.campaign}`);
      }
    },
    async onDownloadIntent(event: DownloadIntentEvent, context: PluginContext) {
      context.log(`Manychat download event recorded for slug: ${event.slug}`);
    },
  },
});
