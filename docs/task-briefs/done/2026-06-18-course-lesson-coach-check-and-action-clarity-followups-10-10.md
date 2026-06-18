# Task Brief: Course Lesson Coach Check And Action Clarity Follow-Ups

## Metadata

- `id`: `2026-06-18-course-lesson-coach-check-and-action-clarity-followups-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `owner-approved implementation; pause after screenshot handoff before pre-PR gate`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@3df08490`
- `audit_status`: `owner-approved-ready-for-implementation`
- `decision`: Implement the recommended bounded public lesson UX follow-up: Ready check owns the primary completion action, header completion becomes secondary/jump-status, Coach check content stacks Good looks above Common mistakes as equal headings without visible section eyebrow/tabs/disclosure, and stale Common mistakes disclosure coverage is replaced.
- `reason`: Notes `63d7037f` and `46eae589` still point at learner clarity. The current code already has a consolidated coach-check card and `Ready check`, and owner review clarified that Good looks/Common mistakes should be split vertically as equal learner headings rather than compete side by side.
- `must_refresh_before_execution_if`: Refresh if `app/course/page.tsx`, `lib/course/lesson-experience.ts`, `components/course/CourseOpenOnPhoneCard.tsx`, course progress/done behavior, `SUPPORT_ACTION_ORDER`, `CourseSupportCard.primaryAction`, Coach check fields, common mistakes model, public lesson screenshots, or admin lesson editor contracts change.

## Goal

Audit and improve the public lesson Coach check/action hierarchy so Good looks, Common mistakes, Mark as done, Ready check, support actions, and any remaining `Open`-style copy are clearer without changing lesson content identity, completion semantics, support-card routing, or progress sync without an owner decision.

## Pre-Implementation Owner Explanation

Vi holder dette som en egen leksjons-slice. Den handler om hvordan elever ser “what good looks like”, common mistakes og lesson actions på leksjonssiden, ikke om admin-menyen.

Hvorfor det betyr noe: Hvis de viktigste coach-signalene konkurrerer med knapper eller tekst, blir leksjonen vanskeligere å bruke i praksis.

Utenfor scope: admin shell, Content mirror/status actions, pass-criteria prosent/scoring, database/API/schema, user progress-modell, message badge og merge.

Fremoverkompatibilitet: nye coach-check-felt eller lesson actions skal arve samme public lesson display contract eller kreve explicit mapping og screenshot/test før release.

## Current-State Audit

- Repo recovery on `2026-06-18`: `main...origin/main`, clean at `3df08490`; `Ja.docx` untouched.
- Parent intake says source notes `63d7037f` and `46eae589` were closed only as captured in repo briefs; this planning refresh did not re-query live notes.
- Current public renderer before this slice: `app/course/page.tsx` rendered `Coach check` with `What good looks and feels like` and `Common mistakes` side by side when both sections were available.
- Implemented Coach check direction: `What good looks and feels like` and `Common mistakes` render as two separate learner cards inside one internal coach-check group, with no visible `Coach check` eyebrow, no `Catch it early` subheading, one cue per line with quieter number chips, a flat Common mistakes list where `+ Do this` is primary/first and `- Avoid` is secondary/aligned over its desktop column, and no tabs/disclosure/local persistence.
- Implemented completion surface direction: header `course-mark-done-button` is now a secondary `Ready check`/`Done` jump-status affordance, while `Ready check` `course-pass-criteria-mark-done-button` owns `toggleLessonDone`; redundant visible helper/status text beside and below `Mark as done` is removed.
- Current support surface: support actions derive from `SUPPORT_ACTION_ORDER`, `SUPPORT_ACTION_META`, `CourseSupportCard.actions`, and `CourseSupportCard.primaryAction`; no bare `Open` support action was found in the current public lesson support card.
- Current open-on-phone surface: `CourseOpenOnPhoneCard` uses `Open on phone`, `Share link`, and `Copy link`; QR/share/copy behavior is an adjacent done surface and should not be changed unless the refreshed screenshots prove it competes with the lesson action hierarchy.
- Current stale-test risk: `tests/e2e/course-common-mistakes-visibility.spec.ts` still targets an older Common mistakes disclosure/localStorage contract; implementation should update, replace, or retire that contract test instead of preserving the obsolete behavior.
- Mature reference surface: `docs/task-briefs/done/2026-06-16-course-lesson-learning-cards-polish-10-10.md` plus the current `Coach check` renderer are the reference contract for learner-facing cues/mistakes.
- Owner decision on `2026-06-18`: execute the recommended scope; do not include tabs or `Open on phone` unless screenshot QA reveals a direct issue.

