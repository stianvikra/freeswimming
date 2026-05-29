import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { buildMergePreflightReport } from "../../scripts/merge-preflight.mjs";
import { buildPostMergePreflightReport } from "../../scripts/post-merge-preflight.mjs";

const existingInProgressBriefName = readdirSync("docs/task-briefs/in-progress")
  .filter((fileName) => fileName.endsWith(".md"))
  .sort((left, right) => left.localeCompare(right))[0];

if (!existingInProgressBriefName) {
  throw new Error(
    "Expected at least one in-progress task brief fixture for merge preflight tests."
  );
}

const existingInProgressBriefPath = `docs/task-briefs/in-progress/${existingInProgressBriefName}`;

describe("merge preflight", () => {
  it("passes when current-head pre-merge evidence exists and tracked drift is absent", () => {
    const report = buildMergePreflightReport({
      branch: "feat/example",
      baseBranch: "main",
      headSha: "abcdef1234567890abcdef1234567890abcdef12",
      changedFiles: [
        "docs/task-briefs/in-progress/2026-04-14-global-pr-merge-discipline-and-post-merge-preflight-10-10.md",
        "scripts/merge-preflight.mjs",
      ],
      trackedChanges: [],
      preMergeMarker: {
        status: "PASS",
        shortSha: "abcdef1",
        timestampUtc: "2026-04-14T15:00:00Z",
        verificationLane: "full",
        privateGateMode: "skipped",
        shaMatches: true,
      },
    });

    expect(report.ready).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.changedInProgressBriefs).toEqual([
      "docs/task-briefs/in-progress/2026-04-14-global-pr-merge-discipline-and-post-merge-preflight-10-10.md",
    ]);
  });

  it("fails closed when the current HEAD has no matching pre-merge PASS marker", () => {
    const report = buildMergePreflightReport({
      branch: "feat/example",
      baseBranch: "main",
      headSha: "abcdef1234567890abcdef1234567890abcdef12",
      changedFiles: ["docs/task-briefs/in-progress/example.md"],
      trackedChanges: [],
      preMergeMarker: {
        status: "PASS",
        shortSha: "1234abc",
        timestampUtc: "2026-04-14T15:00:00Z",
        verificationLane: "full",
        privateGateMode: "skipped",
        shaMatches: false,
      },
    });

    expect(report.ready).toBe(false);
    expect(report.errors.join("\n")).toContain("Latest pre-merge marker belongs");
  });

  it("fails when tracked changes remain after the gate", () => {
    const report = buildMergePreflightReport({
      branch: "feat/example",
      baseBranch: "main",
      headSha: "abcdef1234567890abcdef1234567890abcdef12",
      changedFiles: ["docs/task-briefs/in-progress/example.md"],
      trackedChanges: ["docs/checklists/release-pr-checklist.md"],
      preMergeMarker: {
        status: "PASS",
        shortSha: "abcdef1",
        timestampUtc: "2026-04-14T15:00:00Z",
        verificationLane: "full",
        privateGateMode: "skipped",
        shaMatches: true,
      },
    });

    expect(report.ready).toBe(false);
    expect(report.errors.join("\n")).toContain("Tracked file drift is still present");
  });
});

