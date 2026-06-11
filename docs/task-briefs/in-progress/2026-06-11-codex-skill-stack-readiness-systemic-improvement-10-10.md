# Task Brief: Codex Skill + Stack Readiness Systemic Improvement (10/10)

## Metadata

- `id`: `2026-06-11-codex-skill-stack-readiness-systemic-improvement-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `execution_mode`: `docs-governance-only-until-owner-executes`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: branch `codex-skill-stack-readiness-radar` from clean synced `main@92ef28b1` after PR `#1085` and repo-managed closeout PR `#1086`
- `audit_status`: `ready`
- `decision`: Use this as a bounded governance/tooling child before selecting the next product/runtime child; do not install skills, change runtime code, or start app implementation until the owner explicitly executes this brief.
- `reason`: The current session identified that Codex can work better when skills, plugins, official-doc lookup triggers, stack-surface audits, and systemic improvement radar are explicit and repeatable instead of remembered only in chat. The workout commercial analytics parent is clean with no active/planned child, so this governance slice can safely preserve the return path.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, `docs/task-brief-template.md`, `docs/quality/platform-10-10-scorecard.md`, Codex skill/plugin availability, local `.codex` skill layout, Stripe/OpenAI/Vercel/Playwright tooling, repo verification scripts, screenshot rules, route/label/support sweep rules, sandbox approval guidance, or the workout commercial analytics parent status changes.

## Goal

Create a durable repo-governance mechanism that makes Codex audit relevant skills, plugins, current official docs, stack best practices, and systemic app-improvement opportunities before future work, while turning findings into bounded briefs instead of unscoped product changes.

## Pre-Implementation Owner Explanation

Vi lager en plan for hvordan Codex skal jobbe smartere med appen over tid: hvilke skills/verktøy som finnes, når de skal brukes, hvordan nye relevante capabilities oppdages, og hvordan hele stacken sjekkes systematisk for forbedringer. Dette er viktig fordi appen da kan forbedres jevnt og trygt uten at vi mister retning eller gjør tilfeldige endringer. Utenfor scope er runtime-kode, UI-endringer, dependency-oppgraderinger, skill-installasjon, nye tjenester og produktendringer uten en egen godkjent child-brief.

Forward-compatibility intent: nye skills, plugins, stack-versjoner, offisielle docs, produktflater, workflows og kvalitetskrav skal kunne plukkes opp gjennom en datert audit-loop. Nye funn skal enten bli trygge docs/process-oppdateringer, eksplisitte bounded child-briefs, eller bevisst `do not do` med begrunnelse.

## Current Capability Audit Snapshot

Session-available skills and plugins found in this chat:

- `imagegen`: bitmap generation/editing when visual assets are needed.
- `openai-docs`: official OpenAI/Codex/API documentation lookup.
- `plugin-creator`: local Codex plugin scaffolding.
- `skill-creator`: local Codex skill creation/update guidance.
- `skill-installer`: installing curated or repo-hosted Codex skills.
- `playwright`: real-browser automation, UI debugging, screenshots, data extraction.
- `stripe:stripe-best-practices`: Stripe integration design/review.
- `stripe:upgrade-stripe`: Stripe SDK/API version upgrade guidance.

Local filesystem evidence:

- Installed skill files:
  - `/Users/stianvikra/.codex/skills/playwright/SKILL.md`
  - `/Users/stianvikra/.codex/skills/.system/imagegen/SKILL.md`
  - `/Users/stianvikra/.codex/skills/.system/openai-docs/SKILL.md`
  - `/Users/stianvikra/.codex/skills/.system/plugin-creator/SKILL.md`
  - `/Users/stianvikra/.codex/skills/.system/skill-creator/SKILL.md`
  - `/Users/stianvikra/.codex/skills/.system/skill-installer/SKILL.md`
  - `/Users/stianvikra/.codex/plugins/cache/openai-curated/stripe/2abb1c44/skills/stripe-best-practices/SKILL.md`
  - `/Users/stianvikra/.codex/plugins/cache/openai-curated/stripe/2abb1c44/skills/upgrade-stripe/SKILL.md`
