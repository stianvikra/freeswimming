# Task Brief: Admin Dashboard Editor Simplification (10/10)

## Metadata

- `id`: `2026-06-15-admin-dashboard-editor-simplification-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-15`
- `updated`: `2026-06-15`
- `execution_mode`: `implementation authorized by owner on 2026-06-15`
- `parent_intake`: `docs/task-briefs/planned/2026-06-15-admin-notes-june-15-disposition-intake-10-10.md`
- `source`: Package A from live admin-note audit on `2026-06-15`

## Brief Audit Record

- `last_audited`: `2026-06-15`
- `base`: clean synced `main@816ed7b4`
- `audit_status`: `ready`
- `decision`: Implement this as the next admin-notes child after Course Lesson Design Readability And Completion closed in PR `#1136` and closeout PR `#1137`.
- `reason`: Package A source notes all point to `/admin` dashboard and course editor friction: repeated helper copy, button sprawl, unclear action hierarchy, quick-note copy weight, advanced/fallback field discoverability, auto-growing textarea coverage, and QA/test residue clarity.
- `must_refresh_before_execution_if`: Refresh if `AGENTS.md`, scorecard categories, `AdminWorkspace`, `AdminContentManager`, `AdminNoteQuickCaptureLauncher`, `AdminHelpCenter`, admin notes status/schema behavior, content API authz, course content editor contracts, screenshot handoff rules, route/label/support sweep rules, or verification lanes change before implementation starts.

## Goal

Make the admin dashboard and course/content editor faster to scan and safer to operate by reducing low-value copy, tightening action hierarchy, preserving edit/publish/data contracts, and aligning Help/Guide/support evidence with any changed labels or workflows.

## Pre-Implementation Owner Explanation

Vi skal rydde i adminflaten slik at operatoren ser riktig handling raskere: mindre hjelpetekst i selve dashboardet, roligere knappehierarki, bedre plassering av Quick note, tydeligere course editor-felt og tryggere status-/delete-flyt. Dette betyr noe fordi admin er arbeidsverktøyet for innhold, publisering og support; mindre rot gir mindre feil. Utenfor scope er ny admin-arkitektur, databaseendringer, nye roller, public course-page polish, commerce/pricing, analytics-modeller og Package C-produktbeslutninger.

Fremoverkompatibilitet: nye admin-tabs, content-typer, statuser, note-kontekster og editor-handlinger skal bruke eksisterende typed contracts og delte admin-primitives. Nye workflow-labels, destructive actions, supportprosedyrer eller content-typer krever eksplisitt Help/Guide-mapping, tests og owner-review.

## Codex Skill + Stack Readiness Radar

Skill/capability audit:

| Capability                         | Evidence                                                    | Current Status | Recommended Trigger                                                                 | Boundary                                                       |
| ---------------------------------- | ----------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `playwright`                       | `/Users/stianvikra/.codex/skills/playwright/SKILL.md`       | `installed`    | Screenshot handoff, `/admin` browser QA, keyboard/a11y checks, visual regressions.  | Does not replace screenshot approval stop.                     |
| `imagegen`                         | `/Users/stianvikra/.codex/skills/.system/imagegen/SKILL.md` | `available`    | Only if a later admin visual asset needs generated bitmap imagery.                  | Not for admin primitive/layout cleanup.                        |
| `stripe:stripe-best-practices`     | Stripe plugin skill metadata                                | `available`    | Only if Package C pricing/commercial note is promoted later.                        | Not needed for this admin/editor simplification child.         |
| Supabase/admin service contracts   | Existing admin content and notes routes/tests               | `available`    | Preserve admin authz and server-canonical content/note state during implementation. | No schema/RLS/data migration authorized by this planned brief. |
| Local Codex install/config changes | Session metadata and repo radar rules                       | `not needed`   | N/A                                                                                 | Do not install or configure local skills/plugins.              |

Systemic findings:

