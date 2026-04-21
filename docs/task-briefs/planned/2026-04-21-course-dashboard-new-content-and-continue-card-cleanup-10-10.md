# Task Brief: Course Dashboard New Content And Continue Card Cleanup (10/10)

## Metadata

- `id`: `2026-04-21-course-dashboard-new-content-and-continue-card-cleanup-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-04-21`
- `updated`: `2026-04-21`

## Goal

Make the course dashboard notification and continue-card surfaces more compact by removing redundant explanatory copy and low-value actions.

## Sequencing Lock

- Run before maintenance baseline unless explicitly deferred.
- Keep this as dashboard UI/copy cleanup, not a course progress model redesign.

## Why This Brief Exists

- New lesson notification currently repeats itself with `New content`, count, heading, paragraph, and a first-lesson button.
- Owner decision: remove `Open first new lesson`.
- Continue card copy `We saved your latest lesson on this device...` is redundant.
- Course dashboard should follow the cleaner UI principles used in swim session builder, preview page controls, and contact/test-user form surfaces.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                             | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | New-content and continue-course cards each expose one clear job with minimal repeated copy.                                | screenshot and route review            | `5/5`                   |
| UX flow clarity                               | `target`     | Users can see new lesson count, reveal/hide list, open a lesson link, and continue course without duplicate CTAs.          | manual QA and targeted e2e             | `5/5`                   |
| Visual design quality                         | `target`     | Cards are compact, right-sized, and visually consistent across mobile/desktop with current polished app surfaces.          | before/after screenshots               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Removing copy/buttons does not break lesson list, continue route, latest lesson state, or progress persistence.            | unit/e2e tests                         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes learner dashboard surfaces, not admin editor workflows.                                           | explicit scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Toggle and continue actions have labels, focus, keyboard support, and screen-reader understandable state.                  | semantic review                        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: cleanup should reduce or preserve client work and not regress `/course` budgets.                          | build/perf budget output               | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Latest lesson state remains in the current local/server ownership model; UI cleanup does not change persistence semantics. | code review                            | `5/5`                   |
| Caching and invalidation strategy             | `target`     | New lesson list and continue state do not show stale or contradictory counts after hide/show or route transitions.         | route QA                               | `5/5`                   |
| Reliability and failure handling              | `target`     | Empty, no-new-lessons, saved-latest-lesson missing, and route-load failure states stay clear after copy removal.           | targeted QA                            | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: dashboard continues to respect existing access/private-gate boundaries.                                   | route auth review                      | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: latest-lesson device copy removal must not expose new personal progress data.                             | privacy review                         | `4/5`                   |
| Content governance                            | `target`     | Removed explanatory copy has no duplicate surviving variant; labels are canonical and concise.                             | copy review                            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin course authoring or publish workflow changes.                                                         | explicit scope rationale               | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public/private course dashboard metadata and crawl controls remain unchanged.                             | route metadata review                  | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public course semantic structure remains stable if any public course surface is touched.                  | route semantic review                  | `4/5`                   |
| Analytics and KPI observability               | `target`     | Removing `Open first new lesson` does not break or mislabel tracked lesson-open/continue events if they exist.             | event diff review                      | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, or billing workflow changes.                                                | explicit scope rationale               | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this dashboard copy cleanup introduces no new support workflow or incident runbook path.                       | explicit scope rationale tied to scope | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, invoice, or reporting path changes.                                                        | explicit scope rationale tied to scope | `N/A`                   |
| i18n operational readiness                    | `target`     | New labels are concise, canonical, and avoid mixed-language/duplicated translation debt.                                   | copy inventory review                  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing course dashboard components and no new dependency.                                                            | dependency diff                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover new-content toggle, lesson links, continue action, and removed first-lesson button.                            | targeted tests and verify gates        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: smaller surfaces reduce future content maintenance.                                                       | diff review                            | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: narrow UI/copy diff with no schema or migration.                                                          | PR review                              | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - course/lesson publication and access state.
- Local or existing state:
  - latest lesson device state as currently implemented.
- Sync policy:
  - no change to progress or latest-lesson persistence.
- Retention and sensitivity:
  - no new personal data surface.
- Cache/invalidation:
  - new lesson count/list and continue target should stay coherent after route changes.

## Identity And Rename Contract

- `N/A`
- Rationale: no course, lesson, slug, or route identifier is renamed.

## Scope

- Simplify new-content notification.
- Remove `Open first new lesson`.
- Keep a clear show/hide lesson list control.
- Remove redundant continue-card helper copy.
- Make `Continue course` compact and visually aligned to save vertical space.

## Out Of Scope

- Course progress storage changes.
- Lesson publishing/admin workflow changes.
- New notification system.
- Commerce/access model changes.

## Acceptance Criteria

1. New-content card keeps `New content` and count.
2. `Open first new lesson` is removed.
3. Lesson list remains directly usable when shown.
4. `Show lesson list`/`Hide lesson list` is right-aligned or otherwise compact.
5. Continue card no longer shows the redundant saved-device sentence.
6. Continue action still routes correctly.
7. Mobile and desktop preserve the same visual language.

## Validation

- `npm run lint:briefs`
- targeted course dashboard tests
- targeted mobile/desktop screenshots
- owner screenshot approval before PR gate
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local and Vercel preview.
- Course dashboard with one new lesson.
- Course dashboard with no new lessons.
- Latest lesson present and absent.
- Mobile and desktop.

## Design Constraints

- Use current app button/card rhythm.
- No explanatory copy unless it changes a user decision.
- Keep labels short and product-facing.

## Help/Guide Impact

- `N/A` unless implementation removes a documented course recovery behavior.

## Checkpoint Log

- `2026-04-21 | planned | created from owner findings about over-explained new lesson notification and continue-card copy | next: implement or defer before maintenance baseline`
