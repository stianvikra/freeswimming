"use client";

import Link from "next/link";

type ActionButtonProps = {
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
}: ActionButtonProps) {
  const base =
    "group relative w-full h-16 rounded-2xl px-5 flex flex-col items-center justify-center text-center select-none " +
    "transition-transform transition-shadow duration-200 " +
    "active:translate-y-[1px] " +
    "focus-visible:focus-ring";

  const primary =
    "text-white " +
    "bg-[linear-gradient(180deg,#5ea0ff_0%,#4f8fe5_100%)] " +
    "shadow-[0_18px_40px_rgba(79,143,229,0.35)] " +
    "hover:brightness-[1.03] hover:shadow-[0_22px_52px_rgba(79,143,229,0.45)]";

  const secondary =
    "bg-white text-slate-900 border border-slate-200 " +
    "shadow-[0_10px_24px_rgba(15,23,42,0.08)] " +
    "hover:shadow-[0_14px_34px_rgba(15,23,42,0.10)] hover:bg-slate-50";

  const disabledStyle =
    "opacity-50 cursor-not-allowed hover:brightness-100 hover:shadow-none active:translate-y-0";

  const cls =
    base +
    " " +
    (variant === "primary" ? primary : secondary) +
    (disabled ? " " + disabledStyle : "");

  const Title = (
    <div className="text-[15px] font-semibold tracking-wide">{title}</div>
  );

  const Sub = subtitle ? (
    <div
      className={
        "mt-0.5 text-xs " +
        (variant === "primary" ? "text-white/85" : "text-slate-500")
      }
    >
      {subtitle}
    </div>
  ) : null;

  const content = (
    <>
      {Title}
      {Sub}
    </>
  );

  // Link mode
  if (href && !disabled) {
    return (
      <Link className={cls} href={href}>
        {content}
      </Link>
    );
  }

  // Button mode
  return (
    <button
      type="button"
      className={cls}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      disabled={disabled}
    >
      {content}
    </button>
  );
}