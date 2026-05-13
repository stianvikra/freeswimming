// components/SiteChrome.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import BrandImage from "@/components/brand/BrandImage";
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
import { BRAND_USAGE } from "@/lib/brand";
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
  mobileNavMode?: "default" | "hidden";

  /**
   * Optional custom bottom bar (e.g. Course page Prev/Lessons/Next).
   * If provided, SiteChrome will NOT render the default mobile nav.
   */
  bottomBar?: React.ReactNode;
};

type DefaultMobileNavProps = {
  pathname: string;
  signedInEmail: string | null;
  authHref: string;
};

function linkMobileNavItem(input: {
  id: string;
  href: string;
  label: string;
  testId: string;
  active?: boolean;
  skin?: MobileSegmentedNavItem["skin"];
  ariaLabel?: string;
}): MobileSegmentedNavItem {
  const isActive = Boolean(input.active);
  return {
    id: input.id,
    kind: "link",
    href: input.href,
    label: input.label,
    testId: input.testId,
    ariaLabel: input.ariaLabel,
    ariaCurrent: isActive ? "page" : undefined,
    skin: input.skin ?? (isActive ? "active" : "muted"),
  };
}

function getDefaultMobileNavItems({
  pathname,
  signedInEmail,
  authHref,
  microParam,
}: DefaultMobileNavProps & { microParam: string }): MobileSegmentedNavItem[] {
  const isHomeRoute = pathname === "/";
  const isCourseRoute = pathname === "/course" || pathname.startsWith("/course");
  const isAuthRoute = pathname === "/auth/sign-in" || pathname.startsWith("/auth/");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLibraryRoute = pathname === "/my-library" || pathname.startsWith("/my-library/");
  const isCheckoutRoute = pathname === "/checkout/success" || pathname.startsWith("/checkout/");
  const isRoutinesRoute = pathname === "/my-library/routines";
  const isHabitsRoute = pathname === "/my-library/habits";
  const isDrylandRoute = pathname === "/my-library/dryland";
  const isMicroFocusedRoute = isDrylandRoute && ["active", "edit", "setup"].includes(microParam);
  const isWorkoutsRoute = pathname === "/my-library/workouts";
  const isTrainingRoute = pathname === "/my-library/training";
  const isProfileRoute = pathname === "/my-library/profile";
  const isGoalsRoute = pathname === "/my-library/goals";
  const isGeneratorRoute = pathname === "/my-library/generator";
  const isProgramsBuilderRoute = pathname.startsWith("/my-library/programs/");

  const libraryNavItem = linkMobileNavItem({
    id: "library",
    href: authHref,
    label: signedInEmail ? "Library" : "Login",
    testId: "mobile-nav-library",
    active: pathname === "/my-library",
    ariaLabel: signedInEmail ? "Open My Library" : "Log in to My Library",
  });

  const homeNavItem = linkMobileNavItem({
    id: "home",
    href: "/",
    label: "Home",
    testId: "mobile-nav-home",
    active: isHomeRoute,
  });

  const courseNavItem = linkMobileNavItem({
    id: "course",
    href: "/course",
    label: "Course",
    testId: "mobile-nav-course",
    active: isCourseRoute,
  });

  if (isLibraryRoute) {
    if (isHabitsRoute || isMicroFocusedRoute || isRoutinesRoute) {
      return [
        libraryNavItem,
        linkMobileNavItem({
          id: "micro",
          href: "/my-library/dryland?micro=active&view=auto#micro-sessions",
          label: "Micro",
          testId: "mobile-nav-micro",
          active: isMicroFocusedRoute,
          ariaLabel: "Open Micro Sessions",
        }),
        linkMobileNavItem({
          id: "habits",
          href: "/my-library/habits?view=active#today-habits",
          label: "Habits",
          testId: "mobile-nav-habits",
          active: isHabitsRoute,
          ariaLabel: "Open Habits",
        }),
      ];
    }

    if (isDrylandRoute) {
      return [
        libraryNavItem,
        linkMobileNavItem({
          id: "dryland",
          href: "/my-library/dryland",
          label: "Dryland",
          testId: "mobile-nav-dryland",
          active: true,
        }),
        linkMobileNavItem({
          id: "habits",
          href: "/my-library/habits?view=active#today-habits",
          label: "Habits",
          testId: "mobile-nav-habits",
          ariaLabel: "Open Habits",
        }),
      ];
    }

    if (isWorkoutsRoute || isTrainingRoute || isProfileRoute || isGoalsRoute || isGeneratorRoute) {
      const current = isWorkoutsRoute
        ? { id: "workouts", label: "Sessions", testId: "mobile-nav-workouts" }
        : isTrainingRoute
          ? { id: "training", label: "Training", testId: "mobile-nav-training" }
          : isProfileRoute
            ? { id: "profile", label: "Profile", testId: "mobile-nav-profile" }
            : isGoalsRoute
              ? { id: "goals", label: "Goals", testId: "mobile-nav-goals" }
              : { id: "generator", label: "AI Plan", testId: "mobile-nav-generator" };

      return [
        libraryNavItem,
        linkMobileNavItem({
          id: "routines",
          href: "/my-library/routines",
          label: "Routines",
          testId: "mobile-nav-routines",
        }),
        linkMobileNavItem({
          id: current.id,
          href: pathname,
          label: current.label,
          testId: current.testId,
          active: true,
        }),
      ];
    }

    if (isProgramsBuilderRoute) {
      return [
        libraryNavItem,
        linkMobileNavItem({
          id: "routines",
          href: "/my-library/routines",
          label: "Routines",
          testId: "mobile-nav-routines",
        }),
        linkMobileNavItem({
          id: "program",
          href: pathname,
          label: "Program",
          testId: "mobile-nav-program",
          active: true,
        }),
      ];
    }

    return [
      libraryNavItem,
      linkMobileNavItem({
        id: "routines",
        href: "/my-library/routines",
        label: "Routines",
        testId: "mobile-nav-routines",
        active: isRoutinesRoute,
      }),
      linkMobileNavItem({
        id: "habits",
        href: "/my-library/habits?view=active#today-habits",
        label: "Habits",
        testId: "mobile-nav-habits",
        active: isHabitsRoute,
        ariaLabel: "Open Habits",
      }),
    ];
  }

  if (isAdminRoute) {
    return [
      homeNavItem,
      libraryNavItem,
      linkMobileNavItem({
        id: "admin",
        href: "/admin",
        label: "Dashboard",
        testId: "mobile-nav-admin",
        active: true,
      }),
    ];
  }

  if (isAuthRoute) {
    return [
      homeNavItem,
      courseNavItem,
      linkMobileNavItem({
        id: "login",
        href: authHref,
        label: "Login",
        testId: "mobile-nav-login",
        active: true,
      }),
    ];
  }

  if (isCheckoutRoute) {
    return [
      homeNavItem,
      linkMobileNavItem({
        id: "plans",
        href: "/plans",
        label: "Plans",
        testId: "mobile-nav-plans",
      }),
      libraryNavItem,
    ];
  }

  return [
    homeNavItem,
    courseNavItem,
    linkMobileNavItem({
      id: "programs",
      href: "/programs",
      label: "Programs",
      testId: "mobile-nav-programs",
      active: pathname === "/programs",
    }),
  ];
}

