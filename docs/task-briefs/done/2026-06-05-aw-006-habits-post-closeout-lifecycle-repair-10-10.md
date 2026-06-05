# Task Brief: AW-006 Habits Post-Closeout Lifecycle Repair (10/10)

## Metadata

- `id`: `2026-06-05-aw-006-habits-post-closeout-lifecycle-repair-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-05`
- `updated`: `2026-06-05`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `habits_parent`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-06-05-aw-006-habits-sound-preferences-10-10.md`
- `branch`: `docs/aw-006-habits-lifecycle-repair`
- `merged_pr`: `#997`
- `squash_commit`: `a352b95a`

## Brief Audit Record

- `last_audited`: `2026-06-05`
- `base`: `main@ba6908ee`
- `audit_status`: `ready`
- `decision`: Execute a docs-only lifecycle repair before selecting the next Habits or broader AW-006 product/UI implementation slice.
- `reason`: `main` is clean and synced after Habits Sound Preferences PR `#995` and repo-managed closeout PR `#996`; post-merge preflight was reported green. Fresh re-audit found the done Child J brief still says `status: in-progress`, the AW-006 queue audit top still describes Child J as planned, and the Habits parent latest checkpoint still points to completing the already-merged closeout.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, Habits parent return contract, task-brief lifecycle rules, canonical queue format, `lint:briefs`, post-merge preflight behavior, or verification lanes change before PR handoff.

## Goal

Make the Habits Child J closeout state, Habits parent, and AW-006 canonical queue agree that PR `#995` and closeout PR `#996` are complete, with no active product/UI implementation slice selected.

## Pre-Implementation Owner Explanation

Vi rydder veikartet, ikke produktet. Jeg retter dokumentasjonen slik at den viser at Habits-lyd og scroll-stabilitet faktisk er ferdig, og at ingen ny Habits- eller AW-006-produktjobb er valgt ennå.

Hvorfor det betyr noe: neste jobb skal starte fra riktig kart. Hvis en ferdig slice fortsatt ser aktiv eller planlagt ut, kan vi velge feil scope eller gjøre dobbeltarbeid.

Utenfor scope er app-kode, UI, database, tester, scripts, workflows, screenshots, Help/Guide-innhold, merge til `main`, og valg av neste produkt-slice.

Fremoverkompatibilitet: fremtidige Habits/AW-006-slices skal fortsatt velges eksplisitt fra oppdatert parent/queue etter fresh re-audit; uklar eller stale lifecycle-status skal ryddes som docs-only før ny implementering starter.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                    | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Child J, the Habits parent, and the AW-006 queue must agree that #995/#996 are complete and no product/UI implementation slice is active.                             | docs diff + targeted lifecycle sweep     | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: contributor planning flow becomes clearer; no user-facing Habits flow, navigation, copy, empty state, loading state, or error state changes.         | docs-only diff review                    | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, CSS, layout, print output, brand asset, screenshot artifact, or browser-visible product surface.                             | visual scope rationale                   | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this Markdown-only repair changes no runtime state, persisted data, mutation, validation, domain invariant, checkout, entitlement, or Habits truth.       | docs-only diff review                    | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD action, role behavior, recovery action, or operator workflow.                                                          | admin-editor scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, labels, contrast, live region, or screen-reader semantics change.                                               | a11y scope rationale                     | `N/A`                   |
| Accessibility                                 | `N/A`        | N/A lifecycle-lint alias for `Accessibility (a11y)`; no rendered accessibility surface changes.                                                                       | a11y alias scope rationale               | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                                          | performance scope rationale              | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync policy, conflict policy, retention rule, or sensitive data flow.         | data scope rationale                     | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, revalidation trigger, mutation response, CDN behavior, or stale-data contract changes.                                  | cache scope rationale                    | `N/A`                   |
| Reliability and failure handling              | `target`     | Targeted sweeps must show no current top-level Child J lifecycle text still describes #995/#996 as planned, active, or awaiting closeout.                             | targeted sweeps + brief lint             | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, auth provider behavior, token handling, cookie, secret, or request input changes.                                        | security scope rationale                 | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, credentials, logs, analytics payload, legal copy, consent behavior, retention rule, or raw env value handling changes.                      | privacy scope rationale                  | `N/A`                   |
| Content governance                            | `target`     | The active repair brief, done Child J brief, Habits parent, and AW-006 queue must agree on lifecycle state and return point.                                          | changed docs + route/label/support sweep | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, Help/Guide action, or support procedure changes.                                 | workflow scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, public route content, structured data, or crawl-facing behavior changes.                                     | SEO scope rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                   | AI-discoverability scope rationale       | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics call, KPI persistence, dashboard, payload, consent, or reporting behavior changes.                                           | analytics scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, price, entitlement, invoice, refund, payout, or revenue reporting behavior changes.                                                  | commerce scope rationale                 | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.               | explicit support-ops scope rationale     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, entitlement truth, reconciliation surface, or revenue operation.             | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                          | explicit i18n scope rationale            | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the repair in Markdown lifecycle docs only; add no dependency, script, workflow, runtime component, provider integration, or architecture refactor.              | changed-files diff                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass strict brief lint, all-brief lint, targeted stale-lifecycle sweeps, diff whitespace check, docs-only `verify:pre-pr`, CI, and `verify:pre-merge`. | validation commands + CI evidence        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: accurate lifecycle state reduces future audit/restart cost; runtime cost, service calls, storage, jobs, polling, and traffic cost are unchanged.     | docs-only lifecycle scope                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback and no migration, secret, environment, package, workflow, or production setting changes.                       | git diff review + validation gates       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A; no route, component, server/client boundary, action/API route, cache mode, or rendering behavior changes.
- TypeScript/domain contracts:
  - N/A; no TypeScript type, parser, validation layer, error model, or deterministic product invariant changes.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, index, storage, or data access behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, webhook, secret, retry, or idempotency change.
