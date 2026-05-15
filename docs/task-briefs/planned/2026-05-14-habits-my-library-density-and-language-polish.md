# Task Brief: Habits My Library Density And Language Polish

## Metadata

- `id`: `2026-05-14-habits-my-library-density-and-language-polish`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-14`
- `updated`: `2026-05-14`

## Goal

Make Habits in My Library easier to scan and edit by reducing duplicated labels, collapsing the add form by default, and using clearer habit mode language.

## Audit Findings

Owner UI audit on `2026-05-14` identified these Habits issues:

1. `Cold Water` shows `Done only` twice.
2. The `Add habit` form is always expanded and pushes active habits down the page.
3. The primary `Add habit` action should open the form from the Habits surface in My Library.
4. The text under the `Habits` heading wraps to two lines and feels heavier than the job requires.
5. `Build` is unclear as a habit mode label; the recommended mode labels are `Do`, `Quit`, and `Timed`.

## Product Decision

Habits should open as a compact management surface: active habits first, details collapsed by default, and creation behind a clear `Add habit` action. The habit mode vocabulary should be literal:

- `Do`: a habit the swimmer wants to perform.
- `Quit`: a habit the swimmer wants to stop.
- `Timed`: a habit measured by duration.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                         | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habits prioritizes active habit scan/edit work before creation details; `Add habit` opens creation inline without burying the list.                                        | screenshot handoff + route review             | `5/5`                   |
| UX flow clarity                               | `target`     | No duplicate `Done only`; habit modes read as `Do`, `Quit`, `Timed`; details and add form are collapsed until requested.                                                   | component tests + manual QA                   | `5/5`                   |
| Visual design quality                         | `target`     | Heading copy is short, does not wrap awkwardly at desktop/mobile target widths, and habit cards stay compact without text overlap.                                         | after/reference screenshots                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Mode rename is display/contract-safe or migrated explicitly; existing habit type semantics and check-in history remain unchanged.                                          | unit tests + domain diff review               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a user-facing Habits surface, not an admin editor workflow.                                                                                            | explicit admin scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Collapsed sections use labelled controls with `aria-expanded`; add/edit/details actions remain keyboard reachable and screen-reader clear.                                 | Testing Library assertions + Playwright smoke | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, polling, or extra authenticated fetch; collapsed form reduces initial visible DOM noise and `/my-library` payload remains within current budget.        | perf budget check + dependency diff           | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Habit records and check-ins remain server-canonical; expanded/collapsed UI state stays local-only.                                                                         | data-boundary review                          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Authenticated Habits routes keep existing dynamic read/mutation refresh behavior; no new cache layer ships.                                                                | route/cache diff review                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Add/edit/check-in failure states keep existing visible data and expose retry or recoverable feedback.                                                                      | component tests + manual QA                   | `5/5`                   |
| Security and authz                            | `supporting` | Existing owner-scoped habit API boundaries remain fail-closed; no new protected API is introduced unless covered by negative-path tests.                                   | API diff review                               | `4/5`                   |
| Privacy and compliance                        | `supporting` | No new personal data category, third-party service, notification token, or analytics payload is introduced.                                                                | privacy/no-event review                       | `4/5`                   |
| Content governance                            | `target`     | `Build`/`Quit`/`Timed`, `Done only`, and Habits heading/support copy are swept across code, tests, docs, and Help/Guide surfaces for stale language.                       | route/label/support sweep                     | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, operator action, moderation path, or admin content editability changes.                                                                     | explicit admin workflow rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Habits is an authenticated/private route and no public metadata, sitemap, robots, canonical, or crawlable content changes.                                     | explicit private-route rationale              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable route, structured public entity data, or crawl-safe content model changes.                                                           | explicit AI-discoverability rationale         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | No new event taxonomy is required; if existing habit events are touched, payloads must remain route-stable and no-PII.                                                     | no-event review or event diff review          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, subscription, refund, payout, invoice, or revenue operation changes.                                                        | explicit commerce scope rationale             | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs can explain habit mode labels, collapsed creation, and how to recover if add/edit/check-in feedback fails.                                                    | support/user-flow docs                        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reporting, invoice, subscription, payout, revenue recognition, or reconciliation data changes.                                                      | explicit finance scope rationale              | `N/A`                   |
| i18n operational readiness                    | `supporting` | New mode labels and helper copy stay short, literal, and localizable; no locale routing or translation workflow ships.                                                     | copy review                                   | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Habits/My Library components, typed habit contracts, mutation paths, and Tailwind primitives; add no dependency.                                            | dependency diff + code review                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover collapsed add form, mode label rendering, no duplicate type chip, and critical add/edit/check-in actions.                                                      | targeted Vitest/Playwright + verify gates     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Collapsed UI is local render state only and must not add extra queries, polling, or unbounded client state.                                                                | query/runtime review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/config/dependency is expected; rollback is a normal code/docs/test revert, or migration rollback is explicitly documented if mode storage changes are needed. | no-migration review + verify gates            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse the existing Habits/My Library route and components;
  - do not introduce a new route for adding habits unless the audit proves inline collapse is not viable.
- TypeScript/domain contracts:
  - preserve existing habit mode/type/check-in contracts unless a deliberate migration is scoped;
  - if `Build` is stored as a persisted enum, decide display-only rename vs migration before implementation.
- Supabase/data layer:
  - default expectation is no schema/RLS/generated type change;
  - if enum/storage changes are required, add explicit migration and negative-path tests.
- UI system:
  - use existing My Library/Habits primitives, compact cards, labelled disclosure controls, and screenshot handoff.
- Testing:
  - targeted unit/component tests for labels, collapse, and duplicate-chip removal;
  - Playwright/screenshot coverage for desktop and mobile.

## Data Placement And Sync Contract

- Server-canonical:
  - habit records,
  - habit mode/type/category/cadence,
  - check-in history.
- Local-only:
  - add-form expanded/collapsed state,
  - details expanded/collapsed state,
  - transient submit pending/error state.
- Sync policy:
  - existing habit mutations remain authoritative;
  - failed mutation must keep last visible server data and show recoverable feedback.
- Cache/invalidation:
  - authenticated route behavior remains dynamic; existing mutation refresh behavior remains the invalidation path.

## Identity And Rename Contract

- Canonical stable IDs:
  - habit ids and check-in ids remain the source of truth.
- Human-readable identifiers:
  - habit names remain renameable display labels.
- Mode labels:
  - `Do`, `Quit`, `Timed` are user-facing labels; storage values must be explicitly mapped or migrated.
- Rename vs repurpose policy:
  - changing a habit name does not repurpose historical check-ins unless the user explicitly edits the habit.
- Compatibility:
  - existing `Build` records must still render safely after the label change.

## Scope

- Remove duplicate `Done only` display for habit rows/cards.
- Rename user-facing mode labels to `Do`, `Quit`, `Timed` if contract-safe.
- Collapse `Add habit` by default and expose a primary `Add habit` action near the top of Habits.
- Keep active habits visible before the creation form.
- Shorten or remove the explanatory copy under `Habits`.
- Keep details/edit/archive behind explicit row actions.
- Update tests, docs, Help/Guide surfaces, and screenshot handoff.

## Out Of Scope

- New reminder/notification system.
- New habit analytics dashboard.
- Habit streak algorithm redesign.
- Dryland/Micro Session changes.
- Commerce, admin, course, or public marketing changes.

## Acceptance Criteria

1. Habits opens with active habits visible before the add form.
2. `Add habit` opens the creation form inline and can be collapsed again if the existing UI pattern supports it.
3. `Cold Water` or any similar habit displays `Done only` at most once.
4. Habit mode labels are clear: `Do`, `Quit`, `Timed`, with persisted compatibility validated.
5. Text under `Habits` is short enough not to wrap awkwardly at supported desktop/mobile widths, or is removed.
6. Keyboard and screen-reader users can open details, edit, archive, and add habits.
7. No new dependency, migration, polling, or extra authenticated fetch is added unless explicitly justified in the implementation update.
8. Targeted tests and screenshots cover the changed Habits surfaces.

## Validation Plan

- `npm run lint:briefs`
- Targeted Habits unit/component tests.
- Targeted Playwright/screenshot handoff for `/my-library/habits` and My Library Habits entry points.
- `npm run lint`
- `npm run typecheck`
- `npm run verify:pre-pr` after screenshot approval.
- `npm run verify:pre-merge` before merge recommendation.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/habits`
  - relevant My Library route that embeds Habits.
- Screenshot handoff:
  - after/reference mobile and desktop screenshots for Habits overview,
  - add form collapsed and expanded,
  - representative habit details row.

## Help / Guide Impact

Required. Update user-flow/support docs if labels or recovery behavior change:

- `Build` to `Do` label mapping,
- what `Quit` and `Timed` mean,
- where to add a habit,
- how to recover from failed add/edit/check-in.

## Route / Label / Support Surface Sweep

Run targeted sweep before broad gates for:

- `Habits`
- `Add habit`
- `Build`
- `Do`
- `Quit`
- `Timed`
- `Done only`
- `Cold Water`
- `/my-library/habits`

Surfaces to check: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, task briefs, and Help/Guide assertions where relevant.

## Checkpoint Log

- `2026-05-14 | planned | owner UI audit captured Habits density/language findings while Dryland/offline recovery slice was in progress; scope parked as a separate planned brief to keep Dryland PR clean | next: start this brief after Dryland/offline recovery PR is reviewed/merged`