- Curated skill cache timestamp: `2026-05-05T05:47:01.719Z` from `/Users/stianvikra/.codex/vendor_imports/skills-curated-cache.json`.
- Codex manual helper was run through `openai-docs` during execution; the updated manual outline confirmed the relevant durable surfaces: Agent Skills, AGENTS.md, approvals/security, plugins, permissions, and governance.
- Repo-relevant curated install candidates to evaluate before any install:
  - `security-best-practices`
  - `security-threat-model`
  - `security-ownership-map`
  - `gh-fix-ci`
  - `pdf`
  - `screenshot`
  - `vercel-deploy`
  - `openai-docs`
  - `playwright`

Installation boundary:

- This brief may document recommendations and exact decision criteria.
- This brief must not modify `/Users/stianvikra/.codex`, install skills, enable plugins, add MCP servers, or change local Codex configuration unless the owner gives an explicit separate install/config approval during execution.
- If install/config is approved, record what changed, why, rollback path, and how future chats should verify availability.

Required skill/plugin install decision table:

| Candidate | Current Status                                                 | Decision                                                            | Trigger / Use Case            | Fallback If Not Installed       | Rollback / Removal Note                            |
| --------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------- | ------------------------------- | -------------------------------------------------- |
| `<id>`    | one of `available`, `installed`, `missing`, `stale`, `blocked` | one of `install now`, `evaluate later`, `do not install`, `blocked` | exact repo-relevant task type | repo runbook/tool/manual method | how to disable/remove or verify no repo dependency |

Decision rules:

- `install now`: only when the owner explicitly approves local Codex config changes and the skill materially improves a recurring repo workflow.
- `evaluate later`: promising, but not needed for the current slice or not yet proven.
- `do not install`: not relevant to Freeswimming, duplicates existing workflow, or creates avoidable risk/noise.
- `blocked`: requires credentials, local tool support, licensing, provider access, network access, or owner decision.

## Systemic App Improvement Loop

The implemented governance must make Codex run a lightweight radar before selecting broad future work and a deeper radar when a workstream touches critical surfaces.

Required classification for every finding:

- `safe process/docs update`: can be fixed in the active governance/docs slice.
- `bounded implementation child`: needs its own planned/in-progress task brief before code changes.
- `deferred architecture decision`: needs owner/product decision before implementation.
- `do not do`: not relevant, too risky, not worth cost, or conflicts with app strategy.

Required audit output table:

| Surface                        | Finding                         | Severity                                           | Recommended Type                                                                                                 | Owner Decision Needed | Follow-Up Brief Path                               |
| ------------------------------ | ------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------- |
| `<stack/app/workflow surface>` | concise evidence-backed finding | one of `critical`, `high`, `medium`, `low`, `info` | one of `safe process/docs update`, `bounded implementation child`, `deferred architecture decision`, `do not do` | `yes/no + reason`     | planned path, `N/A`, or `TBD after owner decision` |

Prioritization rule:

- Recommend at most three next improvements per audit handoff.
- Sort first by security/privacy/data integrity/revenue risk, then by user/admin workflow friction, then by developer velocity/tooling leverage.
- Record lower-priority findings as `deferred architecture decision` or `do not do` instead of expanding the active slice.
- A high-severity finding may interrupt normal sequencing only when it is security/privacy/data integrity/revenue/support critical and has a bounded fix path.

Required stack-surface checklist:

- React/Next.js App Router composition, server/client boundaries, route/action/API ownership, cache/revalidation.
- TypeScript contracts, validation, error modeling, deterministic invariants, discriminated unions, unknown-value behavior.
- Supabase schema, migrations, RLS/authz, indexes, generated DB types, storage, negative paths.
- Stripe/commerce, official docs, checkout/portal/webhook boundaries, idempotency, retry, secrets, finance separation.
- Vercel/deploy/runtime, env parity, preview/production behavior, logs, rollback.
- Playwright/Vitest/testing, flake risk, negative paths, screenshot artifacts, private gate coverage.
- Tailwind/UI primitives, a11y, responsive behavior, mature reference-surface reuse.
- Analytics/KPI, event taxonomy, first-party source of truth, privacy-safe payloads, dashboard interpretation.
- Security/privacy, fail-closed routes, input validation, least privilege, PII minimization, logs/events.
- Performance/CWV/payload, route budgets, dependency bloat, query cost, image/font impact.
- SEO/AI discoverability, metadata, structured data, sitemap/robots, crawl-safe public content.
- Incident/support, runbooks, diagnostics, support copy, recovery actions.
- Finance/reporting, reconciliation boundaries, exports, refund/payout/invoice/accounting truth.
- i18n readiness, stable machine IDs, copy expansion, locale-safe layouts.
- Docs/runbooks/task-brief template, AGENTS workflow, forward compatibility, sandbox approval cadence.

Cadence:

- Run the lightweight radar when a merge/closeout leaves no active child and the next primary goal changes.
- Run the deeper radar before auth, payments, admin, data, analytics, UI/reference-surface, deploy, or support-heavy work.
- Re-audit curated skills/plugins when the local cache timestamp changes, a new plugin appears, or a capability gap was observed in a recent workstream.
- After two consecutive green baseline performance budget cycles, prompt the owner to tighten one stretch target and record hold/tighten/revert.

Official-doc freshness matrix:

| Surface         | Must Check Current Official Docs When                                                                                                                             | Preferred Source / Skill                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Next.js / React | route behavior, caching, server/client boundaries, metadata, image/font/runtime behavior, or upgrade-sensitive APIs are touched                                   | official Next.js/React docs; browse primary sources if freshness matters                 |
| Supabase        | migrations, RLS/authz, generated types, storage, auth, edge functions, indexes, or database API behavior are touched                                              | official Supabase docs                                                                   |
| Stripe          | checkout, billing portal, subscriptions, webhooks, products/prices, entitlements, invoices, refunds, payouts, SDK/API versions, or finance boundaries are touched | `stripe:stripe-best-practices`, `stripe:upgrade-stripe`, official Stripe docs            |
| Vercel          | deployment, preview/prod behavior, logs, env vars, edge/serverless runtime, build output, redirects, or rollback are touched                                      | official Vercel docs and repo Vercel runbooks                                            |
| Playwright      | browser automation, screenshots, e2e isolation, browser install, traces, or flaky locator/wait behavior are touched                                               | installed `playwright` skill and official Playwright docs when behavior may have changed |
| OpenAI / Codex  | OpenAI APIs, model choice, Codex capabilities, skills/plugins, MCP/tools, or prompt/workflow upgrade guidance are touched                                         | `openai-docs` skill and official OpenAI docs                                             |
| Security/AppSec | authz, input validation, secrets, PII, webhooks, CSRF/origin, dependency risk, or threat-model-sensitive flows are touched                                        | security curated skills where installed/approved plus primary OWASP/provider docs        |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: every canonical category is a `target`, and every target category is critical for the 10/10 claim. This brief cannot close as `10/10` unless every category reaches `5/5` for the docs/governance scope.

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Admin editor ergonomics
- Accessibility (a11y)
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Admin workflow and editability
- SEO and crawlability
- AI discoverability
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping  | Target Threshold / Scope Rationale                                                                                                                                                    | Evidence                                                                                | Expected Closeout Score |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target` | Governance defines when capability/stack findings affect product goals, IA, route purpose, or active parent sequencing, and prevents unselected findings from becoming product scope. | runbook decision tree + return contract + parent-status checkpoint                      | `5/5`                   |
| UX flow clarity                               | `target` | Future UX-impacting findings must become bounded briefs with user-job, loading/empty/error/retry, Help/Guide, and screenshot requirements before UI changes.                          | runbook checklist + task-brief/template update + route/label/support sweep rule         | `5/5`                   |
| Visual design quality                         | `target` | Future visual/layout/brand findings must identify mature reference surfaces, screenshot handoff type, artifact naming, and owner approval stop before PR gates.                       | screenshot-rule integration + UI reference-surface checklist                            | `5/5`                   |
| Business logic correctness and data integrity | `target` | Systemic findings must define invariants, source-of-truth, idempotency, unknown/deprecated handling, and negative-path test ownership before code or data changes.                    | stack radar + brief acceptance criteria + follow-up child classification                | `5/5`                   |
| Admin editor ergonomics                       | `target` | Admin-edit findings must require click-path, state, publish/recovery, audit, and Help/Guide impact checks before any admin workflow change.                                           | admin workflow checklist + route/label/support sweep requirement                        | `5/5`                   |
| Accessibility (a11y)                          | `target` | UI findings must require keyboard/focus/label/semantics/contrast checks and no serious/critical accessibility regressions on changed surfaces.                                        | UI/a11y checklist + screenshot/manual QA handoff rule                                   | `5/5`                   |
| Performance (CWV + payloads)                  | `target` | Stack radar must preserve route-level CWV/payload budgets, dependency-growth review, and performance ratchet prompts after consecutive green cycles.                                  | performance checklist + ratchet cadence + validation plan                               | `5/5`                   |
| Data placement and sync boundaries            | `target` | The governance must separate repo-canonical docs, local Codex capabilities, server-canonical app data, local-only UI state, and future sync/conflict decisions.                       | data placement contract + follow-up child template requirements                         | `5/5`                   |
| Caching and invalidation strategy             | `target` | Any future cache-sensitive finding must require route/data cache mode, invalidation trigger, freshness guarantee, stale state, and rollback notes before implementation.              | stack radar checklist + brief/template acceptance criteria                              | `5/5`                   |
| Reliability and failure handling              | `target` | Capability/stack findings must include failure modes, retry/repair/support behavior, and no unexpected `500` expectation for protected or provider paths.                             | incident/support checklist + negative-path follow-up rules                              | `5/5`                   |
| Security and authz                            | `target` | Security-relevant findings must use security skills/docs where relevant, require fail-closed authz/input validation, and produce negative-path tests or a blocked decision.           | security skill trigger matrix + AppSec classification + validation rules                | `5/5`                   |
| Privacy and compliance                        | `target` | Radar must require PII/secrets/log/event/export review and data-minimization boundaries for analytics, support, commerce, PDFs, screenshots, and AI/tooling contexts.                 | privacy checklist + forbidden-data criteria + support/export review                     | `5/5`                   |
| Content governance                            | `target` | Repo docs, AGENTS, templates, runbooks, and parent/child continuity must have clear ownership, lifecycle, stale-audit triggers, and rollback path.                                    | changed docs + lint:briefs + checkpoint log                                             | `5/5`                   |
| Admin workflow and editability                | `target` | Admin workflow findings must be route/label/support-swept and cannot alter actions, labels, recovery paths, or editability without a bounded child and tests.                         | admin workflow gate + Help/Guide impact rule                                            | `5/5`                   |
| SEO and crawlability                          | `target` | Public-route findings must require metadata/sitemap/robots/canonical/structured-data impact review before route or copy changes.                                                      | SEO/AI discoverability checklist + follow-up child criteria                             | `5/5`                   |
| AI discoverability                            | `target` | Public content and docs findings must check entity clarity, crawl-safe structure, canonical links, and AI-readable semantics without leaking private/support-only content.            | AI discoverability checklist + route/content governance rules                           | `5/5`                   |
| Analytics and KPI observability               | `target` | Analytics findings must preserve first-party event taxonomy, safe payloads, dashboardability, interpretation caveats, and explicit vendor deferral/activation decisions.              | analytics/KPI checklist + event/source-of-truth requirements                            | `5/5`                   |
| Commerce and revenue ops                      | `target` | Commerce findings must use Stripe best-practice capability when relevant and keep checkout, entitlement, provider, finance, and analytics truth layers separate.                      | Stripe skill trigger matrix + finance separation checklist                              | `5/5`                   |
| Incident response and support operations      | `target` | Critical-flow findings must identify support diagnostics, runbook impact, owner/manual steps, failure copy, escalation path, and recovery evidence.                                   | incident/support checklist + runbook update criteria                                    | `5/5`                   |
| Finance and reporting operations              | `target` | Revenue/reporting findings must state reconciliation source-of-truth and forbid treating analytics/admin counts as finance truth without a finance-grade child.                       | finance/reporting checklist + commerce boundary criteria                                | `5/5`                   |
| i18n operational readiness                    | `target` | Future labels/copy/status/routes must distinguish locale-independent IDs from display strings and identify translation/layout risks before hardcoding assumptions.                    | i18n checklist + identity/rename contract                                               | `5/5`                   |
| Stack-fit and dependency discipline           | `target` | Governance must prefer existing stack/native patterns, official docs, mature repo surfaces, and explicit no-new-dependency/default decisions for every future finding.                | stack-surface audit + dependency decision matrix + official-doc lookup triggers         | `5/5`                   |
| Testing and QA automation                     | `target` | The docs-governance implementation must pass brief lint/docs-only gates; future findings must specify targeted unit/integration/e2e/screenshot/negative-path evidence.                | `npm run lint:briefs`, `lint:briefs:all`, `verify:docs-only`, `verify:pre-pr/pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `target` | Radar must detect costly joins, vendors, exports, dashboards, storage, screenshots/PDFs, logs, and dependency/runtime bloat before implementation.                                    | cost-efficiency checklist + follow-up classification                                    | `5/5`                   |
| DevOps and rollback readiness                 | `target` | Governance/tooling changes must be revertable docs-only unless explicitly approved; future deploy/config/migration findings must define rollback and verification path.               | rollback section + branch/PR/CI/preflight workflow                                      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