- UI system:
  - N/A for rendered UI; screenshot handoff is not required because this PR changes no UI, print, layout, brand, asset, or product-rendering file.
- Testing:
  - Docs-only validation through strict brief lint, all-brief lint, targeted lifecycle sweeps, `git diff --check`, `verify:pre-pr`, CI, and `verify:pre-merge`.

## Data Placement And Sync Contract

N/A with rationale: this is a docs-only lifecycle repair. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Brief filenames remain repository lifecycle identifiers only.

## Forward Compatibility Contract

- Extensibility surfaces:
  - AW-006 lifecycle docs, Habits parent intake, Child J done-brief metadata, canonical queue audit text, and future child-brief lifecycle references.
- Source of truth:
  - Completed Habits children must be linked from their `done` path and must not keep top-level status, audit reason, or checkpoint text that says they are planned, active, or awaiting closeout.
- Additive behavior:
  - Future Habits/AW-006 slices can be selected from parent/queue without inheriting stale active references from completed Child J.
- Explicit mapping requirements:
  - Any future Habits or AW-006 product/UI slice still requires owner selection, fresh re-audit, a scoped brief, scorecard mapping, Help/Guide impact decision, and screenshot handoff when visual files change.
- Unknown or deprecated values:
  - Unknown future lifecycle references fail safe as planning-only until a fresh queue/design/code re-audit selects the next slice.
- Test/evidence:
  - Targeted stale-lifecycle sweeps and brief lint prove this repair is not hardcoded to an implementation state that is no longer true.

## Help / Guide Impact

N/A with rationale: this PR changes lifecycle docs only. It changes no user/admin workflow label, Help/Guide content, support recovery behavior, operator instruction, runbook procedure, auth, payments, or support path.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue/Habits parent sweep.

- Identifiers to sweep before broad gates:
  - `Habits Sound Preferences And Date Navigation Scroll Stability`
  - `2026-06-05-aw-006-habits-sound-preferences-10-10`
  - `status`: `in-progress`
  - `planned but not active`
  - `Sound Preferences`
  - `Child J`
  - `#995`
  - `#996`
  - `complete repo-managed docs-only closeout PR`
  - `active implementation`
- Surfaces to check:
  - `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
  - `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
  - `docs/task-briefs/done/2026-06-05-aw-006-habits-sound-preferences-10-10.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
- Expected fallout:
  - this active repair brief,
  - Child J done-brief metadata/audit wording,
  - canonical AW-006 queue audit/current-state wording,
  - Habits parent final checkpoint/current-state wording,
  - no product code, Help/Guide, support workflow, route label, rendered UI, screenshot, provider, test, script, config, or API changes.

## Scope

- Create this in-progress docs-only repair brief.
- Correct the Child J done brief metadata/audit wording so it no longer reads as an active implementation.
- Correct the AW-006 queue audit/current-state wording so it reflects PR `#995` and closeout PR `#996`.
- Correct the Habits parent latest checkpoint/current-state wording so it no longer points to completing the already-merged closeout.
- Keep the next product/UI implementation slice unselected.

## Out Of Scope

