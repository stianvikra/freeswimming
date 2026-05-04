# Task Brief: Session-Step Export Display-Model Consolidation (10/10)

## Metadata

- `id`: `2026-05-04-session-step-export-display-model-consolidation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-04`
- `updated`: `2026-05-04`
- `mode`: `end-to-end implementation`

## Goal

Consolidate session-step export/display semantics so Workout PDF, Program PDF, saved-workout previews, and future poolside/export surfaces derive step groups, linked rests, repeat rests, and section ordering from one non-React display model instead of parallel local interpreters.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim: `Business logic correctness and data integrity`, `Visual design quality`, `Reliability and failure handling`, `Stack-fit and dependency discipline`, `Testing and QA automation`.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                      | Evidence                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Export and preview surfaces keep one coherent workout-step interpretation across builder, saved previews, Workout PDF, Program PDF, and poolside paths. | contract diff + route/model tests + screenshot handoff | `5/5`                   |
| UX flow clarity                               | `target`     | Swimmers and coaches see the same section/repeat/rest structure across preview and print artifacts without new workflow steps.                          | focused tests + screenshots                            | `5/5`                   |
| Visual design quality                         | `target`     | Standard Workout PDF, Program PDF, saved preview, and poolside note keep approved visual rhythm; any rendered changes are intentional and reviewed.     | after/reference screenshot handoff                     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Shared model preserves workout order, category identity, linked top-level rests, interval rests, post-set rests, standalone rests, and missing data.    | unit tests + route/export assertions                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private owner-facing export/model slice does not change admin CRUD, moderation, or publishing workflows.                               | explicit admin scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: rendered print/preview semantics remain readable, but no new interactive control is introduced.                                        | HTML assertions + screenshot review                    | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, no extra server read, and no route-level fetch expansion; model derivation stays local and deterministic.                            | dependency diff + build/perf gate                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Saved workouts/programs stay server-canonical; consolidated display model is derived, display-only data.                                                | code review + tests                                    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: export/preview cache behavior stays unchanged and reflects existing request-time snapshots.                                            | route review                                           | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty, malformed, rest-only, repeat-only, missing workout, and review-needed exports render deterministic fallback content.                             | negative unit/route tests                              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected route authz is unchanged and covered by existing route tests; no new data access path is introduced.                         | existing + targeted route tests                        | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, logging, sharing destination, or retention behavior.                                                             | data review                                            | `4/5`                   |
| Content governance                            | `target`     | Section labels, compact prescriptions, rest wording, and repeat wording are centralized in shared workout/session-step helpers.                         | contract tests + diff review                           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/user recovery queue, workflow status, or support action changes in this slice.                                                     | explicit workflow scope rationale                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated export/preview surfaces change no public metadata, sitemap, robots, or crawlable route content.                               | explicit SEO scope rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private display-model refactor changes no public AI-discoverable entity, structured data, or crawl-safe content.                       | explicit AI-discovery scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: export action/test IDs remain stable; no new event taxonomy is introduced.                                                             | test-id/event diff review                              | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, subscription, refund, or revenue workflow changes.                                                       | explicit commerce scope rationale                      | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this print/model refactor adds no alerting, incident path, support queue, or customer recovery workflow.                                    | explicit support-ops scope rationale                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no payout, invoice, ledger, entitlement report, refund, or finance reconciliation data changes.                                             | explicit finance scope rationale                       | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: centralized labels reduce future translation drift, but no locale routing/storage or translation layer changes.                        | label centralization review                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use TypeScript domain helpers, existing session/workout contracts, current HTML print stack, and zero new dependencies.                                 | dependency diff + code review                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused model/route/component tests, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge` cover the change.                                  | tests + screenshots + gate evidence                    | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Shared display model removes duplicated export interpretation without adding runtime services, background jobs, or heavy assets.                        | architecture review + diff review                      | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Code/docs-only, no migration, no cache purge; rollback is one PR revert.                                                                                | PR diff + rollback note                                | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: keep `SessionStepSurfaceRenderer` as the shared React renderer for app UI; export/print surfaces use a non-React TypeScript display model and existing route/server boundaries.
- TypeScript/domain contracts: use canonical `SessionDraft` and `SessionDraftStep`; derive read-only `WorkoutStepDisplaySection` data with deterministic fallbacks.
- Supabase/data layer: N/A with rationale: no schema, migration, RLS, auth, storage, or generated DB type changes.
- External services/tools: N/A with rationale: no SDK, webhook, secret, retry, idempotency, or provider behavior changes.
- UI/print system: reference `docs/design/session-step-surface-contract.md`; manual builder `View`, saved Quick View, Workout PDF, and Program PDF are the comparison surfaces. Screenshot handoff type is `after/reference`.
- Testing: update focused unit/route/component assertions for shared display sections, Workout PDF, Program PDF, saved preview, and poolside line parity where the model is consumed.

## Data Placement And Sync Contract

- Server-canonical data: saved workout/program records and canonical `SessionDraft` payloads stay owned by existing APIs.
- Local-only data: none added.
- Sync policy: no new sync; exports/previews derive display-only sections from the current snapshot.
- Retention and sensitivity: no new persistence, logging, analytics payload, or personal-data exposure.
- Cache/invalidation: unchanged; authenticated export routes and library snapshots keep existing request-time behavior.

## Identity And Rename Contract

- Canonical stable IDs: workout IDs, program IDs, step IDs, repeat group IDs, week/day assignment IDs remain unchanged.
- Human-readable identifiers: workout titles, section labels, step names, and print labels remain display-only and renameable.
- Mutability rules: this slice does not mutate persisted entities.
- Rename vs repurpose: N/A for runtime behavior because no entity write path changes.
- Compatibility contract: existing saved drafts, missing workout references, and review-needed states keep deterministic fallbacks.
- Observability and repair: existing route/model errors remain the repair surface; no new telemetry path is introduced.

## Scope

- `lib/workouts/shared.ts`
- existing saved Quick View and Program PDF consumers through shared preview data
- focused tests under `tests/unit/`
- `docs/design/session-step-surface-contract.md`
- screenshot handoff artifacts for export/preview parity

## Out Of Scope

- Poolside note redesign.
- New Garmin adapter payload fields.
- Program calendar UX.
- Training-history/completion state.
- Database schema, RLS, authz, cache, or dependency changes.
- Changing approved copy beyond centralized rest/repeat wording required by the display model.

## Acceptance Criteria

1. A non-React shared display model derives contiguous sections, row text, linked top-level rests, interval rests, post-set rests, standalone rests, and repeat targets from `SessionDraft`.
2. Saved-workout Quick View, Program PDF, and Workout PDF-compatible preview data consume the shared display model rather than local parallel grouping semantics where practical.
3. Poolside note formatting either consumes the shared grouping semantics or documents a narrow formatting-only exception while preserving identical output behavior.
4. Standard Workout PDF, Program PDF, saved preview, and poolside output remain visually stable or have owner-approved screenshot deltas.
5. Existing auth, export fallback, missing-workout, and review-needed behavior remain unchanged.
6. Targeted tests pass before screenshot handoff; screenshot handoff is approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- targeted unit tests:
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/program-export-routes.test.ts`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/session-step-surface-contract.test.ts`
  - `tests/unit/workouts-routes.test.ts`
- screenshot handoff before `verify:pre-pr`
- after owner screenshot approval:
  - `npm run verify:pre-pr`
  - CI
  - `npm run verify:pre-merge`

## Help/Guide And Operator Training Impact

N/A with rationale: this slice changes authenticated preview/export internals and print rendering only; it does not rename workflow actions, support recovery behavior, admin labels, or Help/Guide content contracts.

## Manual QA Environments

- Local URL: `http://127.0.0.1:3000`
- Screenshot comparison type: `after/reference`
- Required representative screenshots:
  - `after-workout-pdf-desktop`
  - `after-program-pdf-desktop`
  - `after-saved-quick-view-desktop`
  - `reference-builder-view-desktop` or `reference-poolside-note-desktop`

