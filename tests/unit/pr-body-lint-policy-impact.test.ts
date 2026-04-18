import { describe, expect, it, vi } from "vitest";
import {
  hydratePullRequestFromApi,
  shouldRetryPullRequestBodyValidation,
  validatePullRequestBody,
  validatePullRequestBodyWithApiRefresh,
} from "../../scripts/lint-pr-body-sections.mjs";

const HEAD_SHA = "abcdef1234567890abcdef1234567890abcdef12";

function buildPrBody(options?: {
  policyImpact?: string;
  policyVersionNote?: string;
  policyChecklist?: string;
}) {
  const policyImpact = options?.policyImpact ?? "no (docs/scripting scope only)";
  const policyVersionNote =
    options?.policyVersionNote ?? "N/A (no policy-impacting scope detected)";
  const policyChecklist =
    options?.policyChecklist ?? "N/A (no policy-impacting scope detected in changed files)";

  return `
## Summary

- User-visible changes: No runtime behavior changes.
- Technical changes: Updated automation/docs scripts only.
- Policy impact: ${policyImpact}
- Policy version note: ${policyVersionNote}
- Brief link(s): docs/task-briefs/in-progress/2026-03-10-aw-011-terms-privacy-compliance-lifecycle-10-10.md

## Scope

- In scope: docs/scripts policy-governance automation.
- Out of scope: runtime feature behavior and DB migrations.

## Risk

- Main risk: validator strictness can block incomplete PR bodies.
- Rollback plan: revert this commit.

## Test Evidence

- Policy-impact checklist: ${policyChecklist}
- \`npm run verify:pre-pr\`: PASS (artifacts/test-runs/latest)
- \`npm run verify:pre-merge\`: PASS for \`${HEAD_SHA.slice(0, 7)}\` (2026-03-12T09:00:00Z, mode: skipped).

## Checklist

- [ ] Acceptance criteria are met
`.trim();
}

describe("validatePullRequestBody policy-impact enforcement", () => {
  it("passes for non-policy scope with explicit no + N/A rationale", () => {
    const errors = validatePullRequestBody(buildPrBody(), {
      headSha: HEAD_SHA,
      changedFiles: ["docs/runbooks/admin-email-template-governance.md"],
    });

    expect(errors).toEqual([]);
  });

  it("fails when policy impact is declared no but changed files include policy-impact paths", () => {
    const errors = validatePullRequestBody(buildPrBody(), {
      headSha: HEAD_SHA,
      changedFiles: ["app/api/user/delete/route.ts"],
    });

    expect(errors.join("\n")).toContain("Summary declares `Policy impact: no`");
  });

  it("fails when policy impact is yes but checklist is N/A", () => {
    const errors = validatePullRequestBody(
      buildPrBody({
        policyImpact: "yes (auth/session paths changed)",
        policyChecklist: "N/A (left blank by mistake)",
      }),
      {
        headSha: HEAD_SHA,
        changedFiles: ["app/auth/sign-in/page.tsx"],
      }
    );

    expect(errors).toContain("`Policy impact: yes` cannot use `Policy-impact checklist: N/A`.");
  });

  it("passes when policy impact is yes with structured evidence", () => {
    const errors = validatePullRequestBody(
      buildPrBody({
        policyImpact: "yes (auth/session paths changed)",
        policyVersionNote: "N/A (policy text unchanged after review against current behavior)",
        policyChecklist:
          "PASS (docs/checklists/policy-impact-release-review.md run on current scope)",
      }),
      {
        headSha: HEAD_SHA,
        changedFiles: ["app/auth/sign-in/page.tsx"],
      }
    );

    expect(errors).toEqual([]);
  });

  it("fails when policy-impact summary line is missing", () => {
    const body = buildPrBody().replace(/^- Policy impact:.*\n/m, "");
    const errors = validatePullRequestBody(body, {
      headSha: HEAD_SHA,
      changedFiles: ["docs/runbooks/admin-email-template-governance.md"],
    });

    expect(errors).toContain(
      'Section "## Summary" is missing a filled `Policy impact` line (`yes` or `no` + rationale).'
    );
  });
});

