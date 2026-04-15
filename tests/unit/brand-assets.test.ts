import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BRAND_APP_ICON_PATHS,
  BRAND_ASSETS,
  BRAND_POOLSIDE_COLOR_LOGO_PATH,
  BRAND_USAGE,
  getBrandAsset,
  getBrandAssetAlt,
  getWorkoutPdfLogoPath,
} from "@/lib/brand";

describe("brand assets", () => {
  it("exposes the required logo families for the approved symbol system", () => {
    expect(BRAND_ASSETS["symbol-primary"].src_png).toContain("/logos/brand/symbol-primary.png");
    expect(BRAND_ASSETS["wordmark-domain-primary"].src_png).toContain(
      "/logos/brand/wordmark-domain-primary.png"
    );
    expect(BRAND_ASSETS["wordmark-name-primary"].src_png).toContain(
      "/logos/brand/wordmark-name-primary.png"
    );
    expect(BRAND_ASSETS["tagline-inline-primary"].src_png).toContain(
      "/logos/brand/tagline-inline-primary.png"
    );
    expect(BRAND_ASSETS["lockup-domain-primary"].src_png).toContain(
      "/logos/brand/lockup-domain-primary.png"
    );
    expect(BRAND_ASSETS["lockup-tagline-primary"].src_png).toContain(
      "/logos/brand/lockup-tagline-primary.png"
    );
    expect(BRAND_ASSETS["tagline-stacked-primary"].src_png).toContain(
      "/logos/brand/tagline-stacked-primary.png"
    );
    expect(BRAND_ASSETS["stacked-domain-primary"].src_png).toContain(
      "/logos/brand/stacked-domain-primary.png"
    );
    expect(BRAND_ASSETS["full-lockup-horizontal-primary"].src_png).toContain(
      "/logos/brand/full-lockup-horizontal-primary.png"
    );
    expect(BRAND_ASSETS["full-lockup-vertical-primary"].src_png).toContain(
      "/logos/brand/full-lockup-vertical-primary.png"
    );
  });

  it("maps the default UI placements to the intended lockups", () => {
    expect(getBrandAsset(BRAND_USAGE.headerLockup).src_png).toContain("lockup-domain-white.png");
    expect(getBrandAsset(BRAND_USAGE.heroLockup).src_png).toContain("lockup-domain-primary.png");
    expect(getBrandAsset(BRAND_USAGE.heroTagline).src_png).toContain("tagline-stacked-primary.png");
    expect(getBrandAsset(BRAND_USAGE.methodLockup).src_png).toContain("lockup-tagline-primary.png");
    expect(getBrandAsset(BRAND_USAGE.pdfLockup).src_png).toContain("lockup-domain-ink.png");
  });

  it("uses a stronger domain lockup for color poolside artifacts while keeping ink-safe output", () => {
    expect(BRAND_POOLSIDE_COLOR_LOGO_PATH).toContain("lockup-domain-primary.png");
    expect(getWorkoutPdfLogoPath({ variant: "poolside", poolsidePrintStyle: "color" })).toContain(
      "lockup-domain-primary.png"
    );
    expect(
      getWorkoutPdfLogoPath({ variant: "poolside", poolsidePrintStyle: "ink_saver" })
    ).toContain("lockup-domain-ink.png");
    expect(getWorkoutPdfLogoPath({ variant: "standard" })).toContain("lockup-domain-ink.png");
  });

  it("provides larger transparent apparel masters for every generated lockup family", () => {
    expect(BRAND_ASSETS["symbol-primary"].apparel_src_png).toContain(
      "/logos/brand/apparel/symbol-primary.png"
    );
    expect(BRAND_ASSETS["wordmark-name-primary"].apparel_src_png).toContain(
      "/logos/brand/apparel/wordmark-name-primary.png"
    );
    expect(BRAND_ASSETS["tagline-inline-primary"].apparel_src_png).toContain(
      "/logos/brand/apparel/tagline-inline-primary.png"
    );
    expect(BRAND_ASSETS["full-lockup-horizontal-primary"].apparel_src_png).toContain(
      "/logos/brand/apparel/full-lockup-horizontal-primary.png"
    );
    expect(BRAND_ASSETS["full-lockup-vertical-primary"].apparel_src_png).toContain(
      "/logos/brand/apparel/full-lockup-vertical-primary.png"
    );
    expect(BRAND_ASSETS["full-lockup-horizontal-primary"].apparel_width).toBeGreaterThan(
      BRAND_ASSETS["full-lockup-horizontal-primary"].width
    );
    expect(BRAND_ASSETS["full-lockup-vertical-primary"].apparel_height).toBeGreaterThan(
      BRAND_ASSETS["full-lockup-vertical-primary"].height
    );
  });

  it("returns truthful alt text defaults for the major asset families", () => {
    expect(getBrandAssetAlt("symbol-primary")).toBe("Freeswimming logo");
    expect(getBrandAssetAlt("wordmark-name-primary")).toBe("freeswimming");
    expect(getBrandAssetAlt("lockup-domain-primary")).toBe("freeswimming.org");
    expect(getBrandAssetAlt("tagline-inline-primary")).toBe("Learn. Drill. Swim.");
    expect(getBrandAssetAlt("tagline-stacked-primary")).toBe("Learn. Drill. Swim.");
    expect(getBrandAssetAlt("stacked-domain-primary")).toBe("freeswimming.org logo");
    expect(getBrandAssetAlt("full-lockup-horizontal-primary")).toBe(
      "freeswimming Learn. Drill. Swim."
    );
    expect(getBrandAssetAlt("full-lockup-vertical-primary")).toBe(
      "freeswimming Learn. Drill. Swim."
    );
  });

  it("keeps the web app icon set aligned to the new symbol system", () => {
    expect(BRAND_APP_ICON_PATHS.favicon).toBe("/favicon.ico");
    expect(BRAND_APP_ICON_PATHS.icon192).toBe("/icons/icon-192.png");
    expect(BRAND_APP_ICON_PATHS.icon512).toBe("/icons/icon-512.png");
    expect(BRAND_APP_ICON_PATHS.iconMaskable512).toBe("/icons/icon-maskable-512.png");
    expect(BRAND_APP_ICON_PATHS.appleTouchIcon).toBe("/apple-touch-icon.png");

    expect(existsSync(path.join(process.cwd(), "app/favicon.ico"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public/icons/icon-192.png"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public/icons/icon-512.png"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public/icons/icon-maskable-512.png"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public/apple-touch-icon.png"))).toBe(true);
  });
});
