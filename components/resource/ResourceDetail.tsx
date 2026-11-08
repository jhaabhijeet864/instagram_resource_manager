"use client";

// ============================================================================
// BRANDED EDITORIAL RESOURCE LANDING VIEW: /r/[slug]
// Clean creamy paper aesthetic with campaign attribution, TOC, snippet & prompts.
// ============================================================================
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Resource } from "@/lib/catalog";
import { PROFILE } from "@/lib/catalog";
import { logVisit, logDownloadClick, logEmailSignup } from "@/lib/analytics";
import { useToast } from "@/components/useToast";

type TabName = "overview" | "code" | "prompts" | "diagram";

const TABS: { id: TabName; icon: string; label: string }[] = [
  { id: "overview", icon: "📑", label: "Guide Overview" },
  { id: "code", icon: "💻", label: "Code Snippet" },
  { id: "prompts", icon: "⚡", label: "Prompt Vault" },
  { id: "diagram", icon: "📐", label: "Architecture Flow" },
];

export function ResourceDetail({ resource }: { resource: Resource }) {
  const searchParams = useSearchParams();
  const utmCampaign = searchParams.get("utm_campaign");
  const { show, toast } = useToast();
  const [tab, setTab] = useState<TabName>("overview");
  const [downloadLogged, setDownloadLogged] = useState(false);
  const visitLogged = useRef(false);

  useEffect(() => {
    if (visitLogged.current) return;
    visitLogged.current = true;
    logVisit(resource.slug);
  }, [resource.slug]);

  function handleDownloadClick() {
    logDownloadClick(resource.slug);
    setDownloadLogged(true);
    show("Download initiated! Fetching verified master file...");
  }

  function copyText(text: string, msg: string) {
    navigator.clipboard.writeText(text).then(
      () => show(msg),
      () => show("Could not auto-copy, please copy manually")
    );
  }

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement | null;
    const email = input?.value.trim();
    if (!email) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resourceSlug: resource.slug }),
      });
    } catch {
      // local log below
    }
    logEmailSignup(resource.slug, email);
    show("Subscribed! You will receive revision updates for this guide.");
    e.currentTarget.reset();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {toast}

      <article className="space-y-8">
        {/* ===== Breadcrumbs ===== */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-stone-700">{resource.category}</span>
          <span>/</span>
          <span className="text-stone-400 font-mono truncate">{resource.slug}</span>
        </nav>

        {/* Campaign attribution notice */}
        {utmCampaign ? (
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <span>🎯</span>
              <span>
                Delivered via Instagram Campaign: <strong className="font-mono">{utmCampaign}</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 border border-amber-300/60 font-semibold">
              UTM Tracked
            </span>
          </div>
        ) : null}

        {/* Header & Badges */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="creamy-badge creamy-badge-accent uppercase tracking-wider">
              {resource.category}
            </span>
            <span className="text-xs font-mono text-stone-500">{resource.resource_id}</span>
            {resource.badge ? (
              <span className="creamy-badge creamy-badge-success">{resource.badge}</span>
            ) : (
              <span className="creamy-badge">Verified File</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {resource.title}
          </h1>

          <p className="text-base text-stone-600 leading-relaxed max-w-3xl">
            {resource.description}
          </p>
        </div>

        {/* ===== Download Action Card ===== */}
        <div className="creamy-card rounded-3xl p-6 md:p-8 bg-white border border-[#E8E2D8] shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F4EFEA] border border-[#E2D9CC] flex items-center justify-center text-stone-800 flex-shrink-0 shadow-xs">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-stone-900 font-mono">{resource.fileName}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Format: {resource.fileType.toUpperCase()} · File Size: {resource.fileSize} · Verified Master Copy
                </p>
              </div>
            </div>

            <a
              id="res-download-btn"
              href={`/api/download/${resource.slug}${
                utmCampaign ? `?utm_campaign=${encodeURIComponent(utmCampaign)}` : ""
              }`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownloadClick}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-xs font-bold tracking-wide uppercase shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download Master Copy</span>
            </a>
          </div>

          <div className="pt-4 border-t border-[#EFE9DF] flex flex-wrap items-center justify-between text-xs text-stone-500 gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>
                Storage Provider: <strong>Google Drive Master Vault</strong>
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-400">Cloudflare R2 hot-swap ready</span>
            </div>
            <div
              className={`flex items-center space-x-2 text-[11px] font-mono ${
                downloadLogged ? "text-emerald-700" : "text-stone-500"
              }`}
            >
              <span id="click-status-tag">
                {downloadLogged ? "✓ Intent logged & redirect served" : "Measurement engine active"}
              </span>
            </div>
          </div>
        </div>

        {/* ===== Tabs Section ===== */}
        <section className="space-y-4">
          <div className="flex items-center border-b border-[#E8E2D8] space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const hasContent =
                (t.id === "code" && resource.codeSnippet) ||
                (t.id === "prompts" && (resource.samplePrompts || []).length > 0) ||
                t.id === "overview" ||
                t.id === "diagram";
              if (!hasContent) return null;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                    tab === t.id
                      ? "border-stone-900 text-stone-900 bg-white"
                      : "border-transparent text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <span className="mr-1.5">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {tab === "overview" ? (
            <div className="creamy-card rounded-2xl p-6 bg-white border border-[#E8E2D8] space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                  Key Topics &amp; Blueprint Highlights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-600">
                  {(resource.highlights || resource.tags.map((t) => `Covers: ${t}`)).map((h) => (
                    <div key={h} className="flex items-start space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {resource.tableOfContents ? (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                    Structured Table of Contents
                  </h3>
                  <div className="space-y-2 text-xs text-stone-700 font-mono">
                    {resource.tableOfContents.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EFE9DF] flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <span className="text-[10px] text-stone-400">Chapter {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === "code" && resource.codeSnippet ? (
            <div className="creamy-card rounded-2xl p-6 bg-white border border-[#E8E2D8] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-mono">
                    {resource.codeSnippet.title}
                  </h3>
                  <p className="text-xs text-stone-500">Runnable implementation snippet from master files.</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(resource.codeSnippet!.code, "Code copied to clipboard!")}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Copy Code
                </button>
              </div>
              <div className="code-container rounded-xl p-4 overflow-x-auto text-xs leading-relaxed">
                <pre>
                  <code>{resource.codeSnippet.code}</code>
                </pre>
              </div>
            </div>
          ) : null}

          {tab === "prompts" && (resource.samplePrompts || []).length > 0 ? (
            <div className="creamy-card rounded-2xl p-6 bg-white border border-[#E8E2D8] space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  ⚡ Included Prompt Templates
                </h3>
                <span className="text-[11px] text-stone-400">Click Copy to use directly</span>
              </div>
              <div className="space-y-3">
                {(resource.samplePrompts || []).map((p, idx) => (
                  <div key={idx} className="prompt-box rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900">
                        {p.title || `Prompt ${idx + 1}`}
                      </h4>
                      <button
                        type="button"
                        onClick={() => copyText(p.prompt, "Prompt copied to clipboard!")}
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-stone-700 font-mono whitespace-pre-wrap leading-relaxed select-all">
                      {p.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "diagram" ? (
            <div className="creamy-card rounded-2xl p-6 bg-white border border-[#E8E2D8] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Instagram ➜ Website ➜ Storage Flow</h3>
                <p className="text-xs text-stone-500">
                  How audience intent is mapped to verified file delivery without dead links.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs font-mono text-stone-700 leading-relaxed overflow-x-auto">
                <pre>{`
  Instagram Reel ("Comment '${resource.keyword}'")
        │
        ▼
  Manychat Automation ──► Tracked URL with UTM parameters
        │
        ▼
  /r/${resource.slug}  ── PAGE_VISIT logged
        │
        ▼
  DOWNLOAD CLICK      ──► /api/download/${resource.slug} ── Intent recorded
        │
        ▼
  Storage Response    ──► Google Drive Master Copy / Cloudflare R2
`}</pre>
              </div>
            </div>
          ) : null}
        </section>

        {/* ===== Revision Notification Lead Form ===== */}
        <section className="creamy-card rounded-3xl p-6 md:p-8 bg-white border border-[#E8E2D8] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-bold text-stone-900">Get revision updates for this guide</h3>
            <p className="text-xs text-stone-500">
              When this resource is updated with new architectures or code, get the updated link first.
            </p>
          </div>
          <form onSubmit={handleEmail} className="flex w-full md:w-auto max-w-sm gap-2">
            <input
              name="email"
              type="email"
              required
              placeholder="developer@company.com"
              className="flex-grow px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 focus:bg-white"
            />
            <button
              type="submit"
              className="btn-primary text-xs px-4 py-2 whitespace-nowrap"
            >
              Notify Me
            </button>
          </form>
        </section>

        {/* ===== Creator Attribution ===== */}
        <div className="border-t border-[#E8E2D8] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PROFILE.avatar}
              alt="Creator"
              className="w-10 h-10 rounded-full object-cover border border-[#E8E2D8]"
            />
            <div>
              <p className="text-xs font-semibold text-stone-900">{PROFILE.name}</p>
              <p className="text-[11px] text-stone-500">
                Instagram: <span className="font-mono text-amber-900">@{PROFILE.handle}</span>
              </p>
            </div>
          </div>

          <a
            href={PROFILE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            Follow on Instagram ↗
          </a>
        </div>
      </article>
    </div>
  );
}