describe("hydratePullRequestFromApi", () => {
  it("prefers the latest GitHub API snapshot when it is available", async () => {
    const originalPullRequest = {
      number: 255,
      url: "https://api.github.com/repos/stianvikra/freeswimming/pulls/255",
      body: "stale body",
      head: { sha: HEAD_SHA },
      base: { ref: "main", sha: "base-sha" },
    };
    const latestPullRequest = {
      ...originalPullRequest,
      body: buildPrBody({
        policyImpact: "yes (auth/session paths changed)",
        policyVersionNote: "N/A (policy text unchanged after review against current behavior)",
        policyChecklist:
          "PASS (docs/checklists/policy-impact-release-review.md run on current scope)",
      }),
    };
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => latestPullRequest,
    });

    const hydrated = await hydratePullRequestFromApi(originalPullRequest, {
      fetchImpl,
      env: {},
    });

    expect(hydrated.body).toBe(latestPullRequest.body);
    expect(fetchImpl).toHaveBeenCalledWith(
      originalPullRequest.url,
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/vnd.github+json",
          "User-Agent": "freeswimming-pr-body-lint",
        }),
      })
    );
  });

  it("falls back to the event payload when the live GitHub API lookup fails", async () => {
    const originalPullRequest = {
      number: 255,
      url: "https://api.github.com/repos/stianvikra/freeswimming/pulls/255",
      body: "stale body",
      head: { sha: HEAD_SHA },
      base: { ref: "main", sha: "base-sha" },
    };
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));

    const hydrated = await hydratePullRequestFromApi(originalPullRequest, {
      fetchImpl,
      env: {},
    });

    expect(hydrated).toEqual(originalPullRequest);
  });
});

describe("shouldRetryPullRequestBodyValidation", () => {
  it("retries only SHA-staleness failures from PR body refresh races", () => {
    expect(
      shouldRetryPullRequestBodyValidation([
        "When `verify:pre-merge` is `PASS`, the same evidence line must include current PR head SHA (short or full).",
        "Checked `verify:pre-merge` checkbox requires PASS evidence line containing current HEAD SHA.",
      ])
    ).toBe(true);
    expect(
      shouldRetryPullRequestBodyValidation([
        'Section "## Summary" is missing a filled `Policy impact` line (`yes` or `no` + rationale).',
      ])
    ).toBe(false);
  });
});

describe("validatePullRequestBodyWithApiRefresh", () => {
  it("rehydrates from GitHub when the first snapshot is stale after a push", async () => {
    const staleHead = "1234567890abcdef1234567890abcdef12345678";
    const staleBody = buildPrBody().replace(HEAD_SHA.slice(0, 7), staleHead.slice(0, 7));
    const freshBody = buildPrBody();
    const pullRequest = {
      number: 255,
      url: "https://api.github.com/repos/stianvikra/freeswimming/pulls/255",
      body: staleBody,
      head: { sha: HEAD_SHA },
      base: { ref: "main", sha: "base-sha" },
    };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...pullRequest, body: staleBody }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...pullRequest, body: freshBody }),
      });

    const result = await validatePullRequestBodyWithApiRefresh(pullRequest, {
      changedFiles: ["scripts/lint-pr-body-sections.mjs"],
      env: {},
      fetchImpl,
      maxAttempts: 2,
      refreshDelayMs: 0,
    });

    expect(result.errors).toEqual([]);
    expect(result.attempts).toBe(2);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-refreshable validation failures", async () => {
    const invalidBody = buildPrBody().replace(/^- Policy impact:.*\n/m, "");
    const pullRequest = {
      number: 255,
      url: "https://api.github.com/repos/stianvikra/freeswimming/pulls/255",
      body: invalidBody,
      head: { sha: HEAD_SHA },
      base: { ref: "main", sha: "base-sha" },
    };
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => pullRequest,
    });

    const result = await validatePullRequestBodyWithApiRefresh(pullRequest, {
      changedFiles: ["scripts/lint-pr-body-sections.mjs"],
      env: {},
      fetchImpl,
      maxAttempts: 3,
      refreshDelayMs: 0,
    });

    expect(result.errors).toContain(
      'Section "## Summary" is missing a filled `Policy impact` line (`yes` or `no` + rationale).'
    );
    expect(result.attempts).toBe(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
