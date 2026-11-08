// ==============================================================================
// EXTENSIBLE PLUGIN ARCHITECTURE - TYPES & INTERFACES
// ==============================================================================

import type { Resource } from "@/lib/catalog";

export type PluginCategory =
  | "social"
  | "automation"
  | "storage"
  | "analytics"
  | "notification"
  | "integration"
  | "test"
  | "c";

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "number" | "boolean" | "select";
  required?: boolean;
  defaultValue?: any;
  placeholder?: string;
  options?: { label: string; value: string }[];
  description?: string;
}

export interface PluginContext {
  pluginId: string;
  settings: Record<string, any>;
  log: (msg: string, ...args: any[]) => void;
}

export interface ResourceVisitEvent {
  slug: string;
  resource: Resource;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  referrer?: string;
  userAgent?: string;
  timestamp: string;
}

export interface DownloadIntentEvent {
  slug: string;
  resource: Resource;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  timestamp: string;
  ip?: string;
}

export interface FileServedEvent {
  slug: string;
  resource: Resource;
  provider: "drive" | "r2" | "s3" | "local";
  storageUrl: string;
  timestamp: string;
}

export interface LeadCapturedEvent {
  email: string;
  resourceSlug?: string;
  source: string;
  timestamp: string;
}

export interface MetaCommentEvent {
  commentId: string;
  mediaId: string;
  userId: string;
  username?: string;
  text: string;
  timestamp: string;
  matchedResource?: Resource | null;
}

export interface PluginHooks {
  onInitialize?: (context: PluginContext) => Promise<void> | void;
  onResourceVisit?: (event: ResourceVisitEvent, context: PluginContext) => Promise<void> | void;
  onDownloadIntent?: (event: DownloadIntentEvent, context: PluginContext) => Promise<void> | void;
  onFileServed?: (event: FileServedEvent, context: PluginContext) => Promise<void> | void;
  onLeadCaptured?: (event: LeadCapturedEvent, context: PluginContext) => Promise<void> | void;
  onCommentReceived?: (event: MetaCommentEvent, context: PluginContext) => Promise<void> | void;
}

export interface PluginDefinition {
  id: string;
  name: string;
  version: string;
  author: string;
  category: PluginCategory;
  description: string;
  icon?: string;
  enabled: boolean;
  configured: boolean;
  configFields: ConfigField[];
  settings: Record<string, any>;
  hooks: PluginHooks;
}
