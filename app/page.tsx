// app/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ActionButton from "@/components/ActionButton";
import Modal from "@/components/Modal";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* Right: hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-xl px-3 py-2 text-white/95 transition hover:bg-white/10 active:scale-[0.98]"
            aria-label="Open menu"
          >
            <span className="text-2xl leading-none">≡</span>
          </button>
        </div>
      </header>

      {/* Menu modal */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav className="flex flex-col gap-2">
          {[
            { href: "/course", label: "Free course" },
            { href: "/programs", label: "Swim programs" },
            { href: "/analysis", label: "Video analysis" },
            { href: "/contact", label: "Contact" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-slate-900 transition hover:bg-slate-100 active:scale-[0.99]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Modal>

      {/* Page content */}
      <div className="mx-auto flex min-h-screen max-w-[520px] items-start justify-center px-4 pb-10 pt-24 sm:pt-28">
        <section className="relative w-full">
          <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_90px_rgba(16,24,40,0.18)] backdrop-blur-xl sm:p-7">
            {/* Hero logo (icon only) */}
            <div className="flex justify-center">
              <div className="relative h-[120px] w-[120px] sm:h-[140px] sm:w-[140px]">
                <Image
                  src="/logos/01_icon_transparent.png"
                  alt="Freeswimming.org logo"
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 640px) 120px, 140px"
                />
              </div>
            </div>

            {/* Copy */}
            <div className="mt-3 text-center">
              <p className="text-[15px] leading-6 text-slate-700 sm:text-[15px]">
                Olympic dreams?{" "}
                <span className="font-semibold text-slate-900">
                  Wrong channel.
                </span>
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

              <ActionButton title="CONTACT" href="/contact" variant="secondary" />
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