| Surface                            | Finding                                                                                                                                           | Severity | Recommended Type                 | Owner Decision Needed                                                                             | Follow-Up Brief Path                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Admin dashboard shell              | `AdminWorkspace` still carries visible tab subtitles plus an active-section panel with Quick note helper copy; notes ask for less text.           | `high`   | `bounded implementation child`   | `no`; target is simplification with screenshot review.                                            | this brief                                                                                  |
| Course/content editor actions      | `AdminContentManager` exposes many inline actions across overview rows, focused lesson rows, edit forms, status transitions, QR, and revisions.   | `high`   | `bounded implementation child`   | `no` for hierarchy cleanup; `yes` only if implementation would remove an existing capability.     | this brief                                                                                  |
| Advanced/fallback and support copy | Advanced/fallback fields are necessary for stable IDs and legacy content, but source notes show the current naming/copy still confuses operators. | `high`   | `bounded implementation child`   | `no`; relabel to `Technical fallback fields` after preserving stable IDs and legacy editability.  | this brief                                                                                  |
| Lesson video planning notes        | Owner requested an admin-only container for lesson video script/recording notes during implementation.                                            | `medium` | `bounded implementation child`   | `no`; use existing content `body` JSON, no migration, and keep it out of public lesson rendering. | this brief                                                                                  |
| Public course lesson polish        | Package B is complete on current base.                                                                                                            | `info`   | `do not do`                      | `no`; shipped via PR `#1136` and closeout PR `#1137`.                                             | `docs/task-briefs/done/2026-06-15-course-lesson-design-readability-and-completion-10-10.md` |
| Product/ops/commercial backlog     | Split screen, duplicate-tab favicon, habits history, bulk workout delete, and pricing are separate products/data decisions.                       | `medium` | `deferred architecture decision` | `yes`; each needs separate priority/scope.                                                        | `TBD after owner decision`                                                                  |

Return path:

- Parent intake: `docs/task-briefs/planned/2026-06-15-admin-notes-june-15-disposition-intake-10-10.md`.
- Last merged workstream: Course Lesson Design Readability And Completion PR `#1136` / closeout PR `#1137`, current `main@816ed7b4`.
- Current active child: this Package A in-progress brief.
- Exact next execution step: implement scoped admin/dashboard/editor simplification, then stop for screenshot approval before `npm run verify:pre-pr`.

## Source Note Disposition

These Package A source notes were already captured by the parent intake and marked done in live admin notes. This child owns their implementation disposition.

| Note ID                                | Title                                        | Context  | Child Disposition                                                                                 |
| -------------------------------------- | -------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `f597d80d-2dd3-416f-8227-494601d82895` | Remove text                                  | `/admin` | Remove low-value editor/dashboard helper copy or move necessary guidance to Help/Guide.           |
| `2a242279-b3db-4aac-bdc9-f7a305616c15` | Snapshot mismatch                            | `/admin` | Verify whether visible mismatch is QA/test residue, mirror snapshot copy, or stale data state.    |
| `71775e69-62f4-4d68-8f08-09b77dfa9ba2` | Button chaos                                 | `/admin` | Consolidate row/card action hierarchy without removing required edit/publish/recovery actions.    |
| `a1418682-e246-4fb4-a5d5-b4f54cf529bb` | Remove text from quick note                  | `/admin` | Reduce Quick note explanatory copy while preserving draft/recovery behavior.                      |
| `cbeba2f6-9c6d-4ce9-bf7d-2031b85da982` | CODEX improvements                           | `/admin` | Keep as process feedback; only implement concrete admin UX/test improvements scoped here.         |
| `3f068c49-2ee6-45c9-9bc7-ef66dbd11173` | Advamced fallback fields?                    | `/admin` | Audit advanced/fallback field label, purpose, grouping, and Help/Guide copy before changing.      |
| `5f8a0f9a-6953-44c0-a42c-4d8a72dd601e` | boxes needs to auto expand to show all text  | `/admin` | Extend/verify auto-growing textarea behavior for changed editor textareas.                        |
| `f52b5982-773e-44bf-aeff-53b7225b5d34` | Needs to be changed button chaos             | `/admin` | Tighten status/action layout, especially low-frequency and destructive actions.                   |
| `a427fd75-3c4d-486c-a392-246302628a5d` | Dashboard more button chaos                  | `/admin` | Evaluate lesson status dropdown/action grouping in dashboard/editor contexts.                     |
| `73f3c82e-4e7c-4693-8d40-866684ac734a` | Admin - Lesson containers Buttons chaos      | `/admin` | Right-size lesson container/editor actions and avoid repeated primary buttons.                    |
| `e4824524-534d-4348-b9c0-b8ef6ab01db4` | Reove text admin dashboard                   | `/admin` | Remove or relocate dashboard explanatory copy.                                                    |
| `1a243f34-ad4b-44b6-a19b-f47ed3e8e753` | Admin dashboard - Remove text                | `/admin` | Remove repeated focus guidance once UI hierarchy makes the path obvious.                          |
| `b647dc95-aea1-4400-a117-629aac12c9f4` | DASHBOARD - ADMIN Menu - remove sub headings | `/admin` | Simplify admin tab subtitles/scan text while preserving accessible names and active state.        |
| `ac26c2a6-08cb-46b4-80fc-5bb3962465fc` | ADMIN DASHBOARD - Remove container           | `/admin` | Decide whether active-section/Quick-note container can be collapsed, simplified, or repositioned. |
| `37325024-a7eb-41cd-88c2-0262a281bad3` | Remove buttons                               | `/admin` | Remove duplicate top-container/navigation actions only when equivalent path remains discoverable. |
| `487e2824-eec0-44b8-a2d1-4f0559227d8b` | DASHBOARD - Remove text                      | `/admin` | Remove long dashboard explanatory copy and document any Help/Guide move.                          |

