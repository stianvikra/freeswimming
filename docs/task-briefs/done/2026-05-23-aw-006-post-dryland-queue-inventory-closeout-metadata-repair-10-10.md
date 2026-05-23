# Task Brief: AW-006 Post-Dryland Queue/Inventory And Closeout Metadata Repair (10/10)

## Metadata

- `id`: `2026-05-23-aw-006-post-dryland-queue-inventory-closeout-metadata-repair-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-23`
- `updated`: `2026-05-23`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-23-aw-006-dryland-micro-sessions-feedback-semantics-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-post-dryland-queue-inventory-repair`

## Brief Audit Record

- `last_audited`: `2026-05-23`
- `base`: `main@ea69034`
- `audit_status`: `ready`
- `decision`: Execute a bounded lifecycle/tooling repair before selecting the next AW-006 product slice.
- `reason`: `main` is clean after Dryland/Micro Sessions Feedback Semantics PR `#818` and repo-managed closeout PR `#819`; `npm run post-merge:preflight` reports green, but the canonical AW-006 queue and notice/empty-state inventory still describe Dryland as active/in-progress. The Dryland done brief also lacks the reference metadata that lets stale queue/inventory checks catch this class of closeout drift.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, task-brief metadata keys, closeout-reference lint behavior, post-merge preflight, canonical queue format, notice inventory format, or verification lanes change before PR handoff.

## Goal

Repair the stale post-Dryland AW-006 queue/inventory state and harden closeout-reference detection so future completed AW-006 briefs cannot miss stale active/current/candidate/in-progress references just because they used `related_parent_brief` or only mentioned a design inventory path in the body.

## Pre-Implementation Owner Explanation

Jeg skal rydde arbeidslisten etter Dryland-jobben og gjøre kontrollen strengere, slik at repoet ikke kan si at en ferdig jobb fortsatt er aktiv. Det betyr noe fordi neste AW-006-slice ellers kan starte fra feil premiss. Utenfor scope er produkt-UI, screenshots, Dryland-logikk, API-er, database, auth, Stripe, analytics, Help/Guide og merge.

Fremoverkompatibilitet: fremtidige AW-006-closeouts skal automatisk sjekkes mot både kanonisk kø og relevante designinventar når disse er nevnt i briefen. Nye reference-dokumenter må enten legges i metadata eller nevnes som `docs/task-briefs/planned/...` / `docs/design/...`; ukjente eller manglende referanser skal feile tydelig i closeout-gates når de fortsatt markerer en ferdig slice som aktiv.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                         | Evidence                                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AW-006 queue must record Dryland as done through `#818/#819` and leave no active next product slice selected until a fresh re-audit.                                                       | queue diff + active brief                                   | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: contributor/owner workflow becomes clearer, but no user-facing product flow changes.                                                                                      | queue/inventory wording review                              | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, CSS, visual tokens, screenshots, layout, print, brand assets, or product surface.                                                                 | visual scope rationale                                      | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Stale-reference detection must inspect done-brief metadata plus `related_parent_brief` and referenced planned/design docs without false-failing checkpoint logs.                           | targeted unit tests                                         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, recovery action, role behavior, or operator workflow.                                                                       | admin scope rationale                                       | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, labels, contrast, live region, or screen-reader semantics change.                                                                    | a11y scope rationale                                        | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                                                               | performance scope rationale                                 | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync, conflict policy, retention rule, or sensitive data flow.                                     | data scope rationale                                        | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, revalidation trigger, mutation response, CDN behavior, or stale-data contract changes.                                                       | cache scope rationale                                       | `N/A`                   |
| Reliability and failure handling              | `target`     | `lint:briefs` and post-merge preflight must surface stale active/current/candidate/in-progress references even when only related/reference docs reveal the queue or inventory fallout.     | targeted tests + post-merge smoke                           | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, auth provider behavior, token handling, cookie, secret, or request input changes.                                                             | security scope rationale                                    | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, credentials, logs, analytics payload, legal copy, consent behavior, retention rule, or raw env value handling changes.                                           | privacy scope rationale                                     | `N/A`                   |
| Content governance                            | `target`     | Canonical queue, notice inventory, and Dryland done-brief metadata must agree on lifecycle state and closeout reference ownership.                                                         | docs diff + route/label/support sweep                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, Help/Guide action, or support procedure changes.                                                      | workflow scope rationale                                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, route content, structured public page content, or crawl-facing route changes.                                                     | SEO scope rationale                                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                        | AI-discoverability scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics call, KPI persistence, dashboard, payload, consent, or reporting behavior changes.                                                                | analytics scope rationale                                   | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, price, entitlement, invoice, refund, payout, or revenue reporting behavior changes.                                                                       | commerce scope rationale                                    | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                                    | explicit support-ops scope rationale                        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                   | explicit finance scope rationale                            | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                                               | explicit i18n scope rationale                               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing task-brief lint and post-merge preflight logic; add no dependency and keep detection path-normalized, deterministic, and fixture-tested.                                    | script/test diff + package diff                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused unit tests for related-parent and body-referenced design inventory detection; run targeted tests, strict brief lint, quality gates, full pre-PR, CI, and pre-merge validation. | targeted Vitest + local gates + CI                          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: stronger closeout detection reduces repeated manual audit cost without adding runtime services or recurring infrastructure.                                               | automation behavior + no package/runtime dependency diff    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff must be reversible by normal git revert with no migration, env/config, workflow, package, production setting, or runtime deploy-setting changes.                                      | git diff review + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Tooling:
  - Reuse `scripts/lint-task-brief-scorecard.mjs` as the canonical stale-reference detector.
  - Reuse `scripts/post-merge-preflight.mjs` for post-merge diagnostics.
  - Do not add a second manual checker.
