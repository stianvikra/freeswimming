# Task Brief: Home Personalization And Training Reminders (10/10)

## Metadata

- `id`: `2026-05-07-home-personalization-and-training-reminders-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-07`

## Draft Status

This brief is a draft planning artifact until execution starts. Before implementation, the owner and assistant must review and finalize scope, UX decisions, data/storage decisions, acceptance criteria, validation gates, scorecard targets, and execution order. Move the brief to `in-progress` only after that final pre-start review is complete.

## Goal

Create a controlled My Library home personalization and reminder foundation where the Free Course remains the primary call to action, while signed-in users can surface selected training widgets such as Micro Sessions, next workout, or recent progress under it.

## Product Decision

This should be a later slice after the training surfaces it will summarize are stable.

- Keep `Free Course` as the primary CTA.
- Add a personal `Today` or `Continue` section below the primary CTA.
- Let users pin a small number of widgets later, not redesign the full page.
- Start with in-app reminders and due states.
- Defer browser push, email, SMS, and exact clock-time reminders until a separate consent/privacy decision is made.
- Do not optimize for manipulative addiction. Optimize for healthy habit formation, clarity, and return value.

## Surface Decision To Confirm At Kickoff

The owner said "home page under Free Course". In this repo, the likely target is the authenticated My Library landing page because it already renders `ContinueCourseCard` and training entrypoints:

- `app/my-library/page.tsx`
- `components/my-library/ContinueCourseCard.tsx`

The public `/` home route should not be changed unless the owner explicitly confirms that public marketing home is intended.

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
  - My Swim Sessions
  - Dryland Sessions
  - Program builder preview
- Recommended product dependencies:
  - `docs/task-briefs/planned/2026-05-07-manual-dryland-simple-sessions-10-10.md`
  - `docs/task-briefs/planned/2026-05-07-micro-sessions-exercise-level-completion-10-10.md`

## V1 Behavior Contract

- `Free Course` remains the first primary training CTA.
- Personal section appears below Free Course and above lower-priority library sections.
- User may see one or more system-selected cards such as:
  - continue active micro plan,
  - next saved swim session,
  - latest dryland session,
  - unresolved training focus,
  - weekly progress.
- If user pinning ships in V1, limit it to `2-3` widgets.
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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                               | Evidence                                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | My Library keeps Free Course as primary CTA and adds a clear personal continue area without burying core course/product navigation.                              | IA review + screenshot handoff + owner QA                                | `5/5`                   |
| UX flow clarity                               | `target`     | User can understand what to do next, continue training in one action, and manage any pinned widgets without dead ends or surprise layout shifts.                 | Playwright flow + manual QA                                              | `5/5`                   |
| Visual design quality                         | `target`     | Personalized cards/widgets match My Library visual language, remain compact, and do not create a marketing-style hero or nested-card clutter.                    | before/after screenshot handoff across desktop/mobile                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Widget selection, due state, progress summaries, and reminder state are deterministic and do not misrepresent completion or training status.                     | unit tests + integration/e2e tests                                       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes user-facing My Library personalization and does not change admin editors, content queues, or operator CRUD.                       | explicit scope rationale                                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Widgets, pins, due states, and reminder controls have labels, keyboard flow, focus states, and readable status text without color-only meaning.                  | component tests + Playwright/a11y smoke                                  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library` does not add heavy dependencies, client-only dashboard bloat, polling, or avoidable sequential data waterfalls.                                    | build/perf review + dependency diff                                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical preferences/reminder rules and local-only layout state are explicit, with retry/conflict behavior for preference saves.                         | data-boundary review + tests                                             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Personalized reads stay authenticated/fresh, preference changes refresh affected widgets, and due states do not stale past their intended date boundary.         | route/cache review + e2e refresh coverage                                | `5/5`                   |
| Reliability and failure handling              | `target`     | If widget data or preference save fails, My Library still loads with recoverable fallbacks and does not hide Free Course or core navigation.                     | negative-path tests + manual failure QA                                  | `5/5`                   |
| Security and authz                            | `target`     | Preferences, reminder settings, and widget data are authenticated, owner-scoped, fail closed, and cannot expose another user's training state.                   | API/server negative-path tests                                           | `5/5`                   |
| Privacy and compliance                        | `target`     | Reminder/personalization data is minimized; no push/email reminder ships without explicit opt-in and separate privacy review.                                    | privacy review + no-notification evidence or consent tests               | `5/5`                   |
| Content governance                            | `target`     | Widget definitions and copy have a source-of-truth; user preference state never mutates product-owned Free Course position.                                      | model/code review + tests                                                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin-managed home modules, editorial publish flow, or operator editability surface is introduced.                                                | explicit scope rationale                                                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the target surface is authenticated `/my-library`; no public metadata, sitemap, robots, or crawlable route behavior changes unless explicitly added. | explicit scope rationale                                                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because personalized authenticated widgets are not public AI-discoverable content and no structured public entity data is introduced.                        | explicit scope rationale                                                 | `N/A`                   |
| Analytics and KPI observability               | `target`     | If analytics are added, events must safely answer whether continue widgets improve return use without storing sensitive training detail.                         | event taxonomy review or explicit no-event defer note                    | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Free Course and library purchase/access sections must not be displaced in a way that harms access recovery or owned-item clarity.               | My Library QA + entitlement/access regression tests                      | `4/5`                   |
| Incident response and support operations      | `target`     | New preferences/reminder failure modes and support-visible recovery paths are documented if added; otherwise no-impact is recorded.                              | Help/Guide/runbook impact review + support sweep                         | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance logic changes, but My Library purchase/access recovery visibility must remain intact for reporting/support reconciliation.           | commerce/access section regression review                                | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: reminder and date copy should be structurally localizable later, but no locale routing or translation workflow ships.                           | copy/date/timezone review                                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js, Supabase, TypeScript, Tailwind, and test stack; no scheduling/push/vendor dependency in V1.                                                | dependency diff + architecture review                                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/e2e coverage protects Free Course priority, widget rendering, preference save/failure, authz, mobile layout, and no-notification consent boundaries.        | targeted Vitest + targeted Playwright + screenshot handoff + verify gate | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Personalization uses bounded server reads, no polling, no heavy client dashboard framework, and no high-volume reminder fanout in V1.                            | performance/persistence review                                           | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Any migration is explicit, typed, RLS-reviewed, rollback-documented; feature can fall back to default My Library order if preferences fail.                      | migration/no-migration review + fallback tests + verify gates            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - target authenticated `/my-library` unless owner explicitly chooses public `/`,
  - keep Free Course primary,
  - reuse existing My Library sections/cards where possible,
  - server-render authenticated data where practical and keep interactive pin/reorder controls in client components.
- TypeScript/domain contracts:
  - define a typed widget registry if personalization ships,
  - define stable widget ids,
  - define deterministic priority/fallback order,
  - define due-state helpers as pure functions with tests.
- Supabase/data layer:
  - if user preferences persist, add explicit migration, owner-scoped RLS, generated type updates, and negative-path tests,
  - avoid storing push tokens or notification permissions in this V1 unless the brief is updated.
- External services:
  - no browser push, email, SMS, calendar, or wearable service in V1,
  - future reminder delivery must use consent, opt-out, quiet-hours, timezone, retries, and support diagnostics.
- UI system:
  - preserve current My Library visual language,
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
  - user widget preference ids/order if personalization persists,
  - reminder rules if in-app reminders persist,
  - timezone basis if date-based due states require it.
- Local-only:
  - temporary drag/reorder state before save,
  - dismissed inline notices if non-critical and non-business-canonical,
  - open/collapsed UI state.
- Sync policy:
  - preference changes save explicitly or with visible saved/pending/failure state,
  - failure falls back to default My Library order,
  - server confirmed preferences win over stale local state.
- Conflict policy:
  - last confirmed server save wins for V1 unless a richer conflict UI is explicitly designed.
- Retention and sensitivity:
  - store only widget ids, reminder preferences, and non-sensitive scheduling metadata,
  - do not store raw training notes in personalization preferences,
  - no push tokens or email reminder payloads without a separate decision.
- Cache/invalidation:
  - authenticated My Library reads stay dynamic or explicitly invalidated,
  - date-bound due states must not stale across week/day boundaries.

## Identity And Rename Contract

- Canonical stable ID:
  - each widget definition needs a stable id,
  - user preference rows, if added, need stable server-generated ids.
- Human-readable identifiers:
  - widget labels are editable product copy and not persistence identity.
- Mutability rules:
  - widget ids are immutable once persisted,
  - labels may be renamed with compatibility for old preferences.
- Rename vs repurpose policy:
  - rename label in place when same widget intent remains,
  - create a new widget id when behavior or meaning materially changes.
- Compatibility contract:
  - unknown legacy widget ids should be ignored safely and logged for support/debugging.
- Observability and repair:
  - invalid preference rows degrade to default layout and safe support logs.

## Scope

- Add a controlled personal continue area under Free Course on authenticated My Library.
- Optionally persist up to `2-3` pinned widgets if implementation scope remains safe.
- Represent in-app due/continue states for available training surfaces.
- Preserve purchase/access recovery and owned library visibility.
- Add tests and screenshot handoff.

## Out Of Scope

- Public `/` marketing home redesign unless owner explicitly confirms.
- Letting the user remove or replace the primary Free Course CTA.
- Browser push notifications.
- Email, SMS, calendar, or wearable reminders.
- Exact clock-time scheduling in V1 unless this brief is updated.
- Social streaks, leaderboards, competitive points, or pressure-based retention.
- Full dashboard analytics.
- Commerce/pricing/entitlement changes.
- Admin-managed homepage modules.

## Acceptance Criteria

1. Free Course remains the primary My Library CTA.
2. A personal continue/today area appears below Free Course when relevant.
3. Default widget order is deterministic and useful with no user preferences.
4. If pinning ships, users can choose only a bounded number of widgets.
5. Preference save/failure state is visible and recoverable.
6. In-app due states never claim false completion or hide core navigation.
7. Purchase/access recovery remains visible and functional.
8. No push/email/SMS reminder is sent in V1.
9. Mobile and desktop layouts remain compact and readable.
10. Screenshot handoff is owner-approved before PR gates.

## Validation

- `npm run lint:briefs`
- targeted unit tests for widget registry, priority, and due-state helpers
- targeted API route tests if preferences/reminder settings persist
- `npx playwright test tests/e2e/my-library-landing-entrypoints.spec.ts --project=desktop-chromium`
- additional targeted Playwright coverage for personalization if new routes/components are added
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA And Screenshot Handoff

Required because this is UI work.

- Capture before/after screenshots for:
  - My Library default state,
  - My Library with active personal continue item,
  - preference edit/pin state if included,
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
- `Dryland Sessions`
- `My Swim Sessions`
- `Goals`
- `Program builder preview`
- `/my-library`
- `ContinueCourseCard`

## Execution Notes

- Start from clean `main`.
- Move this brief to `in-progress` when implementation starts.
- Confirm whether "home" means authenticated `/my-library` or public `/` before coding.
- Do not implement push/browser/email/SMS reminders unless a separate consent/privacy brief is approved.

## Checkpoint Log

- `2026-05-07 | planned | created after owner asked whether Micro Sessions, reminders, and selectable Home content should live under Free Course; recommendation is fixed Free Course primary CTA plus controlled personal section below | next: wait until prerequisite training surfaces are stable or owner selects this as the next slice`