## Current-State Audit Evidence

Code surfaces checked on `main@816ed7b4`:

| Surface                                                                           | Evidence                                                                                                                                                                         | Audit Finding                                                                        |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `components/admin/AdminWorkspace.tsx`                                             | Top-level tab labels include subtitles; active-section panel includes Quick note with description.                                                                               | Prime target for dashboard text reduction and Quick note placement.                  |
| `components/admin/AdminContentManager.tsx`                                        | Course Workspace / All Content tabs, module overview rows, focused lesson rows, edit form actions, status actions, QR, revisions, delete dialog, and `admin-auto-grow-textarea`. | Prime target for action hierarchy, advanced/fallback clarity, and textarea coverage. |
| `components/admin/AdminNoteQuickCaptureLauncher.tsx`                              | Quick note supports collapse, draft lock, image staging, saved recovery, Notes jump, and role-gated creation.                                                                    | Must preserve behavior while reducing visible copy.                                  |
| `components/admin/AdminHelpCenter.tsx`                                            | Help/Guide documents Content workflow, buttons, Quick note, advanced/fallback fields, and release quality rules.                                                                 | Any label/workflow change requires same-PR Help/Guide and tests.                     |
| `tests/unit/admin-workspace-shell.test.tsx`                                       | Covers admin tab order, focusability, active state, Quick note trigger class, Help/Guide subnav.                                                                                 | Update if tab subtitle/copy or shell structure changes.                              |
| `tests/unit/admin-content-manager-state.test.tsx`                                 | Broad component coverage for content manager states and editor contracts.                                                                                                        | Add focused assertions for changed action hierarchy/copy.                            |
| `tests/e2e/admin-foundation.spec.ts`                                              | Covers admin tab navigation, Course Workspace, editor fields, advanced/fallback, status transitions, revisions, delete dialog.                                                   | Add or update targeted e2e for final changed workflow and screenshot path.           |
| `tests/e2e/admin-help-center.spec.ts` and `tests/unit/admin-help-center.test.tsx` | Assert Help/Guide copy for Content workflow, Quick note, advanced/fallback, and runbook links.                                                                                   | Update when visible workflow guidance changes.                                       |

## Scope

- Admin dashboard shell:
  - reduce repeated tab subtitles, active-section copy, and dashboard helper text,
  - place the admin section menu as a right-side desktop rail so the main editing content reads from the left edge,
  - collapse mobile admin navigation into a compact horizontal tab row instead of a full-height list before content,
  - simplify or reposition the active-section / Quick note container,
  - keep URL-driven tab state, active state, keyboard focus, and role-gated Quick note access.
- Admin course/content editor:
  - audit and tighten primary/secondary/destructive action hierarchy in Course Workspace and All Content,
  - consolidate low-frequency row actions into predictable grouping or progressive disclosure where it improves scanability,
  - preserve edit, preview, open lesson, QR link creation, revisions, status changes, delete, module move, lesson move, and create-in-context capabilities,
  - add admin-only lesson video planning notes for script, shot plan, retake ideas, and recording reminders without changing public lesson output,
  - make advanced/fallback fields clearer without deleting stable ID, support-action, or legacy fallback controls,
  - extend or verify auto-growing textarea behavior for changed textareas.
- Admin notes / Quick note:
  - reduce visible helper copy in dashboard Quick note entry,
  - preserve draft lock, collapse/reopen, image staging, saved recovery, Notes jump, and existing admin-note authz behavior.
