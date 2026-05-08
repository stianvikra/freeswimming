# Task Brief: Dryland Focus Text Data Contract Cleanup (10/10)

## Metadata

- `id`: `2026-05-08-dryland-focus-text-data-contract-cleanup-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Goal

Clean up the legacy dryland `focus_text`/`focusText` contract safely after the Dryland builder UI stopped exposing Focus cue.

## Product Decision

`Focus cue` remains valid language for swim/generator/session contexts, but it does not belong in the Dryland quick builder. The dryland UI no longer exposes or writes it, but the database/type contract still contains it for backward compatibility. This brief owns the explicit data decision: preserve, deprecate, migrate, or drop dryland `focus_text` through a safe migration path.

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
| Stack-fit and dependency discipline           | `target`     | Use explicit Supabase migration, generated types, typed normalizers, and tests; add no new dependency.                                        | architecture review + dependency diff                | `5/5`                   |
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
  - inspect real data before drop/migration,
  - use explicit migration if schema changes,
  - update generated DB types,
  - preserve or archive historical values deliberately.
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
  - current `dryland_sessions.focus_text` until this brief explicitly changes it.
- Local-only:
  - no new local data.
- Sync policy:
  - dryland UI must not write new Focus cue values,
  - old API payloads with focus text are either accepted and ignored, accepted as legacy read-only, or rejected with a tested compatibility decision.
- Conflict policy:
  - old clients must not corrupt dryland rows if they send focus text.
- Retention and sensitivity:
  - historical focus text may contain personal training notes and must be handled in export/delete and migration decisions.
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
  - historical rows and exports remain readable or explicitly migrated.
- Observability and repair:
  - unexpected non-null legacy values should be auditable during rollout without leaking content.

## Scope

- Audit dryland `focus_text`/`focusText` readers, writers, tests, exports, DB schema, and generated types.
- Decide preserve/deprecate/migrate/drop for dryland only.
- Preserve swim/session/generator focusText behavior.
- Apply explicit migration if selected.
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

- `npm run lint:briefs`
- targeted dryland domain/API/export tests
- generated type check if schema changes
- migration validation if schema changes
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local test data with at least one historical dryland row containing `focus_text`.
- Vercel preview if any user-facing fallback/export surface changes.

## Help / Guide Impact

Required if export/delete/support guidance changes. Otherwise closeout must explicitly state why Help/Guide is N/A.

## Route / Label / Support Surface Sweep

Run the targeted sweep for `focus_text`, `focusText`, `Focus cue`, `dryland`, `export`, `micro`, `session generator`, and `workouts` before broad verification.

## Checkpoint Log

- `2026-05-08` - Planned after Dryland builder removed Focus cue from UI while keeping DB support for backward compatibility. Next: execute as a separate data-contract cleanup, not inside Micro Sessions V2.
