# Task Brief: AW-006 Admin Help/Guide Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-admin-help-guide-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-05-31`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner explicitly requested execute`
- `branch`: `aw-006-admin-help-guide-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@9cbb8cf`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice.
- `reason`: `main` is clean and synced after PR `#916` and repo-managed closeout PR `#917`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminHelpCenter` as a small remaining admin surface still using older local `rounded-2xl`/`slate` card and anchor styling while the admin shell, managers, and contextual notes now use the current `fs-*` token/action direction. The owner explicitly requested execution on `2026-05-31`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminHelpCenter.tsx`, `components/admin/AdminWorkspace.tsx`, admin Help/Guide content contracts, `tests/e2e/admin-help-center.spec.ts`, admin token/action references, screenshot handoff rules, route/label/support sweep rules, forward compatibility rules, or verification lanes change before implementation or PR handoff.

## Goal

Align the Admin Help/Guide training surface with the current AW-006 admin token/action hierarchy while preserving all Help/Guide content, workflow labels, runbook references, assertions, admin behavior, authz, APIs, and support procedures.

## Pre-Implementation Owner Explanation

Vi rydder Help/Guide-panelet slik at opplaeringsflaten i admin ser ut som resten av den nye admin-flaten. Det betyr at operatoeren lettere kan skanne veiledning, playbooks og feilsoking uten at siden foles som en gammel restflate. Utenfor scope er Help/Guide-tekst, workflow-labels, runbooks, API-er, auth, data, admin notes/content-logikk og bred designsystem-refaktor.