Impacted stack surfaces for this governance slice:

- React/Next.js:
  - No runtime route, component, layout, action, or API change is in scope for the governance implementation.
  - Future UI findings must identify the mature reference surface first, reuse shared view-models/components where possible, and define server/client and cache boundaries before implementation.
- TypeScript/domain contracts:
  - No TypeScript runtime contract changes are in scope unless a later approved child explicitly owns them.
  - Future type/model findings must define canonical types, validation, deterministic invariants, unknown-value behavior, and negative tests.
- Supabase/data layer:
  - No migrations, RLS changes, storage changes, generated DB types, or data backfills are in scope.
  - Future data findings require explicit migration, RLS/authz, indexes, generated types, and negative-path tests.
- External services/tools:
  - Use official docs/SDK guidance when facts may be current or provider-specific.
  - Stripe work must load/review Stripe skills.
  - OpenAI/API/Codex capability work must load/review `openai-docs` where relevant.
  - CI failure work should evaluate `gh-fix-ci`.
  - PDF/export work should evaluate `pdf`.
  - Vercel deploy/runtime work should evaluate `vercel-deploy` and repo Vercel runbooks.
  - Security work should evaluate `security-best-practices`, `security-threat-model`, and `security-ownership-map`.
- UI system:
  - No visible UI change is in scope.
  - Future UI findings require screenshot handoff and owner visual approval unless explicitly waived by AGENTS.
