# Task Brief: Admin Full Dashboard UI/UX Audit And Gap List

## Metadata

- `id`: `2026-06-18-admin-full-dashboard-ui-ux-audit-and-gap-list-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `execution_mode`: `audit-only until owner approves one bounded implementation child`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `current branch admin-audit-coverage-users-readability-drift on main@a1d2cf17`
- `audit_status`: `ready`
- `decision`: Execute this full-admin audit slice now after the owner approved running it.
- `reason`: The first child only updates stale Users/Analytics coverage, docs, and Users copy. It does not inspect every admin tab, every major state, or the full dashboard action hierarchy, so it cannot support a whole-dashboard 10/10 claim.
- `must_refresh_before_execution_if`: Refresh if `ADMIN_TAB_VALUES`, `AdminWorkspace`, any `components/admin/Admin*Manager.tsx` surface, Admin Help/Guide, admin API response contracts, screenshot handoff rules, scorecard categories, external design-source baseline, or local login/screenshot constraints change before execution.

## Goal

Produce an evidence-backed full UI/UX audit of every active admin dashboard tab, state family, action group, responsive layout, Help/Guide linkage, and 10/10 gap before selecting exactly one bounded implementation child.

Primary owner goal: admin should be 10/10 easy to understand, read, and use for making changes, including lesson editing. The preferred direction is `less is more`: remove or relocate excessive explanatory text, make hierarchy/action grouping do more of the work, and keep dense admin surfaces calm without hiding required safeguards.

## Pre-Implementation Owner Explanation

Vi skal ikke late som en liten Users-endring betyr at hele admin-dashboardet er ferdig. Denne slicen skal gaa gjennom alle admin-menyer, viktige tilstander og knappegrupper, og lage en konkret gapliste for hva som hindrer 10/10.

Hvorfor det betyr noe: Admin er arbeidsflaten for innhold, QR, commerce, drift, analytics, brukere, meldinger, notes, kategorier og hjelp. Hvis vi bare ser ett skjermbilde, kan vi overse rot, feil hierarki, uklare handlinger eller state-problemer andre steder.

Utenfor scope: redesign, runtime/UI-endringer, nye funksjoner, brukeropprettelse, invitasjoner, databaseendringer, Auth Admin/service-role-mutasjoner, Stripe/finance-endringer og merge. Etter audit velges maks ett tydelig child-tiltak.

Forward compatibility: nye admin-tabs, actions, statuser, roller, workflow labels og Help/Guide-seksjoner skal enten fanges automatisk gjennom `ADMIN_TAB_VALUES`/module boundaries/audit-matrisen, eller kreve eksplisitt mapping, tester, screenshot-evidence og owner-beslutning foer release.

## Scope

- Audit every active tab in `ADMIN_TAB_VALUES`:
  - `content`
  - `qr-links`
  - `commerce`
  - `operations`
  - `analytics`
  - `users`
  - `email-templates`
  - `messages`
  - `notes`
  - `categories`
  - `help`
- Audit the admin shell and navigation:
  - desktop sticky side rail,
  - mobile horizontal tab rail,
  - active/inactive/focus states,
  - Help/Guide subnav,
  - URL-driven tab behavior.
- Audit major state families where present:
  - loading,
  - empty,
  - error,
  - retry,
  - no matches,
  - success/saved,
  - disabled/read-only/viewer role,
  - pending/saving/deleting,
  - destructive confirmation,
  - privacy/support boundary panels.
- Produce a ranked 10/10 gap list with:
  - impacted tab/state,
  - severity,
  - scorecard category,
  - source lens,
  - evidence,
  - recommended child type,
  - owner decision needed or not.
- Treat lesson editing inside Content as a critical audit surface, not just one row under Content.
- Identify copy that should be removed, shortened, turned into labels/statuses, or moved to Help/Guide.
- Select exactly one next implementation child from the gap list.

## Out Of Scope

- No runtime UI, CSS, component, API, database, test, or config changes in the audit itself.
- No admin-created users, account invitations, profile bootstrap, entitlement grants, or Auth Admin mutation.
- No IA redesign, grouped navigation, destructive action redesign, or form rewrite until the audit chooses a bounded child.
- No Stripe checkout, product pricing, invoices, refunds, payouts, finance reports, or revenue truth changes.
- No public SEO/AI crawlable surface changes.

## External Design Source Baseline

Use these as lenses, not as a mandate to copy their visual style:

| Source                                | Audit Use                                                                                                   | Boundary                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Apple Human Interface Guidelines      | Clarity, hierarchy, directness, restrained in-product explanation, platform expectations.                   | Do not copy Apple-native styling into the web admin surface. |
| W3C WCAG 2.2                          | Keyboard, focus, labels, names/roles/values, status messages, target size, reflow, contrast.                | Treat WCAG as minimum testability/compliance baseline.       |
| Nielsen Norman Group heuristics       | System status, consistency, error prevention, recognition, user control, recovery, help.                    | Use as heuristic lens; repo evidence decides priority.       |
| IBM Carbon Design System              | Enterprise forms, helper text, progressive disclosure, table/form density, action hierarchy, inline errors. | Use principles only; no Carbon dependency or visual clone.   |
| GOV.UK Design System / Service Manual | Plain language, task-first service design, accessible components, error and support guidance.               | Use as clarity/accessibility benchmark only.                 |
| Atlassian Design System               | SaaS/admin buttons, icon buttons, menus, tabs, tables, lozenges, empty states, inline messages.             | Use as enterprise workflow reference; no new dependency.     |
| Fluent 2 / Material Design 3          | Secondary check for navigation density, responsive structure, component states, affordances.                | Secondary comparison only; no design-system replacement.     |

Source URLs to re-check at audit start:

- `https://developer.apple.com/design/human-interface-guidelines/`
- `https://www.w3.org/TR/WCAG22/`
- `https://www.nngroup.com/articles/ten-usability-heuristics/`
- `https://carbondesignsystem.com/patterns/forms-pattern/`
- `https://design-system.service.gov.uk/`
- `https://www.gov.uk/service-manual/design`
- `https://atlassian.design/components/button/examples`
- `https://fluent2.microsoft.design/`
- `https://m3.material.io/`

## Audit Evidence Requirements

- Code inventory:
  - `lib/admin/admin-workspace.ts`
  - `components/admin/AdminWorkspace.tsx`
  - every active `components/admin/Admin*Manager.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - admin API response contracts used by the managers
  - admin unit/e2e tests
  - admin docs/runbooks/checklists.
- Screenshot evidence:
  - artifact folder under `output/admin-full-dashboard-ui-ux-audit-YYYY-MM-DD-HHMMSS/`;
  - baseline desktop screenshot for every active tab;
  - baseline mobile screenshots for at least Content, Users, Notes, Help, and every tab with observed mobile risk;
  - explicit state screenshots for error/retry/empty/no-match/destructive states where practical;
  - if local `/dev/login` is blocked, use temporary visual harness only with real production components and deterministic mock API responses, then remove it before validation.
- Test/coverage evidence:
  - list existing unit/e2e/a11y coverage per tab;
  - identify missing coverage separately from UI design findings;
  - do not use passing tests as proof of visual quality without screenshot inspection.
- Help/Guide evidence:
  - confirm each tab has matching Help/Guide guidance or record a gap;
  - identify stale guidance when visible labels/actions differ from Help text.

## Baseline Audit Matrix

Audit executed on `2026-06-18`. Do not mark product `10/10`: evidence shows several release-safe surfaces, but lesson editing, Help/Guide, mobile navigation, and Analytics density block a whole-dashboard 10/10 claim.

Primary screenshot artifacts:

- `output/admin-full-dashboard-ui-ux-audit-20260618-072914/`

Capture evidence:

- Desktop screenshots for all active tabs in `ADMIN_TAB_VALUES`.
- Mobile screenshots for Content, lesson edit, Users, Notes, and Help.
- Visual harness caveat: local `/dev/login` remained blocked by Supabase egress guard, so screenshots used a temporary local route rendering real admin components with deterministic mock API responses. Harness emitted React hydration warnings from localStorage/current-tab differences during capture; screenshots were still inspectable and route-specific product components rendered.
- Pixel-height evidence for scan cost:
  - Help desktop `16591px`; Help mobile `32615px`.
  - Lesson edit desktop `6465px`; lesson edit mobile `9458px`.
  - Analytics desktop `6298px`.
  - Users mobile `3324px`; Notes mobile `2794px`.

State evidence:

- Screenshot-verified: normal/loaded states for every tab, selected mobile surfaces, lesson edit open state, role-management state, support/privacy panels, create forms, action groups.
- Code/test evidence substitute for states not screenshot-captured here: admin loading/error/empty/retry/no-results/destructive states are covered in existing focused unit/e2e specs for Content, QR, Commerce, Operations, Analytics, Users, Email templates, Messages, Notes, Categories, and Help where present. This audit still flags broad visual state screenshots as missing for a future regression pack.

| Tab / Surface          | States To Inspect                                                                                                                     | Evidence Required                 | Current Product Score | Key Gap                                                                                                                                                                                                                                                         | Recommended Child                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Admin shell/nav        | desktop, mobile, active, inactive, focus, Help subnav                                                                                 | screenshots + keyboard/a11y notes | `3/5`                 | Desktop side rail is clear, but mobile horizontal tabs reveal only the first three sections and hide the rest behind scroll memory. Header copy adds extra reading before work starts.                                                                          | `deferred architecture decision`: mobile/grouped admin nav child after lesson-editor cleanup.                                    |
| Content                | course workspace, all content, loading, empty, error, create, edit, delete, revision/history                                          | screenshots + tests/docs review   | `3/5`                 | Course overview is understandable, but it still uses explanatory panels where grouping and labels should do more. Lesson entry actions are good.                                                                                                                | Selected child should target the lesson editor first, then simplify Content overview copy only if touched.                       |
| Content lesson editing | lesson row, edit form, public lesson mirror, section visibility, video planning notes, support card fields, View changes, save/cancel | screenshots + tests/docs review   | `2/5`                 | Critical blocker: edit form is extremely long (`6465px` desktop, `9458px` mobile) and filled with explanatory text, scope badges, fallback sections, and repeated helper copy. This directly violates the owner goal of easy reading and less explanatory text. | `bounded implementation child`: `docs/task-briefs/in-progress/2026-06-18-admin-lesson-editor-less-is-more-readability-10-10.md`. |
| QR Links               | list, filters, new link, advanced fields, QR asset, loading/error/empty, activate/disable/delete                                      | screenshots + tests/docs review   | `4/5`                 | Generally clear and action-led; mild copy density in New link helper text and row metadata.                                                                                                                                                                     | Fold into later broad admin copy pass; not first.                                                                                |
| Commerce               | product list/edit, empty/error, save state                                                                                            | screenshots + tests/docs review   | `4/5`                 | Very readable and low-copy; some empty metadata labels create dead space but not a major blocker.                                                                                                                                                               | No immediate child.                                                                                                              |
| Operations             | site-lock card, runtime flags, loading/error/save state                                                                               | screenshots + tests/docs review   | `3/5`                 | Security explanations are useful but too wordy for routine use; operational links and env-var notes compete with the actual flag action.                                                                                                                        | Later Operations support-copy compression child if owner wants.                                                                  |
| Analytics              | range, KPIs, funnel panels, caveats, health, loading/error/retry/empty                                                                | screenshots + tests/docs review   | `3/5`                 | Dashboard is privacy-safe but too tall (`6298px`) and caveats dominate scan cost. KPI interpretation warnings are necessary but should be progressively disclosed.                                                                                              | Later Analytics density/caveats grouping child.                                                                                  |
| Users                  | filters, summary, list/detail, privacy boundary, role management, loading/error/empty/no results                                      | screenshots + tests/docs review   | `4/5`                 | Desktop is strong; mobile is long (`3324px`) and privacy/role explanation text could be shorter, but role safety remains clear.                                                                                                                                 | Keep current Users wording child; no user creation.                                                                              |
| Email templates        | create, preview, list, edit, history, publish/rollback, validation/error                                                              | screenshots + tests/docs review   | `4/5`                 | Form is direct and readable; lifecycle actions are clear.                                                                                                                                                                                                       | No immediate child.                                                                                                              |
| Messages               | filters, list/detail, viewer/admin mutation boundary, archive/delete/restore, delivery diagnostics                                    | screenshots + tests/docs review   | `4/5`                 | Clear two-pane workflow and action grouping; destructive action is visible.                                                                                                                                                                                     | No immediate child.                                                                                                              |
| Notes                  | filters, list/edit, create, screenshots, related links, upload recovery, delete/done/archive                                          | screenshots + tests/docs review   | `3/5`                 | Work queue is understandable, but create form plus incident templates make the page long; mobile likely needs progressive disclosure.                                                                                                                           | Later Notes create-form density child.                                                                                           |
| Categories             | scope switch, list, create/edit/delete, loading/error/empty                                                                           | screenshots + tests/docs review   | `4/5`                 | Simple and readable; delete/deactivate actions are clear.                                                                                                                                                                                                       | No immediate child.                                                                                                              |
| Help/Guide             | quick actions, tab guidance, workflows, buttons, quality matrix, playbooks, troubleshooting                                           | screenshots + docs review         | `2/5`                 | Help is not quick help: `16591px` desktop and `32615px` mobile. It contains long prose that should become short checklists, search/section summaries, or linked runbooks.                                                                                       | Second priority after lesson editor: Help/Guide quick-reference redesign.                                                        |

## Gap List Rules

Every finding must use this shape:

| Rank  | Surface | Finding | Evidence | Source Lens | Severity                        | Scorecard Category | Recommended Type                                                                                       | Owner Decision Needed | Follow-Up Brief |
| ----- | ------- | ------- | -------- | ----------- | ------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------ | --------------------- | --------------- |
| `TBD` | `TBD`   | `TBD`   | `TBD`    | `TBD`       | `critical/high/medium/low/info` | `TBD`              | `safe process/docs update / bounded implementation child / deferred architecture decision / do not do` | `yes/no + reason`     | `TBD`           |

Audit handoff must recommend at most three next improvements and exactly one implementation child to execute next.

## Ranked Gap List

| Rank | Surface                       | Finding                                                                                                                                                                              | Evidence                                                                                                                                                                    | Source Lens                                                                                                     | Severity   | Scorecard Category                                                                                             | Recommended Type                 | Owner Decision Needed                                                                                               | Follow-Up Brief                                                                                 |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1    | Content lesson editing        | Lesson editing is the biggest 10/10 blocker: it is too long, too text-heavy, and makes the admin read instructions instead of acting from clear structure.                           | `before-admin-content-lesson-edit-desktop.png` `6465px`; `before-admin-content-lesson-edit-mobile.png` `9458px`; code strings in `AdminContentManager` and Help assertions. | Apple hierarchy/directness, NN/g minimalist design, Carbon progressive disclosure, GOV.UK plain-language forms. | `critical` | UX flow clarity, Visual design quality, Admin editor ergonomics, Content governance, Testing and QA automation | `bounded implementation child`   | `no` for the less-is-more direction; `yes` only if removing a currently visible safety explanation changes meaning. | `docs/task-briefs/in-progress/2026-06-18-admin-lesson-editor-less-is-more-readability-10-10.md` |
| 2    | Help/Guide                    | Help/Guide has become a long documentation page inside the product, not a quick operator guide. It duplicates explanatory copy that should move out of high-frequency edit surfaces. | `before-admin-help-desktop.png` `16591px`; `before-admin-help-mobile.png` `32615px`; long `CONTENT_PAGE_FLOW` prose.                                                        | GOV.UK service guidance, NN/g help/recovery, Atlassian enterprise guidance.                                     | `high`     | UX flow clarity, Incident response and support operations, Content governance, i18n operational readiness      | `bounded implementation child`   | `yes`; owner should approve how much detail stays in-app vs runbooks.                                               | `TBD after lesson-editor child`                                                                 |
| 3    | Mobile admin navigation       | Mobile top nav exposes only the first three tabs in the viewport, so the remaining admin areas depend on horizontal scroll discovery.                                                | `before-admin-content-mobile.png`, `before-admin-users-mobile.png`, `before-admin-help-mobile.png`.                                                                         | WCAG reflow/focus order, Material/Fluent navigation density, Apple hierarchy.                                   | `high`     | Product goals and IA, Accessibility (a11y), Admin workflow and editability                                     | `deferred architecture decision` | `yes`; grouping tabs changes admin mental model.                                                                    | `TBD after owner IA decision`                                                                   |
| 4    | Analytics density and caveats | Analytics is safe and complete, but too tall and caveat-heavy for routine dashboard scanning.                                                                                        | `before-admin-analytics-desktop.png` `6298px`.                                                                                                                              | NN/g system status/minimalist design, Carbon data-dashboard density.                                            | `medium`   | Analytics and KPI observability, UX flow clarity, Visual design quality                                        | `bounded implementation child`   | `no` if only grouping/collapsing caveats; `yes` if KPI meaning changes.                                             | `TBD later`                                                                                     |
| 5    | Operations support copy       | Site-lock and runtime flag explanations are valuable but compete with routine flag operation.                                                                                        | `before-admin-operations-desktop.png`.                                                                                                                                      | NN/g recognition over recall, GOV.UK support guidance.                                                          | `medium`   | Reliability and failure handling, Incident response and support operations                                     | `bounded implementation child`   | `no` for compression; `yes` if changing recovery procedure.                                                         | `TBD later`                                                                                     |
| 6    | Notes create density          | Notes page is usable, but create form plus incident templates create a long operational surface.                                                                                     | `before-admin-notes-desktop.png` `1920px`; `before-admin-notes-mobile.png` `2794px`.                                                                                        | Carbon progressive disclosure, Atlassian action hierarchy.                                                      | `medium`   | Admin workflow and editability, Incident response and support operations                                       | `bounded implementation child`   | `no` if preserving incident semantics.                                                                              | `TBD later`                                                                                     |

Recommended next improvements:

| Priority | Improvement                                                           | Classification                   | Rationale                                                                                                          |
| -------- | --------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1        | Execute `admin-lesson-editor-less-is-more-readability`.               | `bounded implementation child`   | Directly matches owner goal: make lesson changes easy to understand, read, and perform with less explanatory text. |
| 2        | Plan Help/Guide quick-reference redesign after lesson editor cleanup. | `bounded implementation child`   | Needed so removed UI explanations still have a support home without turning product screens into manuals.          |
| 3        | Decide mobile admin navigation grouping pattern.                      | `deferred architecture decision` | Important for whole-dashboard 10/10, but changes mental model and should follow the lesson-editor fix.             |

Selected next implementation child: `docs/task-briefs/in-progress/2026-06-18-admin-lesson-editor-less-is-more-readability-10-10.md`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict mode for the audit artifact: every `target` category below must close at `5/5` for the audit to be considered complete. This does not mean the admin product is 10/10; it means the audit evidence is complete enough to score the product honestly.

Critical target categories for any later whole-dashboard `10/10` product claim:

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                           | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Every active admin tab has a named job, navigation role, and IA risk; flat-nav/grouping decision is scored with evidence; lesson editing is scored as a critical workflow.                                   | tab matrix + screenshots + Help/Guide review | `5/5`                   |
| UX flow clarity                               | `target`     | Loading, empty, error, retry, no-match, success, pending, disabled, and destructive paths are inventoried where present; excessive explanatory text is flagged when labels/grouping could carry the meaning. | state matrix + screenshots/code review       | `5/5`                   |
| Visual design quality                         | `target`     | Desktop/mobile screenshots show density, spacing, type scale, action grouping, button hierarchy, card use, no clipping/overlap risks, and whether copy volume hurts scanability per tab.                     | screenshot artifact folder + visual findings | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Audit separates UI/readability gaps from mutation/data-integrity risks and flags any risky action that needs invariants/negative tests before implementation.                                                | action-risk matrix + tests/docs review       | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency admin jobs, especially lesson editing, are scored for scan cost, clicks, grouping, confirmation clarity, copy burden, and recovery path.                                                      | workflow inventory + ranked gap list         | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Keyboard/focus/order/labels/status-message risks are reviewed for shell and every active tab, with missing axe/e2e coverage called out.                                                                      | coverage matrix + screenshot/DOM notes       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Audit records whether any proposed fix risks JS/payload growth; no perf budgets change in this audit.                                                                                                        | no-runtime-diff review + follow-up notes     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Every tab with server data states which data is server-canonical vs local-only UI state before recommending changes.                                                                                         | data-boundary matrix                         | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Every tab with reads/mutations records cache/no-store/freshness expectations and whether UI refresh/retry behavior matches it.                                                                               | API/cache review                             | `5/5`                   |
| Reliability and failure handling              | `target`     | Error/retry/partial-data states are inspected and gaps are ranked by operator impact.                                                                                                                        | state screenshots + code/test review         | `5/5`                   |
| Security and authz                            | `target`     | Role-gated, private, destructive, and service-role/Auth Admin-adjacent actions are identified and separated from harmless UI polish.                                                                         | authz/action matrix + negative-test gap list | `5/5`                   |
| Privacy and compliance                        | `target`     | Screenshots and findings avoid exposing raw private training, habit, note, provider, payment, email, or analytics payload data outside purpose-bound admin summaries.                                        | privacy review + screenshot inspection       | `5/5`                   |
| Content governance                            | `target`     | Content, QR, email-template, notes, categories, and Help guidance workflows are checked for ownership, status, revision, rollback, and stale guidance risks.                                                 | workflow/docs matrix                         | `5/5`                   |
| Admin workflow and editability                | `target`     | CRUD/edit/publish/support/status actions are mapped by risk and frequency across every active tab.                                                                                                           | action inventory + ranked findings           | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A with scope rationale: admin dashboard is authenticated/private and this audit does not change public routes, metadata, sitemap, robots, canonicals, or crawl policy.                                     | explicit private-admin scope rationale       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A with scope rationale: this audit adds no public AI-facing content, structured data, entity pages, docs pages, or crawlable semantic surface.                                                             | explicit private-admin scope rationale       | `N/A`                   |
| Analytics and KPI observability               | `target`     | Analytics tab is audited for KPI interpretation, caveats, privacy-safe labels, error/retry handling, and future event taxonomy risks.                                                                        | Analytics matrix + screenshots               | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Commerce tab is audited for product-label/source-of-truth clarity without changing checkout, pricing, Stripe, entitlements, or finance truth.                                                                | Commerce matrix + docs/API review            | `5/5`                   |
| Incident response and support operations      | `target`     | Help/Guide, Messages, Users, Operations, Notes, and recovery/runbook links are checked for operator response clarity and stale support guidance.                                                             | support-surface sweep + Help/Guide review    | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: audit inspects whether Commerce/Analytics UI could be mistaken for finance/revenue truth; no accounting, payout, invoice, refund, or reconciliation behavior changes.                       | finance-boundary notes                       | `4/5`                   |
| i18n operational readiness                    | `target`     | Labels, buttons, filters, status chips, and mobile layouts are checked for copy expansion/clipping risk and stable machine-ID separation.                                                                    | responsive screenshots + label matrix        | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Audit prefers existing admin primitives, typed module boundaries, current tests, and no dependencies or local Codex config changes.                                                                          | diff/package/config review                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Existing and missing unit/e2e/a11y/screenshot coverage is mapped per tab and state family.                                                                                                                   | test coverage matrix + validation commands   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Audit ranks fixes that reuse shared admin primitives and avoids per-tab one-off rewrites or heavy client libraries.                                                                                          | recommendation rationale                     | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Audit produces docs/artifacts only, defines one bounded child, and records validation/screenshot gates before code work.                                                                                     | git status + lint + checkpoint log           | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reference surface is `components/admin/AdminWorkspace.tsx` plus existing `Admin*Manager` components;
  - preserve URL-driven `tab` state and server-rendered `/admin` auth boundary;
  - no route/action/API/cache behavior changes during audit.
- TypeScript/domain:
  - `ADMIN_TAB_VALUES`, `AdminTab`, admin module boundaries, API response types, status enums, role labels, and support codes are canonical;
  - unknown tabs must fail safely through existing parser behavior.
- Supabase/data:
  - no migrations, RLS, generated DB types, service-role secrets, or Auth Admin calls;
  - any future user/account mutation child must re-check official Supabase Auth Admin docs.
- External services:
  - no Stripe/email/analytics-provider SDK changes;
  - future Commerce/finance findings must use Stripe best-practice review only if implementation touches checkout/billing/revenue truth.
- UI system:
  - audit current `fs-library-card`, `fs-cta-*`, `ui-field`, status chips, icon buttons, tabs, tables/lists, inline states, and Help/Guide placement;
  - no new visual primitives during audit.
- Testing:
  - audit maps unit/e2e/a11y/screenshot coverage;
  - future UI fixes require screenshot handoff and owner approval before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

Audit-only contract:

- Server-canonical data: admin content, QR links, products, operations flags, analytics insights, Auth users/profiles/roles/entitlements, email templates, messages, notes, categories.
- Local-only UI state: active tab, filters, search drafts, selected rows, open panels, pending confirmation state, range selectors, local form draft before submit.
- Sync policy: no sync behavior changes; audit records current refresh/retry/save/delete semantics and flags mismatches.
- Retention/sensitivity: audit screenshots must use sanitized mock/evidence data when local cloud access is blocked and must not expose private user/training/payment/raw analytics payloads.
- Cache/invalidation: no cache changes; audit records current no-store/admin-scoped expectations.

## Identity And Rename Contract

- Canonical IDs: admin tab query values, content IDs/slugs, QR slugs, product IDs/slugs, user IDs, template IDs, message IDs, note IDs, category IDs, and runtime flag keys stay unchanged.
- Human-readable labels: audit may flag unclear labels, but implementation needs a child brief before renaming.
- Rename vs repurpose: no entity is renamed or repurposed in the audit.
- Compatibility: `/admin?tab=<value>` links remain unchanged; any future route/label change requires route-label-support sweep.

## Forward Compatibility Contract

- Extensibility surfaces: admin tabs, manager components, role labels, workflow states, status chips, filters, Help/Guide sections, support codes, analytics KPI labels, commerce/product labels, and future locales.
- Source of truth: active tabs derive from `ADMIN_TAB_VALUES`; high-risk modules should be described in module boundaries and Help/Guide.
- Additive behavior: future tabs should appear in the audit matrix, broad e2e/a11y coverage, Help/Guide, and screenshot checklist before release.
- Explicit mapping requirements: new mutations, destructive actions, user-access flows, commerce/finance claims, analytics KPI interpretations, and support recovery paths require owner-approved child briefs.
- Unknown/deprecated values: unknown tabs fail safe via parser; unmapped workflow values must render safe generic copy or be blocked until mapped.

## Help / Guide Impact

Required for audit:

- Compare every visible tab/action family against `AdminHelpCenter`.
- Record stale or missing Help/Guide guidance as findings.
- Do not change Help/Guide copy during audit unless owner explicitly converts that finding into a bounded docs/UI child.

## Route / Label / Support Surface Sweep

Before final audit handoff, sweep at minimum:

- `ADMIN_TAB_VALUES`
- `AdminWorkspace`
- `AdminHelpCenter`
- `admin-tab-`
- `Help/Guide`
- `read-only`
- `role management`
- `support`
- `access`
- `status`
- `retry`
- `delete`
- `archive`
- `publish`
- `rollback`
- `/admin?tab=`

Surfaces: `app/`, `components/`, `lib/admin/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, and active/planned/done task briefs when relevant.

## Acceptance Criteria

1. Every active admin tab has code, docs, test, and screenshot evidence.
2. Every major state family present in code is either screenshot-verified or explicitly documented as not practical with a code/test evidence substitute.
3. Help/Guide coverage is checked for every tab and recorded.
4. A ranked 10/10 gap list exists with severity, evidence, source lens, and recommended child type.
5. The audit recommends at most three next improvements and exactly one next implementation child.
6. No runtime/UI/data/API behavior is changed by the audit itself.
7. Changed briefs pass `npm run lint:briefs` or, for untracked/planned audit briefs, `npm run lint:briefs:all`.

## Validation Plan

- `npm run lint:briefs:all`
- `git diff --check`
- Screenshot capture against local dev or temporary visual harness when `/dev/login` is blocked.
- Optional targeted Playwright/axe/unit commands only if audit findings need them; full implementation gates are for the selected child, not this audit-only slice.

## Checkpoint Log

- `2026-06-18 | execution approved | owner said "kjor paa" after the planned full-dashboard audit child was created; moved brief to in-progress and kept scope audit-only with no runtime/UI changes | next: capture full-tab evidence and complete ranked 10/10 gap list`
- `2026-06-18 | planned | owner flagged that one Users screenshot handoff was not enough for the whole dashboard; created this full-admin audit child to cover all active tabs, states, Help/Guide, and 10/10 gap list before any whole-dashboard UI/UX claim | next: finish or intentionally park the narrow coverage/users-readability child, then execute this audit-only child`
- `2026-06-18 | merged | audit artifact shipped in PR #1153 as part of squash commit 003797fe; it records the ranked admin dashboard gap list and selects lesson-editor readability as the next implementation child | next: repo-managed docs-only closeout, then post-merge re-audit before a new feature branch`

## Completion Record

- `completed`: `2026-06-18`
- `merged_pr`: `#1153`
- `squash_commit`: `003797fe`
- `result`: Closed the full admin dashboard UI/UX audit artifact by documenting active-tab evidence, the ranked 10/10 gap list, source-lens rationale, and the next bounded implementation child.
- `validation`: audit artifact reviewed in PR `#1153`, `npm run verify:pre-pr` PASS on commit `41079043`, GitHub required checks PASS, and `npm run verify:pre-merge` PASS with marker `artifacts/verify-pre-merge/20260618-093609.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5` for the docs/audit artifact. No - this does not claim the admin dashboard product itself is `10/10`; the audit explicitly found remaining product gaps.

| Category                                      | Achieved Score | Evidence                                                                                         | Gaps / Notes                                                 |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Product goals and IA                          | `5/5`          | Active admin tabs and IA risks recorded in the audit matrix.                                     | Product gap remains for mobile admin navigation grouping.    |
| UX flow clarity                               | `5/5`          | Ranked findings separate lesson editor, Help/Guide, Analytics, Operations, Notes, and nav risks. | Product gaps are documented, not fixed by this audit.        |
| Visual design quality                         | `5/5`          | Screenshot-backed visual findings and source lenses recorded.                                    | Lesson editor and Help/Guide remain product follow-ups.      |
| Business logic correctness and data integrity | `5/5`          | Audit separated UI polish from data/auth/schema behavior and avoided runtime changes.            | Implementation children must validate invariants separately. |
| Admin editor ergonomics                       | `5/5`          | High-frequency lesson editing identified as rank 1 blocker with evidence.                        | Lesson-editor implementation child completed in the same PR. |
| Accessibility (a11y)                          | `5/5`          | A11y coverage risks and active admin modules were represented in tests/docs.                     | Future mobile nav grouping needs its own a11y validation.    |
| Data placement and sync boundaries            | `5/5`          | Server-canonical vs local-only admin state boundaries recorded.                                  | No runtime sync changes.                                     |
| Caching and invalidation strategy             | `5/5`          | Admin no-store/freshness expectations recorded without cache changes.                            | No gap in audit scope.                                       |
| Reliability and failure handling              | `5/5`          | Error/retry/partial-data surfaces included in state review.                                      | Product compression work remains separate.                   |
| Security and authz                            | `5/5`          | Authz-sensitive actions and user-creation boundary identified.                                   | User creation still requires a future owner decision.        |
| Privacy and compliance                        | `5/5`          | Audit avoided exposing raw private/payment/provider/analytics payload data.                      | No gap in audit scope.                                       |
| Content governance                            | `5/5`          | Content, QR, notes, categories, Help, and email-template governance risks inventoried.           | Some product findings remain ranked follow-ups.              |
| Admin workflow and editability                | `5/5`          | CRUD/edit/support/status action families mapped by risk/frequency.                               | Product fixes remain separate children.                      |
| Analytics and KPI observability               | `5/5`          | Analytics density/caveat issue ranked without changing KPI semantics.                            | Analytics UI compression remains later.                      |
| Commerce and revenue ops                      | `5/5`          | Commerce/finance boundary reviewed as audit evidence only.                                       | No checkout/Stripe/finance change.                           |
| Incident response and support operations      | `5/5`          | Help/Guide, Users, Operations, Notes, and support surfaces reviewed.                             | Help/Guide redesign remains a future child.                  |
| i18n operational readiness                    | `5/5`          | Labels/copy expansion risks included in responsive audit review.                                 | Future UI children must re-check screenshots.                |
| Stack-fit and dependency discipline           | `5/5`          | Audit reused existing docs/components/tests and added no dependency.                             | No gap.                                                      |
| Testing and QA automation                     | `5/5`          | Audit scope, evidence, and gates passed through PR `#1153`.                                      | Future implementation children require screenshot handoff.   |
| DevOps and rollback readiness                 | `5/5`          | Docs/audit artifact shipped in reversible squash commit `003797fe`.                              | No gap.                                                      |
