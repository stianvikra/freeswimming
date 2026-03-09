# Decision: Locale Routing Strategy

## Metadata

- Date: `2026-03-08`
- Status: `accepted`
- Scope: route model for upcoming multi-locale rollout
- Related brief: `docs/task-briefs/done/2026-03-04-operations-finance-i18n-readiness-baseline-10-10.md`

## Context

The i18n readiness checklist had an open `P1` blocker: locale routing was not locked (`subpath` vs `domain`).

This ambiguity blocked deterministic decisions across:

- canonical URL handling,
- sitemap/robots behavior,
- analytics segmentation by locale,
- support/runbook triage for locale-specific incidents.

## Decision

Adopt `subpath` locale routing as the canonical strategy.

- Default locale remains at root: `/`.
- Non-default locales use explicit locale prefixes: `/<locale>/...`.
- Locale key is a routing concern, not a content identifier.
- Primary content identifiers (`id`, `slug`) stay stable across locales.

## Why This Option

- Keeps one deployment and one host/origin policy for auth, checkout, and protected routes.
- Minimizes infra and operational complexity versus domain-per-locale.
- Preserves stable non-locale identifiers for analytics and reconciliation.
- Aligns with current single-language runtime without forced URL churn for default locale users.

## Operational Guardrails

- Canonical URL logic must map locale variants to the intended canonical target per page state.
- Sitemap generation must include locale variants only when localized content is actually available.
- Missing locale content must fail soft with fallback behavior (no blank route or `500`).
- Incident runbook locale triage overlay remains required for locale-specific failures.

## Rollout Notes

- This decision closes readiness blocker `OPS-FIN-I18N-001` (routing ambiguity).
- Full translation rollout, language selector UX, and localized SEO content are out of scope here.