- Testing:
  - This governance slice is docs-only and must pass brief lint/docs-only verification.
  - Future child briefs must name targeted automated and manual evidence for the touched surface.

If the correct architecture improvement is larger than this slice, execution must create or reference a dated follow-up brief instead of expanding this governance PR.

## Data Placement And Sync Contract

- Repo-canonical data:
  - `AGENTS.md`, `docs/task-brief-template.md`, the new/updated runbook(s), and this task brief are the durable source of truth for the workflow.
- Local Codex capability state:
  - Installed skills/plugins under `/Users/stianvikra/.codex` are local machine state, not app state and not guaranteed across chats or machines.
  - Repo docs may record how to audit/verify them, but cannot guarantee availability.
- Server-canonical app data:
  - No app database, Supabase, auth, analytics, entitlement, checkout, finance, or admin data changes are in scope.
- Local/browser app data:
  - No browser storage, cookies, client analytics identity, offline buffers, or user preferences are touched.
- Sync policy:
  - Governance docs are versioned in git.
  - Local Codex skills/plugins must be re-audited from filesystem/tool metadata at execution/resume time.
- Retention and sensitivity:
  - Do not store secrets, raw env values, auth tokens, private session logs, customer data, or raw provider payloads in repo docs.
- Cache/invalidation:
  - No runtime cache is changed.
  - The audit is stale when local skill cache, plugin availability, repo instructions, or provider docs change.

