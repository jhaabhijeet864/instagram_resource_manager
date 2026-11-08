// ==============================================================================
// meta-linkage plugin hook tests: comment keyword matching must trigger the
// RIGHT resource reply and nothing for non-matching comments.
// ==============================================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { metaLinkagePlugin } from "@/plugins/meta-linkage";

const fetchMock = vi.fn();
let savedToken: string | undefined;

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
  savedToken = process.env.NEXT_PUBLIC_APP_URL;
});

afterEach(() => {
  if (savedToken === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = savedToken;
  vi.unstubAllGlobals();
});

describe("metaLinkagePlugin.onCommentReceived", () => {
  it("replies via Graph API for an exact keyword comment", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://creator.example";
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "c1", userId: "u1", username: "fan", text: "PROMPT", mediaId: "m1", timestamp: "t" } as any,
      fakeContext()
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("graph.facebook.com");
    const body = JSON.parse(init.body);
    expect(body.message).toContain("https://creator.example/r/viral-creator-prompts");
  });

  it("matches whole words only — PROMOTIONAL must not trigger the PROMPT resource", async () => {
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "c2", userId: "u1", username: "fan", text: "PROMOTIONAL screenshot", mediaId: "m1", timestamp: "t" } as any,
      fakeContext()
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("matches whole words only — DESIGNER WANTED must not trigger the DESIGN resource", async () => {
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "c3", userId: "u1", username: "fan", text: "DESIGNER WANTED", mediaId: "m1", timestamp: "t" } as any,
      fakeContext()
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not reply when autoReplyComments is disabled", async () => {
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "c4", userId: "u1", username: "fan", text: "RAG", mediaId: "m1", timestamp: "t" } as any,
      fakeContext({ autoReplyComments: false })
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tolerates comments with no comment id", async () => {
    await metaLinkagePlugin.hooks.onCommentReceived!(
      { commentId: "", userId: "u1", username: "fan", text: "RAG", mediaId: "m1", timestamp: "t" } as any,
      fakeContext()
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws when the Graph API call fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    await expect(
      metaLinkagePlugin.hooks.onCommentReceived!(
        { commentId: "c5", userId: "u1", username: "fan", text: "RAG", mediaId: "m1", timestamp: "t" } as any,
        fakeContext()
      )
    ).resolves.not.toThrow();
  });
});
