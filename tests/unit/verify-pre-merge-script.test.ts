import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const scriptPath = join(process.cwd(), "scripts/run-verify-pre-merge.sh");
const prePrScriptPath = join(process.cwd(), "scripts/run-verify-pre-pr.sh");

describe("run-verify-pre-merge script", () => {
  it("routes full-lane fresh runs through the metadata-writing verify wrapper", () => {
    const script = readFileSync(scriptPath, "utf8");

    expect(script).toContain("bash ./scripts/run-verify-open.sh");
    expect(script).not.toContain("SITE_LOCK_ENABLED=0 npm run verify");
  });

  it("runs Supabase migration drift checks before verification lane selection", () => {
    const preMergeScript = readFileSync(scriptPath, "utf8");
    const prePrScript = readFileSync(prePrScriptPath, "utf8");

    for (const script of [preMergeScript, prePrScript]) {
      const driftGateIndex = script.indexOf("node ./scripts/assert-supabase-migration-drift.mjs");
      const scopeIndex = script.indexOf("node ./scripts/verification-scope.mjs --summary");

      expect(driftGateIndex).toBeGreaterThan(-1);
      expect(scopeIndex).toBeGreaterThan(-1);
      expect(driftGateIndex).toBeLessThan(scopeIndex);
    }
  });
});
