// app/course/page.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import MenuDrawer from "@/components/MenuDrawer";
import PageIntro from "@/components/PageIntro";
import PressButton from "@/components/ui/PressButton";
import PressLink from "@/components/ui/PressLink";
import MobileSegmentedNav, {
  type MobileSegmentedNavItem,
} from "@/components/ui/MobileSegmentedNav";
import {
  MOBILE_NAV_BUTTON_BASE,
  getMobileNavSkinClass,
  type MobileNavSkin,
} from "@/components/ui/mobileNavTheme";
import { cx } from "@/components/ui/cx";
import { MAIN_MENU_ITEMS } from "@/components/navigation/mainMenuItems";

import {
  COURSE_MODULES,
  DEFAULT_LESSON_ID,
  findLesson,
  getNextPrevLessonIds,
  COURSE_LESSONS_FLAT,
  type CourseLesson,
} from "./courseData";

const STORAGE_KEY = "fs_course_last_lesson";
const OVERVIEW_STORAGE_KEY = "fs_course_overview_expanded";
const DONE_STORAGE_KEY = "fs_course_done_lessons";
const VIDEO_PROGRESS_STORAGE_KEY = "fs_course_video_progress";
const DEFAULT_PASS_CRITERIA = [
  "Complete 3 calm repetitions with the same cue.",
  "Breathing stays controlled without rushing.",
  "Body line stays stable from start to finish.",
];

type CourseNavButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  className?: string;
  skin?: MobileNavSkin;
  /** set false when you don't want flex-1 (desktop buttons) */
  grow?: boolean;
};

function CourseNavButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaExpanded,
  className,
  skin = "muted",
  grow = true,
}: CourseNavButtonProps) {
  return (
    <PressButton
      tier="nav"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      className={cx(
        MOBILE_NAV_BUTTON_BASE,
        grow && "flex-1",
        getMobileNavSkinClass(skin, disabled),
        className
      )}
    >
      {children}
    </PressButton>
  );
}

