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

## UI Architecture And Reference Surfaces

- New UI that represents the same domain object or workflow as an existing mature surface must identify the reference surface before implementation.
- Prefer one shared component or view-model contract over visually copying markup between routes.
- If a new surface cannot reuse the existing component directly, it must adapt its data into the same display contract or document the exception in the active brief.
- Visual screenshot handoff for these changes should be `after/reference`, not only standalone after-screenshots.
- For swim workout/session step displays, use `docs/design/session-step-surface-contract.md` as the canonical Edit/Rearrange/View display contract.

## Stack Practice Gates

- React/Next.js:
  - prefer shared components, typed adapter/view-model contracts, and clear server/client boundaries before route-local duplication,
  - pages own routing and data loading; shared domain UI should live under `components/` or a narrower feature module.
- TypeScript/domain logic:
  - domain state changes should use canonical types, validation helpers, and deterministic guards rather than ad hoc object mutation.
- Supabase:
  - schema/RLS changes require explicit migrations, least-privilege policies, generated type updates, and negative-path tests.
- External services:
  - integrations should use official SDK/docs where practical and define secret handling, idempotency, retries, webhook verification, and support diagnostics in the brief.
- UI/design:
  - mature surfaces are reference contracts; new surfaces should reuse tokens/components and prove parity with screenshots when visual behavior changes.
- Testing:
  - shared contracts should have focused unit/component coverage, while route tests cover only route-specific flow differences.

### Current Architecture Assessment

- The app is on the right React path where it uses shared route components such as `WorkoutEditor`, typed draft contracts, and focused adapter helpers.
- The main session-step architecture gap is that `WorkoutEditor` still owns too much rendering, grouping, and surface-specific mapping in one large file.
- The 10/10 target is a smaller shared session-step view-model and renderer that manual builder, AI generator, poolside note, PDF/export, and future planner surfaces consume through typed adapters.
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

## Technical Constraints

- Keep TypeScript strict mode enabled.
- Keep alias imports with `@/*`.
- Validate major UI changes with Playwright mobile projects before merge.
