#!/usr/bin/env node
// ==============================================================================
// DevResource Master Resource Manager CLI Tool
// Usage:
//   node scripts/resource-manager.mjs list
//   node scripts/resource-manager.mjs validate
//   node scripts/resource-manager.mjs export --format=json
// ==============================================================================

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const catalogPath = path.resolve(process.cwd(), "lib/catalog.ts");

function parseCatalog() {
  if (!fs.existsSync(catalogPath)) {
    console.error("Catalog file not found at:", catalogPath);
    process.exit(1);
  }
  const content = fs.readFileSync(catalogPath, "utf-8");

  // Extract resources array via simple regex match
  const matches = [...content.matchAll(/slug:\s*"([^"]+)",[\s\S]*?title:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)",[\s\S]*?keyword:\s*"([^"]+)",[\s\S]*?storageUrl:\s*"([^"]+)"/g)];

  return matches.map((m) => ({
    slug: m[1],
    title: m[2],
    category: m[3],
    keyword: m[4],
    storageUrl: m[5],
  }));
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith("https") ? https : http;
      const req = client.request(url, { method: "HEAD", timeout: 5000 }, (res) => {
        resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });
      req.on("error", (err) => resolve({ status: "ERR", ok: false, error: err.message }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ status: "TIMEOUT", ok: false });
      });
      req.end();
    } catch (e) {
      resolve({ status: "FAIL", ok: false, error: e.message });
    }
  });
}

const command = process.argv[2] || "list";

async function main() {
  console.log("\n📦 DevResource Catalog CLI Manager");
  console.log("─────────────────────────────────────────────────────────────");

  const resources = parseCatalog();

  if (command === "list") {
    console.log(`Found ${resources.length} master resources:\n`);
    console.table(
      resources.map((r) => ({
        Slug: r.slug,
        Keyword: r.keyword,
        Category: r.category,
        Title: r.title.slice(0, 35) + "...",
      }))
    );
    console.log("\nTo validate storage links: node scripts/resource-manager.mjs validate");
  } else if (command === "validate") {
    console.log(`Validating ${resources.length} storage URLs against live endpoints...\n`);
    for (const r of resources) {
      process.stdout.write(`Testing /r/${r.slug} ... `);
      const res = await checkUrl(r.storageUrl);
      if (res.ok) {
        console.log(`✓ OK (HTTP ${res.status})`);
      } else {
        console.log(`✗ FAIL (${res.status}) -> ${r.storageUrl.slice(0, 45)}...`);
      }
    }
    console.log("\nValidation run complete.");
  } else if (command === "export") {
    const outFile = "catalog_export.json";
    fs.writeFileSync(outFile, JSON.stringify(resources, null, 2), "utf-8");
    console.log(`✓ Exported ${resources.length} resources to ${outFile}`);
  } else {
    console.log("Usage: node scripts/resource-manager.mjs [list|validate|export]");
  }
  console.log("");
}

main().catch(console.error);
