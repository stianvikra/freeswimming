"use client";

import BackButton from "@/components/BackButton";

type Props = {
  children: React.ReactNode;
  size?: "default" | "wide";
  showBack?: boolean;
};

export default function PageTemplate({
  children,
  size = "default",
  showBack = true,
}: Props) {
  return (
    <div className="mx-auto flex min-h-screen items-start justify-center px-4 pb-10 pt-24 sm:pt-28">
      <section
        className={`relative w-full ${
          size === "wide" ? "max-w-[720px]" : "max-w-[520px]"
        }`}
      >
        <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_90px_rgba(16,24,40,0.18)] backdrop-blur-xl sm:p-8">
          {showBack && <BackButton />}
          {children}
        </div>

        {/* subtle outer glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_50px_140px_rgba(59,130,246,0.20)]" />
      </section>
    </div>
  );
}