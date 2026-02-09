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

  // Default mobile nav should be present on all pages EXCEPT where you provide custom bottomBar
  const showDefaultMobileNav = !hasCustomBottomBar;

  // Hide hamburger on mobile whenever we use ANY bottom nav (default or custom)
  const hideHamburgerOnMobile = showDefaultMobileNav || hasCustomBottomBar;

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

  const isCourseRoute = pathname === "/course" || pathname?.startsWith("/course");
  const isHomeRoute = pathname === "/";
  const isMenuActive = !isHomeRoute && !isCourseRoute; // simple heuristic

  const defaultMobileNav = (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] sm:hidden">
      <div className="mx-auto max-w-[520px]">
        <div className="rounded-[22px] bg-white/80 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] ring-1 ring-white/70 backdrop-blur">
          <div className="flex items-center gap-2">
            {/* Menu -> opens drawer (main view) */}
            <button
              type="button"
              onClick={() => openSiteDrawer("main")}
              className={[
                "flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold transition",
                menuOpen && drawerView === "main"
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)]"
                  : "bg-slate-100/70 text-slate-800 hover:bg-slate-100",
              ].join(" ")}
              aria-pressed={menuOpen && drawerView === "main"}
            >
              Menu
            </button>

            {/* Home */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className={[
                "flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold transition",
                isHomeRoute
                  ? "bg-white/90 text-slate-900 ring-1 ring-white/70"
                  : "bg-white/90 text-slate-900 ring-1 ring-white/70 hover:bg-white",
              ].join(" ")}
              aria-current={isHomeRoute ? "page" : undefined}
            >
              Home
            </button>

            {/* Course (fast access) */}
            <button
              type="button"
              onClick={() => router.push("/course")}
              className={[
                "flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold transition",
                isCourseRoute
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)]"
                  : "bg-slate-100/70 text-slate-800 hover:bg-slate-100",
              ].join(" ")}
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

          {/* Hamburger: keep on sm+; hide on mobile when bottom nav exists */}
          <button
            type="button"
            onClick={toggleMenu}
            className={[
              "rounded-xl px-3 py-2 text-white/95 transition hover:bg-white/10 active:scale-[0.98]",
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

      {/* ✅ Default mobile nav (global) */}
      {showDefaultMobileNav ? defaultMobileNav : null}

      {/* ✅ Custom bottom bar (optional). Keep it from blocking scroll/touches behind. */}
      {bottomBar ? (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <div className="pointer-events-auto">{bottomBar}</div>
        </div>
      ) : null}
    </main>
  );
}