function CoursePageFallback() {
  return (
    <SiteChrome>
      <PageTemplate size="wide" showBack={false}>
        <div className="space-y-3" aria-label="Loading course content">
          <div className="h-16 rounded-2xl border border-slate-200/70 bg-white/80 animate-pulse" />
          <div className="h-20 rounded-2xl border border-slate-200/70 bg-white/80 animate-pulse" />
          <div className="aspect-video rounded-[20px] border border-slate-200/70 bg-slate-100/85 animate-pulse" />
          <div className="h-44 rounded-[22px] border border-slate-200/70 bg-white/80 animate-pulse" />
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}

export default function CoursePage() {
  return (
    <Suspense fallback={<CoursePageFallback />}>
      <CoursePageClient />
    </Suspense>
  );
}

function CoursePageClient() {
  type DrawerView = "main" | "course";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lessonParam = searchParams.get("lesson");
  const activeLesson = useMemo<CourseLesson>(() => findLesson(lessonParam), [lessonParam]);

  const { prevId, nextId } = useMemo(
    () => getNextPrevLessonIds(activeLesson.id),
    [activeLesson.id]
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>("course");
  const [closeDrawerOnLessonChange, setCloseDrawerOnLessonChange] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [commonMistakesExpanded, setCommonMistakesExpanded] = useState(false);
  const [doneLessonIds, setDoneLessonIds] = useState<string[]>([]);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [youtubeApiReady, setYoutubeApiReady] = useState(false);
  const [videoLoadState, setVideoLoadState] = useState<"idle" | "loading" | "loaded" | "failed">(
    "idle"
  );
  const videoFrameRef = useRef<HTMLDivElement | null>(null);
  const youtubePlayerRef = useRef<{
    destroy?: () => void;
    playVideo?: () => void;
    seekTo?: (seconds: number, allowSeekAhead?: boolean) => void;
    getCurrentTime?: () => number;
  } | null>(null);
  const playerReadyRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const videoStartedRef = useRef(false);
  const playerLessonIdRef = useRef<string | null>(null);
  const playbackProgressRef = useRef<Record<string, number>>({});
  const progressSaveTimerRef = useRef<number | null>(null);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [playbackProgressLoaded, setPlaybackProgressLoaded] = useState(false);

  const moduleInfo = useMemo(() => {
    const moduleIndex = COURSE_MODULES.findIndex((m) =>
      m.lessons.some((l) => l.id === activeLesson.id)
    );
    const mod = COURSE_MODULES[moduleIndex] ?? COURSE_MODULES[0];
    const lessonIndexInModule = mod.lessons.findIndex((l) => l.id === activeLesson.id);
    const lessonIndexGlobal = COURSE_LESSONS_FLAT.findIndex((l) => l.id === activeLesson.id);

    return {
      moduleIndex,
      moduleCount: COURSE_MODULES.length,
      module: mod,
      lessonIndexInModule,
      moduleLessonCount: mod.lessons.length,
      lessonIndexGlobal,
      totalLessons: COURSE_LESSONS_FLAT.length,
    };
  }, [activeLesson.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeLesson.id);
    } catch {}
  }, [activeLesson.id]);

  useEffect(() => {
    if (lessonParam) return;

    try {
      const last = localStorage.getItem(STORAGE_KEY);
      const next = last || DEFAULT_LESSON_ID;
      router.replace(`${pathname}?lesson=${encodeURIComponent(next)}`);
    } catch {
      router.replace(`${pathname}?lesson=${encodeURIComponent(DEFAULT_LESSON_ID)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(OVERVIEW_STORAGE_KEY);
      if (saved === null) return;
      setOverviewExpanded(saved === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DONE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setDoneLessonIds(parsed.filter((v): v is string => typeof v === "string"));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DONE_STORAGE_KEY, JSON.stringify(doneLessonIds));
    } catch {}
  }, [doneLessonIds]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VIDEO_PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const normalized: Record<string, number> = {};
          for (const [lessonId, value] of Object.entries(parsed)) {
            if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
              normalized[lessonId] = value;
            }
          }
          playbackProgressRef.current = normalized;
        }
      }
    } catch {}
    setPlaybackProgressLoaded(true);
  }, []);

  useEffect(() => {
    if (!playbackProgressLoaded) return;
    const savedSeconds = Math.floor(playbackProgressRef.current[activeLesson.id] ?? 0);
    setResumeAvailable(savedSeconds >= 2);
  }, [activeLesson.id, playbackProgressLoaded]);

  const persistPlaybackProgress = useCallback(() => {
    try {
      localStorage.setItem(VIDEO_PROGRESS_STORAGE_KEY, JSON.stringify(playbackProgressRef.current));
    } catch {}
  }, []);

  const stopProgressSaveTimer = useCallback(() => {
    if (progressSaveTimerRef.current == null) return;
    window.clearInterval(progressSaveTimerRef.current);
    progressSaveTimerRef.current = null;
  }, []);

  const savePlaybackPosition = useCallback((lessonId: string | null | undefined) => {
    if (!lessonId) return;
    const player = youtubePlayerRef.current;
    if (!player?.getCurrentTime) return;
    try {
      const seconds = player.getCurrentTime();
      if (!Number.isFinite(seconds) || seconds < 0) return;
      const normalizedSeconds = Math.floor(seconds);
      playbackProgressRef.current[lessonId] = normalizedSeconds;
      persistPlaybackProgress();
      if (lessonId === activeLesson.id) {
        setResumeAvailable(normalizedSeconds >= 2);
      }
    } catch {}
  }, [activeLesson.id, persistPlaybackProgress]);

  useEffect(() => {
    return () => {
      stopProgressSaveTimer();
    };
  }, [stopProgressSaveTimer]);

  const playerTopRef = useRef<HTMLDivElement | null>(null);

  function goToLesson(lessonId: string) {
    if (lessonId === activeLesson.id) {
      setDrawerOpen(false);
      setCloseDrawerOnLessonChange(false);
      return;
    }

    if (drawerOpen) {
      setCloseDrawerOnLessonChange(true);
    }

    router.push(`${pathname}?lesson=${encodeURIComponent(lessonId)}`);
    if (!drawerOpen) {
      const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";
      playerTopRef.current?.scrollIntoView({ behavior, block: "start" });
    }
  }

  function toggleDrawer(view: DrawerView) {
    if (drawerOpen && drawerView === view) {
      setDrawerOpen(false);
      return;
    }
    setDrawerView(view);
    setDrawerOpen(true);
  }

  function toggleOverview() {
    setOverviewExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(OVERVIEW_STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  function toggleCommonMistakes() {
    setCommonMistakesExpanded((prev) => !prev);
  }

  function toggleLessonDone() {
    setDoneLessonIds((prev) => {
      if (prev.includes(activeLesson.id)) {
        return prev.filter((id) => id !== activeLesson.id);
      }
      return [...prev, activeLesson.id];
    });
  }

  const isFirstLesson = !prevId;
  const isLastLesson = !nextId;
  const isMainDrawerOpen = drawerOpen && drawerView === "main";
  const isCourseDrawerOpen = drawerOpen && drawerView === "course";

  const youtubeWatchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${activeLesson.youtubeId}`,
    [activeLesson.youtubeId]
  );

  const overviewLabel = useMemo(() => {
    const modNum = moduleInfo.moduleIndex >= 0 ? moduleInfo.moduleIndex + 1 : 1;
    const lessonInMod =
      moduleInfo.lessonIndexInModule >= 0 ? moduleInfo.lessonIndexInModule + 1 : 1;
    const lessonGlobal = moduleInfo.lessonIndexGlobal >= 0 ? moduleInfo.lessonIndexGlobal + 1 : 1;

    return {
      module: `Module ${modNum} of ${moduleInfo.moduleCount}`,
      lesson: `Lesson ${lessonInMod} of ${moduleInfo.moduleLessonCount}`,
      course: `${lessonGlobal} of ${moduleInfo.totalLessons} total`,
      moduleName: moduleInfo.module?.title ?? "Course",
      duration: activeLesson.estMinutes ? `${activeLesson.estMinutes} min` : null,
    };
  }, [moduleInfo, activeLesson.estMinutes]);

  const doneLessonIdSet = useMemo(() => new Set(doneLessonIds), [doneLessonIds]);
  const doneLessonsCount = useMemo(
    () => COURSE_LESSONS_FLAT.filter((lesson) => doneLessonIdSet.has(lesson.id)).length,
    [doneLessonIdSet]
  );
  const totalLessons = Math.max(1, moduleInfo.totalLessons);
  const donePct = useMemo(() => {
    return Math.min(100, Math.round((doneLessonsCount / totalLessons) * 100));
  }, [doneLessonsCount, totalLessons]);
  const currentLessonIndex = moduleInfo.lessonIndexGlobal >= 0 ? moduleInfo.lessonIndexGlobal : 0;
  const nextLesson = useMemo(() => {
    if (!nextId) return null;
    return COURSE_LESSONS_FLAT.find((lesson) => lesson.id === nextId) ?? null;
  }, [nextId]);
  const isLessonDone = doneLessonIds.includes(activeLesson.id);
  const lessonType = activeLesson.lessonType ?? "drill";
  const showPassCriteria = lessonType === "drill" || lessonType === "swim";
  const passCriteria = activeLesson.passCriteria?.length
    ? activeLesson.passCriteria
    : DEFAULT_PASS_CRITERIA;
  const showVideoOverlay = !videoStarted || videoPaused;
  const showResumeState = videoStarted && videoPaused;
  const showResumeCta = showResumeState || (!videoStarted && resumeAvailable);

  const supportCardClass =
    "rounded-2xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.92))] shadow-[0_10px_24px_rgba(15,23,42,0.065)]";

  useEffect(() => {
    setCommonMistakesExpanded(false);
  }, [activeLesson.id]);

  useEffect(() => {
    videoStartedRef.current = videoStarted;
  }, [videoStarted]);

  useEffect(() => {
    const w = window as unknown as {
      YT?: { Player?: unknown };
      onYouTubeIframeAPIReady?: (() => void) | undefined;
    };

    if (w.YT?.Player) {
      setYoutubeApiReady(true);
      return;
    }

    const prevReady = w.onYouTubeIframeAPIReady;
    const onApiReady = () => {
      prevReady?.();
      setYoutubeApiReady(true);
    };
    w.onYouTubeIframeAPIReady = onApiReady;

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      if (w.onYouTubeIframeAPIReady === onApiReady) {
        w.onYouTubeIframeAPIReady = prevReady;
      }
    };
  }, []);

  useEffect(() => {
    savePlaybackPosition(playerLessonIdRef.current);
    stopProgressSaveTimer();
    setVideoStarted(false);
    setVideoPaused(false);
    setVideoLoadState("idle");
    videoStartedRef.current = false;
    playerReadyRef.current = false;
    pendingPlayRef.current = false;
    if (youtubePlayerRef.current?.destroy) {
      try {
        youtubePlayerRef.current.destroy();
      } catch {}
      youtubePlayerRef.current = null;
    }
    playerLessonIdRef.current = null;
  }, [activeLesson.id, savePlaybackPosition, stopProgressSaveTimer]);

  useEffect(() => {
    if (videoLoadState !== "loading") return;
    const timeout = window.setTimeout(() => {
      setVideoLoadState((prev) => {
        if (prev === "loading") {
          setVideoPaused(true);
          return "failed";
        }
        return prev;
      });
    }, 7000);
    return () => window.clearTimeout(timeout);
  }, [videoLoadState, activeLesson.id]);

  const tryStartPlayback = useCallback((restoreFromSaved = false) => {
    const player = youtubePlayerRef.current as
      | { playVideo?: () => void; seekTo?: (seconds: number, allowSeekAhead?: boolean) => void }
      | null;
    if (!player) return;
    if (restoreFromSaved) {
      const savedSeconds = Math.floor(playbackProgressRef.current[activeLesson.id] ?? 0);
      if (savedSeconds >= 2) {
        try {
          player.seekTo?.(savedSeconds, true);
        } catch {}
      }
    }
    try {
      player.playVideo?.();
    } catch {}
  }, [activeLesson.id]);

  function startVideoPlayback() {
    setVideoStarted(true);
    videoStartedRef.current = true;
    setVideoPaused(false);
    setVideoLoadState("loading");
    pendingPlayRef.current = true;
    if (playerReadyRef.current) {
      pendingPlayRef.current = false;
      tryStartPlayback(true);
    }
  }

  function resumePlayback() {
    setVideoPaused(false);
    setVideoLoadState("loading");
    pendingPlayRef.current = false;
    tryStartPlayback(false);
  }

  useEffect(() => {
    if (!youtubeApiReady || !videoFrameRef.current) return;
    const lessonIdForPlayer = activeLesson.id;

    const w = window as unknown as {
      YT?: {
        Player: new (
          el: HTMLElement,
          options: {
            videoId: string;
            playerVars?: Record<string, string | number>;
            events?: {
              onReady?: (e: { target?: { playVideo?: () => void } }) => void;
              onError?: () => void;
              onStateChange?: (e: { data: number }) => void;
            };
          }
        ) => { destroy?: () => void; playVideo?: () => void };
        PlayerState?: {
          ENDED: number;
          PLAYING: number;
          PAUSED: number;
          BUFFERING: number;
          CUED: number;
        };
      };
    };

    if (!w.YT?.Player) return;

    if (youtubePlayerRef.current?.destroy) {
      savePlaybackPosition(playerLessonIdRef.current);
      stopProgressSaveTimer();
      try {
        youtubePlayerRef.current.destroy();
      } catch {}
      youtubePlayerRef.current = null;
    }
    playerLessonIdRef.current = lessonIdForPlayer;

    const player = new w.YT.Player(videoFrameRef.current, {
      videoId: activeLesson.youtubeId,
      playerVars: {
        autoplay: 0,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          playerReadyRef.current = true;
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            tryStartPlayback(true);
          }
        },
        onError: () => {
          stopProgressSaveTimer();
          setVideoLoadState("failed");
          setVideoPaused(true);
        },
        onStateChange: (event) => {
          const state = event.data;
          const ps = w.YT?.PlayerState;
          if (!ps) return;
          if (state === ps.PAUSED || state === ps.ENDED || state === ps.CUED) {
            stopProgressSaveTimer();
            if (state === ps.PAUSED || state === ps.CUED) {
              savePlaybackPosition(lessonIdForPlayer);
            } else if (state === ps.ENDED) {
              playbackProgressRef.current[lessonIdForPlayer] = 0;
              persistPlaybackProgress();
              if (lessonIdForPlayer === activeLesson.id) {
                setResumeAvailable(false);
              }
            }
            setVideoPaused(true);
            if (state !== ps.ENDED) {
              setVideoLoadState("loaded");
            }
          } else if (state === ps.PLAYING) {
            if (progressSaveTimerRef.current == null) {
              progressSaveTimerRef.current = window.setInterval(() => {
                savePlaybackPosition(lessonIdForPlayer);
              }, 2000);
            }
            setVideoLoadState("loaded");
            setVideoPaused(false);
          } else if (state === ps.BUFFERING) {
            setVideoLoadState("loading");
            setVideoPaused(false);
          }
        },
      },
    });

    youtubePlayerRef.current = player;

    return () => {
      savePlaybackPosition(lessonIdForPlayer);
      stopProgressSaveTimer();
      if (player.destroy) {
        try {
          player.destroy();
        } catch {}
      }
      playerReadyRef.current = false;
      pendingPlayRef.current = false;
      if (youtubePlayerRef.current === player) {
        youtubePlayerRef.current = null;
      }
      if (playerLessonIdRef.current === lessonIdForPlayer) {
        playerLessonIdRef.current = null;
      }
    };
  }, [
    youtubeApiReady,
    activeLesson.id,
    activeLesson.youtubeId,
    persistPlaybackProgress,
    savePlaybackPosition,
    stopProgressSaveTimer,
    tryStartPlayback,
  ]);

  useEffect(() => {
    if (!closeDrawerOnLessonChange) return;
    setDrawerOpen(false);
    setCloseDrawerOnLessonChange(false);

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";
    playerTopRef.current?.scrollIntoView({ behavior, block: "start" });
  }, [closeDrawerOnLessonChange, activeLesson.id]);

  const bottomNavItems: MobileSegmentedNavItem[] = [];

  if (isFirstLesson) {
    bottomNavItems.push({
      id: "course-menu",
      kind: "button",
      label: isMainDrawerOpen ? "Close" : "Menu",
      testId: "course-nav-left",
      onClick: () => toggleDrawer("main"),
      skin: isMainDrawerOpen ? "neutral" : "muted",
      ariaPressed: isMainDrawerOpen,
      ariaLabel: isMainDrawerOpen ? "Close main menu" : "Open main menu",
    });
  } else {
    bottomNavItems.push({
      id: "course-prev",
      kind: "button",
      label: "Prev",
      testId: "course-nav-left",
      onClick: () => prevId && goToLesson(prevId),
      skin: "muted",
    });
  }

  bottomNavItems.push({
    id: "course-lessons",
    kind: "button",
    label: isCourseDrawerOpen ? "Close" : "Lessons",
    testId: "course-nav-lessons",
    onClick: () => toggleDrawer("course"),
    skin: "neutral",
    ariaExpanded: isCourseDrawerOpen,
    ariaPressed: isCourseDrawerOpen,
    ariaLabel: isCourseDrawerOpen ? "Close lessons menu" : "Open lessons menu",
  });

  if (isLastLesson) {
    bottomNavItems.push({
      id: "course-programs",
      kind: "link",
      href: "/programs",
      label: "Programs",
      testId: "course-nav-right",
      skin: "primary",
    });
  } else {
    bottomNavItems.push({
      id: "course-next",
      kind: "button",
      label: "Next",
      testId: "course-nav-right",
      onClick: () => nextId && goToLesson(nextId),
      skin: "primary",
    });
  }

  const bottomBar = (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] sm:hidden">
      <div className="mx-auto max-w-[520px]">
        <MobileSegmentedNav items={bottomNavItems} />
      </div>
    </div>
  );

  return (
    <SiteChrome
      menu={{
        mode: "custom",
        isOpen: drawerOpen,
        onOpen: () => {
          setDrawerView("course");
          setDrawerOpen(true);
        },
        onClose: () => setDrawerOpen(false),
        ariaLabel: "Toggle lessons",
      }}
      bottomBar={bottomBar}
    >
      <PageTemplate size="wide" showBack={false}>
        <div ref={playerTopRef} />

        <PageIntro
          title="Free Course"
          subtitle="Learn. Drill. Swim."
          variant="compact"
          belowDivider={
            <div className="flex items-baseline gap-1 text-[12px] font-medium sm:text-[13px]">
              <span className="shrink-0 text-slate-500">Current lesson:</span>
              <span className="min-w-0 truncate text-slate-800">{activeLesson.title}</span>
            </div>
          }
          rightSlot={
            <CourseNavButton
              grow={false}
              skin="neutral"
              onClick={() => toggleDrawer("course")}
              className="hidden sm:inline-flex"
              ariaLabel={isCourseDrawerOpen ? "Close lessons" : "Open lessons"}
            >
              {isCourseDrawerOpen ? "Close" : "Lessons"}
            </CourseNavButton>
          }
        />

        <section className="mt-2 rounded-[20px] border border-slate-200/60 bg-white/88 p-3 shadow-[0_5px_14px_rgba(15,23,42,0.045)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold text-slate-900">
                  <span>{overviewLabel.lesson}</span>
                  <span className="text-slate-300">•</span>
                  <span>{overviewLabel.module}</span>
                </div>
                <PressButton
                  tier="nav"
                  onClick={toggleLessonDone}
                  aria-pressed={isLessonDone}
                  className={cx(
                    "inline-flex min-h-[30px] shrink-0 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1",
                    isLessonDone
                      ? "bg-blue-50 text-blue-700 ring-blue-100/80"
                      : "bg-white/92 text-slate-700 ring-slate-200/72"
                  )}
                >
                  {isLessonDone ? "Done" : "Mark as done"}
                </PressButton>
              </div>
              {overviewExpanded ? (
                <div className="mt-1 text-[13px] font-medium text-slate-700">
                  {overviewLabel.moduleName}
                  {overviewLabel.duration ? ` • ${overviewLabel.duration}` : ""}
                </div>
              ) : null}
            </div>

            <div className="hidden gap-2 sm:flex sm:pt-1">
              {isFirstLesson ? (
                <CourseNavButton
                  grow={false}
                  onClick={() => toggleDrawer("main")}
                  skin={isMainDrawerOpen ? "neutral" : "muted"}
                  className="px-4 py-2"
                  ariaLabel={isMainDrawerOpen ? "Close main menu" : "Open main menu"}
                >
                  {isMainDrawerOpen ? "Close" : "Menu"}
                </CourseNavButton>
              ) : (
                <CourseNavButton
                  grow={false}
                  onClick={() => prevId && goToLesson(prevId)}
                  skin="muted"
                  className="px-4 py-2"
                >
                  Prev
                </CourseNavButton>
              )}

              {isLastLesson ? (
                <CourseNavButton
                  grow={false}
                  onClick={() => router.push("/programs")}
                  skin="primary"
                  className="px-4 py-2"
                >
                  Programs
                </CourseNavButton>
              ) : (
                <CourseNavButton
                  grow={false}
                  onClick={() => nextId && goToLesson(nextId)}
                  skin="primary"
                  className="px-4 py-2"
                >
                  Next
                </CourseNavButton>
              )}

              <PressButton
                tier="nav"
                onClick={toggleOverview}
                aria-expanded={overviewExpanded}
                aria-controls="course-overview-details"
                className="inline-flex min-h-[42px] items-center justify-center rounded-2xl bg-white/92 px-3 py-2 text-[13px] font-semibold text-slate-800 ring-1 ring-slate-200/70"
              >
                {overviewExpanded ? "Hide details" : "Overview details"}
              </PressButton>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div
              className="overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/75 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] flex-1"
              role="progressbar"
              aria-label="Course progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={donePct}
              aria-valuetext={`${doneLessonsCount} of ${totalLessons} lessons marked done (${donePct}%). Current: ${overviewLabel.lesson}.`}
            >
              <div className="flex h-[10px] w-full overflow-hidden rounded-full bg-slate-200/95">
                {COURSE_LESSONS_FLAT.map((lesson, index) => {
                  const isCurrentSegment = index === currentLessonIndex;
                  const isDoneSegment = doneLessonIdSet.has(lesson.id);
                  const isFirstSegment = index === 0;
                  const isLastSegment = index === totalLessons - 1;

                  return (
                    <span
                      key={lesson.id}
                      aria-hidden
                      className={cx(
                        "h-full min-w-0 flex-1 transition-colors duration-200",
                        !isLastSegment && "border-r border-slate-100/70",
                        isFirstSegment && "rounded-l-full",
                        isLastSegment && "rounded-r-full",
                        isCurrentSegment
                          ? "bg-white shadow-[inset_0_0_0_1px_rgba(147,197,253,0.95)]"
                          : isDoneSegment
                            ? "bg-blue-500"
                            : "bg-slate-300/78"
                      )}
                    />
                  );
                })}
              </div>
            </div>
            <div className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200/75">
              {donePct}%
            </div>
          </div>

          <div className="mt-2 sm:hidden">
            <PressButton
              tier="nav"
              onClick={toggleOverview}
              aria-expanded={overviewExpanded}
              aria-controls="course-overview-details"
              className="inline-flex min-h-[42px] w-full items-center justify-center rounded-2xl bg-white/90 px-3 py-2 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200/65"
            >
              {overviewExpanded ? "Hide details" : "Overview details"}
            </PressButton>
          </div>

          {overviewExpanded ? (
            <div
              id="course-overview-details"
              className="mt-2 rounded-2xl border border-slate-200/68 bg-white/78 p-3"
            >
              <div className="min-w-0">
                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Additional information
                </div>
              </div>
              <div className="mt-1 text-[12px] font-medium text-slate-600">
                {isLastLesson
                  ? "Last lesson in this course."
                  : "Use Lessons to jump to any module or lesson."}
                <span className="ml-2 text-slate-500">
                  Lesson and playback progress saved on this device.
                </span>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-3 rounded-[24px] border border-slate-200/72 bg-white/96 p-3 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden rounded-[20px] ring-1 ring-slate-200/75 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="aspect-video w-full bg-slate-950">
              <div ref={videoFrameRef} className="h-full w-full" />
            </div>

            {showVideoOverlay ? (
              <PressButton
                tier="card"
                onClick={videoStarted ? resumePlayback : startVideoPlayback}
                className="absolute inset-0 z-[2] w-full overflow-hidden bg-[radial-gradient(140%_115%_at_6%_0%,rgba(147,197,253,0.24),rgba(241,245,249,0.96)),linear-gradient(180deg,rgba(241,245,249,0.98),rgba(255,255,255,0.99))] p-4 text-left sm:p-5"
                aria-label={
                  showResumeCta
                    ? `Resume lesson: ${activeLesson.title}`
                    : `Play lesson: ${activeLesson.title}`
                }
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(59,130,246,0.06),rgba(255,255,255,0))]" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900/16 via-slate-900/5 to-transparent" />
                <div className="relative flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="relative h-8 w-8 shrink-0">
                        <Image
                          src="/logos/01_icon_transparent.png"
                          alt=""
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </span>
                      <span className="truncate rounded-full bg-white/82 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 ring-1 ring-slate-200/70">
                        {overviewLabel.moduleName}
                      </span>
                    </span>
                    {overviewLabel.duration ? (
                      <span className="shrink-0 rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200/75">
                        {overviewLabel.duration}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-auto pb-4 text-center sm:pb-5">
                    <div className="mx-auto line-clamp-2 max-w-[26ch] text-[18px] font-semibold leading-tight text-slate-900 sm:text-[20px]">
                      {activeLesson.title}
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                      <span
                        className={cx(
                          "inline-flex min-h-[38px] w-full max-w-[250px] items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/20 shadow-[0_12px_28px_rgba(37,99,235,0.24)] transition-colors duration-200 sm:min-h-[40px] sm:text-[14px]",
                          showResumeCta
                              ? "bg-gradient-to-b from-blue-400 to-blue-500"
                              : "bg-gradient-to-b from-blue-500 to-blue-600"
                        )}
                      >
                        {showResumeState ? (
                          <span
                            aria-hidden
                            className="inline-flex h-3.5 w-3 items-center justify-between"
                          >
                            <span className="h-full w-[2px] rounded-sm bg-white" />
                            <span className="h-full w-[2px] rounded-sm bg-white" />
                          </span>
                        ) : (
                          <span
                            aria-hidden
                            className="ml-0.5 h-0 w-0 border-y-[7px] border-y-transparent border-l-[11px] border-l-white"
                          />
                        )}
                        {showResumeCta ? "Resume" : "Play"}
                      </span>
                    </div>
                  </div>
                </div>
              </PressButton>
            ) : null}
          </div>

          {videoStarted && !videoPaused ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[12px] font-medium text-slate-700">
              <div className="min-w-0">
                {nextLesson ? (
                  <>
                    Up next: <span className="font-semibold text-slate-800">{nextLesson.title}</span>
                  </>
                ) : (
                  <span className="font-semibold text-slate-800">Last lesson in this course</span>
                )}
              </div>
            </div>
          ) : null}

          {videoLoadState === "failed" ? (
            <div className="mt-2 rounded-2xl border border-slate-200/70 bg-white/82 px-3 py-2 text-[12px] font-medium text-slate-600">
              Video did not load.{" "}
              <PressLink
                tier="nav"
                href={youtubeWatchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-800 underline"
                aria-label="Open video on YouTube"
              >
                Open on YouTube
              </PressLink>
            </div>
          ) : null}

        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.90))] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.075)] lg:col-span-2">
            <h2 className="text-[16px] font-semibold tracking-wide text-slate-900">Goal</h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">{activeLesson.goal}</p>

            <div className="mt-5">
              <h3 className="text-[16px] font-semibold tracking-wide text-slate-900">
                Cues (pick one)
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-7 text-slate-700">
                {activeLesson.cues.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="mt-2 text-[12px] font-medium text-slate-500">
                Keep it simple: choose one cue per session.
              </p>
            </div>

            {activeLesson.commonMistakes?.length ? (
              <div className="mt-5 rounded-2xl border border-slate-200/72 bg-white/72 p-3">
                <PressButton
                  tier="nav"
                  onClick={toggleCommonMistakes}
                  aria-expanded={commonMistakesExpanded}
                  aria-controls="common-mistakes-list"
                  className="inline-flex min-h-[40px] w-full items-center justify-between rounded-xl bg-white/85 px-3 py-2 text-left text-[14px] font-semibold text-slate-900 ring-1 ring-slate-200/70"
                >
                  <span>Common mistakes</span>
                  <span className="text-[12px] text-slate-600">
                    {commonMistakesExpanded ? "Hide" : "Show"}
                  </span>
                </PressButton>

                {commonMistakesExpanded ? (
                  <ul
                    id="common-mistakes-list"
                    className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-7 text-slate-700"
                  >
                    {activeLesson.commonMistakes.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-slate-600">
                    Expand to review common errors for this lesson.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-slate-200/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.92))] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.065)]">
            <div className="inline-flex rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200/72">
              Drill
            </div>

            <h2 className="mt-3 text-[18px] font-semibold text-slate-900">
              {activeLesson.drill.title}
            </h2>

            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-7 text-slate-800">
              {activeLesson.drill.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            <div className={cx("mt-5 p-4", supportCardClass)}>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                {showPassCriteria ? "Pass criteria" : "Next step"}
              </div>
              {showPassCriteria ? (
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] leading-6 text-slate-800">
                  {passCriteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-1 text-[14px] leading-6 text-slate-800">{activeLesson.nextStep}</div>
              )}
              {showPassCriteria ? (
                <p className="mt-2 border-t border-slate-200/72 pt-2 text-[12px] font-medium leading-5 text-slate-500">
                  When these are met, mark lesson as done in overview.
                </p>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/68 bg-white/80 p-4">
              <h3 className="text-[14px] font-semibold tracking-wide text-slate-900">
                Need extra help?
              </h3>
              <p className="mt-1 text-[12px] leading-5 text-slate-600">
                If this doesn&apos;t click after 2-3 sessions, your #1 limiter may be elsewhere.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <PressLink
                  tier="cta"
                  href="/analysis"
                  className="flex items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-3 text-[14px] font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)]"
                >
                  Video Analysis (Optional)
                </PressLink>
                <PressLink
                  tier="nav"
                  href="/programs"
                  className="flex items-center justify-center rounded-2xl bg-white/92 px-4 py-3 text-[14px] font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/70"
                >
                  Poolside Guide
                </PressLink>
              </div>
            </div>

          </div>
        </section>

        <div className="h-6 sm:hidden" aria-hidden />

        <MenuDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          defaultView={drawerView}
          mainItems={MAIN_MENU_ITEMS}
          course={{
            activeLessonId: activeLesson.id,
            onSelectLesson: goToLesson,
            doneLessonIds,
          }}
          titleMain="Main menu"
          titleCourse="Course menu"
        />
      </PageTemplate>
    </SiteChrome>
  );
}
