import SiteChrome from "@/components/SiteChrome";
import { cx } from "@/components/ui/cx";
import PressLink from "@/components/ui/PressLink";

const METHOD_STEPS = [
  {
    id: "learn",
    number: "01",
    title: "Learn",
    subtitle: "Know what matters before water.",
    body: "Each session starts with one useful idea, so the pool work has a clear purpose instead of a pile of tips.",
    toneClassName: "fs-tone-blue",
  },
  {
    id: "drill",
    number: "02",
    title: "Drill",
    subtitle: "Train one skill at a time.",
    body: "Balance, body position, breathing, and timing are separated into small repeatable pieces.",
    toneClassName: "fs-tone-emerald",
  },
  {
    id: "swim",
    number: "03",
    title: "Swim",
    subtitle: "Put the pieces into relaxed freestyle.",
    body: "The goal is a calmer stroke you can repeat, then gradually extend as your control improves.",
    toneClassName: "fs-tone-cyan",
  },
] as const;

const METHOD_PROOF_POINTS = [
  "One focus per session",
  "Calm technique before speed",
  "Simple progress you can repeat",
] as const;

export default function OurMethodClient() {
  return (
    <SiteChrome mobileNavMode="hidden">
      <section className="mx-auto w-full max-w-[1120px] px-4 pt-10 pb-28 sm:px-6 sm:pt-14 sm:pb-16 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-start">
          <div className="pt-1">
            <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
              Learn. Drill. Swim.
            </p>

            <h1 className="mt-3 max-w-[560px] text-[length:var(--fs-text-display-mobile)] leading-[0.98] font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[length:var(--fs-text-display)]">
              Our Method
            </h1>

            <div className="mt-5 max-w-[610px] space-y-4 text-[length:var(--fs-text-body)] leading-8 text-[color:var(--fs-color-muted)]">
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
                className="fs-cta-primary inline-flex min-h-12 items-center justify-center px-5 text-[15px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                Start the free course
              </PressLink>
              <PressLink
                tier="cta"
                href="/contact"
                className="fs-cta-secondary inline-flex min-h-12 items-center justify-center px-5 text-[15px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                Ask a question
              </PressLink>
            </div>
          </div>

          <ol className="grid gap-3">
            {METHOD_STEPS.map((step) => (
              <li
                key={step.id}
                data-testid={`method-step-card-${step.id}`}
                className={cx("fs-surface-card fs-method-step-card", step.toneClassName)}
              >
                <div className="flex items-start gap-4">
                  <span className="fs-method-step-badge inline-flex h-9 w-9 shrink-0 items-center justify-center text-[13px] font-semibold text-white">
                    {step.number}
                  </span>
                  <div>
                    <h2 className="text-[length:var(--fs-text-card-title)] font-semibold text-[color:var(--fs-color-ink-strong)]">
                      {step.title}
                    </h2>
                    <p className="mt-1 text-[15px] font-semibold text-[color:var(--fs-color-ink)]">
                      {step.subtitle}
                    </p>
                    <p className="mt-2 text-[15px] leading-7 text-[color:var(--fs-color-muted)]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 grid gap-3 text-[14px] font-semibold text-slate-800 sm:grid-cols-3">
          {METHOD_PROOF_POINTS.map((point) => (
            <p key={point} className="fs-method-proof-pill px-4 py-3">
              {point}
            </p>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