- Reference docs:
  - Treat `canonical_queue`, `design_inventory`, `related_parent_brief`, and explicit `docs/task-briefs/planned/...` / `docs/design/...` references as closeout reference surfaces.
  - Keep checkpoint logs excluded from stale active/current/candidate/in-progress matching.
- Runtime:
  - N/A; no app runtime, Next.js route, component, API, Supabase, auth, Stripe, analytics, or cache behavior changes.
- Tests:
  - Extend existing fixture-based unit tests only.
  - Run full lane before PR because scripts/tests are touched.

## Data Placement And Sync Contract

N/A with rationale: this is a tooling/docs lifecycle repair. It introduces no local-only data, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible domain identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Task-brief filenames and metadata IDs remain repository lifecycle identifiers only.

## Forward Compatibility Contract

- Extensibility surfaces:
  - AW-006 child briefs, canonical queues, design inventories, and future planned/design reference docs.
- Source of truth:
  - Done brief metadata and explicit Markdown references remain the source of truth for closeout reference scanning.
- Additive behavior:
  - New AW-006 done briefs should automatically scan `canonical_queue`, `design_inventory`, `related_parent_brief`, and body-referenced planned/design docs for stale active/current/candidate/in-progress mentions.
- Explicit mapping requirements:
  - New reference doc families outside `docs/task-briefs/planned/` and `docs/design/` require an explicit parser/test update before relying on automated stale-reference checks.
- Unknown or deprecated values:
  - Missing reference files stay non-blocking, but known reference files that still mark a done brief active/current/candidate/in-progress must fail with a concrete file and matched-text message.
- Test/evidence:
  - Targeted unit fixtures cover related-parent fallback, body-referenced design inventory fallback, and checkpoint-log non-failure.

## Help / Guide Impact

N/A with rationale: this PR changes lifecycle docs/tooling only. It changes no user/admin workflow labels, Help/Guide content, support recovery behavior, operator instructions, or runbook procedure.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue/design-inventory sweep.

- Identifiers to sweep before broad gates:
  - `Dryland / Micro Sessions Feedback Semantics`
  - `docs/task-briefs/in-progress/2026-05-23-aw-006-dryland-micro-sessions-feedback-semantics-10-10.md`
  - `docs/task-briefs/done/2026-05-23-aw-006-dryland-micro-sessions-feedback-semantics-10-10.md`
  - `Active Dryland / Micro Sessions Feedback Semantics Slice`
  - `active/current/candidate/in-progress`
  - `canonical_queue`
  - `design_inventory`
  - `related_parent_brief`
- Surfaces to check:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/design/`
  - `scripts/lint-task-brief-scorecard.mjs`
  - `scripts/post-merge-preflight.mjs`
  - `tests/unit/task-brief-scorecard-lint.test.ts`
  - `tests/unit/merge-preflight.test.ts`
- Expected fallout:
  - this active repair brief,
  - canonical AW-006 queue update,
  - notice/empty-state inventory update,
  - Dryland done-brief metadata update,
  - targeted script/test updates,
  - no product code, Help/Guide, support workflow, route label, rendered UI, screenshot, provider, or API changes.

## Scope

- Create this in-progress repair brief.
- Update the canonical AW-006 queue so Dryland is done through `#818/#819` and no next AW-006 implementation slice is selected until a fresh re-audit.
- Update the notice/empty-state inventory so Dryland/Micro Sessions is completed and no active state/feedback candidate is selected.
- Add `canonical_queue` and `design_inventory` metadata to the Dryland done brief.
- Harden stale-reference detection to scan `related_parent_brief` and explicit planned/design doc references.
- Add targeted unit coverage for the new detection paths.

## Out Of Scope

