# Task Brief: App Knowledge Book Phase 2C - Stack And Runtime (10/10)

## Metadata

- `id`: `2026-05-16-app-knowledge-book-phase-2c-stack-and-runtime-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-16`
- `updated`: `2026-05-16`

## Closeout Status

Done. Phase 2C shipped in PR `#722` and merged on `2026-05-16` as `b6e6d83`. The merged scope is
docs-only and created the third owner-readable App Knowledge Book chapter without runtime, UI, API,
schema, workflow, provider, config, script, route, sitemap, metadata, robots, dependency, package,
lockfile, or generated-inventory changes.

## Completion Record

- PR: `https://github.com/stianvikra/freeswimming/pull/722`
- Merge: `docs/app-knowledge-stack-runtime` -> `main`
- Merge commit: `b6e6d83`
- Delivered files:
  - `docs/app-knowledge-book/chapters/03-stack-and-runtime.md`
  - `docs/app-knowledge-book/README.md`
  - `docs/task-briefs/in-progress/2026-05-16-app-knowledge-book-phase-2c-stack-and-runtime-10-10.md`
- Lifecycle closeout:
  - this brief moved to `docs/task-briefs/done/`.
- DevOps/workflow changes:
  - none; no scripts, workflows, release gates, runtime code, provider settings, routes, sitemap,
    metadata, robots, config, package, dependency, or lockfile changed.
- Secrets used:
  - none. No secret values, raw env values, cookies, tokens, request IPs, provider responses,
    personal data, or user free-text content were added.
- Validation evidence:
  - `git diff --check`: PASS
  - targeted route/label/support-surface sweep for `App Knowledge Book`, `Stack and Runtime`,
    `Stack And Runtime`, `Phase 2C`, `03-stack-and-runtime`, `docs/system-state`, and
    `Unknown / To Verify`: docs-scope only
  - `npm run lint:briefs:all`: PASS
  - `npm run verify:pre-pr`: PASS, docs-only lane
  - GitHub checks on PR `#722`: PASS (`verify`, `Analyze (javascript-typescript)`, `CodeQL`,
    `Vercel`, `Vercel Preview Comments`, `deploy-preview`, `e2e-smoke`, `site-lock-smoke`,
    `size-check`)
  - `npm run verify:pre-merge`: PASS, docs-only lane

10/10 claim: yes, for the Phase 2C docs-only Stack and Runtime scope.

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Achieved Score | Evidence                                                                          |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Chapter explains the platform foundation and where stack/runtime facts live.      |
| UX flow clarity                               | `5/5`          | Owner paths cover stack, runtime, setup, verification, CI, release, and risk.     |
| Business logic correctness and data integrity | `5/5`          | Repo-proven facts are separated from provider facts marked `Unknown / To Verify`. |
| Performance (CWV + payloads)                  | `5/5`          | Performance-budget ownership and verification commands are named.                 |
| Data placement and sync boundaries            | `5/5`          | Repo, config, provider, local, and generated-doc boundaries are explicit.         |
| Caching and invalidation strategy             | `5/5`          | Cache and route freshness contracts are linked without behavior changes.          |
| Reliability and failure handling              | `5/5`          | Verification, CI, release, incident, sandbox, and debug runbooks are linked.      |
| Security and authz                            | `5/5`          | Env, secret, private-gate, admin, and server/client boundaries are documented.    |
| Privacy and compliance                        | `5/5`          | Sensitive data is excluded and privacy/compliance docs are linked.                |
| Content governance                            | `5/5`          | Stable manual chapter links canonical docs and includes a maintenance trigger.    |
| Incident response and support operations      | `5/5`          | Owner-level support and rollback paths are linked without raw logs.               |
| Stack-fit and dependency discipline           | `5/5`          | Diff is Markdown-only with no dependency, package, tooling, or config change.     |
| Testing and QA automation                     | `5/5`          | Brief lint, docs-only pre-PR, CI, and pre-merge gates passed.                     |
| Scalability and cost efficiency               | `5/5`          | Chapter stays concise and defers volatile generated inventories.                  |
| DevOps and rollback readiness                 | `5/5`          | Docs-only rollback is normal git revert; release/post-merge docs are linked.      |

