# Task Brief: Workout Commercial + Analytics Funnel (10/10)

## Metadata

- `id`: `2026-02-28-workout-commercial-analytics-funnel-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-06-10`
- `execution_mode`: `plan-only-parent`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: clean synced `main@83e57c8c` after Workout Builder Source Breakdown Dashboard V1 PR `#1053`
- `audit_status`: `ready`
- `decision`: Use this as the refreshed parent for bounded child briefs only; do not execute this parent directly.
- `reason`: The first three safe children are complete: PR `#1049` shipped privacy-safe workout builder start/save events, PR `#1051` shipped read-only Admin Analytics visibility for started, saved, and save-rate, and PR `#1053` shipped source breakdown visibility for manual-vs-generated contribution. The remaining work is still too broad for one implementation PR and must continue as narrow child slices with explicit analytics, commerce, Help/Guide, and visual gates.
- `must_refresh_before_execution_if`: Refresh before any child starts if AGENTS.md, the task brief template, scorecard categories, analytics event taxonomy, `analytics_events` schema, `/api/admin/analytics/insights`, Admin Analytics UI, Help/Guide contracts, checkout/Stripe contracts, product catalog, workout builder save/generator routes, or route/label/support sweep rules change.

## Goal

Build a trustworthy workout-builder growth funnel in small slices so product decisions can use first-party analytics before any upsell, checkout, finance, or vendor expansion.

## Pre-Implementation Owner Explanation

Vi frisker opp overordnet plan for workout-builder funnelen, ikke selve produktet. Det betyr at neste arbeid blir delt i trygge barn: forst male og vise hva brukere faktisk gjor i builder/generator, deretter vurdere kommersielle plasseringer. Dette er viktig fordi vi ikke bor legge CTA-er, checkout eller finans-tolkning oppa svake signaler. Utenfor scope her er runtime-kode, ny UI, nye priser, Stripe-endringer, tredjeparts analytics, finance-rapportering og ny PR for implementering.

Forward-compatibility-intent: nye builder-/generator-events skal enten flyte trygt inn i generiske Admin Analytics-lister, eller ha en eksplisitt mapping, Help/Guide-kopi og tester for egne KPI-moduler. Nye produkter, CTA-er, checkout-steg, export-formater eller finance-tolkninger krever egen child-brief forst.

## Child Slice Status And Order

- Done child: `docs/task-briefs/done/2026-06-09-workout-builder-funnel-instrumentation-v1-10-10.md`
  - Owns only privacy-safe first-party events for manual builder start and successful canonical workout create/update.
- Done child: `docs/task-briefs/done/2026-06-10-workout-builder-funnel-dashboard-v1-10-10.md`
  - Owns only read-only Admin Analytics visibility for builder starts, saves, and save-rate using the shipped events.
- Done child: `docs/task-briefs/done/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md`
  - Closed by PR `#1053` / squash commit `83e57c8c`.
  - Owns only a read-only Admin Analytics breakdown that separates manual builder starts/saves from generated-session draft/saves using existing safe first-party events and payload dimensions where available.
- Still deferred after source breakdown:
  - template usage taxonomy,
  - generated plan/completion definitions beyond existing `session_draft_generated`,
  - commercial placement rules,
  - workout-context upsell CTA policy,
  - broader dedicated KPI modules,
  - CSV/export,
  - finance-grade reporting,
  - checkout/pricing changes,
  - third-party analytics vendor activation.

## Next Child Candidate

No active child is approved after PR `#1053`. The next child should remain an owner decision after reviewing source-breakdown data.

Recommended next candidate if the data supports it: `Workout Builder Template Usage / Generated Completion Dashboard V1`.

Why this should come before commercial UI:

- It can explain whether users need reusable templates or generator-completion clarity before any CTA/checkout placement.
- It keeps commercial decisions downstream of observed product workflow quality.
- It remains smaller and safer than checkout attribution, finance reporting, or third-party vendor analytics.

Proposed child scope:

