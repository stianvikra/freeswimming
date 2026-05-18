"use client";

import BrandImage from "@/components/brand/BrandImage";
import { cx } from "@/components/ui/cx";
import { BRAND_USAGE } from "@/lib/brand";

type Props = {
  title: string;
  subtitle?: string;
  variant?: "default" | "compact";
  rightSlot?: React.ReactNode;
  rightSlotClassName?: string;
  belowDivider?: React.ReactNode;
  className?: string;
  brandMarkClassName?: string;
  brandMarkTestId?: string;
};

export default function PageIntro({
  title,
  subtitle,
  variant = "default",
  rightSlot,
  rightSlotClassName,
  belowDivider,
  className,
  brandMarkClassName,
  brandMarkTestId,
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
            data-testid={brandMarkTestId}
            className={cx(
              "relative shrink-0",
              compact ? "h-10 w-16 sm:h-11 sm:w-[70px]" : "h-12 w-[76px]"
            )}
          >
            <BrandImage
              asset={BRAND_USAGE.pageIntroSymbol}
              decorative
              className={brandMarkClassName ?? "h-full w-full object-contain"}
              sizes={compact ? "70px" : "76px"}
            />
          </div>

          <div className="leading-tight">
            <h1
              className={cx(
                "font-semibold tracking-[-0.02em] text-slate-900",
                compact ? "text-[22px]" : "text-[23px]"
              )}
            >
              {title}
            </h1>
            <p
              className={cx(
                "mt-1 font-semibold tracking-[0.04em] text-slate-700",
                compact ? "text-[14px]" : "text-[14px]"
              )}
            >
              {displaySubtitle}
            </p>
          </div>
        </div>

        {rightSlot ? <div className={cx("shrink-0", rightSlotClassName)}>{rightSlot}</div> : null}
      </div>

      <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-200/70 via-blue-100/60 to-transparent" />
      {belowDivider ? <div className="mt-2">{belowDivider}</div> : null}
    </div>
  );
}
