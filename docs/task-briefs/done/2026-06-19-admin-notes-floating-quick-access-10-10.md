# Task Brief: Admin Notes Floating Quick Access

## Metadata

- `id`: `2026-06-19-admin-notes-floating-quick-access-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-20`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `source_audit`: owner follow-up after `docs/task-briefs/done/2026-06-19-admin-notes-open-count-navigation-indicator-10-10.md`
- `execution_mode`: `implementation approved by owner on 2026-06-19; pause after screenshot handoff before broad PR gates`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@84cf3252`
- `audit_status`: `complete`
- `decision`: Keep this as a separate admin-shell/accessibility child instead of adding it to the Notes create-form density slice.
- `reason`: A floating or sticky Notes affordance changes global admin access behavior, z-index/responsive layout, and touch/a11y expectations; the create-form density brief is intentionally limited to the create panel.
- `must_refresh_before_execution_if`: Refresh if `AdminWorkspace`, `AdminNotesManager`, Notes open-count summary behavior, admin tab routing, mobile admin shell layout, Help/Guide Notes copy, screenshot handoff rules, scorecard categories, or the parent admin-readability status change before implementation.

## Goal

Add a private admin-only Notes quick-access affordance that keeps the open Notes queue reachable while admin works elsewhere, without changing Notes data, workflow semantics, or global public navigation.

## Pre-Implementation Owner Explanation

Vi vurderer en liten Notes-snarvei som alltid er lett aa naa for admin, spesielt paa mobil. Den skal hjelpe admin tilbake til aapne notes raskt uten aa lete i menyen.

Hvorfor det betyr noe: Notes er en arbeidskoe. Naar admin jobber i andre admin-flater, kan en trygg snarvei redusere friksjon og gjore det mindre sannsynlig at aapne notes glemmes.

Utenfor scope: ingen ny Notes-statusmodell, unread/SLA/polling, database/RLS, varslingslogikk, public/global brukerflatesnarvei, eller flyttbar knapp i v1 uten egen beslutning.

Fremoverkompatibilitet: open-count og tab-entry skal bygge paa eksisterende canonical Notes-semantikk. Nye workflow-statuser eller en senere flyttbar touch-knapp krever eksplisitt mapping, fallback, tester og Help/Guide-beslutning.

## Selected Decisions

| Decision                  | Recommended Default                                                                               | Reason                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Surface                   | Admin-only fixed/sticky Notes quick-access control inside the admin shell                         | Keeps the signal private and scoped to operator work.                                                   |
| V1 movement               | Not draggable                                                                                     | Avoids hidden a11y, z-index, overlap, persistence, and reset-position complexity in the first slice.    |
| Future draggable behavior | Separate explicit owner decision                                                                  | Touch drag must include keyboard equivalent, viewport bounds, reset affordance, and local-only storage. |
| Click behavior            | Open `/admin?tab=notes` on the open queue, preserving intentional deep links only when applicable | Matches the shipped open-count child and avoids stale done/all queue entry.                             |
| Count meaning             | Existing open admin notes count                                                                   | Keeps semantics aligned with PR `#1177`; not unread/new/SLA.                                            |
| Visibility                | Visible outside the Notes tab; consider hiding or de-emphasizing when already on Notes            | Avoids duplicate calls to action on the active Notes workspace.                                         |
| Mobile placement          | Respect existing admin nav, safe areas, and primary action zones                                  | Prevents the control from covering save/delete/filter actions.                                          |
| Persistence               | No server persistence; no local persistence in v1 unless needed for a dismiss/de-emphasize state  | Avoids turning a shortcut into user data or cross-device state.                                         |

## Scope

- Add or adapt an admin-shell quick-access pattern for Notes only.
- Reuse the existing Notes open-count summary semantics where available.
- Keep the shortcut private to authenticated admin surfaces.
- Make the control compact, keyboard accessible, screen-reader clear, and stable across desktop/mobile.
- Ensure it does not cover critical admin actions, bottom navigation, form fields, modals, toasts, or recovery states.
- Update Help/Guide only if visible copy or operator meaning changes.
- Capture desktop/mobile screenshot handoff before broad PR gates.

## Out Of Scope

- No Notes create-form density/progressive reveal work.
- No draggable/touch-movable button in v1 unless this brief is explicitly revised before execution.
- No unread, SLA, priority alert, polling, sound, toast, push notification, or global notification center.
- No public site floating Notes affordance.
- No new Notes status, category, priority, context, attachment, related-note, or incident severity semantics.
- No note API payload, schema, RLS, generated type, storage, authz, service-role, cache, package, workflow, or performance-budget change.
- No local Codex skill/plugin/MCP configuration change.
- Do not touch `Ja.docx`.

## Codex Skill And Stack Readiness Radar

Capability audit:

| Capability                 | Evidence                           | Current Status | Recommended Trigger                                          | Boundary                                                |
| -------------------------- | ---------------------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| `playwright`               | Session metadata and repo runbooks | `installed`    | Future screenshot handoff, mobile/desktop QA, and a11y flow. | Does not replace required owner screenshot review.      |
| `imagegen`                 | Session metadata                   | `available`    | Not needed.                                                  | Do not generate decorative admin assets for this slice. |
| Stripe plugin skills       | Session plugin metadata            | `available`    | Not relevant.                                                | No payments/commerce behavior in scope.                 |
| Local Codex config changes | Repo rule                          | `not needed`   | N/A                                                          | Do not install or configure skills/plugins/MCP servers. |

Systemic findings:

| Surface               | Finding                                                                                                                       | Severity | Recommended Type                 | Owner Decision Needed                                           | Follow-Up Brief Path                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Admin Notes access    | Owner wants Notes always reachable; this is useful but belongs to admin shell access, not create-form density.                | `medium` | `bounded implementation child`   | `no` for fixed/sticky v1; `yes` for draggable/touch-movable v1. | `docs/task-briefs/planned/2026-06-19-admin-notes-floating-quick-access-10-10.md` |
| Mobile/admin overlay  | A floating control can cover primary actions or collide with safe areas if not designed against real admin screens.           | `high`   | `bounded implementation child`   | `no` if screenshot/a11y evidence is required before PR gates.   | This brief                                                                       |
| Draggable persistence | Movable controls need local-only position, reset, bounds, keyboard alternative, and conflict rules before they are shippable. | `medium` | `deferred architecture decision` | `yes`; v1 should not ship draggable behavior by default.        | TBD after owner explicitly selects draggable behavior                            |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`.
- Last merged sibling: PR `#1179` and repo-managed closeout PR `#1180`.
- Last merged workstream before this child: PR `#1179` and repo-managed closeout PR `#1180`.
- Next planning step: implement fixed/sticky admin-only Notes quick access and pause for screenshot handoff approval before broad gates.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: Product goals and IA, UX flow clarity, Visual design quality, Accessibility (a11y), Admin workflow and editability, Reliability and failure handling, Security and authz, Privacy and compliance, Incident response and support operations, i18n operational readiness, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Notes quick access improves admin work-queue reachability without changing admin tab IA or Notes workspace identity.                                           | screenshot handoff + route behavior review    | `5/5`                   |
| UX flow clarity                               | `target`     | Shortcut clearly means open Notes access, not unread/SLA alerting; entry lands on the open queue.                                                              | shell tests + Help/Guide review               | `5/5`                   |
| Visual design quality                         | `target`     | Control is compact, aligned to admin tokens, and does not overlap critical actions on desktop/mobile.                                                          | desktop/mobile screenshots                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Notes data, open-count semantics, create/edit/upload/link/done/delete behavior, filters, and payloads remain unchanged.                                        | targeted tests + diff review                  | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin can reach the open Notes queue from other admin surfaces with fewer steps, especially on mobile.                                                         | workflow review + screenshots                 | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Control has stable label, role, keyboard path, focus outline, touch target, screen-reader count meaning, and no color-only signal.                             | Testing Library + screenshot/a11y review      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, no asset, no polling, and reuse existing count-only summary if count is shown.                                             | package/diff review                           | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical Notes count remains read-only; shortcut display/open state is local UI only.                                                                  | data-boundary contract + diff review          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: reuse existing Notes count freshness/no-store behavior; no new cache layer.                                                                   | route/cache diff review                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Count load failure or schema-missing state does not show misleading urgency; shortcut still opens Notes safely if count is unavailable.                        | shell failure tests                           | `5/5`                   |
| Security and authz                            | `target`     | Shortcut is rendered only in admin-gated surfaces and does not expose note payload or admin affordance publicly.                                               | changed-files review + authz tests if touched | `5/5`                   |
| Privacy and compliance                        | `target`     | UI exposes aggregate count only and screenshots use sanitized/non-sensitive data.                                                                              | screenshot/privacy review                     | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: no content publish/revision workflow changes; Help/Guide copy updated only if operator meaning changes.                                       | Help/Guide impact review                      | `4/5`                   |
| Admin workflow and editability                | `target`     | Shortcut improves cross-admin Notes access while preserving existing create/edit/filter/archive workflows.                                                     | shell workflow tests                          | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A with scope rationale: authenticated private admin UI only; no public metadata, sitemap, robots, canonical, or crawlable route changes.                     | private-admin scope review                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A with scope rationale: no public AI-facing content, structured data, entity page, or crawl-safe semantic contract changes.                                  | private-admin scope review                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event, KPI, dashboard, taxonomy, or telemetry payload change by default.                                                         | no-analytics-diff review                      | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A with scope rationale: no product, checkout, Stripe, entitlement, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                  | explicit commerce scope review                | `N/A`                   |
| Incident response and support operations      | `target`     | Shortcut helps operators reach open support notes without redefining incident templates, recovery procedures, or alert priority.                               | Help/Guide/runbook impact review + tests      | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope review                 | `N/A`                   |
| i18n operational readiness                    | `target`     | Button label/count text and responsive placement tolerate longer localized text without clipping or overlap.                                                   | desktop/mobile screenshots                    | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `AdminWorkspace`, existing Notes badge/count helpers, Freeswimming tokens, and current tests; add no dependency.                                         | diff/package review                           | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests cover visible/hidden states, click-to-open behavior, count/failure states, and overlap-sensitive mobile placement where practical.              | Vitest/e2e + gates                            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: quick-access display should not add new queries beyond existing aggregate count or scale with note body/attachment payload.                   | payload/query review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/test/docs diff with no schema/API/package/workflow dependency and screenshot approval before broad gates.                                  | git diff + gates + PR evidence                | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `components/admin/AdminWorkspace.tsx` and existing admin tab/open-count behavior;
  - preserve `/admin?tab=notes` route semantics and client component boundary;
  - do not add route handlers, server actions, global state, or polling unless a refreshed execution audit proves it is required.
