// components/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";
import PressButton from "@/components/ui/PressButton";

type Props = {
  fallbackHref?: string;
  disabled?: boolean;
};

export default function BackButton({ fallbackHref = "/", disabled = false }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (disabled) return;

    // Best effort: if there is a history stack, go back. Otherwise, fallback.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <PressButton
      tier="nav"
      onClick={handleBack}
      aria-label="Go back"
      disabled={disabled}
      className={[
        // spacing
        "mb-4 inline-flex items-center gap-2",

        // tap target
        "rounded-2xl px-3 py-2",

        // typography
        "text-[14px] font-semibold",

        // skin (motion handled by ui-press)
        "bg-white/70 text-slate-800 ring-1 ring-white/70 backdrop-blur",

        // hover only on desktop-like pointers
        "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/90",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-900",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-sm",

        // disabled
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <span className="text-[18px] leading-none">←</span>
      Back
    </PressButton>
  );
}
