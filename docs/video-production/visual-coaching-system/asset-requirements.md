# Asset Requirements

## Purpose

This file defines what a later approved asset/template system must cover. It does not create those assets in Phase 1, and generated assets should wait until the manual FCP/Motion pilot proves the look on real footage.

## Required Asset Families

| Family              | Required variants                                                          |
| ------------------- | -------------------------------------------------------------------------- |
| watermark           | white, primary, dark, high-contrast, `16:9`, `9:16`, `1:1` safe placements |
| intro/outro lockup  | landscape, vertical, square, light, dark                                   |
| lower third         | name/title, drill label, focus label                                       |
| title card          | course lesson, drill, social cutdown                                       |
| arrows              | straight, curved, timing, direction                                        |
| highlights          | circle, box, body line, path line, catch path                              |
| rotation indicators | shoulder roll, hip roll, breathing timing                                  |
| kick timing markers | rhythm ticks, sync markers                                                 |
| split-screen labels | before/after, side/front, mistake/fix                                      |
| freeze-frame labels | position label, focus label, frame marker                                  |
| mistake/correction  | label pair, non-color-only state                                           |
| wall-logo treatment | perspective-ready source and usage guidance                                |
| caption-safe guides | non-rendering guide overlays for safe placement                            |

## Format Variants

Each text-bearing or placement-sensitive asset must define support for:

- `16:9`,
- `9:16`,
- `1:1`.

If one asset cannot work across all three formats, create format-specific variants with stable IDs.

## FCP-Ready Requirements

Future assets should be easy to import into Final Cut Pro:

- transparent background where needed,
- high enough resolution for `4K` landscape work where practical,
- clean names,
- stable IDs,
- documented intended use,
- editable source retained outside public runtime paths,
- generated exports documented in a manifest.

## Manifest Fields

Future asset manifest entries should include:

```text
id
family
variant
format_support
source_path
generated_path
public_runtime_allowed
brand_source
version
owner
intended_use
do_not_use_for
replacement_for
deprecated
notes
```

## Accessibility And Readability Requirements

Assets must be reviewed against:

- underwater contrast,
- mobile readability,
- non-color-only state meaning,
- crop safety,
- caption collision risk,
- swimmer visibility.

## Anti-Patterns

Do not create assets that:

- look like a separate brand,
- require manual recreation for every drill,
- only work in `16:9`,
- require tiny text,
- depend on color alone,
- cover the swimmer by default,
- introduce decorative effects without teaching value.
