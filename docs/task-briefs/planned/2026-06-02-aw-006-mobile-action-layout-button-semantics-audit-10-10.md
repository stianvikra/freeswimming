# Task Brief: AW-006 Mobile Action Layout And Button Semantics Audit (10/10)

## Metadata

- `id`: `2026-06-02-aw-006-mobile-action-layout-button-semantics-audit-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-02`
- `updated`: `2026-06-02`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `design_contract`: `docs/design/mobile-action-layout-contract.md`
- `execution_mode`: `future owner-approved implementation with screenshot approval stop`

## Goal

Audit and align mobile action groups and button semantics across the app so action placement,
width, priority, color, and overflow behavior are predictable on compact screens.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi skal sjekke knappene pa mobil i hele appen, slik at like handlinger ser
like ut, hovedhandlingen er lett a finne, og flere knapper legger seg pent i rader uten tilfeldige
enslige knapper eller trang tekst.

Hvorfor det betyr noe: Brukeren skal laere at bla betyr hovedhandling, outline betyr støttehandling,
farehandlinger skiller seg ut, og knappene foler seg planlagt uansett om det er to, tre, fire eller
flere handlinger.

Utenfor scope: Denne planned briefen implementerer ingenting na. Den skal ikke endre data,
betaling, auth, eksportinnhold, API-er, analytics, Help/Guide, eller layout uten en senere
owner-approved implementation slice.

Fremoverkompatibilitet: Nye actions skal automatisk bruke den delte mobile action group-regelen nar
de passer inn i eksisterende actionhierarki; nye komplekse grupper, seks eller flere synlige actions,
ukjente workflow-stater, nye danger-actions, eller nye overflowvalg krever eksplisitt mapping,
test og screenshot-evidence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Main user/admin action surfaces keep their current IA while mobile action priority becomes predictable and documented.                                         | route inventory + screenshot handoff        | `5/5`                   |
| UX flow clarity                               | `target`     | Primary, secondary, mode, danger, and recovery actions are visually distinguishable and avoid orphan final-row actions on supported mobile widths.             | before/after screenshots + focused tests    | `5/5`                   |
| Visual design quality                         | `target`     | Mobile action groups follow the shared 1/2/3/4/5-plus threshold rules, responsive text fit, and current `fs-cta-*` semantics.                                  | design contract + screenshots               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Layout and styling changes do not alter action callbacks, request payloads, persistence, exports, or state transitions.                                        | code review + regression tests              | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin action groups retain operator scanability and do not hide required workflow actions without documented overflow behavior.                                | admin route screenshots + tests             | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Changed buttons keep accessible names, keyboard/focus behavior, disabled semantics, touch target sizing, and no text overlap.                                  | Testing Library assertions + screenshot QA  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new runtime dependency, media payload, network request, polling, or heavy client state is introduced for action layout.                                     | dependency diff + pre-PR gate               | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Local/server data ownership for changed workflows remains unchanged; layout helpers do not own domain state.                                                   | changed-files review + brief scope          | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this planned slice should not change route cache modes, revalidation, server fetch policy, or invalidation behavior.                               | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | Error/retry/recovery buttons remain reachable and do not move into hidden overflow unless the recovery path is still explicit.                                 | negative-path UI tests + screenshots        | `5/5`                   |
| Security and authz                            | `target`     | Authenticated/admin/protected action boundaries remain untouched and fail-closed behavior is not weakened by layout changes.                                   | auth boundary review + existing tests       | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this planned slice should not change personal data fields, telemetry payloads, legal copy, consent, logs, secrets, or retention behavior.          | explicit privacy scope rationale            | `N/A`                   |
| Content governance                            | `target`     | The design contract, AW-006 queue, and completed closeout clearly record which surfaces were audited and which were deferred.                                  | docs diff + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin workflow labels and actions keep meaning; any overflow or grouping change is documented with Help/Guide impact if it changes operator behavior.          | admin sweep + Help/Guide rationale          | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this planned slice should not change public metadata, sitemap, robots, canonical URLs, structured content, or indexability.                        | explicit SEO scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this planned slice should not change AI-facing public entity structure, crawl-safe semantics, or public documentation contracts.                   | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing analytics event names and payload values remain unchanged unless a later owner-approved slice explicitly maps an action move or overflow event.       | analytics diff review                       | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting because commerce actions may be audited visually, but Stripe, checkout, portal, entitlement, finance, and reporting behavior must remain unchanged. | commerce route screenshot + no API diff     | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this planned slice should not change incident response, support escalation, alerting, runbooks, or support diagnostics.              | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this planned slice should not change finance reports, payouts, refunds, invoices, reconciliation, tax, or provider financial data.   | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `target`     | Mobile button groups tolerate longer labels by wrapping, using equal grids, or moving excess actions to overflow instead of relying on English-only widths.    | text-fit screenshots + focused tests        | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `components/ui/actionLayout.ts`, current `fs-cta-*`, route-local helpers, and mature reference surfaces; add no broad dependency.                        | changed-files/dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused tests for migrated helper usage and screenshot coverage for representative mobile routes before broad gates.                                       | unit/component tests + screenshot artifacts | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: layout consolidation should reduce future UI drift without adding service cost, storage, queues, jobs, or network work.                       | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal revert restores previous UI; no migration, dependency, provider setting, env value, generated artifact, or feature flag rollback is required.           | git diff + validation evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: keep route ownership and action callbacks in their existing components; use shared
  layout helpers only for presentation.