describe("post-merge preflight", () => {
  it("suggests moving merged in-progress briefs to done when run on main", () => {
    const report = buildPostMergePreflightReport({
      branch: "main",
      baseBranch: "main",
      ref: "HEAD",
      changedFiles: [existingInProgressBriefPath, "scripts/merge-preflight.mjs"],
    });

    expect(report.pendingCloseoutBriefs).toEqual([existingInProgressBriefPath]);
    expect(report.actions).toContain(
      `npm run task-brief:move -- ${existingInProgressBriefName} done`
    );
    expect(report.actions).toContain("npm run lint:briefs:all");
    expect(report.closeoutGateChecklist.join("\n")).toContain("first hard closeout gate");
    expect(report.completionRecordStarters[0]?.doneBriefPath).toBe(
      `docs/task-briefs/done/${existingInProgressBriefName}`
    );
  });

  it("tells the operator to sync main first when run from a feature branch", () => {
    const report = buildPostMergePreflightReport({
      branch: "feat/example",
      baseBranch: "main",
      ref: "HEAD",
      changedFiles: ["docs/task-briefs/in-progress/example.md"],
    });

    expect(report.warnings.join("\n")).toContain("Sync local `main`");
    expect(report.actions.slice(0, 3)).toEqual([
      "git checkout main",
      "git pull --ff-only origin main",
      "npm run post-merge:preflight",
    ]);
  });

  it("reports stale canonical queue active references for changed done briefs", () => {
    const report = buildPostMergePreflightReport({
      branch: "main",
      baseBranch: "main",
      ref: "HEAD",
      changedFiles: ["docs/task-briefs/done/2026-05-03-example.md"],
      staleCanonicalQueueReferences: [
        {
          doneBriefPath: "docs/task-briefs/done/2026-05-03-example.md",
          canonicalQueuePath: "docs/task-briefs/planned/2026-05-17-example-queue.md",
          staleActivePath: "docs/task-briefs/in-progress/2026-05-03-example.md",
        },
      ],
    });

    expect(report.staleCanonicalQueueReferences).toHaveLength(1);
    expect(report.warnings.join("\n")).toContain("active/current/candidate/in-progress item");
  });

  it("detects stale references from related parent and body-referenced design docs", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const inventoryPath = "docs/design/example-inventory.md";
    const doneBriefPath = "docs/task-briefs/done/2026-05-03-example.md";
    const report = buildPostMergePreflightReport({
      branch: "main",
      baseBranch: "main",
      ref: "HEAD",
      changedFiles: [doneBriefPath],
      contentByPath: {
        [doneBriefPath]: [
          "# Task Brief: AW-006 Example State Parity",
          "",
          "## Metadata",
          "",
          "- `status`: `done`",
          `- \`related_parent_brief\`: \`${queuePath}\``,
          "",
          "## Route / Label / Support Surface Sweep",
          "",
          `- \`${inventoryPath}\``,
        ].join("\n"),
      },
      referenceTextByPath: {
        [queuePath]: [
          "## Remaining PR-Sized UX/UI Slices",
          "",
          "| Slice | Status | Evidence |",
          "| --- | --- | --- |",
          "| Example State Parity | `in-progress` | `docs/task-briefs/in-progress/2026-05-03-example.md` |",
        ].join("\n"),
        [inventoryPath]: [
          "## Current Candidate Status",
          "",
          "Active implementation candidate:",
          "",
          "`Example State Parity`",
        ].join("\n"),
      },
    });

    const referencePaths = report.staleCanonicalQueueReferences.map(
      (entry: { referencePath?: string }) => entry.referencePath
    );

    expect(referencePaths).toEqual([queuePath, inventoryPath]);
    expect(report.queueInventoryFallout).toHaveLength(2);
  });

  it("detects stale active table-cell references from design inventories", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const inventoryPath = "docs/design/example-inventory.md";
    const doneBriefPath = "docs/task-briefs/done/2026-05-03-example.md";
    const report = buildPostMergePreflightReport({
      branch: "main",
      baseBranch: "main",
      ref: "HEAD",
      changedFiles: [doneBriefPath],
      contentByPath: {
        [doneBriefPath]: [
          "# Task Brief: AW-006 Example State Parity",
          "",
          "## Metadata",
          "",
          "- `status`: `done`",
          `- \`canonical_queue\`: \`${queuePath}\``,
          `- \`design_inventory\`: \`${inventoryPath}\``,
        ].join("\n"),
      },
      referenceTextByPath: {
        [queuePath]: "## Remaining PR-Sized UX/UI Slices\n\nNo active slice selected.",
        [inventoryPath]: [
          "| Surface | Decision |",
          "| --- | --- |",
          "| Example surface | Active: `docs/task-briefs/in-progress/2026-05-03-example.md`; preserve existing behavior. |",
        ].join("\n"),
      },
    });

    expect(report.staleCanonicalQueueReferences).toHaveLength(1);
    expect(report.staleCanonicalQueueReferences[0].referencePath).toBe(inventoryPath);
    expect(report.staleCanonicalQueueReferences[0].matchedText).toContain("Active:");
  });

  it("reports queue and inventory fallout for pending closeout briefs before the first gate", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const inventoryPath = "docs/design/example-inventory.md";
    const pendingBriefContent = `# Task Brief: Example State Parity

## Metadata

- \`status\`: \`in-progress\`
- \`canonical_queue\`: \`${queuePath}\`
- \`design_inventory\`: \`${inventoryPath}\`

## Platform 10/10 Scorecard Mapping

Reference: \`docs/quality/platform-10-10-scorecard.md\`

| Category | Mapping | Target Threshold / Scope Rationale | Evidence | Expected Closeout Score |
| --- | --- | --- | --- | --- |
| Product goals and IA | \`target\` | closeout queue fallout is surfaced | unit test | \`5/5\` |
| Testing and QA automation | \`target\` | generated record includes target rows | unit test | \`5/5\` |
`;
    const report = buildPostMergePreflightReport({
      branch: "main",
      baseBranch: "main",
      ref: "HEAD",
      changedFiles: [existingInProgressBriefPath],
      completedDate: "2026-05-22",
      contentByPath: {
        [existingInProgressBriefPath]: pendingBriefContent,
      },
      referenceTextByPath: {
        [queuePath]: [
          "## Remaining PR-Sized UX/UI Slices",
          "",
          "| Slice | Status | Brief |",
          "| --- | --- | --- |",
          `| Example State Parity | \`active\` | \`${existingInProgressBriefPath}\` |`,
        ].join("\n"),
        [inventoryPath]: [
          "## Current Candidate Status",
          "",
          "Active state-primitive implementation candidate:",
          "",
          "`Example State Parity`",
        ].join("\n"),
      },
    });

    expect(report.pendingCloseoutReferenceFallout).toHaveLength(2);
    expect(report.queueInventoryFallout.map((entry) => entry.referencePath)).toEqual([
      queuePath,
      inventoryPath,
    ]);
    expect(report.completionRecordStarters[0]?.content).toContain(
      "| Product goals and IA | `5/5` | <local gate / CI / PR evidence> | <none or explicit gap> |"
    );
    expect(report.closeoutGateChecklist.join("\n")).toContain(
      "Update every listed queue/inventory"
    );
    expect(report.closeoutGateChecklist.join("\n")).toContain("lint:briefs:all");
  });
});
