"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import {
  CHECKOUT_CANCEL_REASON,
  parseWorkoutContextCheckoutCancelAttribution,
} from "@/lib/commerce/checkout";

type Props = {
  surface: "plans" | "my_library";
};

function buildDedupKey(
  pathname: string,
  source: string,
  productId: string,
  placementId: string,
  surface: string
) {
  return `fs_analytics_checkout_cancel_tracked:${pathname}:${source}:${productId}:${placementId}:${surface}`;
}

export default function TrackCheckoutCancel({ surface }: Props) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkout = searchParams?.get("checkout");
    if (checkout !== "cancelled") return;

    const source = searchParams?.get("source") || "unknown";
    const productId = searchParams?.get("productId") || searchParams?.get("product") || "unknown";
    const placementId = searchParams?.get("placementId") || "none";
    const surfaceParam = searchParams?.get("surface") || surface;
    const dedupKey = buildDedupKey(pathname, source, productId, placementId, surfaceParam);

    try {
      if (window.sessionStorage.getItem(dedupKey) === "1") return;
      window.sessionStorage.setItem(dedupKey, "1");
    } catch {
      // Ignore storage errors and continue best-effort tracking.
    }

    const workoutContextCancelAttribution = parseWorkoutContextCheckoutCancelAttribution({
      source,
      productId,
      placementId,
      surface: searchParams?.get("surface"),
      reason: searchParams?.get("reason"),
    });

    if (workoutContextCancelAttribution) {
      void sendClientAnalyticsEvent("upsell_declined", workoutContextCancelAttribution);
      return;
    }

    void sendClientAnalyticsEvent("upsell_declined", {
      surface,
      source,
      productId: searchParams?.get("product") || "unknown",
      reason: CHECKOUT_CANCEL_REASON,
    });
  }, [pathname, searchParams, surface]);

  return null;
}
