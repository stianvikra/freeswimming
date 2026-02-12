// components/PageTemplate.tsx
"use client";

import BackButton from "@/components/BackButton";

type Props = {
  children: React.ReactNode;
  size?: "default" | "wide";
  showBack?: boolean;
  topInset?: "default" | "compact";

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
  showBack = true,
  topInset = "default",
  backVisibility = "desktop",
  withBottomSafeArea = true,
}: Props) {
  const showBackOnMobile = backVisibility === "all";
  const maxW = size === "wide" ? "max-w-[720px]" : "max-w-[520px]";

  return (
    <div
      className={[
        "mx-auto w-full px-4",
        topInset === "compact" ? "pt-20 sm:pt-24" : "pt-24 sm:pt-28",
        // keep content above any fixed bottom UI (default nav or custom bottom bar)
        withBottomSafeArea ? "pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-10" : "pb-10",
        // helps pages with little content not feel “floating”
        "min-h-[calc(100dvh-64px)]", // 64px topbar height
      ].join(" ")}
    >
      <section className={`relative mx-auto w-full ${maxW}`}>
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_16px_44px_rgba(16,24,40,0.11)] backdrop-blur-xl sm:p-8 sm:shadow-[0_14px_38px_rgba(16,24,40,0.09)]">
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
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_20px_56px_rgba(59,130,246,0.10)] sm:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_18px_48px_rgba(59,130,246,0.08)]" />
      </section>
    </div>
  );
}
