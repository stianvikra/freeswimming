# Task Brief: Performance Budgets And Security Negative-Path Hardening

## Metadata

- `id`: `2026-02-19-performance-budgets-and-security-negative-path-hardening`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-19`
- `updated`: `2026-02-19`

## Goal

Release quality should be 10/10 for performance and security reliability by enforcing automated budget gates and strong negative-path regression coverage in CI.

## Scope

- Add performance budget gates for core routes:
  - `/`
  - `/plans`
  - `/course`
  - `/my-library`
- Implement CI-enforced thresholds for core web vitals proxies and payload/perf constraints:
  - LCP proxy budget
  - CLS budget
  - INP/TBT proxy budget
  - JS/CSS transfer and request-count guardrails where feasible
- Add security negative-path coverage (no duplicate suite sprawl):
  - extend existing unit/e2e suites first,
  - only add new suites when existing coverage cannot model risk.
- Harden admin/auth/data mutation negative paths:
  - unauthenticated access must return expected deny status (`401`/`403`/`423`/`429` as designed),
  - forbidden role boundaries must be enforced server-side,
  - invalid payloads must fail cleanly without stack leakage,
  - rate-limit/abuse paths must return deterministic safe responses.
- Add regression checks for server-error hygiene:
  - no accidental `500` on expected deny paths,
  - no sensitive error content in API responses.
- Define baseline budgets vs stretch budgets and a ratchet policy:
  - baseline gates are blocking in CI initially,
  - stretch goals are tightened in controlled increments after stable runs.
- Wire automated execution into release cadence:
  - pre-PR,
  - pre-merge,
  - nightly.
- Update runbooks/checklists with exact commands and expected pass/fail outcomes.

## Standard Targets (Agreed Default)

### Performance Budgets

- Initial CI-blocking thresholds:
  - LCP <= `2.5s`
  - CLS <= `0.10`
  - TBT <= `200ms`
- Stretch targets (ratchet after stability):
  - LCP <= `2.2s`
  - CLS <= `0.05`
  - TBT <= `150ms`
  - INP p75 <= `200ms` (field metric; track in production telemetry)

### Blocking Route Set

- `/`
- `/plans`
- `/course`
- `/my-library`

### P0 API Negative-Path Set

- `/api/admin/*`
- `/api/contact`
- `/api/portal`
- `/api/checkout/session`

### P1 API Negative-Path Set (after P0)

- `/api/progress/course`
- `/api/progress/guide`
- `/api/user/export`
- `/api/user/delete`

### Ratchet Reminder Rule (Required)

- After `2` consecutive weekly green runs on baseline thresholds:
  - assistant must explicitly prompt owner to tighten toward stretch targets.
- Tightening step:
  - one budget step at a time, then observe stability for at least one full week.
- Decision log:
  - every ratchet decision (tighten/hold/revert) must be recorded in brief notes or PR summary.

## Out Of Scope

- SEO metadata and crawl/indexing assertions:
  - `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`
- Visual snapshot baseline strategy and cross-device UX visual polish:
  - `docs/task-briefs/planned/2026-02-18-cross-platform-ux-design-hardening.md`
- Major backend architecture rewrites.

## Acceptance Criteria

- Performance budget checks are automated and block regressions in CI.
- Baseline thresholds are implemented exactly as specified in this brief.
- Core routes have explicit documented thresholds and these are version-controlled.
- Negative-path tests cover auth/admin critical routes and fail on unexpected status drift.
- Expected deny paths never return `500` in covered scenarios.
- API error bodies in covered negative paths do not expose stack/internal secrets.
- Nightly workflow includes relevant performance/security regression coverage.
- Documentation clearly states when each gate runs and which command to use.
- Ratchet reminder policy is implemented in docs/agent workflow so threshold tightening is not forgotten.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e:security`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`
- any added performance budget command(s) must pass in CI context

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/`
  - `http://127.0.0.1:3000/course`
  - `http://127.0.0.1:3000/my-library`
  - auth/admin/api deny-path checks with local/dev test account as needed
- Vercel preview:
  - verify same gate behavior and no route-level regressions.
- Required browser/device matrix (for changed user-facing flows):
  - iOS Safari
  - Android Chromium
  - Desktop Chrome/Safari/Firefox

## Constraints

- Do not add duplicate tests that re-check identical behavior with no added risk coverage.
- Prefer extending existing suites (`tests/unit/*`, `tests/e2e/*`) before creating new files.
- Keep runtime overhead of performance checks reasonable for PR CI.
- Keep production behavior unchanged except intended hardening.

## 10/10 Cross-Cut Categories (Apply When Relevant)

State scope or `N/A` for each category during implementation and closeout:

- Content governance and source-of-truth: canonical model, required fields, owner assignment, revision/rollback policy.
- Taxonomy and category management: naming rules, sorting, and active/archive lifecycle.
- Workflow and publishing safety: status model (`draft/review/published/archived`), publish safeguards, destructive confirmation.
- Business logic correctness and data integrity: deterministic state transitions, invariant validation, idempotent critical mutations, and no silent data corruption paths.
- RBAC and auditability: role boundaries per endpoint/UI action and audit trail for sensitive mutations.
- UX/UI quality contract: clear primary action and required states (`loading`, `empty`, `error`, `retry`).
- Performance contract: latency/render/payload guardrails for changed surfaces.
- Testing contract: unit + e2e coverage for critical and negative paths; avoid duplicate tests.
- Observability and KPI tracking: required events/logs and measurable thresholds.
- Migration and rollback readiness: rollout plan, compatibility window, rollback path.
- Definition-of-done quant targets: explicit measurable pass criteria.

## 10/10 Quality Bar (Required For User-Facing Work)

- Performance gates are strict enough to catch regressions but stable (low flake).
- Security deny paths are explicit, deterministic, and test-enforced.
- Required states remain clear for users (`loading`, `error`, `retry`, `offline`) with no UX regressions.
- Test evidence is easy to interpret from CI artifacts and logs.

## Security, Privacy, And Compliance (Required For Auth/Data/Payments)

- Enforce principle of least privilege in admin/data paths.
- Ensure protected operations require valid auth + role checks.
- Ensure deny responses are safe and non-enumerating where required.
- Preserve GDPR-aligned data minimization in logs and error payloads.

## Observability And KPI Contract

- Track:
  - deny-path status distribution (`401/403/423/429/500`) on protected routes,
  - performance budget pass/fail trend by route,
  - regression frequency over 7-day window.
- Quality targets:
  - zero expected-deny-path `500` in CI-covered flows,
  - no sustained budget regressions on core routes.

## Session Continuity And Recovery (Required)

- Canonical source: git branch + this brief.
- Checkpoint cadence: commit every validated slice or every 60-90 minutes.
- Recovery:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from next slice.

## Git Rhythm Defaults (Required)

- Commit + push per validated slice:
  - performance budget scaffolding,
  - negative-path test hardening,
  - CI workflow wiring,
  - docs/runbook updates.

## Branch Hygiene Defaults (Required)

- Post-merge:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git fetch --prune origin`

## PR Browser Rule (Required)

- Open PR links in Safari by default.

## Manual QA URL Rule (Required)

- Assistant opens each QA URL in Safari as active tab before asking for `done`.

## Final Closeout Gate (Required Before Move To `done`)

- Confirm all acceptance criteria are complete or explicitly deferred with rationale.
- Run final quality sweep:
  - performance budgets,
  - security negative-path behavior,
  - regression safety for adjacent routes/components.
- Confirm CI artifacts and commands are documented and reproducible.

## Completion Record (fill when done)

- `PR`: link
- `merge`: source -> target
- `result`: short summary

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
