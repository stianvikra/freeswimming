# Task Brief: Workout Commercial + Analytics Funnel (10/10)

## Metadata

- `id`: `2026-02-28-workout-commercial-analytics-funnel-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-06-11`
- `execution_mode`: `plan-only-parent`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@a2653085` after PR `#1080` and closeout PR `#1081`; `npm run post-merge:preflight` was reported clean.
- `audit_status`: `ready`
- `decision`: Use this as the refreshed parent for bounded child briefs only; do not execute this parent directly.
- `reason`: The first telemetry/dashboard/commercial-boundary children are complete through PR `#1081`: workout builder start/save, Admin Analytics funnel visibility, source breakdowns, generated completion, template identity/runtime/instrumentation/mapping, workout-context placement policy, existing upsell baseline, workout-context CTA measurement/runtime/Admin Analytics mapping, checkout attribution/finance separation, checkout-start attribution hardening, and the workout-context plans checkout attribution bridge are all closed. The owner selected and requested implementation of Workout Context Checkout-Started Admin Analytics Mapping V1 as the active child.
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
- Done child: `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-generated-completion-dashboard-v1-10-10.md`
  - Closed by PR `#1055` / squash commit `0e61938b`.
  - Owns only generated draft/save/completion visibility from existing first-party telemetry and renders template usage as not instrumented.
- Done child: `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
  - Closed by PR `#1061` / squash commit `6d87eb68`.
  - Owns only first-party instrumentation for explicit workout-builder template selection through the registry-backed `templateKey` and `Use template` action.
  - Keeps Admin Analytics template usage as `not_instrumented` until a later dashboard mapping child decides aggregation and labels.
- Done child: `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-admin-analytics-mapping-v1-10-10.md`
  - Closed by PR `#1063` / squash commit `617ca14f`.
  - Owns only read-only Admin Analytics mapping for `workout_builder_template_selected` using registry-backed template identity.
  - Commercial UI, checkout, finance, export, vendor analytics, raw event drilldown, and builder/generator UX remain out of scope.
- Done child: `docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`
  - Closed by PR `#1057` / squash commit `92d40fbb`.
  - Owns the product/data contract for what a workout-builder template is, where its stable identity comes from, and what counts as explicit user selection.
  - Confirms template usage instrumentation cannot resume until a real runtime template source and explicit selection surface exist.
  - Contract artifact: `docs/architecture/workout-builder-template-identity-selection-contract.md`
- Done child: `docs/task-briefs/done/2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10.md`
  - Closed by PR `#1059` / squash commit `c6cd5b56`.
  - Owns the runtime unblocker: a real interim workout-template source and explicit `Use template` selection surface.
  - Kept `workout_builder_template_selected` and Admin Analytics template usage out of scope so the dedicated instrumentation child can add the event safely.
- Done child: `docs/task-briefs/done/2026-06-10-workout-context-upsell-placement-policy-v1-10-10.md`
  - Closed by PR `#1066` / squash commit `56701757`.
  - Owns only the docs-only policy decision for where workout-context upsell CTA may appear and which existing first-party signals it may read.
  - Runtime CTA, CTA events/dashboard, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, and builder/generator UX remain out of scope.
- Done child: `docs/task-briefs/done/2026-06-11-existing-upsell-event-admin-analytics-baseline-v1-10-10.md`
  - Closed by PR `#1068` / squash commit `765179c2`.
  - Owns only read-only Admin Analytics baseline visibility for existing `upsell_presented`, `upsell_accepted`, and `upsell_declined` events on current `/plans` and My Library commercial surfaces.
  - Runtime workout-context CTA, new event callsites/meanings, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, and builder/generator UX remain out of scope.
- Done child: `docs/task-briefs/done/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md`
  - Closed by PR `#1070` / squash commit `51f0c2c3`.
  - Owns only the docs-only measurement contract for the first future workout-context CTA candidate.
  - Defines placement/product/event/payload/dashboard/support boundaries before any runtime workout-context CTA or dedicated dashboard child.
  - Runtime CTA UI, new event callsites, Admin Analytics runtime modules, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route changes, product catalog mutation, and builder/generator UX remain out of scope.
- Done child: `docs/task-briefs/done/2026-06-11-workout-context-cta-runtime-event-callsites-v1-10-10.md`
  - Closed by PR `#1072` / squash commit `36b11d16`.
  - Owns only the first saved-workout post-success workout-context CTA and privacy-safe `upsell_presented` / `upsell_accepted` callsites for `placementId=workout_saved_post_success` and `productId=guide_poolside`.
  - Admin Analytics runtime module, `upsell_declined`, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route changes, product catalog mutation, new pricing, and builder/generator algorithm changes remain out of scope.
- Done child: `docs/task-briefs/done/2026-06-11-workout-context-cta-admin-analytics-mapping-v1-10-10.md`
  - Closed by PR `#1074` / squash commit `f7af4d9d`.
  - Owns only read-only Admin Analytics mapping for the shipped workout-context CTA events with `placementId=workout_saved_post_success`, `productId=guide_poolside`, and `source=workout_context`.
  - Keeps existing `/plans` and My Library upsell baseline separate.
  - `upsell_declined`, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route changes, product catalog mutation, new pricing, runtime CTA changes, and builder/generator algorithm changes remain out of scope.
- Done child: `docs/task-briefs/done/2026-06-11-workout-checkout-attribution-finance-separation-contract-v1-10-10.md`
  - Closed by PR `#1076` / squash commit `948e0309`.
  - Owns only the docs-only contract separating CTA/product telemetry, checkout attribution, Stripe/provider truth, entitlement truth, and finance reporting.
  - Confirms Admin Analytics cannot prove checkout completion, entitlement access, Stripe reconciliation, revenue, refunds, payouts, invoices, accounting exports, or finance truth.
  - Runtime checkout, Stripe API/webhook/portal changes, entitlement mutation, finance reconciliation scripts, vendor analytics, export, raw drilldown, migration, RLS, route changes, product catalog mutation, pricing, dashboard changes, and builder/generator algorithm changes remain out of scope.
- Done child: `docs/task-briefs/done/2026-06-11-checkout-started-attribution-hardening-v1-10-10.md`
  - Closed by PR `#1078` / squash commit `b067c30c`.
  - Owns only hardening of existing `/api/checkout/session` checkout-start attribution.
  - Implemented privacy-safe allowlisted `checkout_started` attribution, no Stripe/session IDs in analytics or client response, minimal client response, and deterministic route failure tests.
  - Direct workout-context checkout, checkout completion, Stripe webhook changes, entitlement, finance, export, raw drilldown, vendor analytics, dashboard modules, pricing, product catalog mutation, migration, RLS, and visible UI changes remain out of scope unless explicitly approved.
- Done child: `docs/task-briefs/done/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md`
  - Closed by PR `#1080` / squash commit `7ba175f2`.
  - Owns only the attribution bridge from the existing saved-workout CTA through `/plans` into the existing checkout-start request.
  - Keeps client upsell telemetry separate from server `checkout_started` attribution.
  - Direct workout-context checkout, new shop, new products, dashboard modules, checkout completion, Stripe webhook changes, entitlement, finance, export, raw drilldown, vendor analytics, pricing, product catalog mutation, migration, RLS, visible redesign, and builder/generator algorithm changes remain out of scope unless explicitly approved.
- In-progress child: `docs/task-briefs/in-progress/2026-06-11-workout-context-checkout-started-admin-analytics-mapping-v1-10-10.md`
  - Owner selected this as the next bounded child after PR `#1081`.
  - Owns only future read-only Admin Analytics mapping for mapped workout-context `checkout_started` handoffs with `source=workout_context`, `placementId=workout_saved_post_success`, and `productId=guide_poolside`.
  - Owner requested implementation on branch `workout-context-checkout-started-admin-analytics-mapping-v1`.
  - Direct workout-context checkout, checkout completion, Stripe webhook changes, entitlement, finance, export, raw drilldown, vendor analytics, pricing, product catalog mutation, migration, RLS, route creation, visible redesign, and builder/generator algorithm changes remain out of scope unless explicitly approved.
- Still deferred after the placement-policy child:
  - generated plan/completion definitions beyond existing `session_draft_generated`,
  - broader dedicated KPI modules,
  - CSV/export,
  - finance-grade reporting,
  - checkout/pricing changes,
  - third-party analytics vendor activation.

## Next Child

Active child: `docs/task-briefs/in-progress/2026-06-11-workout-context-checkout-started-admin-analytics-mapping-v1-10-10.md`

Workout Context Checkout-Started Admin Analytics Mapping V1 is active and may only add read-only Admin Analytics mapping for mapped workout-context `checkout_started` handoffs. It must keep checkout handoff separate from CTA clicks, payment success, entitlement, revenue, unique-user conversion, and finance truth. Any future child must be explicitly selected before adding direct workout-context checkout, `upsell_declined`, checkout completion, Stripe webhook changes, entitlement mutation, finance reconciliation scripts, vendor analytics, export, raw drilldown, migration, RLS, route creation, product catalog mutation, new pricing, visible redesign, shop/product expansion, or builder/generator algorithm changes.

