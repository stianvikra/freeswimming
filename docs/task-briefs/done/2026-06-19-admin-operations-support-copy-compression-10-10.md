# Task Brief: Admin Operations Support Copy Compression

## Metadata

- `id`: `2026-06-19-admin-operations-support-copy-compression-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-19`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `execution_mode`: `owner-approved end-to-end implementation; visual screenshot approval stop before verify:pre-pr`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@78a44ec1`
- `audit_status`: `ready`
- `decision`: Execute this bounded admin-readability child now.
- `reason`: Owner approved implementation on `2026-06-19` after the post-merge re-audit and screenshot handoff; Operations remains the smallest useful remaining readability slice because the site-lock card repeats support/runbook/env explanation beside primary status and actions, while Notes has wider create/edit/upload/link blast radius.
- `must_refresh_before_execution_if`: Refresh if `AdminOperationsManager`, runtime flag routes, site-lock runbook, Admin Help/Guide Operations copy, admin screenshot rules, route/label/support sweep rules, or scorecard categories change before implementation starts.

## Goal

Make Admin Operations easier to scan by compressing repeated site-lock support copy into a concise status/action/default-detail pattern without changing runtime flag behavior, site-lock behavior, environment variables, API routes, authz, data storage, or runbook procedures.

## Pre-Implementation Owner Explanation

Vi rydder i Operations-siden, ikke i selve driftslogikken. Admin skal raskere se om private access er paa, hvilke handlinger som finnes, og hvor runbooken ligger, uten aa lese flere nesten like forklaringer hver gang.

Hvorfor det betyr noe: Operations er en risikoflate. Hvis status, handling og forklaring konkurrerer om oppmerksomheten, blir det tregere aa gjore riktig ting under support eller deploy.

Utenfor scope: ingen endring i runtime flags, site-lock-passord, bypass-token, env-navn, GitHub workflow, API, auth, database, runbook-prosedyre, Notes-siden eller performance-budsjett.

Fremoverkompatibilitet: nye Operations-flagg skal fortsatt arve eksisterende flagg-rad pattern automatisk, mens nye sikkerhetskritiske recovery actions, env-verdier eller destruktive toggles maa faa eksplisitt Help/Guide/runbook mapping og tester foer release.

## Post-Merge Re-Audit Evidence

- Repo base: `main@78a44ec1`.
- Audit branch: `docs/admin-readability-post-merge-reaudit-2026-06-19`.
- Screenshot artifacts: `output/admin-readability-post-merge-reaudit-2026-06-19-080846/`.
- Screenshot comparison type: `reference-current` audit evidence only; no runtime UI implementation has been made yet.
- Screenshot caveat: local `/admin` auth was avoided for screenshot-only capture; evidence used a temporary local visual harness that rendered real `AdminWorkspace`, `AdminOperationsManager`, and `AdminNotesManager` with deterministic mock admin API responses. The harness must be removed before validation/PR diff.

Findings:

| Surface                       | Evidence                                                                                                                                                                               | Decision                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Operations site-lock card     | Desktop and mobile screenshots show status, metadata, three actions, runbook link, automatic admin access explanation, disable guidance, and required env vars all visible by default. | Select as next child because it is a presentation-only readability fix with low data/auth blast radius.  |
| Operations flag rows          | Flag rows are already compact: key, description, public/admin scope, and one action.                                                                                                   | Preserve current flag-row pattern.                                                                       |
| Notes manager                 | Screenshot shows queue filters, note cards, create form, incident templates, image upload, context attachment, and save flow in one long surface.                                      | Defer to a separate child because create/edit/upload/link behavior and e2e coverage make it higher risk. |
| Whole-dashboard score refresh | The prior dashboard audit is stale after many merged children.                                                                                                                         | Keep as audit/process follow-up only; this child should not claim whole-dashboard `10/10`.               |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this scoped 10/10 claim gate:

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Operations first-read shows status, primary actions, and where to go for detail without redefining the Operations job.                                         | screenshots + component review                 | `5/5`                   |
| UX flow clarity                               | `target`     | Site-lock status, runbook, unlock/sign-out, and workflow actions remain discoverable while routine support prose no longer dominates default scan.             | screenshots + targeted tests                   | `5/5`                   |
| Visual design quality                         | `target`     | Desktop/mobile Operations screenshots show reduced text wall, no clipped labels, no overlap, and predictable action grouping.                                  | before/after screenshot handoff                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Runtime flag payloads, site-lock snapshot values, env names, links, and no-store fetch behavior remain unchanged.                                              | diff review + existing/updated tests           | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency status/action reading is faster; low-frequency explanation is still reachable.                                                                  | screenshot review + workflow review            | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Any disclosure or compact support panel uses accessible names/roles and remains keyboard reachable.                                                            | component tests + screenshot QA                | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                        | component tests + screenshot QA                | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, image, route, API call, or heavy client state.                                                                             | package/diff review                            | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: server-canonical runtime flag and site-lock data stay unchanged; local UI state is disclosure-only if used.                                   | diff review                                    | `4/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: `/api/admin/operations/flags` remains same-origin/no-store and refresh behavior stays unchanged.                                              | component tests + diff review                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Loading, error, warning, retry, and toggle failure states remain deterministic after layout/copy compression.                                                  | targeted unit tests                            | `5/5`                   |
| Security and authz                            | `target`     | No authz, site-lock bypass, password, token, workflow permission, or runtime flag mutation boundary changes.                                                   | changed-files review + tests                   | `5/5`                   |
| Privacy and compliance                        | `target`     | Screenshots and UI expose no secrets, raw env values, private user data, provider IDs, finance data, or raw analytics payloads.                                | screenshot/privacy review                      | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: no content publish/revision/workflow rules change.                                                                                            | no-content-diff review                         | `4/5`                   |
| Admin workflow and editability                | `target`     | Operations actions stay clear, grouped by risk/frequency, and not hidden behind ambiguous copy.                                                                | tests + screenshots                            | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A with scope rationale: authenticated admin-only UI; no public metadata, sitemap, robots, canonical, or crawlable content changes.                           | private-admin scope review                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A with scope rationale: no public AI-facing content, structured data, entity page, or crawl-safe semantic contract changes.                                  | private-admin scope review                     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event, KPI, dashboard, taxonomy, or raw drilldown changes.                                                                       | no-analytics-diff review                       | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A with scope rationale: no product, checkout, Stripe, entitlement, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                  | explicit commerce scope review                 | `N/A`                   |
| Incident response and support operations      | `target`     | Operators can still find disable guidance, env requirements, workflow link, unlock link, sign-out link, and runbook without reading duplicate default prose.   | Help/Guide/runbook impact review + screenshots | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope review                  | `N/A`                   |
| i18n operational readiness                    | `target`     | New/changed labels are short enough for longer localized text and do not clip on mobile/desktop screenshots.                                                   | responsive screenshots                         | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `AdminOperationsManager`, existing `AdminManagerState`, `fs-*` actions, and native disclosure if needed; no dependency or local Codex config change.     | diff/package review                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted Operations tests cover unchanged fetch/toggle/error behavior and any new disclosure/copy contract.                                                    | Vitest + brief lint + screenshots              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: compact pattern should scale to more Operations flags without more query or route cost.                                                       | future-value review                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/test/docs diff with no migration, workflow, secret, package, or config dependency.                                                         | git diff + gates + PR evidence                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminOperationsManager.tsx`; do not add a route, shell, API, or new global admin primitive.
  - Preserve client component boundary and `/admin?tab=operations` URL behavior through `AdminWorkspace`.
  - Preserve existing refresh/toggle handlers and same-origin/no-store fetches.
- TypeScript/domain contracts:
  - Reuse `AdminRuntimeFlagRow` and the current site-lock snapshot shape.
  - No runtime flag key, site-lock env name, workflow URL, runbook URL, or mutation payload contract changes.
- Supabase/data layer:
  - N/A for this child; no schema, RLS, migrations, generated DB types, storage, or service-role code.
- External services:
  - Do not change GitHub workflow behavior, hosting environment rules, Stripe, email, analytics vendor, or other SDKs.
- UI system:
  - Use existing `fs-library-card`, `AdminManagerState`, `fs-cta-*`, metadata labels, and compact action classes.
  - Prefer native disclosure for low-frequency support detail if detail is collapsed.
  - Screenshot handoff is `before/after` if baseline is recaptured in the implementation branch; otherwise `after/reference` with this re-audit artifact.
- Testing:
  - Update `tests/unit/admin-operations-manager-state.test.tsx` for unchanged state behavior and any new disclosure/control labels.
  - Run screenshot handoff before `npm run verify:pre-pr`.

Reference surface and shared UI contract evidence:

- Reference surface: `components/admin/AdminOperationsManager.tsx` itself, specifically the existing site-lock card, `fs-library-card` shell, `fs-cta-*` actions, metadata label pattern, `AdminManagerState` loading/error/warning states, and runtime flag row contract.
- Shared component contract: keep existing fetch/toggle handlers, `AdminRuntimeFlagRow` rendering, link destinations, and action token classes; only reorganize default support-copy visibility and mobile action widths.
- Justified exception: no new shared primitive is introduced because the fix is narrower than a reusable admin disclosure abstraction and native `details/summary` covers the low-frequency guidance need.

## Data Placement And Sync Contract

- Server-canonical data: runtime flag rows and site-lock snapshot from `/api/admin/operations/flags`.
- Local data: optional disclosure open/closed UI state only.
- Sync policy: unchanged; Refresh reloads Operations state and flag toggles update the existing row from the server response.
- Retention and sensitivity: no secrets, raw env values, token values, private user data, or provider IDs are introduced.
- Cache/invalidation: unchanged admin request pattern with `cache: "no-store"`.

## Identity And Rename Contract

- Canonical stable IDs: runtime flag keys and site-lock environment variable names.
- Human-readable identifiers: visible headings/action labels/help text may be shortened, but must not redefine site-lock or flag semantics.
- Mutability rules: no flag key, env key, workflow URL, runbook path, or action meaning is repurposed.
- Rename vs repurpose policy: new operational actions or env values require a new brief, Help/Guide/runbook mapping, and tests.
- Compatibility contract: existing `/admin?tab=operations`, unlock, sign-out, workflow, and runbook links remain valid.
- Observability and repair: error/warning/retry states remain visible and tested.

## Forward Compatibility Contract

- Extensibility surfaces: runtime flags, site-lock modes, env labels, operational runbooks, recovery actions, locales.
- Source of truth: flag rows still come from `AdminRuntimeFlagRow`; site-lock snapshot still comes from `/api/admin/operations/flags`; runbook/workflow URLs remain explicit constants.
- Additive behavior: new runtime flags should use the existing compact row pattern automatically.
- Explicit mapping requirements: new security-sensitive site-lock modes, env vars, destructive actions, workflow links, or recovery procedures require Help/Guide/runbook mapping and tests before release.
- Unknown or deprecated values: unknown flag keys render as their key plus fallback description; unknown site-lock modes display the returned mode without granting extra behavior.
- Test/evidence: use future flag fixtures and screenshot review to prove the pattern is not hardcoded to today's two harness flags.

## Scope

- `components/admin/AdminOperationsManager.tsx`
- `tests/unit/admin-operations-manager-state.test.tsx`
- Parent brief checkpoint and this child brief
- `components/admin/AdminHelpCenter.tsx` only if visible Operations labels, recovery guidance, or support behavior changes materially

## Out Of Scope

- Runtime flag semantics or keys.
- Site-lock enablement, password, bypass token, env variable names, TTL, cookie, GitHub workflow, runbook procedure, or hosting settings.
- API routes, authz, Supabase schema/RLS/generated types, data storage, secrets, or service-role access.
- Notes create/edit/upload/link workflows.
- Performance-budget threshold changes.
- Whole-dashboard `10/10` claim.
- Merge without explicit owner approval.

## Acceptance Criteria

1. Operations first-read shows site-lock status, key metadata, and available actions before low-frequency explanatory detail.
2. Required guidance remains accessible: runbook, workflow, unlock, sign out, automatic admin preview access, disable guidance, and required env variable names.
3. Runtime flag rows and toggle behavior are unchanged.
4. Loading, error, warning, retry, and toggle failure behavior remain covered.
5. Desktop and mobile screenshots show no clipped text, overlap, or arbitrary button widths.
6. No API, authz, site-lock, env, workflow, runbook procedure, schema, package, or performance-budget changes are introduced.

## Validation

- `npm run lint:briefs`
- targeted test: `./node_modules/.bin/vitest run tests/unit/admin-operations-manager-state.test.tsx`
- targeted route/label/support sweep for Operations/site-lock/env/runbook labels
- screenshot handoff for Operations desktop/mobile before `npm run verify:pre-pr`
- after owner screenshot approval: `npm run verify:pre-pr`
- PR CI
- before merge recommendation: `npm run verify:pre-merge`

Current evidence:

- `./node_modules/.bin/vitest run tests/unit/admin-operations-manager-state.test.tsx` - pass after implementation, `1` file and `4` tests.
- Targeted route/label/support sweep for Operations/site-lock/env/runbook labels - pass; old default prose `This lock is read-only in Admin` is no longer present in app code, expected env/runbook references remain unchanged, and no Help/Guide/runbook procedure update was required.
- Screenshot artifacts: `output/admin-operations-support-copy-compression-2026-06-19-081625/`.
- Screenshot comparison type: `after/reference`; references copied from the `2026-06-19` post-merge re-audit, after screenshots captured from the scoped implementation branch.
- Screenshot caveat: real admin auth was avoided for screenshot-only capture, so evidence used a temporary local visual harness with deterministic mock Operations data. The harness was removed before validation/PR diff.
- Owner screenshot approval: approved in chat on `2026-06-19`; owner also approved merge when tests/checks are good.
- `npm run verify:pre-pr` - pass after owner screenshot approval; full lane selected because runtime component and unit test changed. Unit, build, perf budgets, and e2e completed green with expected local unauth/dev-login skips.
- Performance budget decision: `hold` for this presentation-only Operations slice. The trend report recommended `tighten` after `10` weekly green runs, but this PR intentionally does not ratchet budgets; next budget-ratchet brief should wait for new green weekly cycles after the `2026-06-19` baseline ratchet workstream.

## Help / Guide Impact

Expected `N/A` if implementation only compresses default Operations copy while preserving the same labels and recovery meanings. If visible Operations labels, recovery order, support meaning, or site-lock guidance changes materially, update `AdminHelpCenter`, relevant tests, and runbook references in the same PR.

## Route / Label / Support Surface Sweep

Run before broad gates:

- `AdminOperationsManager`
- `Operations`
- `Runtime controls`
- `Private Access Gate`
- `Site lock`
- `SITE_LOCK_ENABLED`
- `SITE_LOCK_PASSWORD_HASH`
- `SITE_LOCK_BYPASS_TOKEN`
- `Open lock operations workflow`
- `Open unlock page`
- `Sign out this browser`
- `site-lock-operations`
- `Help/Guide`
- `/admin?tab=operations`

Check at minimum `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, and planned/in-progress/done task briefs.

## Screenshot Handoff Plan

- Use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- Capture against local `http://127.0.0.1:3000` with `SITE_LOCK_ENABLED=0`.
- If `/dev/login` or Supabase egress blocks screenshot-only capture, use the documented temporary local visual-harness fallback and remove it before validation/PR diff.
- Artifact folder: `output/admin-operations-support-copy-compression-YYYY-MM-DD-HHMMSS`.
- Required screenshots:
  - `before-admin-operations-desktop.png` and `after-admin-operations-desktop.png`, or `after-admin-operations-desktop.png` plus `reference-current-operations-desktop.png` from this re-audit when a true before recapture is not practical.
  - `before-admin-operations-mobile.png` and `after-admin-operations-mobile.png`, or matching `after/reference` pair.

## Checkpoint Log

- `2026-06-19 | merged | PR #1171 merged at dfddec94 after required CI and npm run verify:pre-merge passed; post-merge preflight opened this docs-only closeout | next: validate and merge the repo-managed closeout PR`
- `2026-06-19 | pre-pr-green | npm run verify:pre-pr passed after owner screenshot approval; recorded performance-budget hold for this UI-only slice | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge, and merge only if required checks and local gates are green`
- `2026-06-19 | screenshot-approved | owner approved after/reference screenshots and approved merge on good tests | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge only if required checks and local gates are green`
- `2026-06-19 | screenshot-handoff | implemented presentation-only Operations site-lock copy compression with support/env guidance behind native disclosure and mobile full-width site-lock actions; targeted Operations Vitest passed; after/reference screenshots captured in output/admin-operations-support-copy-compression-2026-06-19-081625 and temporary harness removed | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-19 | in-progress | owner approved implementation; branch renamed to feat/admin-operations-support-copy-compression and brief moved to in-progress | next: implement presentation-only Operations support-copy compression, update targeted test, capture after/reference screenshots, and stop for owner screenshot approval before verify:pre-pr`
- `2026-06-19 | planned | post-merge re-audit on main@78a44ec1 selected Operations support-copy compression as the next bounded admin-readability child; Notes create-form density is intentionally deferred because its create/edit/upload/link workflows have broader blast radius | next: owner approves implementation before moving this brief to in-progress`

## Completion Record

- `completed`: `2026-06-19`
- `merged_pr`: `#1171`
- `squash_commit`: `dfddec9418214cce9cc9f1f87961a4ecec0f01dc`
- `result`: Closed Admin Operations Support Copy Compression. Operations now keeps site-lock status/actions prominent, moves low-frequency access/env guidance behind native disclosure, and keeps runtime flag/site-lock behavior unchanged.
- `validation`: Targeted Operations Vitest passed; owner-approved after/reference screenshots captured in `output/admin-operations-support-copy-compression-2026-06-19-081625/`; `npm run verify:pre-pr` passed; PR CI passed; `npm run verify:pre-merge` passed with marker `artifacts/verify-pre-merge/20260619-081050.json`.
- `10/10 claim`: yes - all critical target categories for this scoped child reached `5/5`; supporting performance stayed unchanged and the budget ratchet decision is `hold` for this UI-only slice.

Visual note: no product-rendering files changed after the approved screenshot handoff before PR #1171 merged.

| Category                                      | Achieved Score | Evidence                                                                                                                                               | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | Status/action/detail hierarchy implemented in `AdminOperationsManager`; screenshots and PR #1171 review confirmed scoped Operations job clarity.       | No gap.      |
| UX flow clarity                               | `5/5`          | Default site-lock card now keeps status, metadata, workflow, unlock, sign-out, and runbook visible while moving routine support prose into disclosure. | No gap.      |
| Visual design quality                         | `5/5`          | Owner-approved desktop/mobile after/reference screenshots show no clipping, overlap, or arbitrary mobile action widths.                                | No gap.      |
| Business logic correctness and data integrity | `5/5`          | Diff review and tests preserved runtime flag payloads, site-lock snapshot values, env names, links, no-store fetch, and mutation behavior.             | No gap.      |
| Admin editor ergonomics                       | `5/5`          | High-frequency Operations scan path is shorter; low-frequency guidance remains one click away.                                                         | No gap.      |
| Accessibility (a11y)                          | `5/5`          | Native `details/summary` disclosure is keyboard reachable and covered by `admin-operations-manager-state` test.                                        | No gap.      |
| Accessibility                                 | `5/5`          | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same evidence.                                                                              | No gap.      |
| Reliability and failure handling              | `5/5`          | Existing loading/error/retry/toggle state coverage stayed intact; targeted test suite passed.                                                          | No gap.      |
| Security and authz                            | `5/5`          | No authz, bypass token, password, env, workflow permission, or runtime flag mutation boundary changed.                                                 | No gap.      |
| Privacy and compliance                        | `5/5`          | Screenshots and UI expose env names only, not secrets or raw token values; no private user/provider/finance payloads added.                            | No gap.      |
| Admin workflow and editability                | `5/5`          | Operations actions remain visible and grouped by frequency/risk without ambiguous hidden controls.                                                     | No gap.      |
| Incident response and support operations      | `5/5`          | Workflow, runbook, unlock, sign-out, disable guidance, and required env names remain accessible.                                                       | No gap.      |
| i18n operational readiness                    | `5/5`          | Short labels and full-width mobile action layout were checked in responsive screenshot handoff.                                                        | No gap.      |
| Stack-fit and dependency discipline           | `5/5`          | Reused `AdminOperationsManager`, existing action tokens, metadata patterns, and native disclosure; no dependency/config change.                        | No gap.      |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, brief lint, quality gates, full `verify:pre-pr`, PR CI, and `verify:pre-merge` passed.                                                | No gap.      |
| DevOps and rollback readiness                 | `5/5`          | Small reversible UI/test/docs diff; no migration, secret, workflow, package, or runtime config dependency.                                             | No gap.      |