- Runtime app code, UI, CSS, product rendering, screenshots, routes, APIs, tests, scripts, configs, workflows, migrations, generated files, assets, external services, package changes, environment settings, or feature behavior.
- Choosing or implementing the next Habits or AW-006 product/UI slice.
- Supabase, Stripe, auth, analytics, database, commerce, finance, i18n, Help/Guide, support procedures, or merge to `main`.

## Acceptance Criteria

1. The Child J done brief top metadata says `status: done` and does not describe itself as the active implementation.
2. The AW-006 queue audit/current-state text states that #995 and #996 are complete and no product/UI implementation slice is selected.
3. The Habits parent latest checkpoint states that #996/post-merge preflight is complete and the next action is explicit owner selection after fresh audit.
4. The active repair brief is the only new in-progress lifecycle item in this docs-only diff.
5. Diff remains docs-only and does not touch runtime code, UI, tests, scripts, configs, workflows, generated files, provider behavior, screenshots, or assets.
6. `npm run lint:briefs`, `npm run lint:briefs:all`, targeted sweeps, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Broad gates:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

Docs-only lane is expected while the diff stays limited to Markdown docs.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.

## Screenshot Handoff

N/A with rationale: this PR changes no UI, print, layout, brand, asset, product-rendering file, or browser-visible behavior. No screenshot handoff is required.

## Checkpoint Log

- `2026-06-05 | in-progress | started from clean synced main@ba6908ee after PR #995 and repo-managed closeout PR #996; post-merge preflight was reported green; fresh re-audit found stale top-level Child J lifecycle text in the done brief, AW-006 queue, and Habits parent while no product/UI implementation slice is selected | next: repair docs-only lifecycle state, run targeted sweeps and docs-only validation, then open PR without selecting the next product/UI slice`
- `2026-06-05 | pre-pr gate | repaired Child J done metadata, AW-006 queue audit/current-state text, and Habits parent latest checkpoint; npm run lint:briefs:all passed, git diff --cached --check passed, targeted lifecycle sweep found only expected historical/checkpoint references, and npm run verify:pre-pr passed the docs-only lane with artifact log artifacts/test-runs/20260605-205004/verify.log | next: rerun the docs-only pre-PR gate after this checkpoint update, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-06-05 | done | PR #997 merged as a352b95a; post-merge preflight surfaced this repo-managed docs-only closeout, moving the repair brief to done and clearing the AW-006 active lifecycle repair reference | next: run closeout docs-only gates, merge the closeout PR, sync main, rerun post-merge preflight, and complete chat-handoff assessment`

## Completion Record

- `completed`: `2026-06-05`
- `merged_pr`: `#997`
- `squash_commit`: `a352b95a`
- `result`: Closed the AW-006 Habits lifecycle repair so the queue, Habits parent, and Child J history no longer point at stale active work after PR `#995` and closeout PR `#996`.
- `validation`: `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`, `npm run verify:pre-pr`, PR `#997` CI, and `npm run verify:pre-merge` passed before merge; closeout PR repeats the docs-only gate sequence after moving this brief to `done`.
- `10/10 claim`: yes - all critical target categories reached `5/5` for this docs-only lifecycle repair scope.

| Category                            | Achieved Score | Evidence                                                                                                                                                   | Gaps / Notes                                                                         |
| ----------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Product goals and IA                | `5/5`          | PR `#997` docs diff aligned Child J, Habits parent, and AW-006 queue around completed #995/#996 state and no selected product/UI slice.                    | No remaining gap in docs-only scope.                                                 |
| Reliability and failure handling    | `5/5`          | Targeted lifecycle sweep, brief lint, docs-only `verify:pre-pr`, CI, and `verify:pre-merge` passed for commit `a352b95a`.                                  | No remaining stale active Child J lifecycle text in the repaired top-level surfaces. |
| Content governance                  | `5/5`          | Done brief metadata, parent checkpoint, and canonical queue/current-state wording were made consistent in PR `#997`.                                       | No Help/Guide, runbook, or support fallout for this docs-only repair.                |
| Stack-fit and dependency discipline | `5/5`          | Changed files stayed limited to Markdown task-brief lifecycle docs; no runtime, script, config, workflow, dependency, provider, or generated-file changes. | No architecture gap.                                                                 |
| Testing and QA automation           | `5/5`          | `npm run lint:briefs`, `npm run lint:briefs:all`, `git diff --check`, `npm run verify:pre-pr`, PR `#997` CI, and `npm run verify:pre-merge` passed.        | Closeout PR repeats docs-only validation after lifecycle move.                       |
| DevOps and rollback readiness       | `5/5`          | PR `#997` was docs-only, current with `origin/main`, green in CI, and rollback remains a normal Markdown revert with no migration or environment impact.   | No release/rollback gap.                                                             |
