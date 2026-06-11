# Codex Skill + Stack Readiness Radar

## Purpose

Use this runbook to make Codex capability choices and systemic app-improvement findings explicit,
bounded, and repeatable.

The radar answers three questions:

1. Which Codex skills, plugins, MCP tools, browser tools, or repo runbooks should be used for this
   kind of work?
2. Which stack surfaces should be checked before the next implementation slice?
3. Which findings deserve immediate docs/process changes, a bounded child brief, an owner decision,
   or no action?

This runbook prevents two failure modes:

- relying on chat memory for skills, plugins, approvals, or stack lessons,
- expanding a product/runtime slice just because a new tool or improvement idea was discovered.

## When To Run

Run the lightweight radar when:

- a merge/closeout leaves no active child and the next primary goal changes,
- a new parent or child brief is being created,
- a planned brief is being refreshed before execution,
- a workstream depends on local Codex capabilities, plugins, or provider docs,
- a repeated CI, screenshot, approval, or debugging pattern should become durable process.

For repeated local approval, screenshot/browser, stuck-check, process-cleanup, or generated-artifact
friction, use `docs/runbooks/codex-local-automation-friction-defaults.md` as the dedicated decision
ladder before creating broader process rules.

Run the deeper radar before work touching:

- auth, payments, entitlements, finance, or checkout,
- admin workflow, support diagnostics, Help/Guide, or recovery paths,
- persisted data, migrations, RLS, generated DB types, analytics events, or exports,
- UI/reference surfaces, screenshots, PDF/image output, or accessibility,
- deployment, Vercel, CI, branch protection, performance budgets, or rollback,
- new dependencies, external services, SDKs, MCP servers, or plugins.

## Source Hierarchy

Use the narrowest current source that can answer the question.

1. Current session tool/skill metadata for what Codex can use right now.
2. Local filesystem evidence for installed skills/plugins, for example `.codex/skills`,
   `.codex/plugins`, or curated cache files.
3. Repo rules: `AGENTS.md`, task brief template, scorecard, and runbooks.
4. Official provider docs for current provider behavior.
5. Bounded uncertainty when the current source cannot establish a claim.

For Codex-specific durable rules, prefer the current Codex manual or official OpenAI docs when
available. Treat local `.codex` state as machine-local evidence, not repo state.

## Capability Inventory

Record what is available before recommending tool use.

| Capability            | Evidence                 | Current Status                                             | Recommended Trigger | Boundary                     |
| --------------------- | ------------------------ | ---------------------------------------------------------- | ------------------- | ---------------------------- |
| `<skill/plugin/tool>` | session metadata or path | `available`, `installed`, `missing`, `stale`, or `blocked` | exact task type     | what it must not be used for |

Current Freeswimming baseline from the 2026-06-11 audit:

| Capability                     | Evidence                                              | Current Status | Recommended Trigger                                                 | Boundary                                                    |
| ------------------------------ | ----------------------------------------------------- | -------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| `playwright`                   | `/Users/stianvikra/.codex/skills/playwright/SKILL.md` | `installed`    | browser automation, UI debugging, screenshot/data extraction        | does not replace repo screenshot handoff rules              |
| `imagegen`                     | system skill metadata                                 | `available`    | bitmap asset generation/editing when app visuals need raster assets | not for SVG/code-native assets or existing icon systems     |
| `openai-docs`                  | system skill metadata + Codex manual helper           | `available`    | OpenAI/Codex/API/model/docs questions                               | official OpenAI sources only for fallback browsing          |
| `skill-creator`                | system skill metadata                                 | `available`    | create or update a Codex skill                                      | not for ordinary repo docs unless a skill is being authored |
| `skill-installer`              | system skill metadata                                 | `available`    | install curated or repo-hosted skills after owner approval          | must not install without explicit approval                  |
| `plugin-creator`               | system skill metadata                                 | `available`    | scaffold local Codex plugins                                        | not for ordinary app plugins or runtime integrations        |
| `stripe:stripe-best-practices` | Stripe plugin skill                                   | `available`    | Stripe integration design/review                                    | does not prove live provider state alone                    |
| `stripe:upgrade-stripe`        | Stripe plugin skill                                   | `available`    | Stripe SDK/API upgrades                                             | upgrade work still needs a bounded brief                    |

