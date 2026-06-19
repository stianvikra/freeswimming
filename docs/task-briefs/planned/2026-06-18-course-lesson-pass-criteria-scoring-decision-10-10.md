# Task Brief: Course Lesson Pass Criteria Scoring Decision

## Metadata

- `id`: `2026-06-18-course-lesson-pass-criteria-scoring-decision-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-19`
- `execution_mode`: `decision brief; no implementation until owner selects scoring semantics`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@0fbb2cc5`
- `audit_status`: `current-audit-ready-for-owner-decision`
- `decision`: Keep this as a product/data decision child. Recommended default is to keep pass criteria binary for now, and avoid percent/weighted/color scoring until the owner chooses scoring purpose, criterion identity, persistence, fallback, and analytics meaning.
- `reason`: Current code stores course progress as lesson-level `done: boolean` plus optional confirmation time and video seconds. Pass criteria are content text lines and local gate checks, not stable criterion entities with IDs, weights, or server-canonical per-criterion completion. Percent or color scoring would therefore change completion semantics and cannot be treated as visual polish.
- `must_refresh_before_execution_if`: Refresh if lesson progress model, pass-criteria renderer, admin lesson editor, analytics completion events, or course progress tests change.

## Goal

Decide whether pass criteria remain binary checklist items or become weighted/scored criteria, then define the implementation contract if scoring is approved.

## Pre-Implementation Owner Explanation

Dette er ikke bare en visuell endring. Hvis pass criteria får prosent, vekting eller farger, endrer det hva “ferdig” betyr i en leksjon.

Hvorfor det betyr noe: Completion må være forståelig, rettferdig og teknisk stabilt før vi viser prosent eller delvis bestått til brukeren.

Utenfor scope: å implementere scoring, endre progress-tabeller, endre analytics, endre admin editor eller endre public lesson UI før beslutningen er tatt.

Fremoverkompatibilitet: hvis scoring godkjennes, må fremtidige kriterier ha eksplisitt vekt/fallback og ukjente scoringverdier må feile trygt til dagens binære modell eller en tydelig “needs review”-state.

## Source Notes Covered

| Note ID                                | Covered Scope                                                                | Explicit Boundary                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `2832e67b-bb7a-4a71-905d-1be278af606d` | Product decision for pass-criteria percentages, weighting, and color states. | No implementation until owner chooses the scoring model and fallback behavior. |

## Pre-Decision Audit Gate

Before any implementation brief is created from this decision:

1. Reopen this brief, the residual intake, current lesson progress contracts, admin lesson editor pass-criteria fields, and analytics completion logic.
2. Refresh source note `2832e67b` only if live-note access is needed; the note is currently captured and closed as repo-planning evidence, not implemented behavior.
3. Decide whether pass criteria are coaching guidance, a completion gate, a score, or analytics input.
4. Document server-canonical vs derived/local scoring before code or migration work starts.
5. Run `npm run lint:briefs:all` and get owner approval for the selected model.

## Current-State Audit Evidence

Audit date: `2026-06-19` on `main@0fbb2cc5`.

| Surface              | Evidence                                                                                                                                                                                                                                    | Decision Impact                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Progress domain      | `lib/course/progress.ts` defines `CourseProgressRow` as `lessonId`, `done: boolean`, `doneConfirmedAt`, `videoSeconds`, and `updatedAt`. Merge logic uses `done=OR` and max video seconds.                                                  | Existing durable progress is lesson-level binary completion, not per-criterion scoring.                                        |
| Progress API         | `app/api/progress/course/route.ts` reads/writes `course_progress.lesson_id`, `done`, optional `done_confirmed_at`, `video_seconds`, and `updated_at`; unauthorized access returns `401`.                                                    | Persisted scoring would require a new data contract, migration/backfill plan, authz tests, and generated-type review.          |
| Public lesson UI     | `app/course/page.tsx` keeps checked pass criteria in `doneGateChecksByLessonId`, requires every displayed criterion before `Mark as done`, and writes only lesson done state to course progress.                                            | Current criterion checks are a local unlock gate and in-progress signal, not server-canonical mastery records.                 |
| Status helpers       | `lib/course/progress-status.ts` derives `not_started`, `in_progress`, and `done`; `in_progress` means at least one local criterion is checked when the lesson is not done.                                                                  | A percent would be a new derived state, and color states must not silently redefine these three statuses.                      |
| Lesson content model | `app/course/courseData.ts` and admin content parsing treat `passCriteria` as an optional `string[]`; fallback defaults are generated by lesson type.                                                                                        | Criteria have no stable IDs, weights, rename policy, or old/new compatibility identity.                                        |
| Admin editor         | `components/admin/AdminContentManager.tsx` edits pass criteria as newline-separated text under `Ready check`; save writes a string array to lesson body.                                                                                    | Weighted scoring would need an explicit editor model for criterion ID, label, weight, order, and rename-vs-repurpose behavior. |
| Lesson view model    | `lib/course/lesson-experience.ts` maps `masteryCriteria` from `getCourseLessonPassCriteria(lesson)`.                                                                                                                                        | Public rendering can stay data-driven for binary criteria; score metadata would need a typed extension.                        |
| Analytics            | `lib/analytics/course.ts` and `lib/analytics/admin-insights.ts` count `course_lesson_viewed`, `course_lesson_completed`, `course_lesson_continued`, and support clicks by lesson/module/action.                                             | Pass percentage is not currently an analytics value; adding it requires a KPI/privacy/fallback decision.                       |
| Tests                | `tests/e2e/course-pass-criteria-visibility.spec.ts`, `tests/e2e/course-progress-sync.spec.ts`, `tests/unit/course-progress.test.ts`, and admin content tests assert binary done, local checklist unlock, undo, sync, and text-line editing. | Any scoring implementation must update unit/API/e2e coverage rather than only changing copy or color.                          |

## Decision Recommendation

Recommended owner decision: keep the current binary model for this release.

Rationale:

- It matches the current data contract, tests, analytics, and user-facing Ready check behavior.
- It avoids false precision while pass criteria are text lines without stable identity or weights.
- It keeps completion understandable: all criteria checked unlocks `Mark as done`; `Done` means the lesson is complete.
- It leaves room for a later scoring child with a real criterion entity model instead of retrofitting percentages onto free text.

Allowed small follow-up without scoring, if desired:

- A future UI-only child may improve non-color visual states for the existing `not_started`, `in_progress`, `ready_to_complete`, and `done` labels, but it must not show a percent or imply partial completion is durable.

Implementation required before any percent/weighted scoring:

1. Criterion identity contract: stable criterion ID, display label, order, immutable/write-once/renameable fields, and rename vs repurpose policy.
2. Data placement decision: local-only derived score, server-canonical per-criterion progress, or display-only computed score.
3. Migration/backfill: existing text criteria and completed lessons get deterministic fallback.
4. Admin editor model: add/edit/reorder/weight criteria without breaking old text-line lessons.
5. Analytics contract: decide whether score is never tracked, event payload only, or dashboard KPI.
6. Tests: normalization, migration/backfill, unauthorized API paths, UI unlock, undo, analytics fallback, and unknown/deprecated values.

## Decision Options

| Option                     | Recommendation                            | Why                                                                                                                                          |
| -------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep binary criteria       | `recommended for now`                     | Lowest risk and matches current completion, sync, analytics, and tests.                                                                      |
| Equal-weight percent       | `defer`                                   | Would be easy to compute locally, but it implies precision from text lines that have no stable identity or equal-importance decision.        |
| Explicit weighted criteria | `defer until content/data model decision` | More defensible, but requires criterion IDs, weights, admin editor changes, persistence/fallback decisions, and broader tests.               |
| Color-only progress hints  | `allowed only for existing statuses`      | Can help scanning if tied to `not_started`/`in_progress`/`ready_to_complete`/`done`, but must not redefine completion or imply a percentage. |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this decision: Product goals and IA, Business logic correctness and data integrity, Reliability and failure handling, Security and authz, Privacy and compliance, Content governance, Analytics and KPI observability, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Decision names what pass criteria are for: readiness signal, completion gate, coaching feedback, or score.                                       | decision record                   | `5/5`                   |
| UX flow clarity                               | `target`     | Chosen model avoids misleading users about partial completion.                                                                                   | UX rationale + examples           | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: visual treatment is future implementation scope.                                                                                | implementation follow-up criteria | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Decision defines scoring invariant, default weights, migration/backfill, and fallback for missing values before code.                            | data contract                     | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin editing impact is documented if scoring is approved.                                                                      | impact notes                      | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: future color states must have non-color text semantics.                                                                         | follow-up acceptance criteria     | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no runtime change in decision brief.                                                                                            | no-runtime-diff review            | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Decision states whether scoring is derived locally, stored per criterion, or server-canonical progress.                                          | data-boundary decision            | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: cache impact belongs to implementation if approved.                                                                             | follow-up criteria                | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing/unknown scoring values have a deterministic fallback.                                                                                    | fallback contract                 | `5/5`                   |
| Security and authz                            | `target`     | No user can forge completion scoring through client-only state if scoring becomes canonical.                                                     | security requirement              | `5/5`                   |
| Privacy and compliance                        | `target`     | Scoring exposes no private data beyond existing lesson progress.                                                                                 | privacy rationale                 | `5/5`                   |
| Content governance                            | `target`     | Criteria weights/labels have an owner and review path if content model changes.                                                                  | governance decision               | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future admin edit UI must preserve clear criteria editing.                                                                      | follow-up criteria                | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this private decision changes no public route metadata, sitemap, robots, canonicals, or crawl policy.                                | explicit scope rationale          | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: public lesson semantics may be affected only if implementation later changes markup.                                            | follow-up criteria                | `4/5`                   |
| Analytics and KPI observability               | `target`     | Decision states whether pass percentage becomes an analytics/KPI value or remains display-only.                                                  | analytics decision                | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no products, checkout, Stripe, entitlements, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                | explicit commerce scope rationale | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: support implications are documented if completion disputes can occur.                                                           | support note                      | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope rationale  | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: future scoring labels must tolerate locale expansion.                                                                           | follow-up criteria                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Decision prefers existing lesson/progress contracts before adding data structures.                                                               | architecture note                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Approved model must define unit/e2e/migration tests before implementation.                                                                       | test matrix                       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: scoring must not introduce per-event fanout without rationale.                                                                  | follow-up criteria                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Decision defines rollback/no-op behavior before any migration or runtime change.                                                                 | rollback decision                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: no UI implementation in this decision brief.
- TypeScript/domain: decide pass-criteria model before types change.
- Supabase/data: migration/RLS/generated types are future scope if scoring is persisted.
- Analytics: decide whether scoring is an event/KPI before instrumentation.
- Testing: future implementation needs data/model/UI negative paths.

## Data Placement And Sync Contract

- Server-canonical data: current lesson progress remains canonical.
- Local data: current checked criteria remain local unlock/checklist state only.
- Sync policy: current sync saves lesson-level `done`, `done_confirmed_at`, and `video_seconds`; scoring sync is out of scope unless owner chooses a new model.
- Retention/sensitivity: no new sensitive data.
- Cache/invalidation: TBD by implementation if approved.

## Identity And Rename Contract

- Canonical IDs: lesson IDs and criterion identity must be defined before scoring persists.
- Human-readable labels: criteria text is display content, not stable identity unless explicitly decided.
- Mutability rules: changing criterion weights after users complete lessons needs a policy.
- Rename vs repurpose: changed criterion meaning may require new criterion identity.
- Compatibility: existing completed lessons must have a fallback.
- Observability and repair: unknown/missing weights need diagnostics.

## Forward Compatibility Contract

- Extensibility surfaces: criteria, weights, colors, completion states, analytics payloads, locales.
- Source of truth: current source is lesson body `passCriteria: string[]` plus local checklist state; any scored source of truth requires a new owner-approved contract.
- Additive behavior: new text criteria keep working in the binary model automatically.
- Explicit mapping requirements: criterion IDs, weights, score colors, scoring persistence, and analytics metrics require owner decision.
- Unknown/deprecated values: fallback to binary display or `needs review`; never infer a durable percentage from unknown metadata.
- Test/evidence: binary behavior is covered today; scored behavior would need model fixtures, migration/backfill tests, authz tests, and UI/e2e coverage.

## Scope

- Product decision and implementation contract for pass-criteria scoring.

## Out Of Scope

- Runtime implementation.
- UI/color/scoring changes.
- Database migration.
- Analytics event changes.

## Acceptance Criteria

1. Current pass-criteria/progress/admin/analytics contracts are audited against `main@0fbb2cc5`.
2. Owner selects binary, equal-weight, explicit-weight, color-only, or deferred before any implementation.
3. If scoring is approved, data model, fallback, tests, and rollout path are defined before implementation.
4. If deferred, current binary behavior remains canonical.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr` docs-only lane before PR update
- `npm run verify:pre-merge` docs-only lane before merge

## Help / Guide Impact

N/A for decision-only state. Required in any implementation child that changes completion labels, scoring copy, or support behavior.

## Checkpoint Log

- `2026-06-18 | planned | captured live note 2832e67b as a decision brief because percent/color pass criteria affect completion semantics | next: audit current progress model, then owner decides before implementation`
- `2026-06-19 | current-audit | refreshed against clean main@0fbb2cc5 after PR #1164 and closeout PR #1165; audited progress API/domain, public Ready check UI, admin pass-criteria editing, analytics KPI mapping, and tests; recommendation is to keep binary criteria until owner explicitly approves criterion identity, persistence, scoring, fallback, and analytics semantics | next: owner selects binary/defer/scoring model before implementation`
