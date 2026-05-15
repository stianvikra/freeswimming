# Task Brief: PWA Hardening, Release Gate, and Observability

## Metadata

- `id`: `2026-02-15-pwa-hardening-release-and-observability`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-15`
- `updated`: `2026-02-19`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@b2a211f`
- `audit_status`: `revise-before-use`
- `decision`: Refresh this brief before execution.
- `reason`: Existing lifecycle brief predates the Brief Audit Record standard and was not fully re-audited in this governance slice; current scope, paths, scorecard mapping, validation lane, Help/Guide impact, and support-surface impact must be checked before use.
- `must_refresh_before_execution_if`: Always refresh before use, and refresh again if AGENTS.md, scorecard categories, verification lanes, route labels, Help/Guide, runbooks, support surfaces, provider facts, or relevant repo paths change.

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
- Business logic correctness and data integrity: deterministic state transitions, invariant validation, idempotent critical mutations, and no silent data corruption paths.
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

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                | Evidence                                 |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Product goals and IA                          | `target`     | PWA release gate defines one repeatable source of truth for install/offline readiness and rollback readiness.   | goal + scope                             |
| UX flow clarity                               | `target`     | QA and release evidence clearly show what must pass online, offline, cache-cleared, and reconnect scenarios.    | acceptance criteria + manual QA          |
| Visual design quality                         | `supporting` | Release gating protects existing install/offline surfaces from visual regressions.                              | quality bar                              |
| Business logic correctness and data integrity | `target`     | Release checklist catches broken install/offline/write-state behavior before merge or release.                  | acceptance criteria + validation         |
| Admin editor ergonomics                       | `N/A`        | N/A                                                                                                             | N/A                                      |
| Accessibility (a11y)                          | `target`     | Accessibility verification is an explicit part of the release gate for changed PWA surfaces.                    | scope + quality bar                      |
| Performance (CWV + payloads)                  | `target`     | Release gate includes performance sanity checks for changed PWA surfaces and avoids hidden regressions.         | quality bar + validation                 |
| Data placement and sync boundaries            | `supporting` | Release gating preserves explicit local-vs-server truth boundaries from the underlying PWA briefs.              | ownership split                          |
| Caching and invalidation strategy             | `supporting` | Cache-clear and offline fallback checks validate the expected cache lifecycle without stale behavior surprises. | required scenario coverage               |
| Reliability and failure handling              | `target`     | Release process explicitly covers offline, cache-miss, reconnect, and write-blocked recovery paths.             | acceptance criteria + required scenarios |
| Security and authz                            | `supporting` | PWA release gate does not weaken existing security or auth boundaries while testing fallback behavior.          | ownership split                          |
| Privacy and compliance                        | `supporting` | Observability hooks and evidence collection stay within existing privacy constraints.                           | out-of-scope + constraints               |
| Content governance                            | `supporting` | QA evidence and runbooks become reproducible documentation instead of chat-only knowledge.                      | quality bar                              |
| Admin workflow and editability                | `N/A`        | N/A                                                                                                             | N/A                                      |
| SEO and crawlability                          | `supporting` | Release checks preserve stable public-route semantics while PWA features harden underneath.                     | scope review                             |
| AI discoverability                            | `N/A`        | N/A                                                                                                             | N/A                                      |
| Analytics and KPI observability               | `target`     | Install/offline/retry outcomes are measurable or explicitly deferred with a recorded reason.                    | acceptance criteria + scope              |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                                             | N/A                                      |
| Incident response and support operations      | `target`     | Release checklist and rollback steps are documented well enough for fast incident response.                     | scope + acceptance criteria              |
| Finance and reporting operations              | `N/A`        | N/A because this release-gate brief does not change billing, payouts, or finance reconciliation.                | explicit scope rationale                 |
| i18n operational readiness                    | `supporting` | QA evidence and release docs preserve room for future locale-specific PWA checks.                               | scope review                             |
| Stack-fit and dependency discipline           | `target`     | Release safety is achieved through current CI/docs/runbook patterns instead of new platform complexity.         | scope + automation contract              |
| Testing and QA automation                     | `target`     | CI and manual QA matrix together catch install/offline regressions before merge.                                | acceptance criteria + validation         |
| Scalability and cost efficiency               | `supporting` | Gate design stays lightweight enough for frequent iteration and avoids expensive redundant QA steps.            | constraints                              |
| DevOps and rollback readiness                 | `target`     | Rollback procedure is executable in minutes and documented before release.                                      | quality bar + scope                      |

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
