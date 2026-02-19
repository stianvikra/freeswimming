# Task Brief: Analytics Persistence And Admin Insights

## Metadata

- `id`: `2026-02-18-analytics-persistence-and-admin-insights`
- `status`: `deferred`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-02-19`

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
