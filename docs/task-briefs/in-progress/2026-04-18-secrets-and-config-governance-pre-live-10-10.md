# Task Brief: Secrets And Config Governance Pre-Live (10/10)

## Metadata

- `id`: `2026-04-18-secrets-and-config-governance-pre-live-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-05-07`

## Goal

Establish a pre-live 10/10 secrets and configuration governance baseline: every active secret/config family has a canonical owner, storage boundary, rotation cadence, and failure-mode contract, with no ambiguity between local, CI, preview, and production environments.

## Why This Brief Exists

- The repo already has env-parity linting and strong runtime gates, but not yet one canonical secrets/config governance layer.
- Pre-live is the right time to eliminate ambiguity around:
  - where each secret lives,
  - who owns it,
  - how often it rotates,
  - what happens when it leaks, expires, or drifts.
- Dev/test bypass credentials, CI-only secrets, and production secrets must be clearly separated before there are real users and real operational urgency.
- This is security work, but also reliability work: unclear config ownership causes outages just as easily as leaked secrets do.

## Current State Snapshot

- Already in place:
  - env-parity linting in the repo,
  - CI workflows with named secret expectations,
  - local `.env.local` usage,
  - explicit private-gate and admin bypass testing paths.
- Current governance gaps to close:
  - no single repo-native inventory for active secret/config families,
  - no canonical owner/rotation table across local, GitHub, Vercel, Supabase, and future live environments,
  - no dedicated leak/rotation runbook tied to actual secret classes used by this app,
  - no explicit “must now / before live / ongoing” cadence for config hygiene,
  - Admin Messages pre-live smoke found deployed Upstash Redis rate limiting returning `401` and falling back to in-memory limiting; repair the Upstash REST URL/token pair in the relevant control plane before broader public launch or higher-volume intake, without recording secret values in repo evidence.

## Recommended Execution Order

This brief should be implemented as small safe PRs:

1. `Secret and config inventory`
   - enumerate secret/config families,
   - classify by storage boundary, owner, and sensitivity.
2. `Governance and parity hardening`
   - align env naming/documentation,
   - define required vs optional variables,
   - tighten fail-closed behavior where missing/invalid env values are risky.
3. `Rotation and leak-response readiness`
   - add runbook/checklist for rotation,
   - define breach/leak workflow,
   - separate prod vs dev/test/bypass credentials explicitly.

## Active Slice

Current slice: `Secret and config inventory + Upstash repair readiness`.

Scope for this slice:

- create `docs/architecture/secret-config-inventory.md` as the canonical repo-native family register,
- link the inventory from the environment parity runbook, service matrix, and rotation checklist,
- add non-secret Upstash repair evidence rules,
- keep runtime behavior unchanged,
- do not edit Vercel, Upstash, GitHub, Supabase, Stripe, SMTP, mailbox, or local `.env.local` values.

Explicitly deferred to a later/manual control-plane step:

- actual `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` value repair in Vercel,
- live redeploy/smoke that proves Upstash `401` is gone.

## Must Now

- Create the canonical secret/config inventory.
- Define owner, storage location, scope, and rotation cadence for each active secret family.
- Separate local-only, CI-only, preview-only, and production-bound secrets clearly.
- Ensure config failure paths are explicit and fail closed where relevant.

## Before Live

- Rotate any risky or stale bypass/test/admin credentials that are still acceptable only in pre-live development.
- Confirm least-privilege posture for service-role style secrets and any admin bypass/testing credentials.
- Dry-run at least one rotation/recovery flow for a high-risk secret family.
- Close any parity/documentation gap between repo docs and actual environment usage.

## Ongoing Cadence

- On every new secret/config family:
  - add it to the inventory,
  - assign owner/storage/rotation at creation time.
- Monthly:
  - review env parity and stale secret usage.
- Quarterly:
  - review and rotate secret families on their cadence,
  - review owner assignments and access scope.
