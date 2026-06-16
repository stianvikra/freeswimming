# Task Brief: Course Lesson Learning Cards Polish (10/10)

## Metadata

- `id`: `2026-06-16-course-lesson-learning-cards-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-16`
- `updated`: `2026-06-16`
- `parent_reference`: `docs/task-briefs/done/2026-06-15-course-lesson-design-readability-and-completion-10-10.md`
- `trigger`: Owner screenshot review during `docs/task-briefs/in-progress/2026-06-16-browser-tab-identity-metadata-sweep-10-10.md`
- `execution_mode`: `end-to-end UI correction; pause after refreshed screenshot handoff before pre-PR gate`

## Brief Audit Record

- `last_audited`: `2026-06-16`
- `base`: branch `browser-tab-identity-metadata-sweep` after course metadata implementation
- `audit_status`: `ready`
- `decision`: Execute this as a bounded UI correction before the active PR proceeds.
- `reason`: The course lesson mid-page learning sections are clean but not 10/10: the cue cards leave an awkward empty grid slot, common mistakes read like an admin table, and the pass criteria section exposes a loading state in the screenshot handoff.
- `must_refresh_before_execution_if`: Refresh if `app/course/page.tsx`, `lib/course/lesson-experience.ts`, course progress/pass-criteria behavior, screenshot handoff rules, or course lesson design contracts change before implementation.

## Goal

Make the lesson learning cards feel finished, learner-centered, and visually intentional without changing course content, progress rules, or metadata behavior.

## Pre-Implementation Owner Explanation

Vi forbedrer de midtre leksjonskortene som viser hvordan bevegelsen skal kjennes, vanlige feil og pass criteria. Det betyr noe fordi siden skal hjelpe en elev aa forstaa og sjekke egen bevegelse, ikke foeles som en teknisk tabell. Utenfor scope er nye kurskonsepter, kursinnhold, admin, Habits, betaling, progresjonslogikk og stor sideombygging.

Fremoverkompatibilitet: nye leksjoner skal bruke samme kortmønster automatisk fra eksisterende `feelCues`, `commonMistakes` og `passCriteria`. Nye læringsseksjoner eller nye pass-criteria-typer krever eksplisitt mapping, tester og screenshot-handoff.

## Codex Skill + Stack Readiness Radar

Capability audit:

| Capability          | Evidence                                              | Current Status | Recommended Trigger                               | Boundary                                      |
| ------------------- | ----------------------------------------------------- | -------------- | ------------------------------------------------- | --------------------------------------------- |
| `playwright`        | `/Users/stianvikra/.codex/skills/playwright/SKILL.md` | `installed`    | Refreshed desktop/mobile screenshot handoff.      | Does not replace owner visual approval stop.  |
| `imagegen`          | session skill metadata                                | `available`    | Not needed; no new bitmap assets in this slice.   | Do not generate decorative assets here.       |
| Next.js/React local | repo code + current route structure                   | `available`    | Server/client split and client component changes. | Preserve current `/course?lesson=` behavior.  |
| Local Codex config  | session metadata                                      | `not needed`   | N/A                                               | Do not install or configure new capabilities. |

Systemic findings:

| Surface                      | Finding                                                                                      | Severity | Recommended Type               | Owner Decision Needed | Follow-Up Brief Path |
| ---------------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------ | --------------------- | -------------------- |
| Course lesson learning cards | Cues and mistakes sections are understandable but visually weak and not premium learning UI. | `medium` | `bounded implementation child` | `no`                  | This brief           |
| Course pass criteria loading | Screenshot showed `Loading pass criteria...`, which reads unfinished in the learning flow.   | `medium` | `bounded implementation child` | `no`                  | This brief           |
| Broader course redesign      | Wider page redesign or new content model would exceed the current correction.                | `low`    | `do not do`                    | `no`                  | N/A                  |

Return path:

