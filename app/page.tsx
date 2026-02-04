// app/page.tsx
"use client";

import Image from "next/image";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";

export default function HomePage() {
  return (
    <SiteChrome>
      <PageTemplate>
        {/* Hero logo */}
        <div className="flex justify-center">
          <div className="relative h-[132px] w-[132px] sm:h-[150px] sm:w-[150px]">
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
        <div className="mt-4 text-center">
          <p className="text-[16px] leading-6 text-slate-700">
            Olympic dreams?{" "}
            <span className="font-semibold text-slate-900">
              Wrong channel.
            </span>
          </p>

          <h1 className="mt-3 text-[22px] font-semibold leading-7 tracking-tight text-slate-900">
            Adult learner?
          </h1>

          <p className="mt-2 text-[17px] leading-6 text-slate-700">
            You&apos;re exactly where you should be.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-4">
          <ActionButton
            title="FREE COURSE"
            subtitle="Start swimming today"
            note="No signup. No paywall. Just swim."
            href="/course"
            variant="primary"
          />

          <ActionButton
            title="SWIM PROGRAMS"
            subtitle="Structured plans & PDFs"
            href="/programs"
            variant="secondary"
          />

          <ActionButton
            title="VIDEO ANALYSIS"
            subtitle="Personal feedback — optional"
            href="/analysis"
            variant="secondary"
          />

          <ActionButton
            title="CONTACT"
            subtitle="Help us help you swim better"
            href="/contact"
            variant="secondary"
          />
        </div>

        {/* Footer line + tagline */}
        <div className="mt-7">
          <div className="mx-auto h-px w-full max-w-[420px] bg-slate-200/80" />
          <p className="mt-5 text-center text-[15px] font-medium tracking-wide text-slate-700">
            Learn. Drill. Swim.
          </p>
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}