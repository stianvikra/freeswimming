"use client";

import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export default function ActionButton({
  title,
  subtitle,
  href,
  onClick,
  variant = "secondary",
  disabled = false,
}: Props) {
  const base =
    "group relative w-full select-none rounded-2xl px-6 " +
    "min-h-[72px] sm:min-h-[76px] " + // <-- lik høyde alltid (mobile-first)
    "flex flex-col items-center justify-center gap-1 " +
    "transition-[transform,box-shadow,filter,background-color,border-color] duration-200 ease-out " +
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2d8fff]/25 " +
    "active:translate-y-[1px]";

  const primary =
    "text-white bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] " +
    "shadow-[0_18px_50px_rgba(45,143,255,0.22)] " +
    "hover:brightness-[1.03] active:brightness-[0.98] " +
    "hover:shadow-[0_24px_70px_rgba(45,143,255,0.28)]";

  const secondary =
    "bg-white/85 backdrop-blur border border-white/70 " +
    "text-slate-900 " +
    "shadow-[0_12px_30px_rgba(15,23,42,0.10)] " +
    "hover:bg-white hover:shadow-[0_18px_46px_rgba(15,23,42,0.14)]";

  const disabledStyle =
    "opacity-55 cursor-not-allowed hover:brightness-100 hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)] active:translate-y-0";

  const skin = variant === "primary" ? primary : secondary;

  const content = (
    <>
      <div
        className={
          "text-[15px] sm:text-[16px] font-semibold tracking-[0.12em] " +
          (variant === "primary" ? "text-white/95" : "text-slate-900")
        }
      >
        {title}
      </div>

      {/* Reserve one line height always => identical button height */}
      <div className="h-[16px] sm:h-[18px]">
        {subtitle ? (
          <div
            className={
              "text-xs sm:text-sm " +
              (variant === "primary" ? "text-white/80" : "text-slate-500")
            }
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </>
  );

  // Link mode
  if (href && !disabled) {
    return (
      <Link className={`${base} ${skin}`} href={href}>
        {content}
      </Link>
    );
  }

  // Button mode
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