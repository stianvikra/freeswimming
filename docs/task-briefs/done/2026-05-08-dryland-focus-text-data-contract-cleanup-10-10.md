# Task Brief: Dryland Focus Text Data Contract Cleanup (10/10)

## Metadata

- `id`: `2026-05-08-dryland-focus-text-data-contract-cleanup-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-11`

## Goal

Clean up the legacy dryland `focus_text`/`focusText` contract safely after the Dryland builder UI stopped exposing Focus cue.

## Product Decision

`Focus cue` remains valid language for swim/generator/session contexts, but it does not belong in the Dryland quick builder. The dryland UI no longer exposes or writes it, but the database/type contract still contains it for backward compatibility. This brief owns the explicit data decision: preserve, deprecate, migrate, or drop dryland `focus_text` through a safe migration path.

Implementation decision: dryland `focus_text` is `read-only legacy` data for this slice. The app keeps the DB column and generated type so historical rows remain readable, but new dryland create/update payloads no longer write `focus_text`. Old clients may still send `draft.focusText`; the server accepts the draft shape for compatibility and ignores that field on persistence. Authenticated user exports include historical values as `drylandSessions[].legacyFocusText` so users can still access the data without reintroducing Focus cue into dryland authoring.

## Dependencies And Reference Surfaces

- Follow-up created from:
  - `docs/task-briefs/done/2026-05-08-dryland-library-ia-visual-polish-10-10.md`
- Current likely dryland surfaces:
  - `supabase/migrations/20260329102000_dryland_sessions_foundation.sql`
  - `lib/dryland/shared.ts`
  - `lib/dryland/server.ts`
  - `lib/dryland/manual.ts`
  - `tests/unit/dryland-routes.test.ts`
  - `tests/unit/dryland-micro-plans.test.ts`
  - `lib/user/export.ts`
- Non-dryland focus surfaces that must not be broken:
  - swim workouts/session generator files under `lib/workouts/*`, `lib/session-generator-v1/*`, and generator intake.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Security and authz
- Privacy and compliance
- DevOps and rollback readiness
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                            | Evidence                                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Dryland data model matches the product decision: no Focus cue in dryland authoring, while swim/session focus text remains intact.             | route/label sweep + product contract review          | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: dryland UI should stay unchanged/no Focus cue; any fallback display must be explicit and not reintroduce the field.          | UI regression review                                 | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this is a data-contract/schema cleanup and should not redesign visual surfaces.                                                   | explicit scope rationale                             | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Historical dryland rows, exports, micro-plan snapshots, and API payloads remain readable or migrate deterministically without silent loss.    | migration tests + fixture tests + export tests       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor or publishing workflow changes.                                                                                   | explicit scope rationale                             | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no user-facing control or rendered UI behavior should change beyond preventing Focus cue from reappearing.                        | explicit scope rationale                             | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: cleanup should not increase query payloads or route JS.                                                                      | diff/build review                                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The brief explicitly decides whether dryland focus text is deleted, archived, migrated, or read-only legacy, and where historical data lives. | data-boundary decision + migration evidence          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: changed dryland read/write payloads must not create stale client/server assumptions.                                         | route/cache review                                   | `4/5`                   |
| Reliability and failure handling              | `target`     | Old rows and old payload shapes degrade safely; migration failure has rollback and does not break dryland session loading.                    | backwards-compat tests + rollback rehearsal note     | `5/5`                   |
| Security and authz                            | `target`     | Schema/API/export changes preserve owner scoping and do not expose historical focus text across users.                                        | authz route tests + export/privacy review            | `5/5`                   |
| Privacy and compliance                        | `target`     | Historical focus text is treated as personal training note data; export/delete behavior is deliberate and documented.                         | privacy/export/delete review                         | `5/5`                   |
| Content governance                            | `target`     | Dryland field ownership, legacy-read policy, and removal/deprecation timeline are documented so the field does not reappear ad hoc.           | docs/code ownership review                           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, admin CRUD, or operator editability path changes.                                                              | explicit scope rationale                             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because dryland sessions are authenticated/private and no public metadata, sitemap, robots, or crawlable page changes.                    | explicit scope rationale                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this cleanup does not introduce public AI-discoverable content or structured data.                                                | explicit scope rationale                             | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: if diagnostics are added, they must be safe and not treat legacy focus text as analytics payload.                            | log/event payload review                             | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this cleanup does not change pricing, checkout, subscriptions, entitlements, refunds, payouts, or revenue operations.             | explicit scope rationale                             | `N/A`                   |
| Incident response and support operations      | `target`     | Support can identify legacy data/migration issues and advise whether historical dryland focus text was preserved, archived, or removed.       | runbook/support note + migration evidence            | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this data-contract cleanup has no finance, payout, subscription, entitlement, invoice, or reconciliation impact.                  | explicit scope rationale                             | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no user-facing localized copy model or locale routing changes; field cleanup does not alter translation readiness.                | explicit scope rationale                             | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use typed normalizers, existing generated types, explicit no-migration decision, and tests; add no new dependency.                            | architecture review + dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover old/new dryland payloads, exports, migration/backwards compatibility, and non-dryland focusText preservation.                     | targeted unit/API/export tests + verify gates        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: field cleanup should not add scans or runtime transforms on hot read paths.                                                  | query/diff review                                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Any drop/deprecation uses explicit migration, generated types, rollback note, and evidence that old app versions degrade safely.              | migration/rollback evidence + pre-pr/pre-merge gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no UI rebuild is expected,
  - verify dryland UI does not reintroduce Focus cue,
  - do not change swim/generator Focus cue behavior.
