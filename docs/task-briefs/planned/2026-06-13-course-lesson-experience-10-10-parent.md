# Task Brief: Course Lesson Experience 10/10 Parent

## Metadata

- `id`: `2026-06-13-course-lesson-experience-10-10-parent`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-13`
- `updated`: `2026-06-14`

## Brief Audit Record

- `last_audited`: `2026-06-14`
- `base`: `main@705a3494`
- `audit_status`: `ready`
- `decision`: Use this as the parent planning brief for course lesson experience work, executed only through explicit child briefs.
- `reason`: Main is clean after PR `#1120` and closeout PR `#1121`; Course Lesson Experience V1, admin editor, public visual quality, and mark-as-done progress behavior are merged and closed, leaving analytics/KPI interpretation as the next bounded child before PRO, SEO/canonical routes, distribution, or media-production expansion.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/course`, `app/course/courseData.ts`, `lib/admin/content-course.ts`, `components/admin/AdminContentManager.tsx`, course runtime identity, analytics contracts, commerce/PRO routes, Help/Guide surfaces, screenshot handoff rules, or verification lanes change.

## Goal

Make the free Freeswimming crawl lesson experience world-class by combining a simpler pedagogical lesson page with a clear free-vs-PRO contract and a phased path to content, admin, analytics, SEO, and personalization quality.

## Pre-Implementation Owner Explanation

Vi lager først en styringsbrief for svømmeleksjonene, ikke kode. Den skal sikre at gratisleksjonene lærer bort teknikken komplett, mens PRO handler om å gjøre læringen til vaner, mikroøkter og personlige planer. Utenfor scope i denne parent-briefen er direkte UI-implementering, nye databasefelt, checkout-endringer, AI-planer og video/FCP-produksjon.

## Product Principle

- Free teaches the lesson.
- PRO turns the lesson into a system.
- One lesson should focus on one skill, one cue, one feeling, one dryland micro-session, and one next step.
- A lesson with only one main video must still feel complete.
- Optional quick-demo video can improve the page, but two videos must never be required.
- Safety, dryland instruction, in-water instruction, mistakes/fixes, and mastery criteria stay free for the core crawl course.
- Saving, personalization, habits, weekly micro-sessions, AI programme generation, workout builder, reminders, progress tracking, and advanced planning may be PRO.

## Competitor Benchmark Snapshot

- MySwimPro is strong on personalized swim workouts, AI workouts/training plans, swim tracking/analytics, technique videos/drills, and device sync.
- FORM is strong on real-time in-water feedback, guided instruction, HeadCoach positioning, metrics, and hardware confidence.
- Swim.com is strong on workout tracking, device integrations, workouts, clubs, competitions, and post-swim analysis.
- TrainingPeaks is strong on endurance planning, coach/athlete workflows, device integration, structured workouts, and long-term training systems.

Freeswimming should not try to beat hardware-first or social-tracking platforms first. The 10/10 wedge is clearer learning before the swim, better sensory cues during practice, and honest systemization after the free lesson value is delivered.

## Commercial 10/10 Gap Ladder

This parent should carry the full commercial direction, while each child remains small enough to execute safely.

| Stage                                             | Expected Commercial Readiness | What Must Be True                                                                                                                                 |
| ------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current app                                       | `6.5/10`                      | The app has strong engineering, progress, builder, admin, and commerce foundations, but the lesson page is not yet the unmistakable product core. |
| After V1 lesson redesign                          | `7.5-8/10`                    | Representative lessons feel complete, simple, and useful for learning crawl before any payment ask.                                               |
| After PRO systemization + proof + analytics + SEO | `9/10`                        | Users can turn lessons into habits/plans, trust the method through proof, discover the lessons organically, and see honest upgrade value.         |
| 10/10 claim                                       | `10/10` only with evidence    | User data shows that people learn, return, complete lessons, engage with PRO after free value, and some pay without aggressive paywalling.        |

10/10 is therefore not only a design claim. It requires evidence that the model works commercially and educationally.

## Commercial Readiness Gates

Future children should progressively prove these gates:

1. Users start lessons after landing on the course.
2. Users understand the lesson goal and cue within the first screen or first 30 seconds.
3. Users complete or continue lessons without needing external explanation.
4. Users return to the course after at least one lesson.
5. Users click PRO/systemization CTAs only after free lesson value is visible.
6. Some users pay for structure, personalization, plans, habits, or support without feeling the best learning is paywalled.
7. Support/contact signals show that users understand the free-vs-PRO boundary.
8. Course content can be improved repeatedly without code-only edits.

## Distribution And Growth Risk

