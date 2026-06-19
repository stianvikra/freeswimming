# Task Brief: Admin Readability Combined Score Refresh And Notes Pre-Audit

## Metadata

- `id`: `2026-06-19-admin-readability-combined-score-refresh-notes-preaudit-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-19`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `execution_mode`: `owner-approved docs-only audit; no runtime implementation`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@f5b9388c`
- `audit_status`: `ready`
- `decision`: Execute the combined audit now after the owner approved running whole-dashboard score refresh together with Notes create-form density pre-execution audit.
- `reason`: PR `#1174` refreshed the parent after Operations closeout. The next owner-approved scope is audit-only: rescore current admin readability after the merged children, then define whether Notes create-form density is the next bounded implementation child.
- `must_refresh_before_execution_if`: Refresh if `ADMIN_TAB_VALUES`, `AdminWorkspace`, `AdminNotesManager`, Admin Help/Guide, admin audit checklists, screenshot handoff rules, scorecard categories, route/label/support sweep rules, verification lanes, or performance-budget ratchet policy change before this docs-only PR lands.

## Goal

Refresh the admin dashboard readability score on current `main`, complete a pre-execution audit for Notes create-form density, and select or defer exactly one next bounded child without changing runtime code.

## Pre-Implementation Owner Explanation

Vi kjorer en samlet audit, ikke en UI-endring. Forst oppdateres helhetsbildet for admin-dashboardet etter de siste merged child-arbeidene. Deretter vurderes Notes-opprettingsskjemaet spesielt, fordi det fortsatt samler filtrering, oppretting, incident-maler, bilder, context og relaterte notes i samme arbeidsflate.

Hvorfor det betyr noe: Admin har faatt mange smale forbedringer. En ny score-refresh hindrer at vi styrer etter gamle funn, og Notes-auditten gir et trygt scope hvis neste runtime-slice skal gjore siden lettere aa lese.

Utenfor scope: runtime/UI-kode, API, database, authz, tests, screenshots som krever ny visuell godkjenning, `Ja.docx`, performance-ratchet, merge, og implementering av Notes-endringen.

Fremoverkompatibilitet: nye admin-tabs og Notes-workflowverdier skal enten fanges av kanoniske tab-/Notes-kontrakter og Help/Guide-regler automatisk, eller kreve eksplisitt mapping, tester og owner-beslutning for nye statuser, actions, recovery paths eller incident-semantikk.

## Scope

- Update the parent admin-readability status to record the owner-selected combined audit.
- Refresh current whole-dashboard admin readability score using merged child evidence and current source contracts.
- Pre-audit `AdminNotesManager` create-form density, including:
  - create form fields,
  - incident quick templates,
  - staged image upload/retry recovery,
  - optional context attachment,
  - relationship to edit/upload/related-note flows,
  - current unit/e2e coverage.
- Produce planned Notes implementation children only where the audit can define bounded safe scopes.
- Keep this PR docs-only.

## Out Of Scope

- No runtime component, CSS, route, API, schema, migration, package, workflow, test, or screenshot harness changes.
- No new Notes behavior, status, incident severity, upload behavior, context model, related-note behavior, or data contract.
- No admin navigation redesign.
- No user creation/invite work.
- No commerce, Stripe, checkout, finance, or analytics payload changes.
- No performance-budget threshold change before at least two new weekly green cycles after `2026-06-19`.
- Do not touch `Ja.docx`.

## Whole-Dashboard Score Refresh

Evidence source:

- Current base: clean `main@f5b9388c`.
- Active tabs from `ADMIN_TAB_VALUES`: `content`, `qr-links`, `commerce`, `operations`, `analytics`, `users`, `email-templates`, `messages`, `notes`, `categories`, `help`.
- Current shell evidence: `AdminWorkspace` renders all active tabs through the canonical tab list and includes the Messages `Needs reply` badge.
- Current module-boundary evidence: `lib/admin/admin-workspace.ts` has typed high-risk boundaries for Analytics, Users, and Messages; other tabs remain governed by `ADMIN_TAB_VALUES`, their manager components, API contracts, and tests.
- Current admin-workflow matrix: `docs/checklists/admin-full-audit-gate-checklist.md` tracks workflows `A1` through `A14`.
- Current findings log: `docs/checklists/admin-full-audit-findings-log.md` has release-safe scores, but A8-A14 still need dedicated evidence before a full-admin 10/10 product claim.
- Closed child evidence since the original full-dashboard audit:
  - Users/Analytics coverage and Users wording: PR `#1153`.
  - Full dashboard audit artifact and lesson editor readability: PR `#1153`.
  - Help/Guide quick reference: PR `#1155`.
  - Analytics density and caveats: PR `#1157`.
  - Mobile admin shell and Quick note context: PR `#1160`.
  - Content mirror/status action density: PR `#1162`.
  - Messages `Needs reply` indicator: PR `#1167`.
  - Operations support-copy compression: PR `#1171`.
  - Parent refresh: PR `#1174`.

Current product score snapshot:

| Category                                      | Current Score | Reason                                                                                                                                                     | Current Gap / Decision                                             |
| --------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Product goals and IA                          | `4/5`         | Active tabs are canonical and mobile discoverability improved; flat 11-tab IA remains acceptable but not a fresh 10/10 grouping claim.                     | Defer IA grouping until evidence shows it is needed.               |
| UX flow clarity                               | `4/5`         | Major lesson, Help, Analytics, Content, Messages, and Operations blockers are closed; Notes still has no open-count nav signal and create density remains. | Select Notes open-count indicator first; keep create density next. |
| Visual design quality                         | `4/5`         | Recent scoped children achieved owner-approved visual quality; no current full-dashboard screenshot pack after all merged children exists.                 | Do not claim whole-dashboard visual 10/10.                         |
| Business logic correctness and data integrity | `5/5`         | This audit changes no behavior; recent child work preserved server-canonical contracts and test evidence.                                                  | No runtime gap in this audit.                                      |
| Admin editor ergonomics                       | `4/5`         | High-frequency admin paths are improved, but Notes open work is not visible from nav and create still asks admins to scan incident/image/context controls. | Notes open-count child first, then create density.                 |
| Accessibility (a11y)                          | `4/5`         | Broad admin/a11y coverage exists and active modules are tracked; a future Notes UI change still needs screenshot/a11y validation.                          | Recheck in Notes implementation child.                             |
| Performance (CWV + payloads)                  | `4/5`         | Perf budgets passed in recent gates; ratchet is intentionally held pending two new green weekly cycles after `2026-06-19`.                                 | No threshold change now.                                           |
| Data placement and sync boundaries            | `5/5`         | Admin server-canonical vs local-only state is documented in active module contracts and recent child briefs.                                               | No gap in audit scope.                                             |
| Caching and invalidation strategy             | `4/5`         | Admin no-store/freshness behavior is preserved; A8-A14 dedicated evidence is still pending in the audit log.                                               | Attach deeper evidence in future full audit pack.                  |
| Reliability and failure handling              | `4/5`         | Recent children preserved error/retry states; Notes staged-image recovery remains sensitive and must be preserved before UI changes.                       | Notes child must keep recovery tests.                              |
| Security and authz                            | `5/5`         | No authz broadening; user creation and Auth Admin mutations remain deferred.                                                                               | No gap in audit scope.                                             |
| Privacy and compliance                        | `5/5`         | Users, Analytics, Messages, Notes, and screenshots remain purpose-bound with no raw private/payment/provider payload exposure in this audit.               | No gap.                                                            |
| Content governance                            | `4/5`         | Content/Help/status governance improved; Notes incident and support template guidance still needs a calmer placement decision.                             | Notes Help/Guide impact must be explicit.                          |
| Admin workflow and editability                | `4/5`         | Most admin workflows are release-safe; Notes lacks a menu-level open-work signal and create/edit/upload/link density remains plausible friction.           | Select Notes open-count child before create-form density.          |
| SEO and crawlability                          | `N/A`         | N/A with scope rationale: private authenticated admin dashboard; no public routes, metadata, sitemap, robots, or canonical behavior changes.               | N/A.                                                               |
| AI discoverability                            | `N/A`         | N/A with scope rationale: no public AI-facing content, structured data, entity pages, or crawlable semantic surface changes.                               | N/A.                                                               |
| Analytics and KPI observability               | `5/5`         | Analytics density child closed with reading rules, caveat grouping, tests, and no KPI/API behavior change.                                                 | No active analytics-readability blocker.                           |
| Commerce and revenue ops                      | `4/5`         | Commerce surface remains readable and bounded; dedicated product/API guard evidence is still a watch item in the full-admin audit findings log.            | Evidence watch, not implementation blocker.                        |
| Incident response and support operations      | `4/5`         | Help/Guide, Messages, and Operations improved; Notes incident quick templates still compete with routine create form scanning.                             | Notes child should use progressive disclosure.                     |
| Finance and reporting operations              | `N/A`         | N/A with scope rationale: no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement, or revenue truth.            | N/A.                                                               |
| i18n operational readiness                    | `4/5`         | Recent shorter labels help; Notes create text and incident copy need responsive screenshot proof before a 10/10 claim.                                     | Recheck in Notes screenshot handoff.                               |
| Stack-fit and dependency discipline           | `5/5`         | Existing admin components, tokens, test stack, and docs patterns are sufficient; no dependency or local Codex config change.                               | No gap.                                                            |
| Testing and QA automation                     | `4/5`         | Active matrix is release-safe; A8-A14 watch items and future Notes UI changes need targeted evidence before full-dashboard 10/10.                          | Keep full product 10/10 unclaimed.                                 |
| Scalability and cost efficiency               | `4/5`         | Current admin patterns scale without new dependencies; future tab/module growth still needs explicit Help/Guide/audit mapping.                             | Process watch.                                                     |
| DevOps and rollback readiness                 | `5/5`         | This is a reversible docs-only diff; no migration, package, workflow, or runtime dependency.                                                               | No gap.                                                            |

