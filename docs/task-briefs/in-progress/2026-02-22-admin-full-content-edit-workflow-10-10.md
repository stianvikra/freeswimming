# Task Brief: Admin Full Content Edit Workflow 10/10

## Metadata

- `id`: `2026-02-22-admin-full-content-edit-workflow-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-22`
- `updated`: `2026-02-26`

## Goal

Admin can safely and quickly edit all website content (modules, lessons, guide sessions, guide drills, products, and page-level content) through one clear workflow with 10/10 UX, UI, readability, and navigation quality.

## Why This Brief Exists

- Today, admin has strong status/revision/delete workflows, but no clear full-field `Edit` flow for existing content rows.
- This creates friction and uncertainty for high-frequency content work.
- A dedicated brief keeps scope clean and reduces risk versus mixing this into unrelated slices.

## Scope

- Add explicit `Edit` action for existing records in:
  - content catalog (`course_module`, `course_lesson`, `guide_session`, `guide_drill`, `page`, `product`),
  - commerce product rows where editable fields exist.
- Add robust edit UI for existing records:
  - open edit mode from row action,
  - show relevant fields per content type,
  - `Save`, `Cancel`, dirty-state warning, validation feedback.
- Improve navigation for editing at scale:
  - clear parent/child hierarchy navigation (`module -> lesson`, `guide -> session/drill`),
  - numbered labels in pickers/lists where order matters,
  - predictable filters/sort and search.
- Preserve and expose safe workflow controls:
  - status transitions (`draft/review/published/archived`),
  - revisions and restore,
  - destructive delete with confirmation.
- Ensure edit behavior is consistent with database source-of-truth and revisions.
- Update Help/Guide so non-technical admins understand:
  - what each action does,
  - how to edit each content type,
  - how to recover from mistakes.

## Out Of Scope

- Full i18n editorial workflow (multi-language copy lifecycle).
- New public page templates unrelated to admin editing.
- Marketing SEO strategy rollout details (owned by SEO brief).
- Replacing Stripe/commerce architecture.

## Dependencies And Boundaries

- Depends on admin schema being ready in environment:
  - tables, grants, and RLS policies already applied.
