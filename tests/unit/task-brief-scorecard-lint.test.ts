import { describe, expect, it } from "vitest";

import { lintBriefText } from "../../scripts/lint-task-brief-scorecard.mjs";

const canonicalCategories = [
  "Product goals and IA",
  "Business logic correctness and data integrity",
  "Testing and QA automation",
];

function buildBrief({
  status = "in-progress",
  canonicalQueuePath = "",
  completionRecord = "",
  title = "Example State Parity",
}: {
  status?: "planned" | "in-progress" | "done";
  canonicalQueuePath?: string;
  completionRecord?: string;
  title?: string;
} = {}) {
  return `# Task Brief: ${title}

## Metadata

- \`status\`: \`${status}\`
${canonicalQueuePath ? `- \`canonical_queue\`: \`${canonicalQueuePath}\`\n` : ""}

## Platform 10/10 Scorecard Mapping

Reference: \`docs/quality/platform-10-10-scorecard.md\`

Critical target categories for \`10/10\` claim:

- \`Product goals and IA\`
- \`Business logic correctness and data integrity\`

| Category | Mapping | Target Threshold / Scope Rationale | Evidence | Expected Closeout Score |
| --- | --- | --- | --- | --- |
| Product goals and IA | \`target\` | measurable product-governance threshold | unit test | \`5/5\` |
| Business logic correctness and data integrity | \`target\` | deterministic lint behavior threshold | unit test | \`5/5\` |
| Testing and QA automation | \`supporting\` | supporting coverage only | targeted test review | \`4/5\` |

${completionRecord}`;
}

function lint(content: string, enforceDoneCloseout = true) {
  return lintBriefText(
    "docs/task-briefs/done/2026-05-03-example.md",
    content,
    canonicalCategories,
    { enforceDoneCloseout }
  );
}

const passingCompletionRecord = `## Completion Record

- \`PR\`: https://github.com/stianvikra/freeswimming/pull/999
- \`10/10 claim\`: yes - all critical target categories are scored 5/5.

| Category | Achieved Score | Evidence | Gaps / Notes |
| --- | --- | --- | --- |
| Product goals and IA | \`5/5\` | \`npm run verify:pre-pr\` PASS | none |
| Business logic correctness and data integrity | \`5/5\` | targeted Vitest negative-path tests PASS | none |
`;