## Brief Audit Record

- `last_audited`: `2026-05-16`
- `base`: `main@e8ad290`
- `audit_status`: `ready`
- `decision`: Execute this Phase 2C docs-only Stack and Runtime slice now.
- `reason`: Owner explicitly requested `execute Phase 2C Stack and Runtime` on `2026-05-16`; current `main` is clean after PR `#720` and repo-managed closeout PR `#721`; all existing `in-progress` briefs were audited first and remain `revise-before-use`, while the App Knowledge Book Phase 2 sequence has fresh merged chapters `01-owner-overview.md` and `02-product-map.md`, and `proposed-structure.md` identifies `03-stack-and-runtime.md` as the next stable manual chapter.
- `must_refresh_before_execution_if`: App Knowledge Book Phase 1/2 docs change, the owner chooses a different next product slice, scorecard/audit-gate rules change, stack/runtime package/config/workflow files change, route labels/support surfaces change, verification lanes change, or implementation starts from a newer `main` after meaningful docs/runtime changes.

## Goal

Create an owner-readable Stack and Runtime chapter that explains the stable technical foundation of FreeSwimming.org without pretending all product features or provider control-plane facts are complete.

## Why This Brief Exists

Phase 2A and Phase 2B established the owner overview and product map. The next useful stable chapter is the platform foundation: framework, runtime, package tooling, app/router shape, environment/config boundary, verification gates, CI/release surfaces, and where runtime risk lives.

This slice is intentionally narrow. It should help the owner understand the app's technical ground rules now, while deferring deeper feature/domain chapters and generated inventories until more product areas are built and explicitly approved.

## Execution Mode

- `plan approved`: owner approved the Phase 2C Stack and Runtime scope on `2026-05-16`.
- `execution approved`: owner explicitly requested execution on `2026-05-16`.
- `automation-first`: follow AGENTS.md end to end for a docs-only workstream: implement scoped docs, validate, commit, push, open/update PR, monitor CI, run pre-merge gate, and summarize merge readiness.

## Scope

Create or update only docs needed for Phase 2C:

- Create `docs/app-knowledge-book/chapters/03-stack-and-runtime.md`.
- Update `docs/app-knowledge-book/README.md` only enough to link the new chapter and preserve existing reading paths.
- Move this brief from `planned` to `in-progress` when implementation starts.

The Stack and Runtime chapter must include:

- what the stack is and why it matters to the owner,
- Next.js App Router, React, TypeScript, Tailwind, Supabase, Stripe, Playwright, Vitest, ESLint, and CI/release tooling at owner-readable depth,
- local runtime contract from `.nvmrc`, `package.json`, `next.config.ts`, and relevant scripts,
- package/dependency boundary and when dependency changes need separate maintenance briefs,
- runtime config and env-name safety rules without raw env values,
- server/client and route/API ownership at a high level,
- cache, private gate, build, verification, and release-gate boundaries,
- how to verify common stack/runtime questions,
- `Unknown / To Verify` markers for provider/control-plane facts not proven by repo evidence,
- maintenance trigger for future stack/runtime changes.

Use evidence from:

- `package.json`
- `.nvmrc`
- `next.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `playwright.config.ts`
- `.github/workflows/`
- `scripts/run-verify-pre-pr.sh`
- `scripts/run-verify-pre-merge.sh`
- `docs/architecture.md`
- `docs/testing-strategy.md`
- `docs/architecture/data-access-authz-cache-contract-registry.md`
- `docs/architecture/external-service-contract-matrix.md`
- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/app-knowledge-book/chapters/01-owner-overview.md`
- `docs/app-knowledge-book/chapters/02-product-map.md`
- `docs/app-knowledge-book/proposed-structure.md`
- `docs/app-knowledge-book/quality-checklist.md`
- `docs/app-knowledge-book/living-documentation-plan.md`
- `docs/app-knowledge-book/unknowns-and-risks.md`

## Out Of Scope

- No runtime code changes.
- No UI, print, layout, brand, screenshot, or interactive behavior changes.
- No package, dependency, lockfile, Node/npm, Next, TypeScript, ESLint, Playwright, Vitest, Tailwind, or config changes.
- No script, workflow, branch-protection, release-gate, performance-budget, or CI behavior changes.
- No route additions, removals, redirects, metadata changes, sitemap changes, robots changes, cache-policy changes, or site-lock behavior changes.
- No provider dashboard verification.
- No Supabase migrations, RLS changes, generated DB type changes, or live data inspection.
- No `docs/system-state/*` generated inventories.
- No full Phase 2 book generation.
- No deep feature/domain chapters for admin, workouts, programs, dryland, habits, visual coaching, passkeys, tester access, or future AI/program planning.
- No raw secrets, env values, cookies, tokens, request IPs, provider response bodies, personal data, or user free-text content.
- No claims about production provider/control-plane settings unless repo evidence or owner-provided evidence proves them.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this docs-only Stack and Runtime slice are every category mapped `target`.

Strict `10/10` mode for this slice:

- every `target` category must close out at `5/5`,
- every `supporting` category must include enough linked evidence to score `5/5` for the limited docs-only support role,
- `N/A` is limited to categories that cannot be changed by Markdown-only documentation.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                               | Evidence                                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Chapter explains the platform foundation and where stack/runtime facts live without requiring code expertise.                                                    | `03-stack-and-runtime.md` structure + README link                         | `5/5`                   |
| UX flow clarity                               | `target`     | Chapter gives clear owner paths for stack, runtime, local setup, verification, CI/release, and safe-change questions.                                            | chapter sections + exact path references                                  | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this Markdown-only slice does not change rendered UI, layout, typography, color, screenshots, print, or brand assets.                                | docs-only diff review                                                     | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Chapter separates shipped repo-proven runtime facts from planned/unknown provider facts and does not describe planned features as live behavior.                 | evidence citations + `Unknown / To Verify` markers                        | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: chapter links admin runtime/support docs where stack behavior affects admin safety; it does not change admin UI or workflows.                   | admin/runtime references + no workflow diff                               | `5/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this Markdown-only slice does not change interactive semantics, focus behavior, labels, contrast, or screen-reader flow.                             | docs-only diff review                                                     | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Chapter names performance-budget ownership and verification commands without changing route payloads, budgets, or CWV behavior.                                  | links to testing/perf docs and scripts                                    | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Chapter names repo/config/provider/local/generated-doc boundaries for stack/runtime facts and avoids treating provider control-plane state as repo-proven.       | stack/runtime boundary section + Phase 1/2 references                     | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Chapter explains where cache and route freshness contracts are documented at owner-readable depth without changing cache behavior.                               | links to data-access/authz/cache registry                                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Chapter routes stack/runtime failures to verification, CI, release, incident, sandbox, and local-debug runbooks without inventing recovery flow.                 | support/incident/release links + no unsupported claims                    | `5/5`                   |
| Security and authz                            | `target`     | Chapter explains server/client env boundaries, secret handling, private gate, admin access, and least-secret documentation rules with no secret values.          | security/config section + no-secret review                                | `5/5`                   |
| Privacy and compliance                        | `target`     | Chapter avoids personal data and links privacy/secret/GDPR docs for operational rules rather than copying sensitive examples.                                    | privacy/compliance references + safe examples review                      | `5/5`                   |
| Content governance                            | `target`     | Chapter remains stable manual documentation, links canonical docs instead of duplicating volatile inventories, and documents maintenance triggers.               | chapter maintenance section + README update                               | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin labels, actions, Help/Guide content, or editability flows change; chapter only points to canonical admin/runtime docs when relevant.   | explicit Help/Guide N/A + support-surface sweep                           | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: chapter points to sitemap, robots, metadata, and private-posture surfaces; it does not change public crawl behavior.                            | links to SEO/crawl/runtime paths                                          | `5/5`                   |
| AI discoverability                            | `supporting` | Supporting only: chapter improves human/AI repo navigation but does not change public structured data, crawl policy, or generated AI docs.                       | AI discoverability note + scope review                                    | `5/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: chapter links analytics/KPI surfaces and safe-payload boundaries; it does not add or change events.                                             | analytics/KPI docs links + no runtime diff                                | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: chapter names Stripe/commerce stack boundaries and external-service docs without changing checkout, entitlements, catalog, or finance behavior. | commerce/provider references + unknown markers                            | `5/5`                   |
| Incident response and support operations      | `target`     | Chapter gives owner-level paths to CI, local runtime, sandbox, incident, rollback, and debugging runbooks; no raw logs or provider responses are copied.         | support/incident/release section + runbook links                          | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting flows change; chapter links finance/commerce provider boundaries and keeps live provider facts `Unknown / To Verify`.      | finance/provider references + explicit scope rationale                    | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: no locale routing or translated content changes; chapter links i18n readiness where stack/runtime choices affect future locale scale.           | i18n docs references + explicit scope rationale                           | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Diff remains Markdown-only, uses existing App Knowledge Book structure, adds no dependency/tooling, and accurately documents current stack/runtime contracts.    | changed-files diff + checklist review                                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief and docs pass brief lint plus docs-only verification before PR update; no skipped validation is hidden.                                            | `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run verify:pre-pr` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Chapter stays concise, links canonical docs instead of duplicating large route/dependency tables, and keeps generated inventories deferred.                      | chapter length/reviewability check + no generated inventory diff          | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only rollback remains normal git revert; chapter links release/verification/post-merge docs and does not modify release tooling.                            | rollback/release section + docs-only diff review                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no app route, component, server/client, cache, or revalidation behavior changes.
  - stack claims must cite exact paths such as `app/`, `next.config.ts`, `docs/architecture.md`, and relevant route/cache docs.
