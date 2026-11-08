// ==============================================================================
// meta-linkage plugin hook tests: comment keyword matching must trigger the
// RIGHT resource reply and nothing for non-matching comments.
// ==============================================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// isolate from catalog content changes: one real resource + a fake one
vi.mock("@/lib/catalog", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/catalog")>();
  const first = actual.RESOURCES[0];
  const testResource = { ...first, slug: "test-match-res", keyword: "BLENDER" };
  return {
    ...actual,
    // only the test resource + one "false positive trap" resource
    RESOURCES: [testResource, { ...first, slug: "trap-res", keyword: "BLENDERPRO" }],
  };
});

import { metaLinkagePlugin } from "@/plugins/meta-linkage";
import { RESOURCES } from "@/lib/catalog";

const fetchMock = vi.fn();

function fakeContext(settings: any = {}) {
  return {
    pluginId: "meta-linkage",
    settings: {
      autoReplyComments: true,
      pageAccessToken: "FAKE_TOKEN",
      ...settings,
    },
    log: vi.fn(),
  } as any;
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("metaLinkagePlugin.onCommentReceived", () => {
  const target = RESOURCES[0]; // keyword BLENDER
  const trap = RESOURCES[1]; // keyword BLENDERPRO

  it("replies via Graph API for an exact keyword comment", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://creator.example";
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "c1", userId: "u1", username: "fan", text: target.keyword, mediaId: "m1", timestamp: "t" } as any,
      fakeContext()
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("graph.facebook.com");
    const body = JSON.parse(init.body);
    // The trap resource shares the same keyword prefix and must NOT win.
    expect(body.message).toContain(`https://creator.example/r/${target.slug}`);
    expect(body.message).not.toContain(trap.slug);
  });

  it("matches whole words only — extended words like 'BLENDERPOST' must not trigger", async () => {
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "c2", userId: "u1", username: "fan", text: `${target.keyword}POST now`, mediaId: "m1", timestamp: "t" } as any,
      fakeContext()
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("matches case-insensitively", async () => {
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "c5", userId: "u1", username: "fan", text: `check out ${target.keyword.toLowerCase()} plz`, mediaId: "m1", timestamp: "t" } as any,
      fakeContext()
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).message).toContain(target.slug);
  });

  it("does not reply when autoReplyComments is disabled", async () => {
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "c4", userId: "u1", username: "fan", text: target.keyword, mediaId: "m1", timestamp: "t" } as any,
      fakeContext({ autoReplyComments: false })
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tolerates comments with no comment id", async () => {
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "", userId: "u1", username: "fan", text: target.keyword, mediaId: "m1", timestamp: "t" } as any,
      fakeContext()
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws when the Graph API call fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    await expect(
      metaLinkagePlugin.hooks.onCommentReceived!(
        { commentId: "c6", userId: "u1", username: "fan", text: target.keyword, mediaId: "m1", timestamp: "t" } as any,
        fakeContext()
      )
    ).resolves.not.toThrow();
  });
});
