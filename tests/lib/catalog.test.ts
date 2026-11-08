// ==============================================================================
// Catalog invariant, lookup and keyword-matching tests.
// ==============================================================================
import { describe, it, expect } from "vitest";
import {
  RESOURCES,
  CATEGORIES,
  BENCHMARK_CAMPAIGNS,
  getResourceBySlug,
  slugify,
  matchesKeyword,
  findResourceByKeyword,
} from "@/lib/catalog";

describe("catalog integrity", () => {
  it("has at least 6 resources", () => {
    expect(RESOURCES.length).toBeGreaterThanOrEqual(6);
  });

  it("has unique slugs", () => {
    const slugs = RESOURCES.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique ids and resource_ids", () => {
    expect(new Set(RESOURCES.map((r) => r.id)).size).toBe(RESOURCES.length);
    expect(new Set(RESOURCES.map((r) => r.resource_id)).size).toBe(RESOURCES.length);
  });

  it("every storageUrl is an absolute http(s) URL", () => {
    for (const r of RESOURCES) {
      expect(r.storageUrl, r.slug).toMatch(/^https?:\/\//i);
    }
  });

  it("every resource has a non-empty keyword, title, fileName", () => {
    for (const r of RESOURCES) {
      expect(r.keyword.trim().length, r.slug).toBeGreaterThan(0);
      expect(r.title.trim().length, r.slug).toBeGreaterThan(0);
      expect(r.fileName.trim().length, r.slug).toBeGreaterThan(0);
    }
  });

  it("homepage 'All' category matches every resource category", () => {
    for (const r of RESOURCES) {
      expect(CATEGORIES).toContain(r.category);
    }
  });

  it("benchmark campaigns reference real resources", () => {
    for (const c of BENCHMARK_CAMPAIGNS) {
      expect(getResourceBySlug(c.resource_slug), c.campaign_id).toBeDefined();
    }
  });
});

describe("getResourceBySlug", () => {
  it("finds resources by slug", () => {
    expect(getResourceBySlug("rag-starter-kit")?.resource_id).toBe("RES-001");
  });

  it("finds resources by id as well", () => {
    const r = RESOURCES[0];
    expect(getResourceBySlug(r.id)).toBe(getResourceBySlug(r.slug));
  });

  it("returns undefined for unknown slugs", () => {
    expect(getResourceBySlug("does-not-exist")).toBeUndefined();
  });
});

describe("slugify", () => {
  it("slugifies a typical title", () => {
    expect(slugify("RAG Starter Kit: Practical Guide & Code")).toBe(
      "rag-starter-kit-practical-guide-code"
    );
  });

  it("slugifies simple spaces and punctuation", () => {
    expect(slugify("Hello World!!")).toBe("hello-world");
    expect(slugify("  tons   of   spaces  ")).toBe("tons-of-spaces");
  });

  it("never throws on tricky inputs", () => {
    expect(slugify("")).toBe("");
    expect(slugify("  --  ")).toBe("");
    expect(slugify("!!!")).toBe("");
    expect(slugify("unicode café ✨ test")).toBe("unicode-caf-test");
  });
});

describe("matchesKeyword (comment trigger matching)", () => {
  it("matches the exact keyword", () => {
    expect(matchesKeyword("RAG", "RAG")).toBe(true);
  });

  it("matches case-insensitively with surrounding words", () => {
    expect(matchesKeyword("i want the design guide", "DESIGN")).toBe(true);
    expect(matchesKeyword("send me the PROMPT", "PROMPT")).toBe(true);
  });

  it("matches with trailing punctuation", () => {
    expect(matchesKeyword("RAG!!", "RAG")).toBe(true);
    expect(matchesKeyword("PYTHON.", "PYTHON")).toBe(true);
  });

  it("does NOT match substring false positives", () => {
    // "PROMPTIONAL" contains "PROMPT"? No — but "PROMOTIONAL" must not trigger the PROMPT resource.
    expect(matchesKeyword("PROMOTIONAL post", "PROMPT")).toBe(false);
    // "DESIGNER WANTED" contains "DESIGN" but is a different word.
    expect(matchesKeyword("DESIGNER WANTED", "DESIGN")).toBe(false);
    expect(matchesKeyword("PYTHONIDE", "PYTHON")).toBe(false);
  });

  it("returns false for empty inputs", () => {
    expect(matchesKeyword("", "RAG")).toBe(false);
    expect(matchesKeyword("RAG", "")).toBe(false);
  });
});

describe("findResourceByKeyword", () => {
  it("finds the resource behind a comment keyword", () => {
    expect(findResourceByKeyword("send PROMPT")?.slug).toBe("viral-creator-prompts");
    expect(findResourceByKeyword("DESIGN")?.slug).toBe("system-design-primer");
  });

  it("does not match substring false positives", () => {
    expect(findResourceByKeyword("PROMOTIONAL offer")).toBeUndefined();
    expect(findResourceByKeyword("looking for a DESIGNER")).toBeUndefined();
  });

  it("returns undefined for empty text", () => {
    expect(findResourceByKeyword("")).toBeUndefined();
    expect(findResourceByKeyword("   ")).toBeUndefined();
  });
});
