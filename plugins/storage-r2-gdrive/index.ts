// ==============================================================================
// OFFICIAL PLUGIN: Dual Storage Provider (Google Drive & Cloudflare R2)
// Abstracts file delivery so that switching underlying storage requires zero
// URL changes across existing Instagram Reels or Manychat flows.
// ==============================================================================

import { definePlugin } from "@/lib/plugins/sdk";
import type { PluginContext, FileServedEvent } from "@/lib/plugins/types";

export const storagePlugin = definePlugin({
  id: "storage-r2-gdrive",
  name: "Dual Storage Switcher (Drive & R2)",
  version: "1.0.0",
  author: "Official DevResource Core",
  category: "storage",
  description:
    "Seamlessly switches file delivery between Google Drive master copies and Cloudflare R2 object storage without breaking public URLs.",
  icon: "cloud",
  enabled: true,
  configured: true,
  configFields: [
    {
      key: "defaultProvider",
      label: "Default Storage Delivery Provider",
      type: "select",
      defaultValue: "drive",
      options: [
        { label: "Google Drive Master Copy", value: "drive" },
        { label: "Cloudflare R2 Object Storage", value: "r2" },
      ],
    },
    {
      key: "r2PublicDomain",
      label: "Cloudflare R2 Public Domain",
      type: "text",
      required: false,
      placeholder: "https://pub-xxxxxx.r2.dev",
    },
    {
      key: "r2BucketName",
      label: "Cloudflare R2 Bucket Name",
      type: "text",
      required: false,
      defaultValue: "creator-vault",
    },
  ],
  settings: {
    defaultProvider: process.env.DEFAULT_STORAGE_PROVIDER || "drive",
    r2PublicDomain: process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || "",
    r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "creator-vault",
  },
  hooks: {
    async onFileServed(event: FileServedEvent, context: PluginContext) {
      context.log(`File served via [${event.provider}]: ${event.storageUrl}`);
    },
  },
});
