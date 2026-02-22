# Task Brief: Admin Full Content Edit Workflow 10/10

## Metadata

- `id`: `2026-02-22-admin-full-content-edit-workflow-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-22`
- `updated`: `2026-02-23`

## Goal

Admin can safely and quickly edit all website content (modules, lessons, guide sessions, guide drills, products, and page-level content) through one clear workflow with 10/10 UX, UI, readability, and navigation quality.

## Why This Brief Exists

- Today, admin has strong status/revision/delete workflows, but no clear full-field `Edit` flow for existing content rows.
- This creates friction and uncertainty for high-frequency content work.
- A dedicated brief keeps scope clean and reduces risk versus mixing this into unrelated slices.

## Scope

- Add explicit `Edit` action for existing records in:
  - content catalog (`course_module`, `course_lesson`, `guide_session`, `guide_drill`, `page`, `product`),
  - commerce product rows where editable fields exist.
- Add robust edit UI for existing records:
  - open edit mode from row action,
  - show relevant fields per content type,
  - `Save`, `Cancel`, dirty-state warning, validation feedback.
- Improve navigation for editing at scale:
  - clear parent/child hierarchy navigation (`module -> lesson`, `guide -> session/drill`),
  - numbered labels in pickers/lists where order matters,
  - predictable filters/sort and search.
- Preserve and expose safe workflow controls:
  - status transitions (`draft/review/published/archived`),
  - revisions and restore,
  - destructive delete with confirmation.
- Ensure edit behavior is consistent with database source-of-truth and revisions.
- Update Help/Guide so non-technical admins understand:
  - what each action does,
  - how to edit each content type,
  - how to recover from mistakes.

## Out Of Scope

- Full i18n editorial workflow (multi-language copy lifecycle).
- New public page templates unrelated to admin editing.
- Marketing SEO strategy rollout details (owned by SEO brief).
- Replacing Stripe/commerce architecture.

## Dependencies And Boundaries

- Depends on admin schema being ready in environment:
  - tables, grants, and RLS policies already applied.
