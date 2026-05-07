# Task Brief: Pre-Live Ops Readiness (10/10)

## Metadata

- `id`: `2026-04-18-pre-live-ops-readiness-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-05-07`

## Goal

Establish a lean but real 10/10 pre-live operations baseline so the app can launch with clear release gates, rollback paths, backup/restore expectations, and incident/support readiness instead of “we should figure that out when something breaks.”

## Why This Brief Exists

- The repo already has strong CI, branch protection, nightly E2E, and several runbooks.
- What is still missing is one canonical pre-live operational layer that answers:
  - what has to be green before launch,
  - what gets backed up and how recovery works,
  - how rollback is executed,
  - who checks what during release,
  - what support/incident diagnostics exist if something goes wrong.
- This should be defined before real users arrive so launch operations do not depend on improvised decisions.

## Current State Snapshot

- Already in place:
  - `verify:pre-pr` and `verify:pre-merge`,
  - CodeQL,
  - nightly E2E and performance jobs,
  - branch protection docs,
  - private gate and admin runbooks.
- Control-plane checkpoint on `2026-05-07`:
  - `rate_limit_store` is configured for both Vercel Preview and Production.
  - Preview and Production `/api/contact` bounded probes returned deterministic validation errors with rate-limit headers, no app `500`, and no Upstash `401` error log after redeploy.
  - The current Upstash free tier permits one Redis database, so Preview and Production temporarily share the same Redis store.
- Current ops gaps to close:
  - no single canonical pre-live release checklist,
  - no one brief that defines backup/restore scope and proof expectations,
  - no unified owner matrix for launch-critical operational checks,
  - no one operational dry-run that proves the launch path works end to end,
  - rate-limit store isolation remains a growth-readiness decision: shared free-tier Redis is acceptable pre-live/low traffic only, but must be revisited before external customer growth or public launch campaigns.

## Recommended Execution Order

Implement this brief as a sequence of small operational slices:

1. `Release gate and owner matrix`
   - canonical go/no-go checklist,
   - route/job ownership,
   - launch-critical smoke routes.
2. `Backup and restore readiness`
   - define server-canonical data families,
   - define recovery path and proof expectations,
   - define what is intentionally excluded from restore scope.
3. `Rollback and support diagnostics`
   - deploy rollback path,
   - support/incident diagnostics,
   - escalation path.
4. `Pre-live dry run`
   - execute the checklist,
   - record gaps,
   - close blockers before launch.

This brief should normally start after the maintenance baseline and secrets/config governance work are in motion or complete.

## Must Now

- Define the canonical pre-live checklist and go/no-go gates.
- Define launch-critical owner responsibilities.
- Define backup/restore scope and rollback expectations.
- Define what support/incident evidence should be available during launch.

## Before Live

- Run at least one dry-run using the checklist.
- Prove one backup/restore or equivalent recovery path for server-canonical data.
- Confirm alerting/monitoring/support diagnostics for launch-critical routes/jobs.
- Close any blocker found by the dry run before first public launch.
- Confirm the `rate_limit_store` launch posture:
  - keep shared Preview/Production Upstash only while traffic is low and test windows are controlled,
  - either add an environment prefix to Redis rate-limit keys or move Production to an isolated Upstash database before broad external customer intake,
  - record the decision in the launch checklist with non-sensitive evidence only.

## Ongoing Cadence

- Before every significant release:
  - run the current release checklist.
- Monthly:
  - review runbooks and operational owners.
  - review whether the shared free-tier `rate_limit_store` remains acceptable for current traffic and support risk.
- Quarterly:
  - rehearse restore/rollback on a suitable safe environment,
  - update owner matrix and escalation paths.
