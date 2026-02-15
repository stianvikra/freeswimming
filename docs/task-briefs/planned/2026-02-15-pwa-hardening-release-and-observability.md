# Task Brief: PWA Hardening, Release Gate, and Observability

## Metadata

- `id`: `2026-02-15-pwa-hardening-release-and-observability`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-15`
- `updated`: `2026-02-15`

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

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary
