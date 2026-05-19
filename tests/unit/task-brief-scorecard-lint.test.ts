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
}: {
  status?: "planned" | "in-progress" | "done";
  canonicalQueuePath?: string;
  completionRecord?: string;
} = {}) {
  return `# Task Brief: Example

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
});
