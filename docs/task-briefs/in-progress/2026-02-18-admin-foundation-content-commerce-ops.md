# Task Brief: Admin Foundation For Content Commerce And Ops

## Metadata

- `id`: `2026-02-18-admin-foundation-content-commerce-ops`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-02-18`

## Goal

Owner should be able to manage lessons, guides, products, and operational states from an internal admin area without code deploys.

## Scope

- Build internal `/admin` foundation inside current Next.js + Supabase stack (no external CMS).
- Add admin auth/authorization:
  - role-based gate (`admin`, `editor`, `viewer`) via profiles/claims,
  - deny-by-default for non-admin users.
- Add admin sections (v1):
  - `Content`: modules, lessons, guide sessions/drills, publish state,
  - `Commerce`: product catalog metadata and active/inactive state,
  - `Operations`: feature flags (site lock, soft-launch toggles), support actions.
- Add content data model in Supabase:
  - draft/published states,
  - ordering fields,
  - version metadata (`updated_by`, `updated_at`),
  - slug uniqueness and validation.
- Replace hardcoded runtime reads with DB-backed reads where selected:
  - keep safe fallback to static content for recovery.
- Add admin editing UX:
  - fast list view,
  - detail editor with validation,
  - explicit `Save draft` and `Publish` actions,
  - optimistic but honest feedback (`saved`, `failed`, `retry`).
- Add performance guardrails:
  - cache strategy for public reads,
  - tag-based revalidation after publish,
  - minimal payload for list endpoints.
- Add tests:
  - unit tests for permissions/validation,
  - integration tests for CRUD API routes,
  - e2e tests for admin login and core edit/publish flows.
- Add docs and runbook:
  - admin role assignment,
  - rollback to previous content version,
  - emergency content disable.

## Out Of Scope

- No Strapi migration in this phase.
- No full WYSIWYG builder.
- No broad redesign of public UI.

## Acceptance Criteria

- Admin routes are inaccessible to non-admin users.
- Owner can create/edit/publish lessons and guide content from UI.
- Owner can edit product metadata and active state used by plans/library surfaces.
- Publish action is reflected on public pages with deterministic cache invalidation.
- Content edits do not degrade page performance or stability.
- All admin-critical operations are logged with actor and timestamp.
- Unit/integration/e2e coverage for permission + content workflows is green.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
  - Safari, Chrome desktop for heavy edit workflows
  - iPad/tablet viewport for admin responsive behavior
- Vercel preview:
  - verify role gates and publish propagation.
- Production:
  - verify one controlled publish and one rollback drill.

## Constraints

- Keep current stack (Next.js + Supabase) for speed and control.
- No added heavy dependency unless it materially improves delivery.
- Preserve public-site visual language and SEO output.
- Admin UI can be utilitarian, but must be clear and fast.

## 10/10 Quality Bar (Required For User-Facing Work)

- Admin can complete core tasks with minimal clicks and clear status.
- Required states are present and testable: `loading`, `empty`, `error`, `offline`, `retry`.
- Every destructive action requires explicit confirmation.
- Keyboard-accessible forms, proper labels, focus order, and contrast.
- No ambiguous labels; copy is action-based and plain.
- Mobile/tablet editing remains usable for urgent operations.

## Security, Privacy, And Compliance (Required For Auth/Data/Payments)

- Strong server-side authorization on all admin APIs.
- RLS policies enforce role boundaries even if client is manipulated.
- CSRF-safe mutation endpoints and strict input validation.
- Audit log for create/update/publish/unpublish/delete actions.
- No secret values exposed in client payloads.
- GDPR-safe handling of user-related admin views (minimal PII).

## Observability And KPI Contract

- Required events/logs:
  - `admin_sign_in`,
  - `admin_content_saved`,
  - `admin_content_published`,
  - `admin_publish_failed`,
  - `admin_product_updated`.
- Operational metrics:
  - median save latency,
  - publish success rate,
  - admin API error rate.
- Product KPI outcomes:
  - reduced time-to-publish,
  - fewer hotfix deploys for content-only changes.

## Session Continuity And Recovery (Required)

- Canonical source: git branch + this brief file.
- Checkpoint cadence: commit each milestone or every 60-90 minutes.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from next milestone.

## Git Rhythm Defaults (Required)

- Commit + push per validated vertical slice:
  - schema + RLS,
  - admin auth gate,
  - content CRUD,
  - publish/revalidate,
  - tests.
- Ask owner before PR open/refresh and merge handoff.

## Branch Hygiene Defaults (Required)

- After merge:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git fetch --prune`

## PR Browser Rule (Required)

- Open PR links in Safari by default:
  - `open -a Safari "<PR_URL>"`

## Implementation Checkpoint Log (In Progress)

