# Task Brief: App Knowledge Book Phase 1 - Repo Audit And Documentation Architecture (10/10)

## Metadata

- `id`: `2026-05-07-app-knowledge-book-phase-1-repo-audit-and-doc-architecture-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-07`

## Draft Status

This brief is a draft planning artifact until execution starts. Before implementation, the owner and assistant must review and finalize scope, output structure, acceptance criteria, validation gates, scorecard targets, and execution order. Move the brief to `in-progress` only after that final pre-start review is complete.

## Goal

Create the Phase 1 foundation for a complete FreeSwimming.org App Knowledge Book and living documentation system, based only on the actual repository, so the owner can review the documentation strategy before any large-scale book generation starts.

## Why This Brief Exists

The owner wants to move from non-programmer/non-architect toward confident technical ownership of the app. The final knowledge system should explain what the app does, how the stack works, how critical flows connect, how to develop/test/deploy/debug/secure/maintain it, and how future documentation stays current as the repository changes.

The full requested documentation system is intentionally large. This brief is only Phase 1: create the repo audit, documentation architecture, proposed structure, quality checklist, diagram plan, living-doc workflow, and unknowns/risk list. It must stop before generating the full book so the owner can review organization, naming, scope, and generation strategy.

## Required Phase 1 Outputs

Create exactly these first-phase source documents:

- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/app-knowledge-book/README.md`
- `docs/app-knowledge-book/quality-checklist.md`
- `docs/app-knowledge-book/proposed-structure.md`
- `docs/app-knowledge-book/proposed-diagrams.md`
- `docs/app-knowledge-book/living-documentation-plan.md`
- `docs/app-knowledge-book/unknowns-and-risks.md`

Do not create the full Phase 2+ book chapters yet. Do not create generated `docs/system-state/*` files yet unless the owner explicitly approves Phase 2.

## Required Audit Rule

Base all findings on repository evidence. Do not infer product behavior, external control-plane configuration, production data shape, or provider settings unless visible in repo files or explicitly provided by the owner during the workstream.

Use the exact phrase `Unknown / To Verify` for any item that cannot be confirmed from the repository.

## Proposed Phase 1 Content Requirements

### `00-repo-audit.md`

Must audit and summarize, with exact repo paths where possible:

- tech stack, frameworks, libraries, services, infrastructure,
- database and Supabase usage,
- authentication and authorization surfaces,
- payments and entitlement surfaces,
- video/content delivery surfaces,
- testing tools and CI/CD,
- deployment and Vercel surfaces,
- environment variable names without values,
- scripts and config files,
- folder structure,
- main user flows and business logic,
- main risks, technical debt, and unknowns.

### `README.md`

Must be the navigation hub for the future knowledge book:

- table of contents for Phase 1 and proposed future phases,
- reading order,
- learning order,
- “start here” paths for new owner, debugging, deploying, payments, auth, course/video/progress,
- clear warning that Phase 1 is an audit/architecture plan, not the full book.

### `quality-checklist.md`

Must define the quality bar for future App Knowledge Book chapters:

- accuracy and repo evidence requirements,
- beginner clarity requirements,
- technical depth requirements,
- exact-path traceability requirements,
- security/no-secrets requirements,
- diagram usefulness requirements,
- living-doc freshness requirements,
- required `Unknown / To Verify` handling,
- acceptance checklist for each future chapter.

### `proposed-structure.md`

Must propose the complete final documentation structure:

- stable book chapters,
- dynamic system-state docs,
- generated vs manual docs,
- phase breakdown,
- estimated size/scope per section,
- suggested generation order,
- duplication-avoidance rules.

### `proposed-diagrams.md`

Must list proposed Mermaid/C4-style diagrams:

- system context,
- containers,
- important component maps,
- request lifecycle,
- frontend/backend/data flow,
- auth flow,
- Stripe checkout/webhook/entitlement flow,
- video/content access flow,
- course/progress flow,
- CI/CD and deployment,
- debugging/error flow.

Mark each as `Phase 1 evidence known`, `Partially known`, or `Unknown / To Verify`.

### `living-documentation-plan.md`

Must design the long-term documentation maintenance strategy:

- stable vs dynamic docs,
- manual vs generated docs,
- change triggers,
- when not to regenerate,
- freshness checks,
- GitHub Actions recommendations,
- route/dependency/env/API/component/test/database inventories,
- future developer maintenance workflow,
- anti-drift and anti-duplication policy.

### `unknowns-and-risks.md`

Must collect open questions and risks:

- unknown provider/control-plane facts,
- unverified production behavior,
- stale documentation risks,
- large-doc scope risks,
- owner learning risks,
- security/privacy risks of documentation,
- recommended review decisions before Phase 2.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this Phase 1 brief:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Content governance`
- `Security and authz`
- `Privacy and compliance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                        | Evidence                                                                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Future documentation IA exists with clear Phase 1 vs Phase 2+ boundaries, owner reading paths, and chapter navigation.                                                | `README.md` + `proposed-structure.md`                                                                 | `5/5`                   |
| UX flow clarity                               | `target`     | Owner-facing docs explain where to start for learning, debugging, deploying, payments, auth, and course/video/progress without requiring code knowledge.              | `README.md` start-here sections                                                                       | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this brief creates Markdown documentation only and does not change UI, layout, print, brand, or screenshots.                                              | Scope review confirms docs-only diff                                                                  | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Repo audit separates confirmed facts from `Unknown / To Verify`; no external behavior is asserted without repo evidence or owner-provided evidence.                   | `00-repo-audit.md` + `unknowns-and-risks.md`                                                          | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin/content operations are inventoried where repo evidence exists, but no admin UI workflow changes are made.                                      | `00-repo-audit.md`                                                                                    | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this brief does not change rendered UI or interactive behavior.                                                                                           | Docs-only diff review                                                                                 | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: Phase 1 should identify existing performance tooling/docs and avoid adding heavy generated artifacts.                                                | `00-repo-audit.md` + `living-documentation-plan.md`                                                   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Living-doc plan distinguishes stable manual docs from dynamic generated system-state docs and defines update ownership for routes, env vars, APIs, tests, and schema. | `living-documentation-plan.md` + `proposed-structure.md`                                              | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: repo audit notes any observed caching/revalidation surfaces and marks unknowns; no cache behavior changes are made.                                  | `00-repo-audit.md`                                                                                    | `4/5`                   |
| Reliability and failure handling              | `target`     | Docs plan includes stale-doc failure modes, anti-drift checks, unknown handling, and review gates before future generated docs are expanded.                          | `quality-checklist.md` + `living-documentation-plan.md` + `unknowns-and-risks.md`                     | `5/5`                   |
| Security and authz                            | `target`     | Phase 1 documents security/authz surfaces at inventory level without exposing secrets, and defines no-secret rules for future documentation.                          | `00-repo-audit.md` + `quality-checklist.md` + `unknowns-and-risks.md`                                 | `5/5`                   |
| Privacy and compliance                        | `target`     | Phase 1 identifies privacy/GDPR documentation needs and forbids raw env values, tokens, request IPs, cookies, or user data in docs.                                   | `quality-checklist.md` + `unknowns-and-risks.md`                                                      | `5/5`                   |
| Content governance                            | `target`     | Documentation source-of-truth model is explicit, version-controlled, incremental, and duplication-aware.                                                              | `living-documentation-plan.md` + `proposed-structure.md`                                              | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin/content file surfaces are identified when visible in repo; no admin workflow behavior changes are made.                                        | `00-repo-audit.md`                                                                                    | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public route/metadata/sitemap docs are inventoried if visible; no route metadata changes are made.                                                   | `00-repo-audit.md`                                                                                    | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: future docs can help AI/human discoverability inside repo, but no public AI/crawl surface changes are made.                                          | `proposed-structure.md`                                                                               | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: repo audit records analytics/KPI surfaces where visible and marks unknowns.                                                                          | `00-repo-audit.md` + `unknowns-and-risks.md`                                                          | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Stripe/payment/entitlement surfaces are inventoried and unknowns are marked; no commerce behavior changes are made.                                  | `00-repo-audit.md` + `unknowns-and-risks.md`                                                          | `4/5`                   |
| Incident response and support operations      | `target`     | Phase 1 maps existing ops/runbook evidence and defines how future knowledge docs should point to support/debugging sources without duplicating stale content.         | `00-repo-audit.md` + `living-documentation-plan.md` + `README.md`                                     | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: finance/reporting relevance is limited to identifying payment/revenue docs needs; no finance workflow behavior or reporting logic changes are made.  | `00-repo-audit.md` + explicit scope note in `unknowns-and-risks.md`                                   | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: Phase 1 should identify whether i18n readiness appears in docs/code and mark gaps; it does not implement locale routing or translation workflows.    | `00-repo-audit.md` + `unknowns-and-risks.md`                                                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Phase 1 uses Markdown only, does not add dependencies, and proposes stack-native incremental docs generation before any tooling additions.                            | Diff review + `living-documentation-plan.md`                                                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Phase 1 defines docs validation gates and passes docs-only verification, brief lint, and relevant generated/body lint.                                                | `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run verify:pre-pr`, `npm run verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Proposed living-doc system avoids blind full regeneration and defines incremental update rules to keep docs useful without high token/tooling cost.                   | `living-documentation-plan.md` + `proposed-structure.md`                                              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Phase 1 documents future docs CI/freshness checks and remains docs-only with simple rollback via commit revert.                                                       | `living-documentation-plan.md` + PR evidence                                                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

Impacted stack surfaces:

- Documentation architecture:
  - use Markdown as source of truth,
  - separate stable explanatory docs from dynamic system-state docs,
  - prefer repo-native scripts/checks later before adding new documentation tooling.
- Next.js/React:
  - audit route/component surfaces only; do not change runtime code,
  - identify server/client boundaries only where visible in repo.
- TypeScript/domain contracts:
  - audit types, validation, and domain invariants by exact file path where practical,
  - do not modify contracts in Phase 1.
- Supabase/data layer:
  - inventory schema/migration/RLS/auth/data-access surfaces from repo files,
  - mark production/control-plane facts as `Unknown / To Verify` unless evidence exists.
- External services:
  - inventory Stripe, Vercel, Supabase, Upstash, email, video/content, and analytics surfaces from repo files only,
  - never record secret values.
- Testing:
  - use docs-only lane for this Phase 1 diff,
  - propose future docs freshness/check scripts, but do not add scripts until owner approves Phase 2 tooling.

## Data Placement And Sync Contract

This is a documentation workstream, not a stateful product feature.

- Server-canonical data:
  - N/A for Phase 1 runtime behavior; no app data ownership changes.
- Local data:
  - N/A for Phase 1 runtime behavior; no browser/device storage changes.
- Documentation source of truth:
  - stable docs live under `docs/app-knowledge-book/`,
  - future dynamic inventories should live under `docs/system-state/`,
  - all docs are version-controlled Markdown.
- Sync policy:
  - Phase 1 must propose update triggers and future freshness checks,
  - no generated docs sync is implemented until owner approves later phases.
- Retention and sensitivity:
  - no secrets, raw env values, request IPs, cookies, auth headers, provider tokens, or personal data may be stored.
- Cache/invalidation:
  - N/A for runtime cache; future docs freshness policy must define when inventories are regenerated.

## Identity And Rename Contract

N/A for runtime entities because Phase 1 does not create or modify persisted app entities, slugs, route params, database rows, or user-visible identifiers.

Documentation identity contract:

- Stable chapter file paths should be treated as durable references after owner approval.
- Proposed paths may still be renamed during Phase 1 review before full book generation.
- Future generated `docs/system-state/*` files should have stable names so PR diffs are easy to review.

## Scope

In scope:

- Create the seven Phase 1 files under `docs/app-knowledge-book/`.
- Audit actual repo files and document findings with exact paths.
- Propose final book structure, diagram list, living-doc workflow, and quality checklist.
- Capture unknowns and risks explicitly.
- Keep all generated content non-sensitive and reviewable.

## Out Of Scope

- Full App Knowledge Book chapter generation beyond Phase 1.
- Any runtime feature, UI, API, database, auth, payment, or deployment behavior change.
- Creating `docs/system-state/*` inventories before owner approves Phase 2.
- Adding new dependencies, scripts, workflows, or docs-site/PDF tooling.
- Copying raw secrets, env values, tokens, cookies, request IPs, provider responses, or personal data into docs.
- Claiming production/control-plane facts that are not visible in repo evidence or owner-provided evidence.

## Acceptance Criteria

1. The seven Phase 1 files exist and clearly state that Phase 1 stops before full book generation.
2. `00-repo-audit.md` covers the requested audit areas with exact repo paths where practical and `Unknown / To Verify` where evidence is missing.
3. `README.md` gives owner-friendly navigation, reading order, learning order, and start-here paths.
4. `quality-checklist.md` defines measurable quality gates for future chapters.
5. `proposed-structure.md` separates stable docs from dynamic system-state docs and estimates scope/size/generation order.
6. `proposed-diagrams.md` lists proposed diagrams and marks evidence confidence for each.
7. `living-documentation-plan.md` defines manual vs automatic docs, update triggers, anti-drift checks, when not to regenerate, and future GitHub Actions recommendations.
8. `unknowns-and-risks.md` captures repo, product, control-plane, security, privacy, stale-doc, and scope risks.
9. No secret values or sensitive operational details are added.
10. The owner can review and approve/revise documentation architecture before Phase 2 begins.

## Validation

Docs-only Phase 1 diff should pass:

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

If Phase 2 later adds scripts/workflows/tooling, that later phase must use the full non-docs validation lane.

## Local Tooling Prerequisite

- Node.js LTS and npm must be available.
- Use repo `nvm` bootstrap before reporting missing Node/npm.
- This Phase 1 brief is docs-only; no dev server or browser screenshot handoff is required.

## Manual QA Environments

N/A for Phase 1 because no UI/runtime behavior changes. Owner review happens by reading the generated Markdown files in the PR.

## Help/Guide Impact

N/A for Phase 1 because no app Help/Guide content, user workflow labels, admin actions, or recovery behavior changes. The brief may link to existing Help/Guide/runbook surfaces discovered during audit without modifying them.

## Route, Label, And Support-Surface Impact Sweep

Required as an audit-only sweep:

- inspect `app/`, `components/`, `lib/`, `tests/`, `.github/`, `scripts/`, `docs/runbooks/`, and relevant task briefs for route/support-surface evidence,
- record findings as documentation inventory,
- do not rename or remove any route, label, support surface, or runbook in Phase 1.

## Execution Notes

- Start from clean `main`.
- Create a branch for Phase 1.
- Keep commits docs-only.
- Run docs-only validation before PR.
- PR body must emphasize that this is an audit/architecture plan and not the full knowledge book.
- Stop after Phase 1 PR handoff; do not generate Phase 2+ content until owner approves structure, scope, architecture, organization, documentation strategy, naming, and chapter breakdown.

## Checkpoint Log

- 2026-05-07 | brief-created | Phase 1 brief created from owner request for App Knowledge Book and living documentation system | next: wait for explicit `execute` before creating Phase 1 docs
