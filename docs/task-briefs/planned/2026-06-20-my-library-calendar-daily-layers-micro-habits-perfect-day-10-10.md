# Task Brief: My Library Calendar Daily Layers For Micro, Habits, Perfect Day (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-daily-layers-micro-habits-perfect-day-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-20`
- `mode`: `planned implementation child`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `child`: `E`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `main@1b8f87da`
- `audit_status`: `ready_after_source_contracts`
- `decision`: Execute only when micro sessions, habits, and Perfect Day have explicit daily summary/source contracts.
- `reason`: Calendar layers should summarize source-owned truth without moving source editing or scoring into the calendar.
- `must_refresh_before_execution_if`: Refresh if micro session completion, habit check-in, Perfect Day score, calendar layer taxonomy, or completion event contracts change.

## Goal

Add compact daily calendar layers for completed micro sessions, habits overview, and Perfect Day score so the calendar becomes a whole-day training overview without becoming the editor for those source systems.

## Pre-Implementation Owner Explanation

Codex skal legge micro sessions, habits og Perfect Day inn i kalenderen som enkle dags-signaler. Det gir oversikt over hele dagen, men detaljene og redigeringen skal fortsatt ligge i de eksisterende flatene. Utenfor scope er å bygge om habits, micro sessions, Perfect Day scoring, Garmin og swim completion.

## Scope

- Define a typed calendar layer view-model for daily summaries.
- Add completed micro session count/status layer from canonical source data.
- Add habits overview layer, for example `x/y habits`, from habit daily summary data.
- Add Perfect Day overview layer from score/summary data.
- Add filters/toggles for visible layers where needed.
- Link each layer to its owning source surface for edits/details.
- Keep month cells compact and move detail into selected-day detail.

## Out Of Scope

- Editing habit check-ins, micro sessions, or Perfect Day rules in the calendar.
- Creating completion events for swims.
- Garmin/provider sync.
- Replacing Compare analytics.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical: source-owned micro session completions, habit check-ins/summaries, Perfect Day summaries.
- Calendar-owned: read-only layer view-model and visible layer filters.
- Local/URL state: selected layers, selected date/day detail.
- Invalidation: calendar summaries refresh after source-owned mutations.

## Identity And Forward Compatibility Contract

- Layer events must have stable source IDs and source kinds.
- Unknown source kinds render as hidden/unmapped until explicitly mapped.
- Future layers should plug into the same layer contract without changing swim planned instance identity.
- Calendar summary labels are presentation only and must not become source identity.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                          | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Calendar shows swim plan plus micro, habits, and Perfect Day summaries without becoming their editor.                   | route/component tests + screenshot handoff  | `5/5`                   |
| UX flow clarity                               | `target`     | Users can distinguish planned swim sessions, completed micro sessions, habits progress, and Perfect Day score.          | copy review + screenshots                   | `5/5`                   |
| Visual design quality                         | `target`     | Layers remain compact in month/week cells and readable in day detail on mobile and desktop.                             | responsive screenshot handoff               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Each layer reads canonical source data and never infers source truth from labels or visual chips.                       | source contract tests                       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child changes end-user calendar summaries, not admin editing.                                          | explicit admin non-scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Layer filters, chips, and day detail are keyboard and screen-reader usable.                                             | a11y tests                                  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Layer reads stay bounded to selected window and avoid material client bundle growth.                                    | query/bundle review                         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Calendar renders read-only source summaries; source systems own mutations and scoring.                                  | data contract + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar refreshes layer summaries after source-owned updates without stale mixed-source states.                        | invalidation tests                          | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing source contracts, unknown layers, partial source failures, and empty days render deterministic states.          | negative-path tests                         | `5/5`                   |
| Security and authz                            | `target`     | Owner-scoped layer reads fail closed and never expose another user's habits/micro/Perfect Day data.                     | authz tests                                 | `5/5`                   |
| Privacy and compliance                        | `target`     | Calendar layer payloads exclude private notes/prompts/provider raw data not needed for the day summary.                 | payload review                              | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: source labels remain governed by their owning systems.                                                 | source contract review                      | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, operator actions, or role-gated CRUD change.                                      | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because private daily layer data is not public crawl content.                                                       | private-route rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because daily layers are private user data and not public AI-discoverable content.                                  | private-data rationale                      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: layer toggles/events, if added, use stable source-kind taxonomy and no double-counting.                | event review or no-new-event rationale      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: daily layers do not affect checkout, billing, entitlement, or product catalog truth.                   | scope review                                | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: support can distinguish missing source contract, source load failure, and unmapped layer states.       | support-copy/log review                     | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not touch revenue, invoices, refunds, payouts, entitlement reporting, or accounting data.   | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Layer labels, counts, scores, and unknown states avoid source identity coupling and are localization-ready.             | copy review + responsive tests              | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing source contracts, App Router, TypeScript, Tailwind tokens, and My Library components; add no dependency. | package diff + architecture review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Include source contract, view-model, component, authz, screenshot, `verify:pre-pr`, CI, and `verify:pre-merge`.         | validation outputs                          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Summary reads are window-bounded, batched by source, and avoid N+1 per day/source.                                      | query tests                                 | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Layer rendering can be disabled or reverted without corrupting source data or planned swim rows.                        | rollback notes + PR validation              | `5/5`                   |

## Acceptance Criteria

- Calendar shows compact daily signals for completed micro sessions, habits, and Perfect Day when source data exists.
- Empty/missing source states are explicit.
- Layer details link to source surfaces for editing.
- Month/week/day UI remains readable.

## Validation Plan

- `npm run lint:briefs`
- Source contract and view-model tests.
- Component/page tests and screenshot handoff.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-20 | planned | created as Child E after owner asked whether completed micro sessions, habits overview, and Perfect Day overview belong in the calendar | next: refresh source daily summary contracts before execution`
