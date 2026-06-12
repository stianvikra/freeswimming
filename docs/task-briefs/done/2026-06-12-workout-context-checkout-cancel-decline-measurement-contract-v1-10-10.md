# Task Brief: Workout Context Checkout-Cancel / Decline Measurement Contract V1 (10/10)

## Metadata

- `id`: `2026-06-12-workout-context-checkout-cancel-decline-measurement-contract-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-12`
- `updated`: `2026-06-12`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-12-workout-context-commercial-funnel-stage-summary-v1-10-10.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
  - `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`
- `execution_mode`: `docs-contract-after-explicit-implement`
- `branch`: `workout-context-checkout-cancel-decline-contract-v1`

## Brief Audit Record

- `last_audited`: `2026-06-12`
- `base`: clean synced `main@0dbd2090` after PR `#1097` added the workout-context commercial stage summary, repo-managed closeout PR `#1098` moved it to done, and post-merge preflight was reported clean.
- `audit_status`: `ready`
- `decision`: Execute this bounded docs-only analytics child on branch `workout-context-checkout-cancel-decline-contract-v1`.
- `reason`: The owner explicitly requested execution. The workout-context CTA, checkout handoff, completion/access, support diagnostics, and stage summary are complete. The remaining `upsell_declined` gap is semantic, not technical: current checkout-cancel telemetry is scoped to existing `/plans` and My Library surfaces, while workout-context decline meaning is intentionally undefined. This child defines the allowed meaning before any runtime event, Admin Analytics mapping, or support interpretation is added.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, task brief lint rules, scorecard categories, `ANALYTICS_EVENT_NAMES`, `analytics_events` schema, `components/analytics/TrackCheckoutCancel.tsx`, `components/my-library/CheckoutButton.tsx`, `app/plans/page.tsx`, `lib/commerce/checkout.ts`, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, Admin Help/Guide copy, checkout/Stripe/entitlement/finance contracts, product catalog IDs, or route/label/support sweep rules change.

## Goal

Create a docs-only measurement contract that defines whether and how workout-context checkout cancel or explicit decline behavior may be measured without treating absence, non-buyers, checkout failure, provider failure, entitlement state, revenue, or finance truth as `upsell_declined`.

## Pre-Implementation Owner Explanation

Vi lager en kontrakt for hva "decline" eller checkout cancel kan bety i workout-context for vi eventuelt maler det. Dette matters fordi feil definisjon kan gi falsk konverteringsdata, for eksempel at alle som ikke kjoper blir telt som "declined". Utenfor scope er runtime-events, Admin Analytics UI, checkout/Stripe, entitlement-regler, finance/revenue, export/raw drilldown, tredjeparts analytics, nye produkter/priser og builder/generator UX.

Forward-compatibility-intent: nye produkter, plasseringer, checkout-returer og dismiss-arsaker skal ikke automatisk telle som workout-context decline; de skal feile lukket eller kreve eksplisitt mapping, tester, Help/Guide-kopi og support-regler.

## Product Questions

This child answers only these contract questions:

1. Which action, if any, is a valid workout-context decline signal: explicit CTA dismiss, checkout-cancel return, both as separate meanings, or neither yet?
2. If checkout cancel may be used, which source/placement/product dimensions must survive from saved-workout CTA through `/plans` and checkout return before the event is eligible for workout-context counting?
3. Should current `/plans?checkout=cancelled` telemetry stay plans-owned unless the cancel path is explicitly mapped with `source=workout_context`, `placementId=workout_saved_post_success`, and `productId=guide_poolside`?
4. Which low-cardinality payload fields and `reason` values are allowed, and which raw URL, checkout, user, payment, workout, provider, support, and finance fields are forbidden?
5. How should duplicate cancel returns, abandoned checkout tabs, failed checkout creation, provider failures, refunds, entitlement lag, empty ranges, stale/capped reads, and schema-missing states be interpreted?
6. Which later children must own runtime event callsites, cancel-path propagation, Admin Analytics mapping, Help/Guide copy, screenshot handoff, checkout/Stripe, entitlement, finance, export, raw drilldown, or vendor analytics?

## Proposed Contract Direction

- Keep current existing-surface `upsell_declined` behavior separate from workout-context meaning until this contract is executed and accepted.
- Treat "did not buy", "did not click", closed tab, and checkout-start failure as not a decline signal.
- Treat checkout-cancel return as eligible only if a later runtime child intentionally carries the mapped workout-context source, placement, and product through the cancel path and the contract approves that meaning.
- Treat explicit CTA dismiss as a separate possible decline meaning that requires a visible dismiss control, UX decision, screenshot handoff, and its own runtime child.
- Keep any future decline count as selected-range event telemetry, not unique-user conversion, purchase failure, entitlement failure, provider failure, revenue, refund, payout, invoice, accounting export, Stripe reconciliation, or finance truth.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Contract must answer the bounded decline/cancel measurement question without reopening completed CTA, checkout, completion/access, support diagnostics, or stage-summary scopes.     | architecture contract + parent checkpoint                           | `5/5`                   |
| UX flow clarity                               | `target`     | Contract must distinguish explicit decline, checkout cancel, ignored CTA, abandoned tab, and failed checkout in plain language before any future UI or dashboard copy ships.         | contract semantics table + Help/Guide impact notes                  | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: this docs-only child adds no rendered UI; any future CTA dismiss or Admin Analytics mapping child must provide screenshot handoff.                                  | explicit visual N/A rationale + future screenshot rule              | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Contract must define deterministic eligible/ineligible signals and prevent counting absence, failed checkout, provider failure, entitlement state, or finance state as decline.      | contract decision table + route/label/support sweep                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child adds no admin editor, placement config, CRUD flow, publish workflow, or editable checkout setting.                                                            | explicit scope rationale                                            | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no UI changes; future visible decline/dismiss/dashboard child must preserve focus order, labels, headings, keyboard access, and screen-reader semantics.            | explicit future a11y requirement                                    | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no runtime route, bundle, query, dependency, chart, vendor script, or payload shape changes in this docs-only contract.                                             | docs-only changed-files review                                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Contract must keep analytics rows server-canonical, browser cancel/dismiss telemetry best-effort, and checkout/provider/entitlement/finance truth in separate systems.               | data placement contract                                             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache changes; future runtime/dashboard child must preserve `no-store` analytics reads and define any cancel-path or placement config cache behavior.            | route/cache scope rationale                                         | `4/5`                   |
| Reliability and failure handling              | `target`     | Contract must define duplicate, retry, empty, stale, capped, schema-missing, failed-read, unknown, unmapped, and checkout-failure interpretations without false decline counts.      | reliability matrix + future negative-test requirements              | `5/5`                   |
| Security and authz                            | `target`     | Contract must not widen public/admin/user access and must require future protected routes to fail closed with negative-path tests if touched.                                        | security/authz section + changed-files review                       | `5/5`                   |
| Privacy and compliance                        | `target`     | Contract must forbid raw URLs/query strings, checkout URLs, Stripe IDs, emails, user IDs, visitor IDs, IPs, user agents, payment data, workout text/IDs, and raw payload display.    | forbidden payload list + privacy sweep                              | `5/5`                   |
| Content governance                            | `target`     | Contract, parent checkpoint, and related architecture references must align on event meaning, support interpretation, and future child boundaries.                                   | docs updates + lint:briefs                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation, editable workflow, role-gated action, publish path, or recovery action changes in this docs-only child.                                               | explicit admin workflow scope rationale                             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this docs-only contract adds no public route, metadata, sitemap, canonical URL, robots rule, structured data, or crawlable content.                                      | explicit SEO scope rationale                                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this docs-only contract adds no public semantic page, public docs page, structured data, or AI-facing crawl surface.                                                     | explicit AI-discoverability scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `target`     | Contract must define future workout-context `upsell_declined` eligibility and caveats before any dedicated KPI module or stage-rate denominator includes decline.                    | analytics semantics contract                                        | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Contract must keep decline/cancel telemetry separate from checkout start/completion, Stripe provider truth, entitlement access, refunds, recovery, and catalog/pricing decisions.    | commerce boundary section                                           | `5/5`                   |
| Incident response and support operations      | `target`     | Contract must explain what support can and cannot infer from cancel/decline counts, including duplicate returns, checkout availability, provider failures, and unmapped attribution. | support interpretation section + sweep                              | `5/5`                   |
| Finance and reporting operations              | `target`     | Contract must explicitly state cancel/decline telemetry is not revenue, refund, payout, invoice, accounting export, Stripe reconciliation, provider failure, or finance reporting.   | finance caveat copy + no finance/export changed-files evidence      | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine keys remain locale-independent and labels are display-only; localized commercial/support copy needs a future owner-approved child.                          | identity/rename contract                                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Docs-only child must reuse existing architecture/task-brief patterns and add no dependency, route, migration, event callsite, vendor, checkout, Stripe, entitlement, or UI surface.  | changed-files/package diff                                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs must pass `npm run lint:briefs`; docs-only execution must also pass docs-only/pre-PR gates before PR update.                                                          | `npm run lint:briefs` + `git diff --check` + future verify evidence | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: contract keeps future dimensions low-cardinality and avoids raw drilldown/export/warehouse/vendor paths unless a future child approves them.                        | payload cardinality rules                                           | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: docs-only contract is revertable without migration/provider/env changes; future runtime child must define rollback and kill-switch behavior.                        | rollback scope rationale                                            | `4/5`                   |

