# Task Brief: Course Lesson Coach Check And Action Clarity Follow-Ups

## Metadata

- `id`: `2026-06-18-course-lesson-coach-check-and-action-clarity-followups-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `plan only until owner explicitly approves implementation`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a0a63d58`
- `audit_status`: `draft-for-owner-audit`
- `decision`: Keep this as a public lesson UX follow-up candidate, not part of admin shell work; re-audit before implementation.
- `reason`: Notes `63d7037f` and `46eae589` both target lesson-page clarity around Good looks/Common mistakes, button noise, duplicated Mark Done, and unclear `Open` copy.
- `must_refresh_before_execution_if`: Refresh if course lesson renderer, lesson progress/done behavior, Coach check fields, common mistakes model, public lesson screenshots, or admin lesson editor contracts change.

## Goal

Audit and improve the public lesson Coach check/action area so Good looks, Common mistakes, Mark done, and related actions are clearer without changing lesson content identity or completion semantics without an owner decision.

## Pre-Implementation Owner Explanation

Vi holder dette som en egen leksjons-slice. Den handler om hvordan elever ser “what good looks like”, common mistakes og lesson actions på leksjonssiden, ikke om admin-menyen.

Hvorfor det betyr noe: Hvis de viktigste coach-signalene konkurrerer med knapper eller tekst, blir leksjonen vanskeligere å bruke i praksis.

Utenfor scope: admin shell, Content mirror/status actions, pass-criteria prosent/scoring, database/API/schema, user progress-modell, message badge og merge.

Fremoverkompatibilitet: nye coach-check-felt eller lesson actions skal arve samme public lesson display contract eller kreve explicit mapping og screenshot/test før release.

## Source Notes Covered

| Note ID                                | Covered Scope                                                                                                  | Explicit Boundary                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `63d7037f-f025-404d-8e4e-80630fbd70dc` | Evaluate whether Good looks and Common mistakes should use tabs/disclosure/one-at-a-time presentation.         | No data model change unless explicitly approved.                          |
| `46eae589-ae52-4fea-bb00-8eb2fb04f29c` | Re-audit public lesson copy/action clarity: too much text, button noise, duplicated Mark Done, unclear `Open`. | Pass-criteria scoring percentages are owned by a separate decision brief. |

## Pre-Execution Audit Gate

Before implementation starts:

1. Reopen this brief, the residual intake, the current public lesson renderer, and the admin lesson editor parity surface.
2. Refresh source notes `63d7037f` and `46eae589`; confirm whether they still describe the current lesson UI.
3. Capture or inspect fresh representative lesson screenshots before deciding tab/disclosure/action changes.
4. Confirm public SEO/AI semantic impact and Help/Guide impact if action labels or completion copy change.
5. Run `npm run lint:briefs:all` and get owner approval before moving this brief to `in-progress`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Reliability and failure handling, Privacy and compliance, Content governance, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Lesson page makes coach-check and completion jobs clear without adding a new mental model casually.                                              | before/after screenshots + owner review | `5/5`                   |
| UX flow clarity                               | `target`     | Good looks, Common mistakes, Mark done, and `Open`/related actions have clear hierarchy and no duplicate primary actions.                        | screenshot review + tests               | `5/5`                   |
| Visual design quality                         | `target`     | Lesson desktop/mobile screenshots show improved scanability with no clipped text or overlap.                                                     | screenshot handoff                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Lesson progress, done state, content rendering, and admin/public field parity remain unchanged unless separately approved.                       | unit/e2e tests + diff review            | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin editor contracts may be checked for parity, but no admin editor change is required by default.                            | parity test review                      | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Any tabs/disclosures/actions preserve keyboard/focus/name/role/selected state and touch targets.                                                 | Playwright/Testing Library              | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency or heavy client interaction by default.                                                                           | package/diff review                     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical lesson content and user progress boundaries remain unchanged.                                                                   | data-boundary review                    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: public lesson cache/revalidation behavior should not change.                                                                    | route diff review                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Existing disabled/enabled/done and refresh states remain deterministic.                                                                          | targeted tests                          | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected route or authz changes expected.                                                                                   | changed-files review                    | `4/5`                   |
| Privacy and compliance                        | `target`     | No private progress/admin note/user/payment/provider data appears in public lesson UI/screenshots.                                               | screenshot/privacy review               | `5/5`                   |
| Content governance                            | `target`     | Public lesson output remains driven by canonical lesson content, not hardcoded to one example lesson.                                            | content/view-model tests                | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: if field labels change, admin parity tests/Help impact must be reviewed.                                                        | parity review                           | `4/5`                   |
| SEO and crawlability                          | `target`     | Public lesson semantic structure, canonical route, metadata, and crawl-safe content are not regressed.                                           | SEO/sitemap/markup review               | `5/5`                   |
| AI discoverability                            | `target`     | Lesson content remains semantically clear and crawl-safe for public lesson entities.                                                             | structured/semantic markup review       | `5/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics event or KPI expected.                                                                                         | no-event-diff review                    | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no products, checkout, Stripe, entitlements, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                | explicit commerce scope rationale       | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: no support procedure change unless Help/Guide labels change.                                                                    | Help impact review                      | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Lesson action/cue labels tolerate longer future locale strings without clipping.                                                                 | responsive screenshots                  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing course lesson renderer and view model; no dependency.                                                                             | diff/package review                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Update lesson renderer/progress/parity tests and screenshot handoff.                                                                             | test output + screenshots               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: pattern should scale to future lessons without per-lesson hardcoding.                                                           | fixture review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/test diff with no migration unless scope changes.                                                                            | git diff + gates                        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: reuse existing course lesson route/renderer.
- TypeScript/domain: lesson body and progress contracts remain canonical.
- Supabase/data: no migration/RLS/generated type change expected.
- UI system: reuse current lesson/public tokens and existing action primitives.
- Testing: course lesson unit/e2e/parity tests plus screenshots.

## Data Placement And Sync Contract

- Server-canonical data: lesson content and user progress remain unchanged.
- Local data: tab/disclosure state only if introduced.
- Sync policy: unchanged progress/done behavior.
- Retention/sensitivity: no private data in public UI.
- Cache/invalidation: unchanged unless explicitly scoped.

## Identity And Rename Contract

- Canonical IDs: lesson slugs/runtime IDs and progress IDs remain unchanged.
- Human-readable labels: action/cue labels may be improved but not repurposed.
- Mutability rules: no lesson identity change.
- Rename vs repurpose: materially new completion behavior needs separate decision.
- Compatibility: public lesson URLs remain.
- Observability and repair: parity tests catch drift.

## Forward Compatibility Contract

- Extensibility surfaces: lesson sections, coach-check fields, action labels, locales.
- Source of truth: lesson renderer consumes canonical lesson body.
- Additive behavior: future lessons use the same display pattern.
- Explicit mapping requirements: new completion metrics or scoring require product decision.
- Unknown/deprecated values: existing fallback rendering remains visible.
- Test/evidence: future-value lesson fixture and screenshot parity.

## Scope

- Public course lesson Coach check/action area.
- Related unit/e2e/parity tests.
- Screenshots for representative lesson pages.

## Out Of Scope

- Pass-criteria percent/scoring semantics.
- Admin shell/mobile navigation.
- Content mirror/status actions.
- API/database/auth changes.

## Acceptance Criteria

1. Good looks/Common mistakes presentation is easier to compare or switch without hiding meaning.
2. Lesson action hierarchy is clearer with no duplicate/confusing primary actions.
3. Lesson progress and content identity remain unchanged.
4. Screenshot handoff is owner-approved before broad gates.

## Validation

- `npm run lint:briefs`
- targeted lesson unit/e2e/parity tests
- screenshot handoff
- after screenshot approval: `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`

## Help / Guide Impact

Required if visible lesson action labels, completion behavior copy, or admin/public parity guidance changes.

## Checkpoint Log

- `2026-06-18 | planned | captured open notes 63d7037f and 46eae589 into a dedicated public lesson follow-up so admin shell work stays scoped | next: re-audit current lesson UI before implementation`
