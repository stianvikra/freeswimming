import SiteChrome from "@/components/SiteChrome";
import PressLink from "@/components/ui/PressLink";

export default function OurMethodClient() {
  return (
    <SiteChrome mobileNavMode="hidden">
      <section className="mx-auto w-full max-w-[1120px] px-4 pt-10 pb-28 sm:px-6 sm:pt-14 sm:pb-16 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-start">
          <div className="pt-1">
            <p className="text-[13px] font-semibold text-blue-800">Learn. Drill. Swim.</p>

            <h1 className="mt-3 max-w-[560px] text-[42px] leading-[0.98] font-semibold text-slate-950 sm:text-[56px]">
              Our Method
            </h1>

            <div className="mt-5 max-w-[610px] space-y-4 text-[17px] leading-8 text-slate-700">
              <p>
                A free, step-by-step freestyle method for adults who want to swim calmly, longer,
                and with less effort without information overload.
              </p>
              <p>
                Learn one useful idea, drill it until it feels familiar, then swim it into relaxed
                freestyle. The method keeps each session focused enough to repeat.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PressLink
                tier="cta"
                href="/course"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-gradient-to-b from-[#5aa6ff] to-[#2f7fe4] px-5 text-[15px] font-semibold text-white shadow-[0_16px_34px_rgba(45,143,255,0.28)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                Start the free course
              </PressLink>
              <PressLink
                tier="cta"
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white/82 px-5 text-[15px] font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                Ask a question
              </PressLink>
            </div>
          </div>

          <ol className="grid gap-3">
            <li className="rounded-lg border border-blue-100 bg-white/90 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-[13px] font-semibold text-white">
                  01
                </span>
                <div>
                  <h2 className="text-[21px] font-semibold text-slate-950">Learn</h2>
                  <p className="mt-1 text-[15px] font-semibold text-slate-800">
                    Know what matters before water.
                  </p>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">
                    Each session starts with one useful idea, so the pool work has a clear purpose
                    instead of a pile of tips.
                  </p>
                </div>
              </div>
            </li>

            <li className="rounded-lg border border-emerald-100 bg-white/90 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-[13px] font-semibold text-white">
                  02
                </span>
                <div>
                  <h2 className="text-[21px] font-semibold text-slate-950">Drill</h2>
                  <p className="mt-1 text-[15px] font-semibold text-slate-800">
                    Train one skill at a time.
                  </p>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">
                    Balance, body position, breathing, and timing are separated into small
                    repeatable pieces.
                  </p>
                </div>
              </div>
            </li>

            <li className="rounded-lg border border-slate-200 bg-white/90 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-700 text-[13px] font-semibold text-white">
                  03
                </span>
                <div>
                  <h2 className="text-[21px] font-semibold text-slate-950">Swim</h2>
                  <p className="mt-1 text-[15px] font-semibold text-slate-800">
                    Put the pieces into relaxed freestyle.
                  </p>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">
                    The goal is a calmer stroke you can repeat, then gradually extend as your
                    control improves.
                  </p>
                </div>
              </div>
            </li>
          </ol>
        </div>

        <div className="mt-8 grid gap-3 text-[14px] font-semibold text-slate-800 sm:grid-cols-3">
          <p className="rounded-lg border border-white/60 bg-white/58 px-4 py-3">
            One focus per session
          </p>
          <p className="rounded-lg border border-white/60 bg-white/58 px-4 py-3">
            Calm technique before speed
          </p>
          <p className="rounded-lg border border-white/60 bg-white/58 px-4 py-3">
            Simple progress you can repeat
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
