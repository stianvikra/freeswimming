import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildPreMergeReuseDecision,
  readLatestVerifyRunMetadata,
  readVerifyRunMetadata,
} from "../../scripts/verify-run-metadata.mjs";

describe("verify run metadata", () => {
  it("reads structured metadata from a verify run directory", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "verify-run-"));
    const runDir = path.join(root, "20260414-120000");
    mkdirSync(runDir);
    writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({
        status: "PASS",
        headSha: "abcdef1234567890abcdef1234567890abcdef12",
        shortSha: "abcdef1",
        verificationLane: "full-public",
        timestampUtc: "2026-04-14T12:00:00Z",
        exitCode: 0,
        sourceCommand: "verify:open",
      })
    );

    expect(readVerifyRunMetadata(runDir)).toEqual(
      expect.objectContaining({
        runDir,
        status: "PASS",
        shortSha: "abcdef1",
        verificationLane: "full-public",
      })
    );
  });

  it("finds the latest run from the latest symlink", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "verify-root-"));
    const runsRoot = path.join(root, "test-runs");
    mkdirSync(runsRoot);
    const runDir = path.join(runsRoot, "20260414-120000");
    mkdirSync(runDir);
    writeFileSync(
      path.join(runDir, "meta.json"),
      JSON.stringify({
        status: "PASS",
        headSha: "abcdef1234567890abcdef1234567890abcdef12",
        shortSha: "abcdef1",
        verificationLane: "docs-only",
      })
    );
    symlinkSync("20260414-120000", path.join(runsRoot, "latest"));

    expect(readLatestVerifyRunMetadata(runsRoot)).toEqual(
      expect.objectContaining({
        runDir,
        verificationLane: "docs-only",
      })
    );
  });
});

describe("pre-merge reuse decision", () => {
  it("reuses latest verify result when head, lane, and status all match", () => {
    const decision = buildPreMergeReuseDecision({
      latestRun: {
        runDir: "artifacts/test-runs/20260414-120000",
        status: "PASS",
        headSha: "abcdef1234567890abcdef1234567890abcdef12",
        shortSha: "abcdef1",
        verificationLane: "full-public",
      },
      headSha: "abcdef1234567890abcdef1234567890abcdef12",
      verificationLane: "full",
    });

    expect(decision.decision).toBe("reuse");
    expect(decision.reason).toContain("current HEAD");
  });

  it("reruns when the latest verify artifact belongs to a different head", () => {
    const decision = buildPreMergeReuseDecision({
      latestRun: {
        runDir: "artifacts/test-runs/20260414-120000",
        status: "PASS",
        headSha: "1234567890abcdef1234567890abcdef12345678",
        shortSha: "1234567",
        verificationLane: "full-public",
      },
      headSha: "abcdef1234567890abcdef1234567890abcdef12",
      verificationLane: "full-public",
    });

    expect(decision.decision).toBe("rerun");
    expect(decision.reason).toContain("belongs to");
  });

  it("reruns when the latest verify artifact lane does not match", () => {
    const decision = buildPreMergeReuseDecision({
      latestRun: {
        runDir: "artifacts/test-runs/20260414-120000",
        status: "PASS",
        headSha: "abcdef1234567890abcdef1234567890abcdef12",
        shortSha: "abcdef1",
        verificationLane: "docs-only",
      },
      headSha: "abcdef1234567890abcdef1234567890abcdef12",
      verificationLane: "full-public",
    });

    expect(decision.decision).toBe("rerun");
    expect(decision.reason).toContain("lane");
  });
});
