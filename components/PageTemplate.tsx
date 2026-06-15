// components/PageTemplate.tsx
"use client";

import BackButton from "@/components/BackButton";

type Props = {
  children: React.ReactNode;
  size?: "default" | "wide" | "course";
  surfaceTone?: "default" | "brand";
  showBack?: boolean;
  topInset?: "default" | "compact" | "tight" | "flush";

  /**
   * Best practice:
   * - On mobile we usually rely on bottom-nav.
   * - If you ever want BackButton on mobile for a specific page, set "all".
   */
  backVisibility?: "all" | "desktop";

  /**
   * Optional: extra bottom padding when you know there's a fixed bottom bar (custom or default).
   * Defaults to true (safe for all pages).
   */
  withBottomSafeArea?: boolean;
};

export default function PageTemplate({
  children,
  size = "default",
  surfaceTone = "default",
  showBack = true,
  topInset = "default",
  backVisibility = "desktop",
  withBottomSafeArea = true,
}: Props) {
  const showBackOnMobile = backVisibility === "all";
  const maxW =
    size === "course"
      ? "max-w-[720px] lg:max-w-[1080px] xl:max-w-[1420px] 2xl:max-w-[1560px]"
      : size === "wide"
        ? "max-w-[720px] lg:max-w-[860px] xl:max-w-[980px]"
        : "max-w-[520px]";
  const surfaceClass =
    surfaceTone === "brand"
      ? [
          "rounded-[28px] border p-6 backdrop-blur-xl sm:p-8 sm:backdrop-blur-xl",
          "border-blue-100/75 bg-[radial-gradient(140%_120%_at_50%_0%,rgba(96,165,250,0.18),rgba(255,255,255,0.92)_58%),linear-gradient(180deg,rgba(239,246,255,0.88),rgba(255,255,255,0.94))]",
          "shadow-[0_18px_48px_rgba(37,99,235,0.10)]",
          "lg:border-blue-100/85 lg:bg-[radial-gradient(150%_130%_at_50%_0%,rgba(96,165,250,0.24),rgba(255,255,255,0.88)_52%),linear-gradient(180deg,rgba(237,245,255,0.96),rgba(255,255,255,0.94))]",
          "lg:shadow-[0_24px_58px_rgba(37,99,235,0.12)] lg:backdrop-blur-md",
          "xl:bg-[radial-gradient(150%_130%_at_50%_0%,rgba(96,165,250,0.26),rgba(255,255,255,0.90)_52%),linear-gradient(180deg,rgba(237,245,255,0.98),rgba(255,255,255,0.95))]",
        ].join(" ")
      : "bg-white/72 lg:bg-white/84 rounded-[28px] border border-white/60 p-6 shadow-[0_16px_44px_rgba(16,24,40,0.11)] backdrop-blur-xl sm:p-8 sm:shadow-[0_14px_38px_rgba(16,24,40,0.09)] lg:border-slate-200/75 lg:shadow-[0_18px_46px_rgba(15,23,42,0.10)] lg:backdrop-blur-md xl:bg-white/90";
  const glowClass =
    surfaceTone === "brand"
      ? "pointer-events-none absolute inset-0 -z-10 rounded-[32px] shadow-[0_0_0_1px_rgba(191,219,254,0.72),0_24px_60px_rgba(59,130,246,0.14)] sm:shadow-[0_0_0_1px_rgba(191,219,254,0.72),0_22px_54px_rgba(59,130,246,0.12)] lg:shadow-[0_0_0_1px_rgba(191,219,254,0.78),0_30px_76px_rgba(59,130,246,0.18)]"
      : "pointer-events-none absolute inset-0 -z-10 rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_20px_56px_rgba(59,130,246,0.10)] sm:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_18px_48px_rgba(59,130,246,0.08)] lg:shadow-[0_0_0_1px_rgba(203,213,225,0.65),0_24px_58px_rgba(15,23,42,0.10)]";

  return (
    <div
      className={[
        "mx-auto w-full px-4",
        topInset === "flush"
          ? "pt-10 sm:pt-20"
          : topInset === "tight"
            ? "pt-[4.25rem] sm:pt-20"
            : topInset === "compact"
              ? "pt-20 sm:pt-24"
              : "pt-24 sm:pt-28",
        // keep content above any fixed bottom UI (default nav or custom bottom bar)
        withBottomSafeArea ? "pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-10" : "pb-10",
        // helps pages with little content not feel “floating”
        "min-h-[calc(100dvh-64px)]", // 64px topbar height
      ].join(" ")}
    >
      <section className={`relative mx-auto w-full ${maxW}`}>
        <div className={surfaceClass}>
          {showBack ? (
            showBackOnMobile ? (
              <BackButton />
            ) : (
              <div className="hidden sm:block">
                <BackButton />
              </div>
            )
          ) : null}

          {children}
        </div>

        {/* subtle outer glow */}
        <div className={glowClass} />
      </section>
    </div>
  );
}