- Runtime app code, UI, CSS, product rendering, screenshots, routes, APIs, migrations, generated files, assets, external services, package changes, workflows, environment settings, or feature behavior.
- Choosing or implementing the next AW-006 product/UI slice.
- Dryland/Micro Sessions training state, labels, support behavior, local draft behavior, release/completion/skip/undo/bubble logic, or persistence.
- Broad app-wide Notice/EmptyState primitives.
- Supabase, Stripe, auth, analytics, database, commerce, finance, i18n, Help/Guide, support procedures, or merge to `main`.

## Acceptance Criteria

1. The AW-006 queue records Dryland/Micro Sessions Feedback Semantics as done through `#818/#819`.
2. The AW-006 queue and notice inventory no longer mark Dryland as active/current/candidate/in-progress or point to its old `in-progress` path as active work.
3. The Dryland done brief contains `canonical_queue` and `design_inventory` metadata.
4. Stale-reference detection catches related-parent queue references and body-referenced design inventory references.
5. Historical checkpoint-log references remain allowed.
6. Diff avoids runtime/product/API/UI/package/workflow changes.
7. Targeted unit tests, `lint:briefs`, `lint:briefs:all`, `lint:quality-gates`, `post-merge:preflight`, `git diff --check`, `verify:pre-pr`, required CI, and `verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npx vitest run tests/unit/task-brief-scorecard-lint.test.ts tests/unit/merge-preflight.test.ts`
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - `npm run lint:quality-gates`
  - `npm run post-merge:preflight`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Broad gates:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

Full verification lane is expected because scripts and unit tests are in scope.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.

## Screenshot Handoff

N/A with rationale: this PR changes no UI, print, layout, brand, asset, product-rendering file, or browser-visible behavior. No screenshot handoff is required.

## Checkpoint Log

- `2026-05-23 | in-progress | started from clean main@ea69034 after PR #818 and repo-managed closeout #819; post-merge preflight was green, but queue/design/code re-audit found stale Dryland active references plus missing closeout reference metadata | next: repair queue/inventory metadata and harden stale-reference detection`
- `2026-05-23 | in-progress | repaired Dryland queue/inventory state, added Dryland done-brief reference metadata, and hardened stale-reference detection for AW-006 related-parent/body-referenced planned/design docs plus in-progress table rows; targeted Vitest passed for task-brief lint and merge-preflight tests, npm run lint:briefs:all passed, npm run lint:quality-gates passed, targeted stale Dryland sweep returned no matches, and git diff --check passed | next: run npm run verify:pre-pr before commit/push/PR handoff`
- `2026-05-23 | in-progress | first npm run verify:pre-pr full lane stopped at TypeScript implicit-any in the new merge-preflight test; added an explicit fixture entry type, then targeted Vitest and npm run typecheck passed | next: rerun npm run verify:pre-pr`
- `2026-05-23 | in-progress | npm run verify:pre-pr full lane passed on the uncommitted repair diff after the TypeScript fix; full lane included lint/typecheck/unit/build/perf and Playwright with 98 passed, 478 skipped in the local matrix | next: commit the repair and rerun npm run verify:pre-pr on committed branch diff before push`
- `2026-05-23 | done | merged PR #820 as squash commit 58eec75 after local verify:pre-pr, PR CI, and verify:pre-merge passed; post-merge preflight requested this repo-managed docs-only closeout | next: move brief to done, record completion, and remove repair from active queue state`

## Completion Record

- `completed`: `2026-05-23`
- `merged_pr`: `#820`
- `squash_commit`: `58eec75`
- `result`: Closed the AW-006 post-Dryland lifecycle repair so the queue, design inventory, done-brief metadata, lint gate, and post-merge preflight now agree that Dryland is complete and no next AW-006 product slice has been selected yet.
- `validation`: Targeted Vitest for task-brief lint and merge-preflight tests; `npm run lint:briefs`; `npm run lint:briefs:all`; `npm run lint:quality-gates`; targeted stale-reference sweep; `git diff --check`; `npm run verify:pre-pr`; PR #820 CI; `npm run verify:pre-merge`; post-merge preflight surfaced only this repo-managed docs-only closeout.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                      | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | AW-006 queue and notice inventory now mark Dryland done and no next slice set | None         |
| Business logic correctness and data integrity | `5/5`          | Targeted stale-reference unit tests and preflight behavior                    | None         |
| Reliability and failure handling              | `5/5`          | `lint:briefs`, post-merge preflight, local gates, and CI                      | None         |
| Content governance                            | `5/5`          | Queue, inventory, and done-brief metadata aligned                             | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing lint/preflight tooling with no dependencies                   | None         |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, full local pre-PR, PR CI, and pre-merge gate                 | None         |
| DevOps and rollback readiness                 | `5/5`          | Docs/tooling-only diff, squash merge `58eec75`, normal git revert available   | None         |
