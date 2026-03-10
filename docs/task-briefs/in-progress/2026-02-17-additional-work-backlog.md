# Task Brief: Additional Work Backlog

## Metadata

- `id`: `2026-02-17-additional-work-backlog`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-17`
- `updated`: `2026-03-10`

## Purpose

Capture good ideas that should be implemented later without blocking the active delivery slice.

## Queue

| ID       | Title                                                                      | Priority | Status        |
| -------- | -------------------------------------------------------------------------- | -------- | ------------- |
| `AW-002` | Email one-time-code UX hardening (magic link first + OTP fallback clarity) | `medium` | `triaged`     |
| `AW-003` | Sign-in code request reliability + cooldown UX redesign (10/10)            | `high`   | `done`        |
| `AW-004` | Admin Help/Guide center + non-technical operations handbook                | `high`   | `done`        |
| `AW-005` | Contextual admin notes on lesson/drill/product pages                       | `high`   | `done`        |
| `AW-006` | Full cross-platform visual/UX/readability hardening pass                   | `high`   | `planned`     |
| `AW-007` | Login flow UX/state-machine stabilization (success + cooldown continuity)  | `high`   | `done`        |
| `AW-008` | One-click site-lock operations (safe lock on/off workflow)                 | `high`   | `planned`     |
| `AW-009` | Admin email templates and message governance                               | `high`   | `planned`     |
| `AW-010` | PageSpeed/Lighthouse governance for password-gated environments            | `high`   | `planned`     |
| `AW-011` | Terms/Privacy compliance lifecycle and policy ops                          | `high`   | `planned`     |
| `AW-012` | Full admin 10/10 audit brief with checklist and e2e gates                  | `high`   | `planned`     |
| `AW-013` | Full admin content editing UX (modules/lessons/pages/products)             | `high`   | `in-progress` |
| `AW-014` | Workout Builder Garmin-familiar orchestration epic                         | `high`   | `planned`     |
| `AW-015` | Workout data contract and step engine                                      | `high`   | `planned`     |
| `AW-016` | Drill library, templates, and favorites                                    | `high`   | `planned`     |
| `AW-017` | Workout builder + poolside execution UX                                    | `high`   | `planned`     |
| `AW-018` | Program builder calendar + completion tracking                             | `high`   | `planned`     |
| `AW-019` | AI plan generator with JSON guardrails                                     | `high`   | `planned`     |
| `AW-020` | Garmin-ready export adapters + PDF                                         | `high`   | `planned`     |
| `AW-021` | Garmin Training API partner integration                                    | `high`   | `blocked`     |
| `AW-022` | Workout commercial + analytics funnel                                      | `high`   | `planned`     |

## Already delivered (no new brief required)

- Notes `Delete` action is already implemented in both surfaces:
  - `components/admin/AdminNotesManager.tsx`
  - `components/admin/AdminContextNotesPanel.tsx`

## AW-002: Email one-time-code UX hardening

- Problem:
  - OTP copy actions inside email are unreliable across clients.
- Direction (locked):
  - Primary sign-in entry should stay one-tap magic link.
  - OTP remains fallback.
  - If clickable behavior is used in email, prefer deep-link-to-prefill over clipboard assumptions.
  - In-product copy control should use explicit text label (not icon-only).
- Acceptance baseline:
  - Works on mobile + desktop mail clients without relying on blocked clipboard APIs.
  - Clear fallback path when deep-link is unavailable.

## AW-003: Sign-in code request reliability + cooldown UX redesign

- Trigger:
  - User can see expected cooldown once, then a generic error (`Could not send sign-in email right now`) on the next request, which feels inconsistent.
- Goal:
  - Make sign-in request flow resilient and transparent so users understand exactly what happened and what to do next.
- Scope (later implementation):
  - classify auth send failures into explicit UX states (`cooldown`, `provider temporary failure`, `email blocked`, `unknown`),
  - preserve code-entry state after resend failures (avoid jarring reset),
  - show actionable next step copy with retry timing,
  - add stronger analytics + operational logs for OTP send/verify failures,
  - improve visual hierarchy and microcopy on `/auth/sign-in` for 10/10 clarity.
- Acceptance baseline:
  - repeat-request flow is predictable and understandable on first try,
  - cooldown and provider failures are visually distinct,
  - no dead-end state after resend failure,
  - validated on Safari + Chrome desktop and mobile.

## AW-004: Admin Help/Guide center + operations handbook (non-technical)

- Trigger:
  - Admin needs one clear place explaining how app/admin works, integrations, and workflows without technical language.
- Goal:
  - Add a 10/10 Help/Guide experience for admins, with clear onboarding and day-2 operations guidance.
- Direction (locked):
  - dedicated `Help/Guide` entry in admin navigation,
  - plain-language explanations for app structure, connected services, admin features, and expected workflows,
  - maintenance contract: this guide must be updated whenever features/processes change.
- Acceptance baseline:
  - non-technical admin can understand and execute core workflows from guide alone,
  - guide has clear sections (`what`, `why`, `how`, `when`, `troubleshoot`),
  - update responsibility is codified in brief/process docs.
- done briefs:
  - `docs/task-briefs/done/2026-02-21-admin-help-center-and-ops-handbook.md` (merged PR `#90`)
  - `docs/task-briefs/done/2026-03-06-admin-help-guide-pedagogy-and-governance-10-10.md` (merged PR `#139`)