- TypeScript/domain contracts:
  - audit `DrylandSessionDraft`, dryland row mapping, manual defaults, export payloads, and tests,
  - decide whether `focusText` remains as read-only legacy or leaves the dryland domain type.
- Supabase/data layer:
  - no schema migration in this slice because historical values are preserved in place,
  - keep `dryland_sessions.focus_text` selected only for legacy reads and account export,
  - use an explicit migration only in a later drop/archive slice with real-data evidence,
  - generated DB types remain valid because the row shape is unchanged.
- External services:
  - none.
- UI system:
  - no visual handoff unless a user-facing dryland fallback or export surface changes.
- Testing:
  - route/domain/export tests for backwards compatibility,
  - migration safety tests or deterministic SQL review,
  - full verification gates.

## Data Placement And Sync Contract

- Server-canonical:
  - current `dryland_sessions.focus_text` remains server-canonical read-only legacy data.
- Local-only:
  - no new local data.
- Sync policy:
  - dryland UI must not write new Focus cue values,
  - old API payloads with focus text are accepted for draft compatibility and ignored on create/update persistence,
  - existing non-null `focus_text` values are preserved during normal dryland updates.
- Conflict policy:
  - old clients must not corrupt dryland rows if they send focus text.
- Retention and sensitivity:
  - historical focus text may contain personal training notes and is included only in authenticated account export as `legacyFocusText`; account deletion continues through auth-user cascade.
- Cache/invalidation:
  - if row shape changes, all dryland reads/writes and generated types must be updated together.

## Identity And Rename Contract

- Canonical stable ID:
  - dryland session id remains the entity identity.
- Human-readable identifiers:
  - title/session labels remain separate from any legacy focus text.
- Mutability rules:
  - `focus_text` is not a dryland identity field.
- Rename vs repurpose policy:
  - removing/deprecating the field must not repurpose it for another meaning.
- Compatibility contract:
  - historical rows remain readable through the existing DB column and account exports include `legacyFocusText`.
- Observability and repair:
  - unexpected non-null legacy values should be auditable through owner-scoped export/support checks without leaking content.

## Scope

- Audit dryland `focus_text`/`focusText` readers, writers, tests, exports, DB schema, and generated types.
- Decide preserve/deprecate/migrate/drop for dryland only. Decision for this slice: preserve as read-only legacy.
- Preserve swim/session/generator focusText behavior.
- Apply explicit migration if selected. No migration selected because the row shape remains intentionally backward-compatible.
- Update docs/tests and support surfaces.

## Out Of Scope

- Swim workout Focus cue cleanup.
- Session generator Focus cue cleanup.
- Visual redesign.
- Micro Sessions V2.
- Training stats/habits.

## Acceptance Criteria

1. Dryland UI still does not expose Focus cue.
2. All dryland focus text readers/writers are audited and documented.
3. Historical dryland values have an explicit preserve/deprecate/migrate/drop decision.
4. Generated DB/types and domain types match the decision.
5. User export/delete behavior is reviewed and updated if needed.
6. Swim/generator/workout focusText behavior is not regressed.
7. Migration and rollback path are explicit if schema changes.
8. Tests cover old and new dryland payload behavior.

## Validation

- `./node_modules/.bin/vitest run tests/unit/dryland-routes.test.ts tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-micro-plan-routes.test.ts tests/unit/user-export-payload.test.ts` - pass (`4` files, `30` tests)
- `npm run typecheck` - pass
- `npm run lint` - pass
- `npm run lint:briefs` - pass; no changed task briefs found because the brief was moved across lifecycle folders
- `npm run lint:briefs:all` - pass (`279` brief files)
- `git diff --check` - pass
- generated type check if schema changes: N/A, no schema shape change
- migration validation if schema changes: N/A, no migration selected
- `npm run verify:pre-pr` - pass full lane after final evidence update (`artifacts/test-runs/20260511-220413/verify.log`; unit `189` files / `1035` tests, build pass, perf budgets pass, Playwright `82` passed / `380` skipped)
- `npm run verify:pre-merge` - pass (`artifacts/verify-pre-merge/20260511-202313.json`; public full lane pass, private-gate regression skipped because `SITE_LOCK_ENABLED!=1`)

## Quality Gate Evidence

