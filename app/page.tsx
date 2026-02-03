"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ActionButton from "@/components/ActionButton";
import Modal from "@/components/Modal";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="topbar sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-5 h-[72px] flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-white/95 hover:text-white transition"
            aria-label="Home"
          >
            <Image
              src="/logos/01_icon_white_transparent.png"
              alt="freeswimming icon"
              width={34}
              height={34}
              priority
            />
            <span className="font-semibold tracking-wide">freeswimming.org</span>
          </Link>

          <button
            className="rounded-xl px-3 py-2 text-white/90 hover:bg-white/10 active:scale-[0.98] transition focus-visible:focus-ring"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-7 h-[2px] bg-white/90 mb-[6px]" />
            <span className="block w-7 h-[2px] bg-white/90 mb-[6px]" />
            <span className="block w-7 h-[2px] bg-white/90" />
          </button>
        </div>
      </header>

      {/* Center content */}
      <main className="px-5">
        <div className="mx-auto max-w-6xl">
        <div className="min-h-[calc(100vh-72px)] flex items-start justify-center pt-10 pb-16">
            <section className="w-[min(520px,100%)] glass-card rounded-[28px] px-7 py-9">
              {/* Stacked logo */}
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/logos/03_stacked_transparent.png"
                  alt="Freeswimming logo"
                  width={210}
                  height={210}
                  priority
                  className="select-none"
                />

                {/* Positioning copy (10/10 formatting) */}
                <div className="mt-4">
                  <div className="text-sm text-slate-600">
                    Olympic dreams? <span className="font-semibold text-slate-900">Wrong channel.</span>
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-slate-900">
                    Adult learner?
                  </div>
                  <div className="mt-1 text-[15px] text-slate-700">
                    You&apos;re exactly where you should be.
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-7 space-y-4">
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
                  href="/contact"
                  variant="secondary"
                />

                <ActionButton
                  title="CONTACT"
                  href="/contact"
                  variant="secondary"
                />
              </div>

              {/* Footer tagline */}
              <div className="mt-8 pt-6 border-t border-slate-200/70 text-center text-[14px] text-slate-700 tracking-wide">
                Learn. Drill. Swim.
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Menu modal */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav className="grid gap-3">
          <Link
            href="/course"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <div className="font-semibold text-slate-900">Free course</div>
            <div className="text-sm text-slate-500">Start here</div>
          </Link>

          <Link
            href="/programs"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <div className="font-semibold text-slate-900">Swim programs</div>
            <div className="text-sm text-slate-500">PDF & plans</div>
          </Link>

          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <div className="font-semibold text-slate-900">Contact</div>
            <div className="text-sm text-slate-500">Video analysis & questions</div>
          </Link>
        </nav>
      </Modal>
    </div>
  );
}