Whole-dashboard product claim:

- Release-gate interpretation: `PASS` for current admin readability planning because all scored target areas are at least `4/5` and no P0 blocker is recorded.
- `10/10` claim: `NO`. The dashboard is improved and release-safe, but Notes create density, missing post-children full-dashboard screenshot pack, and A8-A14 dedicated evidence watch items prevent a defensible whole-dashboard product `10/10` claim.

## Notes Create-Form Pre-Execution Audit

Code evidence:

- `components/admin/AdminNotesManager.tsx` renders:
  - Work queue header, loading/error/warning/empty/no-results states, and filters.
  - Note cards with priority, date, context label/ref, done/edit/delete actions.
  - Edit form with title/category/date/priority/body, context attachment, images, related notes, mark done, save/cancel, and context validation warning.
  - Create panel with explanatory text, incident quick templates, title/category/date/priority/body fields, staged image paste/upload, local staged-image recovery, optional context attachment, mark-done checkbox, save, and context validation warning.
- `tests/unit/admin-notes-manager-state.test.tsx` covers loading, schema warning, load retry, empty/no-results states, compact filters, AW-006 card/action tokens, and create error payload behavior.
- `tests/unit/admin-notes-manager-related-links.test.tsx` covers related-note jump/search behavior.
- `tests/e2e/admin-notes-workflow.spec.ts` covers create, incident template, clipboard paste, staged image upload, context attachment, edit, image upload/delete, related-note link, filter persistence, done/archive, delete, clipboard-blocked recovery, and dashboard quick capture.

Audit findings:

| Rank | Surface                  | Finding                                                                                                                                                                                    | Evidence                                                                                                             | Severity | Recommended Type               | Owner Decision Needed                                            |
| ---- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ---------------------------------------------------------------- |
| 1    | Notes nav / triage entry | Notes behaves like a work queue but the admin menu does not show open-note count. Selecting Notes should land on the open queue instead of carrying stale done/all filters from URL state. | `DEFAULT_ADMIN_NOTES_FILTER_STATE.status` is `open`; `AdminWorkspace` has Messages badge pattern but no Notes badge. | `high`   | `bounded implementation child` | `no` if count means open notes only.                             |
| 2    | Notes create panel       | The create panel mixes routine note entry with incident templates and image staging guidance before the form, increasing scan cost for common notes.                                       | Create panel headings plus incident template block and staged-image copy in `AdminNotesManager`.                     | `high`   | `bounded implementation child` | `no` if semantics are preserved.                                 |
| 3    | Create image staging     | Staged images and recovery copy are behaviorally important and must not be hidden in a way that masks failed uploads.                                                                      | E2E staged image create/retry behavior and unit error handling.                                                      | `high`   | `bounded implementation child` | `no`; preserve visible recovery when active.                     |
| 4    | Context attachment       | Optional context has multi-step selectors for lessons/modules/products/pages and must remain explicit when partially selected.                                                             | Context type/ref controls and context-invalid warning.                                                               | `medium` | `bounded implementation child` | `no`; keep validation text and tests.                            |
| 5    | Edit/upload/link parity  | Create density cannot be fixed by changing create alone if it creates mismatch with edit images and related-note workflows.                                                                | Edit form owns images and related notes; E2E covers link/upload/delete.                                              | `medium` | `bounded implementation child` | `no`; compare create/edit in screenshots.                        |
| 6    | Incident templates       | Templates are useful support operations, but low-frequency relative to ordinary note creation.                                                                                             | P1/P2/P3 template guidance and buttons.                                                                              | `medium` | `bounded implementation child` | `yes` only if incident severity meaning or cadence copy changes. |

Recommended Notes implementation sequence:

- First planned child path: `docs/task-briefs/planned/2026-06-19-admin-notes-open-count-navigation-indicator-10-10.md`.
- First preferred approach:
  - show a compact Notes tab badge with open note count;
  - count only aggregate open notes, not unread/new/SLA;
  - avoid loading note bodies/attachments/context details in the shell;
  - cap badge at `9+`;
  - selecting Notes from shell should land on the open queue by default;
  - preserve intentional deep links to specific Notes filters/query values.
- Second planned child path: `docs/task-briefs/planned/2026-06-19-admin-notes-create-form-density-progressive-reveal-10-10.md`.
- Second preferred approach: keep Notes data/API behavior unchanged and make only presentation/copy changes:
  - keep title/category/date/priority/text/save immediately available;
  - move incident templates into accessible progressive disclosure or a clearly secondary support block;
  - keep image staging controls available but make inactive guidance calmer;
  - keep staged-image recovery highly visible when active;
  - keep context attachment explicit and validation unchanged;
  - preserve edit/upload/related-note semantics and tests.
- Screenshot requirement for the future child: after/reference or before/after Notes desktop/mobile create panel, active staged-image state, and edit-form reference for upload/related-note parity.

## Codex Skill And Stack Readiness Radar

Capability audit:

| Capability                 | Evidence                                                    | Current Status   | Recommended Trigger                                                 | Boundary                                                                                  |
| -------------------------- | ----------------------------------------------------------- | ---------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `playwright`               | Session metadata and repo runbooks                          | `installed`      | Future Notes screenshot handoff and browser/a11y QA.                | Not used in this docs-only audit unless screenshot evidence becomes owner-approved scope. |
| `imagegen`                 | Session metadata                                            | `available`      | Not needed.                                                         | Do not generate admin decorations/assets.                                                 |
| Stripe plugin skills       | Session plugin metadata                                     | `available`      | Only future checkout, billing, commerce, or finance implementation. | Not relevant to Notes or this audit.                                                      |
| Supabase/Auth Admin docs   | Official docs check only if auth/user mutations are scoped. | `evaluate later` | Future user invite/create/access child.                             | No Auth Admin mutation here.                                                              |
| Local Codex config changes | Repo rule                                                   | `not needed`     | N/A                                                                 | Do not install or configure skills/plugins/MCP.                                           |

