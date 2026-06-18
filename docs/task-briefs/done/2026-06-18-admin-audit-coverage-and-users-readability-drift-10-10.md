# Task Brief: Admin Audit Coverage And Users Readability Drift

## Metadata

- `id`: `2026-06-18-admin-audit-coverage-and-users-readability-drift-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `branch`: `admin-audit-coverage-users-readability-drift`
- `execution_mode`: `end-to-end until screenshot handoff; wait for owner visual approval before verify:pre-pr/PR`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a1d2cf17`
- `audit_status`: `ready`
- `decision`: Execute this bounded child now.
- `reason`: Baseline audit found stale admin coverage/docs and misleading Users read-only wording while user creation remains too sensitive for this slice.
- `must_refresh_before_execution_if`: Refresh if `ADMIN_TAB_VALUES`, `AdminWorkspace`, `AdminUsersManager`, admin Help/Guide Users copy, admin e2e auth helpers, screenshot rules, or scorecard categories change before completion.

## Goal

Make current active Users and Analytics admin modules first-class in broad admin coverage/docs, and correct Users readability drift without adding user creation or changing auth/data behavior.

## Pre-Implementation Owner Explanation

Jeg retter admin-flaten der den er blitt utdatert: tester og docs skal vite om Users og Analytics, og Users skal ikke lenger beskrives som read-only nar den faktisk har Role management.

Dette betyr noe fordi admin ellers kan se tryggere og mer komplett ut enn den er, og fordi neste storre admin-endring trenger riktig test- og dokumentasjonsgrunnlag.

Utenfor scope: brukeroppretting, invitasjoner, nye roller, databaseendringer, service-role/Auth Admin-mutasjoner, IA-redesign av alle admin-tabs, og merge uten eksplisitt approval.

Forward compatibility: nye admin-tabs skal legges inn via `ADMIN_TAB_VALUES`/module boundaries og brede admin audit-lister samtidig, mens nye bruker-mutasjoner fortsatt krever eksplisitt mapping, Help/Guide, privacy review og negative-path tests.

## Scope

- Add active `analytics` and `users` to broad admin a11y/navigation coverage.
- Refresh admin workspace module docs and full admin audit checklist so current active modules are represented.
- Correct misleading Users read-only wording and tests around Users support/role-management behavior.
- Update task briefs/checkpoints for this child and parent audit.
- Capture after/reference or before/after screenshots for the visible Users/Admin copy change before broader gates.

## Out Of Scope