- Data decision evidence: dryland `focus_text` is preserved in `dryland_sessions` as read-only legacy data; `buildDrylandInsert` and `buildDrylandUpdate` no longer include `focus_text`, so old `draft.focusText` payloads cannot create new dryland Focus cue writes.
- Backward compatibility evidence: `DRYLAND_SELECT` and `buildDrylandSessionRecord` still read existing `focus_text`, so historical rows can load. Updates omit the field rather than nulling it, preserving existing values.
- Export/privacy evidence: `/api/user/export` now owner-scope reads saved `dryland_sessions` and maps historical values to `drylandSessions[].legacyFocusText`; support/GDPR runbooks and API contract document that this is legacy export data.
- API failure-mode evidence: dryland route tests cover fail-closed `401`, invalid-payload `400`, invalid/missing id paths, and no persistence before validation. `/api/user/export` keeps its existing fail-closed `401` unauthenticated behavior; missing dryland schema normalizes to an empty export slice, while non-schema query failures return the existing controlled `500` response without raw details, so there is no unexpected 500 for compatibility or old-client focus payloads.
- Micro-plan evidence: micro-plan block generation continues to use exercise titles, notes, how-to, target areas, and set targets; targeted tests assert draft-level dryland focus text is not copied into micro blocks.
- Non-dryland focus evidence: swim workout and session-generator `focusText` contracts are out of scope and unchanged.
- Migration/rollback evidence: no schema migration, generated DB type change, or data backfill is required. Rollback is a normal code/docs revert; historical `focus_text` rows are not modified.
- Performance ratchet evidence: perf budgets passed and reported `5` consecutive weekly green runs with a tighten recommendation; decision is `hold` for this data-contract PR and defer budget tightening to a dedicated performance-governance slice.
- Print/export/screenshot evidence: this is a JSON account export contract, not a rendered UI, PDF, image, or screenshot artifact. Artifact-level validation uses the actual consumed artifact shape from `buildUserExportPayload`; high-cost export debug path reviewed against `docs/runbooks/ui-debug-hypothesis-and-handoff.md`, with no browser rendering or downloaded visual artifact to inspect.
- Owner visual approval stop evidence: screenshot approval stop / owner visual approval stop is N/A because there is no user-facing visual, print, layout, brand, image, PDF, or browser-rendered export change in this slice.
- Route/label/support sweep evidence: identifiers searched include `focus_text`, `focusText`, `Focus cue`, `dryland`, `export`, `micro`, `session generator`, and `workouts`; surfaces checked include `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/architecture/`, `supabase/`, and task briefs. Fallout handled in dryland server code, export payload, tests, API contract, support runbook, GDPR runbook, and data-access registry.

## Manual QA Environments

- Local test data with at least one historical dryland row containing `focus_text`.
- Vercel preview if any user-facing fallback/export surface changes.

## Help / Guide Impact

Required because export/support guidance changed. Updated `docs/runbooks/auth-account-support.md`, `docs/runbooks/gdpr-data-rights.md`, `docs/api-contracts.md`, and `docs/architecture/data-access-authz-cache-contract-registry.md`. No Admin Help/Guide UI content changed.

## Route / Label / Support Surface Sweep

Run the targeted sweep for `focus_text`, `focusText`, `Focus cue`, `dryland`, `export`, `micro`, `session generator`, and `workouts` before broad verification.

## Checkpoint Log

- `2026-05-08` - Planned after Dryland builder removed Focus cue from UI while keeping DB support for backward compatibility. Next: execute as a separate data-contract cleanup, not inside Micro Sessions V2.
- `2026-05-11 | in-progress | branch dryland-focus-text-data-contract-cleanup-2026-05-11 created from clean main cb4e802 after PR #680 and closeout PR #681 landed; owner approved executing the planned data-contract cleanup before habits findings | next: audit dryland focus_text/focusText readers, writers, exports, DB contract, and non-dryland focus surfaces before selecting preserve/deprecate/migrate/drop behavior`
- `2026-05-11 | in-progress | implemented read-only legacy focus contract: dryland create/update ignores draft focusText and preserves existing focus_text values, account export includes drylandSessions[].legacyFocusText, support/API/GDPR/data-access docs document the legacy policy, and targeted dryland/export tests, typecheck, lint, lint:briefs:all, and diff check pass; first npm run verify:pre-pr failed at quality-gate evidence because API failure-mode and export/screenshot rationale keywords were not explicit enough in the brief, then the missing evidence was added | next: rerun npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-11 | pre-pr-ready | npm run verify:pre-pr passed full lane at artifacts/test-runs/20260511-215800/verify.log with quality gates, lint, typecheck, unit, build, perf budgets, and Playwright E2E; perf ratchet recommendation recorded as hold because this slice is scoped to dryland data-contract cleanup | next: rerun pre-pr after this evidence update, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-11 | pre-pr-ready | final npm run verify:pre-pr rerun after the evidence update passed full lane at artifacts/test-runs/20260511-220413/verify.log; no product/rendering files changed after this validation, only this checkpoint now records the final evidence path | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-11 | done | PR #682 merged to main at 6609380 after green CI and npm run verify:pre-merge passed at artifacts/verify-pre-merge/20260511-202313.json; repo-managed post-merge closeout moved this brief to done | next: rerun post-merge preflight after closeout merge`
