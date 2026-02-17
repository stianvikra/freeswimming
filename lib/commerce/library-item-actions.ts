import {
  GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME,
  GUIDE_0_TO_1000M_PRODUCT_ID,
} from "@/lib/guides/guide-0-1000m";
import {
  GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME,
  GUIDE_POOLSIDE_PRODUCT_ID,
} from "@/lib/guides/guide-poolside";

export type LibraryItemActionCopy = {
  description: string;
  primaryHref: string | null;
  primaryLabel: string;
  secondaryHref: string | null;
  secondaryLabel: string | null;
  pdfApiHref: string | null;
  pdfFallbackFileName: string | null;
};

export function getLibraryItemActionCopy(productId: string): LibraryItemActionCopy {
  if (productId === GUIDE_0_TO_1000M_PRODUCT_ID) {
    return {
      description: "This item includes an interactive tracker. Open it to continue your plan.",
      primaryHref: "/guides/0-1000m",
      primaryLabel: "Open interactive plan",
      secondaryHref: null,
      secondaryLabel: null,
      pdfApiHref: "/api/guides/0-1000m/pdf",
      pdfFallbackFileName: GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME,
    };
  }

  if (productId === GUIDE_POOLSIDE_PRODUCT_ID) {
    return {
      description:
        "Open one drill at a time with overview, next/forrige controls, swipe navigation, and visual fullscreen mode.",
      primaryHref: "/guides/poolside",
      primaryLabel: "Open interactive guide",
      secondaryHref: null,
      secondaryLabel: null,
      pdfApiHref: "/api/guides/poolside/pdf",
      pdfFallbackFileName: GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME,
    };
  }

  if (productId === "analysis_video") {
    return {
      description:
        "Open your video analysis request flow and contact support if you need upload or booking help.",
      primaryHref: "/analysis",
      primaryLabel: "Open video analysis",
      secondaryHref: "/contact",
      secondaryLabel: "Contact support",
      pdfApiHref: null,
      pdfFallbackFileName: null,
    };
  }

  return {
    description:
      "Owned item detail is active. Product actions will be attached in the next update.",
    primaryHref: null,
    primaryLabel: "Open",
    secondaryHref: null,
    secondaryLabel: null,
    pdfApiHref: null,
    pdfFallbackFileName: null,
  };
}
