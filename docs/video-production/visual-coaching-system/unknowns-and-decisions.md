# Unknowns And Decisions

## Confirmed Decisions

- FreeSwimming remains the only brand identity.
- Existing brand assets are inputs and source of truth.
- Phase 1 is docs-only.
- Final Cut Pro recipes must be verified before they are production-ready.
- The baseline output formats are:
  - `16:9` course/video,
  - `9:16` social vertical,
  - `1:1` social square.
- The visual system must support underwater side, underwater front, and above-water footage.
- Captions and coaching overlays are separate text systems.
- Social formats adapt the course visual language; they do not create a new social-only brand.

## Open Items To Verify Later

| Item                                                       | Owner phase                  | Notes                                                      |
| ---------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| exact FCP version and macOS version                        | verified FCP recipes         | required for recipe metadata                               |
| final codec/bitrate profiles                               | verified FCP recipes + pilot | Phase 1 only defines export naming and review expectations |
| whether burned-in captions are required per social channel | pilot or publish brief       | platform behavior can change                               |
| preferred music policy for course lessons                  | pilot                        | default is instruction-first and music optional            |
| exact watermark scale per format                           | manual FCP/Motion pilot      | must be judged on real footage before asset generation     |
| whether wall-logo treatment is used in real lessons        | manual pilot + FCP recipes   | must look physically plausible                             |
| lower-third variants                                       | manual pilot                 | depends on first pilot lesson needs                        |
| social posting metadata                                    | publish brief                | not part of Phase 1                                        |
| public runtime hosting path                                | publish brief                | no video publishing in Phase 1                             |

## Decision Log

| Date       | Decision                                            | Rationale                                                                                                                                                |
| ---------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-08 | Start Phase 1 before asset pack                     | Design language and production architecture should be stable before creating reusable assets.                                                            |
| 2026-05-08 | Support `16:9`, `9:16`, and `1:1` from the start    | Course videos and social videos need the same visual system with format-specific placement rules.                                                        |
| 2026-05-08 | Keep FCP recipes separate and verified              | Prevents fabricated or outdated editing instructions from becoming production rules.                                                                     |
| 2026-05-08 | Keep private footage and FCP libraries outside repo | Avoids leaking large/private source files and keeps repo docs/runtime boundaries clean.                                                                  |
| 2026-05-08 | Block generated asset pack before production use    | Owner review showed the generated sheets/comps were not 10/10 or FCP-editable enough; visual decisions move to a manual FCP/Motion pilot on real frames. |

## Change Rule

If a future pilot or production run proves a rule wrong, update the relevant system doc and record the decision here. Do not rely on undocumented exceptions.
