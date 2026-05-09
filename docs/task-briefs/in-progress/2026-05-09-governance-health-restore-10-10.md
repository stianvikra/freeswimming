# Task Brief: Governance Health Restore (10/10)

## Metadata

- `id`: `2026-05-09-governance-health-restore-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Restore the smallest governance/documentation inconsistencies found by the platform audit before new feature work continues.

## Task Understanding

This is a docs/governance-only maintenance slice. It does not change runtime behavior, scripts,
tests, workflows, Supabase schema, auth, payments, UI, or production settings.

## Existing Pattern Check

- Canonical scorecard: `docs/quality/platform-10-10-scorecard.md`
- Brief lifecycle rules: `docs/task-brief-template.md` and `docs/task-briefs/README.md`
- Branch protection source docs: `docs/branch-protection.md` and `docs/runbooks/branch-protection.md`
- Contributor workflow docs: `README.md`, `CONTRIBUTING.md`, `.github/pull_request_template.md`

## Protected Area Check

This task touches governance and branch-protection documentation only. It does not apply live
GitHub branch-protection settings. The live protection mismatch remains an explicit follow-up
because changing repository settings is outside this docs-only PR.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                  | Evidence Source                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Governance readers can identify the current safe next step without conflicting Node, verify, or branch docs.        | docs diff + brief review          | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no product UI changes; docs should still reduce owner/operator confusion.                          | docs review                       | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes documentation only and no rendered product UI, print, layout, or brand asset.        | explicit scope rationale          | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no runtime logic changes; broken brief closeout metadata should not block future gates.            | `npm run lint:briefs`             | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing workflow, label, Help/Guide surface, or admin UI changes.                              | explicit scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or semantic markup changes.                                                              | explicit scope rationale          | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime bundle, route, CSS, image, or query behavior changes.                                        | explicit scope rationale          | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no app data, local state, server state, cache, or sync contract changes.                                | explicit scope rationale          | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no Next.js cache, response header, revalidation, or Supabase read behavior changes.                     | explicit scope rationale          | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: governance gates should become reliable again by fixing the brief-linter blocker.                  | `npm run lint:briefs`             | `4/5`                   |
| Security and authz                            | `supporting` | Supporting only: branch-protection docs must identify desired review enforcement without applying live settings.    | branch docs review                | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, logs, analytics payloads, secrets, or policy copy changes.                                | explicit scope rationale          | `N/A`                   |
| Content governance                            | `target`     | Changed governance docs and done brief metadata are internally consistent and enforceable by existing lint.         | docs diff + `npm run lint:briefs` | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, recovery action, or Help/Guide content changes.                                      | explicit scope rationale          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, redirect, canonical URL, or indexable content changes.             | explicit scope rationale          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, AI-visible page, or AI workflow changes.                   | explicit scope rationale          | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, KPI persistence, dashboard, or telemetry changes.                          | explicit scope rationale          | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, invoice, refund, payout, subscription, or finance reporting behavior changes. | explicit scope rationale          | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: branch-protection runbook documents audit evidence and remaining live-setting follow-up.           | branch runbook review             | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this docs-only slice does not touch revenue, refunds, entitlements, payouts, or reporting workflows.    | explicit finance scope rationale  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this docs-only governance cleanup does not change locale routing, locale content, or translation model. | explicit i18n scope rationale     | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The fix must reuse existing docs/brief/runbook systems and add no new governance framework or dependency.           | docs diff + dependency diff       | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs-only lane passes through `lint:briefs` and `verify:pre-pr` before PR handoff.                                  | command evidence                  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: smaller governance drift reduces future platform work friction without runtime cost changes.       | audit/brief review                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Branch-protection docs name desired live enforcement, audit command, and safe rollback as docs-only revert.         | branch docs + `verify:pre-pr`     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: N/A; no product code changes.
- TypeScript/domain contracts: N/A; no contracts or generated types changes.
- Supabase/data layer: N/A; no schema, RLS, storage, or runtime validation changes.
- External services/tools: GitHub branch protection is documented only; no live API mutation in this PR.
- UI system: N/A; no screenshot handoff required.
- Testing: use docs-only verification lane through existing scripts.

## Data Placement And Sync Contract

N/A because this task changes documentation only. No local or server-canonical product data,
cache behavior, sync state, retention, or sensitivity boundary changes.

## Identity And Rename Contract

N/A because no persisted or linkable domain entities are created, renamed, deleted, or repurposed.

## Scope

- Fix the done brief metadata shape that currently fails `npm run lint:briefs`.
- Align contributor docs with Node 24/npm 11 and current pre-PR/pre-merge verify cadence.
- Align branch-protection docs/runbook with current required check context names.
- Record the live branch-protection review-count mismatch as an explicit follow-up, not a silent claim.

## Out Of Scope

- Runtime code, scripts, tests, workflows, package changes, Supabase changes, and UI changes.
- Applying live GitHub branch-protection settings.
- Fixing route/SEO bugs, Supabase generated type drift, or storage policy validation.

## Acceptance Criteria

1. `npm run lint:briefs` no longer fails on the Supabase egress done brief closeout metadata.
2. `CONTRIBUTING.md` matches the repo's Node/npm baseline and required verification cadence.
3. Branch-protection docs name the desired review setting and exact current required check contexts.
4. The live branch-protection mismatch is visible as a follow-up instead of hidden by stale docs.
5. The diff remains docs-only.

## Validation

- `npm run lint:briefs`
- `npm run verify:docs-only`
- `npm run verify:pre-pr`

## Approval Needed?

No additional product approval needed for this docs-only slice. Applying live branch-protection
settings later needs repository admin credentials and a separate explicit owner action.

## Checkpoint Log

- `2026-05-09` - Started after owner approved Phase 0 from the platform audit. Scope is docs-only governance health restore before new feature work.
