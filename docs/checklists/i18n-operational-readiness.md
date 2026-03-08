# i18n Operational Readiness Checklist

Use this before enabling additional locales to confirm route/content/admin operations are ready.

## Cadence And Owner

- Cadence: at planning kickoff for each locale expansion and after major content/admin schema changes.
- Owner: product + engineering shared owner for locale rollout.

## Current Baseline Decision

- Locale routing strategy is locked to `subpath` and documented in:
  - `docs/decisions/locale-routing-strategy.md`
- Default locale remains canonical at `/`.
- Non-default locales use `/<locale>/...`.

## Readiness Checks

- Route strategy:
  - locale routing approach is explicit (subpath/domain) and documented.
  - canonical route behavior for default locale is defined.
- Content model:
  - required translatable fields are identified by content type.
  - non-translatable keys/identifiers remain stable across locales.
  - fallback behavior is defined when locale content is missing.
- Admin workflow:
  - clear rule exists for draft/review/published per locale.
  - owner assignment and revision history remain available per localized record.
  - Help/Guide explains locale-edit workflow when introduced.
- SEO and indexing:
  - locale/canonical metadata strategy aligns with SEO brief decisions.
  - robots/sitemap expectations are defined for each locale state.
- Analytics/reporting:
  - locale dimension is planned for key product and admin events.
  - dashboards/reports can segment by locale without changing IDs.
- Reliability/support:
  - incident runbook includes locale-specific triage notes.
  - fallback language behavior is explicit for runtime failures.

## Blocker Log (Required)

| Blocker                                                       | Severity (`P0/P1/P2`) | Owner      | Target date | Mitigation                                                           | Linked brief/PR                                                                               |
| ------------------------------------------------------------- | --------------------- | ---------- | ----------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Locale-specific content fallback matrix is not finalized yet. | P2                    | stianvikra | 2026-03-21  | Keep default-locale fallback deterministic until matrix is explicit. | `docs/task-briefs/in-progress/2026-03-04-operations-finance-i18n-readiness-baseline-10-10.md` |

## Exit Criteria For "Ready To Start Locale Work"

- No unresolved `P0` blockers.
- All `P1` blockers have owner + target date + mitigation.
- Route/content/admin decisions are documented and reviewable.