## Stack / Architecture Best-Practice Gate

Skill/capability audit:

- Available now: repo docs/task-brief patterns, existing analytics/commerce contracts, local validation commands.
- Not needed now: Stripe skill, Playwright skill, browser automation, MCP/plugin changes, or provider docs because this is a docs-only measurement contract.
- Install/config changes: none.

Systemic findings:

| Surface                | Finding                                                                                                        | Severity | Recommended Type              | Owner Decision Needed | Follow-Up Brief Path |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------- | --------------------- | -------------------- |
| Analytics/KPI          | Workout-context `upsell_declined` is intentionally undefined while the existing cancel tracker is plans-owned. | medium   | bounded docs-contract child   | no                    | this brief           |
| Commerce/support       | Checkout cancel can be misread as non-buyer or provider failure unless cancel-path meaning is explicit.        | high     | bounded docs-contract child   | no                    | this brief           |
| Runtime implementation | Any event callsite or dashboard mapping needs an owner-approved follow-up after the contract.                  | medium   | deferred implementation child | yes                   | TBD                  |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Status: active docs-only child on branch `workout-context-checkout-cancel-decline-contract-v1`.
- Last merged workstream: PR `#1097` (`38a0d9b3`) and closeout PR `#1098` (`0dbd2090`).
- Next planning step: wait for explicit owner execute/build/implement instruction or scope edits.

- React/Next.js:
  - This child is docs-only and must not change routes, server/client components, actions, API routes, cache behavior, `TrackCheckoutCancel`, `CheckoutButton`, `/plans`, or workout CTA rendering.
  - Future runtime work must reuse the current checkout cancel tracker or checkout button attribution patterns instead of inventing a parallel analytics path.
- TypeScript/domain contracts:
  - This child may define future allowed values and invariants in docs only.
  - Future implementation must type event names through `ANALYTICS_EVENT_NAMES`, sanitize dimensions, and use bounded reason keys.
- Supabase/data layer:
  - No migration, RLS change, generated type update, rollup job, index, raw drilldown, or export path.
  - Future dashboard work must aggregate existing `analytics_events` safely and never expose raw payload JSON.
- External services/tools:
  - No Stripe API, Checkout Session, webhook, portal, entitlement, billing, finance, vendor analytics, SDK, secret, or env-var change.
  - Future Stripe-adjacent work must use official SDK/docs, idempotency, webhook verification, redacted diagnostics, and finance/support boundaries.
- UI system:
  - No visible UI in this child.
  - Future explicit dismiss UI or Admin Analytics UI requires screenshot handoff and owner approval before `npm run verify:pre-pr`.
- Testing:
  - Docs-only contract execution: run route/label/support sweep, `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`, and `npm run verify:pre-pr`.
  - Future docs-contract execution: run docs-only validation and `npm run verify:pre-pr`.
  - Future runtime/dashboard child: add targeted unit/component tests for eligible/ineligible cancel/decline rows, unsafe payload exclusion, unknown values, and Help/Guide assertions.

## Data Placement And Sync Contract

- Server-canonical:
  - Future persisted analytics rows in `analytics_events`.
  - Checkout/provider truth from checkout route and Stripe/webhook contracts.
  - Entitlement truth from server-canonical entitlement storage.
  - Finance truth from Stripe/accounting reconciliation artifacts.
- Local/browser:
  - Future cancel/dismiss analytics may be best-effort client telemetry and may duplicate on retry or reload.
  - No analytics cookie, visitor ID, localStorage attribution identity, ad click ID, user-to-public bridge, or admin preference is added by this child.
