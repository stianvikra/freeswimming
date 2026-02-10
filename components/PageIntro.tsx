"use client";

import Image from "next/image";
import { cx } from "@/components/ui/cx";

type Props = {
  title: string;
  subtitle?: string;
  variant?: "default" | "compact";
  rightSlot?: React.ReactNode;
  className?: string;
};

export default function PageIntro({
  title,
  subtitle,
  variant = "default",
  rightSlot,
  className,
}: Props) {
  const compact = variant === "compact";
  const displaySubtitle = subtitle ?? "Learn. Drill. Swim.";

  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[22px] border border-blue-100/60 bg-[radial-gradient(520px_220px_at_15%_0%,rgba(99,168,255,0.12),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.76))] shadow-[0_12px_30px_rgba(15,23,42,0.07)]",
        compact ? "p-4" : "p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div
            className={cx(
              "relative shrink-0",
              compact ? "h-10 w-10 sm:h-11 sm:w-11" : "h-12 w-12"
            )}
          >
            <Image
              src="/logos/01_icon_transparent.png"
              alt="Freeswimming logo"
              fill
              className="object-contain"
              sizes={compact ? "44px" : "48px"}
            />
          </div>

          <div className="leading-tight">
            <h1
              className={cx(
                "font-semibold tracking-tight text-slate-900",
                compact ? "text-[22px]" : "text-[23px]"
              )}
            >
              {title}
            </h1>
            <p
              className={cx(
                "mt-1 font-medium tracking-[0.01em] text-slate-700",
                compact ? "text-[14px]" : "text-[14px]"
              )}
            >
              {displaySubtitle}
            </p>
          </div>
        </div>

        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-200/70 via-blue-100/60 to-transparent" />
    </div>
  );
}