- TypeScript/domain:
  - preserve `ADMIN_TAB_VALUES`, Notes open-count meaning, admin note status semantics, and existing Notes helper contracts.
- Supabase/data:
  - no migrations, RLS, generated DB types, storage policy, or service-role changes.
- External services:
  - no Stripe, email, analytics provider, Vercel, GitHub workflow, or browser-notification integration.
- UI system:
  - reuse existing admin token classes, icon system, focus styles, and badge patterns;
  - reference surface: `AdminWorkspace` owns the admin tab rail, Notes open-count badge, and `/admin?tab=notes` tab navigation; the quick-access control reuses that shared UI contract instead of creating a separate route, badge source, or workflow model;
  - shared component/view-model contract: `AdminWorkspace` still owns summary fetch state and active-tab selection, while `lib/admin/notes.ts` owns the accessible open-count labels used by both the tab badge and shortcut;
  - avoid decorative blobs/assets;
  - screenshot handoff comparison type should be `after/reference` unless a true before/after recapture is practical.
- Testing:
  - update `tests/unit/admin-workspace-shell.test.tsx` for shortcut states/click behavior;
  - add e2e or screenshot evidence for mobile overlap risk when practical;
  - use screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical data: admin notes and existing open-count semantics.
- Local data: quick-access visual state, active tab selection, and optional local-only UI preference if explicitly scoped.
- Sync policy: unchanged; clicking the shortcut navigates/sets the active Notes tab and relies on existing Notes fetch/refresh behavior.
- Retention and sensitivity: no new persisted user/operator data in v1; no server-stored position.
- Cache/invalidation: unchanged if existing summary route is reused; no polling or new cache layer.

## Identity And Rename Contract

