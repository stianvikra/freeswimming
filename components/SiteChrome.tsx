// components/SiteChrome.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  /**
   * Optional custom bottom bar (e.g. Course page Prev/Lessons/Next).
   * If provided, SiteChrome will NOT render the default mobile nav.
   */
  bottomBar?: React.ReactNode;
};

export default function SiteChrome({ children, menu, bottomBar }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const menuMode = menu?.mode ?? "site";
  const customMenu = menuMode === "custom" ? (menu as CustomMenu) : null;

  // Site-mode drawer state
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<"main" | "course">("main");

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

  const hasCustomBottomBar = Boolean(bottomBar);

  const isHomeRoute = pathname === "/";
  const isCourseRoute = pathname === "/course" || pathname?.startsWith("/course");

  // ✅ Default mobile nav:
  // - show on all pages EXCEPT home
  // - and EXCEPT when a custom bottomBar exists (course page)
  const showDefaultMobileNav = !isHomeRoute && !hasCustomBottomBar;

  // ✅ Hide hamburger on mobile when:
  // - Home (you want focus on the CTA buttons)
  // - Any bottom nav exists (default or custom) => redundant on mobile
  const hideHamburgerOnMobile = isHomeRoute || showDefaultMobileNav || hasCustomBottomBar;

  function openSiteDrawer(view: "main" | "course") {
    setDrawerView(view);
    setMenuOpen(true);
  }

  const toggleMenu = () => {
    // Custom mode (Course page): Course page owns drawer state
    if (customMenu) {
      if (customMenu.isOpen) customMenu.onClose();
      else customMenu.onOpen();
      return;
    }

    // Site mode: open/close site drawer (default to main)
    setDrawerView("main");
    setMenuOpen((v) => !v);
  };

  // Button skins
  const navBtnBase = "ui-press ui-focus flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold";

  const skinInactive = "bg-slate-100/70 text-slate-800";
  const skinActive =
    "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)]";

  const skinWhite = "bg-white/90 text-slate-900 ring-1 ring-white/70";
  const skinWhiteActive =
    "bg-white/95 text-slate-900 ring-1 ring-white/80 shadow-[0_14px_40px_rgba(15,23,42,0.10)]";

  const defaultMobileNav = (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] sm:hidden">
      <div className="mx-auto max-w-[520px]">
        <div className="rounded-[22px] bg-white/80 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] ring-1 ring-white/70 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openSiteDrawer("main")}
              className={[navBtnBase, menuOpen && drawerView === "main" ? skinActive : skinInactive].join(
                " "
              )}
              aria-pressed={menuOpen && drawerView === "main"}
            >
              Menu
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className={[navBtnBase, isHomeRoute ? skinWhiteActive : skinWhite].join(" ")}
              aria-current={isHomeRoute ? "page" : undefined}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => router.push("/course")}
              className={[navBtnBase, isCourseRoute ? skinActive : skinInactive].join(" ")}
              aria-current={isCourseRoute ? "page" : undefined}
            >
              Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

          {/* Hamburger: keep on sm+; hide on mobile when Home or any bottom nav exists */}
          <button
            type="button"
            onClick={toggleMenu}
            className={[
              "ui-press ui-focus rounded-xl px-3 py-2 text-white/95",
              "hover:bg-white/10",
              hideHamburgerOnMobile ? "hidden sm:inline-flex" : "inline-flex",
            ].join(" ")}
            aria-label={customMenu?.ariaLabel ?? "Toggle menu"}
            aria-expanded={isMenuOpen}
          >
            <span className="text-2xl leading-none">≡</span>
          </button>
        </div>
      </header>

      {/* Site drawer only in site mode */}
      {menuMode !== "custom" ? (
        <MenuDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          mainItems={MAIN_MENU_ITEMS}
          defaultView={drawerView}
          titleMain="Main menu"
          titleCourse="Course menu"
        />
      ) : null}

      {children}

      {/* Default mobile nav (global) */}
      {showDefaultMobileNav ? defaultMobileNav : null}

      {/* Custom bottom bar (optional) */}
      {bottomBar ? (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <div className="pointer-events-auto">{bottomBar}</div>
        </div>
      ) : null}
    </main>
  );
}