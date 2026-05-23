# Task Brief: AW-006 Dryland / Micro Sessions Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-23-aw-006-dryland-micro-sessions-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-23`
- `updated`: `2026-05-23`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_parent_brief`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-05-23`
- `base`: `main@a77432b`
- `audit_status`: `ready`
- `decision`: Execute this bounded AW-006 UI slice now.
- `reason`: `main` is clean after PR `#816/#817`, post-merge preflight was reported green, and a queue/design/code re-audit found Dryland and Micro Sessions as the smallest remaining route-owned feedback-semantics surface.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, dryland routes/APIs, dryland micro-plan release modes, member-library layout, forward compatibility rules, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make Dryland and Micro Sessions warning, load-error, retry, action-error, action-success, and create-error feedback semantically clear and consistent without changing training behavior or persistence.

## Pre-Implementation Owner Explanation

Jeg skal gjøre tilbakemeldingene i Dryland og Micro Sessions tydeligere når noe laster, feiler, lagres eller må prøves igjen. Det betyr noe fordi brukeren skal skjønne om treningsøkten er lagret, om noe bare synker, og hva som er trygt neste steg. Utenfor scope er treningslogikk, API-er, database, navn/ruter, micro-session timing, bubble-interaksjon og større redesign.

Fremoverkompatibilitet: nye dryland-økter skal automatisk bruke samme generiske feedback-mønster, mens nye workflow-tilstander, release modes eller target types må få eksplisitt mapping og test før release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this slice:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Dryland and Micro Sessions keep the same route purpose and actions while feedback makes the next safe step clearer for save, sync, retry, empty, and error states.             | component diff + screenshot handoff                                    | `5/5`                   |
| UX flow clarity                               | `target`     | Changed feedback states must clearly distinguish schema sync, load retry, mutation error, mutation success, first-run empty, and create failure without dead-end states.       | unit tests + screenshot handoff                                        | `5/5`                   |
| Visual design quality                         | `target`     | Feedback presentation must match existing member-library visual language and avoid broad redesign, nested cards, or layout shifts on mobile/desktop.                           | screenshot handoff + changed CSS review                                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No dryland session, micro-plan, release, local draft, delete, save, completion, skip, undo, or route-refresh payload behavior changes.                                         | targeted unit tests + diff review                                      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes member Dryland/Micro Sessions feedback only; no admin editor, admin CRUD, or operator workflow surface is touched.                              | changed-files review                                                   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | User-action success/pending feedback must be polite status; actionable errors must use alert/assertive semantics where appropriate; static empty states must not be noisy.     | Testing Library role/aria assertions + screenshot handoff              | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: reuse a tiny local component/helper and add no dependencies; `/my-library/dryland` must not gain heavy client logic or media.                                 | bundle-free diff review                                                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical dryland sessions/micro-plans and local draft persistence boundaries must remain unchanged and documented in this brief.                                       | data contract + tests proving payloads still target existing endpoints | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing `router.refresh()` retry and write-through behavior stays unchanged; no route cache or invalidation contract changes.                                | diff review                                                            | `4/5`                   |
| Reliability and failure handling              | `target`     | Recoverable load/schema/mutation failures must keep retry or safe recovery visible and avoid hiding the dryland surface when one sub-feature is unavailable.                   | unit tests for schema/load/action failure feedback                     | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because this slice changes no protected route, authz check, token/cookie handling, request validation, RLS, or access boundary.                                            | changed-files review                                                   | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this slice stores no new user data, secrets, raw env values, analytics payloads, legal copy, or consent behavior.                                                  | changed-files review                                                   | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: existing English product copy is preserved except for feedback presentation semantics; no content source of truth or publish status changes.                  | diff review                                                            | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, editability, support action, or operator-facing mutation is touched.                                                                            | changed-files review                                                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because member-library authenticated UI changes do not alter public metadata, sitemap, robots, canonicals, or crawlable content.                                           | route scope review                                                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public semantic entity surface, structured data, crawl-safe public content, or AI-facing documentation contract.                             | route scope review                                                     | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics taxonomy, payload, event persistence, or dashboard metric.                                                                         | changed-files review                                                   | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no product catalog, Stripe, checkout, entitlement, invoice, refund, or revenue path.                                                            | changed-files review                                                   | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this member UI feedback slice changes no support workflow, alert path, runbook, incident response process, or operator troubleshooting procedure.                         | explicit support-ops scope rationale                                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: no billing, payout, refund, entitlement, finance report, reconciliation, or revenue-recognition data is touched.                                                          | explicit finance scope rationale                                       | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: preserve concise English strings and avoid layout assumptions that make later localization harder; no locale routing or translation workflow exists in scope. | responsive screenshot handoff + diff review                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use React/TypeScript, existing member-library styling, lucide icons already present, and local dryland tests; add no dependency or app-wide primitive.                         | changed-files review + package diff                                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component tests for the changed feedback semantics and run targeted tests before screenshot handoff; full pre-PR gate waits until screenshot approval.             | targeted Vitest + screenshot artifacts                                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the presentation should scale across more sessions/units through mapped components, with no extra network calls or expensive render loops.                    | diff review                                                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Changes must be small, reversible, screenshot-reviewed before broad gates, and require no migration or feature flag rollback plan.                                             | git diff + validation/screenshot handoff                               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: member-local route-owned feedback, especially `GuideSyncStatus`, `CommerceActionFeedback`, and prior AW-006 feedback slices.
  - Keep changes inside dryland client components; no server/client boundary, route handler, action, or cache behavior changes.
