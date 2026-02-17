import { describe, expect, it } from "vitest";
import {
  GUIDE_POOLSIDE_DRILLS,
  GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME,
  GUIDE_POOLSIDE_PRODUCT_ID,
  GUIDE_POOLSIDE_SLUG,
  getGuidePoolsidePdfAssetPath,
} from "@/lib/guides/guide-poolside";

describe("guide poolside data", () => {
  it("has stable identifiers", () => {
    expect(GUIDE_POOLSIDE_SLUG).toBe("poolside");
    expect(GUIDE_POOLSIDE_PRODUCT_ID).toBe("guide_poolside");
    expect(GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME).toBe("freeswimming-poolside-guide.pdf");
  });

  it("contains 12 drills with unique ids and visual assets", () => {
    expect(GUIDE_POOLSIDE_DRILLS).toHaveLength(12);

    const idSet = new Set(GUIDE_POOLSIDE_DRILLS.map((drill) => drill.id));
    expect(idSet.size).toBe(12);

    for (const drill of GUIDE_POOLSIDE_DRILLS) {
      expect(drill.visualAssetPath).toMatch(/^\/guides\/poolside\/drill-\d{2}\.svg$/);
      expect(drill.keyFocus.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("uses safe PDF asset path with fallback on invalid values", () => {
    expect(getGuidePoolsidePdfAssetPath({})).toBe("assets/guides/poolside-guide.pdf");
    expect(
      getGuidePoolsidePdfAssetPath({
        GUIDE_POOLSIDE_PDF_ASSET_PATH: "assets/guides/custom-poolside.pdf",
      })
    ).toBe("assets/guides/custom-poolside.pdf");
    expect(
      getGuidePoolsidePdfAssetPath({
        GUIDE_POOLSIDE_PDF_ASSET_PATH: "../secret.pdf",
      })
    ).toBe("assets/guides/poolside-guide.pdf");
    expect(
      getGuidePoolsidePdfAssetPath({
        GUIDE_POOLSIDE_PDF_ASSET_PATH: "/absolute/path.pdf",
      })
    ).toBe("assets/guides/poolside-guide.pdf");
    expect(
      getGuidePoolsidePdfAssetPath({
        GUIDE_POOLSIDE_PDF_ASSET_PATH: "assets/guides/not-pdf.txt",
      })
    ).toBe("assets/guides/poolside-guide.pdf");
  });
});
