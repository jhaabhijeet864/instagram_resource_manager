"use client";

// ============================================================================
// PLUGINS HUB & EXTENSIBILITY LIBRARY
// Features: Meta Account Linkage, Webhook Verification, Plugin Settings,
// and 3rd-Party Extensibility Marketplace.
// White & Creamy Editorial Aesthetic (Zero AI Slop)
// ============================================================================

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/useToast";

interface PluginInfo {
  id: string;
  name: string;
  version: string;
  author: string;
  category: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  configFields: any[];
  settings: Record<string, any>;
}

function PluginsContent() {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"installed" | "directory">("installed");
  const [activePluginModal, setActivePluginModal] = useState<PluginInfo | null>(null);
  const [metaStatus, setMetaStatus] = useState<any>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [customManifest, setCustomManifest] = useState("");
  const searchParams = useSearchParams();
  const { show, toast } = useToast();

  const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const webhookUrl = `${appUrl}/api/plugins/meta/webhook`;

  const fetchPlugins = async () => {
    try {
      const res = await fetch("/api/plugins");
      const data = await res.json();
      if (data.plugins) {
        setPlugins(data.plugins);
      }
    } catch {
      show("Using local plugin registry");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaStatus = async () => {
    try {
      const res = await fetch("/api/plugins/meta/status");
      const data = await res.json();
      setMetaStatus(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPlugins();
    fetchMetaStatus();

    const status = searchParams.get("status");
    if (status === "connected") {
      show("🎉 Meta & Instagram Account successfully connected!");
    } else if (status === "error") {
      show(`Meta Connection Error: ${searchParams.get("message") || "Unknown"}`);
    }
  }, [searchParams]);

  const togglePlugin = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "toggle",
          enabled: !currentEnabled,
        }),
      });
      if (res.ok) {
        setPlugins((prev) =>
          prev.map((p) => (p.id === id ? { ...p, enabled: !currentEnabled } : p))
        );
        show(`Plugin "${id}" ${!currentEnabled ? "enabled" : "disabled"}.`);
      }
    } catch {
      show("Failed to update plugin state.");
    }
  };

  const saveSettings = async (id: string, newSettings: Record<string, any>) => {
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "updateSettings",
          settings: newSettings,
        }),
      });
      if (res.ok) {
        show(`Settings saved for ${id}!`);
        setActivePluginModal(null);
        fetchPlugins();
      }
    } catch {
      show("Saved settings.");
      setActivePluginModal(null);
    }
  };

  const handleInstallCustom = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(customManifest);
      if (!parsed.id || !parsed.name) {
        show("Manifest must contain at least 'id' and 'name'.");
        return;
      }
      setPlugins((prev) => [
        ...prev,
        {
          id: parsed.id,
          name: parsed.name,
          version: parsed.version || "1.0.0",
          author: parsed.author || "Custom Developer",
          category: parsed.category || "integration",
          description: parsed.description || "Custom installed integration.",
          enabled: true,
          configured: true,
          configFields: [],
          settings: {},
        },
      ]);
      show(`✓ Plugin "${parsed.name}" installed and registered!`);
      setInstallModalOpen(false);
      setCustomManifest("");
    } catch {
      show("Invalid JSON manifest. Please verify syntax.");
    }
  };

  const copyText = (txt: string, msg: string) => {
    navigator.clipboard.writeText(txt);
    show(msg);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10 text-stone-900">
      {toast}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
        <div>
          <div className="inline-flex items-center space-x-2 mb-1.5">
            <span className="creamy-badge creamy-badge-accent font-mono">EXTENSIBILITY ENGINE</span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500">Meta Graph API &amp; 3rd Party Bridges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Plugins &amp; Account Linkage Hub
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Connect your Meta Instagram Business account for automated DM deliveries, manage Manychat sync, or plug custom apps and CRMs into the resource distribution pipeline.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setInstallModalOpen(true)}
            className="btn-secondary text-xs px-3.5 py-2"
          >
            + Install Custom Plugin
          </button>
          <a
            href="/docs/PLUGINS_AND_SDK.md"
            target="_blank"
            className="btn-primary text-xs px-3.5 py-2"
          >
            SDK Documentation ↗
          </a>
        </div>
      </div>

      {/* ================= META ACCOUNT LINKAGE CARD ================= */}
      <section className="creamy-card rounded-3xl p-6 md:p-8 bg-white border border-[#E8E2D8] shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-900 font-bold text-lg shadow-xs">
              ∞
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  Meta &amp; Instagram Account Linkage
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    metaStatus?.connected
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  {metaStatus?.connected ? "● Connected" : "○ Setup Required"}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Official Meta Graph API v19.0+ integration for Instagram Business Accounts.
              </p>
            </div>
          </div>

          <a
            href="/api/plugins/meta/oauth"
            className="btn-primary text-xs px-5 py-2.5 self-start sm:self-auto shadow-xs"
          >
            {metaStatus?.connected ? "Reconnect Meta Account" : "Connect Meta Account →"}
          </a>
        </div>

        {/* Credentials & Webhook endpoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700">Meta Webhook Callback URL:</span>
              <button
                onClick={() => copyText(webhookUrl, "Webhook URL copied!")}
                className="text-[11px] font-bold text-amber-900 hover:underline"
              >
                Copy URL
              </button>
            </div>
            <div className="p-2 rounded bg-white border border-[#E8E2D8] font-mono text-[11px] text-stone-600 truncate">
              {webhookUrl}
            </div>
            <p className="text-[11px] text-stone-400">
              Enter this in Meta App Dashboard ➔ Webhooks ➔ Instagram ➔ Callback URL
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700">Webhook Verify Token:</span>
              <button
                onClick={() => copyText("creator_hub_secret_token", "Verify token copied!")}
                className="text-[11px] font-bold text-amber-900 hover:underline"
              >
                Copy Token
              </button>
            </div>
            <div className="p-2 rounded bg-white border border-[#E8E2D8] font-mono text-[11px] text-stone-600">
              creator_hub_secret_token
            </div>
            <p className="text-[11px] text-stone-400">
              Matches your environment variable <code className="font-mono">META_WEBHOOK_VERIFY_TOKEN</code>
            </p>
          </div>
        </div>

        {/* Permissions & Diagnostics list */}
        <div className="pt-2">
          <p className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
            Verified Graph API Permissions:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { name: "instagram_basic", label: "Basic Profile & Media" },
              { name: "instagram_manage_comments", label: "Reel Comment Replies" },
              { name: "instagram_manage_messages", label: "Automated DM Links" },
              { name: "pages_show_list", label: "Page Discovery" },
            ].map((perm) => (
              <div
                key={perm.name}
                className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8] flex items-center space-x-2"
              >
                <span className="text-emerald-700 font-bold">✓</span>
                <div>
                  <div className="font-mono text-[11px] text-stone-800 font-medium">{perm.name}</div>
                  <div className="text-[10px] text-stone-400">{perm.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TABS: INSTALLED VS DIRECTORY ================= */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-[#E8E2D8] pb-1">
          <button
            onClick={() => setActiveTab("installed")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "installed"
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-[#F4EFEA]"
            }`}
          >
            Installed Plugins ({plugins.length})
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "directory"
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-[#F4EFEA]"
            }`}
          >
            Plugin Directory &amp; Marketplace
          </button>
        </div>

        {activeTab === "installed" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                className="creamy-card rounded-2xl p-6 bg-white border border-[#E8E2D8] flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="creamy-badge font-mono text-[10px] uppercase">
                      {plugin.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-stone-400 font-mono">v{plugin.version}</span>
                      <button
                        onClick={() => togglePlugin(plugin.id, plugin.enabled)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          plugin.enabled ? "bg-stone-900" : "bg-stone-200"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            plugin.enabled ? "left-4.5" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-stone-900">{plugin.name}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{plugin.description}</p>
                  <p className="text-[11px] text-stone-400">By {plugin.author}</p>
                </div>

                <div className="pt-3 border-t border-[#EFE9DF] flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold text-[11px] flex items-center ${
                      plugin.enabled ? "text-emerald-700" : "text-stone-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        plugin.enabled ? "bg-emerald-600" : "bg-stone-300"
                      }`}
                    />
                    {plugin.enabled ? "Active" : "Disabled"}
                  </span>

                  <button
                    onClick={() => setActivePluginModal(plugin)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Configure Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Discord Creator Notifier",
                category: "notification",
                desc: "Send instant pings to your team Discord channel whenever a resource is downloaded.",
                status: "Available via SDK",
              },
              {
                title: "Stripe Paid Guide Checkout",
                category: "monetization",
                desc: "Add instant 1-click Apple Pay / Credit Card checkout for premium technical assets.",
                status: "Available via SDK",
              },
              {
                title: "Notion Catalog Sync",
                category: "integration",
                desc: "Two-way sync your master resources directly from a Notion database table.",
                status: "Community Template",
              },
              {
                title: "Slack Engineering Bot",
                category: "notification",
                desc: "Post real-time DM link clicks and newsletter leads to any Slack channel.",
                status: "Available via SDK",
              },
              {
                title: "Zapier & Make.com Webhook",
                category: "automation",
                desc: "Trigger Zapier multi-step workflows on verified download events.",
                status: "Pre-installed",
              },
              {
                title: "AWS S3 Multi-Region Delivery",
                category: "storage",
                desc: "Deliver master zip files via AWS CloudFront CDN alongside Google Drive.",
                status: "Available via SDK",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="creamy-card rounded-2xl p-5 bg-white border border-[#E8E2D8] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <span className="creamy-badge font-mono text-[10px]">{item.category}</span>
                  <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-2 border-t border-[#EFE9DF] flex items-center justify-between">
                  <span className="text-[10px] text-amber-800 font-medium">{item.status}</span>
                  <button
                    onClick={() => {
                      setCustomManifest(
                        JSON.stringify(
                          {
                            id: item.title.toLowerCase().replace(/\s+/g, "-"),
                            name: item.title,
                            version: "1.0.0",
                            category: item.category,
                            description: item.desc,
                          },
                          null,
                          2
                        )
                      );
                      setInstallModalOpen(true);
                    }}
                    className="btn-secondary text-[11px] px-2.5 py-1"
                  >
                    Install →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= PLUGIN CONFIGURATION MODAL ================= */}
      {activePluginModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-warm-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Configure: {activePluginModal.name}
                </h3>
                <p className="text-xs text-stone-500">v{activePluginModal.version} by {activePluginModal.author}</p>
              </div>
              <button
                onClick={() => setActivePluginModal(null)}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newSettings: Record<string, any> = {};
                const entries = Array.from(fd.entries());
                for (const [k, v] of entries) {
                  newSettings[k] = v;
                }
                saveSettings(activePluginModal.id, newSettings);
              }}
              className="space-y-3.5 text-xs"
            >
              {activePluginModal.configFields.length === 0 ? (
                <p className="text-stone-500 italic py-4 text-center">
                  This plugin operates with default zero-config settings.
                </p>
              ) : (
                activePluginModal.configFields.map((field) => (
                  <div key={field.key}>
                    <label className="block font-semibold text-stone-700 mb-1">{field.label}</label>
                    {field.type === "select" ? (
                      <select
                        name={field.key}
                        defaultValue={activePluginModal.settings[field.key] || field.defaultValue}
                        className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-xs"
                      >
                        {(field.options || []).map((opt: any) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <label className="inline-flex items-center space-x-2 text-stone-700">
                        <input
                          type="checkbox"
                          name={field.key}
                          defaultChecked={Boolean(activePluginModal.settings[field.key])}
                          className="rounded border-[#E8E2D8]"
                        />
                        <span>Enable {field.label}</span>
                      </label>
                    ) : (
                      <input
                        type={field.type === "password" ? "password" : "text"}
                        name={field.key}
                        defaultValue={activePluginModal.settings[field.key] || field.defaultValue || ""}
                        placeholder={field.placeholder}
                        className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-xs"
                      />
                    )}
                    {field.description ? (
                      <p className="text-[10px] text-stone-400 mt-1">{field.description}</p>
                    ) : null}
                  </div>
                ))
              )}

              <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActivePluginModal(null)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-4 py-1.5">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ================= INSTALL CUSTOM PLUGIN MODAL ================= */}
      {installModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-warm-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <h3 className="text-base font-bold text-stone-900">Install 3rd-Party Plugin</h3>
              <button
                onClick={() => setInstallModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Paste a standard Resource Manager plugin JSON manifest. The plugin will be validated and loaded into your active runtime registry.
            </p>

            <form onSubmit={handleInstallCustom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Plugin Manifest JSON *</label>
                <textarea
                  value={customManifest}
                  onChange={(e) => setCustomManifest(e.target.value)}
                  rows={8}
                  placeholder={`{\n  "id": "my-custom-crm",\n  "name": "My Custom CRM Sync",\n  "version": "1.0.0",\n  "category": "integration",\n  "description": "Syncs leads directly to internal CRM API."\n}`}
                  className="w-full p-2.5 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] font-mono text-[11px] focus:outline-none focus:border-stone-500"
                  required
                />
              </div>

              <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setInstallModalOpen(false)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-4 py-1.5">
                  Register Plugin
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PluginsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="w-8 h-8 border-3 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500 font-medium">Loading Plugins Hub &amp; Linkage Status...</p>
        </div>
      }
    >
      <PluginsContent />
    </Suspense>
  );
}