- TypeScript/domain contracts:
  - Preserve `DrylandLibrarySnapshot`, `DrylandSessionRecord`, `DrylandMicroPlanRecord`, and existing API response types.
  - Use typed props for any local feedback helper.
- Supabase/data layer:
  - N/A; no migration, RLS, generated DB type, index, storage, or query change.
- External services/tools:
  - N/A; no Stripe, email, analytics, provider SDK, webhook, secret, or deployment setting change.
- UI system:
  - Keep the helper member/dryland-local unless a later brief explicitly promotes a shared member feedback primitive.
  - Preserve responsive layout and use accessible status/alert semantics.
  - Screenshot handoff comparison type: `after-*` runtime state captures, comparing changed Dryland/Micro states against the existing member-library feedback direction from the code/design inventory rather than a separate rendered reference surface.
- Testing:
  - Update focused Testing Library coverage for Dryland builder, Micro Session panel, and create button feedback semantics.
  - Run targeted Vitest before screenshot handoff.

## Data Placement And Sync Contract

- Server-canonical data:
  - `dryland_sessions` and `dryland_micro_plans` remain canonical for saved sessions, micro plans, completion/skip state, release state, and plan edits.
- Local data:
  - Existing local dryland draft persistence remains best-effort only and unchanged.
- Sync policy:
  - Existing explicit save, delete, micro-plan create/edit, block status, release-now, and `router.refresh()` retry behavior stays unchanged.
- Retention and sensitivity:
  - No new storage, retention, personal data, or sensitive diagnostic output.
- Cache/invalidation:
  - Existing route refresh and server snapshot reload behavior stays unchanged.

## Identity And Rename Contract

No identity changes. Existing stable IDs for dryland sessions, micro plans, source sessions, exercises, sets, and blocks remain the canonical identifiers. Titles stay human-readable and renameable through existing flows only. This slice adds no slug, alias, redirect, analytics identity, import/export identity, or rename/repurpose rule.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Dryland session kinds, micro-plan statuses, block statuses, release modes, target types, schema/load states, retry states, and route-owned feedback states.
- Source of truth:
  - Existing typed dryland/micro-plan records and route payloads remain the source of truth.
  - Feedback tone is derived from local UI state (`schemaReady`, `loadError`, `error`, `success`, pending flags) rather than hardcoded row IDs.
- Additive behavior:
  - New dryland sessions, source sessions, and micro units should automatically reuse the same feedback shell for current schema/load/action states.
  - New session rows or larger session lists should not need new feedback markup.
- Explicit mapping requirements:
  - New release modes, block statuses, target types, destructive actions, or recovery workflows require explicit copy/tone/action mapping plus tests before release.
  - A future shared member notice primitive requires its own brief and migration plan.
- Unknown or deprecated values:
  - Unknown values must keep existing safe generic copy or blocked/disabled behavior; do not invent success states from unknown payloads.
  - API failures remain recoverable with visible retry or action guidance.
- Test/evidence:
  - Targeted component tests cover current warning/error/success/empty/create failure semantics.
  - Route/label/support sweep verifies no workflow label, route, Help/Guide, API, or support-surface fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation semantics for existing member feedback only. It does not change workflow labels, action names, recovery procedures, admin support behavior, Help/Guide content contracts, auth, payments, or operator instructions.

## Route / Label / Support Surface Sweep

Required as a targeted dryland/support-surface sweep before PR handoff.

- Terms:
  - `Dryland`
  - `Micro Sessions`
  - `Retry`
  - `still syncing`
  - `Could not create dryland session`
  - `Could not update micro session`
  - `aria-live`
  - `role="alert"`
  - `role="status"`
