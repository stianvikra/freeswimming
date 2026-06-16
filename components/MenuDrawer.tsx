// components/MenuDrawer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ChevronDown, X } from "lucide-react";
import { usePathname } from "next/navigation";

import Modal from "@/components/Modal";
import { COURSE_MODULES, type CourseLesson, type CourseModule } from "@/app/course/courseData";
import BrandImage from "@/components/brand/BrandImage";
import InstallFeedback, { type InstallFeedbackMessage } from "@/components/install/InstallFeedback";
import { useInstallContext } from "@/components/install/install-context";
import PressButton from "@/components/ui/PressButton";
import PressLink from "@/components/ui/PressLink";
import MobileSegmentedNav, {
  type MobileSegmentedNavItem,
} from "@/components/ui/MobileSegmentedNav";
import { cx } from "@/components/ui/cx";
import { BRAND_USAGE } from "@/lib/brand";
import {
  buildCourseLessonProgressStatusMap,
  getStrongestCourseLessonProgressStatus,
  type CourseLessonProgressStatus,
} from "@/lib/course/progress-status";

type MainItem = { href: string; title: string; subtitle?: string };

type Props = {
  open: boolean;
  onClose: () => void;

  /** Which view to show when the drawer opens */
  defaultView?: "main" | "course";

  /** Main nav items to show in the Main view */
  mainItems: MainItem[];

  /**
   * If provided, enables Course view.
   * If omitted, drawer only shows the Main view.
   */
  course?: {
    activeLessonId: string;
    onSelectLesson: (lessonId: string) => void;
    doneLessonIds?: string[];
    doneGateChecksByLessonId?: Record<string, string[]>;
    lessonProgressStatusById?: Record<string, CourseLessonProgressStatus>;
    modules?: CourseModule[];
  };

  /** Optional: headline override */
  titleMain?: string; // defaults to "Main menu"
  titleCourse?: string; // defaults to "Course menu"
};

const MENU_TIP_SEEN_KEY = "fs_menu_tip_seen";
const DRAWER_CARD_CLASS =
  "fs-library-card relative overflow-hidden p-4 backdrop-blur transition-colors";
const DRAWER_ACCENT_CARD_CLASS =
  "fs-library-card fs-library-card-accent relative overflow-hidden p-4 backdrop-blur transition-colors";
const DRAWER_MUTED_CARD_CLASS =
  "fs-library-card fs-library-card-muted relative overflow-hidden p-4 backdrop-blur transition-colors";
const DRAWER_PRIMARY_ACTION_CLASS =
  "fs-cta-primary inline-flex min-h-11 items-center justify-center px-4 py-2 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const DRAWER_SECONDARY_ACTION_CLASS =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-3 py-1.5 text-[12px] font-semibold transition-colors";
const DRAWER_PILL_CLASS =
  "inline-flex shrink-0 rounded-[var(--fs-radius-control)] px-2.5 py-1 text-[12px] font-semibold ring-1";
const DRAWER_SMALL_PILL_CLASS =
  "rounded-[var(--fs-radius-control)] px-2 py-1 text-[11px] font-semibold ring-1";

