# Task Brief: Course Lesson Admin/Public Field Parity And View Changes V1 (10/10)

## Metadata

- `id`: `2026-06-14-course-lesson-admin-public-field-parity-and-view-changes-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-14`
- `updated`: `2026-06-14`
- `parent_brief`: [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- `execution_mode`: `end-to-end-after-owner-scope-approval`
- `branch`: `task/course-lesson-admin-public-field-parity-v1`

## Brief Audit Record

- `last_audited`: `2026-06-14`
- `base`: clean synced `main@595e9a64` after PR `#1122` (`ef37b27e`) and closeout PR `#1123` (`595e9a64`); `git status -sb` showed `## main...origin/main`.
- `audit_status`: `ready`
- `decision`: Use this as the next bounded Course Lesson Experience admin/public field-parity child after scope approval. Do not implement until the owner explicitly says to execute/build/implement this brief.
- `reason`: Course lesson V1, admin editor, public visual quality, mark-as-done progress, and analytics/KPI interpretation are merged and closed. The current admin lesson editor can edit many fields, but its order, labels, helper copy, video/estimated-time editability, summary placement, preview action placement, and legacy-field grouping do not yet match the public learner lesson flow.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/course`, `app/course/page.tsx`, `app/course/courseData.ts`, `lib/course/lesson-experience.ts`, `lib/admin/content-course.ts`, `components/admin/AdminContentManager.tsx`, `components/admin/AdminHelpCenter.tsx`, admin content APIs, course preview helpers, route/label/support sweep rules, screenshot handoff rules, or verification lanes change before implementation.

## Goal

Make course lesson create/edit in admin follow the same logical field order, labels, explanations, and preview habit as the public lesson page, while moving legacy/technical fallback fields out of the main authoring flow.

## Pre-Implementation Owner Explanation

Owner scope summary: Admin skal fylle ut en leksjon i samme rekkefolge som brukeren leser den pa leksjonssiden: video/tid, mal, forklaring, hvorfor, landovelse, bassengovelse, folelse, vanlige feil, pass criteria, neste steg og support. Dette betyr noe fordi innholdsarbeidet blir tryggere og mindre teknisk. Utenfor scope er live iframe-preview, mediaopplasting/asset picker, ready-to-publish health checklist, lesson templates og stor public lesson redesign.

Forward-compatibility-intent: nye leksjonsfelt skal enten automatisk folge admin/public mapping-kontrakten nar de bruker eksisterende section-monster, eller kreve eksplisitt produkt-/mapping-beslutning med trygg fallback for ukjente og eldre felt.

## Admin/Public Audit Findings

- Public lesson order in `app/course/page.tsx` is effectively: video/player + estimated time metadata, lesson focus with `Goal` and `Quick explanation`, `Why this matters`, `Dryland practice`, `Pool drill`, `Feel cues`, `Common mistakes`, `Pass criteria`, `Next step`, and support card.
- Public render uses `buildCourseLessonExperienceViewModel(activeLesson)` from `lib/course/lesson-experience.ts`, with fallbacks from legacy lesson body fields when richer `lessonExperience` fields are absent.
- Admin lesson edit in `components/admin/AdminContentManager.tsx` currently starts with generic metadata (`Summary`, type, badge, support actions), then core body fields, then a nested `Lesson experience` block. This makes the editor order unlike the learner page.
- `Summary` is currently placed as a normal top-level text area, but the public lesson page primarily uses `goal`, `quickExplanation`, practice fields, pass criteria, and support copy. Summary needs to be framed as admin/list/search/fallback copy rather than the main lesson explanation.
- `youtubeId` and `estMinutes` are part of the public/course data contract in `app/course/courseData.ts` and `lib/admin/content-course.ts`, but they are not editable in the current lesson edit state.
- Admin still labels the pass gate input `Checkpoint criteria (one per line)` even though public copy and behavior now uses `Pass criteria`.
- Admin has both legacy/core content fields (`cues`, `drill`, `commonMistakes`, `nextStep`) and rich lesson-experience fields. This slice must keep legacy content fields safe in `Advanced/fallback fields`, move current structured visibility to `Show section` controls on the sections themselves, and stop exposing legacy visibility flags as normal authoring controls.
- Existing `Open preview` links exist in lists/rows, but the edit/save action cluster does not yet include a clear `View changes` action beside save/edit controls.

## Admin/Public Field Mapping

| Public section                   | Admin field label                               | Data key                                                              | Editable in V1? | Reason if no / notes                                                                                                   |
| -------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Video / estimated time           | Video ID                                        | `body.youtubeId`                                                      | `yes`           | Public player uses only the YouTube video ID. Admin helper must say not to paste a full URL.                           |
| Video / estimated time           | Estimated minutes                               | `body.estMinutes`                                                     | `yes`           | Public lesson metadata uses this as a compact time estimate; validate as a small positive integer.                     |
| Lesson focus / Goal              | Lesson goal                                     | `body.goal` and/or `body.lessonExperience.goal` if introduced later   | `yes`           | Main admin label may stay `Lesson goal`, but helper must say public label is `Goal` on the lesson page.                |
| Lesson focus / Quick explanation | Quick explanation                               | `body.lessonExperience.quickExplanation`                              | `yes`           | Matches public label exactly. Helper must explain this is the short plain-language instruction after goal.             |
| Lesson focus / Why this matters  | Why this matters                                | `body.lessonExperience.whyThisMatters`                                | `yes`           | Rename admin label from `Why this exercise matters` to public wording. Render only when authored.                      |
| Dryland practice                 | Dryland practice title                          | `body.lessonExperience.landPractice.title`                            | `yes`           | Main flow field. Helper must explain it appears under public `Dryland practice`.                                       |
| Dryland practice                 | Dryland practice steps                          | `body.lessonExperience.landPractice.steps[]`                          | `yes`           | One step per line; existing image metadata remains pass-through and non-editable in this slice.                        |
| Pool drill                       | Pool drill / water practice title               | `body.lessonExperience.waterPractice.title`                           | `yes`           | Main flow field. Use public wording `Pool drill` while keeping water-practice data key visible in helper/audit.        |
| Pool drill                       | Pool drill / water practice steps               | `body.lessonExperience.waterPractice.steps[]`                         | `yes`           | One step per line; safety note remains part of water practice.                                                         |
| Pool drill                       | Water practice safety note                      | `body.lessonExperience.waterPractice.safetyNote`                      | `yes`           | Public note appears inside the Pool drill card when authored.                                                          |
| Feel cues                        | Feel cues                                       | `body.lessonExperience.feelCues[]`                                    | `yes`           | Matches public label exactly. Helper must mention one cue per line and public cue-card behavior.                       |
| Common mistakes                  | Common mistakes                                 | `body.lessonExperience.commonMistakes[].mistake`                      | `yes`           | Keep paired row editor; public heading and row header use `Common mistakes` / `Common mistake`.                        |
| Common mistakes                  | Correction                                      | `body.lessonExperience.commonMistakes[].fix`                          | `yes`           | Editable as paired correction; correction without mistake remains invalid.                                             |
| Pass criteria                    | Pass criteria                                   | `body.passCriteria[]`                                                 | `yes`           | Rename admin label from `Checkpoint criteria` to `Pass criteria`; public gate uses these rows.                         |
| Next step                        | Next step                                       | `body.lessonExperience.nextStep` with legacy `body.nextStep` fallback | `yes`           | Main field should use public label. Legacy `body.nextStep` fallback belongs in Advanced/fallback if both exist.        |
| Support card                     | Support card title                              | `body.lessonExperience.support.title`                                 | `yes`           | Public support card title. Support action mapping remains advanced unless the main card needs a simple visibility cue. |
| Support card                     | Support card body                               | `body.lessonExperience.support.body`                                  | `yes`           | Public support card body. Helper must say this appears after free lesson value.                                        |
| Admin/list fallback              | Summary                                         | row `summary`                                                         | `yes`           | Not a primary public lesson section. Move to explicit admin/list/search/fallback area with helper text.                |
| Optional public sections         | Show section                                    | `body.lessonExperience.display.*`                                     | `yes`           | Each optional structured section controls its own public visibility without deleting saved draft content.              |
| Advanced/fallback fields         | Lesson experience layout                        | `body.lessonExperience.variant`                                       | `yes`           | Technical preset for structured section visibility; keep editable, but outside the writing fields.                     |
| Legacy visibility flags          | Not exposed in this V1 UI                       | `body.display.*`                                                      | `no`            | Preserved as pass-through/public fallback data until the dedicated cleanup brief decides migration/removal.            |
| Advanced/fallback fields         | Lesson type                                     | `body.lessonType`                                                     | `yes`           | Public badge/default variant input; not a pedagogical writing field.                                                   |
| Advanced/fallback fields         | Section badge label                             | `body.drillLabel`                                                     | `yes`           | Public pill/badge override. Keep separate from main `Pool drill` copy.                                                 |
| Advanced/fallback fields         | Extra help start lesson number                  | `body.supportStartAtLessonInModule`                                   | `yes`           | Controls when support card starts by module position; technical placement rule.                                        |
| Advanced/fallback fields         | Extra help actions / primary highlighted action | `body.supportCard.actions.*`, `body.supportCard.primaryAction`        | `yes`           | Public support-card action mapping; keep separate from title/body writing fields.                                      |
| Advanced/fallback fields         | Legacy cues                                     | `body.cues[]`                                                         | `yes`           | Public fallback for primary cue/feel cues. Keep editable for old content, but not in main flow.                        |
| Advanced/fallback fields         | Legacy drill title/steps                        | `body.drill.title`, `body.drill.steps[]`                              | `yes`           | Public fallback for water practice when rich water practice is absent. Keep as fallback fields.                        |
| Advanced/fallback fields         | Legacy common mistakes                          | `body.commonMistakes[]`                                               | `yes`           | Public fallback for mistake-only legacy lessons. Keep advanced to avoid duplicate authoring.                           |
| Identity / preview               | Lesson runtime ID                               | resolved runtime ID from body/slug                                    | `no`            | Read-only locked identity for routing, progress, notes, preview, analytics, and QR links.                              |
| Identity / preview               | Slug                                            | row `slug`                                                            | `yes`           | Human-readable key remains editable carefully, but runtime ID stays canonical.                                         |

## Scope

- Reorganize the course lesson edit form in `components/admin/AdminContentManager.tsx` around the public lesson order:
  - Video / estimated time
  - Lesson goal
  - Quick explanation
  - Why this matters
  - Dryland practice
  - Pool drill / water practice
  - Feel cues
  - Common mistakes
  - Pass criteria
  - Next step
  - Support card
- Add editable admin fields for `youtubeId` and `estMinutes` in lesson create/edit flow where the existing form state/body payload pattern supports them safely.
- Use the same public section wording in admin labels where practical:
  - `Quick explanation`
  - `Why this matters`
  - `Dryland practice`
  - `Pool drill`
  - `Feel cues`
  - `Common mistakes`
  - `Pass criteria`
  - `Next step`
  - `Support card`
- Rename admin `Checkpoint criteria (one per line)` to `Pass criteria`.
- Add concise helper text for every unclear field explaining where it appears publicly and why admin fills it out.
- Present the main lesson fields as a `Public lesson mirror` surface that uses the same approximate max-width, section grouping, card rhythm, and practice media/content split as the public lesson page.
- Mark field groups by content destination:
  - `Shown on lesson page` for public learner-facing lesson content,
  - `Admin/list only` for Summary and list/search fallback,
  - `Advanced/fallback` for technical or older fallback content.
- Show practice media placeholders inside the Dryland practice and Pool drill / water practice cards, in the same position images occupy on the public lesson page, with clear `Not editable in this slice` copy.
- Move `Summary` into a clearly labeled admin/list/search/fallback area with helper copy explaining it is not the main public lesson explanation.
- Move current structured section visibility to `Show section` checkboxes on each optional public section.
- Move legacy/technical content controls into `Advanced/fallback fields`:
  - lesson type,
  - section badge label,
  - extra help start lesson number,
  - support action mapping and primary highlighted action,
  - legacy cues,
  - legacy drill title/steps,
  - legacy mistake-only rows,
  - other older fallback fields discovered during implementation.
- Do not expose legacy visibility flags (`body.display.*`) as normal admin controls in this slice; preserve them as data/pass-through and defer deletion/migration to the dedicated cleanup brief.
- Add `View changes` near save/edit actions. It should open the correct lesson preview in a new tab/window and not replace the current admin tab.
- Preserve the current preview route contract, admin-only preview gating, revision/publish workflow, locked runtime ID, slug guidance, QR/admin notes links, and existing save/cancel/error behavior.
- Add a deterministic field-parity test/audit proving relevant public sections have a matching admin control or a documented reason for no editable control.
- Update Admin Help/Guide for the renamed/reordered course lesson fields, Summary purpose, `View changes`, and Advanced/fallback fields.
- Capture screenshot handoff before `npm run verify:pre-pr` because this is admin UI work.

## Out Of Scope

- Full live iframe-preview or side-by-side live preview.
- Media/image upload, visual asset picker, storage policy, or asset-library UI.
- Ready-to-publish health checklist.
- Create lesson from template.
- Larger redesign of the public lesson page.
- Coach-yourself question prompts such as leg/arm/head-position self-checks; this is a later product/content decision and must not duplicate the current Goal, Feel cues, Common mistakes, or Pass criteria fields.
- New canonical lesson routes, sitemap, structured data, SEO route migration, share routes, email capture, or distribution funnel.
- New PRO save flows, checkout, Stripe, entitlement, finance, invoice, payout, refund, or revenue reporting behavior.
- Bulk import/editing or full CMS replacement.
- New database migration unless implementation proves the existing JSON body contract cannot safely carry scoped fields.

## Deferred / Next Admin Slices

1. `Lesson Media And Visual Asset Admin V1`
   - Redigere/velge bilder og visuelle assets for dryland/water practice.
   - Must define storage/authz, asset ownership, alt text, cleanup, rollback, and screenshot/export evidence.
2. `Lesson Health Checklist / Ready To Publish`
   - Sjekke om leksjonen har alt den trenger for publisering.
   - Must define which fields are required by lesson variant, which are warnings, and how publish blocking works.
3. `Create Lesson From Template`
   - Ny leksjon starter med komplett pedagogisk struktur, ikke tomme tilfeldige felt.
   - Must define default variant templates, identity rules, copy placeholders, and safe removal/overwrite behavior.
4. `Side-by-side live preview`
   - Later larger scope because auth, preview mode, iframe/CSP, focus management, cache behavior, and security need a separate design decision.
5. `Course Lesson Legacy Field Cleanup And Migration V1`
   - Planned brief: [Course Lesson Legacy Field Cleanup And Migration V1](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-14-course-lesson-legacy-field-cleanup-and-migration-v1-10-10.md)
   - Audit old lesson JSON keys, decide keep/migrate/remove per field, migrate seed/draft content if needed, then remove public fallback reads only with tests and rollback evidence.
6. `Course Lesson Coach Yourself Prompt Layer V1`
   - Decide whether lessons should include 2-3 self-coaching questions derived from existing Goal, Feel cues, Common mistakes, and Pass criteria.
   - Avoid a fixed body-part checklist unless a lesson explicitly needs it; generic "legs/arms/head" prompts risk duplicating focus items and drowning the lesson.

These deferred names are stable search handles. They must remain in the parent/brief trail so they do not disappear after this PR.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the scoped 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Admin editor ergonomics
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Content governance
- Admin workflow and editability
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                              | Evidence                                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Course lesson admin edit follows the public lesson flow from video/tid through support card, while deferred slices are explicitly parked.                                                       | admin/public mapping audit + screenshot handoff + owner approval | `5/5`                   |
| UX flow clarity                               | `target`     | Admin can scan the form in the same order a learner sees the lesson, understand each field, save, and use `View changes` without a dead end.                                                    | component tests + admin QA + screenshots                         | `5/5`                   |
| Visual design quality                         | `target`     | Reorganized admin form uses existing admin tokens, spacing, fieldsets, helper text, responsive behavior, and no overlapping/clipped labels.                                                     | after/reference screenshot artifacts                             | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Saves preserve runtime IDs, slug behavior, preview links, rich lessonExperience data, legacy fallback fields, video ID, estimated minutes, paired mistakes, and pass criteria.                  | unit/API tests + parity audit test                               | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Main authoring fields are first; Summary and advanced/fallback fields are clearly separated; video/time and preview are reachable near edit actions.                                            | admin component tests + screenshot review                        | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Field labels, helper text, fieldsets, error states, `View changes` link, new-tab behavior, and advanced disclosure semantics remain keyboard/screen-reader safe.                                | Testing Library assertions + Playwright/screenshot review        | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Public `/course` loads no admin editor code and keeps existing route budget intent; admin UI adds no heavy dependency or live iframe.                                                           | package diff + route/build/perf gate                             | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical lesson row/body fields and local-only unsaved form state are documented; no new local published truth or sync model is added.                                                  | data contract + diff review                                      | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing admin save/preview/publish and public content cache behavior are reused; `View changes` opens preview without changing cache policy.                                                   | preview tests + route/cache review                               | `5/5`                   |
| Reliability and failure handling              | `target`     | Invalid video ID/minutes, invalid paired mistake rows, failed saves, preview unavailable states, and missing legacy fields render recoverable errors.                                           | negative-path tests + manual QA                                  | `5/5`                   |
| Security and authz                            | `target`     | Admin edit and preview remain admin-only/fail-closed; new `View changes` uses existing preview helpers and no public admin data leak.                                                           | authz route tests + preview test                                 | `5/5`                   |
| Privacy and compliance                        | `supporting` | No personal data, visitor identifiers, raw secrets, or private storage paths are introduced; video IDs are public lesson metadata.                                                              | diff review + no-secret check                                    | `4/5`                   |
| Content governance                            | `target`     | Field ownership, Summary fallback role, advanced/fallback fields, preview habit, Help/Guide guidance, and deferred admin slices are documented.                                                 | Help/Guide update + brief evidence                               | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin can create/edit all scoped public lesson fields, save/cancel, preview changes, and still access fallback/technical controls safely.                                                       | component/e2e tests + screenshot handoff                         | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public section labels remain semantic, but no metadata, canonical route, sitemap, robots, or structured data change ships here.                                                | route/metadata diff review                                       | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: admin/public field structure keeps semantic lesson sections clear, but no structured data or AI-facing crawl surface is added.                                                 | parity audit + explicit deferred SEO child                       | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing lesson analytics should continue to use runtime lesson/module IDs; no new event taxonomy is required by this slice.                                                   | no-new-event review or targeted analytics regression test        | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: support card copy/action editability remains honest, but checkout, entitlement, pricing, revenue, and finance truth are unchanged.                                             | support-action route sweep                                       | `4/5`                   |
| Incident response and support operations      | `target`     | Help/Guide explains bad content recovery, previewing changes, old-field fallback behavior, and when deferred media/health/template work is needed.                                              | Admin Help/Guide update + support sweep                          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this changes no payments, prices, checkout, entitlements, refunds, invoices, payouts, revenue reports, or finance reconciliation truth.                                             | explicit finance scope rationale                                 | `N/A`                   |
| i18n operational readiness                    | `supporting` | Admin labels/help text stay short and section-based so a later locale workflow can map public/admin fields without route-local assumptions.                                                     | responsive screenshots + field mapping review                    | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `AdminContentManager`, current admin content APIs, preview helpers, course view-model contract, TypeScript validation, Tailwind tokens, and existing tests; add no dependency by default. | package diff + code review                                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused unit/component/API/e2e coverage plus admin/public field parity audit, screenshot handoff, `lint:briefs`, `verify:pre-pr`, CI, and `verify:pre-merge`.                               | local gates + CI + screenshot artifacts                          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | New lessons and future fields can use the same mapping pattern without per-lesson hardcoding, live iframe cost, or manual JSON surgery.                                                         | future-value fixture + parity audit                              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/provider/env dependency by default; rollback is a code revert plus content remains compatible through preserved fallback fields.                                                   | PR rollback note + verification gates                            | `5/5`                   |

## Skill / Capability Audit

- Available now: `playwright` skill for screenshot/browser QA, existing repo Playwright/Vitest coverage, local admin/content tests, current admin preview helpers, and first-party course/content contracts.
- Evaluate later: `imagegen` only for future visual asset work; Stripe plugin skills only if a later PRO/checkout child changes billing, Checkout, subscriptions, entitlements, or finance boundaries.
- Install/config changes: none.

Systemic findings:

| Surface                          | Finding                                                                                                                                      | Severity | Recommended Type                 | Owner Decision Needed    | Follow-Up Brief Path                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------ | ---------------------------------------------- |
| Admin/public lesson field parity | Admin has the needed rich fields, but the current order and labels do not mirror the public lesson page.                                     | `high`   | `bounded implementation child`   | `no`                     | this brief                                     |
| Lesson media/admin assets        | Public supports practice image metadata/fallbacks, but admin still cannot edit/select media safely.                                          | `medium` | `bounded implementation child`   | `yes, before media work` | `Lesson Media And Visual Asset Admin V1`       |
| Coach-yourself prompts           | Self-check questions may improve reflection, but only if derived from existing lesson focus/cues/pass criteria instead of a fixed checklist. | `low`    | `deferred architecture decision` | `yes`                    | `Course Lesson Coach Yourself Prompt Layer V1` |
| Live preview                     | A live side-by-side preview would improve confidence, but auth/preview-mode/iframe/CSP/security make it a larger architecture decision.      | `medium` | `deferred architecture decision` | `yes`                    | `Side-by-side live preview`                    |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md`
- Current child status: planned in this file.
- Last merged workstream: PR `#1122` (`ef37b27e`) and closeout PR `#1123` (`595e9a64`).
- Exact next planning step: owner reviews/edits this scope; implementation starts only after explicit execute/build/implement instruction.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminContentManager.tsx` as the admin surface and `app/course/page.tsx` as the public reference surface.
  - Reuse existing save/cancel/error/action strip patterns and existing preview href helpers.
  - Keep public `/course` unchanged except for tests if implementation does not need public rendering changes.
- TypeScript/domain contracts:
  - Extend `LessonBodyEditState`, normalization, compare, validation, and payload building for `youtubeId` and `estMinutes`.
  - Reuse `CourseLesson`, `CourseLessonExperience`, and `buildCourseLessonExperienceViewModel`.
  - Keep unknown optional values absent/safe rather than rendering placeholder copy publicly.
- Supabase/data layer:
  - Prefer existing `admin_content_items.body` JSON fields and row `summary`; no migration by default.
  - Protected admin APIs must keep existing authz and fail-closed behavior.
- External services/tools:
  - No new providers, SDKs, analytics vendors, Stripe calls, media services, or secrets.
- UI system:
  - Mature reference surfaces are public `/course` section labels/order and existing admin content manager form primitives.
  - Use existing admin token classes, fieldsets, helper text style, state primitives, and action classes.
  - Main lesson authoring surface should mirror the public `/course` lesson column (`PageTemplate size="wide"` max-width behavior, public section cards, and practice media/content split) while keeping inputs accessible and admin-specific controls visibly distinct.
  - Screenshot handoff comparison type: `after/reference`, comparing changed admin editor screenshots to the public lesson reference and existing admin token patterns. Use before/after only if practical before-state screenshots are captured before implementation.
- Testing:
  - Unit tests for normalization/payload/validation of video ID, estimated minutes, renamed pass criteria, Summary placement assumptions, and legacy fallback preservation.
  - Component tests for rendered labels, helper text, advanced grouping, `View changes`, and no loss of save/cancel behavior.
  - E2E or targeted Playwright for preview new-tab behavior if component tests cannot prove it.
  - Static/parity audit test for public/admin field mapping.

## Data Placement And Sync Contract

- Server-canonical:
  - Course lesson row metadata: title, slug, summary, category, status, parent module, sort order.
  - Course lesson body: `youtubeId`, `estMinutes`, `goal`, `lessonExperience.*`, `passCriteria`, legacy fallback fields, support-card settings, and display controls.
- Local-only:
  - Unsaved admin form state, dirty state, validation errors, expanded advanced/fallback UI, and browser preview tab state.
  - No local-only truth for published lesson content.
- Sync policy:
  - Save writes through existing admin content mutation flow.
  - Preview opens existing admin preview route and does not publish.
  - Publish/revision/rollback behavior stays owned by current admin content workflow.
- Retention and sensitivity:
  - No new personal data.
  - Do not expose secrets, local paths, private storage paths, or arbitrary external URLs.
- Cache/invalidation:
  - Preserve current admin no-store fetch/mutation behavior and published `/course` content cache/invalidation.
  - `View changes` must use preview mode rather than forcing public published content refresh.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime ID remains the locked identity for routing, progress, notes, analytics, preview, QR, and future canonical routes.
- Human-readable identifiers:
  - Title, slug, Summary, Goal, Quick explanation, Why this matters, practice titles/steps, cues, mistakes, corrections, pass criteria, next step, support copy, and video ID are editable content/metadata when the learning object is unchanged.
- Mutability rules:
  - Runtime ID is immutable after creation.
  - Slug may be carefully renamed as human-readable admin/public key, but must not replace runtime identity.
  - `youtubeId` can be edited when replacing the video for the same lesson; materially different learning content needs a new lesson.
- Rename vs repurpose:
  - Copy improvements, label clarity, video replacement for the same lesson, and time estimate correction are edits in place.
  - A different skill, progression position, or lesson promise must be created as a new row/entity.
- Compatibility:
  - Legacy `body.cues`, `body.drill`, `body.commonMistakes`, `body.nextStep`, and `body.display.*` remain readable fallback fields.
  - Unknown legacy fields must remain pass-through unless explicitly removed by a later migration brief.
- Observability and repair:
  - Admin Help/Guide and validation messages should make it clear when a field is advanced/fallback versus main public lesson copy.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Public lesson sections, admin field labels, data keys, video metadata, lesson variants, structured section visibility, legacy fallback fields, practice media, support actions, future health checks, templates, live preview, routes, analytics payloads, and locales.
- Source of truth:
  - Public render derives from canonical course content and `buildCourseLessonExperienceViewModel`.
  - Admin/public mapping table in this brief is the release checklist for this slice.
  - Deferred admin slices use stable names in this brief and the parent trail.
- Additive behavior:
  - New lessons using existing `lessonExperience` fields automatically inherit the main admin field order.
  - New fields that fit an existing section pattern should be added to that section with a helper and parity audit entry.
  - Current structured optional sections use local `Show section` controls on the section itself.
  - Existing unknown/older fallback content fields remain in `Advanced/fallback fields` or are ignored safely by public render.
- Explicit mapping requirements:
  - New public lesson sections, new lesson variants, new media providers, new support/PRO actions, new publish-health rules, new templates, canonical routes, locale workflows, analytics events, or commerce destinations require explicit product/mapping decision, tests, Help/Guide review, and screenshot evidence.
- Unknown or deprecated values:
  - Unknown display keys are ignored.
  - Unknown optional content fields do not render public placeholder copy.
  - Invalid video IDs/minutes fail validation or fall back safely without publishing malformed content.
  - Deprecated legacy content fields remain editable in Advanced/fallback until a cleanup brief explicitly removes them.
  - Deprecated legacy visibility flags remain pass-through data, not admin-visible controls, until [Course Lesson Legacy Field Cleanup And Migration V1](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-14-course-lesson-legacy-field-cleanup-and-migration-v1-10-10.md) decides migration/removal.
- Test/evidence:
  - Add a parity audit test/fixture that lists public sections, admin labels, data keys, editability, and documented deviations.
  - Include at least one future-field fixture or unknown legacy field proving the admin/public mapping does not hardcode only today's sample lesson rows.
  - Route/label/support sweep must include the deferred slice names so future work is discoverable.

## Help / Guide Impact

Required in same implementation PR because this changes admin workflow labels, field order, helper text, preview action placement, and recovery guidance:

- Explain the public lesson order and where each admin field appears.
- Explain `Public lesson mirror`, `Shown on lesson page`, `Admin/list only`, and `Advanced/fallback` labels.
- Explain `Summary` as admin/list/search/fallback copy, not the main public explanation.
- Explain `View changes` and preview-vs-published behavior.
- Explain `Show section` as the section-level visibility control for structured public sections.
- Explain `Advanced/fallback fields` and why legacy cues/drill/mistakes still exist as older draft/fallback content.
- Explain that legacy visibility cleanup/migration is deferred to [Course Lesson Legacy Field Cleanup And Migration V1](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-14-course-lesson-legacy-field-cleanup-and-migration-v1-10-10.md).
- Explain that media/asset editing, publish-health checks, templates, and live preview are deferred.

## Route / Label / Support Surface Sweep

Required before the first broad gate because this slice renames/repositions labels and touches Help/Guide/admin preview behavior.

Identifiers searched:

- `Checkpoint criteria`
- `Pass criteria`
- `Lesson experience next step`
- `Why this exercise matters`
- `Summary`
- `Video ID`
- `Estimated minutes`
- `Show section`
- `View changes`
- `Open preview`
- `Advanced/fallback fields`
- `Dryland practice`
- `Pool drill`
- `Water practice`
- `Feel cues`
- `Common mistakes`
- `Support card`
- `Lesson Media And Visual Asset Admin V1`
- `Lesson Health Checklist / Ready To Publish`
- `Create Lesson From Template`
- `Side-by-side live preview`
- `Course Lesson Legacy Field Cleanup And Migration V1`

Surfaces checked:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/task-briefs/planned/`
- `docs/task-briefs/in-progress/`
- `docs/task-briefs/done/`
- Admin Help/Guide assertions
- course preview e2e assertions

Expected fallout:

- Admin labels and tests updated from `Checkpoint criteria` to `Pass criteria`.
- Help/Guide updated for changed admin workflow.
- Public route behavior unchanged unless tests reveal a mismatch that is explicitly in this scope.
- Fallout handled: stale admin/public labels, Help/Guide assertions, admin foundation e2e labels, parity audit expectations, and deferred slice names are updated or documented.

## Screenshot Handoff Requirement

This is UI work. After targeted implementation QA is stable and before `npm run verify:pre-pr`, capture a screenshot handoff with a clickable artifact folder.

Required handoff:

- Admin lesson edit form desktop after screenshot.
- Admin lesson edit form narrow/mobile after screenshot if supported locally.
- Public lesson reference screenshot for the same lesson, or a before/after public screenshot if public rendering changed.
- Screenshot naming must be `after/reference` unless implementation captures true before-state artifacts before editing.
- If product-rendering files change after screenshot capture, regenerate screenshots before gates.

## Acceptance Criteria

1. A course lesson admin edit form follows the public section order: Video / estimated time, Lesson goal, Quick explanation, Why this matters, Dryland practice, Pool drill / water practice, Feel cues, Common mistakes, Pass criteria, Next step, Support card.
2. All relevant public sections have a corresponding admin control or a documented reason for no editable control in the parity audit.
3. Admin labels match public labels where practical; `Checkpoint criteria` is renamed to `Pass criteria`.
4. Every unclear field has helper text explaining where it appears on the public lesson page and why admin fills it in.
5. `Summary` is clearly explained as admin/list/search/fallback copy and visually separated from the main public lesson authoring flow.
6. `youtubeId` and `estMinutes` are editable with validation and safe payload preservation.
7. `View changes` appears near save/edit actions and opens the correct lesson preview in a new tab/window.
8. The main editable lesson content is visually presented as a `Public lesson mirror` with the same approximate public lesson max-width, section grouping, card rhythm, and practice media/content split as `/course`.
9. Dryland and Pool drill sections show image/visual placeholders in the same left-side position public media uses, clearly marked as not editable in this slice.
10. Admin clearly distinguishes `Shown on lesson page`, `Admin/list only`, and `Advanced/fallback` content groups.
11. Structured optional public sections have local `Show section` checkboxes on the section itself; no separate `Show on public lesson` or `Legacy section visibility` control group remains in Advanced.
12. Legacy/technical content fields are grouped under `Advanced/fallback fields` and are not mixed into the main public section flow.
13. Existing legacy fallback behavior for cues, drill, common mistakes, next step, support actions, and display flags remains readable/pass-through safe, while deletion/migration is deferred to the dedicated cleanup brief.
14. Runtime IDs, preview links, QR/admin notes links, save/cancel/error states, revision/publish workflow, and authz behavior remain intact.
15. Admin Help/Guide explains the changed field flow, Public lesson mirror, Summary role, section-level `Show section`, `View changes`, and deferred admin slices.
16. Screenshot handoff is approved before `npm run verify:pre-pr`.
17. Changed task brief(s) pass `npm run lint:briefs`; implementation branch passes relevant targeted tests and `npm run verify:pre-pr` before PR update.

## Validation

Planning-only validation:

- `npm run lint:briefs`

Implementation validation when owner approves execution:

- Focused unit tests for lesson body normalization/payload/validation.
- Focused component tests for admin field order, public mirror labels, helper text, Summary area, section-level `Show section`, practice visual placeholders, Advanced/fallback grouping, and `View changes`.
- Admin/public parity audit test.
- Preview new-tab behavior test where practical.
- Admin Help/Guide assertions.
- Route/label/support surface sweep evidence.
- Screenshot handoff approval before `npm run verify:pre-pr`.
- `npm run verify:pre-pr`
- CI required checks.
- `npm run verify:pre-merge` before merge recommendation.

## Checkpoint Log

- `2026-06-14 | planned | recovery confirmed clean synced main@595e9a64 after PR #1122 and closeout PR #1123; created planned Course Lesson Admin/Public Field Parity And View Changes V1 child on branch task/course-lesson-admin-public-field-parity-v1 with field mapping, audit findings, scorecard, stack/data/identity/forward-compat contracts, Help/Guide impact, deferred admin slice names, acceptance criteria, and no runtime implementation | next: owner scope review/approval before implementation starts`
- `2026-06-14 | in-progress | owner approved scope with "scope godkjent"; moved brief to in-progress on branch task/course-lesson-admin-public-field-parity-v1; screenshot handoff remains required before verify:pre-pr because this is admin UI work | next: implement scoped admin/public field parity changes and targeted tests`
- `2026-06-14 | implementation-checkpoint | implemented the scoped admin lesson editor parity changes: public-order field flow, editable Video ID and Estimated minutes, `Pass criteria`label, Summary admin/list fallback section,`Advanced/fallback fields`, `View changes`near save actions, Help/Guide updates, API validation copy alignment, and admin/public parity audit coverage. Targeted validation passed:`npm run typecheck`, `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/course-lesson-admin-public-field-parity.test.ts tests/unit/admin-help-center.test.tsx tests/unit/admin-content.test.ts tests/unit/admin-content-route.test.ts`(53 tests),`npm run lint:briefs:all`, and `git diff --check`. Route/label/support sweep covered stale `Checkpoint criteria`, old lesson-experience labels, Help/Guide assertions, and admin foundation e2e labels. Screenshot handoff artifacts captured at `output/course-lesson-admin-public-field-parity-2026-06-14-100945`using a temporary local visual harness with mocked admin APIs because`/admin`requires auth; harness route was removed before this checkpoint. | next: owner screenshot approval before`npm run verify:pre-pr`, PR creation, or pre-merge gates`
- `2026-06-14 | owner-feedback-checkpoint | owner challenged whether section visibility should live on each section and whether legacy fields should be removed because there are no users/finished lessons yet. Decision: keep the data/public fallback contract in this slice, move structured visibility to section-level `Show section`controls, remove legacy visibility controls from admin UI, keep legacy content fields in Advanced/fallback, and create the planned cleanup brief`docs/task-briefs/planned/2026-06-14-course-lesson-legacy-field-cleanup-and-migration-v1-10-10.md` for any later migration/removal. | next: update implementation/tests/screenshots to match this clarified contract`
- `2026-06-14 | post-feedback-screenshot-checkpoint | implemented the clarified section visibility contract: every optional structured public section now has a local `Show section`checkbox,`Show on public lesson`and`Legacy section visibility`groups are removed from Advanced, Help/Guide and tests describe the section-level behavior, and the dedicated cleanup brief is linked from this brief and the parent. Targeted validation passed again:`npm run lint:briefs:all`, `npm run typecheck`, and `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/course-lesson-admin-public-field-parity.test.ts tests/unit/admin-help-center.test.tsx tests/unit/admin-content.test.ts tests/unit/admin-content-route.test.ts`(53 tests). Updated screenshot artifacts captured at`output/course-lesson-admin-public-field-parity-2026-06-14-121558`using a temporary local visual harness with mocked admin notes/QR/content APIs because`/admin`requires auth; harness route was removed and the local dev server was stopped after capture. | next: owner screenshot approval before`npm run verify:pre-pr`, PR creation, or pre-merge gates`
- `2026-06-14 | public-mirror-visual-checkpoint | implemented the owner's visual parity refinement: the main editor now uses a `Public lesson mirror`surface with public-like max-width/card rhythm, a combined Lesson focus card for Goal/Quick explanation/Why this matters, Dryland and Pool drill media placeholders in the public media position, Pass criteria and Next step side-by-side on desktop, and clear`Shown on lesson page`/`Admin/list only`/`Advanced/fallback`/`Not editable here`labels. Targeted validation after this visual pass:`npm run typecheck`PASS, targeted Vitest PASS (5 files / 53 tests),`git diff --check`PASS;`npx playwright test tests/e2e/admin-help-center.spec.ts --project=desktop-chromium`exited 0 with the single test skipped locally because dev-login/Supabase returned HTML instead of JSON. Updated screenshot artifacts captured at`output/course-lesson-admin-public-field-parity-2026-06-14-130600`using a temporary local visual harness with mocked admin content/notes/QR APIs because`/admin`requires auth; the harness route was removed and local dev server stopped after capture. | next: owner screenshot approval before`npm run verify:pre-pr`, PR creation, or pre-merge gates`
- `2026-06-14 | screenshot-approved | owner approved the screenshot handoff and requested continuation; active PR flow may proceed to `npm run verify:pre-pr`, commit, push, PR creation, CI monitoring, and pre-merge validation. The separate "build a lesson to learn more" learning/content idea remains outside this parity slice and should become a later scoped lesson-production brief if selected. | next: run pre-PR gate`