## AW-005: Contextual admin notes on lesson/drill/product pages

- Trigger:
  - Notes created in dashboard should also be usable directly where content is reviewed (lesson/drill/product pages).
- Goal:
  - Let admins capture and edit contextual notes in-place, admin-only, with low-friction UX.
- Direction (locked):
  - note can be linked to content entity (`module`, `lesson`, `drill`, `product`, and route),
  - admin-only note icon/state visible on linked surfaces,
  - collapsible panel at page bottom with inline create/edit/toggle/delete.
- Acceptance baseline:
  - linked notes are discoverable and editable from both dashboard and content surface,
  - notes are hidden for non-admin users,
  - UX supports compact/collapsed mode by default on dense pages.
- owner brief:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md` (completed in phase-6 slice)

## AW-006: Full cross-platform visual/UX/readability hardening

- Trigger:
  - Need systematic 10/10 quality pass for UI/UX/readability across devices, screen sizes, and OS/browser matrix.
- Goal:
  - Close remaining cross-platform UX/design gaps with measurable criteria and regression guardrails.
- Acceptance baseline:
  - no P1 layout/readability issues on required matrix,
  - consistent spacing/type hierarchy/interactions across breakpoints,
  - color/contrast and visual hierarchy stay readable on low/high quality displays,
  - validated through device matrix + visual/e2e checks.
- owner brief:
  - `docs/task-briefs/planned/2026-02-18-cross-platform-ux-design-hardening.md`

## AW-007: Login flow UX/state-machine stabilization

- Trigger:
  - inconsistent success/cooldown behavior after first click and on repeat attempts.
- Goal:
  - make login feedback deterministic and understandable on every attempt.
- Direction (locked):
  - explicit state machine for request lifecycle (`idle/sending/sent/cooldown/error`),
  - countdown visibility and continuity guaranteed across retries/reloads,
  - clear user feedback without contradictory “success + blocked” states.
- Acceptance baseline:
  - same action sequence always yields same UI state and guidance,
  - repeat-click path is predictable and validated on desktop/mobile.
- done brief:
  - `docs/task-briefs/done/2026-02-21-login-flow-ux-hardening-10-10-v2.md` (merged PR `#95`)

## AW-008: One-click site-lock operations (safe lock on/off workflow)

- Trigger:
  - Admin needs fast and safe lock/unlock operations without manual env editing each time.
  - Current Operations card is informational for hard lock by design (env-controlled), which is correct for security but not ideal for day-to-day operations ergonomics.