- Help/Guide and support:
  - update Help/Guide and tests if labels, actions, workflow order, fallback-field guidance, quick-note guidance, or recovery behavior changes,
  - run route/label/support-surface sweep before broad gates.
- Full admin-system audit within this slice:
  - classify unaffected admin managers as no-change/regression-only,
  - do not silently change Commerce, Operations, Analytics, Users, Messages, QR Links, Notes manager, Categories, or Email templates behavior outside label/support fallout.
- Screenshot handoff:
  - required before `npm run verify:pre-pr` because this is visible admin UI work.

## Out Of Scope

- Runtime implementation beyond this brief.
- Public course lesson page redesign; Package B is done.
- New admin route architecture, new admin tabs, or broad manager rewrites.
- Database schema changes, migrations, RLS changes, generated DB types, or new Supabase tables.
- Admin role/permission model changes.
- New analytics event taxonomy, raw event drilldown, finance reporting, pricing, checkout, Stripe, entitlement, or commerce catalog changes.
- Deleting admin notes or source-note rows.
- Package C items: split-screen training, duplicate-tab favicon, habits history editing, saved-workout bulk delete, subscription pricing.
- Final merge; merging requires explicit owner approval.

## Product Decisions Already Made

| Decision                   | Outcome                                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next child after Package B | Package A admin dashboard/editor simplification.                                                                                                                |
| Broad admin audit          | Required for all scorecard categories, but runtime changes stay scoped to Package A surfaces.                                                                   |
| Help/Guide impact          | Required in same PR when labels, actions, workflow, fallback-field guidance, or recovery behavior change.                                                       |
| Visual review              | Required screenshot handoff and owner approval before pre-PR gate.                                                                                              |
| Destructive/data behavior  | Preserve existing authz and mutation contracts; any removal of capability needs owner decision.                                                                 |
| Video planning notes       | Store as admin-only `body.videoPlanning.notes` on course lesson content rows; no migration, no public rendering, no separate production workflow in this slice. |

## Admin Surface 10/10 Contract

For this child to count as `10/10`, the shipped admin surface must meet these rules:

