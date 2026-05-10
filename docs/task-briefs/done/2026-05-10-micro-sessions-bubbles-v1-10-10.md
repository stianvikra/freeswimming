# Task Brief: Micro Sessions Bubbles V1 (10/10)

## Metadata

- `id`: `2026-05-10-micro-sessions-bubbles-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-10`
- `updated`: `2026-05-10`

## Goal

Add an optional, rewarding Bubbles execution mode for Micro Sessions while preserving the ordered mode and the existing server-canonical set-unit contract.

## Product Decision

Implement bubbles now, before training stats, so the owner can test whether Micro Sessions feels motivating and mobile-friendly. This slice ships the smallest useful game-mode experience: same units, same mutations, an accessible detail panel, and server-confirmed completion before visual pop feedback.

Do not store raw bubble drag positions, pop telemetry, audio plays, haptic attempts, hover noise, or tap noise. Training stats and long-term habit rollups stay in the separate stats/habits brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Privacy and compliance
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                       | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Bubbles is an optional mode inside the existing Micro Sessions panel and does not replace ordered execution, Dryland Sessions, or future stats.          | IA/code review + screenshot handoff                       | `5/5`                   |
| UX flow clarity                               | `target`     | User can switch Ordered/Bubbles, select a bubble, complete/skip/undo from detail controls, and double-click/double-tap complete without dead ends.       | component tests + manual screenshot QA                    | `5/5`                   |
| Visual design quality                         | `target`     | Bubble board is legible on mobile/desktop, stable, calm, and consistent with My Library/Dryland visual language.                                         | mobile + desktop screenshot handoff                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Bubbles call the same server-confirmed `blockStatus` mutations as ordered mode; no local-only pop state becomes business truth.                          | component tests + existing API tests                      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an authenticated user Micro Sessions execution mode and does not touch admin editors.                                                | explicit scope rationale                                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Bubbles are keyboard-selectable buttons with labels, detail controls provide the complete path, progress keeps semantics, and reduced motion is honored. | component assertions + screenshot/manual QA               | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency; bounded unit count uses existing `DRYLAND_MICRO_MAX_UNITS`; animations are CSS-only and reduced-motion safe.                          | dependency diff + type/lint/build gates                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical data remains micro plan blocks/status; selected mode and pop animation are local-only presentation state.                               | data-boundary review + code review                        | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing write-through returned plan refresh remains the source of truth after each mutation.                                                            | component/API flow review                                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Failed completion does not pop a bubble or advance progress; pending/paused states disable unsafe actions.                                               | component tests + existing negative-path API tests        | `5/5`                   |
| Security and authz                            | `target`     | No new API surface; existing authenticated owner-scoped Micro Sessions route remains the only mutation path.                                             | no-route-change review + existing API negative-path tests | `5/5`                   |
| Privacy and compliance                        | `target`     | No bubble interaction telemetry, no audio/haptic tracking, no extra personal data in logs or storage.                                                    | code review + brief contract                              | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: labels continue to come from source dryland snapshots; no new content publishing workflow.                                              | UI copy/code review                                       | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, moderation, operator workflow, or admin edit surface changes.                                                                 | explicit scope rationale                                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is authenticated/private My Library UI and no public metadata, sitemap, robots, or crawlable page changes.                              | explicit scope rationale                                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, structured data, or public docs page changes.                                                             | explicit scope rationale                                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: do not add analytics in this slice; stats/habits brief owns durable analytics taxonomy.                                                 | no-analytics-code review                                  | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because Micro Sessions bubbles do not touch pricing, checkout, entitlements, refunds, payouts, or revenue recognition.                               | explicit scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `target`     | Support can distinguish ordered vs bubbles, failed completion, reduced-motion animation, and schema-sync issues.                                         | runbook update + screenshot handoff                       | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this authenticated training UI has no finance, payout, subscription, invoice, entitlement, or reporting impact.                              | explicit scope rationale                                  | `N/A`                   |
| i18n operational readiness                    | `target`     | Mode labels and action copy remain short, plain, and structurally localizable without schema changes.                                                    | copy review                                               | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React/Tailwind/lucide stack, existing Micro Sessions view-model/API, and add no dependencies.                                             | dependency diff + architecture review                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/component coverage protects mode switch, selection, double-tap completion, failure behavior, and ordered fallback.                                  | targeted Vitest + verify gates                            | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Rendering remains bounded by existing max unit count; no polling, background jobs, or stored presentation telemetry.                                     | code review + existing unit-count guard                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration; rollback is a UI-only revert with existing ordered mode and API contract intact.                                                           | no-migration review + pre-pr/pre-merge gates              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `components/my-library/dryland/DrylandMicroPlanPanel.tsx`,
  - keep `/my-library/dryland` as the route,
  - keep mutations in the existing Micro Sessions API routes,
  - preserve returned-plan write-through state refresh.
