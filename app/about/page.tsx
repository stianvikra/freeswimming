// app/about/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import ActionButton from "@/components/ActionButton";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(59,130,246,0.35),rgba(255,255,255,0)_65%),linear-gradient(#eaf2ff,#ffffff)]">
      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-40 topbar">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4">
          {/* Left: icon + brand */}
          <Link
            href="/"
            className="flex select-none items-center gap-3"
            aria-label="Go to home"
          >
            <span className="relative h-9 w-9">
              <Image
                src="/logos/01_icon_white_transparent.png"
                alt="Freeswimming icon"
                fill
                priority
                className="object-contain"
                sizes="36px"
              />
            </span>
            <span className="font-semibold tracking-wide text-white">
              freeswimming.org
            </span>
          </Link>

          {/* Right: simple back */}
          <Link
            href="/"
            className="rounded-xl px-3 py-2 text-white/95 transition hover:bg-white/10 active:scale-[0.98]"
            aria-label="Back to home"
          >
            <span className="text-[15px] font-semibold">Home</span>
          </Link>
        </div>
      </header>

      {/* Page content */}
      <div className="mx-auto flex min-h-screen max-w-[720px] items-start justify-center px-4 pb-10 pt-24 sm:pt-28">
        <section className="relative w-full">
          <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_90px_rgba(16,24,40,0.18)] backdrop-blur-xl sm:p-8">
            {/* Header */}
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
                  About this course
                </h1>
                <p className="mt-1 text-[14px] font-medium text-slate-600">
                  Who it’s for — and why it exists.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="mt-6 space-y-5 text-[16px] leading-7 text-slate-700">
              <p>
                This is a free, step-by-step freestyle course for adults who want
                to feel calm in the water, swim longer with less effort, and
                build real technique — without information overload.
              </p>

              <div className="rounded-2xl bg-white/85 p-5 ring-1 ring-slate-100">
                <h2 className="text-[16px] font-semibold text-slate-900">
                  This is for you if…
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>You started swimming later in life (or restarted).</li>
                  <li>You get tired fast, tense up, or feel out of rhythm.</li>
                  <li>You want simple drills that actually translate to swimming.</li>
                  <li>You want one clear focus at a time — not 20 corrections.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-white/85 p-5 ring-1 ring-slate-100">
                <h2 className="text-[16px] font-semibold text-slate-900">
                  What makes this different
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Short, focused drills with a clear purpose.</li>
                  <li>Progression that builds confidence first, speed later.</li>
                  <li>Less “talking about swimming” — more doing.</li>
                  <li>A path you can repeat and trust.</li>
                </ul>
              </div>

              <p className="text-slate-700">
                If you’re chasing the Olympics, you probably need a different
                coach. If you’re an adult learner who wants to become a strong,
                relaxed swimmer — you’re in the right place.
              </p>
            </div>

            {/* CTA row */}
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

            {/* Footer line + tagline */}
            <div className="mt-8">
              <div className="mx-auto h-px w-full max-w-[520px] bg-slate-200/80" />
              <p className="mt-5 text-center text-[15px] font-medium tracking-wide text-slate-700">
                Learn. Drill. Swim.
              </p>
            </div>
          </div>

          {/* subtle outer glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_50px_140px_rgba(59,130,246,0.20)]" />
        </section>
      </div>
    </main>
  );
}