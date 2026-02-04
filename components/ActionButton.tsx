// components/ActionButton.tsx
"use client";

import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  note?: string; // small reassurance / microcopy line
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export default function ActionButton({
  title,
  subtitle,
  note,
  href,
  onClick,
  variant = "secondary",
  disabled = false,
}: Props) {
  // ✅ Key change: the outer container is NOT flex-col anymore.
  // We center one inner content block vertically. That block manages spacing.
  const base =
    "group relative w-full select-none rounded-2xl px-6 " +
    "min-h-[78px] sm:min-h-[82px] " +
    "flex items-center justify-center " +
    "transition-[transform,box-shadow,filter,background-color,border-color] duration-200 ease-out " +
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2d8fff]/25 " +
    "active:translate-y-[1px]";

  const primary =
    "text-white bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] " +
    "shadow-[0_18px_55px_rgba(45,143,255,0.26)] " +
    "hover:brightness-[1.03] active:brightness-[0.98] " +
    "hover:shadow-[0_26px_90px_rgba(45,143,255,0.32)]";

  const secondary =
    "bg-white/90 backdrop-blur border border-white/80 " +
    "text-slate-900 " +
    "shadow-[0_12px_36px_rgba(15,23,42,0.11)] " +
    "hover:bg-white hover:shadow-[0_18px_54px_rgba(15,23,42,0.15)]";

  const disabledStyle =
    "opacity-55 cursor-not-allowed hover:brightness-100 " +
    "hover:shadow-[0_12px_36px_rgba(15,23,42,0.11)] active:translate-y-0";

  const skin = variant === "primary" ? primary : secondary;

  // ✅ Inner block manages spacing:
  // - 2 lines (title + subtitle) become visually centered
  // - 3 lines (title + subtitle + note) stay balanced
  const content = (
    <div className="flex w-full flex-col items-center justify-center text-center">
      {/* TITLE */}
      <div
        className={
          "text-[16px] sm:text-[17px] font-semibold tracking-[0.14em] " +
          (variant === "primary" ? "text-white/95" : "text-slate-900")
        }
      >
        {title}
      </div>

      {/* SUBTITLE */}
      {subtitle ? (
        <div
          className={
            "mt-1 text-[14.5px] leading-[1.2] sm:text-[14px] font-medium " +
            (variant === "primary" ? "text-white/85" : "text-slate-600")
          }
        >
          {subtitle}
        </div>
      ) : null}

      {/* NOTE */}
      {note ? (
        <div
          className={
            "mt-2 text-[12px] font-medium leading-4 tracking-wide " +
            (variant === "primary" ? "text-white/70" : "text-slate-400")
          }
        >
          {note}
        </div>
      ) : null}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link className={`${base} ${skin}`} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${base} ${skin} ${disabled ? disabledStyle : ""}`}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
    >
      {content}
    </button>
  );
}