- Uses existing admin/content foundation brief as parent:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
- SEO boundary:
  - this brief edits/stores SEO fields in admin when present,
  - public SEO rendering/indexing behavior stays in:
    - `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - all content entities, status, ordering, categories, ownership, SEO fields, revisions, audit records.
- Local-only:
  - transient edit form state,
  - local dirty flags and unsaved warnings.
- Sync policy:
  - write-through save to server on explicit `Save`,
  - optimistic UI only when response confirms mutation,
  - deterministic retry path on failures.
- Conflict handling:
  - if stale revision conflict is detected, show explicit conflict message and offer refresh/reopen edit.
- Cache/invalidation:
  - force refresh of affected list row and mirror metrics after successful edit,
  - revalidate affected public content routes when published records are edited.

## 10/10 Platform Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (Score 5)                                                                                            | Evidence Source                          |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Product goals and IA                          | `target`     | Admin can locate edit entrypoint for any supported content type in <=2 clicks from tab entry.                         | e2e + manual QA script                   |
| UX flow clarity                               | `target`     | Edit flow has clear primary action and no dead-end states; all changed surfaces support `loading/empty/error/retry`.  | e2e + UI checklist                       |
| Visual design quality                         | `target`     | Edit controls, spacing, labels, and state styling remain consistent with existing admin design language.              | visual QA + review checklist             |
| Business logic correctness and data integrity | `target`     | Deterministic edits and status transitions; invariant validation blocks invalid writes; no silent data corruption.    | unit tests + API negative-path tests     |
| Admin editor ergonomics                       | `target`     | Typical edit task (open, modify, save) completes quickly with clear validation and recovery guidance.                 | timed manual QA + e2e                    |
| Accessibility (a11y)                          | `target`     | Keyboard operable edit workflow, visible focus, proper labels/errors, no serious/critical issues on changed surfaces. | playwright + axe checks where applicable |
| Performance (CWV + payloads)                  | `supporting` | No meaningful regression for `/admin` route and edited API latency remains stable.                                    | build + smoke perf checks                |
| Data placement and sync boundaries            | `target`     | Briefed local/server boundaries implemented exactly; cache invalidation deterministic after edit.                     | code review + tests                      |
| Caching and invalidation strategy             | `target`     | Edited data appears predictably after save/refresh; published changes revalidate dependent reads.                     | e2e + unit integration checks            |
| Reliability and failure handling              | `target`     | Expected failure modes return explicit non-500 behavior and actionable UI guidance.                                   | negative-path tests                      |
| Security and authz                            | `target`     | Write actions fail closed with role checks (`401/403`) and validated payloads; no unauthorized writes possible.       | API tests + e2e unauthorized assertions  |
| Privacy and compliance                        | `supporting` | No sensitive value leakage in errors/logs; audit payloads stay redacted where required.                               | log review + tests                       |
| Content governance                            | `target`     | Owner/status/revision model remains enforced for all edited content records.                                          | schema + e2e revisions                   |
| Admin workflow and editability                | `target`     | Full-field edit is available and understandable for all in-scope content types and products.                          | e2e per type + manual QA                 |
| SEO and crawlability                          | `supporting` | Editing SEO-relevant fields in admin does not break metadata contracts.                                               | targeted metadata tests                  |
| AI discoverability                            | `supporting` | Content model edits preserve structured, stable identifiers and public semantic compatibility.                        | schema + mapping checks                  |
| Analytics and KPI observability               | `target`     | Content edit mutations emit required operational events/log records for audit and KPI tracking.                       | event/log assertions                     |
| Commerce and revenue ops                      | `supporting` | Product edit flow remains consistent with entitlement/checkout linkage.                                               | unit + integration checks                |
| Incident response and support operations      | `supporting` | Troubleshooting steps for failed edits documented in Help/Guide and runbook notes.                                    | docs + QA walkthrough                    |
| Finance and reporting operations              | `supporting` | Product metadata edits do not break reconciliation-critical identifiers.                                              | validation rules + tests                 |
| i18n operational readiness                    | `supporting` | Edit model does not introduce locale blockers for future translation rollout.                                         | schema/design review                     |
| Stack-fit and dependency discipline           | `target`     | Uses existing Next.js/TypeScript/Supabase/testing stack; no unnecessary dependency added.                             | dependency diff                          |
| Testing and QA automation                     | `target`     | Unit + e2e + negative-path coverage added for edit actions across in-scope content types.                             | CI checks + coverage evidence            |
| Scalability and cost efficiency               | `supporting` | No obvious N+1 or high-cost query patterns added in edit/read refresh paths.                                          | query/code review                        |
| DevOps and rollback readiness                 | `target`     | Revision restore and rollback-safe edit behavior proven in tests and documented in admin help.                        | e2e revisions + docs                     |

## UX/UI/Readability Contract (10/10)

- Every editable field has:
  - clear label,
  - short helper text when needed,
  - inline validation message in plain language.
- No ambiguous button labels:
  - use verb-first labels (`Save changes`, `Cancel edit`, `Move to review`).
- Readability:
  - concise sections,
  - consistent heading hierarchy,
  - no dense text walls in edit UI.
- Navigation:
  - easy movement between related entities (module to lessons, guide to sessions/drills),
  - stable ordering labels where sequence matters.
- Required UI states on changed surfaces:
  - `loading`,
  - `empty`,
  - `error`,
  - `retry`,
  - `success`.

## Security, Privacy, And Compliance

- Role gates:
  - `viewer`: read only,
  - `editor/admin`: edit allowed per policy,
  - destructive actions still constrained per role policy.
- Input validation:
  - strict server-side parsing for all editable fields.
- Fail-closed behavior:
  - unauthorized => `401/403`,
  - invalid payload => `400`,
  - never generic `500` for expected deny/validation paths.
- Auditability:
  - every mutation tracked with actor, action, timestamp, before/after snapshot.

## Acceptance Criteria (Measurable)

1. Existing content rows expose clear `Edit` entrypoint for all in-scope types.
2. Admin can update field values for existing module/lesson/session/drill/page/product records and persist to DB.
3. Status flow, revisions, restore, and delete remain functional and understandable with the new edit flow.
4. Editing UX includes deterministic validation and dirty-state warnings.
5. Help/Guide includes complete plain-language explanation of:
   - content page flow,
   - every main button/action,
   - what can be edited now,
   - how to recover from mistakes.
6. Negative-path tests confirm unauthorized users cannot edit protected records.
7. `npm run verify:pre-pr` and CI required checks pass.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e -- tests/e2e/admin-foundation.spec.ts`
- `npm run test:e2e -- tests/e2e/admin-content-parity.spec.ts`
- `npm run test:e2e -- tests/e2e/admin-help-center.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
- Preview:
  - PR Vercel preview URL
- Device/browser matrix for changed admin surfaces:
  - desktop Chromium,
  - desktop Safari/WebKit,
  - desktop Firefox,
  - tablet viewport,
  - mobile viewport.

## Implementation Slices

1. Edit action and form-state architecture for existing content rows.
2. Type-specific field layouts and validation rules.
3. Hierarchy navigation and readability polish (numbers/labels/order cues).
4. Revision and rollback UX alignment with edit mode.
5. Help/Guide expansion and non-technical documentation pass.
6. Negative-path hardening and e2e regression gates.
7. Module -> lessons workspace, Open lesson jump, and lesson body editor (goal/cues/drill/checkpoint/next step).
8. Learner-side done checkpoint gate UX (explicit confirmation before marking drill/swim lessons as done).
9. Lesson section visibility controls (admin show/hide toggles for cues/common mistakes/checkpoint/next step).
10. Mirror snapshot -> list focus sync and module workspace/list coupling for faster admin findability.
11. Lesson presentation control expansion:
    - admin toggles for `goal`, `drill block`, and `extra help card`,
    - optional lesson section badge label override (`Learn/Drill/Swim` fallback),
    - learner rendering respects these controls with safe defaults.

## Risks And Mitigations

- Risk: edit UI introduces accidental invalid writes.
  - Mitigation: strong server validation + explicit inline errors + save disable rules.
- Risk: confusing overlap between status actions and edit mode.
  - Mitigation: clear separation and button grouping in row UI.
- Risk: regressions in existing admin workflows.
  - Mitigation: targeted e2e + pre-merge full verify.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from current implementation slice.

## Checkpoint Log

- `2026-02-26`: Slice 11 started on branch `feat/admin-content-edit-phase11-lesson-visibility-label-aw013`.
  - Expanded lesson body editor controls:
    - added optional section badge label (`drillLabel`),
    - added visibility toggles for `goal`, `drill`, and `extra help card`,
    - existing `cues/common mistakes/pass criteria/next step` toggles retained.
  - Expanded lesson rendering on `/course`:
    - section badge now uses admin label override when provided,
    - fallback badge is derived from lesson type (`Learn`, `Drill`, `Swim`),
    - learner UI respects new visibility toggles for goal/drill/support card while preserving done-gate logic.
  - Expanded published-content mapping and import parity:
    - `lib/admin/content-course.ts` now reads `display.goal`, `display.drill`, `display.support`, and `drillLabel`,
    - baseline import now carries `display`, `passCriteria`, and `drillLabel` for course lessons.
  - Help/Guide copy updated so non-technical admins can understand new controls.
  - Tests updated:
    - `tests/unit/admin-content-course.test.ts` for new display keys + badge label mapping,
    - `tests/e2e/admin-foundation.spec.ts` for new lesson editor controls and persistence.
  - Validation: pending `npm run verify:pre-pr` before PR update.

- `2026-02-25`: Slice 8 started on branch `feat/admin-content-edit-phase8-done-gate-aw013`.
  - Added learner-side done checkpoint gate for drill/swim lessons:
    - `Mark as done` is blocked until pass-criteria checklist is explicitly confirmed.
    - Checklist renders inline in the lesson support card for clear context.
    - Added clear feedback copy near top controls when gate is active.
  - Added confirmation persistence in course progress data:
    - `doneConfirmedAt` now flows in normalized course progress rows.
    - Local progress snapshot now stores `doneConfirmationByLessonId`.
    - Course sync API includes `done_confirmed_at` (with fallback for pre-migration environments).
  - Added migration for server canonical confirmation timestamp:
    - `supabase/migrations/20260225134000_course_progress_done_confirmation.sql`.
  - Hardened relevant tests:
    - `tests/e2e/course-progress-sync.spec.ts` (satisfies gate before mark-done),
    - `tests/e2e/install-prompt.spec.ts` (satisfies gate in guest/install flows),
    - `tests/unit/course-progress.test.ts` (confirmation normalization + sync rows).
  - Validation:
    - `npx vitest run tests/unit/course-progress.test.ts` (pass),
    - `npx playwright test tests/e2e/course-progress-sync.spec.ts tests/e2e/install-prompt.spec.ts --project=desktop-chromium --project=mobile-chromium` (pass: `7 passed`, `9 skipped`).
    - `npm run verify:pre-pr` (pass: `67 passed`, `149 skipped`).
  - Next step: commit/push and open PR in Safari, then monitor required CI checks before merge recommendation.

- `2026-02-25`: Slice 10 ready for PR on branch `feat/admin-content-edit-phase9-mirror-focus-aw013`.
  - Added mirror snapshot click-to-focus behavior:
    - each metric card now focuses content list to matching type (`course_module`, `course_lesson`, `guide_session`, `guide_drill`, `product`),
    - auto-scrolls to the content list anchor.
  - Added explicit focus-mode UX:
    - visible focus banner with context label and details,
    - `Clear focus` action resets query/type/status/sort/module scope to default.
  - Synced module workspace and list filters:
    - workspace module scope now drives lesson list filter in the content list,
    - added `All modules` workspace option and module-scope label near list counts.
  - Help/Guide updated with plain-language docs for:
    - mirror snapshot card actions,
    - synchronized workspace/list behavior,
    - focus-clear workflow.
  - Tests updated:
    - `tests/e2e/admin-foundation.spec.ts` (mirror-focus + workspace-sync flow),
    - `tests/e2e/admin-help-center.spec.ts` (new help entries).
  - Validation:
    - `npm run verify:pre-pr` (pass: `67 passed`, `149 skipped`).
  - Next step: commit + push + open PR in Safari, then run required CI checks before merge recommendation.

- `2026-02-25`: Slice 9 started on branch `feat/admin-content-edit-phase7-workspace-aw013`.
  - Added explicit visibility toggles in lesson body editor:
    - `Show cues section`,
    - `Show common mistakes`,
    - `Show pass criteria`,
    - `Show next step`.
  - Persisted as server-canonical lesson body config (`body.display`) rather than text sentinels.
  - Course lesson UI now respects visibility flags when rendering published lessons.
  - Help/Guide updated with plain-language explanation for section visibility toggles.
  - Tests updated:
    - `tests/unit/admin-content-course.test.ts` for published content display mapping.
    - `tests/e2e/admin-foundation.spec.ts` for toggle persistence in lesson edit workflow.
    - `tests/e2e/admin-help-center.spec.ts` for Help/Guide button glossary coverage.
  - Validation: pending local run (`npm run verify:pre-pr`) before PR update.

- `2026-02-25`: Slice 7 started on branch `feat/admin-content-edit-phase7-workspace-aw013`.
  - Added module-to-lesson workspace block in admin content tab:
    - module picker with lesson counts,
    - lesson list per selected module,
    - direct `Edit lesson` jump + `Open lesson` link.
  - Expanded course lesson inline editor with lesson-body fields:
    - lesson id, lesson type, goal, cues, common mistakes,
    - drill title + drill steps,
    - checkpoint criteria (`passCriteria`) + next step.
  - Save path now persists lesson-body edits via `body` merge (keeps existing body keys).
  - Help/Guide updated with new actions and lesson-body editor explanation.
  - Tests updated:
    - `tests/e2e/admin-foundation.spec.ts` for workspace + lesson body edit flow.
    - `tests/e2e/admin-help-center.spec.ts` for new button/help copy.
  - Validation:
    - `npm run lint` (pass),
    - `npm run typecheck` (pass),
    - `npx playwright test tests/e2e/admin-foundation.spec.ts tests/e2e/admin-help-center.spec.ts --project=desktop-chromium` (pass with expected env-based skip on dev-bypass-dependent admin flow),
    - `npm run verify:pre-pr` (pass: `67 passed`, `149 skipped`).
  - Next step: open PR for slice 7, wait required checks, run `npm run verify:pre-merge` before merge recommendation.

- `2026-02-23`: Slice 6 ready for PR on branch `feat/admin-content-edit-phase6-negative-path-aw013` (PR #106, commit `2a475d9`).
  - Added dedicated admin content API guard regression coverage:
    - `tests/e2e/admin-content-api-guards.spec.ts`
    - covers unauthenticated mutation deny-paths for `POST/PATCH/DELETE /api/admin/content`,
    - covers malformed payload guards for authenticated mutation calls (`415`, `400`, no `500` for expected validation errors).
  - Updated admin e2e suite command so guard coverage is part of CI/admin workflow:
    - `package.json` -> `test:e2e:admin` now includes `tests/e2e/admin-content-api-guards.spec.ts`.
  - Validation:
    - targeted: `npx playwright test tests/e2e/admin-content-api-guards.spec.ts --project=desktop-chromium` (pass with expected skip on dev-bypass-dependent case in local env),
    - suite: `npm run test:e2e:admin` (pass with environment-based skips),
    - gate: `npm run verify:pre-pr` (pass: `67 passed`, `149 skipped`).
  - Next step: open PR, wait for required checks, then run `npm run verify:pre-merge` before merge.

- `2026-02-23`: Slice 5 ready for PR on branch `feat/admin-content-edit-phase5-page-product-aw013` (PR #105, commit `26ac1d7`).
  - Added `page` and `product` as admin content types in schema contracts (`lib/admin/content.ts`, `types/database.ts`) with migration `20260223110000_admin_content_type_page_product.sql`.
  - Expanded content manager type filters/chips and inline edit support labels to include page/product rows.
  - Updated row context hints for new types (`Route: /slug`, product metadata hint).
  - Updated Help/Guide button and edit-scope copy to match new edit availability.
  - Added/updated tests:
    - `tests/unit/admin-content.test.ts` for page/product payload parsing.
    - `tests/e2e/admin-foundation.spec.ts` UI coverage for page/product filter/type options.
    - `tests/e2e/admin-help-center.spec.ts` help copy assertion updates.
  - Validation: targeted admin tests passed; `npm run verify:pre-pr` passed (`66 passed`, `138 skipped`).
  - Next step: wait for required CI checks on PR #105, then run `npm run verify:pre-merge` before merge.

- `2026-02-23`: Slice 4 merged to `main` (PR #102, commit `77c89c7`).
  - Added status filter, sorting controls, and one-click type chips with counts.
  - Help/Guide now explains filter/sort controls in plain language.
  - Admin e2e assertions updated for filter/sort/findability behavior.
  - Post-merge hygiene complete: local `main` synced and feature branch cleaned up.
  - Next recommended slice: add full inline edit for `page` and `product` content types with validation and tests.

- `2026-02-23`: Slice 4 ready for PR on branch `feat/admin-content-edit-phase4-filter-sort-aw013`.
  - Added admin list controls for `status` filter and `sort` selection.
  - Added one-click type chips with counts (`All`, `Course module`, `Course lesson`, `Guide session`, `Guide drill`) for faster findability.
  - Kept existing search + type filter and expanded help text with new control explanations.
  - Updated admin e2e coverage for status/sort controls and quick-type chips.
  - Validation: targeted admin e2e passed; `npm run verify:pre-pr` passed (`66 passed`, `138 skipped`).

- `2026-02-23`: Slice 3 ready for PR on branch `feat/admin-content-edit-phase3-hierarchy-aw013`.
  - Added admin content list search + type filter for faster findability.
  - Added clearer per-row metadata context for modules/lessons/sessions/drills.
  - Updated Help/Guide with search/filter and expanded content edit scope wording.
  - Updated e2e coverage for new controls and help text.
  - Validation: `npm run verify:pre-pr` passed (`66 passed`, `138 skipped`).

- `2026-02-23`: Slice 2 merged to `main` (PR #100, commit `a7868fd`).
  - Inline edit now covers: `course_module`, `course_lesson`, `guide_session`, `guide_drill`.
  - Help/Guide reflects updated edit scope and button behavior.
  - Post-merge hygiene complete: local `main` synced and feature branch cleaned up.
  - Next recommended slice: hierarchy/readability polish + prepare page/product edit scope.

- `2026-02-23`: Slice 2 started on branch `feat/admin-content-edit-phase2-guide-types-aw013`.
  - Expanded inline edit support to `guide_session` and `guide_drill`.
  - Updated Help/Guide copy to reflect current edit scope.
  - Updated admin e2e coverage for guide session/drill edit entry and cancel flow.
  - Validation: targeted admin e2e passed; `npm run verify:pre-pr` passed (with expected environment-based skips).

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief marks scorecard categories as `target`/`supporting`/`N/A` with measurable thresholds.
- Closeout must include achieved scores (`0-5`) for target categories and explicit defer/fix for any target `<4`.

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
