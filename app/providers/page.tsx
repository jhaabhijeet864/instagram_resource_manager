"use client";

// ==============================================================================
// RESOURCE PROVIDERS & STORAGE HUB
// Connect Google Drive, Notion, Dropbox, or custom cloud storage.
// Converts raw file/folder links into permanent, tracked creator resources.
// Editorial Creamy Paper & Tactile Finishes
// ==============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/useToast";
import { CATEGORIES, Resource } from "@/lib/catalog";
import { ResolvedResourceLink } from "@/lib/providers/resolver";

interface ProviderInfo {
  id: string;
  name: string;
  connected: boolean;
  accountEmail?: string;
  defaultFolderUrl?: string;
  workspaceName?: string;
  lastVerified?: string;
  notes?: string;
}

export default function ProvidersPage() {
  const { show, toast } = useToast();

  // Providers state
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Link Importer state
  const [inputUrl, setInputUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [resolved, setResolved] = useState<ResolvedResourceLink | null>(null);
  const [verification, setVerification] = useState<any>(null);

  // Form Fields for Publishing
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("System Architecture");
  const [fileType, setFileType] = useState("PDF Document");
  const [fileSize, setFileSize] = useState("3.8 MB");
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishedResource, setPublishedResource] = useState<Resource | null>(null);

  // Provider configuration modal
  const [configModalProvider, setConfigModalProvider] = useState<ProviderInfo | null>(null);
  const [configValue, setConfigValue] = useState("");

  // Fetch connected providers on mount
  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/providers");
      const data = await res.json();
      if (data.providers) {
        setProviders(data.providers);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Quick Link Samples for 1-click test
  const handleLoadSample = (sampleType: "drive_file" | "drive_folder" | "notion") => {
    let url = "";
    if (sampleType === "drive_file") {
      url = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up0I/view?usp=sharing";
    } else if (sampleType === "drive_folder") {
      url = "https://drive.google.com/drive/folders/17pY3uU-QjW-O_K8rW2V6yWp9N9DevVault?usp=sharing";
    } else if (sampleType === "notion") {
      url = "https://notion.so/devresource/Distributed-Systems-Architecture-Guide-18efbc784a9280bf8e39d5b066f8e77a";
    }
    setInputUrl(url);
    handleAnalyze(url);
  };

  // Analyze Link
  const handleAnalyze = async (urlToTest?: string) => {
    const url = (urlToTest || inputUrl).trim();
    if (!url) {
      show("Please enter a Google Drive or Notion link first.");
      return;
    }

    setAnalyzing(true);
    setResolved(null);
    setVerification(null);
    setPublishedResource(null);

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", url }),
      });

      const data = await res.json();
      if (data.ok && data.resolved) {
        setResolved(data.resolved);
        setVerification(data.verification);

        // Prepopulate form
        setTitle(data.resolved.suggestedTitle);
        setSlug(data.resolved.suggestedSlug);
        setKeyword(data.resolved.suggestedKeyword);
        setCategory(data.resolved.suggestedCategory);
        setFileType(data.resolved.suggestedFileType);
        setDescription(
          `Production-ready ${data.resolved.suggestedTitle} verified on ${data.resolved.providerName}. Direct download for engineering creators.`
        );

        show(`Parsed ${data.resolved.providerName} link!`);
      } else {
        show(data.error || "Could not parse link.");
      }
    } catch {
      show("Analysis request failed. Check network.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Publish to Resource Vault
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolved) return;

    if (!title || !slug || !keyword) {
      show("Title, Slug, and Keyword are required.");
      return;
    }

    setPublishing(true);
    try {
      const storageUrl = resolved.directDownloadUrl || resolved.originalUrl;
      const newResource: Partial<Resource> = {
        id: slug,
        slug,
        resource_id: `RES-${Math.floor(100 + Math.random() * 900)}`,
        title,
        keyword: keyword.toUpperCase().trim(),
        category,
        fileName: `${title.replace(/[\s/]+/g, "-")}.${fileType.includes("Notion") ? "notion" : "pdf"}`,
        fileSize,
        fileType,
        storageUrl,
        description,
        tags: [category.toLowerCase().replace(/\s+/g, "-"), resolved.provider, "production"],
        highlights: [
          `Verified storage master on ${resolved.providerName}`,
          "Direct decoupled link for Instagram Reel campaigns",
          "Automated Manychat comment-to-DM trigger",
        ],
        updatedDate: new Date().toISOString().split("T")[0],
      };

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", resource: newResource }),
      });

      if (res.ok) {
        setPublishedResource(newResource as Resource);
        show(`🎉 Resource "${title}" is live in your vault!`);
      } else {
        show("Failed to publish resource. Check slug uniqueness.");
      }
    } catch {
      show("Network error publishing resource.");
    } finally {
      setPublishing(false);
    }
  };

  // Copy helper
  const copyText = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    show(msg);
  };

  // Save Provider Config
  const handleSaveProviderConfig = async () => {
    if (!configModalProvider) return;
    try {
      const body: any = {
        action: "updateConfig",
        providerId: configModalProvider.id,
      };
      if (configModalProvider.id === "google_drive") {
        body.defaultFolderUrl = configValue;
      } else if (configModalProvider.id === "notion") {
        body.workspaceName = configValue;
      }

      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        show(`Updated ${configModalProvider.name} configuration!`);
        setConfigModalProvider(null);
        fetchProviders();
      } else {
        show("Failed to update provider configuration.");
      }
    } catch {
      show("Error saving configuration.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12 text-stone-900">
      {toast}

      {/* ================= HEADER SECTION ================= */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E8E2D8]">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2">
            <span className="creamy-badge creamy-badge-accent font-mono text-[10px] tracking-wider uppercase">
              STORAGE DECOUPLING ENGINE
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">Google Drive &amp; Notion Bridge</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Connect Resource Providers
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Upload your files or folders to <strong>Google Drive</strong>, write templates in <strong>Notion</strong>, and paste the link below. Our engine validates public permissions, creates a high-speed direct download link, and generates a permanent tracked URL for your Instagram Reels.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            href="/resources/manage"
            className="btn-secondary text-xs px-3.5 py-2 flex items-center space-x-1.5"
          >
            <span>View All Vault Resources</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ================= 3-STEP VISUAL WORKFLOW ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs font-mono">
              1
            </span>
            <h3 className="font-bold text-sm text-stone-900">Upload to Drive or Notion</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Drop your PDFs, ZIPs, or cheatsheets onto Google Drive, or create a public page in your Notion workspace.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs font-mono">
              2
            </span>
            <h3 className="font-bold text-sm text-stone-900">Set Public Access</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Click <em>Share → General access</em> and select <strong>"Anyone with the link can view"</strong> so followers can download without logging in.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs font-mono">
              3
            </span>
            <h3 className="font-bold text-sm text-stone-900">Paste &amp; Instant Launch</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Paste the link below. We optimize the link, generate your <code className="text-amber-800">/r/[slug]</code> URL, and create your Manychat DM keyword!
          </p>
        </div>
      </section>

      {/* ================= MAIN TOOL: THE LINK-TO-VAULT CONVERTER ================= */}
      <section className="creamy-card rounded-3xl p-6 sm:p-8 bg-white border border-[#E8E2D8] shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE9DF]">
          <div>
            <div className="inline-flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                Instant Cloud Link-to-Vault Converter
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Supports Google Drive Files, Shared Folders, Google Docs, Notion Pages, and Dropbox.
            </p>
          </div>

          {/* Quick test sample pills */}
          <div className="flex items-center flex-wrap gap-2 text-[11px]">
            <span className="text-stone-400">Quick Try:</span>
            <button
              type="button"
              onClick={() => handleLoadSample("drive_file")}
              className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2D8] hover:bg-stone-100 font-medium text-stone-700"
            >
              📄 Drive File
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample("drive_folder")}
              className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2D8] hover:bg-stone-100 font-medium text-stone-700"
            >
              📁 Drive Folder
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample("notion")}
              className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2D8] hover:bg-stone-100 font-medium text-stone-700"
            >
              📝 Notion Page
            </button>
          </div>
        </div>

        {/* The Paste Input Box */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            Paste File, Folder, or Notion Link
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or https://notion.so/..."
                className="w-full px-4 py-3 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-stone-900 text-xs sm:text-sm font-mono focus:outline-none focus:border-stone-800 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAnalyze();
                  }
                }}
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl("")}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={analyzing || !inputUrl}
              className="btn-primary px-6 py-3 text-xs sm:text-sm whitespace-nowrap disabled:opacity-50"
            >
              {analyzing ? (
                <span className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Inspecting Link...</span>
                </span>
              ) : (
                "Inspect & Convert Link"
              )}
            </button>
          </div>
        </div>

        {/* Resolved Details Banner */}
        {resolved && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2D9CC] space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D7]">
              <div className="flex items-center space-x-3">
                {/* Provider Badge Icon */}
                <div className="w-9 h-9 rounded-xl bg-white border border-[#DDD5C7] flex items-center justify-center font-bold text-sm shadow-sm">
                  {resolved.provider === "google_drive" && "📁"}
                  {resolved.provider === "notion" && "📝"}
                  {resolved.provider === "dropbox" && "📦"}
                  {resolved.provider === "github" && "🐙"}
                  {resolved.provider === "generic" && "☁️"}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-stone-900">
                      {resolved.providerName}
                    </span>
                    <span className="creamy-badge creamy-badge-accent uppercase text-[9px]">
                      {resolved.resourceKind}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    ID: {resolved.resourceId || "N/A"}
                  </div>
                </div>
              </div>

              {/* Live Permission Health Indicator */}
              {verification && (
                <div
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                    verification.isPrivateWarning
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : verification.verified
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                      : "bg-stone-100 text-stone-700 border-stone-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      verification.isPrivateWarning
                        ? "bg-amber-600"
                        : verification.verified
                        ? "bg-emerald-600"
                        : "bg-stone-500"
                    }`}
                  />
                  <span>
                    {verification.isPrivateWarning
                      ? "Sign-In Required (Check Sharing)"
                      : "Public Access Confirmed"}
                  </span>
                </div>
              )}
            </div>

            {/* Sharing Advice / Warnings */}
            {verification?.isPrivateWarning ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">⚠️ Action Required: Make Link Public</p>
                <p className="leading-relaxed">
                  Google Drive indicates this file is currently restricted. In Google Drive, click{" "}
                  <strong>Share → General access</strong> and change it to{" "}
                  <strong>"Anyone with the link"</strong> so audience members on Instagram can download it without a sign-in wall.
                </p>
              </div>
            ) : (
              <div className="text-xs text-stone-600 flex items-start space-x-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <p>{resolved.sharingInstructions}</p>
              </div>
            )}

            {/* Direct Link Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-white border border-[#E8E2D8]">
                <span className="text-stone-400 text-[10px] uppercase font-mono block">
                  Original Source Link
                </span>
                <div className="font-mono text-stone-700 truncate mt-1 text-[11px]" title={resolved.originalUrl}>
                  {resolved.originalUrl}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E8E2D8]">
                <div className="flex items-center justify-between">
                  <span className="text-amber-800 font-bold text-[10px] uppercase font-mono block">
                    Optimized Direct Access Link
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(resolved.directDownloadUrl, "Direct link copied!")}
                    className="text-stone-500 hover:text-stone-900 text-[10px] font-semibold"
                  >
                    Copy
                  </button>
                </div>
                <div className="font-mono text-stone-900 truncate mt-1 text-[11px]" title={resolved.directDownloadUrl}>
                  {resolved.directDownloadUrl}
                </div>
              </div>
            </div>

            {/* ================= PUBLISH RESOURCE FORM ================= */}
            <form onSubmit={handlePublish} className="pt-4 border-t border-[#EAE3D7] space-y-4">
              <h3 className="font-bold text-sm text-stone-900">
                Configure Vault Metadata &amp; Instagram Triggers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Distributed System Architecture Blueprint"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCD5C9] bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCD5C9] bg-white focus:outline-none focus:border-stone-800"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Public Slug */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                    Permanent URL Slug
                  </label>
                  <div className="flex items-center rounded-lg border border-[#DCD5C9] bg-white px-2.5 py-1.5 focus-within:border-stone-800">
                    <span className="text-stone-400 text-xs font-mono">/r/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      className="w-full pl-1 text-xs font-mono text-stone-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Instagram Trigger Keyword */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                    Instagram Comment Trigger Keyword
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. ARCHITECTURE"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-amber-900 rounded-lg border border-[#DCD5C9] bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>

                {/* File Type & Size */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                    File Type &amp; Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      placeholder="e.g. PDF"
                      className="px-2.5 py-2 text-xs rounded-lg border border-[#DCD5C9] bg-white"
                    />
                    <input
                      type="text"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      placeholder="e.g. 4.2 MB"
                      className="px-2.5 py-2 text-xs rounded-lg border border-[#DCD5C9] bg-white"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCD5C9] bg-white focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                <a
                  href={resolved.directDownloadUrl || resolved.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-600 hover:text-stone-900 underline font-medium"
                >
                  ↗ Test Direct Access in Browser
                </a>

                <button
                  type="submit"
                  disabled={publishing}
                  className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-bold"
                >
                  {publishing ? "Publishing to Vault..." : "🚀 Publish Resource to Vault"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Post-Publish Success Card */}
        {publishedResource && (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 text-stone-900 space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Resource Published &amp; Tracked Successfully!</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-mono text-stone-400 uppercase">
                  Permanent Audience Landing URL
                </span>
                <div className="flex items-center justify-between font-mono text-stone-900">
                  <Link
                    href={`/r/${publishedResource.slug}`}
                    target="_blank"
                    className="text-amber-800 underline font-bold"
                  >
                    /r/{publishedResource.slug} ↗
                  </Link>
                  <button
                    onClick={() =>
                      copyText(
                        `${window.location.origin}/r/${publishedResource.slug}`,
                        "Landing page URL copied!"
                      )
                    }
                    className="px-2 py-0.5 rounded bg-stone-100 text-[10px] font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-mono text-stone-400 uppercase">
                  Instagram Reel / Manychat DM Automation
                </span>
                <div className="flex items-center justify-between font-mono text-stone-900">
                  <span>Trigger Keyword: <strong>"{publishedResource.keyword}"</strong></span>
                  <button
                    onClick={() =>
                      copyText(
                        `Comment "${publishedResource.keyword}" below and I'll send you the direct master file!`,
                        "Reel caption template copied!"
                      )
                    }
                    className="px-2 py-0.5 rounded bg-stone-100 text-[10px] font-medium"
                  >
                    Copy Caption
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <Link
                href={`/r/${publishedResource.slug}`}
                className="btn-primary text-xs px-4 py-2"
              >
                Open Resource Page
              </Link>
              <Link
                href="/resources/manage"
                className="text-stone-600 hover:text-stone-900 underline text-xs font-medium"
              >
                Manage in Catalog →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ================= CONNECTED PROVIDERS HUB ================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Connected Storage Services
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Manage authentication, default master folders, and root vault destinations.
          </p>
        </div>

        {loadingProviders ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            Loading connected storage providers...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="creamy-card rounded-2xl p-5 bg-white border border-[#E8E2D8] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E2D9CC] flex items-center justify-center text-sm font-bold">
                      {provider.id === "google_drive" && "📁"}
                      {provider.id === "notion" && "📝"}
                      {provider.id === "dropbox" && "📦"}
                      {provider.id === "github" && "🐙"}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{provider.name}</h3>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {provider.accountEmail || provider.workspaceName || "Default Cloud Provider"}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      provider.connected
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-stone-50 text-stone-500 border-stone-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        provider.connected ? "bg-emerald-600" : "bg-stone-400"
                      }`}
                    />
                    {provider.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{provider.notes}</p>

                {provider.defaultFolderUrl && (
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8] text-[11px] font-mono text-stone-600 truncate">
                    <span className="text-stone-400 block text-[9px] uppercase font-sans">
                      Default Storage Vault
                    </span>
                    <a
                      href={provider.defaultFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-800 underline truncate block"
                    >
                      {provider.defaultFolderUrl}
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE0] text-xs">
                  {provider.id === "google_drive" ? (
                    <a
                      href="https://drive.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 font-medium inline-flex items-center space-x-1"
                    >
                      <span>Open Drive in New Tab</span>
                      <span>↗</span>
                    </a>
                  ) : provider.id === "notion" ? (
                    <a
                      href="https://notion.so"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-stone-900 font-medium inline-flex items-center space-x-1"
                    >
                      <span>Open Notion</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    <span className="text-stone-400">Cloud Storage Ready</span>
                  )}

                  <button
                    onClick={() => {
                      setConfigModalProvider(provider);
                      setConfigValue(
                        provider.defaultFolderUrl || provider.workspaceName || ""
                      );
                    }}
                    className="px-3 py-1 rounded-lg border border-[#E8E2D8] hover:bg-[#FAF8F5] text-stone-800 text-[11px] font-medium"
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= CONFIGURATION MODAL ================= */}
      {configModalProvider && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="creamy-card w-full max-w-lg rounded-3xl p-6 bg-white border border-[#E8E2D8] shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <h3 className="font-bold text-base text-stone-900">
                Configure {configModalProvider.name}
              </h3>
              <button
                onClick={() => setConfigModalProvider(null)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                {configModalProvider.id === "google_drive"
                  ? "Default Master Google Drive Folder URL"
                  : configModalProvider.id === "notion"
                  ? "Notion Workspace / Default Page URL"
                  : "Target Provider URL"}
              </label>
              <input
                type="text"
                value={configValue}
                onChange={(e) => setConfigValue(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] font-mono focus:outline-none focus:border-stone-800"
              />
              <p className="text-[11px] text-stone-500">
                New resources published without explicit paths will reference this default storage destination.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E2D8]">
              <button
                type="button"
                onClick={() => setConfigModalProvider(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProviderConfig}
                className="btn-primary text-xs px-5 py-2"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
