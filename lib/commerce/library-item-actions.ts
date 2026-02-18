import { GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME } from "@/lib/guides/guide-0-1000m";
import { GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME } from "@/lib/guides/guide-poolside";
import type { CatalogProductId } from "@/lib/commerce/catalog";

export type LibraryItemActionCopy = {
  description: string;
  primaryHref: string | null;
  primaryLabel: string;
  secondaryHref: string | null;
  secondaryLabel: string | null;
  pdfApiHref: string | null;
  pdfFallbackFileName: string | null;
};

const ITEM_ACTION_COPY_BY_CATALOG_ID: Record<CatalogProductId, LibraryItemActionCopy> = {
  guide_0_1000m: {
    description: "This item includes an interactive tracker. Open it to continue your plan.",
    primaryHref: "/guides/0-1000m",
    primaryLabel: "Open interactive plan",
    secondaryHref: null,
    secondaryLabel: null,
    pdfApiHref: "/api/guides/0-1000m/pdf",
    pdfFallbackFileName: GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME,
  },
  guide_poolside: {
    description:
      "Open one drill at a time with overview, next/forrige controls, swipe navigation, and visual fullscreen mode.",
    primaryHref: "/guides/poolside",
    primaryLabel: "Open interactive guide",
    secondaryHref: null,
    secondaryLabel: null,
    pdfApiHref: "/api/guides/poolside/pdf",
    pdfFallbackFileName: GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME,
  },
  analysis_video: {
    description:
      "Open your video analysis request flow and contact support if you need upload or booking help.",
    primaryHref: "/analysis",
    primaryLabel: "Open video analysis",
    secondaryHref: "/contact",
    secondaryLabel: "Contact support",
    pdfApiHref: null,
    pdfFallbackFileName: null,
  },
};

const UNKNOWN_ITEM_ACTION_COPY: LibraryItemActionCopy = {
  description:
    "We could not map this item to a self-serve flow yet. Request an access link or contact support.",
  primaryHref: "/claim?next=%2Fmy-library",
  primaryLabel: "Email me access link",
  secondaryHref: "/contact",
  secondaryLabel: "Contact support",
  pdfApiHref: null,
  pdfFallbackFileName: null,
};

function isCatalogProductId(productId: string): productId is CatalogProductId {
  return Object.prototype.hasOwnProperty.call(ITEM_ACTION_COPY_BY_CATALOG_ID, productId);
}

export function getLibraryItemActionCopy(productId: string): LibraryItemActionCopy {
  if (isCatalogProductId(productId)) {
    return ITEM_ACTION_COPY_BY_CATALOG_ID[productId];
  }

  return UNKNOWN_ITEM_ACTION_COPY;
}