- Immediately:
  - rotate on suspected leak, owner departure, or scope creep.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                       | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One canonical secrets/config governance model exists, with clear ownership and environment boundaries for all active secret families.                                | inventory doc + governance runbook + brief review   | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: operators and maintainers can determine where a secret belongs and what to do next without ambiguous tribal knowledge.                              | docs review + owner walkthrough                     | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this brief is operational/config governance work and does not ship user-facing visual changes.                                                           | explicit scope rationale                            | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: config-driven invariants remain explicit, and risky env misconfiguration does not silently corrupt behavior.                                        | runtime guard review + negative-path coverage       | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief does not redesign admin editing surfaces; it governs configuration and secret handling.                                                       | explicit scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this brief does not alter user-facing semantics, focus behavior, or accessibility contracts.                                                             | explicit scope rationale                            | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this brief does not target route performance or payload optimization directly.                                                                           | explicit scope rationale                            | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Every active secret/config family is classified by storage boundary (`local`, `CI`, `preview`, `production`, third-party control plane`) with clear source-of-truth. | secret/config inventory + parity docs               | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this brief does not redefine runtime cache freshness; config/cache impacts remain child-slice scope if discovered.                                       | explicit scope rationale                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Sensitive config paths fail closed with explicit missing/invalid env behavior documented for critical routes and jobs.                                               | runtime guard review + negative-path tests + docs   | `5/5`                   |
| Security and authz                            | `target`     | `100%` of active secret families have owner, storage location, sensitivity class, and rotation cadence; prod and bypass/test credentials are explicitly separated.   | inventory table + rotation policy + access review   | `5/5`                   |
| Privacy and compliance                        | `target`     | Secret values never appear in repo files, screenshots, or troubleshooting docs, and leak/rotation handling is documented.                                            | docs review + grep/manual audit + runbook           | `5/5`                   |
| Content governance                            | `target`     | One canonical secret/config register exists and becomes the source of truth for future additions and audits.                                                         | repo doc + governance checklist                     | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because admin CRUD/status workflow design is not the scope; only the underlying config/security governance is.                                                   | explicit scope rationale                            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this brief does not change sitemap, robots, metadata, or crawl visibility behavior.                                                                      | explicit scope rationale                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief does not change public semantic content or crawl-safe output structures.                                                                      | explicit scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief does not add product analytics instrumentation; operational evidence is tracked through inventory and runbooks instead.                       | explicit scope rationale                            | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: any commerce-related secret family must be inventoried and separated correctly, but the brief does not redesign checkout/revenue flows.             | inventory review + config classification            | `4/5`                   |
| Incident response and support operations      | `target`     | Leak/rotation runbooks exist for high-risk secret classes, including ownership, emergency rotation steps, and escalation path.                                       | runbook + tabletop/dry-run evidence                 | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief does not change reconciliation, reporting, entitlements, or finance workflows; it only governs secret/config ownership.                       | explicit scope rationale tied to secret scope       | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief does not introduce locale-specific config models or routing changes that affect future i18n rollout.                                          | explicit scope rationale tied to current scope      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Governance should use existing repo/docs/env-parity patterns first and avoid introducing a new secrets platform unless a hard requirement appears.                   | design review + dependency diff                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Env-parity checks stay green, and any changed failure-mode logic has targeted negative-path coverage and verify evidence.                                            | `lint:env-parity`, unit/e2e negative-path tests, CI | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the governance model should remain usable as environments and secret families grow, without creating brittle manual overhead.                       | inventory structure + cadence review                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Secret rotation/reissue/rollback steps are documented for critical secret families, including how to recover from bad rotation.                                      | runbook + dry-run evidence                          | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical / control-plane-canonical data in scope:
  - secret ownership metadata,
  - environment placement rules,
  - rotation cadence,
  - required vs optional variable contract.
- Local data:
  - no secret values should move into new local storage beyond established local env handling for development.
- Sync policy:
  - docs/inventory must stay in sync with real environment usage whenever a secret family is added, removed, or rotated.
- Retention and sensitivity:
  - secret values themselves must not be stored in repo docs or task briefs.
- Cache/invalidation:
  - not applicable to runtime caching, but env/register docs must be updated immediately when a secret family changes.

## Identity And Rename Contract

- Canonical stable ID:
  - each secret/config family should have one canonical repo-documented name as the source-of-truth reference.
- Human-readable identifiers:
  - environment-specific variable names may differ only where required by platform constraints and must map back to the canonical family entry.
- Mutability rules:
  - secret values rotate,
  - secret family meaning should not be repurposed silently.
- Rename vs repurpose policy:
  - if a secret serves a materially different purpose, create a new canonical family entry rather than reusing an old name.
- Compatibility contract:
  - legacy names, if any, must be documented with migration/removal timing.
- Observability and repair:
  - parity drift and missing required env values must be detectable through linting/docs review.

## Scope

- Secret/config inventory and ownership model.
- Storage-boundary classification across:
  - local development,
  - CI/GitHub Actions,
  - Vercel preview/production,
  - Supabase and other external control planes.
- Rotation cadence and leak-response governance.
- Fail-closed config behavior for sensitive runtime paths where missing/invalid env values are risky.
- Env naming and parity cleanup where current ambiguity exists.

## Out Of Scope

- Full product launch incident design beyond secret/config handling.
- Major vendor/platform replacement for secrets management unless a hard blocker is found.
- Revenue/reporting redesign.
- Broad runtime feature changes unrelated to config and secret governance.
- PR-body/tooling friction automation.

## Acceptance Criteria

1. Every active secret/config family has a canonical entry with:
   - owner,
   - storage boundary,
   - sensitivity,
   - rotation cadence,
   - leak/rotation notes.
2. Dev/test/bypass credentials are explicitly separated from production-bound credentials.
3. Fail-closed behavior is documented for sensitive missing/invalid config paths.
4. One leak/rotation runbook exists for critical secret classes.
5. Env parity/governance checks are green after the implementation slices.

## Validation

- For the brief-only planning diff:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
- For child implementation PRs created from this brief:
  - `npm run lint:env-parity`
  - relevant `npm run lint`
  - `npm run typecheck`
  - targeted unit/e2e negative-path tests for changed failure modes
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the validation machine.
- No secret values should ever be pasted into repo files, task briefs, screenshots, or PR bodies.
- Secret/config validation should happen through repo-native lint/tests plus control-plane review, not by storing values in code artifacts.

## Manual QA Environments

- Child slices should include manual verification for any route/job whose behavior changes under missing/invalid configuration.
- Secret value verification itself should happen in the appropriate control plane, not in shared screenshots or repo docs.
- The planning brief itself has no runtime UI QA requirement.

## Constraints

- No secret values in repo history.
- No governance sprawl into broad ops/platform work that belongs in other briefs.
- Prefer exact ownership and rotation rules over vague “review occasionally” wording.
- Do not accept prod/test credential ambiguity as “good enough before launch.”

## 10/10 Quality Bar

- Every secret family must have an owner.
- Every secret family must have a home.
- Every secret family must have a rotation expectation.
- Every sensitive config failure mode must be understandable and fail closed.
- The governance system must still be usable six months from now, not just complete on paper today.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth
  - one canonical register owns secret/config truth.
- Identity and rename safety
  - canonical family names must not be reused for materially different purposes.
- Taxonomy and category management
  - classify by secret/config family, environment, and sensitivity.
- Workflow and publishing safety
  - rotations and additions must follow one documented path.
- Business logic correctness and data integrity
  - config-driven invariants remain explicit and fail closed.
- RBAC and auditability
  - ownership/access scope is documented for critical secret families.
- UX/UI quality contract
  - `N/A`; no user-facing UI redesign is in scope.
- Admin editor ergonomics
  - `N/A`; this brief does not redesign admin editing UX.
- Performance contract
  - `N/A`; performance is not the primary target here.
- Data placement and sync boundaries
  - local vs CI vs control-plane placement must be explicit.
- Caching and invalidation strategy
  - `N/A`; runtime cache behavior is unchanged unless a child slice explicitly says otherwise.
- Testing contract
  - parity lint and negative-path validation are required when failure-mode behavior changes.
- Observability and KPI tracking
  - operational evidence lives in the inventory/runbooks, not product event schema.
- Incident response and support operations
  - leak/rotation flow must be fast, concrete, and assigned.
- Finance and reporting operations
  - `N/A`; no reporting or reconciliation redesign is in scope.
- i18n operational readiness
  - `N/A`; no locale model changes.
- Stack-fit and dependency discipline
  - use existing repo/config discipline first.
- Scalability and cost efficiency
  - governance should stay sustainable as environments grow.
- Migration and rollback readiness
  - rotations need recovery steps, not just forward steps.
- Definition of done quant targets
  - `100%` of active secret families inventoried and owned.
- Help/Guide and operator training documentation
  - update runbooks/operator docs for any changed rotation or config recovery workflow.

## Checkpoint Log

- `2026-05-07 | PR #637 merge readiness | latest implementation commit b2b6ab1; docs-only PR opened and pushed with CI green, npm run verify:pre-merge PASS, and actual Upstash value repair still deferred to a control-plane step without repo secret evidence | next: owner explicit merge approval for PR #637 or hold for control-plane repair follow-up`
- `2026-05-07 | validation | first slice docs/governance changes are in place; targeted checks passed: npm run lint:briefs:all, npm run lint:quality-gates, npm run lint:env-parity, and final npm run verify:pre-pr via docs-only lane with artifact artifacts/test-runs/latest/verify.log | next: commit, push, open PR, and keep actual Upstash value repair as a later control-plane step`
- `2026-05-07 | in-progress | started first implementation slice from clean main on branch secrets-config-governance-inventory-10-10; scope is docs/governance only: canonical secret/config inventory, env/runbook links, rotation checklist mapping, and non-secret Upstash repair readiness | next: run docs/env/quality gates, commit, push, open PR, and keep actual Upstash value repair as a later control-plane step`
