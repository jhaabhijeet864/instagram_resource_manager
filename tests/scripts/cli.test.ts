// ==============================================================================
// Smoke tests for the CLI scripts (they must always run without crashing).
// ==============================================================================
import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

const run = promisify(execFile);
const cwd = path.resolve(__dirname, "../../..");

describe("scripts/resource-manager.mjs", () => {
  it("lists the catalog resources without crashing", async () => {
    const { stdout, stderr } = await run("node", ["scripts/resource-manager.mjs", "list"], { cwd });
    expect(stderr).toBe("");
    expect(stdout).toContain("rag-starter-kit");
    expect(stdout).toContain("system-design-primer");
    expect(stdout).toContain("Found 6 master resources");
  });

  it("export writes a valid JSON catalog export", async () => {
    const { stdout } = await run("node", ["scripts/resource-manager.mjs", "export"], { cwd });
    expect(stdout).toContain("Exported 6 resources");
  });
});

describe("scripts/plugins-runner.mjs", () => {
  it("lists plugins without crashing", async () => {
    const { stdout } = await run("node", ["scripts/plugins-runner.mjs", "list"], { cwd });
    expect(stdout).toContain("meta-linkage");
    expect(stdout).toContain("webhook-dispatcher");
  });
});
