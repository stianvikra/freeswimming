# Task Brief: AW-006 My Swim Sessions Saved List Token And Action Parity (10/10)

## Metadata

- `id`: `2026-05-26-aw-006-my-swim-sessions-saved-list-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-26`
- `updated`: `2026-05-26`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-my-swim-sessions-saved-list-token-parity`
- `execution_mode`: `end-to-end implementation through merge after owner screenshot approval and green gates`

## Brief Audit Record

- `last_audited`: `2026-05-26`
- `base`: `main@d28a198`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#864` and repo-managed closeout PR `#865` are merged, `main` is clean at `d28a198`, post-merge preflight was reported green with no pending closeout, and a fresh queue/design/code re-audit found `SavedWorkoutsPanel` still using older one-off card/action styling while `MyLibraryHub`, `TodayTabsPanel`, and the AW-006 token classes are mature references.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/workouts`, `SavedWorkoutsPanel`, `WorkoutBuilderHub`, `MyLibraryHub`, `TodayTabsPanel`, saved-workout action labels, PDF/Poolside preview behavior, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the saved-session list inside `My Swim Sessions` visually align with the current My Library token/action hierarchy while preserving workout data, row actions, delete behavior, quick preview, PDF, and Poolside preview behavior.

## Pre-Implementation Owner Explanation

Vi rydder listen over lagrede svommekter i `My Swim Sessions`, slik at kort, knapper og valg ser mer ut som resten av `My Library`. Det betyr noe fordi brukeren lettere skal forsta hva som apner en okt, hva som viser forhandsvisning, hva som lager PDF/Poolside-visning, og hva som sletter noe. Utenfor scope er selve oktene, sletting, PDF, Poolside, lagring, data, API-er, analytics, Help/Guide og supportflyt.

Forward compatibility: radhandlinger skal fortsatt drives av eksisterende props og data (`hasQuickView`, PDF-href-er, Poolside-href, delete callbacks og selection state). Nye radhandlinger skal kunne bruke samme token/action-klasser, mens nye handlingskategorier eller destruktive varianter krever eksplisitt mapping, test og screenshot-evidence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/workouts` remains the saved swim-session browse surface, with row-scoped Open, Quick View, PDF, Poolside Note, Delete, and bulk-delete actions.                     | focused tests + screenshot handoff           | `5/5`                   |
| UX flow clarity                               | `target`     | Row actions, mobile actions, quick preview, Poolside panel, and delete confirmations remain easy to scan and card-scoped on mobile and desktop.                                  | component tests + screenshots                | `5/5`                   |
| Visual design quality                         | `target`     | Saved-session cards/actions use the My Library token/action language with stable spacing, 8px token radii where applicable, and no unrelated redesign.                           | after/reference screenshots + diff review    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to workout data model, save/delete payloads, recent-workout ordering, quick preview data, PDF links, Poolside preview hrefs, local draft state, or mutation behavior. | changed-files review + targeted tests        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member slice changes no admin editor, admin CRUD, publish workflow, operator queue, or admin action.                                                    | explicit admin-editor scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Existing link/button names, checkbox labels, expanded/collapsed mobile action semantics, and delete confirmation controls remain valid and keyboard reachable.                   | Testing Library assertions + screenshot QA   | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                                               | Testing Library assertions + screenshot QA   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, client state model, route payload, polling, or expensive rendering path beyond markup/class changes.                                   | dependency diff + targeted validation        | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no new local-only data, server-canonical data, browser storage, sync trigger, conflict policy, retention, or sensitive-data movement.          | explicit data-boundary rationale             | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because route dynamic behavior, server snapshot loading, refresh after delete, and existing invalidation behavior remain unchanged.                                          | changed-files review                         | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing delete/bulk-delete pending, cancellation, retry-through-user-action, and success/error feedback behavior remains deterministic.                                         | focused tests + unchanged behavior review    | `5/5`                   |
| Security and authz                            | `target`     | `/my-library/workouts` remains auth-protected; no protected data moves to a public route and no delete/PDF/Poolside authorization path changes.                                  | route/code review + existing e2e coverage    | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, raw IDs, or sensitive diagnostics change.                                      | privacy scope review                         | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected slice without stale active-slice references.                                                 | docs diff + brief lint                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                                          | explicit admin-workflow scope rationale      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/workouts` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, structured data, or crawlable route.      | private-route SEO rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                       | AI-discoverability scope rationale           | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, or KPI definition changes.                                                                             | analytics scope review                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                | commerce scope review                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident alert path, support workflow, operator diagnostic, support runbook, support escalation, or on-call flow.                      | explicit support-ops scope rationale         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement write, or revenue data.          | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing route-owned English labels remain concise and layout-safe; no text-in-layout assumption blocks future localization.                                                     | screenshot text-fit review + component tests | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `MyLibraryHub`/`TodayTabsPanel` token direction and existing `SavedWorkoutsPanel`/`WorkoutBuilderHub`; add no dependency, parallel list component, or broad primitive.     | changed-files/dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Update/keep focused unit/e2e assertions, run targeted validation, brief lint, diff check, and stop at screenshot handoff before `verify:pre-pr`.                                 | test output + screenshot artifacts           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, or traffic-dependent cost.                                                                     | implementation review                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, env change, dependency, workflow, provider setting, or feature flag is needed.                                 | git diff + validation evidence               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/workouts` as the existing authenticated server route and keep `WorkoutBuilderHub` as the client owner for saved-list state.
  - Reuse `SavedWorkoutsPanel` rather than creating a parallel list component.
  - Reuse My Library token/action classes (`fs-library-card`, `fs-cta-primary`, `fs-cta-secondary`, and token variables) where practical.
  - Do not change route redirects, server loaders, cache behavior, or navigation targets.
