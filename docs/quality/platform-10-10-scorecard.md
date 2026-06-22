# Platform 10/10 Scorecard

Use this scorecard as the shared quality contract across product, admin, and platform work.

## Scoring Model

- `5`: production-grade, measurable target met, regression-safe.
- `4`: strong, minor non-blocking gap with owner and deadline.
- `3`: acceptable but material risk/gap remains.
- `2`: weak coverage or unstable behavior.
- `1`: missing baseline.
- `0`: not implemented.

## Score Conversion And Gates

- `5/5 = 10/10`
- `4/5 = 8/10`
- `3/5 = 6/10`
- `2/5 = 4/10`
- `1/5 = 2/10`
- `0/5 = 0/10`

Gate policy:

- Release gate:
  - all `target` categories must be `>= 4/5` (minimum `8/10`).
- 10/10 claim gate:
  - all `target` categories must be `>= 4/5`,
  - all explicitly designated `critical target` categories must be `5/5` (`10/10`).
- Strict 10/10 mode (optional, brief-defined):
  - all `target` categories must be `5/5`.

Critical target categories must be listed explicitly in each brief closeout, and should normally include at least:

- business logic correctness and data integrity,
- security and authz,
- reliability and failure handling,
- testing and QA automation.

## Required Categories

For each active brief, mark each category as `target`, `supporting`, or `N/A`, and define measurable thresholds.

| Category                                      | 10/10 Target (score 5)                                                                                                                                                                                                            | Minimum Release Gate                                                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | Clear user jobs, page purpose, navigation hierarchy by route, and domain granularity that matches the user's mental object.                                                                                                       | Goal, IA, and user-facing object level for changed routes documented in brief.                                                               |
| UX flow clarity                               | Primary actions and next steps are obvious; no dead-end states.                                                                                                                                                                   | `loading`, `empty`, `error`, `retry` handled for changed flows.                                                                              |
| Visual design quality                         | Consistent spacing/typography/state tokens; no unfinished UI seams.                                                                                                                                                               | Changed UI matches design language and interaction patterns.                                                                                 |
| Business logic correctness and data integrity | Deterministic state transitions, explicit invariants at the correct domain-object and child-object level, idempotent critical mutations, and no silent data corruption.                                                           | Invariants for changed flows and affected object levels are documented and covered by tests and/or runtime guards.                           |
| Admin editor ergonomics                       | Admin can perform high-frequency edit/publish flows quickly with minimal clicks and clear confirmations.                                                                                                                          | Core admin task flows documented and manually QA-verified.                                                                                   |
| Accessibility (a11y)                          | Keyboard, focus, labels, semantics, contrast, screen-reader flow.                                                                                                                                                                 | No new serious/critical violations on changed surfaces.                                                                                      |
| Performance (CWV + payloads)                  | Meets route-level speed budgets for core routes and avoids JS/payload bloat.                                                                                                                                                      | No obvious regression; budget checks in place where defined.                                                                                 |
| Data placement and sync boundaries            | Clear contract for what is local vs server-canonical, with sync/conflict rules.                                                                                                                                                   | Brief explicitly defines local/server ownership and sync behavior.                                                                           |
| Caching and invalidation strategy             | Predictable cache behavior with explicit invalidation and freshness guarantees.                                                                                                                                                   | Changed read paths define cache mode and invalidation trigger.                                                                               |
| Reliability and failure handling              | Deterministic behavior under latency, offline, and partial failure.                                                                                                                                                               | No unexpected `500` on expected deny/failure paths.                                                                                          |
| Security and authz                            | Fail-closed authn/authz, input validation, safe defaults, least privilege.                                                                                                                                                        | Negative-path tests cover changed protected paths.                                                                                           |
| Privacy and compliance                        | Data minimization, retention clarity, consent/legal copy alignment.                                                                                                                                                               | No sensitive data leakage in logs/events/UI errors.                                                                                          |
| Content governance                            | Single source of truth, owner field, revision history, rollback path.                                                                                                                                                             | Content ownership and publish status model defined.                                                                                          |
| Admin workflow and editability                | Fast admin operations with clear status workflow and safe mutations.                                                                                                                                                              | Role-gated CRUD works with clear feedback and audit trail.                                                                                   |
| SEO and crawlability                          | Canonicals, sitemap, robots, metadata consistency, indexability controls.                                                                                                                                                         | Route metadata + sitemap behavior covered by tests.                                                                                          |
| AI discoverability                            | Structured data/entity clarity and crawl-safe public docs/pages.                                                                                                                                                                  | Public pages expose stable semantic structure and canonical links.                                                                           |
| Analytics and KPI observability               | Event taxonomy, persistence, dashboardability, actionable KPI thresholds.                                                                                                                                                         | Changed flows emit required events/logs with safe payloads.                                                                                  |
| Commerce and revenue ops                      | Pricing/catalog/source-of-truth consistency and checkout resilience.                                                                                                                                                              | No broken entitlement/checkout path for changed scope.                                                                                       |
| Incident response and support operations      | Operational runbooks, alert paths, and support diagnostics enable fast recovery.                                                                                                                                                  | On-call/support path and troubleshooting evidence exist for changed critical flows.                                                          |
| Finance and reporting operations              | Revenue, refunds, entitlements, and payout-relevant data remain reconcilable.                                                                                                                                                     | Changed commerce flows include reporting/reconciliation validation notes.                                                                    |
| i18n operational readiness                    | Content model, routing, and metadata can scale to multi-language operations safely.                                                                                                                                               | No hard blocker introduced for later locale expansion on changed scope.                                                                      |
| Stack-fit and dependency discipline           | Use stack-native patterns first; shared React/view-model contracts, domain granularity/reference-surface reuse, typed validation, Supabase/RLS discipline, official SDK patterns, minimal dependency growth, and clear contracts. | No unnecessary dependency added without explicit rationale; impacted stack surfaces and reference object levels are identified in the brief. |
| Testing and QA automation                     | Balanced unit/e2e/negative-path coverage; low flake.                                                                                                                                                                              | Relevant tests updated; CI required checks green.                                                                                            |
| Scalability and cost efficiency               | Runtime/resource usage remains sustainable as traffic and content grow.                                                                                                                                                           | No obvious cost explosion pattern introduced in changed scope.                                                                               |
| DevOps and rollback readiness                 | Safe deploy, migration safety, rollback path, runbook updates.                                                                                                                                                                    | Migration/rollback impact documented for risky changes.                                                                                      |

