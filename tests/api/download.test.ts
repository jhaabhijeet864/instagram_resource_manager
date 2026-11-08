// ==============================================================================
// GET /api/download/[slug] tests: catalog resolution, redirect, analytics, safety.
// ==============================================================================
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/server/supabase")>();
  return { ...actual, insertAnalyticsEvent: vi.fn(async () => true) };
});

import { insertAnalyticsEvent } from "@/lib/server/supabase";
import { pluginRegistry } from "@/lib/plugins/registry";
import { GET } from "@/app/api/download/[slug]/route";

const insertMock = vi.mocked(insertAnalyticsEvent);

const intentSpy = vi.spyOn(pluginRegistry, "dispatchDownloadIntent").mockResolvedValue();
const servedSpy = vi.spyOn(pluginRegistry, "dispatchFileServed").mockResolvedValue();

function get(slug: string, query = "") {
  const request = new Request(`http://localhost/api/download/${slug}${query}`);
  return GET(request, { params: { slug } });
}

beforeEach(() => {
  insertMock.mockClear().mockResolvedValue(true);
  intentSpy.mockClear();
  servedSpy.mockClear();
});

describe("GET /api/download/[slug]", () => {
  it("redirects to the storage URL for a known slug", async () => {
    const res = await get("rag-starter-kit");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toMatch(/^https:\/\/drive\.google\.com\//);
  });

  it("returns 404 for unknown slugs", async () => {
    const res = await get("no-such-resource");
    expect(res.status).toBe(404);
    expect(intentSpy).not.toHaveBeenCalled();
  });

  it("dispatches plugin hooks with UTM data", async () => {
    await get("rag-starter-kit", "?utm_source=instagram&utm_medium=comment_dm&utm_campaign=IG-001");
    expect(intentSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "rag-starter-kit",
        utm: expect.objectContaining({ campaign: "IG-001", source: "instagram" }),
      })
    );
    expect(servedSpy).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "rag-starter-kit", storageUrl: expect.stringContaining("https://") })
    );
  });

  it("uses campaign defaults when UTMs are missing", async () => {
    await get("rag-starter-kit");
    expect(intentSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        utm: expect.objectContaining({ campaign: "direct", source: "instagram", medium: "comment_dm" }),
      })
    );
  });

  it("records a DOWNLOAD_SUCCESS server event before redirecting", async () => {
    await get("rag-starter-kit", "?utm_campaign=IG-002");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "DOWNLOAD_SUCCESS",
        resourceSlug: "rag-starter-kit",
        campaign: "IG-002",
      })
    );
  });

  it("still redirects when analytics persist fails", async () => {
    insertMock.mockRejectedValue(new Error("db down"));
    const res = await get("rag-starter-kit");
    expect(res.status).toBe(302);
  });
});