## Identity And Rename Contract

- Canonical stable IDs:
  - Skill IDs are their `name`/directory IDs, for example `playwright`, `openai-docs`, `security-best-practices`, `gh-fix-ci`, and `stripe-best-practices`.
  - Repo workflow IDs are file paths such as `AGENTS.md`, `docs/task-brief-template.md`, and runbook paths.
  - Stack-surface IDs are the scorecard category names and checklist labels in this brief.
- Human-readable identifiers:
  - Display names like "Skill Readiness", "Systemic App Improvement", and "Stack Radar" are renameable labels.
- Mutability rules:
  - Skill IDs and file paths should not be silently repurposed.
  - If a skill description changes materially, future audits must treat the prior recommendation as stale.
- Rename vs repurpose:
  - Renaming a display label is allowed when the trigger behavior and scope are unchanged.
  - Using a skill for a different domain than its trigger or using a stack finding to justify unrelated product work is repurpose and requires owner approval plus a new brief.
- Compatibility contract:
  - Unknown future skills/plugins are classified as `evaluate`, not assumed safe.
  - Deprecated or missing skills fall back to repo-native runbooks, official docs, and ordinary tool use.
- Observability and repair:
  - Execution must record audited skill availability and any missing/blocked capability in the checkpoint log or PR summary.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Future Codex skills, plugins, MCP tools, provider docs, stack versions, dependencies, routes, products, entitlements, workflow states, admin surfaces, analytics payloads, export formats, locales, deployment providers, and runbooks.
- Source of truth:
  - Skill/plugin availability comes from the current session tool metadata and local `.codex` filesystem evidence.
  - Repo process truth comes from AGENTS, task-brief template, scorecard, and runbooks.
  - App behavior truth remains in code/tests/database/contracts owned by future bounded child briefs.
- Additive behavior:
  - New skills/plugins should be discoverable by the audit loop and classified before use.
  - New stack surfaces should be added to the checklist or mapped to existing categories.
  - New product/workflow/app findings should become bounded briefs instead of expanding active work.
- Explicit mapping requirements:
  - New provider-specific behavior, SDK upgrades, security workflows, CI tools, Vercel/runtime operations, PDF/export paths, Figma/design workflows, Notion/Linear/project tools, finance exports, or localized content require explicit owner-approved mapping before activation.
- Unknown or deprecated values:
  - Unknown skills/plugins default to `evaluate/blocked`, not automatic use.
  - Deprecated provider docs or stale cache timestamps require current official docs or explicit stale-evidence warning.
  - Unknown app labels/routes/products/statuses use safe fallback rules from the active feature brief, not this governance slice.
- Test/evidence:
  - Governance implementation must include a deterministic audit checklist and at least one example classification table.
  - Changed docs must pass `npm run lint:briefs`, `npm run lint:briefs:all`, and docs-only verification before PR.

## Scope

- Create or update a durable runbook for Codex skill/plugin/capability readiness and systemic stack improvement radar.
- Update repo workflow docs only where necessary so future agents know when to run the radar and how to classify findings.
- Record the current session skill/plugin audit and relevant curated candidates as dated evidence.
- Add a return contract so this governance slice can hand control back to the workout commercial analytics parent without losing thread.
- Define install/config approval boundaries for local Codex skills/plugins.
- Define how future skill/stack findings become bounded task briefs.

Expected files for execution:

- This brief moved from `planned/` to `in-progress/`, then `done/` after merge/closeout.
- New runbook:
  - `docs/runbooks/codex-skill-stack-readiness-radar.md`
- Targeted updates:
  - `AGENTS.md`
  - `docs/task-brief-template.md`
  - `docs/runbooks/codex-sandbox-approval-cadence.md`
  - `docs/runbooks/pr-flow-and-chat-handoff.md`
  - `docs/runbooks/task-brief-audit-gate.md`
  - `docs/runbooks/maintenance-cadence.md`

Execution note: if `docs/runbooks/codex-sandbox-approval-cadence.md` or `docs/runbooks/pr-flow-and-chat-handoff.md` do not need text changes after the new radar is linked elsewhere, leave them unchanged and record the reason in the checkpoint log.