- Admin dashboard is a work console, not a documentation page; in-page copy explains only the next action needed right now.
- Desktop admin navigation sits to the right of the work area; mobile navigation stays compact so content appears quickly.
- Global site chrome remains visible in admin screenshots; admin-specific headings do not duplicate the active tab, workflow label, and content list label before the operator reaches the work area.
- Admin uses the same global header spacing rhythm as the rest of the app; no extra route-local top whitespace is stacked below `SiteChrome`.
- Quick note sits in the admin header action group, not in a separate empty workspace stripe.
- Course module overview cards use the available work-area width unless a future multi-column design has a clear scanning benefit.
- Help/Guide owns durable training, caveats, recovery steps, and workflow explanations.
- Primary actions are rare and obvious; secondary actions are grouped; destructive actions are visually separate and confirmed.
- Repeated row actions do not create a wall of equal-weight buttons on desktop or mobile.
- Course Workspace remains the production-first authoring path; All Content remains audit/cross-type filtering.
- Technical fallback controls remain available, but stable IDs, support actions, and legacy fields do not interrupt normal authoring.
- Long text fields remain readable without manual resizing where the editor is expected to read or author multi-line content.
- Status transitions stay deterministic and reversible where current workflow supports it.
- Accessibility semantics remain keyboard/focus/screen-reader safe.
- New or changed labels are reflected in tests and Help/Guide before the PR is considered ready.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode for this child: all `target` categories must close at `5/5`.

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Content governance`
- `Admin workflow and editability`
- `Incident response and support operations`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin dashboard clearly separates navigation, active workspace, quick capture, and content-editing jobs with no duplicated explanation.                                | screenshots + component/e2e tests + owner review                | `5/5`                   |
| UX flow clarity                               | `target`     | Operators can identify the next edit/status/preview/recovery action without equal-weight button clutter or dashboard text overload.                                    | screenshot handoff + targeted Playwright                        | `5/5`                   |
| Visual design quality                         | `target`     | Changed admin surfaces use existing tokens, stable spacing, responsive action grouping, no clipped text, no overlapping controls, and no nested-card clutter.          | before/after or after/reference screenshots desktop/mobile      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing content IDs, runtime lesson IDs, slugs, statuses, QR prefill, revisions, delete confirmation, note context, and save behavior remain deterministic.           | unit/e2e tests + code review                                    | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency authoring actions take fewer scan decisions; low-frequency/destructive actions are grouped; advanced fields are understandable but not dominant.        | admin workflow QA + screenshots + tests                         | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Changed buttons, menus/disclosure controls, tab state, forms, status messages, dialogs, and Quick note entry preserve labels, focus, keyboard, and aria state.         | Testing Library + Playwright/a11y assertions where practical    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency or heavy client feature; `/admin` JS and interaction cost do not materially grow beyond existing admin route behavior.                               | package diff + build/perf gate                                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Content, notes, categories, revisions, and admin auth remain server-canonical; local UI state stays limited to filters, open panels, drafts, and disclosures.          | data contract review + tests                                    | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing no-store/admin fetch and refresh behavior is preserved unless explicitly documented; changed writes refresh current client state deterministically.           | route/cache diff review + admin e2e                             | `5/5`                   |
| Reliability and failure handling              | `target`     | Loading, empty, warning, error, no-results, dirty edit, failed save, failed category load, and delete confirmation states remain deterministic.                        | targeted negative/failure tests + existing e2e                  | `5/5`                   |
| Security and authz                            | `target`     | Protected admin capabilities remain role-gated and fail closed; no non-admin route gains note/content mutation access; no secrets or private note bodies leak.         | authz no-regression review + existing route tests when impacted | `5/5`                   |
| Privacy and compliance                        | `target`     | Admin note bodies, private user/payment/training details, provider payloads, tokens, and raw env values are not exposed in docs, UI, screenshots, logs, or tests.      | privacy diff review + screenshot inspection                     | `5/5`                   |
| Content governance                            | `target`     | Dashboard/editor copy has one owner: operational guidance moves to Help/Guide or is deleted as low value; status/publish/revision labels stay aligned.                 | Help/Guide assertions + route/label/support sweep               | `5/5`                   |
| Admin workflow and editability                | `target`     | Create/edit/reorder/preview/open/publish/review/archive/revise/delete/restore workflows remain available and easier to scan.                                           | e2e admin foundation coverage + targeted additions              | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: admin routes are private, but editor changes must not alter public course metadata/canonical behavior by accident.                                    | public route diff/no-change review                              | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: no public AI-facing content strategy changes; edited admin labels should not hardcode public semantic output.                                         | public markup no-change review                                  | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics taxonomy; existing admin/content/course analytics labels and event interpretation must not become stale.                             | analytics diff review + Help/Guide no-change/update evidence    | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Commerce tab label may be regression-scanned, but no prices, products, checkout, entitlements, subscriptions, or revenue behavior change.             | explicit no-commerce-diff review                                | `4/5`                   |
| Incident response and support operations      | `target`     | Any changed workflow labels, recovery copy, Quick note behavior, test-residue cleanup guidance, or destructive action semantics update Help/Guide/runbooks in same PR. | Help/Guide + runbook/sweep evidence                             | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child changes no checkout, Stripe, subscriptions, refunds, invoices, payouts, accounting exports, finance reports, or reconciliation truth.           | explicit finance scope rationale                                | `N/A`                   |
| i18n operational readiness                    | `target`     | Shorter admin labels and responsive layouts avoid fixed English-only assumptions; new strings remain centralized enough for future translation workflow.               | copy/layout review + screenshots                                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js App Router surfaces, existing React components, TypeScript contracts, admin primitives, Tailwind tokens, and test stack; add no dependency by default.   | dependency diff + architecture review                           | `5/5`                   |
| Testing and QA automation                     | `target`     | Update/add targeted unit, component, e2e, Help/Guide, screenshot evidence, `lint:briefs`, `verify:pre-pr`, CI, and `verify:pre-merge`.                                 | local validation + CI                                           | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Improvements apply through shared admin components and typed data lists, not one-off hardcoding to current source-note titles or two rows.                             | component reuse + future-value/unknown-state review             | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/provider dependency by default; rollback is normal code revert; source notes remain traceable through parent and child briefs.                            | git diff + PR summary + rollback note + gates                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminWorkspace.tsx`, `components/admin/AdminContentManager.tsx`, `components/admin/AdminNoteQuickCaptureLauncher.tsx`, `components/admin/AdminManagerState.tsx`, and shared UI/action helpers.
  - Do not create a parallel admin route, separate editor shell, or route-local one-off markup for only Package A notes.
  - Preserve URL-driven `tab` state and client-side admin workspace behavior.
