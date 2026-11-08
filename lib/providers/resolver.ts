// ==============================================================================
// PROVIDER LINK RESOLVER & NORMALIZATION ENGINE
// Intelligently parses Google Drive, Notion, Dropbox, OneDrive, and Cloud URLs.
// Extracts file IDs, auto-converts view links to high-speed direct download links,
// infers titles/slugs/filetypes, and checks link permissions.
// ==============================================================================

export type ProviderType =
  | "google_drive"
  | "notion"
  | "dropbox"
  | "onedrive"
  | "github"
  | "generic";

export type ResourceKind =
  | "file"
  | "folder"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "notion_page"
  | "notion_database";

export interface ResolvedResourceLink {
  provider: ProviderType;
  providerName: string;
  originalUrl: string;
  directDownloadUrl: string;
  previewUrl: string;
  resourceId?: string;
  resourceKind: ResourceKind;
  suggestedTitle: string;
  suggestedSlug: string;
  suggestedKeyword: string;
  suggestedFileType: string;
  suggestedCategory: string;
  isFolder: boolean;
  sharingInstructions?: string;
}

/**
 * Clean and humanize a raw slug/filename into a readable title.
 */
function humanizeString(str: string): string {
  return str
    .replace(/[-_.]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

/**
 * Generate a clean URL slug from a title.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate an Instagram DM trigger keyword (single uppercase word).
 */
function deriveKeyword(title: string, category: string): string {
  const words = title.toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const stopWords = new Set(["THE", "A", "AN", "FOR", "AND", "WITH", "OF", "TO", "IN", "ON", "AT", "BY", "FROM", "PAGE", "DOC", "FILE", "VAULT", "GUIDE", "SHEET"]);
  const candidates = words.filter((w) => !stopWords.has(w) && w.length >= 3);
  if (candidates.length > 0) return candidates[0];

  const catWords = category.toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  return catWords[0] || "RESOURCE";
}

/**
 * Guess resource category based on title text keywords.
 */
function inferCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("system") || lower.includes("architect") || lower.includes("microservice") || lower.includes("distributed")) {
    return "System Architecture";
  }
  if (lower.includes("python") || lower.includes("fastapi") || lower.includes("django") || lower.includes("script") || lower.includes("scrap")) {
    return "Python Automation";
  }
  if (lower.includes("backend") || lower.includes("sql") || lower.includes("database") || lower.includes("postgres") || lower.includes("redis") || lower.includes("api")) {
    return "Backend Engineering";
  }
  if (lower.includes("cheat") || lower.includes("handbook") || lower.includes("summary") || lower.includes("reference")) {
    return "Engineering Cheatsheets";
  }
  return "System Architecture";
}

/**
 * Main link resolver: converts any raw cloud link into an optimized, tracked resource.
 */
