# Test Gate Efficiency And Warning Triage

Use this runbook when a PR has passed targeted work but full `verify:pre-pr` or
`verify:pre-merge` exposes slow failures, repeated warnings, or unclear flakes.
The goal is to reduce wasted reruns without weakening the release gate.

## Default Order

1. Run the smallest targeted unit/component tests for changed modules.
2. Run changed E2E specs on the projects that exercise the changed surface.
3. Add one known-risk baseline pack only when the surface has recent gate history.
4. Run `npm run verify:pre-pr`.
5. Before merge, run `npm run verify:pre-merge`, refresh the PR body, and confirm CI.

Do not change the full gate order just to move likely failures earlier. Prefer a
targeted preflight pack before the full gate, then let the full gate remain the
canonical broad release signal.

## Known-Risk Packs

- My Library route readiness:
  - `tests/e2e/my-library-training-context.spec.ts`
  - `tests/e2e/my-library-workout-builder.spec.ts`
- Session builder / generator / poolside hydration:
  - `tests/e2e/my-library-workout-builder.spec.ts`
  - `tests/e2e/my-library-generator-intake.spec.ts`
  - `tests/e2e/poolside-save-image-export.spec.ts`
- Mobile navigation and drawer behavior:
  - `tests/e2e/mobile-nav.spec.ts`
  - `tests/e2e/mobile-nav-state.spec.ts`
- Popup/export behavior:
  - `tests/e2e/poolside-save-image-export.spec.ts`
  - any PDF/export spec touched by the PR.

Run only the relevant pack. Do not run every known-risk pack for every PR.

## Failure Classification

Classify each full-gate issue before patching:

- `fix now`: deterministic failure in the changed surface, a stale test contract,
  or a repeated warning that correlates with a failed assertion.
- `targeted rerun`: one-off full-suite failure where the exact spec should be
  rerun on the same head to separate flake from regression.
- `watch`: non-failing warning that recurs but does not correlate with test
  failure yet.
- `document`: expensive pattern with a reusable probe or fix pattern.
- `ignore`: known benign tooling noise that does not affect parsing or assertions.

If a fix attempt fails twice, switch to the UI/high-cost debugging protocol before
adding more retries or timeouts.

## Warning Decisions

- React hydration mismatch:
  - `fix now` when it appears on the changed surface or in consecutive release
    gates.
  - `document/watch` when unrelated and non-failing.
- Next dev `ERR_ABORTED`, `ECONNRESET`, `Failed to fetch`, `Compiling`, or
  `Rendering` noise:
  - `fix now` only when a test times out or the route readiness contract is stale.
  - `watch` when the full gate passes and no assertion depends on the aborted
    request.
- Fast Refresh full reload:
  - `watch` by default.
  - `fix now` for popup/export tests if instrumentation can be wiped by reload.
- `NO_COLOR` ignored because `FORCE_COLOR` is set:
  - `ignore` unless a parser or assertion consumes colored output.
- Perf-budget `tighten` recommendation:
  - handle through the maintenance cadence, not opportunistically inside feature
    or test-hardening PRs.
- PR body section failures:
  - refresh with the canonical PR-body generator, then rerun only the failed CI
    job when the code and local gates are unchanged.

## PR-Body And Gate Hygiene

After local pre-merge passes, prefer:

```bash
npm run pr:create:safari -- --refresh-body
```

For a full final local sequence, prefer:

```bash
npm run gate:pre-merge
```

This keeps `verify:pre-merge` evidence, current head SHA, and required PR-body
sections aligned before merge review.

## Evidence To Record

Record these in the active brief or PR body:

- failed run artifact path and head SHA,
- exact failed spec(s),
- targeted rerun result,
- classification decision,
- whether the fix changed product code, test harness, docs/runbook, or no code,
- follow-up owner if classified as `watch` or `document`.