- TypeScript/domain contracts:
  - Reuse `AdminTab`, `AdminRole`, `AdminContentType`, `AdminContentStatus`, admin note context, course runtime identity, and content editor state contracts.
  - Unknown future tabs/statuses/content types should fail into typed fallback/hidden state, not broken UI.
- Supabase/data layer:
  - No schema, migration, RLS, storage, or generated type changes are authorized by this planned brief.
  - Existing content/note/revision/category writes remain server-canonical through current admin APIs.
  - If the snapshot mismatch note proves to be live data or QA residue cleanup, mutate only explicit QA/test records through existing admin-safe cleanup paths and record evidence.
- Admin/auth:
  - Protected admin mutation paths must continue to fail closed.
  - Editor-only and admin-only actions must preserve current role boundaries.
- UI/reference surface:
  - Existing AW-006 admin token/action hierarchy is the mature reference surface.
  - Use existing `fs-cta-*`, card, field, state, focus, and mobile action primitives before adding markup patterns.
  - Do not use icon-only controls without accessible labels/tooltips when the action is not universally obvious.
- Testing:
  - Focused unit/component tests for changed admin shell/editor copy/action contracts.
  - Targeted Playwright for representative admin dashboard, course workspace, lesson editor, Quick note entry, and Help/Guide states.
  - Screenshot handoff before broad pre-PR gate.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin content rows, content status, course module/lesson ordering, runtime IDs, slugs, revisions, notes, categories, QR links, admin roles, source-note completion status, and lesson `body.videoPlanning.notes`.
- Local/UI data:
  - Active tab search param, selected filters, selected module workspace, open/closed details, unsaved edit form state, Quick note draft state, screenshot artifacts, and transient notices.
- Sync policy:
  - Content/editor writes continue to refresh from server response.
  - Quick note draft can follow supported surfaces but remains attached to its locked context.
  - If any save/status/delete/update fails, leave server state unchanged and show actionable error/retry.
- Retention and sensitivity:
  - Do not copy private note bodies or user/provider payloads into docs or screenshots.
  - Admin screenshots must avoid raw secrets/env values and should use local/mock/test-safe data when needed.