## Out Of Scope

- Runtime app code, UI, routes, API handlers, migrations, tests, workflows, package scripts, dependencies, or provider integrations unless a future approved child owns them.
- Installing, uninstalling, enabling, or configuring Codex skills/plugins/MCP servers without explicit separate owner approval.
- Upgrading Next.js, React, TypeScript, Supabase, Stripe, Vercel, Playwright, Vitest, Tailwind, or other dependencies.
- Reworking current product priorities or selecting the next workout commercial analytics child.
- Adding third-party analytics, Sentry, Figma, Notion, Linear, Vercel plugin workflows, finance exports, or PDF automation merely because a skill exists.
- Rewriting historical done briefs except where repo-managed closeout/lint requires a targeted lifecycle fix.

## Acceptance Criteria

1. A durable runbook defines the skill/plugin/capability audit workflow with trigger points, evidence sources, current audited capabilities, candidate skills, install boundaries, and fallback behavior.
2. The runbook defines the systemic stack improvement radar across all scorecard categories and core stack surfaces.
3. Findings are classified into `safe process/docs update`, `bounded implementation child`, `deferred architecture decision`, or `do not do`.
4. The runbook defines the required audit output table with surface, finding, severity, recommended type, owner-decision need, and follow-up path.
5. The runbook limits audit handoff recommendations to the top three next improvements, with security/privacy/data integrity/revenue risk prioritized first.
6. The runbook defines an official-doc freshness matrix for Next/React, Supabase, Stripe, Vercel, Playwright, OpenAI/Codex, and security-sensitive work.
7. The runbook defines a skill/plugin install decision table with `install now`, `evaluate later`, `do not install`, and `blocked` outcomes.
8. Repo workflow docs are updated only where needed so future agents run the radar before major new work and after merge/closeout when no active child remains.
9. The implementation records that local Codex capability state is machine-local and must be re-audited in future chats.
10. Any skill/plugin installation remains blocked unless the owner explicitly approves that external local config change.
11. The brief includes a return contract to the workout commercial analytics parent and preserves its current status: no active/planned child selected.
12. All platform scorecard categories are target categories with expected `5/5` closeout scores for the docs-governance scope.
13. Changed briefs pass `npm run lint:briefs`; the full brief set passes `npm run lint:briefs:all`.
14. Before PR, docs-only verification passes; before merge, `npm run verify:pre-merge` passes.

## Validation

For brief creation/update before execution approval:

- `npm run lint:briefs`
- `npm run lint:briefs:all`