Safe follow-up candidate families after the checkout-started Admin Analytics mapping child:

- Workout-context checkout-start Admin Analytics mapping: active as the current bounded child.
- Checkout attribution and finance separation: complete through checkout-start attribution hardening and the `/plans` attribution bridge; entitlement, support diagnostics, finance reconciliation, checkout completion, new shop/product expansion, and direct workout-context checkout remain separate future decisions.
- Export, CSV, raw drilldown, or third-party analytics: still deferred until the owner explicitly chooses those surfaces and their privacy/support boundaries.

Current guardrails:

- Do not reopen the completed template usage mapping scope as the next child.
- Do not infer revenue, unique-user conversion, checkout readiness, or finance truth from builder, generator, or template telemetry.
- Do not add runtime CTA, new event callsites/meanings, direct checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migration, RLS, route changes, product catalog mutation, shop expansion, or builder/generator UX changes without a new approved child brief.
- Keep the active checkout-started Admin Analytics mapping scoped to read-only Admin Analytics and screenshot approval before `npm run verify:pre-pr`.
- Any next child must include the pre-implementation owner explanation, scorecard mapping, data-boundary decisions, forward-compatibility contract, route/label/support sweep triggers, Help/Guide impact, and validation plan before implementation starts.

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
- Last completed child path: `docs/task-briefs/done/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md`
- Planned child path: none
- Active child path: `docs/task-briefs/in-progress/2026-06-11-workout-context-checkout-started-admin-analytics-mapping-v1-10-10.md`
- Done placement policy child path: `docs/task-briefs/done/2026-06-10-workout-context-upsell-placement-policy-v1-10-10.md`
- Done unblock child path: `docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`
- Done runtime source child path: `docs/task-briefs/done/2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10.md`
- Contract path: `docs/architecture/workout-builder-template-identity-selection-contract.md`
- Placement policy path: `docs/architecture/workout-context-upsell-placement-policy.md`
- Workout-context CTA measurement contract path: `docs/architecture/workout-context-cta-measurement-contract.md`
- Workout checkout attribution and finance separation contract path: `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this parent and the latest completed child brief, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-10 | refreshed parent | refreshed from clean synced main@f68a9554 after PR #1051 and closeout PR #1052; parent is now a plan-only sequencing brief with modern audit, scorecard, architecture, data, identity, forward-compatibility, Help/Guide, screenshot, and route/label/support sweep gates; recommended next child is Workout Builder Source Breakdown Dashboard V1, which should separate manual builder and generated-session save signals using existing safe first-party events before any CTA/checkout/finance work | next: owner decides whether to create/execute the recommended child brief`
- `2026-06-10 | planned child created | created planned child brief docs/task-briefs/planned/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md for read-only Admin Analytics source breakdown; implementation remains blocked on explicit owner execute/build/implement instruction and visual screenshot approval stop once implemented | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | child moved to in-progress | owner requested implementation, and the child moved to docs/task-briefs/in-progress/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md on branch workout-builder-source-breakdown-dashboard-v1; parent remains plan-only and the child owns the runtime work | next: complete the child implementation and screenshot approval stop`
- `2026-06-10 | active child implemented to screenshot stop | Workout Builder Source Breakdown Dashboard V1 now has aggregation, Admin Analytics UI, Help/Guide copy, contract docs, targeted tests, and route/label/support sweep recorded in the child brief; parent remains plan-only and no CTA, checkout, Stripe, export, finance, vendor, or builder/generator UX scope was added | next: capture child screenshot handoff and wait for owner approval before verify:pre-pr`
- `2026-06-10 | source breakdown child merged | PR #1053 merged at squash commit 83e57c8c and the child moved to done in the repo-managed closeout; parent now has no approved active child, and the next candidate should be chosen from observed source-breakdown data before any CTA, checkout, Stripe, export, finance, vendor, or builder/generator UX scope is added | next: finish docs-only closeout PR and run post-merge-preflight`
- `2026-06-10 | planned child created | created planned child brief docs/task-briefs/planned/2026-06-10-workout-builder-template-usage-generated-completion-dashboard-v1-10-10.md from clean main@69618263 after PR #1053 and closeout PR #1054; implementation is not approved yet and must begin with a telemetry-support audit so template usage is not inferred from unsupported signals | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | child moved to in-progress | owner requested implementation, and the child moved to docs/task-briefs/in-progress/2026-06-10-workout-builder-template-usage-generated-completion-dashboard-v1-10-10.md on branch workout-builder-template-generated-completion-dashboard-v1; parent remains plan-only and the child owns runtime work | next: complete implementation, targeted tests, and screenshot approval stop`
- `2026-06-10 | active child at screenshot stop | Workout Builder Template Usage / Generated Completion Dashboard V1 implemented the supported generated-completion subset, renders template usage as Not instrumented, updated Help/Guide/contracts/tests, and captured after/reference screenshot artifacts; parent remains plan-only and no CTA, checkout, Stripe, export, finance, vendor, or builder/generator UX scope was added | next: wait for owner screenshot approval before child verify:pre-pr`
- `2026-06-10 | active child pre-pr passed | owner approved screenshots and merge on good tests; the child passed npm run verify:pre-pr full lane with unit/build/perf/e2e coverage and remains scoped to Admin Analytics telemetry interpretation only | next: child PR creation, CI monitoring, pre-merge gate, and merge if green`
- `2026-06-10 | generated completion child merged | PR #1055 merged at squash commit 0e61938b after green local pre-pr, CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no active child, and template usage instrumentation remains deferred to a new planned child before any commercial UI | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-10 | planned child created | created planned child brief docs/task-briefs/planned/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md from clean main@99acbbb5 after PR #1055 and closeout PR #1056; implementation is not approved yet and must begin with a workout-builder template-support audit so template usage is not inferred from unsupported signals | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | child moved to in-progress | owner requested implementation, and the child moved to docs/task-briefs/in-progress/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md on branch workout-builder-template-usage-instrumentation-v1; parent remains plan-only and the child must audit template support before runtime work | next: complete the template-support audit and either implement the event or document the blocker`
- `2026-06-10 | template instrumentation blocked | required audit found no current runtime workout-builder template entity, stable template ID/key, or explicit template-selection action, so the child moved to docs/task-briefs/blocked/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md without adding event taxonomy, payload helpers, call sites, dashboard labels, migrations, vendors, checkout, export, or finance scope | next: owner decision on whether to create a workout-template identity/selection contract before resuming instrumentation`
- `2026-06-10 | planned unblock child created | created planned contract brief docs/task-briefs/planned/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md so template identity, source-of-truth, rename/repurpose rules, and explicit selection behavior can be decided before blocked instrumentation resumes | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | unblock child in progress | owner requested implementation of Workout Builder Template Identity / Selection Contract V1; the child moved to docs/task-briefs/in-progress/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md and added docs/architecture/workout-builder-template-identity-selection-contract.md as the durable contract artifact; parent remains plan-only and runtime template instrumentation remains blocked until a real template source and explicit selection surface exist | next: validate docs-only contract slice and prepare PR`
- `2026-06-10 | unblock contract child merged | PR #1057 merged at squash commit 92d40fbb; the contract child moved to docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md and confirms that instrumentation remains blocked until a future runtime child adds or identifies a canonical template source plus explicit Use-template-equivalent selection surface | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-10 | runtime source child merged | PR #1059 merged at squash commit c6cd5b56 and closeout PR #1060 moved the runtime source child to done; registry-backed templateKey identity and explicit Use template selection now unblock the instrumentation child | next: implement docs/task-briefs/in-progress/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
- `2026-06-10 | template instrumentation screenshot stop | active child added the typed template-selection event, payload helper, Use-template call site, Admin Analytics/Help interpretation updates, and targeted tests; local typecheck, quality-gates, lint:briefs -- --all, and diff-check passed; screenshot artifacts captured at output/workout-builder-template-usage-instrumentation-2026-06-10-201809 | next: wait for owner screenshot approval before child verify:pre-pr`
- `2026-06-10 | template instrumentation screenshots approved | owner approved the screenshot handoff; active child can proceed to verify:pre-pr and PR prep | next: child verify:pre-pr`
- `2026-06-10 | template instrumentation child merged | PR #1061 merged at squash commit 6d87eb68 after green local pre-pr, CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no approved active child, and template usage dashboard aggregation remains a later mapping child before any commercial UI | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-10 | planned mapping child created | created planned child brief docs/task-briefs/planned/2026-06-10-workout-builder-template-usage-admin-analytics-mapping-v1-10-10.md from clean synced main@a4cb0f6f after PR #1061 and closeout PR #1062; implementation is not approved yet and must begin with a mapping-support audit so template usage is counted only from workout_builder_template_selected and not inferred from adjacent builder/generator/save/commercial activity | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | mapping child in progress | owner requested implementation of docs/task-briefs/in-progress/2026-06-10-workout-builder-template-usage-admin-analytics-mapping-v1-10-10.md on branch workout-builder-template-usage-admin-analytics-mapping-v1; parent remains plan-only and the child owns runtime work | next: complete mapping-support audit before Admin Analytics implementation`
- `2026-06-10 | mapping child screenshot stop | active child added Admin Analytics template usage aggregation/UI, Help/Guide/API/architecture updates, targeted tests, route/label/support sweep evidence, and after/reference screenshot artifacts; parent remains plan-only and no CTA, checkout, Stripe, export, finance, vendor, raw drilldown, or builder/generator UX scope was added | next: wait for owner screenshot approval before child verify:pre-pr`
- `2026-06-10 | mapping child merged | PR #1063 merged at squash commit 617ca14f after green local pre-pr, CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no active approved child, and commercial UI, checkout, finance, vendor analytics, exports, and raw drilldown remain deferred until a new child is explicitly approved | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-10 | parent next-child cleanup | owner approved docs-only parent refresh after closeout PR #1064 and clean post-merge preflight; removed stale next-child wording for the completed template usage mapping child and replaced it with neutral next-child selection guardrails | next: owner chooses whether to create a new bounded child brief`
- `2026-06-10 | planned placement-policy child created | owner selected Workout Context Upsell Placement Policy V1 as the next bounded child; created docs/task-briefs/planned/2026-06-10-workout-context-upsell-placement-policy-v1-10-10.md from clean synced main@451ba841, with implementation still blocked on explicit owner execute/build/implement instruction and no runtime CTA, analytics event, dashboard, checkout, Stripe, entitlement, finance, vendor, export, migration, or builder/generator UX scope approved | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | placement-policy child in progress | owner requested execution of Workout Context Upsell Placement Policy V1 on branch workout-context-upsell-placement-policy-v1; child moved to docs/task-briefs/in-progress/2026-06-10-workout-context-upsell-placement-policy-v1-10-10.md and remains docs-only, with no runtime CTA, analytics event, dashboard, checkout, Stripe, entitlement, finance, vendor, export, migration, or builder/generator UX scope approved | next: complete child validation and PR`
- `2026-06-11 | placement-policy child merged | PR #1066 merged at squash commit 56701757 after green docs-only local pre-pr, CI, and pre-merge gates; parent has no active child, and runtime CTA, CTA events/dashboard, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, and builder/generator UX remain deferred | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-11 | planned existing upsell baseline child created | owner selected Existing Upsell Event Admin Analytics Baseline V1 as the next bounded child; created docs/task-briefs/planned/2026-06-11-existing-upsell-event-admin-analytics-baseline-v1-10-10.md from clean synced main@13b3b072 after PR #1067 and clean post-merge preflight, with implementation still blocked on explicit owner execute/build/implement instruction and no runtime workout-context CTA, new event callsites/meanings, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, or builder/generator UX scope approved | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | existing upsell baseline child in progress | owner requested execution of Existing Upsell Event Admin Analytics Baseline V1 on branch existing-upsell-event-admin-analytics-baseline-v1; child moved to docs/task-briefs/in-progress/2026-06-11-existing-upsell-event-admin-analytics-baseline-v1-10-10.md and remains scoped to read-only Admin Analytics visibility for existing upsell events, with no runtime workout-context CTA, new event callsites/meanings, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, or builder/generator UX approved | next: implement child and stop at screenshot handoff before verify:pre-pr`
- `2026-06-11 | existing upsell baseline validation before screenshot | active child implemented read-only existing upsell aggregation/UI, Help/Guide/API-contract support copy, targeted tests, and route/label/support sweep evidence; targeted Vitest, typecheck, quality-gates, lint:briefs:all, and diff-check pass, with no runtime workout-context CTA, new event callsite, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog mutation, or builder/generator UX added | next: child screenshot handoff and owner approval stop before verify:pre-pr`
- `2026-06-11 | existing upsell baseline screenshot stop | active child captured after/reference screenshot artifacts at output/existing-upsell-event-admin-analytics-baseline-v1-2026-06-11-074931; temporary local capture harness was removed after generation, no product rendering files changed after final capture, and owner visual approval is pending before verify:pre-pr | next: wait for owner screenshot approval or visual corrections`
- `2026-06-11 | existing upsell baseline screenshots approved | owner approved the child screenshot handoff in chat; no product rendering files changed after final capture | next: child verify:pre-pr`
- `2026-06-11 | existing upsell baseline pre-pr passed | active child passed npm run verify:pre-pr full lane with typecheck, unit tests, build, performance budgets, and Playwright; no runtime workout-context CTA, new event callsite, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog mutation, or builder/generator UX scope was added | next: commit, push, open PR, monitor CI, then run child pre-merge gate`
- `2026-06-11 | existing upsell baseline child merged | PR #1068 merged at squash commit 765179c2 after green local pre-pr, CI, and pre-merge gates; child moved to done in the repo-managed closeout, parent has no active child, and runtime workout-context CTA, new event callsite, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog mutation, and builder/generator UX remain deferred | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-11 | planned measurement contract child created | owner approved Workout Context CTA Measurement Contract V1 as the next bounded child; created docs/task-briefs/planned/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md from clean synced main@a5b4760d after PR #1069 and clean post-merge preflight, with implementation still blocked on explicit owner execute/build/implement instruction and no runtime workout-context CTA, new event callsites, Admin Analytics runtime modules, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog mutation, or builder/generator UX scope approved | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | measurement contract child in progress | owner requested execution of Workout Context CTA Measurement Contract V1 on branch workout-context-cta-measurement-contract-v1; child moved to docs/task-briefs/in-progress/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md and remains docs-only, with no runtime workout-context CTA, new event callsites, Admin Analytics runtime modules, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog mutation, or builder/generator UX scope approved | next: complete docs contract and validation`
- `2026-06-11 | measurement contract child merged | PR #1070 merged at squash commit 51f0c2c3 after green local pre-pr, CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no active child, and runtime workout-context CTA, new event callsites, Admin Analytics runtime modules, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route changes, product catalog mutation, and builder/generator UX remain deferred | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-11 | measurement closeout merged and runtime child selected | closeout PR #1071 merged at squash commit d2e60435 and owner then executed Workout Context CTA Runtime + Event Callsites V1 on branch workout-context-cta-runtime-v1; parent active child is docs/task-briefs/in-progress/2026-06-11-workout-context-cta-runtime-event-callsites-v1-10-10.md | next: implement child and stop at screenshot approval before pre-PR`
- `2026-06-11 | runtime CTA child screenshot stop | active child added the saved-workout post-success CTA, typed workout-context event payload, catalog availability fail-closed guard, page prop wiring, Admin Analytics baseline isolation, Help/Guide/API/architecture updates, targeted tests, and after/reference screenshot artifacts at output/workout-context-cta-runtime-2026-06-11-105229; temporary local screenshot harness was removed after capture, no scoped product-rendering files changed after final capture, and owner visual approval is pending before route/label/support sweep and verify:pre-pr | next: wait for owner screenshot approval or visual corrections`
- `2026-06-11 | runtime CTA screenshots approved | owner approved screenshot handoff for output/workout-context-cta-runtime-2026-06-11-105229, and route/label/support sweep found only expected scoped fallout plus unchanged existing checkout/Stripe/entitlement references | next: child lint/tests and verify:pre-pr`
- `2026-06-11 | runtime CTA pre-pr passed | child validation passed npm run lint:briefs:all, targeted Vitest, git diff --check, npm run lint:quality-gates, and npm run verify:pre-pr full lane on branch workout-context-cta-runtime-v1 with no scoped product-rendering source changes after the final approved screenshot capture | next: commit, push, open PR, monitor CI, and run pre-merge gate`
- `2026-06-11 | runtime CTA child merged | PR #1072 merged at squash commit 36b11d16 after green local pre-pr, PR CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no active child, and Admin Analytics runtime modules, upsell_declined, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route changes, product catalog mutation, new pricing, and builder/generator algorithm changes remain deferred | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-11 | runtime CTA closeout merged and admin mapping child selected | closeout PR #1073 merged at squash commit e31d2d19 after clean post-merge preflight, and owner then executed Workout Context CTA Admin Analytics Mapping V1 on branch workout-context-cta-admin-analytics-mapping-v1 | next: implement read-only Admin Analytics mapping and stop at screenshot approval before pre-PR`
- `2026-06-11 | admin mapping child copy polish | active child added the bounded workout-context CTA Admin Analytics aggregate/panel and then polished touched Admin Analytics and Help/Guide wording for non-technical admins with labels like Shown, Clicked, Needs review, Current sales prompts, Poolside guide prompt, Generated sessions, and Template starts; targeted Vitest passed and no checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, runtime CTA, or builder/generator algorithm scope was added | next: typecheck/brief lint/diff check, regenerate child screenshot handoff, and wait for owner approval before verify:pre-pr`
- `2026-06-11 | admin mapping child screenshot stop | active child passed typecheck, lint:briefs:all, diff-check, and targeted Vitest, then regenerated after/reference screenshot artifacts at output/workout-context-cta-admin-analytics-2026-06-11-141620 with admin-readable copy visible; temporary capture harness was removed and no scoped product-rendering files changed after final capture | next: wait for owner screenshot approval or copy corrections before verify:pre-pr`
- `2026-06-11 | admin mapping child screenshot copy correction | owner reviewed after-workout-context-cta-desktop and requested removal of the three Shown/Clicked/Click rate detail lines while keeping Needs review; active child regenerated after/reference artifacts at output/workout-context-cta-admin-analytics-2026-06-11-142708 and removed temporary capture files after generation | next: final targeted QA and wait for owner visual approval before verify:pre-pr`
- `2026-06-11 | admin mapping child pre-pr passed | owner approved the regenerated screenshot handoff, and active child passed npm run verify:pre-pr full lane with no scoped product-rendering source changes after the final approved screenshot capture | next: commit, push, open/update PR, monitor CI, and run child pre-merge gate`
- `2026-06-11 | admin mapping child merged | PR #1074 merged at squash commit f7af4d9d after green local pre-pr, PR CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no active child, and upsell_declined, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route changes, product catalog mutation, new pricing, runtime CTA changes, and builder/generator algorithm changes remain deferred | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-11 | planned checkout/finance separation child created | created docs/task-briefs/planned/2026-06-11-workout-checkout-attribution-finance-separation-contract-v1-10-10.md from clean synced main@2be08770 after PR #1075 and clean post-merge preflight; implementation is not approved yet and scope remains docs-only contract work separating CTA/product telemetry, checkout attribution, entitlement truth, Stripe reconciliation, and finance reporting before any runtime commerce expansion | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | checkout/finance separation child in progress | owner requested implementation of Workout Checkout Attribution + Finance Separation Contract V1 on branch workout-checkout-attribution-finance-separation-contract-v1; child moved to docs/task-briefs/in-progress/2026-06-11-workout-checkout-attribution-finance-separation-contract-v1-10-10.md and remains docs-only with no runtime CTA, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, route, product catalog, pricing, dashboard, or builder/generator UX scope approved | next: complete docs contract and validation`
- `2026-06-11 | checkout/finance separation child merged | PR #1076 merged at squash commit 948e0309 after green docs-only pre-pr, PR CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no active or selected child, and runtime checkout, Stripe API/webhook/portal changes, entitlement mutation, finance reconciliation scripts, vendor analytics, export, raw drilldown, migration, RLS, route changes, product catalog mutation, pricing, dashboard changes, and builder/generator algorithm changes remain deferred | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-11 | planned checkout-started attribution hardening child created | created docs/task-briefs/planned/2026-06-11-checkout-started-attribution-hardening-v1-10-10.md from clean synced main@c60d5069 after PR #1077 and clean post-merge preflight; implementation is not approved yet and scope remains limited to future hardening of existing /api/checkout/session checkout-start attribution with no direct workout-context checkout, checkout completion, Stripe webhook, entitlement, finance, vendor, export, raw drilldown, migration, RLS, product catalog, dashboard, visible UI, or builder/generator algorithm scope approved | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | checkout-started attribution hardening child in progress | owner requested implementation on branch checkout-started-attribution-hardening-v1; active child is docs/task-briefs/in-progress/2026-06-11-checkout-started-attribution-hardening-v1-10-10.md and remains scoped to existing /api/checkout/session checkout-start attribution hardening with no direct workout-context checkout, checkout completion, Stripe webhook, entitlement, finance, vendor, export, raw drilldown, migration, RLS, product catalog, dashboard, visible UI, or builder/generator algorithm scope approved | next: implement the child and run targeted validation`
- `2026-06-11 | checkout-started attribution hardening child merged | PR #1078 merged at squash commit b067c30c after green local pre-pr, PR CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no active child, and direct workout-context checkout, checkout completion, Stripe webhook changes, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route creation, product catalog mutation, new pricing, dashboard changes, visible UI changes, and builder/generator algorithm changes remain deferred | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-11 | planned attribution bridge child created | created docs/task-briefs/planned/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md from clean synced main@6a858185 after PR #1078 and closeout PR #1079; implementation is not approved yet and scope remains limited to a future saved-workout CTA -> /plans -> existing checkout-start attribution bridge, with no direct checkout, dashboard module, Stripe webhook, entitlement, finance, shop/product catalog mutation, pricing, export, raw drilldown, visible redesign, or builder/generator algorithm changes | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | attribution bridge child in progress | owner requested implementation on branch workout-context-plans-checkout-attribution-bridge-v1; active child is docs/task-briefs/in-progress/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md and remains scoped to the saved-workout CTA -> /plans -> existing checkout-start attribution bridge, with no direct checkout, dashboard module, Stripe webhook, entitlement, finance, shop/product catalog mutation, pricing, export, raw drilldown, visible redesign, or builder/generator algorithm changes | next: audit current CTA/plans/checkout code and implement the bounded bridge`
- `2026-06-11 | attribution bridge child merged | PR #1080 merged at squash commit 7ba175f2 after green local pre-pr, PR CI, and pre-merge gates; child moved to done in repo-managed closeout, parent has no active child, and direct workout-context checkout, checkout completion, dashboard modules, Stripe webhook changes, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route creation, product catalog mutation, new pricing, visible redesign, and builder/generator algorithm changes remain deferred | next: finish docs-only closeout PR and rerun post-merge-preflight`
- `2026-06-11 | planned checkout-started admin mapping child created | owner selected Workout Context Checkout-Started Admin Analytics Mapping V1 after PR #1080 and closeout PR #1081; created docs/task-briefs/planned/2026-06-11-workout-context-checkout-started-admin-analytics-mapping-v1-10-10.md from clean synced main@a2653085, with implementation still blocked on explicit owner execute/build/implement instruction and no direct checkout, checkout completion, Stripe webhook, entitlement, finance, export, raw drilldown, vendor analytics, pricing, product catalog mutation, migration, RLS, route creation, visible redesign, or builder/generator algorithm scope approved | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | checkout-started admin mapping child in progress | owner requested implementation on branch workout-context-checkout-started-admin-analytics-mapping-v1; active child is docs/task-briefs/in-progress/2026-06-11-workout-context-checkout-started-admin-analytics-mapping-v1-10-10.md and remains scoped to read-only Admin Analytics mapping for mapped workout-context checkout-start handoffs, with screenshot approval required before verify:pre-pr and no direct checkout, checkout completion, Stripe webhook, entitlement, finance, export, raw drilldown, vendor analytics, pricing, product catalog mutation, migration, RLS, route creation, visible redesign, or builder/generator algorithm scope approved | next: implement the bounded Admin Analytics mapping`
- `2026-06-11 | checkout-started admin mapping screenshot stop | active child added the mapped checkout-start aggregate, Admin Analytics module, Help/Guide/API/architecture copy, targeted tests, route/label/support sweep evidence, and after/reference screenshot artifacts at output/workout-context-checkout-started-admin-analytics-2026-06-11-183737; temporary visual capture route was removed after generation, and no direct checkout, checkout completion, Stripe webhook, entitlement, finance, export, raw drilldown, vendor analytics, pricing, product catalog mutation, migration, RLS, route creation, visible redesign, or builder/generator algorithm scope was added | next: wait for owner screenshot approval before child verify:pre-pr`
- `2026-06-11 | checkout-started admin mapping copy polish screenshot stop | owner asked for event/technical term clarity, so active child changed visible Admin Analytics copy to tracked action, last activity, read limit, setup missing, and browser/server, added Help/Guide term explanation, passed targeted Vitest, and regenerated after/reference screenshots at output/workout-context-checkout-started-admin-analytics-2026-06-11-185350; temporary visual capture route was removed after generation, and no direct checkout, checkout completion, Stripe webhook, entitlement, finance, export, raw drilldown, vendor analytics, pricing, product catalog mutation, migration, RLS, route creation, visible redesign, or builder/generator algorithm scope was added | next: wait for owner screenshot approval before child verify:pre-pr`
- `2026-06-11 | checkout-started admin mapping screenshots approved | owner approved regenerated screenshots at output/workout-context-checkout-started-admin-analytics-2026-06-11-185350; no scoped product-rendering source changed after final capture | next: child verify:pre-pr`
- `2026-06-11 | checkout-started admin mapping pre-pr passed | active child passed npm run verify:pre-pr full lane with branch-current, lint, typecheck, unit, build, performance budgets, and Playwright e2e; no scoped product-rendering source changed after the final approved screenshot capture | next: commit, push, open PR, monitor CI, and run child pre-merge gate`
