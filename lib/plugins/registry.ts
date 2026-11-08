// ==============================================================================
// PLUGIN REGISTRY & RUNTIME ENGINE
// Central registry singleton for loading, activating, and executing plugin hooks.
// ==============================================================================

import type {
  PluginDefinition,
  PluginContext,
  ResourceVisitEvent,
  DownloadIntentEvent,
  FileServedEvent,
  LeadCapturedEvent,
  MetaCommentEvent,
} from "./types";
import { metaLinkagePlugin } from "@/plugins/meta-linkage";
import { manychatBridgePlugin } from "@/plugins/manychat-bridge";
import { storagePlugin } from "@/plugins/storage-r2-gdrive";
import { webhookDispatcherPlugin } from "@/plugins/webhook-dispatcher";

class PluginRegistry {
  private plugins: Map<string, PluginDefinition> = new Map();

  constructor() {
    this.register(metaLinkagePlugin);
    this.register(manychatBridgePlugin);
    this.register(storagePlugin);
    this.register(webhookDispatcherPlugin);
  }

  public register(plugin: PluginDefinition): void {
    this.plugins.set(plugin.id, plugin);
  }

  public getPlugin(id: string): PluginDefinition | undefined {
    return this.plugins.get(id);
  }

  public getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  public setPluginEnabled(id: string, enabled: boolean): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    plugin.enabled = enabled;
    return true;
  }

  public updatePluginSettings(id: string, settings: Record<string, any>): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    plugin.settings = { ...plugin.settings, ...settings };
    plugin.configured = true;
    return true;
  }

  private createContext(plugin: PluginDefinition): PluginContext {
    return {
      pluginId: plugin.id,
      settings: plugin.settings,
      log: (msg: string, ...args: any[]) => {
        console.log(`[Plugin:${plugin.id}] ${msg}`, ...args);
      },
    };
  }

  public async dispatchResourceVisit(event: ResourceVisitEvent): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.hooks.onResourceVisit) {
        try {
          await plugin.hooks.onResourceVisit(event, this.createContext(plugin));
        } catch (err) {
          console.error(`[Plugin:${plugin.id}] onResourceVisit error:`, err);
        }
      }
    }
  }

  public async dispatchDownloadIntent(event: DownloadIntentEvent): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.hooks.onDownloadIntent) {
        try {
          await plugin.hooks.onDownloadIntent(event, this.createContext(plugin));
        } catch (err) {
          console.error(`[Plugin:${plugin.id}] onDownloadIntent error:`, err);
        }
      }
    }
  }

  public async dispatchFileServed(event: FileServedEvent): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.hooks.onFileServed) {
        try {
          await plugin.hooks.onFileServed(event, this.createContext(plugin));
        } catch (err) {
          console.error(`[Plugin:${plugin.id}] onFileServed error:`, err);
        }
      }
    }
  }

  public async dispatchLeadCaptured(event: LeadCapturedEvent): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.hooks.onLeadCaptured) {
        try {
          await plugin.hooks.onLeadCaptured(event, this.createContext(plugin));
        } catch (err) {
          console.error(`[Plugin:${plugin.id}] onLeadCaptured error:`, err);
        }
      }
    }
  }

  public async dispatchCommentReceived(event: MetaCommentEvent): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.hooks.onCommentReceived) {
        try {
          await plugin.hooks.onCommentReceived(event, this.createContext(plugin));
        } catch (err) {
          console.error(`[Plugin:${plugin.id}] onCommentReceived error:`, err);
        }
      }
    }
  }
}

// Global singleton instance
export const pluginRegistry = new PluginRegistry();
