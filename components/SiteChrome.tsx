// components/SiteChrome.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MenuDrawer from "@/components/MenuDrawer";

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
  bottomBar?: React.ReactNode;
};

export default function SiteChrome({ children, menu, bottomBar }: Props) {
  const menuMode = menu?.mode ?? "site";
  const customMenu = menuMode === "custom" ? (menu as CustomMenu) : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const isMenuOpen = customMenu ? customMenu.isOpen : menuOpen;

  const MAIN_MENU_ITEMS = useMemo(
    () => [
      { href: "/", title: "Home", subtitle: "Back to start" },
      { href: "/course", title: "Free course", subtitle: "Modules & lessons" },
      { href: "/programs", title: "Swim programs", subtitle: "Structured plans & PDFs" },
      { href: "/analysis", title: "Video analysis", subtitle: "Personal feedback — optional" },
      { href: "/how-we-teach", title: "How we teach", subtitle: "Learn. Drill. Swim." },
      { href: "/contact", title: "Contact", subtitle: "Questions or help" },
    ],
    []
  );

  const toggleMenu = () => {
    if (customMenu) {
      if (customMenu.isOpen) customMenu.onClose();
      else customMenu.onOpen();
    } else {
      setMenuOpen((v) => !v);
    }
  };

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
            onClick={toggleMenu}
            className="rounded-xl px-3 py-2 text-white/95 transition hover:bg-white/10 active:scale-[0.98]"
            aria-label={customMenu?.ariaLabel ?? "Toggle menu"}
            aria-expanded={isMenuOpen}
          >
            <span className="text-2xl leading-none">≡</span>
          </button>
        </div>
      </header>

      {/* Site drawer only in site mode */}
      {menuMode !== "custom" ? (
        <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} mainItems={MAIN_MENU_ITEMS} />
      ) : null}

      {children}

      {/* ✅ Bottom bar (optional). Keep it from blocking scroll/touches behind. */}
      {bottomBar ? (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <div className="pointer-events-auto">{bottomBar}</div>
        </div>
      ) : null}
    </main>
  );
}