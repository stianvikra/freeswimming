# Task Brief: Course Lesson Experience V1 Pedagogical Layout And Fallback Data (10/10)

## Metadata

- `id`: `2026-06-13-course-lesson-experience-v1-pedagogical-layout-fallback-data-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-13`
- `updated`: `2026-06-13`

## Brief Audit Record

- `last_audited`: `2026-06-13`
- `base`: `main@81ef191a`
- `audit_status`: `ready`
- `decision`: Execute this as the first bounded implementation child, tightened to a skeleton-first lesson experience with one representative lesson.
- `reason`: `/course` already has video playback, progress, pass criteria, common mistakes, support cards, admin content loading, and tests; V1 should prove the pedagogical page skeleton and fallback contract before producing the full course, broad content rewrites, admin/PRO/SEO expansion, or many new lessons.
- `must_refresh_before_execution_if`: Refresh if the parent brief, `/course`, course data loader, admin content body mapping, progress/status helpers, design tokens, screenshot handoff rules, route labels, analytics contracts, commerce routes, or verification lanes change.

## Parent

- [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- [Course Lesson Experience Admin Editor](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-admin-editor-10-10.md)

## Goal

Upgrade the learner lesson page into a simpler, more pedagogical, fallback-safe lesson skeleton that proves the Freeswimming signature model with one existing representative swimming lesson while all other lessons keep safe fallback behavior.

## Pre-Implementation Owner Explanation

Vi bygger først selve undervisningsrammen for en kursleksjon. Brukeren skal raskt forstå målet, forklaringen, hva som kan øves på land, hva som skal prøves i vann, vanlige feil, følelsen de leter etter, og neste steg. Utenfor denne slicen er å skrive hele kurset, lage mange nye leksjoner, gjøre full innholdsrewrite, bygge PRO-lagring, checkout, AI-planer, admin-redigering av nye felt, nye canonical ruter eller ny videoproduksjon.

## V1 Product Shape

Default learner path:

1. Watch
2. Goal
3. Quick explanation
4. Why this matters
5. Land practice
6. Water practice
7. Feel cues
8. Common mistakes
9. Check
10. Next step
11. Calm PRO/support after free value

V1 must preserve the principle:

- Free users can learn the lesson.
- PRO is framed only as systemization.
- The page never requires both a short and long video.
- Missing optional fields must not create empty UI.
- Future lessons use the same data-driven skeleton without route-local per-lesson branches.

## Reference App Audit Notes

- MasterClass's premium lesson pattern supports making the video the first real lesson surface and avoiding duplicate pre-video summaries: `https://www.masterclass.com/`.
- Brilliant's learn-by-doing pattern supports short explanatory blocks followed by clear practice steps instead of dense up-front text: `https://brilliant.org/`.
- Duolingo's bite-size learning pattern supports compact progression and momentum, but the V1 course page should avoid excessive gamification because swim technique and safety need calm focus: `https://www.duolingo.com/`.
- MySwimPro's swim-specific pattern supports keeping technique videos, drills, practice structure, and tracking/progress visible without turning every lesson into a content wall: `https://myswimpro.com/`.
- V1 decision: remove the public `Lesson in 30 seconds` card from the page. Treat that idea as a future video-production/script concept, while the page itself flows video first, then structured learning sections.
- V1 design decision: the selected representative lesson should include one land-practice visual and one water-practice visual so the page can be judged as a real lesson surface, while the full course image library remains a later production child.

## V1 Commercial Proof Boundary

V1 is not expected to prove the full business model, but it must make the first proof step possible.

V1 must prove:

- One representative existing swimming lesson can become genuinely excellent without requiring a separate app or new backend.
- Other existing lessons still render through the same skeleton from current fields and safe fallbacks.
- Free learning feels complete before any PRO or support CTA appears.
- The user can answer: why should I do this, what should I do, what should I feel, what mistake should I avoid, and what is next?
- PRO/systemization CTAs appear after useful lesson value, not before.
- The screenshot handoff explicitly evaluates whether the user understands what to try in the water.

V1 must not try to prove yet:

- paid conversion,
- long-term retention,
- AI plans,
- habit/micro-session persistence,
- canonical lesson SEO route performance,
- full admin editorial workflow,
- distribution channel performance.

Those are parent-owned future children.

## Recommended Data Model Direction

Do not add dozens of required top-level fields. Add a nested optional `lessonExperience` object plus a typed view-model that maps current fields into the new display contract.

Tightened V1 data shape:

```ts
type CourseLessonExperienceViewModel = {
  goal: string;
  primaryCue: string;
  quickExplanation: string;
  whyThisMatters?: string;
  landPractice: {
    title: string;
    steps: string[];
    image?: { src?: string; alt?: string; caption?: string };
  };
  waterPractice: {
    title: string;
    steps: string[];
    safetyNote?: string;
    image?: { src?: string; alt?: string; caption?: string };
  };
  commonMistakes: Array<{ mistake: string; fix?: string }>;
  feelCues: string[];
  masteryCriteria: string[];
  nextStep: string;
  support: { title: string; body: string };
};
```

Fallback mapping:

- `goal` maps to view-model goal.
- `goal` plus `cues[0]` maps to quick explanation when richer copy is absent.
- `whyThisMatters` renders only when authored; no public `New Field` placeholder should appear on existing lessons.
- `cues[0]` maps to primary cue and the first feel cue.
- `cues.slice(1)` maps to additional feel cues.
- `drill.title` and `drill.steps` map to water practice when richer fields are absent.
- Land practice falls back to a short dryland rehearsal derived from the primary cue.
- `commonMistakes[]` maps to mistakes with the mistake text only.
- `passCriteria[]` maps to mastery criteria.
- `nextStep` maps to next-step copy.
- `estMinutes`, `lessonType`, and module context map to compact lesson metadata.
- `landPractice.image` and `waterPractice.image` are optional single-image slots; missing images render a stable fallback media container and local-path-only `src` values are accepted in V1.

## V1 Scope

- Inspect current `/course` learner implementation, data loader, admin content body mapping, video player, progress, support-card, and tests before editing.
- Create the fallback-safe lesson experience view-model.
- Use exactly one existing representative swimming lesson as rich V1 test data/reference. Recommended lesson: `body-position--body-position-front` (`mod4-l3` legacy), because it is a practical water-skill lesson with clear land and water practice needs.
- Reuse existing lesson content where possible and add only fallback/view-model fields needed for layout:
  - goal,
  - quick explanation,
  - why this matters,
  - land practice,
  - one optional image slot for land practice, with one representative V1 visual for the selected lesson,
  - water practice,
  - one optional image slot for water practice, with one representative V1 visual for the selected lesson,
  - common mistakes,
  - feel cues,
  - next step,
  - calm PRO/support after free value.
- Update `/course` lesson content presentation to render the skeleton in the tightened default path:
  - compact lesson metadata and primary cue,
  - one main video as the first lesson surface after header/progress,
  - no separate `Lesson in 30 seconds` text card on the public page,
  - goal,
  - quick explanation,
  - `Why this matters` as a full-width bridge before practice sections when authored,
  - land practice,
  - water practice with visible safety note when present,
  - representative land/water visuals for the selected lesson plus stable image containers and calm missing-image fallback for lessons without visuals,
  - feel cues as a full-width water-practice companion section directly after water practice,
  - common mistakes as linked mistake/correction rows where one row owns one pair,
  - common mistakes and simple fixes when present,
  - mastery criteria and existing pass criteria behavior,
  - next step,
  - existing support actions calmly after free lesson value.
- Do not add quick-demo media, equipment blocks, visualization, memory checks, make-easier/make-harder, merch/T-shirt CTAs, share CTAs, or new PRO destinations in this child.
- Do not produce the full course image library in this child; only add two representative visuals for the selected lesson plus the optional, data-driven slot and fallback.
- Do not build admin editing for linked mistake/correction rows or image upload in this child; the planned admin editor brief owns that workflow.
- Keep existing lesson IDs, progress sync, pass criteria, preview mode, admin notes context, QR behavior, and support-card behavior intact.
- Capture screenshot handoff before broad gates.

## Out Of Scope

- Admin editor UI for every new pedagogical field.
- Supabase migration or generated DB type changes.
- PRO save mutations for weekly micro-session, habits, programme, or AI plan.
- Swimmer profile onboarding save flow.
- New checkout, Stripe, entitlement, refund, invoice, payout, or finance behavior.
- New analytics dashboard.
- Canonical `/course/<lesson>` routes or sitemap changes.
- Final Cut Pro, new lesson video production, or generated bitmap assets.
- Public course image asset manager, admin upload flow, or full admin editor for the new V1 fields.
- External image URL allowlisting; V1 accepts local/public image paths only and ignores unknown external `src` values.
- Admin UX research, inline-editing decision, autosave/publish decision, and high-volume lesson editor implementation.
- Broad redesign of `MenuDrawer`, My Library, workout builder, or admin workspace.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the scoped V1 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Reliability and failure handling
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                    | Evidence                                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | V1 renders the tightened free lesson path in the agreed order, proves one existing representative lesson can carry the skeleton, and keeps PRO/support as post-value systemization/help.              | screenshots + copy review + tests                                        | `5/5`                   |
| UX flow clarity                               | `target`     | A first-time user can identify goal, cue, video, land practice, water practice, common mistakes, feel cues, check criteria, next step, and optional support without dead ends.                        | screenshot handoff + Playwright smoke                                    | `5/5`                   |
| Visual design quality                         | `target`     | The route feels calmer and more premium than the current lesson page, with stable responsive layout, no nested-card clutter, and no generic marketing weight.                                         | before/after screenshot handoff                                          | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing lessons load when all new fields are missing, and progress/pass-criteria/video behavior remains deterministic.                                                                               | unit fallback tests + existing course e2e                                | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: V1 may read JSON/body fields or static fallback data, but full editor ergonomics is a separate admin governance child.                                                               | explicit follow-up path + no admin behavior regression                   | `4/5`                   |
| Accessibility (a11y)                          | `target`     | New sections use semantic headings, accessible buttons/links, keyboard-safe disclosure controls, image alt rules, and non-color-only meaning.                                                         | component/e2e assertions + screenshot review                             | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/course` keeps route budget intent, avoids new dependencies, avoids eager heavy media, and renders missing optional content without layout jumps.                                                    | perf budget gate + dependency diff review                                | `5/5`                   |
| Data placement and sync boundaries            | `target`     | V1 states which fields are server-canonical course content, which state stays local, and which PRO saves are intentionally not implemented.                                                           | data contract in brief + code review                                     | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Published content revalidation and preview behavior remain unchanged unless explicitly tested and documented.                                                                                         | loader tests + preview smoke                                             | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing video, missing optional sections, empty arrays, malformed optional values, and unknown CTA destinations render safe fallbacks.                                                                | negative-path fixtures + manual QA                                       | `5/5`                   |
| Security and authz                            | `target`     | V1 does not expose admin-only data, does not weaken protected APIs, and routes gated save actions to login/PRO placeholders without mutation.                                                         | diff review + no protected route changes + negative-path rationale       | `5/5`                   |
| Privacy and compliance                        | `target`     | No new personal data is collected; any programme CTA copy makes clear that saving answers is not part of V1.                                                                                          | copy review + no new storage/API writes                                  | `5/5`                   |
| Content governance                            | `target`     | New display contract documents fallback ownership, limits V1 to one representative rich lesson, and marks admin-field editability/full course rewrite as explicit follow-ups before broad rollout.    | view-model tests + parent child-plan link                                | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting because V1 should not add high-frequency admin field editing yet; existing course admin flows must remain unchanged.                                                                       | admin regression tests or rationale                                      | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting because V1 improves semantic headings on `/course`, but canonical lesson routes and sitemap behavior are deferred.                                                                         | markup review + deferred SEO child                                       | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting because V1 creates stable semantic lesson sections, while structured data and canonical route decisions are deferred.                                                                      | rendered section review                                                  | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting because V1 may add safe wrappers only if existing analytics conventions fit; full event taxonomy is a later child.                                                                         | no-new-dependency diff + analytics follow-up                             | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Existing support actions route honestly to existing destinations, appear after lesson value, and never imply free lesson content is incomplete; new commerce/merch/PRO destinations are out of scope. | copy review + route assertions                                           | `5/5`                   |
| Incident response and support operations      | `supporting` | Supporting because V1 adds visible fallback behavior but no critical operator workflow; support diagnostics can stay in follow-up unless a new failure mode is introduced.                            | fallback QA + follow-up note                                             | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because V1 changes no payments, prices, invoices, refunds, payouts, entitlements, or finance reporting truth.                                                                                     | explicit non-commerce scope rationale                                    | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because V1 should avoid layout assumptions that block future locales, but no locale routing or translation workflow changes now.                                                           | responsive screenshot review + copy structure review                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js, TypeScript, Tailwind, UI primitives, content loader, and test patterns with no new dependency unless explicitly justified.                                                      | dependency diff + code review                                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit tests for mapping and missing-field behavior, keep relevant course e2e green, capture screenshots, and pass local gates.                                                            | targeted tests + screenshots + `verify:pre-pr` after screenshot approval | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Future lessons can be added through data with no route-local per-lesson branches and no heavy required assets.                                                                                        | future-value fixture + code review                                       | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Slice stays isolated to course lesson rendering/data docs/tests, uses screenshot artifacts, and can be reverted without schema rollback.                                                              | PR diff + rollback note                                                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `/course` and current player/progress route state.
  - Prefer extracting pure view-model helpers and small presentational components over expanding one giant JSX block further.
  - Keep client component boundaries compatible with the existing video/player state.
- TypeScript:
  - Add optional typed data contracts and normalization helpers.
  - Treat unknown/malformed optional values as absent.
  - Keep old fields required only where they are already required today.
- Supabase:
  - No migration in V1.
  - `lib/admin/content-course.ts` may pass through optional JSON body fields only when fallback-safe.
- UI:
  - Reuse `PressButton`, `PressLink`, `cx`, existing token classes, and course visual language.
  - Do not add marketing-style hero bloat.
  - Screenshot handoff must include mobile and desktop, and should compare before/after on the same route where practical.
  - Screenshot review must answer whether a learner understands what to try in the water without reading every detail.
- Testing:
  - Unit tests for view-model fallback.
  - Unit/content-loader tests if body mapping changes.
  - Existing course e2e affected by goal/common mistakes/pass criteria updated deliberately.

## Data Placement And Sync Contract

- Server-canonical:
  - Course modules and lessons from published admin content and current fallback `COURSE_MODULES`.
- Optional V1 lesson-experience fields if present in course lesson body or local static fallback data.
- Local-only:
  - Existing common-mistakes expansion state, overview expansion, install prompt state, and progress buffers stay as designed.
  - No new local persistence for PRO saves in V1.
- Sync policy:
  - Course progress sync remains unchanged.
- PRO/save actions are not implemented in V1. Existing support links remain normal navigation and write no new course state.
- Retention and sensitivity:
  - V1 collects no new personal data.
  - Safety copy stays public and visible.
- Cache/invalidation:
  - Preserve published course content revalidation and preview mode.
  - If optional body fields are passed through, they follow the existing course content cache.

## Identity And Rename Contract

- Canonical stable ID:
  - Existing course lesson runtime ID remains the source of truth for URL query param, progress, notes, QR, analytics, and future mapping.
- Human-readable identifiers:
  - Lesson title, category, level, cue, feeling, equipment labels, and next lesson title are display content.
- Mutability rules:
  - Display content can be edited in place when the lesson's learning object remains the same.
  - Runtime IDs must not be repurposed.
- Rename vs repurpose:
  - Rename text in place for copy clarity.
  - Create a new lesson when the skill, progression position, or learning object materially changes.
- Compatibility:
  - Existing legacy aliases remain supported.
  - V1 does not change route params or redirects.

## Forward Compatibility Contract

- Extensibility surfaces:
- Lesson metadata, optional sections, support CTA destinations, next lesson references, proof/trust snippets, distribution entrypoints, and future analytics values.
- Source of truth:
  - Render from current `CourseLesson` data plus optional normalized lesson-experience data.
  - Next lesson should derive from canonical course order when explicit next lesson data is missing.
- Additive behavior:
  - New lessons with only current fields still render the V1 path.
  - New lessons with richer skeleton fields render richer sections without code changes.
  - New lessons can add `whyThisMatters`; lessons without it do not render a blank public section.
  - New lessons can add one local/public image per land practice and water practice without route-local code.
  - Lessons with no practice images still keep a stable media layout through the fallback container.
  - Future proof/trust snippets and distribution entrypoints should not require reworking the V1 lesson layout; they require explicit mapped sections when introduced.
- Explicit mapping requirements:
  - New CTA action types, PRO save destinations, merch routes, canonical lesson routes, analytics event names, structured data types, distribution channels, proof-claim types, external image/storage domains, image upload workflows, and admin field editors require explicit code/copy/test updates.
- Unknown or deprecated values:
  - Unknown optional fields are ignored.
  - Unknown CTA actions do not render.
  - Missing videos hide the player and keep lesson content useful.
- Test/evidence:
  - Include a fixture with rich V1 fields for the one representative lesson, a fixture with only current fields, and a fixture proving future lessons are not hardcoded to the selected lesson ID.

## Help / Guide Impact

- V1 changes public learner page behavior and support CTA copy, but not admin workflow labels or recovery paths.
- If route labels, support CTA destinations, or Help/Guide assertions change during implementation, update the relevant Help/Guide/runbook surfaces in the same PR.
- If no admin/user workflow support labels change, record explicit `N/A` rationale in closeout.

## Route / Label / Support-Surface Impact Sweep

Required before `verify:pre-pr` if the implementation changes:

- route params,
- visible CTA labels,
- support-card actions,
- Help/Guide assertions,
- QR/link behavior,
- PRO/plan/merch destinations,
- admin workflow labels.

Minimum sweep paths:

- `app/`
- `components/`
- `tests/`
- `docs/`
- active/planned/done task briefs touching `/course`

Implementation sweep evidence:

- Identifiers searched: `Lesson focus`, `course-lesson-focus`, `Visual not added yet`, `body-position-front-wall-line`, `body-position-front-glide`, `published-course-modules-v4`, `Lesson in 30 seconds`, and `course-lesson-quick-start`.
- Surfaces checked: `app/`, `lib/`, `tests/`, `docs/task-briefs/`, `docs/runbooks/`, and `public/`.
- Fallout handled: the removed `Lesson in 30 seconds` public card remains only in the brief rationale and e2e assertions that verify it is absent; `Visual not added yet` remains only as the intentional fallback for lessons without images; the new image assets are referenced from static course fallback data and content-loader tests; no route params, support destinations, Help/Guide assertions, QR behavior, PRO/plan/merch destinations, or admin workflow labels changed in this V1 slice.

## Screenshot Handoff Requirement

This is visual UI work. After targeted tests are stable and before `npm run verify:pre-pr`, capture screenshot artifacts using the repo screenshot rule.

Required screenshots:

- `before-course-lesson-mobile.*`
- `after-course-lesson-mobile.*`
- `before-course-lesson-desktop.*`
- `after-course-lesson-desktop.*`

If direct before-state capture is not practical, use `after/reference` filenames and explain the comparison.

Screenshot review questions:

1. Can a learner understand the lesson goal and cue quickly?
2. Is it clear what to try on land and in water?
3. Does the page feel complete for free users before PRO/support CTAs?
4. Are PRO/support CTAs useful and calm rather than intrusive?
5. Does the page avoid clutter despite adding richer pedagogy?

## Acceptance Criteria

1. Existing lesson pages still load with current course data only.
2. The selected representative lesson with V1-rich fields renders every scoped skeleton section.
3. A lesson missing V1 fields renders gracefully without empty headings or blank cards.
4. One main video works as the default model and appears before the detailed lesson sections.
5. No public `Lesson in 30 seconds` text card duplicates the video or lesson overview.
6. No optional quick-demo media is added in this skeleton-first child.
7. No lesson requires two videos.
8. Land practice, water practice, mistakes/fixes, feel cues, safety, mastery, and next step remain free.
9. `Why this matters` renders full-width after goal/quick explanation when authored and does not render a public placeholder when missing.
10. The selected representative lesson renders one relevant land-practice visual and one relevant water-practice visual with useful alt text.
11. Lessons without practice images still render one media slot each, with accessible fallback copy when no image is present.
12. Feel cues render full-width directly after water practice.
13. Common mistakes render as linked mistake/correction rows, never as independent left/right lists.
14. Missing correction data renders safely without losing the mistake.
15. Existing support CTA copy is honest and non-blocking.
16. Support CTAs appear after free lesson value is visible.
17. Screenshot handoff explicitly evaluates whether the user understands what to try in the water.
18. Existing course progress, pass criteria, navigation, preview mode, admin notes context, and support cards do not regress.
19. Mobile and desktop screenshots are approved before PR gate.
20. Targeted tests and `npm run verify:pre-pr` pass before PR handoff.

## Validation

- Targeted unit tests for lesson experience mapping.
- Targeted content-loader tests if `lib/admin/content-course.ts` changes.
- Relevant course e2e tests for pass criteria, common mistakes, and desktop player polish.
- Screenshot handoff before broad gate.
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` before merge recommendation.

## Checkpoint Log

- `2026-06-13 | planned | created first child brief for fallback-safe course lesson V1; next: move to in-progress only after owner approves implementation execution`
- `2026-06-13 | planned | clarified that V1 proves the first commercial/pedagogical step only: 2-5 excellent representative lessons, complete free learning, post-value PRO CTAs, and screenshot review of whether learners understand what to do in the water; next: keep later PRO/admin/analytics/SEO/distribution work in parent-owned future children`
- `2026-06-13 | in-progress | owner explicitly narrowed and started V1 child after PR #1113 merged: skeleton-first lesson experience with one existing representative lesson, no full course production, no many-lesson rewrite, and screenshot handoff before verify/PR; next: implement fallback-safe view-model and course UI slice`
- `2026-06-13 | screenshot-handoff | implemented fallback-safe lesson experience view-model, one rich representative lesson (`body-position--body-position-front`), `/course`skeleton sections, admin loader pass-through/fallback, and cache-key bump from`published-course-modules-v1`to`v2`so optional fields are not hidden by stale published-course cache; validation passed: targeted vitest (10 tests),`npm run typecheck`, targeted Playwright (6 passed / 6 expected project skips), `npm run lint:briefs:all`, route/label/support sweep, `git diff --check`; screenshots captured in `output/course-lesson-experience-v1-2026-06-13-131154`; next: wait for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or pre-merge gates`
- `2026-06-13 | in-progress | owner approved adding a practice image slot while V1 is still open: add one optional media slot for land practice and one for water practice, render missing-image fallbacks now, and keep full admin image/text editing as a separate course lesson experience admin editor child; next: update view-model/UI/tests and regenerate screenshot handoff before PR gate`
- `2026-06-13 | screenshot-handoff | added optional local-path-only practice image metadata, fallback-safe media containers for land/water practice, desktop row layout with media left/text right, mobile stacked layout, updated unit/e2e/content-loader coverage, and parent/admin follow-up notes; validation passed: targeted vitest (11 tests), `npm run typecheck`, targeted Playwright course lesson e2e, nearby course regressions (6 passed / 6 expected project skips across the reruns), `npm run lint:briefs:all`, `git diff --check`, and media/follow-up `rg`sweep; screenshots captured in`output/course-lesson-experience-v1-media-slot-2026-06-13-135034`; next: wait for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or pre-merge gates`
- `2026-06-13 | in-progress | owner approved final V1 layout polish and admin-editor brief requirements: make feel cues full-width under water practice, render common mistakes as linked mistake/correction rows, and document admin-editor decision requirements for successful app/CMS patterns, inline editing tradeoffs, public performance safety, and high-volume editing; next: implement layout polish, validate, and regenerate screenshot handoff`
- `2026-06-13 | screenshot-handoff | implemented final V1 layout polish: feel cues now render full-width directly after water practice, common mistakes render as paired mistake/correction rows with a safe missing-correction fallback, and the planned admin editor brief now requires a decision pass across successful app/CMS/LMS editing patterns, inline editing tradeoffs, image replacement, coupled mistake/correction editing, and public-route performance isolation; validation passed: targeted vitest (11 tests), `npm run typecheck`, targeted Playwright course lesson e2e, nearby course regressions (5 passed / 5 expected project skips across the reruns), `npm run lint:briefs:all`, `git diff --check`, and final layout/admin `rg`sweep; screenshots captured in`output/course-lesson-experience-v1-final-polish-2026-06-13-143249`; next: wait for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or pre-merge gates`
- `2026-06-13 | screenshot-handoff | added optional `whyThisMatters`to the lesson-experience contract, authored real why-copy for the representative body-position lesson, rendered`Why this matters`full-width after goal/quick explanation and before practice, kept missing why fields hidden from public UI, updated admin-editor brief requirements for`Why this exercise matters`and admin-only`New field`prompts, and bumped the published course cache key from`published-course-modules-v2`to`v3`so static fallback data is not stale; validation passed: targeted vitest (11 tests),`npm run typecheck`, targeted Playwright course lesson e2e after locator tightening, nearby course regressions (5 passed / 5 expected project skips), `npm run lint:briefs:all`, and screenshot regeneration; screenshots captured in `output/course-lesson-experience-v1-why-2026-06-13-145043`; next: wait for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or pre-merge gates`
- `2026-06-13 | screenshot-handoff | completed the 10/10 top-flow audit pass: compared successful lesson/app patterns, documented the decision that the page should be video-first while `Lesson in 30 seconds`remains a future video/script concept, removed the duplicate public quick-start card, updated the V1 e2e contract to require video before detailed lesson sections, and refreshed parent UX-flow wording; validation passed: targeted vitest (11 tests),`npm run typecheck`, targeted Playwright course lesson e2e, nearby course regressions (5 passed / 5 expected project skips), and `npm run lint:briefs:all`; screenshots captured in `output/course-lesson-experience-v1-video-first-2026-06-13-162935`; next: wait for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or pre-merge gates`
- `2026-06-13 | screenshot-handoff | completed premium design polish toward 10/10: generated and added two representative lesson visuals (`body-position-front-wall-line.jpg`, `body-position-front-glide.jpg`), connected them through data-driven practice image fields, consolidated Goal/Quick/Why into one calmer lesson-focus surface, upgraded land/water steps into coach-style numbered steps, set the first practice image to eager loading after an LCP warning, and bumped the published course cache key from `published-course-modules-v3`to`v4`so new static fallback image data is visible; validation passed: targeted vitest (11 tests),`npm run typecheck`, targeted Playwright course lesson e2e, nearby course regressions (5 passed / 5 expected project skips), `npm run lint:briefs:all`, screenshot script checks for two practice images and no representative fallback text; screenshots captured in `output/course-lesson-experience-v1-premium-polish-2026-06-13-165858`; next: wait for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or pre-merge gates`

## Completion Record

- `completed`: `2026-06-13`
- `merged_pr`: `1114`
- `squash_commit`: `d9297512`
- `result`: Closed Course Lesson Experience V1 Pedagogical Layout And Fallback Data. The public course lesson page now has a video-first, data-driven pedagogical skeleton with goal, quick explanation, why, land practice, water practice, feel cues, linked mistake/correction rows, pass criteria, next step, and calm post-value support. The representative Body Position on the Front lesson includes real land and water visuals, while other lessons keep safe fallbacks without per-lesson route code.
- `validation`: Local `npm run verify:pre-pr` full lane passed twice, including the post-commit run for HEAD `626ec1ad` with 107 Playwright tests passed and 541 expected skips; `npm run verify:pre-merge` passed and reused the same full-public PASS marker; CI for PR #1114 passed, including `e2e-smoke`, `site-lock-smoke`, aggregate `verify`, `size-check`, CodeQL, Vercel, and deploy preview; screenshot handoff was approved by the owner before PR gate.
- `10/10 claim`: yes - all critical target categories for this bounded V1 lesson-page slice reached `5/5`; full admin editor implementation is intentionally deferred to the planned admin-editor brief and was not a V1 target.

| Category                                      | Achieved Score | Evidence                                                                                                                  | Gaps / Notes                                              |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR #1114, owner-approved screenshots, course e2e, and final `/course` flow order.                                         | None for V1.                                              |
| UX flow clarity                               | `5/5`          | Video-first flow, lesson-focus surface, practice sections, linked corrections, and screenshot approval.                   | None for V1.                                              |
| Visual design quality                         | `5/5`          | Screenshot artifacts in `output/course-lesson-experience-v1-premium-polish-2026-06-13-165858`; owner approved.            | None for V1.                                              |
| Business logic correctness and data integrity | `5/5`          | `lib/course/lesson-experience.ts` normalization tests, admin loader tests, and route e2e.                                 | None for V1.                                              |
| Accessibility (a11y)                          | `5/5`          | Semantic section headings, image alt text, fallback media copy, and full e2e/a11y gate pass.                              | None for V1.                                              |
| Performance (CWV + payloads)                  | `5/5`          | Perf budgets passed; `/course` LCP remained within budget after adding two local optimized images.                        | None for V1.                                              |
| Data placement and sync boundaries            | `5/5`          | Optional `lessonExperience` view-model fields; no new persisted user state or sync behavior.                              | None for V1.                                              |
| Caching and invalidation strategy             | `5/5`          | Published course cache key bumped to `published-course-modules-v4` so fallback lesson data updates deterministically.     | None for V1.                                              |
| Reliability and failure handling              | `5/5`          | Missing optional why/images/corrections render safely; tests cover malformed optional fields and fallbacks.               | None for V1.                                              |
| Security and authz                            | `5/5`          | No protected API/authz changes; local path-only image normalization; CI security gates passed.                            | None for V1.                                              |
| Privacy and compliance                        | `5/5`          | No new personal data, tracking payloads, uploads, or external image domains in V1.                                        | None for V1.                                              |
| Content governance                            | `5/5`          | Skeleton-first scope preserved; one representative lesson only; admin editor requirements documented as a separate brief. | Full admin editing remains a planned child, not a V1 gap. |
| Commerce and revenue ops                      | `5/5`          | Existing support/PRO actions remain after free learning value and do not block the lesson.                                | None for V1.                                              |
| Stack-fit and dependency discipline           | `5/5`          | Reused `/course` route/player/progress surfaces; no new runtime dependency.                                               | None for V1.                                              |
| Testing and QA automation                     | `5/5`          | Unit, content-loader, e2e, full local pre-PR, pre-merge, and CI gates passed.                                             | None for V1.                                              |
| Scalability and cost efficiency               | `5/5`          | Future lessons can use the same optional data contract without route-local branches or required heavy assets.             | None for V1.                                              |
| DevOps and rollback readiness                 | `5/5`          | Single squash commit, green CI, green pre-merge, local screenshot artifacts, and additive fallback-safe behavior.         | None for V1.                                              |