- Sync behavior:
  - Future decline telemetry must not mutate checkout, product catalog, entitlement, provider, support, or finance truth.
  - Abandoned checkout tabs and absent events remain unknown, not decline.
- Retention and sensitivity:
  - Existing analytics retention applies if future events are persisted.
  - Raw checkout URLs, Stripe IDs, payment IDs, invoice/refund/payout IDs, emails, user IDs, visitor IDs, IPs, user agents, raw URLs/referrers/query strings, workout text, private workout IDs, support messages, and raw payload JSON are forbidden.
- Cache/invalidation:
  - This docs-only child changes no cache.
  - Future Admin Analytics reads remain `no-store`; future runtime cancel-path changes must define any URL/query propagation and stale-state behavior before implementation.

## Identity And Rename Contract

- Canonical stable IDs:
  - Event identity: `upsell_declined` only if a later child approves a concrete workout-context meaning.
  - Source identity: `workout_context` for mapped workout-context flows.
  - Placement identity: `workout_saved_post_success`.
  - Product identity: `guide_poolside`.
  - Reason identity: a future bounded machine key such as `checkout_cancelled` or `cta_dismissed` only after contract approval.
- Human-readable identifiers:
  - Dashboard labels, Help/Guide copy, CTA copy, product title, and route labels are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Event meanings are append-only.
  - Placement/product/source/reason keys are write-once after they appear in analytics, docs, support copy, or tests.
  - Changing checkout-cancel from plans-owned to workout-context-owned semantics is repurpose unless this contract defines the exact eligibility rule.
- Rename vs repurpose:
  - Copy-only clarity is a rename.
  - Counting ignored users, non-buyers, checkout failures, provider failures, refunds, entitlement lag, or finance outcomes as decline is repurpose and requires a new child.
- Compatibility contract:
  - Unknown, deprecated, inactive, unmapped, or malformed source/placement/product/reason values stay out of dedicated workout-context decline KPIs until mapped.
  - Generic Admin Analytics lists may still display safe event totals where existing formatting allows.
- Observability and repair:
  - Future dashboard/support work must expose unknown/unmapped states through bounded diagnostics, not raw payload drilldown.

## Forward Compatibility Contract

- Extensibility surfaces:
  - CTA placements, product IDs, checkout attribution sources, checkout return/cancel params, decline reason keys, event payload dimensions, Admin Analytics modules, Help/Guide copy, locales, providers, export formats, vendor forwarding, entitlement states, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Checkout attribution identity comes from `lib/commerce/checkout.ts` and commerce contracts.
  - Product IDs come from the catalog.
  - Admin counts come from `/api/admin/analytics/insights`.
  - Finance truth comes from reconciliation/export evidence, not analytics.
- Additive behavior:
  - Existing current-surface `upsell_declined` and generic event lists continue to work.
  - Existing stage summary remains unchanged until a later mapping child explicitly adds a decline stage or caveat.
- Explicit mapping requirements:
  - New CTA dismiss controls, workout-context checkout-cancel tracking, direct checkout, new products, new placements, new reason keys, dedicated decline KPIs, finance reporting, CSV/export, raw drilldown, vendor analytics, localized commercial claims, or public landing/SEO copy require explicit mapping, tests, docs, and owner decision.
- Unknown or deprecated values:
  - Unknown source/placement/product/reason values must fail closed for dedicated workout-context decline counts.
  - Unknown values must not imply conversion loss, purchase failure, entitlement failure, provider failure, revenue, refund, payout, invoice, accounting close, or finance truth.
- Test/evidence:
  - This docs-only execution must pass brief lint and route/label/support sweep evidence.
  - Future implementation children must include fixtures for mapped cancel, unmapped cancel, plans-owned cancel, duplicate cancel, abandoned checkout, checkout-create failure, explicit dismiss if added, unknown product, unknown placement, unsafe payload values, zero denominator, stale/capped/schema-missing reads, and Help/Guide assertions.

## Scope

- Create `docs/architecture/workout-context-checkout-cancel-decline-measurement-contract.md`.
- Update this child brief and the parent active-child references.
- Define event meaning, payload boundaries, support interpretation, finance separation, and future implementation child boundaries.
- Keep work in docs, architecture, and planning surfaces only.

## Out Of Scope

