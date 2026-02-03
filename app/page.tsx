// app/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ActionButton from "@/components/ActionButton";
import Modal from "@/components/Modal";

type MenuItem = {
  href: string;
  title: string;
  subtitle: string;
  featured?: boolean;
};

const MENU: MenuItem[] = [
  {
    href: "/course",
    title: "Free course",
    subtitle: "Start swimming today",
    featured: true,
  },
  {
    href: "/programs",
    title: "Swim programs",
    subtitle: "Structured plans & PDFs",
  },
  {
    href: "/analysis",
    title: "Video analysis",
    subtitle: "Personal feedback — optional",
  },
  {
    href: "/contact",
    title: "Contact",
    subtitle: "Help us help you swim better",
  },
];

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
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)}>
        <nav className="flex h-full flex-col p-5">
          {/* Header row: brand + close */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative h-8 w-8">
                <Image
                  src="/logos/01_icon_transparent.png"
                  alt="Freeswimming icon"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide text-slate-900">
                  Menu
                </div>
                <div className="text-xs font-medium text-slate-500">
                  freeswimming.org
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl bg-white/70 px-3 py-2 text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.10)] transition hover:bg-white hover:text-slate-900 active:scale-[0.98]"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Menu items (consistent cards) */}
          <div className="flex flex-col gap-2">
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  "rounded-2xl px-4 py-4 transition active:scale-[0.99]",
                  "min-h-[64px] flex flex-col justify-center",
                  "border border-white/70 bg-white/70 backdrop-blur",
                  "shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
                  "hover:bg-white hover:shadow-[0_18px_46px_rgba(15,23,42,0.12)]",
                  item.featured
                    ? "bg-blue-50/90 border-blue-100/80 shadow-[0_14px_36px_rgba(59,130,246,0.12)]"
                    : "",
                ].join(" ")}
              >
                <div className="text-[16px] font-semibold text-slate-900">
                  {item.title}
                </div>
                <div className="mt-0.5 text-[14px] font-medium text-slate-600">
                  {item.subtitle}
                </div>
              </Link>
            ))}
          </div>

          {/* Footer (subtle socials) */}
          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="text-xs font-medium tracking-wide text-slate-500">
              Follow freeswimming
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-white hover:text-slate-900 active:scale-[0.99]"
              >
                <span aria-hidden>▶</span>
                YouTube
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-white hover:text-slate-900 active:scale-[0.99]"
              >
                <span aria-hidden>⌁</span>
                Instagram
              </a>
            </div>
          </div>
        </nav>
      </Modal>

      {/* Page content */}
      <div className="mx-auto flex min-h-screen max-w-[520px] items-start justify-center px-4 pb-10 pt-24 sm:pt-28">
        <section className="relative w-full">
          <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_90px_rgba(16,24,40,0.18)] backdrop-blur-xl sm:p-7">
            {/* Hero logo (icon only) */}
            <div className="flex justify-center">
              <div className="relative h-[132px] w-[132px] sm:h-[150px] sm:w-[150px]">
                <Image
                  src="/logos/01_icon_transparent.png"
                  alt="Freeswimming.org logo"
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 640px) 132px, 150px"
                />
              </div>
            </div>

            {/* Copy */}
            <div className="mt-4 text-center">
              <p className="text-[16px] leading-6 text-slate-700 sm:text-[16px]">
                Olympic dreams?{" "}
                <span className="font-semibold text-slate-900">
                  Wrong channel.
                </span>
              </p>

              <h1 className="mt-3 text-[22px] font-semibold leading-7 tracking-tight text-slate-900 sm:text-[22px]">
                Adult learner?
              </h1>

              <p className="mt-2 text-[17px] leading-6 text-slate-700 sm:text-[17px]">
                You&apos;re exactly where you should be.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              <ActionButton
                title="FREE COURSE"
                subtitle="Start swimming today"
                href="/course"
                variant="primary"
              />

              <ActionButton
                title="SWIM PROGRAMS"
                subtitle="Structured plans & PDFs"
                href="/programs"
                variant="secondary"
              />

              <ActionButton
                title="VIDEO ANALYSIS"
                subtitle="Personal feedback — optional"
                href="/analysis"
                variant="secondary"
              />

              <ActionButton
                title="CONTACT"
                subtitle="Help us help you swim better"
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