export default function MenuDrawer({
  open,
  onClose,
  defaultView = "course",
  mainItems,
  course,
  titleMain = "Main menu",
  titleCourse = "Course menu",
}: Props) {
  const pathname = usePathname() ?? "/";
  const hasCourse = Boolean(course);
  const activeCourseLessonId = course?.activeLessonId ?? null;
  const courseModules = useMemo(() => {
    if (!hasCourse) return COURSE_MODULES;
    const dynamicModules = course?.modules;
    if (!dynamicModules || dynamicModules.length === 0) return COURSE_MODULES;
    return dynamicModules;
  }, [course?.modules, hasCourse]);
  const { canInstall, isInstalled, requestInstall } = useInstallContext();

  const [view, setView] = useState<"main" | "course">(hasCourse ? defaultView : "main");
  const [showMenuTip, setShowMenuTip] = useState(false);
  const [showIosInstallGuide, setShowIosInstallGuide] = useState(false);
  const [showMacSafariInstallGuide, setShowMacSafariInstallGuide] = useState(false);
  const [installFeedback, setInstallFeedback] = useState<InstallFeedbackMessage | null>(null);
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
    setShowMacSafariInstallGuide(false);
    setInstallFeedback(null);
    setInstallBusy(false);
  }, [open]);

  const defaultOpenModuleId = useMemo(() => {
    if (!hasCourse) return courseModules[0]?.id ?? "m1";
    const activeId = activeCourseLessonId;
    if (!activeId) return courseModules[0]?.id ?? "m1";
    const mod = courseModules.find((m) => m.lessons.some((l) => l.id === activeId));
    return mod?.id ?? courseModules[0]?.id ?? "m1";
  }, [activeCourseLessonId, courseModules, hasCourse]);

  const [openModuleId, setOpenModuleId] = useState<string>(defaultOpenModuleId);

  useEffect(() => {
    setOpenModuleId(defaultOpenModuleId);
  }, [defaultOpenModuleId]);

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
  };

  async function handleInstallFromMenu() {
    if (installBusy) return;
    setInstallBusy(true);
    setInstallFeedback(null);

    const result = await requestInstall();
    setInstallBusy(false);

    if (result === "accepted") {
      setShowIosInstallGuide(false);
      setShowMacSafariInstallGuide(false);
      setInstallFeedback({
        tone: "success",
        message:
          "App installed. You can open FreeSwimming from your Dock, Start menu, or home screen.",
      });
      return;
    }
    if (result === "dismissed") {
      setShowIosInstallGuide(false);
      setShowMacSafariInstallGuide(false);
      setInstallFeedback({
        tone: "info",
        message: "No problem. You can install any time from this menu.",
      });
      return;
    }
    if (result === "ios-instructions") {
      setShowIosInstallGuide(true);
      setShowMacSafariInstallGuide(false);
      return;
    }
    if (result === "mac-safari-instructions") {
      setShowIosInstallGuide(false);
      setShowMacSafariInstallGuide(true);
      return;
    }
    if (result === "already-installed") {
      setShowIosInstallGuide(false);
      setShowMacSafariInstallGuide(false);
      setInstallFeedback({
        tone: "success",
        message: "App is already installed on this device.",
      });
      return;
    }
    setShowIosInstallGuide(false);
    setShowMacSafariInstallGuide(false);
    setInstallFeedback({
      tone: "warning",
      message:
        "Install is not available in this browser yet. For best support, use Safari, Chrome, or Edge.",
    });
  }

  const headerTitle = view === "course" ? titleCourse : titleMain;

  const iconBtn =
    "fs-cta-secondary inline-flex h-10 w-10 items-center justify-center p-0 text-slate-700";

  const bottomNavItems: MobileSegmentedNavItem[] = [
    {
      id: "drawer-main",
      kind: "button",
      label: "Main",
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
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel="Navigation menu"
      restoreFocusSelector='[data-testid="header-menu-toggle"]'
    >
      <div className="flex h-full flex-col overflow-hidden rounded-bl-[var(--fs-radius-panel)] bg-white/94">
        {/* Header */}
        <div className="px-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <BrandImage
                asset={BRAND_USAGE.drawerLockup}
                decorative
                className="mt-0.5 h-8 w-auto shrink-0"
                sizes="156px"
              />

              <div className="pt-1">
                <div className="text-[16px] font-semibold text-slate-900">{headerTitle}</div>
              </div>
            </div>

            <PressButton tier="icon" onClick={onClose} className={iconBtn} aria-label="Close menu">
              <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
            </PressButton>
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pt-4 pb-36">
          {view === "course" && hasCourse ? (
            <CourseView
              modules={courseModules}
              openModuleId={openModuleId}
              setOpenModuleId={setOpenModuleId}
              activeLessonId={course!.activeLessonId}
              doneLessonIds={course!.doneLessonIds ?? []}
              doneGateChecksByLessonId={course!.doneGateChecksByLessonId ?? {}}
              lessonProgressStatusById={course!.lessonProgressStatusById}
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
                busy: installBusy,
                feedback: installFeedback,
                showIosGuide: showIosInstallGuide,
                showMacSafariGuide: showMacSafariInstallGuide,
                onInstall: handleInstallFromMenu,
                onCloseIosGuide: () => setShowIosInstallGuide(false),
                onCloseMacSafariGuide: () => setShowMacSafariInstallGuide(false),
              }}
            />
          )}

          {/* Tip only in Main view */}
          {view === "main" && showMenuTip ? (
            <div className={cx(DRAWER_MUTED_CARD_CLASS, "mt-6")}>
              <div className="text-[12px] font-semibold tracking-wide text-slate-600 uppercase">
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
    busy: boolean;
    feedback: InstallFeedbackMessage | null;
    showIosGuide: boolean;
    showMacSafariGuide: boolean;
    onInstall: () => void;
    onCloseIosGuide: () => void;
    onCloseMacSafariGuide: () => void;
  };
}) {
  const feedbackId = "main-menu-install-feedback";
  const iosGuideId = "main-menu-install-ios-guide";
  const macSafariGuideId = "main-menu-install-mac-safari-guide";
  const installDescriptionId = install.feedback
    ? feedbackId
    : install.showIosGuide
      ? iosGuideId
      : install.showMacSafariGuide
        ? macSafariGuideId
        : undefined;

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
            data-testid={`main-menu-link-${item.href === "/" ? "home" : item.href.replace(/^\//, "").replaceAll("/", "-")}`}
            className={cx(
              active ? DRAWER_ACCENT_CARD_CLASS : DRAWER_CARD_CLASS,
              "block border-l-4 px-5 py-4",
              active ? "border-l-blue-600" : "border-l-slate-300"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-[16px] font-semibold text-slate-900">{item.title}</div>
              {active ? (
                <span
                  className={cx(DRAWER_PILL_CLASS, "bg-blue-50 text-blue-700 ring-blue-100/70")}
                >
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

      <div
        className={cx(DRAWER_MUTED_CARD_CLASS, "px-5 py-4")}
        data-testid="main-menu-install-card"
      >
        <div className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
          App
        </div>
        <div className="mt-1 text-[16px] font-semibold text-slate-900">Install app</div>
        <p className="mt-1 text-[13px] leading-6 text-slate-600">
          {install.isInstalled
            ? "Already installed on this device."
            : "Get quick access from your home screen, Dock, or Start menu."}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PressButton
            tier="cta"
            data-testid="install-app-menu-action"
            onClick={install.onInstall}
            disabled={install.busy || install.isInstalled}
            aria-describedby={installDescriptionId}
            className={DRAWER_PRIMARY_ACTION_CLASS}
            aria-label="Install app"
          >
            {install.isInstalled ? "Installed" : install.busy ? "Checking..." : "Install app"}
          </PressButton>
          {!install.canInstall && !install.isInstalled ? (
            <span
              className={cx(
                DRAWER_SMALL_PILL_CLASS,
                "bg-slate-100/90 text-slate-600 ring-slate-200/75"
              )}
            >
              Browser support varies
            </span>
          ) : null}
        </div>

        {install.showIosGuide ? (
          <InstallFeedback
            id={iosGuideId}
            tone="info"
            title="Install on iPhone/iPad"
            className="mt-3 !rounded-[var(--fs-radius-card)] bg-white/86"
            testId="main-menu-install-ios-guide"
          >
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-6 text-slate-700">
              <li>Tap the Share button in Safari.</li>
              <li>Choose “Add to Home Screen”.</li>
              <li>Tap “Add”.</li>
            </ol>
            <div className="mt-3">
              <PressButton
                tier="nav"
                onClick={install.onCloseIosGuide}
                className={DRAWER_SECONDARY_ACTION_CLASS}
              >
                Got it
              </PressButton>
            </div>
          </InstallFeedback>
        ) : null}

        {install.showMacSafariGuide ? (
          <InstallFeedback
            id={macSafariGuideId}
            tone="info"
            title="Install on Mac (Safari)"
            className="mt-3 !rounded-[var(--fs-radius-card)] bg-white/86"
            testId="main-menu-install-mac-safari-guide"
          >
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-6 text-slate-700">
              <li>Open File in Safari.</li>
              <li>Choose Add to Dock.</li>
              <li>Click Add.</li>
            </ol>
            <div className="mt-3">
              <PressButton
                tier="nav"
                onClick={install.onCloseMacSafariGuide}
                className={DRAWER_SECONDARY_ACTION_CLASS}
              >
                Got it
              </PressButton>
            </div>
          </InstallFeedback>
        ) : null}

        {install.feedback ? (
          <InstallFeedback
            id={feedbackId}
            tone={install.feedback.tone}
            className="mt-3 !rounded-[var(--fs-radius-card)]"
            testId="main-menu-install-feedback"
          >
            {install.feedback.message}
          </InstallFeedback>
        ) : null}
      </div>
    </div>
  );
}

function CourseView({
  modules,
  openModuleId,
  setOpenModuleId,
  activeLessonId,
  doneLessonIds,
  doneGateChecksByLessonId,
  lessonProgressStatusById,
  onSelectLesson,
}: {
  modules: CourseModule[];
  openModuleId: string;
  setOpenModuleId: (id: string) => void;
  activeLessonId: string;
  doneLessonIds: string[];
  doneGateChecksByLessonId: Record<string, string[]>;
  lessonProgressStatusById?: Record<string, CourseLessonProgressStatus>;
  onSelectLesson: (lessonId: string) => void;
}) {
  const doneLessonIdSet = useMemo(() => new Set(doneLessonIds), [doneLessonIds]);
  const computedLessonProgressStatusById = useMemo(
    () =>
      buildCourseLessonProgressStatusMap(
        modules.flatMap((module) => module.lessons),
        doneLessonIdSet,
        doneGateChecksByLessonId
      ),
    [doneGateChecksByLessonId, doneLessonIdSet, modules]
  );
  const resolvedLessonProgressStatusById = useMemo(() => {
    if (!lessonProgressStatusById) {
      return computedLessonProgressStatusById;
    }

    const next = { ...computedLessonProgressStatusById };
    for (const courseModule of modules) {
      for (const lesson of courseModule.lessons) {
        next[lesson.id] = getStrongestCourseLessonProgressStatus(
          computedLessonProgressStatusById[lesson.id],
          lessonProgressStatusById[lesson.id]
        );
      }
    }

    return next;
  }, [computedLessonProgressStatusById, lessonProgressStatusById, modules]);
  const totalModules = modules.length;
  const totalLessons = useMemo(
    () => modules.reduce((sum, mod) => sum + mod.lessons.length, 0),
    [modules]
  );
  const completedLessons = useMemo(
    () =>
      Object.values(resolvedLessonProgressStatusById).filter((status) => status === "done").length,
    [resolvedLessonProgressStatusById]
  );
  const inProgressLessons = useMemo(
    () =>
      Object.values(resolvedLessonProgressStatusById).filter((status) => status === "in_progress")
        .length,
    [resolvedLessonProgressStatusById]
  );
  const completedModules = useMemo(
    () =>
      modules.filter(
        (mod) =>
          mod.lessons.length > 0 &&
          mod.lessons.every((lesson) => resolvedLessonProgressStatusById[lesson.id] === "done")
      ).length,
    [modules, resolvedLessonProgressStatusById]
  );
  const completedPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cx(DRAWER_ACCENT_CARD_CLASS, "p-3.5")}
        data-testid="course-menu-progress-card"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.08em] text-blue-700 uppercase">
              Progress
            </div>
          </div>

          <span
            className={cx(
              DRAWER_SMALL_PILL_CLASS,
              "shrink-0 bg-blue-50/82 text-blue-700 ring-blue-200/65"
            )}
          >
            {completedPct}%
          </span>
        </div>

        <p className="mt-1 text-[13px] leading-5 font-semibold text-slate-700">
          Modules {completedModules} of {totalModules}
          <span className="px-1 text-slate-300">•</span>
          Lessons {completedLessons} done
          {inProgressLessons > 0 ? (
            <>
              <span className="px-1 text-slate-300">•</span>
              {inProgressLessons} in progress
            </>
          ) : null}
          <span className="px-1 text-slate-300">•</span>
          {totalLessons} total
        </p>

        <div
          className="mt-2.5"
          role="progressbar"
          aria-label="Course progress in menu"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completedPct}
          aria-valuetext={`Progress: modules ${completedModules} of ${totalModules}, lessons ${completedLessons} done, ${inProgressLessons} in progress, ${totalLessons} total.`}
        >
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/86 ring-1 ring-slate-200/75">
            <div
              className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
              style={{ width: `${completedPct}%` }}
            />
          </div>
        </div>
      </div>

      {modules.map((mod, idx) => {
        const isOpen = openModuleId === mod.id;
        const isActiveModule = mod.lessons.some((l) => l.id === activeLessonId);
        const moduleLessonCount = mod.lessons.length;
        const lessonStatuses = mod.lessons.map(
          (lesson) => resolvedLessonProgressStatusById[lesson.id] ?? "not_started"
        );
        const doneCount = lessonStatuses.filter((status) => status === "done").length;
        const inProgressCount = lessonStatuses.filter((status) => status === "in_progress").length;
        const isDoneModule = moduleLessonCount > 0 && doneCount === moduleLessonCount;
        const isInProgressModule =
          !isDoneModule && (doneCount > 0 || inProgressCount > 0 || isActiveModule);
        const doneSummary = isDoneModule
          ? `All ${moduleLessonCount} lessons done`
          : isInProgressModule
            ? `Module progress: ${doneCount} done${
                inProgressCount > 0 ? ` • ${inProgressCount} in progress` : ""
              }`
            : `${moduleLessonCount} lessons ready to start`;
        const panelId = `course-module-panel-${mod.id}`;

        const wrapperClass = cx(
          isActiveModule ? DRAWER_ACCENT_CARD_CLASS : DRAWER_CARD_CLASS,
          "p-0"
        );

        const accentClass = cx(
          "absolute left-0 top-0 h-full w-[4px] transition",
          isActiveModule
            ? "bg-blue-600"
            : isDoneModule
              ? "bg-emerald-500"
              : isInProgressModule
                ? "bg-amber-500"
                : isOpen
                  ? "bg-slate-400"
                  : "bg-slate-300"
        );

        const moduleHeaderBtn = cx(
          "flex w-full items-start justify-between gap-3 px-5 py-4 text-left",
          isOpen && !isActiveModule ? "bg-slate-50/72" : ""
        );

        return (
          <div key={mod.id} className={wrapperClass} data-testid={`course-menu-module-${mod.id}`}>
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
                    className={cx(
                      DRAWER_PILL_CLASS,
                      isActiveModule
                        ? "bg-blue-50 text-blue-700 ring-blue-100/70"
                        : "bg-slate-50 text-slate-700 ring-slate-200/70"
                    )}
                  >
                    Module {idx + 1} of {modules.length}
                  </span>

                  {isActiveModule ? (
                    <span
                      className={cx(DRAWER_PILL_CLASS, "bg-blue-50 text-blue-700 ring-blue-100/70")}
                    >
                      Current module
                    </span>
                  ) : isDoneModule ? (
                    <span
                      className={cx(
                        DRAWER_PILL_CLASS,
                        "bg-emerald-50/80 text-emerald-700 ring-emerald-200/70"
                      )}
                    >
                      Module completed
                    </span>
                  ) : isInProgressModule ? (
                    <span
                      className={cx(
                        DRAWER_PILL_CLASS,
                        "bg-amber-50/82 text-amber-700 ring-amber-200/70"
                      )}
                    >
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
                        ? "text-amber-700"
                        : "text-slate-500",
                  ].join(" ")}
                >
                  {doneSummary}
                </div>
              </div>

              <span
                className={cx(
                  "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-[var(--fs-radius-control)] ring-1 transition",
                  isOpen
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100/70"
                    : "bg-white/88 text-slate-600 ring-slate-200/78"
                )}
              >
                <ChevronDown
                  aria-hidden="true"
                  className={cx("h-5 w-5 transition-transform", isOpen ? "rotate-180" : "")}
                  strokeWidth={2.3}
                />
              </span>
            </PressButton>

            {isOpen ? (
              <div id={panelId} className="px-5 pb-4">
                <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />

                <SmartLessonList
                  lessons={mod.lessons}
                  activeLessonId={activeLessonId}
                  progressStatusByLessonId={resolvedLessonProgressStatusById}
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
  progressStatusByLessonId,
  onSelectLesson,
}: {
  lessons: CourseLesson[];
  activeLessonId: string;
  progressStatusByLessonId: Record<string, CourseLessonProgressStatus>;
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
        className="max-h-[280px] overflow-y-auto overscroll-contain rounded-[var(--fs-radius-card)] bg-slate-50/70 p-2 pr-1 ring-1 ring-slate-200/60"
      >
        <div className="space-y-1.5">
          {lessons.map((l, i) => {
            const active = l.id === activeLessonId;
            const progressStatus = progressStatusByLessonId[l.id] ?? "not_started";
            const done = progressStatus === "done";
            const inProgress = progressStatus === "in_progress";
            const activeAndDone = active && done;

            return (
              <PressButton
                tier="card"
                key={l.id}
                onClick={() => onSelectLesson(l.id)}
                data-testid={`course-menu-lesson-${l.id}`}
                data-progress-state={progressStatus}
                className={cx(
                  "relative w-full rounded-[var(--fs-radius-card)] px-4 py-3 text-left transition-colors",
                  activeAndDone
                    ? "bg-emerald-50/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_0_0_1px_rgba(59,130,246,0.35)] ring-2 ring-blue-400/82"
                    : active
                      ? "bg-blue-50/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] ring-1 ring-blue-300/78"
                      : inProgress
                        ? "bg-amber-50/88 ring-1 ring-amber-200/80"
                        : done
                          ? "bg-emerald-50/85 ring-1 ring-emerald-200/78"
                          : "bg-white/78 ring-1 ring-slate-200/65"
                )}
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <span className="absolute top-3.5 left-2 h-5 w-1 rounded-[var(--fs-radius-control)] bg-blue-600" />
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <div className="text-[14px] font-semibold text-slate-900">{l.title}</div>

                  <div className="flex items-center gap-2">
                    {active && !activeAndDone ? (
                      <span
                        className={cx(
                          DRAWER_SMALL_PILL_CLASS,
                          "bg-blue-100/68 text-blue-700 ring-blue-200/70"
                        )}
                      >
                        Current
                      </span>
                    ) : null}

                    {inProgress ? (
                      <span
                        className={cx(
                          DRAWER_SMALL_PILL_CLASS,
                          "bg-amber-50/85 text-amber-700 ring-amber-200/75"
                        )}
                      >
                        In progress
                      </span>
                    ) : null}

                    {done ? (
                      <span
                        className={cx(
                          DRAWER_SMALL_PILL_CLASS,
                          "bg-emerald-50/75 text-emerald-700 ring-emerald-200/70"
                        )}
                      >
                        Done
                      </span>
                    ) : null}

                    {!active || activeAndDone ? (
                      <span
                        className={[
                          "shrink-0 text-[12px] font-semibold",
                          done
                            ? "text-slate-500"
                            : inProgress
                              ? "text-amber-700"
                              : "text-slate-700",
                        ].join(" ")}
                      >
                        {i + 1} of {total}
                        {!done && l.estMinutes ? ` • ${l.estMinutes}m` : ""}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-1.5 line-clamp-1 text-[13px] leading-5 font-medium text-slate-700 sm:line-clamp-2">
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
            <div className="inline-flex items-center gap-2 rounded-[var(--fs-radius-control)] bg-white/58 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/50 backdrop-blur">
              <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>Scroll for more</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
