#!/usr/bin/env python3

from __future__ import annotations

import base64
import json
import math
import shutil
import tempfile
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
SOURCE_SYMBOL = ROOT / "public" / "logos" / "logo_master_symbol.png"
FONT_SOURCE = ROOT / "public" / "fonts" / "Manrope-VariableFont_wght.ttf"
OUTPUT_DIR = ROOT / "public" / "logos" / "brand"
APPAREL_DIR = OUTPUT_DIR / "apparel"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
APP_ICONS_DIR = PUBLIC_DIR / "icons"
APPLE_TOUCH_ICON_PATH = PUBLIC_DIR / "apple-touch-icon.png"
FAVICON_PATH = ROOT / "app" / "favicon.ico"

PALETTE = {
    "blue": "#2856D7",
    "ink": "#101828",
    "slate": "#475467",
    "white": "#FFFFFF",
}

SVG_WRAPPER_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="none" role="img" aria-label="{label}">
  <image href="data:image/png;base64,{data}" width="{width}" height="{height}" />
</svg>
"""


@dataclass(frozen=True)
class TextSegment:
    text: str
    font_key: str
    fill: str


@dataclass(frozen=True)
class AssetRecord:
    apparel_height: int
    apparel_src_png: str
    apparel_src_svg: str
    apparel_width: int
    kind: str
    tone: str
    usage: str
    src_png: str
    src_svg: str
    width: int
    height: int


def ensure_dirs() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    APPAREL_DIR.mkdir(parents=True, exist_ok=True)
    APP_ICONS_DIR.mkdir(parents=True, exist_ok=True)


def trim_transparency(image: Image.Image, padding: int = 0) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        return image.copy()
    left = max(bbox[0] - padding, 0)
    top = max(bbox[1] - padding, 0)
    right = min(bbox[2] + padding, image.width)
    bottom = min(bbox[3] + padding, image.height)
    return image.crop((left, top, right, bottom))


def hex_to_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return (
        int(value[0:2], 16),
        int(value[2:4], 16),
        int(value[4:6], 16),
        alpha,
    )


def colorize_symbol(master: Image.Image, fill: str) -> Image.Image:
    alpha = master.getchannel("A")
    color = Image.new("RGBA", master.size, hex_to_rgba(fill))
    color.putalpha(alpha)
    return trim_transparency(color)


def resize_to_height(image: Image.Image, target_height: int) -> Image.Image:
    ratio = target_height / image.height
    width = max(1, round(image.width * ratio))
    return image.resize((width, target_height), Image.Resampling.LANCZOS)


def resize_within(image: Image.Image, max_width: int, max_height: int) -> Image.Image:
    ratio = min(max_width / image.width, max_height / image.height)
    width = max(1, round(image.width * ratio))
    height = max(1, round(image.height * ratio))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def make_static_font(font_path: Path, weight: int, output_path: Path) -> Path:
    variable_font = TTFont(str(font_path))
    static_font = instantiateVariableFont(variable_font, {"wght": weight}, inplace=False)
    static_font.save(str(output_path))
    return output_path


def build_font_map(font_source: Path, temp_dir: Path) -> dict[str, Path]:
    return {
        "medium": make_static_font(font_source, 550, temp_dir / "manrope-550.ttf"),
        "semibold": make_static_font(font_source, 650, temp_dir / "manrope-650.ttf"),
        "bold": make_static_font(font_source, 750, temp_dir / "manrope-750.ttf"),
        "extrabold": make_static_font(font_source, 800, temp_dir / "manrope-800.ttf"),
    }


def load_fonts(font_paths: dict[str, Path], size_map: dict[str, int]) -> dict[str, ImageFont.FreeTypeFont]:
    return {
        key: ImageFont.truetype(str(font_paths[key]), size=size_map[key])
        for key in size_map
    }


def measure_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int, tuple[int, int, int, int]]:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox


def measure_segments(
    draw: ImageDraw.ImageDraw,
    segments: list[TextSegment],
    fonts: dict[str, ImageFont.FreeTypeFont],
    gap: int = 0,
) -> tuple[int, int]:
    widths = []
    heights = []
    total_width = 0
    for index, segment in enumerate(segments):
        width, height, _ = measure_text(draw, segment.text, fonts[segment.font_key])
        widths.append(width)
        heights.append(height)
        total_width += width
        if index < len(segments) - 1:
            total_width += gap
    return total_width, max(heights, default=0)


def draw_segments(
    image: Image.Image,
    segments: list[TextSegment],
    fonts: dict[str, ImageFont.FreeTypeFont],
    x: int,
    y: int,
    gap: int = 0,
) -> tuple[int, int]:
    draw = ImageDraw.Draw(image)
    cursor_x = x
    max_height = 0
    for index, segment in enumerate(segments):
        width, height, bbox = measure_text(draw, segment.text, fonts[segment.font_key])
        draw.text((cursor_x - bbox[0], y - bbox[1]), segment.text, font=fonts[segment.font_key], fill=segment.fill)
        cursor_x += width
        if index < len(segments) - 1:
            cursor_x += gap
        max_height = max(max_height, height)
    return cursor_x - x, max_height


def render_symbol_asset(master: Image.Image, fill: str, target_height: int) -> Image.Image:
    return resize_to_height(colorize_symbol(master, fill), target_height)


def render_wordmark_asset(
    fonts: dict[str, ImageFont.FreeTypeFont],
    segments: list[TextSegment],
    padding_x: int = 48,
    padding_y: int = 36,
    gap: int = 0,
) -> Image.Image:
    dummy = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    draw = ImageDraw.Draw(dummy)
    text_width, text_height = measure_segments(draw, segments, fonts, gap=gap)
    image = Image.new(
        "RGBA",
        (text_width + padding_x * 2, text_height + padding_y * 2),
        (0, 0, 0, 0),
    )
    draw_segments(image, segments, fonts, padding_x, padding_y, gap=gap)
    return trim_transparency(image, padding=8)


def render_lockup_horizontal(
    symbol: Image.Image,
    fonts: dict[str, ImageFont.FreeTypeFont],
    segments: list[TextSegment],
    padding: tuple[int, int, int, int],
    gap_between_symbol_and_text: int,
    segment_gap: int = 0,
) -> Image.Image:
    left, top, right, bottom = padding
    dummy = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    draw = ImageDraw.Draw(dummy)
    text_width, text_height = measure_segments(draw, segments, fonts, gap=segment_gap)
    content_height = max(symbol.height, text_height)
    canvas = Image.new(
        "RGBA",
        (left + symbol.width + gap_between_symbol_and_text + text_width + right, top + content_height + bottom),
        (0, 0, 0, 0),
    )
    symbol_y = top + (content_height - symbol.height) // 2
    canvas.alpha_composite(symbol, (left, symbol_y))
    text_y = top + (content_height - text_height) // 2
    draw_segments(canvas, segments, fonts, left + symbol.width + gap_between_symbol_and_text, text_y, gap=segment_gap)
    return trim_transparency(canvas, padding=10)


def render_stacked_tagline(
    fonts: dict[str, ImageFont.FreeTypeFont],
    lines: list[TextSegment],
    padding_x: int = 48,
    padding_y: int = 48,
    line_gap: int = 10,
) -> Image.Image:
    dummy = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    draw = ImageDraw.Draw(dummy)
    measurements = [
        measure_text(draw, segment.text, fonts[segment.font_key]) for segment in lines
    ]
    width = max(width for width, _, _ in measurements)
    height = sum(height for _, height, _ in measurements) + line_gap * (len(lines) - 1)
    image = Image.new("RGBA", (width + padding_x * 2, height + padding_y * 2), (0, 0, 0, 0))
    cursor_y = padding_y
    canvas_draw = ImageDraw.Draw(image)
    for (segment, (line_width, line_height, bbox)) in zip(lines, measurements):
        x = padding_x + (width - line_width) // 2
        canvas_draw.text((x - bbox[0], cursor_y - bbox[1]), segment.text, font=fonts[segment.font_key], fill=segment.fill)
        cursor_y += line_height + line_gap
    return trim_transparency(image, padding=10)


def render_stacked_domain(
    symbol: Image.Image,
    wordmark: Image.Image,
    padding_x: int = 64,
    padding_y: int = 52,
    gap: int = 26,
) -> Image.Image:
    width = max(symbol.width, wordmark.width)
    height = symbol.height + gap + wordmark.height
    image = Image.new("RGBA", (width + padding_x * 2, height + padding_y * 2), (0, 0, 0, 0))
    symbol_x = padding_x + (width - symbol.width) // 2
    wordmark_x = padding_x + (width - wordmark.width) // 2
    image.alpha_composite(symbol, (symbol_x, padding_y))
    image.alpha_composite(wordmark, (wordmark_x, padding_y + symbol.height + gap))
    return trim_transparency(image, padding=10)


def compose_horizontal_images(
    left_image: Image.Image,
    right_image: Image.Image,
    *,
    padding: tuple[int, int, int, int],
    gap: int,
) -> Image.Image:
    left, top, right, bottom = padding
    content_height = max(left_image.height, right_image.height)
    canvas = Image.new(
        "RGBA",
        (left + left_image.width + gap + right_image.width + right, top + content_height + bottom),
        (0, 0, 0, 0),
    )
    canvas.alpha_composite(left_image, (left, top + (content_height - left_image.height) // 2))
    canvas.alpha_composite(
        right_image,
        (left + left_image.width + gap, top + (content_height - right_image.height) // 2),
    )
    return trim_transparency(canvas, padding=10)


def compose_vertical_images(
    images: list[Image.Image],
    *,
    padding_x: int,
    padding_y: int,
    gap: int,
) -> Image.Image:
    width = max(image.width for image in images)
    height = sum(image.height for image in images) + gap * (len(images) - 1)
    canvas = Image.new("RGBA", (width + padding_x * 2, height + padding_y * 2), (0, 0, 0, 0))
    cursor_y = padding_y
    for image in images:
      x = padding_x + (width - image.width) // 2
      canvas.alpha_composite(image, (x, cursor_y))
      cursor_y += image.height + gap
    return trim_transparency(canvas, padding=10)


def save_png(image: Image.Image, destination: Path) -> None:
    image.save(destination, format="PNG", optimize=True)


def save_svg_wrapper(image: Image.Image, destination: Path, label: str) -> None:
    buffer = BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    destination.write_text(
        SVG_WRAPPER_TEMPLATE.format(width=image.width, height=image.height, label=label, data=encoded),
        encoding="utf-8",
    )


def relative_public_path(path: Path) -> str:
    return "/" + path.relative_to(ROOT / "public").as_posix()


def scale_for_apparel(image: Image.Image, factor: float = 2.5) -> Image.Image:
    return image.resize(
        (max(1, round(image.width * factor)), max(1, round(image.height * factor))),
        Image.Resampling.LANCZOS,
    )


def render_app_icon(
    symbol_master: Image.Image,
    *,
    canvas_size: int,
    background_fill: str,
    symbol_fill: str,
    padding_ratio: float,
) -> Image.Image:
    canvas = Image.new("RGBA", (canvas_size, canvas_size), hex_to_rgba(background_fill))
    symbol = colorize_symbol(symbol_master, symbol_fill)
    inset = round(canvas_size * padding_ratio)
    fitted_symbol = resize_within(symbol, canvas_size - inset * 2, canvas_size - inset * 2)
    x = (canvas_size - fitted_symbol.width) // 2
    y = (canvas_size - fitted_symbol.height) // 2
    canvas.alpha_composite(fitted_symbol, (x, y))
    return canvas


def write_asset(
    manifest: dict[str, AssetRecord],
    asset_id: str,
    image: Image.Image,
    *,
    kind: str,
    tone: str,
    usage: str,
) -> None:
    png_path = OUTPUT_DIR / f"{asset_id}.png"
    svg_path = OUTPUT_DIR / f"{asset_id}.svg"
    apparel_png_path = APPAREL_DIR / f"{asset_id}.png"
    apparel_svg_path = APPAREL_DIR / f"{asset_id}.svg"
    apparel_image = scale_for_apparel(image)
    save_png(image, png_path)
    save_svg_wrapper(image, svg_path, asset_id.replace("-", " "))
    save_png(apparel_image, apparel_png_path)
    save_svg_wrapper(apparel_image, apparel_svg_path, f"{asset_id} apparel")
    manifest[asset_id] = AssetRecord(
        apparel_height=apparel_image.height,
        apparel_src_png=relative_public_path(apparel_png_path),
        apparel_src_svg=relative_public_path(apparel_svg_path),
        apparel_width=apparel_image.width,
        kind=kind,
        tone=tone,
        usage=usage,
        src_png=relative_public_path(png_path),
        src_svg=relative_public_path(svg_path),
        width=image.width,
        height=image.height,
    )


def tone_wordmark_segments(tone: str) -> list[TextSegment]:
    if tone == "primary":
        return [
            TextSegment("freeswimming", "extrabold", PALETTE["ink"]),
            TextSegment(".org", "semibold", PALETTE["slate"]),
        ]
    if tone == "blue":
        return [TextSegment("freeswimming.org", "extrabold", PALETTE["blue"])]
    if tone == "white":
        return [TextSegment("freeswimming.org", "extrabold", PALETTE["white"])]
    return [TextSegment("freeswimming.org", "extrabold", PALETTE["ink"])]


def tone_name_segments(tone: str) -> list[TextSegment]:
    if tone == "blue":
        return [TextSegment("freeswimming", "extrabold", PALETTE["blue"])]
    if tone == "white":
        return [TextSegment("freeswimming", "extrabold", PALETTE["white"])]
    return [TextSegment("freeswimming", "extrabold", PALETTE["ink"])]


def tone_inline_tagline_segments(tone: str) -> list[TextSegment]:
    if tone == "primary":
        return [
            TextSegment("Learn.", "bold", PALETTE["ink"]),
            TextSegment("Drill.", "bold", PALETTE["ink"]),
            TextSegment("Swim.", "bold", PALETTE["blue"]),
        ]
    if tone == "blue":
        return [TextSegment("Learn. Drill. Swim.", "bold", PALETTE["blue"])]
    if tone == "white":
        return [TextSegment("Learn. Drill. Swim.", "bold", PALETTE["white"])]
    return [TextSegment("Learn. Drill. Swim.", "bold", PALETTE["ink"])]


def tone_tagline_segments(tone: str) -> list[TextSegment]:
    if tone == "primary":
        return [
            TextSegment("Learn.", "bold", PALETTE["ink"]),
            TextSegment("Drill.", "bold", PALETTE["ink"]),
            TextSegment("Swim.", "bold", PALETTE["blue"]),
        ]
    if tone == "blue":
        return [
            TextSegment("Learn.", "bold", PALETTE["blue"]),
            TextSegment("Drill.", "bold", PALETTE["blue"]),
            TextSegment("Swim.", "bold", PALETTE["blue"]),
        ]
    if tone == "white":
        return [
            TextSegment("Learn.", "bold", PALETTE["white"]),
            TextSegment("Drill.", "bold", PALETTE["white"]),
            TextSegment("Swim.", "bold", PALETTE["white"]),
        ]
    return [
        TextSegment("Learn.", "bold", PALETTE["ink"]),
        TextSegment("Drill.", "bold", PALETTE["ink"]),
        TextSegment("Swim.", "bold", PALETTE["ink"]),
    ]


def tone_stacked_lines(tone: str) -> list[TextSegment]:
    if tone == "primary":
        return [
            TextSegment("Learn.", "extrabold", PALETTE["ink"]),
            TextSegment("Drill.", "extrabold", PALETTE["ink"]),
            TextSegment("Swim.", "extrabold", PALETTE["blue"]),
        ]
    if tone == "blue":
        return [
            TextSegment("Learn.", "extrabold", PALETTE["blue"]),
            TextSegment("Drill.", "extrabold", PALETTE["blue"]),
            TextSegment("Swim.", "extrabold", PALETTE["blue"]),
        ]
    if tone == "white":
        return [
            TextSegment("Learn.", "extrabold", PALETTE["white"]),
            TextSegment("Drill.", "extrabold", PALETTE["white"]),
            TextSegment("Swim.", "extrabold", PALETTE["white"]),
        ]
    return [
        TextSegment("Learn.", "extrabold", PALETTE["ink"]),
        TextSegment("Drill.", "extrabold", PALETTE["ink"]),
        TextSegment("Swim.", "extrabold", PALETTE["ink"]),
    ]


def tone_symbol_fill(tone: str) -> str:
    if tone == "white":
        return PALETTE["white"]
    if tone == "ink":
        return PALETTE["ink"]
    return PALETTE["blue"]


def build_assets() -> dict[str, AssetRecord]:
    ensure_dirs()
    manifest: dict[str, AssetRecord] = {}
    symbol_master = trim_transparency(Image.open(SOURCE_SYMBOL).convert("RGBA"), padding=6)

    with tempfile.TemporaryDirectory(prefix="freeswimming-brand-") as temp_dir_name:
        temp_dir = Path(temp_dir_name)
        font_paths = build_font_map(FONT_SOURCE, temp_dir)

        wordmark_fonts = load_fonts(
            font_paths,
            {"semibold": 176, "bold": 184, "extrabold": 192},
        )
        tagline_fonts = load_fonts(
            font_paths,
            {"bold": 124},
        )
        stacked_fonts = load_fonts(
            font_paths,
            {"extrabold": 180},
        )

        for tone in ("primary", "blue", "ink", "white"):
            symbol = render_symbol_asset(symbol_master, tone_symbol_fill(tone), target_height=540)
            write_asset(
                manifest,
                f"symbol-{tone}",
                symbol,
                kind="symbol",
                tone=tone,
                usage="Use in compact UI surfaces or icon-sized brand placements.",
            )

            wordmark = render_wordmark_asset(
                wordmark_fonts,
                tone_wordmark_segments(tone),
                padding_x=44,
                padding_y=30,
            )
            write_asset(
                manifest,
                f"wordmark-domain-{tone}",
                wordmark,
                kind="wordmark_domain",
                tone=tone,
                usage="Use where text-only domain branding fits better than a full lockup.",
            )

            name_wordmark = render_wordmark_asset(
                wordmark_fonts,
                tone_name_segments(tone),
                padding_x=44,
                padding_y=30,
            )
            write_asset(
                manifest,
                f"wordmark-name-{tone}",
                name_wordmark,
                kind="wordmark_name",
                tone=tone,
                usage="Use where the product name should appear without the .org domain suffix.",
            )

            horizontal_domain = render_lockup_horizontal(
                resize_to_height(symbol, 320),
                wordmark_fonts,
                tone_wordmark_segments(tone),
                padding=(40, 28, 40, 28),
                gap_between_symbol_and_text=56,
            )
            write_asset(
                manifest,
                f"lockup-domain-{tone}",
                horizontal_domain,
                kind="lockup_domain",
                tone=tone,
                usage="Use in primary navigation, document headers, and high-recognition brand placements.",
            )

            inline_tagline = render_wordmark_asset(
                tagline_fonts,
                tone_inline_tagline_segments(tone),
                padding_x=32,
                padding_y=24,
                gap=22,
            )
            write_asset(
                manifest,
                f"tagline-inline-{tone}",
                inline_tagline,
                kind="tagline_inline",
                tone=tone,
                usage="Use as standalone slogan art without the symbol.",
            )

            horizontal_tagline = render_lockup_horizontal(
                resize_to_height(symbol, 260),
                tagline_fonts,
                tone_tagline_segments(tone),
                padding=(38, 26, 38, 26),
                gap_between_symbol_and_text=48,
                segment_gap=22,
            )
            write_asset(
                manifest,
                f"lockup-tagline-{tone}",
                horizontal_tagline,
                kind="lockup_tagline",
                tone=tone,
                usage="Use on brand-forward surfaces where the method statement should accompany the symbol.",
            )

            stacked_tagline = render_stacked_tagline(
                stacked_fonts,
                tone_stacked_lines(tone),
                padding_x=42,
                padding_y=42,
                line_gap=8,
            )
            write_asset(
                manifest,
                f"tagline-stacked-{tone}",
                stacked_tagline,
                kind="tagline_stacked",
                tone=tone,
                usage="Use as supportive brand copy on spacious hero or campaign surfaces.",
            )

            stacked_domain = render_stacked_domain(
                resize_to_height(symbol, 460),
                render_wordmark_asset(
                    wordmark_fonts,
                    tone_wordmark_segments(tone),
                    padding_x=24,
                    padding_y=18,
                ),
                padding_x=42,
                padding_y=34,
                gap=18,
            )
            write_asset(
                manifest,
                f"stacked-domain-{tone}",
                stacked_domain,
                kind="stacked_domain",
                tone=tone,
                usage="Use where a taller brand lockup fits better than a horizontal mark.",
            )

            horizontal_full_lockup = compose_horizontal_images(
                resize_to_height(symbol, 320),
                compose_vertical_images(
                    [
                        render_wordmark_asset(
                            wordmark_fonts,
                            tone_name_segments(tone),
                            padding_x=10,
                            padding_y=8,
                        ),
                        render_wordmark_asset(
                            tagline_fonts,
                            tone_inline_tagline_segments(tone),
                            padding_x=10,
                            padding_y=6,
                            gap=20,
                        ),
                    ],
                    padding_x=0,
                    padding_y=0,
                    gap=8,
                ),
                padding=(40, 28, 40, 28),
                gap=56,
            )
            write_asset(
                manifest,
                f"full-lockup-horizontal-{tone}",
                horizontal_full_lockup,
                kind="full_lockup_horizontal",
                tone=tone,
                usage="Use for apparel, signage, or wide placements where the symbol, name, and slogan should travel together.",
            )

            vertical_full_lockup = compose_vertical_images(
                [
                    resize_to_height(symbol, 480),
                    render_wordmark_asset(
                        wordmark_fonts,
                        tone_name_segments(tone),
                        padding_x=18,
                        padding_y=10,
                    ),
                    render_wordmark_asset(
                        tagline_fonts,
                        tone_inline_tagline_segments(tone),
                        padding_x=12,
                        padding_y=8,
                        gap=20,
                    ),
                ],
                padding_x=42,
                padding_y=36,
                gap=16,
            )
            write_asset(
                manifest,
                f"full-lockup-vertical-{tone}",
                vertical_full_lockup,
                kind="full_lockup_vertical",
                tone=tone,
                usage="Use for back prints, posters, or taller apparel placements that need the complete brand stack.",
            )

    return manifest


def write_manifest(manifest: dict[str, AssetRecord]) -> None:
    MANIFEST_PATH.write_text(
        json.dumps(
            {key: record.__dict__ for key, record in sorted(manifest.items())},
            indent=2,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )


def write_compatibility_files() -> None:
    compatibility_map = {
        OUTPUT_DIR / "symbol-primary.png": ROOT / "public" / "logos" / "01_icon_transparent.png",
        OUTPUT_DIR / "symbol-white.png": ROOT / "public" / "logos" / "01_icon_white_transparent.png",
        OUTPUT_DIR / "stacked-domain-primary.png": ROOT / "public" / "logos" / "03_stacked_transparent.png",
        OUTPUT_DIR / "lockup-domain-ink.png": ROOT / "public" / "logos" / "logo_black_print.png",
    }
    for source, target in compatibility_map.items():
        shutil.copyfile(source, target)


def write_app_icon_files() -> None:
    symbol_master = trim_transparency(Image.open(SOURCE_SYMBOL).convert("RGBA"), padding=6)
    standard_icon = render_app_icon(
        symbol_master,
        canvas_size=512,
        background_fill=PALETTE["blue"],
        symbol_fill=PALETTE["white"],
        padding_ratio=0.18,
    )
    maskable_icon = render_app_icon(
        symbol_master,
        canvas_size=512,
        background_fill=PALETTE["blue"],
        symbol_fill=PALETTE["white"],
        padding_ratio=0.24,
    )

    save_png(standard_icon.resize((192, 192), Image.Resampling.LANCZOS), APP_ICONS_DIR / "icon-192.png")
    save_png(standard_icon, APP_ICONS_DIR / "icon-512.png")
    save_png(maskable_icon, APP_ICONS_DIR / "icon-maskable-512.png")
    save_png(standard_icon.resize((180, 180), Image.Resampling.LANCZOS), APPLE_TOUCH_ICON_PATH)

    favicon_icon = standard_icon.resize((256, 256), Image.Resampling.LANCZOS)
    favicon_icon.save(
        FAVICON_PATH,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )


def main() -> None:
    manifest = build_assets()
    write_manifest(manifest)
    write_compatibility_files()
    write_app_icon_files()
    print(f"Generated {len(manifest)} brand assets in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
