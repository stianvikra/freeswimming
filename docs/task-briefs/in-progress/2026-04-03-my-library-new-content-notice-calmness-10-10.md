# Task Brief: My Library New Content Notice Calmness (10/10)

## Metadata

- `id`: `2026-04-03-my-library-new-content-notice-calmness-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-03`
- `updated`: `2026-04-03`

## Goal

Make the My Library `New content` notice feel calmer by default through a compact summary-first layout with a deterministic expand/collapse path, while preserving the already-shipped truthful freshness logic.

## Why This Brief Exists

- The `2026-04-01` production admin-notes umbrella still includes one Package C follow-up:
  - `2580d437-c1f3-47c4-80e9-70865a259d46` `New content`
- The same umbrella also listed:
  - `3b7783ba-6a98-46f9-9259-909a1a90ac9e` `NEW CONTENT NOTIFICATION`
- The canonical freshness rule behind `NEW CONTENT NOTIFICATION` is already shipped:
  - the notice only appears for lessons that are newly added relative to the saved seen signature,
  - stale seen signatures re-open the notice truthfully,
  - older unchanged content stays hidden.
- What remains is the calmer UI note:
  - the current notice is always expanded,
  - the full lesson list competes with the rest of the My Library landing page on first load,
  - the owner wants the message to be collapsible and feel more intentional.
- This slice intentionally keeps scope narrow:
  - no new signal logic,
  - no change to canonical lesson freshness rules,
  - only calmer presentation, disclosure, and regression coverage.

## Dependencies And Boundaries

- Parent umbrella:
  - `docs/task-briefs/in-progress/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Main surfaces in scope:
  - `components/my-library/MyLibraryNewContentNotice.tsx`
  - `app/my-library/page.tsx`
  - `tests/unit/my-library-new-content-notice-component.test.tsx`
  - `tests/e2e/my-library-new-content-notice.spec.ts`
- Existing freshness logic to preserve:
  - `lib/my-library/new-content-notice.ts`
- This slice owns:
  - summary-first notice layout,
  - deterministic expand/collapse lesson-list disclosure,
  - continued open-first/dismiss behavior,
  - updated regression coverage and checkpoint notes.
- This slice does not own:
  - new lesson-signal schema,
  - changes to canonical freshness truth rules,
  - admin help-center wording,
  - any builder input removal or unrelated My Library IA work.

## Triage Disposition

- `2580d437-c1f3-47c4-80e9-70865a259d46` `New content`
  - disposition: owned by this brief.
  - reason: the remaining gap is calmer, collapsible notice UX on the My Library hub.
- `3b7783ba-6a98-46f9-9259-909a1a90ac9e` `NEW CONTENT NOTIFICATION`
  - disposition: already shipped before this slice.
  - reason: truthful freshness filtering is already implemented through the canonical signal/seen-signature contract.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                            | Evidence                                       |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Product goals and IA                          | `target`     | The My Library landing page opens with a compact new-content summary that does not overwhelm the rest of the hub while still making fresh lessons obvious. | UI review + brief contract                     |
| UX flow clarity                               | `target`     | Owners can open the first new lesson immediately and can reveal or hide the lesson list in one explicit control without losing the notice state.          | unit tests + e2e + manual review               |
| Visual design quality                         | `target`     | The notice feels calmer and more intentional than the prior always-expanded banner while preserving the existing My Library visual language.              | screenshot review + preview/local QA           |
| Business logic correctness and data integrity | `target`     | Collapsing or expanding the notice never changes which lessons are considered new, what the first lesson CTA targets, or how dismiss persistence works.  | unit tests + code review                       |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes a private learner notice on My Library, not an admin/editor workflow.                                                     | explicit scope rationale                       |
| Accessibility (a11y)                          | `supporting` | Supporting only: disclosure and dismiss controls remain keyboard reachable, labeled, and truthfully expose `aria-expanded` state.                         | testing-library assertions + e2e               |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: calmer disclosure is client-only UI state and must not add material payload or route slowdown.                                           | diff review + `verify:pre-pr`                  |
| Data placement and sync boundaries            | `target`     | Canonical signal and seen-signature data remain unchanged; only ephemeral UI disclosure state is added locally.                                           | brief contract + code review                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: retry and reload behavior still read the same no-store signal endpoint and do not introduce a second fetch path.                        | code review + existing tests                   |
| Reliability and failure handling              | `target`     | Loading, error, dismiss, reopen-on-stale-signature, and disclosure states remain explicit and deterministic.                                              | unit tests + e2e                               |
| Security and authz                            | `supporting` | Supporting only: the notice remains user-scoped and does not widen data access beyond the existing authenticated My Library route.                        | existing route auth contract + scope rationale |
| Privacy and compliance                        | `supporting` | Supporting only: lesson freshness data stays private to the signed-in user and disclosure state remains local-only.                                       | code review + scope rationale                  |
| Content governance                            | `supporting` | Supporting only: notice labels and actions stay aligned with the canonical Free Course / My Library wording already in product.                           | copy review                                    |
| Admin workflow and editability                | `N/A`        | N/A because there is no admin editing surface or operator queue change in this slice.                                                                     | explicit scope rationale                       |
| SEO and crawlability                          | `N/A`        | N/A because My Library is an authenticated private route and this slice adds no public crawl surface.                                                     | explicit scope rationale                       |
| AI discoverability                            | `N/A`        | N/A because the slice changes no public metadata, semantic publishing model, or crawl-facing content.                                                     | explicit scope rationale                       |
| Analytics and KPI observability               | `supporting` | Supporting only: existing shown/opened/seen analytics remain intact; this slice does not require new event types.                                         | existing analytics assertions + code review    |
| Commerce and revenue ops                      | `N/A`        | N/A because no plan, entitlement, or pricing behavior changes.                                                                                             | explicit scope rationale                       |
| Incident response and support operations      | `N/A`        | N/A because this slice changes a self-explanatory private notice with explicit retry and dismiss behavior, and introduces no new support runbook path.    | explicit scope rationale                       |
| Finance and reporting operations              | `N/A`        | N/A because there is no finance, reconciliation, or payout impact in this notice-only UX change.                                                          | explicit scope rationale                       |
| i18n operational readiness                    | `N/A`        | N/A because the slice only rearranges existing short notice copy and does not change locale models, route contracts, or translation infrastructure.        | explicit scope rationale                       |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing My Library notice component and helpers without adding dependencies or parallel notice systems.                                         | dependency diff + code review                  |
| Testing and QA automation                     | `target`     | Coverage proves collapsed-by-default summary behavior, detail reveal/hide, and unchanged dismiss/freshness flows, plus `npm run verify:pre-pr` passes.   | unit tests + targeted e2e + gate output        |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice only changes local render density and adds no storage, query, or background-job cost.                                          | diff review                                    |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the UI-only disclosure layer is reversible in one component path without migration or data repair.                                       | PR summary + rollback note                     |

## Data Placement And Sync Contract

- Server-canonical:
  - `/api/my-library/new-content-signal` response,
  - lesson IDs/titles/module metadata inside the canonical signal payload.
- Local-only:
  - seen-signature payload in localStorage,
  - whether the notice details are currently expanded,
  - transient loading/error/visible UI state.
- Sync policy:
  - the component still loads the canonical signal via the existing `no-store` fetch,
  - dismiss persists the current seen signature exactly as before,
  - expand/collapse never writes to the server and resets locally when a new signal appears.
- Retention and sensitivity:
  - seen state stays browser-local for the signed-in user only,
  - no sensitive data beyond the existing private lesson summary metadata is introduced.
- Cache/invalidation:
  - retry and reload keep using the same canonical endpoint and invalidation behavior as the existing notice.

## Identity And Rename Contract

- Canonical stable ID:
  - `lessonId` remains the canonical route target for the new-content CTAs.
- Human-readable identifiers:
  - lesson/module titles remain display text only.
- Mutability rules:
  - the slice must not change lesson identity or freshness signatures.
- Compatibility contract:
  - `Open first new lesson` and lesson-list links must keep routing through `/course?lesson=<lessonId>`.
- Observability and repair:
  - regression tests must catch any disclosure change that breaks lesson links or dismiss persistence.

## Scope

- Keep the new-content notice visible when canonical freshness rules say it should appear.
- Make the notice summary-first and collapse the lesson list by default.
- Add one deterministic show/hide control for the lesson list.
- Preserve the existing primary CTA, dismiss behavior, retry state, and freshness analytics.
- Update targeted tests and checkpoint notes for the calmer notice contract.

## Out Of Scope

- Changing how new lessons are detected.
- Adding new analytics events, API fields, or schema work.
- Reworking unrelated My Library cards or cross-route brand styling.
- Any admin-note, builder, or course-completion changes.

## Acceptance Criteria

1. The My Library new-content notice renders in a compact summary state by default.
2. The first-lesson CTA remains immediately available without expanding the lesson list.
3. A single deterministic control reveals and hides the full new-lesson list.
4. Dismiss persistence, stale-signature reopen behavior, and retry/error handling remain unchanged.
5. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/my-library-new-content-notice-component.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-new-content-notice.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Keep the change scoped to the My Library new-content notice only.
- Do not regress the already-shipped freshness truth rule.
- Do not introduce a second notice mode, feed, or pagination concept.

## 10/10 Quality Bar

- The notice should feel calmer at first glance without hiding the primary next step.
- The first-screen summary should privilege scanning, not list management.
- Required states stay explicit:
  - `loading`
  - `error`
  - `collapsed summary`
  - `expanded lesson list`
  - `dismissed`
- Disclosure must feel intentional, not like missing content.

## Help/Guide And Operator Training Contract

- `N/A` for this slice because it changes a private learner-facing notice only, introduces no hidden recovery flow beyond the existing explicit `Retry`, and there is no separate My Library Help/Guide contract for this banner.

## Security, Privacy, and Compliance

- Authentication and user-scoped routing remain unchanged.
- The calmer notice must not expose lesson data outside the existing signed-in My Library surface.
- No new storage, secret handling, or cross-user state is introduced.

## Observability And KPI Contract

- Existing events remain the success signal:
  - `library_new_content_notice_shown`
  - `library_new_content_notice_opened`
  - `library_new_content_notice_seen`
- No new event names are required in this slice.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after one coherent validated new-content notice slice.
- Open/update PR after `npm run verify:pre-pr` is green.

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Checkpoint Log

- `2026-04-03 | working tree | calmer summary-first disclosure UI is now in place for the My Library new-content notice, with updated unit coverage, updated targeted desktop-chromium e2e coverage, npm run typecheck green, npm run lint:briefs:all green, and full npm run verify:pre-pr green (95 passed / 319 skipped) | next: commit, push, open the PR, and take the slice through CI + pre-merge`
- `2026-04-03 | working tree | created a narrower child slice for the remaining My Library new-content calmness note after confirming that the separate freshness-truth note is already shipped; scope is limited to summary-first disclosure, not signal logic | next: implement the collapsible notice UI, update unit/e2e coverage, and run targeted validation`