- User creation, account invite, profile bootstrap, access grants, entitlement changes, or Auth Admin API calls.
- Supabase migrations, generated DB types, RLS, service-role policy changes, or new secrets.
- New admin IA grouping, new tabs, new design system primitives, or broad admin redesign.
- Analytics taxonomy, raw event drilldown, checkout/finance/Stripe, or performance-budget threshold changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a 10/10 claim: Product goals and IA, UX flow clarity, Visual design quality, Admin editor ergonomics, Accessibility (a11y), Reliability and failure handling, Security and authz, Privacy and compliance, Admin workflow and editability, Incident response and support operations, i18n operational readiness, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                 | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users/Analytics are represented in broad admin audit/docs; no new IA grouping is shipped.                                                                          | docs/tests diff + screenshot handoff        | `5/5`                   |
| UX flow clarity                               | `target`     | Users copy reflects account/access/support plus role management; no read-only contradiction remains.                                                               | unit/e2e expectations + screenshots         | `5/5`                   |
| Visual design quality                         | `target`     | Visible Users wording remains compact, aligned with existing admin tokens, and does not introduce overlap on desktop/mobile screenshots.                           | screenshot handoff                          | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | No data behavior changes; tests confirm existing role management/user overview behavior still renders.                                                             | targeted tests                              | `4/5`                   |
| Admin editor ergonomics                       | `target`     | High-risk Role management is named as audited role control, not casual account creation.                                                                           | copy/test review                            | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Broad admin a11y target list includes active Users and Analytics.                                                                                                  | e2e spec diff + targeted run when available | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No dependency or runtime-heavy UI addition.                                                                                                                        | package/diff review                         | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | No server/local data boundary change.                                                                                                                              | scope review                                | `4/5`                   |
| Caching and invalidation strategy             | `supporting` | No cache/revalidation change.                                                                                                                                      | scope review                                | `4/5`                   |
| Reliability and failure handling              | `target`     | Analytics failure state remains covered by broad navigation/a11y target and docs checklist.                                                                        | e2e target + screenshot/reference notes     | `5/5`                   |
| Security and authz                            | `target`     | User creation remains deferred; role mutation wording stays admin-only and audited.                                                                                | diff review + tests                         | `5/5`                   |
| Privacy and compliance                        | `target`     | Users copy/tests preserve private data exclusions.                                                                                                                 | unit/e2e assertions                         | `5/5`                   |
| Content governance                            | `supporting` | Admin checklist/docs are refreshed; no publish/content workflow changes.                                                                                           | docs diff                                   | `4/5`                   |
| Admin workflow and editability                | `target`     | Active admin workflows in broad docs/checklist include Users, Analytics, Operations, Categories, and existing modules.                                             | docs checklist diff                         | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated/private admin surfaces and docs-only governance updates do not change public crawlable routes, metadata, sitemap, robots, or canonicals. | explicit private-admin rationale            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-facing content, structured data, or crawlable semantic surface changes.                                                                   | explicit scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Admin Analytics coverage/docs improve; event taxonomy and KPI payloads do not change.                                                                              | e2e/docs diff                               | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Commerce remains represented in checklist; no product/checkout/revenue data changes.                                                                               | docs diff                                   | `4/5`                   |
| Incident response and support operations      | `target`     | Full admin audit checklist and Users support copy better match current support triage surfaces.                                                                    | docs/tests/screenshot evidence              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance report, invoice, refund, payout, reconciliation, entitlement grant, or revenue truth changes.                        | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `target`     | Changed copy remains short, plain, and responsive; no fixed-width label clipping in screenshot evidence.                                                           | screenshot handoff + copy review            | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin components/tests/docs; no new dependency or local Codex config.                                                                               | package/diff review                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/e2e/docs lint run passes; broad pre-PR gate waits for screenshot approval.                                                                           | test logs                                   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Coverage/docs follow canonical tab/module lists without per-feature runtime overhead.                                                                              | code/docs review                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible branch, no schema/runtime dependency, clean checkpoint log, screenshot gate before PR.                                                            | git status + validation                     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: reuse `AdminWorkspace` and `AdminUsersManager`; no new route, server action, API route, or layout primitive.
- TypeScript/domain: treat `ADMIN_TAB_VALUES` and admin workspace boundaries as canonical for active module lists.
- Supabase/data: no schema, RLS, generated types, service-role, or Auth Admin behavior change.
- UI system: keep existing `fs-library-card`, `fs-cta-*`, `ui-field`, status chip, and admin heading patterns; screenshot handoff type is before/after for Users/Admin surfaces.
- Testing: update targeted unit/e2e expectations and run relevant Vitest/Playwright where local auth/dev constraints allow; run `npm run lint:briefs`.

## Data Placement And Sync Contract

N/A with rationale: this slice changes copy, docs, and test coverage only. It does not add state, storage, sync, retry, cache, or data ownership behavior.

## Identity And Rename Contract

- Canonical IDs: admin tab values remain unchanged (`analytics`, `users`, etc.).
- Human-readable labels: Users descriptive copy may change to match existing behavior; role/action semantics do not change.
- Rename vs repurpose: no machine key is renamed or repurposed.
- Compatibility: existing `/admin?tab=users` and `/admin?tab=analytics` links continue unchanged.

## Forward Compatibility Contract

- Extensibility surfaces: admin tabs, Help/Guide sections, audit checklist workflow rows, user role/access labels, and future admin mutation labels.
- Source of truth: active tabs derive from `ADMIN_TAB_VALUES`; high-risk module contracts live in `ADMIN_WORKSPACE_MODULE_BOUNDARIES`.
- Additive behavior: future tabs should be added to broad coverage/docs/checklist in the same child that activates them.
- Explicit mapping requirements: user create/invite/access-grant behavior requires separate Auth Admin/access brief, Help/Guide update, privacy review, and negative-path tests.
- Unknown/deprecated values: unknown admin tabs still fail safely through existing parser behavior; stale docs/tests are audit findings.

## Help / Guide Impact

Users copy changes must be checked against `AdminHelpCenter`. If visible workflow semantics change, update Help/Guide in the same PR. If only stale read-only wording is corrected outside Help/Guide, record no Help/Guide runtime diff in closeout.

## Route / Label / Support Surface Sweep

Run targeted sweep before broad gates:

- `AdminWorkspace`
- `ADMIN_TAB_VALUES`
- `analytics`
- `users`
- `read-only`
- `role management`
- `Help/Guide`
- `admin audit`
- `support`
- `access`
- `role`

## Acceptance Criteria

1. Broad admin a11y/navigation coverage includes active Users and Analytics.
2. Admin module docs/checklist include Users and Analytics as active surfaces.
3. Users copy no longer calls the surface read-only while Role management exists.
4. No user creation/invite/access-grant behavior is added.
5. Relevant unit/e2e expectations pass locally where environment allows.
6. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.
7. Changed briefs pass `npm run lint:briefs`.

## Validation Plan

- `npm run lint:briefs`
- Targeted Vitest for admin workspace/users copy.
- Targeted Playwright admin Users/Analytics coverage where local auth/dev-login allows; otherwise document skip/blocker.
- Screenshot handoff for Users/Admin visible copy.
- After owner screenshot approval: `npm run verify:pre-pr`, commit/push/PR, CI, `npm run verify:pre-merge`.

## Post-Implementation Audit (Before Owner Screenshot Approval)

Audit status: implementation patch is release-safe at targeted level, but broad gates are intentionally paused until owner approves the screenshot handoff.

Evidence:

- Primary screenshot artifacts: `output/admin-audit-dashboard-expanded-handoff-2026-06-18-090009/`.
- Supporting before/after Users artifacts: `output/admin-audit-users-readability-drift-2026-06-18-084735/`.
- Primary screenshot type: after/reference. Changed surface is Users desktop/mobile; reference surfaces are default Content dashboard and Analytics error/retry dashboard.
- Supporting screenshot type: before/after for Users desktop and mobile.
- Capture caveat: local `/dev/login` remains blocked by Supabase cloud egress guard, so screenshots used a temporary local visual harness that mirrored `app/admin/layout.tsx` and mocked admin API responses. The harness route was removed after capture.
- Product-rendering files changed after final capture: none. Only the capture-only harness was removed after screenshots.
- Route/label/support sweep: no remaining `Read-only accounts` or `read-only accounts` copy in scoped admin surfaces; parent brief keeps the stale baseline finding as historical evidence.

Target score snapshot:

| Target Category                          | Score | Evidence                                                                                                     | Remaining Gap                                         |
| ---------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Product goals and IA                     | `5/5` | Users/Analytics added to broad admin coverage and docs.                                                      | None in child scope.                                  |
| UX flow clarity                          | `5/5` | Users header now states role changes are admin-only and audited.                                             | Owner screenshot approval pending.                    |
| Visual design quality                    | `5/5` | Expanded dashboard handoff plus Users before/after screenshots show no overlap or clipped changed copy.      | Owner screenshot approval pending.                    |
| Admin editor ergonomics                  | `5/5` | Role controls remain guarded and not confused with user creation.                                            | None in child scope.                                  |
| Accessibility (a11y)                     | `5/5` | Broad admin a11y target list now includes Users and Analytics.                                               | Full e2e run after screenshot approval.               |
| Reliability and failure handling         | `5/5` | Analytics remains in broad audit target list; no route/cache behavior changed.                               | Full e2e run after screenshot approval.               |
| Security and authz                       | `5/5` | User creation remains deferred; role-change copy says admin-only/audited.                                    | None in child scope.                                  |
| Privacy and compliance                   | `5/5` | Users privacy boundary assertions and copy remain intact.                                                    | None in child scope.                                  |
| Admin workflow and editability           | `5/5` | AW-012 checklist/findings-log now track active modules A8-A14.                                               | Future full AW-012 audit owns deeper A8-A14 evidence. |
| Incident response and support operations | `5/5` | Auth/account support and Users role-control wording now align with docs/checklist.                           | Future full AW-012 audit owns deeper evidence.        |
| i18n operational readiness               | `5/5` | Changed sentence wraps cleanly in mobile and desktop screenshots.                                            | None in child scope.                                  |
| Stack-fit and dependency discipline      | `5/5` | Existing admin components/tests/docs reused; no dependency added.                                            | None.                                                 |
| Testing and QA automation                | `5/5` | Targeted unit tests, typecheck, admin-audit lint, brief lint, and diff check pass before screenshot handoff. | `verify:pre-pr` waits for owner screenshot approval.  |
| DevOps and rollback readiness            | `5/5` | Small reversible diff; no schema/config/migration.                                                           | Commit/PR waits until after screenshot approval.      |

`10/10 claim`: yes for this scoped Users/Analytics coverage and Users readability child; screenshot owner approval, `verify:pre-pr`, PR CI, and `verify:pre-merge` passed for PR `#1153`.

Whole-dashboard `10/10` claim: no. This child does not audit every admin menu, tab state, action group, or Help/Guide path. The done follow-up brief `docs/task-briefs/done/2026-06-18-admin-full-dashboard-ui-ux-audit-and-gap-list-10-10.md` records the full dashboard UI/UX audit and gap list.

## Checkpoint Log

- `2026-06-18 | full-dashboard audit executing | owner clarified that one changed Users surface plus representative references is not the same as auditing all dashboard menus/states; moved follow-up brief to docs/task-briefs/in-progress/2026-06-18-admin-full-dashboard-ui-ux-audit-and-gap-list-10-10.md; current child remains scoped to Users/Analytics coverage drift and Users readability wording | next: complete full-dashboard audit before deciding whether to resume this child or select a broader UI/UX implementation child`
- `2026-06-18 | expanded screenshot handoff ready | owner correctly flagged that Users-only screenshot evidence was too narrow for dashboard coverage scope; captured expanded after/reference handoff at output/admin-audit-dashboard-expanded-handoff-2026-06-18-090009 with Content, Users desktop/mobile, and Analytics error/retry; temporary harness removed; no scoped product-rendering files changed after final capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-18 | screenshot handoff ready | targeted validation passed, before/after screenshots captured at output/admin-audit-users-readability-drift-2026-06-18-084735, temporary harness removed, and post-implementation audit recorded | next: owner requested broader dashboard screenshot evidence`
- `2026-06-18 | implementation patch | updated Users copy/title away from read-only, added Users/Analytics to broad admin e2e coverage, refreshed admin module contracts and AW-012 checklist/findings-log active module matrix | next: run targeted validation and screenshot handoff`
- `2026-06-18 | start | owner approved child admin-audit-coverage-and-users-readability-drift; branch created from main@a1d2cf17; scope limited to coverage/docs/Users readability drift with no user creation | next: implement scoped docs/tests/copy changes`
- `2026-06-18 | merged | PR #1153 merged as squash commit 003797fe after owner-approved screenshots, local verify:pre-pr, green required CI, and local verify:pre-merge; no user creation/auth/schema behavior was added | next: repo-managed docs-only closeout`

## Completion Record

- `completed`: `2026-06-18`
- `merged_pr`: `#1153`
- `squash_commit`: `003797fe`
- `result`: Closed the Users/Analytics admin coverage drift and Users readability child by adding active Users and Analytics coverage to admin audit/test surfaces, correcting stale read-only Users wording, and preserving the no-user-creation boundary.
- `validation`: owner-approved screenshot evidence, `npm run verify:pre-pr` PASS on commit `41079043`, GitHub required checks PASS for PR `#1153`, and `npm run verify:pre-merge` PASS with marker `artifacts/verify-pre-merge/20260618-093609.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5` for this scoped child. Whole-dashboard admin product `10/10` remains explicitly not claimed here.

| Category                                 | Achieved Score | Evidence                                                                             | Gaps / Notes                                                |
| ---------------------------------------- | -------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Product goals and IA                     | `5/5`          | Users and Analytics added to broad admin coverage/docs; PR `#1153`.                  | No gap in child scope.                                      |
| UX flow clarity                          | `5/5`          | Users copy no longer contradicts role management; tests updated.                     | No gap in child scope.                                      |
| Visual design quality                    | `5/5`          | Owner-approved Users/dashboard screenshot handoff and no clipped changed copy.       | Whole-dashboard polish is owned by separate audit findings. |
| Admin editor ergonomics                  | `5/5`          | Role controls remain named as guarded admin controls, not casual account creation.   | User creation remains out of scope.                         |
| Accessibility (a11y)                     | `5/5`          | Broad admin e2e target list includes Users and Analytics; CI passed.                 | No gap in child scope.                                      |
| Reliability and failure handling         | `5/5`          | Analytics retry/error surface remains covered; no route/cache behavior changed.      | No gap in child scope.                                      |
| Security and authz                       | `5/5`          | No Auth Admin, schema, RLS, or access broadening; user creation explicitly deferred. | No gap in child scope.                                      |
| Privacy and compliance                   | `5/5`          | Users private-data exclusion assertions preserved.                                   | No gap in child scope.                                      |
| Admin workflow and editability           | `5/5`          | Active admin workflow checklist/docs include current Users and Analytics surfaces.   | Deeper full-dashboard findings recorded separately.         |
| Incident response and support operations | `5/5`          | Users/support copy and audit checklist align with current account support triage.    | No gap in child scope.                                      |
| i18n operational readiness               | `5/5`          | Short changed copy wraps cleanly in desktop/mobile evidence.                         | No gap in child scope.                                      |
| Stack-fit and dependency discipline      | `5/5`          | Existing admin components/tests/docs reused; no dependency or Codex config change.   | No gap.                                                     |
| Testing and QA automation                | `5/5`          | Targeted tests, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` passed.  | No gap.                                                     |
| DevOps and rollback readiness            | `5/5`          | Small reversible squash commit `003797fe`; rollback is `git revert 003797fe`.        | No gap.                                                     |
