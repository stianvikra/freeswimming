# Architecture

## Stack

- Framework: Next.js App Router (`app/`)
- Language: TypeScript
- UI: React + Tailwind CSS
- Testing: Playwright (E2E), Vitest + Testing Library (unit/component)

## Runtime Boundaries

- Server routes live under `app/api/*` and run on the server.
- UI pages and components live under `app/*` and `components/*`.
- Shared helpers and UI primitives live in `components/ui/*`.

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
