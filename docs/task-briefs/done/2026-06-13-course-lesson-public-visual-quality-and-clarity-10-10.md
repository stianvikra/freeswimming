# Task Brief: Course Lesson Public Visual Quality And Clarity (10/10)

## Metadata

- `id`: `2026-06-13-course-lesson-public-visual-quality-and-clarity-10-10`
- `status`: `done`
- `owner`: `Codex`
- `created`: `2026-06-13`
- `updated`: `2026-06-13`
- `branch`: `feat/course-lesson-public-visual-quality-2026-06-13`
- `parent`: [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- `related_done_briefs`:
  - [Lesson Experience V1 Pedagogical Layout And Fallback Data](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-experience-v1-pedagogical-layout-fallback-data-10-10.md)
  - [Course Lesson Experience Admin Editor](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-experience-admin-editor-10-10.md)

## Brief Audit Record

- `last_audited`: `2026-06-13`
- `base`: `main@aed9a9d9`
- `audit_status`: `ready`
- `decision`: Execute this as the next bounded course lesson child after V1 and admin-editor closeout.
- `reason`: PR `#1116` and closeout PR `#1117` are merged, main is clean and synced, and the admin-editor done brief deferred public visual quality/admin-note fallout by stable names.
- `must_refresh_before_execution_if`: Refresh if `/course`, `app/course/page.tsx`, `app/course/coursePlayerPolish.module.css`, `lib/course/lesson-experience.ts`, course public e2e tests, design tokens, route labels, Help/Guide rules, screenshot handoff rules, or verification lanes change before implementation completes.

## Goal

Make the public `/course` lesson page feel visually premium and pedagogically clear enough to benchmark as a 10/10 product-core screen, while keeping progress logic, admin editing, PRO, SEO, analytics, and media production out of this slice.

## Pre-Implementation Owner Explanation

Vi rydder leksjonssiden brukeren ser: video, lesson-info, piller/cues og de viktigste kortene skal bli mer tydelige, roligere og mer premium. Det betyr noe fordi denne siden er produktets hovedopplevelse og ma kunne male seg mot sterke laerings- og treningsapper. Utenfor scope er `Mark as done`-logikk, PRO/checkout, SEO-ruter, analytics, bildeopplasting og ny videoproduksjon.

## Benchmark And Visual Quality Bar

This slice uses a product-quality benchmark, not a brand-copying exercise:

- Immediate "what am I doing now?" clarity directly around the media.
- Calm, app-native hierarchy: fewer competing card weights, clearer section rhythm, stable spacing.
- Premium lesson controls that read as part of a successful learning/fitness app, not a CMS preview.
- Mobile-first scan quality: no confusing numbers/letters behind pills, no cramped labels, no overlapping text.
- Existing Freeswimming brand and route structure are preserved.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- Performance (CWV + payloads)
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Threshold / Scope Rationale                                                                                                                                 | Evidence                                                                      | Expected Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------- |
| Product goals and IA                          | `target`     | Public lesson page makes the current lesson, one cue, goal, practice path, mistakes, pass criteria, and next step clearer without changing route IA.        | before/after screenshots + course e2e assertions                              | `5/5`          |
| UX flow clarity                               | `target`     | User can scan video, current task, cue, lesson info, practice, pass criteria, and next step in order on mobile and desktop.                                 | screenshot review + targeted Playwright                                       | `5/5`          |
| Visual design quality                         | `target`     | Changed surface has premium spacing, typography, card weights, labels, and pills with no overlap, cramped text, or decorative clutter.                      | screenshot handoff across desktop/mobile                                      | `5/5`          |
| Business logic correctness and data integrity | `supporting` | Supporting only: this slice must not change progress state, lesson IDs, admin body schema, or save behavior.                                                | diff review + existing course tests                                           | `4/5`          |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin content already feeds the public layout; no admin editor control changes are planned.                                                | changed-files review                                                          | `4/5`          |
| Accessibility (a11y)                          | `target`     | Headings, labels, buttons, semantic lists, contrast, and focusable controls stay accessible after visual changes.                                           | e2e/Playwright assertions + screenshot review                                 | `5/5`          |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                          | e2e/Playwright assertions + screenshot review                                 | `5/5`          |
| Performance (CWV + payloads)                  | `target`     | `/course` keeps existing perf budget direction; no new dependency, heavy asset, route, or client bundle split is added.                                     | targeted tests + `npm run verify:pre-pr` perf lane                            | `5/5`          |
| Performance                                   | `target`     | Alias row for brief-lint closeout normalization of `Performance (CWV + payloads)`; same performance target and evidence.                                    | targeted tests + `npm run verify:pre-pr` perf lane                            | `5/5`          |
| Data placement and sync boundaries            | `supporting` | Supporting only: no new state boundary; local progress and server-canonical admin content remain unchanged.                                                 | diff review                                                                   | `4/5`          |
| Caching and invalidation strategy             | `supporting` | Supporting only: no course content loading, cache, publish, or preview invalidation behavior changes.                                                       | diff review                                                                   | `4/5`          |
| Reliability and failure handling              | `supporting` | Supporting only: loading/video failure/public fallback states must remain readable.                                                                         | targeted e2e + visual review                                                  | `4/5`          |
| Security and authz                            | `supporting` | Supporting only: no protected route, admin mutation, authz, token, or API behavior changes.                                                                 | changed-files review + existing route tests through pre-PR gate               | `4/5`          |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, analytics payload, storage, or consent surface.                                                                      | changed-files review                                                          | `4/5`          |
| Content governance                            | `supporting` | Supporting only: public render continues from canonical course content and optional `lessonExperience` fields.                                              | fixture/e2e coverage                                                          | `4/5`          |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow labels or save/publish/revision behavior changes.                                                                        | changed-files review                                                          | `4/5`          |
| SEO and crawlability                          | `supporting` | Supporting only: public markup may become clearer, but no metadata, canonical URL, sitemap, robots, or structured-data contract changes in this slice.      | diff review                                                                   | `4/5`          |
| AI discoverability                            | `supporting` | Supporting only: headings and semantic section order should improve, but structured data remains deferred.                                                  | rendered markup/e2e review                                                    | `4/5`          |
| Analytics and KPI observability               | `supporting` | Supporting only: no new event taxonomy or KPI dashboard behavior.                                                                                           | changed-files review                                                          | `4/5`          |
| Commerce and revenue ops                      | `supporting` | Supporting only: no PRO, checkout, entitlement, pricing, catalog, or CTA destination change.                                                                | changed-files review                                                          | `4/5`          |
| Incident response and support operations      | `supporting` | Supporting only: no support workflow or recovery path changes; if any user-facing action copy changes materially, update Help/Guide or record explicit N/A. | route/label/support sweep                                                     | `4/5`          |
| Finance and reporting operations              | `N/A`        | Scope rationale: no finance, reporting, revenue reconciliation, refund, payout, invoice, entitlement, checkout, or commerce data changes.                   | changed-files review                                                          | `N/A`          |
| i18n operational readiness                    | `target`     | Visual layout must tolerate longer cue/pill text and future localized lesson copy without hardcoded current-only spacing.                                   | screenshot review + e2e fixture with future-style lesson text where practical | `5/5`          |
| Stack-fit and dependency discipline           | `target`     | Reuse current `/course` route, `lessonExperience` view-model, Tailwind tokens, and existing tests; add no dependency.                                       | diff review                                                                   | `5/5`          |
| Testing and QA automation                     | `target`     | Targeted course e2e/unit coverage passes; changed brief passes lint; full `npm run verify:pre-pr` runs after screenshot approval.                           | targeted commands + pre-PR gate                                               | `5/5`          |
| Scalability and cost efficiency               | `supporting` | Supporting only: layout remains data-driven for more lessons without new query, image, storage, vendor, or runtime cost.                                    | future-value/fallback test evidence                                           | `4/5`          |
| DevOps and rollback readiness                 | `target`     | UI-only diff remains revertible with no migrations, dependencies, env vars, or destructive scripts.                                                         | git diff + rollback note + pre-merge gate                                     | `5/5`          |

## Skill / Capability Audit

- Available now: `playwright` skill for browser screenshots and UI artifact capture; current repo Playwright tests for `/course`.
- Evaluate later: `imagegen` only if a future media-production child needs generated bitmap assets; Stripe plugin only if a later PRO/checkout child changes commerce.
- Install/config changes: none.

Systemic findings:

| Surface                  | Finding                                                                                                    | Severity | Recommended Type                 | Owner Decision Needed | Follow-Up Brief Path |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | --------------------- | -------------------- |
| Public course lesson UI  | The next risk is visual/product-core quality on `/course`, not more admin editor structure.                | `high`   | `bounded implementation child`   | `no`                  | this brief           |
| Course progress behavior | `Mark as done` is a separate stateful/progress concern and should not be mixed into visual polish.         | `high`   | `bounded implementation child`   | `no`                  | future brief         |
| SEO/distribution         | Canonical routes, structured data, and distribution funnel need evidence after the public surface is good. | `medium` | `deferred architecture decision` | `yes`                 | future brief         |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md`
- Last merged workstream: PR `#1116` (`5ebd9322`) and closeout PR `#1117` (`aed9a9d9`).
- Next planning step after this child: choose between mark-as-done progress behavior, proof/trust, analytics/KPI, SEO/canonical routes, or distribution based on screenshot-approved public lesson quality.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `app/course/page.tsx` and the existing `/course` route boundary.
  - Keep the route client component model unchanged.
  - Do not add a new route, API, server action, or data fetch.
- TypeScript/domain contracts:
  - Keep `CourseLessonExperienceViewModel` and normalization behavior intact unless a small display-only helper is needed.
  - Do not change canonical lesson IDs, module IDs, progress IDs, or admin content body schema.
- Supabase/data layer:
  - N/A. No migration, RLS, generated DB types, storage, or database query changes.
- External services/tools:
  - N/A. No new provider, SDK, analytics vendor, or external asset provider.
- UI system:
  - Mature reference surface: existing V1 `/course` lesson experience and course player polish.
  - Reuse existing `PageIntro`, `PressButton`, `PressLink`, `CoursePracticeMediaFrame`, progress/status tokens, and Tailwind styling patterns.
  - Screenshot handoff comparison type: `before/after` for public `/course` desktop/mobile changed surface.
- Testing:
  - Update course e2e assertions for visual hierarchy and label clarity.
  - Run targeted tests before screenshot handoff, then full pre-PR gate only after owner approves screenshots.

## Data Placement And Sync Contract

N/A for new state. This slice changes public presentation only. Existing local progress state, signed-in progress sync, admin content loading, preview mode, and support-card data ownership remain unchanged.

## Identity And Rename Contract

- Canonical stable IDs:
  - Course module and lesson runtime IDs remain immutable and continue to own routing, progress, notes, QR links, admin preview links, and future analytics.
- Human-readable identifiers:
  - Public section labels and pill copy may change for clarity; route params, slugs, IDs, and titles do not change.
- Rename vs repurpose:
  - Visual label polish is allowed in place.
  - New learning objects, progression changes, or route identity changes require a separate brief.
- Compatibility:
  - Query-param lesson URLs such as `/course?lesson=intro-course--welcome-course-structure` remain valid.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Lesson-experience display containers, lesson types, cue/pill labels, practice sections, pass criteria, next-step copy, public support card placement, future locales, and future course lessons.
- Source of truth:
  - Public layout continues to render from canonical course content and `lessonExperience` fields, not route-local hardcoded lesson IDs.
- Additive behavior:
  - New concept, dryland, water-drill, swim-set, and custom lessons should inherit the same visual hierarchy and safe display rules.
  - Longer future cue/pill text should wrap cleanly without overlapping neighboring UI.
  - Missing optional sections remain omitted or use existing fallback media states.
- Explicit mapping requirements:
  - New public CTA actions, protected progress actions, route families, canonical lesson URLs, structured data, analytics events, PRO destinations, external media providers, or locale workflows require explicit mapping, tests, and docs.
- Unknown or deprecated values:
  - Unknown lesson variants fall back through existing lesson-type defaults.
  - Unknown optional fields are ignored publicly.
  - Unknown action destinations remain out of scope and must fail closed in future protected slices.
- Test/evidence:
  - Course e2e must keep a future-style fixture or assertions proving the visual layout is not hardcoded to the current production intro lesson only.

## Scope

- Public `/course` lesson page visual hierarchy and clarity:
  - video-adjacent lesson info,
  - current lesson focus,
  - cue/pill design and copy,
  - practice-section card rhythm,
  - common mistake/correction readability,
  - pass criteria / next-step visual relationship,
  - mobile and desktop spacing.
- Task brief and parent child-table updates.
- Targeted tests for changed public lesson behavior.

## Out Of Scope

- `Mark as done` state machine, unlock rules, persistence, sync, or copy beyond preserving current behavior.
- Admin editor controls, admin save/publish/rollback behavior, bulk import, inline editing, or Help/Guide admin instructions.
- PRO, checkout, pricing, entitlement, commerce CTA policy, finance, refunds, or catalog changes.
- SEO canonical route upgrade, structured data, sitemap, robots, metadata, or AI discoverability schema.
- Analytics/KPI event taxonomy or dashboard changes.
- Image upload/storage/media library, generated lesson visuals, video production, or new external assets.
- New dependencies, migrations, API routes, server actions, env vars, or external services.

## Help / Guide Impact

- Default: N/A because this slice changes public visual presentation and section labels only, not admin/operator workflow, recovery behavior, or a documented Help/Guide procedure.
- If implementation changes user action semantics, recovery copy, support CTA destinations, or admin-visible workflow labels, update Help/Guide in this PR or record the explicit deferred decision before `verify:pre-pr`.

## Route / Label / Support-Surface Impact Sweep

Run before `verify:pre-pr` because this slice changes public labels and support-adjacent copy.

Identifiers searched:

- `Lesson focus`
- `Dryland practice`
- `Dryland prep`
- `One cue`
- `Focus`
- `Feel cues`
- `Key reminder`
- `Pool drill`
- `Common mistakes`
- `Pass criteria`
- `Lesson info under video`
- `Before Water pill`
- `Pill focus`
- `8593d718`
- `042757a0`
- `488f7290`

Surfaces checked / directories checked:

- `app/`
- `components/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- active/planned/done task briefs touching `/course` or admin content

## Production Admin Notes Audit

- Included in this PR:
  - `8593d718...` / `Lesson info under video`: public lesson-info placement and hierarchy.
  - `042757a0...` / `Before Water pill / Sorte tall`: public pill/cue clarity.
  - `488f7290...` / `Pille Foucs med tall og bokstaver bak`: public pill/cue clarity.
- Deferred from this PR:
  - `49043378...` / `Lesson Page - Mark as done`: belongs in `Deferred: course lesson mark-as-done progress behavior`.
- Rationale: visual clarity can be judged and shipped independently; mark-as-done behavior is stateful progress logic.

## Screenshot Handoff Requirement

This is UI/layout work. Stop after screenshot handoff and owner visual approval before `npm run verify:pre-pr`, commit, PR creation, or pre-merge.

Required artifacts:

- `before-course-lesson-desktop.png`
- `after-course-lesson-desktop.png`
- `before-course-lesson-mobile.png`
- `after-course-lesson-mobile.png`
- Optional `after-course-lesson-tablet.png` if the changed hierarchy needs a mid-width check.

Handoff must include:

- clickable `Screenshot artifacts` folder link,
- `Captured: YYYY-MM-DD HH:MM` local time,
- `before/after` statement,
- one short explanation per representative screenshot,
- known visual caveats or judgement calls.

High-cost UI/export debug path:

- Used `docs/runbooks/ui-debug-hypothesis-and-handoff.md` for the screenshot capture loop.
- Actual consumed artifact: `output/course-lesson-public-visual-quality-2026-06-13-220839`.
- First pre-PR screenshot-test failure was verified from the actual Playwright failure artifact and traced to a deterministic strict-mode duplicate text locator introduced by the new lesson-info strip, not to a product screenshot rendering defect.
- The screenshot-capture assertion now scopes the existing `Lesson 1 of ...` check to the course overview meta row, and isolated evidence passed before rerunning the full gate.

## Acceptance Criteria

1. A new in-progress brief scopes the public visual quality child and maps all scorecard categories.
2. Parent course lesson brief links this child and no longer points V1/admin-editor to stale in-progress paths.
3. Public `/course` places the current lesson/task information in a clearer video-adjacent hierarchy.
4. Cue/pill labels and styling avoid confusing numbers/letters behind pills and remain readable on mobile/desktop.
5. Lesson focus, practice, feel cues, mistakes, pass criteria, and next step read as one coherent premium lesson flow.
6. Concept lessons without practice sections remain visually coherent and do not imply water practice.
7. Water-drill lessons with both land and water practice keep the pedagogical order and media fallbacks.
8. No progress, admin editor, API, Supabase, auth, commerce, SEO route, or analytics behavior changes.
9. Targeted course tests pass before screenshot handoff.
10. Screenshot handoff is approved before pre-PR automation continues.
11. `npm run verify:pre-pr` passes before PR handoff after screenshot approval.

## Validation

Before screenshot handoff:

- `npm run lint:briefs`
- Targeted course e2e/unit tests for changed `/course` assertions.
- Targeted route/label/support sweep.
- Browser screenshot capture for before/after desktop and mobile.

After owner screenshot approval:

- `npm run verify:pre-pr`
- Commit, push, PR handoff, CI checks.
- `npm run verify:pre-merge` before merge recommendation.

## Checkpoint Log

- `2026-06-13 | in-progress | created child from clean synced `main@aed9a9d9`after PR #1116 and closeout PR #1117; scope is public`/course` visual quality, lesson-info hierarchy, and pill/cue clarity only; mark-as-done progress behavior remains deferred | next: implement scoped UI/test changes, run targeted validation, capture screenshot handoff, and wait for owner approval before pre-PR gate`
- `2026-06-13 | screenshot-review | implemented video-first mobile order, public lesson-info strip under video, calmer cue/pill hierarchy, lighter dryland step markers, parent brief child-status update, and targeted e2e coverage for lesson-info placement/mobile order. Local evidence: `npm run lint:briefs:all`PASS,`npm run typecheck`PASS, targeted Playwright`course-lesson-experience.spec.ts course-desktop-player-polish.spec.ts --project=desktop-chromium --project=mobile-chromium`PASS with 5 passed / 5 expected skips, route/label/support sweep completed for the scoped identifiers, and`git diff --check`PASS. Screenshot artifacts captured at`output/course-lesson-public-visual-quality-2026-06-13-211939`as before/after desktop/mobile. Next: owner screenshot approval before`npm run verify:pre-pr`, commit, PR creation, CI, and `npm run verify:pre-merge`.`
- `2026-06-13 | screenshot-review refresh | owner correctly flagged that the initial screenshot handoff only showed the first viewport and was not enough to judge full lesson quality. Added full-page desktop/mobile screenshots plus clean review-crops for player+lesson-info and full lesson-experience sections in the same artifact folder. The clean review-crops hide fixed header/bottom nav only for section review; full-page screenshots preserve the real page context. Next: owner evaluates the refreshed artifacts before `npm run verify:pre-pr`.`
- `2026-06-13 | screenshot-review correction | owner rejected the refreshed artifacts because `Cue to keep`was unclear, concept lesson focus used a sparse 3-column layout, concept`Feel cues`duplicated the same idea, and the screenshot set still did not show dryland/pool-drill image sections. Fixed the public contract: concept lessons use`Focus`, duplicate concept cues are hidden, goal/quick explanation uses two columns when only two focus blocks render, dryland practice is labeled `Dryland practice`, water practice is labeled `Pool drill`, and new artifacts include both intro/concept and `body-position--body-position-front`drill screenshots with dryland image, pool drill image, steps, feel cues, mistakes, pass criteria, next step, and support. Local evidence after code changes:`npm run typecheck`PASS and targeted Playwright`course-lesson-experience.spec.ts course-desktop-player-polish.spec.ts --project=desktop-chromium --project=mobile-chromium`PASS with 5 passed / 5 expected skips. Next: owner evaluates the corrected named artifacts before`npm run verify:pre-pr`.`
- `2026-06-13 | screenshot-review hierarchy correction | owner flagged that `Why this matters`should sit under`Goal`and`Quick explanation`, not as a third equal column. Updated the focus card hierarchy so primary lesson intent remains in the top two-column row while `Why this matters` renders as a full-width support callout below. Next: rerun targeted validation and regenerate screenshot artifacts before owner review.`
- `2026-06-13 | screenshot-review handoff ready | regenerated screenshots at `output/course-lesson-public-visual-quality-2026-06-13-220839`after the focus hierarchy correction. Local evidence:`npm run typecheck`PASS,`npm run lint:briefs:all`PASS,`git diff --check`PASS, targeted Playwright`course-lesson-experience.spec.ts course-desktop-player-polish.spec.ts --project=desktop-chromium --project=mobile-chromium`PASS with 5 passed / 5 expected skips, and a route/label/support sweep confirmed public labels while admin/help editor labels remain intentionally unchanged. Next: owner screenshot approval before`npm run verify:pre-pr`, commit, PR creation, CI, and `npm run verify:pre-merge`.`
- `2026-06-13 | pre-pr correction | first full `npm run verify:pre-pr`run reached E2E and failed only in`mobile-screenshots.spec.ts`because the new lesson-info strip intentionally adds a second`Lesson 1 of 12`text node. Updated that screenshot-capture assertion to scope`Lesson 1 of ...`to the existing course overview meta row via the status-chip parent. Isolated evidence:`npx playwright test tests/e2e/mobile-screenshots.spec.ts --project=mobile-chromium`PASS. Next: rerun full`npm run verify:pre-pr`.`
- `2026-06-13 | pre-pr qa hardening | full `npm run verify:pre-pr`rerun reached E2E and failed only in`install-prompt.spec.ts`mobile Chromium because the helper waited on`course-nav-lessons`while the real lessons button was present by accessible name. Hardened the install-prompt helper to prefer the test id and fall back to`Open/Close lessons menu`, keeping the product path unchanged. Isolated evidence: `npx playwright test tests/e2e/install-prompt.spec.ts --project=mobile-chromium -g "main menu announces native install dismissal as local feedback"`PASS. Next: rerun full`npm run verify:pre-pr`.`
- `2026-06-13 | pre-pr green | full `npm run verify:pre-pr`PASS on the final runtime/test diff after install-prompt hardening. Evidence: full lane selected for 8 changed files, quality gates PASS, lint/typecheck/unit/build/perf budgets PASS, and Playwright PASS with 109 passed / 551 skipped. No product-rendering files changed after the approved screenshot capture; only test and brief evidence changed. Next: commit, push, open PR, monitor CI, and run`npm run verify:pre-merge` before merge.`
- `2026-06-13 | merged | PR #1118 merged as squash commit `a8935b6d`after local`npm run verify:pre-pr`PASS, local`npm run verify:pre-merge`PASS, green required GitHub checks, and owner-approved screenshot artifacts at`output/course-lesson-public-visual-quality-2026-06-13-220839`. Next: closeout brief moved to done.`

## Completion Record

- `completed`: `2026-06-13`
- `merged_pr`: `#1118`
- `squash_commit`: `a8935b6d`
- `result`: Closed Course Lesson Public Visual Quality And Clarity. The public course lesson page now puts lesson info directly under the player, uses clearer Focus/One cue, Dryland practice, and Pool drill language, keeps concept lessons calm without duplicate cue blocks, and makes dryland/pool practice sections easier to judge from the lesson page.
- `validation`: Owner-approved screenshot handoff at `output/course-lesson-public-visual-quality-2026-06-13-220839`; targeted course Playwright PASS with 5 passed / 5 expected skips; isolated mobile screenshot and install-prompt regression tests PASS; `npm run verify:pre-pr` PASS on full lane for `604d02c0` with 109 Playwright tests passed / 551 skipped; GitHub CI PASS for PR #1118; `npm run verify:pre-merge` PASS before merge.
- `10/10 claim`: yes - all critical target categories and the i18n target reached `5/5` for this bounded public lesson-page slice; mark-as-done progress behavior, PRO/commerce, SEO/canonical routes, analytics/KPI, and new media production remain explicitly deferred to separate children.

| Category                            | Achieved Score | Evidence                                                                                                                             | Gaps / Notes                                                                                           |
| ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Product goals and IA                | `5/5`          | PR #1118 merged; lesson-info, public labels, concept/drill hierarchy, and course e2e assertions passed.                              | Mark-as-done progress behavior remains a separate stateful child, not a gap in this visual slice.      |
| UX flow clarity                     | `5/5`          | Player-first flow, lesson-info strip, Focus/One cue distinction, dryland/pool drill labels, and owner-approved screenshots.          | No active gap in this slice.                                                                           |
| Visual design quality               | `5/5`          | Screenshot artifacts: `output/course-lesson-public-visual-quality-2026-06-13-220839`; owner approved after hierarchy corrections.    | No product-rendering files changed after the approved screenshot capture.                              |
| Accessibility (a11y)                | `5/5`          | Semantic sections and labels preserved; targeted Playwright and full verification lane passed across the supported local matrix.     | No active gap in this slice.                                                                           |
| Accessibility                       | `5/5`          | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility evidence.                              | No active gap in this slice.                                                                           |
| Performance (CWV + payloads)        | `5/5`          | `npm run verify:pre-pr` perf budgets PASS; `/course` LCP `100ms`, CLS `0.000`, JS `311.5kb`; no dependency or heavy asset added.     | No active gap in this slice.                                                                           |
| Performance                         | `5/5`          | Alias row for brief-lint closeout normalization of `Performance (CWV + payloads)`; same performance evidence.                        | No active gap in this slice.                                                                           |
| i18n operational readiness          | `5/5`          | Labels/pills wrap in the data-driven public lesson layout; mobile screenshot and e2e coverage passed after duplicate text hardening. | Full locale workflow remains future explicit mapping, as scoped in the forward-compatibility contract. |
| Stack-fit and dependency discipline | `5/5`          | Reused `/course`, existing lesson-experience view model, CSS module, media frame, and Playwright coverage; no new dependency.        | No active gap in this slice.                                                                           |
| Testing and QA automation           | `5/5`          | Targeted course tests, isolated regression tests, `npm run verify:pre-pr`, GitHub CI, and `npm run verify:pre-merge` all passed.     | No active gap in this slice.                                                                           |
| DevOps and rollback readiness       | `5/5`          | Squash commit `a8935b6d`; rollback via `git revert a8935b6d`; no migration, env var, dependency, or destructive script change.       | No active gap in this slice.                                                                           |
