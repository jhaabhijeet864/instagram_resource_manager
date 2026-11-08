import Link from "next/link";
import { PROFILE, RESOURCES, getResourceBySlug } from "@/lib/catalog";
import { ResourceExplorer } from "@/components/home/ResourceExplorer";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export default function HomePage() {
  const featured = getResourceBySlug("distributed-search-pipeline") ?? RESOURCES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-12 sm:space-y-14">
      {/* ================= HERO / TOP COMPONENT ================= */}
      <section className="text-center relative pt-2 pb-2 space-y-4 max-w-4xl mx-auto">
        {/* Optical status badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F4EFEA] text-stone-700 border border-[#E2D9CC] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <span className="w-2 h-2 rounded-full bg-amber-600 mr-2" />
          Permanent Delivery Layer for Instagram Reels &amp; Manychat DMs
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
          Production System Architecture, Distributed Backends &amp; Creator Engineering
        </h1>

        <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          {PROFILE.bio}
        </p>

        {/* Creator social trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500 pt-2">
          <div className="flex items-center space-x-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PROFILE.avatar}
              alt="Creator Profile"
              className="w-7 h-7 rounded-full object-cover border border-[#E2D9CC] shadow-xs"
            />
            <span className="font-semibold text-stone-900">{PROFILE.name}</span>
            <span className="text-amber-800 font-mono">@{PROFILE.handle}</span>
          </div>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <a
            href={PROFILE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-stone-700 hover:text-stone-900 font-semibold transition-colors"
          >
            Instagram Profile ↗
          </a>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <Link
            href="/providers"
            className="text-amber-800 hover:text-amber-900 font-semibold flex items-center"
          >
            <span>📁 Connect Drive / Notion ↗</span>
          </Link>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="text-emerald-700 font-semibold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
            Verified Master Copies on Google Drive
          </span>
        </div>
      </section>

      {/* ================= FEATURED SPOTLIGHT CARD ================= */}
      <section className="creamy-card rounded-3xl p-6 md:p-8 bg-white border border-[#E8E2D8] shadow-warm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center space-x-2.5 flex-wrap">
              <span className="creamy-badge creamy-badge-accent uppercase tracking-wider">
                Flagship Blueprint
              </span>
              <span className="creamy-badge">{featured.category}</span>
              <span className="text-xs font-mono text-stone-400">{featured.resource_id}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
              {featured.title}
            </h2>

            <p className="text-sm text-stone-600 leading-relaxed">
              {featured.description}
            </p>

            {featured.highlights ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-stone-600">
                {featured.highlights.map((h) => (
                  <div key={h} className="flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Action card */}
          <div className="w-full lg:w-80 flex-shrink-0 p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white border border-[#E2D9CC] flex items-center justify-center text-stone-800 mx-auto shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500">Instagram DM Trigger Keyword</p>
              <p className="text-xl font-mono font-bold text-amber-900 tracking-wide">
                "{featured.keyword}"
              </p>
            </div>

            <div className="text-[11px] text-stone-500 space-y-1">
              <div>Format: <strong>{featured.fileType.toUpperCase()}</strong> ({featured.fileSize})</div>
              <div>Storage: <strong>Google Drive Master Copy</strong></div>
            </div>

            <Link
              href={`/r/${featured.slug}`}
              className="btn-primary w-full text-xs py-2.5"
            >
              Inspect Blueprint &amp; Download →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 3-JOB ARCHITECTURE STRIP ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] space-y-2 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-[#F4EFEA] border border-[#E2D9CC] flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Permanent Public Link</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Permanent URLs (<code className="text-stone-800 bg-stone-100 px-1 py-0.5 rounded">/r/slug</code>) insulate your marketing from Google Drive file moves or permission changes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] space-y-2 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-[#F4EFEA] border border-[#E2D9CC] flex items-center justify-center text-[10px]">
              2
            </span>
            <span>True Intent vs Delivery</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Measures the exact funnel: DM send → link click → pageview → download intent → verified storage response.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2D8] space-y-2 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-[#F4EFEA] border border-[#E2D9CC] flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Pluggable Extensibility</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Plug in Meta Graph API, Manychat automation, Cloudflare R2, or custom Webhooks through our extensible plugin engine.
          </p>
        </div>
      </section>

      {/* ================= RESOURCE CATALOG EXPLORER ================= */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Master Resource Catalog
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Browse production architectures, backend code templates, and automation vaults.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {RESOURCES.length} resources available
          </span>
        </div>

        <ResourceExplorer initialResources={RESOURCES} />
      </section>

      {/* ================= NEWSLETTER ================= */}
      <NewsletterForm />
    </div>
  );
}
