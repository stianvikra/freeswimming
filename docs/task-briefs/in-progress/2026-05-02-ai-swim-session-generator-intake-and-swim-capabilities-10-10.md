# Task Brief: AI Swim Session Generator Intake And Swim Capabilities (10/10)

Make the AI swim session generator intake readable and trustworthy: `Use Swim Profile data` controls saved profile context, `Session setup` handles the one-run ask, `Session Rules` matches the manual builder for pool size/units/strokes/equipment, and durable `Stroke and skill limits` live in My Swim Profile with one-run overrides in the generator.

## Data Boundaries

Server-canonical: `swim_capability_limits` rows owned by authenticated user/RLS. Browser-local: draft settings and one-run Session Rules until generation. One-run payload: selected profile groups, overrides, units, strokes/equipment, and capability limits. Excluded in V1: swimmer identity/name/age and profile focus.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Threshold / Scope Rationale                                                                              | Evidence                      | Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------- | ----- |
| Product goals and IA                          | `target`     | Profile data, one-run ask, rules, and durable limits have separate ownership.                            | Screenshot review + tests     | `5/5` |
| UX flow clarity                               | `target`     | User can scan included/missing/excluded data and understand profile vs session-specific limits.          | Component tests + screenshots | `5/5` |
| Visual design quality                         | `target`     | No dense card wall; spacing, labels, badges, and manual-builder parity are approved.                     | Owner-approved screenshots    | `5/5` |
| Business logic correctness and data integrity | `target`     | Selection, units, limits, and overrides deterministically shape payload; unchecked data is excluded.     | Unit/domain tests             | `5/5` |
| Admin editor ergonomics                       | `N/A`        | N/A: authenticated user generator/profile UI only, no admin authoring workflow.                          | Scope review                  | `N/A` |
| Accessibility (a11y)                          | `target`     | Native controls, labels, focus states, disclosure semantics, and keyboard-safe actions remain intact.    | Testing Library + E2E flow    | `5/5` |
| Performance (CWV + payloads)                  | `target`     | No dependency added and no intentional extra generator fetch waterfall.                                  | Build/perf gate               | `5/5` |
| Data placement and sync boundaries            | `target`     | Durable limits are server-canonical; draft/rule overrides remain local or request-scoped.                | Route/domain tests            | `5/5` |
| Caching and invalidation strategy             | `supporting` | Existing snapshot loading remains the boundary; no route cache redesign in scope.                        | Code review                   | `4/5` |
| Reliability and failure handling              | `target`     | Missing schema/data, invalid limits, offline save, and over-limit duration fail clearly.                 | Negative tests                | `5/5` |
| Security and authz                            | `supporting` | Existing auth boundary is preserved; new capability route fails closed.                                  | Route tests                   | `4/5` |
| Privacy and compliance                        | `target`     | No automatic name/age/focus context; local draft copy is browser-scoped.                                 | Payload/copy tests            | `5/5` |
| Content governance                            | `target`     | Uses current labels: Swim Profile, Session Rules, Pool size, Select strokes/equipment, repeat max.       | Copy assertions               | `5/5` |
| Admin workflow and editability                | `N/A`        | N/A: no admin roles, publish states, or support workflow changed.                                        | Scope review                  | `N/A` |
| SEO and crawlability                          | `N/A`        | N/A: private/authenticated UI, no public metadata or sitemap changes.                                    | Scope review                  | `N/A` |
| AI discoverability                            | `N/A`        | N/A: private generator UI, no public crawlable AI-discovery surface.                                     | Scope review                  | `N/A` |
| Analytics and KPI observability               | `supporting` | Existing safe client events remain; no raw sensitive capability text added.                              | Event review                  | `4/5` |
| Commerce and revenue ops                      | `N/A`        | N/A: no pricing, checkout, entitlement, billing, or revenue reporting change.                            | Scope review                  | `N/A` |
| Incident response and support operations      | `N/A`        | N/A: no alerting, runbook, support queue, or incident workflow change.                                   | Scope rationale               | `N/A` |
| Finance and reporting operations              | `N/A`        | N/A: no finance, payout, invoice, refund, or reporting data change.                                      | Scope rationale               | `N/A` |
| i18n operational readiness                    | `supporting` | Labels are centralized enough for future translation; no locale system in scope.                         | Copy review                   | `4/5` |
| Stack-fit and dependency discipline           | `target`     | Reuses existing Next/React/TS/Tailwind/Supabase patterns; no dependency added.                           | Dependency diff               | `5/5` |
| Testing and QA automation                     | `target`     | Generator/profile unit tests, route tests, E2E flow, screenshots, and full gates cover changed behavior. | Vitest/E2E/gates              | `5/5` |
| Scalability and cost efficiency               | `target`     | Capability model can extend without duplicate route-local cards or extra provider calls.                 | Contract review               | `5/5` |
| DevOps and rollback readiness                 | `target`     | One PR rollback restores UI and route behavior; migration is additive and RLS-contained.                 | PR diff + gates               | `5/5` |