## Skill / Plugin Install Decision Table

Do not install local Codex capabilities just because they exist. Use this table before any install,
enable, disable, MCP setup, or plugin config change.

| Candidate | Current Status                                                 | Decision                                                            | Trigger / Use Case            | Fallback If Not Installed       | Rollback / Removal Note                            |
| --------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------- | ------------------------------- | -------------------------------------------------- |
| `<id>`    | one of `available`, `installed`, `missing`, `stale`, `blocked` | one of `install now`, `evaluate later`, `do not install`, `blocked` | exact repo-relevant task type | repo runbook/tool/manual method | how to disable/remove or verify no repo dependency |

Decision meanings:

- `install now`: owner explicitly approved a local Codex config change and the capability materially
  improves a recurring repo workflow.
- `evaluate later`: relevant but not needed for the active slice.
- `do not install`: irrelevant, duplicative, risky, or not worth the context/tooling cost.
- `blocked`: requires credentials, local tool support, licensing, provider access, network access,
  or owner decision.

Repo-relevant candidates to evaluate before install:

| Candidate                 | Default Decision | Why                                                                               |
| ------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| `security-best-practices` | `evaluate later` | Useful for explicit security reviews of TypeScript/JavaScript paths.              |
| `security-threat-model`   | `evaluate later` | Useful before auth, checkout, webhook, entitlement, admin, or data-boundary work. |
| `security-ownership-map`  | `evaluate later` | Useful only for security-oriented ownership/bus-factor audits.                    |
| `gh-fix-ci`               | `evaluate later` | Useful when GitHub Actions checks fail and root-cause log inspection is needed.   |
| `pdf`                     | `evaluate later` | Useful when rendered PDF/export layout matters.                                   |
| `screenshot`              | `evaluate later` | Useful as OS-level fallback; repo Playwright screenshot path remains default.     |
| `vercel-deploy`           | `evaluate later` | Useful for deployment actions; normal repo PR/preview flow remains canonical.     |

## Official-Doc Freshness Matrix

Current provider behavior can change. Check current official docs when a touched surface depends on
provider or framework behavior.

| Surface           | Must Check Current Official Docs When                                                                                                                             | Preferred Source / Skill                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Next.js / React   | route behavior, caching, server/client boundaries, metadata, image/font/runtime behavior, or upgrade-sensitive APIs are touched                                   | official Next.js/React docs; primary sources only                                        |
| Supabase          | migrations, RLS/authz, generated types, storage, auth, edge functions, indexes, or database API behavior are touched                                              | official Supabase docs                                                                   |
| Stripe            | checkout, Billing Portal, subscriptions, webhooks, products/prices, entitlements, invoices, refunds, payouts, SDK/API versions, or finance boundaries are touched | `stripe:stripe-best-practices`, `stripe:upgrade-stripe`, official Stripe docs            |
| Vercel            | deployment, preview/prod behavior, logs, env vars, edge/serverless runtime, build output, redirects, or rollback are touched                                      | official Vercel docs and repo Vercel runbooks                                            |
| Playwright        | browser automation, screenshots, e2e isolation, browser install, traces, or flaky locator/wait behavior are touched                                               | installed `playwright` skill and official Playwright docs when behavior may have changed |
| OpenAI / Codex    | OpenAI APIs, model choice, Codex capabilities, skills/plugins, MCP/tools, or workflow guidance are touched                                                        | `openai-docs` skill and official OpenAI docs                                             |
| Security / AppSec | authz, input validation, secrets, PII, webhooks, CSRF/origin, dependency risk, or threat-model-sensitive flows are touched                                        | approved security skills plus primary OWASP/provider docs                                |

## Stack-Surface Radar

Check each relevant surface and classify the finding. Do not turn the checklist into work scope.

- React/Next.js App Router composition, shared view-models, route/action/API boundaries,
  server/client split, cache/revalidation.
- TypeScript contracts, validation, error modeling, deterministic invariants, discriminated unions,
  unknown/deprecated values.