- Runtime `upsell_declined` callsites or payload helpers.
- Changing `TrackCheckoutCancel`, `CheckoutButton`, `/plans`, `/api/checkout/session`, Stripe Checkout Sessions, webhook handling, entitlement mutation, billing portal, product catalog, pricing, direct checkout, or workout CTA UI.
- Admin Analytics aggregation, view-model, UI, dashboard stage changes, screenshots, export/CSV, raw drilldown, vendor analytics, migrations, RLS, generated DB types, finance scripts, accounting exports, refunds, payouts, invoices, or revenue recognition.
- Treating ignored users, abandoned checkout, checkout-start failure, provider failure, refunds, entitlement lag, or finance state as decline.

## Help / Guide Impact

- Docs-contract execution: update architecture/support interpretation docs and parent checkpoint. User/admin Help/Guide remains unchanged because this child adds no visible labels, workflow copy, support recovery behavior, or Admin Analytics modules.
- Future runtime/dashboard child: must update Admin Help/Guide or linked runbook with exact decline/cancel meaning, duplicate/unknown/stale states, and finance caveats.

## Screenshot / Visual Impact

- Docs-contract execution: screenshot handoff is N/A because no rendered UI, print, layout, brand, style, or product asset changes.
- Any future CTA dismiss UI or Admin Analytics decline mapping child must provide `after/reference` or `before/after` screenshot artifacts and stop for owner approval before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

Required when this contract is executed because it changes support interpretation for event taxonomy and checkout labels.

Identifiers to search:

- `upsell_declined`
- `checkout_cancelled`
- `checkout=cancelled`
- `TrackCheckoutCancel`
- `workout_context`
- `workout_saved_post_success`
- `guide_poolside`
- `placementId`
- `source=workout_context`
- `source=plans`
- `/plans`
- `/api/checkout/session`
- `Admin Analytics`
- `finance reporting`
- `Stripe reconciliation`
- `revenue`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/deferred/done analytics, workout, commerce, and checkout briefs.

### Sweep Evidence

- Command:
  - `rg -n "upsell_declined|checkout_cancelled|checkout=cancelled|TrackCheckoutCancel|workout_context|workout_saved_post_success|guide_poolside|placementId|source=workout_context|source=plans|/plans|/api/checkout/session|Admin Analytics|finance reporting|Stripe reconciliation|revenue" app components lib/analytics lib/commerce tests docs/api-contracts.md docs/architecture docs/runbooks docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done`
- Result:
  - Expected fallout only: current checkout-cancel tracker and tests, `/plans` checkout attribution bridge, checkout/session attribution docs, Admin Analytics contracts, finance/entitlement separation docs, and historical task-brief references.
  - Updated docs fallout in this slice: new architecture contract, CTA measurement contract, checkout/finance separation contract, API contract, data-access/authz/cache registry, parent checkpoint, and active child brief.
  - No runtime callsite, Admin Analytics mapping, checkout/Stripe/webhook, entitlement-rule, finance/export/vendor/product/builder scope was added.

## Acceptance Criteria

1. A docs-only contract path is created or named for workout-context checkout-cancel / decline measurement before runtime implementation.
2. Contract states which decline/cancel signals are eligible, ineligible, or deferred.
3. Contract keeps current `/plans` / My Library cancel telemetry separate from workout-context unless explicit mapped attribution is defined.
4. Contract forbids sensitive fields and raw payload display.
5. Contract separates decline/cancel telemetry from checkout success, provider truth, entitlement truth, unique-user conversion, revenue, refunds, payouts, invoices, accounting exports, Stripe reconciliation, and finance reporting.
6. Parent brief points to this active child and no runtime implementation scope is added.
7. Changed briefs pass `npm run lint:briefs`.

## Validation

- route/label/support-surface sweep
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:pre-pr` using the docs-only lane
- required PR CI checks
- `npm run verify:pre-merge` before merge

### Validation Evidence

- `rg -n "upsell_declined|checkout_cancelled|checkout=cancelled|TrackCheckoutCancel|workout_context|workout_saved_post_success|guide_poolside|placementId|source=workout_context|source=plans|/plans|/api/checkout/session|Admin Analytics|finance reporting|Stripe reconciliation|revenue" app components lib/analytics lib/commerce tests docs/api-contracts.md docs/architecture docs/runbooks docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done` - PASS, expected docs/runtime/test/historical references only.
- `npm run lint:briefs` - PASS/skipped because the unstaged diff was covered by the all-brief lane.
- `npm run lint:briefs:all` - PASS, including this active child and parent brief.
- `git diff --check` - PASS.
- `npm run verify:pre-pr` - PASS, docs-only lane, 7 changed docs/governance files.

## Local Tooling Prerequisite

- Node.js LTS and npm must be available for local validation.
- Before reporting npm/node as missing, bootstrap nvm first:
  - `export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"`
  - `[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`
  - `nvm use --silent`