## Codex Skill + Stack Readiness Radar

Capability audit:

| Capability          | Evidence                                              | Current Status | Recommended Trigger                                 | Boundary                                       |
| ------------------- | ----------------------------------------------------- | -------------- | --------------------------------------------------- | ---------------------------------------------- |
| `playwright`        | `/Users/stianvikra/.codex/skills/playwright/SKILL.md` | `installed`    | Screenshot handoff and targeted lesson UI evidence. | Does not replace owner visual approval stop.   |
| `imagegen`          | session skill metadata                                | `available`    | Not needed; no new bitmap assets are expected.      | Do not generate decorative assets here.        |
| Next.js/React local | repo code + current route structure                   | `available`    | Course page component and client-state review.      | Preserve current public lesson route model.    |
| Local Codex config  | session metadata                                      | `not needed`   | N/A                                                 | Do not install/configure tools for this slice. |

Systemic findings:

| Surface                      | Finding                                                                                                                                                                                   | Severity | Recommended Type               | Owner Decision Needed                                                     | Follow-Up Brief Path |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ------------------------------------------------------------------------- | -------------------- |
| Course Coach check           | Current internal coach-check group is the reference surface, but owner review selected separate Good looks/Common mistakes cards instead of desktop side-by-side or extra section labels. | `medium` | `bounded implementation child` | `no` for the selected split-card layout; `yes` for tabs or hiding content | This brief           |
| Course completion actions    | Header and Ready check buttons share completion behavior; hierarchy can improve, but removing either action changes ergonomics.                                                           | `medium` | `bounded implementation child` | `yes`, if a callsite is removed instead of visually demoted               | This brief           |
| Course common mistakes tests | Existing visibility spec targets obsolete disclosure/localStorage behavior.                                                                                                               | `medium` | `bounded implementation child` | `no`                                                                      | This brief           |
| Course open-on-phone utility | Current `Open on phone` helper is an adjacent done surface, not the default target.                                                                                                       | `low`    | `do not do`                    | `yes`, only if owner wants this utility in scope                          | N/A                  |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`
- Current child: this planned public lesson UX brief.
- Last merged workstream before this refresh: PR `#1162` and repo-managed closeout PR `#1163`.
- Exact next implementation step: patch the course lesson action hierarchy and tests, then capture screenshot handoff before broad gates.

## Source Notes Covered

| Note ID                                | Covered Scope                                                                                                                                      | Explicit Boundary                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `63d7037f-f025-404d-8e4e-80630fbd70dc` | Re-evaluate whether current side-by-side `Coach check` is clearer than stacked/tabs/disclosure/one-at-a-time presentation; owner selected stacked. | No data model or hidden-state persistence change unless explicitly approved.                |
| `46eae589-ae52-4fea-bb00-8eb2fb04f29c` | Re-audit public lesson copy/action clarity: too much text, button noise, duplicated Mark as done, and any still-unclear `Open`-style copy.         | Pass-criteria scoring percentages and completion semantics are owned by separate decisions. |

## Pre-Execution Audit Gate

Before implementation starts:

