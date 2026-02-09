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
  note?: string;
  tone?: "primary" | "default";
};

type CustomMenu = {
  mode: "custom";
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  ariaLabel?: string;
};

type SiteMenu = {
  mode?: "site";
};

type Props = {
  children: React.ReactNode;
  menu?: SiteMenu | CustomMenu;
  bottomBar?: React.ReactNode; // ✅ NEW (minimal change)
};

export default function SiteChrome({ children, menu, bottomBar }: Props) {
  const pathname = usePathname();

  const menuMode = menu?.mode ?? "site";
  const customMenu = menuMode === "custom" ? (menu as CustomMenu) : null;

  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems: MenuItem[] = useMemo(
    () => [
      { href: "/", title: "Home" },
      {
        href: "/course",
        title: "Free course",
        subtitle: "Start swimming today",
        note: "No signup. No paywall. Just swim.",
        tone: "primary",
      },
      { href: "/programs", title: "Swim programs", subtitle: "Structured plans & PDFs" },
      { href: "/analysis", title: "Video analysis", subtitle: "Personal feedback — optional" },
      { href: "/how-we-teach", title: "How we teach", subtitle: "Learn. Drill. Swim." },
    ],
    []
  );

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
      "/how-we-teach": "How we teach",
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
          <Link href="/" className="flex select-none items-center gap-3" aria-label="Go to home">
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
            <span className="font-semibold tracking-wide text-white">freeswimming.org</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (customMenu) {
                if (customMenu.isOpen) customMenu.onClose();
                else customMenu.onOpen();
              } else {
                setMenuOpen((v) => !v);
              }
            }}
            className="rounded-xl px-3 py-2 text-white/95 transition hover:bg-white/10 active:scale-[0.98]"
            aria-label={customMenu?.ariaLabel ?? "Toggle menu"}
            aria-expanded={customMenu ? customMenu.isOpen : menuOpen}
          >
            <span className="text-2xl leading-none">≡</span>
          </button>
        </div>
      </header>

      {/* Site slide-in menu (only when in site mode) */}
      {menuMode !== "custom" ? (
        <Modal open={menuOpen} onClose={() => setMenuOpen(false)} ariaLabel="Navigation menu">
          <div className="flex h-full flex-col rounded-bl-3xl">
            <div className="flex-1 overflow-y-auto">
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
                      <div className="text-[16px] font-semibold text-slate-900">Menu</div>
                      <div className="mt-0.5 text-[13px] font-medium text-slate-500">
                        Active page: <span className="text-slate-700">{activePageLabel}</span>
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

                <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
              </div>

              <div className="px-5 pb-5 pt-4">
                <div className="flex flex-col gap-3">
                  {menuItems.map((item) => {
                    const active = isActive(item.href);

                    const base =
                      "relative overflow-hidden rounded-[22px] px-5 py-4 transition duration-150 ease-out active:scale-[0.985]";

                    const defaultTone =
                      "bg-white/85 border border-white/70 hover:bg-white " +
                      "shadow-[0_10px_28px_rgba(15,23,42,0.06)]";

                    const featuredTone =
                      "bg-blue-50/80 border border-blue-100/80 hover:bg-blue-100/60 " +
                      "shadow-[0_18px_48px_rgba(99,168,255,0.18)] " +
                      "before:absolute before:-inset-10 before:bg-[radial-gradient(600px_200px_at_40%_0%,rgba(99,168,255,0.18),rgba(255,255,255,0)_60%)] before:content-['']";

                    const activeStyle =
                      "bg-blue-50/80 border border-blue-200/60 " +
                      "shadow-[0_14px_36px_rgba(99,168,255,0.14)] " +
                      "before:absolute before:left-0 before:top-0 before:h-full before:w-[4px] " +
                      "before:bg-[#63A8FF] " +
                      "animate-[activeItem_180ms_ease-out]";

                    const baseTone = item.tone === "primary" ? featuredTone : defaultTone;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={[base, active ? activeStyle : baseTone].join(" ")}
                      >
                        <div className="relative">
                          <div className="text-[16px] font-semibold text-slate-900">
                            {item.title}
                          </div>
                          {item.subtitle ? (
                            <div className="mt-1 text-[14px] font-medium text-slate-600">
                              {item.subtitle}
                            </div>
                          ) : null}
                          {item.note ? (
                            <div className="mt-0.5 text-[12px] font-medium leading-4 tracking-wide text-slate-400">
                              {item.note}
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-slate-200/70 py-5">
                  <div className="text-center text-[11.5px] font-medium tracking-wide text-slate-400">
                    Follow
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-3">
                    <SocialChip label="YouTube" href="https://youtube.com" icon="youtube" subtle />
                    <SocialChip
                      label="Instagram"
                      href="https://instagram.com"
                      icon="instagram"
                      subtle
                    />
                  </div>
                </div>

                <div className="h-24" />
              </div>
            </div>

            <div className="sticky bottom-0 rounded-bl-3xl border-t border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur">
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
        </Modal>
      ) : null}

      {children}

      {/* ✅ NEW: global bottom bar (optional). Must use pointer-events-auto inside the bar. */}
      {bottomBar ? <div className="pointer-events-none">{bottomBar}</div> : null}
    </main>
  );
}

function SocialChip({
  label,
  href,
  icon,
  subtle = false,
}: {
  label: string;
  href: string;
  icon: "youtube" | "instagram";
  subtle?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold transition active:scale-[0.99]",
        subtle
          ? "bg-white/70 text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.06)] ring-1 ring-slate-100/60 hover:bg-white/90"
          : "bg-white/90 text-slate-800 shadow-[0_10px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/70 hover:bg-white",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-5 w-5 items-center justify-center",
          subtle ? "text-slate-500" : "text-slate-700",
        ].join(" ")}
      >
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