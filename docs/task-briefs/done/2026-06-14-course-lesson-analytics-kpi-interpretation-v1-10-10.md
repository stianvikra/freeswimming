# Task Brief: Course Lesson Analytics And KPI Interpretation V1 (10/10)

## Metadata

- `id`: `2026-06-14-course-lesson-analytics-kpi-interpretation-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-14`
- `updated`: `2026-06-14`
- `parent_brief`: [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- `execution_mode`: `end-to-end-after-owner-execute`
- `branch`: `feat/course-lesson-analytics-kpi-v1-2026-06-14`

## Brief Audit Record

- `last_audited`: `2026-06-14`
- `base`: clean synced `main@705a3494` after PR `#1120` and closeout PR `#1121`; `git status -sb` showed `## main...origin/main`.
- `audit_status`: `ready`
- `decision`: Execute this as the active bounded Course Lesson Experience analytics child.
- `reason`: Owner explicitly said `xecute analytics-brief`; Course lesson V1, admin editor, public visual quality, and mark-as-done progress behavior are merged and closed. The stable lesson page now needs privacy-safe learning/commercial interpretation before PRO systemization, SEO/canonical routes, distribution spend, or media-production work.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/course`, `app/course/page.tsx`, `lib/course/progress.ts`, `lib/course/progress-status.ts`, `lib/course/lesson-experience.ts`, `lib/analytics/events.ts`, `lib/analytics/public.ts`, `/api/analytics/event`, `/api/admin/analytics/insights`, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, course support-card destinations, Help/Guide contracts, route/label/support sweep rules, screenshot handoff rules, or verification lanes change before implementation.

## Goal

Add a privacy-safe first-party analytics and Admin Analytics interpretation layer for the free course lesson experience so the owner can see whether learners view, complete, continue, and show post-value support/PRO interest without adding third-party tracking or changing the lesson UI model.

## Pre-Implementation Owner Explanation

Vi skal male om den nye leksjonssiden faktisk brukes riktig: hvilke leksjoner som blir vist, nar brukeren markerer en leksjon som ferdig, om de fortsetter/kommer tilbake, og hvilke post-value handlinger som vekker interesse. Det betyr noe fordi PRO, SEO og distribusjon bor bygges pa faktisk laeringsatferd, ikke magefolelse. Utenfor scope er nye canonical lesson routes, sitemap/SEO-endringer, checkout/Stripe, nye PRO-funksjoner, e-postfangst, media-produksjon, tredjeparts analytics og raw brukerdrilldown.

Forward-compatibility-intent: nye kursleksjoner skal automatisk arve samme maaling gjennom runtime lesson/module IDs og eksisterende route/product/event-kontrakter. Nye eventnavn, PRO-destinasjoner, route-familier, KPI-moduler, locales eller commerce-mappinger krever eksplisitt kode/kopi/test/doc-oppdatering.

## Product Questions

This child answers only these questions:

1. How many public course lesson views happen for the selected range?
2. Which lesson/module IDs are viewed, completed, continued/resumed, and followed by support/PRO-interest clicks?
3. How should course completion be counted without implying learning success, unique users, revenue, entitlement, or finance truth?
4. How should zero, duplicate, unknown lesson, stale, capped, schema-missing, and failed-read states be described for admin/support?
5. What later PRO, SEO, proof, and distribution children can safely depend on this measurement contract?

## Planned Product Decision

If executed, this child should implement one read-only Course Lesson KPI module in Admin Analytics and the minimal first-party instrumentation needed to feed it.

- Prefer existing first-party analytics persistence and sanitization.
- Use public-aggregate client events for course lesson telemetry; logged-in users must not be linked through course KPI events.
- Keep event payloads low-cardinality and safe:
  - `routeTemplate`: `/course`
  - `routeCategory`: `course_landing`
  - `source` / `surface`: `course`
  - `lessonId`
  - `moduleId`
  - `lessonVariant`
  - `lessonStatus` when derived from current UI state
  - `actionId` for mapped post-value actions
- Count events, not unique people.
- Treat `completed` as "marked done after the visible pass criteria gate", not proven skill mastery.
- Treat support/PRO clicks as interest, not checkout start, entitlement, revenue, or finance truth.
- Unknown lesson/action/product values must render as safe review/unknown states, not be interpreted as conversion.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                    | Evidence                                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Analytics gains one clearly labeled Course Lesson KPI module that measures lesson views, completion, continuation, and post-value interest without expanding PRO/SEO/distribution.              | admin-insights/view-model/component tests + Help/Guide copy                | `5/5`                   |
| UX flow clarity                               | `target`     | The Admin Analytics module explains viewed, completed, continued, support interest, and rates with no dead ends or misleading mastery/conversion language.                                            | component tests + screenshot review                                        | `5/5`                   |
| Visual design quality                         | `target`     | The module reuses existing Admin Analytics cards/lists/caveats, fits desktop/mobile, and has no clipped or overlapping labels.                                                                        | after/reference screenshot artifacts                                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Counts only approved course lesson events and known safe dimensions; ratios define zero denominator behavior and never infer unique users, mastery, checkout, entitlement, revenue, or finance truth. | admin-insights/view-model tests with zero, duplicate, unknown, capped data | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: this is read-only Admin Analytics; no course editor, publish, or placement config workflow changes.                                                                                  | admin scope rationale + unchanged editor tests where relevant              | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Changed Admin Analytics headings, lists, metrics, caveats, and range states remain semantic, keyboard reachable, and screen-reader friendly.                                                          | Testing Library assertions + screenshot/manual review                      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Course instrumentation is best-effort/non-blocking; Admin Analytics uses existing bounded reads and adds no chart library, vendor script, heavy route, or dependency.                                 | route/perf diff review + build/perf gate                                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical analytics rows remain the source; course progress storage remains separate; public aggregate course KPI rows do not attach user IDs.                                                 | data contract + route/persistence tests                                    | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Analytics ingestion and Admin Analytics reads remain `no-store`; range changes refetch the existing bounded insights endpoint with explicit freshness/cap caveats.                                    | route/cache review + existing endpoint tests                               | `5/5`                   |
| Reliability and failure handling              | `target`     | Analytics failures never block course actions; zero, capped, stale, schema-missing, unknown, and failed-read states render deterministic trust/caveat text and no unexpected `500`.                   | negative-path unit/component tests                                         | `5/5`                   |
| Security and authz                            | `target`     | No public/admin auth boundary is widened; Admin Analytics stays fail-closed for unauthorized reads; course KPI events use sanitized payloads only.                                                    | auth boundary review + route tests                                         | `5/5`                   |
| Privacy and compliance                        | `target`     | Admin UI and persisted payloads do not expose raw URLs, referrers, query strings, emails, user IDs, visitor IDs, IPs, user agents, notes, free text, tokens, or payment/customer data.                | sanitizer/persistence tests + privacy/support sweep                        | `5/5`                   |
| Content governance                            | `target`     | Event names, labels, Help/Guide copy, API caveats, parent checkpoint, and support interpretation state what the KPI does and does not mean.                                                           | docs/help updates + route/label/support sweep                              | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no editable admin workflow ships; module is read-only and should not add placement/product configuration.                                                                            | workflow scope rationale                                                   | `4/5`                   |
| SEO and crawlability                          | `N/A`        | Scope rationale: no public route, metadata, sitemap, robots, canonical URL, structured data, or crawl behavior changes.                                                                               | explicit SEO scope rationale                                               | `N/A`                   |
| AI discoverability                            | `N/A`        | Scope rationale: no public semantic page, structured data, AI-facing crawl surface, or canonical lesson URL is introduced.                                                                            | explicit AI-discoverability scope rationale                                | `N/A`                   |
| Analytics and KPI observability               | `target`     | The module surfaces course lesson views, completions, continuation, support/PRO-interest, unknowns, caveats, and range trust states from first-party rows.                                            | admin-insights/view-model/component tests + Help/Guide assertions          | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Course support/PRO interest stays separate from checkout start, checkout completion, entitlement grants, Stripe reconciliation, product catalog truth, and paid conversion.                           | commerce boundary tests/review + label assertions                          | `5/5`                   |
| Incident response and support operations      | `target`     | Support can explain missing, stale, capped, unknown, duplicate, and failed-read states without raw event drilldown or payment/user data.                                                              | Help/Guide/runbook copy + route/support sweep                              | `5/5`                   |
| Finance and reporting operations              | `target`     | No course KPI value is described as revenue, refund, payout, invoice, accounting export, Stripe reconciliation, or finance evidence.                                                                  | finance caveat in Admin/Help/API docs + tests for label text               | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: labels remain short/display-only and course IDs/event IDs remain locale-independent for later localization.                                                                          | copy review + identity contract                                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js client analytics, TypeScript contracts, Admin Analytics endpoint/view-model/UI patterns, and tests; add no dependency, migration, vendor, or new route by default.             | changed-files/package diff + code review                                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused analytics event, public aggregate, admin-insights, view-model, component, unknown-value, and screenshot evidence before `verify:pre-pr`; run pre-merge gate before merge.                 | targeted tests + screenshots + `verify:pre-pr` + CI + `verify:pre-merge`   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Aggregation stays bounded to existing range-capped rows and low-cardinality dimensions; no per-user drilldown, warehouse/export path, rollup job, or vendor script is introduced.                     | row-cap/query review + tests                                               | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration, provider, env, secret, checkout runtime, or canonical route change; rollback is a revert of instrumentation/dashboard/docs/tests.                                                       | PR rollback note + verify gates                                            | `5/5`                   |

## Skill / Capability Audit

- Available now: `playwright` skill for browser screenshots/UI debugging, existing repo Playwright and Vitest coverage, first-party analytics helpers, Admin Analytics dashboard patterns.
- Evaluate later: `imagegen` only for future media/proof assets; Stripe plugin skills only if a later PRO/checkout child changes billing, Checkout, subscriptions, or entitlements.
- Install/config changes: none.

Systemic findings:

| Surface                    | Finding                                                                                                                                          | Severity | Recommended Type                 | Owner Decision Needed              | Follow-Up Brief Path |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------- | ---------------------------------- | -------------------- |
| Course lesson analytics    | `/course` is stable enough to instrument, but it lacks a dedicated learning KPI contract and Admin Analytics interpretation.                     | `high`   | `bounded implementation child`   | `no`                               | this brief           |
| Privacy/data boundaries    | Course KPI events must remain public aggregate and separate from signed-in progress/user identity to avoid a public-to-profile analytics bridge. | `high`   | `bounded implementation child`   | `no`                               | this brief           |
| SEO/canonical/distribution | Canonical lesson URLs, sitemap behavior, share links, email capture, and distribution funnel remain larger architecture/product decisions.       | `medium` | `deferred architecture decision` | `yes, before route/growth changes` | parent future child  |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md`
- Current child status: in-progress in `docs/task-briefs/in-progress/2026-06-14-course-lesson-analytics-kpi-interpretation-v1-10-10.md`.
- Last merged workstream: PR `#1120` (`485132ed`) and closeout PR `#1121` (`705a3494`).
- Exact next planning step after this child: choose PRO systemization, proof/trust, SEO/canonical routes, distribution, or media pilot based on the shipped KPI evidence and owner decision.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `app/course/page.tsx` and the existing client analytics helper rather than adding a second tracking system.
  - Keep `/course` as the route boundary; no canonical lesson URL or route split in this child.
  - Add course tracking through small, deterministic callsites that do not block navigation, playback, progress, or support actions.
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx` and existing Admin Analytics card/list/trust-state patterns for the read-only module.
- TypeScript/domain contracts:
  - Reuse `AnalyticsEventName`, sanitizer, public route payload helpers, course runtime IDs, and lesson-experience view-model data.
  - If new course event names are added, they must be typed, tested, and documented with exact semantics.
  - Define zero-denominator ratios, duplicate-event behavior, unknown lesson/action handling, and safe display labels in typed helpers.
- Supabase/data layer:
  - Use existing `analytics_events` persistence and `/api/admin/analytics/insights`.
  - No migration, RLS policy, generated DB type update, storage, raw drilldown, export path, or background rollup by default.
  - Existing admin read authz must stay fail-closed.
- External services/tools:
  - No Plausible, Simple Analytics, GA4, Meta, GTM, Hotjar, Clarity, session replay, heatmaps, cookies, visitor IDs, ad IDs, Stripe API, checkout, webhook, or finance provider change.
  - Existing commerce events may be referenced only as interpretation boundaries.
- UI system:
  - Mature reference surface: existing Admin Analytics modules for workout builder and workout-context commercial funnel.
  - Reuse current metric cards, list rows, caveat copy, trust states, spacing, and responsive behavior.
  - Screenshot handoff type if executed: `after/reference`, comparing the new course lesson KPI module to existing Admin Analytics modules.
- Testing:
  - Unit tests for event payload helpers, public aggregate/no user ID behavior, admin-insights aggregation, view-model labels/rates/caveats, and unknown/unsafe values.
  - Component tests for rendered module semantics and no misleading mastery/revenue/finance language.
  - Targeted Playwright or screenshot harness artifacts for Admin Analytics desktop/mobile when visible UI changes.

## Data Placement And Sync Contract

- Server-canonical:
  - Existing `analytics_events` rows remain the source of truth for KPI interpretation.
  - Existing signed-in `course_progress` rows remain the source of truth for user progress and are not joined into public course KPI aggregates.
  - Published course modules/lessons remain the source for valid `lessonId`, `moduleId`, variant, and display labels.
- Local/browser:
  - Existing local course progress and UI state remain unchanged.
  - No new browser visitor ID, analytics cookie, ad click ID, localStorage attribution key, or public-to-user identity bridge.
- Sync policy:
  - Course KPI event sends are best-effort and non-blocking.
  - Public aggregate course KPI events must persist with `user_id = null` even when the user is signed in.
  - Admin range changes refetch the existing bounded insights endpoint.
  - Duplicate client events are counted as events and caveated as not unique-user conversion.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - Payloads may not include raw URLs, raw referrers, arbitrary query strings, email, token, secret, password, cookie, IP, user-agent, customer/payment/Stripe IDs, free text, notes, support messages, or nested objects.
- Cache/invalidation:
  - Analytics ingestion and Admin Analytics reads remain dynamic/no-store.
  - No new revalidation tag or background cache is introduced.

## Identity And Rename Contract

- Canonical stable IDs:
  - Course lesson runtime ID is the analytics lesson identity.
  - Course module ID is the analytics module identity.
  - Event identity comes from `ANALYTICS_EVENT_NAMES`.
  - Route identity uses `routeTemplate = /course`, not raw URL or query string.
- Human-readable identifiers:
  - Lesson titles, module titles, support labels, CTA copy, dashboard labels, and translated copy are display-only and may change when meaning is unchanged.
- Mutability rules:
  - Runtime lesson/module IDs must not be repurposed for materially different learning objects.
  - Event meanings must not be repurposed; materially different behavior needs a new event or mapped action.
- Rename vs repurpose:
  - Label-only copy clarity is a rename.
  - Treating completion as mastery, support click as checkout, PRO interest as revenue, or query-param URLs as canonical lesson pages is repurpose and requires a separate owner-approved child.
- Compatibility contract:
  - Legacy lesson aliases should canonicalize before analytics payloads where practical.
  - Unknown/deprecated lesson, module, action, or event values must be ignored, counted as safe unknown aggregates, or excluded from known-rate denominators with a caveat.
- Observability and repair:
  - Admin Analytics should expose unknown/capped/stale/schema-missing diagnostics without raw event drilldown.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Course modules, lesson IDs, lesson variants, pass criteria, support actions, PRO actions, public route templates, analytics event names, source/surface values, product IDs, locales, Admin Analytics KPI modules, Help/Guide copy, export formats, vendor forwarding, and finance/reporting surfaces.
- Source of truth:
  - Lessons/modules derive from canonical course content/runtime IDs.
  - Event names derive from `ANALYTICS_EVENT_NAMES`.
  - Public route dimensions derive from `lib/analytics/public.ts`.
  - Product/commerce truth remains in catalog/checkout/entitlement systems, not course KPI events.
- Additive behavior:
  - New course lessons should automatically emit and aggregate through the same safe runtime ID payloads.
  - New module IDs should appear as safe low-cardinality dimensions when present in canonical course content.
  - Safe unknowns should render as unknown/review aggregates rather than breaking the dashboard.
- Explicit mapping requirements:
  - New course-specific event names, new PRO actions, support actions, route families, canonical lesson URLs, structured data, distribution channels, locale workflows, vendor analytics, checkout attribution, entitlement targeting, finance reporting, raw drilldown, CSV/export, or email capture require explicit code/copy/test/docs before release.
- Unknown or deprecated values:
  - Unknown event names are rejected.
  - Unsafe payload keys/values are stripped or redacted.
  - Unknown lesson/action/product values do not imply completion, conversion, revenue, or entitlement.
- Test/evidence:
  - Include fixtures for known lesson, future lesson/module value, unknown lesson, unknown action, duplicate completion, zero views, capped rows, schema-missing, signed-in public aggregate no-user ID, and unsafe payload fields.
  - Run the route/label/support sweep before the first broad gate.

## Help / Guide Impact

Planned brief creation: no visible Help/Guide change.

Execution: Admin Help/Guide or linked runbook must be updated because visible Admin Analytics labels and support interpretation will change.

If executed, this child must explain:

- what course lesson views, completions, continuation/resume, support interest, and PRO interest mean,
- what they do not mean: unique users, proven technique mastery, checkout start, entitlement, revenue, Stripe reconciliation, or finance truth,
- how zero, duplicate, capped, schema-missing, stale, unknown, and failed-read states should be interpreted,
- why SEO/canonical routes, distribution funnel, and PRO systemization remain separate children.

## Screenshot / Visual Impact

Required if this child is executed because it changes visible Admin Analytics UI.

- Capture folder: `output/course-lesson-analytics-kpi-v1-YYYY-MM-DD-HHMMSS`.
- Handoff type: `after/reference`.
- Required examples:
  - `after-course-lesson-kpi-desktop.png`
  - `after-course-lesson-kpi-mobile.png`
  - `after-course-lesson-kpi-empty-or-trust-state-desktop.png`
  - `reference-admin-analytics-existing-module-desktop.png`
- Screenshot approval stop: stop after screenshot handoff and wait for owner approval or visual corrections before `npm run verify:pre-pr`, PR creation, or `npm run verify:pre-merge`.

## Route / Label / Support Surface Sweep

Required before broad gates if this child is executed because it changes analytics taxonomy, Admin Analytics labels, Help/Guide interpretation, and commercial/support wording.

Search at minimum:

- `course_lesson`
- `course lesson`
- `lesson completed`
- `Mark as done`
- `Done`
- `progress_synced`
- `public_page_viewed`
- `public_cta_clicked`
- `support_clicked`
- `course_landing`
- `/course`
- `Admin Analytics`
- `Help/Guide`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `revenue`
- `finance`
- `Stripe`

Surfaces to check: `app/`, `components/`, `lib/course/`, `lib/analytics/`, `tests/`, `docs/api-contracts.md`, `docs/user-flow-map.md`, `docs/runbooks/`, active/planned/done task briefs, and Help/Guide assertions.

Executed sweep evidence:

- Identifiers searched: `courseLessonKpi`, `Free lesson learning signals`, `course_lesson_viewed`, `course_lesson_completed`, `course_lesson_continued`, `course_lesson_support_clicked`, `Marked done`, `Support interest`, `Admin Analytics`, `Help/Guide`, `revenue`, `finance`, and `Stripe`.
- Surfaces checked: `app/`, `components/`, `lib/analytics/`, `lib/course/`, `tests/`, `docs/`, `docs/runbooks/`, active/planned/done task briefs, Admin Help/Guide copy, API contracts, and Help/Guide assertions.
- Fallout handled: expected matches were updated in course instrumentation, typed analytics contracts, Admin Analytics aggregation/view-model/UI, Admin Help/Guide, API contract docs, parent/child brief checkpoints, and targeted tests; no stale or unexpected route/label/support fallout remains.

## Scope

- Add minimal course lesson first-party analytics instrumentation for:
  - lesson viewed / page viewed with course-safe dimensions,
  - lesson marked done after pass-criteria gate,
  - continuation/resume where a current stable signal exists or can be safely added,
  - mapped support/PRO-interest actions after free lesson value.
- Extend typed analytics contracts and public aggregate handling as needed.
- Extend Admin Analytics insights/view-model/component with one read-only Course Lesson KPI module.
- Add Help/Guide or runbook interpretation updates for the new admin-visible metrics.
- Add targeted unit/component/e2e or screenshot-harness coverage.
- Update parent checkpoint and active brief evidence during implementation.

## Out Of Scope

- New canonical lesson route family, sitemap, robots, metadata, structured data, redirects, or share links.
- New PRO save system, habits, micro-sessions, programme generation, reminders, checkout, Stripe, entitlement, pricing, finance, refund, payout, invoice, export, or vendor reporting.
- Third-party analytics vendors, cookies, visitor IDs, consent banner, ad IDs, tag managers, session replay, heatmaps, or marketing pixels.
- Raw event drilldown, CSV export, per-user analytics, public-to-user identity bridge, or joining public course events to signed-in profiles.
- New video/media production, image upload/storage, visual coaching production, email capture, distribution funnel, YouTube/shorts workflow, or proof/testimonial content.
- Broad `/course` visual redesign or public lesson layout changes beyond tiny tracking attributes if necessary.

## Acceptance Criteria

1. Course lesson analytics emits only approved privacy-safe first-party payloads and never blocks user actions.
2. Public aggregate course KPI events persist with `user_id = null`, including for signed-in users.
3. Admin Analytics shows one read-only Course Lesson KPI module for views, completion, continuation/resume, support/PRO-interest, unknowns, and caveats.
4. Completion is described as "marked done after pass criteria", not technique mastery.
5. Support/PRO interest is described as click/interest, not checkout, entitlement, revenue, or finance truth.
6. Unknown, duplicate, zero, capped, stale, schema-missing, and failed-read states are deterministic and support-safe.
7. No new route, migration, dependency, vendor script, cookie, visitor ID, checkout, Stripe, entitlement, finance, or SEO/canonical behavior ships in this child.
8. Help/Guide or linked runbook copy explains the new Admin Analytics interpretation.
9. Screenshot handoff is captured and owner-approved before `verify:pre-pr` if visible Admin Analytics UI changes.
10. Changed brief and implementation pass required targeted tests, `npm run verify:pre-pr`, PR CI, and `npm run verify:pre-merge` before merge recommendation.

## Validation

- Targeted Vitest:
  - `tests/unit/analytics-events.test.ts`
  - `tests/unit/public-analytics-foundation.test.ts`
  - `tests/unit/analytics-event-route.test.ts`
  - `tests/unit/analytics-persistence.test.ts`
  - `tests/unit/admin-analytics-insights.test.ts`
  - `tests/unit/admin-analytics-dashboard-view-model.test.ts`
  - `tests/unit/admin-analytics-dashboard.test.tsx`
  - new/updated course analytics tests
- Targeted Playwright or screenshot harness for Admin Analytics UI if visible UI changes.
- `npm run typecheck`
- `npm run lint:briefs`
- `npm run lint:quality-gates`
- `git diff --check`
- Screenshot handoff + owner approval if UI changes.
- `npm run verify:pre-pr`
- PR CI
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-14 | planned child created | created this planned child from clean synced main@705a3494 after PR #1120 and closeout PR #1121; scope is privacy-safe first-party course lesson analytics plus read-only Admin Analytics KPI interpretation, with no PRO runtime, checkout/Stripe, SEO/canonical routes, distribution funnel, media production, migration, vendor analytics, raw drilldown, or public layout redesign approved | next: wait for owner implementation approval or scope edits`
- `2026-06-14 | in-progress | owner said `xecute analytics-brief`; moved brief to in-progress on branch feat/course-lesson-analytics-kpi-v1-2026-06-14; scope remains first-party course lesson analytics plus read-only Admin Analytics KPI interpretation and screenshot handoff is required before verify:pre-pr because Admin Analytics UI changes are expected | next: audit current analytics/dashboard code and implement the smallest safe KPI module`
- `2026-06-14 | implementation and targeted validation | implemented privacy-safe course lesson analytics payloads/events, public aggregate no-user handling, /course viewed/completed/continued/support callsites, Admin Analytics course KPI aggregation/view-model/UI, Help/Guide copy, API contract caveats, and targeted E2E coverage; route/label/support sweep searched courseLessonKpi, Free lesson learning signals, course_lesson_* events, Marked done, Support interest, Admin Analytics, Help/Guide, revenue, finance, Stripe across app/components/lib/tests/docs with no unexpected stale fallout; validation passed: npm run lint:briefs:all, npm run typecheck, git diff --check, vitest analytics-events/public-analytics-foundation/analytics-event-route/analytics-persistence/admin-analytics-insights/admin-analytics-dashboard-view-model/admin-analytics-dashboard/admin-help-center, and npx playwright test tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium | next: capture required Admin Analytics screenshot handoff and wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-14 | screenshot handoff captured | captured after/reference Admin Analytics screenshots at output/course-lesson-analytics-kpi-v1-2026-06-14-082016 with a temporary local visual harness route and intercepted deterministic Admin Analytics API; harness route and capture script were removed before git diff review; no product-rendering files changed after capture, only this docs checkpoint | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-14 | owner screenshot approval | owner approved the screenshot handoff in chat; artifacts remain at output/course-lesson-analytics-kpi-v1-2026-06-14-082016 and no product-rendering files changed after capture | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge-readiness summary`

## Completion Record

- `completed`: `2026-06-14`
- `merged_pr`: `#1122`
- `squash_commit`: `ef37b27e`
- `result`: Closed Course Lesson Analytics And KPI Interpretation V1. The free course now emits privacy-safe first-party lesson signals, and Admin Analytics now shows a read-only Free lesson learning signals KPI module with explicit boundaries for marked done, continuation, support interest, unknowns, and non-finance interpretation.
- `validation`: Targeted Vitest for analytics contracts, public aggregate handling, admin insights, dashboard view-model/UI, Help/Guide, and route persistence; targeted Playwright `tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium`; screenshot handoff approved from `output/course-lesson-analytics-kpi-v1-2026-06-14-082016`; `npm run verify:pre-pr`; PR #1122 CI; `npm run verify:pre-merge`.
- `10/10 claim`: yes - all target categories reached `5/5`; supporting-only admin editability/i18n work remains intentionally outside this read-only analytics slice.

| Category                                      | Achieved Score | Evidence                                                                                                                        | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #1122 Admin Analytics module, Help/Guide copy, targeted admin-insights/view-model/component tests, `verify:pre-merge`        | None         |
| UX flow clarity                               | `5/5`          | Admin KPI labels/caveats, component tests, screenshot handoff approved                                                          | None         |
| Visual design quality                         | `5/5`          | After/reference screenshots in `output/course-lesson-analytics-kpi-v1-2026-06-14-082016`, owner approval                        | None         |
| Business logic correctness and data integrity | `5/5`          | Admin insights/view-model tests for counts, zero denominators, unknowns, duplicate rows, capped data, and safe dimensions       | None         |
| Accessibility (a11y)                          | `5/5`          | Testing Library assertions, reused Admin Analytics semantic card/list patterns, screenshot review                               | None         |
| Performance (CWV + payloads)                  | `5/5`          | No dependency/vendor/migration added; perf budget gate passed for `/course` and core routes                                     | None         |
| Data placement and sync boundaries            | `5/5`          | Public aggregate handling keeps course KPI rows userless; course progress remains separate; route/persistence tests passed      | None         |
| Caching and invalidation strategy             | `5/5`          | Existing no-store analytics ingestion and bounded Admin Analytics read path preserved; endpoint/view-model tests passed         | None         |
| Reliability and failure handling              | `5/5`          | Analytics sends remain best-effort; schema-missing, zero, capped, unknown, stale, and failed-read trust states tested           | None         |
| Security and authz                            | `5/5`          | Admin boundary unchanged and fail-closed; API negative paths and route tests passed; sanitized course payload helper added      | None         |
| Privacy and compliance                        | `5/5`          | Public aggregate no-user tests, payload sanitizer tests, no raw URL/referrer/user/payment/customer data in KPI UI or payload    | None         |
| Content governance                            | `5/5`          | Help/Guide, API contracts, route/label/support sweep, and parent/child brief checkpoints updated                                | None         |
| Analytics and KPI observability               | `5/5`          | Course lesson viewed/completed/continued/support events, Admin Analytics aggregation/UI, unknown counters, and tests shipped    | None         |
| Commerce and revenue ops                      | `5/5`          | KPI copy and tests keep support interest separate from checkout, entitlement, Stripe reconciliation, revenue, and finance truth | None         |
| Incident response and support operations      | `5/5`          | Help/Guide and Admin caveats explain missing, stale, capped, unknown, duplicate, and failed-read states without raw drilldown   | None         |
| Finance and reporting operations              | `5/5`          | Admin/API/Help caveats explicitly exclude revenue, refunds, payouts, invoices, accounting exports, and Stripe reconciliation    | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Next.js client analytics, TypeScript contracts, Admin Analytics view-model/UI patterns, and test lanes          | None         |
| Testing and QA automation                     | `5/5`          | Targeted unit/e2e tests, `npm run verify:pre-pr`, PR #1122 CI, and `npm run verify:pre-merge` passed                            | None         |
| Scalability and cost efficiency               | `5/5`          | Aggregation stays bounded to existing range-capped rows and low-cardinality safe dimensions; no rollup/export/vendor path added | None         |
| DevOps and rollback readiness                 | `5/5`          | No migration/provider/env/secret/runtime route change; rollback is a revert of instrumentation, dashboard, docs, and tests      | None         |