- Uses existing admin/content foundation brief as parent:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
- SEO boundary:
  - this brief edits/stores SEO fields in admin when present,
  - public SEO rendering/indexing behavior stays in:
    - `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - all content entities, status, ordering, categories, ownership, SEO fields, revisions, audit records.
- Local-only:
  - transient edit form state,
  - local dirty flags and unsaved warnings.
- Sync policy:
  - write-through save to server on explicit `Save`,
  - optimistic UI only when response confirms mutation,
  - deterministic retry path on failures.
- Conflict handling:
  - if stale revision conflict is detected, show explicit conflict message and offer refresh/reopen edit.
- Cache/invalidation:
  - force refresh of affected list row and mirror metrics after successful edit,
  - revalidate affected public content routes when published records are edited.

## 10/10 Platform Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (Score 5)                                                                                            | Evidence Source                          |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Product goals and IA                          | `target`     | Admin can locate edit entrypoint for any supported content type in <=2 clicks from tab entry.                         | e2e + manual QA script                   |
| UX flow clarity                               | `target`     | Edit flow has clear primary action and no dead-end states; all changed surfaces support `loading/empty/error/retry`.  | e2e + UI checklist                       |
| Visual design quality                         | `target`     | Edit controls, spacing, labels, and state styling remain consistent with existing admin design language.              | visual QA + review checklist             |
| Business logic correctness and data integrity | `target`     | Deterministic edits and status transitions; invariant validation blocks invalid writes; no silent data corruption.    | unit tests + API negative-path tests     |
| Admin editor ergonomics                       | `target`     | Typical edit task (open, modify, save) completes quickly with clear validation and recovery guidance.                 | timed manual QA + e2e                    |
| Accessibility (a11y)                          | `target`     | Keyboard operable edit workflow, visible focus, proper labels/errors, no serious/critical issues on changed surfaces. | playwright + axe checks where applicable |
| Performance (CWV + payloads)                  | `supporting` | No meaningful regression for `/admin` route and edited API latency remains stable.                                    | build + smoke perf checks                |
| Data placement and sync boundaries            | `target`     | Briefed local/server boundaries implemented exactly; cache invalidation deterministic after edit.                     | code review + tests                      |
| Caching and invalidation strategy             | `target`     | Edited data appears predictably after save/refresh; published changes revalidate dependent reads.                     | e2e + unit integration checks            |
| Reliability and failure handling              | `target`     | Expected failure modes return explicit non-500 behavior and actionable UI guidance.                                   | negative-path tests                      |
| Security and authz                            | `target`     | Write actions fail closed with role checks (`401/403`) and validated payloads; no unauthorized writes possible.       | API tests + e2e unauthorized assertions  |
| Privacy and compliance                        | `supporting` | No sensitive value leakage in errors/logs; audit payloads stay redacted where required.                               | log review + tests                       |
| Content governance                            | `target`     | Owner/status/revision model remains enforced for all edited content records.                                          | schema + e2e revisions                   |
| Admin workflow and editability                | `target`     | Full-field edit is available and understandable for all in-scope content types and products.                          | e2e per type + manual QA                 |
| SEO and crawlability                          | `supporting` | Editing SEO-relevant fields in admin does not break metadata contracts.                                               | targeted metadata tests                  |
| AI discoverability                            | `supporting` | Content model edits preserve structured, stable identifiers and public semantic compatibility.                        | schema + mapping checks                  |
| Analytics and KPI observability               | `target`     | Content edit mutations emit required operational events/log records for audit and KPI tracking.                       | event/log assertions                     |
| Commerce and revenue ops                      | `supporting` | Product edit flow remains consistent with entitlement/checkout linkage.                                               | unit + integration checks                |
| Incident response and support operations      | `supporting` | Troubleshooting steps for failed edits documented in Help/Guide and runbook notes.                                    | docs + QA walkthrough                    |
| Finance and reporting operations              | `supporting` | Product metadata edits do not break reconciliation-critical identifiers.                                              | validation rules + tests                 |
| i18n operational readiness                    | `supporting` | Edit model does not introduce locale blockers for future translation rollout.                                         | schema/design review                     |
| Stack-fit and dependency discipline           | `target`     | Uses existing Next.js/TypeScript/Supabase/testing stack; no unnecessary dependency added.                             | dependency diff                          |
| Testing and QA automation                     | `target`     | Unit + e2e + negative-path coverage added for edit actions across in-scope content types.                             | CI checks + coverage evidence            |
| Scalability and cost efficiency               | `supporting` | No obvious N+1 or high-cost query patterns added in edit/read refresh paths.                                          | query/code review                        |
| DevOps and rollback readiness                 | `target`     | Revision restore and rollback-safe edit behavior proven in tests and documented in admin help.                        | e2e revisions + docs                     |

## UX/UI/Readability Contract (10/10)

- Every editable field has:
  - clear label,
  - short helper text when needed,
  - inline validation message in plain language.
- No ambiguous button labels:
  - use verb-first labels (`Save changes`, `Cancel edit`, `Move to review`).
- Readability:
  - concise sections,
  - consistent heading hierarchy,
  - no dense text walls in edit UI.
- Navigation:
  - easy movement between related entities (module to lessons, guide to sessions/drills),
  - stable ordering labels where sequence matters.
- Required UI states on changed surfaces:
  - `loading`,
  - `empty`,
  - `error`,
  - `retry`,
  - `success`.

## Security, Privacy, And Compliance

- Role gates:
  - `viewer`: read only,
  - `editor/admin`: edit allowed per policy,
  - destructive actions still constrained per role policy.
- Input validation:
  - strict server-side parsing for all editable fields.
- Fail-closed behavior:
  - unauthorized => `401/403`,
  - invalid payload => `400`,
  - never generic `500` for expected deny/validation paths.
- Auditability:
  - every mutation tracked with actor, action, timestamp, before/after snapshot.

## Acceptance Criteria (Measurable)

1. Existing content rows expose clear `Edit` entrypoint for all in-scope types.
2. Admin can update field values for existing module/lesson/session/drill/page/product records and persist to DB.
3. Status flow, revisions, restore, and delete remain functional and understandable with the new edit flow.
4. Editing UX includes deterministic validation and dirty-state warnings.
5. Help/Guide includes complete plain-language explanation of:
   - content page flow,
   - every main button/action,
   - what can be edited now,
   - how to recover from mistakes.
6. Negative-path tests confirm unauthorized users cannot edit protected records.
7. `npm run verify:pre-pr` and CI required checks pass.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e -- tests/e2e/admin-foundation.spec.ts`
- `npm run test:e2e -- tests/e2e/admin-content-parity.spec.ts`
- `npm run test:e2e -- tests/e2e/admin-help-center.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
- Preview:
  - PR Vercel preview URL
- Device/browser matrix for changed admin surfaces:
  - desktop Chromium,
  - desktop Safari/WebKit,
  - desktop Firefox,
  - tablet viewport,
  - mobile viewport.

## Implementation Slices

1. Edit action and form-state architecture for existing content rows.
2. Type-specific field layouts and validation rules.
3. Hierarchy navigation and readability polish (numbers/labels/order cues).
4. Revision and rollback UX alignment with edit mode.
5. Help/Guide expansion and non-technical documentation pass.
6. Negative-path hardening and e2e regression gates.

## Risks And Mitigations

- Risk: edit UI introduces accidental invalid writes.
  - Mitigation: strong server validation + explicit inline errors + save disable rules.
- Risk: confusing overlap between status actions and edit mode.
  - Mitigation: clear separation and button grouping in row UI.
- Risk: regressions in existing admin workflows.
  - Mitigation: targeted e2e + pre-merge full verify.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from current implementation slice.

## Checkpoint Log

- `2026-02-23`: Slice 4 ready for PR on branch `feat/admin-content-edit-phase4-filter-sort-aw013`.
  - Added admin list controls for `status` filter and `sort` selection.
  - Added one-click type chips with counts (`All`, `Course module`, `Course lesson`, `Guide session`, `Guide drill`) for faster findability.
  - Kept existing search + type filter and expanded help text with new control explanations.
  - Updated admin e2e coverage for status/sort controls and quick-type chips.
  - Validation: targeted admin e2e passed; `npm run verify:pre-pr` passed (`66 passed`, `138 skipped`).

- `2026-02-23`: Slice 3 ready for PR on branch `feat/admin-content-edit-phase3-hierarchy-aw013`.
  - Added admin content list search + type filter for faster findability.
  - Added clearer per-row metadata context for modules/lessons/sessions/drills.
  - Updated Help/Guide with search/filter and expanded content edit scope wording.
  - Updated e2e coverage for new controls and help text.
  - Validation: `npm run verify:pre-pr` passed (`66 passed`, `138 skipped`).

- `2026-02-23`: Slice 2 merged to `main` (PR #100, commit `a7868fd`).
  - Inline edit now covers: `course_module`, `course_lesson`, `guide_session`, `guide_drill`.
  - Help/Guide reflects updated edit scope and button behavior.
  - Post-merge hygiene complete: local `main` synced and feature branch cleaned up.
  - Next recommended slice: hierarchy/readability polish + prepare page/product edit scope.

- `2026-02-23`: Slice 2 started on branch `feat/admin-content-edit-phase2-guide-types-aw013`.
  - Expanded inline edit support to `guide_session` and `guide_drill`.
  - Updated Help/Guide copy to reflect current edit scope.
  - Updated admin e2e coverage for guide session/drill edit entry and cancel flow.
  - Validation: targeted admin e2e passed; `npm run verify:pre-pr` passed (with expected environment-based skips).

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief marks scorecard categories as `target`/`supporting`/`N/A` with measurable thresholds.
- Closeout must include achieved scores (`0-5`) for target categories and explicit defer/fix for any target `<4`.

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
