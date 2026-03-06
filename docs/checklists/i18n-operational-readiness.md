# i18n Operational Readiness Checklist

Use this before enabling additional locales to confirm route/content/admin operations are ready.

## Cadence And Owner

- Cadence: at planning kickoff for each locale expansion and after major content/admin schema changes.
- Owner: product + engineering shared owner for locale rollout.

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

| Blocker                                         | Severity (`P0/P1/P2`) | Owner | Target date | Mitigation                              | Linked brief/PR |
| ----------------------------------------------- | --------------------- | ----- | ----------- | --------------------------------------- | --------------- |
| Example: no locale-safe slug policy for lessons | P1                    | owner | YYYY-MM-DD  | lock slug contract before locale launch | brief/PR link   |

## Exit Criteria For "Ready To Start Locale Work"

- No unresolved `P0` blockers.
- All `P1` blockers have owner + target date + mitigation.
- Route/content/admin decisions are documented and reviewable.
