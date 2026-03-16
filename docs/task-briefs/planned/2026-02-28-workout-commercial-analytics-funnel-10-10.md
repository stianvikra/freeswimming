# Task Brief: Workout Commercial + Analytics Funnel (10/10)

## Metadata

- `id`: `2026-02-28-workout-commercial-analytics-funnel-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-16`

## Goal

Define and implement the workout-builder growth funnel so UX, conversion, and observability support revenue without hurting user trust.

## Scope

- Funnel events:
  - start builder,
  - template used,
  - plan generated,
  - first completion,
  - upsell interaction.
- Placement rules for support/commercial cards.
- CTA policy by lesson stage (avoid over-selling early intro stages).
- Dashboard metrics for product decisions.

## Out Of Scope

- Payment provider architecture changes.
- New billing models.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - funnel event taxonomy, server-side event payload contract, persisted KPI/reporting definitions, and any configurable placement rules.
- Local-only:
  - transient client event buffers, non-sensitive UI experiment state, and temporary attribution params before dispatch.
- Sync behavior:
  - event emission must use stable canonical entity identifiers where available,
  - dashboard/reporting views must read canonical event taxonomy rather than infer business meaning from mutable labels,
  - placement-rule updates must invalidate affected CTA surfaces deterministically.
- Invalidation:
  - any placement or event-schema change invalidates dependent analytics dashboards and configurable CTA reads.

## Identity And Rename Contract

- Canonical stable IDs:
  - workout/template/plan/product references in telemetry must use canonical entity IDs where the entity is persisted.
- Human-readable identifiers:
  - event labels and dashboard copy may be renameable, but must not replace canonical entity references in payloads.
- Mutability rules:
  - taxonomy versioning may evolve, but historical event identity must remain interpretable and not depend on mutable titles/slugs alone.
- Rename vs repurpose:
  - renaming a workout/template/CTA label must not create a new business entity in analytics unless the underlying object actually changed.
- Compatibility contract:
  - taxonomy migrations need explicit alias/version handling so dashboards do not silently split one entity across multiple names.
- Observability and repair:
  - unresolved entity references or deprecated taxonomy versions must be measurable and surfaced in analytics QA/release notes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                               | Evidence                         |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Product goals and IA                          | `target`     | Funnel IA makes builder -> plan -> completion -> upsell stages explicit and measurable without user confusion. | funnel spec + event map          |
| UX flow clarity                               | `target`     | Commercial prompts are contextual, non-disruptive, and never hide the primary workout action.                  | UX QA + e2e                      |
| Visual design quality                         | `supporting` | Supporting only: visual polish of prompts/cards is owned by the builder/planner UI slices.                     | scope rationale                  |
| Business logic correctness and data integrity | `supporting` | Supporting only: analytics must preserve stable entity references and deterministic funnel attribution.        | event contract review            |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin placement/config UX may be touched later but is not primary in this brief.              | scope rationale                  |
| Accessibility (a11y)                          | `supporting` | Supporting only: CTA placements must inherit accessible interaction patterns from host surfaces.               | scope rationale + QA notes       |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: instrumentation and placement logic must avoid obvious payload/perf regressions.              | perf review + scope rationale    |
| Data placement and sync boundaries            | `target`     | Event taxonomy, placement rules, and KPI reads have explicit local/server ownership and refresh behavior.      | data contract + analytics tests  |
| Caching and invalidation strategy             | `supporting` | Supporting only: placement and KPI reads must define deterministic refresh rules after config changes.         | cache notes + scope rationale    |
| Reliability and failure handling              | `supporting` | Supporting only: analytics dispatch/placement failures must fail soft without dead-ending core workout flows.  | failure-state review             |
| Security and authz                            | `supporting` | Supporting only: any server-side placement/config writes must remain protected and fail closed.                | negative-path notes              |
| Privacy and compliance                        | `target`     | Event payloads redact personal/sensitive fields and avoid hidden identifier leakage.                           | tests + review                   |
| Content governance                            | `supporting` | Supporting only: stable naming/identity assumptions must align with canonical workout/entity governance.       | linked brief + scope rationale   |
| Admin workflow and editability                | `supporting` | Supporting only: any later admin CTA/config editing must remain safe and auditable.                            | scope rationale                  |
| SEO and crawlability                          | `supporting` | Supporting only: no direct crawlability contract change unless public landing surfaces are added later.        | scope rationale                  |
| AI discoverability                            | `supporting` | Supporting only: this slice instruments funnels, not public AI-discoverable content.                           | scope rationale                  |
| Analytics and KPI observability               | `target`     | Full builder funnel trackable end-to-end with stable taxonomy and no PII leakage.                              | event tests + dashboard          |
| Commerce and revenue ops                      | `target`     | Measurable conversion points are defined and instrumented without breaking entitlement/checkout attribution.   | KPI review + checkout event QA   |
| Incident response and support operations      | `supporting` | Supporting only: analytics/placement failures need operator-visible diagnostics and support guidance.          | runbook note + scope rationale   |
| Finance and reporting operations              | `supporting` | Supporting only: no direct finance reconciliation mutation, but revenue attribution assumptions must be clear. | scope rationale                  |
| i18n operational readiness                    | `supporting` | Supporting only: event/CTA copy keys should remain locale-extensible later.                                    | naming review + scope rationale  |
| Stack-fit and dependency discipline           | `supporting` | Supporting only: prefer existing first-party analytics patterns over new vendor complexity.                    | architecture review              |
| Testing and QA automation                     | `target`     | Critical funnel events and placement behavior are covered in automated tests before merge.                     | telemetry tests + verify outputs |
| Scalability and cost efficiency               | `supporting` | Supporting only: event volume and dashboard queries must avoid obvious cost blowups.                           | scope rationale + query review   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: placement/instrumentation changes must be easy to disable if KPI noise or regression appears. | release notes + scope rationale  |

## Acceptance Criteria

- Funnel event taxonomy documented and implemented.
- Support/commercial placements can be configured by lesson/program context.
- KPI panel/reporting enables weekly product decision loop.
- Analytics references remain stable even if workout/template/program titles later change.
- Brief is scorecard-complete and identity-safe before implementation starts.

## Validation

- telemetry unit tests
- targeted e2e for event emission on key funnels
- `npm run verify:pre-pr`
