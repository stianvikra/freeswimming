# Task Brief: Platform Architecture And Stack Practice Audit (10/10)

## Metadata

- `id`: `2026-05-01-platform-architecture-stack-practice-audit-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-01`
- `updated`: `2026-05-01`

## Goal

Audit and harden app-wide architecture practice so React/Next.js, TypeScript, Supabase, external services, UI surfaces, and tests consistently follow the repo's 10/10 stack gates.

## Why This Brief Exists

- The AI swim session generator review exposed a general risk: new surfaces can drift from mature reference surfaces when reuse contracts are implicit.
- A quick 2026-05-01 repo sweep found no immediate app-wide emergency pattern, but did confirm large concentration points such as `WorkoutEditor`, `lib/workouts/shared.ts`, and generator/session contracts.
- The right fix is a deliberate architecture audit and decomposition plan, not an unbounded refactor inside a feature UI PR.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Security and authz`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                              | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Each audited feature area must identify route purpose, domain owner, and reference surface or explicitly document no reference surface exists.                  | architecture inventory + brief updates    | `5/5`                   |
| UX flow clarity                               | `target`     | Shared user workflows must avoid duplicate UI patterns for the same domain object unless a documented exception exists.                                         | route/component audit + screenshots       | `5/5`                   |
| Visual design quality                         | `target`     | Mature surfaces must become reference contracts; sibling surfaces must reuse shared primitives/tokens/view-models or document follow-up work.                   | component diff + screenshot handoff       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Domain invariants, validation boundaries, mutation semantics, and canonical types must be documented for all audited critical domains.                          | invariant audit + targeted tests          | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin/content high-frequency flows must have clear shared patterns for editor state, validation, destructive actions, and recovery.                             | admin surface audit + manual QA           | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Shared component contracts must preserve keyboard/focus/labels/contrast and avoid route-local accessibility drift.                                              | component tests + Playwright spot checks  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Large shared components and client bundles must have route-level risk notes and a decomposition plan when size/coupling threatens performance.                  | bundle/build review + file-size inventory | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Each stateful domain must state server-canonical, local-only, cache, sync, retry, and conflict rules.                                                           | architecture docs + brief updates         | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Changed/audited read paths must define cache mode and invalidation triggers, especially for My Library, admin content, workouts, programs, and profile data.    | route audit + tests where changed         | `5/5`                   |
| Reliability and failure handling              | `target`     | Expected failure modes must fail closed or recover with deterministic UI/API states, not blank surfaces or unexpected `500`s.                                   | negative-path tests + runbook notes       | `5/5`                   |
| Security and authz                            | `target`     | Protected routes, admin flows, service-role usage, RLS assumptions, and owner-scoped data reads/writes must be explicitly reviewed.                             | authz/RLS audit + negative tests          | `5/5`                   |
| Privacy and compliance                        | `target`     | Profile, notes, analytics, exports, AI prompts, and logs must minimize personal data and avoid leaking sensitive free text.                                     | payload/log review                        | `5/5`                   |
| Content governance                            | `target`     | Content, course, guide, admin-note, workout, and program ownership/source-of-truth rules must be documented and reusable.                                       | governance docs + tests                   | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin mutations must have role gates, parse/validate contracts, conflict behavior, and safe destructive-action flows.                                           | admin route/component audit               | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting: audit public route metadata/canonicals only where architecture changes touch public pages.                                                          | public route spot check                   | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting: audit public semantic structure only when public content/model architecture changes.                                                                | public semantic spot check                | `4/5`                   |
| Analytics and KPI observability               | `target`     | Analytics events must have safe payloads, stable taxonomy, and no route-local drift for equivalent actions.                                                     | analytics event inventory                 | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Stripe/entitlement flows must retain official SDK patterns, idempotency/webhook verification, reconciliation notes, and rollback safety.                        | commerce route audit + Stripe tests       | `5/5`                   |
| Incident response and support operations      | `target`     | Critical workflows must have runbook/support diagnostics or explicit non-critical rationale.                                                                    | runbook inventory                         | `5/5`                   |
| Finance and reporting operations              | `target`     | Commerce, entitlement, invoice, refund, and reporting-relevant data must remain reconcilable after architecture changes.                                        | finance/commerce audit                    | `5/5`                   |
| i18n operational readiness                    | `target`     | Shared labels, content models, route metadata, and copy placement must not block later localization.                                                            | i18n readiness review                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Prefer Next.js/React/TypeScript/Supabase/native repo patterns, avoid new dependencies, and document official SDK/docs baselines for external tools.             | dependency diff + architecture checklist  | `5/5`                   |
| Testing and QA automation                     | `target`     | Each refactor recommendation must name the cheapest reliable test layer and avoid duplicating tests across route-local clones.                                  | test plan + targeted coverage             | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Large components, DB queries, CI/browser runs, AI/export payloads, and external-service calls must have cost/performance risk notes and remediation priorities. | cost/risk audit                           | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Architecture changes must be reversible in scoped PRs, with migration/rollback notes where schema, RLS, or external services are affected.                      | PR plan + rollback notes                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - inventory large client components and extract shared view-model/render contracts where duplication or coupling is material.
- TypeScript/domain contracts:
  - centralize canonical types and validators for domains that currently duplicate parsing, display grouping, or mutation rules.
- Supabase:
  - verify migrations, RLS policies, service-role usage, generated types, owner-scoped reads/writes, and negative-path tests.
- External services:
  - audit Stripe, Resend, Garmin/export-related code paths, analytics, and future AI-provider boundaries against official SDK/docs and idempotency/retry requirements.
- UI system:
  - identify mature reference surfaces for workouts, programs, profile, admin content, admin notes, commerce, and auth.
- Testing:
  - map each critical architecture contract to unit, route, e2e, screenshot, or runbook evidence.

## Scope

- App-wide architecture inventory across `app/`, `components/`, `lib/`, `supabase/`, `tests/`, and relevant docs.
- Identify and prioritize large-file/component extraction candidates.
- Identify repeated UI/domain contracts that should become shared adapters/components.
- Review Supabase/RLS/service-role/data-boundary practices at an audit level.
- Review external-service practices at an audit level.
- Produce prioritized child briefs for implementation refactors.

## Out Of Scope

- Shipping every refactor found by the audit in one PR.
- Replacing the design system or core stack.
- Adding new dependencies without a separate implementation brief.
- Schema/RLS changes unless a child brief explicitly owns them.

## Acceptance Criteria

1. Architecture inventory identifies reference surfaces, large concentration points, and duplicated contracts by domain.
2. Critical stack areas have pass/follow-up status: React/Next, TypeScript contracts, Supabase/RLS, external services, UI, testing, DevOps.
3. Any finding that threatens security, data integrity, or release safety is either fixed immediately in a scoped child PR or moved to a blocking/urgent brief.
4. Non-urgent architecture improvements become planned child briefs with scorecard mapping and clear acceptance criteria.
5. The audit explicitly states whether the app is release-safe under the current architecture and where `10/10` still requires refactor work.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- targeted `rg`/inventory evidence recorded in the audit output
- targeted tests only for any implementation changes made by child briefs

## Checkpoint Log

- `2026-05-01 | planned | created from AI swim session V1 architecture review: systemic gates are now documented, and this brief owns the broader app-wide audit/decomposition work rather than expanding the UI slice into an unsafe full-app refactor | next: execute as a separate architecture audit after the AI V1 screenshot-gated slice is stable`
