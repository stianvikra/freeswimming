// components/ActionButton.tsx
"use client";

import PressButton from "@/components/ui/PressButton";
import PressLink from "@/components/ui/PressLink";
import { cx } from "@/components/ui/cx";

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
  const heightClass = compact
    ? note
      ? "min-h-[76px] sm:min-h-[80px]"
      : "min-h-[72px] sm:min-h-[76px]"
    : note
      ? "min-h-[82px] sm:min-h-[86px]"
      : "min-h-[78px] sm:min-h-[82px]";

  // Base = structure + interaction system
  const base = cx(
    "group relative flex w-full items-center justify-center",
    compact ? "px-5" : "px-6",
    heightClass,
    "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
  );

  const disabledStyle = "opacity-55";
  const skin =
    variant === "primary"
      ? "fs-cta-primary"
      : "fs-library-card bg-white/92 text-[color:var(--fs-color-ink)] hover:bg-white";

  // Inner content micro-motion (desktop-only; no motion when disabled)
  const content = (
    <div
      className={cx(
        "flex w-full flex-col items-center justify-center text-center",
        note ? "pb-0.5" : undefined,
        disabled
          ? undefined
          : "transition-transform duration-200 ease-out group-active:translate-y-[0.5px] [@media(hover:hover)_and_(pointer:fine)]:group-hover:-translate-y-[0.5px]"
      )}
    >
      {/* TITLE */}
      <div
        className={cx(
          "text-[16px] font-semibold tracking-[0.04em] sm:text-[17px]",
          variant === "primary" ? "text-white/95" : "text-[color:var(--fs-color-ink-strong)]"
        )}
      >
        {title}
      </div>

      {/* SUBTITLE */}
      {subtitle ? (
        <div
          className={cx(
            "mt-1 text-[14px] leading-[1.25] font-medium sm:text-[14px]",
            variant === "primary" ? "text-white/85" : "text-[color:var(--fs-color-muted)]"
          )}
        >
          {subtitle}
        </div>
      ) : null}

      {/* NOTE */}
      {note ? (
        <div
          className={cx(
            "mt-2.5 text-[12px] leading-4 font-medium",
            variant === "primary" ? "text-white/72" : "text-[color:var(--fs-color-muted)]"
          )}
        >
          {note}
        </div>
      ) : null}
    </div>
  );

  // Link variant (only when enabled)
  if (href && !disabled) {
    return (
      <PressLink tier="cta" className={cx(base, skin)} href={href} prefetch={false}>
        {content}
      </PressLink>
    );
  }

  // If href exists but disabled: render a non-interactive element (no click, no keyboard action)
  if (href && disabled) {
    return (
      <PressLink tier="cta" className={cx(base, skin, disabledStyle)} href={href} disabled>
        {content}
      </PressLink>
    );
  }

  // Button variant
  return (
    <PressButton
      tier="cta"
      className={cx(base, skin, disabled ? disabledStyle : undefined)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {content}
    </PressButton>
  );
}