- TypeScript/domain contracts:
  - reuse `DrylandMicroBlockSnapshot`, `DrylandMicroPlanRecord`, and `DrylandMicroBlockStatus`,
  - add local-only execution mode and selected-bubble state,
  - complete/skip/undo must call the same `updateBlock` path as ordered mode.
- Supabase/data layer:
  - no migration in this slice,
  - no RLS or generated type changes,
  - existing owner-scoped API tests remain the authz evidence.
- UI system:
  - use existing My Library/Dryland panel styling,
  - use a segmented Ordered/Bubbles control,
  - use accessible `button` bubbles with labels and detail controls,
  - respect reduced motion through existing global CSS policy plus scoped pop animation,
  - screenshot handoff is `after/reference`: after bubbles compared with ordered reference.
- Testing:
  - targeted component tests for mode switch, bubble selection, double-tap completion, failure behavior, and schema fallback,
  - existing API/domain tests for canonical mutation behavior,
  - screenshot handoff before PR gates.

## Data Placement And Sync Contract

- Server-canonical:
  - micro plan id, block ids, source snapshots, release availability, statuses, completed/skipped timestamps, and progress.
- Local-only:
  - selected execution mode, selected bubble, last tap timing, transient pop animation, pending UI state.
- Sync policy:
  - bubbles never mutate local truth directly,
  - completion/skip/undo uses existing `PATCH /api/my-library/dryland/micro-plans/[planId]`,
  - visual pop feedback appears only after a successful server response,
  - failed writes keep the bubble visible and show retryable error feedback.
- Retention and sensitivity:
  - no bubble presentation state is persisted,
  - no drag, audio, haptic, hover, or tap telemetry is stored.
- Cache/invalidation:
  - returned plan payload updates client state after mutations,
  - no route cache changes.

## Identity And Rename Contract

- Canonical stable ID:
  - existing micro plan id and block id.
- Human-readable identifiers:
  - bubble labels use existing exercise title and target label snapshots.
- Mutability rules:
  - labels remain snapshots; bubble UI does not create new identifiers.
- Rename vs repurpose policy:
  - no entity rename or repurpose behavior changes.
- Compatibility contract:
  - ordered mode remains available and all existing V2 units remain readable.
- Observability and repair:
  - failed mutations continue through existing error messages and support runbook.

## Scope

- Add Ordered/Bubbles mode control to the existing Micro Sessions panel.
- Render available units as selectable bubbles.
- Add selected-bubble detail panel with `Complete`, `Skip`, and `Undo` controls.
- Support double-click/double-tap completion through the same server-confirmed mutation path.
- Add scoped pop animation after successful completion.
- Update support guidance and component tests.

## Out Of Scope

- Persistent drag positions.
- Dragging between day lanes or schedule mutation by drag.
- Audio, haptics, confetti, rewards, streaks, or variable rewards.
- Training stats, habits, dashboards, or analytics events.
- New database tables, migrations, API routes, or external dependencies.
- Replacing ordered mode.

