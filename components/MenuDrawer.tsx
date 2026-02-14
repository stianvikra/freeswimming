// components/MenuDrawer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import Modal from "@/components/Modal";
import { COURSE_MODULES, type CourseLesson } from "@/app/course/courseData";
import { useInstallContext } from "@/components/install/install-context";
import PressButton from "@/components/ui/PressButton";
import PressLink from "@/components/ui/PressLink";
import MobileSegmentedNav, {
  type MobileSegmentedNavItem,
} from "@/components/ui/MobileSegmentedNav";

type MainItem = { href: string; title: string; subtitle?: string };

type Props = {
  open: boolean;
  onClose: () => void;

  /** Which view to show when the drawer opens */
  defaultView?: "main" | "course";

  /** Main nav items to show in Menu view */
  mainItems: MainItem[];

  /**
   * If provided, enables Course view.
   * If omitted, drawer only shows Menu view.
   */
  course?: {
    activeLessonId: string;
    onSelectLesson: (lessonId: string) => void;
    doneLessonIds?: string[];
  };

  /** Optional: headline override */
  titleMain?: string; // defaults to "Menu"
  titleCourse?: string; // defaults to "Course menu"
};

const MENU_TIP_SEEN_KEY = "fs_menu_tip_seen";

export default function MenuDrawer({
  open,
  onClose,
  defaultView = "course",
  mainItems,
  course,
  titleMain = "Menu",
  titleCourse = "Course menu",
}: Props) {
  const pathname = usePathname();
  const hasCourse = Boolean(course);
  const { canInstall, isIOS, isInstalled, requestInstall } = useInstallContext();

  const [view, setView] = useState<"main" | "course">(hasCourse ? defaultView : "main");
  const [showMenuTip, setShowMenuTip] = useState(false);
  const [showIosInstallGuide, setShowIosInstallGuide] = useState(false);
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);
  const [installBusy, setInstallBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setView(hasCourse ? defaultView : "main");
  }, [open, defaultView, hasCourse]);

  useEffect(() => {
    if (!open || view !== "main") return;
    try {
      const seen = localStorage.getItem(MENU_TIP_SEEN_KEY) === "1";
      if (seen) {
        setShowMenuTip(false);
        return;
      }
      setShowMenuTip(true);
      localStorage.setItem(MENU_TIP_SEEN_KEY, "1");
    } catch {
      setShowMenuTip(true);
    }
  }, [open, view]);

  useEffect(() => {
    if (open) return;
    setShowIosInstallGuide(false);
    setInstallFeedback(null);
    setInstallBusy(false);
  }, [open]);

  const defaultOpenModuleId = useMemo(() => {
    if (!hasCourse) return COURSE_MODULES[0]?.id ?? "m1";
    const activeId = course!.activeLessonId;
    const mod = COURSE_MODULES.find((m) => m.lessons.some((l) => l.id === activeId));
    return mod?.id ?? COURSE_MODULES[0]?.id ?? "m1";
  }, [hasCourse, course]);

  const [openModuleId, setOpenModuleId] = useState<string>(defaultOpenModuleId);

  useEffect(() => {
    setOpenModuleId(defaultOpenModuleId);
  }, [defaultOpenModuleId]);

  const activePageLabel = useMemo(() => {
    const map: Record<string, string> = {
      "/": "Home",
      "/course": "Free Course",
      "/programs": "Swim Programs",
      "/analysis": "Video Analysis",
      "/our-method": "Our Method",
      "/contact": "Contact",
    };

    if (pathname && map[pathname]) return map[pathname];

    const found = Object.keys(map)
      .filter((k) => k !== "/")
      .find((k) => pathname?.startsWith(`${k}/`));
    if (found) return map[found];

    return "Home";
  }, [pathname]);

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  async function handleInstallFromMenu() {
    if (installBusy) return;
    setInstallBusy(true);
    setInstallFeedback(null);

    const result = await requestInstall();
    setInstallBusy(false);

    if (result === "accepted") {
      setShowIosInstallGuide(false);
      setInstallFeedback("Install prompt opened. Follow your browser steps.");
      return;
    }
    if (result === "dismissed") {
      setShowIosInstallGuide(false);
      setInstallFeedback("No problem. You can install any time from this menu.");
      return;
    }
    if (result === "ios-instructions") {
      setShowIosInstallGuide(true);
      return;
    }
    if (result === "already-installed") {
      setShowIosInstallGuide(false);
      setInstallFeedback("App is already installed on this device.");
      return;
    }
    setShowIosInstallGuide(false);
    setInstallFeedback("Install is not available in this browser yet.");
  }

  const headerTitle = view === "course" ? titleCourse : titleMain;
  const headerSub =
    view === "course"
      ? "Pick a module, then choose a lesson."
      : `Navigate the site. Active: ${activePageLabel}`;

  // Small “X” button style
  const iconBtn = "rounded-2xl bg-slate-100/70 px-3 py-2 text-slate-700";

  const bottomNavItems: MobileSegmentedNavItem[] = [
    {
      id: "drawer-main",
      kind: "button",
      label: "Menu",
      onClick: () => setView("main"),
      ariaPressed: view === "main",
      skin: view === "main" ? "active" : "muted",
    },
    {
      id: "drawer-back",
      kind: "button",
      label: "Close",
      onClick: onClose,
      skin: "neutral",
    },
  ];
  if (hasCourse) {
    bottomNavItems.push({
      id: "drawer-course",
      kind: "button",
      label: "Lessons",
      onClick: () => setView("course"),
      ariaPressed: view === "course",
      skin: view === "course" ? "active" : "muted",
    });
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Navigation menu">
      <div className="flex h-full flex-col overflow-hidden rounded-bl-3xl bg-white/90">
        {/* Header */}
        <div className="px-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="relative mt-0.5 h-9 w-9 shrink-0">
                <Image
                  src="/logos/01_icon_transparent.png"
                  alt="Freeswimming.org"
                  fill
                  className="object-contain"
                  sizes="36px"
                />
              </span>

              <div>
                <div className="text-[16px] font-semibold text-slate-900">{headerTitle}</div>
                <div className="mt-1 text-[13px] font-medium text-slate-600">{headerSub}</div>
              </div>
            </div>

            <PressButton tier="icon" onClick={onClose} className={iconBtn} aria-label="Close menu">
              ✕
            </PressButton>
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-36 pt-4">
          {view === "course" && hasCourse ? (
            <CourseView
              openModuleId={openModuleId}
              setOpenModuleId={setOpenModuleId}
              activeLessonId={course!.activeLessonId}
              doneLessonIds={course!.doneLessonIds ?? []}
              onSelectLesson={course!.onSelectLesson}
            />
          ) : (
            <MainView
              mainItems={mainItems}
              isActiveRoute={isActiveRoute}
              onClose={onClose}
              install={{
                isInstalled,
                canInstall,
                isIOS,
                busy: installBusy,
                feedback: installFeedback,
                showIosGuide: showIosInstallGuide,
                onInstall: handleInstallFromMenu,
                onCloseIosGuide: () => setShowIosInstallGuide(false),
              }}
            />
          )}

          {/* Tip only in Menu view */}
          {view === "main" && showMenuTip ? (
            <div className="mt-6 rounded-[22px] border border-slate-200/60 bg-[radial-gradient(520px_180px_at_20%_0%,rgba(99,168,255,0.12),rgba(255,255,255,0)_60%)] p-4 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
                Tip
              </div>
              <div className="mt-1 text-[13px] leading-6 text-slate-600">
                Keep it simple: one focus at a time.
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom bar */}
        <div className="sticky bottom-0 border-t border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-5">
          <div className="mx-auto max-w-[520px]">
            <MobileSegmentedNav items={bottomNavItems} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MainView({
  mainItems,
  isActiveRoute,
  onClose,
  install,
}: {
  mainItems: { href: string; title: string; subtitle?: string }[];
  isActiveRoute: (href: string) => boolean;
  onClose: () => void;
  install: {
    isInstalled: boolean;
    canInstall: boolean;
    isIOS: boolean;
    busy: boolean;
    feedback: string | null;
    showIosGuide: boolean;
    onInstall: () => void;
    onCloseIosGuide: () => void;
  };
}) {
  return (
    <div className="flex flex-col gap-3">
      {mainItems.map((item) => {
        const active = isActiveRoute(item.href);

        return (
          <PressLink
            tier="menuCard"
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={[
              "relative overflow-hidden rounded-[22px] border px-5 py-4 backdrop-blur",
              active
                ? "border-blue-200/70 bg-[linear-gradient(90deg,rgba(59,130,246,0.72)_0_4px,rgba(255,255,255,0.84)_4px_100%),radial-gradient(600px_180px_at_20%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_60%)] shadow-[0_16px_48px_rgba(37,99,235,0.11)] ring-1 ring-blue-100/65"
                : "border-slate-200/60 bg-[linear-gradient(90deg,rgba(203,213,225,0.62)_0_4px,rgba(255,255,255,0.82)_4px_100%)] shadow-[0_12px_34px_rgba(15,23,42,0.08)]",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-[16px] font-semibold text-slate-900">{item.title}</div>
              {active ? (
                <span className="inline-flex shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700 ring-1 ring-blue-100/70">
                  Current page
                </span>
              ) : null}
            </div>
            {item.subtitle ? (
              <div className="mt-1 text-[13px] font-medium text-slate-600">{item.subtitle}</div>
            ) : null}
          </PressLink>
        );
      })}

      <div className="border-slate-200/62 relative overflow-hidden rounded-[22px] border bg-[radial-gradient(520px_170px_at_15%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_62%),rgba(255,255,255,0.86)] px-5 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          App
        </div>
        <div className="mt-1 text-[16px] font-semibold text-slate-900">Install app</div>
        <p className="mt-1 text-[13px] leading-6 text-slate-600">
          {install.isInstalled
            ? "Already installed on this device."
            : "Get quick access from your phone home screen."}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PressButton
            tier="cta"
            data-testid="install-app-menu-action"
            onClick={install.onInstall}
            disabled={install.busy || install.isInstalled}
            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)]"
            aria-label="Install app"
          >
            {install.isInstalled ? "Installed" : install.busy ? "Checking..." : "Install app"}
          </PressButton>
          {!install.canInstall && !install.isInstalled ? (
            <span className="rounded-full bg-slate-100/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/75">
              Browser support varies
            </span>
          ) : null}
        </div>

        {install.showIosGuide ? (
          <div className="bg-white/86 mt-3 rounded-2xl border border-blue-100/70 p-3">
            <div className="text-[13px] font-semibold text-slate-900">Install on iPhone/iPad</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-6 text-slate-700">
              <li>Tap the Share button in Safari.</li>
              <li>Choose “Add to Home Screen”.</li>
              <li>Tap “Add”.</li>
            </ol>
            <div className="mt-3">
              <PressButton
                tier="nav"
                onClick={install.onCloseIosGuide}
                className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200/75"
              >
                Got it
              </PressButton>
            </div>
          </div>
        ) : null}

        {install.feedback ? (
          <p className="mt-2 text-[12px] font-medium text-slate-600">{install.feedback}</p>
        ) : null}
      </div>
    </div>
  );
}

function CourseView({
  openModuleId,
  setOpenModuleId,
  activeLessonId,
  doneLessonIds,
  onSelectLesson,
}: {
  openModuleId: string;
  setOpenModuleId: (id: string) => void;
  activeLessonId: string;
  doneLessonIds: string[];
  onSelectLesson: (lessonId: string) => void;
}) {
  const doneLessonIdSet = useMemo(() => new Set(doneLessonIds), [doneLessonIds]);
  const totalModules = COURSE_MODULES.length;
  const totalLessons = useMemo(
    () => COURSE_MODULES.reduce((sum, mod) => sum + mod.lessons.length, 0),
    []
  );
  const completedLessons = useMemo(
    () =>
      COURSE_MODULES.reduce(
        (sum, mod) => sum + mod.lessons.filter((lesson) => doneLessonIdSet.has(lesson.id)).length,
        0
      ),
    [doneLessonIdSet]
  );
  const completedModules = useMemo(
    () =>
      COURSE_MODULES.filter(
        (mod) =>
          mod.lessons.length > 0 && mod.lessons.every((lesson) => doneLessonIdSet.has(lesson.id))
      ).length,
    [doneLessonIdSet]
  );
  const completedPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="border-blue-200/62 rounded-[20px] border bg-[radial-gradient(520px_170px_at_18%_0%,rgba(99,168,255,0.12),rgba(255,255,255,0)_62%),rgba(255,255,255,0.9)] p-3.5 shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-700">
              Progress
            </div>
            <p className="mt-1 text-[13px] font-semibold leading-5 text-slate-700">
              Modules {completedModules} of {totalModules}
              <span className="px-1 text-slate-300">•</span>
              Lessons {completedLessons} of {totalLessons}
            </p>
          </div>

          <span className="bg-blue-50/82 shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200/65">
            {completedPct}%
          </span>
        </div>

        <div
          className="mt-2.5"
          role="progressbar"
          aria-label="Course progress in menu"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completedPct}
          aria-valuetext={`Progress: modules ${completedModules} of ${totalModules}, lessons ${completedLessons} of ${totalLessons}.`}
        >
          <div className="bg-slate-200/86 h-2.5 overflow-hidden rounded-full ring-1 ring-slate-200/75">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-[width] duration-300"
              style={{ width: `${completedPct}%` }}
            />
          </div>
        </div>
      </div>

      {COURSE_MODULES.map((mod, idx) => {
        const isOpen = openModuleId === mod.id;
        const isActiveModule = mod.lessons.some((l) => l.id === activeLessonId);
        const moduleLessonCount = mod.lessons.length;
        const doneCount = mod.lessons.filter((lesson) => doneLessonIdSet.has(lesson.id)).length;
        const isDoneModule = moduleLessonCount > 0 && doneCount === moduleLessonCount;
        const isInProgressModule = doneCount > 0 && doneCount < moduleLessonCount;
        const doneSummary = `Module progress: ${doneCount} of ${moduleLessonCount}`;
        const panelId = `course-module-panel-${mod.id}`;

        const wrapperClass = [
          "relative overflow-hidden rounded-[22px] border bg-white/80 backdrop-blur",
          "shadow-[0_12px_34px_rgba(15,23,42,0.08)]",
          isActiveModule ? "border-blue-200/70" : "border-slate-200/60",
          isOpen && !isActiveModule ? "shadow-[0_18px_52px_rgba(15,23,42,0.10)]" : "",
          isOpen && isActiveModule ? "shadow-[0_16px_46px_rgba(37,99,235,0.11)]" : "",
        ].join(" ");

        const accentClass = [
          "absolute left-0 top-0 h-full w-[4px] transition",
          isActiveModule
            ? "bg-gradient-to-b from-blue-400 to-blue-600"
            : isDoneModule
              ? "bg-gradient-to-b from-emerald-300 to-emerald-500"
              : isOpen
                ? "bg-slate-300/80"
                : "bg-slate-200/70",
        ].join(" ");

        const moduleHeaderBtn = [
          "flex w-full items-start justify-between gap-3 px-5 py-4 text-left",
          isOpen
            ? "bg-[radial-gradient(600px_180px_at_20%_0%,rgba(99,168,255,0.11),rgba(255,255,255,0)_60%)]"
            : "",
        ].join(" ");

        return (
          <div key={mod.id} className={wrapperClass}>
            <div className={accentClass} />

            <PressButton
              tier="card"
              onClick={() => setOpenModuleId(isOpen ? "" : mod.id)}
              className={moduleHeaderBtn}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <div className="pl-2">
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ring-1",
                      isActiveModule
                        ? "bg-blue-50 text-blue-700 ring-blue-100/70"
                        : "bg-slate-50 text-slate-700 ring-slate-200/70",
                    ].join(" ")}
                  >
                    Module {idx + 1} of {COURSE_MODULES.length}
                  </span>

                  {isActiveModule ? (
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700 ring-1 ring-blue-100/70">
                      Current module
                    </span>
                  ) : isDoneModule ? (
                    <span className="inline-flex rounded-full bg-emerald-50/80 px-3 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                      Module completed
                    </span>
                  ) : isInProgressModule ? (
                    <span className="bg-blue-50/78 inline-flex rounded-full px-3 py-1 text-[12px] font-semibold text-blue-700 ring-1 ring-blue-200/60">
                      In progress
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 text-[16px] font-semibold text-slate-900">{mod.title}</div>

                {mod.subtitle ? (
                  <div className="mt-1 text-[13px] font-medium text-slate-700">{mod.subtitle}</div>
                ) : null}
                <div
                  className={[
                    "mt-1 text-[12px] font-medium",
                    isDoneModule
                      ? "text-emerald-700"
                      : isInProgressModule || isActiveModule
                        ? "text-blue-600"
                        : "text-slate-500",
                  ].join(" ")}
                >
                  {doneSummary}
                </div>
              </div>

              <span
                className={[
                  "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-[18px] font-semibold leading-none ring-1 transition",
                  isOpen
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100/70"
                    : "bg-white/88 ring-slate-200/78 text-slate-600",
                ].join(" ")}
              >
                {isOpen ? "–" : "+"}
              </span>
            </PressButton>

            {isOpen ? (
              <div id={panelId} className="px-5 pb-4">
                <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />

                <SmartLessonList
                  lessons={mod.lessons}
                  activeLessonId={activeLessonId}
                  doneLessonIdSet={doneLessonIdSet}
                  onSelectLesson={onSelectLesson}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SmartLessonList({
  lessons,
  activeLessonId,
  doneLessonIdSet,
  onSelectLesson,
}: {
  lessons: CourseLesson[];
  activeLessonId: string;
  doneLessonIdSet: Set<string>;
  onSelectLesson: (lessonId: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const measure = () => {
      const overflow = el.scrollHeight > el.clientHeight + 1;
      setCanScroll(overflow);

      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      setAtBottom(bottom);
    };

    measure();
    window.addEventListener("resize", measure);

    const t = window.setTimeout(measure, 0);

    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [lessons.length, activeLessonId]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      setAtBottom(bottom);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const total = lessons.length;
  const showHint = canScroll && !atBottom;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={[
          "rounded-[18px] bg-slate-50/70 p-2 ring-1 ring-slate-200/60",
          "max-h-[280px] overflow-y-auto overscroll-contain",
          "pr-1",
        ].join(" ")}
      >
        <div className="space-y-1.5">
          {lessons.map((l, i) => {
            const active = l.id === activeLessonId;
            const done = doneLessonIdSet.has(l.id);
            const activeAndDone = active && done;

            return (
              <PressButton
                tier="card"
                key={l.id}
                onClick={() => onSelectLesson(l.id)}
                className={[
                  "relative w-full rounded-[16px] px-4 py-3 text-left transition-colors",
                  activeAndDone
                    ? "ring-blue-400/82 bg-emerald-50/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_0_0_1px_rgba(59,130,246,0.35)] ring-2"
                    : active
                      ? "bg-blue-50/82 ring-blue-300/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] ring-1"
                      : done
                        ? "ring-emerald-200/78 bg-emerald-50/85 ring-1"
                        : "bg-white/78 ring-1 ring-slate-200/65",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <span className="absolute left-2 top-3.5 h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <div className="text-[14px] font-semibold text-slate-900">{l.title}</div>

                  <div className="flex items-center gap-2">
                    {active && done ? (
                      <span className="rounded-full bg-emerald-50/85 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/75">
                        Done
                      </span>
                    ) : active ? (
                      <span className="bg-blue-100/68 rounded-full px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200/70">
                        Current
                      </span>
                    ) : null}

                    {done && !active ? (
                      <span className="rounded-full bg-emerald-50/75 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                        Done
                      </span>
                    ) : null}

                    {!active || activeAndDone ? (
                      <span
                        className={[
                          "shrink-0 text-[12px] font-semibold",
                          done ? "text-slate-500" : "text-slate-700",
                        ].join(" ")}
                      >
                        {i + 1} of {total}
                        {!done && l.estMinutes ? ` • ${l.estMinutes}m` : ""}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-1.5 line-clamp-1 text-[13px] font-medium leading-5 text-slate-700 sm:line-clamp-2">
                  {l.goal}
                </div>
              </PressButton>
            );
          })}
        </div>
      </div>

      {/* Scroll hint shown only when scroll exists and not at bottom */}
      {showHint ? (
        <>
          {/* hint chip */}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <div className="bg-white/58 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/50 backdrop-blur">
              <span aria-hidden>⬇︎</span>
              <span>Scroll for more</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