Systemic findings:

| Surface                  | Finding                                                                                                                                  | Severity | Recommended Type                 | Owner Decision Needed                                         | Follow-Up Brief Path                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Notes nav indicator      | Open Notes work is not visible in admin navigation, unlike Messages `Needs reply`; shell entry should default to the open queue.         | `high`   | `bounded implementation child`   | `no` if semantics stay `open notes` only.                     | `docs/task-briefs/planned/2026-06-19-admin-notes-open-count-navigation-indicator-10-10.md`        |
| Notes create form        | Routine note creation and incident/image/context helpers share one default surface, creating the next create-form readability friction.  | `high`   | `bounded implementation child`   | `no` if behavior stays presentation-only.                     | `docs/task-briefs/planned/2026-06-19-admin-notes-create-form-density-progressive-reveal-10-10.md` |
| Full admin evidence pack | A8-A14 workflows are tracked at release-safe `4/5` watch level but still need dedicated evidence before whole-dashboard product `10/10`. | `medium` | `safe process/docs update`       | `no` for evidence collection; `yes` if scope changes runtime. | TBD after Notes or next full audit pack                                                           |
| Admin IA grouping        | All tabs are now discoverable on mobile, but the dashboard still has 11 peer tabs without job grouping.                                  | `low`    | `deferred architecture decision` | `yes`; grouping changes admin mental model.                   | TBD after stronger evidence                                                                       |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`.
- Current child: this docs-only combined audit.
- Last merged workstream: PR `#1174`, parent refresh after Operations closeout.
- Next planning step: owner decides whether to execute the planned Notes open-count navigation indicator child before the Notes create-form density child.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict mode for this docs-only audit artifact: each target category below must close at `5/5` for the audit artifact to be complete. This does not claim the admin product is 10/10.

