# Task Brief: App Knowledge Book Phase 2B - Product Map (10/10)

## Metadata

- `id`: `2026-05-15-app-knowledge-book-phase-2b-product-map-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-15`
- `updated`: `2026-05-15`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@ac64996`
- `audit_status`: `ready`
- `decision`: Execute this Phase 2B docs-only Product Map slice now.
- `reason`: Owner explicitly requested `execute Product Map` on `2026-05-15`; current `main` is clean after PR `#716` and repo-managed closeout PR `#717`; existing `in-progress` and `planned` briefs were audited first and are all conservative `revise-before-use` candidates, while the App Knowledge Book has a fresh Phase 2A owner overview and `proposed-structure.md` identifies Product Map as the next stable manual chapter.
- `must_refresh_before_execution_if`: Phase 1 or Phase 2A App Knowledge Book docs change, the owner chooses a different Phase 2 priority, scorecard/audit-gate rules change, route labels/support surfaces change, verification lanes change, or implementation starts from a newer `main` after meaningful docs/runtime changes.

## Goal

Create the next owner-readable App Knowledge Book chapter that maps FreeSwimming.org product areas, route groups, audiences, canonical docs, and known unknowns without generating volatile inventories or changing runtime behavior.

## Why This Brief Exists

Phase 2A shipped the first stable owner overview chapter in PR `#716` and was closed out by PR `#717`. The next low-risk slice is a Product Map chapter that helps the owner understand what each product area is for, where it lives, how it connects to existing runbooks/docs, and which facts remain `Unknown / To Verify`.

This brief is intentionally smaller than broad Phase 2 book generation. It validates the second stable chapter shape before adding diagrams, scripts, workflows, generated `docs/system-state/*` inventories, or deeper provider/control-plane documentation.

## Execution Mode

- `plan approved`: owner approved this Product Map scope on `2026-05-15`.
- `implementation gate`: do not write `02-product-map.md` until the owner explicitly says `execute`, `build`, or `implement`.
- `automation-first after execution approval`: once execution starts, follow AGENTS.md end to end for a docs-only workstream: move this brief to `in-progress`, implement scoped docs, validate, commit, push, open/update PR, monitor CI, run pre-merge gate, and summarize merge readiness.

## Scope

Create or update only docs needed for Phase 2B:

- Create `docs/app-knowledge-book/chapters/02-product-map.md`.
- Update `docs/app-knowledge-book/README.md` only enough to link the new chapter and preserve existing reading paths.
- Move this brief from `planned` to `in-progress` when implementation starts.

The Product Map chapter must include:

- the main audience groups: public visitor, signed-in member, admin/editor/viewer, owner/operator, and external providers,
- the main product areas and route groups at owner-readable depth:
  - public/marketing pages,
  - course and learning surfaces,
  - My Library and member training surfaces,
  - workouts, programs, dryland, habits, goals, profile, and progress surfaces,
  - admin workspace and Help/Guide surfaces,
  - commerce, checkout, entitlements, and finance surfaces,
  - contact, messages, support, and incident paths,
  - auth, private gate, preview access, and security-sensitive surfaces,
  - SEO, analytics, i18n, release, and operations surfaces,
- exact repo path references for important claims,
- clear `Unknown / To Verify` markers for provider/control-plane facts not proven by repo evidence,
- a maintenance trigger that says when the Product Map must be updated.

Use evidence from:

- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/app-knowledge-book/chapters/01-owner-overview.md`
- `docs/app-knowledge-book/proposed-structure.md`
- `docs/app-knowledge-book/quality-checklist.md`
- `docs/app-knowledge-book/living-documentation-plan.md`
- `docs/app-knowledge-book/unknowns-and-risks.md`
- existing canonical architecture, route, runbook, testing, release, auth, commerce, support, and domain docs.

## Out Of Scope

- No runtime code changes.
- No UI, print, layout, brand, screenshot, or interactive behavior changes.
- No route additions, removals, redirects, metadata changes, sitemap changes, or robots changes.
- No provider dashboard verification.
- No Supabase migrations, RLS changes, generated DB type changes, or live data inspection.
- No scripts, workflows, dependency updates, package changes, or generated inventories.
- No `docs/system-state/*` files.
- No full Phase 2 book generation.
- No diagrams unless explicitly approved as part of a separate slice.
- No raw secrets, env values, cookies, tokens, request IPs, provider response bodies, personal data, or free-text user content.
- No claims about production provider/control-plane settings unless repo evidence or owner-provided evidence proves them.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this docs-only Product Map slice are every category mapped `target`.

Strict `10/10` mode for this slice:

- every `target` category must close out at `5/5`,
- every `supporting` category must include enough linked evidence to score `5/5` for the limited docs-only support role,
- `N/A` is limited to categories that cannot be changed by Markdown-only documentation.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                        | Evidence                                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Product Map explains each major product area, route group, audience, and owner job without requiring code expertise.                                      | `02-product-map.md` structure + README link                               | `5/5`                   |
| UX flow clarity                               | `target`     | Chapter gives clear owner reading paths from product area to route docs, runbooks, tests, and safe-change guidance.                                       | chapter sections + exact path references                                  | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this Markdown-only slice does not change rendered UI, layout, typography, color, screenshots, print, or brand assets.                         | docs-only diff review                                                     | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Chapter separates shipped repo-proven behavior from planned/unknown facts and does not describe future features as live product behavior.                 | evidence citations + `Unknown / To Verify` markers                        | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Product Map names admin workspace areas, Help/Guide, and admin-safe owner paths without duplicating volatile admin runbooks.                              | admin product area section + canonical links                              | `5/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this Markdown-only slice does not change interactive semantics, focus behavior, labels, contrast, or screen-reader flow.                      | docs-only diff review                                                     | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: chapter links to existing performance and verification docs; it does not change route payloads, CWV behavior, or performance budgets.    | links to testing/performance docs                                         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Product Map names owner-level data ownership boundaries for each relevant product area: server-canonical, provider-canonical, local-only, and generated.  | product area data-boundary notes + Phase 1/2A references                  | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: chapter links to cache/auth route contracts where relevant; it does not change cache or revalidation behavior.                           | links to architecture contract docs                                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Chapter routes owner questions to incident, support, auth, contact/message, Supabase, visual-debug, and release runbooks without inventing recovery flow. | support/incident links + no unsupported claims                            | `5/5`                   |
| Security and authz                            | `target`     | Chapter explains which product areas are auth/admin/private-gate sensitive and avoids secrets or overclaims about provider settings.                      | auth/security product areas + no-secret review                            | `5/5`                   |
| Privacy and compliance                        | `target`     | Chapter avoids personal data and links privacy/GDPR/policy docs for real procedures rather than copying examples.                                         | privacy/compliance section + safe examples review                         | `5/5`                   |
| Content governance                            | `target`     | Chapter remains stable manual documentation, links canonical docs instead of duplicating volatile inventories, and documents maintenance trigger.         | chapter maintenance section + README update                               | `5/5`                   |
| Admin workflow and editability                | `target`     | Product Map identifies admin workflow surfaces and states when Help/Guide/runbooks must be updated after label/action/recovery changes.                   | admin workflow section + support-surface sweep                            | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: chapter points to sitemap, robots, metadata, and private-posture surfaces; it does not change public crawl behavior.                     | links to SEO/crawl docs and route paths                                   | `5/5`                   |
| AI discoverability                            | `supporting` | Supporting only: chapter improves human/AI repo navigation but does not change public structured data, crawl policy, or generated AI docs.                | AI discoverability note + scope review                                    | `5/5`                   |
| Analytics and KPI observability               | `target`     | Chapter maps analytics/KPI-related owner surfaces and safe-payload boundaries without adding or changing events.                                          | analytics/KPI product area section + existing docs links                  | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Product Map names commerce, checkout, entitlement, finance, and reconciliation surfaces without asserting live Stripe dashboard facts.                    | commerce/revenue section + `Unknown / To Verify` markers                  | `5/5`                   |
| Incident response and support operations      | `target`     | Chapter gives owner-level paths to support, incident, rollback, and debugging runbooks; no raw logs, messages, or provider responses are copied.          | support/incident section + runbook links                                  | `5/5`                   |
| Finance and reporting operations              | `target`     | Chapter points to finance/reporting and entitlement reconciliation docs and keeps live payout/provider facts `Unknown / To Verify` unless evidenced.      | finance section + unknown markers                                         | `5/5`                   |
| i18n operational readiness                    | `target`     | Chapter states current single-language product posture and links i18n readiness docs without claiming multilingual operations are shipped.                | i18n section + existing decision/checklist links                          | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Diff remains Markdown-only, uses existing App Knowledge Book structure, adds no dependency/tooling, and follows Phase 1 quality checklist.                | changed-files diff + checklist review                                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief and docs pass brief lint plus docs-only verification before PR update; no skipped validation is hidden.                                     | `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run verify:pre-pr` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Product Map stays concise, links canonical docs instead of duplicating large route tables, and keeps generated inventories deferred.                      | chapter length/reviewability check + no generated inventory diff          | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only rollback remains normal git revert; chapter links release/verification/post-merge docs and does not modify release tooling.                     | rollback/release section + docs-only diff review                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no app route, component, server/client, cache, or revalidation behavior changes.
  - route claims must cite exact paths under `app/` or existing route docs.
- TypeScript/domain contracts:
  - no TypeScript contracts or runtime invariants change.
  - documentation claims must cite exact repo paths instead of inferring behavior from task-brief intent.
- Supabase/data layer:
  - no migrations, RLS changes, generated type updates, or live data inspection.
  - mark live row counts, backup proof, and provider settings as `Unknown / To Verify` unless owner-provided evidence exists.
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

- Stable chapter path: `docs/app-knowledge-book/chapters/02-product-map.md`.
- Human-readable title may be edited for clarity, but the numbered chapter path should remain stable once shipped.
- If Phase 2 chapter structure changes materially later, update README links and chapter references in the same PR.

## Help / Guide Impact

N/A for admin Help/Guide runtime content because this docs-only slice does not change admin labels, actions, recovery behavior, or user/admin workflow behavior.

The Product Map may link to Help/Guide and runbooks, but it must not redefine those workflows.

## Route / Label / Support Surface Impact Sweep

Before execution closeout, run a targeted repo sweep for:

- `App Knowledge Book`
- `Product Map`
- `Phase 2B`
- `02-product-map`
- `docs/system-state`
- `Unknown / To Verify`

Any changed route, label, Help/Guide, support, or runbook behavior discovered during the sweep must either be excluded from this docs-only slice or captured as a separate follow-up brief.

## Acceptance Criteria

1. Brief is approved and moved to `in-progress` only when implementation starts.
2. `02-product-map.md` exists and is owner-readable without code expertise.
3. The chapter maps product areas to exact repo paths and canonical docs.
4. The chapter uses `Unknown / To Verify` for external/control-plane facts not proven by repo evidence.
5. README links the new chapter without removing existing Phase 1 and Phase 2A reading paths.
6. No generated inventories, scripts, workflows, runtime code, UI, schema, provider, config, route, sitemap, metadata, or robots files are changed.
7. Changed docs pass brief lint and docs-only verification gates before PR update.

## Validation

Planning-only brief creation:

- `npm run lint:briefs`

After execution approval and docs implementation:

- `git diff --check`
- targeted support-surface sweep named above
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

Docs-only lane is expected while the diff remains Markdown documentation under `docs/`.

## Manual QA

N/A because this slice does not change rendered UI, browser behavior, print/export output, routes, or screenshots.

Owner review should focus on whether the chapter is understandable, accurate, useful, and correctly scoped as the product map after the owner overview.

## Checkpoint Log

- `2026-05-15 | planning | existing in-progress and planned briefs audited first; Product Map selected as the next low-risk App Knowledge Book slice after PR #716 and repo-managed closeout PR #717; planned brief created to lock docs-only scope before implementation | next: wait for explicit execute/build/implement before moving brief to in-progress and writing the chapter`
- `2026-05-15 | main@ac64996 | execution started after owner said "execute Product Map"; branch docs/app-knowledge-product-map created and brief moved to in-progress while keeping the scope docs-only with no runtime, UI, scripts, workflows, schema, provider, route, sitemap, metadata, robots, or generated-inventory changes | next: write Product Map chapter, update README link, run targeted support-surface sweep and docs-only validation`
- `2026-05-15 | working tree | Product Map chapter implemented at docs/app-knowledge-book/chapters/02-product-map.md and README linked it as the second stable chapter; targeted support-surface sweep for App Knowledge Book / Product Map / Phase 2B / 02-product-map / docs/system-state / Unknown / To Verify found docs-scope references only; npm run lint:briefs:all PASS | next: run staged diff check, commit, run npm run verify:pre-pr, then push/open PR if the docs-only gate stays green`
