"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";
import Image from "next/image";

export default function HowWeTeachClient() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/logos/01_icon_transparent.png"
              alt="Freeswimming logo"
              fill
              priority
              className="object-contain"
              sizes="48px"
            />
          </div>

          <div className="leading-tight">
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
              How we teach
            </h1>
            <p className="mt-1 text-[14px] font-medium text-slate-600">
            A simple way to learn freestyle — without overthinking.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5 text-[16px] leading-7 text-slate-700">
          <p>
            This is a free, step-by-step freestyle course for adults who want to
            feel calm in the water, swim longer with less effort, and build real
            technique — without information overload.
          </p>

          {/* 01 Learn */}
<div className="relative overflow-hidden rounded-2xl bg-white/90 p-5 ring-1 ring-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#8bc6ff] to-transparent" />
  <h2 className="flex items-center gap-3">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(58,135,230,0.35)]">
      01
    </span>
    <span className="text-[19px] font-semibold tracking-tight text-slate-900">
      Learn
    </span>
  </h2>

  <div className="mt-3 space-y-2 text-[16px] leading-7 text-slate-700">
  <p className="font-semibold text-slate-900">
    Before you swim, you learn what actually matters.
  </p>

  <p>
    One clear concept at a time — so you enter the water calm, not guessing.
  </p>
</div>
</div>

{/* 02 Drill */}
<div className="relative overflow-hidden rounded-2xl bg-white/90 p-5 ring-1 ring-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#8bc6ff] to-transparent" />
  <h2 className="flex items-center gap-3">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(58,135,230,0.35)]">
      02
    </span>
    <span className="text-[19px] font-semibold tracking-tight text-slate-900">
      Drill
    </span>
  </h2>

  <p className="font-semibold text-slate-900">
  Each drill is one piece of the puzzle.
</p>
<p>
  Balance, body position, breathing and coordination — trained one at a time.
</p>
</div>

{/* 03 Swim */}
<div className="relative overflow-hidden rounded-2xl bg-white/90 p-5 ring-1 ring-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#8bc6ff] to-transparent" />
  <h2 className="flex items-center gap-3">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(58,135,230,0.35)]">
      03
    </span>
    <span className="text-[19px] font-semibold tracking-tight text-slate-900">
      Swim
    </span>
  </h2>

  <p className="font-semibold text-slate-900">
  When the pieces come together, you stop thinking.
</p>
<p>
  You swim — calm, balanced and relaxed. Distance and speed follow naturally.
</p>

</div>

          <p>
          If you’re chasing the Olympics, you probably need a different coach. If you want to become a strong, relaxed swimmer — this is built for you.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row">
          <div className="sm:flex-1">
            <ActionButton
              title="FREE COURSE"
              subtitle="Start swimming today"
              href="/course"
              variant="primary"
            />
          </div>
          <div className="sm:flex-1">
            <ActionButton
              title="CONTACT"
              subtitle="Help us help you swim better"
              href="/contact"
              variant="secondary"
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="mx-auto h-px w-full max-w-[520px] bg-slate-200/80" />
          <p className="mt-5 text-center text-[15px] font-medium tracking-wide text-slate-700">
            Learn. Drill. Swim.
          </p>
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
