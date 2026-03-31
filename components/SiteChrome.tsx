// components/SiteChrome.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import MenuDrawer from "@/components/MenuDrawer";
import PressButton from "@/components/ui/PressButton";
import PressLink from "@/components/ui/PressLink";
import MobileSegmentedNav, {
  type MobileSegmentedNavItem,
} from "@/components/ui/MobileSegmentedNav";
import { getMainMenuItems } from "@/components/navigation/mainMenuItems";
import {
  getAdminPageContextLabel,
  normalizeAdminPageContextRef,
  supportsAdminPageNotesSurface,
} from "@/lib/admin/page-note-context";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

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
  const pathname = usePathname() ?? "/";
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [dashboardVisible, setDashboardVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createBrowserSupabaseClient();

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted || error) return;
      setSignedInEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSignedInEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRuntimeFlags() {
      try {
        const response = await fetch("/api/runtime/flags", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          flags?: {
            dashboardVisible?: boolean;
          };
        };

        if (cancelled) return;
        if (!response.ok || !payload.ok) return;

        if (typeof payload.flags?.dashboardVisible === "boolean") {
          setDashboardVisible(payload.flags.dashboardVisible);
        }
      } catch {
        // keep safe default
      }
    }

    void loadRuntimeFlags();
    return () => {
      cancelled = true;
    };
  }, []);

  // Blur active element on route change (best effort)
  useEffect(() => {
    if (typeof document === "undefined") return;
    // rAF makes sure it runs after paint (helps iOS)
    requestAnimationFrame(() => {
      (document.activeElement as HTMLElement | null)?.blur?.();
    });
  }, [pathname]);

  const menuMode = menu?.mode ?? "site";
  const customMenu = menuMode === "custom" ? (menu as CustomMenu) : null;

  // Site-mode drawer state
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<"main" | "course">("main");

  const isMenuOpen = customMenu ? customMenu.isOpen : menuOpen;

  const isHomeRoute = pathname === "/";
  const isCourseRoute = pathname === "/course" || pathname.startsWith("/course");
  const isAuthRoute = pathname === "/auth/sign-in" || pathname.startsWith("/auth/");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLibraryRoute = pathname === "/my-library" || pathname.startsWith("/my-library/");
  const isCheckoutRoute = pathname === "/checkout/success" || pathname.startsWith("/checkout/");
  const isPublicRoute = !isAuthRoute && !isLibraryRoute && !isCheckoutRoute;
  const normalizedPageContextRef = normalizeAdminPageContextRef(pathname ?? "/");
  const pageContextLabel = getAdminPageContextLabel(normalizedPageContextRef);
  const showAdminPageNotes =
    dashboardVisible && supportsAdminPageNotesSurface(normalizedPageContextRef);

  const hasCustomBottomBar = Boolean(bottomBar);
  const authHref = signedInEmail ? "/my-library" : "/auth/sign-in?next=%2Fmy-library";
  const authLabel = signedInEmail ? "My Library" : "Login";
  const adminHref = "/admin";
  const adminLabel = isAdminRoute ? "Dashboard" : "Open Dashboard";
  const menuItems = getMainMenuItems({ includeDashboard: dashboardVisible });

  // ✅ Home: remove bottom nav so focus stays on the CTA buttons
  const showDefaultMobileNav = !hasCustomBottomBar && !isHomeRoute;

  // ✅ Hide hamburger on mobile when any bottom nav exists (default or custom).
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

  const defaultNavItems: MobileSegmentedNavItem[] = [
    {
      id: "menu",
      kind: "button",
      label: "Menu",
      testId: "mobile-nav-menu",
      onClick: () => {
        if (menuOpen && drawerView === "main") {
          setMenuOpen(false);
          return;
        }
        openSiteDrawer("main");
      },
      ariaPressed: menuOpen && drawerView === "main",
      skin: menuOpen && drawerView === "main" ? "active" : "muted",
    },
    {
      id: "home",
      kind: "link",
      href: "/",
      label: "Home",
      testId: "mobile-nav-home",
      ariaCurrent: isHomeRoute ? "page" : undefined,
      skin: isHomeRoute ? "active" : "muted",
    },
    {
      id: "course",
      kind: "link",
      href: "/course",
      label: "Course",
      testId: "mobile-nav-course",
      ariaCurrent: isCourseRoute ? "page" : undefined,
      skin: isCourseRoute ? "active" : "muted",
    },
  ];

  const defaultMobileNav = (
    <div
      data-testid="mobile-fixed-nav"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] sm:hidden"
    >
      <div className="mx-auto max-w-[520px]">
        <MobileSegmentedNav items={defaultNavItems} />
      </div>
    </div>
  );

  // ✅ Helper: blur immediately on tap/click (fixes iOS “stuck” states)
  const blurNow = () => {
    if (typeof document === "undefined") return;
    (document.activeElement as HTMLElement | null)?.blur?.();
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(59,130,246,0.26),rgba(255,255,255,0)_65%),linear-gradient(#eaf2ff,#ffffff)]">
      <header className="topbar fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4">
          <PressLink
            tier="nav"
            href="/"
            aria-label="Go to home"
            className={[
              "flex select-none items-center gap-3",
              "rounded-2xl px-2 py-1",
              "[--ui-focus-ring:rgba(255,255,255,0.56)]",

              // ✅ only apply hover styles on devices that actually hover (prevents iOS sticky hover)
              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/10",

              // active is fine (only while pressed)
              "active:bg-white/15",
            ].join(" ")}
            style={{ WebkitTapHighlightColor: "transparent" }}
            onClick={blurNow}
            onTouchEnd={blurNow}
          >
            <span className="relative h-9 w-9">
              <Image
                src="/logos/01_icon_white_transparent.png"
                alt="Freeswimming icon"
                fill
                className="object-contain"
                sizes="36px"
              />
            </span>
            <span className="font-semibold tracking-[0.01em] text-white">freeswimming.org</span>
          </PressLink>

          <div className="flex items-center gap-2">
            {!isAuthRoute && dashboardVisible ? (
              <PressLink
                tier="nav"
                href={adminHref}
                data-testid="header-dashboard-link"
                aria-label="Open admin dashboard"
                className={[
                  "border-white/38 bg-white/8 hidden min-h-[34px] items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold text-white/95 backdrop-blur-md transition-colors duration-150 md:inline-flex",
                  "[--ui-focus-ring:rgba(255,255,255,0.56)]",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:border-white/60",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/16",
                  "active:bg-white/20",
                ].join(" ")}
              >
                <span className="h-2 w-2 rounded-full bg-white/90" />
                <span>{adminLabel}</span>
              </PressLink>
            ) : null}

            {!isAuthRoute ? (
              <PressLink
                tier="nav"
                href={authHref}
                data-testid="header-auth-link"
                aria-label={signedInEmail ? "Open My Library" : "Log in to My Library"}
                title={signedInEmail ?? "Open sign-in"}
                className={[
                  "inline-flex min-h-[34px] items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors duration-150",
                  "[--ui-focus-ring:rgba(255,255,255,0.56)]",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:border-white/60",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/16",
                  "active:bg-white/20",
                  signedInEmail
                    ? "bg-emerald-300/14 border-emerald-200/35 text-emerald-50"
                    : "border-white/38 bg-white/8 text-white/95",
                ].join(" ")}
              >
                {signedInEmail ? <span className="h-2 w-2 rounded-full bg-emerald-500" /> : null}
                <span>{authLabel}</span>
              </PressLink>
            ) : null}

            <PressButton
              tier="icon"
              data-testid="header-menu-toggle"
              onClick={toggleMenu}
              className={[
                "rounded-xl px-3 py-2 text-white/95",
                "[--ui-focus-ring:rgba(255,255,255,0.56)]",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/10",
                hideHamburgerOnMobile ? "hidden sm:inline-flex" : "inline-flex",
              ].join(" ")}
              aria-label={customMenu?.ariaLabel ?? "Toggle menu"}
              aria-expanded={isMenuOpen}
            >
              <span className="text-2xl leading-none">≡</span>
            </PressButton>
          </div>
        </div>
      </header>

      {menuMode !== "custom" ? (
        <MenuDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          mainItems={menuItems}
          defaultView={drawerView}
          titleMain="Main menu"
          titleCourse="Course menu"
        />
      ) : null}

      <div className={isPublicRoute ? "pt-12 sm:pt-14" : undefined}>
        {children}
        {showAdminPageNotes ? (
          <div className="mx-auto w-full max-w-[1100px] px-4 pb-8">
            <AdminContextNotesPanel
              contextType="page"
              contextRef={normalizedPageContextRef}
              contextLabel={pageContextLabel}
              collapsedByDefault
              className="mt-6"
            />
          </div>
        ) : null}
      </div>
      {showDefaultMobileNav ? defaultMobileNav : null}

      {bottomBar ? (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <div className="pointer-events-auto">{bottomBar}</div>
        </div>
      ) : null}
    </main>
  );
}