1. Reopen this brief, the residual intake, the current public lesson renderer, and the admin lesson editor parity surface.
2. If admin-note access is available, verify source notes `63d7037f` and `46eae589` remain closed as captured; do not reopen them unless the owner asks.
3. Capture or inspect fresh representative lesson screenshots before deciding tab/disclosure/action changes; selected default is stacked `Coach check` sections without hiding content.
4. Confirm public SEO/AI semantic impact and Help/Guide impact if action labels, support labels, completion copy, or route-visible lesson wording changes.
5. Run a targeted route/label/support sweep for `Coach check`, `What good looks and feels like`, `Common mistakes`, `Avoid`, `Do this`, `Ready check`, `Pass criteria`, `Mark as done`, `Done`, `Open on phone`, `Share link`, and `Copy link`.
6. Run `npm run lint:briefs:all` and get owner approval before moving this brief to `in-progress`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Reliability and failure handling, Content governance, i18n operational readiness, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                     | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Lesson page makes coach-check, ready-check, and support/helper jobs clear without casually adding a new mental model.                                                                  | before/after or after/reference screenshots + owner review | `5/5`                   |
| UX flow clarity                               | `target`     | Good looks, Common mistakes, `Mark as done`/`Done`, Ready check, support actions, and any `Open`-style helper copy have clear hierarchy with no duplicate primary actions.             | screenshot review + targeted tests                         | `5/5`                   |
| Visual design quality                         | `target`     | Lesson desktop/mobile screenshots show improved scanability with no clipped text, overlap, awkward empty slots, or button noise.                                                       | screenshot handoff                                         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | `toggleLessonDone`, pass-criteria gating, progress sync, support action hrefs/analytics, content rendering, and admin/public field parity remain unchanged unless separately approved. | unit/e2e tests + diff review                               | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin editor contracts may be checked for parity, but no admin editor change is required by default.                                                                  | parity test review                                         | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Any tabs/disclosures/actions preserve keyboard/focus/name/role/selected state, aria-describedby, disabled states, and touch targets.                                                   | Playwright/Testing Library                                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency or heavy client interaction by default.                                                                                                                 | package/diff review                                        | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical lesson content and user progress boundaries remain unchanged; any new tab/disclosure state is local-only and not persisted unless explicitly approved.                | data-boundary review                                       | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: public lesson cache/revalidation behavior should not change.                                                                                                          | route diff review                                          | `4/5`                   |
| Reliability and failure handling              | `target`     | Existing loading, disabled, enabled, done, undo, QR/share/copy fallback, and refresh states remain deterministic where touched.                                                        | targeted tests                                             | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected route or authz changes expected.                                                                                                                         | changed-files review                                       | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no private progress/admin note/user/payment/provider data should appear in public lesson UI/screenshots.                                                              | screenshot/privacy review                                  | `4/5`                   |
| Content governance                            | `target`     | Public lesson output remains driven by canonical lesson content and view-model fields, not hardcoded to one example lesson or today's source notes.                                    | content/view-model tests                                   | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: if field labels change, admin parity tests/Help impact must be reviewed.                                                                                              | parity review                                              | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public lesson semantic structure, canonical route, metadata, and crawl-safe content should not regress.                                                               | SEO/sitemap/markup review                                  | `4/5`                   |
| AI discoverability                            | `target`     | Lesson coach-check and ready-check content remains semantically clear and crawl-safe for public lesson entities.                                                                       | structured/semantic markup review                          | `5/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics event or KPI expected.                                                                                                                               | no-event-diff review                                       | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no products, checkout, Stripe, entitlements, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                                                      | explicit commerce scope rationale                          | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: no support procedure change unless Help/Guide labels change.                                                                                                          | Help impact review                                         | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes.                                       | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `target`     | Lesson action/cue labels tolerate longer future locale strings without clipping or overlapping in mobile and desktop screenshots.                                                      | responsive screenshots                                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing course lesson renderer, `CourseOpenOnPhoneCard` where relevant, support action contracts, and lesson view model; no dependency.                                         | diff/package review                                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Update current lesson renderer/progress/support/parity tests and remove or replace stale Common mistakes disclosure coverage.                                                          | test output + screenshots                                  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: pattern should scale to future lessons without per-lesson hardcoding.                                                                                                 | fixture review                                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/test diff with no migration unless scope changes.                                                                                                                  | git diff + gates                                           | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: reuse existing course lesson route/renderer and keep `/course?lesson=` plus canonical localized routes compatible.
- TypeScript/domain: lesson body, support action, and progress contracts remain canonical.
- Supabase/data: no migration/RLS/generated type change expected.
- UI system: reuse current lesson/public tokens, `PressButton`, `PressLink`, `CourseOpenOnPhoneCard`, and existing action primitives.
- Reference surface: current `Coach check` in `app/course/page.tsx` and done brief `2026-06-16-course-lesson-learning-cards-polish-10-10`.
- Testing: course lesson unit/e2e/parity/support tests plus screenshots.

## Data Placement And Sync Contract

- Server-canonical data: lesson content and user progress remain unchanged.
- Local data: tab/disclosure state only if introduced; no Common mistakes localStorage persistence unless separately approved.
- Sync policy: unchanged progress/done behavior.
- Retention/sensitivity: no private data in public UI.
- Cache/invalidation: unchanged unless explicitly scoped.

## Identity And Rename Contract

- Canonical IDs: lesson slugs/runtime IDs and progress IDs remain unchanged.
- Human-readable labels: action/cue labels may be improved but not repurposed.
- Mutability rules: no lesson identity change.
- Rename vs repurpose: materially new completion behavior needs separate decision.
- Compatibility: public lesson URLs remain.
- Observability and repair: parity tests catch drift.

## Forward Compatibility Contract

- Extensibility surfaces: lesson sections, coach-check fields, support action IDs, action labels, locales, and optional helper utilities.
- Source of truth: lesson renderer consumes canonical lesson body, `lessonExperience`, `CourseSupportCard`, and progress state.
- Additive behavior: future lessons use the same display pattern without per-lesson hardcoding.
- Explicit mapping requirements: new completion metrics, scoring, support action IDs, or new coach-check field types require product/design mapping and tests.
- Unknown/deprecated values: existing fallback rendering remains visible; unknown support primary actions keep the current safe fallback of no highlighted primary action.
- Test/evidence: future-value lesson fixture, support-action fallback test where touched, and screenshot parity.

## Scope

- Public course lesson Coach check/action area.
- Existing header and Ready check completion action hierarchy.
- Header/overview `Mark as done` treatment changes to a secondary jump/status affordance that points to Ready check instead of competing as another completion CTA.
- Coach-check content splits Good looks and Common mistakes into two separate visible cards; Good looks cues render one per line with toned-down number markers, Common mistakes uses a flat list with primary `+ Do this` before secondary `- Avoid`, and `Ready check` removes redundant helper/status copy while showing check icons for completed pass criteria.
- Related unit/e2e/parity tests.
- Screenshots for representative lesson pages.

## Out Of Scope

- Pass-criteria percent/scoring semantics.
- Admin shell/mobile navigation.
- Content mirror/status actions.
- API/database/auth changes.
- Open-on-phone QR/share/copy mechanics unless a label-only hierarchy fix is explicitly selected.
- New tab/disclosure state for Coach check.
- Removing Ready check as the primary completion surface.

## Acceptance Criteria

1. Good looks/Common mistakes presentation is split into two cards and easier to scan without adding tabs, repeated heavy per-row labels, visible section eyebrows, nested mobile card noise, or hiding meaning.
2. Ready check is the only primary completion place; the header control is secondary and helps the learner get to Ready check or understand done state without competing as a duplicate primary action.
3. Lesson progress and content identity remain unchanged.
4. Stale Common mistakes disclosure/localStorage test coverage is updated, replaced, or explicitly retired.
5. Screenshot handoff is owner-approved before broad gates.

## Validation

- `npm run lint:briefs`
- targeted lesson unit/e2e/parity tests, expected candidates:
  - `./node_modules/.bin/vitest run tests/unit/course-lesson-experience.test.ts`
  - `./node_modules/.bin/vitest run tests/unit/course-open-on-phone-card.test.tsx` if open-on-phone copy/classes are touched
  - `npx playwright test tests/e2e/course-lesson-experience.spec.ts tests/e2e/course-pass-criteria-visibility.spec.ts tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium`
  - update/replace `tests/e2e/course-common-mistakes-visibility.spec.ts` if the obsolete disclosure contract is still present
- screenshot handoff
- after screenshot approval: `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`

Current implementation evidence:

- `npm run typecheck` passed.
- `./node_modules/.bin/vitest run tests/unit/course-lesson-experience.test.ts` passed.
- `npm run lint:briefs:all` passed, including this in-progress brief.
- `git diff --check` passed.
- Targeted route/label/support sweep covered `Coach check`, `What good looks and feels like`, `Common mistakes`, `Avoid`, `Do this`, `Ready check`, `Pass criteria`, `Mark as done`, `Done`, `Open on phone`, `Share link`, `Copy link`, stale `fs_course_common_mistakes_expanded`, and old `Expand to review common errors` copy across `app/`, `components/`, `tests/`, `docs/`, and scripts/package metadata; current fallout was limited to this slice plus user-flow docs.
- Identifiers searched: `Coach check`, `What good looks and feels like`, `Common mistakes`, `Avoid`, `Do this`, `Ready check`, `Pass criteria`, `Mark as done`, `Done`, `Open on phone`, `Share link`, `Copy link`, `fs_course_common_mistakes_expanded`, and `Expand to review common errors`.
- Surfaces checked: `app/`, `components/`, `tests/`, `docs/`, active/planned/done task briefs, user-flow docs, package/script metadata, and current screenshot artifacts; fallout handled in this branch or explicitly scoped out as admin Help/Guide N/A.
- `npx playwright test tests/e2e/course-lesson-experience.spec.ts tests/e2e/course-pass-criteria-visibility.spec.ts tests/e2e/course-common-mistakes-visibility.spec.ts tests/e2e/course-progress-sync.spec.ts tests/e2e/install-prompt.spec.ts --project=desktop-chromium --project=mobile-chromium` passed with `13 passed`, `17 skipped`; the signed-in dev-login sync case skipped because local dev-login/Supabase auth was unavailable, not because of an assertion failure.
- Owner-corrected validation after split cards, one cue per line, `- Avoid`/`+ Do this`, and Ready check text removal: `npm run typecheck` passed, `npm run lint:briefs:all` passed, `git diff --check` passed, `./node_modules/.bin/vitest run tests/unit/course-lesson-experience.test.ts` passed with `11 passed`, `npx playwright test tests/e2e/course-common-mistakes-visibility.spec.ts tests/e2e/course-pass-criteria-visibility.spec.ts tests/e2e/course-lesson-experience.spec.ts --project=desktop-chromium` passed with `5 passed`, and the latest `npx playwright test tests/e2e/course-common-mistakes-visibility.spec.ts --project=desktop-chromium` pass confirmed the final Common mistakes layout.
- Corrected screenshot handoff captured in `output/course-lesson-action-clarity-2026-06-18-224525`.
- Owner screenshot approval stop: owner approved the corrected screenshot handoff in chat on `2026-06-18` with "godkjent - lagre screenshots. gå på testing - merge godkjent når tester ok"; no product-rendering files changed after the `2026-06-18-224525` capture before entering `npm run verify:pre-pr`.

## Help / Guide Impact

Visible lesson action labels and completion help copy changed. Public flow docs were updated in `docs/user-flow-map.md` and `docs/user-flow-map.svg`; no admin Help/Guide update is required because this slice does not change admin workflows or recovery behavior.

## Checkpoint Log

- `2026-06-18 | planned | captured open notes 63d7037f and 46eae589 into a dedicated public lesson follow-up so admin shell work stays scoped | next: re-audit current lesson UI before implementation`
- `2026-06-18 | planning-refresh | refreshed against clean main@3df08490 after PR #1162 and closeout PR #1163; current renderer already has Coach check/Ready check, support actions do not expose a bare Open label, and common-mistakes disclosure test coverage appears stale | next: owner reviews this sharpened scope before implementation`
- `2026-06-18 | in-progress | owner approved recommended implementation scope on branch feat/course-lesson-action-clarity: make Ready check the primary completion surface, turn header completion into secondary jump/status affordance, tighten copy, stack Coach check sections vertically, and replace stale Common mistakes disclosure coverage | next: implement scoped UI/test changes`
- `2026-06-18 | implementation-checkpoint | implemented scoped action hierarchy, tightened Coach check/Ready check helper copy, stacked Good looks above Common mistakes, replaced stale Common mistakes disclosure/localStorage coverage with visible coach-check contract coverage, updated user-flow docs, and passed typecheck/unit/brief lint/diff-check/targeted Playwright | next: capture corrected screenshot handoff and wait for owner visual approval before pre-PR gate`
- `2026-06-18 | owner-correction | owner flagged that the first screenshot still showed side-by-side Coach check plus redundant labels; corrected Good looks/Common mistakes toward stacked/split headings, removed visible Coach check/Catch it early labels, and removed the redundant Not ready yet pill from Ready check | next: rerun targeted validation and regenerate screenshot handoff`
- `2026-06-18 | owner-correction | owner requested removal of the visible Ready check helper lines above and below the pass-criteria checklist; removed those visible strings while keeping a short screen-reader-only description for the button state | next: rerun targeted validation and regenerate screenshot handoff`
- `2026-06-18 | corrected-screenshot-handoff | validation passed after owner corrections and fresh screenshots were captured in output/course-lesson-action-clarity-2026-06-18-224525 showing separate Good looks/Common mistakes cards, one cue per line with quieter number chips, primary + Do this before secondary - Avoid aligned over the desktop avoid column, and Ready check done criteria with check icons | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-18 | owner-correction | owner requested more separation/readability between Good looks and Common mistakes, one Good looks cue per line, helper copy changed to "Check these against how you feel in the water.", separate Good looks/Common mistakes cards, primary + Do this before secondary - Avoid, quieter 1/2/3 markers, desktop labels aligned over their columns, check icons on completed pass criteria, and a flatter mobile Common mistakes structure | next: rerun targeted validation and regenerate screenshot handoff`

