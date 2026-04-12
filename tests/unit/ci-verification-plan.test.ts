import { describe, expect, it } from "vitest";

import { resolveCiVerificationPlan } from "../../scripts/ci-verification-plan.mjs";

describe("ci verification plan", () => {
  it("fails closed to the full lane for non-pull-request events", () => {
    const plan = resolveCiVerificationPlan({
      eventName: "push",
      changedFiles: ["docs/task-briefs/done/example.md"],
      baseRef: "origin/main",
    });

    expect(plan.lane).toBe("full");
    expect(plan.reason).toContain("push");
  });

  it("uses the docs-only lane for pull requests with only docs/governance paths", () => {
    const plan = resolveCiVerificationPlan({
      eventName: "pull_request",
      baseRef: "origin/main",
      changedFiles: ["docs/task-briefs/done/example.md", ".github/pull_request_template.md"],
    });

    expect(plan.lane).toBe("docs-only");
    expect(plan.baseRef).toBe("origin/main");
  });

  it("uses the full lane for pull requests with code-touching changes", () => {
    const plan = resolveCiVerificationPlan({
      eventName: "pull_request",
      baseRef: "origin/main",
      changedFiles: ["docs/task-briefs/done/example.md", "app/page.tsx"],
    });

    expect(plan.lane).toBe("full");
    expect(plan.disallowedPaths).toEqual(["app/page.tsx"]);
  });

  it("respects the existing force-full override for pull requests", () => {
    const plan = resolveCiVerificationPlan({
      eventName: "pull_request",
      baseRef: "origin/main",
      changedFiles: ["docs/task-briefs/done/example.md"],
      env: { VERIFY_FORCE_FULL: "1" },
    });

    expect(plan.lane).toBe("full");
    expect(plan.reason).toContain("VERIFY_FORCE_FULL=1");
  });
});
