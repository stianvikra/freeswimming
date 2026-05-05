# Task Brief: Data Access Authz Cache Contract Registry (10/10)

## Metadata

- `id`: `2026-05-05-data-access-authz-cache-contract-registry-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-05`
- `updated`: `2026-05-05`

## Goal

Create a route-level data-access, authz, and cache contract registry so Supabase, RLS, service-role, public optional identity, and protected user-specific paths stay explicit as the API surface grows.

## Why This Brief Exists

The platform architecture audit found:

- `69` route handlers under `app/**/route.ts`,
- `32` Supabase migrations with broad RLS/admin/user ownership policies,
- recent production-egress mitigation that materially improved anonymous/public auth behavior,
- many protected user/admin route handlers that correctly use shared Supabase helpers today but need a durable registry to prevent future drift.

No immediate P0 security issue was found. This is a preventive architecture hardening slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Security and authz`
- `Data placement and sync boundaries`
- `Caching and invalidation strategy`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                          | Evidence                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Every registered route has a clear purpose, owner, and public/protected/admin/service classification.                       | route registry                    | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: expected `401`/`403`/redirect/fallback outcomes should stay understandable to users/operators.             | error contract review             | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this registry does not change UI, layout, or visual assets.                                                     | explicit scope rationale          | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Route contracts identify canonical tables, mutation semantics, stale-write behavior, and repair/rollback expectations.      | registry + negative tests         | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin routes should keep operator-safe denial and recovery behavior.                                       | admin route review                | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this slice changes no rendered semantics or focus behavior.                                                     | explicit scope rationale          | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Public/no-cookie paths avoid unnecessary Supabase calls; protected paths document justified dynamic/no-store behavior.      | request/cache inventory           | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Each protected route names server-canonical data, local-only state if relevant, and conflict/stale-write policy.            | route registry                    | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Each route documents cache mode, freshness, and invalidation trigger or explicit no-store rationale.                        | cache matrix                      | `5/5`                   |
| Reliability and failure handling              | `target`     | Expected auth, validation, missing schema, missing entity, and service failure paths return deterministic statuses.         | negative-path tests               | `5/5`                   |
| Security and authz                            | `target`     | Protected/admin/service-role paths fail closed and have no-cookie/unauthorized/forbidden expectations.                      | security test matrix              | `5/5`                   |
| Privacy and compliance                        | `target`     | Route diagnostics and logs avoid raw tokens, cookies, emails, IPs, and sensitive free text unless explicitly approved.      | log/payload review                | `5/5`                   |
| Content governance                            | `target`     | Registry becomes the canonical source for route owner/auth/cache contract additions.                                        | docs diff + lint/checklist plan   | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin mutation routes keep current workflow contracts; UI changes are out of scope.                        | route review                      | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public route metadata/crawl posture must not be affected by API contract docs.                             | scope review                      | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: private API contracts do not change public AI-discoverable content.                                        | scope review                      | `4/5`                   |
| Analytics and KPI observability               | `target`     | Analytics/event routes document safe payloads and optional identity behavior.                                               | analytics route registry          | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Checkout, portal, webhook, entitlement, and download routes document reconciliation and failure behavior.                   | commerce route registry           | `5/5`                   |
| Incident response and support operations      | `target`     | Critical routes map to support/runbook diagnostics or explicit non-critical rationale.                                      | runbook matrix                    | `5/5`                   |
| Finance and reporting operations              | `target`     | Commerce/entitlement routes preserve reconcilable IDs and reporting evidence expectations.                                  | finance checklist cross-reference | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: route error labels should remain centralized enough for later localization, but no locale routing changes. | explicit i18n scope rationale     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing docs/scripts/tests; add no route-registry dependency unless separately justified.                              | package diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Registry entries name the cheapest required test layer; high-risk route classes get negative-path tests.                    | test matrix + targeted tests      | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Registry prevents accidental production Supabase chatter and duplicate high-cost reads.                                     | egress/cache review               | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Registry changes are docs-first and reversible; any runtime enforcement is split and rollback-safe.                         | PR plan + rollback notes          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - classify route handlers and pages by access pattern.
- TypeScript/domain:
  - prefer typed route helpers and explicit error contracts.
- Supabase:
  - preserve shared helper boundaries in `lib/supabase/*`, RLS expectations, and service-role isolation.
- Testing:
  - map route classes to no-cookie, unauthorized, forbidden, malformed input, missing entity, and failure-mode tests.

## Data Placement And Sync Contract

- Server-canonical:
  - Supabase auth, profiles, entitlements, admin content, notes, progress, workouts, programs, training context, finance/commerce records.
- Local-only:
  - route registry documentation and local UI state descriptions; no new runtime local persistence.
- Sync policy:
  - registry documents existing sync/conflict behavior; runtime changes require child slices.
- Cache/invalidation:
  - every route entry must declare `no-store`, dynamic/private, public cache, or explicit invalidation behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - route registry entries should use stable route paths plus domain entity IDs.
- Human-readable identifiers:
  - route labels may improve, but they must keep a stable mapping to paths and support docs.
- Rename vs repurpose:
  - materially different route behavior requires a new or updated registry entry, not silent repurpose.
- Compatibility:
  - old route references in runbooks/tests should be swept when route semantics change.

## Scope

- Route-level data/auth/cache registry.
- Supabase helper usage inventory.
- Service-role usage inventory.
- Negative-path test gap matrix.
- Runbook/checklist cross-links for high-risk routes.

## Implementation Output

- Canonical registry:
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
- Architecture index link:
  - `docs/architecture.md`
- Runtime behavior:
  - no runtime behavior changed in this slice,
  - no schema, RLS, dependency, UI, label, Help/Guide, or route rename change.
- Runtime enforcement decision:
  - no immediate P0 security, data-integrity, or cache blocker found that requires code changes in this registry PR,
  - future runtime enforcement should be split when a route sweep finds a concrete route drift.

## Help / Guide Impact

N/A because this slice changes architecture documentation only. It does not rename admin/user
workflow labels, actions, Help/Guide surfaces, route params, support recovery paths, or rendered UI.

## Out Of Scope

- Schema/RLS migrations.
- Broad route refactor.
- UI redesign.
- New auth provider.

## Acceptance Criteria

1. A canonical route data/auth/cache registry exists.
2. All high-risk route classes have documented negative-path expectations.
3. Supabase service-role and public optional-identity paths are explicitly classified.
4. Any runtime enforcement found necessary is split into a separate scoped child PR.

## Validation

- `npm run lint:briefs`
- targeted route/helper tests if runtime enforcement is added
- `npm run verify:pre-pr`

## Completion Record

- `merged_pr`: `#608`
- `merge_commit`: `71a533a`
- `completed`: `2026-05-05`
- `validation`: `npm run lint:briefs` PASS, `npm run lint:briefs:all` PASS, `npm run verify:pre-pr` PASS, `npm run verify:pre-merge` PASS, GitHub required checks PASS.
- `10/10 claim`: yes for this docs/contract registry slice. No app-wide runtime enforcement claim is made.

| Category                                      | Achieved Score | Evidence                                                                                                | Remaining Gap                                                       |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Registry classifies all `69` route handlers by purpose, owner, auth class, and support behavior.        | None for registry slice.                                            |
| Business logic correctness and data integrity | `5/5`          | Route rows name canonical data, mutation semantics, stable IDs, and deterministic failure paths.        | Runtime enforcement deferred until a concrete route drift is found. |
| Performance (CWV + payloads)                  | `5/5`          | Public/no-cookie helper rules and cache modes are documented for route changes.                         | None for docs-only slice.                                           |
| Data placement and sync boundaries            | `5/5`          | Registry records server-canonical, local-only, sync, conflict, and cache policy expectations.           | None for registry slice.                                            |
| Caching and invalidation strategy             | `5/5`          | Each route class and route row states `no-store`, `private, no-store`, dynamic, or side-effect posture. | None for registry slice.                                            |
| Reliability and failure handling              | `5/5`          | High-risk negative-path matrix maps auth, validation, missing entity, provider, and schema paths.       | None for registry slice.                                            |
| Security and authz                            | `5/5`          | Protected/admin/service-role/public optional-identity paths are explicitly classified.                  | Runtime enforcement deferred until a concrete route drift is found. |
| Privacy and compliance                        | `5/5`          | Registry and support mapping require redacted diagnostics and safe user-data-rights behavior.           | None for registry slice.                                            |
| Content governance                            | `5/5`          | Architecture index makes the registry the route contract source for future changes.                     | None.                                                               |
| Analytics and KPI observability               | `5/5`          | Analytics route optional-identity and safe payload expectations are registered.                         | None.                                                               |
| Commerce and revenue ops                      | `5/5`          | Checkout, portal, webhook, entitlement, guide PDF, and download resend routes are classified.           | External-service matrix remains the next deeper service follow-up.  |
| Incident response and support operations      | `5/5`          | Registry maps high-risk surfaces to auth, Supabase egress, GDPR, QR, admin, and core-flow runbooks.     | None.                                                               |
| Finance and reporting operations              | `5/5`          | Commerce/entitlement route rows require reconcilable Stripe/customer/session/product IDs.               | None for registry slice.                                            |
| Stack-fit and dependency discipline           | `5/5`          | Implemented with repo-native docs and no new dependency or runtime surface.                             | None.                                                               |
| Testing and QA automation                     | `5/5`          | Registry maps route classes to existing unit/E2E/security evidence and cheapest future test layer.      | None for registry slice.                                            |
| Scalability and cost efficiency               | `5/5`          | Supabase egress and optional-identity helper rules prevent future accidental anonymous auth chatter.    | Runtime enforcement deferred until a concrete route drift is found. |
| DevOps and rollback readiness                 | `5/5`          | Docs-only registry is reversible; runtime enforcement must ship as scoped child slices.                 | None.                                                               |

## Checkpoint Log

- `2026-05-05 | planned | created by platform architecture audit after Supabase egress containment exposed the need for durable route classification across the growing API surface | next: execute before adding new protected API families`
- `2026-05-05 | in-progress | moved to branch data-access-authz-cache-registry-2026-05-05, added canonical 69-route data/auth/cache registry and architecture index link without runtime changes | next: lint docs, run verify:pre-pr, commit, push, open PR`
- `2026-05-05 | in-progress | validation passed: npm run lint:briefs, npm run lint:briefs:all, and npm run verify:pre-pr (docs-only lane) | next: commit, push, open PR, monitor CI, run verify:pre-merge`
- `2026-05-05 | done | PR #608 merged as 71a533a after local verify:pre-pr, local verify:pre-merge, and CI passed; post-merge preflight requested this docs-only closeout | next: commit closeout PR, merge it, sync main, rerun post-merge preflight`
