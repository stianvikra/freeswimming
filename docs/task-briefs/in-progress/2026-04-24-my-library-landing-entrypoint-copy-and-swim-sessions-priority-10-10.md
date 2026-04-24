# Task Brief: My Library Landing Entrypoint Copy And Swim Sessions Priority (10/10)

## Metadata

- `id`: `2026-04-24-my-library-landing-entrypoint-copy-and-swim-sessions-priority-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-24`
- `updated`: `2026-04-24`

## Goal

Make the authenticated My Library landing page read as a cleaner browse-first hub by stripping low-value card copy, shortening single-card CTA labels, and making `My Swim Sessions` the primary swim-session entry action.

## Parent Brief

- Parent IA umbrella:
  - `docs/task-briefs/planned/2026-04-21-my-library-my-training-ia-and-builder-entrypoint-reconcile-10-10.md`

## Sequencing Lock

- Execute as a narrow child slice under the My Library/My Training IA umbrella.
- Run before maintenance baseline unless explicitly deferred.
- Do not change routes, persistence, or account/billing placement in this slice.

## Why This Brief Exists

- The owner wants the My Library landing page to feel lighter and more operational.
- The current landing page still includes low-value helper copy in `Goals` and `Focus & Notes`.
- The swim-session card still reads as builder-first, even though saved-session browsing is the more common entry action.
- Single-action landing cards still waste horizontal and vertical space with long CTA labels like `Open profile` and `Start free course`.
- The broader umbrella should be split into reversible child slices instead of one large IA PR.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                               | Evidence                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | My Library landing cards expose clearer jobs with no low-value duplicate helper copy and `My Swim Sessions` as swim primary action.                                                          | screenshot review + route QA   | `5/5`                   |
| UX flow clarity                               | `target`     | Users can spot profile, goals, focus, and swim-session browse entrypoints with less reading and no ambiguity about the swim default path. Single-action cards use short, obvious CTA labels. | manual QA + screenshot review  | `5/5`                   |
| Visual design quality                         | `target`     | Desktop keeps right-aligned action rows where space allows; single-action cards may sit side-by-side on mobile when they fit cleanly; card rhythm stays consistent with recent cleanup work. | desktop/mobile screenshots     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | This slice changes labels/copy/action priority only; no persistence, sync, or route behavior regresses.                                                                                      | targeted tests + route review  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice only changes authenticated learner-facing My Library landing cards.                                                                                                   | explicit scope rationale       | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Card headings and CTA labels remain semantically clear and keyboard reachable after action-priority changes.                                                                                 | semantic review + targeted e2e | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: copy cleanup and CTA restyling must not regress `/my-library` budgets.                                                                                                      | verify/perf output             | `4/5`                   |
| Data placement and sync boundaries            | `target`     | My Library landing remains a read/launch surface only; no server/local data ownership changes.                                                                                               | code review                    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no stale-state or route invalidation behavior changes.                                                                                                                      | route QA                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Sync-foundation warnings still appear where needed and no card becomes dead or misleading in schema-not-ready states.                                                                        | manual QA + targeted tests     | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: authenticated route boundaries and private data visibility remain unchanged.                                                                                                | route auth review              | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: card summaries stay minimal and do not reveal more profile/training data than before.                                                                                       | copy review                    | `4/5`                   |
| Content governance                            | `target`     | Canonical landing labels use the browse-first naming contract already established for swim sessions.                                                                                         | label inventory                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or content publishing surface changes.                                                                                                                         | explicit scope rationale       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library route with no public crawl contract.                                                                                                         | explicit scope rationale       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable surface changes.                                                                                                                                       | explicit scope rationale       | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing route-entry analytics should stay truthful after CTA priority changes.                                                                                             | event/path review              | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because billing/checkout placement is intentionally out of scope for this slice.                                                                                                         | explicit scope rationale       | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: support can describe My Library landing entrypoints more simply after the cleanup.                                                                                          | support-path review            | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoice, billing, reconciliation, or finance logic changes.                                                                                                                   | explicit scope rationale       | `N/A`                   |
| i18n operational readiness                    | `target`     | Labels stay concise, canonical, and translation-friendly.                                                                                                                                    | copy review                    | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing My Library page structure and button patterns with no new dependency.                                                                                                         | dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests lock the new landing-card labels/copy and swim-session primary CTA behavior on desktop/mobile.                                                                                         | targeted tests + verify gates  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: lighter landing cards reduce future UI sprawl in the wider IA umbrella.                                                                                                     | diff review                    | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: narrow landing-page diff is easily reversible with no migration.                                                                                                            | PR slice review                | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - user identity,
  - profile snapshot,
  - goals count,
  - training-context snapshot,
  - workout/program/dryland library snapshots.
