import brandManifest from "@/public/logos/brand/manifest.json";

export type BrandAssetId = keyof typeof brandManifest;
export type BrandAsset = (typeof brandManifest)[BrandAssetId];

export const BRAND_ASSETS = brandManifest;

export const BRAND_FONT_PUBLIC_PATH = "/fonts/Manrope-VariableFont_wght.ttf";
export const BRAND_APP_ICON_PATHS = {
  favicon: "/favicon.ico",
  icon192: "/icons/icon-192.png",
  icon512: "/icons/icon-512.png",
  iconMaskable512: "/icons/icon-maskable-512.png",
  appleTouchIcon: "/apple-touch-icon.png",
} as const;

export const BRAND_USAGE = {
  compactSymbol: "symbol-primary",
  pageIntroSymbol: "symbol-primary",
  headerLockup: "lockup-domain-white",
  drawerLockup: "lockup-domain-primary",
  heroLockup: "lockup-domain-primary",
  heroTagline: "tagline-stacked-primary",
  methodLockup: "lockup-tagline-primary",
  pdfLockup: "lockup-domain-ink",
} as const satisfies Record<string, BrandAssetId>;

export const BRAND_PDF_LOGO_PATH = brandManifest[BRAND_USAGE.pdfLockup].src_png;
export const BRAND_POOLSIDE_COLOR_LOGO_PATH = brandManifest["lockup-domain-primary"].src_png;

export function getWorkoutPdfLogoPath(options?: {
  variant?: "standard" | "poolside";
  poolsidePrintStyle?: "color" | "ink_saver";
}) {
  if (options?.variant === "poolside" && options?.poolsidePrintStyle === "color") {
    return BRAND_POOLSIDE_COLOR_LOGO_PATH;
  }

  return BRAND_PDF_LOGO_PATH;
}

export function getBrandAsset(assetId: BrandAssetId): BrandAsset {
  return BRAND_ASSETS[assetId];
}

export function getBrandAssetAlt(assetId: BrandAssetId) {
  const meta = BRAND_ASSETS[assetId];

  if (meta.kind === "wordmark_domain" || meta.kind === "lockup_domain") {
    return "freeswimming.org";
  }

  if (meta.kind === "wordmark_name") {
    return "freeswimming";
  }

  if (meta.kind === "stacked_domain") {
    return "freeswimming.org logo";
  }

  if (
    meta.kind === "tagline_inline" ||
    meta.kind === "tagline_stacked" ||
    meta.kind === "lockup_tagline"
  ) {
    return "Learn. Drill. Swim.";
  }

  if (meta.kind === "full_lockup_horizontal" || meta.kind === "full_lockup_vertical") {
    return "freeswimming Learn. Drill. Swim.";
  }

  return "Freeswimming logo";
}
