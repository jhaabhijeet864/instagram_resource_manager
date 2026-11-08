// ==============================================================================
// Smoke tests for the CLI scripts (they must always run without crashing).
// ==============================================================================
import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { RESOURCES } from "@/lib/catalog";

const run = promisify(execFile);
const cwd = process.cwd();

describe("scripts/resource-manager.mjs", () => {
  it("lists the catalog resources without crashing", async () => {
    const { stdout, stderr } = await run("node", ["scripts/resource-manager.mjs", "list"], { cwd });
    expect(stderr).toBe("");
    for (const r of RESOURCES) {
      expect(stdout).toContain(r.slug);
    }
    expect(stdout).toContain(`Found ${RESOURCES.length} master resources`);
  });

  it("export writes a valid JSON catalog export of every resource", async () => {
    const { stdout } = await run("node", ["scripts/resource-manager.mjs", "export"], { cwd });
    expect(stdout).toContain(`Exported ${RESOURCES.length} resources`);
  });
});

describe("scripts/plugins-runner.mjs", () => {
  it("lists plugins without crashing", async () => {
    const { stdout } = await run("node", ["scripts/plugins-runner.mjs", "list"], { cwd });
    expect(stdout).toContain("meta-linkage");
    expect(stdout).toContain("webhook-dispatcher");
  });
});