- Active combined workstream: `docs/task-briefs/in-progress/2026-06-16-browser-tab-identity-metadata-sweep-10-10.md`
- Current child: this UI correction.
- Next step after this child: refresh screenshot/metadata handoff, then wait for owner approval before `npm run verify:pre-pr`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                      | Evidence                                             | Expected score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------- |
| Product goals and IA                          | `target`     | Learning cards clarify the learner job: feel the right movement, spot mistakes, and complete criteria.              | screenshot handoff + code review                     | 5/5            |
| UX flow clarity                               | `target`     | Cue, mistake, correction, and pass-criteria states are scan-friendly with no exposed unfinished loading copy.       | screenshot handoff + targeted tests                  | 5/5            |
| Visual design quality                         | `target`     | Sections avoid table-like/admin feel, awkward empty grid slots, and oversized weak rows on desktop/mobile.          | before/after screenshots                             | 5/5            |
| Business logic correctness and data integrity | `target`     | No change to lesson data, progress storage, done-gate rules, or pass-criteria truth model.                          | diff review + targeted e2e/unit coverage             | 5/5            |
| Admin editor ergonomics                       | `N/A`        | N/A because admin editor routes, fields, labels, and workflows are untouched.                                       | diff review                                          | N/A            |
| Accessibility (a11y)                          | `target`     | Lists, headings, checkboxes, labels, focus behavior, and readable text hierarchy remain semantic and keyboard safe. | Testing Library/e2e review + screenshot inspection   | 5/5            |
| Performance (CWV + payloads)                  | `target`     | No new dependency, no new media, no extra network calls, and no meaningful JS/payload growth.                       | dependency diff + build/pre-PR gate                  | 5/5            |
| Data placement and sync boundaries            | `supporting` | Supporting only: UI renders existing server/local progress data without changing sync ownership.                    | diff review                                          | 5/5            |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache or invalidation behavior changes.                                                         | diff review                                          | 5/5            |
| Reliability and failure handling              | `target`     | Loading/fallback states remain deterministic and do not show unfinished copy as the intended user state.            | screenshot + targeted route/e2e behavior             | 5/5            |
| Security and authz                            | `supporting` | Supporting only: no protected route, authz, or data write behavior changes.                                         | diff review                                          | 5/5            |
| Privacy and compliance                        | `supporting` | Supporting only: no user data, private note data, or analytics payload changes.                                     | diff review                                          | 5/5            |
| Content governance                            | `target`     | UI uses existing authored course fields without duplicating or rewriting course content.                            | code review                                          | 5/5            |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/workflow/editability behavior changes.                                                    | explicit scope rationale                             | N/A            |
| SEO and crawlability                          | `supporting` | Supporting only: public semantic structure stays crawl-safe and metadata work from sibling child remains intact.    | metadata tests + diff review                         | 5/5            |
| AI discoverability                            | `supporting` | Supporting only: learning sections remain semantically clear public content.                                        | markup review                                        | 5/5            |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event names, payloads, dashboards, or KPI interpretation change.                           | explicit scope rationale                             | N/A            |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, invoice, payout, or revenue path changes.                            | explicit scope rationale                             | N/A            |
| Incident response and support operations      | `supporting` | Supporting only: no support workflow changes; screenshot evidence documents the visual correction.                  | PR notes                                             | 5/5            |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payment, reporting, refund, invoice, payout, or reconciliation surface changes.             | explicit scope rationale                             | N/A            |
| i18n operational readiness                    | `target`     | Cards avoid layout assumptions that break with longer labels or future translated copy.                             | mobile/desktop screenshots + responsive class review | 5/5            |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React component, Tailwind tokens, and lesson view model; no new component system or dependency.      | code review + dependency diff                        | 5/5            |
| Testing and QA automation                     | `target`     | Targeted tests and refreshed screenshots cover the changed learning card/pass-criteria states.                      | local tests + screenshot artifacts + `verify:pre-pr` | 5/5            |
| Scalability and cost efficiency               | `target`     | Rendering stays proportional to current local arrays and adds no fetches or expensive runtime work.                 | code review                                          | 5/5            |
| DevOps and rollback readiness                 | `target`     | Revert is code-only with no migration/data cleanup; broad gates run before PR/merge readiness.                      | git diff + verify gates                              | 5/5            |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep the existing course client component and `/course?lesson=` route.
  - Reuse existing lesson view-model fields and avoid route-level data changes.
- TypeScript/domain:
  - Do not change `CourseLessonExperienceViewModel`, pass criteria derivation, progress status, or done-gate invariants unless a bug is proven.
  - Unknown/missing optional lesson fields should keep existing safe fallbacks.
- Supabase/data:
  - N/A: no schema, RLS, generated types, storage, or persisted user data changes.
- UI system:
  - Improve the existing Tailwind/token surface with learner-facing cards, responsive grids, and semantic headings.
  - No new design system or visual asset dependency.
  - Screenshot handoff must include before/after or after/reference artifacts for desktop and mobile.
