# Naming And File Structure

## Stable Production IDs

Every lesson or drill video should have a stable production ID.

Pattern:

```text
vc-<content-type>-<stroke-or-domain>-<topic>-v<major>
```

Examples:

```text
vc-lesson-freestyle-early-catch-v001
vc-drill-freestyle-sculling-v001
vc-social-freestyle-high-elbow-cue-v001
```

## Human Titles

Human titles can change.

Stable IDs should not be repurposed for a different technique objective.

If the technique objective changes materially, create a new production ID.

## Angle Naming

Use clear angle names:

```text
uw-side
uw-front
above-side
above-front
deck-wide
wall
lane-line
```

## Format Suffixes

Use explicit output suffixes:

```text
course-16x9
social-9x16
social-1x1
review
final
```

Example:

```text
vc-lesson-freestyle-early-catch-v001_course-16x9_review-r01.mp4
vc-lesson-freestyle-early-catch-v001_social-9x16_final-r02.mp4
vc-lesson-freestyle-early-catch-v001_social-1x1_final-r01.mp4
```

## Folder Pattern

Per production item:

```text
<production-id>/
  00-brief/
  01-footage/
  02-fcp/
  03-assets/
  04-review-exports/
  05-final-exports/
  06-captions/
  07-retrospective/
```

## Version Rules

- `v001`, `v002`: major production version.
- `r01`, `r02`: review/export revision.
- `final`: approved export state.
- `archive`: preserved old version.

Do not overwrite an approved final export without a new revision or version.

## Caption Naming

Use format-specific captions when placement or timing differs:

```text
vc-lesson-freestyle-early-catch-v001_course-16x9_en.srt
vc-lesson-freestyle-early-catch-v001_social-9x16_en.srt
vc-lesson-freestyle-early-catch-v001_social-1x1_en.srt
```

## Asset ID Naming

Future reusable assets should use stable IDs:

```text
vc-watermark-symbol-white-v001
vc-callout-focus-blue-v001
vc-arrow-direction-white-v001
vc-highlight-body-line-white-v001
vc-label-mistake-v001
vc-label-fix-v001
```

Deprecate assets explicitly. Do not repurpose an asset ID for different geometry, behavior, or meaning.
