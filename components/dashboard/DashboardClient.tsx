"use client";

// ============================================================================
// CREATOR CAMPAIGN & RESOURCE ANALYTICS DASHBOARD
// Editorial Cream & Warm White Aesthetic (Zero AI Slop)
// Dual engine: instant LocalStorage + Supabase cloud sync (via /api/track).
// Charts: Recharts (funnel + per-post campaign comparison).
// ============================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { Metrics, CampaignRecord } from "@/lib/analytics";
import {
  getMetrics,
  clearAnalytics,
  exportEventsJson,
  exportEventsCsv,
  logVisit,
  logDownloadClick,
} from "@/lib/analytics";
import { PROFILE, RESOURCES } from "@/lib/catalog";
import { useToast } from "@/components/useToast";

const funnelLabels = [
  "DMs Sent 🤖",
  "DM Clicks 📲",
  "Page Visits 👁️",
  "Download Clicks 📥",
  "Files Served 📦",
  "Email Leads 💌",
];

const creamyFunnelColors = [
  "#A89A84", // warm stone
  "#78716C", // stone 500
  "#57534E", // stone 600
  "#B45309", // warm amber
  "#15803D", // warm emerald
  "#C2410C", // terracotta
];

export function DashboardClient() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [mountTime, setMountTime] = useState<string>("");
  const [campaignFilter, setCampaignFilter] = useState<"all" | string>("all");
  const [siteUrl, setSiteUrl] = useState("");

  // URL builder state
  const [builderResource, setBuilderResource] = useState(RESOURCES[0]?.slug ?? "");
  const [builderCampaign, setBuilderCampaign] = useState("rag_carousel_01");
  const [builderKeyword, setBuilderKeyword] = useState("RAG");

  const { show, toast } = useToast();

  function refresh() {
    setMetrics(getMetrics());
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
    setMountTime(new Date().toLocaleTimeString());
    refresh();
  }, []);

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-3 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-medium">Aggregating campaign analytics...</p>
      </div>
    );
  }

  const agg = metrics.aggregate;

  function simulateReelClick() {
    const slug = RESOURCES[Math.floor(Math.random() * RESOURCES.length)].slug;
    logVisit(slug);
    setTimeout(() => {
      logDownloadClick(slug);
      refresh();
      show(`Simulated Instagram visit & download registered for ${slug}!`);
    }, 400);
  }

  function copyText(text: string, msg: string) {
    navigator.clipboard.writeText(text).then(
      () => show(msg),
      () => show("Could not auto-copy, please copy manually")
    );
  }

  const builtUrl = `${siteUrl}/r/${builderResource}?utm_source=instagram&utm_medium=comment_dm&utm_campaign=${
    (builderCampaign || "reel_01").trim().toLowerCase().replace(/\s+/g, "_") || "reel_01"
  }`;
  const manychatMessage = `Hey! Here is the ${builderResource} guide you requested by commenting "${builderKeyword}": ${builtUrl}`;

  const filteredCampaigns =
    campaignFilter === "all"
      ? metrics.campaigns
      : metrics.campaigns.filter(
          (c) => c.resource_id === campaignFilter || c.resourceSlug === campaignFilter
        );

  const funnelData = [
    agg.dmsSent,
    agg.dmClicks,
    agg.visits,
    agg.downloadClicks,
    agg.successfulDownloads,
    agg.emailSignups,
  ].map((value, i) => ({
    name: funnelLabels[i],
    value: value,
    fill: creamyFunnelColors[i],
  }));

  const campaignChartData = metrics.campaigns.slice(0, 5).map((c: CampaignRecord) => ({
    name: c.campaign_id,
    visits: c.page_visits || 0,
    downloads: c.download_clicks || 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-8 text-stone-900">
      {toast}

      {/* ===== Header ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
        <div>
          <div className="inline-flex items-center space-x-2 mb-1.5">
            <span className="creamy-badge creamy-badge-accent">
              EDUCATIONAL CAMPAIGN MEASUREMENT
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500">Instagram ➜ Manychat ➜ Website ➜ Storage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Campaign Funnel &amp; Resource Measurement
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Track each Instagram Reel or carousel automation individually, compare conversion rates, and audit the difference between download clicks and served files.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-[#E8E2D8] text-xs text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
            <span>Dual Engine: LocalStorage Active</span>
          </div>
          <button
            type="button"
            onClick={simulateReelClick}
            className="btn-primary text-xs px-3.5 py-1.5"
          >
            Simulate Reel Visit &amp; Download
          </button>
        </div>
      </div>

      {/* ===== Analytics precision callout ===== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E4DCD0] flex items-start space-x-3.5">
        <div className="text-lg flex-shrink-0 text-amber-800">💡</div>
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold text-stone-900">Analytics Precision: Eliminating Analytics Fiction</p>
          <p className="text-stone-600 leading-relaxed text-xs">
            A <strong>Download button click</strong> means someone clicked (intent). A <strong>Successful server response</strong> means your server or Google Drive served the file (delivery). Neither proves that the person opened or completed reading the PDF. This dashboard distinguishes all three so your reporting reflects reality.
          </p>
        </div>
      </div>

      {/* ===== KPI cards ===== */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "DMs Sent", icon: "🤖", value: agg.dmsSent, sub: "Manychat automated sends" },
          { label: "DM Clicks", icon: "📲", value: agg.dmClicks, sub: "DM button click-throughs" },
          { label: "Page Visits", icon: "👁️", value: agg.visits, sub: "Public guide views" },
          { label: "Download Clicks", icon: "📥", value: agg.downloadClicks, sub: "User intent clicks" },
          { label: "Files Served", icon: "📦", value: agg.successfulDownloads, sub: "Server delivery confirmed" },
          {
            label: "Conversion %",
            icon: "📈",
            value: agg.visits > 0 ? `${((agg.downloadClicks / agg.visits) * 100).toFixed(1)}%` : "0%",
            sub: `${agg.emailSignups.toLocaleString()} email leads`,
          },
        ].map((k) => (
          <div key={k.label} className="creamy-card rounded-2xl p-4 sm:p-5 bg-white border border-[#E8E2D8] space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                {k.label}
              </span>
              <span className="text-sm">{k.icon}</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {k.value.toLocaleString()}
            </div>
            <p className="text-[10px] text-stone-400">{k.sub}</p>
          </div>
        ))}
      </section>

      {/* ===== Charts ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="creamy-card rounded-2xl p-6 bg-white border border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                End-to-End Campaign Funnel
              </h2>
              <p className="text-xs text-stone-500">Audience drop-off from Instagram comment to served file</p>
            </div>
            <span className="creamy-badge">Funnel</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F0EBE3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#78716C", fontSize: 10 }} interval={0} angle={-12} dy={8} />
                <YAxis tick={{ fill: "#78716C", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E8E2D8",
                    borderRadius: 10,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  labelStyle={{ color: "#1C1917", fontWeight: 600 }}
                  itemStyle={{ color: "#B45309" }}
                />
                <Bar dataKey="value" name="Conversions" radius={[6, 6, 0, 0]}>
                  {funnelData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="creamy-card rounded-2xl p-6 bg-white border border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Instagram Post Performance Comparison
              </h2>
              <p className="text-xs text-stone-500">Visits &amp; downloads across individual reels/campaigns</p>
            </div>
            <span className="creamy-badge creamy-badge-accent">By Post</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignChartData}>
                <CartesianGrid stroke="#F0EBE3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#78716C", fontSize: 10 }} />
                <YAxis tick={{ fill: "#78716C", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E8E2D8",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#1C1917", fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="visits" name="Page Visits" fill="#78716C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downloads" name="Download Clicks" fill="#B45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ===== Manychat URL Builder ===== */}
      <section className="creamy-card rounded-2xl p-6 md:p-8 bg-white border border-[#E8E2D8] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E2D8] gap-2">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center">
              <span className="mr-2">🤖</span> Manychat Campaign Link Generator
            </h2>
            <p className="text-xs text-stone-500">
              Generate a unique tracked URL for each Instagram Reel or DM automation button to attribute downloads accurately.
            </p>
          </div>
          <span className="creamy-badge self-start sm:self-auto font-mono">
            UTM Attribution
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">1. Target Resource *</label>
            <select
              value={builderResource}
              onChange={(e) => setBuilderResource(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
            >
              {RESOURCES.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.title} ({r.category})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">2. Campaign ID (Reel / Post Slug) *</label>
            <input
              type="text"
              value={builderCampaign}
              onChange={(e) => setBuilderCampaign(e.target.value)}
              placeholder="e.g. rag_carousel_01"
              className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl p-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">3. Comment Keyword</label>
            <input
              type="text"
              value={builderKeyword}
              onChange={(e) => setBuilderKeyword(e.target.value)}
              placeholder="e.g. RAG, SYSTEM, PYTHON"
              className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl p-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
            Tracked Destination URL:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={builtUrl}
              className="flex-grow bg-white border border-[#E8E2D8] rounded-lg px-3 py-2 text-xs font-mono text-stone-800 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyText(builtUrl, "Manychat tracking URL copied!")}
                className="btn-primary text-xs px-4 py-2"
              >
                Copy Link
              </button>
              <button
                type="button"
                onClick={() => window.open(builtUrl, "_blank")}
                className="btn-secondary text-xs px-4 py-2"
              >
                Test In Browser ↗
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E2D8]">
            <p className="text-[11px] text-stone-500 mb-1.5 font-medium">Recommended Manychat DM Copy Template:</p>
            <div className="p-3 rounded-lg bg-white border border-[#E8E2D8] text-xs font-mono text-stone-700 flex items-center justify-between">
              <span className="truncate mr-3">{manychatMessage}</span>
              <button
                type="button"
                onClick={() => copyText(manychatMessage, "Manychat DM template copied!")}
                className="text-[11px] text-amber-900 font-bold hover:underline whitespace-nowrap"
              >
                Copy Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Table B: campaigns ===== */}
      <section className="creamy-card rounded-2xl p-6 md:p-8 bg-white border border-[#E8E2D8] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="creamy-badge creamy-badge-accent font-mono">TABLE B</span>
              <h2 className="text-base font-bold text-stone-900">Campaign Analytics &amp; Post Attribution</h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Compare how distributing the exact same resource through different Instagram Reels performs.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-stone-500">Filter:</span>
            <button
              type="button"
              onClick={() => setCampaignFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                campaignFilter === "all"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setCampaignFilter("RES-001")}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                campaignFilter === "RES-001"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              RES-001 (RAG)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E8E2D8] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <tr>
                <th className="p-3">Campaign ID</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Instagram Reel / Post</th>
                <th className="p-3">Keyword</th>
                <th className="p-3 text-right">DMs Sent</th>
                <th className="p-3 text-right">DM Clicks</th>
                <th className="p-3 text-right">Visits</th>
                <th className="p-3 text-right">Downloads</th>
                <th className="p-3 text-right">Conv %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DF]">
              {filteredCampaigns.map((c) => {
                const conv =
                  c.page_visits > 0
                    ? ((c.download_clicks / c.page_visits) * 100).toFixed(1)
                    : "0.0";
                return (
                  <tr key={c.campaign_id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-3 font-mono font-semibold text-stone-900">{c.campaign_id}</td>
                    <td className="p-3 font-mono text-stone-500">{c.resource_id}</td>
                    <td className="p-3 text-stone-800 font-medium">{c.instagram_post}</td>
                    <td className="p-3">
                      <span className="font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                        "{c.keyword}"
                      </span>
                    </td>
                    <td className="p-3 text-right text-stone-600">{c.dm_sent.toLocaleString()}</td>
                    <td className="p-3 text-right text-stone-600">{c.dm_clicks.toLocaleString()}</td>
                    <td className="p-3 text-right text-stone-900 font-semibold">{c.page_visits.toLocaleString()}</td>
                    <td className="p-3 text-right text-emerald-800 font-bold">{c.download_clicks.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-stone-900">{conv}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Data export controls */}
        <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
          <span>Mounted at {mountTime} · Stored in LocalStorage &amp; Supabase</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                exportEventsJson();
                show("Events exported as JSON");
              }}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Export JSON
            </button>
            <button
              onClick={() => {
                exportEventsCsv();
                show("Events exported as CSV");
              }}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                if (confirm("Reset local analytics to initial benchmark seed?")) {
                  clearAnalytics();
                  refresh();
                  show("Analytics reset to seed data.");
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-rose-700 hover:bg-rose-50 border border-rose-200"
            >
              Reset Data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
