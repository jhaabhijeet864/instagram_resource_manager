import { describe, it, expect } from "vitest";
import { resolveResourceLink } from "@/lib/providers/resolver";

describe("resolveResourceLink", () => {
  it("resolves Google Drive file links to direct download links", () => {
    const rawUrl = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up0I/view?usp=sharing";
    const res = resolveResourceLink(rawUrl);

    expect(res.provider).toBe("google_drive");
    expect(res.resourceKind).toBe("file");
    expect(res.resourceId).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up0I");
    expect(res.directDownloadUrl).toBe(
      "https://drive.google.com/uc?export=download&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up0I"
    );
    expect(res.isFolder).toBe(false);
  });

  it("resolves Google Drive folder links", () => {
    const rawUrl = "https://drive.google.com/drive/folders/17pY3uU-QjW-O_K8rW2V6yWp9N9DevVault?usp=sharing";
    const res = resolveResourceLink(rawUrl);

    expect(res.provider).toBe("google_drive");
    expect(res.resourceKind).toBe("folder");
    expect(res.resourceId).toBe("17pY3uU-QjW-O_K8rW2V6yWp9N9DevVault");
    expect(res.isFolder).toBe(true);
  });

  it("resolves Google Docs to direct PDF export link", () => {
    const rawUrl = "https://docs.google.com/document/d/1vA8bC9dEfGhIjKlMnOpQrStUvWxYz/edit";
    const res = resolveResourceLink(rawUrl);

    expect(res.provider).toBe("google_drive");
    expect(res.resourceKind).toBe("document");
    expect(res.directDownloadUrl).toBe(
      "https://docs.google.com/document/d/1vA8bC9dEfGhIjKlMnOpQrStUvWxYz/export?format=pdf"
    );
  });

  it("resolves Notion page links and extracts title & category", () => {
    const rawUrl = "https://notion.so/devresource/Distributed-Systems-Architecture-Guide-18efbc784a9280bf8e39d5b066f8e77a";
    const res = resolveResourceLink(rawUrl);

    expect(res.provider).toBe("notion");
    expect(res.resourceKind).toBe("notion_page");
    expect(res.resourceId).toBe("18efbc784a9280bf8e39d5b066f8e77a");
    expect(res.suggestedTitle).toBe("Distributed Systems Architecture Guide");
    expect(res.suggestedCategory).toBe("System Architecture");
  });

  it("resolves Dropbox links and transforms to dl=1", () => {
    const rawUrl = "https://www.dropbox.com/s/abcdef12345/System-Design-Cheatsheet.pdf?dl=0";
    const res = resolveResourceLink(rawUrl);

    expect(res.provider).toBe("dropbox");
    expect(res.directDownloadUrl).toContain("dl=1");
    expect(res.suggestedTitle).toContain("System Design Cheatsheet");
  });
});
