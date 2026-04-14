import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const scriptPath = join(process.cwd(), "scripts/run-verify-pre-merge.sh");

describe("run-verify-pre-merge script", () => {
  it("routes full-lane fresh runs through the metadata-writing verify wrapper", () => {
    const script = readFileSync(scriptPath, "utf8");

    expect(script).toContain("bash ./scripts/run-verify-open.sh");
    expect(script).not.toContain("SITE_LOCK_ENABLED=0 npm run verify");
  });
});
