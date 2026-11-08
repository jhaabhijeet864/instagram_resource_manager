// ==============================================================================
// lib/server/url-guard unit tests (SSRF protection for server-side fetching).
// ==============================================================================
import { describe, it, expect } from "vitest";
import { isSafePublicHttpUrl } from "@/lib/server/url-guard";

describe("isSafePublicHttpUrl", () => {
  it("accepts public http(s) URLs", () => {
    expect(isSafePublicHttpUrl("https://drive.google.com/file/d/xyz")).toBe(true);
    expect(isSafePublicHttpUrl("http://example.com")).toBe(true);
    expect(isSafePublicHttpUrl("https://files.example.co.uk/x?y=1")).toBe(true);
    expect(isSafePublicHttpUrl("https://203.0.113.10/file")).toBe(true);
  });

  it("rejects malformed URLs", () => {
    expect(isSafePublicHttpUrl("not a url")).toBe(false);
    expect(isSafePublicHttpUrl("")).toBe(false);
    expect(isSafePublicHttpUrl("//drive.google.com")).toBe(false);
  });

  it("rejects non-http(s) protocols", () => {
    expect(isSafePublicHttpUrl("ftp://example.com/x")).toBe(false);
    expect(isSafePublicHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isSafePublicHttpUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects localhost and local hostnames", () => {
    expect(isSafePublicHttpUrl("http://localhost/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://LOCALHOST:3000/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://app.localhost/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://printer.local/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://127.0.0.1/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://127.0.0.2/x")).toBe(false);
  });

  it("rejects private and internal IPv4 ranges", () => {
    expect(isSafePublicHttpUrl("http://10.0.0.1/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://10.1.2.3/internal")).toBe(false);
    expect(isSafePublicHttpUrl("http://192.168.1.1/router")).toBe(false);
    expect(isSafePublicHttpUrl("http://172.16.0.1/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://172.31.255.255/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://172.32.0.1/x")).toBe(true); // outside private range
    expect(isSafePublicHttpUrl("http://0.0.0.0/x")).toBe(false);
  });

  it("rejects cloud metadata endpoints (SSRF classic)", () => {
    expect(isSafePublicHttpUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isSafePublicHttpUrl("http://metadata.google.internal/computeMetadata/v1/")).toBe(false);
  });

  it("rejects IPv6 loopback / link-local / unique-local addresses", () => {
    expect(isSafePublicHttpUrl("http://[::1]/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://[fe80::1]/x")).toBe(false);
    expect(isSafePublicHttpUrl("http://[fc00::1]/x")).toBe(false);
  });
});
