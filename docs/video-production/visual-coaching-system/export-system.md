# Export System

## Export Philosophy

Every export should make its purpose obvious from the filename.

Course, social vertical, and square outputs are separate deliverables, not ambiguous variants.

## Baseline Export Profiles

| Profile          | Format        | Recommended baseline       | Use                               |
| ---------------- | ------------- | -------------------------- | --------------------------------- |
| `course-16x9`    | `16:9`        | `1920x1080` or `3840x2160` | course, website, long-form review |
| `social-9x16`    | `9:16`        | `1080x1920`                | mobile social cutdown             |
| `social-1x1`     | `1:1`         | `1080x1080`                | feed, ad, square preview          |
| `archive-master` | source aspect | high-quality master        | production archive only           |

Exact codec and bitrate settings must be finalized in the verified FCP recipe and pilot phases. Phase 1 defines naming and review expectations, not final codec authority.

## Export States

| State        | Meaning                 |
| ------------ | ----------------------- |
| `draft`      | internal rough cut      |
| `review-rNN` | reviewable export       |
| `final-rNN`  | owner-approved export   |
| `archive`    | preserved prior version |

## Filename Pattern

```text
<production-id>_<profile>_<state>.mp4
```

Examples:

```text
vc-lesson-freestyle-early-catch-v001_course-16x9_review-r01.mp4
vc-lesson-freestyle-early-catch-v001_social-9x16_review-r01.mp4
vc-lesson-freestyle-early-catch-v001_social-1x1_final-r02.mp4
```

## Review Exports

Review exports must include:

- format suffix,
- revision number,
- visible enough quality to judge overlays,
- captions if captions are part of the reviewed deliverable,
- no private path or customer-identifying metadata in filename.

## Final Exports

Final exports must pass:

- visual review,
- mobile readability review,
- desktop playback review for course videos,
- caption review when captions are included,
- audio review,
- filename and folder review.

## Captions

Captions can be:

- burned in for social when platform behavior is uncertain,
- sidecar `.srt` for course or upload workflows,
- both, when the publishing plan requires it.

Caption choice is a production decision per output profile and must be recorded in the production pack.

## Public Runtime Boundary

No export enters website runtime or public storage unless a later publish brief explicitly scopes it.

This Phase 1 system prepares exports for future delivery but does not publish them.
