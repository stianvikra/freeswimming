// components/SiteChrome.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Modal from "@/components/Modal";

type MenuItem = {
  href: string;
  title: string;
  subtitle?: string;
  tone?: "primary" | "default";
};

type Props = {
  children: React.ReactNode;
};

export default function SiteChrome({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Menu list (Contact removed — handled as sticky CTA)
  const menuItems: MenuItem[] = [
    {
      href: "/",
      title: "Home",
      subtitle: "Start here",
    },
    {
      href: "/course",
      title: "Free course",
      subtitle: "Start swimming today",
      tone: "primary",
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
      href: "/about",
      title: "About",
      subtitle: "Who this is for",
    },
  ];

  // Single source of truth for Contact CTA text
  const contactCTA = useMemo(
    () => ({
      href: "/contact",
      title: "Contact",
      subtitle: "Help us help you swim better",
    }),
    []
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const activePageLabel = useMemo(() => {
    const map: Record<string, string> = {
      "/": "Home",
      "/course": "Free course",
      "/programs": "Swim programs",
      "/analysis": "Video analysis",
      "/about": "About",
      "/contact": "Contact",
    };

    if (pathname && map[pathname]) return map[pathname];

    const found = Object.keys(map)
      .filter((k) => k !== "/")
      .find((k) => pathname?.startsWith(`${k}/`));
    if (found) return map[found];

    return "Home";
  }, [pathname]);

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

      {/* Slide-in menu */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="flex h-full flex-col rounded-bl-3xl">
          {/* Scroll area: menu items only */}
          <div className="flex-1 overflow-y-auto">
            {/* Header row */}
            <div className="px-5 pt-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative h-9 w-9 shrink-0">
                    <Image
                      src="/logos/01_icon_transparent.png"
                      alt="Freeswimming.org"
                      fill
                      priority
                      className="object-contain"
                      sizes="36px"
                    />
                  </span>

                  <div className="leading-tight">
                    <div className="text-[16px] font-semibold text-slate-900">
                      Menu
                    </div>

                    <div className="mt-0.5 text-[13px] font-medium text-slate-500">
                      Active page:{" "}
                      <span className="text-slate-700">{activePageLabel}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl bg-slate-100/70 px-3 py-2 text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Menu items */}
            <div className="px-5 pb-6 pt-4">
              <div className="flex flex-col gap-3">
                {menuItems.map((item) => {
                  const active = isActive(item.href);

                  const base =
                    "relative overflow-hidden rounded-[22px] px-5 py-4 transition active:scale-[0.99] " +
                    "shadow-[0_10px_28px_rgba(15,23,42,0.06)]";

                  const defaultTone =
                    "bg-white/85 border border-white/70 hover:bg-white";

                  const featuredTone =
                    "bg-blue-50 border border-blue-100/80 hover:bg-blue-100/60";

                  // Active: stronger blue + left stripe (single signal)
                  const activeStyle =
                    "bg-blue-100/75 border border-blue-200/70 " +
                    "shadow-[0_16px_44px_rgba(99,168,255,0.16)] " +
                    "before:absolute before:left-0 before:top-0 before:h-full before:w-[4px] " +
                    "before:bg-[#63A8FF]";

                  const baseTone =
                    item.tone === "primary" ? featuredTone : defaultTone;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={[base, active ? activeStyle : baseTone].join(" ")}
                    >
                      <div>
                        <div className="text-[16px] font-semibold text-slate-900">
                          {item.title}
                        </div>
                        {item.subtitle ? (
                          <div className="mt-1 text-[14px] font-medium text-slate-600">
                            {item.subtitle}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Little breathing room before footer zone (no huge empty space) */}
              <div className="h-4" />
            </div>
          </div>

          {/* Footer zone: Follow + CTA together (fixes the “huge empty space” problem) */}
          <div className="border-t border-slate-200/70 bg-white/70 px-5 py-4 backdrop-blur rounded-bl-3xl">
            {/* Follow module */}
            <div className="rounded-2xl bg-white/55 p-4 ring-1 ring-slate-100/70">
              <div className="text-center text-xs font-semibold tracking-wide text-slate-500">
                Follow
              </div>

              <div className="mt-3 flex items-center justify-center gap-3">
                <SocialChip label="YouTube" href="https://youtube.com" icon="youtube" />
                <SocialChip
                  label="Instagram"
                  href="https://instagram.com"
                  icon="instagram"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4">
              <Link
                href={contactCTA.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6] text-[16px] font-semibold text-white shadow-[0_18px_50px_rgba(45,143,255,0.22)] transition active:translate-y-[1px]"
              >
                {contactCTA.title}
              </Link>

              <div className="mt-2 text-center text-xs font-medium text-slate-500">
                {contactCTA.subtitle}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Page content slot */}
      {children}
    </main>
  );
}

function SocialChip({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: "youtube" | "instagram";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-slate-100/70 transition hover:bg-white active:scale-[0.99]"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center text-slate-700">
        {icon === "youtube" ? <YouTubeIcon /> : <InstagramIcon />}
      </span>
      {label}
    </a>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.6 31.6 0 0 0 2 12a31.6 31.6 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 22 12a31.6 31.6 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4Zm-4.5 4a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.8 6.7a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
      />
    </svg>
  );
}