# Task Brief: Analytics Persistence And Admin Insights

## Metadata

- `id`: `2026-02-18-analytics-persistence-and-admin-insights`
- `status`: `deferred`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-06-09`

## Child Slices

- Done child: `docs/task-briefs/done/2026-06-09-privacy-safe-analytics-persistence-admin-insights-v1-10-10.md`
- Done child: `docs/task-briefs/done/2026-06-09-admin-analytics-dashboard-read-only-v1-10-10.md`
- Done child: `docs/task-briefs/done/2026-06-09-analytics-retention-and-rollup-lifecycle-v1-10-10.md`
- Completed V1 scope: additive `analytics_events` persistence, fail-soft event writes, and admin-only JSON insights.
- Completed read-only dashboard scope: visible admin dashboard over the existing insights contract, without new persistence, vendors, cookies, visitor IDs, CSV export, rollups, retention cleanup, or finance-grade reporting.
- Completed lifecycle scope: additive daily rollups, service-role-only rollup refresh/prune functions, lifecycle diagnostics, docs, and tests without automatic scheduled deletion.
- Still deferred here: CSV export, scheduled retention automation, broader product/auth/library reliability modules, and finance-grade reporting.

## Goal

Analytics should be durable, queryable, and visible in an internal dashboard so product, UX, and sales decisions are data-driven.

## Scope

- Persist analytics events in Supabase (not console-only):
  - add `analytics_events` table with indexed dimensions,
  - keep payload sanitization rules,
  - add retention strategy and archival policy.
- Extend event ingestion pipeline:
  - keep `POST /api/analytics/event` contract,
  - persist both client and server events,
  - maintain non-blocking behavior for user actions.
- Add admin analytics dashboard (`/admin/analytics`) with v1 modules:
  - product funnel: plans viewed -> checkout started -> checkout completed -> entitlement granted,
  - library behavior: tab switches, resume usage, download actions,
  - auth reliability: send/verify failure rates and cooldown hits,
  - revenue proxy from Stripe-linked events and entitlement grants.
- Add filtering:
  - date range,
  - surface/source,
  - product id,
  - signed-in vs signed-out channel.
- Add export:
  - CSV export for selected date range and filtered view.
- Add quality checks:
  - schema + ingestion tests,
  - dashboard aggregation tests,
  - e2e smoke for admin analytics views.
- Add docs:
  - event taxonomy,
  - KPI definitions,
  - metric caveats and interpretation rules.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                               | Evidence                               |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Product goals and IA                          | `target`     | Internal analytics surface groups funnel, reliability, library, and revenue-proxy signals into one clear view. | scope + goal                           |
| UX flow clarity                               | `target`     | Admin can filter, inspect, and export metrics without ambiguous terminology or hidden dashboard states.        | acceptance criteria + manual QA        |
| Visual design quality                         | `supporting` | Dashboard tables/charts remain readable and utilitarian rather than visually noisy.                            | quality bar                            |
| Business logic correctness and data integrity | `target`     | Event ingestion, redaction, persistence, and aggregation remain deterministic and queryable.                   | acceptance criteria + validation       |
| Admin editor ergonomics                       | `target`     | Admin can answer core product, UX, and reliability questions without dropping to raw SQL/log inspection.       | scope + manual QA                      |
| Accessibility (a11y)                          | `supporting` | Filters, tables, and chart-adjacent controls remain keyboard/screen-reader usable.                             | quality bar                            |
| Performance (CWV + payloads)                  | `target`     | Ingestion stays non-blocking and dashboard freshness remains within the defined update window.                 | constraints + acceptance criteria      |
| Data placement and sync boundaries            | `target`     | Raw analytics events remain server-canonical while filters and dashboard view state remain local-only.         | scope + observability contract         |
| Caching and invalidation strategy             | `target`     | Dashboard freshness and export behavior avoid stale or misleading metric views.                                | acceptance criteria + constraints      |
| Reliability and failure handling              | `target`     | Event loss, rejected payloads, and dashboard query failures remain observable and recoverable.                 | acceptance criteria + observability    |
| Security and authz                            | `target`     | Raw analytics data and admin dashboard access remain admin-only and fail closed.                               | security contract                      |
| Privacy and compliance                        | `target`     | Sensitive fields are redacted before persistence and retention remains GDPR-aligned.                           | security contract + scope              |
| Content governance                            | `target`     | Event taxonomy, KPI definitions, and metric caveats are documented as the source of truth.                     | scope                                  |
| Admin workflow and editability                | `target`     | Admin dashboard and CSV export are usable as an operational analytics workflow rather than a prototype view.   | scope + manual QA                      |
| SEO and crawlability                          | `N/A`        | N/A                                                                                                            | N/A                                    |
| AI discoverability                            | `N/A`        | N/A                                                                                                            | N/A                                    |
| Analytics and KPI observability               | `target`     | Durable metrics exist for funnel, library behavior, auth reliability, and revenue-proxy tracking.              | observability and KPI contract         |
| Commerce and revenue ops                      | `supporting` | Revenue-proxy and entitlement-linked analytics remain visible without turning this slice into billing logic.   | scope                                  |
| Incident response and support operations      | `target`     | Ingestion health, export failures, and dashboard anomalies are diagnosable through explicit logs/metrics.      | observability contract                 |
| Finance and reporting operations              | `supporting` | CSV export and revenue-proxy reporting support internal reporting needs without replacing accounting systems.  | scope + acceptance criteria            |
| i18n operational readiness                    | `N/A`        | N/A because this is an internal analytics/admin brief and should not block future localization architecture.   | explicit scope rationale               |
| Stack-fit and dependency discipline           | `target`     | Persistence and dashboard work stay within the current Next.js/Supabase stack without vendor migration.        | constraints + out-of-scope             |
| Testing and QA automation                     | `target`     | Schema, ingestion, dashboard aggregation, and admin analytics smoke coverage are required.                     | validation                             |
| Scalability and cost efficiency               | `target`     | Indexed storage, retention rules, and non-blocking ingestion keep query and storage growth bounded.            | scope + constraints                    |
| DevOps and rollback readiness                 | `target`     | Retention, observability, and deferred rollout remain explicit enough to ship in controlled slices later.      | git rhythm + completion record section |

## Out Of Scope

- No third-party analytics vendor migration in this phase.
- No ad-tracker integration (Meta Pixel, etc.) in this phase.
- No full BI warehouse project.

## Acceptance Criteria

- Events sent to `/api/analytics/event` are persisted and queryable.
- Sensitive fields are redacted before persistence.
- Admin can view daily/weekly trends for core funnel and reliability metrics.
- Dashboard data updates within defined freshness window.
- CSV export works for chosen filters and date range.
- Event loss/error is observable and alertable.
- Unit + integration + e2e analytics tests are green.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`,
  - `http://127.0.0.1:3000/plans`,
  - `http://127.0.0.1:3000/admin/analytics`.
  - Safari and Chrome desktop for event + dashboard checks.
