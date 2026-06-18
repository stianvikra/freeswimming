# Task Brief: Admin Content Mirror And Status Action Density

## Metadata

- `id`: `2026-06-18-admin-content-mirror-and-status-action-density-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `owner-approved implementation after pre-execution audit`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@3d07af08`
- `audit_status`: `ready-for-scoped-implementation`
- `decision`: Execute this as the next bounded Content admin child after PR `#1160` and closeout PR `#1161` closed the shell/mobile and Quick note portions of the source notes.
- `reason`: Source note `a4677939` is now fully captured and marked done in live Admin Notes, but its Content-specific request is not implemented yet. Current `AdminContentManager` still renders all mirror metrics/details expanded and renders every alternate status transition as peer row buttons.
- `must_refresh_before_execution_if`: Refresh if `AdminContentManager`, mirror snapshot model, content status workflow, content tests, Help/Guide content workflow, or screenshot rules change.

## Goal

Reduce Content admin action density by making mirror health scannable when collapsed and grouping low-frequency status transitions without changing content lifecycle semantics.

## Pre-Implementation Owner Explanation

Vi skiller Content-spesifikke ting fra mobilmenyen. Denne briefen handler om speil-statusen og statusknappene i Content: admin skal se om noe er feil uten at hele speil-panelet og alle statusvalg dominerer skjermen.

Hvorfor det betyr noe: Content er et viktig arbeidsområde, men mirror diagnostics og statusendringer er ikke alltid primærjobben. Riktig grouping reduserer feilklikk og scan-støy.

Utenfor scope: mobil admin-tab switcher, Quick note warning, nye content-statusverdier, publiseringslogikk, API/schema/RLS, pass-criteria scoring, message badges og merge.

Fremoverkompatibilitet: nye mirror metrics og statusverdier skal enten arve samme collapse/summary/action-group pattern eller kreve eksplisitt mapping og tester.

## Source Notes Covered

| Note ID                                | Covered Scope                                                                 | Explicit Boundary                                                                                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `a4677939-8f6a-44ce-b585-490f65b07793` | Platform mirror snapshot collapse/summary and Content status action grouping. | Admin shell/header/mobile navigation is done in `docs/task-briefs/done/2026-06-18-admin-shell-mobile-discoverability-and-quick-note-context-10-10.md` via PR `#1160` and closeout PR `#1161`. |

## Pre-Execution Audit Evidence

- Branch/base: `feat/admin-content-mirror-status-density` from clean `main@3d07af08`.
- Live source-note refresh: six captured admin-note IDs still exist and `open=0`; note `a4677939-8f6a-44ce-b585-490f65b07793` remains `is_done=true` with title `Admin dashboard 0 header`, context `page:/admin`, and updated timestamp `2026-06-18T14:59:39.490705+00:00`.
- Code evidence:
  - `components/admin/AdminContentManager.tsx` renders `Platform mirror snapshot` as a full `AdminManagerState` with every metric card and missing/extra/ignored sample text visible immediately.
  - The same component renders `Move to draft`, `Move to review`, `Publish`, and `Archive` as peer buttons for every row status that is not current, beside preview/revisions/delete actions.
  - `handleMirrorMetricFocus` and `handleSetStatus` already own the behavior; this slice should reorganize presentation only.
- Test evidence:
  - `tests/unit/admin-content-manager-state.test.tsx` already asserts mirror summary/focus behavior and QA cleanup feedback.
  - `tests/e2e/admin-content-parity.spec.ts` expects the full mirror metric list to be visible; it must be updated if details become disclosure-based.
  - `tests/e2e/admin-foundation.spec.ts` exercises all four status transitions; grouping must preserve those operations and update locators where needed.
- Help/Guide evidence: `components/admin/AdminHelpCenter.tsx` already documents mirror/status workflows. Update it only if visible labels, diagnostic behavior, or operator recovery guidance changes.

## Pre-Execution Audit Gate

Before implementation starts:

1. Reopen this brief, the residual intake, and the current `AdminContentManager` mirror/status code.
2. Refresh source note `a4677939` and verify whether the shell portion has already been handled elsewhere.
3. Inspect current Content desktop/mobile screenshots or capture fresh evidence for mirror/status density.
4. Confirm whether Help/Guide needs updates for status action labels, mirror diagnostics, or recovery behavior.
5. Run `npm run lint:briefs:all` before runtime edits.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: UX flow clarity, Visual design quality, Business logic correctness and data integrity, Admin editor ergonomics, Accessibility (a11y), Reliability and failure handling, Security and authz, Content governance, Admin workflow and editability, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Content diagnostics and status actions are separated by frequency/risk without changing the Content workspace job.                               | screenshots + workflow review      | `5/5`                   |
| UX flow clarity                               | `target`     | Collapsed mirror state still shows mismatch/identity drift/ignored QA counts; status actions are discoverable but not a button wall.             | tests + screenshots                | `5/5`                   |
| Visual design quality                         | `target`     | Content desktop/mobile screenshots show less diagnostic/action clutter with no clipped text or overlap.                                          | before/after screenshot handoff    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Mirror metric values, focus behavior, status transitions, revisions, preview, and delete behavior remain unchanged.                              | targeted tests + diff review       | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency Content editing remains fast; low-frequency status transitions are grouped safely.                                                | workflow QA + screenshots          | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Collapse/disclosure/menu controls preserve names, roles, focus, keyboard access, and status text.                                                | unit/e2e assertions                | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, fetch, or heavy client state added.                                                                              | package/diff review                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical content/mirror data and local UI disclosure state remain distinct.                                                              | diff review                        | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing admin no-store/fetch behavior remains unchanged.                                                                       | route diff review                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Existing mirror warning/error and content status feedback paths stay deterministic.                                                              | targeted tests                     | `5/5`                   |
| Security and authz                            | `target`     | Admin/editor/admin-only action boundaries remain unchanged and fail closed.                                                                      | authz diff review + existing tests | `5/5`                   |
| Privacy and compliance                        | `target`     | No private user/payment/provider/raw analytics data added to diagnostics/screenshots.                                                            | screenshot/privacy review          | `5/5`                   |
| Content governance                            | `target`     | Publish/review/archive/draft semantics stay explicit and recoverable.                                                                            | Help/Guide impact review + tests   | `5/5`                   |
| Admin workflow and editability                | `target`     | Content status/edit/preview/revision actions remain available and easier to scan.                                                                | e2e/unit + screenshots             | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: content status UI must not alter public metadata, sitemap, robots, canonical, or preview indexing.                              | public route no-change review      | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public semantic output must remain unchanged.                                                                                   | public markup no-change review     | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event or KPI change.                                                                                               | no-analytics-diff review           | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no product, checkout, Stripe, entitlement, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                  | explicit commerce scope rationale  | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: mirror diagnostics support repair but no recovery procedure changes unless Help/Guide says so.                                  | support-surface sweep              | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope rationale   | `N/A`                   |
| i18n operational readiness                    | `target`     | Collapsed labels and status menus tolerate longer labels without clipping.                                                                       | responsive screenshots             | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `AdminContentManager`, existing mirror model, status constants, and local primitives; no dependency.                                       | diff/package review                | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted Content/mirror/status tests cover changed behavior; screenshots before broad gates.                                                     | test logs + screenshots            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: pattern should scale to more mirror metrics/statuses without new queries.                                                       | future-value review                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/test diff with no migration or API dependency.                                                                               | git diff + gates                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: reuse `AdminContentManager`; no route or API changes expected.
- TypeScript/domain: preserve content status enum and mirror snapshot types.
- Supabase/data: no schema/RLS/generated type changes.
- UI system: use existing `AdminManagerState`, status chips, `fs-*` actions, and native disclosure/menu patterns.
- Testing: update mirror/status unit and e2e coverage; screenshot handoff required.

## Reference Surface And Route/Label Sweep Evidence

- Reference surface: the mature in-repo surface is `components/admin/AdminContentManager.tsx` itself, specifically its existing `AdminManagerState` mirror diagnostics, `STATUS_OPTIONS` / `STATUS_LABEL_BY_VALUE`, `fs-*` action token classes, and Content row edit/revision/delete action layout. This slice reuses those shared component/view-model contracts and only reorganizes disclosure/action density.
- Shared UI contract: keep admin action buttons on existing `fs-cta-*` classes, use local UI disclosure state only, keep server-canonical mirror/status data unchanged, and preserve the existing row action mutation handlers.
- Route/label/support sweep identifiers searched: `View mirror details`, `Hide mirror details`, `Status actions`, `Move to draft`, `Move to review`, `Publish`, `Archive`, `Platform mirror snapshot`, `Delete ignored QA/test records`, `admin-content-status-actions`, and `admin-mirror-summary`.
- Directories/surfaces checked: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, planned/in-progress/done task briefs, and Help/Guide assertions.
- Fallout handled: Content product labels/locators updated in `AdminContentManager`, Help/Guide glossary updated in `AdminHelpCenter`, unit assertions updated in `admin-content-manager-state` and `admin-help-center`, and e2e locators updated in `admin-content-parity` and `admin-foundation`.
- Intentional leftovers: generic `Publish`/`Archive` hits in goals, habits, email templates, messages, API routes, and historical briefs are unrelated domain labels and stay unchanged.

## Data Placement And Sync Contract

- Server-canonical data: admin content rows and mirror snapshot response.
- Local data: collapsed/open disclosure state or menu open state only.
- Sync policy: unchanged refresh/load behavior.
- Retention/sensitivity: no new sensitive data.
- Cache/invalidation: unchanged admin route behavior.

## Identity And Rename Contract

- Canonical IDs: content IDs, slugs, status values, mirror metric keys.
- Human-readable labels: visible status labels may be reorganized, not redefined.
- Mutability rules: no status value repurpose.
- Rename vs repurpose: new lifecycle semantics require new brief/tests.
- Compatibility: existing admin links and preview links remain.
- Observability and repair: mirror mismatch counts remain visible.

## Forward Compatibility Contract

- Extensibility surfaces: mirror metrics, content statuses, lifecycle actions, locales.
- Source of truth: mirror metrics from existing view model; statuses from status constants.
- Additive behavior: new mirror metrics join summary/detail pattern.
- Explicit mapping requirements: new status semantics or destructive actions need Help/Guide/tests.
- Unknown/deprecated values: keep safe fallback status rendering.
- Test/evidence: future metric/status fixtures or explicit rationale.

## Scope

- Content mirror snapshot summary/detail UI.
- Content row/module/lesson status action grouping.
- Relevant tests and Help/Guide fallout.

## Out Of Scope

- Admin shell mobile navigation.
- Quick note context warning.
- Content API/schema/status semantics.
- Public lesson UI/scoring changes.

## Acceptance Criteria

1. Mirror snapshot has a compact first-read state while `mismatchCount`, `coverageMismatchCount`, and `ignoredRecordCount` remain visible without opening details.
2. Mirror metric details remain reachable through an accessible disclosure/focus action, and clicking a metric still focuses the matching Content list scope.
3. Status transitions are grouped under a lifecycle/status action affordance without changing `draft`, `review`, `published`, or `archived` semantics.
4. Existing preview, revisions, delete, QA cleanup, edit, create, and refresh behavior remains unchanged.
5. Content data behavior, authz boundaries, API routes, schema, RLS, and cache behavior are unchanged.
6. Screenshot handoff is owner-approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- targeted Content/mirror/status tests, expected starting point:
  - `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/admin-content-mirror.test.ts tests/unit/admin-help-center.test.tsx`
  - targeted Playwright only if unit coverage cannot prove the changed status/mirror behavior
- screenshot handoff
- after screenshot approval: `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`

Current evidence:

- `npm run lint:briefs` - pass before runtime edits; no changed task briefs found in the initial branch state.
- `npm run lint:briefs:all` - pass before runtime edits.
- `git diff --check` - pass after the form CTA correction and test lock.
- `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/admin-content-mirror.test.ts tests/unit/admin-help-center.test.tsx` - pass after the form CTA correction and width-rule test lock, `3` files and `27` tests.
- `npm run lint:briefs:all` - pass after the form CTA correction and width-rule test lock.
- `npx playwright test tests/e2e/admin-content-parity.spec.ts tests/e2e/admin-foundation.spec.ts --project=desktop-chromium` - pass after the form CTA correction for available local coverage: `2` passed, `3` skipped because local `/dev/login` returned non-JSON while Supabase/dev-login was unavailable.
- `npm run verify:pre-pr` - pass after owner screenshot approval and stale `.next/dev/types` cleanup: full lane, `249` unit files / `1619` tests passed, build passed, perf budgets passed, and E2E `110` passed / `568` skipped in the local public lane.
- Screenshot artifacts: `output/admin-content-mirror-status-density-2026-06-18-190242/`.
- Corrected screenshot artifacts after owner visual feedback: `output/admin-content-mirror-status-density-corrections-2026-06-18-193649/`.
- Width-rule screenshot artifacts after second owner visual feedback: `output/admin-content-mirror-status-density-width-rules-2026-06-18-195159/`.
- Form CTA screenshot artifacts after third owner visual feedback: `output/admin-content-mirror-status-density-form-cta-2026-06-18-202042/`, with previous width-rule mobile/desktop references copied into the same folder for after/reference review.
- Screenshot caveat: real admin auth was blocked for screenshot-only capture, so before/after evidence used a temporary local visual harness with deterministic mock content data. The harness and capture script were removed before validation/PR diff.
- Performance budget tighten decision: `hold` in this UI/action-density slice. The pre-PR run reported `10` consecutive weekly green perf-budget runs and recommended tightening one stretch target; that should be handled as a dedicated perf-budget owner decision, not bundled into this Content admin UI PR.

## Help / Guide Impact

Required if status action labels, mirror diagnostic behavior, or recovery guidance changes.

## Checkpoint Log

- `2026-06-18 | planned | split Content-specific mirror/status action items from live note a4677939 into a dedicated follow-up so the admin shell mobile slice stays narrow | next: re-audit after shell mobile discoverability before implementation`
- `2026-06-18 | in-progress | refreshed on main@3d07af08 after PR #1160 and closeout PR #1161; live admin-note metadata still shows the six captured notes done/open=0; current code audit confirmed mirror details and row status transitions remain the bounded Content density scope | next: implement presentation-only mirror/status grouping, update targeted tests and Help/Guide if labels/diagnostics change, then capture screenshot handoff`
- `2026-06-18 | screenshot-handoff | implemented presentation-only mirror disclosure and row status-action grouping, updated Help/Guide glossary and targeted unit/e2e locators, captured before/after screenshots in output/admin-content-mirror-status-density-2026-06-18-190242, and removed the temporary harness/script | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-18 | visual-correction | owner rejected the first visual pass as too stacked and weak on mobile; moved mirror actions into a right-aligned top row, toggled View/Hide mirror label, replaced row details with an aria-expanded status button plus full-width mobile lifecycle panel, refreshed screenshots in output/admin-content-mirror-status-density-corrections-2026-06-18-193649, and removed the temporary harness/script | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-18 | width-rule-correction | owner flagged vertical misalignment and orphan 50% mobile buttons; centered desktop action rows, made mirror actions 100% on narrow mobile, made standard row actions 50/50 with orphan last action spanning 100%, kept lifecycle mutation actions 100%, refreshed screenshots in output/admin-content-mirror-status-density-width-rules-2026-06-18-195159, and removed the temporary harness/script | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-18 | form-cta-correction | owner flagged create-form submit as an arbitrary small mobile button; made Content create submit 100% on mobile and auto-width on desktop, applied the same 50/50/orphan-full mobile grid to inline edit actions, locked those width rules in unit coverage, refreshed screenshots in output/admin-content-mirror-status-density-form-cta-2026-06-18-202042, copied previous width-rule references into the same handoff folder, and removed the temporary harness/script | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-18 | pre-pr-green | owner approved screenshots and merge-on-good-tests; npm run verify:pre-pr passed after clearing stale generated Next dev type cache from the removed visual harness; perf-budget tighten recommendation recorded as hold for this UI slice | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge before merge`
- `2026-06-18 | merged | PR #1162 merged as de577676 after local pre-pr/pre-merge gates and required GitHub checks passed; deploy-preview GitHub Action failed with Vercel upload abort while the Vercel status itself was green and non-required | next: close this brief through repo-managed docs-only closeout`

## Completion Record

- `completed`: `2026-06-18`
- `merged_pr`: `#1162`
- `squash_commit`: `de577676`
- `result`: Closed the Content admin mirror/status density slice. Mirror health now reads as a compact summary until details are opened, lifecycle transitions are grouped behind a status action, desktop action rows are vertically centered/right aligned, mobile action widths follow predictable 100% or 50/50 rules, and the create/edit submit buttons no longer render as arbitrary narrow mobile controls.
- `validation`: Targeted unit and Playwright checks passed, screenshot handoff was owner-approved, `npm run verify:pre-pr` passed full public lane on `8f90aac7`, `npm run verify:pre-merge` passed for `8f90aac7`, required GitHub checks passed on PR `#1162` (`Analyze (javascript-typescript)`, `size-check`, `verify`), and PR `#1162` was squash-merged as `de577676`.
- `screenshot_artifacts`: `output/admin-content-mirror-status-density-form-cta-2026-06-18-202042/`
- `remaining_gaps`: none for this bounded child. Performance-budget tightening remains intentionally held for a dedicated owner decision because it is platform governance, not Content admin UI scope.
- `10/10 claim`: yes - all critical target categories for this child reached `5/5`.

Critical target categories confirmed `5/5`:

- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Admin editor ergonomics
- Reliability and failure handling
- Security and authz
- Content governance
- Admin workflow and editability
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

Canonical accessibility target also confirmed in the score table: `Accessibility (a11y)` is `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                                                             | Gaps / Notes                                                                                 |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#1162` merged the scoped Content-only mirror/status density changes without moving routes or changing the Content workspace job.                                                                                                 | None.                                                                                        |
| UX flow clarity                               | `5/5`          | Mirror summary remains visible while details are disclosed on demand; status actions are grouped; owner-reviewed screenshot artifacts show the corrected desktop/mobile flow.                                                        | None.                                                                                        |
| Visual design quality                         | `5/5`          | Owner-approved final screenshot handoff at `output/admin-content-mirror-status-density-form-cta-2026-06-18-202042/` covers desktop/mobile mirror, row actions, and form CTA width corrections.                                       | None.                                                                                        |
| Business logic correctness and data integrity | `5/5`          | `AdminContentManager` kept mirror/status handlers and server-canonical data unchanged; targeted unit tests and Playwright locators passed; no schema/API/RLS changes.                                                                | None.                                                                                        |
| Admin editor ergonomics                       | `5/5`          | Low-frequency lifecycle transitions are grouped while edit, revisions, delete, mirror focus, QA cleanup, and save actions remain directly reachable where expected.                                                                  | None.                                                                                        |
| Accessibility (a11y)                          | `5/5`          | Disclosure controls use stable labels, `aria-expanded`, and `aria-controls`; unit/e2e coverage locks mirror details and status-action panel behavior.                                                                                | None.                                                                                        |
| Data placement and sync boundaries            | `5/5`          | Only local disclosure/action-panel state was added; server-canonical mirror and content status data remain unchanged.                                                                                                                | None.                                                                                        |
| Reliability and failure handling              | `5/5`          | Existing mirror warnings, ignored QA/test cleanup, status feedback, and error paths remain deterministic; targeted and full gates passed.                                                                                            | None.                                                                                        |
| Security and authz                            | `5/5`          | Admin route/API/authz boundaries were not changed; existing admin negative-path and public lane CI coverage stayed green.                                                                                                            | None.                                                                                        |
| Privacy and compliance                        | `5/5`          | No new private data, provider data, payment data, raw analytics, or policy-impacting surface was introduced; PR body policy scan was N/A.                                                                                            | None.                                                                                        |
| Content governance                            | `5/5`          | Help/Guide glossary was updated for `Status actions`; publish/review/archive/draft semantics remain explicit and tested.                                                                                                             | None.                                                                                        |
| Admin workflow and editability                | `5/5`          | Content edit/create/revision/delete/status workflows stayed available with reduced scan noise; `tests/e2e/admin-foundation.spec.ts` and unit state tests were updated.                                                               | None.                                                                                        |
| i18n operational readiness                    | `5/5`          | Mobile actions now use 100% or 50/50/orphan-full width rules and desktop action rows are centered, reducing clipping risk for longer labels.                                                                                         | None.                                                                                        |
| Stack-fit and dependency discipline           | `5/5`          | Reused `AdminContentManager`, existing status constants, mirror view model, `fs-*` action classes, and Help/Guide surface; no dependency/package/config changes.                                                                     | None.                                                                                        |
| Testing and QA automation                     | `5/5`          | Targeted Vitest passed (`3` files / `27` tests); targeted Playwright passed for available local coverage (`2` passed / `3` environment-gated skips); full `verify:pre-pr` passed (`249` unit files / `1619` tests, E2E `110`/`568`). | Local admin-auth Playwright paths remained skipped when `/dev/login` returned non-JSON.      |
| DevOps and rollback readiness                 | `5/5`          | `npm run verify:pre-merge` passed; required GitHub checks passed; rollback is normal `git revert de577676`. The non-required deploy-preview Action failed with upload abort while Vercel status passed.                              | No release blocker; deploy-preview Action flake remains outside this bounded runtime change. |