- Surfaces:
  - `components/my-library/dryland/`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - this brief and AW-006 queue capture
- Expected fallout:
  - update tests and AW-006 queue/design inventory only as needed,
  - no Help/Guide or runbook update expected.

## Scope

- Create or reuse a small dryland-local feedback presentation for:
  - Dryland builder schema warning, load error, action error, and action success,
  - Micro Sessions schema warning, load error, action error, action success, and no-plan empty state,
  - Create manual dryland session error feedback.
- Preserve existing copy unless a minimal semantic label is needed.
- Add focused component tests for roles, live-region semantics, retry/action visibility, and unchanged payload behavior.
- Update AW-006 queue/design docs for the selected active slice.
- Capture screenshot handoff before broad gates.

## Out Of Scope

- Dryland or micro-plan API changes.
- Supabase migrations, RLS, generated DB types, or storage changes.
- Session save/delete, micro-plan create/edit/delete, release-now, pause/resume, completion, skip, undo, bubble/timer, or local draft behavior changes.
- Route, label, Help/Guide, support runbook, analytics, commerce, auth, entitlement, Stripe, or email behavior changes.
- Broad member notice primitive, app-wide design-system primitive, or public visual redesign.

## Acceptance Criteria

1. Dryland builder feedback uses consistent accessible status/alert semantics for schema warning, load error, action error, and action success.
2. Micro Sessions feedback uses the same local presentation for schema warning, load error, action error, action success, and no-plan empty state without hiding saved dryland sessions.
3. Create manual dryland session failure is announced accessibly and keeps the create action recoverable.
4. Existing dryland/micro-plan fetch payloads, route refresh, local draft persistence, completion/skip/undo, and release behavior are unchanged.
5. Targeted unit tests and screenshot handoff prove the changed semantics before `npm run verify:pre-pr`.

## Validation

- `npx vitest run tests/unit/create-manual-dryland-session-button.test.tsx tests/unit/dryland-builder-hub.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx`
- `npm run lint:briefs`
- `npm run lint:quality-gates`
- screenshot handoff before broad gates
- After screenshot approval:
  - `npm run verify:pre-pr`
  - PR checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- If `npm`/`node` is unavailable, bootstrap with:
  - `export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"`
  - `[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`
  - `nvm use --silent`

## Screenshot Handoff Plan

- Required because this slice changes visible member UI feedback.
- Capture against `http://127.0.0.1:3000` with `SITE_LOCK_ENABLED=0`.
- Handoff type: `after-*` runtime state captures; no separate `reference-*` screenshot is required because this is route-owned feedback semantics rather than a rendered parity migration.
- Owner screenshot approval stop: Codex must stop after screenshot handoff and wait for owner approval or explicit waiver before `npm run verify:pre-pr`, PR creation/update, or `npm run verify:pre-merge`.
- Representative screenshots:
  - `/my-library/dryland` schema/load feedback or empty feedback state,
  - `/my-library/dryland?micro=active&view=auto#micro-sessions` micro feedback state,
  - reference member feedback surface if practical.

## Checkpoint Log

- `2026-05-23 | in-progress | started from clean main@a77432b after PR #816/#817; selected Dryland / Micro Sessions Feedback Semantics from queue/design/code re-audit; created active brief with data-boundary and forward-compat contracts | next: implement dryland-local feedback presentation and targeted tests`
- `2026-05-23 | in-progress | implemented dryland-local feedback semantics for builder, micro panel, and create button; targeted Vitest passed for 3 files / 37 tests; quality-gate evidence now intentionally waits at owner screenshot approval stop before broad gates | next: capture screenshot handoff`
- `2026-05-23 | in-progress | captured after-state screenshot handoff in output/dryland-micro-feedback-2026-05-23-114437; capture used local dev with SITE_LOCK_ENABLED=0 and FS_ALLOW_PROD_SUPABASE=1 because .env.local points to Supabase cloud; no temporary dryland session was created; no product-rendering files changed after capture | next: owner screenshot approval stop before npm run verify:pre-pr`
- `2026-05-23 | in-progress | owner rejected create-error visual quality; fixed create action grouping so shared error feedback sits under the full create control group instead of inside one flex child; targeted Vitest passed for 3 files / 38 tests; refreshed screenshots in output/dryland-micro-feedback-2026-05-23-121555 | next: owner screenshot approval stop before npm run verify:pre-pr`
- `2026-05-23 | in-progress | owner approved refreshed screenshot handoff in output/dryland-micro-feedback-2026-05-23-121555 | next: run npm run verify:pre-pr`
