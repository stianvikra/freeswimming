"use client";

import { useRouter } from "next/navigation";

type Props = {
  fallbackHref?: string;
};

export default function BackButton({ fallbackHref = "/" }: Props) {
  const router = useRouter();

  const handleBack = () => {
    // Best effort: if there is a history stack, go back. Otherwise, fallback.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      className={[
        // spacing
        "mb-4 inline-flex items-center gap-2",

        // bigger tap target (without looking big)
        "rounded-2xl px-3 py-2",

        // typography
        "text-[14px] font-semibold text-slate-700",

        // background + hover
        "bg-white/40 ring-1 ring-white/60 backdrop-blur",
        "hover:bg-white/65 hover:text-slate-900 hover:shadow-sm",

        // your global interaction system
        "ui-press ui-focus",
      ].join(" ")}
    >
      <span className="text-[18px] leading-none">←</span>
      Back
    </button>
  );
}