- Goal:
  - Add a secure one-click operational workflow for `SITE_LOCK_ENABLED` on/off with approval, auditability, deployment verification, and rollback-ready behavior.
- Direction (locked):
  - keep hard lock env-controlled (no direct runtime toggle in app UI),
  - expose controlled operation via GitHub Actions workflow-dispatch,
  - action choices: `lock_on` / `lock_off`,
  - environment choices: `preview` / `production`,
  - production changes require manual approval gate,
  - after change: trigger deploy + run smoke verification:
    - `lock_on` expects redirect to `/preview-access`,
    - `lock_off` expects normal public route access.
- Security and safety baseline:
  - role-restricted execution (repo admins/operators only),
  - strict input allowlist (no freeform env mutation),
  - no secret leakage in logs,
  - explicit run summary: who/when/what/result,
  - emergency rollback path documented (run opposite action or Vercel manual fallback).
- UX baseline (operator/admin):
  - clear wording in workflow inputs (`Lock site now`, `Unlock site now`),
  - plain-language operation summary and status,
  - failure output includes deterministic next step (retry, approve, rollback).
- Observability baseline:
  - workflow artifact/summary includes changed target env, deploy URL, and smoke result,
  - optional analytics/admin event for lock-change operation (no secret data).
- Acceptance baseline:
  - preview lock toggle can be completed in under 2 minutes end-to-end,
  - production lock toggle always requires human approval and leaves audit trail,
  - smoke checks pass for both actions in preview,
  - negative-path tests cover unauthorized/invalid action inputs.
- Planned follow-up brief:
  - `docs/task-briefs/planned/2026-03-10-aw-008-one-click-site-lock-operations-10-10.md`

## AW-009: Admin email templates and message governance

- Trigger:
  - Need editable, controlled email copy for platform messages without code changes for every wording update.
- Goal:
  - Add a safe admin workflow for email templates with preview, validation, and audit trail.
- Direction (locked):
  - central template storage with version history,
  - preview rendering for key templates (auth/contact/operational),
  - strict placeholder validation and fallback defaults,
  - role-gated publish flow (`draft/review/published`) for template changes.
- Acceptance baseline:
  - admin can update template copy safely with preview and rollback,
  - no broken placeholders in sent emails,
  - all template mutations logged and recoverable.
- Planned follow-up brief:
  - `docs/task-briefs/planned/2026-03-10-aw-009-admin-email-templates-and-governance-10-10.md`

## AW-010: PageSpeed/Lighthouse governance for password-gated environments

- Trigger:
  - Need deterministic performance checks even while site lock is enabled.
- Goal:
  - Make 10/10 performance verification repeatable for both gated and public states.
- Direction (locked):
  - define PageSpeed/Lighthouse runbook for locked routes and unlocked routes,
  - run with approved auth/gate context where needed (no secret leakage),
  - record route-level budgets and trend history.
- Acceptance baseline:
  - baseline reports available for core routes in both states,
  - regressions fail agreed gates,
  - runbook clear for manual and CI usage.
- Planned follow-up brief:
  - `docs/task-briefs/planned/2026-03-10-aw-010-pagespeed-lighthouse-governance-gated-environments-10-10.md`

## AW-011: Terms/Privacy compliance lifecycle and policy ops

- Trigger:
  - Need policy text/process to stay aligned with actual app behavior over time.
- Goal:
  - Keep Terms and Privacy accurate, versioned, and easy to maintain as features evolve.
- Direction (locked):
  - define policy ownership and update cadence,
  - add change-log linkage between product changes and policy updates,
  - include pre-merge compliance checklist for data/analytics/auth changes.
- Acceptance baseline:
  - policy pages track real behavior for data collection, auth, and third-party services,
  - policy updates are documented and reviewable,
  - compliance review is part of release flow.

## AW-012: Full admin 10/10 audit brief with checklist and e2e gates

- Trigger:
  - Need one formal audit pass across all admin workflows to close remaining UX/logic/security gaps.
- Goal:
  - Produce a complete admin quality audit with deterministic pass/fail criteria and automated gates.
- Direction (locked):
  - define checklist covering UX, logic correctness, RBAC, error handling, and recoverability,
  - map each admin tab and core workflow to tests (positive + negative paths),
  - produce explicit remediation queue with owners and deadlines.
- Acceptance baseline:
  - every admin critical flow has clear quality score and test evidence,
  - unresolved gaps are tracked as concrete follow-up slices,
  - audit can be rerun on schedule as release gate.

## AW-013: Full admin content editing UX (modules/lessons/pages/products)

- Trigger:
  - Admin needs explicit full-field editing for existing content rows, not only status/revision/delete controls.
- Goal:
  - Deliver a clear and safe editing workflow for all core content entities with 10/10 UX, UI, readability, and navigation.
- Direction (locked):
  - add clear `Edit` entrypoint for existing content and product rows,
  - add type-aware edit fields with validation, dirty-state warning, and save/cancel flow,
  - keep workflow safety (`draft/review/published/archived`) and revision restore intact,
  - improve parent/child navigation cues and ordering labels for large content sets.
- Acceptance baseline:
  - admin can edit and save existing module/lesson/session/drill/page/product records end-to-end,
  - unauthorized edit attempts fail closed (`401/403`),
  - Help/Guide includes plain-language explanation of edit flow and button behavior.
- active brief:
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`

## Recommended Execution Order

1. `AW-006` cross-platform UX/design hardening sweep (ongoing validation track).
2. `AW-008` one-click site-lock operations workflow (before public launch cadence).
3. `AW-012` full admin 10/10 audit with checklist + e2e gates.
4. `AW-009` admin email templates and governance.
5. `AW-011` terms/privacy compliance lifecycle.
6. `AW-010` gated + public performance governance runbook.
7. `AW-013` full admin content editing UX (modules/lessons/pages/products).
8. `AW-018` program builder calendar + completion tracking (after current admin and ops readiness slices).

## 10/10 Cross-Cut Categories (Apply When Relevant)

Apply these when backlog items graduate to dedicated implementation briefs:

- Content governance and source-of-truth
- Taxonomy and category management
- Workflow and publishing safety (`draft/review/published/archived`)
- Business logic correctness and data integrity: deterministic state transitions, invariant validation, idempotent critical mutations, and no silent data corruption paths.
- RBAC and auditability
- UX/UI quality contract (`loading`, `empty`, `error`, `retry`)
- Performance contract
- Testing contract (critical + negative paths, no duplicate tests)
- Observability and KPI tracking
- Migration and rollback readiness
- Definition-of-done quant targets

## Notes

- Backlog items here are intentionally deferred.
- When an item starts implementation, cut a dedicated feature branch and a focused task brief/checkpoint log entry.
  - completed:
    - `AW-003` -> `docs/task-briefs/done/2026-02-18-aw-003-sign-in-cooldown-reliability.md` (merged PR `#42`)
    - `AW-007` -> `docs/task-briefs/done/2026-02-21-login-flow-ux-hardening-10-10-v2.md` (merged PR `#95`)
- PR create/review/merge links should be opened in Safari by default:
  - `open -a Safari "<PR_URL>"`
- Before moving any spawned implementation brief to `done`, run final closeout gate:
  - completion audit,
  - 10/10 quality + security + regression sweep,
  - explicit owner prompt for `move to done` and `post-merge cleanup`.

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.

