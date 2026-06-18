# Task Brief: Course Lesson Pass Criteria Scoring Decision

## Metadata

- `id`: `2026-06-18-course-lesson-pass-criteria-scoring-decision-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `decision brief; no implementation until owner selects scoring semantics`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a0a63d58`
- `audit_status`: `draft-for-owner-audit`
- `decision`: Keep this as a product/data decision child before any scoring UI or completion logic changes; re-audit the current progress model before deciding.
- `reason`: Note `2832e67b` proposes percent-weighted pass criteria and color states, which affects lesson completion semantics and cannot be folded into readability work safely.
- `must_refresh_before_execution_if`: Refresh if lesson progress model, pass-criteria renderer, admin lesson editor, analytics completion events, or course progress tests change.

## Goal

Decide whether pass criteria remain binary checklist items or become weighted/scored criteria, then define the implementation contract if scoring is approved.

## Pre-Implementation Owner Explanation

Dette er ikke bare en visuell endring. Hvis pass criteria får prosent, vekting eller farger, endrer det hva “ferdig” betyr i en leksjon.

Hvorfor det betyr noe: Completion må være forståelig, rettferdig og teknisk stabilt før vi viser prosent eller delvis bestått til brukeren.

Utenfor scope: å implementere scoring, endre progress-tabeller, endre analytics, endre admin editor eller endre public lesson UI før beslutningen er tatt.

Fremoverkompatibilitet: hvis scoring godkjennes, må fremtidige kriterier ha eksplisitt vekt/fallback og ukjente scoringverdier må feile trygt til dagens binære modell eller en tydelig “needs review”-state.

## Source Notes Covered

| Note ID                                | Covered Scope                                                                | Explicit Boundary                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `2832e67b-bb7a-4a71-905d-1be278af606d` | Product decision for pass-criteria percentages, weighting, and color states. | No implementation until owner chooses the scoring model and fallback behavior. |

## Pre-Decision Audit Gate

Before any implementation brief is created from this decision:

1. Reopen this brief, the residual intake, current lesson progress contracts, admin lesson editor pass-criteria fields, and analytics completion logic.
2. Refresh source note `2832e67b`; confirm whether the requested percent/color semantics are still desired.
3. Decide whether pass criteria are coaching guidance, a completion gate, a score, or analytics input.
4. Document server-canonical vs derived/local scoring before code or migration work starts.
5. Run `npm run lint:briefs:all` and get owner approval for the selected model.

## Decision Options

