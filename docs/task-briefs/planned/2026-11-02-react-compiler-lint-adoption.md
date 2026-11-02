# Task Brief: React Compiler Lint Adoption

## Metadata

- `id`: `2026-11-02-react-compiler-lint-adoption`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-11-02`
- `updated`: `2026-11-02`
- `parent`: `docs/task-briefs/in-progress/2026-11-02-security-and-ci-maintenance.md`

## Brief Audit Record

- `last_audited`: `2026-11-02`
- `base`: `main@18fca537` plus the security maintenance branch's Next 16.4.3 lint preset.
- `audit_status`: `revise-before-use`
- `decision`: Record the architectural destination; select and re-audit one bounded component family before execution.
- `reason`: Next's Hooks preset now surfaces 124 existing errors across immutability, manual memoization, purity, refs and effect state updates. Rewriting multiple product surfaces would exceed a dependency security patch.
- `must_refresh_before_execution_if`: Component contracts, selected family, Next/React lint rules, reference surfaces, or owner priorities change.

## Pre-Implementation Owner Explanation

En senere oppgave skal rydde opp i hvordan komponentene håndterer tilstand, effekter og referanser, slik at de nye React-kontrollene kan slås fullt på. Det gjør framtidige React-oppdateringer tryggere. Den planlagte oppgaven starter først etter at én avgrenset komponentfamilie er valgt; redesign og nye funksjoner er utenfor.

## Goal And Architectural Target

Remove the five documented temporary compiler-rule exceptions through bounded component refactors, preserving existing product behavior, rather than suppressing findings at individual call sites. Do not enable the React Compiler runtime merely to satisfy lint.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`. No 10/10 claim is made by this planned intake.
Critical targets are Business logic correctness and data integrity, Stack-fit and dependency discipline, Testing and QA automation, and DevOps and rollback readiness. Targets require at least 4/5 for release.