- Canonical stable IDs: note IDs and admin tab query value `notes` remain unchanged.
- Human-readable labels: shortcut label may be shortened but must not redefine open-count, unread, priority, or SLA meaning.
- Mutability rules: no note entity, filter, route param, or status value is renamed.
- Rename vs repurpose: new alert/urgency semantics require a new mapping decision and tests.
- Compatibility: existing `/admin?tab=notes` links, intentional Notes deep links, filters, context refs, and support workflows remain valid.
- Observability and repair: count/summary failure should be quiet and test-visible; shortcut must not imply a false count.

## Forward Compatibility Contract

- Extensibility surfaces: admin tabs, Notes statuses, open-count label, shortcut placement, locales, future mobile nav changes, and possible future draggable behavior.
- Source of truth: open Notes count comes from existing server-canonical Notes summary behavior; admin tab identity comes from `ADMIN_TAB_VALUES`.
- Additive behavior: future open notes automatically affect the count if they follow existing open/done semantics.
- Explicit mapping requirements: new status semantics, unread/new/SLA concepts, polling, draggable placement persistence, dismiss states, or global notification behavior require owner-approved mapping, Help/Guide impact review, and tests.
- Unknown or deprecated values: do not show false urgency; use safe fallback label or hide count until mapped.
- Test/evidence: shell tests, screenshot handoff, route/label/support sweep, and explicit unknown-value rationale if new values are introduced.

## Help / Guide Impact

Expected update if visible shortcut copy ships. Help/Guide should clarify that the control opens the Notes open queue and that the count, if shown, means open admin notes rather than unread/new alerts.

Implementation update: Help/Guide copy now documents the floating Notes shortcut, the Open queue target, the non-draggable v1 boundary, and the open-notes-only count meaning.

## Route / Label / Support Surface Sweep

Run before broad gates:

- `Notes`
- `open notes`
- `admin-tab-notes`
- `admin-notes-open-badge`
- `floating`
- `quick access`
- `Help/Guide`
- `/admin?tab=notes`

Check at minimum `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, planned/in-progress/done task briefs, and Help/Guide assertions.

Execution evidence: searched `admin-notes-quick-access`, `Floating Notes shortcut`, `Open Notes`, `Notes badge means Open`, `open notes`, `/admin?tab=notes`, `admin-tab-notes`, and `admin-notes-open-badge` across `app/`, `components/`, `lib/`, `tests/`, `docs/runbooks/`, `docs/checklists/`, and task brief lifecycle folders. Fallout handled in this slice: admin shell shortcut, Notes helper label, shell tests, Help/Guide copy, Help/Guide assertion, and active brief evidence. No route rename or public support-surface change was introduced.

## Screenshot Handoff Plan

- Use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- Capture against local `http://127.0.0.1:3000` with `SITE_LOCK_ENABLED=0`.
- If `/dev/login` or Supabase egress blocks screenshot-only capture, use the documented temporary local visual-harness fallback and remove it before validation/PR diff.
- Artifact folder: `output/admin-notes-floating-quick-access-YYYY-MM-DD-HHMMSS`.
- Required screenshots:
  - `after-admin-notes-quick-access-desktop.png`
  - `after-admin-notes-quick-access-mobile.png`
  - `reference-admin-notes-tab-active-desktop.png`
  - `reference-admin-notes-tab-active-mobile.png`
- Handoff type: `after/reference` unless a true before/after recapture is practical.
- Handoff must explicitly call out whether the control overlaps any save/delete/filter/modal/recovery action.

## Acceptance Criteria

1. Admin-only Notes quick access is available from non-Notes admin surfaces and opens the open Notes queue.
2. Existing Notes tab, open-count badge, filters, deep links, and create/edit/upload/link workflows remain unchanged.
3. Shortcut has accessible name, keyboard path, visible focus, sufficient touch target, and count meaning if count is shown.
4. Control does not cover critical admin actions on desktop or mobile screenshots.
5. Failure/schema-missing count state does not show misleading urgency.
6. No draggable/touch-movable behavior ships unless this brief is revised with explicit movement/persistence/reset criteria.
7. Help/Guide impact is updated or explicitly documented as `N/A`.
8. Screenshot handoff is owner-approved before `npm run verify:pre-pr`.
9. Changed briefs pass `npm run lint:briefs`.

## Validation

- `npm run lint:briefs`
- targeted shell tests, expected starting point:
  - `./node_modules/.bin/vitest run tests/unit/admin-workspace-shell.test.tsx`
- targeted e2e only when local admin/dev-login allows:
  - `npx playwright test tests/e2e/admin-notes-workflow.spec.ts --project=desktop-chromium`
- route/label/support sweep for Notes quick-access labels and Help/Guide impact
- screenshot handoff
- after owner screenshot approval: `npm run verify:pre-pr`
- PR CI
- before merge recommendation: `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-19 | planned | created from owner follow-up asking whether Notes should have a floating icon that can be moved by finger so it is always available for admin; scope selects fixed/sticky admin-only quick access as the recommended v1 and defers draggable/touch-movable behavior to an explicit future decision | next: owner chooses whether this quick-access child should run before or after create-form density`
- `2026-06-19 | in-progress | owner approved implementation from main@84cf3252 on branch admin-notes-floating-quick-access; scope remains fixed/sticky admin-only quick access with draggable behavior deferred | next: inspect admin shell and implement shortcut`
- `2026-06-19 | in-progress | implemented admin-only fixed Notes quick access, shared open-count label helper, Help/Guide copy, and unit coverage; targeted tests, typecheck, lint, brief lint, route/label/support sweep, and regenerated screenshot handoff are clean; screenshot artifact folder: output/admin-notes-floating-quick-access-2026-06-19-230545 | next: owner screenshot approval before verify:pre-pr`
- `2026-06-19 | in-progress | owner approved screenshot handoff; npm run verify:pre-pr passed locally after screenshot approval. Perf trend reported tighten recommendation after 10 consecutive weekly green runs; decision for this UI slice is hold/defer budget tightening to the planned performance ratchet brief docs/task-briefs/planned/2026-06-19-next-performance-budget-ratchet-maintenance-10-10.md so this PR stays scoped to Notes quick access | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-19 | in-progress | PR #1181 CI is green after PR-body lint repair. Local npm run verify:pre-merge found one unrelated course mobile E2E flake where the layout assertion measured while Loading lesson details was still visible; hardened that test to wait for loading details to disappear before reading bounding boxes. No Notes/product behavior changed | next: targeted rerun of the hardened E2E, amend/push, CI, then rerun npm run verify:pre-merge`
- `2026-06-20 | done | PR #1181 merged as squash commit 51dbfdde after CI and local npm run verify:pre-merge passed on c169b294; closeout moved this brief to done and records completion evidence | next: run closeout lint/verify gates and merge repo-managed docs-only closeout`

## Completion Record

- `completed`: `2026-06-20`
- `merged_pr`: `#1181`
- `squash_commit`: `51dbfdde`
- `result`: Closed Admin Notes Floating Quick Access. Admin now has a compact private Notes shortcut on non-Notes admin screens, so the open Notes work queue is one click away on desktop and mobile without adding unread, polling, draggable, or database behavior.
- `validation`: targeted unit tests passed for admin shell/helper/Help copy; targeted mobile course E2E flake hardening passed; `npm run typecheck`, `npm run lint`, `npm run lint:briefs:all`, `npm run verify:pre-pr`, PR CI, and `npm run verify:pre-merge` passed.
- `screenshot_artifacts`: `output/admin-notes-floating-quick-access-2026-06-19-230545`
- `owner_screenshot_review`: approved in chat with `godkjent`.
- `remaining_gaps`: none for the scoped fixed/sticky quick-access slice.
- `deferred_scope`: draggable/touch-movable behavior, unread/SLA/polling, global notifications, database/RLS/API changes, and performance-budget tightening remain separate owner-approved briefs/decisions.
- `critical target categories`:
  - Product goals and IA
  - UX flow clarity
  - Visual design quality
  - Business logic correctness and data integrity
  - Admin editor ergonomics
  - Data placement and sync boundaries
  - Reliability and failure handling
  - Security and authz
  - Privacy and compliance
  - Admin workflow and editability
  - Incident response and support operations
  - i18n operational readiness
  - Stack-fit and dependency discipline
  - Testing and QA automation
  - DevOps and rollback readiness

- `10/10 claim`: yes - all critical target categories reached `5/5` for this scoped slice.
- `accessibility_confirmation`: Accessibility (a11y) is also a critical target for this slice and is scored `5/5` in the closeout table.

| Category                                      | Achieved Score | Evidence                                                                                                                                                        | Gaps / Notes                                                                     |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#1181`, screenshot artifacts, shell tests, and route behavior open the existing Notes queue without changing admin tab IA.                                  | none                                                                             |
| UX flow clarity                               | `5/5`          | Help/Guide copy and tests clarify the shortcut opens Notes and the count means open notes, not unread/SLA.                                                      | none                                                                             |
| Visual design quality                         | `5/5`          | Desktop/mobile screenshot handoff approved; regenerated capture reports no overlaps after bottom-left placement.                                                | none                                                                             |
| Business logic correctness and data integrity | `5/5`          | Diff review and tests show no Notes schema, status, payload, filter, create/edit/upload/link/done/delete behavior changed.                                      | none                                                                             |
| Admin editor ergonomics                       | `5/5`          | Admin shell shortcut reduces steps to reach the open Notes queue from other admin tabs, with Help/Guide support.                                                | none                                                                             |
| Accessibility (a11y)                          | `5/5`          | `buildAdminNotesQuickAccessAriaLabel` and shell tests cover screen-reader count text, keyboard/click behavior, focus styling, and hidden-on-active-Notes state. | none                                                                             |
| Performance (CWV + payloads)                  | `4/5`          | No dependency, asset, polling, or new payload source added; existing full verify passed.                                                                        | supporting only; performance-budget tightening deferred to planned ratchet brief |
| Data placement and sync boundaries            | `5/5`          | Shortcut is local UI state; open count remains existing server-canonical summary behavior.                                                                      | none                                                                             |
| Caching and invalidation strategy             | `4/5`          | No cache layer or invalidation rule changed; existing Notes freshness behavior reused.                                                                          | supporting only                                                                  |
| Reliability and failure handling              | `5/5`          | Shell tests cover count failure hiding misleading badge while preserving safe navigation to Notes.                                                              | none                                                                             |
| Security and authz                            | `5/5`          | Private admin shell-only UI; no public route, authz, RLS, API, or service-role changes.                                                                         | none                                                                             |
| Privacy and compliance                        | `5/5`          | Shortcut exposes aggregate count only; screenshot evidence uses sanitized local harness data.                                                                   | none                                                                             |
| Content governance                            | `4/5`          | Help/Guide updated for operator meaning; no publish/revision workflow changed.                                                                                  | supporting only                                                                  |
| Admin workflow and editability                | `5/5`          | Existing Notes create/edit/filter/archive workflows preserved; quick access uses same tab contract.                                                             | none                                                                             |
| SEO and crawlability                          | `N/A`          | Private authenticated admin UI only; no public metadata, sitemap, robots, canonical, or crawlable route changes.                                                | N/A                                                                              |
| AI discoverability                            | `N/A`          | No public AI-facing content, structured data, entity page, or crawl-safe semantic contract changes.                                                             | N/A                                                                              |
| Analytics and KPI observability               | `4/5`          | No analytics/KPI payload changed by design; PR evidence documents no analytics diff.                                                                            | supporting only                                                                  |
| Commerce and revenue ops                      | `N/A`          | No product, checkout, Stripe, entitlement, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                                             | N/A                                                                              |
| Incident response and support operations      | `5/5`          | Help/Guide clarifies operator shortcut to open support notes without redefining incidents, priority, templates, or recovery procedures.                         | none                                                                             |
| Finance and reporting operations              | `N/A`          | No billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes.                            | N/A                                                                              |
| i18n operational readiness                    | `5/5`          | Compact icon-first shortcut with aria label/count helper avoids visible long-label clipping; desktop/mobile screenshots confirm no overlap.                     | none                                                                             |
| Stack-fit and dependency discipline           | `5/5`          | Reused `AdminWorkspace`, existing Notes count semantics, `lib/admin/notes.ts` helpers, Tailwind/admin tokens, and current tests; no dependency added.           | none                                                                             |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, targeted Playwright E2E hardening, typecheck, lint, brief lint, `verify:pre-pr`, PR CI, and `verify:pre-merge` passed.                         | none                                                                             |
| Scalability and cost efficiency               | `4/5`          | No note-body/attachment payload, polling, or query-per-note behavior added.                                                                                     | supporting only                                                                  |
| DevOps and rollback readiness                 | `5/5`          | Small reversible UI/test/docs diff; PR `#1181` CI and local pre-merge passed; rollback is `git revert 51dbfdde`.                                                | none                                                                             |
