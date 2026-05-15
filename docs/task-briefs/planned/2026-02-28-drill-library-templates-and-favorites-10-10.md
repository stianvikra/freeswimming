# Task Brief: Drill Library Templates And Favorites (10/10)

## Metadata

- `id`: `2026-02-28-drill-library-templates-and-favorites-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-16`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@b2a211f`
- `audit_status`: `revise-before-use`
- `decision`: Refresh this brief before execution.
- `reason`: Existing lifecycle brief predates the Brief Audit Record standard and was not fully re-audited in this governance slice; current scope, paths, scorecard mapping, validation lane, Help/Guide impact, and support-surface impact must be checked before use.
- `must_refresh_before_execution_if`: Always refresh before use, and refresh again if AGENTS.md, scorecard categories, verification lanes, route labels, Help/Guide, runbooks, support surfaces, provider facts, or relevant repo paths change.

## Goal

Provide a fast drill/template catalog that makes workout creation significantly faster for adult freestyle learners.

## Scope

- Drill library read UX with filters:
  - type, level, equipment, focus tags.
- Favorites:
  - add/remove favorite,
  - quick access section.
- Template library:
  - one-click insert into builder,
  - editable after insert.
- Admin CRUD for drills/templates with governance fields.

## Out Of Scope

- AI generation logic.
- Garmin OAuth/export.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - drill/template catalog records, governance fields, and any persisted favorite state if favorites are account-bound.
- Local-only:
  - transient filters, sort state, panel open state, and temporary insert-preview UI.
- Sync behavior:
  - admin CRUD writes must return canonical updated catalog rows,
  - favorite toggles may be optimistic only if server reconciliation is deterministic,
  - inserted workout references must preserve canonical drill/template IDs.
- Invalidation:
  - catalog CRUD invalidates library lists, favorite surfaces, builder insert pickers, and admin catalog reads for affected entity classes.

## Identity And Rename Contract

- Canonical stable IDs:
  - drills and templates need immutable canonical IDs independent of title, category placement, favorite count, or sort order.
- Human-readable identifiers:
  - titles/slugs/tags are operator-facing discovery fields and may be renameable if routing/admin UX needs it.
- Mutability rules:
  - favorites, filters, and sort changes must key off canonical IDs,
  - title/slug/tag edits must not rewrite saved references in workouts or favorites.
- Rename vs repurpose:
  - rename in place is allowed for the same drill/template,
  - materially different technique content should create a new drill/template instead of overwriting historical identity that may already be referenced by workouts/favorites.
- Compatibility contract:
  - inserted workout references, favorites, admin CRUD, and analytics events must resolve canonical IDs even if display naming later changes.
- Observability and repair:
  - missing/deleted referenced drills/templates must surface deterministic recovery UI rather than silently mapping to a different item.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                              | Evidence                             |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Drill/template library supports find -> inspect -> favorite -> insert flow without ambiguous navigation.      | UX spec + e2e                        |
| UX flow clarity                               | `target`     | Add first drill/template to workout in <= 20 seconds with clear filter and insert affordances.                | e2e + manual timing                  |
| Visual design quality                         | `target`     | Clear hierarchy and scannable cards across mobile/desktop with no unfinished empty/filter states.             | manual QA + screenshots              |
| Business logic correctness and data integrity | `target`     | Favorites, inserts, and admin CRUD preserve canonical drill/template identity with no silent reference drift. | unit/integration tests               |
| Admin editor ergonomics                       | `target`     | Admin can create/edit/archive drills/templates with clear validation and minimal friction.                    | admin QA + e2e                       |
| Accessibility (a11y)                          | `target`     | Filter, favorite, card, and admin CRUD controls remain keyboard/label/focus accessible.                       | a11y checks + manual keyboard QA     |
| Performance (CWV + payloads)                  | `target`     | Library view remains responsive under realistic catalog size with no material payload regression.             | perf spot checks + bundle review     |
| Data placement and sync boundaries            | `target`     | Catalog/favorite ownership is explicit and inserted workout references use canonical server-backed identity.  | data contract + integration tests    |
| Caching and invalidation strategy             | `target`     | Catalog/favorite/admin reads refresh deterministically after CRUD/favorite writes.                            | cache notes + integration tests      |
| Reliability and failure handling              | `target`     | Filter/favorite/insert/admin CRUD failure states include retry and never leave wrong-item selection.          | e2e failure coverage                 |
| Security and authz                            | `target`     | Admin CRUD and any persisted favorite mutations are role-gated/authenticated and fail closed.                 | negative-path API tests              |
| Privacy and compliance                        | `supporting` | Supporting only: no sensitive user data beyond scoped favorite state should be exposed in this slice.         | scope rationale + payload review     |
| Content governance                            | `target`     | Drill/template ownership, lifecycle, and rename-vs-repurpose rules are explicit before admin CRUD ships.      | governance notes + identity contract |
| Admin workflow and editability                | `target`     | Admin CRUD available with validation, safe lifecycle flow, and deterministic feedback.                        | admin e2e                            |
| SEO and crawlability                          | `supporting` | Supporting only: public library discoverability requirements belong to later route/metadata slices.           | scope rationale                      |
| AI discoverability                            | `supporting` | Supporting only: this slice supplies canonical drill/template entities but not AI-discoverable public docs.   | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: favorite/insert usage events should remain possible with stable canonical IDs.               | event contract notes                 |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct commerce/entitlement mutation in this catalog slice.                               | scope rationale                      |
| Incident response and support operations      | `supporting` | Supporting only: admin/catalog failure states must be diagnosable and recoverable for support.                | error contract + scope rationale     |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting mutation in this library/catalog slice.                                 | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: tags/titles/labels must remain locale-extensible for later localization.                     | schema/copy review + scope rationale |
| Stack-fit and dependency discipline           | `target`     | Use existing admin/content stack patterns and avoid unnecessary library/filter dependencies.                  | dependency diff + code review        |
| Testing and QA automation                     | `target`     | Library/filter/favorite/insert/admin CRUD paths and negative paths are covered before merge.                  | test matrix + verify outputs         |
| Scalability and cost efficiency               | `supporting` | Supporting only: catalog fetch/filter behavior must avoid obvious expensive patterns as item count grows.     | perf notes + scope rationale         |
| DevOps and rollback readiness                 | `target`     | Catalog/favorite rollout includes rollback path for bad references or admin CRUD regressions.                 | release notes + rollback checklist   |

## Acceptance Criteria

- Users can filter and add drills/templates quickly.
- Favorites persist and are reusable in builder flow.
- Admin can maintain drill/template catalog without code changes.
- Empty/loading/error/retry states are complete.
- Existing favorites and inserted workout references stay semantically correct after rename or reorder changes.
- Brief is scorecard-complete and identity-safe before implementation starts.

## Validation

- `npm run test:unit`
- targeted e2e for library/filter/favorite/insert flows
- `npm run verify:pre-pr`
