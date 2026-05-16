# Task Brief: App Knowledge Book Phase 2D - Auth, Access, And Private Gate (10/10)

## Metadata

- `id`: `2026-05-16-app-knowledge-book-phase-2d-auth-access-private-gate-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-16`
- `updated`: `2026-05-16`

## Brief Audit Record

- `last_audited`: `2026-05-16`
- `base`: `main@c6b8e2b`
- `audit_status`: `ready`
- `decision`: Execute this Phase 2D docs-only Auth, Access, and Private Gate slice now.
- `reason`: Owner explicitly requested `execute Phase 2D` on `2026-05-16`; current `main` is clean after PR `#722` and repo-managed closeout PR `#723`; all existing `in-progress` briefs remain `revise-before-use`; the App Knowledge Book has three fresh stable chapters, and the next Phase 2 recommendation is auth/access/private gate. Repo evidence is sufficient for a stable owner-readable chapter through `lib/auth/*`, `lib/admin/access.ts`, `lib/site-lock/*`, `app/auth/**`, `app/preview-access/**`, `docs/runbooks/private-access-gate.md`, `docs/runbooks/auth-account-support.md`, and `docs/architecture/data-access-authz-cache-contract-registry.md`.
- `must_refresh_before_execution_if`: App Knowledge Book Phase 1/2 docs change, auth/admin/private-gate routes or labels change, `lib/auth/*`, `lib/admin/access.ts`, `lib/site-lock/*`, Supabase auth helpers, route auth/cache registry, private-gate runbooks, scorecard/audit-gate rules, verification lanes, or support surfaces change, or implementation starts from a newer `main` after meaningful docs/runtime changes.

## Goal

Create an owner-readable Auth, Access, and Private Gate chapter that explains current sign-in, session, admin access, preview access, site lock, dev bypass, support, and safety boundaries without documenting future auth work as shipped.

## Why This Brief Exists

The App Knowledge Book should be useful while the product is still evolving, but only for stable facts and operational principles. Auth and access control are high-risk enough that the owner benefits from a clear current map now.

This slice also turns the owner's maintenance concern into a durable chapter contract: every stable App Knowledge Book chapter should include both `Maintenance Trigger` and `Known Future Refresh Points`, so future PRs know when docs must be improved later.

## Execution Mode

- `plan approved`: owner approved planned-brief creation on `2026-05-16`.
- `execution approved`: owner explicitly requested execution on `2026-05-16`.
- `automation-first`: follow AGENTS.md end to end for a docs-only workstream: implement scoped docs, validate, commit, push, open/update PR, monitor CI, run pre-merge gate, and summarize merge readiness.

## Scope

Create or update only App Knowledge Book docs needed for Phase 2D:

- Create `docs/app-knowledge-book/chapters/04-auth-access-and-private-gate.md`.
- Update `docs/app-knowledge-book/README.md` only enough to link the new chapter and preserve reading paths.
- Update `docs/app-knowledge-book/quality-checklist.md` so future stable chapters require both:
  - `Maintenance Trigger`,
  - `Known Future Refresh Points`.
- Add or normalize short `Known Future Refresh Points` sections in:
  - `docs/app-knowledge-book/chapters/01-owner-overview.md`,
  - `docs/app-knowledge-book/chapters/02-product-map.md`,
  - `docs/app-knowledge-book/chapters/03-stack-and-runtime.md`,
  - new `04-auth-access-and-private-gate.md`.
- Move this brief from `planned` to `in-progress` when implementation starts.

The new Auth, Access, and Private Gate chapter must include:

- what auth/access protects and why it matters to the owner,
- current user sign-in and Supabase session boundary,
- current admin role and allowlist resolution at owner-readable depth,
- private/site-lock and preview-access behavior,
- site-lock bypass token and password safety rules without raw values,
- dev auth bypass as local/test tooling, not production user access,
- route/API auth class references from the data-access registry,
- support and incident paths for sign-in, admin access, and private-gate failures,
- current `Unknown / To Verify` facts for provider/control-plane auth settings,
- what is intentionally not live yet, including passkeys, broad user management, and tester-access controls unless later evidence proves otherwise,
- `Maintenance Trigger`,
- `Known Future Refresh Points`.

Use evidence from:

- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/app-knowledge-book/chapters/01-owner-overview.md`
- `docs/app-knowledge-book/chapters/02-product-map.md`
- `docs/app-knowledge-book/chapters/03-stack-and-runtime.md`
- `docs/app-knowledge-book/proposed-structure.md`
- `docs/app-knowledge-book/quality-checklist.md`
- `docs/app-knowledge-book/living-documentation-plan.md`
- `docs/app-knowledge-book/unknowns-and-risks.md`
- `docs/architecture/data-access-authz-cache-contract-registry.md`
- `docs/architecture/external-service-contract-matrix.md`
- `docs/runbooks/private-access-gate.md`
- `docs/runbooks/auth-account-support.md`
- `docs/runbooks/site-lock-operations.md`
- `docs/testing-strategy.md`
- `app/auth/**`
- `app/preview-access/**`
- `app/admin/layout.tsx`
- `lib/auth/**`
- `lib/admin/access.ts`
- `lib/admin/server.ts`
- `lib/site-lock/**`
- `lib/supabase/**`

## Out Of Scope

- No runtime code changes.
- No UI, print, layout, brand, screenshot, or interactive behavior changes.
- No route additions, removals, redirects, metadata changes, sitemap changes, robots changes, or site-lock behavior changes.
- No auth provider configuration changes.
- No Supabase migrations, RLS changes, generated DB type changes, or live data inspection.
- No provider dashboard verification.
- No scripts, workflows, dependency updates, package changes, or generated inventories.
- No `docs/system-state/*` files.
- No passkey implementation, account-management redesign, admin-user-management implementation, tester-access implementation, or private-gate removal.
- No raw secrets, env values, cookies, tokens, request IPs, provider response bodies, personal data, sign-in codes, or user free-text content.
- No claims about production provider/control-plane settings unless repo evidence or owner-provided evidence proves them.

## Now Versus Later Documentation Contract

Do now:

- Document stable current principles, paths, ownership boundaries, and verification paths.
- Mark provider dashboards, live auth settings, live row counts, and production control-plane facts as `Unknown / To Verify`.
- Add `Known Future Refresh Points` so planned auth/access work is visible without being described as shipped.

Wait until later:

- Generated inventories for routes, APIs, env names, migrations, tests, scripts, dependencies, or workflows.
- Detailed provider dashboard facts from Supabase, Vercel, Stripe, email, or Upstash.
- Any claim that passkeys, broad user management, test-user access, or final public launch posture is complete before it is shipped and evidenced.

## Known Future Refresh Points

The Phase 2D chapter and existing stable chapters should be refreshed when any of these ship:

- Admin user management foundation or admin test-user access controls.
- Real passkeys, Clerk/passkey migration, or any account recovery model change.
- Site-lock/private-gate removal, launch posture change, or password/bypass behavior change.
- Supabase auth provider setting changes that are owner-verified.
- Admin role source changes, allowlist policy changes, or `profiles.role` semantics change.
- Route auth/cache registry updates that change public, optional-identity, protected-user, entitlement, admin, service-role, or dev-only route classes.
- Auth support copy, sign-in recovery behavior, incident alerts, or Help/Guide access guidance changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this docs-only Auth, Access, and Private Gate slice are every category mapped `target`.

Strict `10/10` mode for this slice:

- every `target` category must close out at `5/5`,
- every `supporting` category must include enough linked evidence to score `5/5` for the limited docs-only support role,
- `N/A` is limited to categories that cannot be changed by Markdown-only documentation.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                    | Evidence                                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Chapter explains auth/access/private-gate purpose, audiences, protected surfaces, and owner starting paths without code expertise.                    | `04-auth-access-and-private-gate.md` structure + README link              | `5/5`                   |
| UX flow clarity                               | `target`     | Chapter gives clear owner paths for sign-in, preview access, admin access, support, and safe-change questions.                                        | chapter sections + exact path references                                  | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this Markdown-only slice does not change rendered UI, layout, typography, color, screenshots, print, or brand assets.                     | docs-only diff review                                                     | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Chapter separates current repo-proven behavior from planned/unknown auth/provider facts and does not describe future access features as shipped.      | evidence citations + `Unknown / To Verify` markers                        | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Chapter explains admin role levels and where admin access/support docs live without changing admin workflows.                                         | admin access section + canonical links                                    | `5/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this Markdown-only slice does not change interactive semantics, focus behavior, labels, contrast, or screen-reader flow.                  | docs-only diff review                                                     | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: private-gate and auth verification/perf docs are linked without changing route payloads, budgets, or CWV behavior.                   | testing/perf/private-gate links                                           | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Chapter names auth/session/admin-role/site-lock documentation boundaries and distinguishes server, provider, cookie/local, and generated-doc state.   | data-boundary section + source references                                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Chapter links auth/cache route contracts and describes owner-readable freshness boundaries without changing cache behavior.                           | data-access authz/cache registry links                                    | `5/5`                   |
| Reliability and failure handling              | `target`     | Chapter routes sign-in, preview unlock, admin access, and private-gate failures to existing support/runbook paths without inventing recovery flow.    | support/incident/runbook references                                       | `5/5`                   |
| Security and authz                            | `target`     | Chapter explains fail-closed auth/admin/private-gate boundaries and secret-handling rules with no raw values or tokens.                               | no-secret review + security/auth path references                          | `5/5`                   |
| Privacy and compliance                        | `target`     | Chapter avoids personal data and sign-in codes, and links support/privacy docs instead of copying sensitive examples.                                 | privacy/safe-example review + runbook links                               | `5/5`                   |
| Content governance                            | `target`     | Stable chapter remains manual and evidence-linked; checklist now requires `Maintenance Trigger` and `Known Future Refresh Points`.                    | quality-checklist update + chapter sections                               | `5/5`                   |
| Admin workflow and editability                | `target`     | Chapter identifies access-related admin workflow/support update triggers without changing Help/Guide or admin labels.                                 | admin/support section + Help/Guide impact rationale                       | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: private-gate robots/sitemap posture is linked without changing public crawl behavior.                                                | links to sitemap/robots/private-gate docs                                 | `5/5`                   |
| AI discoverability                            | `supporting` | Supporting only: chapter improves human/AI repo navigation without changing public structured data, crawl policy, or generated AI docs.               | App Knowledge Book links + no runtime diff                                | `5/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: auth/access incident and support paths are linked without adding or changing events.                                                 | incident/support docs links + no instrumentation diff                     | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: entitlement and billing access boundaries may be referenced, but no checkout, portal, catalog, invoice, or Stripe behavior changes.  | commerce/auth boundary links + explicit scope rationale                   | `5/5`                   |
| Incident response and support operations      | `target`     | Chapter gives owner-level paths to sign-in, preview, admin access, private gate, incident, and support runbooks without raw logs/provider responses.  | runbook links + no raw-log review                                         | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: billing access and entitlement identity boundaries may be linked; no finance/reporting flows or provider facts change.               | finance/commerce references + explicit scope rationale                    | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: auth/access copy stays single-language and locale-extensible; no locale routing or translated content changes.                       | i18n/readiness references + explicit scope rationale                      | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Diff remains Markdown-only, uses existing App Knowledge Book structure, adds no dependency/tooling, and documents stack-native auth/access contracts. | changed-files diff + checklist review                                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief and docs pass brief lint plus docs-only verification before PR update; no skipped validation is hidden.                                 | `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run verify:pre-pr` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Chapter stays concise, links canonical docs instead of creating volatile inventories, and uses refresh points to avoid stale large docs.              | chapter length/reviewability check + no generated inventory diff          | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only rollback remains normal git revert; private-gate/release verification docs are linked and release tooling is unchanged.                     | rollback/release section + docs-only diff review                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no app route, component, server/client, cache, metadata, sitemap, robots, or revalidation behavior changes.
  - chapter claims must cite exact paths such as `app/auth/**`, `app/preview-access/**`, `app/admin/layout.tsx`, and route/cache docs.
- TypeScript/domain contracts:
  - no TypeScript contracts or runtime invariants change.
  - documentation claims must cite exact repo paths instead of inferring behavior from task-brief intent.
- Supabase/data layer:
  - no migrations, RLS changes, generated type updates, or live data inspection.
  - mark live auth provider settings, live RLS state, row counts, backup proof, and project settings as `Unknown / To Verify` unless owner-provided evidence exists.
- External services/tools:
  - no provider dashboard reads, SDK/config changes, webhook changes, or env changes.
  - record env variable names only when needed; never values.
- UI system:
  - no rendered UI changes and no screenshot handoff required.
- Testing:
  - docs-only validation with brief lint, targeted support-surface sweep, and pre-PR/pre-merge gates after execution approval.

## Data Placement And Sync Contract

N/A for runtime state because this slice creates Markdown documentation only.

Documentation state boundaries:

- Server-canonical app data remains unchanged.
- Provider-canonical state remains `Unknown / To Verify` unless evidenced.
- Cookie/session behavior remains unchanged and is documented only at owner-readable depth.
- Local-only app/browser state remains out of scope except as documentation of existing dev/test helpers.
- The chapter is stable manual documentation under git.
- Volatile generated inventories remain deferred and must not be created in this slice.

## Identity And Rename Contract

N/A for persisted product entities because this slice creates documentation only and does not create or mutate users, routes, slugs, database rows, notes, workouts, programs, commerce entities, or provider records.

Documentation identity:

- Stable chapter path: `docs/app-knowledge-book/chapters/04-auth-access-and-private-gate.md`.
- Human-readable title may be edited for clarity, but the numbered chapter path should remain stable once shipped.
- If Phase 2 chapter structure changes materially later, update README links and chapter references in the same PR.

## Help / Guide Impact

N/A for admin Help/Guide runtime content because this docs-only slice does not change admin labels, actions, recovery behavior, or user/admin workflow behavior.

The Auth, Access, and Private Gate chapter may link to Help/Guide, runbooks, and admin-support docs, but it must not redefine those workflows.

## Route / Label / Support Surface Impact Sweep

Before execution closeout, run a targeted repo sweep for:

- `App Knowledge Book`
- `Auth, Access`
- `Auth Access`
- `Private Gate`
- `Private Access`
- `Phase 2D`
- `04-auth-access-and-private-gate`
- `Maintenance Trigger`
- `Known Future Refresh Points`
- `docs/system-state`
- `Unknown / To Verify`

Any changed route, label, Help/Guide, support, runbook, config, script, workflow, or runtime behavior discovered during the sweep must either be excluded from this docs-only slice or captured as a separate follow-up brief.

## Acceptance Criteria

1. Brief is approved and moved to `in-progress` only when implementation starts.
2. `04-auth-access-and-private-gate.md` exists and is owner-readable without code expertise.
3. The chapter explains current auth, admin access, preview access, private gate, dev bypass, and support boundaries using exact repo paths and canonical docs.
4. The chapter distinguishes current shipped behavior from planned passkey, tester-access, user-management, and launch-posture work.
5. The chapter uses `Unknown / To Verify` for external/control-plane facts not proven by repo evidence.
6. README links the new chapter without removing existing Phase 1, Phase 2A, Phase 2B, or Phase 2C reading paths.
7. Quality checklist and stable chapters 01-04 include or require both `Maintenance Trigger` and `Known Future Refresh Points`.
8. No generated inventories, scripts, workflows, runtime code, UI, schema, provider, config, route, sitemap, metadata, robots, package, dependency, or lockfile files are changed.
9. Changed docs pass brief lint and docs-only verification gates before PR update.

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
- it does not imply passkeys, broad user management, tester access, or final launch posture are shipped,
- it keeps provider/control-plane facts marked `Unknown / To Verify` unless evidenced,
- it avoids raw secrets, env values, sign-in codes, personal data, provider responses, and generated inventories,
- existing chapters have clear future-refresh guidance.

## Risks And Mitigations

- Risk: chapter overstates auth/provider state.
  - Mitigation: use repo evidence only and mark provider/control-plane facts `Unknown / To Verify`.
- Risk: chapter becomes stale as access work ships.
  - Mitigation: require `Known Future Refresh Points` in this and existing stable chapters.
- Risk: auth docs accidentally reveal sensitive operational values.
  - Mitigation: record env names and behavior only, never raw values, tokens, codes, cookies, logs, or provider responses.
- Risk: docs work delays higher-value product building.
  - Mitigation: keep this Phase 2D slice docs-only and stop generated inventories until explicitly approved.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from the latest checkpoint entry.

## Checkpoint Log

- `2026-05-16 | planning | owner approved creating this planned Phase 2D brief and asked to make chapter maintainability explicit now instead of waiting; scope keeps implementation gated and adds the rule that stable chapters need both Maintenance Trigger and Known Future Refresh Points | next: wait for owner to say execute/build/implement before moving this brief to in-progress and writing 04-auth-access-and-private-gate.md`
- `2026-05-16 | in-progress | owner explicitly requested execution; moved brief to in-progress on branch docs/app-knowledge-auth-access-private-gate and started docs-only implementation for docs/app-knowledge-book/chapters/04-auth-access-and-private-gate.md plus README/checklist/chapter refresh-point updates | next: finish docs, run support sweep and docs-only validation gates`
- `2026-05-16 | pre-pr-ready | implemented docs/app-knowledge-book/chapters/04-auth-access-and-private-gate.md, README link, quality-checklist refresh-point rule, and Known Future Refresh Points in chapters 01-03; targeted support-surface sweep for App Knowledge Book / Auth Access / Private Gate / Phase 2D / 04-auth-access-and-private-gate / Maintenance Trigger / Known Future Refresh Points / docs/system-state / Unknown To Verify found docs-scope references only; validation PASS: Prettier write, git diff --check, targeted brief lint, npm run lint:briefs:all, and npm run verify:pre-pr docs-only lane | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge readiness`
