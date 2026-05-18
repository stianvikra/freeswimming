// app/programs/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import BrandImage from "@/components/brand/BrandImage";
import PressLink from "@/components/ui/PressLink";
import { cx } from "@/components/ui/cx";
import { BRAND_USAGE } from "@/lib/brand";

const PROGRAM_CARDS = [
  {
    id: "poolside-pdf",
    eyebrow: "Poolside + PDF",
    title: "Poolside PDF Guide",
    body: "A pool-ready drill guide with simple structure, QR-linked videos, and enough direction to choose the right focus before you swim.",
    bullets: [
      "Quick structure for what to do today",
      "Balance and body-position drills first",
      "Works alongside the free course lessons",
    ],
    href: "/contact",
    action: "Join PDF waitlist",
    actionClassName: "fs-cta-secondary text-[color:var(--fs-color-ink)]",
    cardClassName: "fs-program-card",
  },
  {
    id: "video-analysis",
    eyebrow: "Personal feedback",
    title: "Video Analysis",
    body: "Send a short clip and get a focused next step, so your pool work connects to the technique issue that matters most.",
    bullets: [
      "One clear priority from your stroke video",
      "Practical drills you can take to the pool",
      "Useful when self-correction has stalled",
    ],
    href: "/analysis",
    action: "Get feedback",
    actionClassName: "fs-cta-primary",
    cardClassName: "fs-program-card fs-program-card-highlight",
  },
] as const;

export default function ProgramsPage() {
  return (
    <SiteChrome mobileNavMode="hidden">
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-4 pt-12 pb-20 sm:px-6 sm:pt-16 lg:pt-20">
        <div className="max-w-[700px]">
          <div
            data-testid="programs-hero-lockup"
            className="border-b border-[color:var(--fs-border-brand)] pb-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-[76px] shrink-0 items-center justify-center sm:h-14 sm:w-[90px]">
                <BrandImage
                  asset={BRAND_USAGE.pageIntroSymbol}
                  decorative
                  className="h-full w-auto object-contain"
                  sizes="(max-width: 640px) 76px, 90px"
                  priority
                />
              </div>
              <div>
                <h1 className="text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                  Swim Programs
                </h1>
                <p className="mt-2 text-[17px] leading-6 font-semibold text-[color:var(--fs-color-muted)]">
                  Learn. Drill. Swim.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-5 text-[length:var(--fs-text-body)] leading-8 text-[color:var(--fs-color-muted)]">
            Poolside resources for adult swimmers who want clear practice structure, simple drill
            choices, and a path from self-guided learning to personal feedback.
          </p>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {PROGRAM_CARDS.map((card) => (
            <section
              key={card.id}
              data-testid={`program-card-${card.id}`}
              className={cx(card.cardClassName, "flex min-h-full flex-col p-5 sm:p-6")}
            >
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                {card.eyebrow}
              </p>
              <h2 className="mt-2 text-[length:var(--fs-text-card-title)] font-semibold text-[color:var(--fs-color-ink-strong)]">
                {card.title}
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-[color:var(--fs-color-muted)]">
                {card.body}
              </p>
              <ul className="mt-4 space-y-2 text-[14px] leading-6 text-slate-700">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--fs-color-brand-500)]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-1 items-end">
                <PressLink
                  tier="cta"
                  href={card.href}
                  className={cx(
                    card.actionClassName,
                    "inline-flex min-h-12 w-full items-center justify-center px-5 text-[15px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:w-auto"
                  )}
                >
                  {card.action}
                </PressLink>
              </div>
            </section>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