Critical target categories for this audit artifact:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Admin editor ergonomics
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Admin workflow and editability
- Incident response and support operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                  | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Audit refresh identifies current admin jobs, active tabs, and the next bounded child without selecting runtime work.                                                | score refresh + parent update               | `5/5`                   |
| UX flow clarity                               | `target`     | Audit separates shipped improvements from remaining Notes nav/create-flow friction and defines a safe next step.                                                    | Notes pre-audit + findings table            | `5/5`                   |
| Visual design quality                         | `target`     | Audit records that no new full-dashboard visual 10/10 claim is made without a fresh screenshot pack; future Notes child has screenshot requirements.                | score snapshot + screenshot plan            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Audit changes docs only and explicitly preserves Notes payloads, upload behavior, context links, related-note identity, and server-canonical data.                  | changed-files review + Notes test inventory | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Audit ranks admin nav/edit/create friction and chooses Notes open-count navigation as the next highest-value bounded slice.                                         | whole-dashboard refresh + Notes findings    | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Audit identifies future Notes progressive disclosure must keep accessible native controls, labels, focus, and recovery visibility.                                  | future child acceptance criteria            | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: docs-only audit adds no runtime payload; performance ratchet remains held until two new weekly green cycles after `2026-06-19`.                    | no-runtime-diff review                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Audit records Notes server-canonical note data vs local draft/staged-image state and requires future implementation to preserve those boundaries.                   | Notes pre-audit + planned child contract    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache/read path changes; future Notes child must preserve current admin fetch/refresh behavior.                                                 | scope review                                | `4/5`                   |
| Reliability and failure handling              | `target`     | Audit explicitly protects load retry, schema warning, create errors, staged-image recovery, context validation, and upload/link failure behavior.                   | unit/e2e coverage inventory                 | `5/5`                   |
| Security and authz                            | `target`     | Audit keeps all admin/auth/data behavior unchanged and defers user/Auth Admin work.                                                                                 | changed-files review                        | `5/5`                   |
| Privacy and compliance                        | `target`     | Audit adds no private data and future Notes screenshots must avoid raw sensitive/user/payment/provider/analytics payload exposure.                                  | privacy scope rationale                     | `5/5`                   |
| Content governance                            | `target`     | Audit records how Notes incident templates and Help/Guide/support guidance must remain governed if moved or shortened.                                              | Notes findings + future child Help impact   | `5/5`                   |
| Admin workflow and editability                | `target`     | Audit preserves current Notes create/edit/upload/link/archive workflow and proposes bounded Notes nav and create-form children.                                     | Notes workflow test inventory               | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A with scope rationale: authenticated private admin/docs planning only; no public metadata, sitemap, robots, canonical, or crawlable page changes.                | private-admin/docs-only scope rationale     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A with scope rationale: no public AI-facing content, structured data, entity page, or crawl-safe semantic contract changes.                                       | private-admin/docs-only scope rationale     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: score refresh records Analytics child as closed; no KPI/event/persistence/dashboard behavior changes.                                              | closed child evidence                       | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: no product, checkout, Stripe, entitlement, pricing, revenue, or commerce behavior changes; Commerce remains a watch item only for future evidence. | no-commerce-diff review                     | `4/5`                   |
| Incident response and support operations      | `target`     | Audit keeps incident templates and recovery guidance visible as required future-child constraints, with no support-procedure change now.                            | Notes incident findings + parent update     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes.      | explicit finance scope review               | `N/A`                   |
| i18n operational readiness                    | `target`     | Audit flags Notes copy/disclosure layout as needing future desktop/mobile screenshot proof for longer labels and locale expansion.                                  | future child screenshot plan                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Audit uses existing docs, scorecard, runbooks, admin components, and tests; no dependency or local Codex configuration change.                                      | diff/package review                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Audit records existing Notes unit/e2e coverage and requires targeted tests plus screenshot handoff in the future implementation child.                              | test inventory + validation commands        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: future Notes implementation should reuse existing patterns and avoid per-state one-off components or new dependencies.                             | recommendation rationale                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only PR is reversible, has no migration/package/workflow/runtime dependency, and will run docs-only gates before PR/merge readiness.                           | git diff + validation gates                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - audit-only; no route/component/API/server/client boundary changes;
  - future Notes child should reuse `AdminNotesManager`, current `fs-*` admin tokens, native disclosure where possible, and `/admin?tab=notes` behavior.
- TypeScript/domain:
  - preserve `AdminNoteItem`, priority/status/context types, attachment limits, related-note IDs, and admin tab values.
- Supabase/data:
  - no migration, RLS, storage, generated DB type, or service-role change;
  - Notes remain server-canonical through `/api/admin/notes` and attachment/link routes.
- External services:
  - no Stripe, email, analytics vendor, GitHub workflow, Vercel, or provider SDK change.
- UI system:
  - no UI change now;
  - future child should use existing admin card/action/field primitives and screenshot handoff.
- Testing:
  - docs-only validation now;
  - future child requires targeted Notes unit/e2e coverage and visual handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

Audit-only contract:

- Server-canonical data: admin notes, note status, category, priority, context refs, attachments, related-note links, created/updated metadata.
- Local-only state: search/filter drafts, active edit row, create form draft, create staged-image files/previews, create-upload recovery state, link draft, pending action IDs.
- Sync policy: unchanged; current Notes create/edit/upload/link/delete/done actions remain server-confirmed.
- Retention and sensitivity: staged images remain local until save/upload succeeds; screenshots for future work must use deterministic/sanitized data.
- Cache/invalidation: unchanged admin fetch and refresh behavior; future implementation must preserve current `no-store` expectations where present.

## Identity And Rename Contract

- Canonical stable IDs: note IDs, attachment IDs, related-note IDs, category values, context type/ref values, and admin tab query value `notes`.
- Human-readable labels: copy may be shortened in a future child, but incident severity meaning, priority labels, context labels, and action labels must not be repurposed.
- Mutability rules: notes can be edited through current server routes; related notes are linked by stable IDs, not title text.
- Rename vs repurpose: new incident severity, context type, or relationship semantics require an explicit child, tests, and Help/Guide mapping.
- Compatibility: existing `/admin?tab=notes` links and note filter query params stay unchanged.
- Observability and repair: context validation and staged-image recovery must remain visible in future changes.

