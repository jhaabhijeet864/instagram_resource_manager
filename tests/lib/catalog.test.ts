// ==============================================================================
// Catalog invariant, lookup and keyword-matching tests.
// Written data-driven (derived from the actual catalog) so the suite does not
// break whenever the catalog *content* is edited — only when invariants break.
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

  it("slugs are lowercase URL-safe", () => {
    for (const r of RESOURCES) {
      expect(r.slug, r.slug).toMatch(/^[a-z0-9-]+$/);
    }
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
      expect(CATEGORIES, r.slug).toContain(r.category);
    }
  });

  it("benchmark campaigns reference real resources", () => {
    expect(BENCHMARK_CAMPAIGNS.length).toBeGreaterThanOrEqual(5);
    for (const c of BENCHMARK_CAMPAIGNS) {
      expect(getResourceBySlug(c.resource_slug), c.campaign_id).toBeDefined();
    }
  });
});

describe("getResourceBySlug", () => {
  it("finds the first resource by slug", () => {
    const first = RESOURCES[0];
    expect(getResourceBySlug(first.slug)?.resource_id).toBe(first.resource_id);
  });

  it("finds resources by id as well", () => {
    const r = RESOURCES[0];
    expect(getResourceBySlug(r.id)?.slug).toBe(r.slug);
  });

  it("returns undefined for unknown slugs", () => {
    expect(getResourceBySlug("does-not-exist")).toBeUndefined();
    expect(getResourceBySlug("")).toBeUndefined();
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

  it("strips leading/trailing dashes from punctuation", () => {
    expect(slugify("")).toBe("");
    expect(slugify("  --  ")).toBe("");
    expect(slugify("!!!")).toBe("");
  });
});

describe("matchesKeyword (comment trigger matching)", () => {
  const kw = RESOURCES[0].keyword; // e.g. "SEARCH"

  it("matches the exact keyword", () => {
    expect(matchesKeyword(kw, kw)).toBe(true);
  });

  it("matches case-insensitively with surrounding words", () => {
    expect(matchesKeyword(`i want the ${kw.toLowerCase()} guide`, kw)).toBe(true);
  });

  it("matches with trailing punctuation", () => {
    expect(matchesKeyword(`${kw}!!`, kw)).toBe(true);
    expect(matchesKeyword(`${kw}.`, kw)).toBe(false || true); // punctuation boundary still matches
    expect(matchesKeyword(`the ${kw}.`, kw)).toBe(true);
  });

  it("does NOT match substring false positives", () => {
    expect(matchesKeyword(`${kw.toUpperCase()}ED`, kw)).toBe(false); // prefix-extended word
    expect(matchesKeyword(`${kw.toUpperCase()}IDE`, kw)).toBe(false);
  });

  it("returns false for empty inputs", () => {
    expect(matchesKeyword("", kw)).toBe(false);
    expect(matchesKeyword(kw, "")).toBe(false);
  });
});

describe("findResourceByKeyword", () => {
  const first = RESOURCES[0];

  it("finds the resource behind a comment keyword", () => {
    expect(findResourceByKeyword(`please send ${first.keyword}`)?.slug).toBe(first.slug);
    expect(findResourceByKeyword(first.keyword)?.slug).toBe(first.slug);
  });

  it("does not match substring false positives", () => {
    expect(findResourceByKeyword(`${first.keyword}ED`)).toBeUndefined();
    expect(findResourceByKeyword(`${first.keyword}GIVEAWAY`)).toBeUndefined();
  });

  it("returns undefined for empty text", () => {
    expect(findResourceByKeyword("")).toBeUndefined();
    expect(findResourceByKeyword("   ")).toBeUndefined();
  });
});
