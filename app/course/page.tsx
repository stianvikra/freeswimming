"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import Link from "next/link";

type Card = {
  title: string;
  desc: string;
  tag?: string;
  bullets?: string[];
};

export default function CoursePage() {
  const startHere: Card[] = [
    {
      title: "How to use this course",
      desc: "One focus at a time. Watch → drill → repeat for 2 sessions before moving on.",
      bullets: [
        "Keep it simple: one cue per session",
        "Do the drill for 6–10 minutes",
        "Repeat in 2 sessions before advancing",
      ],
    },
    {
      title: "Filming made simple",
      desc: "No underwater video? Totally fine. Start with a side view above water.",
      bullets: [
        "Best: side view (above water)",
        "Optional: front view (above water)",
        "Short clip is enough: 10–20 seconds",
      ],
    },
    {
      title: "Your first plan (4 weeks)",
      desc: "Two swim sessions per week. The goal is ease, not exhaustion.",
      bullets: [
        "Session A: technique + drill focus",
        "Session B: repeat + calm breathing",
        "Progress = less effort at same pace",
      ],
    },
  ];

  const modules: Card[] = [
    {
      title: "Module 1 — Body position",
      desc: "Stop sinking. Reduce drag. Swim easier.",
      tag: "Start here",
      bullets: ["One cue", "One drill", "One simple test"],
    },
    {
      title: "Module 2 — Balance",
      desc: "Find your line so you stop fighting the water.",
      bullets: ["Relaxed head", "Long spine", "Quiet legs"],
    },
    {
      title: "Module 3 — Breathing rhythm",
      desc: "Stay calm and consistent — even when tired.",
      bullets: ["Exhale underwater", "Soft inhale", "Repeatable pattern"],
    },
    {
      title: "Module 4 — Timing",
      desc: "Coordinate kick + catch so you move forward with less effort.",
      bullets: ["Less splash", "More grip", "Better flow"],
    },
  ];

  const fixes: Card[] = [
    {
      title: "Sinking legs?",
      desc: "Usually head position + tension. Fix the line first.",
      bullets: ["Body line", "Head neutral", "Gentle kick"],
    },
    {
      title: "Out of breath early?",
      desc: "Most often rhythm + exhale. Build a calm breathing pattern.",
      bullets: ["Exhale longer", "Small inhale", "Repeatable rhythm"],
    },
    {
      title: "Feels heavy / no glide?",
      desc: "Drag issue. Body position beats strength.",
      bullets: ["Less drag", "Longer line", "Better balance"],
    },
  ];

  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <header className="text-center">
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
            Free Course
          </h1>
          <p className="mt-2 text-[17px] leading-7 text-slate-700">
            Learn. Drill. Swim. One concept at a time.
          </p>
        </header>

        {/* Start here */}
        <section className="mt-7">
          <h2 className="text-[16px] font-semibold tracking-wide text-slate-900">
            Start here
          </h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {startHere.map((c) => (
              <div
                key={c.title}
                className="rounded-[20px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur"
              >
                <div className="text-[15px] font-semibold text-slate-900">{c.title}</div>
                <div className="mt-2 text-[14px] leading-6 text-slate-600">{c.desc}</div>

                {c.bullets?.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] leading-6 text-slate-600">
                    {c.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[16px] font-semibold tracking-wide text-slate-900">
              Modules
            </h2>

            <div className="text-[12px] font-medium text-slate-500">
              MVP now — module pages next
            </div>
          </div>

          <div className="mt-3 grid gap-3">
            {modules.map((m) => (
              <div
                key={m.title}
                className="relative overflow-hidden rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
              >
                {m.tag ? (
                  <div className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700">
                    {m.tag}
                  </div>
                ) : null}

                <div className="text-[16px] font-semibold text-slate-900">{m.title}</div>
                <div className="mt-1 text-[14px] leading-6 text-slate-600">{m.desc}</div>

                {m.bullets?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.bullets.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-slate-100/70 px-3 py-1 text-[12px] font-semibold text-slate-700"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 text-[13px] font-semibold text-blue-700">
                  Coming next: lesson pages →
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Symptom → Fix */}
        <section className="mt-8">
          <h2 className="text-[16px] font-semibold tracking-wide text-slate-900">
            Problems → solutions
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-slate-600">
            Pick what you struggle with — we’ll point you to the next best focus.
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {fixes.map((f) => (
              <div
                key={f.title}
                className="rounded-[20px] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur"
              >
                <div className="text-[15px] font-semibold text-slate-900">{f.title}</div>
                <div className="mt-2 text-[14px] leading-6 text-slate-600">{f.desc}</div>

                {f.bullets?.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] leading-6 text-slate-600">
                    {f.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Upgrade CTA */}
        <section className="mt-9 rounded-[24px] border border-blue-100/70 bg-blue-50/60 p-6">
          <h3 className="text-[18px] font-semibold text-slate-900">Want personal feedback?</h3>
          <p className="mt-2 text-[14px] leading-6 text-slate-700">
            Send a short clip and we’ll tell you exactly what to work on next.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analysis"
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-5 py-4 text-[15px] font-semibold text-white shadow-[0_18px_50px_rgba(37,99,235,0.25)] transition hover:from-blue-600 hover:to-blue-700"
            >
              Video analysis
            </Link>
            <Link
              href="/programs"
              className="flex w-full items-center justify-center rounded-2xl bg-white/90 px-5 py-4 text-[15px] font-semibold text-slate-900 shadow-sm ring-1 ring-white/70 transition hover:bg-white"
            >
              Swim programs & PDFs
            </Link>
          </div>

          <p className="mt-3 text-center text-[12px] font-medium text-slate-600">
            Prices in USD. Local taxes may apply.
          </p>
        </section>
      </PageTemplate>
    </SiteChrome>
  );
}