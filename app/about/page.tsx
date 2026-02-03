// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(59,130,246,0.30),rgba(255,255,255,0)_65%),linear-gradient(#eaf2ff,#ffffff)]">
      <div className="mx-auto max-w-[720px] px-4 pb-14 pt-24 sm:pt-28">
        <div className="rounded-[28px] border border-white/60 bg-white/75 p-7 shadow-[0_30px_90px_rgba(16,24,40,0.14)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
              About freeswimming.org
            </h1>
            <Link
              href="/"
              className="rounded-2xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition hover:bg-white active:scale-[0.99]"
            >
              Home
            </Link>
          </div>

          <p className="mt-4 text-[16px] leading-7 text-slate-700">
            This project is built for <span className="font-semibold text-slate-900">adult learners</span>.
            If your goal is Olympic-level performance, you’ll want a different coaching track.
            If your goal is to swim farther, with less effort — you’re in the right place.
          </p>

          <div className="mt-6 rounded-2xl bg-blue-50/70 p-5 ring-1 ring-blue-100/70">
            <div className="text-[15px] font-semibold text-slate-900">
              What you get here
            </div>
            <ul className="mt-3 space-y-2 text-[15px] leading-6 text-slate-700">
              <li>• A step-by-step freestyle course (free)</li>
              <li>• Simple drills with one focus at a time</li>
              <li>• Optional programs & video feedback if you want more structure</li>
            </ul>
          </div>

          <div className="mt-7">
            <div className="text-[15px] font-semibold text-slate-900">Quick FAQ</div>

            <div className="mt-3 space-y-4">
              <div>
                <div className="text-[15px] font-semibold text-slate-900">
                  How should I start?
                </div>
                <div className="mt-1 text-[15px] leading-6 text-slate-700">
                  Start with the free course. Don’t try to fix everything at once — focus on one thing per session.
                </div>
              </div>

              <div>
                <div className="text-[15px] font-semibold text-slate-900">
                  How often should I train?
                </div>
                <div className="mt-1 text-[15px] leading-6 text-slate-700">
                  Two sessions per week is enough to improve, three is great. Consistency beats intensity.
                </div>
              </div>

              <div>
                <div className="text-[15px] font-semibold text-slate-900">
                  Can you help me personally?
                </div>
                <div className="mt-1 text-[15px] leading-6 text-slate-700">
                  Yes — video analysis is optional. If you want feedback, that’s the fastest path to fix your biggest limiter.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200/80 pt-5">
            <div className="text-[15px] leading-6 text-slate-700">
              Want to reach out? Use{" "}
              <Link href="/contact" className="font-semibold text-slate-900 underline underline-offset-4">
                Contact
              </Link>
              .
            </div>

            <div className="mt-4 text-[14px] font-medium tracking-wide text-slate-600">
              Learn. Drill. Swim.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}