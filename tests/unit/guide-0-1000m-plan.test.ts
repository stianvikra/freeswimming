import { describe, expect, it } from "vitest";
import {
  GUIDE_0_TO_1000M_PRODUCT_ID,
  GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME,
  GUIDE_0_TO_1000M_SESSIONS,
  GUIDE_0_TO_1000M_SLUG,
  getGuide0To1000PdfAssetPath,
} from "@/lib/guides/guide-0-1000m";

describe("guide 0-1000m plan data", () => {
  it("has stable identifiers", () => {
    expect(GUIDE_0_TO_1000M_SLUG).toBe("0-1000m");
    expect(GUIDE_0_TO_1000M_PRODUCT_ID).toBe("guide_0_1000m");
    expect(GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME).toBe("freeswimming-0-1000m-guide.pdf");
  });

  it("contains exactly 20 sessions with unique ids", () => {
    expect(GUIDE_0_TO_1000M_SESSIONS).toHaveLength(20);

    const idSet = new Set(GUIDE_0_TO_1000M_SESSIONS.map((session) => session.id));
    expect(idSet.size).toBe(20);
  });

  it("has 10 weeks with 2 sessions in each week", () => {
    const weekCounts = GUIDE_0_TO_1000M_SESSIONS.reduce<Record<number, number>>((acc, session) => {
      acc[session.weekNumber] = (acc[session.weekNumber] ?? 0) + 1;
      return acc;
    }, {});

    const weeks = Object.keys(weekCounts)
      .map(Number)
      .sort((a, b) => a - b);

    expect(weeks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    for (const week of weeks) {
      expect(weekCounts[week]).toBe(2);
    }
  });

  it("uses safe PDF asset path with fallback on invalid values", () => {
    expect(getGuide0To1000PdfAssetPath({})).toBe("assets/guides/0-1000m-guide.pdf");
    expect(
      getGuide0To1000PdfAssetPath({
        GUIDE_0_TO_1000M_PDF_ASSET_PATH: "assets/guides/custom.pdf",
      })
    ).toBe("assets/guides/custom.pdf");
    expect(
      getGuide0To1000PdfAssetPath({
        GUIDE_0_TO_1000M_PDF_ASSET_PATH: "../secret.pdf",
      })
    ).toBe("assets/guides/0-1000m-guide.pdf");
    expect(
      getGuide0To1000PdfAssetPath({
        GUIDE_0_TO_1000M_PDF_ASSET_PATH: "/absolute/path.pdf",
      })
    ).toBe("assets/guides/0-1000m-guide.pdf");
    expect(
      getGuide0To1000PdfAssetPath({
        GUIDE_0_TO_1000M_PDF_ASSET_PATH: "assets/guides/not-pdf.txt",
      })
    ).toBe("assets/guides/0-1000m-guide.pdf");
  });
});
