# Task Brief: PWA Hardening, Release Gate, and Observability

## Metadata

- `id`: `2026-02-15-pwa-hardening-release-and-observability`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-15`
- `updated`: `2026-02-19`

## Goal

PWA quality should be release-safe and repeatable: strong QA gates, measurable outcomes, and a rollback-ready workflow for production.

## Scope

- Define a PWA release quality gate in docs/checklists:
  - install flow verified,
  - offline fallback verified,
  - cache-eviction fallback verified (clear storage -> no blank state),
  - write-action integrity verified under offline/weak-network conditions,
  - cross-browser/device matrix verified,
  - accessibility pass for changed surfaces.
- Add CI-friendly PWA smoke checks where practical:
  - manifest contract validation,
  - service worker/offline response smoke checks,
  - install surface regression checks in e2e.
- Establish manual QA matrix for production readiness:
  - iOS Safari,
  - Android Chromium,
  - Desktop Safari,
  - Desktop Chrome/Edge,
  - optional tablet regression pass for nav/layout.
- Add observability hooks (if existing analytics hooks already exist):
  - install entry viewed,
  - install action clicked,
  - install result,
  - offline fallback shown,
  - cache-miss fallback shown,
  - write action blocked/retry shown due to offline state.
- Define rollout and rollback steps:
  - release checklist,
  - fast disable path for problematic prompt behavior,
  - post-release verification checklist.

## Ownership Split (No Overlap)

- This brief owns:
  - PWA install/offline release-gating and observability flow.
- Related hardening owned elsewhere:
  - performance budget automation + security negative-path hardening:
    - `docs/task-briefs/planned/2026-02-19-performance-budgets-and-security-negative-path-hardening.md`

## Out Of Scope

- No new analytics vendor procurement.
- No legal/privacy policy rewrite (unless new tracking requirements force it).
- No major UI redesign outside PWA-related surfaces.

## Acceptance Criteria

- PWA quality gate is documented and used in PR/release flow.
- CI and manual QA together catch install/offline regressions before merge.
- Release checklist explicitly includes storage-clear/cache-eviction scenario and expected fallback behavior.
- Team has one clear rollback procedure for PWA-facing regressions.
- Observability events are documented and emitted (or explicitly deferred with reason).
- Post-merge runbook includes local sync and verification steps.
- Manual QA evidence always states tested URL, browser/device, and fallback outcome.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Manual QA Environments

- Local dev URL:
  - full changed-flow verification,
  - at least one mobile + one desktop browser.
- Vercel preview URL:
  - repeat changed-flow verification in production-like environment before merge.
- Required scenario coverage:
  - normal online flow,
  - offline flow with cached content,
  - offline flow with cache cleared (fallback path),
  - reconnect recovery.

## Constraints

- Keep release process lightweight enough for frequent iteration.
- Keep requirements explicit and binary (pass/fail), not vague.
- Never store secret values in repo docs; document names only.

## 10/10 Cross-Cut Categories (Apply When Relevant)

State scope or `N/A` for each category during implementation and closeout:

- Content governance and source-of-truth: canonical model, required fields, owner assignment, revision/rollback policy.
- Taxonomy and category management: naming rules, sorting, and active/archive lifecycle.
- Workflow and publishing safety: status model (`draft/review/published/archived`), publish safeguards, destructive confirmation.
- RBAC and auditability: role boundaries per endpoint/UI action and audit trail for sensitive mutations.
- UX/UI quality contract: clear primary action and required states (`loading`, `empty`, `error`, `retry`).
- Performance contract: latency/render/payload guardrails for changed surfaces.
- Testing contract: unit + e2e coverage for critical and negative paths; avoid duplicate tests.
- Observability and KPI tracking: required events/logs and measurable thresholds.
- Migration and rollback readiness: rollout plan, compatibility window, rollback path.
- Definition-of-done quant targets: explicit measurable pass criteria.

## 10/10 Quality Bar

- Release criteria must be deterministic and audit-friendly.
- QA evidence must be reproducible from the brief/checklist without relying on chat context.
- Rollback path must be executable in minutes and documented before release.
- Required changed-flow states must be validated:
  - `loading`,
  - `error`,
  - `offline`,
  - `retry/recovery`.
- Accessibility and performance checks must be included in release gating for changed surfaces.

## Session Continuity and Recovery

- Canonical source of truth: git branch + this brief file.
- Checkpoint cadence: commit at each completed milestone or every 60-90 minutes of active coding.
- Every checkpoint should record:
  - latest commit hash,
  - completed milestone,
  - next milestone.
- Recovery protocol if session/chat is interrupted:
  1. run `git status -sb`,
  2. run `git log --oneline -n 10`,
  3. reopen this brief and continue from the recorded next milestone.

## PR Browser Rule

- Open PR create/review/merge links in Safari by default:
  - `open -a Safari "<PR_URL>"`
- Use another browser only if the owner explicitly asks for it.

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary
