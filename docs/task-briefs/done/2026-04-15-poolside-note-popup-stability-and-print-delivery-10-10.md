# Task Brief: Poolside Note Popup Stability And Print Delivery (10/10)

## Metadata

- `id`: `2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-04-29`

## Goal

Make the poolside note and full-session PDF preview open in a stable titled browser tab and stay printable, with no blank popup, black screen, unnamed tab, or empty print result.

## Why This Brief Exists

- Owner review on `2026-04-15` surfaced a real delivery failure on the current poolside note flow:
  - the preview can appear briefly, collapse into a blank or black tab, or print an empty sheet.
- The current builder preview path in [WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx#L2539) uses `window.open("", "_blank")` plus `document.write(...)`, which is testable in mocks but less stable in real browser popup/print behavior.
- Existing tests prove that markup is written and that a popup exists, but they do not yet lock the real delivery contract:
  - the tab must keep its rendered content,
  - the title must be present,
  - the print surface must remain nonblank long enough to print reliably.
- This is a release blocker for the poolside surface:
  - a polished design is not 10/10 if the print artifact can vanish or print blank.

## Dependencies And Boundaries

- Parent builder/runtime brief:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Direct predecessor design brief:
  - [2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md)
- Sibling follow-up brief for final visual polish:
  - [2026-04-15-poolside-note-composition-final-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-composition-final-polish-10-10.md)
- Primary implementation surfaces:
  - [WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no content redesign in this slice beyond what delivery stability requires,
  - no workout-schema changes,
  - no auth or ownership model changes,
  - no canonical export route contract changes unless strictly needed for stable preview delivery.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this slice:

- `UX flow clarity`
- `Reliability and failure handling`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                  | Evidence                                 | Expected Closeout |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| Product goals and IA                          | `supporting` | Opening a poolside note or full-session PDF must still feel like one obvious preview action from the builder.                                             | code review + manual QA                  | `4/5`             |
| UX flow clarity                               | `target`     | Clicking `View PDF` or the poolside preview action must open a stable titled tab that stays visible and printable without owner guesswork or retry loops. | browser QA + targeted e2e                | `5/5`             |
| Visual design quality                         | `supporting` | Delivery hardening must not visually regress the existing print surface.                                                                                  | screenshot review + targeted e2e         | `4/5`             |
| Business logic correctness and data integrity | `supporting` | The preview must still reflect the current local draft and chosen print options truthfully.                                                               | unit + e2e                               | `4/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes owner print delivery only and does not touch admin editing workflows.                                                      | explicit scope rationale                 | `N/A`             |
| Accessibility (a11y)                          | `supporting` | Focus must stay understandable when the preview opens, and the opened tab must expose the same readable document semantics.                               | targeted e2e + browser QA                | `4/5`             |
| Performance (CWV + payloads)                  | `supporting` | Stable delivery must not add heavy runtime cost or new dependencies.                                                                                      | diff review + build/verify evidence      | `4/5`             |
| Data placement and sync boundaries            | `target`     | Local preview state must stay local-only; no delivery fix may mutate or persist data just to render the preview.                                          | code review + brief contract             | `5/5`             |
| Caching and invalidation strategy             | `supporting` | The opened preview must continue to reflect the current draft immediately on each open without stale cached markup.                                       | manual QA + targeted e2e                 | `4/5`             |
| Reliability and failure handling              | `target`     | Poolside and standard preview tabs must avoid blank/black/empty delivery failures in covered local browser QA and regression coverage.                    | targeted unit + targeted e2e + manual QA | `5/5`             |
| Security and authz                            | `N/A`        | N/A because the slice changes no auth gate or authorization contract.                                                                                     | explicit scope rationale                 | `N/A`             |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes delivery mechanics, not data collection or exposure rules.                                                                  | explicit scope rationale                 | `N/A`             |
| Content governance                            | `supporting` | Existing poolside content must remain the source of truth; no shadow markup contract may drift from the current print renderer.                           | code review                              | `4/5`             |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or mutable operator surface changes here.                                                                                   | explicit scope rationale                 | `N/A`             |
| SEO and crawlability                          | `N/A`        | N/A because the preview remains a noindex owner-only print surface.                                                                                       | explicit scope rationale                 | `N/A`             |
| AI discoverability                            | `N/A`        | N/A because no public metadata or retrieval contract changes here.                                                                                        | explicit scope rationale                 | `N/A`             |
| Analytics and KPI observability               | `N/A`        | N/A because the slice adds no new analytics contract.                                                                                                     | explicit scope rationale                 | `N/A`             |
| Commerce and revenue ops                      | `N/A`        | N/A because the slice has no billing or entitlement impact.                                                                                               | explicit scope rationale                 | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice adds no runbook or escalation surface; it only removes unstable print delivery behavior.                                           | explicit scope rationale                 | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because the scope has no finance or reporting effect.                                                                                                 | explicit scope rationale                 | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because the slice changes no locale contract or language routing.                                                                                     | explicit scope rationale                 | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | The fix must stay within the existing Next.js/browser preview stack with no new dependency.                                                               | diff review + validation evidence        | `5/5`             |
| Testing and QA automation                     | `target`     | Add regression coverage for nonblank stable preview delivery in both unit and browser coverage around the poolside/full-session popup flow.               | updated tests + verify gates             | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The solution should reduce browser-specific fragility rather than layering more ad hoc fallback code.                                                     | code review                              | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice must remain a reversible runtime change with no data migration or deploy choreography.                                                          | PR diff + rollback simplicity            | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical data:
  - unchanged; canonical workout data remains the source of truth for saved exports.
- Local data:
  - current local draft and selected print options remain local-only inputs for the immediate preview.
- Sync policy:
  - opening a preview must not persist draft or print state,
  - no new sync path is introduced in this slice.
- Retention and sensitivity:
  - unchanged from the current owner-scoped workout preview contract.
- Cache/invalidation:
  - each open must rebuild from current local draft state and current print options.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice changes no entity identity, slug, or route-param contract.

## Scope

- Replace the fragile popup document delivery path with a more stable print-preview delivery for builder-opened workout previews.
- Preserve truthful local-draft preview behavior for both:
  - full-session PDF preview,
  - poolside note preview.
- Ensure the opened browser tab has a stable document title.
- Add regression coverage so the browser preview remains nonblank and visible after open.
- Keep existing poolside/full-session content unchanged unless a tiny delivery-oriented tweak is required.

## Out Of Scope

- Poolside layout redesign.
- Poolside typography or density polish.
- New export file formats.
- Workout-schema changes.
- Auth/permissions changes.

## Acceptance Criteria

1. Opening the poolside note from the builder no longer results in a blank/black tab in covered browser QA.
2. Opening the full-session PDF preview from the builder remains stable as well.
3. The opened browser tab has a document title instead of behaving like an unnamed transient surface.
4. The preview stays visible long enough to print or save as PDF reliably in covered local QA.
5. Preview content remains truthful to the current local draft and selected poolside options.
6. Targeted unit coverage and targeted Playwright coverage pass.
7. `npm run verify:pre-pr` and `npm run verify:pre-merge` pass.

## Validation

- targeted unit:
  - `npx vitest run tests/unit/workout-builder-hub.test.tsx`
- targeted e2e:
  - `npx playwright test tests/e2e/my-library-workout-builder.spec.ts`
- browser QA:
  - local desktop Chromium
  - local desktop Safari/WebKit-equivalent if available
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local environment:
  - builder route with poolside preview enabled
  - desktop Chrome/Chromium
  - desktop Safari/WebKit-equivalent where feasible
- Preview environment:
  - PR Vercel preview after push

## Constraints

- Keep copy in English.
- Do not fall back to a lower-truth canonical export when the owner is previewing a local draft.
- Do not add a new dependency.
- Keep the implementation small and browser-robust.

## 10/10 Quality Bar

- The owner should click once and get a real printable preview, not a fragile transient popup.
- The opened surface must stay visible, titled, and truthful.
- No blank output or disappearing-tab behavior is acceptable in covered browsers.
- The implementation must be obvious enough to maintain and easy to rollback.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes technical print-preview delivery only and no owner-facing workflow labels or guide content.

## Checkpoint Log

- `2026-04-29 | done | lifecycle triage confirmed this poolside popup/print delivery work shipped in PR #439 as 5863abb and moved the completed brief to done | next: open a new poolside delivery brief only if fresh UI evidence shows a gap`

- `2026-04-15 | implementation start | created a dedicated delivery-stability brief after owner-reported blank/black poolside tabs and empty print output showed that the current popup document.write flow is not stable enough in real browsers | next: harden preview delivery, add regression coverage, and validate in real browser QA before moving on to composition polish`
- `2026-04-15 | implementation complete | replaced transient document.write popup delivery with blob-backed preview tabs, added cleanup for preview object URLs, and tightened unit/e2e coverage around titled nonblank preview delivery | next: include this slice in poolside final-polish PR closeout and pre-merge validation`
