// ==============================================================================
// SERVER-SIDE URL SAFETY GUARD
// Protects server-side outbound fetches (e.g. /api/resources validateLink)
// from SSRF: internal networks, cloud metadata endpoints, and non-HTTP schemes.
// ==============================================================================

const PRIVATE_HOSTNAME_SUFFIXES = [".localhost", ".local", ".internal"];

function isPrivateIPv4(host: string): boolean {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
  const parts = host.split(".").map(Number);
  if (parts.some((p) => p > 255)) return true; // malformed IPv4 => treat as unsafe
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true; // this-network, private, loopback
  if (a === 169 && b === 254) return true; // link-local (cloud metadata e.g. 169.254.169.254)
  if (a === 192 && b === 168) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  return false;
}

function isPrivateIPv6(host: string): boolean {
  const clean = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!clean.includes(":")) return false;
  if (clean === "::1" || clean === "::") return true; // loopback / unspecified
  if (clean.startsWith("fe80") || clean.startsWith("fc") || clean.startsWith("fd")) return true; // link-local / ULA
  if (clean.startsWith("::ffff:")) {
    // IPv4-mapped IPv6 — evaluate the mapped IPv4 part
    return isPrivateIPv4(clean.slice("::ffff:".length));
  }
  return false;
}

/**
 * Returns true only for public absolute HTTP(S) URLs that are safe for
 * server-side fetching. Blocks localhost, private ranges, link-local/metadata
 * endpoints (169.254.169.254, metadata.google.internal), and non-http(s)
 * schemes (file:, ftp:, javascript:, ...).
 */
export function isSafePublicHttpUrl(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  const rawHost = url.hostname.toLowerCase();
  if (!rawHost) return false;
  const host = rawHost.replace(/^\[|\]$/g, "");

  // Literal IPv6 addresses
  if (host.includes(":") && isPrivateIPv6(host)) return false;

  // Local/internal hostnames
  if (host === "localhost" || PRIVATE_HOSTNAME_SUFFIXES.some((s) => host.endsWith(s))) return false;

  // Dotted-quad IPv4
  if (isPrivateIPv4(host)) return false;

  return true;
}
