# Proposed Diagrams

## Diagram Policy

Diagrams should answer real maintenance questions. They should be Mermaid/C4-style where practical,
small enough to review, and backed by repo paths.

Confidence labels:

- `Phase 1 evidence known`: repo paths support the diagram shape.
- `Partially known`: repo paths support the app side, but provider/control-plane details need owner
  verification.
- `Unknown / To Verify`: the diagram would depend mainly on external facts not visible in repo.

## Proposed Diagram Inventory

| Diagram                                  | Purpose                                                                                                            | Confidence                                                                        | Evidence                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| System context                           | Show owner, learner, admin, Supabase, Stripe, Vercel, email, Upstash, and GitHub boundaries.                       | `Partially known`                                                                 | `docs/architecture.md`, `docs/architecture/external-service-contract-matrix.md`, `.github/workflows/*`                                           |
| Container diagram                        | Show Next app, App Router routes, Supabase, Stripe, email delivery, Redis rate limit, GitHub CI.                   | `Phase 1 evidence known` for app side, `Partially known` for control planes       | `app/`, `lib/`, `package.json`, `playwright.config.ts`                                                                                           |
| Route map                                | Show public, auth, admin, and my-library route groups.                                                             | `Phase 1 evidence known`                                                          | `app/**/page.tsx`, `app/**/route.ts`, `app/sitemap.ts`                                                                                           |
| API route class map                      | Show public, optional identity, protected-user, entitlement, admin, service-role, and dev-only classes.            | `Phase 1 evidence known`                                                          | `docs/architecture/data-access-authz-cache-contract-registry.md`                                                                                 |
| Request lifecycle: contact intake        | Show browser -> `/api/contact` -> validation/rate limit -> Supabase admin message -> delivery attempt -> provider. | `Phase 1 evidence known` for app flow, `Partially known` for live provider        | `app/api/contact/route.ts`, `lib/admin/contact-intake.ts`, `lib/admin/message-delivery.ts`                                                       |
| Auth and private gate flow               | Show sign-in, Supabase session, admin allowlist/roles, preview password/bypass cookie, protected/admin routes.     | `Phase 1 evidence known` for app flow, `Partially known` for production settings  | `lib/admin/access.ts`, `lib/site-lock/config.ts`, `app/preview-access/**`, `app/auth/sign-in/**`                                                 |
| Stripe checkout/webhook/entitlement flow | Show checkout creation, Stripe session, webhook verification, entitlement upsert, portal access, reconciliation.   | `Phase 1 evidence known` for app flow, `Partially known` for Stripe dashboard     | `lib/commerce/checkout.ts`, `lib/commerce/entitlements.ts`, `app/api/stripe/webhook/route.ts`, `scripts/reconcile-finance-entitlements.mjs`      |
| Admin workspace module map               | Show active admin tabs and module boundaries.                                                                      | `Phase 1 evidence known`                                                          | `components/admin/AdminWorkspace.tsx`, `lib/admin/admin-workspace.ts`, `docs/architecture/admin-workspace-module-contracts.md`                   |
| Data ownership map                       | Show server-canonical, provider-canonical, local-only, and future generated-doc state.                             | `Phase 1 evidence known` for repo contracts, `Partially known` for provider state | `docs/architecture.md`, `docs/architecture/external-service-contract-matrix.md`, migrations                                                      |
| Course/progress flow                     | Show course content, progress API, Supabase rows, My Library continuation.                                         | `Phase 1 evidence known`                                                          | `app/course/courseData.ts`, `app/api/progress/course/route.ts`, `lib/course/*`                                                                   |
| Workout/program/export flow              | Show local draft, saved canonical workout/program, PDF/Garmin/poolside handoff.                                    | `Phase 1 evidence known`                                                          | `lib/workouts/*`, `lib/programs/*`, route registry, related tests                                                                                |
| CI/CD and release flow                   | Show PR -> quality gates -> docs-only/full lane -> CI -> pre-merge -> merge -> post-merge preflight.               | `Phase 1 evidence known`                                                          | `package.json`, `scripts/run-verify-pre-pr.sh`, `scripts/run-verify-pre-merge.sh`, `.github/workflows/ci.yml`                                    |
| Incident/debugging flow                  | Show failure signal -> route triage -> runbook -> containment -> PR fix -> verification -> closeout.               | `Phase 1 evidence known`                                                          | `docs/runbooks/core-flow-incident-response.md`, `docs/runbooks/high-cost-debug-log.md`, `docs/runbooks/ui-debug-hypothesis-and-handoff.md`       |
| SEO/crawl/private posture                | Show sitemap/robots behavior in public versus site-lock mode.                                                      | `Phase 1 evidence known`                                                          | `app/sitemap.ts`, `app/robots.ts`, `lib/site-lock/config.ts`, sitemap tests                                                                      |
| i18n future flow                         | Show desired locale route/content fallback/metadata path.                                                          | `Partially known`                                                                 | `docs/decisions/locale-routing-strategy.md`, `docs/decisions/locale-content-fallback-matrix.md`, `docs/checklists/i18n-operational-readiness.md` |

## First Diagrams To Create In Phase 2

Recommended order:

1. System context.
2. Route map.
3. API route class map.
4. Auth/private gate flow.
5. Stripe checkout/webhook/entitlement flow.
6. CI/CD and release flow.

Reason:

- These diagrams support owner learning and operations first.
- They use strong repo evidence.
- They avoid premature detail for unstable future surfaces.

## Diagram Review Checklist

Before accepting a diagram:

- It has a clear question.
- It cites source paths.
- It labels trust boundaries.
- It avoids provider/config claims that are not repo-proven.
- It avoids secret values and personal data.
- It can be updated when a route, provider, or workflow changes.