## Acceptance Criteria

1. Existing ordered mode remains available and works as before.
2. User can switch to Bubbles when a Micro Session has available units.
3. Bubble tap/click selects a unit and opens details.
4. Double-click/double-tap on a bubble completes exactly that unit through the existing server mutation.
5. Completion pop feedback appears only after the server mutation succeeds.
6. Failed completion keeps the bubble visible and shows an error.
7. Paused plans disable bubble completion/skip just like ordered mode.
8. Keyboard and screen-reader users can complete units from the detail controls.
9. No bubble interaction telemetry or presentation state is persisted.
10. Screenshot handoff shows mobile and desktop bubbles plus ordered reference.

## Validation

- `npm run lint:briefs`
- targeted component tests for `DrylandMicroPlanPanel`
- targeted Micro Sessions domain/API tests if mutation code changes
- screenshot handoff before `npm run verify:pre-pr`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local authenticated `/my-library/dryland` with a saved dryland session and active Micro Session.
- Vercel preview after PR checks are green.

## Help / Guide Impact

Required: update `docs/runbooks/auth-account-support.md` so support can identify ordered vs bubbles mode and diagnose failed bubble completion without treating bubbles as stored analytics truth.

## Route / Label / Support Surface Sweep

Run targeted sweep for `Micro Sessions`, `Bubbles`, `Ordered`, `bubble`, `double-click`, `double tap`, `Complete`, `Skip`, `Undo`, `pop`, `drag`, `audio`, `haptic`, `/my-library/dryland`, and support docs before broad verification.

Evidence:

- Identifiers searched: `Micro Sessions`, `Bubbles`, `Ordered`, `bubble`, `double-click`, `double tap`, `Complete`, `Skip`, `Undo`, `pop`, `drag`, `audio`, `haptic`, `/my-library/dryland`.
- Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, and `docs/task-briefs/done/`.
- Fallout handled: component, tests, runbook, CSS, and this brief; no Help/Guide, route, API, or persisted label changes were required.

## Checkpoint Log

- `2026-05-10` - Started after owner chose recommended continuation: implement Micro Sessions bubbles now, then test and fine-tune before stats. Next: implement UI-only bubbles slice on `micro-sessions-bubbles-v1`.
- `2026-05-10` - Implemented UI-only Bubbles V1: Ordered/Bubbles segmented mode, selectable bubble board, detail panel, double-click/double-tap completion through the existing server-confirmed block mutation, failure-safe behavior that keeps bubbles visible, paused-state disabling, and scoped reduced-motion-safe pop animation. Support runbook updated. Route/label/support sweep ran for `Micro Sessions`, `Bubbles`, `Ordered`, `bubble`, `double-click`, `double tap`, `Complete`, `Skip`, `Undo`, `pop`, `drag`, `audio`, `haptic`, `/my-library/dryland`, and support docs; fallout was limited to the component, tests, runbook, CSS, and this brief. Targeted validation passed: `npm run lint:briefs:all`, `npm run lint`, `npm run typecheck`, and `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-micro-plan-routes.test.ts` (`3` files, `25` tests). Screenshot handoff captured `after/reference` artifacts at `output/micro-sessions-bubbles-v1-2026-05-10-140207`; temporary screenshot fixture/scripts were removed afterward and no final product-rendering files changed after capture. Next: owner visual approval before `npm run verify:pre-pr`.
- `2026-05-10` - Owner screenshot approval stop completed: owner approved screenshot/visual direction. Next: run `npm run verify:pre-pr`, commit, push, open PR, monitor CI, then run `npm run verify:pre-merge`.
- `2026-05-10` - `npm run verify:pre-pr` passed in full public lane (`82` e2e passed, `374` skipped). Perf budget trend recommended tightening one stretch target after `4` consecutive weekly green runs; hold decision for this UI-only slice to avoid changing unrelated performance budgets, and record as PR follow-up. Next: commit and push `micro-sessions-bubbles-v1`.
