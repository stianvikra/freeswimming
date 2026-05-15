# Proposed App Knowledge Book Structure

## Structure Principle

The final App Knowledge Book should separate stable explanation from dynamic system-state
inventories.

Stable docs explain why the app exists, how it is organized, and how to operate it. Dynamic
inventories list routes, env names, migrations, APIs, scripts, dependencies, and tests that change
often.

Phase 1 creates only the architecture for this system. It does not generate the full book.

## Proposed Folder Model

```text
docs/app-knowledge-book/
  README.md
  00-repo-audit.md
  quality-checklist.md
  proposed-structure.md
  proposed-diagrams.md
  living-documentation-plan.md
  unknowns-and-risks.md

  future/
    01-owner-overview.md
    02-product-map.md
    03-stack-and-runtime.md
    04-routing-and-navigation.md
    05-auth-access-and-private-gate.md
    06-data-model-and-supabase.md
    07-admin-workspace.md
    08-commerce-entitlements-and-finance.md
    09-contact-messages-and-support.md
    10-training-domain.md
    11-workouts-programs-dryland-and-habits.md
    12-analytics-observability-and-kpis.md
    13-seo-ai-and-public-discoverability.md
    14-testing-release-and-ci.md
    15-operations-incident-and-rollback.md
    16-security-privacy-and-compliance.md
    17-i18n-and-future-scale.md
    18-how-to-change-the-app-safely.md
```

Future generated inventories, if approved later, should live outside this folder:

```text
docs/system-state/
  routes.md
  api-routes.md
  env-vars.md
  migrations.md
  db-types-summary.md
  tests.md
  scripts.md
  dependencies.md
  workflows.md
```

## Phase Breakdown

### Phase 1: Audit And Architecture

Status: current scope.

Outputs:

- Repo audit.
- Quality checklist.
- Proposed final structure.
- Proposed diagrams.
- Living documentation plan.
- Unknowns and risks.

No scripts, runtime changes, generated inventories, or full chapters.

### Phase 2: Owner-Readable Stable Chapters

Recommended first chapters:

1. Owner overview.
2. Product map.
3. Stack and runtime.
4. Auth/access/private gate.
5. Admin workspace.
6. Testing/release/CI.
7. Operations/incident/rollback.

Rationale:

- These give the owner immediate practical understanding.
- They reuse existing runbooks and architecture docs rather than replacing them.
- They avoid premature deep generation before route/data inventories are automated.

### Phase 3: Domain And Provider Chapters

Recommended chapters:

- Data model and Supabase.
- Commerce, entitlements, and finance.
- Contact, messages, and support.
- Training domain.
- Workouts, programs, dryland, and habits.
- Analytics, observability, and KPIs.
- SEO, AI discoverability, and public crawl posture.
- Security, privacy, and compliance.
- i18n and future scale.

### Phase 4: Generated System-State Inventories

Create only after the owner approves Phase 2 structure.

Good generated candidates:

- Route inventory.
- API route inventory.
- Env variable name inventory.
- Supabase migration inventory.
- Test inventory.
- Script inventory.
- Dependency inventory.
- Workflow inventory.

Bad generated candidates:

- Product strategy.
- Owner learning narrative.
- Incident judgment.
- Provider control-plane facts.
- Any doc that needs human tradeoff decisions.

## Stable Docs Versus Generated Docs

Stable docs:

- Explain concepts.
- Name ownership boundaries.
- Link to canonical code/docs.
- Change only when product, architecture, or operations change.

Generated docs:

- List observable repo state.
- Should be reproducible.
- Should be small enough to review in diffs.
- Must not read secret files or copy raw values.

## Duplication-Avoidance Rules

- Link to `docs/architecture/data-access-authz-cache-contract-registry.md` for route-level
  auth/cache details instead of copying every row into book chapters.
- Link to `docs/architecture/external-service-contract-matrix.md` for provider contracts instead of
  restating all provider rules.
- Link to `docs/testing-strategy.md` for test cadence rather than duplicating every command.
- Link to runbooks for operational procedures.
- Summarize only what an owner needs to navigate the canonical source.

## Suggested Generation Order

If Phase 2 is approved:

1. Write stable owner overview manually.
2. Write product map manually from repo evidence.
3. Write stack/runtime manually from `package.json`, `docs/architecture.md`, and config files.
4. Write admin/auth/testing/ops chapters manually, linking to existing canonical docs.
5. Only then consider generated `docs/system-state/*` inventories.

## Estimated Size

Recommended maximums:

- Owner overview: 4-8 pages.
- Product map: 8-15 pages.
- Stack/runtime: 6-12 pages.
- Auth/admin/testing/ops chapters: 8-20 pages each.
- Domain chapters: 10-25 pages each.
- Generated inventories: short tables, ideally under 300 lines each.

If a chapter exceeds the estimate, split it rather than creating one large reference document.