- Local-only:
  - none added in this slice.
- Sync policy:
  - unchanged; this slice only changes landing presentation and CTA priority.
- Retention and sensitivity:
  - no new data exposed or stored.
- Cache/invalidation:
  - unchanged.

## Identity And Rename Contract

- Stable IDs:
  - all route params and persisted entity IDs remain unchanged.
- Human-readable labels:
  - landing-card labels may change.
- Mutability:
  - this slice changes presentation labels only, not route paths.
- Compatibility:
  - no redirects required because paths stay unchanged.

## Scope

- `app/my-library/page.tsx`
- `components/my-library/ContinueCourseCard.tsx`
- targeted tests for My Library landing labels/CTA priority
- targeted desktop/mobile screenshots

## Out Of Scope

- moving billing/account actions
- moving goals/focus into profile
- renaming `/my-library/training` route
- program/dryland IA redesign
- age-from-birthdate profile summary logic

## Acceptance Criteria

1. `Continue Free Course` is renamed to `Free Course`.
2. The free-course CTA reads `Start` when no saved lesson exists and `Continue` when saved progress exists.
3. `My Swim Profile`, `Goals`, and `Focus & Notes` single-card CTA labels read `Open`.
4. `Goals` card no longer shows low-value helper/summary copy on the landing page unless a schema-sync warning is required.
5. `Focus & Notes` card no longer shows the generic helper sentence on the landing page.
6. Swim-session landing card heading reads `Swim Sessions`.
7. `My Swim Sessions` is the primary blue CTA on the landing page.
8. Create/build swim actions remain available as secondary actions.
9. Single-action cards may sit side-by-side on mobile when the short labels fit without unstable wrapping.
10. No route path or persistence behavior changes.

## Validation

- `npm run lint:briefs`
- targeted tests for My Library landing labels/actions
- targeted desktop/mobile screenshots
- owner approval before PR gate
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local
- Vercel preview
- desktop
- mobile

## Design Constraints

- Keep My Library landing calm and browse-first.
- No explanatory paragraph unless it changes a real decision.
- Preserve current card/button visual language.
- Prefer short CTA verbs on single-action entry cards.
- Let short single-action cards use horizontal title/CTA balance on mobile when they fit naturally; do not force this on multi-action cards.

## Help/Guide Impact

- `N/A` for this child slice because no workflow docs or route names visible in Help/Guide change yet.

## Checkpoint Log

- `2026-04-24 | in-progress | created as the first executable child slice under the My Library/My Training IA umbrella, narrowed to landing-card copy cleanup and swim-session CTA priority | next: implement on My Library landing page and lock the new labels/CTA priority with targeted tests`
- `2026-04-24 | in-progress | scope tightened after screenshot review to shorten single-action CTA labels and rename the free-course entry card to Free Course with Start/Continue button copy | next: implement the shorter labels, refresh screenshots, and stop again at visual approval`
- `2026-04-24 | in-progress | implementation complete; owner approved refreshed desktop/mobile screenshots for Free Course, Open CTAs, and Swim Sessions browse-first priority; targeted tests green and full verify:pre-pr green | next: commit, push, open PR, and run verify:pre-merge before merge recommendation`
- `2026-04-24 | in-progress | perf-budget trend recommended tightening one stretch target after two weekly green runs; decision for this IA/copy slice is hold/defer and record the tighten-or-hold action in maintenance baseline instead of changing perf targets here | next: carry the defer note in PR summary and maintenance-baseline follow-through`