- Cache/invalidation:
  - Admin fetches remain fresh/no-store or current client refresh semantics.
  - No public course cache behavior changes are authorized unless implementation discovers a direct label/cache fallout and documents it.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_notes.id`, content row `id`, course lesson runtime ID, module ID, QR link ID, revision ID, and admin role values.
- Human-readable identifiers:
  - Admin tab labels, titles, slugs, section headings, button labels, Help/Guide text, and note titles are editable display labels.
- Mutability rules:
  - Runtime IDs and stored IDs remain immutable.
  - Labels/copy may be renamed when meaning stays the same and tests/Help/Guide are updated.
- Rename vs repurpose policy:
  - Rename labels in place only when the workflow is the same.
  - New workflow semantics, destructive behavior, roles, or content entity meaning require a separate brief/entity/mapping.
- Compatibility contract:
  - Existing links such as `/admin?tab=content`, `/admin?tab=notes`, admin note ID jumps, course preview URLs, and public lesson URLs remain compatible.
- Observability and repair:
  - If an old label appears in tests/docs after implementation, record whether it is updated, intentionally retained, or deferred by route/label/support sweep.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin tabs, content types, content statuses, course modules/lessons, note contexts, QR placements, Help/Guide sections, future locale strings, and future editor action groups.
- Source of truth:
  - Typed admin/workspace/content contracts and server-canonical rows, not current source-note titles.
- Additive behavior:
  - New admin tabs should inherit the simplified shell pattern.
  - New content statuses should either render through canonical status label/class maps or fail closed until mapped.
  - New content types should use shared row/action/edit contracts where possible.
  - Future lesson video planning fields should extend `body.videoPlanning` as admin-only data unless a separate public publishing decision maps them into course output.
  - New note contexts should remain visible through raw context fallback and not auto-close without disposition.
- Explicit mapping requirements:
  - New workflow labels, destructive actions, recovery behavior, admin roles, content entity types, commerce/finance meanings, and support runbook procedures require explicit Help/Guide/test mapping.
- Unknown or deprecated values:
  - Unknown tabs fall back to the default content tab through existing parser behavior.
  - Unknown roles must not expose privileged actions.
  - Unknown/deprecated content values render safe fallback or are blocked by validation before mutation.
- Test/evidence:
  - Include at least one regression proving changed UI is not hardcoded to the Package A note titles.
  - Include route/label/support sweep evidence for labels/actions touched.

## Help / Guide Impact

Required if implementation changes any visible admin label, action grouping, workflow order, Quick note guidance, advanced/fallback guidance, destructive action wording, test-residue guidance, or recovery behavior.

Minimum Help/Guide checks:

- Content workflow.
- Buttons explained.
- Notes / Quick note.
- Technical fallback fields.
- Troubleshoot / runbook references.
- Release quality / Help/Guide same-PR rule.

If implementation only changes visual grouping while preserving labels and workflows, record explicit no-impact rationale in the checkpoint and PR handoff.

## Screenshot Handoff Requirement

Required before `npm run verify:pre-pr`.

- Artifact folder pattern: `output/admin-dashboard-editor-simplification-YYYY-MM-DD-HHMMSS`.
- Handoff type: `before/after` when practical; otherwise `after/reference`.
- Minimum representative screenshots:
  - desktop `/admin?tab=content` dashboard shell / course workspace overview,
  - desktop focused lesson editor with video planning notes and Technical fallback state,
  - mobile or narrow admin dashboard/content action layout,
  - Quick note entry state if placement/copy changes,
  - Help/Guide state if labels/workflow guidance changes.
- Handoff must include known visual caveats and confirm whether product-rendering/admin UI files changed after capture.

## Route / Label / Support-Surface Sweep

Required before the first broad gate if implementation changes labels, actions, support copy, Help/Guide, runbooks, recovery behavior, or destructive-action wording.

Minimum directories/surfaces:

- `app/`
- `components/`
- `components/admin/`
- `lib/admin/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/task-briefs/planned/`
- `docs/task-briefs/in-progress/`
- `docs/task-briefs/done/`
- Help/Guide assertions and admin screenshot/e2e fixtures.

Minimum identifiers:

- `Active section`
- `Quick note`
- `Course Workspace`
- `All Content`
- `Technical fallback fields`
- `View changes`
- `Open preview`
- `Open lesson`
- `Create QR link`
- `Move to review`
- `Publish`
- `Archive`
- `Delete`
- `Revisions`
- `Course workspace overview`
- `Content scope`
- `Snapshot`
- `mismatch`
- `QA/test records`

Record evidence in the active brief checkpoint and PR handoff.

## Session-Step / Workout Domain Evidence

`tests/e2e/my-library-workout-builder.spec.ts` is touched only to move existing project skip behavior out of the test body and prevent WebKit teardown flakes for projects that should never execute those workout save-flow tests.

- Product behavior: no workout builder, session-step, program, saved-workout, export, or public/private workflow code changed.
- Reference contract: `docs/design/session-step-surface-contract.md` remains the canonical session-step UI contract and is not changed by this test-only hardening.
- Domain invariant evidence: the targeted workout-builder spec no longer creates WebKit contexts for desktop-Chromium-only save-flow tests; existing save-flow assertions remain unchanged for the project where they run.

## Acceptance Criteria

1. Parent intake is refreshed to show Package B done and Package A selected next.
2. Current `/admin` shell and content editor are audited before runtime code changes.
3. Dashboard/helper copy is reduced or intentionally moved to Help/Guide with no operator dead ends.
4. Desktop admin navigation sits on the right side of the work area, while mobile navigation stays compact and does not push the main content below a long menu.
5. Global header/logo remains present in screenshot evidence, and the dashboard does not show duplicate `Content`/workflow/list headings before the work area.
6. Admin top spacing follows the global app chrome rhythm and does not add a large blank band under the header.
7. Quick note has no standalone empty container; it remains one-click reachable from the admin header.
8. Course module overview rows use full available content width and do not leave half-width cards beside empty space.
9. Admin action hierarchy is simplified without removing required edit/publish/preview/open/QR/revision/delete/reorder capabilities.
10. Technical fallback fields become easier to understand while preserving stable IDs, support actions, and legacy fallback editability.
11. Quick note entry is lighter but preserves role-gated create, collapse/reopen, draft lock, image staging, saved recovery, and Notes jump.
12. Lesson editor includes admin-only video planning notes that save to `body.videoPlanning.notes`, remain editable/revisioned through existing content APIs, and are not rendered on the public lesson page.
13. Changed textareas auto-grow or otherwise show authored content without avoidable manual resizing.
14. All changed labels/actions have matching tests and Help/Guide/runbook updates or explicit no-impact rationale.
15. Screenshot handoff is owner-approved before `npm run verify:pre-pr`.
16. Strict 10/10 target categories close at `5/5`; any score below `5/5` requires defer/fix recommendation before merge readiness.

## Validation

Planning-only validation:

- `npm run lint:briefs`
- `git diff --check`

Implementation validation, after explicit owner execution instruction:

- Targeted unit/component tests for `AdminWorkspace`, `AdminContentManager`, `AdminHelpCenter`, and Quick note contracts touched by the diff.
- Targeted Playwright for representative admin dashboard/editor flows.
- Screenshot handoff and owner visual approval.
- Route/label/support-surface sweep.
- `npm run verify:pre-pr` before PR update/push.
- GitHub CI green.
- `npm run verify:pre-merge` before merge readiness.

## Checkpoint Log

- `2026-06-15 | main@816ed7b4 | Created Package A planned child after Course Lesson Design Readability And Completion PR #1136 and closeout PR #1137 were merged; audited AdminWorkspace, AdminContentManager, AdminNoteQuickCaptureLauncher, AdminHelpCenter, admin unit/e2e coverage, scorecard, route/label/support sweep, screenshot handoff, and Codex Skill + Stack Readiness Radar; no runtime implementation branch started | next: run brief validation, then wait for explicit owner execute/build/implement instruction before implementation branch`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification @ main@816ed7b4 | Owner explicitly authorized implementation; moved Package A child brief to in-progress | next: implement scoped admin shell/editor simplification before screenshot handoff`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification | Implemented first scoped UI pass: compact icon-based admin tabs, lighter active-section/Quick note shell, reduced content-scope helper copy, grouped lower-frequency course workspace actions under More/Reorder disclosure controls, and renamed Advanced/fallback fields to Technical fallback fields with Help/Guide/test contract updates | next: run targeted tests and fix regressions before screenshot handoff`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification | Owner added admin-only lesson video manuscript/planning notes to Package A; ran radar against admin/data/UI scope, classified as bounded implementation child, and updated brief/data contract to store notes under existing content body JSON without migration or public rendering | next: validate editor save path and screenshot the updated admin surface`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification | Owner rejected remaining left-rail admin menu in screenshot review; moved desktop admin menu to the right rail, changed mobile nav to a compact horizontal tab row, regenerated screenshot evidence at 16:33, and removed the temporary local visual harness from the working tree | next: wait for owner visual approval before verify:pre-pr`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification | Owner flagged missing global header/logo and excessive heading stack in screenshot review; regenerated screenshot evidence with SiteChrome/header/logo included, reduced visible heading stack from Admin console + Content + Content workflow + Content items to Admin console + Content, and kept active tab state as screen-reader/test text only | next: wait for owner visual approval before verify:pre-pr`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification | Owner flagged the standalone Quick note stripe and narrow Body Position module card; moved Quick note into the admin header action group, removed the empty workspace action row, changed course module overview from two-column cards to full-width rows, and regenerated screenshot evidence at 17:01 | next: wait for owner visual approval before verify:pre-pr`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification | Owner flagged excessive top whitespace under the global header; reduced admin route-local top padding so SiteChrome owns the primary header spacing, regenerated screenshot evidence at 17:05, and removed the temporary local visual harness from the working tree | next: wait for owner visual approval before verify:pre-pr`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification | Owner approved screenshot handoff and `npm run verify:pre-pr` passed the full lane locally: lint, typecheck, unit tests, build, perf budgets, and E2E. Perf trend reported 10 consecutive weekly green runs and recommended tightening one stretch target; this Package A UI slice keeps existing budgets unchanged and records the tighten prompt for PR/merge handoff. | next: remove incidental lint warning, rerun the required gate, then commit/push/PR`
- `2026-06-15 | branch codex/admin-dashboard-editor-simplification | A follow-up `verify:pre-pr`after removing the incidental lint warning hit unrelated WebKit teardown timeouts in`my-library-workout-builder.spec.ts`for tests that are intended to run only on desktop Chromium. Root cause was skip logic inside the test body after`page`fixture creation; hardened that spec with describe-level project skips and confirmed the targeted spec no longer triggers WebKit teardown timeouts locally. No product rendering files changed after the approved screenshot capture. | next: rerun`npm run verify:pre-pr` full lane before commit/push`
