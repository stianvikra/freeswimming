import { describe, expect, it } from "vitest";
import { getLibraryItemActionCopy } from "@/lib/commerce/library-item-actions";

describe("getLibraryItemActionCopy", () => {
  it("returns dual-action config for 0-1000m guide", () => {
    expect(getLibraryItemActionCopy("guide_0_1000m")).toMatchObject({
      primaryHref: "/guides/0-1000m",
      primaryLabel: "Open interactive plan",
      pdfApiHref: "/api/guides/0-1000m/pdf",
      pdfFallbackFileName: "freeswimming-0-1000m-guide.pdf",
    });
  });

  it("returns dual-action config for poolside guide", () => {
    expect(getLibraryItemActionCopy("guide_poolside")).toMatchObject({
      primaryHref: "/guides/poolside",
      primaryLabel: "Open interactive guide",
      pdfApiHref: "/api/guides/poolside/pdf",
      pdfFallbackFileName: "freeswimming-poolside-guide.pdf",
    });
  });

  it("returns open + support config for analysis", () => {
    expect(getLibraryItemActionCopy("analysis_video")).toMatchObject({
      primaryHref: "/analysis",
      primaryLabel: "Open video analysis",
      secondaryHref: "/contact",
      secondaryLabel: "Contact support",
      pdfApiHref: null,
    });
  });

  it("returns safe fallback for unknown products", () => {
    expect(getLibraryItemActionCopy("unknown_product")).toMatchObject({
      primaryHref: null,
      pdfApiHref: null,
      secondaryHref: null,
    });
  });
});
