# Task Brief Forward Compatibility Contract

## Purpose

Use this contract when creating, refreshing, or recommending a task brief.

The goal is to prevent work that only handles today's known products, labels, workflow states, or
routes unless that limitation is intentional, documented, and safe.

## Required Questions

For each touched surface, answer:

- What new values can appear later?
  - products, catalog rows, entitlements, categories, statuses, labels, workflow actions, routes,
    locales, providers, export formats, analytics payload fields, or admin surfaces.
- What is the source of truth for those values?
  - database row, catalog helper, typed union, config, route params, content model, or explicit
    mapping.
- What follows automatically?
  - list rendering, analytics ID lists, counts, generic labels, fallback state rendering, or test
    fixtures.
- What requires a deliberate mapping update?
  - product-specific copy, support guidance, Help/Guide text, public SEO copy, provider-specific
    behavior, finance/reconciliation handling, or export templates.
- What happens to unknown or deprecated values?
  - safe generic fallback, fail-closed behavior, retry/recovery action, admin warning, log, support
    diagnostic, redirect, alias, or explicit block.
- What proves the contract?
  - future-value fixture, unknown-value negative path, contract test, route/label/support sweep, or
    explicit `N/A` rationale for docs-only work.

## Common Patterns

- Product/catalog analytics:
  - derive counts and product ID lists from the actual rendered or server-canonical product list,
    not from today's hardcoded product set.
  - product-specific copy may stay mapped explicitly, but unknown products need safe generic copy or
    a documented release blocker.
- Admin/user workflow labels:
  - define whether new statuses/actions use a generic state renderer, require Help/Guide updates, or
    must be blocked until support docs and tests exist.
- Routes, slugs, and identifiers:
  - keep stable IDs separate from editable labels/slugs; define alias/redirect behavior for legacy
    identifiers.
- Export/PDF/image surfaces:
  - define how new formats, dimensions, brand variants, and artifact filenames are validated against
    the actual consumed artifact.
- i18n readiness:
  - avoid layout/copy assumptions that make later locale expansion unsafe; note where new strings
    must be added to a future translation workflow.

## Done Brief Policy

Do not rewrite historical `done/` briefs just to add this new section.

Only update a done brief when:

- it is still used as an active queue/reference surface and contains stale instructions,
- lint/post-merge closeout requires a targeted lifecycle fix,
- a later PR discovers that the done brief's recorded contract is incorrect and still operationally
  harmful.

Otherwise, record the new contract in the next active implementation brief that uses the old done
brief as reference.
