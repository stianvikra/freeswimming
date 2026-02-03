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
              Learn. Drill. Swim.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5 text-[16px] leading-7 text-slate-700">
          <p>
            This is a free, step-by-step freestyle course for adults who want to
            feel calm in the water, swim longer with less effort, and build real
            technique — without information overload.
          </p>

          <div className="rounded-2xl bg-white/85 p-5 ring-1 ring-slate-100">
            <h2 className="text-[16px] font-semibold text-slate-900">
              Learn
            </h2>
            <p className="mt-2 text-slate-700">
              One clear concept at a time — so you know exactly what to focus on.
            </p>
          </div>

          <div className="rounded-2xl bg-white/85 p-5 ring-1 ring-slate-100">
            <h2 className="text-[16px] font-semibold text-slate-900">
              Drill
            </h2>
            <p className="mt-2 text-slate-700">
              Short, focused drills with a purpose — technique that actually transfers.
            </p>
          </div>

          <div className="rounded-2xl bg-white/85 p-5 ring-1 ring-slate-100">
            <h2 className="text-[16px] font-semibold text-slate-900">
              Swim
            </h2>
            <p className="mt-2 text-slate-700">
              Put it together in full stroke — repeatable sessions you can trust.
            </p>
          </div>

          <p>
            If you’re chasing the Olympics, you probably need a different coach.
            If you’re an adult learner who wants to become a strong, relaxed swimmer —
            you’re in the right place.
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