- TypeScript/domain contracts:
  - no TypeScript contracts or runtime invariants change.
  - documentation claims must cite exact repo paths instead of inferring behavior from task-brief intent.
- Supabase/data layer:
  - no migrations, RLS changes, generated type updates, or live data inspection.
  - mark live row counts, backup proof, project settings, and provider settings as `Unknown / To Verify` unless owner-provided evidence exists.
- External services/tools:
  - no provider dashboard reads, SDK/config changes, webhook changes, or env changes.
  - record env variable names only if needed; never values.
- UI system:
  - no rendered UI changes and no screenshot handoff required.
- Testing:
  - docs-only validation with brief lint, targeted support-surface sweep, and pre-PR/pre-merge gates after execution approval.

## Data Placement And Sync Contract

N/A for runtime state because this slice creates Markdown documentation only.

Documentation state boundaries:

- Server-canonical app data remains unchanged.
- Provider-canonical state remains `Unknown / To Verify` unless evidenced.
- Local-only app/browser state remains out of scope.
- The chapter is stable manual documentation under git.
- Volatile generated inventories remain deferred and must not be created in this slice.

## Identity And Rename Contract

N/A for persisted product entities because this slice creates documentation only and does not create or mutate users, routes, slugs, database rows, notes, workouts, programs, commerce entities, or provider records.

Documentation identity:

- Stable chapter path: `docs/app-knowledge-book/chapters/03-stack-and-runtime.md`.
- Human-readable title may be edited for clarity, but the numbered chapter path should remain stable once shipped.
- If Phase 2 chapter structure changes materially later, update README links and chapter references in the same PR.

