// components/MenuDrawer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import Modal from "@/components/Modal";
import { COURSE_MODULES, type CourseLesson } from "@/app/course/courseData";
import PressButton from "@/components/ui/PressButton";
import PressLink from "@/components/ui/PressLink";

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
  };

  /** Optional: headline override */
  titleMain?: string; // defaults to "Menu"
  titleCourse?: string; // defaults to "Course menu"
};

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

  const [view, setView] = useState<"main" | "course">(hasCourse ? defaultView : "main");

  useEffect(() => {
    if (!open) return;
    setView(hasCourse ? defaultView : "main");
  }, [open, defaultView, hasCourse]);

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

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const headerTitle = view === "course" ? titleCourse : titleMain;
  const headerSub =
    view === "course"
      ? "Pick a module, then choose a lesson."
      : `Navigate the site. Active: ${activePageLabel}`;

  // Bottom bar button system (same feel as SiteChrome/Course)
  const navBtnBase = "flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold";
  const navBtnInactive = "bg-slate-100/70 text-slate-800";
  const navBtnActive =
    "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)]";
  const navBtnWhite = "bg-white/90 text-slate-900 ring-1 ring-white/70";

  // Small “X” button style
  const iconBtn = "rounded-2xl bg-slate-100/70 px-3 py-2 text-slate-700";

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
                  priority
                  className="object-contain"
                  sizes="36px"
                />
              </span>

              <div>
                <div className="text-[16px] font-semibold text-slate-900">{headerTitle}</div>
                <div className="mt-1 text-[13px] font-medium text-slate-500">{headerSub}</div>
              </div>
            </div>

            <PressButton tier="icon" onClick={onClose} className={iconBtn} aria-label="Close menu">
              ✕
            </PressButton>
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-5 pb-36 pt-4">
          {view === "course" && hasCourse ? (
            <CourseView
              openModuleId={openModuleId}
              setOpenModuleId={setOpenModuleId}
              activeLessonId={course!.activeLessonId}
              onSelectLesson={course!.onSelectLesson}
            />
          ) : (
            <MainView mainItems={mainItems} isActiveRoute={isActiveRoute} onClose={onClose} />
          )}

          {/* Tip only in Menu view */}
          {view === "main" ? (
            <div className="mt-6 rounded-[20px] border border-slate-200/70 bg-white/70 p-4">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                Tip
              </div>
              <div className="mt-1 text-[13px] leading-6 text-slate-700">
                Keep it simple: one focus at a time.
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom bar */}
        <div className="sticky bottom-0 border-t border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-5">
          <div className="mx-auto max-w-[520px]">
            <div className="rounded-[22px] bg-white/75 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.14)] ring-1 ring-white/70 backdrop-blur">
              <div className="flex items-center gap-2">
                <PressButton
                  tier="nav"
                  onClick={() => setView("main")}
                  className={[navBtnBase, view === "main" ? navBtnActive : navBtnInactive].join(" ")}
                  aria-pressed={view === "main"}
                >
                  Menu
                </PressButton>

                <PressButton
                  tier="nav"
                  onClick={onClose}
                  className={[navBtnBase, navBtnWhite].join(" ")}
                >
                  Back
                </PressButton>

                {hasCourse ? (
                  <PressButton
                    tier="nav"
                    onClick={() => setView("course")}
                    className={[navBtnBase, view === "course" ? navBtnActive : navBtnInactive].join(
                      " "
                    )}
                    aria-pressed={view === "course"}
                  >
                    Lessons
                  </PressButton>
                ) : null}
              </div>
            </div>
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
}: {
  mainItems: { href: string; title: string; subtitle?: string }[];
  isActiveRoute: (href: string) => boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {mainItems.map((item) => {
        const active = isActiveRoute(item.href);

        return (
          <PressLink
            tier="card"
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={[
              "relative rounded-[22px] border px-5 py-4 shadow-sm backdrop-blur",
              active ? "border-blue-200/70 bg-blue-50/70" : "border-white/70 bg-white/80",
            ].join(" ")}
          >
            <div className="text-[16px] font-semibold text-slate-900">{item.title}</div>
            {item.subtitle ? (
              <div className="mt-1 text-[13px] font-medium text-slate-600">{item.subtitle}</div>
            ) : null}
          </PressLink>
        );
      })}
    </div>
  );
}