| Category                                      | Mapping      | Target Threshold                                                                             | Evidence                                          |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Product goals and IA                          | `target`     | Queue keeps explicit priority + status + execution order for every backlog item.             | queue table + recommended execution order         |
| UX flow clarity                               | `supporting` | N/A                                                                                          | N/A                                               |
| Visual design quality                         | `supporting` | N/A                                                                                          | N/A                                               |
| Business logic correctness and data integrity | `supporting` | N/A                                                                                          | N/A                                               |
| Admin editor ergonomics                       | `supporting` | N/A                                                                                          | N/A                                               |
| Accessibility (a11y)                          | `supporting` | N/A                                                                                          | N/A                                               |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                          | N/A                                               |
| Data placement and sync boundaries            | `supporting` | N/A                                                                                          | N/A                                               |
| Caching and invalidation strategy             | `supporting` | N/A                                                                                          | N/A                                               |
| Reliability and failure handling              | `supporting` | N/A                                                                                          | N/A                                               |
| Security and authz                            | `supporting` | N/A                                                                                          | N/A                                               |
| Privacy and compliance                        | `supporting` | N/A                                                                                          | N/A                                               |
| Content governance                            | `target`     | Every `AW-*` item links to current brief lifecycle state (`planned`/`in-progress`/`done`).   | AW item sections + queue status table             |
| Admin workflow and editability                | `supporting` | N/A                                                                                          | N/A                                               |
| SEO and crawlability                          | `supporting` | N/A                                                                                          | N/A                                               |
| AI discoverability                            | `supporting` | N/A                                                                                          | N/A                                               |
| Analytics and KPI observability               | `supporting` | N/A                                                                                          | N/A                                               |
| Commerce and revenue ops                      | `supporting` | N/A                                                                                          | N/A                                               |
| Incident response and support operations      | `supporting` | N/A                                                                                          | N/A                                               |
| Finance and reporting operations              | `supporting` | N/A                                                                                          | N/A                                               |
| i18n operational readiness                    | `supporting` | N/A                                                                                          | N/A                                               |
| Stack-fit and dependency discipline           | `target`     | Backlog maintenance slices remain docs-only unless explicitly scoped as implementation work. | changed-files diff (`docs/*` only for this slice) |
| Testing and QA automation                     | `target`     | Changed backlog brief passes `lint:briefs` and `verify:pre-pr` before PR update.             | local gate outputs + PR checks                    |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                          | N/A                                               |
| DevOps and rollback readiness                 | `supporting` | N/A                                                                                          | N/A                                               |

## Checkpoint Log

- `2026-03-10 | working tree | created dedicated planned implementation brief for AW-010 gated/public performance governance (`docs/task-briefs/planned/2026-03-10-aw-010-pagespeed-lighthouse-governance-gated-environments-10-10.md`) and linked backlog AW-010 entry to canonical brief path | next: run lint:briefs + verify:pre-pr, then open PR`
- `2026-03-10 | working tree | created dedicated planned implementation brief for AW-009 admin email templates governance (`docs/task-briefs/planned/2026-03-10-aw-009-admin-email-templates-and-governance-10-10.md`) and linked backlog AW-009 entry to canonical brief path | next: run lint:briefs + verify:pre-pr, then open PR`
- `2026-03-10 | working tree | created dedicated planned implementation brief for AW-008 one-click site-lock operations (`docs/task-briefs/planned/2026-03-10-aw-008-one-click-site-lock-operations-10-10.md`) and linked backlog AW-008 entry to canonical brief path | next: run lint:briefs + verify:pre-pr, then open PR`
- `2026-03-09 | working tree | backlog status-sync slice: marked AW-007 as done with merged evidence, updated AW-013 active brief path, and refreshed execution order for currently open work | next: run lint:briefs + verify:pre-pr, then open PR`
- `2026-03-09 | working tree | closeout sync slice: marked AW-004 as done and linked both merged Help/Guide briefs (initial delivery + pedagogy/governance hardening) | next: run verify:pre-pr, open PR, run gate:pre-merge`
- `2026-03-09 | working tree | docs link-parity maintenance: replaced missing planned path for AW-008 follow-up brief with explicit TBD note until the brief is created | next: run verify:pre-pr and open PR`

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
