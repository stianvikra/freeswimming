# Task Brief: Quality Gates Calibration And High-Risk Enforcement (10/10)

## Metadata

- `id`: `2026-05-04-quality-gates-calibration-and-high-risk-enforcement-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-04`
- `updated`: `2026-05-04`
- `mode`: `automation-first`

## Goal

Calibrate the systemic quality-gate foundation against recent PR patterns and tighten only deterministic high-risk evidence requirements before more product work builds on it.

## Why This Brief Exists

The V1 quality gate now classifies changed files and requires active-brief evidence. This V2 slice checks the gate against recent real work and closes objective gaps for visual handoff, route/support sweeps, negative paths, commerce reconciliation, and route-level performance evidence without making low-risk docs-only work slow.

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the `10/10` claim gate:

- Visual design quality
- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Performance (CWV + payloads)
- Incident response and support operations
- Finance and reporting operations
- Testing and QA automation
- DevOps and rollback readiness

## Platform 10/10 Scorecard Mapping

| Category                                      | Mapping  | Target Threshold / Scope Rationale                                                                                                      | Evidence Source                                                 | Expected Closeout Score |
| --------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target` | Recent-PR calibration identifies which user/workflow surfaces the gate should protect and where manual judgment remains.                | calibration table + quality-gate report                         | `5/5`                   |
| UX flow clarity                               | `target` | UI/workflow classes require brief evidence for flow states or explicit non-runtime rationale.                                           | policy requirements + unit tests                                | `5/5`                   |
| Visual design quality                         | `target` | UI, print, PDF, export, layout, screenshot, and brand classes require screenshot artifacts plus owner approval stop/comparison naming.  | quality-gate policy matrix + tests                              | `5/5`                   |
| Business logic correctness and data integrity | `target` | API/domain/data classes require invariant, validation, deterministic behavior, or negative-path evidence.                               | targeted unit script tests                                      | `5/5`                   |
| Admin editor ergonomics                       | `target` | Admin/support workflow classes require Help/Guide or route-label-support-surface-impact-sweep evidence when affected.                   | route/support evidence requirements                             | `5/5`                   |
| Accessibility (a11y)                          | `target` | UI classes require keyboard, focus, semantic, responsive, or a11y evidence in the active brief.                                         | quality-gate policy matrix + tests                              | `5/5`                   |
| Performance (CWV + payloads)                  | `target` | Performance-sensitive changes require route-level budget/CWV/payload evidence, not only a generic performance mention.                  | policy requirements + recent performance-governance calibration | `5/5`                   |
| Data placement and sync boundaries            | `target` | Data/schema classes require data placement, migration/RLS, sync, and cache/freshness evidence.                                          | quality-gate policy matrix                                      | `5/5`                   |
| Caching and invalidation strategy             | `target` | Data/read-write classes require cache/invalidation/freshness evidence before merge recommendation.                                      | quality-gate policy matrix                                      | `5/5`                   |
| Reliability and failure handling              | `target` | API/auth/payment/export/high-risk classes require no unexpected 500, failure-mode, or negative-path evidence.                           | unit tests + policy requirements                                | `5/5`                   |
| Security and authz                            | `target` | Auth/API/payment/security classes require fail-closed or unauthorized/forbidden negative-path evidence.                                 | unit tests + quality-gate report                                | `5/5`                   |
| Privacy and compliance                        | `target` | Evidence artifacts and analytics/AI/support requirements must explicitly avoid secrets, PII, and sensitive free-text leakage.           | brief controls + policy requirements                            | `5/5`                   |
| Content governance                            | `target` | Gate docs and runbook define the source of truth for calibration decisions and exception handling.                                      | docs/runbooks/quality-gates-calibration.md                      | `5/5`                   |
| Admin workflow and editability                | `target` | Route/label/support/workflow changes require impact sweep details: identifiers searched, surfaces checked, and fallout handled.         | policy requirements + route sweep evidence                      | `5/5`                   |
| SEO and crawlability                          | `target` | Public route/metadata changes remain classified through route/content/i18n surfaces with evidence requirements.                         | policy matrix                                                   | `5/5`                   |
| AI discoverability                            | `target` | AI/content surfaces remain classified and require semantic/canonical or explicit private-surface rationale when touched.                | policy matrix                                                   | `5/5`                   |
| Analytics and KPI observability               | `target` | Analytics/KPI changes require safe event and no-PII payload evidence.                                                                   | policy matrix                                                   | `5/5`                   |
| Commerce and revenue ops                      | `target` | Commerce/payment/entitlement changes require official integration pattern, negative-path, and reconciliation evidence.                  | policy requirements + unit tests                                | `5/5`                   |
| Incident response and support operations      | `target` | Critical workflow/support/export/payment/auth classes require support diagnostic or runbook evidence; no N/A because policy changes it. | policy requirements + calibration runbook                       | `5/5`                   |
| Finance and reporting operations              | `target` | Finance/reporting/payment classes require reconciliation evidence; no N/A because commerce/finance gate behavior changes.               | policy requirements + tests                                     | `5/5`                   |
| i18n operational readiness                    | `target` | Copy/metadata/help/email changes require i18n or locale-readiness evidence; no N/A because content gate behavior changes.               | policy requirements                                             | `5/5`                   |
| Stack-fit and dependency discipline           | `target` | Implementation uses deterministic repo-local Node script changes, no dependency additions, and existing Vitest coverage.                | diff review + targeted tests                                    | `5/5`                   |
| Testing and QA automation                     | `target` | Unit tests cover stricter high-risk failures and passing evidence; full release gates pass before PR/merge readiness.                   | targeted vitest + `verify:pre-pr` + `verify:pre-merge`          | `5/5`                   |
| Scalability and cost efficiency               | `target` | Performance/cost classes require payload/budget/scale evidence and keep low-risk docs-only work on the fast path.                       | policy requirements + docs-only lane behavior                   | `5/5`                   |
| DevOps and rollback readiness                 | `target` | Gate output labels blocking evidence, remains reversible by reverting the PR, and documents calibration/exception workflow.             | quality-gate report + rollback/devops evidence + runbook        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no runtime UI changes are in scope,
  - UI classes remain policy-only and require reference surface, screenshot artifacts, owner screenshot approval stop, and accessibility/responsive evidence when future UI files change.
- TypeScript/domain contracts:
  - extend the existing deterministic `scripts/quality-gate-evidence.mjs` policy object,
  - keep structured requirement metadata rather than ad hoc output strings,
  - expose blocking evidence in report output for human review.
- Supabase/data layer:
  - no schema, migration, RLS, storage, or generated type changes,
  - data/schema policy must require migration/RLS/cache/negative-path evidence for future data work.
- External services/tools:
  - no Stripe, Resend, Garmin, OpenAI, analytics, or webhook runtime behavior changes,
  - commerce/external-service policy must require official SDK/docs, idempotency/retry, negative-path, support diagnostic, and reconciliation evidence when touched.
- UI system:
  - no visual rendering changes, so screenshot handoff is N/A for this implementation,
  - future UI/print/export classes require screenshot artifact folder, `before/after` or `after/reference` naming, and owner approval stop.
- Testing:
  - update `tests/unit/quality-gate-evidence.test.ts`,
  - run targeted Vitest, quality-gate lint, brief lint, and full pre-PR/pre-merge gates.

## Calibration Review

Recent first-parent sample checked from local `main` history:

| Commit / PR                         | Surface Class                | V2 Decision                                                                             |
| ----------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| `#595` docs closeout                | docs/governance              | keep docs-only fast path                                                                |
| `#594` performance governance       | performance/tooling/docs     | require route-level budget or JS transfer evidence                                      |
| `#593` docs closeout                | docs/governance              | keep docs-only fast path                                                                |
| `#591` quality-gate foundation      | quality policy/tooling/tests | require policy matrix, targeted script tests, rollback/devops evidence                  |
| `#590` docs closeout                | docs/governance              | keep docs-only fast path                                                                |
| `#589` program builder step preview | UI/session-step/domain       | require reference surface, screenshot artifacts, owner approval stop, domain invariants |
| `#588` docs closeout                | docs/governance              | keep docs-only fast path                                                                |
| `#587` export display model         | session-step/domain/export   | require shared contract and deterministic invariant tests                               |
| `fc1381d` program PDF parity        | print/export/session-step    | require actual consumed artifact validation and screenshot approval stop                |
| `#583` docs closeout                | docs/governance              | keep docs-only fast path                                                                |
| `#582` saved quick view             | UI/session-step/domain       | require screenshot artifact naming and shared renderer/reference-surface evidence       |
| `#581` docs closeout                | docs/governance              | keep docs-only fast path                                                                |
| `#580` workout PDF print            | print/export/domain          | require artifact-level validation and actual consumed artifact evidence                 |
| `#579` docs closeout                | docs/governance              | keep docs-only fast path                                                                |
| `#578` session step renderer        | UI/session-step/testing      | require reference contract, a11y/responsive evidence, and targeted tests                |

