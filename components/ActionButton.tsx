// components/ActionButton.tsx
"use client";

import PressButton from "@/components/ui/PressButton";
import PressLink from "@/components/ui/PressLink";

type Props = {
  title: string;
  subtitle?: string;
  note?: string; // small reassurance / microcopy line
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  compact?: boolean;
  disabled?: boolean;
};

export default function ActionButton({
  title,
  subtitle,
  note,
  href,
  onClick,
  variant = "secondary",
  compact = false,
  disabled = false,
}: Props) {
  // Base = structure + interaction system
  const base =
    `group relative w-full rounded-2xl ${compact ? "px-5" : "px-6"} ` +
    `${compact ? "min-h-[72px] sm:min-h-[76px]" : "min-h-[78px] sm:min-h-[82px]"} ` +
    "flex items-center justify-center";

  // Skins only (colors/shadows/rings) — hover/press lives in globals via ui-press
  const primary =
    "text-white bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] " +
    "shadow-[0_18px_55px_rgba(45,143,255,0.26)]";

  const secondary =
    "bg-white/92 backdrop-blur border border-slate-200/80 " +
    "text-slate-900 " +
    "shadow-[0_10px_26px_rgba(15,23,42,0.085)]";

  const disabledStyle = "opacity-55";

  const skin = variant === "primary" ? primary : secondary;

  // Inner content micro-motion (desktop-only; no motion when disabled)
  const content = (
    <div
      className={[
        "flex w-full flex-col items-center justify-center text-center",
        disabled
          ? ""
          : [
              "transition-transform duration-200 ease-out",
              "[@media(hover:hover)_and_(pointer:fine)]:group-hover:-translate-y-[0.5px]",
              "group-active:translate-y-[0.5px]",
            ].join(" "),
      ].join(" ")}
    >
      {/* TITLE */}
      <div
        className={[
          "text-[16px] font-semibold tracking-[0.09em] sm:text-[17px] sm:tracking-[0.1em]",
          variant === "primary" ? "text-white/95" : "text-slate-900",
        ].join(" ")}
      >
        {title}
      </div>

      {/* SUBTITLE */}
      {subtitle ? (
        <div
          className={[
            "mt-1 text-[14px] font-medium leading-[1.25] sm:text-[14px]",
            variant === "primary" ? "text-white/85" : "text-slate-600",
          ].join(" ")}
        >
          {subtitle}
        </div>
      ) : null}

      {/* NOTE */}
      {note ? (
        <div
          className={[
            "mt-2 text-[12px] font-medium leading-4 tracking-wide",
            variant === "primary" ? "text-white/72" : "text-slate-500",
          ].join(" ")}
        >
          {note}
        </div>
      ) : null}
    </div>
  );

  // Link variant (only when enabled)
  if (href && !disabled) {
    return (
      <PressLink tier="cta" className={`${base} ${skin}`} href={href}>
        {content}
      </PressLink>
    );
  }

  // If href exists but disabled: render a non-interactive element (no click, no keyboard action)
  if (href && disabled) {
    return (
      <PressLink tier="cta" className={`${base} ${skin} ${disabledStyle}`} href={href} disabled>
        {content}
      </PressLink>
    );
  }

  // Button variant
  return (
    <PressButton
      tier="cta"
      className={`${base} ${skin} ${disabled ? disabledStyle : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {content}
    </PressButton>
  );
}
