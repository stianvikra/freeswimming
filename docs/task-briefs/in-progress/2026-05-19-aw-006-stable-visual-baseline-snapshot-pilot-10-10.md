# Task Brief: AW-006 Stable Visual Baseline Snapshot Pilot (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-stable-visual-baseline-snapshot-pilot-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-19-aw-006-admin-management-feedback-list-state-primitive-pilot-10-10.md`
- `branch`: `aw-006-visual-baseline-pilot`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@6a2cada`
- `audit_status`: `ready`
- `decision`: Execute the next canonical AW-006 UX/UI slice as a bounded on-demand visual baseline screenshot pilot.
- `reason`: `main` is clean after PR `#762` and repo-managed closeout PR `#763`; `npm run post-merge:preflight` reports no pending closeout, and the canonical AW-006 queue promotes `Stable visual baseline snapshot pilot` after the admin state primitive pilot.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, public route set, Playwright project names, screenshot handoff rules, site-lock behavior, or verification lanes change before PR handoff.

## Goal

Add a small, explicit, on-demand screenshot baseline path for the highest-value public AW-006 routes without changing rendered UI, product behavior, runtime data, checkout, auth, or CI gating.

## Pre-Implementation Owner Explanation

Dette slicen lager en liten og stabil måte å ta referansebilder av noen få viktige AW-006-sider. Det betyr noe fordi vi da kan sammenligne fremtidige UX/UI-endringer mot en kjent baseline, i stedet for å stole på hukommelse eller tilfeldige screenshots. Utenfor scope er full visuell regresjonstest-plattform, store artefakter, CI-tunge screenshot-gater, nye redesigns og endringer i produktlogikk.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Visual design quality`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Baseline route set must cover a small public AW-006 value path: `/`, `/course`, `/plans`, `/programs`, `/analysis`, `/our-method`, and `/contact`.                             | screenshot spec route matrix + runbook + canonical queue update  | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: captured pages must load to their intended headings before screenshots, but no user flow or page copy changes.                                                | Playwright visibility assertions                                 | `4/5`                   |
| Visual design quality                         | `target`     | Screenshots must be full-page, stable enough for design review, and named `reference-<surface>-<viewport>.png` for mobile and desktop pilot projects.                          | captured screenshot artifacts + spec assertions                  | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes no runtime business logic, persisted data, mutations, validation, domain entities, imports, exports, or data writes.                            | explicit code review scope                                       | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice captures public AW-006 routes only and changes no admin surface, edit flow, confirmation, recovery action, or CRUD workflow.                            | admin scope rationale                                            | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: route readiness uses semantic heading checks before capture, but this slice changes no keyboard, focus, labels, contrast, or screen-reader behavior.          | heading assertions                                               | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | The pilot must stay on-demand, add no dependency, avoid default CI execution, and keep the capture matrix bounded to two Chromium projects.                                    | package script review + Playwright command evidence              | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only product state, server-canonical state, browser storage, sync, conflict, retention, cache mutation, or sensitive data handling.       | data contract section                                            | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, revalidation trigger, stale-data policy, fetch behavior, API cache header, or invalidation path changes.                                      | cache scope rationale                                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Capture must wait for page load, fonts/images when available, and expected route markers before writing artifacts; disabled env-gated spec must not slow normal E2E runs.      | targeted screenshot run + skipped default behavior in full gates | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: only public routes are captured, local screenshot capture uses test env defaults, no auth bypass token or protected API path is introduced.                   | route matrix + diff review                                       | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, personal data, logs, analytics payloads, consent copy, legal copy, credentials, or raw env values are introduced or stored.                          | privacy scope rationale                                          | `N/A`                   |
| Content governance                            | `target`     | The runbook must define the baseline route list, artifact naming, storage location, and when to regenerate versus when to use normal before/after handoff.                     | runbook + active brief + queue update                            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin labels, actions, workflow states, editability, role gates, audit trail, or operator support procedure changes.                                            | admin workflow scope rationale                                   | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: screenshots cover crawl-facing public routes, but metadata, sitemap, robots, canonicals, and structured data remain unchanged.                                | unchanged route metadata + route list                            | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: baseline covers public semantic pages for future visual review, but no structured data, AI-facing content contract, or crawl-safe entity model changes.       | route list                                                       | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics calls, KPI persistence, dashboard, payload, consent mode, or instrumentation behavior changes.                                        | analytics scope rationale                                        | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: `/plans` is captured visually, but Stripe, product catalog truth, checkout, entitlements, pricing, finance reporting, and reconciliation remain unchanged.    | route-only capture + unchanged commerce code                     | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no support workflow, incident alert path, recovery behavior, operator diagnostic, escalation procedure, or support runbook for live incidents.               | explicit support-ops scope rationale                             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, revenue report, refund path, payout, invoice, entitlement, reconciliation logic, or finance source-of-truth.                       | explicit finance scope rationale                                 | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing strings, locale routing, translation workflow, metadata text, grammar-coupled copy, or locale content model.                                  | explicit i18n scope rationale                                    | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Playwright config, project names, screenshot output conventions, and npm scripts; add no dependency and no parallel visual-regression platform.                 | diff review                                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add an env-gated Playwright screenshot spec, run the on-demand baseline capture once, run targeted static checks, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge`. | targeted commands + broad gates + CI                             | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Keep artifacts local and intentionally generated, avoid large committed images, and avoid automatic CI runtime/artifact growth.                                                | git diff review + runbook scope                                  | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, package installs, workflows, deployment settings, secrets, or runtime config changes.                      | git diff review + validation gates                               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - No app route, component, server/client boundary, action, API, cache, or revalidation behavior changes.
  - Route readiness uses existing public route semantics and headings only.