- TypeScript/domain contracts:
  - Preserve `WorkoutSummary`, `WorkoutLibrarySnapshot`, `WorkoutPoolsideFocusOption`, quick-preview section adaptation, selected-workout state, and delete callbacks.
  - Preserve the session-step display contract from `docs/design/session-step-surface-contract.md`; saved-session Quick View still renders through the existing shared renderer `SessionStepViewSections` and only changes surrounding token/action styling.
  - No parser, validation layer, export contract, or mutation payload changes.
- Supabase/data layer:
  - No migration, RLS/authz, generated type, storage, index, or Supabase query change.
- External services/tools:
  - No Stripe, Supabase provider config, analytics vendor, email provider, SDK, webhook, secret, retry, or idempotency behavior changes.
- UI system:
  - Reference surfaces: `MyLibraryHub` for card/action tokens, `TodayTabsPanel` for member token action hierarchy, and current `SavedWorkoutsPanel` for row-scoped behavior.
  - Screenshot handoff type: `after/reference` for the saved-list desktop and mobile surface against mature My Library token/action references, using a deterministic local harness only if auth-backed local capture is blocked.
- Testing:
  - Preserve focused `workout-builder-hub` assertions around browse mode, quick view, mobile actions, single delete, and bulk delete.
  - Use existing e2e coverage as broader behavior evidence where local auth permits.
  - Confirm session-step reference contract evidence by keeping saved Quick View on the existing shared renderer path and not changing step parsing, grouping, rest semantics, or section view-model output.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/action hierarchy parity slice. It introduces no new local-only data, server-canonical data, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Saved workouts remain server-canonical and route/client state remains transient UI state.

## Identity And Rename Contract

No identity changes. Existing workout IDs remain stable internal identifiers, workout titles remain editable display labels, and route params continue to use existing workout IDs. This slice adds no alias, redirect, analytics identity, import/export identity, or rename/repurpose rule.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - saved-workout row actions,
  - bulk-selection actions,
  - quick-preview panel,
  - Poolside preview action,
  - PDF/open/delete action styling.
- Source of truth:
  - action visibility still derives from existing props and computed booleans (`hasQuickView`, `workoutPdfHref`, `workoutPoolsidePdfHref`, `hasDeleteAction`, `enableBulkDelete`, `bulkSelectionMode`).
  - row identity still derives from `WorkoutSummary.id`.
- Additive behavior:
  - future rows continue to inherit the same card/action hierarchy automatically.
  - existing action kinds can reuse the same primary/secondary/quiet/destructive visual helpers.
- Explicit mapping requirements:
  - a new row action kind, new destructive workflow, new export format, or new bulk operation requires deliberate action-style mapping plus tests and screenshot evidence.
  - a label, route, support recovery, API, export, or analytics behavior change requires a separate scoped brief.
- Unknown or deprecated values:
  - no new unknown value path is introduced; unsupported action combinations remain absent because they are guarded by existing booleans/props.
  - missing PDF/Poolside hrefs continue to hide those actions.
- Test/evidence:
  - focused component tests cover row-scoped actions, mobile actions, quick preview, Poolside panel, and bulk delete.
  - route/label/support sweep includes `SavedWorkoutsPanel`, `My Swim Sessions`, `Quick View`, `Poolside Note`, `Delete selected sessions`, and `/my-library/workouts`.

## Help / Guide Impact

N/A with rationale: this changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, admin instructions, workout data, delete semantics, PDF behavior, or Poolside behavior.

## Route / Label / Support Surface Sweep

Required because a member workflow surface and visible action hierarchy are touched.