For execution PR:

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:docs-only`
- `npm run verify:pre-pr`
- PR CI required checks
- `npm run verify:pre-merge`
- `npm run post-merge:preflight` after merge

Docs-only lane is expected if execution touches only `AGENTS.md`, `docs/**`, and task brief lifecycle files. Any script/package/test/config/workflow/runtime change requires full-lane validation and must be explicitly justified in the active brief before implementation.

## Route, Label, Support, And Help/Guide Impact

- No app routes, user labels, admin labels, workflow actions, Help/Guide content, or support copy change in the docs-only governance scope unless execution discovers a direct workflow-doc reference that must be updated.
- If execution changes AGENTS/runbooks/template language that affects manual UI/GitHub handoff, sandbox approval, screenshot handoff, or support workflow behavior, run a targeted `rg` sweep across `AGENTS.md`, `docs/runbooks/`, `docs/task-brief-template.md`, active/planned briefs, and PR-flow docs.
- If a future child changes Help/Guide assertions, user/admin labels, recovery behavior, or support diagnostics, that child owns the Help/Guide update or explicit `N/A` rationale.

## Risk And Rollback

- Primary risk: over-broad process rules slow down normal product work.
  - Mitigation: keep the radar lightweight by default and require deeper audit only for high-risk surfaces.
- Primary risk: skill availability is mistaken for a product decision.
  - Mitigation: classify skill use separately from app scope and require owner-approved child briefs for runtime changes.
- Primary risk: local Codex skill state is documented as if it were repo state.
  - Mitigation: label all `.codex` evidence as local machine evidence and require re-audit on resume.
- Rollback:
  - Revert the docs-only PR; no runtime, schema, provider, dependency, or local skill install should be required by default.

## Execution Handoff Contract

- Mode when owner says `execute child-briefen`: automation-first docs/governance implementation.
- Move this brief to `docs/task-briefs/in-progress/`.
- Create a branch from clean `main`.
- Keep scope to docs/governance unless the owner explicitly approves a separate skill install/config step.
- Run targeted validation after edits.
- Run `npm run verify:pre-pr` before PR.
- Open/update PR in Safari via repo flow.
- Monitor CI.
- Run `npm run verify:pre-merge` before merge recommendation.
- Do not merge without explicit owner merge approval, except for one repo-managed docs-only closeout after an explicitly approved workstream merge if `post-merge:preflight` surfaces it.

## Return Contract / Session Continuity

After this brief is created, executed, merged, or paused, return to:

- Parent: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Current parent status at creation: no active child and no planned child selected.
- Last merged workstream before this brief: PR `#1085` (`6ca0e50d`) plus closeout PR `#1086` (`92ef28b1`).
- Next product planning action after this governance slice: reopen the parent, re-audit current base, and propose one bounded child before any checkout completion, entitlement, provider/webhook, support diagnostics, dashboard, direct checkout, Stripe, finance, export, vendor, raw drilldown, migration, RLS, pricing, route, shop, or builder/generator runtime work.

Resume prompt after this brief is done or deferred:

```text
Fortsett i /Users/stianvikra/freeswimming. Folg AGENTS.md.

Status:
- main er ren og synket etter Codex Skill + Stack Readiness governance-slicen.
- Reopen parent: docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md
- Ingen aktiv/planned workout commercial analytics child er valgt med mindre parent sier noe annet.

Start med:
1. git status -sb
2. git log --oneline -n 10
3. reopen parent brief
4. bli i planmodus og foresla neste bounded child; ikke implementer uten eksplisitt godkjenning.
```

## Checkpoint Log

- `2026-06-11 | planned | created planned governance brief from clean main@92ef28b1 after PR #1085 and closeout PR #1086; records current Codex skill/plugin audit, curated candidate set, systemic stack radar, strict all-category 10/10 target mapping, install/config boundary, and return contract to workout commercial analytics parent | next: wait for owner approval to execute or request scope edits`
- `2026-06-11 | planned audit update | added mandatory audit output table, top-three prioritization rule, official-doc freshness matrix, and skill/plugin install decision table so execution can produce bounded, comparable findings instead of broad process prose | next: wait for owner approval to execute or request scope edits`
- `2026-06-11 | in-progress | owner requested execution; moved brief to in-progress on branch codex-skill-stack-readiness-radar, ran openai-docs Codex manual helper after sandbox DNS failure with owner-approved network escalation, and confirmed skills/plugins/AGENTS/approvals/permissions/governance manual sections before editing docs | next: complete runbook/doc links and docs-only validation`
- `2026-06-11 | in-progress implementation | added docs/runbooks/codex-skill-stack-readiness-radar.md and linked it from AGENTS.md, task-brief-template, task-brief-audit-gate, and maintenance-cadence; left sandbox-approval and PR-flow runbooks unchanged because they already contain the needed approval/handoff rules and are referenced by the new radar/AGENTS path | next: run route/support sweep, brief lint, docs-only gates, then commit/push/PR`
- `2026-06-11 | validation | route/support and skill/stack sweeps passed; git diff --cached --check passed; npm run lint:briefs skipped because the changed active brief is staged as a newly added in-progress file, so npm run lint:briefs:all was run and passed for all 477 briefs; npm run verify:docs-only passed with log artifacts/test-runs/20260611-214953/verify.log | next: run npm run verify:pre-pr, commit, push, and open PR`
- `2026-06-11 | pre-pr validation | npm run verify:pre-pr passed on docs-only lane with log artifacts/test-runs/20260611-215141/verify.log; branch-current confirmed codex-skill-stack-readiness-radar contains origin/main@92ef28b1 | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
