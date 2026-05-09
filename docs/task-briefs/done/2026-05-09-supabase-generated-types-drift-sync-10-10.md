# Task Brief: Supabase Generated Types Drift Sync (10/10)

## Metadata

- `id`: `2026-05-09-supabase-generated-types-drift-sync-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Sync `types/database.ts` with the linked live Supabase schema without applying schema migrations or changing runtime behavior.

## Product Decision

Treat this as a narrow generated-contract maintenance slice. The live project is the intended source for generated Supabase types, and this PR must only update the generated TypeScript contract, compile-time domain boundary adapters required by that generated contract, and non-sensitive brief evidence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                 | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `N/A`        | N/A because no route purpose, page IA, or navigation hierarchy changes.                                                                            | explicit scope rationale                         | `N/A`                   |
| UX flow clarity                               | `N/A`        | N/A because no user or admin workflow, loading, empty, error, or retry state changes.                                                              | explicit scope rationale                         | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no UI, layout, print, export, brand, or screenshot-rendered surface changes.                                                           | explicit scope rationale                         | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Generated types match live Supabase schema and do not introduce app logic, mutation, or data-shape assumptions outside the generated contract.     | generated diff review + typecheck + verify gates | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor controls, labels, publish flow, or workflow ergonomics change.                                                         | explicit scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI semantics, keyboard behavior, labels, contrast, or focus behavior change.                                               | explicit scope rationale                         | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: generated types are compile-time only and must add no runtime bundle, dependency, polling, or route-level CWV regression.         | dependency diff + build gate                     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Supabase remains server-canonical for persisted data; this slice changes only the compile-time schema contract and no local/server sync behavior.  | data placement section + generated diff review   | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache, invalidation, or freshness policy changes; generated types must not alter any route read mode.                          | cache/invalidation scope review                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Type drift is removed without adding runtime failure paths; known Supabase CLI preflight limitations are documented non-destructively.             | CLI evidence + typecheck + verify gates          | `5/5`                   |
| Security and authz                            | `target`     | No RLS, policy, authz, service-role behavior, forbidden/unauthorized handling, or fail-closed boundary changes are made.                           | no migration/runtime diff + security review      | `5/5`                   |
| Privacy and compliance                        | `target`     | No secrets, raw rows, emails, cookies, tokens, or sensitive live data are committed; evidence is limited to project name/ref and command outcomes. | git diff review + non-sensitive evidence         | `5/5`                   |
| Content governance                            | `N/A`        | N/A because no content source, owner, revision, publish, rollback, or editorial model changes.                                                     | explicit scope rationale                         | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because no role-gated admin CRUD, editing path, audit trail, or operator action changes.                                                       | explicit scope rationale                         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route metadata, sitemap, robots, canonical, or crawlability behavior changes.                                                | explicit scope rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or crawl-safe AI-discoverable page changes.                                               | explicit scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics payload, KPI persistence, or dashboard behavior changes.                                                  | explicit scope rationale                         | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, pricing, refund, subscription, or revenue operations behavior changes.                                       | explicit scope rationale                         | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: Supabase CLI drift evidence is recorded for operational traceability, but no support workflow or runbook changes are required.    | brief evidence                                   | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoices, payouts, refunds, entitlements, subscriptions, revenue reporting, or reconciliation data changes.                         | explicit scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translations, copy, metadata, or content model changes.                                                             | explicit scope rationale                         | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use the existing Supabase CLI generated type pattern, no new dependency, and keep the update to `types/database.ts` plus this brief.               | command evidence + dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Generated types compile with the app and required local gates pass before PR handoff.                                                              | `npm run typecheck` + `npm run verify:pre-pr`    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no runtime traffic pattern changes; CLI calls are one-time maintenance and no app cost path is introduced.                        | no runtime diff review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is reversible by reverting the generated type file; Supabase dry-run confirms no remote migrations are pending or applied in this slice.    | Supabase dry-run + rollback note + verify gates  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no route behavior, component UI, server/client boundary, cache, or revalidation change.
  - API/server files may receive compile-time casts at existing validation and RLS boundaries so live generated `string` fields still flow into established domain literal unions.
- TypeScript/domain contracts:
  - `types/database.ts` remains the canonical generated Supabase contract consumed by app code.
  - Generated helper types from the current Supabase CLI are accepted if typecheck and local gates pass.
  - Existing domain constants for goals, admin notes, training notes, and athlete profiles remain the app-level validation/invariant contract where Supabase check constraints are generated as `string`.
- Supabase/data layer:
  - no migration is created or applied.
  - live generated types are refreshed from the linked project `freeswimming-org-prod` / `sazgjhgxvmxcyowovond`.
  - RLS/authz policies are not changed; forbidden and unauthorized runtime behavior remains fail-closed as implemented today.
- External services/tools:
  - use Supabase CLI only; no new SDK, credentials, or dependency.
  - keep evidence non-sensitive.
- UI system:
  - no UI surface is touched; screenshot handoff is not required.
- Testing:
  - run generated diff review, `npm run lint:briefs`, `npm run typecheck`, and broad repo gates.

## Data Placement And Sync Contract

- Server-canonical:
  - live Supabase schema remains canonical for persisted entities.
- Local data:
  - no browser or local app state changes.
- Sync policy:
  - this is compile-time type drift sync only; no runtime sync trigger, conflict policy, retry/backoff, or failure UX changes.
- Retention and sensitivity:
  - no raw rows or sensitive values are read into committed files.
- Cache/invalidation:
  - no cache or invalidation policy changes; route freshness remains current behavior.

## Identity And Rename Contract

N/A because this slice does not create, rename, repurpose, alias, redirect, or migrate any persisted entity or operator-visible identifier.

## Scope

- Refresh `types/database.ts` from linked live Supabase generated types.
- Keep app domain literal-union invariants by adapting generated `string` fields at existing server/domain boundaries.
- Format generated output with repo formatting.
- Record non-sensitive evidence in this brief.
- Run relevant validation and PR gates.

## Out Of Scope

- Supabase schema migrations or remote database writes.
- RLS, auth, route behavior, cache, UI, analytics, commerce, support workflow, or runbook behavior changes.
- Manual edits to generated schema semantics.

## Acceptance Criteria

1. `types/database.ts` is generated from linked live Supabase schema.
2. No migrations are created or applied.
3. No secrets, raw data rows, or `.env` values are committed.
4. TypeScript compilation and required repo gates pass.
5. PR evidence records linked project, dry-run status, generated type diff status, and any CLI caveat.

## Validation

- `npx supabase projects list`
- `npx supabase db push --dry-run --linked`
- `npx supabase gen types typescript --linked --schema public`
- `npm run lint:briefs`
- `npm run typecheck`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Quality Gate Evidence

- Data boundary and migration evidence:
  - Server-canonical data stays in live Supabase. `npx supabase db push --dry-run --linked` is non-mutating and reported `Remote database is up to date`; no migration was applied.
- Cache/invalidation evidence:
  - This generated type sync touches no route cache, invalidation, freshness, or revalidation code.
- Data negative-path or fail-closed evidence:
  - RLS, forbidden, unauthorized, authz, and fail-closed runtime behavior are unchanged because this PR has no migration, policy, route behavior, cache, or authz diff.
- API/server failure-mode evidence:
  - The touched API/server files keep existing unauthorized, not found, schema-not-ready, invalid JSON, and invalid payload negative-path branches; no unexpected 500 path is added.
- Validation/invariant evidence:
  - Existing domain constants and normalizers remain the invariant boundary for generated `string` fields such as goal type/source/status, admin note priority, training note type/status, and athlete age band.
- Privacy/secrets boundary:
  - Evidence may include project name/ref and command result only; no secrets, connection strings, raw rows, request bodies, cookies, tokens, or emails may be committed.
- Tooling validation evidence:
  - `npm run lint:quality-gates` PASS.
  - `npm run lint:briefs:all` PASS for the new in-progress brief.
  - `npm run typecheck` PASS.
  - Targeted Vitest PASS for goals, training-context, admin-notes, and athlete-profile: 8 files / 60 tests.
  - `npm run verify:pre-pr` PASS on the full lane because this PR touches generated types and server/API TypeScript.
- Rollback/devops evidence:
  - Rollback is a plain revert of generated `types/database.ts`; no remote database rollback is needed because this slice does not write to Supabase.
- Performance budget evidence:
  - `npm run verify:pre-pr` reported 4 consecutive weekly green baseline runs with worst margin 20.3%. This slice recommends holding budget files unchanged and recording any tighten decision in a separate governance/performance slice because the active change is compile-time Supabase type drift sync only.

## Closeout

- Merged PR: #663 (`e73b52a`)
- Implementation commit: `d0514d1`
- No runtime schema migration was created or applied.
- No secrets, raw rows, connection strings, request bodies, cookies, tokens, or emails were committed.
- Screenshot evidence: N/A because no UI, print, layout, export, or brand-rendered surface changed.
- Remaining gaps: none for this narrow generated-contract maintenance scope.
- Defer/fix recommendation: none; all target categories are `5/5`.
- Recommended next step: after this docs-only closeout merges, run `npm run post-merge:preflight` again to confirm no pending closeout remains.

### Achieved Target Scores

| Target Category                               | Score | Evidence                                                                                                         |
| --------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------- |
| Business logic correctness and data integrity | `5/5` | Live generated types were refreshed; app literal-union invariants remain enforced at existing domain boundaries. |
| Data placement and sync boundaries            | `5/5` | Server-canonical Supabase contract only; no local/server sync behavior changed.                                  |
| Reliability and failure handling              | `5/5` | No new runtime failure path; CLI caveat documented non-destructively.                                            |
| Security and authz                            | `5/5` | No RLS, authz, service-role, unauthorized, or forbidden behavior changed.                                        |
| Privacy and compliance                        | `5/5` | Evidence is non-sensitive; no secrets or raw live data committed.                                                |
| Stack-fit and dependency discipline           | `5/5` | Existing Supabase CLI generated type pattern used; no dependency changes.                                        |
| Testing and QA automation                     | `5/5` | `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` passed on the PR branch.                             |
| DevOps and rollback readiness                 | `5/5` | Rollback is a plain revert; no remote database rollback needed.                                                  |

10/10 claim: yes. Critical target categories were business/data integrity, data boundaries, reliability, security/authz, privacy, stack-fit, testing, and devops/rollback; each is scored `5/5`.

## Checkpoint Log

- `2026-05-09 | start | branch supabase-generated-types-drift-sync-2026-05-09 from main 3648ac9 | next: refresh generated types, validate, commit, push, and open PR`
- `2026-05-09 | Supabase preflight | linked project confirmed as freeswimming-org-prod / sazgjhgxvmxcyowovond; dry-run reported Remote database is up to date; migration list hit temp-role auth without SUPABASE_DB_PASSWORD and made no changes | next: generate live types and inspect diff`
- `2026-05-09 | typecheck adaptation | live generated types exposed several check-constraint fields as string, so app-level domain aliases and API/server boundary casts were added to preserve existing literal-union invariants without editing generated schema | next: run lint, quality, and pre-PR gates`
- `2026-05-09 | targeted validation | npm run typecheck PASS; npm run lint:quality-gates PASS; npm run lint:briefs:all PASS; targeted Vitest for goals, training-context, admin-notes, and athlete-profile passed 8 files / 60 tests | next: run verify:pre-pr`
- `2026-05-09 | pre-PR gate | npm run verify:pre-pr PASS on full lane: lint, eslint, typecheck, unit, build, perf budgets, e2e, and verify-open passed; perf trend recommends considering one stretch target tighten after 4 weekly green runs | next: commit, push, open PR, monitor CI, and run verify:pre-merge`
- `2026-05-09 | merge | PR #663 merged to main as e73b52a after CI and npm run verify:pre-merge passed | next: docs-only closeout PR`
