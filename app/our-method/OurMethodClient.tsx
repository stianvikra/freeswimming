"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";
import Image from "next/image";

export default function OurMethodClient() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <div className="relative overflow-hidden rounded-[22px] border border-blue-100/60 bg-[radial-gradient(520px_220px_at_15%_0%,rgba(99,168,255,0.12),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.76))] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)] sm:p-5">
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
              <h1 className="text-[23px] font-semibold tracking-tight text-slate-900">
                Our Method
              </h1>
              <p className="mt-1 text-[14px] font-medium text-slate-600">
                Learn. Drill. Swim.
              </p>
            </div>
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-200/70 via-blue-100/60 to-transparent" />
        </div>

        <div className="mt-6 text-[16px] leading-7 text-slate-700">
          <p>
            A free, step-by-step freestyle course for adults who want to swim
            calmly, longer, and with less effort — without information overload.
          </p>

          <div className="mt-6 space-y-5">
            {/* 01 Learn */}
            <div className="relative overflow-hidden rounded-2xl bg-white/90 p-5 ring-1 ring-blue-100/72 shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#8bc6ff] to-transparent opacity-78" />

              <h2 className="flex items-center gap-3">
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

            {/* 02 Drill */}
            <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.90),rgba(248,250,252,0.93))] p-5 ring-1 ring-slate-200/78 shadow-[0_12px_30px_rgba(15,23,42,0.065)]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#78b6ff] via-[#a4ceff] to-transparent opacity-68" />

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

            {/* 03 Swim */}
            <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(500px_180px_at_12%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_63%),rgba(255,255,255,0.90)] p-5 ring-1 ring-blue-100/65 shadow-[0_14px_34px_rgba(37,99,235,0.085)]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4b96f1] via-[#85c2ff] to-transparent opacity-76" />

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
                  naturally — without forcing it.
                  {/* Optional micro-copy:
                      "Distance and speed follow naturally — without forcing it."
                  */}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6">
            If you’re chasing the Olympics, you probably need a different coach.
            <br />
            If you want to become a strong, relaxed swimmer — this is built for
            you.
          </p>
        </div>

        <div className="mt-8 rounded-[22px] border border-blue-100/60 bg-[radial-gradient(560px_220px_at_20%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_63%),rgba(255,255,255,0.74)] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.07)]">
          <div className="flex flex-col gap-4 sm:flex-row">
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
