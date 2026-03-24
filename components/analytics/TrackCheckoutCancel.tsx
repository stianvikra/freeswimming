"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

type Props = {
  surface: "plans" | "my_library";
};

function buildDedupKey(pathname: string, source: string, productId: string) {
  return `fs_analytics_checkout_cancel_tracked:${pathname}:${source}:${productId}`;
}

export default function TrackCheckoutCancel({ surface }: Props) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkout = searchParams?.get("checkout");
    if (checkout !== "cancelled") return;

    const source = searchParams?.get("source") || "unknown";
    const productId = searchParams?.get("product") || "unknown";
    const dedupKey = buildDedupKey(pathname, source, productId);

    try {
      if (window.sessionStorage.getItem(dedupKey) === "1") return;
      window.sessionStorage.setItem(dedupKey, "1");
    } catch {
      // Ignore storage errors and continue best-effort tracking.
    }

    void sendClientAnalyticsEvent("upsell_declined", {
      surface,
      source,
      productId,
      reason: "checkout_cancelled",
    });
  }, [pathname, searchParams, surface]);

  return null;
}
