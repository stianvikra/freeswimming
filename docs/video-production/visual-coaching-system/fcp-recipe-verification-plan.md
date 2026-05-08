# Final Cut Pro Recipe Verification Plan

## Rule

No Final Cut Pro instruction is production-ready until it is verified against current Final Cut Pro behavior and/or official Apple documentation.

Phase 1 may define what must be verified. It must not publish unverified recipes as final instructions.

## Recipe Metadata

Every verified recipe must include:

```text
recipe_id
title
purpose
required_assets
input_media
output_result
final_cut_pro_version
macos_version
date_verified
verified_by
verification_method
exact_steps
troubleshooting
known_limitations
```

## Required Recipe Coverage

| Recipe area                       | Required later |
| --------------------------------- | -------------- |
| import and organize footage       | yes            |
| multicam sync                     | yes            |
| angle naming and selection        | yes            |
| local sync correction             | yes            |
| drill extraction                  | yes            |
| timeline cleanup                  | yes            |
| add logo watermark                | yes            |
| place logo on wall                | yes            |
| distort logo to match perspective | yes            |
| create slow motion                | yes            |
| create freeze frame               | yes            |
| add arrows                        | yes            |
| add text labels                   | yes            |
| add highlight shapes              | yes            |
| use blend modes                   | yes            |
| adjust opacity                    | yes            |
| create split screen               | yes            |
| zoom into technique               | yes            |
| create before/after comparison    | yes            |
| export `16:9` course video        | yes            |
| export `9:16` social video        | yes            |
| export `1:1` social video         | yes            |

## Verification States

| State               | Meaning                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `unverified`        | idea or requirement only                                               |
| `docs-backed`       | supported by official/current documentation, not yet manually executed |
| `manually verified` | executed in FCP and result inspected                                   |
| `pilot verified`    | used successfully in pilot lesson                                      |
| `deprecated`        | no longer recommended                                                  |

## Evidence Requirements

For each production-ready recipe:

- exact FCP menu names,
- exact inspector fields/settings,
- stable shortcut if used,
- order of operations,
- expected visual result,
- troubleshooting,
- version/date verified,
- sample output or artifact note when practical.

## Social Format Verification

Recipes must verify all baseline format exports:

- `16:9` course,
- `9:16` vertical social,
- `1:1` square social.

Do not assume a `16:9` export workflow automatically works for social crops.

## Troubleshooting Areas

Recipes must cover common failures:

- bad sync,
- wrong angle selected,
- missing overlay asset,
- unreadable text,
- logo covering swimmer,
- captions colliding with overlays,
- wrong crop,
- wrong export profile,
- bad audio level,
- export file named incorrectly.

## Handoff To Recipe Brief

The dedicated verified-FCP-recipes brief owns final recipes. This Phase 1 document is the checklist that prevents fabricated or untested instructions from entering the production system.