- Audit whether existing first-party events can safely distinguish template usage, generated draft acceptance, and generated-session completion without new telemetry.
- If existing events are sufficient, render a compact read-only Admin Analytics module for the next mapped product question.
- If existing events are not sufficient, create a bounded instrumentation child first rather than inferring unsupported metrics.
- Preserve existing range selection, admin viewer+ auth, no-store reads, capped/schema-missing/fetch-failed states, and privacy boundary.
- Update Admin Help/Guide interpretation so any new counts remain product telemetry, not unique-user conversion, checkout conversion, revenue, or finance truth.
- Add targeted unit/component tests, route/label/support sweep evidence, and after/reference screenshot handoff before `npm run verify:pre-pr`.

Proposed child out of scope:

- New event names unless implementation proves an existing event cannot answer the source split safely.
- Any CTA placement, upsell copy, checkout/pricing/entitlement/Stripe behavior, product catalog change, export/CSV, finance-grade reporting, third-party vendor, cookie, visitor ID, raw payload drilldown, migration, RLS change, or workout-builder UX change.

## Scope

- Maintain this parent as the governance and sequencing source for the workout commercial and analytics funnel.
- Keep child slices small enough to validate independently.
- Treat first-party analytics as the product decision source before commercial UI changes.
- Keep privacy, authz, finance, and support interpretation explicit in every child.
- Require each child to name the exact event, payload, route, dashboard, Help/Guide, screenshot, and validation surfaces it touches.

## Out Of Scope

- Executing this parent as one large feature.
- New runtime behavior from this refresh.
- Any code, tests, UI, migration, workflow, checkout, Stripe, finance, export, vendor, or Help/Guide implementation in this parent refresh.
- Merging, opening a PR, or creating a new implementation branch without explicit owner approval for a named child brief.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Child UI work must reuse `components/admin/AdminAnalyticsDashboard.tsx` and its view-model in `lib/analytics/admin-dashboard.ts` for dashboard changes.
  - Child builder/generator instrumentation must reuse existing client/server analytics helpers and current route boundaries.
  - Do not add a new route, tab, chart dependency, or dashboard builder unless a child brief proves the existing Admin Analytics hierarchy cannot support the slice.
- TypeScript/domain contracts:
  - Event names must be typed in `ANALYTICS_EVENT_NAMES`.
  - Payload helpers must sanitize and bound low-cardinality values before persistence.
  - Dashboard-specific KPI derivation belongs in typed view-model/helpers, not ad hoc JSX.
  - Ratios must define zero-denominator behavior and must not imply unique users unless the data actually supports it.
- Supabase/data layer:
  - Prefer existing `analytics_events` rows, safe dimension columns, and bounded admin insight reads.
  - Do not add migrations, indexes, RLS changes, generated type updates, rollup jobs, or raw payload reads unless a child proves the existing contract cannot satisfy the KPI safely.
  - If payload JSON is inspected server-side for safe dimensions, the child must prove raw payload JSON is never exposed to Admin UI.
- External services/tools:
  - Keep Stripe, checkout, finance reconciliation, and third-party analytics vendors out of analytics-only children.
  - Any vendor or Stripe change needs official-docs review, secret-handling rules, idempotency/retry guidance, webhook or provider evidence when relevant, and finance/support diagnostics.
- UI system:
  - Dashboard children must reuse the current Admin Analytics card/KPI/list language and `AdminManagerState` trust states.
  - UI children require screenshot handoff following the repo screenshot rule.
- Testing:
  - Analytics children need unit tests for payload helpers, event taxonomy, insight derivation, view-model output, unsafe-field filtering, and negative/failure paths.
  - UI children need component tests and screenshot artifacts before broad gates.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted `analytics_events` rows, safe dimension columns, analytics lifecycle/rollup metadata, catalog/checkout records where future commerce children explicitly touch them, and any future owner-approved CTA placement rules.
- Local/browser:
  - Existing builder/generator transient state only.
  - No new analytics cookie, visitor ID, localStorage analytics identity, admin preference, or user-to-public attribution bridge in this parent.
- Sync behavior:
  - Client analytics is best-effort telemetry and may duplicate on retry.
  - Server-side workout save analytics emits only after successful canonical create/update.
  - Dashboard reads are bounded aggregate admin reads and must not infer missing data as success.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - Children must not display or persist raw workout titles, notes, raw workout text, raw URLs/referrers, emails, IPs, user agents, payment details, cart details, visitor IDs, Stripe customer IDs, or raw payload JSON in Admin UI.