- Testing:
  - Targeted unit/e2e coverage for common mistakes/pass criteria where practical.
  - Full `verify:pre-pr` after screenshot approval.

## Data Placement And Sync Contract

- Server-canonical data:
  - Existing course content and saved course progress remain source of truth.
- Local data:
  - Existing browser progress state remains unchanged.
- Sync policy:
  - No write/sync behavior changes.
- Retention and sensitivity:
  - No new stored data or sensitive content exposure.
- Cache/invalidation:
  - No cache behavior change.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime IDs remain unchanged.
- Human-readable identifiers:
  - Lesson titles, cue text, mistake text, correction text, and criteria copy remain editable course content.
- Mutability rules:
  - UI changes must not make display text a stable key.
- Rename vs repurpose policy:
  - Existing course identity policy remains unchanged.
- Compatibility contract:
  - Legacy IDs and metadata behavior from sibling child remain intact.
- Observability and repair:
  - Screenshot and targeted tests catch layout/state regressions.

## Forward Compatibility Contract

- Extensibility surfaces:
  - `feelCues`, `commonMistakes`, `passCriteria`, lesson variants, desktop/mobile layout, and future locale copy.
- Source of truth:
  - Existing course lesson data and `lessonExperience` view model.
- Additive behavior:
  - New cues/mistakes/criteria should render automatically without new hardcoded labels per lesson.
- Explicit mapping requirements:
  - New section types, new criteria interaction modes, or a different lesson route model require explicit design/test updates.
- Unknown or deprecated values:
  - Missing optional fields keep existing hidden/fallback behavior.
- Test/evidence:
  - Screenshot handoff for representative lesson and mobile/desktop.
  - Targeted tests for rendered mistake rows and pass-criteria state.

## Scope

- `app/course/page.tsx` learning card markup/classes for:
  - `What good looks and feels like`
  - `Common mistakes`
  - `Pass criteria`
- Targeted tests and refreshed screenshot artifacts.
- Brief/checkpoint updates for the active combined workstream.

## Out Of Scope

- Course content rewrites.
- New lesson sections or new media assets.
- Progress/done-gate data model changes.
- Admin editor changes.
- Metadata behavior already covered by the sibling child except ensuring it still passes.
- Habits, My Swim Sessions, pricing, checkout, analytics, auth, Supabase schema, or deployment config.

## Acceptance Criteria

1. Cue cards fill the desktop surface intentionally without an awkward empty grid slot.
2. Common mistakes read as learner-facing correction cards, not a generic data table.
3. Pass criteria no longer presents `Loading pass criteria...` as a polished screenshot state.
4. Mobile layout remains readable with no overlapping text or controls.
5. Existing progress/done-gate behavior remains unchanged.
6. Targeted tests and refreshed screenshots support the change before `verify:pre-pr`.

## Validation

- Targeted unit/e2e tests for changed course learning UI.
- `npm run lint:briefs:all`
- Refreshed screenshot handoff.
- `npm run verify:pre-pr`
- PR CI required checks
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-16`: Created after owner reviewed the metadata screenshot and asked to execute the recommended UI polish. Next step is a minimal course page patch plus refreshed screenshots.
- `2026-06-16`: Implemented learning-card polish for cues, common mistakes, and pass criteria. Validation: `npm run typecheck` passed, `./node_modules/.bin/vitest run tests/unit/course-page-metadata.test.ts tests/unit/course-lesson-experience.test.ts tests/unit/site-lock-metadata-routes.test.ts` passed, `npm run lint:briefs:all` passed, and `npx playwright test tests/e2e/course-lesson-experience.spec.ts tests/e2e/course-pass-criteria-visibility.spec.ts --project=desktop-chromium` passed. Screenshot handoff captured in `output/course-lesson-learning-cards-polish-2026-06-16-132852`; only tests changed after capture, so product-rendering screenshots remain current.
- `2026-06-16`: Executed owner-requested 10/10 pass: consolidated feel cues and common mistakes into one learner-facing `Coach check` card, replaced the table-like mistake layout with avoid/do-instead correction cards, added a pass-criteria readiness status, and updated the e2e layout contract for the new side-by-side desktop coach card. Validation: `npm exec prettier -- --write tests/e2e/course-lesson-experience.spec.ts` passed and `npx playwright test tests/e2e/course-lesson-experience.spec.ts tests/e2e/course-pass-criteria-visibility.spec.ts --project=desktop-chromium` passed with `3 passed`. Refreshed before/after screenshots captured in `output/course-lesson-learning-cards-10-10-2026-06-16-143216`; only docs changed after capture, so product-rendering screenshots remain current.
- `2026-06-16`: `route-label-support-surface-impact-sweep` completed before `verify:pre-pr`. Identifiers searched: `Common mistake`, `Common mistakes`, `Correction`, `Do instead`, `Loading pass criteria`, `Coach check`, and `Ready check` across `app/`, `components/`, `tests/`, and `docs/`. Updated public e2e locators for `Do instead` and the new `course-coach-check` layout; kept admin editor/help references to `Correction` intentionally because that remains the admin field name and stored content concept, not the new public card label.
- `2026-06-16`: `npm run verify:pre-pr` passed after one stale unit contract fix during the initial server/client split attempt. After CI `size-check` rejected the large split diff, the final implementation keeps the course client in `app/course/page.tsx` and the unit contract checks that file again. Full lane evidence before the size rework: quality gates passed, eslint had warnings only in pre-existing ignored output scripts, typecheck passed, unit suite passed with `247 passed / 1602 tests`, build passed, perf budgets passed, and e2e passed with `109 passed / 563 skipped`. Perf trend recommended tightening after 10 weekly green runs; decision for this scoped PR is `hold` and record a follow-up recommendation, because changing route budgets is unrelated to the metadata/UI correction and needs its own owner-approved slice.

## Completion Record

- `completed`: `2026-06-16`
- `merged_pr`: `#1140`
- `squash_commit`: `e2700977`
- `result`: Closed Course Lesson Learning Cards Polish. The mid-lesson learning surface now reads as learner coaching instead of a table: feel cues and common mistakes are grouped into a `Coach check`, mistake rows use avoid/do-instead cards, and pass criteria shows a clear readiness state without exposed loading copy.
- `validation`: Owner approved the refreshed screenshot handoff; `npm run verify:pre-pr` passed on `3e6f4ff4`; PR CI passed including `size-check`, `verify`, `e2e-smoke`, `site-lock-smoke`, CodeQL, deploy preview, and Vercel; `npm run verify:pre-merge` passed before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                      | Gaps / Notes                                              |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Learner-facing coaching sections match lesson job: feel, spot mistakes, complete criteria.                                    | None.                                                     |
| UX flow clarity                               | `5/5`          | `Coach check`, `Do instead`, and readiness status verified by screenshot and e2e.                                             | None.                                                     |
| Visual design quality                         | `5/5`          | Before/after desktop and mobile screenshots in `output/course-lesson-learning-cards-10-10-2026-06-16-143216`; owner approved. | None.                                                     |
| Business logic correctness and data integrity | `5/5`          | No progress/done-gate data model change; e2e pass criteria test passed.                                                       | None.                                                     |
| Accessibility (a11y)                          | `5/5`          | Semantic headings/lists/checkbox labels preserved; full local gate and CI passed.                                             | None.                                                     |
| Performance (CWV + payloads)                  | `5/5`          | No new dependency/media/network call; perf budgets passed.                                                                    | Budget tightening held for separate owner-approved slice. |
| Reliability and failure handling              | `5/5`          | Loading copy no longer appears as polished pass-criteria state; tests cover the state.                                        | None.                                                     |
| Content governance                            | `5/5`          | UI uses existing authored fields without rewriting lesson content.                                                            | None.                                                     |
| i18n operational readiness                    | `5/5`          | Responsive card layout avoids brittle fixed text widths and supports longer future copy.                                      | Future locales require mapping.                           |
| Stack-fit and dependency discipline           | `5/5`          | Existing course page, Tailwind tokens, and lesson view model reused; no dependency added.                                     | None.                                                     |
| Testing and QA automation                     | `5/5`          | Targeted e2e, full `verify:pre-pr`, PR CI, and `verify:pre-merge` passed.                                                     | None.                                                     |
| Scalability and cost efficiency               | `5/5`          | Rendering remains proportional to existing lesson arrays, with no fetch or paid service.                                      | None.                                                     |
| DevOps and rollback readiness                 | `5/5`          | Code-only rollback; PR size check fixed; CI and pre-merge gates passed.                                                       | None.                                                     |