- Supabase schema, migrations, RLS/authz, indexes, generated DB types, storage, negative paths.
- Stripe/commerce, checkout/portal/webhook boundaries, idempotency, retry, secrets, finance
  separation.
- Vercel/deploy/runtime, env parity, preview/production behavior, logs, rollback.
- Playwright/Vitest/testing, flake risk, negative paths, screenshot artifacts, private-gate coverage.
- Tailwind/UI primitives, accessibility, responsive behavior, mature reference-surface reuse.
- Analytics/KPI, event taxonomy, first-party source of truth, privacy-safe payloads, dashboard
  interpretation.
- Security/privacy, fail-closed routes, input validation, least privilege, PII minimization, logs/events.
- Performance/CWV/payload, route budgets, dependency bloat, query cost, image/font impact.
- SEO/AI discoverability, metadata, structured data, sitemap/robots, crawl-safe public content.
- Incident/support, runbooks, diagnostics, support copy, recovery actions.
- Finance/reporting, reconciliation boundaries, exports, refund/payout/invoice/accounting truth.
- i18n readiness, stable machine IDs, copy expansion, locale-safe layouts.
- Docs/runbooks/task-brief template, AGENTS workflow, forward compatibility, sandbox approval cadence.

## Finding Classification

Every finding must use one of these outcomes.

- `safe process/docs update`: safe to fix in the active docs/governance slice.
- `bounded implementation child`: needs a planned/in-progress task brief before code changes.
- `deferred architecture decision`: needs owner/product decision before implementation.
- `do not do`: not relevant, too risky, not worth cost, or conflicts with app strategy.

Required audit output table:

| Surface                        | Finding                         | Severity                                           | Recommended Type                                                                                                 | Owner Decision Needed | Follow-Up Brief Path                               |
| ------------------------------ | ------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------- |
| `<stack/app/workflow surface>` | concise evidence-backed finding | one of `critical`, `high`, `medium`, `low`, `info` | one of `safe process/docs update`, `bounded implementation child`, `deferred architecture decision`, `do not do` | `yes/no + reason`     | planned path, `N/A`, or `TBD after owner decision` |

Prioritization:

- Recommend at most three next improvements per audit handoff.
- Sort by security/privacy/data integrity/revenue risk first.
- Then sort by user/admin workflow friction.
- Then sort by developer velocity/tooling leverage.
- Record lower-priority findings as deferred or do-not-do instead of expanding the active slice.

A high-severity finding may interrupt normal sequencing only when it is security/privacy/data
integrity/revenue/support critical and has a bounded fix path.

## Return Path Requirement

When the radar is run during a feature parent or after a merge/closeout, record the return path:

- parent brief path,
- current active/planned child status,
- last merged PR and closeout PR if relevant,
- exact next planning step after the governance/tooling slice.

For the 2026-06-11 workout commercial analytics interruption, the return path is:

- Parent: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Status at radar creation: no active child and no planned child selected.
- Last merged workstream: PR `#1085` (`6ca0e50d`) and closeout PR `#1086` (`92ef28b1`).
- Next product step: reopen the parent, re-audit current base, and propose one bounded child before
  checkout completion, entitlement, provider/webhook, support diagnostics, dashboard, direct
  checkout, Stripe, finance, export, vendor, raw drilldown, migration, RLS, pricing, route, shop, or
  builder/generator runtime work.

## Handoff Shape

Use this short shape in chat, PR summaries, or brief checkpoints:

```md
Skill/capability audit:

- Available now: <short list>
- Evaluate later: <short list>
- Install/config changes: none unless owner-approved

Systemic findings:
| Surface | Finding | Severity | Recommended Type | Owner Decision Needed | Follow-Up Brief Path |
| ------- | ------- | -------- | ---------------- | --------------------- | -------------------- |
| ... | ... | ... | ... | ... | ... |

Top recommended next step:

- <exact next brief/action>

Return path:

- <parent/path/status>
```

## Validation

For docs/governance radar changes:

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:docs-only`
- `npm run verify:pre-pr`
- PR CI required checks
- `npm run verify:pre-merge`

Any runtime, script, package, workflow, test, config, migration, or provider integration change
requires the full lane and a bounded active brief.