## Forward Compatibility Contract

- Extensibility surfaces: admin tabs, Notes categories, priorities, context types/refs, incident severities, attachment formats/limits, related-note relationships, recovery states, locales, Help/Guide sections.
- Source of truth:
  - active tabs from `ADMIN_TAB_VALUES`;
  - Notes data and relationships from the admin Notes API contracts;
  - attachment limits and context options from existing Notes constants/helpers.
- Additive behavior:
  - future categories and context options should continue to render in existing filters/selectors;
  - future low-risk create helpers should join the same progressive-disclosure pattern instead of expanding the default form wall.
- Explicit mapping requirements:
  - new incident severity meanings, destructive actions, upload recovery states, context types, or support procedures require Help/Guide/runbook mapping and tests.
- Unknown or deprecated values:
  - unknown context values should use safe fallback labels or remain blocked until mapped;
  - deprecated incident/support values must not silently imply current procedure.
- Test/evidence:
  - this docs-only audit uses code/test inventory;
  - future implementation must add or update targeted Notes tests, route/label/support sweep, and desktop/mobile screenshot handoff.

## Help / Guide Impact

No Help/Guide runtime copy changes in this docs-only audit.

Future Notes implementation must update Help/Guide only if it changes visible incident template wording, recovery guidance, upload instructions, context attachment wording, or support procedure meaning. If it only changes placement/disclosure while preserving semantics, the future brief may record `N/A` with explicit rationale.

## Route / Label / Support Surface Sweep

Audit-only sweep terms used for this brief:

- `AdminNotesManager`
- `Create note`
- `Incident quick templates`
- `Use P1 template`
- `Use P2 template`
- `Use P3 template`
- `Image (optional)`
- `Paste image from clipboard`
- `Upload images`
- `Retry upload`
- `Attach to (optional)`
- `Selected target`
- `Related notes`
- `Save note`
- `Save changes`
- `Help/Guide`
- `/admin?tab=notes`

Surfaces checked:

- `components/admin/AdminNotesManager.tsx`
- `tests/unit/admin-notes-manager-state.test.tsx`
- `tests/unit/admin-notes-manager-related-links.test.tsx`
- `tests/e2e/admin-notes-workflow.spec.ts`
- parent admin-readability brief
- recent done admin-readability child briefs
- admin audit checklist/findings log

Fallout:

- Planned Notes open-count navigation child created.
- Planned Notes create-form density child kept as follow-up.
- Parent brief updated to point to this combined audit result.
- No runtime label, route, Help/Guide, runbook, or test behavior changed.

## Acceptance Criteria

1. Parent brief records that the owner selected the combined audit path.
2. Whole-dashboard score refresh is current to `main@f5b9388c` and does not claim product `10/10`.
3. Notes pre-execution audit identifies concrete risks and bounded implementation shapes.
4. Planned Notes children exist if selected and explicitly preserve Notes semantics.
5. Docs-only diff does not touch runtime code, tests, config, workflows, package files, screenshots, generated artifacts, or `Ja.docx`.
6. Changed briefs pass `npm run lint:briefs`.
7. Docs-only verification gate passes before PR update.

## Validation

- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- PR CI
- `npm run verify:pre-merge` before merge recommendation

## Checkpoint Log

- `2026-06-19 | in-progress | owner approved combined audit after asking whether Notes create-form density audit and whole-dashboard score refresh could run together; branch docs/admin-readability-combined-audit-2026-06-19 created from clean main@f5b9388c | next: write docs-only audit, planned Notes children, parent status update, then run docs gates`
- `2026-06-19 | scope-refined | owner proposed a Notes open-count menu indicator and open-queue click behavior; current code audit confirmed default Notes filter is already open, so the new scope is a separate planned Notes nav/triage child before create-form density | next: validate changed briefs`