## Manual QA Environments

- N/A for this docs-contract execution because no UI/runtime behavior changes.
- Future UI/dashboard child must follow the repo screenshot handoff and manual QA rules.

## Constraints

- Keep this child docs-only even after execution approval.
- Do not add runtime events, dashboard modules, checkout behavior, Stripe/webhook behavior, entitlement behavior, product/pricing changes, export/raw drilldown, vendor analytics, migrations, or RLS.
- Keep all analytics dimensions low-cardinality and privacy-safe.
- Use ASCII in edited docs unless the surrounding file already requires otherwise.

## Debugging And Handoff Contract

- If future visual/export/browser bugs arise, use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- If future route, label, workflow action, Help/Guide, runbook, recovery-path, or support-surface wording changes, run `docs/runbooks/route-label-support-surface-impact-sweep.md` before broad gates.
- If a reusable high-cost bug pattern is found, update `docs/runbooks/high-cost-debug-log.md` or explicitly justify why it is not reusable.

## 10/10 Quality Bar

- Event meaning must be precise enough that support, product, and finance cannot read checkout-cancel or decline counts as revenue, non-buyer totals, provider failures, or entitlement failures.
- Future UI states must include empty, zero-denominator, unknown, stale, capped, schema-missing, failed-read, duplicate, and retry copy before dashboard release.
- Future runtime behavior must avoid sensitive payloads and preserve accessibility for any visible dismiss/cancel UI.
- Future implementation must not add dependencies or widen auth/data access without a dedicated child and tests.

## Help/Guide And Operator Training Contract

- Docs-contract execution: N/A because no shipped workflow, visible label, action, recovery step, or Admin Analytics module changes.
- Future runtime/dashboard child must update Help/Guide or linked runbook and include automated assertions for changed operator-facing copy.

## Security, Privacy, and Compliance

- No secrets, tokens, API keys, raw `.env` values, or provider IDs may be committed.
- Future payloads must exclude raw checkout URLs, Stripe IDs, payment details, finance identifiers, user identifiers, IPs, user agents, raw URLs/referrers/query strings, raw workout text, private workout IDs, support messages, and free text.
- Future protected route changes must fail closed with `401`/`403` negative-path tests.

## Observability and KPI Contract

- This docs-only child adds no events or dashboards.
- This contract defines that workout-context `upsell_declined` remains unmapped until a future runtime child maps an exact checkout-cancel, explicit dismiss, or equivalent bounded signal.
- Future dashboard work must state that decline/cancel counts are selected-range event counts, not unique-user conversion or finance truth.

## Session Continuity And Recovery

- Canonical source of truth: `docs/task-briefs/done/2026-06-12-workout-context-checkout-cancel-decline-measurement-contract-v1-10-10.md`
- Parent: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Checkpoint cadence: update this brief when moved to in-progress, when the architecture contract is created, before PR handoff, and before any pause.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and the parent, then continue from the latest checkpoint.

## Git Rhythm Defaults

- Commit after validated docs-contract work, push, open/update PR, monitor CI, run pre-merge validation, and stop before merge until owner approval.

## Automation Mode

- Automation-first after explicit owner execute/build/implement instruction, with no pause between normal docs/test/git/PR steps unless blocked by sandbox, credentials, CI, or owner product decision.

## Branch Hygiene Defaults

- Future branch: `workout-context-checkout-cancel-decline-contract-v1`.
- After merge approval and merge, sync `main`, prune deleted refs, run post-merge preflight, and perform chat-handoff assessment per repo rules.
- Do not delete branches destructively unless owner explicitly confirms.

## PR Browser Rule

- Future PR handoff should use Safari by default, preferably repo scripts when available.
- Do not open PR/merge links in another browser unless owner asks.

## Manual QA URL Rule

- N/A for docs-only contract execution.
- Future manual QA URL openings should use Safari when UI/runtime work is in scope.

## Implementation Checkpoint Log