Calibration outcome: no broad "stram alt" rule. Tighten only deterministic blocking requirements where V1 could pass on a weak keyword: screenshot approval/naming, sweep details, negative paths, reconciliation, route-level performance, and unknown-surface rationale.

## Data Placement And Sync Contract

N/A for runtime product data because this slice changes only docs, a local validation script, and unit tests. Generated quality-gate output must not include secrets, raw `.env` values, personal data, payment records, AI prompt private context, or support free text.

## Identity And Rename Contract

No persisted product entity identity changes are in scope.

Policy identifiers are stable:

- change-class ids remain machine-readable,
- new evidence requirement labels are operator-facing and searchable,
- renaming a requirement requires same-slice script, test, docs, and runbook updates.

## Scope

- `docs/task-briefs/in-progress/2026-05-04-quality-gates-calibration-and-high-risk-enforcement-10-10.md`
- `scripts/quality-gate-evidence.mjs`
- `tests/unit/quality-gate-evidence.test.ts`
- `docs/runbooks/quality-gates-calibration.md`
- related operator docs only if needed by validation.

## Out Of Scope

- Runtime product behavior.
- UI redesign or screenshot capture for this governance slice.
- Supabase migrations, RLS, auth, payments, analytics vendor changes, AI provider behavior, or external service configuration.
- Broad subjective design/product automation.
- Blocking low-risk docs-only closeouts with full UI/API gates.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Recent PR calibration is documented and separates fast-path docs-only work from high-risk runtime/tooling classes.
2. UI/print/layout/brand/export classes require screenshot artifact details and owner approval stop language.
3. Route/label/support classes require impact-sweep details: identifiers searched, surfaces checked, and fallout/follow-up disposition.
4. API/auth/data/payment/commerce classes require negative-path, fail-closed, or reconciliation evidence where relevant.
5. Performance-sensitive changes require route-level budget, CWV, JS transfer, or payload evidence.
6. Unknown non-docs surfaces require explicit classification/stack-fit rationale instead of passing silently.
7. Unit tests cover the stricter failures and a passing high-risk evidence brief.
8. `npm run lint:quality-gates`, `npm run lint:briefs`, targeted unit tests, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- `npm run lint:quality-gates`
- `npx vitest run tests/unit/quality-gate-evidence.test.ts`
- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run verify:pre-pr`
- CI
- `npm run verify:pre-merge`

## Route/Label/Support Surface Impact Sweep

This slice changes a support runbook and quality-gate operator behavior, but no product routes, labels, workflow actions, Help/Guide content, or recovery paths.

- Identifiers searched/calibrated: `quality-gate`, `screenshot handoff`, `owner screenshot approval`, `route-label-support-surface-impact-sweep`, `negative-path`, `route-level`, `JS transfer`, `reconciliation`, `unknown_runtime`.
- Surfaces checked: `scripts/`, `tests/unit/`, `docs/runbooks/`, `docs/quality/`, `docs/task-briefs/`, `docs/testing-strategy.md`, and recent first-parent commit history.
- Fallout handled: policy script, unit tests, active brief, and calibration runbook updated in the same slice.
- Intentional leftovers: subjective product/design sufficiency remains a named human judgment item in gate output.

## Help/Guide And Operator Training Impact

Target scope for operator guidance only. This slice updates a runbook and active brief. User-facing Help/Guide content is N/A because no admin/user workflow label, action, or recovery behavior changes.

## Security, Privacy, And Compliance

- No secrets, tokens, API keys, raw `.env` values, payment data, personal data, support free text, or AI private prompt context may be added to docs, logs, tests, or artifacts.
- Security/API/auth/payment/data policy classes must require fail-closed, unauthorized/forbidden, negative-path, or reconciliation evidence when future changes touch them.
- Host/origin allowlist work remains required to use exact URL parsing and tests, not substring checks.

## Observability And KPI Contract

Quality-gate output must remain deterministic for the same diff and show:

- changed-file classification summary,
- required evidence checklist,
- blocking missing evidence,
- remaining human sufficiency review categories.

No product analytics events are added.

## Manual QA Environments

N/A. This is a docs/tooling/test governance slice with no browser-rendered product behavior.

## Constraints

- Keep the implementation reversible and dependency-free.
- Do not make docs-only closeouts slower.
- Do not use keyword checks as a substitute for human review; the gate should make missing objective evidence visible.
- Avoid overfitting to session-step work while preserving the reference-surface gate for that domain.

## Debugging And Handoff Contract

- For any future visual/screenshot/export false positive, use `docs/runbooks/ui-debug-hypothesis-and-handoff.md` and update `docs/runbooks/quality-gates-calibration.md`.
- For route, label, workflow action, Help/Guide, runbook, recovery-path, or support-surface changes, use `docs/runbooks/route-label-support-surface-impact-sweep.md`.
- If this gate misses a high-risk evidence class or creates repeated noisy false positives, document the calibration decision and either fix the policy or create a follow-up brief.

## Session Continuity And Recovery

- Canonical source of truth: branch `chore/quality-gates-calibration-v2` and this brief.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the checkpoint log.

## Git Rhythm Defaults

- Commit and push after targeted validation and pre-PR verification pass.
- Open/update PR after `npm run verify:pre-pr`.
- Run `npm run verify:pre-merge` and monitor CI before merge-readiness handoff.
- Do not merge without explicit owner approval.

## Automation Mode

Automation-first. Assistant owns implementation, validation, commit, push, PR creation/update, CI monitoring, and pre-merge evidence. Pause only for sandbox approval, missing credentials, or explicit merge approval.

## Branch Hygiene Defaults

After owner-approved merge: sync `main`, run post-merge preflight, delete the merged local/remote branch when safe, and then assess chat handoff.

## PR Browser Rule

Use `npm run pr:create:safari` by default for PR creation/handoff.

## Implementation Checkpoint Log

- `2026-05-04 | working tree | owner approved recommended V2 quality-gates calibration slice; branch created, recent PR sample reviewed, and active brief opened | next: implement policy/test/runbook updates`
- `2026-05-04 | working tree | implemented blocking evidence metadata for high-risk quality-gate requirements, added calibration runbook, and passed targeted validation: lint:quality-gates, targeted Vitest, lint:briefs:all, lint, typecheck, and full unit suite | next: run npm run verify:pre-pr`
- `2026-05-04 | working tree | npm run verify:pre-pr PASS on full lane: branch-current, quality gates, lint/admin/env/pr-body, lint, typecheck, unit, build, perf budgets, and Playwright 107 passed / 349 skipped; perf trend recommended tighten after four weekly green runs, held for separate performance-budget slice to avoid scope creep | next: commit, push, open PR, and run npm run verify:pre-merge`
