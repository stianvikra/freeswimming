# App Knowledge Book

## What This Is

This folder is the Phase 1 foundation for a future FreeSwimming.org App Knowledge Book.

Phase 1 is an audit and documentation architecture plan. It is not the full book. It does not claim
production provider settings, control-plane state, or live data unless that evidence exists in the
repository or was explicitly provided by the owner.

Use `Unknown / To Verify` as the boundary marker for facts that need external confirmation.

## Stable Chapters

Read stable owner-facing chapters first when you want a practical explanation rather than an audit.

1. `chapters/01-owner-overview.md`
   - What FreeSwimming.org is, who uses it, where the main surfaces live, what not to change
     casually, how to verify common owner questions, and which facts remain `Unknown / To Verify`.
2. `chapters/02-product-map.md`
   - How the main product areas, audiences, route groups, code paths, canonical docs, and known
     unknowns fit together.
3. `chapters/03-stack-and-runtime.md`
   - The stable technical foundation: framework, runtime, package tooling, config boundaries,
     verification gates, CI/release surfaces, and what remains `Unknown / To Verify`.

## Phase 1 Files

Read in this order:

1. `00-repo-audit.md`
   - What the repo currently contains: stack, routes, data, auth, commerce, admin, testing, ops,
     SEO, performance, i18n, risks, and unknowns.
2. `proposed-structure.md`
   - Proposed final App Knowledge Book structure and phase plan.
3. `quality-checklist.md`
   - Quality bar every future chapter must satisfy.
4. `living-documentation-plan.md`
   - How docs should stay fresh without blind full regeneration.
5. `proposed-diagrams.md`
   - Diagram inventory and evidence confidence.
6. `unknowns-and-risks.md`
   - Decisions and verification items before Phase 2.

## Start Here Paths

For a new owner:

- Start with `chapters/01-owner-overview.md`.
- Then read `chapters/02-product-map.md`.
- Then read `chapters/03-stack-and-runtime.md` when you need the technical foundation.
- Then read `00-repo-audit.md`.
- Then read `proposed-structure.md`.
- Use `quality-checklist.md` before approving any Phase 2 chapter generation.

For debugging:

- Start with `00-repo-audit.md` sections on routes, APIs, testing, admin workflow, and support.
- Then open existing runbooks such as `docs/runbooks/core-flow-incident-response.md`,
  `docs/runbooks/auth-account-support.md`, `docs/runbooks/supabase-egress-response.md`, and
  `docs/runbooks/route-label-support-surface-impact-sweep.md`.

For deployment and release:

- Start with `chapters/03-stack-and-runtime.md`.
- Then use `living-documentation-plan.md`.
- Then use `docs/testing-strategy.md`, `docs/checklists/release-pr-checklist.md`,
  `docs/runbooks/post-merge-local-sync.md`, and the verification scripts listed in `package.json`.

For stack and local runtime:

- Start with `living-documentation-plan.md`.
- Then use `chapters/03-stack-and-runtime.md`, `docs/architecture.md`, `package.json`,
  `.nvmrc`, `next.config.ts`, and `playwright.config.ts`.

For payments, entitlements, and finance:

- Start with the commerce section in `00-repo-audit.md`.
- Then open `docs/architecture/external-service-contract-matrix.md`,
  `docs/checklists/finance-reporting-baseline.md`, and
  `scripts/reconcile-finance-entitlements.mjs`.

For auth, admin access, and private gate:

- Start with the auth and access section in `00-repo-audit.md`.
- Then open `docs/architecture/data-access-authz-cache-contract-registry.md`,
  `docs/runbooks/private-access-gate.md`, and `docs/runbooks/auth-account-support.md`.

For course, video/content, progress, workouts, programs, dryland, and habits:

- Start with `chapters/02-product-map.md`.
- Then use `00-repo-audit.md`.
- Then use the route inventory, API registry, migrations, `lib/` domain modules, and targeted tests
  named in the audit.

## Proposed Future Phases

Phase 1:

- Repo audit.
- Documentation architecture.
- Quality checklist.
- Diagram plan.
- Living-doc plan.
- Unknowns and risks.

Phase 2:

- Owner-approved stable book chapters.
- No generated `docs/system-state/*` files unless explicitly approved.
- Use exact path references and the quality checklist.

Phase 3:

- Optional generated inventories for routes, env names, API routes, migrations, tests, scripts, and
  dependencies.
- Prefer repo-native scripts/checks only after the stable manual structure is approved.

Phase 4:

- Maintenance automation, freshness checks, and review workflow.
- Avoid adding tooling until drift patterns prove it is needed.

## Non-Goals For Phase 1

- No runtime code changes.
- No UI, print, layout, or brand changes.
- No provider settings changes.
- No database migrations.
- No scripts, workflows, or generated docs.
- No Phase 2+ chapter generation.
- No secret values or personal data.

## Review Questions Before Phase 2

1. Is the proposed chapter structure understandable for a non-programmer owner?
2. Which chapters must be stable hand-written docs, and which can later become generated
   inventories?
3. Which `Unknown / To Verify` items should the owner confirm first?
4. Should Phase 2 focus first on owner learning, operations, or product/domain explanation?
5. Which docs should stay linked to existing runbooks instead of duplicating them?