## Help / Guide Impact

N/A for admin Help/Guide runtime content because this docs-only slice does not change admin labels, actions, recovery behavior, or user/admin workflow behavior.

The Stack and Runtime chapter may link to Help/Guide, runbooks, and admin-support docs, but it must not redefine those workflows.

## Route / Label / Support Surface Impact Sweep

Before execution closeout, run a targeted repo sweep for:

- `App Knowledge Book`
- `Stack and Runtime`
- `Stack And Runtime`
- `Phase 2C`
- `03-stack-and-runtime`
- `docs/system-state`
- `Unknown / To Verify`

Any changed route, label, Help/Guide, support, runbook, config, script, workflow, or runtime behavior discovered during the sweep must either be excluded from this docs-only slice or captured as a separate follow-up brief.

## Acceptance Criteria

1. Brief is approved and moved to `in-progress` only when implementation starts.
2. `03-stack-and-runtime.md` exists and is owner-readable without code expertise.
3. The chapter explains stack/runtime contracts using exact repo paths and canonical docs.
4. The chapter distinguishes stable foundation facts from incomplete product/domain/provider facts.
5. The chapter uses `Unknown / To Verify` for external/control-plane facts not proven by repo evidence.
6. README links the new chapter without removing existing Phase 1, Phase 2A, or Phase 2B reading paths.
7. No generated inventories, scripts, workflows, runtime code, UI, schema, provider, config, route, sitemap, metadata, robots, package, or dependency files are changed.
8. Changed docs pass brief lint and docs-only verification gates before PR update.

## Validation

Planning-only brief creation:

- `npm run lint:briefs`

Execution after owner approval:

- `git diff --check`
- targeted route/label/support-surface sweep listed above
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- GitHub required checks on the PR
- `npm run verify:pre-merge`

## Manual QA / Review

No browser QA or screenshot handoff is required because this is Markdown-only documentation with no rendered UI, print, layout, or brand change.

Owner review should verify:

- the chapter is understandable without code expertise,
- it does not imply all product features are finished,
- it keeps provider/control-plane facts marked `Unknown / To Verify` unless evidenced,
- it avoids raw secrets, env values, personal data, and generated inventories.

## Risks And Mitigations

- Risk: chapter overstates unfinished product areas.
  - Mitigation: keep scope to stack/runtime foundation and use `Unknown / To Verify` for provider/control-plane or live-state facts.
- Risk: chapter becomes a stale dependency inventory.
  - Mitigation: link to `package.json`, `.nvmrc`, and canonical docs instead of copying full tables.
- Risk: docs work delays higher-value product building.
  - Mitigation: execute only this narrow stable chapter, then pause deeper App Knowledge Book generation unless owner approves the next slice.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from the latest checkpoint entry.

## Checkpoint Log

- `2026-05-16 | planning | owner approved Phase 2C Stack and Runtime scope after audit confirmed all existing in-progress briefs require refresh before use; created planned docs-only brief and kept execution gated until explicit owner instruction | next: wait for owner to say execute/build/implement before moving this brief to in-progress and writing 03-stack-and-runtime.md`
- `2026-05-16 | in-progress | owner explicitly requested execution; moved brief to in-progress on branch docs/app-knowledge-stack-runtime and started docs-only implementation for docs/app-knowledge-book/chapters/03-stack-and-runtime.md plus README link | next: finish docs, run support sweep and docs-only validation gates`
- `2026-05-16 | pre-pr-ready | implemented docs/app-knowledge-book/chapters/03-stack-and-runtime.md and README link; targeted sweep for App Knowledge Book / Stack and Runtime / Phase 2C / 03-stack-and-runtime / docs/system-state / Unknown / To Verify found docs-scope references only; validation PASS: Prettier write, git diff --cached --check, npm run lint:briefs:all, and npm run verify:pre-pr docs-only lane | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge readiness`
