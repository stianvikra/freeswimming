# Production Architecture

## Boundaries

This repo stores reusable documentation, rules, manifests, and approved derived assets only.

It must not store:

- private raw footage,
- private customer/member footage,
- Final Cut Pro libraries,
- large working media caches,
- credentials,
- private production links,
- editable source files intended to stay private.

## Repo Locations

| Location                                        | Purpose                                                       |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `docs/video-production/visual-coaching-system/` | production system docs                                        |
| `docs/video-production/<video-id>/`             | approved per-video production packs and subtitles             |
| `docs/design/source-assets/`                    | non-public design source assets already tracked by brand docs |
| `public/logos/brand/`                           | approved runtime brand exports                                |
| `public/`                                       | approved runtime assets only                                  |

## Production Storage Model

Use production storage outside the repo for media-heavy work.

Recommended root:

```text
FreeSwimming-Visual-Coaching/
  00-system/
  01-source-footage/
  02-fcp-libraries/
  03-assets-source/
  04-assets-fcp-ready/
  05-review-exports/
  06-final-exports/
  07-archive/
  08-issue-log/
```

## Source And Generated Asset Boundary

| Asset type                  | Location rule                                                   | Public allowed                      |
| --------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| raw footage                 | production storage                                              | no                                  |
| FCP library/project         | production storage                                              | no                                  |
| editable overlay source     | production storage or non-public docs source folder if approved | no by default                       |
| FCP-ready overlay exports   | child-owned generated folder or production storage              | only if explicitly approved         |
| final course/social exports | production delivery storage                                     | only through separate publish scope |
| brand logo pack             | `public/logos/brand/`                                           | yes, already approved               |

## Workflow

1. Plan lesson and production ID.
2. Capture source footage.
3. Organize footage by shoot ID and angle.
4. Edit course master.
5. Apply approved overlay language.
6. Export review versions for required formats.
7. Run review checklist on desktop and phone.
8. Record findings.
9. Export final approved versions.
10. Archive project and source references.

## Drift Control

When production needs a new overlay, format, naming pattern, or export profile:

- update the production system docs,
- add or update asset requirements,
- do not create one-off visuals without recording the rule.

## Rollback

Docs-only changes can be reverted through git.

Future asset and template changes must define:

- source file path,
- generated file path,
- manifest ID,
- version,
- deprecated/replacement relationship,
- rollback path.
