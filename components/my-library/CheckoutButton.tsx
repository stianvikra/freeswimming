"use client";

import { useState } from "react";

type Props = {
  productId: string;
  cancelPath?: string;
  className?: string;
};

type CheckoutResponse = {
  ok: boolean;
  url?: string;
  error?: string;
};

export default function CheckoutButton({
  productId,
  cancelPath = "/my-library",
  className = "",
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    if (pending) return;
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          cancelPath,
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
        className={`inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {pending ? "Opening checkout..." : "Buy now"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