export function resolveResourceLink(rawUrl: string): ResolvedResourceLink {
  const url = rawUrl.trim();

  // 1. Google Drive File Links
  // Patterns:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  const driveFileMatch =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/) ||
    url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);

  if (driveFileMatch) {
    const fileId = driveFileMatch[1];
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const previewUrl = `https://drive.google.com/file/d/${fileId}/view`;

    return {
      provider: "google_drive",
      providerName: "Google Drive",
      originalUrl: url,
      directDownloadUrl,
      previewUrl,
      resourceId: fileId,
      resourceKind: "file",
      isFolder: false,
      suggestedTitle: "Master Resource File",
      suggestedSlug: "drive-resource-" + fileId.slice(0, 6).toLowerCase(),
      suggestedKeyword: "DRIVE",
      suggestedFileType: "PDF / Master File",
      suggestedCategory: "System Architecture",
      sharingInstructions:
        "Ensure your Google Drive file permission is set to: 'Anyone with the link can view'.",
    };
  }

  // 2. Google Drive Folder Links
  // Patterns:
  // - https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
  // - https://drive.google.com/drive/u/0/folders/FOLDER_ID
  const driveFolderMatch = url.match(/drive\.google\.com\/(?:[a-zA-Z0-9_]+\/)?folders\/([a-zA-Z0-9_-]+)/);
  if (driveFolderMatch) {
    const folderId = driveFolderMatch[1];
    return {
      provider: "google_drive",
      providerName: "Google Drive Folder",
      originalUrl: url,
      directDownloadUrl: `https://drive.google.com/drive/folders/${folderId}`,
      previewUrl: `https://drive.google.com/drive/folders/${folderId}`,
      resourceId: folderId,
      resourceKind: "folder",
      isFolder: true,
      suggestedTitle: "Master Resource Folder",
      suggestedSlug: "drive-folder-" + folderId.slice(0, 6).toLowerCase(),
      suggestedKeyword: "FOLDER",
      suggestedFileType: "Drive Folder / Directory",
      suggestedCategory: "System Architecture",
      sharingInstructions:
        "Ensure folder sharing is set to: 'Anyone with the link can view' so audience members can access all files inside.",
    };
  }

  // 3. Google Docs (Exportable to PDF or DOCX)
  const docMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) {
    const docId = docMatch[1];
    return {
      provider: "google_drive",
      providerName: "Google Docs",
      originalUrl: url,
      directDownloadUrl: `https://docs.google.com/document/d/${docId}/export?format=pdf`,
      previewUrl: `https://docs.google.com/document/d/${docId}/preview`,
      resourceId: docId,
      resourceKind: "document",
      isFolder: false,
      suggestedTitle: "Engineering Document Specification",
      suggestedSlug: "doc-spec-" + docId.slice(0, 6).toLowerCase(),
      suggestedKeyword: "SPEC",
      suggestedFileType: "PDF Document (Auto-Exported)",
      suggestedCategory: "Backend Engineering",
      sharingInstructions:
        "Ensure the Google Doc is shared with: 'Anyone with the link can view' for instant one-click PDF downloading.",
    };
  }

  // 4. Google Sheets (Exportable to PDF or XLSX)
  const sheetMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch) {
    const sheetId = sheetMatch[1];
    return {
      provider: "google_drive",
      providerName: "Google Sheets",
      originalUrl: url,
      directDownloadUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=pdf`,
      previewUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`,
      resourceId: sheetId,
      resourceKind: "spreadsheet",
      isFolder: false,
      suggestedTitle: "Architecture Matrix & Calculator",
      suggestedSlug: "sheet-matrix-" + sheetId.slice(0, 6).toLowerCase(),
      suggestedKeyword: "MATRIX",
      suggestedFileType: "PDF / Spreadsheet",
      suggestedCategory: "System Architecture",
      sharingInstructions: "Set Google Sheet to 'Anyone with the link' to allow direct PDF export on download.",
    };
  }

  // 5. Notion Links
  // Patterns:
  // - https://www.notion.so/workspace/System-Design-Cheatsheet-18efbc784a9280bf8e39d5b066f8e77a
  // - https://workspace.notion.site/System-Design-Cheatsheet-18efbc784a9280bf8e39d5b066f8e77a
  // - https://notion.so/18efbc784a9280bf8e39d5b066f8e77a
  const isNotion = url.includes("notion.so") || url.includes("notion.site");
  if (isNotion) {
    let rawPath = "";
    try {
      rawPath = new URL(url).pathname;
    } catch {
      rawPath = url;
    }

    // Extract title portion if present in URL slug
    // e.g. /System-Architecture-Guide-18efbc784a9280bf8e39d5b066f8e77a
    const lastSegment = rawPath.split("/").filter(Boolean).pop() || "";
    const hexIdMatch = lastSegment.match(/([a-f0-9]{32})/i);
    const notionId = hexIdMatch ? hexIdMatch[1] : lastSegment;

    let parsedTitle = "Notion Resource Page";
    const titlePart = lastSegment.replace(notionId, "").replace(/[-_]+$/, "").replace(/^[-_]+/, "");
    if (titlePart.length > 2) {
      parsedTitle = humanizeString(titlePart);
    }

    const category = inferCategory(parsedTitle);
    const slug = slugify(parsedTitle) || "notion-resource-" + notionId.slice(0, 6);
    const keyword = deriveKeyword(parsedTitle, category);

    return {
      provider: "notion",
      providerName: "Notion",
      originalUrl: url,
      directDownloadUrl: url, // Notion is an interactive workspace/template URL
      previewUrl: url,
      resourceId: notionId,
      resourceKind: "notion_page",
      isFolder: false,
      suggestedTitle: parsedTitle,
      suggestedSlug: slug,
      suggestedKeyword: keyword,
      suggestedFileType: "Notion Workspace / Template",
      suggestedCategory: category,
      sharingInstructions:
        "In Notion, click Share in top right → 'Publish to web' (or 'Share with link') to make it duplicate-ready for your audience.",
    };
  }

  // 6. Dropbox Links
  // Auto-converts dl=0 to dl=1 for immediate direct stream download
  if (url.includes("dropbox.com")) {
    let directUrl = url;
    if (directUrl.includes("dl=0")) {
      directUrl = directUrl.replace("dl=0", "dl=1");
    } else if (!directUrl.includes("dl=1")) {
      directUrl += directUrl.includes("?") ? "&dl=1" : "?dl=1";
    }

    const filenameMatch = url.match(/\/([^\/?#]+)\?(?:.*)$/);
    const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : "Dropbox Resource";
    const cleanTitle = humanizeString(filename.replace(/\.[^/.]+$/, ""));
    const category = inferCategory(cleanTitle);

    return {
      provider: "dropbox",
      providerName: "Dropbox",
      originalUrl: url,
      directDownloadUrl: directUrl,
      previewUrl: url.replace("dl=1", "dl=0"),
      resourceKind: "file",
      isFolder: false,
      suggestedTitle: cleanTitle || "Dropbox Master File",
      suggestedSlug: slugify(cleanTitle) || "dropbox-resource",
      suggestedKeyword: deriveKeyword(cleanTitle, category),
      suggestedFileType: filename.split(".").pop()?.toUpperCase() || "ZIP Archive",
      suggestedCategory: category,
      sharingInstructions: "Link automatically converted to high-speed direct download (?dl=1).",
    };
  }

  // 7. GitHub Raw / Release Links
  if (url.includes("github.com")) {
    let directUrl = url;
    if (url.includes("/blob/")) {
      directUrl = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
    }

    const filename = url.split("/").pop() || "github-resource";
    const cleanTitle = humanizeString(filename.replace(/\.[^/.]+$/, ""));
    const category = inferCategory(cleanTitle);

    return {
      provider: "github",
      providerName: "GitHub Repository / Release",
      originalUrl: url,
      directDownloadUrl: directUrl,
      previewUrl: url,
      resourceKind: "file",
      isFolder: false,
      suggestedTitle: cleanTitle || "GitHub Engineering Vault",
      suggestedSlug: slugify(cleanTitle) || "github-repo",
      suggestedKeyword: deriveKeyword(cleanTitle, category),
      suggestedFileType: filename.split(".").pop()?.toUpperCase() || "Source Code / ZIP",
      suggestedCategory: category,
      sharingInstructions: "Public GitHub link verified and ready for direct access.",
    };
  }

  // 8. Generic Direct Storage / CDN URL (Cloudflare R2, AWS S3, etc.)
  let fallbackTitle = "Custom Cloud Resource";
  try {
    const parsed = new URL(url);
    const leaf = parsed.pathname.split("/").filter(Boolean).pop();
    if (leaf) {
      fallbackTitle = humanizeString(decodeURIComponent(leaf).replace(/\.[^/.]+$/, ""));
    }
  } catch {
    // fallback
  }

  const category = inferCategory(fallbackTitle);

  return {
    provider: "generic",
    providerName: "Cloud Storage Link",
    originalUrl: url,
    directDownloadUrl: url,
    previewUrl: url,
    resourceKind: "file",
    isFolder: false,
    suggestedTitle: fallbackTitle,
    suggestedSlug: slugify(fallbackTitle) || "cloud-resource",
    suggestedKeyword: deriveKeyword(fallbackTitle, category),
    suggestedFileType: "Master Archive / File",
    suggestedCategory: category,
    sharingInstructions: "Ensure the file URL is publicly accessible without credential barriers.",
  };
}