describe("task brief scorecard lint", () => {
  it("allows planned and in-progress briefs without closeout score evidence", () => {
    const plannedResult = lintBriefText(
      "docs/task-briefs/planned/2026-05-03-example.md",
      buildBrief({ status: "planned" }),
      canonicalCategories,
      { enforceDoneCloseout: true }
    );
    const inProgressResult = lintBriefText(
      "docs/task-briefs/in-progress/2026-05-03-example.md",
      buildBrief({ status: "in-progress" }),
      canonicalCategories,
      { enforceDoneCloseout: true }
    );

    expect(plannedResult.errors).toEqual([]);
    expect(inProgressResult.errors).toEqual([]);
  });

  it("does not force historical done closeout evidence when enforcement is disabled", () => {
    const result = lint(buildBrief({ status: "done" }), false);

    expect(result.errors).toEqual([]);
  });

  it("still hard-fails all-brief lint for malformed scorecard rows when closeout enforcement is disabled", () => {
    const result = lint(
      buildBrief({
        status: "done",
        completionRecord: passingCompletionRecord,
      }).replace(
        "| Testing and QA automation | `supporting` | supporting coverage only | targeted test review | `4/5` |",
        "| Testing and QA automation | `maybe` | supporting coverage only | targeted test review | `4/5` |"
      ),
      false
    );

    expect(result.errors.join("\n")).toContain("invalid mapping");
  });

  it("fails a changed done brief missing closeout score evidence", () => {
    const result = lint(buildBrief({ status: "done" }));

    expect(result.errors.join("\n")).toContain("missing a closeout score table");
  });

  it("passes a changed done brief with complete achieved scores and explicit 10/10 claim", () => {
    const result = lint(
      buildBrief({
        status: "done",
        completionRecord: passingCompletionRecord,
      })
    );

    expect(result.errors).toEqual([]);
  });

  it("fails a 10/10 claim when a critical target category is not scored 5/5", () => {
    const completionRecord = passingCompletionRecord.replace(
      "| Business logic correctness and data integrity | `5/5` |",
      "| Business logic correctness and data integrity | `4/5` |"
    );
    const result = lint(buildBrief({ status: "done", completionRecord }));

    expect(result.errors.join("\n")).toContain(
      'claims 10/10 but critical target category "Business logic correctness and data integrity" is not scored 5/5'
    );
  });

  it("allows an explicit non-10/10 closeout claim when release-gate scores are still acceptable", () => {
    const completionRecord = passingCompletionRecord
      .replace(
        "- `10/10 claim`: yes - all critical target categories are scored 5/5.",
        "- `10/10 claim`: no - accepted follow-up keeps one critical target below 5/5."
      )
      .replace(
        "| Business logic correctness and data integrity | `5/5` |",
        "| Business logic correctness and data integrity | `4/5` |"
      );
    const result = lint(buildBrief({ status: "done", completionRecord }));

    expect(result.errors).toEqual([]);
  });

  it("fails a changed done brief when its canonical queue still lists it as the active in-progress brief", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      buildBrief({
        status: "done",
        canonicalQueuePath: queuePath,
        completionRecord: passingCompletionRecord,
      }),
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        canonicalQueueTextByPath: {
          [queuePath]: [
            "## Remaining PR-Sized UX/UI Slices",
            "",
            "1. `Example` (active implementation slice)",
            "   - Active brief: `docs/task-briefs/in-progress/2026-05-03-example.md`.",
          ].join("\n"),
        },
      }
    );

    expect(result.errors.join("\n")).toContain("still lists done brief");
  });

  it("fails a changed done brief when a queue table still marks the old in-progress path current", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      buildBrief({
        status: "done",
        canonicalQueuePath: queuePath,
        completionRecord: passingCompletionRecord,
      }),
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        canonicalQueueTextByPath: {
          [queuePath]: [
            "| Slice | Status | Active brief |",
            "| --- | --- | --- |",
            "| Example | `current` | `docs/task-briefs/in-progress/2026-05-03-example.md` |",
          ].join("\n"),
        },
      }
    );

    expect(result.errors.join("\n")).toContain("still lists done brief");
  });

  it("fails a changed done brief when its title is still marked active without an in-progress path", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      buildBrief({
        status: "done",
        canonicalQueuePath: queuePath,
        completionRecord: passingCompletionRecord,
      }),
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        referenceTextByPath: {
          [queuePath]: [
            "## Remaining PR-Sized UX/UI Slices",
            "",
            "Example State Parity is the active AW-006 implementation slice after a fresh re-audit.",
            "",
            "| Slice | Status | Objective |",
            "| --- | --- | --- |",
            "| Example State Parity | `active` | Keep the queue accurate. |",
          ].join("\n"),
        },
      }
    );

    expect(result.errors.join("\n")).toContain("active/current/candidate");
  });

  it("fails a changed done brief when related parent brief still marks it active", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const content = buildBrief({
      title: "AW-006 Example State Parity",
      status: "done",
      completionRecord: passingCompletionRecord,
    }).replace(
      "- `status`: `done`",
      ["- `status`: `done`", `- \`related_parent_brief\`: \`${queuePath}\``].join("\n")
    );
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      content,
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        referenceTextByPath: {
          [queuePath]: [
            "## Remaining PR-Sized UX/UI Slices",
            "",
            "| Slice | Status | Evidence |",
            "| --- | --- | --- |",
            "| Example State Parity | `in-progress` | `docs/task-briefs/in-progress/2026-05-03-example.md` |",
          ].join("\n"),
        },
      }
    );

    expect(result.errors.join("\n")).toContain(queuePath);
    expect(result.errors.join("\n")).toContain("still lists done brief");
  });

  it("fails a changed done brief when its design inventory still lists it as current candidate", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const inventoryPath = "docs/design/example-inventory.md";
    const content = buildBrief({
      status: "done",
      canonicalQueuePath: queuePath,
      completionRecord: passingCompletionRecord,
    }).replace(
      "- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-example-queue.md`",
      [
        "- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-example-queue.md`",
        "- `design_inventory`: `docs/design/example-inventory.md`",
      ].join("\n")
    );
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      content,
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        referenceTextByPath: {
          [queuePath]: "## Remaining PR-Sized UX/UI Slices\n\nNo active slice selected.",
          [inventoryPath]: [
            "## Current Candidate Status",
            "",
            "Active state-primitive implementation candidate after PR `#123/#124`:",
            "",
            "`Example State Parity`",
          ].join("\n"),
        },
      }
    );

    expect(result.errors.join("\n")).toContain(inventoryPath);
  });

  it("fails a changed done brief when a design inventory table cell labels its old path active", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const inventoryPath = "docs/design/example-inventory.md";
    const content = buildBrief({
      status: "done",
      canonicalQueuePath: queuePath,
      completionRecord: passingCompletionRecord,
    }).replace(
      "- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-example-queue.md`",
      [
        "- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-example-queue.md`",
        "- `design_inventory`: `docs/design/example-inventory.md`",
      ].join("\n")
    );
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      content,
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        referenceTextByPath: {
          [queuePath]: "## Remaining PR-Sized UX/UI Slices\n\nNo active slice selected.",
          [inventoryPath]: [
            "| Surface | Decision |",
            "| --- | --- |",
            "| Example surface | Active: `docs/task-briefs/in-progress/2026-05-03-example.md`; preserve existing behavior. |",
          ].join("\n"),
        },
      }
    );

    expect(result.errors.join("\n")).toContain(inventoryPath);
    expect(result.errors.join("\n")).toContain("Active:");
  });

  it("fails a changed done brief when a body-referenced design doc still lists it active", () => {
    const inventoryPath = "docs/design/example-inventory.md";
    const content = buildBrief({
      title: "AW-006 Example State Parity",
      status: "done",
      completionRecord: passingCompletionRecord,
    }).replace(
      "## Platform 10/10 Scorecard Mapping",
      [
        `- Reference inventory: \`${inventoryPath}\``,
        "",
        "## Platform 10/10 Scorecard Mapping",
      ].join("\n")
    );
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      content,
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        referenceTextByPath: {
          [inventoryPath]: [
            "## Current Candidate Status",
            "",
            "Active state-primitive implementation candidate:",
            "",
            "`Example State Parity`",
          ].join("\n"),
        },
      }
    );

    expect(result.errors.join("\n")).toContain(inventoryPath);
    expect(result.errors.join("\n")).toContain("active/current/candidate");
  });

  it("allows historical queue log references when the done brief is no longer the active item", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      buildBrief({
        status: "done",
        canonicalQueuePath: queuePath,
        completionRecord: passingCompletionRecord,
      }),
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        canonicalQueueTextByPath: {
          [queuePath]: [
            "## Checkpoint Log",
            "",
            "- `2026-05-03 | planned | next: execute docs/task-briefs/in-progress/2026-05-03-example.md`",
            "",
            "## Remaining PR-Sized UX/UI Slices",
            "",
            "1. `Next Example` (active implementation slice)",
            "   - Active brief: `docs/task-briefs/in-progress/2026-05-04-next-example.md`.",
          ].join("\n"),
        },
      }
    );

    expect(result.errors).toEqual([]);
  });

  it("allows historical title references inside checkpoint logs", () => {
    const queuePath = "docs/task-briefs/planned/2026-05-17-example-queue.md";
    const result = lintBriefText(
      "docs/task-briefs/done/2026-05-03-example.md",
      buildBrief({
        status: "done",
        canonicalQueuePath: queuePath,
        completionRecord: passingCompletionRecord,
      }),
      canonicalCategories,
      {
        enforceDoneCloseout: true,
        referenceTextByPath: {
          [queuePath]: [
            "## Remaining PR-Sized UX/UI Slices",
            "",
            "No active implementation slice is selected.",
            "",
            "## Checkpoint Log",
            "",
            "- `2026-05-03 | planned | Example State Parity was the active implementation slice before it moved to done.`",
          ].join("\n"),
        },
      }
    );

    expect(result.errors).toEqual([]);
  });
});
