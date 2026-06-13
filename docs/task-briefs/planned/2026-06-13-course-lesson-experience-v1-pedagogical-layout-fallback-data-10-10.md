# Task Brief: Course Lesson Experience V1 Pedagogical Layout And Fallback Data (10/10)

## Metadata

- `id`: `2026-06-13-course-lesson-experience-v1-pedagogical-layout-fallback-data-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-13`
- `updated`: `2026-06-13`

## Brief Audit Record

- `last_audited`: `2026-06-13`
- `base`: `main@eeb7df02`
- `audit_status`: `ready`
- `decision`: Use this as the first bounded implementation child after the parent brief is accepted.
- `reason`: `/course` already has video playback, progress, pass criteria, common mistakes, support cards, admin content loading, and tests; V1 can safely improve pedagogy with optional fields and fallbacks before admin/PRO/SEO expansion.
- `must_refresh_before_execution_if`: Refresh if the parent brief, `/course`, course data loader, admin content body mapping, progress/status helpers, design tokens, screenshot handoff rules, route labels, analytics contracts, commerce routes, or verification lanes change.

## Parent

- [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)

## Goal

Upgrade the learner lesson page into a simpler, more pedagogical, fallback-safe lesson experience that proves the Freeswimming signature model on representative lessons without breaking existing lessons.

## Pre-Implementation Owner Explanation

Vi forbedrer selve leksjonssiden først, på en trygg måte. Brukeren skal forstå målet, dagens cue, følelsen, øvelsen på land, øvelsen i vann og neste steg raskere enn i dag. Utenfor første slice er admin-redigering av alle nye felter, PRO-saving, AI-planer, habits, checkout, nye canonical leksjonsruter og full video-produksjon.

## V1 Product Shape

Default learner path:

1. Lesson in 30 seconds
2. Watch
3. Remember
4. Visualize
5. Try on land
6. Try in water
7. Check
8. Next step

V1 must preserve the principle:

- Free users can learn the lesson.
- PRO is framed only as systemization.
- The page never requires both a short and long video.
- Missing optional fields must not create empty UI.

## Recommended Data Model Direction

Do not add dozens of required top-level fields. Add either a nested optional `lessonExperience` object or a typed view-model that maps current fields into the new display contract.

Suggested V1 view-model shape:

```ts
type CourseLessonExperienceViewModel = {
  summary: {
    goal: string;
    cue: string;
    feel?: string;
    avoid?: string;
    tryFirst?: string;
  };
  cueCard?: {
    headline: string;
    supportingCues: string[];
    imageSrc?: string;
    imageAlt?: string;
  };
  explanation: {
    goal: string;
    whyItMatters?: string;
    steps: string[];
    todayCue: string;
  };
  visualization?: {
    script: string;
    imagine?: string;
    feel?: string;
  };
  dryland?: {
    title: string;
    duration?: string;
    reps?: string;
    steps: string[];
    qualityCue?: string;
    safetyNote?: string;
  };
  waterPractice?: {
    title: string;
    setup?: string;
    steps: string[];
    reps?: string;
    safetyNote?: string;
  };
  equipment?: {
    required?: string;
    optional?: string;
    alternative?: string;
    focus?: string;
  };
  mistakes: Array<{
    mistake: string;
    whatYouSee?: string;
    whyItHappens?: string;
    fix?: string;
    cue?: string;
    drylandFix?: string;
  }>;
  good?: {
    looksLike: string[];
    feelsLike: string[];
    soundsLike?: string[];
  };
  masteryCriteria: string[];
  memoryCheck?: {
    question: string;
    answer: string;
  };
  progression?: {
    makeEasier: string[];
    makeHarder: string[];
  };
  nextLesson?: {
    lessonId?: string;
    title: string;
    why?: string;
  };
};
```

Fallback mapping:

- `goal` maps to summary goal and explanation goal.
- `cues[0]` maps to primary cue and cue-card headline.
- `cues.slice(1)` maps to supporting cues.
- `drill.title` and `drill.steps` map to the first practice block when richer fields are absent.
- `commonMistakes[]` maps to mistakes with the mistake text only.
- `passCriteria[]` maps to mastery criteria.
- `nextStep` maps to next-step copy.
- `estMinutes`, `lessonType`, and module context map to compact lesson metadata.