- Cache/invalidation:
  - Analytics ingestion and admin insights remain `no-store`.
  - Range changes refetch the same bounded endpoint.
  - Future placement-rule/config work must define explicit invalidation before implementation.

## Identity And Rename Contract

- Canonical stable IDs:
  - Event identity is `event_name`.
  - Product identity is canonical product ID/slug from the catalog when commerce children touch products.
  - Workout identity remains the private workout row ID and is intentionally not copied into V1 analytics payloads.
- Human-readable identifiers:
  - Dashboard labels, CTA copy, route labels, product display names, and Help/Guide text are display-only and may be renamed without changing canonical event/product meaning.
- Mutability rules:
  - Shipped event names are append-only.
  - Changing event meaning requires a new event name or an explicit alias/migration child brief.
  - CTA or product labels may change only when product identity and analytics identity remain stable.
- Rename vs repurpose:
  - Label rename is allowed when business meaning is unchanged.
  - Counting a different action under an existing event, moving an upsell to a materially different user moment, or treating product telemetry as finance truth is repurpose and requires a new child brief.
- Compatibility contract:
  - Unknown future event names continue to appear in generic Admin Analytics lists through safe formatting.
  - Dedicated KPI modules count only explicitly mapped events/dimensions until a later child adds mapping.
- Observability and repair:
  - Deprecated/unmapped values must render as safe unknown states or generic list items, not disappear silently.
  - Capped, stale, schema-missing, and failed-read states must remain visible to admin/support.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Analytics event names, builder source kinds, generator workflow stages, builder modes, save kinds, product IDs, catalog availability, route templates, CTA surfaces, export formats, dashboard KPI modules, Help/Guide copy, future locales, providers, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Builder source kinds come from `WORKOUT_SOURCE_KINDS`.
  - Public route/product analytics values come from their registries/catalog helpers.
  - Admin dashboard counts come from `/api/admin/analytics/insights`, not client storage or hardcoded fixtures.
- Additive behavior:
  - New approved events can appear in generic top-event lists automatically.
  - New route/product values can appear through existing generic route/product lists if they meet safe dimension rules.
  - Existing start/save counts keep working while the shipped V1 event identities remain valid.
- Explicit mapping requirements:
  - New dedicated funnel stages, builder source breakdowns, template usage modules, generated-plan completion, commercial CTA modules, checkout attribution, export formats, finance reporting, vendor forwarding, and localized admin copy require explicit mapping, tests, docs, and owner decision.
- Unknown or deprecated values:
  - Unknown event, route, product, source, or builder values must render through safe generic labels or be excluded from dedicated KPI modules with documented fallback.
  - Deprecated event names require alias/migration handling before they affect dedicated ratios.
- Test/evidence:
  - Each child must include future-value/unknown-value fixtures where it maps events or dimensions.
  - Each child must run a route/label/support sweep when labels, admin copy, Help/Guide, runbooks, routes, or support interpretation changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the parent track and future 10/10 child claims:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                           | Evidence                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Child sequence separates measurement, dashboard readability, and commercial action so owner decisions are not made from ambiguous telemetry.                                                 | parent sequence + child brief acceptance criteria              | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only at parent level: future CTA or builder UI children must prove primary workout actions remain clear and non-disruptive.                                                       | child screenshot/e2e evidence when UI changes                  | `4/5`                   |