## Completion Record

- `completed`: `2026-06-18`
- `merged_pr`: `#1164`
- `squash_commit`: `bfe71c66`
- `result`: Closed the public course lesson Coach check/action clarity slice. Ready check now owns completion, the header action is a secondary Ready check/Done jump/status affordance, Good looks and Common mistakes are separate scannable cards, Do this is primary before Avoid, redundant helper/status copy is removed, and done pass criteria show check icons.
- `validation`: `npm run verify:pre-pr` PASS full-public lane (`artifacts/test-runs/20260618-225026`), required CI checks PASS (`Analyze (javascript-typescript)`, `size-check`, `verify`), `npm run verify:pre-merge` PASS full lane (`artifacts/verify-pre-merge/20260618-211820.json`), targeted unit/Playwright gates PASS, and owner-approved screenshots in `output/course-lesson-action-clarity-2026-06-18-224525`.
- `10/10 claim`: yes - all critical target categories below reached `5/5`; non-required `deploy-preview` failed on Vercel upload/rate-limit (`api-upload-free`, `Upload aborted`) while the required Vercel status context passed.

| Category                                      | Achieved Score | Evidence                                                                                                                          | Gaps / Notes              |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Product goals and IA                          | `5/5`          | PR `#1164`, owner-approved screenshot handoff, `npm run verify:pre-pr`, `npm run verify:pre-merge`                                | None.                     |
| UX flow clarity                               | `5/5`          | Ready check owns completion; header is secondary jump/status; owner-approved screenshots                                          | None.                     |
| Visual design quality                         | `5/5`          | Screenshot artifacts `output/course-lesson-action-clarity-2026-06-18-224525`; owner approved corrected desktop/mobile layouts     | None.                     |
| Business logic correctness and data integrity | `5/5`          | Existing progress identity preserved; `course-pass-criteria-visibility`, `course-progress-sync`, and install prompt tests updated | No DB/API/schema changes. |
| Accessibility (a11y)                          | `5/5`          | Existing button semantics retained; screen-reader-only pass criteria help preserved; full local/CI gates passed                   | None.                     |
| Data placement and sync boundaries            | `5/5`          | Brief data contract unchanged: lesson content/progress remain server-canonical; UI-only layout/copy changes only                  | None.                     |
| Reliability and failure handling              | `5/5`          | Done/undo/install prompt flows covered by updated E2E tests and full pre-merge gate                                               | None.                     |
| Content governance                            | `5/5`          | Coach-check rendering stays driven by lesson content/view model; tests cover fixture fields instead of stale disclosure state     | None.                     |
| AI discoverability                            | `5/5`          | Public lesson content remains visible and semantically named; full route/metadata tests passed                                    | None.                     |
| i18n operational readiness                    | `5/5`          | Responsive desktop/mobile screenshot review; labels use existing text contract and avoid clipped helper copy                      | None.                     |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing course lesson renderer/actions; no dependency changes                                                             | None.                     |
| Testing and QA automation                     | `5/5`          | Targeted unit/Playwright gates, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` passed                       | None.                     |
| DevOps and rollback readiness                 | `5/5`          | Small reversible squash commit `bfe71c66`; rollback via `git revert bfe71c66`; non-required Vercel preview failure documented     | None.                     |
