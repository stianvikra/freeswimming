# Decision: Locale Content Fallback Matrix

## Metadata

- Date: `2026-03-08`
- Status: `accepted`
- Scope: deterministic fallback behavior for locale-specific content reads
- Related brief: `docs/task-briefs/done/2026-03-04-operations-finance-i18n-readiness-baseline-10-10.md`

## Context

Locale routing is already locked to `subpath`, but fallback behavior for missing localized content
was still an open operational blocker.

Without an explicit matrix, operators could not reliably answer:

- what the user should see,
- what canonical/metadata should do,
- how analytics should be tagged,
- and when to escalate.

## Decision

Use this fallback matrix for locale-aware content surfaces:

| Scenario                                                                 | User-facing behavior                                                                | Canonical and metadata behavior                                                       | Analytics behavior                                                        | Operator action                                                                |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Localized content exists and is published for requested locale           | Render localized content for that locale.                                           | Canonical and indexable metadata can remain on locale path (`/<locale>/...`).         | Keep stable entity IDs/slugs; add locale dimension in event payload.      | None.                                                                          |
| Localized content missing, but default-locale content exists and is safe | Render default-locale content as deterministic fallback (no blank page, no `500`).  | Canonical should point to default-locale path to avoid duplicate indexing ambiguity.  | Keep stable entity IDs/slugs; record requested locale + fallback locale.  | Log as `P2` if persistent and assign content owner for localization follow-up. |
| Neither localized nor default content exists for requested entity        | Return explicit `404`/unavailable state (never `500` for expected missing content). | Mark route as non-indexable (`noindex`) for unavailable state.                        | Emit deterministic unavailable/error event with stable identifiers.       | Escalate `P1` if caused by publish process drift.                              |
| Runtime fetch/parsing error while resolving localized content            | Fail soft with deterministic fallback/unavailable UI (never blank shell).           | Keep metadata deterministic for fallback/unavailable state; avoid inconsistent canon. | Emit deterministic error event (redacted payload, stable non-locale IDs). | Triage with incident runbook; escalate severity by user impact (`P0/P1/P2`).   |

## Operational Guardrails

- Missing localized content must not produce blank route or `500`.
- Stable non-locale identifiers (`id`, `slug`) remain canonical across locales.
- Fallback behavior must be testable and reproducible in runbooks/checklists.
- Incident triage must include locale route resolution and fallback validation.

## Rollout Notes

- This decision closes readiness blocker `OPS-FIN-I18N-004` (fallback matrix ambiguity).
- Full translated-copy rollout and language selector UX remain out of scope.