| Option                     | Recommendation                                 | Why                                                                 |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| Keep binary criteria       | `recommended until scoring model is specified` | Lowest risk and matches current completion behavior.                |
| Equal-weight percent       | `evaluate`                                     | Simple but may imply false precision if not all criteria are equal. |
| Explicit weighted criteria | `defer until content model decision`           | More accurate but requires admin/editor/data/test work.             |
| Color-only progress hints  | `evaluate carefully`                           | Can help scanning but must not redefine completion silently.        |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this decision: Product goals and IA, Business logic correctness and data integrity, Reliability and failure handling, Security and authz, Privacy and compliance, Content governance, Analytics and KPI observability, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Decision names what pass criteria are for: readiness signal, completion gate, coaching feedback, or score.                                       | decision record                   | `5/5`                   |
| UX flow clarity                               | `target`     | Chosen model avoids misleading users about partial completion.                                                                                   | UX rationale + examples           | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: visual treatment is future implementation scope.                                                                                | implementation follow-up criteria | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Decision defines scoring invariant, default weights, migration/backfill, and fallback for missing values before code.                            | data contract                     | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin editing impact is documented if scoring is approved.                                                                      | impact notes                      | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: future color states must have non-color text semantics.                                                                         | follow-up acceptance criteria     | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no runtime change in decision brief.                                                                                            | no-runtime-diff review            | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Decision states whether scoring is derived locally, stored per criterion, or server-canonical progress.                                          | data-boundary decision            | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: cache impact belongs to implementation if approved.                                                                             | follow-up criteria                | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing/unknown scoring values have a deterministic fallback.                                                                                    | fallback contract                 | `5/5`                   |
| Security and authz                            | `target`     | No user can forge completion scoring through client-only state if scoring becomes canonical.                                                     | security requirement              | `5/5`                   |
| Privacy and compliance                        | `target`     | Scoring exposes no private data beyond existing lesson progress.                                                                                 | privacy rationale                 | `5/5`                   |
| Content governance                            | `target`     | Criteria weights/labels have an owner and review path if content model changes.                                                                  | governance decision               | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future admin edit UI must preserve clear criteria editing.                                                                      | follow-up criteria                | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this private decision changes no public route metadata, sitemap, robots, canonicals, or crawl policy.                                | explicit scope rationale          | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: public lesson semantics may be affected only if implementation later changes markup.                                            | follow-up criteria                | `4/5`                   |
| Analytics and KPI observability               | `target`     | Decision states whether pass percentage becomes an analytics/KPI value or remains display-only.                                                  | analytics decision                | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no products, checkout, Stripe, entitlements, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                | explicit commerce scope rationale | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: support implications are documented if completion disputes can occur.                                                           | support note                      | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope rationale  | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: future scoring labels must tolerate locale expansion.                                                                           | follow-up criteria                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Decision prefers existing lesson/progress contracts before adding data structures.                                                               | architecture note                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Approved model must define unit/e2e/migration tests before implementation.                                                                       | test matrix                       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: scoring must not introduce per-event fanout without rationale.                                                                  | follow-up criteria                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Decision defines rollback/no-op behavior before any migration or runtime change.                                                                 | rollback decision                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: no UI implementation in this decision brief.
- TypeScript/domain: decide pass-criteria model before types change.
- Supabase/data: migration/RLS/generated types are future scope if scoring is persisted.
- Analytics: decide whether scoring is an event/KPI before instrumentation.
- Testing: future implementation needs data/model/UI negative paths.

## Data Placement And Sync Contract

- Server-canonical data: current lesson progress remains canonical.
- Local data: no new local scoring data in this decision brief.
- Sync policy: TBD by owner decision.
- Retention/sensitivity: no new sensitive data.
- Cache/invalidation: TBD by implementation if approved.

## Identity And Rename Contract

- Canonical IDs: lesson IDs and criterion identity must be defined before scoring persists.
- Human-readable labels: criteria text is display content, not stable identity unless explicitly decided.
- Mutability rules: changing criterion weights after users complete lessons needs a policy.
- Rename vs repurpose: changed criterion meaning may require new criterion identity.
- Compatibility: existing completed lessons must have a fallback.
- Observability and repair: unknown/missing weights need diagnostics.

## Forward Compatibility Contract

- Extensibility surfaces: criteria, weights, colors, completion states, analytics payloads, locales.
- Source of truth: TBD by decision.
- Additive behavior: new criteria need deterministic weight/fallback.
- Explicit mapping requirements: any scoring persistence or analytics metric requires owner decision.
- Unknown/deprecated values: fallback to binary or `needs review`.
- Test/evidence: model fixtures and migration/backfill tests if implemented.

## Scope

- Product decision and implementation contract for pass-criteria scoring.

## Out Of Scope

- Runtime implementation.
- UI/color/scoring changes.
- Database migration.
- Analytics event changes.

## Acceptance Criteria

1. Owner selects binary, equal-weight, explicit-weight, color-only, or deferred.
2. If scoring is approved, data model, fallback, tests, and rollout path are defined before implementation.
3. If deferred, current binary behavior remains canonical.

## Validation

- `npm run lint:briefs`

## Help / Guide Impact

N/A for decision-only state. Required in any implementation child that changes completion labels, scoring copy, or support behavior.

## Checkpoint Log

- `2026-06-18 | planned | captured live note 2832e67b as a decision brief because percent/color pass criteria affect completion semantics | next: audit current progress model, then owner decides before implementation`