- Vercel preview:
  - verify event ingestion from preview UI and dashboard visibility.
- Production:
  - verify one controlled event flow end-to-end and compare counts.

## Constraints

- Keep ingestion overhead minimal and non-blocking.
- Keep storage costs predictable with retention rules.
- Preserve existing analytics event contract compatibility.
- Avoid collecting unnecessary personal data.

## 10/10 Quality Bar (Required For User-Facing Work)

- Dashboard answers core questions in one screen:
  - what users do,
  - where they drop,
  - what fails,
  - what sells.
- Required states exist: `loading`, `empty`, `error`, `offline`, `retry`.
- Metric labels are unambiguous with tooltip definitions.
- Filters are fast and deterministic.
- Export is obvious and reliable.
- Accessible tables/charts with keyboard and screen-reader support.

## Security, Privacy, And Compliance (Required For Auth/Data/Payments)

- Enforce redaction before write (`email`, `token`, `secret`, etc).
- Restrict analytics dashboard and raw event access to admin roles only.
- Keep GDPR-aligned data minimization and retention controls.
- Prevent unauthorized raw payload access by RLS and API auth checks.
- Audit dashboard access and export actions.

## Observability And KPI Contract

- Ingestion health metrics:
  - accepted events per minute,
  - rejected events count and reason,
  - write latency p50/p95,
  - write error rate.
- Product KPI baseline:
  - checkout completion rate,
  - entitlement grant latency,
  - library resume engagement,
  - auth send/verify failure rate.
- Reliability target:
  - ingestion success >= 99.9% over rolling 7 days.

## Session Continuity And Recovery (Required)

- Canonical source: git branch + this brief file.
- Checkpoint cadence: commit every milestone or every 60-90 minutes.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from next milestone.

## Git Rhythm Defaults (Required)

- Commit + push per validated slice:
  - schema/indexes,
  - ingestion persistence,
  - dashboard aggregations,
  - dashboard UI,
  - export and tests.
- Ask owner before PR open/refresh and merge handoff.

## Branch Hygiene Defaults (Required)

- Post-merge:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git fetch --prune`

## PR Browser Rule (Required)

- Open PR links in Safari by default:
  - `open -a Safari "<PR_URL>"`

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary
