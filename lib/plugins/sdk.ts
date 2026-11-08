// ==============================================================================
// PLUGIN SDK: Helpers for authoring 3rd-party DevResource plugins
// ==============================================================================

import type { PluginDefinition } from "./types";

export type PluginInput = Omit<
  PluginDefinition,
  "enabled" | "configured" | "settings" | "configFields"
> & {
  enabled?: boolean;
  configured?: boolean;
  settings?: Record<string, any>;
  configFields?: any[];
  category?: any;
};

/**
 * Type-safe builder helper for declaring a plugin definition.
 */
export function definePlugin(plugin: PluginInput): PluginDefinition {
  return {
    ...plugin,
    category: plugin.category || "integration",
    icon: plugin.icon || "default",
    hooks: plugin.hooks || {},
    enabled: plugin.enabled ?? true,
    configured: plugin.configured ?? false,
    settings: plugin.settings ?? {},
    configFields: plugin.configFields ?? [],
  };
}