Distribution is the highest commercial risk. A 10/10 product that nobody finds is not a 10/10 business.

Required future distribution surfaces:

- SEO and AI-discoverable lesson pages for learn-crawl intent.
- YouTube/short-form clips that point back to the free lesson path.
- Native/share-link behavior that makes individual lessons easy to send.
- Email capture or follow-up path that does not interrupt learning.
- Clear free `learn crawl` funnel that can be measured from first visit to lesson completion to PRO interest.

Distribution work should be planned as its own child after V1 proves the lesson format, unless V1 reveals a blocking discoverability issue.

## Child Brief Plan

| Child                                                                                                                                                                                              | Status        | Purpose                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Lesson Experience V1 Pedagogical Layout And Fallback Data](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-experience-v1-pedagogical-layout-fallback-data-10-10.md) | `done`        | Proved the new lesson skeleton with optional fields, old-field fallbacks, one representative existing lesson, tests, and screenshot handoff.         |
| [Course Lesson Experience Admin Editor](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-experience-admin-editor-10-10.md)                                            | `done`        | Made the new pedagogical text fields and practice structure editable, governable, previewable, and rollback-safe in admin content workflows.         |
| [Course Lesson Public Visual Quality And Clarity](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-public-visual-quality-and-clarity-10-10.md)                        | `done`        | Raised the public lesson page visual hierarchy and clarity, including lesson-info placement and public pill/cue language.                            |
| [Course Lesson Mark-as-done Progress Behavior](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-mark-as-done-progress-behavior-10-10.md)                              | `done`        | Hardened the existing lesson completion state machine, pass-criteria gate, undo, and guest/signed-in progress sync behavior.                         |
| Course Lesson PRO Systemization Bridge                                                                                                                                                             | `future`      | Add honest login/PRO routing for saving dryland, habits, micro-sessions, and programme entry without hiding free learning content.                   |
| Course Lesson Proof And Trust                                                                                                                                                                      | `future`      | Add method proof, sample outcomes, before/after examples, and trust copy without overstating results.                                                |
| [Course Lesson Analytics And KPI Interpretation V1](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-06-14-course-lesson-analytics-kpi-interpretation-v1-10-10.md)                 | `in-progress` | Add privacy-safe event mapping, dashboard interpretation, and support-safe diagnostics for lesson completion, continuation, and post-value interest. |
| Course Lesson SEO And Canonical Route Upgrade                                                                                                                                                      | `future`      | Evaluate canonical lesson routes, metadata, structured data, sitemap behavior, and AI-discoverable lesson semantics.                                 |
| Course Lesson Distribution Funnel                                                                                                                                                                  | `future`      | Connect SEO, YouTube/shorts, share links, email capture, and free-course funnel measurement after V1 is stable.                                      |
| Course Lesson Visual Coaching Media Pilot                                                                                                                                                          | `future`      | Connect the lesson experience to the planned visual coaching production system after the page contract is stable.                                    |

## Skill / Capability Audit

- Available now: `playwright` skill for browser screenshots and UI debugging, `imagegen` for bitmap assets if later needed, `openai-docs` for OpenAI-specific questions, Stripe plugin skills for future checkout/subscription work.
- Evaluate later: screenshot/image asset workflows if the visual coaching child needs generated media, Stripe skills only if PRO checkout or Billing behavior changes.
- Install/config changes: none. No Codex skill, plugin, MCP, or local config change is needed for this parent.

## Stack Radar Findings

