# Task Brief: Course Menu And Pass Criteria States (10/10)

## Metadata

- `id`: `2026-04-03-course-menu-pass-criteria-states-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-03`
- `updated`: `2026-04-03`

## Goal

Make course pass criteria feel intentionally coached by default, and expose a truthful `in progress` lesson state in the learner course surface and course menu instead of collapsing everything into only `not done` versus `done`.

## Why This Brief Exists

- The umbrella still includes one remaining Package D note:
  - `23a95fce-3589-4e5c-9efd-1830502df768` `Course menu and pass criteria`
- Earlier course polish shipped local pass-criteria completion actions, but the default fallback criteria still reads like generic system copy.
- The learner course surface and `MenuDrawer` currently distinguish only `done` versus `not done`, even when a learner has already checked some pass criteria.
- This slice closes that gap by making fallback pass criteria clearer and making partial progress visible where learners navigate lessons.

## Dependencies And Boundaries

- Parent umbrella:
  - `docs/task-briefs/done/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Main surfaces in scope:
  - `app/course/page.tsx`
  - `components/MenuDrawer.tsx`
  - `lib/course/progress-status.ts`
  - `tests/e2e/course-pass-criteria-visibility.spec.ts`
  - `tests/unit/course-progress-status.test.ts`
- This slice owns:
  - clearer fallback pass-criteria copy,
  - truthful lesson progress-state derivation from done-gate checks,
  - learner course/menu status rendering for `not started`, `in progress`, and `done`.
- This slice does not own:
  - admin course workspace IA,
  - content-author-authored pass criteria,
  - brand rollout,
  - swim session builder field changes.

## Triage Disposition

- `23a95fce-3589-4e5c-9efd-1830502df768` `Course menu and pass criteria`
  - disposition: owned by this brief.
  - reason: the remaining gap is learner-facing pass-criteria defaults plus truthful partial-complete menu status.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                             | Evidence                                     |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Product goals and IA                          | `target`     | Learners can see a truthful lesson progress state in course navigation, and fallback pass criteria reads like deliberate coaching guidance instead of filler. | code review + targeted tests                 |
| UX flow clarity                               | `target`     | `/course` and the course menu expose a distinct `in progress` state once criteria checks start, without confusing it with fully done lessons.              | manual QA + Playwright                       |
| Visual design quality                         | `target`     | `not started`, `in progress`, and `done` states remain visually distinct but consistent with the existing course chrome.                                   | screenshot/manual review                     |
| Business logic correctness and data integrity | `target`     | Partial lesson state derives only from canonical done-gate checks plus done-lesson IDs, and never from cosmetic local heuristics.                         | helper tests + e2e + code review             |
| Admin editor ergonomics                       | `N/A`        | N/A because the slice changes learner course/menu progress signals, not admin editing workflows.                                                           | explicit scope rationale                     |
| Accessibility (a11y)                          | `supporting` | Supporting only: updated lesson-status chips and checklist copy keep existing semantics and keyboard behavior intact.                                      | Playwright + review                          |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the slice reuses existing local lesson-progress state and adds no network round-trip.                                                     | diff review + `verify:pre-pr`                |
| Data placement and sync boundaries            | `target`     | Done-gate checks and done-lesson IDs remain the only learner progress inputs; new visual states are derived, not separately persisted.                    | brief contract + helper design               |
| Caching and invalidation strategy             | `supporting` | Supporting only: the slice changes client-side rendering of existing course progress state only.                                                           | code review                                  |
| Reliability and failure handling              | `target`     | Lessons without authored criteria still render safe defaults, and hidden checkpoint lessons never show false partial progress.                             | helper tests + Playwright                    |
| Security and authz                            | `N/A`        | N/A because there is no authz or permission-surface change in this slice.                                                                                  | explicit scope rationale                     |
| Privacy and compliance                        | `N/A`        | N/A because the slice introduces no new user data surface beyond existing local learner progress.                                                          | explicit scope rationale                     |
| Content governance                            | `target`     | Default pass-criteria wording becomes a shared source of truth instead of scattered inline strings.                                                        | helper module + code review                  |
| Admin workflow and editability                | `N/A`        | N/A because no admin notes or admin editor workflow changes.                                                                                               | explicit scope rationale                     |
| SEO and crawlability                          | `supporting` | Supporting only: learner course UI changes preserve existing metadata/canonical behavior.                                                                  | existing sitemap/metadata coverage           |
| AI discoverability                            | `N/A`        | N/A because the slice changes authenticated learner UI state only.                                                                                         | explicit scope rationale                     |
| Analytics and KPI observability               | `supporting` | Supporting only: existing course completion/progress events remain meaningful because partial progress becomes more truthful, not less observable.          | analytics contract review                    |
| Commerce and revenue ops                      | `N/A`        | N/A because no price, entitlement, or offer behavior changes.                                                                                              | explicit scope rationale                     |
| Incident response and support operations      | `N/A`        | N/A because the slice adds no new support flow or operator recovery step.                                                                                  | explicit scope rationale                     |
| Finance and reporting operations              | `N/A`        | N/A because there is no finance/reporting impact.                                                                                                           | explicit scope rationale                     |
| i18n operational readiness                    | `supporting` | Supporting only: fallback pass-criteria copy is centralized for future localization rather than embedded ad hoc in multiple components.                    | helper extraction + review                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing course state, `MenuDrawer`, and learner progress primitives without adding dependencies.                                                    | dependency diff + code review                |
| Testing and QA automation                     | `target`     | Helper-unit coverage plus targeted course Playwright coverage lock the default-copy and partial-progress contract, and `npm run verify:pre-pr` passes.     | test files + gate output                     |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice is pure client derivation on already-loaded lesson state.                                                                       | architecture review                          |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice is a small UI/state-derivation change with straightforward rollback boundaries.                                                 | PR summary + rollback note                   |

## Data Placement And Sync Contract

- Server-canonical:
  - course lesson definitions,
  - authored `passCriteria`,
  - learner done-lesson sync inputs where enabled.
- Local-only:
  - done-gate checklist checkmarks before mark-done completion,
  - derived `not started / in progress / done` visual state.
- Sync policy:
  - `done` remains controlled by the existing done-lesson path,
  - `in progress` is derived from existing done-gate checks only,
  - no separate partial-progress persistence layer is introduced.
- Cache/invalidation:
  - status chips and menu summaries update immediately from the same local state that already drives checklist and done-button behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - `lesson.id` remains the only lesson identity for progress-state mapping.
- Human-readable identifiers:
  - pass-criteria copy and lesson-status labels are display text only.
- Mutability rules:
  - authored pass criteria overrides fallback copy.
  - default fallback wording can evolve centrally without changing lesson identity.

## Scope

- Centralize default pass-criteria copy in one helper.
- Expose a truthful partial-progress state for course lessons.
- Show that state in `/course` and `MenuDrawer`.
- Add targeted unit + Playwright regression coverage.

## Out Of Scope

- Admin course workspace redesign.
- New course analytics events.
- Reworking the whole lesson-overview layout.
- Brand rollout or builder-flow changes.

## Acceptance Criteria

1. Lessons without authored pass criteria render clearer fallback pass-criteria copy.
2. A lesson with some checked criteria but not marked done shows `in progress`, not the same state as untouched lessons.
3. `MenuDrawer` reflects `not started`, `in progress`, and `done` truthfully for lessons and modules.
4. Hidden-checkpoint lessons do not show false partial progress.
5. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/course-progress-status.test.ts`
- targeted `playwright`:
  - `tests/e2e/course-pass-criteria-visibility.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Keep this slice learner-course-focused.
- Do not remove any swim-session builder manual input fields.
- Do not alter authored pass criteria where content already defines them.

## Help/Guide And Operator Training Contract

- `N/A` for this slice because it adjusts learner-facing lesson-state truth and fallback copy only; it does not create a new operator workflow or recovery step.

## Checkpoint Log

- `2026-04-03 | working tree | full npm run verify:pre-pr is green after hardening the course pass-criteria Playwright against canonical lesson-id redirect + published-content hydration drift and after caching the generator-entry href before click fallback; this slice now has truthful ready/in-progress/done states in /course and MenuDrawer, clearer fallback criteria by lesson type, and hardened related workout/dryland/generator e2e waits | next: stage source files only, commit, push, and open the PR`
- `2026-04-03 | working tree | shared course progress helper, clearer fallback pass criteria, and truthful lesson/module in-progress states now render in /course and MenuDrawer; targeted vitest, npm run typecheck, and targeted desktop-chromium Playwright are green | next: run npm run lint:briefs:all, then full npm run verify:pre-pr before commit/push/PR`
- `2026-04-03 | working tree | started the remaining course-menu/pass-criteria child slice for note 23a95fce; scope is clearer fallback pass criteria plus truthful partial-progress state in /course and MenuDrawer | next: implement the shared progress helper, update learner surfaces, add targeted tests, and run validation`
