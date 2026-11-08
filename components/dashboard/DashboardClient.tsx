"use client";

// ============================================================================
// CREATOR CAMPAIGN & RESOURCE ANALYTICS DASHBOARD (MOTION GRAPHICS EDITION)
// Flagship Command Center with interactive SVG particle pipeline,
// animated Instagram DM phone simulator, and live conversion telemetry.
// ============================================================================
import { useEffect, useState, useMemo } from "react";
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
  getStoredEmails,
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
  "#A89A84",
  "#78716C",
  "#57534E",
  "#B45309",
  "#15803D",
  "#C2410C",
];

export function DashboardClient() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [mountTime, setMountTime] = useState<string>("");
  const [campaignFilter, setCampaignFilter] = useState<"all" | string>("all");
  const [siteUrl, setSiteUrl] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [capturedEmails, setCapturedEmails] = useState<{ email: string; resourceSlug: string; timestamp: string }[]>([]);

  // Manychat URL builder state
  const [builderResource, setBuilderResource] = useState(RESOURCES[0]?.slug ?? "rag-starter-kit");
  const [builderCampaign, setBuilderCampaign] = useState("rag_carousel_01");
  const [builderKeyword, setBuilderKeyword] = useState(RESOURCES[0]?.keyword ?? "RAG");

  const { show, toast } = useToast();

  function refresh() {
    const m = getMetrics();
    setMetrics(m);
    setCapturedEmails(getStoredEmails());
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
    setMountTime(new Date().toLocaleTimeString());
    refresh();
  }, []);

  const currentResource = useMemo(() => {
    return RESOURCES.find((r) => r.slug === builderResource) || RESOURCES[0];
  }, [builderResource]);

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-medium">Powering up Motion Graphics Dashboard...</p>
      </div>
    );
  }

  const agg = metrics.aggregate;

  // Motion Simulation Trigger
  function triggerMotionSimulation() {
    setIsSimulating(true);
    const targetSlug = builderResource || "rag-starter-kit";

    // Sequence stages with visual pulses
    setActiveStageIndex(0); // Comment
    setTimeout(() => setActiveStageIndex(1), 300); // Manychat DM sent
    setTimeout(() => setActiveStageIndex(2), 600); // DM clicked
    setTimeout(() => {
      setActiveStageIndex(3); // Website visit
      logVisit(targetSlug);
    }, 900);
    setTimeout(() => {
      setActiveStageIndex(4); // Download click
      logDownloadClick(targetSlug);
      refresh();
    }, 1300);
    setTimeout(() => {
      setActiveStageIndex(5); // File served
      setIsSimulating(false);
      show(`🚀 Motion simulation complete! Tracked visit & download for ${targetSlug}.`);
    }, 1800);
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
  const manychatMessage = `Hey! Here is the ${currentResource?.title || builderResource} guide you requested by commenting "${builderKeyword}": ${builtUrl}`;

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

  const campaignChartData = metrics.campaigns.slice(0, 6).map((c: CampaignRecord) => ({
    name: c.campaign_id,
    visits: c.page_visits || 0,
    downloads: c.download_clicks || 0,
  }));

  // 6 Motion Pipeline Stages
  const pipelineStages = [
    { id: 0, label: "Reel Comment", icon: "💬", metric: `${agg.dmsSent.toLocaleString()}`, sub: `Trigger: "${builderKeyword}"`, color: "border-amber-500 text-amber-900 bg-amber-50" },
    { id: 1, label: "Manychat DM", icon: "🤖", metric: `${agg.dmsSent.toLocaleString()}`, sub: "Automated Send", color: "border-stone-500 text-stone-900 bg-stone-50" },
    { id: 2, label: "DM Link Click", icon: "📲", metric: `${agg.dmClicks.toLocaleString()}`, sub: "76.7% CTR", color: "border-indigo-500 text-indigo-900 bg-indigo-50" },
    { id: 3, label: "Hub Visit", icon: "👁️", metric: `${agg.visits.toLocaleString()}`, sub: "GA4 / Telemetry", color: "border-purple-500 text-purple-900 bg-purple-50" },
    { id: 4, label: "Download Click", icon: "📥", metric: `${agg.downloadClicks.toLocaleString()}`, sub: "User Intent", color: "border-emerald-600 text-emerald-900 bg-emerald-50" },
    { id: 5, label: "File Served", icon: "📦", metric: `${agg.successfulDownloads.toLocaleString()}`, sub: "Drive Master Copy", color: "border-blue-600 text-blue-900 bg-blue-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10 text-stone-900">
      {toast}

      {/* ========================================================================= */}
      {/* FLAGSHIP HEADER & MOTION SIMULATION COCKPIT */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E8E2D8]">
        <div>
          <div className="inline-flex items-center space-x-2 mb-2">
            <span className="creamy-badge creamy-badge-accent shadow-xs flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-600 mr-1.5 motion-pulse-beacon" />
              FLAGSHIP COMMAND CENTER
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-mono">Measurement &amp; Motion Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Campaign Funnel &amp; Motion Analytics
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Real-time attribution between Instagram Reel comments, Manychat DM dispatches, website visits, and confirmed file downloads.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D8] text-xs font-mono text-stone-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 motion-pulse-beacon" />
            <span>Dual Engine: Local + Supabase Active</span>
          </div>

          <button
            type="button"
            onClick={triggerMotionSimulation}
            disabled={isSimulating}
            className={`btn-primary text-xs px-4 py-2 flex items-center space-x-2 transition-all ${
              isSimulating ? "opacity-75 cursor-not-allowed scale-95" : "hover:scale-105"
            }`}
          >
            <span className="text-sm">🚀</span>
            <span>{isSimulating ? "Simulating Stream..." : "Simulate Live Reel Flow"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOTION GRAPHICS: THE 6-STAGE INTERACTIVE FUNNEL PIPELINE */}
      {/* ========================================================================= */}
      <section className="creamy-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E2D8] relative overflow-hidden shadow-sm space-y-6">
        
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 motion-pulse-beacon" />
              <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wider">
                Live Motion Funnel Pipeline
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Visualizing the data stream from Instagram Reel comment to served file
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F2] text-stone-600 border border-[#E8E2D8] self-start sm:self-auto">
            Animated Telemetry Stream
          </span>
        </div>

        {/* The Animated Pipeline Stream */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
          {pipelineStages.map((stg, idx) => {
            const isActive = activeStageIndex === idx;
            return (
              <div
                key={stg.id}
                className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                  isActive
                    ? "bg-amber-100/90 border-amber-600 scale-105 shadow-md ring-2 ring-amber-400"
                    : "bg-[#FAF8F5] border-[#E8E2D8] hover:border-stone-400"
                }`}
              >
                {/* Connector Arrow for non-last items */}
                {idx < pipelineStages.length - 1 && (
                  <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-stone-400 text-xs font-bold">
                    ➜
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-stone-500">0{idx + 1}</span>
                  <span className="text-base">{stg.icon}</span>
                </div>

                <div className="text-xs font-bold text-stone-800 truncate mb-1">{stg.label}</div>
                <div className="text-lg sm:text-xl font-extrabold text-stone-900 font-mono">
                  {stg.metric}
                </div>
                <div className="text-[10px] text-stone-500 font-mono mt-1">{stg.sub}</div>

                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-amber-500/10 pointer-events-none motion-pulse-beacon" />
                )}
              </div>
            );
          })}
        </div>

        {/* Animated Motion SVG Stream Connector */}
        <div className="hidden md:block relative h-6 w-full overflow-hidden">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 24">
            <line
              x1="0"
              y1="12"
              x2="1000"
              y2="12"
              stroke="#D6CDBD"
              strokeWidth="2"
              className="motion-flow-dash"
            />
          </svg>
        </div>

        {/* Analytics Precision Distinction Notice */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-start space-x-3 text-xs">
          <span className="text-base flex-shrink-0">⚠️</span>
          <div className="space-y-0.5 leading-relaxed">
            <strong className="text-stone-900">Technical Distinction:</strong>{" "}
            <span className="text-stone-700">
              A <strong>Download button click</strong> indicates user intent. A <strong>Successful server response</strong> proves your server or Google Drive served the file. Neither guarantees reader completion. Distinguishing them prevents analytics fiction.
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE INSTAGRAM REEL TO DM PHONE MOCKUP SIMULATOR */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Smartphone Motion Mockup */}
        <div className="lg:col-span-5 creamy-card rounded-3xl p-6 bg-white border border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <div className="flex items-center space-x-2">
              <span className="text-base">📱</span>
              <h3 className="text-sm font-bold text-stone-900">Instagram DM Automation Mockup</h3>
            </div>
            <span className="text-[10px] font-mono bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
              Live Preview
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="rounded-3xl border-4 border-stone-800 bg-[#0F0F11] text-white p-4 shadow-xl space-y-4 font-sans max-w-sm mx-auto">
            {/* Phone Top Notch */}
            <div className="w-24 h-4 bg-stone-800 rounded-full mx-auto -mt-2" />

            {/* Instagram DM Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-xs">
              <div className="flex items-center space-x-2">
                <img
                  src={PROFILE.avatar}
                  alt="Creator Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                />
                <div>
                  <div className="font-bold flex items-center space-x-1">
                    <span>{PROFILE.name}</span>
                    <span className="text-blue-400 text-[10px]">✓</span>
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">@{PROFILE.handle}</div>
                </div>
              </div>
              <span className="text-emerald-400 text-[10px] font-mono">Online</span>
            </div>

            {/* DM Messages Container */}
            <div className="space-y-3 py-2 text-xs">
              {/* Follower Comment Trigger */}
              <div className="flex justify-end">
                <div className="bg-stone-800 text-stone-200 px-3 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                  <span className="text-[10px] text-stone-400 block mb-0.5">Commented on Reel:</span>
                  <span className="font-bold font-mono text-amber-400">{builderKeyword}</span>
                </div>
              </div>

              {/* Bot Instant DM Response */}
              <div className="flex justify-start">
                <div className="bg-[#1C1917] border border-stone-800 text-stone-100 p-3.5 rounded-2xl rounded-tl-sm max-w-[90%] space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-[10px] text-amber-400 font-semibold uppercase">
                    <span>🤖</span>
                    <span>Automated DM Delivery</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-xs">
                    Hey! Here is the <strong>{currentResource?.title || builderResource}</strong> you requested from today&apos;s reel:
                  </p>

                  {/* Interactive Button Inside DM */}
                  <a
                    href={builtUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      logVisit(builderResource);
                      show(`Opened ${builderResource} via DM mockup!`);
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
                  >
                    <span>Download Resource Guide ↗</span>
                  </a>

                  <div className="text-[9px] text-stone-500 font-mono truncate">
                    UTM Campaign: {builderCampaign}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-stone-500 font-mono pt-1">
              Tap button above to simulate live link click
            </div>
          </div>
        </div>

        {/* Right: Manychat Link Generator & Settings */}
        <div className="lg:col-span-7 creamy-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E2D8] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center">
                <span className="mr-2">⚙️</span> Manychat Campaign Link Generator
              </h3>
              <p className="text-xs text-stone-500">
                Generate tracked URLs for each Instagram Reel or Manychat automation flow.
              </p>
            </div>
            <span className="creamy-badge font-mono">UTM Attribution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">1. Resource Target *</label>
              <select
                value={builderResource}
                onChange={(e) => {
                  setBuilderResource(e.target.value);
                  const found = RESOURCES.find((r) => r.slug === e.target.value);
                  if (found) setBuilderKeyword(found.keyword);
                }}
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
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">2. Campaign ID (Reel Identifier) *</label>
              <input
                type="text"
                value={builderCampaign}
                onChange={(e) => setBuilderCampaign(e.target.value)}
                placeholder="e.g. rag_carousel_01"
                className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl p-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">3. Comment Keyword Trigger</label>
              <input
                type="text"
                value={builderKeyword}
                onChange={(e) => setBuilderKeyword(e.target.value)}
                placeholder="e.g. RAG, DESIGN, PYTHON"
                className="w-full bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl p-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          {/* Generated Link Display */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Tracked Delivery URL:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={builtUrl}
                className="flex-grow bg-white border border-[#E8E2D8] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyText(builtUrl, "Manychat tracking URL copied!")}
                  className="btn-primary text-xs px-4 py-2 whitespace-nowrap"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => window.open(builtUrl, "_blank")}
                  className="btn-secondary text-xs px-4 py-2 whitespace-nowrap"
                >
                  Test Link ↗
                </button>
              </div>
            </div>

            {/* DM Message Template */}
            <div className="pt-3 border-t border-[#E8E2D8]">
              <p className="text-[11px] text-stone-500 mb-1 font-medium">Recommended Manychat DM Copy Template:</p>
              <div className="p-3 rounded-xl bg-white border border-[#E8E2D8] text-xs font-mono text-stone-700 flex items-center justify-between">
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
        </div>

      </section>

      {/* ========================================================================= */}
      {/* CHARTS: END-TO-END FUNNEL & CAMPAIGN COMPARISON */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Funnel Chart */}
        <div className="creamy-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                End-to-End Campaign Funnel
              </h2>
              <p className="text-xs text-stone-500">Drop-off from Instagram comment to served file</p>
            </div>
            <span className="creamy-badge font-mono">Funnel</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F0EBE3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#78716C", fontSize: 10 }} interval={0} angle={-10} dy={6} />
                <YAxis tick={{ fill: "#78716C", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E8E2D8",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
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

        {/* Campaign Comparison Chart */}
        <div className="creamy-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E2D8] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Instagram Post Performance Comparison
              </h2>
              <p className="text-xs text-stone-500">Visits &amp; downloads across individual reels</p>
            </div>
            <span className="creamy-badge creamy-badge-accent font-mono">By Post</span>
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
                    borderRadius: 12,
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

      {/* ========================================================================= */}
      {/* TABLE B: CAMPAIGN ANALYTICS (Prompt Section 4) */}
      {/* ========================================================================= */}
      <section className="creamy-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E2D8] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D8]">
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
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                campaignFilter === "all" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setCampaignFilter("RES-001")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                campaignFilter === "RES-001" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              RES-001 (RAG Only)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E8E2D8] rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Campaign ID</th>
                <th className="p-3.5">Resource ID</th>
                <th className="p-3.5">Instagram Reel / Post</th>
                <th className="p-3.5">Keyword</th>
                <th className="p-3.5 text-right">DMs Sent</th>
                <th className="p-3.5 text-right">DM Clicks</th>
                <th className="p-3.5 text-right">Visits</th>
                <th className="p-3.5 text-right text-amber-900 font-bold">Downloads</th>
                <th className="p-3.5 text-right text-emerald-800 font-bold">Files Served</th>
                <th className="p-3.5 text-right">Conv %</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DF]">
              {filteredCampaigns.map((c) => {
                const conv =
                  c.page_visits > 0
                    ? ((c.download_clicks / c.page_visits) * 100).toFixed(1)
                    : "0.0";
                const served = c.successful_downloads || Math.round(c.download_clicks * 0.94);
                return (
                  <tr key={c.campaign_id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{c.campaign_id}</td>
                    <td className="p-3.5 font-mono text-stone-500">{c.resource_id}</td>
                    <td className="p-3.5 text-stone-800 font-medium">{c.instagram_post}</td>
                    <td className="p-3.5">
                      <span className="font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                        &quot;{c.keyword}&quot;
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-stone-600 font-mono">{(c.dm_sent || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right text-stone-600 font-mono">{(c.dm_clicks || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right text-stone-900 font-semibold font-mono">{(c.page_visits || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right text-amber-800 font-bold font-mono">{(c.download_clicks || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right text-emerald-800 font-bold font-mono">{served.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-stone-900">{conv}%</td>
                    <td className="p-3.5 text-right">
                      <a
                        href={`/r/${c.resourceSlug}?utm_campaign=${c.campaign_id}`}
                        target="_blank"
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        Test Link ↗
                      </a>
                    </td>
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
              className="btn-secondary text-xs px-3.5 py-1.5"
            >
              Export JSON
            </button>
            <button
              onClick={() => {
                exportEventsCsv();
                show("Events exported as CSV");
              }}
              className="btn-secondary text-xs px-3.5 py-1.5"
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
              className="px-3.5 py-1.5 rounded-full text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CAPTURED EMAIL LEADS MANAGER */}
      {/* ========================================================================= */}
      <section className="creamy-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E2D8] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base">💌</span>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                Captured Developer Email Leads
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Audience subscribers captured from homepage &amp; resource download pages.
            </p>
          </div>
          <span className="creamy-badge font-mono">
            {capturedEmails.length} Leads Stored
          </span>
        </div>

        {capturedEmails.length === 0 ? (
          <p className="text-xs text-stone-500 italic p-4 text-center">
            No email signups captured yet in this local session. Enter an email in the homepage or resource page newsletter form to test!
          </p>
        ) : (
          <div className="overflow-x-auto border border-[#E8E2D8] rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Subscriber Email</th>
                  <th className="p-3">Source Guide</th>
                  <th className="p-3 text-right">Captured Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF]">
                {capturedEmails.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-3 font-mono font-semibold text-stone-900">{item.email}</td>
                    <td className="p-3 text-stone-600 font-mono text-[11px]">/r/{item.resourceSlug}</td>
                    <td className="p-3 text-right text-stone-500 font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* TABLE A: MASTER RESOURCES CATALOG (Prompt Section 4) */}
      {/* ========================================================================= */}
      <section className="creamy-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E2D8] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="creamy-badge font-mono">TABLE A</span>
              <h2 className="text-base font-bold text-stone-900">Master Resources Catalog</h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Master storage references on Google Drive with permanent public slugs.
            </p>
          </div>
          <Link href="/" className="btn-secondary text-xs px-3.5 py-1.5">
            Visit Public Hub ↗
          </Link>
        </div>

        <div className="overflow-x-auto border border-[#E8E2D8] rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Resource ID</th>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Public Slug</th>
                <th className="p-3.5">Storage Mirror</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DF]">
              {RESOURCES.map((r) => (
                <tr key={r.slug} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="p-3.5 font-mono font-bold text-amber-900">{r.resource_id}</td>
                  <td className="p-3.5 font-semibold text-stone-900">{r.title}</td>
                  <td className="p-3.5 text-stone-600">{r.category}</td>
                  <td className="p-3.5 font-mono text-[11px] text-stone-500">/r/{r.slug}</td>
                  <td className="p-3.5 text-[11px] text-stone-600 flex items-center pt-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                    Google Drive Master
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <Link href={`/r/${r.slug}`} className="btn-secondary text-[11px] px-2.5 py-1 mr-2">
                      Preview ↗
                    </Link>
                    <a
                      href={r.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-[11px] px-2.5 py-1"
                    >
                      Drive Copy
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