function DefaultMobileNavShell({ items }: { items: MobileSegmentedNavItem[] }) {
  return (
    <div
      data-testid="mobile-fixed-nav"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] sm:hidden"
    >
      <div className="mx-auto max-w-[520px]">
        <MobileSegmentedNav items={items} />
      </div>
    </div>
  );
}

function DefaultMobileNavFallback(props: DefaultMobileNavProps) {
  return <DefaultMobileNavShell items={getDefaultMobileNavItems({ ...props, microParam: "" })} />;
}

function DefaultMobileNav(props: DefaultMobileNavProps) {
  const searchParams = useSearchParams();
  const microParam = searchParams?.get("micro") ?? "";
  return <DefaultMobileNavShell items={getDefaultMobileNavItems({ ...props, microParam })} />;
}

export default function SiteChrome({
  children,
  menu,
  mobileNavMode = "default",
  bottomBar,
}: Props) {
  const pathname = usePathname() ?? "/";
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [hasAuthSession, setHasAuthSession] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createBrowserSupabaseClient();

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted || error) return;
      const nextHasAuthSession = Boolean(data.session?.user);
      setSignedInEmail(data.session?.user.email ?? null);
      setHasAuthSession(nextHasAuthSession);
      if (!nextHasAuthSession) setDashboardVisible(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const nextHasAuthSession = Boolean(session?.user);
      setSignedInEmail(session?.user?.email ?? null);
      setHasAuthSession(nextHasAuthSession);
      if (!nextHasAuthSession) setDashboardVisible(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasAuthSession) {
      return;
    }

    let cancelled = false;

    async function loadRuntimeFlags() {
      try {
        const response = await fetch("/api/runtime/flags", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean;
          flags?: {
            dashboardVisible?: boolean;
          };
        } | null;

        if (cancelled) return;
        if (!response.ok || !payload?.ok) return;

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
  }, [hasAuthSession]);

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

  // Home: remove bottom nav so focus stays on the CTA buttons.
  const showDefaultMobileNav = mobileNavMode !== "hidden" && !hasCustomBottomBar && !isHomeRoute;

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

  const defaultMobileNav = showDefaultMobileNav ? (
    <Suspense
      fallback={
        <DefaultMobileNavFallback
          pathname={pathname}
          signedInEmail={signedInEmail}
          authHref={authHref}
        />
      }
    >
      <DefaultMobileNav pathname={pathname} signedInEmail={signedInEmail} authHref={authHref} />
    </Suspense>
  ) : null;

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
              "flex items-center gap-3 select-none",
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
            <BrandImage
              asset={BRAND_USAGE.headerLockup}
              decorative
              className="h-6 w-auto sm:h-7"
              sizes="(max-width: 640px) 148px, 190px"
              priority
            />
          </PressLink>

          <div className="flex items-center gap-2">
            {!isAuthRoute && dashboardVisible ? (
              <PressLink
                tier="nav"
                href={adminHref}
                data-testid="header-dashboard-link"
                aria-label="Open admin dashboard"
                className={[
                  "hidden min-h-[34px] items-center gap-2 rounded-xl border border-white/38 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/95 backdrop-blur-md transition-colors duration-150 md:inline-flex",
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
                    ? "border-emerald-200/35 bg-emerald-300/14 text-emerald-50"
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
                "inline-flex",
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
      {defaultMobileNav}

      {bottomBar ? (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <div className="pointer-events-auto">{bottomBar}</div>
        </div>
      ) : null}
    </main>
  );
}
