# Workout Builder Template Identity / Selection Contract

Last updated: 2026-06-10

## Purpose

This contract defines what must be true before FreeSwimming can count `Template usage` for Workout Builder in Admin Analytics.

The current product decision is conservative: Workout Builder exposes a V1 runtime template source, an explicit `Use template` action, a typed `workout_builder_template_selected` event for that action, and an Admin Analytics mapping that counts only that explicit event with registry-backed labels and safe unknown buckets.

## Current Product Decision

- Current runtime support: V1 typed in-repo registry and explicit `Use template` selection surface.
- Current Admin Analytics behavior: count `Template usage` only from `workout_builder_template_selected` rows with safe `templateKey`/`templateSource` values.
- Current instrumentation behavior: emit the typed, privacy-safe `workout_builder_template_selected` event only from the canonical `Use template` action.
- Dashboard mapping condition: known labels come from the template registry; unknown, missing, malformed, deprecated, or unmapped keys/sources stay separate until explicitly mapped.

## Template Definition

A workout-builder template is a reusable full workout or session pattern that can create or populate a workout draft through an explicit user action.

The following do not count as workout-builder templates for this KPI:

- session type,
- generator intake/data block toggles,
- generated draft creation,
- saved workout `sourceKind`,
- manual starter scaffolds,
- reusable single step/block snippets,
- goal templates,
- email templates,
- admin incident templates,
- public route templates,
- copy labels or button text.

## Source Of Truth

Preferred future source:

- A persisted `workout_template` or equivalent server-canonical entity from the workout data contract, after that contract is refreshed and implemented.

Current V1 interim source:

- A typed in-repo template registry with a write-once `templateKey`, fixtures, unknown/deprecated tests, and documented migration path to the persisted entity.

Not allowed:

- Deriving template identity from title, label, route slug, `sessionType`, `sourceKind`, generator block key, draft creation, save event, or analytics payload copy.

## Stable Identity

Canonical template identity must be one of:

- `templateId`: immutable server-owned ID for a persisted template entity.
- `templateKey`: write-once low-cardinality machine key for a typed registry.

`templateKey` rules:

- lowercase ASCII only,
- starts with a letter or number,
- may contain letters, numbers, underscore, or hyphen,
- length 3-64 characters,
- independent of locale, title, label, category, and sort order.

Human-readable fields that may change without changing identity:

- title,
- label,
- description,
- category,
- sort order,
- admin display copy,
- localized visible copy.

## Rename Vs Repurpose

Rename in place is allowed when the underlying template remains the same product concept and workout/session pattern.

A new `templateId` or `templateKey` is required when a change materially alters:

- workout structure,
- target user job,
- selection meaning,
- source behavior,
- canonical steps or progression semantics,
- commercial/package interpretation.

Deprecated templates must have one explicit behavior before they affect analytics:

- hidden but readable,
- aliased by an explicit migration,
- blocked from selection,
- excluded from dedicated template KPIs.

Unknown or invalid template identifiers must fail closed. They must not be mapped to a nearby title, current session type, source kind, or fallback template.

## Selection Contract

Template selection means a user explicitly chooses a canonical template to create or populate a workout draft.

The preferred future UI action is `Use template` or an equivalent action with the same product meaning.

Counts as selection only after all of these are true:

- the action was explicit,
- the template identity resolved to a valid canonical `templateId` or `templateKey`,
- the action belongs to workout-builder or session-creation context,
- the builder/generator accepted the template and started or populated the draft.

Does not count as selection:

- opening or previewing a template,
- viewing a template list,
- changing session type,
- toggling generator intake blocks,
- generating a draft without a template identity,
- saving a workout,
- editing a workout created earlier from a template,
- selecting unrelated goal/email/admin/route templates.

Repeated explicit use actions may count as repeated product telemetry events. They must not be interpreted as unique users, checkout conversion, revenue attribution, entitlement truth, export success, or finance reporting.

## Future Analytics Preconditions

Only after the source and selection contracts above are implemented may a future instrumentation child add:

- event name: `workout_builder_template_selected`,
- safe payload dimension: `templateId` or `templateKey`,
- safe source dimension such as `templateSource`,
- existing low-cardinality builder/session dimensions only when already canonical.

Forbidden analytics payload values:

- template title or label,
- workout title,
- notes,
- raw workout text,
- raw URL or referrer,
- email,
- IP address,
- user agent,
- user ID,
- visitor ID,
- payment/cart/customer data,
- Stripe IDs,
- raw payload JSON in Admin UI.

Analytics failure must fail soft and must not block template use. Missing, unknown, deprecated, or invalid template identity must emit no trusted template-selection event until explicitly mapped. Admin Analytics truth is the persisted `workout_builder_template_selected` event with safe registry-backed identity, not the visible `Use template` workflow alone.

## Data Placement And Cache Contract

Server-canonical future:

- Persisted templates are the source of truth.
- Reads must define `no-store`, revalidation, or cache tags in the runtime child.
- Mutations must invalidate dependent builder, generator, analytics, and admin reads.

Registry-canonical future:

- The registry file and tests are source of truth until a persisted entity replaces it.
- Deploy/build invalidation is sufficient unless a later child adds dynamic config.

Local/browser:

- Browser state may hold transient draft UI state only.
- Browser state must not become template identity truth.
- No analytics cookie, visitor ID, localStorage identity bridge, or public-to-user attribution bridge is allowed by this contract.

## Forward Compatibility

Future templates from the same canonical source inherit this identity and selection contract automatically.

Future additions that require explicit mapping, docs, and tests:

- new template source,
- template family/type,
- localized labels with analytics meaning,
- dedicated Admin Analytics module,
- commercial CTA placement,
- checkout attribution,
- export or CSV dimension,
- finance reporting interpretation,
- third-party analytics/vendor forwarding,
- public-to-user attribution.

Safe fallback for unknown/deprecated values:

- exclude from dedicated template KPIs,
- expose safe diagnostics only where useful,
- require alias/migration/support interpretation before counting.

## Support And Operations Boundaries

This contract changes no admin workflow, support queue, schema, RLS policy, export, checkout, Stripe, entitlement, finance, or vendor behavior. The Admin Analytics mapping counts only explicit template-selection telemetry and keeps unknown/deprecated values separate until explicitly mapped.

Future visible template-selection UI must include:

- Help/Guide/support interpretation when labels or workflow meaning change,
- screenshot handoff before pre-PR verification,
- negative-path tests for unknown/deprecated/unauthorized template cases.

## Future Child Checklist

Before resuming template usage instrumentation, the future child must prove:

- canonical template source exists,
- identity is immutable or write-once,
- visible labels are not identity,
- rename vs repurpose policy is implemented,
- explicit selection action exists,
- invalid/unknown/deprecated IDs fail closed,
- selection emits from the accepted `Use template` action only,
- payload sanitizer excludes forbidden data,
- Admin Analytics interpretation remains product telemetry only,
- Help/Guide and screenshot requirements are handled if visible UI changes.
