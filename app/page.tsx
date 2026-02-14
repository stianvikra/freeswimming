// app/page.tsx
"use client";

import Image from "next/image";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";

export default function HomePage() {
  return (
    <SiteChrome>
      {/* Home = top level → no back button */}
      <PageTemplate showBack={false} withBottomSafeArea={false} topInset="compact">
        <div className="relative overflow-hidden rounded-[22px] border border-blue-100/60 bg-[radial-gradient(560px_220px_at_16%_0%,rgba(99,168,255,0.12),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.78))] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)] sm:p-5 [@media(max-height:820px)]:p-3 [@media(min-height:880px)]:p-3.5">
          {/* Hero logo */}
          <div className="flex justify-center">
            <div className="relative h-[122px] w-[122px] sm:h-[142px] sm:w-[142px] [@media(max-height:820px)]:h-[106px] [@media(max-height:820px)]:w-[106px] [@media(min-height:880px)]:h-[112px] [@media(min-height:880px)]:w-[112px]">
              <Image
                src="/logos/01_icon_transparent.png"
                alt="Freeswimming.org logo"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 640px) 132px, 150px"
              />
            </div>
          </div>

          {/* Copy */}
          <div className="mt-3 text-center [@media(max-height:820px)]:mt-2.5 [@media(min-height:880px)]:mt-2">
            <p className="text-[16px] leading-6 text-slate-700">
              Olympic dreams? <span className="font-semibold text-slate-900">Wrong channel.</span>
            </p>

            <h1 className="mt-2.5 text-[22px] font-semibold leading-7 tracking-tight text-slate-900 [@media(max-height:820px)]:mt-2">
              Adult learner?
            </h1>

            <p className="mt-1.5 text-[16px] leading-6 text-slate-700 [@media(max-height:820px)]:mt-1">
              You&apos;re exactly where you should be.
            </p>
          </div>

          <div className="mt-3 h-px w-full bg-gradient-to-r from-blue-200/70 via-blue-100/60 to-transparent [@media(max-height:820px)]:mt-2.5 [@media(min-height:880px)]:mt-2" />
          <p className="mt-1.5 text-center text-[15px] font-medium tracking-[0.01em] text-slate-700">
            Learn. Drill. Swim.
          </p>
        </div>

        {/* Actions (wrapped for premium consistency) */}
        <div className="mt-3 rounded-[24px] border border-blue-100/60 bg-[radial-gradient(560px_220px_at_15%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_66%),rgba(255,255,255,0.76)] p-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.07)] sm:p-4 [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:p-3 [@media(min-height:880px)]:mt-2.5">
          <div className="flex flex-col gap-3">
            <ActionButton
              title="FREE COURSE"
              subtitle="Start swimming today"
              note="No signup. No paywall. Just swim."
              href="/course"
              variant="primary"
              compact
            />

            <ActionButton
              title="SWIM PROGRAMS"
              subtitle="Structured plans & PDFs"
              href="/programs"
              variant="secondary"
              compact
            />

            <ActionButton
              title="VIDEO ANALYSIS"
              subtitle="Personal feedback — optional"
              href="/analysis"
              variant="secondary"
              compact
            />

            <ActionButton
              title="CONTACT"
              subtitle="Help us help you swim better"
              href="/contact"
              variant="secondary"
              compact
            />
          </div>
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
