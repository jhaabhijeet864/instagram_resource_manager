// ==============================================================================
// SSRF PROTECTION FOR SERVER-SIDE HTTP REDIRECTS & WEBHOOKS
// Validates that a target URL is an acceptable public http(s) destination.
// ==============================================================================

export function isSafePublicHttpUrl(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return false;
  }

  // Protocol check
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const host = parsed.hostname.toLowerCase();

  // Localhost checks
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0"
  ) {
    return false;
  }

  // Cloud metadata endpoints
  if (
    host === "169.254.169.254" ||
    host.includes("metadata.google.internal") ||
    host.includes("169.254.")
  ) {
    return false;
  }

  // IPv4 checks
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const oct1 = parseInt(ipv4Match[1], 10);
    const oct2 = parseInt(ipv4Match[2], 10);
    const oct3 = parseInt(ipv4Match[3], 10);
    const oct4 = parseInt(ipv4Match[4], 10);

    if (oct1 > 255 || oct2 > 255 || oct3 > 255 || oct4 > 255) return false;

    // Loopback: 127.0.0.0/8
    if (oct1 === 127 || oct1 === 0) return false;

    // Private Range A: 10.0.0.0/8
    if (oct1 === 10) return false;

    // Private Range B: 172.16.0.0 - 172.31.255.255
    if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) return false;

    // Private Range C: 192.168.0.0/16
    if (oct1 === 192 && oct2 === 168) return false;
  }

  return true;
}