- Identifiers to search:
  - `/my-library/workouts`
  - `SavedWorkoutsPanel`
  - `My Swim Sessions`
  - `Quick View`
  - `Poolside Note`
  - `View PDF`
  - `Delete selected sessions`
  - `saved-workout-card`
  - `workout-builder-saved-sessions`
- Surfaces to check:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `components/my-library/workouts/SavedWorkoutsPanel.tsx`,
  - focused `workout-builder-hub` tests,
  - this active brief,
  - canonical AW-006 queue,
  - notice/state inventory,
  - no Help/Guide, support runbook, API contract, analytics taxonomy, Supabase, or route-label fallout unless implementation discovers a direct contradiction.

## Scope

- `components/my-library/workouts/SavedWorkoutsPanel.tsx`
- focused tests for saved-list browse/action behavior
- canonical AW-006 queue and notice/state inventory updates
- after/reference screenshot handoff artifacts

## Out Of Scope

- Workout data model, save/delete payloads, recent-workout ordering, local draft sync, editor step behavior, export artifact payloads, generated filenames, PDF/Poolside/Garmin/handoff behavior, analytics taxonomy, Help/Guide, or support behavior.
- `/my-library/workouts` route auth/server loading behavior.
- `WorkoutEditor`, `PoolsidePreviewPageClient`, PDF routes, export adapters, Supabase, Stripe, commerce, email, admin, or site-lock behavior.
- Broad shared Button/Card/PageShell/Notice primitive rollout.
- Package, dependency, config, workflow, migration, Supabase, or generated-type changes.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/my-library/workouts` keeps the same auth redirect, server loading, browse-mode entry, and saved-workout action behavior.
2. Saved-session cards, action rows, mobile action panels, quick-preview panel, Poolside panel entry, and delete confirmations visually align with My Library token/action hierarchy.
3. Open, Quick View, View PDF, Poolside Note, Delete, selection, and bulk delete remain row-scoped and deterministic.
4. No workout data, API, export, local draft, analytics, Help/Guide, support, Supabase, dependency, or route behavior change is introduced.
5. Canonical AW-006 queue and notice/state inventory record this active slice without stale active references.
6. Targeted tests and screenshot handoff evidence are complete.
7. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/workout-builder-hub.test.tsx` (PASS, 64/64 tests)
- `npm run typecheck` (PASS)
- `npm run lint:briefs:all` (PASS)
- `git diff --check` (PASS)
- targeted route/label/support sweep for My Swim Sessions saved-list identifiers (completed; only expected scoped fallout)
- `npm run verify:pre-pr` (PASS, full lane, including lint/quality gates, typecheck, unit suites, build, performance budget, and Playwright e2e: 101 passed / 487 skipped under existing local auth/environment gates)

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `after/reference` screenshots against `http://127.0.0.1:3000`.
- If auth-backed capture is blocked by local Supabase egress, use a temporary local harness rendering the same production saved-list component with deterministic data, then remove the harness before validation.
- Owner screenshot approval stop: stop after screenshot handoff and wait for owner approval before `npm run verify:pre-pr`, PR creation/update, CI monitoring, or `npm run verify:pre-merge`.

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `after/reference`.
- Required viewports:
  - desktop `/my-library/workouts` saved-list surface,
  - mobile `/my-library/workouts` saved-list surface.
- Artifact folder pattern:
  - `output/aw-006-my-swim-sessions-saved-list-token-parity-YYYY-MM-DD-HHMMSS/`
- Stop after screenshot handoff for owner approval before `npm run verify:pre-pr`.

## Checkpoint Log

- `2026-05-26 | in-progress | started from clean main@d28a198 after PR #864 and repo-managed closeout #865; owner approved My Swim Sessions Saved List Token And Action Parity and requested end-to-end execution stopping at screenshot handoff | next: update queue/inventory, implement saved-list token/action parity, run targeted validation, capture after/reference screenshot handoff, and stop before npm run verify:pre-pr`
- `2026-05-26 | screenshot handoff | implemented saved-list token/action parity in SavedWorkoutsPanel, updated focused unit assertions and AW-006 queue/design inventory, validated with workout-builder-hub vitest, typecheck, lint:briefs:all, git diff --check, and route/label/support sweep; captured after/reference artifacts in output/aw-006-my-swim-sessions-saved-list-token-parity-2026-05-26-190059 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-26 | screenshot approved | owner approved screenshot handoff and authorized merge after tests complete | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge when green`
- `2026-05-26 | pre-pr gate passed | npm run verify:pre-pr passed full lane with branch current on origin/main@d28a198; Playwright completed with 101 passed and 487 skipped under existing local auth/environment gates | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge when green`
