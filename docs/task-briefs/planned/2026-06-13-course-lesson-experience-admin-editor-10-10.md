# Task Brief: Course Lesson Experience Admin Editor (10/10)

## Metadata

- `id`: `2026-06-13-course-lesson-experience-admin-editor-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-13`
- `updated`: `2026-06-13`

## Brief Audit Record

- `last_audited`: `2026-06-13`
- `base`: `main@81ef191a`
- `audit_status`: `ready`
- `decision`: Keep this as the dedicated follow-up child for admin editing after the public V1 lesson skeleton is approved.
- `reason`: The public V1 child proves the learner layout and data contract, but the current admin course editor only exposes core lesson fields and does not yet make the new lesson-experience fields or practice images easy and safe to edit.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, parent brief, `/course`, `app/course/courseData.ts`, `lib/course/lesson-experience.ts`, `lib/admin/content-course.ts`, `components/admin/AdminContentManager.tsx`, admin content APIs, Supabase storage policy, screenshot handoff rules, scorecard categories, or verification lanes change.

## Parent

- [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- [Course Lesson Experience V1 Pedagogical Layout And Fallback Data](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-06-13-course-lesson-experience-v1-pedagogical-layout-fallback-data-10-10.md)

## Goal

Make the new course lesson experience fields easy, safe, previewable, and rollback-safe for an admin to edit at scale without slowing or polluting the public `/course` learner surface.

## Pre-Implementation Owner Explanation

Når denne senere bygges, skal admin kunne produsere og rette mange leksjoner uten å kode. Jobben er å finne den enkleste redigeringsmodellen først, og så bygge trygg redigering av forklaring, hvorfor øvelsen betyr noe, landøvelse, vannøvelse, bilder, feil/korrigeringer, følelsescues, neste steg og supporttekst. Ute av scope er å endre selve kursinnholdet bredt, bygge PRO-flyt, endre checkout, eller legge admin-only kode inn i public leksjonssiden.

## Decision Gate Before Implementation

Before coding this admin editor, the implementation run must evaluate successful editing patterns from relevant apps, CMS tools, and learning platforms, then recommend one model.

Evaluate at minimum:

- Inline editing directly in a lesson preview.
- Structured side-panel or form editing.
- Table/list editing for high-volume lesson work.
- Autosave versus explicit `Save` plus `Publish`.
- Draft/review/published preview behavior.
- Image replace/upload with required alt text.
- Clear handling of new optional fields, including admin-only placeholder/badge copy such as `New field`.
- Coupled `common mistake + correction` editing.
- Bulk safety for a single admin editing many lessons.

Decision rule:

- Recommend the simplest model that lets one admin edit many lessons confidently.
- Inline editing may be selected only if public `/course` remains fast, cacheable, and free of admin-only code/data.
- If inline editing adds public-route risk, use an admin-only preview/editor surface instead.
- Record the selected model, rejected alternatives, and performance/security tradeoffs in this brief before implementation starts.

## Scope

- Extend the admin course lesson editor for the `lessonExperience` contract:
  - `quickExplanation`
  - `whyThisMatters` with admin label `Why this exercise matters`
  - `landPractice.title`
  - `landPractice.steps`
  - `landPractice.image.src`
  - `landPractice.image.alt`
  - `landPractice.image.caption`
  - `waterPractice.title`
  - `waterPractice.steps`
  - `waterPractice.safetyNote`
  - `waterPractice.image.src`
  - `waterPractice.image.alt`
  - `waterPractice.image.caption`
  - linked `commonMistakes[]` rows with `mistake` and `fix`
  - `feelCues[]`
  - `nextStep`
  - `support.title`
  - `support.body`
- Preserve the linked mistake/correction invariant:
  - one row owns one mistake and its correction,
  - corrections cannot be stored as a separate right-column list,
  - fix/correction without a mistake fails validation,
  - legacy `commonMistakes: string[]` remains readable as mistake-only rows.
- Preserve optional-field behavior:
  - public `/course` must not render `New field` or other placeholder copy,
  - admin may show an explicit `New field` badge or placeholder to prompt editing,
  - blank `whyThisMatters` remains absent from the public payload/render.
- Make practice image editing safe:
  - require useful alt text when a visible image is set,
  - support replace/remove flows,
  - validate allowed image storage/source policy,
  - preview missing images with the public fallback state.
- Keep public `/course` runtime fast:
  - no admin editor bundle on public learner routes,
  - no admin-only data sent to anonymous users,
  - public render remains data-driven through the view-model.
- Preserve existing lesson runtime IDs, preview links, admin notes context, QR behavior, published-content cache rules, and publish workflow.
- Add Help/Guide updates for the new admin editing workflow.
- Add tests for validation, pass-through, preview, rollback-safe editing, and public-route non-regression.

## Out Of Scope

- Producing or rewriting the whole course.
- Creating the final image library for every lesson.
- New PRO save flows, checkout, Stripe, entitlement, refund, invoice, payout, or finance behavior.
- Canonical lesson routes, sitemap changes, structured data, or SEO route migration.
- New analytics dashboards unless needed for admin editor safety diagnostics.
- Changing public support CTA destinations.
- Moving current admin content to a new CMS or adding a new dependency unless the decision gate proves it is necessary.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the scoped 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Admin editor ergonomics
- Admin workflow and editability
- Security and authz
- Reliability and failure handling
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin can find, edit, preview, and publish lesson-experience fields without leaving the course content workflow.                                               | admin flow QA + screenshots                         | `5/5`                   |
| UX flow clarity                               | `target`     | Primary edit, preview, save, publish, cancel, validation, and recovery paths are obvious with no dead-end states.                                              | component/e2e tests + manual QA                     | `5/5`                   |
| Visual design quality                         | `target`     | Admin editing UI matches existing admin tokens, spacing, form patterns, feedback states, and responsive behavior.                                              | screenshot handoff                                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Lesson-experience edits preserve runtime IDs, keep mistake/correction pairs linked, validate image/alt rules, and do not corrupt legacy lesson fields.         | unit tests + API tests + e2e edit/publish flow      | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Decision gate evaluates inline/sidebar/table/autosave patterns and implements the simplest high-volume admin workflow with minimal repeated work.              | decision record + admin QA                          | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Form labels, row controls, image controls, validation errors, preview, keyboard flow, and focus management remain accessible.                                  | component tests + Playwright checks                 | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Public `/course` does not load admin editor code; admin editor keeps acceptable interaction latency for a lesson with rich fields and images.                  | bundle/code review + route smoke                    | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical lesson body fields and storage paths are explicit; local draft state is temporary and cannot silently publish.                                | data contract + save/publish tests                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Admin preview and published `/course` cache behavior stay predictable after edits, publishes, and rollback.                                                    | preview/published cache tests                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Validation, failed saves, failed uploads, missing images, stale previews, and rollback attempts produce recoverable states without data loss.                  | negative-path tests + manual QA                     | `5/5`                   |
| Security and authz                            | `target`     | Editing and image mutation routes are admin-only, fail closed, validate input, and never expose admin-only storage details publicly.                           | unauthorized/forbidden tests + route review         | `5/5`                   |
| Privacy and compliance                        | `target`     | No personal data is collected by the editor; image metadata and errors avoid private storage paths or sensitive local details.                                 | diff review + negative-path assertions              | `5/5`                   |
| Content governance                            | `target`     | Draft/review/published ownership, revision history, rollback path, and field-level content rules are explicit.                                                 | workflow tests + Help/Guide update                  | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin can edit all V1 fields, linked mistake/correction rows, and practice images with clear save/publish feedback.                                            | admin e2e + screenshot handoff                      | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: admin edits may improve public lesson semantics, but canonical route/sitemap work remains a separate child.                                   | no route metadata changes or explicit deferred note | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: structured lesson fields remain semantic and data-driven, while public structured data decisions stay deferred.                               | public payload/render review                        | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting unless admin editor diagnostics are added; no public KPI taxonomy expansion is required by this child.                                              | no-new-event review or explicit event tests         | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: support text may be edited, but checkout, pricing, entitlements, and finance truth stay unchanged.                                            | route/action sweep                                  | `4/5`                   |
| Incident response and support operations      | `target`     | Admin has recovery guidance for failed saves/uploads, bad published content, and rollback from incorrect lesson-experience edits.                              | Help/Guide/runbook update + negative-path QA        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child changes no payments, prices, refunds, invoices, payouts, entitlements, or finance reporting truth.                                      | explicit finance scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because fields and layout must not block future localization, but no locale routing or translation workflow is implemented here.                    | field model review + responsive screenshot review   | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, TypeScript, Supabase/admin-content APIs, admin UI primitives, and test stack; add no dependency without decision-gate evidence.        | dependency diff + code review                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Cover normalization, admin validation, unauthorized paths, save/publish, preview, public fallback render, and screenshot handoff.                              | unit/API/e2e/screenshot evidence + `verify:pre-pr`  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Admin can edit many lessons without route-local code or manual JSON surgery; storage/source rules support future lesson images without runaway public payload. | high-volume workflow review + public payload review | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Changes deploy without schema surprises or include explicit migrations; rollback from bad content and bad code is documented and tested where practical.       | migration/rollback note + pre-merge validation      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminContentManager.tsx`, admin feedback states, and current course preview/open-lesson flows.
  - Keep admin editor code under admin surfaces; public `/course` should consume typed data only.
- TypeScript:
  - Reuse `CourseLessonExperience` and `buildCourseLessonExperienceViewModel`.
  - Add explicit validation helpers for linked mistake/correction rows and image metadata.
  - Treat unknown optional values as absent and never publish malformed pairs.
- Supabase/admin content:
  - Prefer existing `admin_content_items.body` and revision/publish workflow unless execution finds a clear need for migration.
  - If image upload/storage is added, define storage bucket, authz, signed/public URL policy, and cleanup/rollback behavior.
- UI:
  - Compare inline editing, side-panel form editing, and table/list editing before choosing.
  - Use existing admin tokens, cards, form fields, action hierarchy, and feedback states.
- Testing:
  - Unit tests for normalization and validation.
  - API/route tests for unauthorized/forbidden/save failures.
  - E2E for edit, preview, publish, rollback-safe recovery, and public route render.
  - Screenshot handoff for admin editor and public `/course` non-regression if visual surfaces change.

## Data Placement And Sync Contract

- Server-canonical:
  - Course lesson `body.lessonExperience` fields in admin content.
  - Image metadata/path if a practice image is configured.
- Local-only:
  - Unsaved admin form state and temporary validation state.
  - No local-only truth for published content.
- Sync policy:
  - Save writes draft/review content through existing admin content paths.
  - Publish makes content visible through existing published course content cache/invalidation.
  - Failed save/upload preserves the admin draft in the UI until recovery or cancel.
- Retention and sensitivity:
  - No new personal data.
  - Do not expose private storage paths, raw signed URLs, or local filesystem paths in public payloads.
- Cache/invalidation:
  - Admin preview must reflect draft/review state according to current preview mode.
  - Published `/course` updates only after publish/invalidation.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime ID remains immutable and owns progress, notes, QR, preview, and future route mapping.
- Human-readable identifiers:
  - Titles, quick explanations, why-this-matters copy, practice titles, cues, mistakes, corrections, image captions, and support text are editable display content.
- Mutability rules:
  - Display content may be edited in place when the learning object remains the same.
  - Runtime IDs, module IDs, and legacy aliases must not be changed by this editor.
- Rename vs repurpose:
  - Rename/correct copy in place.
  - Create a new lesson if the skill, progression position, or learning object materially changes.
- Compatibility:
  - Legacy `commonMistakes: string[]` must remain readable and editable without losing data.
  - Mistake/correction rows are the forward-compatible shape.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Lesson-experience fields, `whyThisMatters`, practice image metadata, image storage/source rules, linked mistake/correction rows, future locales, future proof/trust snippets, and future analytics values.
- Source of truth:
  - Admin content body remains canonical for lesson text fields until a later migration is explicitly approved.
- Additive behavior:
  - New lessons can use the same editor fields without route-local code.
  - New optional fields can appear as admin prompts without leaking placeholders to public learners.
  - Lessons without practice images continue to render public fallback media containers.
  - Legacy mistake-only data stays valid.
- Explicit mapping requirements:
  - New image storage domains, external asset providers, bulk import formats, locale workflows, analytics events, PRO actions, or structured data require explicit mapping and tests.
- Unknown or deprecated values:
  - Unknown optional fields are ignored in public render.
  - Unknown image sources fail validation or render fallback instead of leaking unsafe URLs.
- Test/evidence:
  - Include a future-value fixture proving the editor is not hardcoded to the first representative V1 lesson.

## Help / Guide Impact

- Required in same implementation PR:
  - Admin Help/Guide instructions for lesson-experience editing.
  - Recovery guidance for failed save/upload/publish and rollback from incorrect content.
  - Explanation of linked mistake/correction rows and image alt-text requirements.

## Route / Label / Support-Surface Impact Sweep

Run before `verify:pre-pr` if this child changes admin labels, support labels, routes, preview links, QR behavior, Help/Guide assertions, or runbooks.

Minimum paths:

- `app/`
- `components/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- active/planned/done task briefs touching `/course` or admin content

## Screenshot Handoff Requirement

This is admin UI work and likely public preview work.

Required after targeted QA and before `npm run verify:pre-pr`:

- Admin editor desktop screenshot.
- Admin editor mobile or narrow screenshot if supported.
- Public `/course` after screenshot proving no learner regression.
- If comparing inline editing to a reference surface, use `after/reference` filenames and explain the reference.

## Acceptance Criteria

1. Decision gate documents the evaluated editor patterns and selects one implementation model.
2. Admin can edit all V1 lesson-experience text fields without JSON editing.
3. Admin can edit linked mistake/correction rows, and the stored data preserves row-level pairing.
4. Fix/correction without a mistake fails validation.
5. Legacy mistake-only lessons remain readable and editable.
6. Admin can add, replace, remove, and preview practice image metadata according to the approved image-source/storage policy.
7. Visible practice images require meaningful alt text.
8. Public `/course` never loads admin editor code or admin-only data.
9. Public lessons without images keep the `Visual not added yet` fallback.
10. Preview/publish/rollback behavior remains clear and tested.
11. Unauthorized users cannot edit content or mutate images.
12. Help/Guide covers the new workflow and recovery paths.
13. Screenshot handoff is approved before PR gate.
14. `npm run verify:pre-pr` passes before PR handoff.

## Validation

- Decision-gate notes in this brief.
- Unit tests for normalization/validation.
- Admin content route tests for authz, invalid pairs, image rules, save failures, and rollback-safe behavior.
- Admin e2e for edit/preview/publish.
- Public `/course` e2e for render fallback and no admin-only leakage.
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` before merge recommendation.

## Checkpoint Log

- `2026-06-13 | planned | created admin-editor follow-up brief from V1 lesson-experience discussion: require decision gate over successful CMS/app editing patterns, evaluate inline editing only if public performance/security stays clean, and preserve linked mistake/correction rows plus practice image editing; next: execute after public V1 skeleton is approved and merged`
- `2026-06-13 | planned | updated requirements after V1 why-field decision: admin editor must expose `whyThisMatters`as`Why this exercise matters`, may use admin-only `New field`placeholder/badge copy, and must keep placeholders out of public`/course`; next: execute this child after public V1 skeleton is approved and merged`