Fremoverkompatibilitet: nye Help/Guide-seksjoner og hurtiglenker boer arve samme lokale visuelle moenster; nye workflow-labels, recovery-regler eller runbook-referanser krever eksplisitt Help/Guide/test-oppdatering.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Accessibility (a11y)`
- `Content governance`
- `Admin workflow and editability`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                    | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The AW-006 queue and design inventory identify Admin Help/Guide Token/Action Parity as the active slice with no stale active-slice references.                                        | active brief + queue/inventory diff                        | `5/5`                   |
| UX flow clarity                               | `target`     | Help/Guide quick links, sections, matrix, controls, services, playbooks, troubleshoot cards, and change-governance content remain easier to scan with the same information order.     | screenshot handoff + DOM/content assertions                | `5/5`                   |
| Visual design quality                         | `target`     | Help/Guide shell, internal section cards, quick links, callout cards, table wrapper, and code/runbook references use current admin `fs-*` token/card/action direction where suitable. | screenshot handoff + DOM/class review                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Static Help/Guide arrays, rendered text, runbook paths, route anchors, and test-covered assertions remain unchanged except for scoped class/structure changes.                        | focused tests + content diff review                        | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Operators can still navigate every Help/Guide section through the same anchors and read the same workflow guidance without added steps.                                               | e2e/help assertions + screenshot handoff                   | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Headings, anchors, table semantics, list semantics, focus states, link targets, and responsive wrapping remain keyboard and screen-reader clear.                                      | Testing Library or Playwright assertions + code review     | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse must add no dependency, fetch path, large client behavior, image asset, or material payload increase.                                              | package diff + pre-pr gate                                 | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this static admin guidance surface introduces no local persistence, server-canonical entity, sync policy, retention change, or conflict behavior.                         | explicit data/sync scope rationale                         | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no fetch, cache mode, route revalidation, invalidation trigger, API route, or persisted read path.                                                     | changed-files review                                       | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: Help/Guide troubleshooting content must remain intact, but this slice changes no runtime failure behavior.                                                           | content-preservation diff review                           | `4/5`                   |
| Security and authz                            | `target`     | Admin-only route gating and Help/Guide visibility remain unchanged; no secrets, auth logic, protected APIs, or role behavior are touched.                                             | changed-files review + existing admin route coverage       | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: existing operator-only guidance and runbook paths remain admin-only and no new personal data, logs, env values, or external links are exposed.                       | privacy/security diff review                               | `4/5`                   |
| Content governance                            | `target`     | Help/Guide text, workflow labels, runbook references, e2e assertions, AW-006 queue, design inventory, and planned brief stay aligned.                                                 | content diff + route/label/support sweep + brief lint      | `5/5`                   |
| Admin workflow and editability                | `target`     | The slice changes presentation only; no admin workflow label, action meaning, recovery instruction, runbook path, or operator procedure changes silently.                             | route/label/support sweep + help e2e assertions            | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this authenticated admin-only component changes no public route, metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                      | SEO scope rationale                                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this admin-only training surface changes no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract.                  | AI-discoverability scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics taxonomy, event payload, instrumentation, dashboard, KPI persistence, or reporting behavior.                                              | analytics scope rationale                                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                  | explicit commerce scope rationale                          | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing troubleshoot/escalation guidance and support runbook references must be preserved; no incident workflow or support procedure changes.                       | content diff + route/label/support sweep                   | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.               | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: existing English operator labels are preserved; token/action layout must not introduce fragile fixed-width assumptions that block later translation.                 | responsive screenshot handoff + changed-files review       | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `AdminHelpCenter`, current admin `fs-*` tokens, local helper constants where useful, and no new dependency or broad shared primitive.                                  | component diff + package diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused coverage for token/action class expectations and content preservation; run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and gates.   | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because new Help/Guide sections should inherit the same local presentation without new services, dependencies, or recurring maintenance cost.                              | reusable local class constants + diff review               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Visual-only/admin-component diff is reversible through normal git revert; screenshot approval must happen before pre-PR/PR/merge gates.                                               | git diff review + screenshot handoff + gate order          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse the existing client component `AdminHelpCenter`.
  - Reuse `AdminWorkspace` only for the active Help/Guide desktop section submenu at the top of the sticky rail; keep tab routing, route boundaries, server/client ownership, API routes, and cache behavior unchanged.
  - Reference surfaces: `AdminWorkspace`, `AdminMessagesManager`, `AdminEmailTemplatesManager`, `AdminCategoriesManager`, and `AdminContextNotesPanel` token/action classes.
- TypeScript/domain contracts:
  - Preserve static Help/Guide arrays and contracts: `ADMIN_HELP_QUICK_ACTIONS`, `DASHBOARD_TABS`, workflow arrays, `BUTTON_GUIDE`, `QUALITY_MATRIX`, `DOC_CONTROLS`, `CONNECTED_SERVICES`, `DAILY_PLAYBOOKS`, and `RUNBOOK_LINKS`.
  - Deterministic invariant: every existing section ID, anchor, heading, and e2e-covered text remains present unless a later owner-approved copy/workflow slice scopes the change.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, storage, generated DB type, index, or data query changes.
- External services/tools:
  - Preserve existing runbook references and service names only as static Help/Guide copy.
  - No Stripe, email provider, analytics vendor, SDK, webhook, secret, or deployment setting changes.
- UI system:
  - Use current AW-006 admin token classes (`fs-library-card`, `fs-library-card-accent`, `fs-library-card-muted`, `fs-cta-secondary`, token radius/border variables) where they fit.
  - Move repeated Help/Guide section navigation into the sticky desktop admin rail when Help/Guide is active, while preserving mobile top quick links.
  - Keep semantic severity color only for real available/guardrail/troubleshoot meaning.
  - Keep the change Help/Guide-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Help/Guide states inside `/admin` to current tokenized admin shell and nearby admin manager surfaces.
- Testing:
  - Add or update focused tests for Help/Guide token/action classes and content preservation.
  - Existing `tests/e2e/admin-help-center.spec.ts` remains the content contract.
  - Capture representative desktop and mobile screenshots before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

N/A with rationale: this slice changes presentation for a static admin training surface only. It introduces no local-only stored data, server-canonical entity, browser storage key, sync behavior, cache invalidation, retention rule, or sensitive-data handling.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or compatibility behavior. Existing Help/Guide anchor IDs remain stable and must not be renamed in this slice.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Help/Guide section IDs, quick action anchors, dashboard tab explanations, workflow guidance arrays, button glossary groups, matrix rows, service rows, playbook rows, runbook references, and troubleshoot cards.
- Source of truth:
  - The static arrays in `AdminHelpCenter` remain the source for rendered guidance.
  - Visual treatment comes from existing admin `fs-*` tokens and Help/Guide-local helper classes.
- Additive behavior:
  - New Help/Guide sections that follow the existing section/list/card patterns should inherit the same visual treatment by reusing local helper classes.
  - New quick links should render from `ADMIN_HELP_QUICK_ACTIONS` in both the desktop rail submenu and the mobile top quick-link group without duplicating one-off arrays.
- Explicit mapping requirements:
  - New workflow labels, route labels, recovery instructions, admin actions, runbook paths, service names, support procedures, or Help/Guide promises require explicit copy/test/docs review before release.
- Unknown or deprecated values:
  - Unknown or stale runbook paths are a content governance problem, not a visual fallback; they must be caught by Help/Guide assertions or route/label/support sweep before release.
- Test/evidence:
  - Focused component tests verify token/action classes and stable anchors.
  - Existing e2e Help/Guide assertions verify content preservation.
  - Route/label/support sweep checks no workflow label, runbook, or support path changed silently.

## Help / Guide Impact

Required but presentation-only: this slice intentionally changes the Help/Guide visual shell. It must preserve all existing Help/Guide content, workflow labels, runbook references, recovery instructions, and e2e assertions. If implementation discovers stale guidance or changes any label/action/recovery meaning, that must be explicitly scoped, tested, and documented before PR handoff.

## Route / Label / Support Surface Sweep

Required because this slice touches an admin Help/Guide surface and operator-facing support guidance.

- Terms:
  - `AdminHelpCenter`
  - `Help/Guide`
  - `Start here`
  - `Dashboard tabs`
  - `Buttons explained`
  - `10/10 matrix`
  - `Doc controls`
  - `Daily playbooks`
  - `Troubleshoot fast`
  - `Change governance`
  - `RUNBOOK_LINKS`
  - `admin-help-center`
- Surfaces:
  - `components/admin/AdminHelpCenter.tsx`
  - `components/admin/AdminWorkspace.tsx`
  - `tests/e2e/admin-help-center.spec.ts`
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/unit/`
  - `docs/runbooks/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Help/Guide presentation aligns with current AW-006 admin token direction.
  - Desktop Help/Guide section navigation moves to the active left rail to reduce scroll-to-top friction; mobile keeps the top quick-link group because the rail stacks above content.
  - Focused tests cover token/action classes and stable anchors/content.
  - Screenshot artifacts are captured before broad gates.
  - Canonical AW-006 queue and design inventory record this planned slice.
  - No workflow label, runbook, recovery procedure, or support instruction changes unless explicitly re-scoped.
- Sweep evidence:
  - identifiers searched: `AdminHelpCenter`, `AdminWorkspace`, `Help/Guide`, `On this page`, `admin-help-subnav`, `ADMIN_HELP_QUICK_ACTIONS`, `Start here`, `Dashboard tabs`, `Buttons explained`, `10/10 matrix`, `Doc controls`, `Daily playbooks`, `Troubleshoot fast`, `Change governance`, `RUNBOOK_LINKS`, and `admin-help-center`.
  - surfaces checked: `components/admin/`, `tests/`, `docs/runbooks/`, `docs/design/notice-empty-state-pattern-inventory.md`, `docs/task-briefs/planned/`, and `docs/task-briefs/in-progress/`.
  - fallout handled: expected changes are limited to `AdminHelpCenter`, the Help/Guide-only `AdminWorkspace` desktop rail submenu, focused unit tests, AW-006 queue/inventory docs, this active brief, and screenshot artifacts; no workflow label, runbook path, recovery procedure, support procedure, route, auth, API, or non-Help/Guide admin behavior update is needed.

## Scope

- Create and maintain this active brief.
- Update canonical AW-006 queue and notice/state inventory to identify the owner-approved active slice.
- Align `components/admin/AdminHelpCenter.tsx` visual shell, mobile quick links, sections, nested cards, status/callout cards, table wrapper, runbook references, and visible anchors with current AW-006 admin token/action direction.
- Add a Help/Guide-only desktop section submenu to `components/admin/AdminWorkspace.tsx` at the top of the active sticky rail, reusing the same canonical quick-link source and preserving admin tab routing.
- Add or update focused test coverage for Help/Guide token/action classes, stable anchors, and preserved content.
- Capture screenshot handoff for changed admin UI before broad PR gates after implementation starts.

## Out Of Scope

- Help/Guide copy changes, workflow label changes, recovery instruction changes, runbook path changes, service ownership changes, or support procedure changes.
- Admin APIs, authz, Supabase, Stripe, email delivery, analytics, commerce, content editing, QR behavior, notes behavior, messages behavior, categories behavior, or operations behavior.
- `AdminWorkspace` tab routing, active-tab semantics, auth behavior, manager loading, or non-Help/Guide shell behavior.
- Broad app-wide Button/Card/PageShell primitive refactor.
- Public UI, SEO metadata, route changes, package changes, workflows, migrations, secrets, or environment variables.
- Merge to `main` without explicit owner merge approval.

## Acceptance Criteria

1. Canonical AW-006 queue and design inventory identify `Admin Help/Guide Token/Action Parity` as the active slice with no stale active references.
2. Active brief passes brief lint and contains explicit scorecard, stack, Help/Guide, route/label/support, data, identity, and forward-compatibility contracts.
3. Help/Guide visual shell, mobile quick links, desktop rail submenu, sections, nested cards, status/callout cards, table wrapper, and runbook references use current AW-006 admin token/action direction where suitable.
4. Help/Guide content, anchors, runbook paths, workflow labels, support procedures, e2e assertions, tab routing, and admin behavior remain unchanged unless explicitly re-scoped.
5. Focused tests and screenshot handoff cover the changed visual surface before `npm run verify:pre-pr`.

## Validation Plan

- Targeted during implementation:
  - focused Help/Guide component/unit coverage, likely a new `tests/unit/admin-help-center.test.tsx`
  - existing `tests/e2e/admin-help-center.spec.ts` when practical
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Visual gate:
  - Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
  - Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Browser screenshot capture uses the local Freeswimming screenshot default from `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

