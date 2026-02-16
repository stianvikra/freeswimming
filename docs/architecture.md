# Architecture

## Stack

- Framework: Next.js App Router (`app/`)
- Language: TypeScript
- UI: React + Tailwind CSS
- Testing: Playwright (E2E), Vitest + Testing Library (unit/component)
- Data/Auth: Supabase Postgres + Supabase Auth

## Runtime Boundaries

- Server routes live under `app/api/*` and run on the server.
- UI pages and components live under `app/*` and `components/*`.
- Shared helpers and UI primitives live in `components/ui/*`.
- Database schema + RLS changes are stored as SQL migrations under `supabase/migrations/*`.

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