- TypeScript/domain contracts:
  - Add a narrow typed Playwright route matrix for screenshot capture.
  - Deterministic invariants: each route must load its expected marker before screenshot; filenames must include `reference`, surface, and viewport.
  - Error/fallback model: capture fails loudly when a route marker is missing.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, index, storage, query shape, or data contract change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reference surface: current public AW-006 route family after recent shipped quick wins.
  - Screenshot comparison type: `reference-only` baseline artifacts named `reference-<surface>-<viewport>.png`.
  - Artifact-level validation follows `docs/runbooks/ui-debug-hypothesis-and-handoff.md`; if the actual consumed artifact contradicts the browser preview or a capture issue repeats, switch to the high-cost UI/export debug path before patching by intuition.
  - Owner screenshot approval stop: N/A for PR gating because this slice changes no product-rendering files; future UI slices that change visuals must still pause for normal owner screenshot approval before `verify:pre-pr`.
- Testing:
  - Add a Playwright screenshot spec that is skipped unless explicitly enabled through the npm script.
  - Run the new on-demand screenshot command and broad gates.

## Data Placement And Sync Contract

N/A with rationale: this tooling introduces no local-only product data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, cache invalidation, or persisted screenshot metadata. Generated screenshots stay local artifacts under `output/` and are not committed.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Screenshot filenames are tooling artifacts only and do not become product identifiers.

## Help / Guide Impact

N/A with rationale: this slice changes no user/admin workflow labels, support recovery behavior, Help/Guide assertions, auth, payments, or operator-facing product procedure. The new documentation is a developer/runbook capture path only.

## Route / Label / Support Surface Sweep

Required as a targeted screenshot-tooling and route-list sweep because this slice records public route names and screenshot artifact conventions.

- Identifiers searched before broad gates:
  - `screenshots:mobile`
  - `SCREENSHOT_DIR`
  - `reference-`
  - `before/after`
  - `after/reference`
  - `owner screenshot approval`
  - `AW-006`
  - `Stable visual baseline`
  - `/course?lesson=`
  - `/plans`
  - `/programs`
  - `/analysis`
  - `/our-method`
  - `/contact`
- Directories/surfaces checked:
  - `package.json`
  - `tests/e2e/`
  - `docs/runbooks/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - one env-gated screenshot spec,
  - one runbook,
  - one npm script,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no product Help/Guide runtime update.

## Scope

- Add an active AW-006 child brief for this visual baseline pilot.
- Update the canonical AW-006 queue to mark admin state primitive done and this slice active.
- Add an on-demand Playwright screenshot baseline spec for these public routes:
  - `/`
  - `/course?lesson=<DEFAULT_LESSON_ID>`
  - `/plans`
  - `/programs`
  - `/analysis`
  - `/our-method`
  - `/contact`
- Add an npm script for the on-demand baseline capture.
- Add a runbook that defines command usage, artifact naming, storage, and scope boundaries.
- Capture one local reference artifact set for handoff evidence.

## Out Of Scope

- Runtime UI, copy, styles, layout, assets, app routes, API routes, data, auth, checkout, analytics, Supabase, migrations, workflows, package installs, or CI workflow changes.
- Full visual-regression platform, snapshot diff thresholds, pixel-diff assertions, large committed artifacts, protected member/admin route baselines, real-user data, or site-lock password flow changes.
- Replacing existing `mobile-screenshots.spec.ts`.
- Broad AW-006 redesign or choosing the next post-baseline UX/UI implementation slice.
- Merge to `main`.

## Acceptance Criteria

1. The canonical AW-006 queue records admin state primitive as shipped through `#762/#763` and points to this active visual-baseline pilot.
2. `npm run screenshots:aw006-baseline` captures full-page `reference-<surface>-<viewport>.png` files for the scoped public route set on `mobile-chromium` and `desktop-chromium`.
3. The screenshot spec is skipped by default unless the AW-006 baseline capture command enables it, so normal E2E runs do not capture large artifacts.
4. The runbook explains the timestamped `output/aw-006-visual-baseline-YYYY-MM-DD-HHMMSS` artifact folder pattern, route list, naming, and no-CI-gate boundary.
5. Generated screenshots are local artifacts only and are not committed.
6. `npm run lint:briefs`, targeted screenshot capture, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `git diff --check`
  - `SCREENSHOT_DIR=output/aw-006-visual-baseline-YYYY-MM-DD-HHMMSS npm run screenshots:aw006-baseline`
  - targeted route/label/support sweep listed above
- Broad gates:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, local Playwright/server and release-gate commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-19 | in-progress | started from clean main@6a2cada after PR #762 and repo-managed closeout #763; post-merge preflight found no pending closeout; created branch aw-006-visual-baseline-pilot and active brief for the canonical Stable visual baseline snapshot pilot | next: implement the env-gated Playwright capture, runbook, npm script, and canonical queue update`
- `2026-05-19 | in-progress | added the env-gated AW-006 visual baseline Playwright spec, npm script, runbook, and canonical queue update; lint:briefs:all, typecheck, lint, git diff --check, quality gates, targeted route/support sweep, and SCREENSHOT_DIR=output/aw-006-visual-baseline-2026-05-19-123939 npm run screenshots:aw006-baseline all passed; captured 14 reference-only mobile/desktop artifacts at 2026-05-19 12:41 with no product-rendering file changes in this slice | next: run npm run verify:pre-pr before PR creation`
- `2026-05-19 | in-progress | npm run verify:pre-pr passed full lane at 2026-05-19 12:51: branch-current, migration drift skip, quality gates, admin/env/pr-body lints, eslint, typecheck, 1117 unit tests, build, performance budgets, and E2E 98 passed / 478 skipped; performance trend recommendation was hold | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
