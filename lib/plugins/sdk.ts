// ==============================================================================
// PLUGIN SDK: Helpers for authoring 3rd-party DevResource plugins
// ==============================================================================

import type { PluginDefinition } from "./types";

/**
 * Type-safe builder helper for declaring a plugin definition.
 */
export function definePlugin(plugin: PluginDefinition): PluginDefinition {
  return {
    ...plugin,
    enabled: plugin.enabled ?? true,
    configured: plugin.configured ?? false,
    settings: plugin.settings ?? {},
    configFields: plugin.configFields ?? [],
  };
}
