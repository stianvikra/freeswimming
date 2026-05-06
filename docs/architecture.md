# Architecture

## Stack

- Framework: Next.js 16 App Router (`app/`)
- Language: TypeScript 6 with strict mode
- UI: React 19 + Tailwind CSS 4
- CSS pipeline: Tailwind 4 via `@tailwindcss/postcss`, `app/globals.css`, and `tailwind.config.js`
- Testing: Playwright (E2E), Vitest + Testing Library (unit/component)
- Data/Auth: Supabase Postgres + Supabase Auth
- Runtime/package manager: Node 24 (`.nvmrc`, `engines.node 24.x`) + npm 11.11.0

## Runtime Boundaries

- Server routes live under `app/api/*` and run on the server.
- UI pages and components live under `app/*` and `components/*`.
- Shared helpers and UI primitives live in `components/ui/*`.
- Database schema + RLS changes are stored as SQL migrations under `supabase/migrations/*`.
- Route-level data access, authz, service-role, and cache contracts are registered in
  `docs/architecture/data-access-authz-cache-contract-registry.md`.
- External service, provider, observability, finance/support, and rollback contracts are
  registered in `docs/architecture/external-service-contract-matrix.md`.

## UI Architecture And Reference Surfaces

- New UI that represents the same domain object or workflow as an existing mature surface must identify the reference surface before implementation.
- Prefer one shared component or view-model contract over visually copying markup between routes.
- If a new surface cannot reuse the existing component directly, it must adapt its data into the same display contract or document the exception in the active brief.
- Visual screenshot handoff for these changes should be `after/reference`, not only standalone after-screenshots.
- For swim workout/session step displays, use `docs/design/session-step-surface-contract.md` as the canonical Edit/Rearrange/View display contract.

## Stack Practice Gates

- Systemic quality gate:
  - `npm run lint:quality-gates` classifies changed files by quality-risk surface, maps them to scorecard evidence, and fails non-docs changes that lack a changed in-progress brief or required evidence language.
  - The gate is intentionally not a replacement for product/design/architecture judgment; it makes required evidence and remaining human review explicit before broad verification.
- React/Next.js:
  - prefer shared components, typed adapter/view-model contracts, and clear server/client boundaries before route-local duplication,
  - pages own routing and data loading; shared domain UI should live under `components/` or a narrower feature module.
- TypeScript/domain logic:
  - domain state changes should use canonical types, validation helpers, and deterministic guards rather than ad hoc object mutation.
- Supabase:
  - schema/RLS changes require explicit migrations, least-privilege policies, generated type updates, and negative-path tests.
  - route handler changes must preserve the
    [data access authz/cache registry](architecture/data-access-authz-cache-contract-registry.md)
    entry for helper choice, service-role usage, cache mode, and expected failure statuses.
- External services:
  - integrations should use official SDK/docs where practical and define secret handling, idempotency, retries, webhook verification, and support diagnostics in the
    [external service contract matrix](architecture/external-service-contract-matrix.md).
- UI/design:
  - mature surfaces are reference contracts; new surfaces should reuse tokens/components and prove parity with screenshots when visual behavior changes.
- Testing:
  - shared contracts should have focused unit/component coverage, while route tests cover only route-specific flow differences.

## Latest Architecture Audit

- `2026-05-05`: [Platform Architecture Stack Practice Audit](architecture/platform-architecture-stack-practice-audit-2026-05-05.md)
- Verdict:
  - release-safe under the current gates,
  - no immediate P0 security, data-integrity, production-availability, or rollback blocker found,
  - app-wide strict 10/10 still requires the planned P1 decomposition/contract-registry briefs created by the audit.
- Priority follow-ups:
  - workout/session domain contract decomposition,
  - admin workspace contract decomposition,
  - data-access authz/cache contract registry,
  - external-service contract and observability hardening.

### Current Architecture Assessment

- The app is on the right React path where it uses shared route components such as `WorkoutEditor`, typed draft contracts, and focused adapter helpers.
- The main session-step architecture gap is now broader than one file: `lib/workouts/shared.ts`, `WorkoutEditor`, AI session-generator contracts, display adapters, and export helpers need smaller typed boundaries before broad AI/program work continues.
- The 10/10 target is a smaller shared workout/session domain model and renderer stack that manual builder, AI generator, poolside note, PDF/export, and future planner surfaces consume through typed adapters.
- When a shared reference surface changes, the owning PR should sweep related surfaces and either update them in the same slice or record a follow-up brief with the exception.

## Data Contract (Commerce + Progress)

- Core ownership and purchase tables:
  - `products`
  - `entitlements`
  - `download_links`
- User state tables:
  - `profiles`
  - `course_progress`
  - `guide_progress`
  - `guide_session_progress`
  - `goals`
- Static guide structure table:
  - `guide_sessions`
- TypeScript DB contract snapshot:
  - `types/database.ts`

## Current Feature Areas

- Marketing and informational pages (`/`, `/about`, `/our-method`, `/programs`)
- Course flow (`/course`, `app/course/courseData.ts`)
- Contact and analysis intake (`/contact`, `/analysis`, `POST /api/contact`)

## Contact Flow (High Level)

1. User submits `ContactForm`.
2. Client posts JSON to `POST /api/contact`.
3. API validates origin, content type, and request rate.
4. API validates payload and applies anti-spam checks.
5. API sends email via Resend (or logs in dev fallback if recipient is missing).
6. Admin Messages v1 must move inbound request persistence to an app-canonical message record
   before provider delivery, following the `message_delivery` service contract.

## Technical Constraints

- Keep TypeScript strict mode enabled.
- Keep alias imports with `@/*`.
- Validate major UI changes with Playwright mobile projects before merge.