| Visual design quality                         | `supporting` | Supporting only at parent level: future dashboard/CTA children must reuse mature surfaces and provide screenshot handoff.                                                                    | child screenshot artifacts                                     | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Dedicated KPI modules count only explicitly mapped event names/dimensions and define zero/unknown/duplicate behavior before implementation.                                                  | insight/view-model tests + route/label/support sweep           | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: Admin Analytics remains read-only until a future placement/config editor child is explicitly approved.                                                                      | admin scope rationale                                          | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only at parent level: visible dashboard/CTA children must preserve headings, labels, focus, keyboard, and screen-reader flow.                                                     | component/e2e a11y checks in UI children                       | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: children must avoid chart/vendor/dependency bloat and preserve route-level budgets for touched routes.                                                                      | build/perf gate + dependency diff                              | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical analytics and commerce truth stay separate from local builder state; each child states what writes, reads, or remains local-only.                                           | data placement contract + tests                                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: analytics reads remain no-store; any future placement/config child must define invalidation explicitly.                                                                     | route/cache review                                             | `4/5`                   |
| Reliability and failure handling              | `target`     | Analytics failures fail soft for product workflows, admin reads expose deterministic trust states, and no expected deny/failure path becomes an unexpected 500.                              | negative-path tests + Admin Analytics trust-state tests        | `5/5`                   |
| Security and authz                            | `target`     | Protected user/admin/commerce paths fail closed and child scopes do not widen data access without negative-path tests.                                                                       | authz tests + data-access registry updates                     | `5/5`                   |
| Privacy and compliance                        | `target`     | Event payloads and dashboards exclude sensitive identifiers, raw workout text, raw URLs, emails, IPs, user agents, payment details, visitor IDs, and raw payload JSON.                       | sanitizer/payload tests + privacy docs                         | `5/5`                   |
| Content governance                            | `target`     | Event taxonomy, interpretation caveats, Help/Guide updates, and parent/child checkpoint logs stay aligned when visible labels or support interpretation change.                              | docs/Help assertions + checkpoint log                          | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin edit workflow changes are planned until a dedicated placement/config editor child exists.                                                                          | scope rationale                                                | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: current analytics/dashboard children are protected or first-party telemetry; public CTA/landing children must define metadata/sitemap impact if public routes change.       | public-route child brief evidence                              | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: no public AI-discoverable content changes in current analytics children; public semantic content needs its own mapping and crawl-safe contract.                             | child scope rationale                                          | `4/5`                   |
| Analytics and KPI observability               | `target`     | Funnel stages are measurable through first-party typed events and dashboard modules with clear caveats before commerce decisions.                                                            | event tests + Admin Analytics tests                            | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Product telemetry, checkout conversion, entitlement truth, Stripe reconciliation, and finance reporting remain explicitly separated until a commerce child maps them.                        | commerce boundary review + checkout/finance tests when touched | `5/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: current analytics children use existing trust states; future critical CTA/checkout changes need support diagnostics/runbook notes.                                          | support-surface sweep + runbook evidence when touched          | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reporting mutation is in this parent refresh; finance-grade reporting requires explicit Stripe/accounting reconciliation scope and evidence.                     | explicit finance scope rationale                               | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: visible copy should remain short and structurally localizable; full locale workflow requires a future owner decision.                                                       | copy/layout review + explicit scope rationale                  | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Children reuse existing Next.js, TypeScript, Supabase, analytics, Admin Analytics, and test patterns before adding new dependencies or vendors.                                              | changed-files review + package diff                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Each child defines targeted tests plus `npm run verify:pre-pr`; UI children include screenshot handoff before PR gate, and merge readiness requires `npm run verify:pre-merge`.              | targeted tests + verify gates + CI                             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: event volume, dimensions, queries, and dashboard reads must remain bounded; rollup/warehouse/export work needs explicit cost analysis.                                      | query review + row-cap/lifecycle evidence                      | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: analytics/dashboard children should be revertable without migrations/providers; risky commerce/schema children need rollback and release notes before merge recommendation. | PR summary + rollback notes                                    | `4/5`                   |

## Help / Guide Impact

- Parent refresh: no Help/Guide product change because this is docs-only planning.
- Any visible Admin Analytics dashboard child must update Admin Help/Guide or linked runbook with:
  - what the new metrics mean,
  - what they do not mean,
  - how duplicates, empty ranges, capped reads, stale reads, schema-missing states, and fetch failures should be interpreted.
- Any CTA, checkout, pricing, entitlement, support, or recovery child must update Help/Guide and relevant runbooks in the same PR or include explicit `N/A` rationale.

## Screenshot / Visual Impact

- Parent refresh: screenshot handoff is N/A because no rendered UI, print, layout, brand, style, or product asset changes.
- Dashboard/CTA/UI children:
  - must use `after/reference` or `before/after` naming as required by AGENTS.md,
  - must include desktop, mobile, and at least one non-happy state when the changed surface has trust/failure states,
  - must stop for owner screenshot approval before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

Required for every child that changes event taxonomy, labels, routes, admin copy, Help/Guide, support interpretation, CTA text, checkout labels, recovery paths, runbooks, or dashboard modules.

Search at minimum when relevant:

- `workout_builder_started`
- `workout_builder_saved`
- `session_draft_generated`
- `generator_intake_viewed`
- `generator_intake_block_toggled`
- `upsell_presented`
- `upsell_accepted`
- `upsell_declined`
- `Admin Analytics`
- `analytics dashboard`
- `/api/admin/analytics/insights`
- `ANALYTICS_EVENT_NAMES`
- `finance reporting`
- `Stripe reconciliation`
- `CSV export`
- `sourceKind`
- `saveKind`
- `builderMode`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/workouts/`
- `lib/session-generator-v1/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- Help/Guide sources and assertions
- active/planned/deferred/done analytics, workout, commerce, and AW-006/AW-022 briefs.

## Acceptance Criteria

1. This parent remains a planning and sequencing brief, not a direct implementation brief.
2. Each child has one bounded product question and explicit out-of-scope commercial/finance/vendor boundaries.
3. Analytics event meanings, payload boundaries, privacy exclusions, and dashboard caveats are documented before implementation.
4. Dedicated KPI modules count only explicitly mapped events/dimensions and handle zero, unknown, duplicate, capped, schema-missing, stale, and failed-read states.
5. Commercial CTA, checkout, Stripe, entitlement, and finance work stay out of analytics-only children.
6. UI children include screenshot handoff and owner approval before pre-PR gate.
7. Changed briefs pass `npm run lint:briefs`.

## Validation

Parent refresh:

- `npm run lint:briefs`
- `git diff --check`

Future child implementation:

- targeted unit/component/e2e tests named in the child brief
- route/label/support-surface sweep when triggered
- screenshot handoff when UI/rendering changes
- `npm run typecheck`
- `npm run lint:quality-gates`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Canonical parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Last completed child path: `docs/task-briefs/done/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this parent and the named child brief, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-10 | refreshed parent | refreshed from clean synced main@f68a9554 after PR #1051 and closeout PR #1052; parent is now a plan-only sequencing brief with modern audit, scorecard, architecture, data, identity, forward-compatibility, Help/Guide, screenshot, and route/label/support sweep gates; recommended next child is Workout Builder Source Breakdown Dashboard V1, which should separate manual builder and generated-session save signals using existing safe first-party events before any CTA/checkout/finance work | next: owner decides whether to create/execute the recommended child brief`
- `2026-06-10 | planned child created | created planned child brief docs/task-briefs/planned/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md for read-only Admin Analytics source breakdown; implementation remains blocked on explicit owner execute/build/implement instruction and visual screenshot approval stop once implemented | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | child moved to in-progress | owner requested implementation, and the child moved to docs/task-briefs/in-progress/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md on branch workout-builder-source-breakdown-dashboard-v1; parent remains plan-only and the child owns the runtime work | next: complete the child implementation and screenshot approval stop`
- `2026-06-10 | active child implemented to screenshot stop | Workout Builder Source Breakdown Dashboard V1 now has aggregation, Admin Analytics UI, Help/Guide copy, contract docs, targeted tests, and route/label/support sweep recorded in the child brief; parent remains plan-only and no CTA, checkout, Stripe, export, finance, vendor, or builder/generator UX scope was added | next: capture child screenshot handoff and wait for owner approval before verify:pre-pr`
- `2026-06-10 | source breakdown child merged | PR #1053 merged at squash commit 83e57c8c and the child moved to done in the repo-managed closeout; parent now has no approved active child, and the next candidate should be chosen from observed source-breakdown data before any CTA, checkout, Stripe, export, finance, vendor, or builder/generator UX scope is added | next: finish docs-only closeout PR and run post-merge-preflight`
