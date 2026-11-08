"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Resource, CATEGORIES } from "@/lib/catalog";
import { useToast } from "@/components/useToast";

interface ResourceExplorerProps {
  initialResources: Resource[];
}

export function ResourceExplorer({ initialResources }: ResourceExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const { show, toast } = useToast();

  const filteredResources = useMemo(() => {
    return initialResources.filter((res) => {
      const matchesCategory =
        selectedCategory === "All" || res.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.keyword.toLowerCase().includes(q) ||
        res.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [initialResources, selectedCategory, searchQuery]);

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    show(`Trigger keyword "${keyword}" copied! Use it in Instagram Reel comments.`);
  };

  return (
    <section className="space-y-6">
      {toast}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "All"
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-[#F4EFEA] hover:text-stone-900"
            }`}
          >
            All Resources ({initialResources.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-[#F4EFEA] hover:text-stone-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keyword, topic, or tag..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-stone-900 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          />
          <svg
            className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Grid of Resources */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12 p-8 rounded-2xl bg-white border border-[#E8E2D8]">
          <p className="text-sm font-semibold text-stone-800">No resources matched your filter</p>
          <p className="text-xs text-stone-500 mt-1">Try searching for keywords like "SEARCH", "DESIGN", "PYTHON", or "ALGO".</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-4 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.slug}
              className="creamy-card rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Meta header */}
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-mono">{res.resource_id}</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="creamy-badge">{res.category}</span>
                    {res.badge ? (
                      <span className="creamy-badge creamy-badge-accent">{res.badge}</span>
                    ) : null}
                  </div>
                </div>

                {/* Title */}
                <Link href={`/r/${res.slug}`}>
                  <h3 className="text-base font-bold text-stone-900 hover:text-amber-800 transition-colors leading-snug">
                    {res.title}
                  </h3>
                </Link>

                {/* Description */}
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                {/* Keyword trigger indicator */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-[#EFE9DF] text-[11px]">
                  <span className="text-stone-500">Instagram Trigger:</span>
                  <button
                    onClick={() => copyKeyword(res.keyword)}
                    title="Click to copy trigger keyword"
                    className="font-mono font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200/60 transition-colors"
                  >
                    "{res.keyword}" 📋
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {res.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom specs & CTA */}
              <div className="pt-3 border-t border-[#EFE9DF] flex items-center justify-between text-xs">
                <div className="text-[11px] text-stone-400">
                  <span>{res.fileType.toUpperCase()}</span> • <span>{res.fileSize}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewResource(res)}
                    className="px-2.5 py-1 text-xs rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Quick Preview
                  </button>
                  <Link
                    href={`/r/${res.slug}`}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                  >
                    Get Resource →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewResource ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-warm-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E2D8]">
              <div>
                <span className="creamy-badge creamy-badge-accent mb-1.5">
                  {previewResource.category}
                </span>
                <h3 className="text-lg font-bold text-stone-900">{previewResource.title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verified Master Copy on Google Drive ({previewResource.fileSize})
                </p>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              {previewResource.description}
            </p>

            {/* Table of Contents */}
            {previewResource.tableOfContents ? (
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  📖 Table of Contents
                </p>
                <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1">
                  {previewResource.tableOfContents.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            {/* Code Snippet preview */}
            {previewResource.codeSnippet ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold">Snippet: {previewResource.codeSnippet.title}</span>
                  <span className="font-mono text-[10px] uppercase">{previewResource.codeSnippet.language}</span>
                </div>
                <pre className="code-container p-3 text-xs overflow-x-auto rounded-lg">
                  <code>{previewResource.codeSnippet.code}</code>
                </pre>
              </div>
            ) : null}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Instagram Keyword: <strong className="font-mono text-stone-800">"{previewResource.keyword}"</strong>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewResource(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Close
                </button>
                <Link
                  href={`/r/${previewResource.slug}`}
                  className="btn-primary text-xs"
                >
                  Go to Resource Page →
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
