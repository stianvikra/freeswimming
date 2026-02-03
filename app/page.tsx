// app/page.tsx
import Image from "next/image";
import ActionButton from "@/components/ActionButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(59,130,246,0.35),rgba(255,255,255,0)_65%),linear-gradient(#eaf2ff,#ffffff)]">
      {/* Page padding + center */}
      <div className="mx-auto flex min-h-screen max-w-[520px] items-start justify-center px-4 pb-10 pt-5 sm:pt-8">
        {/* Card */}
        <section className="relative w-full">
          <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_90px_rgba(16,24,40,0.18)] backdrop-blur-xl sm:p-7">
            {/* Logo (stacked) */}
            <div className="flex justify-center">
              <div className="relative h-[140px] w-[280px] sm:h-[150px] sm:w-[300px]">
                <Image
                  src="/logos/03_stacked_transparent.png"
                  alt="Freeswimming.org"
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 640px) 280px, 300px"
                />
              </div>
            </div>

            {/* Copy */}
            <div className="mt-2 text-center">
              <p className="text-[15px] leading-6 text-slate-700 sm:text-[15px]">
                Olympic dreams? <span className="font-semibold text-slate-900">Wrong channel.</span>
              </p>

              <h1 className="mt-3 text-[20px] font-semibold leading-6 tracking-tight text-slate-900 sm:text-[20px]">
                Adult learner?
              </h1>

              <p className="mt-2 text-[16px] leading-6 text-slate-700 sm:text-[16px]">
                You&apos;re exactly where you should be.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              <ActionButton
                title="FREE COURSE"
                subtitle="Start here"
                href="/course"
                variant="primary"
              />

              <ActionButton
                title="SWIM PROGRAMS"
                subtitle="PDF & plans"
                href="/programs"
                variant="secondary"
              />

              <ActionButton
                title="VIDEO ANALYSIS"
                subtitle="$99 — optional"
                href="/analysis"
                variant="secondary"
              />

              <ActionButton
                title="CONTACT"
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
          </div>

          {/* subtle outer glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_50px_140px_rgba(59,130,246,0.20)]" />
        </section>
      </div>
    </main>
  );
}