- `2026-06-12 | planned | created planned docs-only contract child from clean main@0dbd2090 after PR #1097 and closeout #1098; scope is checkout-cancel / decline measurement semantics only, with no runtime event, dashboard, checkout/Stripe, entitlement, finance, export, vendor, product, or builder change approved | next: wait for explicit owner execute/build/implement instruction or scope edits`
- `2026-06-12 | working tree | owner requested execution; moved child to in-progress on branch workout-context-checkout-cancel-decline-contract-v1 and started docs-only contract work with no runtime event, dashboard, checkout/Stripe, entitlement, finance, export, vendor, product, or builder scope | next: complete architecture/API/parent updates and validate`
- `2026-06-12 | working tree | docs-only contract implemented, route/label/support sweep recorded, npm run lint:briefs:all and npm run verify:pre-pr passed on docs-only lane with 7 changed docs/governance files; no runtime event, dashboard, checkout/Stripe, entitlement, finance, export, vendor, product, or builder scope was added | next: commit, push, open PR, monitor CI, and run verify:pre-merge`
- `2026-06-12 | PR #1099 | work commit 82c55535 pushed; PR CI passed, npm run verify:pre-merge passed on docs-only lane, and PR merge state is clean; no runtime event, dashboard, checkout/Stripe, entitlement, finance, export, vendor, product, or builder scope was added | next: stop for explicit owner merge approval`

## Final Closeout Gate

Before moving this child to `done`:

- Verify every acceptance criterion is complete or explicitly deferred.
- Record route/label/support sweep evidence.
- Record validation evidence.
- Confirm no runtime code, event callsite, dashboard, checkout/Stripe, entitlement, finance, export, vendor, migration, RLS, product, pricing, or builder/generator scope was added.
- Record achieved target scorecard scores and `10/10 claim: yes/no`.

## Completion Record

- `completed`: `2026-06-12`
- `merged_pr`: `#1099`
- `squash_commit`: `05e5f369`
- `result`: Closed Workout Context Checkout-Cancel / Decline Measurement Contract V1 as a docs-only contract. The work defines when future workout-context checkout cancel or explicit decline behavior may be measured, keeps current `upsell_declined` unmapped for workout-context, and prevents support, finance, checkout, entitlement, or Admin Analytics from treating absence, failed checkout, provider failure, or finance state as decline.
- `validation`: route/label/support sweep, `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`, `npm run verify:pre-pr` docs-only lane, PR `#1099` CI, and `npm run verify:pre-merge` all passed before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5`; supporting/N/A categories have explicit scope rationale.

| Category                                      | Achieved Score | Evidence                                                                                                                                 | Gaps / Notes |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR `#1099`, architecture contract, parent checkpoint                                                                                     | None         |
| UX flow clarity                               | `5/5`          | Contract semantics table distinguishes decline, cancel, ignore, abandon, and failed checkout                                             | None         |
| Business logic correctness and data integrity | `5/5`          | Eligible/ineligible signal contract and route/label/support sweep                                                                        | None         |
| Data placement and sync boundaries            | `5/5`          | Analytics/server/browser/checkout/provider/finance boundary contract                                                                     | None         |
| Reliability and failure handling              | `5/5`          | Reliability matrix for duplicate, retry, stale, capped, schema-missing, failed-read, and unknown                                         | None         |
| Security and authz                            | `5/5`          | Docs-only diff; future protected routes require fail-closed negative-path tests                                                          | None         |
| Privacy and compliance                        | `5/5`          | Forbidden payload list excludes sensitive checkout, provider, user, request, workout, and finance data                                   | None         |
| Content governance                            | `5/5`          | API, architecture, registry, parent, and brief updates aligned; `npm run lint:briefs` passed                                             | None         |
| Analytics and KPI observability               | `5/5`          | Contract keeps workout-context `upsell_declined` unmapped until a future bounded signal/mapping child                                    | None         |
| Commerce and revenue ops                      | `5/5`          | Checkout cancel/decline telemetry remains separate from Stripe, entitlement, refunds, recovery, and catalog/pricing                      | None         |
| Incident response and support operations      | `5/5`          | Support interpretation section prevents reading cancel/decline counts as provider/access failures                                        | None         |
| Finance and reporting operations              | `5/5`          | Finance caveat excludes revenue, refund, payout, invoice, accounting export, and Stripe reconciliation                                   | None         |
| Stack-fit and dependency discipline           | `5/5`          | Docs-only diff; no dependency, route, migration, event callsite, vendor, checkout, Stripe, entitlement, or UI change                     | None         |
| Testing and QA automation                     | `5/5`          | `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` passed | None         |