| Surface                  | Finding                                                                                                                                                                       | Severity | Recommended Type               | Owner Decision Needed    | Follow-Up Brief Path                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------- |
| Course lesson UI         | `/course` reused the existing route, player, progress, and token patterns across the completed V1 and public visual-quality children.                                         | high     | bounded implementation child   | no                       | `docs/task-briefs/done/2026-06-13-course-lesson-public-visual-quality-and-clarity-10-10.md` |
| Content/admin governance | The admin editor now covers the pedagogical fields and public-container controls; bulk media editing remains a separate future production/admin workflow.                     | high     | bounded implementation child   | no                       | `docs/task-briefs/done/2026-06-13-course-lesson-experience-admin-editor-10-10.md`           |
| Course progress behavior | `Mark as done` now has a completed stateful child covering pass criteria, local progress, signed-in sync, undo, backup/install prompts, and failure states.                   | high     | safe process/docs update       | no                       | `docs/task-briefs/done/2026-06-13-course-lesson-mark-as-done-progress-behavior-10-10.md`    |
| Commercial proof         | The model can make money only if users finish free lesson value, return, and then want systemization; V1 must not overbuild PRO before lesson value is proven.                | high     | bounded implementation child   | no                       | `planned` proof/analytics children after V1                                                 |
| Distribution             | Organic discovery and repeat contact are not solved by the lesson UI alone; SEO, YouTube/shorts, share links, and email follow-up need a separate growth child.               | high     | bounded implementation child   | yes, before growth spend | `planned` distribution child after V1                                                       |
| SEO and routes           | The current query-param lesson route can serve V1, but canonical lesson URLs and structured lesson semantics need a separate route/SEO decision before 10/10 discoverability. | medium   | deferred architecture decision | yes, before route change | `planned` child to create after V1 evidence                                                 |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Content governance
- Admin workflow and editability
- SEO and crawlability
- AI discoverability
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                             | Evidence                                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Parent and children preserve the free lesson versus PRO systemization contract, define the simple default lesson path, and keep commercial proof as a staged requirement.                      | child brief scope review + owner approval         | `5/5`                   |
| UX flow clarity                               | `target`     | User can understand the lesson path as Watch, Goal, Why, Try on land, Try in water, Feel, Fix mistakes, Check, Next step, then optional PRO systemization.                                     | V1 screenshots + e2e route smoke                  | `5/5`                   |
| Visual design quality                         | `target`     | Lesson UI must be calmer and more polished than the current route without introducing card clutter, competing CTAs, or generic SaaS marketing weight.                                          | screenshot handoff + design review                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing lessons and progress behavior continue to work when new optional fields are absent.                                                                                                   | unit fallback tests + course e2e                  | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Before broad rollout, admin can create and revise the new pedagogical lesson fields without JSON-only editing.                                                                                 | future admin child + Help/Guide evidence          | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Changed lesson sections use semantic headings, keyboard-safe controls, valid labels, contrast, and non-color-only meaning.                                                                     | component/e2e checks + screenshot review          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/course` remains within route budgets and adds no unnecessary dependency or large client bundle.                                                                                              | performance budget gate + bundle diff review      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Free lesson content, PRO save state, local progress, and server-canonical admin content have explicit ownership boundaries.                                                                    | child data contract + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Public course content keeps predictable published-content revalidation and admin preview behavior.                                                                                             | cache contract review + preview tests             | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing video, missing optional fields, unknown CTA routes, and partial content data render useful fallbacks, not broken pages.                                                                | negative-path tests + manual QA                   | `5/5`                   |
| Security and authz                            | `target`     | Educational content remains public, while PRO save and admin edit operations fail closed and keep protected APIs protected.                                                                    | negative-path tests in future protected children  | `5/5`                   |
| Privacy and compliance                        | `target`     | Personal programme onboarding or profile saves require clear consent and avoid unnecessary sensitive data collection.                                                                          | PRO bridge child + copy review                    | `5/5`                   |
| Content governance                            | `target`     | New lesson fields, proof examples, safety notes, and commercial claims have a named source of truth, owner workflow, fallback rules, preview behavior, and rollback path before broad rollout. | admin governance child + brief evidence           | `5/5`                   |
| Admin workflow and editability                | `target`     | Operators can update pedagogical content, support CTA settings, safety notes, and publish state without code edits.                                                                            | future admin UI tests + Help/Guide                | `5/5`                   |
| SEO and crawlability                          | `target`     | Lesson title, description, headings, canonical links, sitemap behavior, and indexability are explicit for public lesson pages.                                                                 | SEO child tests + metadata review                 | `5/5`                   |
| AI discoverability                            | `target`     | Public lessons expose stable semantic structure for goal, cue, practice, mistakes, mastery, and next lesson.                                                                                   | rendered markup review + structured-data decision | `5/5`                   |
| Analytics and KPI observability               | `target`     | Lesson start, completion/continue, return, share, PRO bridge, and payment-interest signals use existing first-party analytics with privacy-safe payloads and dashboard interpretation.         | analytics child tests + admin dashboard mapping   | `5/5`                   |
| Commerce and revenue ops                      | `target`     | PRO, T-shirt, and support CTAs are honest, route correctly, appear after lesson value, and do not imply free lessons are incomplete.                                                           | commerce route tests + copy review                | `5/5`                   |
| Incident response and support operations      | `target`     | Future support docs explain free-vs-PRO boundaries, missing/broken lesson media, safety-note handling, and misunderstood upgrade states.                                                       | child acceptance criteria + Help/Guide/runbook    | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting because this parent changes no price, invoice, payout, refund, or entitlement truth; future commerce children must preserve reconciliation boundaries.                              | future commerce child rationale                   | `4/5`                   |
| i18n operational readiness                    | `target`     | Field structure, screenshots, and future admin/editing rules must avoid blocking later localization of lesson copy, cue cards, safety notes, CTAs, and SEO metadata.                           | forward compatibility contract + V1 layout review | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current Next.js route, TypeScript contracts, content loader, UI primitives, and tests before adding dependencies.                                                                        | diff review in children                           | `5/5`                   |
| Testing and QA automation                     | `target`     | Each child ships targeted unit/e2e/screenshot coverage plus `npm run verify:pre-pr` and `npm run verify:pre-merge`.                                                                            | local gates + CI                                  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Lesson fields and rendering support many future lessons without per-lesson code branches or asset bloat.                                                                                       | future-value fixtures + code review               | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Children stay isolated, revertible, and documented with screenshot artifacts for visual changes.                                                                                               | PR diff + rollback notes                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `app/course/page.tsx`, `CourseLesson`, `CourseModule`, `CourseProgressSyncStatus`, `CourseOpenOnPhoneCard`, `MenuDrawer`, `PressButton`, `PressLink`, and existing route-state conventions.
  - Keep `/course` as the V1 route boundary until a route/SEO child explicitly approves canonical per-lesson URLs.
  - Do not introduce a second course app or separate learner route by default.
- TypeScript/domain contracts:
  - Add optional nested lesson-experience fields or a mapped view-model, not a brittle set of required top-level fields.
  - Preserve deterministic fallbacks from current fields.
- Supabase/data layer:
  - Parent does not require a migration.
  - Future admin/CMS child must decide whether fields remain JSON body fields or become structured DB columns.
- UI system:
  - Use existing tokens and primitives.
  - Screenshot handoff is required for all lesson UI implementation children.
- Testing:
  - V1 needs unit tests for mapping/fallback behavior, component or route tests for missing optional fields, and Playwright screenshots.

## 10/10 Proof Contract

Do not claim full platform 10/10 for the lesson business model until these evidence classes exist:

- Learning proof:
  - users complete lessons or can answer the cue/memory check,
  - users report that they understand what to try in the water.
- Return proof:
  - users come back to continue the course or next lesson.
- Commercial proof:
  - PRO clicks happen after free value has been delivered,
  - first payments happen without aggressive paywalls,
  - support/contact questions show the free-vs-PRO boundary is clear.
- Content operations proof:
  - new lessons can be improved through governed content workflow, not code-only edits.
- Distribution proof:
  - at least one repeatable channel brings learners to the free lesson path.

The parent can contain these requirements now; implementation must happen through explicit child briefs.

## Data Placement And Sync Contract

- Server-canonical:
  - Published course modules and lessons from `admin_content_items` and current fallback data in `app/course/courseData.ts`.
  - Future PRO saves, habits, micro-sessions, programme plans, and profile answers only after explicit child scope and authz contract.
- Local-only:
  - Existing local course progress and UI affordance state where already designed.
  - Temporary display expansion state and screenshot QA artifacts.
- Sync policy:
  - Parent changes no sync behavior.
  - Future PRO/save children must define save triggers, consent, retry, conflict, and failure UX before implementation.
- Retention and sensitivity:
  - Lesson content is public.
  - Personal programme answers must not be silently stored and must avoid unnecessary sensitive data.
- Cache/invalidation:
  - Current public course content uses published content revalidation.
  - Any admin publishing or canonical-route change must preserve preview and freshness behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - Course module and lesson runtime IDs remain canonical for routing, progress, notes, analytics, admin links, and QR links.
- Human-readable identifiers:
  - Titles, slugs, category labels, level labels, cues, and support copy are editable presentation values.
- Mutability rules:
  - Runtime IDs are stable and must not be repurposed for a different lesson.
  - Titles and copy may be renamed when the learning object stays the same.
- Rename vs repurpose:
  - A materially different lesson should be created as a new lesson, not silently repurposed under an existing runtime ID.
- Compatibility:
  - Existing legacy IDs and alias resolution remain the read-through path.
  - Future canonical route work must include redirect/alias rules before release.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Lesson fields, modules, categories, levels, equipment labels, proof examples, distribution channels, PRO CTA actions, support CTA actions, analytics event payloads, public routes, admin content fields, and future locales.
- Source of truth:
  - Future lessons should render from canonical course content and optional lesson-experience fields, not route-local hardcoded lesson IDs.
- Additive behavior:
  - New lessons should automatically inherit the layout, fallbacks, progress, navigation, and free/PRO rules.
  - Unknown optional sections should be omitted or rendered through safe generic fallback copy.
- Explicit mapping requirements:
  - New PRO actions, support actions, route families, distribution channels, proof-claim types, locale workflows, analytics event names, or commerce destinations require code/copy/test/doc updates.
- Unknown or deprecated values:
  - Unknown category/level/equipment values render as plain text or generic labels.
  - Unknown protected actions fail closed and route to a safe explanatory state.
- Test/evidence:
  - Future children must include fixtures for missing optional fields and at least one future-value fixture that proves the layout is not hardcoded to the current two sample lessons.

## Scope

- Define the parent product, architecture, and quality contract for course lesson experience work.
- Define child order and required quality gates.
- Preserve the free-vs-PRO principle.
- Document that broad 10/10 requires UI, content governance, admin editability, analytics, SEO/distribution, commerce honesty, proof/trust, return behavior, user learning evidence, and scalability.

## Out Of Scope

- Runtime code changes.
- Visual redesign implementation.
- New Supabase schema or migrations.
- New checkout, Stripe, entitlement, or finance behavior.
- AI-generated training plans, workout-builder integration, reminders, and habits runtime.
- Final Cut Pro or visual coaching asset production.

## Acceptance Criteria

1. Parent brief names the product principle, competitor benchmark, and child execution plan.
2. Parent brief includes the commercial 10/10 gap ladder and readiness gates.
3. Parent brief captures distribution as a first-class commercial risk.
4. Parent brief maps every platform scorecard category with target/supporting/N/A status.
5. First child brief exists and is linked.
6. Parent defines data, identity, forward compatibility, stack, proof, and screenshot requirements.
7. Changed briefs pass `npm run lint:briefs:all`.

## Validation

- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` before merge recommendation