## Enforcement Contract

1. Every `planned`/`in-progress` brief must reference this scorecard.
2. Brief acceptance criteria must include measurable outcomes for target categories.
3. Final closeout must state score outcome (`0-5`) for each target category.
4. If any target category is `<4`, the brief cannot move to `done` without explicit deferral.
5. A brief may only claim `10/10` if all declared critical target categories are `5/5`.
6. If a brief changes admin/user workflows, labels, or failure/recovery behavior, Help/Guide impact must be documented:
   - update required in same PR, or explicit `N/A` rationale.
7. Non-docs changes must pass `npm run lint:quality-gates`, which checks that changed files have a changed in-progress brief and that the brief contains the required evidence contract for triggered quality-risk surfaces.
8. `npm run lint:quality-gates` does not replace review judgment; its output explicitly lists scorecard categories where evidence still needs human sufficiency review.

## Domain Granularity Sub-Gate

For any brief that touches an existing domain object, workflow, editor, review surface, import/export,
provider sync, admin workflow, or user-facing correction flow, the brief must identify the user's
mental object and compare it to the canonical object model before implementation. This is a
mandatory sufficiency review under `Product goals and IA`, `Business logic correctness and data
integrity`, `Stack-fit and dependency discipline`, and `Testing and QA automation`.

The brief must list:

- the user's mental object,
- canonical persisted object(s) and stable IDs,
- relevant child levels, such as section/block, repeat, step, set, check-in, invoice line,
  entitlement row, provider sent/received evidence, note, or attachment,
- the mature reference surface or component/view-model contract,
- for each level, whether the active slice supports `view`, `edit`, `create`, `delete`, `reorder`,
  `reconcile`, `support-only`, or is explicitly out of scope.

If the user's mental object has child structure, the active slice must show that child structure
read-only unless the brief gives a concrete `N/A` rationale. A `10/10` claim is not valid when the
UI, tests, or screenshot handoff prove only a summary-level workflow while the trusted object is
built, edited, reviewed, or reconciled at a child level.

## Analytics / GA Recommendation

- Keep first-party analytics events as the source of truth for product instrumentation.
- Prioritize event persistence + admin insights before adding new vendor complexity.
- Add GA4 only if needed for marketing attribution, with:
  - consent-aware collection,
  - server-side forwarding where possible,
  - strict event naming and PII redaction.

## Platform Defaults (Current Practical Baseline)

- Speed optimization baseline:
  - Core blocking routes: `/`, `/course`, `/my-library`.
  - Initial budgets: `LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`, `TBT <= 200ms`.
- Data placement baseline:
  - Server-canonical: identity, entitlements, admin content/notes/categories, audit history, publish states.
  - Local-first with sync: short-lived UX state and offline-progress buffers where explicitly designed.
  - Local-only: non-sensitive UI preferences that do not affect business truth.
- Stack baseline:
  - Prefer Next.js + TypeScript + Supabase + existing test stack patterns before introducing new services/tools.
  - Add external analytics vendor only when first-party events cannot satisfy the business requirement.
  - For React UI, reuse the mature reference surface or shared component/view-model before creating route-local markup.
  - For Supabase changes, require explicit migrations, RLS/authz review, generated type updates, and negative-path coverage.
  - For external services, use official SDK/docs, least-privilege secrets, idempotency/retry/webhook verification, and support-visible diagnostics.

## Ratchet Policy

- Start with stable baseline targets.
- After two consecutive green cycles, tighten one threshold step.
- Record tighten/hold/revert decisions in brief checkpoint log.