- TypeScript: encode mobile grouping rules through reusable helper contracts rather than ad hoc class
  strings per surface.
- UI system: start from `docs/design/mobile-action-layout-contract.md`,
  `components/ui/actionLayout.ts`, `fs-cta-*`, guide tracker overlay action rows, and WorkoutEditor
  as reference surfaces.
- Testing: use focused unit/component assertions for class contracts and screenshot handoff for
  visible mobile surfaces.
- Dependencies: no new dependency unless a later owner-approved slice proves it materially improves
  quality and reduces local duplication.

## Forward Compatibility Contract

- Future actions should inherit semantic role and mobile group behavior from shared helpers.
- Future five-action groups require a prioritization review before release.
- Future six-or-more visible mobile action groups require explicit grouping, overflow, or surface
  split decisions.
- Unknown labels or longer localized strings must fail into wrapping, full-width, or overflow
  behavior instead of clipping or creating orphan final-row buttons.
- Any new destructive, payment, auth, admin workflow, export, or recovery action needs explicit
  color/placement mapping and screenshot evidence.

## Scope

- Audit main mobile action groups across public, member, admin, commerce, guide, workout, program,
  dryland, auth, support, and recovery surfaces.
- Migrate only the surfaces approved for the future implementation slice.
- Update tests and screenshots for each migrated route or shared surface.

## Out Of Scope

- This planned brief is not active implementation.
- No data model, route contract, API, Supabase, Stripe, auth, analytics, export payload, generated
  artifact, Help/Guide, or support workflow change without a later approved implementation brief.
- No broad visual redesign beyond action placement, width, color role, grouping, and overflow.

## Acceptance Criteria

1. A route/surface inventory identifies mobile action groups and their semantic roles.
2. Migrated surfaces use the shared mobile action layout contract or document a justified exception.
3. Primary, secondary, danger, recovery, mode, and overflow actions use consistent visual semantics.
4. Mobile layouts avoid orphan final-row buttons and text overflow on representative viewport widths.
5. Six-or-more visible actions are grouped, split, or moved to overflow with documented rationale.
6. Existing callbacks, data flows, analytics, auth, persistence, exports, and support behavior remain
   unchanged unless explicitly approved.
7. Focused tests and screenshot handoff pass before broad gates.

## Validation

- Targeted unit/component tests for changed helper usage.
- Route/label/support sweep for changed labels, actions, and Help/Guide impact.
- Screenshot handoff across representative mobile surfaces.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Implementation Checkpoint Log

- `2026-06-02 | planned | created as the global follow-up for mobile action layout and button semantics after the WorkoutEditor support-tools slice introduced the reusable mobile action layout contract; this planned brief is not active implementation | next: select only after the current WorkoutEditor PR is merged and post-merge preflight is clean`