- Immediately before a public campaign, larger test cohort, or first external customer growth push:
  - re-evaluate Upstash usage, rate-limit false positives, and whether Production needs isolated Redis or environment-prefixed keys.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Reliability and failure handling`
- `Incident response and support operations`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                       | Evidence                                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One canonical pre-live operating model exists with owner matrix, launch-critical routes/jobs, and explicit go/no-go checks.                                          | release checklist + runbook + owner matrix           | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: operators can tell what to check, in what order, and how to escalate without ambiguity during release work.                                         | checklist walkthrough + dry-run notes                | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this brief targets operational readiness rather than user-facing visual design.                                                                          | explicit scope rationale                             | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: ops readiness must respect product invariants and define what data truth must survive rollback/restore.                                             | restore/rollback docs + scope review                 | `4/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin/support operators should have the diagnostics and recovery context needed for critical launch issues.                                         | support diagnostics doc + manual QA                  | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this brief does not directly redesign user-facing flows or accessibility semantics.                                                                      | explicit scope rationale                             | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: launch-critical routes should continue to use existing performance budget signals as part of pre-live checks.                                       | checklist + nightly perf evidence                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Backup/restore scope explicitly identifies server-canonical data, local-only state, and what is intentionally excluded from recovery.                                | backup/restore doc + checklist                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Rollback/recovery docs specify cache invalidation or freshness actions required after deploy, restore, or emergency fixes.                                           | rollback/runbook docs + dry-run notes                | `5/5`                   |
| Reliability and failure handling              | `target`     | No launch-critical route/job is left without a defined failure path, smoke check, and owner.                                                                         | release checklist + dry-run evidence                 | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: operational diagnostics and recovery paths must preserve least privilege and fail-closed access boundaries.                                         | runbook review + access-path review                  | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: support and incident diagnostics must avoid leaking sensitive data into runbooks, logs, or screenshots.                                             | doc review + incident template review                | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: operational runbooks should have one canonical source of truth and owner.                                                                           | runbook review + owner matrix                        | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: operational docs should reflect current admin/support workflow labels and recovery actions.                                                         | runbook review + admin QA                            | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: launch checks should confirm intended public/private crawl posture and sitemap behavior for first release.                                          | checklist + route QA                                 | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: launch checks should confirm intended public semantic/canonical posture on launch-critical public routes.                                           | checklist + public-route QA                          | `4/5`                   |
| Analytics and KPI observability               | `target`     | Launch-critical routes/jobs have defined operational evidence sources (checks, logs, alerts, dashboards, artifacts, or equivalent).                                  | checklist + observability matrix                     | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this pre-live ops brief assumes a non-commerce-first launch baseline; commerce launch readiness should be a separate explicit scope if payments go live. | explicit scope rationale tied to launch phase        | `N/A`                   |
| Incident response and support operations      | `target`     | One canonical incident/support path exists with owner, escalation order, diagnostics, and first-response actions for launch-critical failures.                       | incident/support runbook + dry-run evidence          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief does not introduce live finance/reporting workflows; if launch scope expands to revenue operations, that needs a dedicated brief.             | explicit scope rationale tied to non-finance launch  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief does not change locale routing or multilingual content operations; it should not invent i18n scope where none exists yet.                     | explicit scope rationale tied to current scope       | `N/A`                   |
| Stack-fit and dependency discipline           | `supporting` | Supporting only: pre-live ops should use existing GitHub/Vercel/Supabase stack capabilities before adding external ops tooling.                                      | solution review + dependency diff                    | `4/5`                   |
| Testing and QA automation                     | `target`     | The launch checklist is backed by concrete automation where possible, and the dry run proves that required checks and smoke paths can be executed repeatably.        | dry-run log + verify evidence + smoke artifacts      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: launch ops should be lean and sustainable, without premature enterprise tooling or alert noise.                                                     | checklist design review + tool choice rationale      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Deploy rollback path, recovery ownership, and post-rollback validation are defined and dry-run-ready before first launch.                                            | rollback runbook + release checklist + dry-run notes | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical data in scope:
  - auth/identity truth,
  - entitlements,
  - admin content/notes and publish state,
  - any launch-critical operational state stored in backend systems.
- Local data:
  - non-sensitive preferences and ephemeral UI state are not backup-critical unless separately declared.
- Sync policy:
  - pre-live ops docs must state which canonical data stores require backup/recovery proof and which do not.
- Retention and sensitivity:
  - support/incident artifacts must avoid leaking secret values or sensitive user data.
- Cache/invalidation:
  - rollback/recovery docs must define any required cache refresh, invalidation, or redeploy step after recovery.

## Identity And Rename Contract

- Canonical stable ID:
  - launch-critical routes, jobs, and operational runbooks should use stable names in the checklist and support docs.
- Human-readable identifiers:
  - release checklist labels may be edited for clarity, but they must still map back to the same canonical route/job names.
- Mutability rules:
  - runbook titles may evolve; operational target names should not drift casually if they are referenced in release flows.
- Rename vs repurpose policy:
  - if a launch-critical check changes meaning materially, create a new checklist item rather than silently repurposing an old one.
- Compatibility contract:
  - old operational labels should be updated everywhere together in the same PR.
- Observability and repair:
  - stale checklist references should be caught during dry runs and brief/runbook review.

## Scope

- Canonical pre-live release checklist.
- Owner matrix for launch-critical routes/jobs.
- Backup/restore scope and proof expectations.
- Rollback path and post-rollback validation.
- Support/incident diagnostics and escalation path.
- One dry-run protocol to prove the operating model before launch.
- Rate-limit store launch/growth posture for the current Upstash free-tier constraint.

