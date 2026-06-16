# Task Brief: Course Lesson Legacy Field Cleanup And Migration V1 (10/10)

## Metadata

- `id`: `2026-06-14-course-lesson-legacy-field-cleanup-and-migration-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-14`
- `updated`: `2026-06-16`
- `parent_brief`: [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- `source_brief`: [Course Lesson Admin/Public Field Parity And View Changes V1](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-14-course-lesson-admin-public-field-parity-and-view-changes-v1-10-10.md)
- `execution_mode`: `implementation`
- `branch`: `task/course-lesson-legacy-field-cleanup-v1`

## Brief Audit Record

- `last_audited`: `2026-06-16`
- `base`: clean synced `main@b48a7712` with unrelated untracked local `Ja.docx` intentionally left untouched; execution branch `task/course-lesson-legacy-field-cleanup-v1`.
- `audit_status`: `ready`
- `decision`: Execute this as the next bounded course/data cleanup child after PR `#1140` and closeout PR `#1141`; inventory legacy course lesson body fields first, then keep, migrate, or remove only with deterministic fixture evidence.
- `reason`: Recent course lesson work stabilized the public/admin structured `lessonExperience` flow, but legacy fallback keys still need an explicit decision so future lesson authoring is not coupled to hidden old body shapes.
- `must_refresh_before_execution_if`: Refresh before execution if course content rows, `app/course/courseData.ts`, `lib/course/lesson-experience.ts`, `lib/admin/content-course.ts`, `components/admin/AdminContentManager.tsx`, admin content migrations, public course tests, scorecard categories, or owner content-production status change.

## Codex Skill + Stack Readiness Radar

Skill/capability audit:

- Available now: repo runbooks, current TypeScript/Vitest/Playwright tooling, `playwright` skill if visible admin/public screenshots become necessary.
- Evaluate later: `imagegen` is not needed; Stripe plugin skills are not needed because this slice changes no pricing, checkout, entitlement, invoice, payout, or revenue behavior.
- Install/config changes: none.

Systemic findings:

| Surface                           | Finding                                                                                                                          | Severity | Recommended Type                 | Owner Decision Needed                                      | Follow-Up Brief Path                                                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Course lesson body contract       | Legacy and structured lesson fields can coexist, but cleanup must prove every fallback branch is still needed or safe to remove. | `high`   | `bounded implementation child`   | `no`, owner executed this named brief on `2026-06-16`.     | this brief                                                                                                                                                |
| Admin/public field parity         | The prior admin/public parity child is done; this slice must not reopen broad UI redesign or lesson-production scope.            | `medium` | `do not do`                      | `no`, keep scope to field contract and tests.              | [done source brief](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-14-course-lesson-admin-public-field-parity-and-view-changes-v1-10-10.md) |
| Database migration/write behavior | A live data rewrite should happen only if local fixture evidence proves the mapper cannot safely preserve content.               | `high`   | `deferred architecture decision` | `yes` only if the audit discovers a required live rewrite. | `TBD only if migration becomes necessary`                                                                                                                 |

Return path:

- Parent: [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md).
- Last merged workstream: PR `#1140` `Polish course metadata and lesson cards`, closeout PR `#1141`.
- Current selected child: this in-progress legacy field cleanup branch.
- Next planning step after closeout: choose the next course child only after this cleanup is merged and post-merge preflight/chat-handoff are complete.

## Goal

Decide, migrate, and remove or retain legacy course lesson fields deliberately, with tests and rollback evidence, instead of deleting old JSON keys opportunistically during admin UI work.

## Pre-Implementation Owner Explanation

Denne slicen skal senere rydde i gamle leksjonsfelter pa en kontrollert mate. Det betyr at vi forst kartlegger hvilke gamle keys som fortsatt leses av public-siden eller finnes i seed/draft-innhold, flytter innhold som skal bevares til den nye strukturen, og fjerner bare det som er bevist trygt a fjerne. Dette er viktig fordi selv uten brukere kan draft/seed-innhold og public fallback-kode fortsatt vaere avhengig av gamle felter. Utenfor scope for den aktive admin parity-slicen er sletting av datakontrakt, migrering av eksisterende innhold og fjerning av public fallback-lesing.

Forward-compatibility-intent: nye leksjonsfelt skal enten ligge i den strukturerte `lessonExperience`-kontrakten med admin/public mapping, eller ha en eksplisitt fallback/migreringsbeslutning for ukjente og eldre keys.

## Cleanup Decision To Preserve From Source Slice

- Do not delete legacy course lesson JSON keys in `Course Lesson Admin/Public Field Parity And View Changes V1`.
- Current admin simplification may hide confusing legacy visibility controls from the UI.
- Current structured section visibility belongs on each relevant section as `Show section`.
- Existing public fallback reads and old keys must remain pass-through until this cleanup brief runs.
- A future cleanup must prove whether there are no user-facing, draft, seed, preview, analytics, notes, QR, or admin workflows still depending on the legacy fields.

## Legacy Field Inventory To Audit

| Field / surface                       | Current role                          | Initial cleanup stance                                                         |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| `body.displayGoal`                    | Legacy public fallback visibility     | Audit usage, then remove or migrate only with tests.                           |
| `body.displayCues`                    | Legacy cues visibility                | Audit usage, then remove or migrate only with tests.                           |
| `body.displayCommonMistakes`          | Legacy mistakes visibility            | Audit usage, then remove or migrate only with tests.                           |
| `body.displayDrill`                   | Legacy drill visibility               | Audit usage, then remove or migrate only with tests.                           |
| `body.displayCheckpoint`              | Legacy checkpoint/pass visibility     | Audit usage, then remove or migrate only with tests.                           |
| `body.displayNextStep`                | Legacy next-step visibility           | Audit usage, then remove or migrate only with tests.                           |
| `body.displaySupport`                 | Legacy support visibility             | Audit usage, then remove or migrate only with tests.                           |
| `body.cues[]`                         | Legacy fallback source for feel cues  | Migrate to `body.lessonExperience.feelCues[]` if still needed.                 |
| `body.commonMistakes[]`               | Legacy mistake-only fallback          | Migrate to paired `body.lessonExperience.commonMistakes[]` where possible.     |
| `body.drillTitle` / `body.drillSteps` | Legacy water-practice fallback        | Migrate to `body.lessonExperience.waterPractice.*` where possible.             |
| `body.nextStep`                       | Legacy next-step fallback             | Migrate to `body.lessonExperience.nextStep` where possible.                    |
| Support action booleans               | Support-card action fallback controls | Decide whether these remain active support configuration or become legacy.     |
| Public fallback renderer branches     | Read-through for old body shapes      | Remove only after fixture/migration proves structured data covers active rows. |

## Legacy Field Cleanup Decision

Decision after implementation audit on `2026-06-16`: do not run a live database rewrite in this slice. Instead, normalize legacy body fields into a structured `lessonExperience` read model at the TypeScript mapper boundary, then let explicitly authored `body.lessonExperience` fields override legacy-derived values while carrying safe fallback branches for missing nested fields.

| Field / surface                       | Decision             | Rationale / Evidence                                                                                                                   |
| ------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `body.displayGoal`                    | `retain active`      | Still controls whether the public Goal block appears; there is no one-to-one structured replacement without changing visible behavior. |
| `body.displayCues`                    | `normalize + retain` | Normalized to `lessonExperience.display.feelCues` for read-model parity; retained for current public section gating.                   |
| `body.displayCommonMistakes`          | `normalize + retain` | Normalized to `lessonExperience.display.commonMistakes`; retained for current public section gating.                                   |
| `body.displayDrill`                   | `normalize + retain` | `false` normalizes to both `landPractice: false` and `waterPractice: false`; retained as public practice-section gate.                 |
| `body.displayCheckpoint`              | `retain active`      | Still controls pass-criteria visibility and done-gate UI; no structured lessonExperience equivalent in this slice.                     |
| `body.displayNextStep`                | `normalize + retain` | Normalized to `lessonExperience.display.nextStep`; retained for current public next-step gating.                                       |
| `body.displaySupport`                 | `normalize + retain` | Normalized to `lessonExperience.display.support`; retained for current extra-help gating.                                              |
| `body.cues[]`                         | `normalize + retain` | Normalized to `lessonExperience.feelCues`; retained as technical fallback/admin recovery field.                                        |
| `body.commonMistakes[]`               | `normalize + retain` | Normalized to `lessonExperience.commonMistakes`; authored structured mistake/fix rows override it.                                     |
| `body.drillTitle` / `body.drillSteps` | `normalize + retain` | Normalized to `lessonExperience.waterPractice`; authored structured title can override while legacy steps remain fallback.             |
| `body.nextStep`                       | `normalize + retain` | Normalized to `lessonExperience.nextStep`; authored structured next step overrides it.                                                 |
| Support action booleans               | `retain active`      | `supportCard.actions`, `supportCard.primaryAction`, and support start lesson are active extra-help routing/config, not obsolete data.  |
| Public fallback renderer branches     | `consolidated`       | Legacy field reads now flow through `resolveCourseLessonExperience` / `buildCourseLessonExperienceFromLegacyLessonFields`.             |

No field is hard-deleted in this slice because static course rows, draft/admin rows, and public display gates still depend on these keys. The cleanup outcome is a safer read-model contract with deterministic fixture evidence, not a destructive data migration.

## Implementation Evidence

- Added `buildCourseLessonExperienceFromLegacyLessonFields` and `resolveCourseLessonExperience` in `lib/course/lesson-experience.ts`.
- `buildCourseLessonExperienceViewModel` now consumes the resolved structured contract instead of reading each legacy fallback branch ad hoc.
- `toPublishedCourseModules` now stores the resolved lesson experience on mapped course lessons, so DB rows without `body.lessonExperience` still expose a canonical structured read model.
- Added old-shape and mixed-shape unit fixtures:
  - `tests/unit/course-lesson-experience.test.ts` covers legacy normalization and structured-over-legacy merge behavior.
  - `tests/unit/admin-content-course.test.ts` covers DB read-model normalization without a database rewrite and authored structured fields winning while missing nested branches fall back.
- Focused validation: `./node_modules/.bin/vitest run tests/unit/course-lesson-experience.test.ts tests/unit/admin-content-course.test.ts` passed with `19` tests on `2026-06-16`.
- First `npm run verify:pre-pr` attempt found one concept-lesson cue rendering regression in `tests/e2e/course-lesson-experience.spec.ts`; fixed by keeping structured `lessonExperience.feelCues` separate from the legacy `primaryCue` fallback.
- Regression validation: `npx playwright test tests/e2e/course-lesson-experience.spec.ts --project=desktop-chromium` passed with `3` tests on `2026-06-16`.
- Pre-PR validation: `npm run verify:pre-pr` passed on `2026-06-16` with full lane, including `247` unit files, production build, performance budgets, and `110` E2E passed / `568` skipped.
- Performance budget note: the gate recommended tightening one stretch target after `10` consecutive weekly green runs with `18.4%` margin; this PR records the signal but intentionally does not change budgets because the active scope is course lesson data cleanup.

## Rollback And Recovery Note

- No live database rewrite is included in this slice; rollback is a normal code revert of the mapper/read-model change.
- If an older lesson row renders missing public lesson copy after deployment, diagnose by checking the row body for legacy `display*`, `cues`, `commonMistakes`, `drill*`, and `nextStep` fields, then confirm `resolveCourseLessonExperience` maps them into the structured read model.
- Unknown legacy keys remain pass-through and are not deleted by this slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the scoped 10/10 claim gate:

- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                 | Evidence                                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Cleanup leaves one understandable lesson field model without breaking course authoring, preview, or public lesson IA.              | inventory + diff review + screenshot only if UI changes                | `5/5`                   |
| UX flow clarity                               | `supporting` | Any removed admin fallback fields must reduce confusion and keep clear recovery copy if older data is detected.                    | admin QA / Help update if UI changes                                   | `4/5`                   |
| Visual design quality                         | `supporting` | No new visual surface is required unless admin fallback UI changes; if it changes, use existing admin tokens.                      | screenshot handoff if UI changes, otherwise explicit N/A-in-scope note | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Every legacy field is inventoried, migrated, retained, or explicitly removed with deterministic tests and no silent content loss.  | migration tests + mapper fixtures + before/after data audit            | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin no longer exposes obsolete controls after cleanup, or labels retained controls as active structured fields.                  | admin component tests + Help/Guide assertions                          | `5/5`                   |
| Accessibility (a11y)                          | `supporting` | Any changed admin fields keep accessible labels, fieldsets, and keyboard operation.                                                | Testing Library / Playwright if UI changes                             | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Removing fallback branches must not add public `/course` payload or server work.                                                   | build/package diff + route review                                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical JSON body migration path is explicit; no local-only or hidden fallback truth remains.                             | data contract + migration dry-run evidence                             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Public/admin cache behavior after migrated content remains predictable; no stale mixed legacy/structured read path.                | route/cache review + preview/public fixture tests                      | `5/5`                   |
| Reliability and failure handling              | `target`     | Unknown old rows fail safely with documented fallback or clear admin repair state, not broken public rendering.                    | negative-path fixtures + admin repair test if needed                   | `5/5`                   |
| Security and authz                            | `target`     | Any migration/admin repair route remains admin-only/fail-closed and does not expose private draft data.                            | authz tests / no-new-route rationale                                   | `5/5`                   |
| Privacy and compliance                        | `supporting` | No personal data or secrets are introduced; migration logs avoid raw sensitive payloads.                                           | diff review + log review                                               | `4/5`                   |
| Content governance                            | `target`     | Single source-of-truth decision is recorded for each legacy key, including owner, rollback, and future field policy.               | decision table + brief closeout                                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Active lesson content remains editable after cleanup; removed fields have a documented replacement or migration.                   | admin save/edit tests                                                  | `5/5`                   |
| SEO and crawlability                          | `supporting` | Public semantic lesson sections remain stable after fallback cleanup.                                                              | public route snapshot / route review                                   | `4/5`                   |
| AI discoverability                            | `supporting` | Public lesson content keeps clear structured sections; cleanup does not remove meaningful public copy.                             | public fixture review                                                  | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Runtime lesson/module IDs and progress/analytics identifiers remain unchanged.                                                     | no-event-change review / analytics fixture if touched                  | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because cleanup changes no checkout, entitlement, pricing, revenue, refund, invoice, payout, or reporting behavior.            | explicit commerce scope rationale                                      | `N/A`                   |
| Incident response and support operations      | `target`     | Help/Guide or runbook states how to diagnose older rows and recover if a migrated lesson loses public copy.                        | Help/Guide/runbook update + rollback note                              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, revenue, payout, refund, tax, invoice, entitlement reconciliation, or reporting data changes are in scope. | explicit finance scope rationale                                       | `N/A`                   |
| i18n operational readiness                    | `supporting` | Cleanup should make future locale mapping simpler by keeping one canonical structured lesson field model.                          | mapping decision table                                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing TypeScript mappers, admin content APIs, Supabase migration patterns if needed, and tests; add no dependency.          | package diff + code review                                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Include inventory tests, migration/mapper fixtures, admin save tests if UI changes, and verify gates.                              | targeted tests + `verify:pre-pr` + CI                                  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | New lesson fields should not require duplicate legacy branches after cleanup; unknown future keys fail safely.                     | forward-compat test + decision table                                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Any migration/removal has a rollback path, data backup/export evidence, and staged deploy order.                                   | rollback plan + migration dry-run + PR notes                           | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse public `/course` lesson rendering and `components/admin/AdminContentManager.tsx` only where cleanup affects visible fields.
  - Do not introduce a second lesson display contract.
- TypeScript/domain contracts:
  - Use `CourseLesson`, `CourseLessonExperience`, and `buildCourseLessonExperienceViewModel` as the canonical contract surfaces.
  - Add typed fixtures for old body shapes, migrated body shapes, and unknown keys.
- Supabase/data layer:
  - If database changes are needed, use explicit migrations and dry-run/data-backup evidence.
  - Keep admin-only mutation/repair paths fail-closed.
- External services/tools:
  - No new providers, SDKs, media services, analytics vendors, or secrets.
- UI system:
  - UI changes are optional; if admin fallback fields are removed or repair UI is added, use existing admin form primitives and screenshot handoff.
- Testing:
  - Unit/mapper tests for each legacy field path.
  - Migration or data-normalization tests if data is rewritten.
  - Admin component/API tests if editability changes.
  - Public route fixture tests for old, migrated, and unknown body shapes.

## Data Placement And Sync Contract

- Server-canonical:
  - Course lesson row body JSON and row metadata remain the only source of truth for authored lesson content.
- Local-only:
  - Admin form draft state and any temporary migration preview UI state.
- Sync policy:
  - If migration writes data, it must be idempotent and safe to re-run or explicitly one-way with rollback backup.
  - Public preview must read the same canonical content shape as the published route after migration.
- Retention and sensitivity:
  - No personal data should be introduced.
  - Migration logs must avoid dumping full raw content payloads unless stored in a protected admin-only artifact.
- Cache/invalidation:
  - Preserve existing admin/public invalidation behavior.
  - After migration, invalidate or refresh any cached public course data using the existing project pattern.

## Identity And Rename Contract

- Canonical stable ID:
  - Lesson runtime IDs remain immutable and must not be regenerated during cleanup.
- Human-readable identifiers:
  - Slugs/titles may not be changed unless a content owner explicitly chooses that separately.
- Mutability rules:
  - Legacy field cleanup may rewrite lesson body structure for the same lesson only when the learning object is unchanged.
- Rename vs repurpose:
  - Converting fallback fields into structured fields is an in-place migration.
  - A materially different lesson must be created as a new lesson, not repurposed during cleanup.
- Compatibility:
  - Any removed legacy read path must have either migrated data coverage or a documented unsupported-old-shape decision.
- Observability and repair:
  - Add an audit output or test fixture showing which legacy fields remain, were migrated, or were removed.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Course lesson body fields, `lessonExperience`, public section labels, admin controls, legacy fallbacks, preview routes, Help/Guide recovery copy, and future locale mapping.
- Source of truth:
  - Structured `lessonExperience` and current row metadata should be the target canonical model after cleanup unless this brief discovers a better explicit contract.
- Additive behavior:
  - New fields that match existing public sections should be added only once in the structured contract and then mapped into admin/public parity tests.
- Explicit mapping requirements:
  - New public sections, media providers, support actions, analytics events, locale fields, or canonical route identifiers require explicit mapping and tests before release.
- Unknown or deprecated values:
  - Unknown keys must pass through safely until a cleanup decision removes them.
  - Deprecated values must not render broken public copy.
- Test/evidence:
  - Include old-shape, migrated-shape, and unknown-key fixtures.
  - Include a decision table that proves cleanup is not hardcoded only to today's visible sample lessons.

## Help / Guide Impact

Required if cleanup changes admin labels, removed fields, repair flow, preview behavior, or recovery guidance.

If cleanup is internal-only and no admin workflow changes, record explicit `N/A` rationale in closeout.

Current impact: `N/A` for product Help/Guide because this slice changes no visible admin labels, no public lesson copy, no route, no recovery action, and no operator workflow. Existing admin technical fallback fields remain visible under the same labels.

## Scope

- Audit every legacy course lesson field currently read or saved by public/admin lesson code.
- Decide per field: keep active, migrate into structured `lessonExperience`, hide from admin only, or remove.
- If removing/migrating fields, add deterministic migration or normalization path with rollback evidence.
- Update public mapper/rendering tests for old, migrated, and unknown body shapes.
- Update admin tests and Help/Guide if editability or visible labels change.
- Update current/parent brief trails with the final cleanup decision.

## Out Of Scope

- Public lesson redesign.
- New lesson media/asset picker.
- Ready-to-publish checklist.
- Create lesson from template.
- Side-by-side live preview.
- New checkout, entitlement, pricing, revenue, finance, analytics vendor, or route-distribution work.
- Runtime ID/slug migration unless explicitly added by a refreshed owner-approved scope.

## Acceptance Criteria

1. Every legacy lesson field listed in this brief has a keep/migrate/remove decision with rationale.
2. No legacy field is deleted without fixture coverage or migration evidence proving public lessons still render correctly.
3. Any data rewrite is idempotent or has a documented backup/rollback path.
4. Admin no longer exposes obsolete controls after cleanup, or retained controls are clearly active and documented.
5. Public lesson rendering handles old-shape, migrated-shape, and unknown-key fixtures safely.
6. Help/Guide/runbook impact is updated or explicitly marked N/A with rationale.
7. Changed briefs pass `npm run lint:briefs`.
8. Implementation passes targeted tests, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` before merge recommendation.

## Validation

Planning validation:

- `npm run lint:briefs`

Implementation validation when selected:

- Legacy field inventory grep/audit across `app/`, `components/`, `lib/`, `tests/`, `docs/`, and active/done briefs.
- Focused unit tests for `lib/course/lesson-experience.ts` old/migrated/unknown body shapes.
- Admin content mapper/API/component tests if editability changes.
- Migration dry-run or deterministic fixture proof if data is rewritten.
- Screenshot handoff if admin UI changes.
- `npm run verify:pre-pr`
- CI required checks.
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-14 | planned | created from owner clarification during Course Lesson Admin/Public Field Parity And View Changes V1: do not delete legacy course lesson datakontrakt in the active UI slice; keep public fallback reads/old keys until this dedicated cleanup/migration brief is explicitly selected | next: continue active admin parity slice; execute this cleanup only as a future approved slice`
- `2026-06-16 | in-progress | owner explicitly requested execution; branch task/course-lesson-legacy-field-cleanup-v1 created from main@b48a7712, source brief link refreshed to done, and radar run with no new skill/plugin install or live migration decision authorized yet | next: audit legacy field usage across app/lib/components/tests/docs, then implement the smallest mapper/test cleanup that proves old, structured, and unknown body shapes render safely`
- `2026-06-16 | implementation checkpoint | consolidated legacy course lesson fallback reads into a typed lessonExperience resolver, mapped DB course rows to the resolved read model without a live write, added old-shape and mixed-shape fixtures, and confirmed focused unit tests pass | next: run broader targeted admin/content tests, lint briefs, pre-PR verification, then commit/push/PR`
- `2026-06-16 | regression checkpoint | first pre-PR verification found one concept lesson cue-section regression; fixed primaryCue fallback semantics, added unit coverage, and confirmed the affected Playwright spec passes | next: rerun full pre-PR verification`
- `2026-06-16 | pre-pr checkpoint | full npm run verify:pre-pr passed; performance budget trend recommended future stretch-target tightening but no budget change is included in this scoped cleanup PR | next: commit, push, open PR, and monitor CI`
