"use client";

import { useId, useState } from "react";
import CommerceActionFeedback from "@/components/commerce/CommerceActionFeedback";
import { cx } from "@/components/ui/cx";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

type Props = {
  productId: string;
  cancelPath?: string;
  analyticsSource?: "plans" | "library_explore" | "unknown";
  label?: string;
  className?: string;
};

type CheckoutResponse = {
  ok: boolean;
  url?: string;
  error?: string;
};

const checkoutButtonClassName =
  "fs-cta-primary inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

export default function CheckoutButton({
  productId,
  cancelPath = "/my-library",
  analyticsSource = "unknown",
  label = "Buy now",
  className = "",
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const feedbackId = useId();
  const feedbackMessage = pending ? "Opening secure checkout..." : error;
  const feedbackTone = pending ? "pending" : error ? "error" : null;

  function buildCancelPathWithTracking(basePath: string) {
    const url = new URL(basePath, "https://freeswimming.org");
    url.searchParams.set("checkout", "cancelled");
    url.searchParams.set("product", productId);
    url.searchParams.set("source", analyticsSource);
    return `${url.pathname}${url.search}`;
  }

  async function onClick() {
    if (pending) return;
    setPending(true);
    setError("");

    void sendClientAnalyticsEvent("upsell_accepted", {
      productId,
      source: analyticsSource,
    });

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          cancelPath: buildCancelPathWithTracking(cancelPath),
          source: analyticsSource,
        }),
      });

      const json = (await response.json()) as CheckoutResponse;
      if (!response.ok || !json.ok || !json.url) {
        throw new Error(json.error || "Could not start checkout.");
      }

      window.location.assign(json.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start checkout.";
      setError(message);
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-describedby={feedbackMessage ? feedbackId : undefined}
        className={cx(checkoutButtonClassName, className)}
      >
        {pending ? "Opening checkout..." : label}
      </button>
      {feedbackMessage && feedbackTone ? (
        <CommerceActionFeedback id={feedbackId} tone={feedbackTone} testId="checkout-feedback">
          {feedbackMessage}
        </CommerceActionFeedback>
      ) : null}
    </div>
  );
}
