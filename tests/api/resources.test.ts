// ==============================================================================
// GET /api/resources + POST /api/resources (create | validateLink) tests.
// ==============================================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, POST } from "@/app/api/resources/route";
import { RESOURCES } from "@/lib/catalog";

const fetchMock = vi.fn();

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

function validResource(overrides: Record<string, unknown> = {}) {
  return {
    slug: "test-resource-alpha",
    id: "test-resource-alpha",
    resource_id: "RES-TEST-1",
    title: "Test Resource",
    category: "AI",
    keyword: "TESTRES",
    description: "d",
    fileName: "test.pdf",
    fileSize: "1 KB",
    fileType: "PDF",
    storageUrl: "https://drive.google.com/drive/test-alpha",
    tags: [],
    updatedDate: "2026-01-01",
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/resources", () => {
  it("returns the base catalog on first call", async () => {
    const json = await (await GET()).json();
    expect(json.resources.length).toBeGreaterThanOrEqual(RESOURCES.length);
    const slugs = json.resources.map((r: any) => r.slug);
    for (const r of RESOURCES) expect(slugs).toContain(r.slug);
  });
});

describe("POST /api/resources (create)", () => {
  it("creates a new resource", async () => {
    const res = await post({ action: "create", resource: validResource() });
    expect(res.status).toBe(200);
    const after = await (await GET()).json();
    const created = after.resources.find((r: any) => r.slug === "test-resource-alpha");
    expect(created).toBeTruthy();
    expect(created.title).toBe("Test Resource");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await post({ action: "create", resource: { title: "No slug", storageUrl: "" } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/slug/i);
  });

  it("rejects slugs with invalid characters", async () => {
    const res = await post({ action: "create", resource: validResource({ slug: "Bad Slug!!" }) });
    expect(res.status).toBe(400);
  });

  it("rejects storage URLs that are not public http(s) URLs (SSRF guard)", async () => {
    const res = await post({
      action: "create",
      resource: validResource({ slug: "bad-url-res", storageUrl: "http://169.254.169.254/latest" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid actions", async () => {
    const res = await post({ action: "explode" });
    expect(res.status).toBe(400);
  });

  it("handles malformed JSON as 400", async () => {
    const res = await post("{bad");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/resources (validateLink)", () => {
  it("validates a public URL through a HEAD request", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200, headers: { "content-type": "image/pdf" } }));
    const res = await post({ action: "validateLink", url: "https://drive.google.com/file/d/xyz" });
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.status).toBe(200);
    expect(json.contentType).toBe("image/pdf");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://drive.google.com/file/d/xyz");
    expect(init.method).toBe("HEAD");
  });

  it("refuses private/internal URLs and never fetches them", async () => {
    for (const bad of [
      "http://localhost:9000/secret",
      "http://169.254.169.254/latest/meta-data",
      "http://10.10.0.2/internal",
      "http://192.168.1.1/",
      "http://172.16.5.5/x",
      "file:///etc/passwd",
    ]) {
      fetchMock.mockClear();
      const res = await post({ action: "validateLink", url: bad });
      expect(res.status, bad).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  });

  it("refuses URLs that are not absolute", async () => {
    const res = await post({ action: "validateLink", url: "not-a-url" });
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