## Checkpoint Log

- `2026-06-13 | planned | created parent planning brief after PR #1111/#1112 closeout left no active child; next: validate docs-only PR and use V1 child as the first implementation slice when owner approves execution`
- `2026-06-13 | planned | sharpened parent with full commercial 10/10 ladder, readiness gates, distribution risk, proof contract, and forward-compatible child sequencing; next: keep PR #1113 docs-only and use V1 child for the first implementation slice after merge approval`
- `2026-06-13 | planned child created | created planned child brief docs/task-briefs/planned/2026-06-13-course-lesson-mark-as-done-progress-behavior-10-10.md from clean synced main@63cdf5e0 after PR #1118 and closeout PR #1119; implementation is not approved yet and scope is existing /course completion state machine, pass-criteria gate, local/signed-in progress sync, undo, tests, docs, and screenshot handoff if visible UI changes | next: wait for owner implementation approval or scope edits`
- `2026-06-13 | child moved to in-progress | owner requested implementation; child moved to docs/task-briefs/in-progress/2026-06-13-course-lesson-mark-as-done-progress-behavior-10-10.md on branch feat/course-lesson-mark-done-progress-2026-06-13; parent remains plan-only and the child owns runtime work | next: complete the child implementation and validation`
- `2026-06-13 | child closed | PR #1120 merged as 485132ed and the mark-as-done child moved to done in the repo-managed closeout; parent remains the planning surface for future course lesson children | next: choose the next bounded child only after scope/audit is refreshed`
- `2026-06-14 | planned analytics child created | after recovery confirmed clean synced main@705a3494 and parent/done-brief forward notes were audited, selected Course Lesson Analytics And KPI Interpretation V1 as the next bounded child; created docs/task-briefs/planned/2026-06-14-course-lesson-analytics-kpi-interpretation-v1-10-10.md with implementation still blocked on explicit owner execute/build/implement instruction and no PRO runtime, checkout/Stripe, SEO/canonical routes, distribution funnel, media production, migration, vendor analytics, raw drilldown, or public layout redesign approved | next: wait for owner implementation approval or scope edits`
- `2026-06-14 | analytics child in-progress | owner said `xecute analytics-brief`; child moved to docs/task-briefs/in-progress/2026-06-14-course-lesson-analytics-kpi-interpretation-v1-10-10.md on branch feat/course-lesson-analytics-kpi-v1-2026-06-14, with screenshot handoff required before verify:pre-pr if Admin Analytics UI changes ship | next: complete the child implementation and targeted validation`
- `2026-06-14 | analytics child targeted validation | course analytics child implemented typed public aggregate lesson events, /course callsites, Admin Analytics KPI module, Help/Guide/API interpretation, and route/label/support sweep evidence; targeted tests, typecheck, brief-lint-all, diff-check, and course support-card Playwright coverage pass; screenshot handoff remains required before verify:pre-pr because Admin Analytics UI changed | next: wait for screenshot approval, then continue the child gates`
