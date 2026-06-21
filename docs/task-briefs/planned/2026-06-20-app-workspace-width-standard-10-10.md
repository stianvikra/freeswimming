# Task Brief: App Workspace Width Standard (10/10)

## Metadata

- `id`: `2026-06-20-app-workspace-width-standard-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-20`
- `mode`: `planned architecture/design child`
- `parent`: `docs/task-briefs/in-progress/2026-06-20-my-library-calendar-desktop-month-today-overview-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `child-b-calendar-month-today`
- `audit_status`: `ready_after_calendar_width_pilot`
- `decision`: Keep as a planned follow-up after Calendar proves the wider app workspace pattern with screenshots.
- `reason`: Calendar needs more desktop width now, but a platform-wide width change should be routed through a separate audit so reading pages, forms, dashboards, and workbenches are classified deliberately.
- `must_refresh_before_execution_if`: Refresh if My Library shell widths, SiteChrome spacing, mobile nav, app route taxonomy, design tokens, or Calendar wide screenshots change.

## Goal

Define and apply a shared width standard for app/workspace pages so wide screens are used where they improve scanning and operation without making content pages harder to read.

## Pre-Implementation Owner Explanation

Codex skal senere lage en felles regel for hvor brede app-sider kan være. Det betyr at arbeidsflater som kalender, tabeller og dashboards kan bruke mer skjerm på store skjermer, mens lese- og skjemaflater fortsatt kan være smalere. Utenfor scope i denne briefen er å redesigne alle sider på en gang eller endre funksjonene inne på sidene.

## Scope

- Audit app routes and classify them as `content`, `form`, `dashboard`, or `workspace`.
- Define shared width tiers for My Library and app-like surfaces.
- Identify candidate routes that should opt into wider workspace layout.
- Keep reading-heavy content and focused forms constrained for readability.
- Add or update shared layout utilities/components only when they reduce route-local width drift.
- Add screenshot requirements for desktop, laptop, tablet, and mobile before applying a broad width change.

## Out Of Scope

- Redesigning every route in one PR.
- Changing data models, completion logic, analytics logic, auth, payments, or admin workflows.
- Replacing `SiteChrome` or the global navigation.
- Touching `Ja.docx`.

## Stack / Architecture Best-Practice Gate

- React/Next.js: prefer shared layout primitives or route-level shell props over one-off `max-w-*` changes.
- TypeScript/domain contracts: no domain type changes expected; route classification should be documented and testable.
- Supabase/data: N/A because this is a presentational layout standard and should not change storage or RLS.
- UI system: reuse existing Tailwind tokens, spacing rhythm, cards, and My Library shell conventions.
- Testing: cover affected routes with component/page assertions and screenshot handoff before broad PR gates.

## Data Placement And Sync Contract

- Server-canonical data: N/A because width tiers do not own business data.
- Local/URL state: N/A unless a future route-specific implementation already uses existing URL state.
- Sync policy: N/A because layout width does not sync user data.
- Cache/invalidation: N/A because no data fetching behavior should change.

## Identity And Forward Compatibility Contract

- Canonical identifiers: route paths remain the stable identifiers for classification.
- Human-readable labels: page titles and nav labels are not renamed by this brief.
- Future routes should choose a width tier during route creation rather than copying arbitrary `max-w-*` classes.
- Unknown/unclassified routes must keep the existing conservative content width until explicitly classified.

## Forward Compatibility Contract

- New app/workspace routes should automatically get the selected shared workspace width by using the shared shell or utility.
- New content/form routes require an explicit route classification before opting into wider layouts.
- Unknown route types fall back to the current narrower layout so readability does not regress silently.
- Evidence must include an audit list and responsive screenshots proving at least one workspace route and one content/form route keep the intended width behavior.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                          | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | App routes have explicit width intent by route type, and users get more scan space only where it helps the task.        | route audit + screenshot handoff            | `5/5`                   |
| UX flow clarity                               | `target`     | Wider workspaces improve scan/action flow without hiding primary actions or creating disconnected desktop layouts.      | responsive screenshots + owner review       | `5/5`                   |
| Visual design quality                         | `target`     | Width tiers preserve spacing, typography, card density, and page balance across desktop, laptop, tablet, and mobile.    | before/after or after/reference screenshots | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no business data, status, identity, or mutation behavior changes.                                      | diff review                                 | `4/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only if an admin workspace is classified; no admin workflow mutation is allowed in this slice.               | route audit                                 | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Wider layout preserves heading order, focus order, landmark structure, and readable line lengths.                       | a11y review + component/page tests          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Shared width standard adds no dependency and no material JS payload; route CWV budgets remain unchanged.                | package diff + build/verify evidence        | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this brief changes presentation width only and must not move or persist user data.                          | explicit data non-scope rationale           | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because route cache mode, freshness, and invalidation triggers must not change.                                     | explicit cache non-scope rationale          | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: fallback route width must remain usable if a route is unclassified or a shared utility is not adopted. | fallback review                             | `4/5`                   |
| Security and authz                            | `supporting` | Supporting only: auth boundaries and private route protection must remain unchanged.                                    | route/auth diff review                      | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: wider layouts must not expose additional private data or debug details.                                | UI payload review                           | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: route classification becomes documented design governance, not content ownership.                      | route audit document                        | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: any admin page width change must preserve existing edit actions and confirmations.                     | admin route audit if touched                | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public metadata, sitemap, robots, and canonical behavior must remain unchanged.                        | metadata diff review                        | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public semantic structure must not be weakened by presentational width changes.                        | semantic markup review                      | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics taxonomy change; optional layout adoption events require stable non-PII names.            | no-new-event rationale or event review      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: checkout, entitlement, pricing, and product catalog flows must not change.                             | commerce non-impact review                  | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: support docs should explain any visible app-width standard if it affects screenshots or diagnostics.   | support doc review                          | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because layout width does not touch revenue, refunds, payouts, invoices, entitlement reporting, or accounting data. | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: wider layouts must not rely on fixed English copy widths that break later localization.                | responsive copy review                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next.js/Tailwind/shared shell patterns; add no dependency and avoid route-local width drift.                        | package diff + architecture review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Include route-width assertions, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge`.                        | validation outputs                          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: shared layout utility should reduce future maintenance cost without runtime cost growth.               | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Width changes are isolated enough to revert route-by-route or by shared utility without data migration.                 | rollback notes + PR validation              | `5/5`                   |

## Acceptance Criteria

- Route audit lists which app pages should stay narrow and which should use a workspace width.
- Shared width tier names or utilities are defined before broad adoption.
- At least one content/form route and one workspace route are screenshot-verified at desktop and mobile widths.
- No route changes business logic, auth behavior, data fetching, or persisted data as part of width adoption.

## Validation Plan

- `npm run lint:briefs`
- Focused component/page tests for changed route shell classes.
- Responsive screenshot handoff before PR gates.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-20 | planned | created after Calendar Child B exposed that app/workspace pages need a deliberate wide-screen standard rather than route-local guesswork | next: execute only after Calendar wide workspace screenshots are approved and merged`