function CourseView({
  openModuleId,
  setOpenModuleId,
  activeLessonId,
  onSelectLesson,
}: {
  openModuleId: string;
  setOpenModuleId: (id: string) => void;
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {COURSE_MODULES.map((mod, idx) => {
        const isOpen = openModuleId === mod.id;
        const isActiveModule = mod.lessons.some((l) => l.id === activeLessonId);
        const panelId = `course-module-panel-${mod.id}`;

        const wrapperClass = [
          "relative overflow-hidden rounded-[22px] border bg-white/80 backdrop-blur",
          "shadow-[0_12px_34px_rgba(15,23,42,0.08)]",
          isActiveModule ? "border-blue-200/70" : "border-slate-200/60",
          isOpen && !isActiveModule ? "shadow-[0_18px_52px_rgba(15,23,42,0.10)]" : "",
          isOpen && isActiveModule ? "shadow-[0_22px_70px_rgba(37,99,235,0.14)]" : "",
        ].join(" ");

        const accentClass = [
          "absolute left-0 top-0 h-full w-[4px] transition",
          isActiveModule
            ? "bg-gradient-to-b from-blue-400 to-blue-600"
            : isOpen
            ? "bg-slate-300/80"
            : "bg-slate-200/70",
        ].join(" ");

        const moduleHeaderBtn = [
          "flex w-full items-start justify-between gap-3 px-5 py-4 text-left",
          isOpen
            ? "bg-[radial-gradient(600px_180px_at_20%_0%,rgba(99,168,255,0.16),rgba(255,255,255,0)_60%)]"
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
                        : "bg-slate-50 text-slate-600 ring-slate-200/70",
                    ].join(" ")}
                  >
                    Module {idx + 1}/{COURSE_MODULES.length}
                  </span>

                  {isActiveModule ? (
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700 ring-1 ring-blue-100/70">
                      Current module
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 text-[16px] font-semibold text-slate-900">{mod.title}</div>

                {mod.subtitle ? (
                  <div className="mt-1 text-[13px] font-medium text-slate-600">{mod.subtitle}</div>
                ) : null}
              </div>

              <span
                className={[
                  "mt-0.5 rounded-2xl px-3 py-2 text-[12px] font-semibold",
                  isOpen
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100/70"
                    : "bg-slate-100/80 text-slate-700",
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
  onSelectLesson,
}: {
  lessons: CourseLesson[];
  activeLessonId: string;
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
        {lessons.map((l, i) => {
          const active = l.id === activeLessonId;

          // ✅ Fade ONLY lesson #3 (index 2) while hint is visible
          const fadeThird = i === 2 && showHint;

          return (
            <PressButton
              tier="card"
              key={l.id}
              onClick={() => onSelectLesson(l.id)}
              className={[
                "relative w-full rounded-[16px] px-4 py-3 text-left",
                active ? "bg-blue-50/90 ring-1 ring-blue-200/60" : "",
                fadeThird ? "opacity-60" : "",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {active ? (
                <span className="absolute left-2 top-3 h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-semibold text-slate-900">{l.title}</div>

                <div className="flex items-center gap-2">
                  {active ? (
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100/70">
                      Current
                    </span>
                  ) : null}

                  {/* ✅ Show BOTH position + minutes */}
                  <span className="shrink-0 text-[12px] font-semibold text-slate-500">
                    {i + 1}/{total}
                    {l.estMinutes ? ` • ${l.estMinutes}m` : ""}
                  </span>
                </div>
              </div>

              <div className="mt-1 line-clamp-2 text-[12px] font-medium leading-5 text-slate-600">
                {l.goal}
              </div>
            </PressButton>
          );
        })}
      </div>

      {/* ✅ Stronger fade + scroll hint (arrow) shown only when scroll exists and not at bottom */}
      {showHint ? (
        <>
          {/* gradient fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-[18px] bg-gradient-to-t from-slate-50 to-transparent" />

          {/* hint chip */}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200/70 shadow-sm backdrop-blur">
              <span aria-hidden>⬇︎</span>
              <span>Scroll for more</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