## Rollback Plan

Revert this PR. No schema rollback, data repair, cache purge, finance action, or customer communication is required.

## Checkpoint Log

- `2026-05-04 | in-progress | created implementation brief from owner command to implement session-step export display-model consolidation from clean main | next: extract shared display model and migrate focused consumers`
- `2026-05-04 | implementation | added shared WorkoutStepDisplaySection model, migrated summary preview, standard Workout PDF section assembly, and poolside section grouping to the shared display grouping with post-set rest ownership; updated contract docs and focused tests | validation: typecheck PASS, targeted unit PASS 128 tests, lint:briefs:all PASS, scoped eslint PASS | next: capture screenshot handoff before verify:pre-pr`
- `2026-05-04 | screenshot-review | captured clarified after/reference artifacts in /Users/stianvikra/freeswimming/output/session-step-export-display-model-2026-05-04-094938 for Workout PDF, Program PDF, saved Quick View, poolside color/ink-saver notes, and builder View reference | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-04 | pre-pr | owner approved screenshot handoff; npm run verify:pre-pr PASS full lane with 107 Playwright passed / 349 skipped, 872 unit passed, build PASS, perf budgets PASS | perf trend recommended tightening one stretch target after 4 green weeks; hold/defer in this PR because active scope is export display-model consolidation | next: commit, push, open PR, monitor CI`