## Checkpoint Log

- `2026-05-31 | planned | created from clean main@9cbb8cf after PR #916 and repo-managed closeout #917; post-merge preflight passed with no closeout remaining; owner approved Admin Help/Guide Token/Action Parity as the next planned AW-006 slice after fresh queue/design/code re-audit | next: wait for explicit execute/build/implement instruction before moving this brief to in-progress and changing product code`
- `2026-05-31 | in-progress | owner explicitly said execute; moved brief to in-progress on branch aw-006-admin-help-guide-token-parity with planned queue/design updates carried over | next: implement scoped Help/Guide token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-31 | screenshot-review | implemented scoped AdminHelpCenter token/action parity with Help/Guide-local helper classes, stable anchor test IDs, focused unit/content coverage, and AW-006 queue/inventory updates; targeted validation passed with ./node_modules/.bin/vitest run tests/unit/admin-help-center.test.tsx tests/unit/admin-workspace-shell.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check, fs-border-subtle absence sweep, and route/label/support sweep; env SITE_LOCK_ENABLED=0 npx playwright test tests/e2e/admin-help-center.spec.ts --project=desktop-chromium was attempted and correctly skipped because local dev-login could not authenticate against the configured test Supabase endpoint; after/reference screenshots captured in output/aw-006-admin-help-guide-token-parity-2026-05-31-100313 via a temporary local visual harness that was removed after capture | next: owner screenshot approval before npm run verify:pre-pr, PR creation, CI, and npm run verify:pre-merge`
- `2026-05-31 | screenshot-review-update | owner requested moving the Help/Guide section menu into the left side to avoid scrolling back to top; implemented `ADMIN_HELP_QUICK_ACTIONS`as the shared source for mobile top links and a Help/Guide-only top desktop rail submenu in`AdminWorkspace`; targeted validation passed with ./node_modules/.bin/vitest run tests/unit/admin-help-center.test.tsx tests/unit/admin-workspace-shell.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check, and route/label/support sweep; after/reference screenshots refreshed in output/aw-006-admin-help-guide-token-parity-2026-05-31-101339 via a temporary local visual harness that was removed after capture | next: owner screenshot approval before npm run verify:pre-pr, PR creation, CI, and npm run verify:pre-merge`
- `2026-05-31 | pre-pr-gate-fix | owner approved screenshot handoff; first npm run verify:pre-pr stopped on quality-gate wording because the route/label/support sweep lacked explicit identifiers searched and surfaces checked evidence in this brief; added the missing evidence without changing product scope | next: rerun npm run verify:pre-pr`
- `2026-05-31 | pre-pr-green | npm run verify:pre-pr passed full public lane after route/label/support evidence wording was added; result included quality gate PASS, lint/typecheck/unit/build/perf PASS, perf trend recommendation hold, and Playwright E2E 102 passed / 492 skipped with expected auth-dependent skips from local dev-login/Supabase returning HTML | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