| Category                                      | Mapping    | Target threshold                                                                                                                                                  | Evidence                                                            | Expected closeout score |
| --------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | supporting | Preserve the selected family's user jobs and routes.                                                                                                              | Refreshed slice scope.                                              | 4/5                     |
| UX flow clarity                               | supporting | Preserve loading, save, discard, selection and retry behavior.                                                                                                    | Selected-family tests.                                              | 4/5                     |
| Visual design quality                         | supporting | No intentional redesign; capture changed rendering files under the screenshot review rule.                                                                        | Approved screenshots when applicable.                               | 4/5                     |
| Business logic correctness and data integrity | target     | Zero duplicate writes or changed timer/save/reset transitions in the selected family; all existing child-level contracts pass.                                    | Before/after invariant tests and full gates.                        | 5/5                     |
| Admin editor ergonomics                       | supporting | Preserve current editor interactions if an admin family is selected.                                                                                              | Relevant editor tests.                                              | 4/5                     |
| Accessibility (a11y)                          | supporting | Existing role, focus and keyboard assertions preserved.                                                                                                           | Selected UI tests.                                                  | 4/5                     |
| Performance (CWV + payloads)                  | target     | Public core routes retain LCP <=2500 ms, CLS <=0.1, TBT <=200 ms, JS <=380 KB and CSS <=150 KB; no extra render/write loops.                                      | Production budget gate and targeted effect tests.                   | 5/5                     |
| Data placement and sync boundaries            | supporting | Existing local drafts and server-canonical entities retain ownership.                                                                                             | Refreshed family-specific contract.                                 | 4/5                     |
| Caching and invalidation strategy             | N/A        | No cache or revalidation policy migration is planned.                                                                                                             | Scope boundary.                                                     | N/A                     |
| Reliability and failure handling              | supporting | Existing failures and recovery remain deterministic.                                                                                                              | Negative-path tests.                                                | 4/5                     |
| Security and authz                            | supporting | Retain existing protected route and provider boundaries.                                                                                                          | Existing negative gates.                                            | 4/5                     |
| Privacy and compliance                        | N/A        | No new processor, telemetry, retention or data disclosure.                                                                                                        | Scope boundary.                                                     | N/A                     |
| Content governance                            | supporting | Record each removed exception and its selected family evidence.                                                                                                   | Brief/PR log.                                                       | 4/5                     |
| Admin workflow and editability                | supporting | No admin workflow change when addressing state/effect structure.                                                                                                  | Relevant tests.                                                     | 4/5                     |
| SEO and crawlability                          | N/A        | No route, metadata or indexing policy change.                                                                                                                     | Scope boundary.                                                     | N/A                     |
| AI discoverability                            | N/A        | No public semantic/content model change.                                                                                                                          | Scope boundary.                                                     | N/A                     |
| Analytics and KPI observability               | N/A        | No analytics taxonomy or payload change.                                                                                                                          | Scope boundary.                                                     | N/A                     |
| Commerce and revenue ops                      | N/A        | No payment or entitlement change.                                                                                                                                 | Scope boundary.                                                     | N/A                     |
| Incident response and support operations      | N/A        | This refactor adds no support action, incident process or provider behavior; refresh the mapping if a selected slice does.                                        | Explicit support scope rationale.                                   | N/A                     |
| Finance and reporting operations              | N/A        | No financial record, invoice, refund or reporting workflow is involved.                                                                                           | Explicit finance scope rationale.                                   | N/A                     |
| i18n operational readiness                    | N/A        | No locale, copy or translation contract changes are planned.                                                                                                      | Explicit i18n scope rationale.                                      | N/A                     |
| Stack-fit and dependency discipline           | target     | Remove the selected compiler-rule exception with zero new disable comments or broad runtime memoization workarounds; preserve Rules of Hooks and exhaustive-deps. | ESLint and lint-baseline fixture.                                   | 5/5                     |
| Testing and QA automation                     | target     | Relevant child-level invariants and full pre-PR/pre-merge/CI pass without new skips.                                                                              | Targeted tests, full gates and screenshot approval when applicable. | 5/5                     |
| Scalability and cost efficiency               | supporting | No duplicate requests or extra background/timer work.                                                                                                             | Request-count/effect tests.                                         | 4/5                     |
| DevOps and rollback readiness                 | target     | Each bounded PR has green required checks and a one-commit revert path; no schema migration.                                                                      | PR/gate evidence.                                                   | 5/5                     |

## Stack And Reference-Surface Contract

Use the existing selected component, shared renderer and view-model first. Replace derived state with render-time derivation, reset state through explicit identity/key boundaries, and synchronize only actual external systems through effects. Keep timer subscriptions, stale-response guards and persistence boundaries explicit. Read version-matched Next/React documentation and run the skill/stack radar when refreshing the execution slice.

## Domain Granularity, Data And Identity Contract

Before execution, name the selected family's mental object and persisted parent/child entities, mature reference renderer, and view/edit/create/delete/reorder/reconcile scope per level. Preserve stable IDs, local drafts, server-canonical writes and cache invalidation. This planned intake does not authorize summary-only replacements or domain/identifier repurposing.

## Forward Compatibility Contract

Retain Next's recommended preset, including future rules by default. The current exceptions are an explicit five-rule list, not a blanket exclusion of future diagnostics. Future object values continue through the existing canonical data/view-model contracts. A selected family's unknown state, stale identity or unsupported value must keep its current safe fallback; document and test that boundary when refreshing the slice.

## Scope And Acceptance Criteria

1. Choose one component family and refresh this intake or a named bounded child before implementation.
2. Measure its existing diagnostics and preserve all relevant parent/child interaction and write invariants.
3. Remove the applicable temporary exception only after its affected components pass lint and tests; do not replace it with inline suppressions.
4. Run relevant tests, required gates and visual screenshot approval when rendering files change.
5. Keep other component families explicitly queued until their own bounded slice; no broad unreviewed product rewrite.

Help/Guide N/A while behavior remains unchanged; any changed workflow or recovery behavior requires a refreshed Help/Guide mapping in the same PR. Rollback is a scoped commit revert. No code is implemented by this planned brief.
