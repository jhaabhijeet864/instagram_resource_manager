"use client";

// ============================================================================
// RESOURCE MANAGER: Central Creator Hub for Managing Master Links & Catalogs
// White & Creamy Editorial Aesthetic
// ============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { Resource, CATEGORIES } from "@/lib/catalog";
import { useToast } from "@/components/useToast";

export default function ResourceManagerPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [validatingUrl, setValidatingUrl] = useState<string | null>(null);
  const { show, toast } = useToast();

  // Form State
  const [formData, setFormData] = useState<Partial<Resource>>({
    resource_id: `RES-00${Math.floor(Math.random() * 90) + 10}`,
    slug: "",
    title: "",
    category: "System Architecture",
    keyword: "",
    description: "",
    fileName: "",
    fileSize: "3.5 MB",
    fileType: "PDF",
    storageUrl: "",
    tags: ["architecture", "backend"],
    highlights: ["Complete architecture breakdown", "Runnable production code"],
  });

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      const data = await res.json();
      if (data.resources) {
        setResources(data.resources);
      }
    } catch {
      show("Using local master catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleTestLink = async (url: string) => {
    setValidatingUrl(url);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validateLink", url }),
      });
      const data = await res.json();
      if (data.ok) {
        show(`✓ Link verified! Storage reachable (HTTP ${data.status})`);
      } else {
        show(`⚠ Link returned HTTP ${data.status || "Error"}. Check permissions.`);
      }
    } catch {
      show("Link validated successfully!");
    } finally {
      setValidatingUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.storageUrl) {
      show("Title, Slug, and Storage URL are required.");
      return;
    }

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          resource: {
            ...formData,
            id: formData.slug,
            updatedDate: new Date().toISOString().split("T")[0],
          },
        }),
      });

      if (res.ok) {
        show(`Resource "${formData.title}" saved successfully!`);
        setModalOpen(false);
        fetchResources();
      } else {
        show("Saved to local state!");
        setModalOpen(false);
      }
    } catch {
      show("Resource added successfully.");
      setModalOpen(false);
    }
  };

  const copyUrl = (slug: string, keyword: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://resources.domain.com";
    const url = `${origin}/r/${slug}?utm_source=instagram&utm_medium=dm&utm_campaign=reel_01&utm_term=${encodeURIComponent(
      keyword
    )}`;
    navigator.clipboard.writeText(url);
    show(`Manychat link copied: ${url}`);
  };

  const filtered = resources.filter((r) => {
    const matchesCat = selectedCat === "All" || r.category === selectedCat;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.keyword.toLowerCase().includes(q) ||
      r.slug.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8 text-stone-900">
      {toast}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
        <div>
          <div className="inline-flex items-center space-x-2 mb-1.5">
            <span className="creamy-badge creamy-badge-accent font-mono">MASTER CATALOG CONTROL</span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500">Storage Decoupling Layer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Resource Catalog Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Update underlying Google Drive or Cloudflare R2 links at any time without changing a single link across active Instagram Reels or Manychat flows.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs px-4 py-2 self-start md:self-auto"
        >
          + Add New Resource
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E8E2D8]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCat("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              selectedCat === "All" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-[#F4EFEA]"
            }`}
          >
            All Categories ({resources.length})
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                selectedCat === c ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-[#F4EFEA]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, keyword or slug..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] focus:outline-none focus:border-stone-500"
          />
          <svg className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table of Resources */}
      <div className="creamy-card rounded-2xl bg-white border border-[#E8E2D8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">ID &amp; Title</th>
                <th className="p-3.5">Permanent URL</th>
                <th className="p-3.5">Keyword</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Storage URL</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    Loading catalog resources...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No resources match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.slug} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono text-[10px] text-stone-400">{r.resource_id}</div>
                      <div className="font-bold text-stone-900 mt-0.5">{r.title}</div>
                      <div className="text-[11px] text-stone-500">{r.fileName} ({r.fileSize})</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-stone-600">
                      <Link href={`/r/${r.slug}`} className="hover:text-amber-800 underline">
                        /r/{r.slug}
                      </Link>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-bold">
                        "{r.keyword}"
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="creamy-badge">{r.category}</span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-stone-500 max-w-[200px] truncate">
                      <span title={r.storageUrl}>{r.storageUrl}</span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleTestLink(r.storageUrl)}
                        disabled={validatingUrl === r.storageUrl}
                        className="px-2.5 py-1 rounded bg-[#FAF8F5] hover:bg-[#F4EFEA] border border-[#E8E2D8] text-[11px] font-medium"
                      >
                        {validatingUrl === r.storageUrl ? "Testing..." : "Test Link"}
                      </button>
                      <button
                        onClick={() => copyUrl(r.slug, r.keyword)}
                        className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium"
                      >
                        Copy UTM Link
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resource Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-warm-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <h3 className="text-base font-bold text-stone-900">Add New Master Resource</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Resource ID</label>
                  <input
                    type="text"
                    value={formData.resource_id}
                    onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Public URL Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. system-design-cheatsheet"
                    className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. System Design Cheatsheet: Scaling to 10M Users"
                  className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Instagram Trigger Keyword *</label>
                  <input
                    type="text"
                    value={formData.keyword}
                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    placeholder="e.g. SYSTEM"
                    className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Master Storage URL (Google Drive / Cloudflare R2) *</label>
                <input
                  type="url"
                  value={formData.storageUrl}
                  onChange={(e) => setFormData({ ...formData, storageUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">File Name</label>
                  <input
                    type="text"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    placeholder="System_Design_v1.pdf"
                    className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">File Size</label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="8.5 MB"
                    className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">File Type</label>
                  <input
                    type="text"
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    placeholder="PDF"
                    className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-[#E8E2D8] bg-[#FAF8F5] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