## Out Of Scope

- Enterprise-grade 24/7 on-call design.
- Broad platform re-architecture.
- Dedicated commerce/finance launch operations unless payments are explicitly added to launch scope.
- General dependency hygiene or PR/governance tooling changes.
- Secret inventory/rotation work beyond the operational dependency on that brief.

## Acceptance Criteria

1. One canonical pre-live checklist exists with explicit go/no-go gates.
2. Launch-critical routes/jobs each have an owner and smoke path.
3. Backup/restore scope is documented with clear inclusions/exclusions.
4. Rollback procedure and post-rollback validation exist for launch-critical deploys.
5. At least one dry run is executed and any blockers are recorded before launch.
6. Shared Preview/Production `rate_limit_store` usage is either explicitly accepted for the current low-traffic phase or replaced by environment-prefixed keys / isolated Production Redis before customer growth.

## Validation

- For the brief-only planning diff:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
- For child implementation PRs created from this brief:
  - relevant docs/runbook linting and brief linting
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`
  - targeted smoke checks or scripted drills introduced by the implementation slices

## Local Tooling Prerequisite

- Node.js LTS and npm for repo validation.
- Access to the relevant operational control planes when dry runs are executed.
- Do not store operational secrets or live access details in repo briefs/runbooks.

## Manual QA Environments

- Local:
  - use for smoke-route confirmation and release checklist rehearsal.
- Vercel preview:
  - use for production-like route validation where relevant.
- Control planes:
  - use only for the specific backup/restore/alerting/owner checks in scope.

## Constraints

- Keep the first ops baseline lean.
- Do not invent enterprise-heavy process where a lightweight explicit checklist is sufficient.
- Do not leave launch-critical checks ownerless.
- Keep this brief dependent on, but not duplicative of, the maintenance and secret-governance briefs.
- Do not store Upstash URL/token values, request IPs, cookies, auth headers, or raw provider responses in repo docs, screenshots, PRs, or chat.

## 10/10 Quality Bar

- Launch should have a checklist, not a vibe.
- Recovery should have a path, not a guess.
- Rollback should be explicit before the first bad deploy, not after.
- Support and incident work should know what evidence to look at first.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth
  - one canonical pre-live operations set of runbooks/checklists owns the truth.
- Identity and rename safety
  - launch-critical checks should keep stable names or be renamed atomically everywhere.
- Taxonomy and category management
  - split release, rollback, restore, and support concerns clearly.
- Workflow and publishing safety
  - launch should have explicit go/no-go gates and rollback criteria.
- Business logic correctness and data integrity
  - recovery scope must preserve canonical backend truth.
- RBAC and auditability
  - incident/support access paths must remain least-privilege and reviewable.
- UX/UI quality contract
  - internal operational flow should be obvious and dead-end free.
- Admin editor ergonomics
  - support/admin operators need clear diagnostics, not archaeology.
- Performance contract
  - launch checklist should include performance signals already defined by the platform.
- Data placement and sync boundaries
  - backup/recovery scope must be explicit.
- Caching and invalidation strategy
  - restore/rollback needs deterministic freshness steps.
- Testing contract
  - dry run and smoke paths must be repeatable.
- Observability and KPI tracking
  - launch-critical evidence sources must be named and reachable.
- Incident response and support operations
  - first-response actions and escalation path must be explicit.
- Finance and reporting operations
  - `N/A`; out of launch scope unless commerce launch is explicitly added.
- i18n operational readiness
  - `N/A`; no locale ops scope in this brief.
- Stack-fit and dependency discipline
  - use existing stack capabilities first.
- Scalability and cost efficiency
  - start lean, avoid noisy over-tooling.
- Migration and rollback readiness
  - rollback and post-rollback validation are first-class scope.
- Definition of done quant targets
  - one dry run completed, one canonical checklist and rollback path documented.
- Help/Guide and operator training documentation
  - update ops/support runbooks and any operator-facing release docs in the same PRs that change operational flow.

## Checkpoint Log

- 2026-05-07 | rate-limit-store-repair | Owner configured `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for both Vercel Preview and Production using the same Upstash free-tier Redis database; Preview deployment `dpl_9TNH868djacsEysKjLaTmmXuRFBi` and Production deployment `dpl_CExFVpRshcGF98D3T7GAiBVbhFVg` both returned deterministic `/api/contact` validation responses with rate-limit headers, no app `500`, and no Upstash `401` error logs after redeploy | next: keep shared Redis accepted only for pre-live/low traffic, then add environment-prefixed keys or isolated Production Redis before broader external customer growth
