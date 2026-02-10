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
              className="object-contain"
              sizes="48px"
            />
          </div>

          <div className="leading-tight">
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
              How we teach
            </h1>
            <p className="mt-1 text-[14px] font-medium text-slate-600">
              Learn. Drill. Swim.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5 text-[16px] leading-7 text-slate-700">
          <p>
            A free, step-by-step freestyle course for adults who want to swim
            calmly, longer, and with less effort — without information overload.
          </p>

          {/* 01 Learn */}
          <div className="relative overflow-hidden rounded-2xl bg-white/90 p-5 ring-1 ring-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            {/* softer top stripe */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#8bc6ff] to-transparent opacity-80" />

            <h2 className="flex items-center gap-3">
              {/* smaller + softer badge */}
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] text-[10px] font-semibold text-white/90 shadow-[0_6px_16px_rgba(58,135,230,0.28)]">
                01
              </span>
              <span className="text-[19px] font-semibold tracking-tight text-slate-900">
                Learn
              </span>
            </h2>

            <div className="mt-2 space-y-2 text-[16px] leading-7 text-slate-700">
              <p className="font-medium text-slate-800">
                Before you swim, you learn what actually matters.
              </p>
              <p>
                One clear concept at a time — so you enter the water calm and
                confident.
              </p>
            </div>
          </div>

          <div className="h-2" />

          {/* 02 Drill */}
          <div className="relative overflow-hidden rounded-2xl bg-white/90 p-5 ring-1 ring-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#8bc6ff] to-transparent opacity-80" />

            <h2 className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] text-[10px] font-semibold text-white/90 shadow-[0_6px_16px_rgba(58,135,230,0.28)]">
                02
              </span>
              <span className="text-[19px] font-semibold tracking-tight text-slate-900">
                Drill
              </span>
            </h2>

            <div className="mt-2 space-y-2 text-[16px] leading-7 text-slate-700">
              <p className="font-medium text-slate-800">
                Each drill is one piece of the puzzle.
              </p>
              <p>
                Balance, body position, breathing and coordination — trained one
                at a time, without overwhelm.
              </p>
            </div>
          </div>

          <div className="h-2" />

          {/* 03 Swim */}
          <div className="relative overflow-hidden rounded-2xl bg-white/90 p-5 ring-1 ring-slate-100 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#8bc6ff] to-transparent opacity-80" />

            <h2 className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] text-[10px] font-semibold text-white/90 shadow-[0_6px_16px_rgba(58,135,230,0.28)]">
                03
              </span>
              <span className="text-[19px] font-semibold tracking-tight text-slate-900">
                Swim
              </span>
            </h2>

            <div className="mt-2 space-y-2 text-[16px] leading-7 text-slate-700">
              <p className="font-medium text-slate-800">
                When the pieces come together, you stop fighting the water.
              </p>
              <p>
                You swim — calm, balanced and relaxed. Distance and speed follow
                naturally - without forcing it.
                {/* Optional micro-copy:
                    "Distance and speed follow naturally — without forcing it."
                */}
              </p>
            </div>
          </div>

          <p>
            If you’re chasing the Olympics, you probably need a different coach.
            <br />
            If you want to become a strong, relaxed swimmer — this is built for
            you.
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
