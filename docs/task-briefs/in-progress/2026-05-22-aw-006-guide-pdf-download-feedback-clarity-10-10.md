# Task Brief: AW-006 Guide PDF Download Feedback Clarity (10/10)

## Metadata

- `id`: `2026-05-22-aw-006-guide-pdf-download-feedback-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-22`
- `updated`: `2026-05-22`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-guide-pdf-download-feedback`

## Brief Audit Record

- `last_audited`: `2026-05-22`
- `base`: `main@73ba45a`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded guide PDF download feedback clarity pass.
- `reason`: `main` is clean after PR `#806` and repo-managed closeout `#807`; `npm run post-merge:preflight` was reported green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 UI slice and identified `GuidePdfDownloadButton` as a small shared surface where pending/error feedback is visually too thin for the 0-1000m guide, Poolside guide, and My Library item pages.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `GuidePdfDownloadButton`, guide PDF API routes, guide entitlement behavior, My Library item actions, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make guide PDF download pending and failure feedback clear, accessible, and visually consistent across the guide download surfaces without changing PDF generation, entitlement, analytics, filenames, or API behavior.

## Pre-Implementation Owner Explanation

Vi gjor PDF-nedlastingsknappen tydeligere naar en guide lastes ned eller feiler, slik at brukeren ser hva som skjer etter klikket. Det betyr bedre opplevelse paa 0-1000m-guiden, Poolside-guiden og My Library-produktflaten. Utenfor scope er PDF-generering, entitlements, API-er, analytics, filnavn, Stripe/Supabase og bred design-system-refaktor.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this slice:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                      | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The shared PDF download action remains in the same guide/My Library action locations and communicates pending/error states clearly.                                     | component diff + screenshots                            | `5/5`                   |
| UX flow clarity                               | `target`     | Download pending and failure states are visible near the button, with no dead-end after a failed PDF request.                                                           | unit tests + screenshot handoff                         | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses the existing calm guide/member visual language, stable spacing, and readable contrast without broad redesign.                                             | screenshot handoff + class review                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Fetch path, credentials, cache mode, analytics event, content-disposition filename handling, object URL handling, and fallback error behavior remain unchanged.         | targeted unit tests + diff review                       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publish, note, QR, or operator workflow.                                                                    | changed-files review                                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Pending and error feedback is announced with appropriate live-region semantics and the button keeps accessible labels while disabled.                                   | unit tests + screenshot/DOM review                      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, route data fetch, media asset, or measurable JS-heavy pattern is introduced on guide routes.                                                         | dependency diff + typecheck                             | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because the only state is short-lived client UI state for one button; no persisted local/server data, sync, conflict policy, or retention rule changes.             | data contract section                                   | `N/A`                   |
| Caching and invalidation strategy             | `target`     | The existing PDF request remains `cache: "no-store"` and no route/cache invalidation contract changes.                                                                  | unit test + diff review                                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Failed API responses and thrown client errors still produce deterministic safe messages and allow another click attempt.                                                | unit tests                                              | `5/5`                   |
| Security and authz                            | `target`     | Same-origin credentialed PDF request and protected guide entitlement boundaries remain untouched; UI does not expose sensitive diagnostics.                             | route-boundary diff review                              | `5/5`                   |
| Privacy and compliance                        | `target`     | Feedback does not include user identifiers, entitlement details, raw provider errors, secrets, or env values.                                                           | copy/error review                                       | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this bounded shared-guide feedback slice.                                                                | docs diff                                               | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin labels, Help/Guide operator procedure, recovery action, or edit workflow changes.                                                                  | Help/Guide rationale                                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata, sitemap, robots, canonical URL, structured data, or crawlable content contract changes.                                                  | changed-files review                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity model, structured data, crawl-safe docs page, or AI-facing metadata changes.                                                      | changed-files review                                    | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing `item_download_started` event remains unchanged and no new unsafe payload is added.                                                                            | unit/diff review                                        | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: guide PDF entitlement access may be commerce-owned elsewhere, but this UI-only slice changes no pricing, checkout, entitlement, refund, or reporting.  | route-boundary review                                   | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no alerting, incident runbook, support diagnostic path, escalation path, or operator recovery procedure.                                 | explicit support-ops scope rationale                    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no billing, invoice, payout, refund, entitlement accounting, revenue report, or finance reconciliation data.                             | explicit finance scope rationale                        | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice adds no locale routing or translation workflow; touched English UI copy remains short and layout-safe within the existing single-locale surface. | explicit i18n scope rationale                           | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing shared `GuidePdfDownloadButton` and Tailwind/CSS patterns; add no package, API, route, provider, or architectural dependency.                        | dependency diff + changed-files review                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/refresh focused component tests, run targeted tests/lint/typecheck, capture screenshots, then run broad gates after screenshot approval.                            | test commands + screenshot handoff + later verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the change keeps one shared button instead of duplicating route-local feedback; runtime/API cost is unchanged.                                         | shared component diff                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, provider changes, or generated assets.                                                                          | git diff + validation evidence                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: existing `GuidePdfDownloadButton` as the shared guide PDF download action used by guide routes and My Library item detail.
  - Server/client boundary: keep the component client-side; do not alter server-rendered guide pages except through existing props/usage if needed.
  - Route/action/API boundary: `/api/guides/0-1000m/pdf` and `/api/guides/poolside/pdf` remain unchanged.
  - Cache behavior: keep the existing client request `cache: "no-store"`.
- TypeScript/domain contracts:
  - Preserve `apiPath`, `fallbackFileName`, and `className` props.
  - Preserve filename parsing and fallback error model.
  - Deterministic invariant: pending/error feedback derives only from the existing button request lifecycle.
- Supabase/data layer:
  - N/A; no schema, RLS, generated type, storage, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider, email, analytics vendor, SDK, secret, webhook, or retry contract change.
- UI system:
  - Use existing Tailwind visual language and local component styling; do not introduce a broad Notice primitive.
  - Screenshot handoff type: `after/reference`, comparing the changed PDF feedback to existing guide/member surfaces where practical.
- Testing:
  - Focused Vitest coverage for success, pending semantics, API error feedback, and retry-safe error reset.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no persisted local-only data, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive-data handling. The only state remains transient React UI state for the PDF download request.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior.

## Help / Guide Impact

N/A with rationale: the slice changes only the visual/accessibility treatment of an existing PDF download button. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, or support/operator instructions.

## Route / Label / Support Surface Sweep

Required as a targeted route/action sweep because this slice changes a shared user-facing guide download action.

- Identifiers searched before PR handoff:
  - `GuidePdfDownloadButton`
  - `Download PDF`
  - `Downloading PDF`
  - `item_download_started`
  - `Could not download PDF`
  - `0-1000m`
  - `poolside/pdf`
- Surfaces checked / directories/surfaces:
  - `app/guides/0-1000m/page.tsx`
  - `app/guides/poolside/page.tsx`
  - `app/my-library/item/[slug]/page.tsx`
  - `components/guides/GuidePdfDownloadButton.tsx`
  - `tests/unit/guide-pdf-download-button.test.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
- Fallout handled:
  - shared component, focused unit tests, AW-006 docs, screenshot artifacts only.
  - no guide PDF API route, generation, entitlement, filename, analytics taxonomy, or Help/Guide support-procedure fallout.

## Scope

- Improve `components/guides/GuidePdfDownloadButton.tsx` pending/error feedback presentation and accessibility semantics.
- Update focused unit tests for the changed request lifecycle and semantics.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Guide PDF API route changes.
- PDF generation, PDF asset loading, print/export layout, content-disposition generation, or filename rules.
- Entitlement, auth, My Library product ownership, checkout, Stripe, Supabase, analytics taxonomy, database, or cache invalidation changes.
- Broad public/member/admin notice primitive rollout.
- Guide tracker sync/offline behavior.
- Dryland/micro-session state flows.
- Admin state primitive work.

## Acceptance Criteria

1. `GuidePdfDownloadButton` keeps the same successful download behavior, analytics call, request options, filename handling, and retry capability.
2. Pending feedback is visible and politely announced without causing layout instability.
3. Error feedback is visible near the button, safely worded, accessible, and clears when the next attempt starts.
4. Focused unit tests cover success, pending semantics, API error rendering, and retry/error reset.
5. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
6. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `npx vitest run tests/unit/guide-pdf-download-button.test.tsx`
- `npm run lint:briefs`
- `npm run typecheck`
- `git diff --check`

After screenshot approval:

- `npm run verify:pre-pr`
- GitHub required checks green
- before merge recommendation:
  - `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

- Capture guide PDF button default/pending/error feedback on representative guide pages.
- Use `after/reference` naming because the change compares the updated PDF feedback to existing guide/member surfaces rather than a true pre-change artifact.
- High-cost UI/export debug path: scope reviewed against `docs/runbooks/ui-debug-hypothesis-and-handoff.md`; no repeated visual/export failure triggered the full high-cost loop.
- Actual consumed artifact for this visual/export-adjacent slice is the rendered guide download button state in the full-resolution screenshot PNGs; no PDF generation or downloaded PDF artifact changes are in scope.
- Stop for owner screenshot approval before broad gates, PR creation, or merge readiness.

## Implementation Checkpoint Log

- `2026-05-22 | in-progress | started from clean main@73ba45a after PR #806 and repo-managed closeout #807; post-merge preflight was reported green with no closeout remaining; selected Guide PDF download feedback clarity as the next bounded AW-006 UI slice after queue/design/code re-audit | next: implement shared button feedback, update tests/docs, run targeted QA, then capture screenshot handoff`
- `2026-05-22 | targeted validation | implemented shared GuidePdfDownloadButton pending/error feedback with polite live-region semantics, updated focused unit coverage, refreshed the canonical AW-006 queue and notice/empty-state inventory, and passed npx vitest run tests/unit/guide-pdf-download-button.test.tsx, npm run lint, npm run typecheck, npm run lint:briefs:all, git diff --check, and the targeted route/label/support sweep | next: capture required screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-05-22 | screenshot-review | captured after/reference screenshot artifacts at output/aw-006-guide-pdf-feedback-20260522-180629 for idle reference, pending desktop, error desktop, and error mobile states; temporary local visual route/script were removed after capture, and GuidePdfDownloadButton has not changed after the final capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