## V1 Scope

- Inspect current `/course` learner implementation, data loader, admin content body mapping, video player, progress, support-card, and tests before editing.
- Create the fallback-safe lesson experience view-model.
- Update `/course` lesson content presentation to render:
  - compact lesson metadata and primary cue,
  - `Lesson in 30 seconds` before the video,
  - one main video as default,
  - optional quick-demo affordance only when data exists,
  - cue card with text fallback when no image exists,
  - explanation,
  - visualization,
  - dryland practice,
  - in-water practice with visible safety note,
  - equipment and alternatives,
  - mistakes and fixes,
  - what good looks/feels/sounds like,
  - mastery criteria and existing pass criteria behavior,
  - make easier/make harder,
  - memory check,
  - next lesson,
  - bottom support CTA with Share, T-shirt, and Go PRO using existing route constants or safe placeholders.
- Add or adapt two representative lessons in fallback-safe data form for verification.
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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                         | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | V1 renders the free lesson path in the agreed order and keeps PRO as systemization, not hidden teaching.                                                                   | screenshots + copy review + tests                                  | `5/5`                   |
| UX flow clarity                               | `target`     | A first-time user can identify goal, cue, video, land practice, water practice, check criteria, and next step without dead ends.                                           | screenshot handoff + Playwright smoke                              | `5/5`                   |
| Visual design quality                         | `target`     | The route feels calmer and more premium than the current lesson page, with stable responsive layout and no nested-card clutter.                                            | before/after screenshot handoff                                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing lessons load when all new fields are missing, and progress/pass-criteria/video behavior remains deterministic.                                                    | unit fallback tests + existing course e2e                          | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: V1 may read JSON/body fields or static fallback data, but full editor ergonomics is a separate admin governance child.                                    | explicit follow-up path + no admin behavior regression             | `4/5`                   |
| Accessibility (a11y)                          | `target`     | New sections use semantic headings, accessible buttons/links, keyboard-safe disclosure controls, image alt rules, and non-color-only meaning.                              | component/e2e assertions + screenshot review                       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/course` keeps route budget intent, avoids new dependencies, avoids eager heavy media, and renders missing optional content without layout jumps.                         | perf budget gate + dependency diff review                          | `5/5`                   |
| Data placement and sync boundaries            | `target`     | V1 states which fields are server-canonical course content, which state stays local, and which PRO saves are intentionally not implemented.                                | data contract in brief + code review                               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Published content revalidation and preview behavior remain unchanged unless explicitly tested and documented.                                                              | loader tests + preview smoke                                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing video, missing optional sections, empty arrays, malformed optional values, and unknown CTA destinations render safe fallbacks.                                     | negative-path fixtures + manual QA                                 | `5/5`                   |
| Security and authz                            | `target`     | V1 does not expose admin-only data, does not weaken protected APIs, and routes gated save actions to login/PRO placeholders without mutation.                              | diff review + no protected route changes + negative-path rationale | `5/5`                   |
| Privacy and compliance                        | `target`     | No new personal data is collected; any programme CTA copy makes clear that saving answers is not part of V1.                                                               | copy review + no new storage/API writes                            | `5/5`                   |
| Content governance                            | `target`     | New display contract documents fallback ownership and marks admin-field editability as an explicit follow-up before broad rollout.                                         | view-model tests + parent child-plan link                          | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting because V1 should not add high-frequency admin field editing yet; existing course admin flows must remain unchanged.                                            | admin regression tests or rationale                                | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting because V1 improves semantic headings on `/course`, but canonical lesson routes and sitemap behavior are deferred.                                              | markup review + deferred SEO child                                 | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting because V1 creates stable semantic lesson sections, while structured data and canonical route decisions are deferred.                                           | rendered section review                                            | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting because V1 may add safe wrappers only if existing analytics conventions fit; full event taxonomy is a later child.                                              | no-new-dependency diff + analytics follow-up                       | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Bottom support and PRO CTAs route honestly to existing destinations or safe placeholders and never imply free lesson content is incomplete.                                | copy review + route assertions                                     | `5/5`                   |
| Incident response and support operations      | `supporting` | Supporting because V1 adds visible fallback behavior but no critical operator workflow; support diagnostics can stay in follow-up unless a new failure mode is introduced. | fallback QA + follow-up note                                       | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because V1 changes no payments, prices, invoices, refunds, payouts, entitlements, or finance reporting truth.                                                          | explicit non-commerce scope rationale                              | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because V1 should avoid layout assumptions that block future locales, but no locale routing or translation workflow changes now.                                | responsive screenshot review + copy structure review               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js, TypeScript, Tailwind, UI primitives, content loader, and test patterns with no new dependency unless explicitly justified.                           | dependency diff + code review                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit tests for mapping and missing-field behavior, keep relevant course e2e green, capture screenshots, and pass local gates.                                 | targeted tests + screenshots + `verify:pre-pr`                     | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Future lessons can be added through data with no route-local per-lesson branches and no heavy required assets.                                                             | future-value fixture + code review                                 | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Slice stays isolated to course lesson rendering/data docs/tests, uses screenshot artifacts, and can be reverted without schema rollback.                                   | PR diff + rollback note                                            | `5/5`                   |

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
- Testing:
  - Unit tests for view-model fallback.
  - Unit/content-loader tests if body mapping changes.
  - Existing course e2e affected by goal/common mistakes/pass criteria updated deliberately.

## Data Placement And Sync Contract

- Server-canonical:
  - Course modules and lessons from published admin content and current fallback `COURSE_MODULES`.
  - Optional V1 lesson-experience fields if present in course lesson body.
- Local-only:
  - Existing common-mistakes expansion state, overview expansion, install prompt state, and progress buffers stay as designed.
  - No new local persistence for PRO saves in V1.
- Sync policy:
  - Course progress sync remains unchanged.
  - PRO/save actions in V1 route to login/PRO or safe placeholders without writing new state.
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
  - Lesson metadata, categories, levels, equipment values, optional sections, CTA destinations, next lesson references, and future analytics values.
- Source of truth:
  - Render from current `CourseLesson` data plus optional normalized experience data.
  - Next lesson should derive from canonical course order when explicit next lesson data is missing.
- Additive behavior:
  - New lessons with only current fields still render the V1 path.
  - New lessons with richer fields render richer sections without code changes.
  - New categories and levels render as plain display labels.
- Explicit mapping requirements:
  - New CTA action types, PRO save destinations, merch routes, canonical lesson routes, analytics event names, structured data types, and admin field editors require explicit code/copy/test updates.
- Unknown or deprecated values:
  - Unknown optional fields are ignored.
  - Unknown CTA actions do not render.
  - Missing videos hide the player and keep lesson content useful.
- Test/evidence:
  - Include a fixture with full V1 fields, a fixture with only current fields, and a fixture with unknown optional values.

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

## Screenshot Handoff Requirement

This is visual UI work. After targeted tests are stable and before `npm run verify:pre-pr`, capture screenshot artifacts using the repo screenshot rule.

Required screenshots:

- `before-course-lesson-mobile.*`
- `after-course-lesson-mobile.*`
- `before-course-lesson-desktop.*`
- `after-course-lesson-desktop.*`

If direct before-state capture is not practical, use `after/reference` filenames and explain the comparison.

## Acceptance Criteria

1. Existing lesson pages still load with current course data only.
2. A lesson with V1-rich fields renders every scoped section.
3. A lesson missing V1 fields renders gracefully without empty headings or blank cards.
4. `Lesson in 30 seconds` appears before the video.
5. One main video works as the default model.
6. Optional quick demo renders only when data exists.
7. No lesson requires two videos.
8. Dryland, mistakes/fixes, good looks/feels/sounds, safety, mastery, easier/harder, and next step remain free.
9. PRO/systemization CTA copy is honest and non-blocking.
10. Existing course progress, pass criteria, navigation, preview mode, admin notes context, and support cards do not regress.
11. Mobile and desktop screenshots are approved before PR gate.
12. Targeted tests and `npm run verify:pre-pr` pass before PR handoff.

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
