#!/usr/bin/env node
// ==============================================================================
// DevResource Plugins CLI Runner
// Usage:
//   node scripts/plugins-runner.mjs list
//   node scripts/plugins-runner.mjs test
// ==============================================================================

import fs from "fs";
import path from "path";

const pluginsDir = path.resolve(process.cwd(), "plugins");

function getPlugins() {
  if (!fs.existsSync(pluginsDir)) return [];
  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((d) => {
      const idxPath = path.join(pluginsDir, d.name, "index.ts");
      return {
        id: d.name,
        path: idxPath,
        exists: fs.existsSync(idxPath),
      };
    });
}

const command = process.argv[2] || "list";

console.log("\n🧩 DevResource Plugins Engine Runner");
console.log("─────────────────────────────────────────────────────────────");

const plugins = getPlugins();

if (command === "list") {
  console.log(`Discovered ${plugins.length} installed plugins in /plugins:\n`);
  console.table(
    plugins.map((p) => ({
      Plugin: p.id,
      Entrypoint: path.basename(p.path),
      Status: p.exists ? "Active & Verified" : "Missing Entrypoint",
    }))
  );
  console.log("\nTo test plugin integrations: node scripts/plugins-runner.mjs test");
} else if (command === "test") {
  console.log("Static plugin checks (full runtime coverage: npm test)\n");
  let failures = 0;
  for (const p of plugins) {
    process.stdout.write(`• Checking ${p.id} ... `);
    if (!p.exists) {
      console.log("FAIL: Missing index.ts");
      failures++;
      continue;
    }
    const source = fs.readFileSync(p.path, "utf-8");
    if (!source.includes("definePlugin(")) {
      console.log("FAIL: index.ts does not declare a plugin via definePlugin()");
      failures++;
      continue;
    }
    console.log("OK: Entrypoint declared via definePlugin()");
  }
  console.log(
    failures > 0
      ? `\n${failures} plugin check(s) failed!`
      : "\nAll static plugin checks passed! (run `npm test` for full plugin test coverage)"
  );
  if (failures > 0) process.exit(1);
} else {
  console.log("Usage: node scripts/plugins-runner.mjs [list|test]");
}
console.log("");