- `2026-02-18` | `working tree` | brief promoted from `planned` to `in-progress`; next step: scaffold admin auth gate + route shell (`/admin`) behind role check.
- `2026-02-18` | `working tree` | admin foundation slice 1 implemented:
  - added role resolution helper with deny-by-default behavior:
    - `lib/admin/access.ts` (`admin|editor|viewer` from `app_metadata`, optional bootstrap allowlist fallback).
  - added role-gated admin route shell:
    - `app/admin/layout.tsx`,
    - `app/admin/page.tsx`.
  - non-auth users are redirected to sign-in with intent (`/auth/sign-in?next=%2Fadmin`).
  - signed-in users without admin role receive explicit no-access state.
  - added unit coverage:
    - `tests/unit/admin-access.test.ts`.
  - added env docs for bootstrap allowlist:
    - `.env.example` (`ADMIN_EMAIL_ALLOWLIST`).
  - next step: validate this slice (`lint`, `typecheck`, targeted unit), then implement role persistence model in DB (`profiles` role column + RLS-safe usage).
- `2026-02-18` | `working tree` | admin foundation slice 2 implemented (role persistence model):
  - added migration for persisted profile roles:
    - `supabase/migrations/20260218230000_admin_profiles_role.sql`:
      - `public.admin_role` enum (`admin`, `editor`, `viewer`),
      - `public.profiles.role` column with default `viewer`,
      - index on `profiles.role`.
  - updated typed DB contract:
    - `types/database.ts` (`profiles.role` + `Enums.admin_role`).
  - admin gate now reads role from `profiles.role` (RLS-safe own-row read) with fallback to metadata/allowlist:
    - `app/admin/layout.tsx`,
    - `lib/admin/access.ts`.
  - added resilience for schema-cache lag during rollout:
    - `isAdminRoleColumnMissingError` fallback path.
  - expanded unit coverage:
    - `tests/unit/admin-access.test.ts` (profile-role precedence + missing-column detection).
  - next step: validate slice 2 and implement first admin content model table + CRUD API scaffold.
- `2026-02-18` | `working tree` | admin foundation slice 3 implemented (content CRUD scaffold):
  - added admin content data model + RLS scaffold:
    - `supabase/migrations/20260218234500_admin_content_items_scaffold.sql`
      - enums: `admin_content_type`, `admin_content_status`
      - table: `admin_content_items` with `draft/published`, ordering, parent linkage, metadata
      - RLS policies: `viewer+` read, `editor+` create/update, `admin` delete.
  - updated typed DB contract:
    - `types/database.ts` (`admin_content_items` + related enums).
  - added reusable admin server gate helper:
    - `lib/admin/server.ts` (`requireAdminRoleFromSupabase`).
  - added admin content payload validation + normalization:
    - `lib/admin/content.ts`.
  - added secured API scaffold:
    - `app/api/admin/content/route.ts` (`GET` list + `POST` create with validation, parent check, slug conflict handling).
  - replaced admin page placeholder with working manager UI:
    - `app/admin/page.tsx`,
    - `components/admin/AdminContentManager.tsx`.
  - added unit coverage:
    - `tests/unit/admin-content.test.ts`.
  - next step: run validation and ship this slice, then add `PATCH/DELETE` endpoints + audit log table.
- `2026-02-18` | `e46c6ce` | CodeQL security hotfix for slice 3:
  - removed regex-based slug sanitizer flagged by `js/polynomial-redos`:
    - `lib/admin/content.ts` now uses linear char-by-char slug normalization.
  - expanded unit coverage for slug normalization behavior:
    - `tests/unit/admin-content.test.ts`.
  - next step: re-run CI/CodeQL on PR `feat/admin-content-crud-scaffold` and merge if green.
- `2026-02-18` | `a0d69d1` | slice 3 merged to `main` (`#53`) and branch cleaned up:
  - merged: `feat/admin-content-crud-scaffold` -> `main`.
  - post-merge hygiene completed:
    - local sync to `origin/main`,
    - local + remote branch deletion,
    - prune fetch.
  - next step: implement slice 4 (`PATCH`/`DELETE` admin content endpoints + audit log table + tests).
- `2026-02-18` | `working tree` | slice 4 implementation in progress on `feat/admin-content-mutations-audit-log`:
  - added new mutation API route:
    - `app/api/admin/content/[id]/route.ts` (`PATCH` for editor+, `DELETE` for admin only).
  - added update payload parser + shared UUID validation:
    - `lib/admin/content.ts` (`parseUpdateAdminContentPayload`, exported `isUuid`).
  - added audit log schema + RLS + trigger-based mutation logging:
    - `supabase/migrations/20260219001500_admin_content_audit_log.sql`.
  - added admin UI row actions:
    - `components/admin/AdminContentManager.tsx` (publish/draft toggle + delete action).
  - added/expanded unit tests:
    - `tests/unit/admin-content.test.ts`.
  - synced generated DB types:
    - `types/database.ts` (`admin_audit_logs`).
  - next step: run CI validation in PR and manual QA for publish/draft/delete + audit entries.

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary
