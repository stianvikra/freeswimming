# Task Brief: Drill Library Templates And Favorites (10/10)

## Metadata

- `id`: `2026-02-28-drill-library-templates-and-favorites-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

## Goal

Provide a fast drill/template catalog that makes workout creation significantly faster for adult freestyle learners.

## Scope

- Drill library read UX with filters:
  - type, level, equipment, focus tags.
- Favorites:
  - add/remove favorite,
  - quick access section.
- Template library:
  - one-click insert into builder,
  - editable after insert.
- Admin CRUD for drills/templates with governance fields.

## Out Of Scope

- AI generation logic.
- Garmin OAuth/export.

## Platform 10/10 Scorecard Mapping

| Category                       | Class    | Target threshold                                              | Evidence            |
| ------------------------------ | -------- | ------------------------------------------------------------- | ------------------- |
| UX flow clarity                | `target` | Add first drill/template to workout in <= 20 seconds.         | E2E + manual timing |
| Visual design quality          | `target` | Clear hierarchy and scannable cards across mobile/desktop.    | manual QA           |
| Admin workflow and editability | `target` | Admin CRUD available with validation and status flow.         | Admin E2E           |
| Performance (CWV + payloads)   | `target` | Library view remains responsive under realistic catalog size. | perf spot checks    |

## Acceptance Criteria

- Users can filter and add drills/templates quickly.
- Favorites persist and are reusable in builder flow.
- Admin can maintain drill/template catalog without code changes.
- Empty/loading/error/retry states are complete.

## Validation

- `npm run test:unit`
- targeted e2e for library/filter/favorite/insert flows
- `npm run verify:pre-pr`
