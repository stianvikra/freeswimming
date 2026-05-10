# Task Brief: Home Personalization And Training Reminders (10/10)

## Metadata

- `id`: `2026-05-07-home-personalization-and-training-reminders-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-10`

## Execution Status

Implementation started on `2026-05-10` from clean `main` after owner confirmed authenticated `/my-library` as the target "home" surface and approved a unified `Today` window with `Bubbles` and `Habits` tabs.

## Goal

Create a controlled My Library `Today` foundation where the Free Course remains the primary call to action, while signed-in users can switch between daily `Bubbles` and `Habits` views in one compact window under it.

## Product Decision

This slice is the first unified daily training surface after Micro Sessions bubbles and My Perfect Day habits shipped.

- Keep `Free Course` as the primary CTA.
- Add one personal `Today` window below the primary CTA.
- Use tabs inside the `Today` window:
  - `Bubbles` for Micro Sessions continuation/execution entry.
  - `Habits` for today's habit check-in and Perfect Day status.
- Preserve Bubbles state when users switch to Habits and back. If execution state cannot be preserved in a future deeper flow, autosave or pause explicitly before navigation.
- Treat `Perfect Day` as a status/result from daily habit completion, not a third tab, separate product area, or hard streak mechanic.
- Defer user pinning and widget customization; V1 uses deterministic default content.
- Start with in-app reminders and due states.
- Defer browser push, email, SMS, and exact clock-time reminders until a separate consent/privacy decision is made.
- Do not optimize for manipulative addiction. Optimize for healthy habit formation, clarity, and return value.

## Surface Decision

The owner confirmed "home" means authenticated My Library, not public marketing `/`.

- `app/my-library/page.tsx`
- `components/my-library/ContinueCourseCard.tsx`

The public `/` home route is out of scope.

## Dependencies And Reference Surfaces

- Existing My Library landing:
  - `app/my-library/page.tsx`
  - `components/my-library/ContinueCourseCard.tsx`
  - `tests/e2e/my-library-landing-entrypoints.spec.ts`
  - `tests/unit/continue-course-card.test.tsx`
- Related current sections:
  - My Swim Profile
  - Goals
  - My Training
  - Swim Sessions
  - Dryland Sessions
  - Program builder preview
- Recommended product dependencies:
  - `docs/task-briefs/done/2026-05-07-manual-dryland-simple-sessions-10-10.md`
  - `docs/task-briefs/done/2026-05-07-micro-sessions-exercise-level-completion-10-10.md`
  - `docs/task-briefs/done/2026-05-08-training-stats-and-habits-foundation-10-10.md`

## V1 Behavior Contract

- `Free Course` remains the first primary training CTA.
- `Today` window appears below Free Course and above lower-priority library sections.
- `Today` window has two tabs: `Bubbles` and `Habits`.
- `Bubbles` tab gives a clear Micro Sessions continue/start action and shows whether it can count toward today's habits when that signal is available.
- `Habits` tab gives a clear daily habits action and shows `Perfect Day` status as partial progress such as `4/5 done`, not as a punishing streak.
- No `Perfect Day` tab ships in V1.
- User pinning does not ship in V1.
- The user cannot remove the primary Free Course CTA in V1.
- Reminder V1 means in-app due/continue states, not push notifications.
- Any future clock-time reminder must include timezone, opt-in, edit, pause, and delete controls.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Privacy and compliance
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | My Library keeps Free Course as primary CTA and adds a clear personal continue area without burying core course/product navigation.                                    | IA review + screenshot handoff + owner QA                                | `5/5`                   |
| UX flow clarity                               | `target`     | User can switch between Bubbles and Habits inside one Today window, continue daily work in one action, and return without losing visible daily context.                | Playwright flow + manual QA                                              | `5/5`                   |
| Visual design quality                         | `target`     | The Today tab window matches My Library visual language, remains compact, and does not create a marketing-style hero, nested-card clutter, or third competing concept. | before/after screenshot handoff across desktop/mobile                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Tab selection, due state, habit progress, and Micro Session entry state are deterministic and do not misrepresent completion or training status.                       | unit tests + integration/e2e tests                                       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes user-facing My Library personalization and does not change admin editors, content queues, or operator CRUD.                             | explicit scope rationale                                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Widgets, pins, due states, and reminder controls have labels, keyboard flow, focus states, and readable status text without color-only meaning.                        | component tests + Playwright/a11y smoke                                  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library` does not add heavy dependencies, client-only dashboard bloat, polling, or avoidable sequential data waterfalls.                                          | build/perf review + dependency diff                                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | V1 keeps tab UI state local-only and derives Today signals from existing server-canonical habits/Micro Sessions data without adding reminder fanout state.             | data-boundary review + tests                                             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Authenticated Today reads stay fresh enough for daily state, and date-bound due states do not stale past their intended date boundary.                                 | route/cache review + e2e refresh coverage                                | `5/5`                   |
| Reliability and failure handling              | `target`     | If widget data or preference save fails, My Library still loads with recoverable fallbacks and does not hide Free Course or core navigation.                           | negative-path tests + manual failure QA                                  | `5/5`                   |
| Security and authz                            | `target`     | Today data is authenticated, owner-scoped through existing habits/Micro Sessions surfaces, fail closed, and cannot expose another user's training state.               | API/server negative-path tests                                           | `5/5`                   |
| Privacy and compliance                        | `target`     | Reminder/personalization data is minimized; no push/email reminder ships without explicit opt-in and separate privacy review.                                          | privacy review + no-notification evidence or consent tests               | `5/5`                   |
| Content governance                            | `target`     | Today tab definitions and copy have a source-of-truth; no user preference state mutates product-owned Free Course position.                                            | model/code review + tests                                                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin-managed home modules, editorial publish flow, or operator editability surface is introduced.                                                      | explicit scope rationale                                                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the target surface is authenticated `/my-library`; no public metadata, sitemap, robots, or crawlable route behavior changes unless explicitly added.       | explicit scope rationale                                                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because personalized authenticated widgets are not public AI-discoverable content and no structured public entity data is introduced.                              | explicit scope rationale                                                 | `N/A`                   |
| Analytics and KPI observability               | `target`     | If analytics are added, events must safely answer whether Today tabs improve return use without storing sensitive training detail.                                     | event taxonomy review or explicit no-event defer note                    | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Free Course and library purchase/access sections must not be displaced in a way that harms access recovery or owned-item clarity.                     | My Library QA + entitlement/access regression tests                      | `4/5`                   |
| Incident response and support operations      | `target`     | New preferences/reminder failure modes and support-visible recovery paths are documented if added; otherwise no-impact is recorded.                                    | Help/Guide/runbook impact review + support sweep                         | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance logic changes, but My Library purchase/access recovery visibility must remain intact for reporting/support reconciliation.                 | commerce/access section regression review                                | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: reminder and date copy should be structurally localizable later, but no locale routing or translation workflow ships.                                 | copy/date/timezone review                                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js, Supabase, TypeScript, Tailwind, and test stack; no scheduling/push/vendor dependency in V1.                                                      | dependency diff + architecture review                                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/e2e coverage protects Free Course priority, Today tab rendering, tab switching, mobile layout, and no-notification consent boundaries.                            | targeted Vitest + targeted Playwright + screenshot handoff + verify gate | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Today uses bounded server reads, local tab state, no polling, no heavy client dashboard framework, and no high-volume reminder fanout in V1.                           | performance/persistence review                                           | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration is expected in V1; feature can fall back by removing the Today section without data migration or reminder cleanup.                                        | no-migration review + fallback tests + verify gates                      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - target authenticated `/my-library` unless owner explicitly chooses public `/`,
  - keep Free Course primary,
  - reuse existing My Library, Micro Sessions, and Habits references where possible,
  - server-render authenticated data where practical,
  - keep Today tab selection local in a small client component.
- TypeScript/domain contracts:
  - define a typed Today tab registry if useful,
  - define stable widget ids,
  - define deterministic priority/fallback order,
  - define due-state helpers as pure functions with tests.
- Supabase/data layer:
  - do not add a new V1 preference/reminder table unless implementation evidence proves it is necessary,
  - if user preferences persist later, add explicit migration, owner-scoped RLS, generated type updates, and negative-path tests,
  - avoid storing push tokens or notification permissions in this V1 unless the brief is updated.
- External services:
  - no browser push, email, SMS, calendar, or wearable service in V1,
  - future reminder delivery must use consent, opt-out, quiet-hours, timezone, retries, and support diagnostics.
- UI system:
  - preserve current My Library visual language,
  - use accessible tabs for `Bubbles` and `Habits`,
  - avoid nested cards and dashboard sprawl,
  - use stable responsive dimensions,
  - screenshot handoff is required.
- Testing:
  - unit tests for widget registry/order/due-state logic,
  - API tests for preferences if added,
  - Playwright tests for My Library landing priority and mobile layout,
  - screenshot handoff before PR gate.

## Data Placement And Sync Contract

- Server-canonical:
  - existing habit definitions/check-ins,
  - existing Micro Sessions plan/execution facts,
  - timezone basis if date-based due states require it.
- Local-only:
  - selected Today tab,
  - dismissed inline notices if non-critical and non-business-canonical,
  - open/collapsed UI state.
- Sync policy:
  - V1 has no preference save path,
  - Today falls back to deterministic Bubbles/Habits order,
  - existing habit and Micro Sessions writes remain owned by their existing APIs.
- Conflict policy:
  - existing habit and Micro Sessions conflict rules continue to apply; local tab selection never becomes canonical truth.
- Retention and sensitivity:
  - store no new reminder preferences or notification payloads in V1,
  - do not store raw training notes in personalization preferences,
  - no push tokens or email reminder payloads without a separate decision.
- Cache/invalidation:
  - authenticated My Library reads stay dynamic or explicitly invalidated,
  - date-bound due states must not stale across week/day boundaries.

## Identity And Rename Contract

- Canonical stable ID:
  - each Today tab/action definition needs a stable id,
  - no user preference rows ship in V1.
- Human-readable identifiers:
  - widget labels are editable product copy and not persistence identity.
- Mutability rules:
  - widget ids are immutable once persisted,
  - labels may be renamed with compatibility for old preferences.
- Rename vs repurpose policy:
  - rename label in place when same widget intent remains,
  - create a new widget id when behavior or meaning materially changes.
- Compatibility contract:
  - unknown future Today tab/action ids should be ignored safely and logged for support/debugging if persistence is added later.
- Observability and repair:
  - invalid preference rows degrade to default layout and safe support logs.

## Scope

- Add a controlled `Today` tab window under Free Course on authenticated My Library.
- Include `Bubbles` and `Habits` tabs with separate content in the same window.
- Show `Perfect Day` as habit progress/status, not as a standalone third tab or hard streak.
- Preserve local tab switching without losing visible daily context.
- Represent in-app due/continue states for available Bubbles/Habits surfaces.
- Preserve purchase/access recovery and owned library visibility.
- Add tests and screenshot handoff.

## Out Of Scope

- Public `/` marketing home redesign unless owner explicitly confirms.
- Letting the user remove or replace the primary Free Course CTA.
- User pinning/custom widget ordering.
- Browser push notifications.
- Email, SMS, calendar, or wearable reminders.
- Exact clock-time scheduling in V1 unless this brief is updated.
- Social streaks, leaderboards, competitive points, or pressure-based retention.
- Hard `Perfect Day streak` mechanics.
- Full dashboard analytics.
- Commerce/pricing/entitlement changes.
- Admin-managed homepage modules.

## Acceptance Criteria

1. Free Course remains the primary My Library CTA.
2. A `Today` tab window appears below Free Course.
3. `Bubbles` and `Habits` tabs show separate content and can be switched without losing visible daily context.
4. `Perfect Day` is represented as habit progress/status, not a separate app surface or punishing streak.
5. Default tab/action order is deterministic and useful with no user preferences.
6. In-app due states never claim false completion or hide core navigation.
7. Purchase/access recovery remains visible and functional.
8. No push/email/SMS reminder is sent in V1.
9. Mobile and desktop layouts remain compact and readable.
10. Screenshot handoff is owner-approved before PR gates.

## Validation

- `npm run lint:briefs`
- targeted unit tests for Today tab registry, priority, and due-state helpers
- targeted API route tests if preferences/reminder settings persist
- `npx playwright test tests/e2e/my-library-landing-entrypoints.spec.ts --project=desktop-chromium`
- additional targeted Playwright coverage for personalization if new routes/components are added
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA And Screenshot Handoff

Required because this is UI work.

- Capture before/after screenshots for:
  - My Library default state,
  - My Library with Today `Bubbles` tab active,
  - My Library with Today `Habits` tab active,
  - mobile My Library state.
- Owner screenshot approval is required before `verify:pre-pr`, PR creation, and merge-readiness handoff.

## Help / Guide Impact

This changes user-facing My Library behavior.

- If labels, navigation, recovery behavior, or support-visible personalization settings change, update Help/Guide assertions, `docs/user-flow-map.md`, and relevant runbooks.
- If implementation only adds a non-support-visible visual section, record explicit no-impact rationale with route/label/support sweep evidence.

## Route, Label, And Support-Surface Sweep

Required before `verify:pre-pr`.

Search at minimum:

- `My Library`
- `Free Course`
- `Continue`
- `Today`
- `Bubbles`
- `Habits`
- `Perfect Day`
- `Dryland Sessions`
- `Swim Sessions`
- `Goals`
- `Program builder preview`
- `/my-library`
- `ContinueCourseCard`

## Execution Notes

- Start from clean `main`.
- Move this brief to `in-progress` when implementation starts.
- Confirmed: "home" means authenticated `/my-library`, not public `/`.
- Do not implement push/browser/email/SMS reminders unless a separate consent/privacy brief is approved.

## Checkpoint Log

- `2026-05-07 | planned | created after owner asked whether Micro Sessions, reminders, and selectable Home content should live under Free Course; recommendation is fixed Free Course primary CTA plus controlled personal section below | next: wait until prerequisite training surfaces are stable or owner selects this as the next slice`
- `2026-05-10 | in-progress | execution started from clean main on branch today-bubbles-habits-tabs-2026-05-10 after owner confirmed authenticated /my-library and refined the scope to one Today window with Bubbles and Habits tabs; Perfect Day is status/progress only, no third tab, no hard streak, no pinning, no push/email/SMS/clock reminders, and no new reminder database fanout | next: implement the compact Today tab window, targeted tests, route/support sweep, and screenshot handoff before PR gates`
- `2026-05-10 | working tree | implemented the V1 Today window under Free Course on authenticated /my-library: local-only Bubbles/Habits tabs, deterministic Today state helper, Perfect Day progress status, no user pinning, no notification/reminder persistence, and links into the existing Dryland/Micro Sessions and Habits full surfaces; updated My Library IA docs and auth support runbook for stale Today diagnostics; owner flagged black active-tab styling as too heavy, so Today tabs now use the repo's blue active state instead of the earlier slate/black state | validation: targeted unit/component tests PASS (4 files, 16 tests initially; 2 files, 5 tests after color correction), npm run lint PASS, npm run typecheck PASS after clearing stale .next dev route cache, npm run lint:briefs:all PASS, targeted Playwright my-library landing exits 0 with 1 skipped because local dev-login/Supabase returned HTML instead of JSON; route/label/support sweep completed for My Library, Free Course, Continue, Today, Bubbles, Habits, Perfect Day, Dryland Sessions, Swim Sessions, Goals, Program builder preview, /my-library, and ContinueCourseCard | screenshot handoff captured at output/today-tabs-v1-20260510T180109 via temporary dev-only preview route using the production TodayTabsPanel and seeded data because authenticated local /my-library could not be opened through dev-login; preview route/script were removed before final targeted validation | next: owner screenshot approval before verify:pre-pr, commit, push, PR, CI, and verify:pre-merge`
- `2026-05-10 | screenshot-approved | owner approved the refreshed screenshot handoff with blue active Today tabs at output/today-tabs-v1-20260510T180109 | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
- `2026-05-10 | route-label-support-sweep | identifiers searched: My Library, Free Course, Continue, Today, Bubbles, Habits, Perfect Day, Dryland Sessions, Swim Sessions, Goals, Program builder preview, /my-library, ContinueCourseCard | surfaces checked: app/, components/, tests/, docs/, docs/runbooks/, active/planned/done task briefs, My Library landing, Habits route, Dryland/Micro Sessions route, auth-account support runbook, user-flow map, and My Library landing Playwright coverage | fallout handled: product code, tests, IA docs, support runbook, and active brief updated in this slice; no Help/Guide/admin surface update required because admin workflows and contextual note route support did not change`
