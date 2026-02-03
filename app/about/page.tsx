// app/about/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How we teach freestyle | freeswimming.org",
  description:
    "Learn. Drill. Swim. A clear step-by-step freestyle method for adult swimmers: one focus at a time, short drills, and progress you can repeat.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "How we teach freestyle | freeswimming.org",
    description:
      "Learn. Drill. Swim. A step-by-step freestyle method for adult swimmers: one focus at a time, short drills, and repeatable progress.",
    url: "/about",
    siteName: "freeswimming.org",
    type: "website",
    // images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "freeswimming.org" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How we teach freestyle | freeswimming.org",
    description:
      "Learn. Drill. Swim. A step-by-step freestyle method for adult swimmers.",
    // images: ["/og.jpg"],
  },
};

export default function AboutPage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
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
              How we teach
            </h1>
            <p className="mt-1 text-[14px] font-medium text-slate-600">
              Learn. Drill. Swim. — one focus at a time.
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className="mt-6 space-y-5 text-[16px] leading-7 text-slate-700">
          <p>
            This is a free, step-by-step freestyle course built for adult swimmers.
            The goal is simple: feel calm in the water, swim longer with less effort,
            and build technique that actually sticks — without information overload.
          </p>
        </div>

        {/* How we teach: Learn / Drill / Swim */}
        <div className="mt-6 rounded-2xl bg-white/80 p-5 ring-1 ring-slate-100">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[16px] font-semibold text-slate-900">
              Learn. Drill. Swim.
            </h2>
            <div className="text-xs font-medium text-slate-500">
              Our method
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StepCard
              title="Learn"
              subtitle="Understand one thing"
              body="You get one clear cue — what to focus on, and why it matters."
            />
            <StepCard
              title="Drill"
              subtitle="Feel it in a simple drill"
              body="Short drills designed to create the right sensation, not exhaustion."
            />
            <StepCard
              title="Swim"
              subtitle="Bring it back to full stroke"
              body="You apply the exact same focus in normal swimming — then repeat."
            />
          </div>
        </div>

        {/* Who it’s for */}
        <div className="mt-6 rounded-2xl bg-white/85 p-5 ring-1 ring-slate-100">
          <h2 className="text-[16px] font-semibold text-slate-900">
            This is for you if…
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[16px] leading-7 text-slate-700">
            <li>You started swimming later in life (or restarted).</li>
            <li>You get tired fast, tense up, or feel out of rhythm.</li>
            <li>You want simple drills that translate directly to freestyle.</li>
            <li>You want one clear focus at a time — not 20 corrections.</li>
          </ul>
        </div>

        {/* What’s different */}
        <div className="mt-4 rounded-2xl bg-white/85 p-5 ring-1 ring-slate-100">
          <h2 className="text-[16px] font-semibold text-slate-900">
            What makes this different
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[16px] leading-7 text-slate-700">
            <li>Short, focused drills with a clear purpose.</li>
            <li>Progression that builds confidence first, speed later.</li>
            <li>Less “talking about swimming” — more doing.</li>
            <li>A path you can repeat and trust.</li>
          </ul>
        </div>

        {/* Optional: video block (keep, or delete) */}
        <div className="mt-6 rounded-2xl bg-white/80 p-5 ring-1 ring-slate-100">
          <h2 className="text-[16px] font-semibold text-slate-900">
            90-second overview
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-slate-600">
            Optional: a quick intro explaining the method.
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
            <div className="aspect-video w-full">
              {/* Replace src with your YouTube embed when ready */}
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="How we teach"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Closing note */}
        <div className="mt-6 space-y-5 text-[16px] leading-7 text-slate-700">
          <p>
            If you’re chasing the Olympics, you probably need a different coach.
            If you’re an adult learner who wants to become a strong, relaxed swimmer —
            you’re in the right place.
          </p>
        </div>

        {/* CTAs */}
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

        {/* Footer */}
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

function StepCard({
  title,
  subtitle,
  body,
}: {
  title: string;
  subtitle: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-100">
      <div className="text-[15px] font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-[13px] font-medium text-slate-600">
        {subtitle}
      </div>
      <div className="mt-3 text-[14.5px] leading-6 text-slate-700">
        {body}
      </div>
    </div>
  );
}