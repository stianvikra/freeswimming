// app/course/page.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import MenuDrawer from "@/components/MenuDrawer";
import PageIntro from "@/components/PageIntro";
import BrandImage from "@/components/brand/BrandImage";
import CourseProgressSyncStatus from "@/components/course/CourseProgressSyncStatus";
import CourseOpenOnPhoneCard from "@/components/course/CourseOpenOnPhoneCard";
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
import { getMainMenuItems } from "@/components/navigation/mainMenuItems";
import { useInstallContext } from "@/components/install/install-context";
import InstallFeedback, { type InstallFeedbackMessage } from "@/components/install/InstallFeedback";
import { BRAND_USAGE } from "@/lib/brand";
import {
  A2HS_AUTO_PROMPT_DELAY_MS,
  A2HS_DISMISSED_AT_KEY,
  A2HS_PROMPT_SEEN_KEY,
  parseStoredTimestamp,
  shouldShowAutoInstallPrompt,
} from "@/components/install/install-rules";
import {
  areCourseProgressRowsEqual,
  buildCourseProgressRowsFromLocal,
  buildLocalCourseProgressFromRows,
  mergeCourseProgressRows,
  normalizeCourseProgressRows,
  normalizeDoneLessonIds,
  resolveCourseDirtyLessonIdsAfterHydrate,
  normalizeDoneConfirmationRecord,
  normalizeVideoProgressRecord,
  type CourseProgressRow,
} from "@/lib/course/progress";
import {
  getCourseProgressStorageKeys,
  parseCoursePreviewMode,
  type CoursePreviewMode,
} from "@/lib/course/preview";
import {
  buildCanonicalCourseLessonIdMap,
  canonicalizeCourseLessonRuntimeId,
} from "@/lib/course/runtime-identity";
import {
  buildCourseLessonProgressStatusMap,
  normalizeCourseLessonCriteriaChecks,
  normalizeCourseLessonCriteriaCheckRecord,
} from "@/lib/course/progress-status";
import {
  buildCourseLessonExperienceViewModel,
  type CourseLessonExperienceViewPractice,
} from "@/lib/course/lesson-experience";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

import {
  COURSE_MODULES,
  DEFAULT_LESSON_ID,
  COURSE_LESSONS_FLAT,
  type CourseSupportActionId,
  type CourseModule,
  type CourseLesson,
} from "./courseData";
import styles from "./coursePlayerPolish.module.css";

const AdminContextNotesPanel = dynamic(() => import("@/components/admin/AdminContextNotesPanel"), {
  loading: () => null,
});

const OVERVIEW_STORAGE_KEY = "fs_course_overview_expanded";
const COMMON_MISTAKES_STORAGE_KEY_PREFIX = "fs_course_common_mistakes_expanded:";
const SWIPE_NUX_STORAGE_KEY = "fs_course_swipe_nux_seen";
const SWIPE_ZONE_INSET_PX = 12;
const SWIPE_SIDE_ZONE_RATIO = 0.31;
const SWIPE_SIDE_ZONE_MIN_PX = 92;
const SWIPE_SIDE_ZONE_MAX_PX = 170;
const SWIPE_DISTANCE_TO_NAVIGATE_PX = 78;
const SWIPE_VERTICAL_CANCEL_PX = 24;
const SWIPE_HINT_REVEAL_PX = 18;
const A2HS_AUTO_PROMPT_ENABLED = process.env.NEXT_PUBLIC_FS_A2HS_AUTO_PROMPT_ENABLED !== "0";
const COURSE_PROGRESS_SYNC_API_PATH = "/api/progress/course";
const COURSE_PROGRESS_SYNC_INTERVAL_MS = 10_000;
const BACKUP_PROMPT_DISMISSED_AT_KEY = "fs_course_backup_prompt_dismissed_at";
const BACKUP_PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const BACKUP_PROMPT_MIN_DONE_LESSONS = 3;
const SUPPORT_ACTION_ORDER: CourseSupportActionId[] = [
  "videoAnalysis",
  "poolsideGuide",
  "guide0To1000",
  "contact",
];
const SUPPORT_ACTION_META: Record<
  CourseSupportActionId,
  {
    label: string;
    href: string;
  }
> = {
  videoAnalysis: {
    label: "Video Analysis (Optional)",
    href: "/analysis",
  },
  poolsideGuide: {
    label: "Poolside Guide",
    href: "/plans?focus=poolside",
  },
  guide0To1000: {
    label: "0-1000 Guide",
    href: "/plans?focus=0-1000m",
  },
  contact: {
    label: "Contact us",
    href: "/contact",
  },
};
const COURSE_SUPPORT_HELP_CARD_CLASS = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const COURSE_SUPPORT_ACTION_BASE_CLASS =
  "inline-flex min-h-11 w-full items-center justify-center px-4 py-3 text-center text-[14px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const COURSE_SUPPORT_PRIMARY_ACTION_CLASS = cx("fs-cta-primary", COURSE_SUPPORT_ACTION_BASE_CLASS);
const COURSE_SUPPORT_SECONDARY_ACTION_CLASS = cx(
  "fs-cta-secondary hover:bg-white",
  COURSE_SUPPORT_ACTION_BASE_CLASS
);
const COURSE_INSTALL_PROMPT_CARD_CLASS =
  "fs-library-card mx-auto max-w-[520px] !bg-white/95 p-4 !shadow-[0_16px_46px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-5";
const COURSE_INSTALL_PROMPT_ACTION_BASE_CLASS =
  "inline-flex min-h-11 items-center justify-center px-4 py-2 text-[14px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const COURSE_INSTALL_PROMPT_PRIMARY_ACTION_CLASS = cx(
  "fs-cta-primary",
  COURSE_INSTALL_PROMPT_ACTION_BASE_CLASS
);
const COURSE_INSTALL_PROMPT_SECONDARY_ACTION_CLASS = cx(
  "fs-cta-secondary hover:bg-white",
  COURSE_INSTALL_PROMPT_ACTION_BASE_CLASS
);
const COURSE_INSTALL_PROMPT_FEEDBACK_PANEL_CLASS = "!rounded-[var(--fs-radius-card)] bg-white/86";
const FALLBACK_LESSON: CourseLesson = COURSE_LESSONS_FLAT[0] ?? {
  id: DEFAULT_LESSON_ID,
  title: "Freestyle lesson",
  youtubeId: "Xh6OblO06LY",
  goal: "Start your freestyle progression here.",
  cues: ["Swim easy and stay relaxed."],
  drill: {
    title: "Technique warm-up",
    steps: ["Swim easy and keep your body line calm and controlled."],
  },
  nextStep: "Continue to the next lesson.",
};

const PREVIEW_MODE_COPY: Record<CoursePreviewMode, string> = {
  published: "Published only",
  review: "Review only",
  draft: "Draft only",
  all: "All statuses",
};

type SwipeDirection = "prev" | "next";

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

type CoursePracticeMediaFrameProps = {
  practice: CourseLessonExperienceViewPractice;
  tone: "land" | "water";
};

function CoursePracticeMediaFrame({ practice, tone }: CoursePracticeMediaFrameProps) {
  const image = practice.image;
  const imageSrc = image?.src;
  const fallbackLabel = tone === "land" ? "Land practice visual" : "Water practice visual";
  const toneClass =
    tone === "land"
      ? "from-slate-100 via-white to-blue-50/70 text-slate-700"
      : "from-blue-50 via-white to-cyan-50 text-blue-800";

  return (
    <div className="space-y-2">
      <div
        data-testid={`course-practice-${tone}-media`}
        className={cx(
          "relative aspect-[4/3] min-h-[190px] overflow-hidden rounded-[20px] border border-slate-200/74 bg-gradient-to-br ring-1 ring-white/80",
          toneClass
        )}
        aria-label={imageSrc ? undefined : `${fallbackLabel} not available`}
        role={imageSrc ? undefined : "img"}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={image?.alt ?? `${practice.title} visual`}
            fill
            unoptimized
            loading={tone === "land" ? "eager" : "lazy"}
            sizes="(max-width: 640px) 86vw, (max-width: 1024px) 34vw, 300px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              {fallbackLabel}
            </span>
            <span className="text-[15px] font-semibold text-slate-800">Visual not added yet</span>
          </div>
        )}
      </div>
      {image?.caption ? (
        <p className="text-[12px] leading-5 font-medium text-slate-500">{image.caption}</p>
      ) : null}
    </div>
  );
}

type CoursePracticeStepsProps = {
  steps: string[];
  tone: "land" | "water";
};

function CoursePracticeSteps({ steps, tone }: CoursePracticeStepsProps) {
  const stepClass =
    tone === "land"
      ? "border-slate-200/72 bg-slate-50/76 text-slate-800"
      : "border-blue-100/80 bg-blue-50/58 text-slate-800";
  const markerClass = tone === "land" ? "bg-slate-900 text-white" : "bg-blue-600 text-white";

  return (
    <ol className="mt-4 space-y-2 text-[14px] leading-6">
      {steps.map((step, index) => (
        <li
          key={step}
          className={cx(
            "grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3 rounded-2xl border px-3 py-2.5",
            stepClass
          )}
        >
          <span
            aria-hidden="true"
            className={cx(
              "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold",
              markerClass
            )}
          >
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

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
          <div className="h-16 animate-pulse rounded-2xl border border-slate-200/70 bg-white/80" />
          <div className="h-20 animate-pulse rounded-2xl border border-slate-200/70 bg-white/80" />
          <div className="aspect-video animate-pulse rounded-[20px] border border-slate-200/70 bg-slate-100/85" />
          <div className="h-44 animate-pulse rounded-[22px] border border-slate-200/70 bg-white/80" />
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}

function isSwipeBlockedTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'a,button,input,textarea,select,label,[role="button"],[role="link"],iframe,[contenteditable="true"],[data-no-swipe]'
    )
  );
}

function formatSyncStatusAgeLabel(timestampMs: number | null): string {
  if (!timestampMs) return "Signed in. Progress sync is active.";
  const ageMs = Math.max(0, Date.now() - timestampMs);
  if (ageMs < 15_000) return "Synced to your account just now.";

  const ageMinutes = Math.floor(ageMs / 60_000);
  if (ageMinutes < 1) return "Synced to your account less than a minute ago.";
  if (ageMinutes === 1) return "Synced to your account 1 minute ago.";
  if (ageMinutes < 60) return `Synced to your account ${ageMinutes} minutes ago.`;

  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours === 1) return "Synced to your account 1 hour ago.";
  return `Synced to your account ${ageHours} hours ago.`;
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
  const install = useInstallContext();

  const lessonParam = searchParams?.get("lesson") ?? null;
  const previewEnabled = searchParams?.get("preview") === "1";
  const previewModeParam = searchParams?.get("previewMode") ?? null;
  const parsedPreviewMode = parseCoursePreviewMode(previewModeParam);
  const previewMode = parsedPreviewMode ?? "published";
  const previewType = searchParams?.get("previewType") ?? null;
  const previewRefRaw = searchParams?.get("previewRef") ?? null;
  const previewRef = previewRefRaw?.trim() ?? "";
  const previewStorageKeys = useMemo(
    () =>
      getCourseProgressStorageKeys({
        previewEnabled,
        previewMode,
      }),
    [previewEnabled, previewMode]
  );
  const courseProgressSyncEnabled = !previewEnabled;
  const previewContextLabel = useMemo(() => {
    if (!previewEnabled) return null;
    if (previewType === "module") {
      return previewRef ? `Module: ${previewRef}` : "Module preview";
    }
    if (previewType === "lesson") {
      return previewRef ? `Lesson: ${previewRef}` : "Lesson preview";
    }
    return previewRef ? `Context: ${previewRef}` : null;
  }, [previewEnabled, previewRef, previewType]);

  const [courseModules, setCourseModules] = useState<CourseModule[]>(COURSE_MODULES);
  const [courseContentLoadState, setCourseContentLoadState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [courseContentError, setCourseContentError] = useState<string | null>(null);
  const courseLessonsFlat = useMemo(
    () => courseModules.flatMap((module) => module.lessons),
    [courseModules]
  );
  const courseLessonById = useMemo(
    () => new Map(courseLessonsFlat.map((lesson) => [lesson.id, lesson])),
    [courseLessonsFlat]
  );
  const canonicalLessonIdByAlias = useMemo(
    () => buildCanonicalCourseLessonIdMap(courseModules),
    [courseModules]
  );
  const resolveCanonicalLessonId = useCallback(
    (lessonId: string) => canonicalizeCourseLessonRuntimeId(lessonId, canonicalLessonIdByAlias),
    [canonicalLessonIdByAlias]
  );
  const canonicalLessonParam = useMemo(
    () => (lessonParam ? resolveCanonicalLessonId(lessonParam) : null),
    [lessonParam, resolveCanonicalLessonId]
  );
  const requestedLessonId = canonicalLessonParam ?? lessonParam;
  const defaultLessonId = courseLessonsFlat[0]?.id ?? DEFAULT_LESSON_ID;
  const hasResolvedRequestedLesson = useMemo(
    () =>
      requestedLessonId
        ? courseLessonsFlat.some((lesson) => lesson.id === requestedLessonId)
        : false,
    [courseLessonsFlat, requestedLessonId]
  );
  const activeLesson = useMemo<CourseLesson>(() => {
    const firstLesson = courseLessonsFlat[0] ?? FALLBACK_LESSON;
    if (!requestedLessonId) return firstLesson;
    return courseLessonsFlat.find((lesson) => lesson.id === requestedLessonId) ?? firstLesson;
  }, [courseLessonsFlat, requestedLessonId]);

  const { prevId, nextId } = useMemo(() => {
    const index = courseLessonsFlat.findIndex((lesson) => lesson.id === activeLesson.id);
    if (index === -1) return { prevId: null, nextId: null };

    return {
      prevId: index > 0 ? (courseLessonsFlat[index - 1]?.id ?? null) : null,
      nextId:
        index < courseLessonsFlat.length - 1 ? (courseLessonsFlat[index + 1]?.id ?? null) : null,
    };
  }, [activeLesson.id, courseLessonsFlat]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>("course");
  const [closeDrawerOnLessonChange, setCloseDrawerOnLessonChange] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [commonMistakesExpanded, setCommonMistakesExpanded] = useState(true);
  const [doneLessonIds, setDoneLessonIds] = useState<string[]>([]);
  const [doneLessonIdsLoaded, setDoneLessonIdsLoaded] = useState(false);
  const [doneConfirmationByLessonId, setDoneConfirmationByLessonId] = useState<
    Record<string, string>
  >({});
  const [doneConfirmationLoaded, setDoneConfirmationLoaded] = useState(false);
  const [doneGateChecksByLessonId, setDoneGateChecksByLessonId] = useState<
    Record<string, string[]>
  >({});
  const [doneGateFeedback, setDoneGateFeedback] = useState<string | null>(null);
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
  const [authStateLoaded, setAuthStateLoaded] = useState(false);
  const [signedInUserId, setSignedInUserId] = useState<string | null>(null);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [courseSyncStatus, setCourseSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">(
    "idle"
  );
  const [lastCourseSyncAtMs, setLastCourseSyncAtMs] = useState<number | null>(null);
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [swipeHint, setSwipeHint] = useState<{
    direction: SwipeDirection;
    progress: number;
  } | null>(null);
  const [showSwipeNux, setShowSwipeNux] = useState(false);
  const [overviewJumpIndex, setOverviewJumpIndex] = useState<number | null>(null);
  const [isOverviewJumpDragging, setIsOverviewJumpDragging] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showInstallIosGuide, setShowInstallIosGuide] = useState(false);
  const [showInstallMacSafariGuide, setShowInstallMacSafariGuide] = useState(false);
  const [showInstallSuccessNotice, setShowInstallSuccessNotice] = useState(false);
  const [installPromptBusy, setInstallPromptBusy] = useState(false);
  const [installPromptFeedback, setInstallPromptFeedback] = useState<InstallFeedbackMessage | null>(
    null
  );
  const [autoInstallPromptArmed, setAutoInstallPromptArmed] = useState(false);
  const overviewJumpDraggingRef = useRef(false);
  const installPromptTimerRef = useRef<number | null>(null);
  const courseSyncTimerRef = useRef<number | null>(null);
  const courseSyncDirtyRef = useRef(false);
  const courseSyncDirtyLessonIdsRef = useRef<Set<string>>(new Set());
  const courseSyncInFlightRef = useRef(false);
  const courseProgressMutationRef = useRef(0);
  const knownProgressLessonIdsRef = useRef<Set<string>>(new Set());
  const doneLessonIdsRef = useRef<string[]>([]);
  const doneConfirmationByLessonIdRef = useRef<Record<string, string>>({});
  const hydratedProgressUserIdRef = useRef<string | null>(null);
  const swipeTouchIdRef = useRef<number | null>(null);
  const swipeDirectionRef = useRef<SwipeDirection | null>(null);
  const swipeStartXRef = useRef(0);
  const swipeStartYRef = useRef(0);
  const swipeTravelRef = useRef(0);
  const swipeCancelledRef = useRef(false);

  const dismissSwipeNux = useCallback(() => {
    setShowSwipeNux(false);
    try {
      localStorage.setItem(SWIPE_NUX_STORAGE_KEY, "1");
    } catch {}
  }, []);

  const moduleInfo = useMemo(() => {
    const moduleIndex = courseModules.findIndex((m) =>
      m.lessons.some((l) => l.id === activeLesson.id)
    );
    const mod = courseModules[moduleIndex] ?? courseModules[0] ?? null;
    const moduleCount = Math.max(1, courseModules.length);
    const moduleLessons = mod?.lessons ?? [];
    const lessonIndexInModule = moduleLessons.findIndex((l) => l.id === activeLesson.id);
    const lessonIndexGlobal = courseLessonsFlat.findIndex((l) => l.id === activeLesson.id);

    return {
      moduleIndex,
      moduleCount,
      module: mod,
      lessonIndexInModule,
      moduleLessonCount: moduleLessons.length,
      lessonIndexGlobal,
      totalLessons: courseLessonsFlat.length,
    };
  }, [activeLesson.id, courseLessonsFlat, courseModules]);

  const lessonJumpMeta = useMemo(() => {
    let globalIndex = 0;
    return courseModules.flatMap((module, moduleIndex) =>
      module.lessons.map((lesson, lessonIndexInModule) => {
        globalIndex += 1;
        return {
          lesson,
          moduleTitle: module.title,
          moduleIndex: moduleIndex + 1,
          moduleCount: courseModules.length,
          lessonIndexInModule: lessonIndexInModule + 1,
          moduleLessonCount: module.lessons.length,
          globalLessonIndex: globalIndex,
        };
      })
    );
  }, [courseModules]);

  const localCourseProgressLoaded =
    doneLessonIdsLoaded && doneConfirmationLoaded && playbackProgressLoaded;

  const clearCourseSyncTimer = useCallback(() => {
    if (courseSyncTimerRef.current == null) return;
    window.clearInterval(courseSyncTimerRef.current);
    courseSyncTimerRef.current = null;
  }, []);

  const markCourseProgressDirty = useCallback((lessonId?: string) => {
    courseProgressMutationRef.current += 1;

    if (lessonId) {
      knownProgressLessonIdsRef.current.add(lessonId);
      courseSyncDirtyLessonIdsRef.current.add(lessonId);
    } else {
      for (const knownLessonId of knownProgressLessonIdsRef.current) {
        courseSyncDirtyLessonIdsRef.current.add(knownLessonId);
      }
    }
    courseSyncDirtyRef.current = courseSyncDirtyLessonIdsRef.current.size > 0;
  }, []);

  const applyLocalCourseProgress = useCallback(
    (next: {
      doneLessonIds: string[];
      doneConfirmationByLessonId: Record<string, string>;
      videoProgressByLessonId: Record<string, number>;
    }) => {
      const normalizedDoneLessonIds = normalizeDoneLessonIds(next.doneLessonIds, {
        resolveLessonId: resolveCanonicalLessonId,
      });
      const normalizedDoneConfirmationByLessonId = normalizeDoneConfirmationRecord(
        next.doneConfirmationByLessonId,
        {
          resolveLessonId: resolveCanonicalLessonId,
        }
      );
      const normalizedVideoProgress = normalizeVideoProgressRecord(next.videoProgressByLessonId, {
        resolveLessonId: resolveCanonicalLessonId,
      });

      for (const lessonId of normalizedDoneLessonIds) {
        knownProgressLessonIdsRef.current.add(lessonId);
      }

      for (const lessonId of Object.keys(normalizedVideoProgress)) {
        knownProgressLessonIdsRef.current.add(lessonId);
      }

      playbackProgressRef.current = normalizedVideoProgress;
      doneLessonIdsRef.current = normalizedDoneLessonIds;
      doneConfirmationByLessonIdRef.current = normalizedDoneConfirmationByLessonId;
      setDoneLessonIds(normalizedDoneLessonIds);
      setDoneConfirmationByLessonId(normalizedDoneConfirmationByLessonId);
      setResumeAvailable(Math.floor(normalizedVideoProgress[activeLesson.id] ?? 0) >= 2);

      try {
        localStorage.setItem(
          previewStorageKeys.doneLessons,
          JSON.stringify(normalizedDoneLessonIds)
        );
        localStorage.setItem(
          previewStorageKeys.doneConfirmations,
          JSON.stringify(normalizedDoneConfirmationByLessonId)
        );
        localStorage.setItem(
          previewStorageKeys.videoProgress,
          JSON.stringify(normalizedVideoProgress)
        );
      } catch {}
    },
    [
      activeLesson.id,
      previewStorageKeys.doneConfirmations,
      previewStorageKeys.doneLessons,
      previewStorageKeys.videoProgress,
      resolveCanonicalLessonId,
    ]
  );

  const buildSyncRows = useCallback(
    (updatedAt?: string): CourseProgressRow[] => {
      return buildCourseProgressRowsFromLocal(
        {
          doneLessonIds: doneLessonIdsRef.current,
          doneConfirmationByLessonId: doneConfirmationByLessonIdRef.current,
          videoProgressByLessonId: playbackProgressRef.current,
        },
        {
          knownLessonIds: knownProgressLessonIdsRef.current,
          updatedAt,
          resolveLessonId: resolveCanonicalLessonId,
        }
      );
    },
    [resolveCanonicalLessonId]
  );

  const persistCourseProgressRows = useCallback(
    async (rows: CourseProgressRow[]) => {
      if (!signedInUserId || !courseProgressSyncEnabled) return;

      const response = await fetch(COURSE_PROGRESS_SYNC_API_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ rows }),
      });

      if (!response.ok) {
        throw new Error(`Course progress sync failed (${response.status})`);
      }
    },
    [courseProgressSyncEnabled, signedInUserId]
  );

  const syncCourseProgressNow = useCallback(
    async (options?: { force?: boolean }) => {
      if (!courseProgressSyncEnabled || !signedInUserId || !localCourseProgressLoaded) return;
      if (!options?.force && !courseSyncDirtyRef.current) return;
      if (courseSyncInFlightRef.current) return;

      const dirtyLessonIds = new Set(courseSyncDirtyLessonIdsRef.current);
      if (!options?.force && dirtyLessonIds.size === 0) return;

      const rows = buildSyncRows(new Date().toISOString()).filter((row) => {
        if (options?.force) return true;
        return dirtyLessonIds.has(row.lessonId);
      });
      if (rows.length === 0) {
        courseSyncDirtyRef.current = courseSyncDirtyLessonIdsRef.current.size > 0;
        return;
      }

      courseSyncInFlightRef.current = true;
      setCourseSyncStatus("syncing");
      const syncedLessonIds = new Set(rows.map((row) => row.lessonId));

      try {
        await persistCourseProgressRows(rows);

        const latestRowsByLessonId = new Map(
          buildSyncRows().map((row) => [row.lessonId, row] as const)
        );

        for (const row of rows) {
          const latestRow = latestRowsByLessonId.get(row.lessonId);
          if (!latestRow) continue;
          if (!areCourseProgressRowsEqual([latestRow], [row])) continue;
          courseSyncDirtyLessonIdsRef.current.delete(row.lessonId);
        }

        for (const dirtyLessonId of Array.from(courseSyncDirtyLessonIdsRef.current)) {
          if (!syncedLessonIds.has(dirtyLessonId)) continue;
          if (latestRowsByLessonId.has(dirtyLessonId)) continue;
          courseSyncDirtyLessonIdsRef.current.delete(dirtyLessonId);
        }

        courseSyncDirtyRef.current = courseSyncDirtyLessonIdsRef.current.size > 0;
        setCourseSyncStatus("synced");
        setLastCourseSyncAtMs(Date.now());
      } catch (error) {
        console.error("[CoursePage] Could not sync course progress", error);
        setCourseSyncStatus("error");
      } finally {
        courseSyncInFlightRef.current = false;
        if (courseSyncDirtyRef.current) {
          void syncCourseProgressNow({ force: true });
        }
      }
    },
    [
      buildSyncRows,
      courseProgressSyncEnabled,
      localCourseProgressLoaded,
      persistCourseProgressRows,
      signedInUserId,
    ]
  );

  useEffect(() => {
    if (requestedLessonId && !hasResolvedRequestedLesson) return;

    try {
      localStorage.setItem(previewStorageKeys.lastLesson, activeLesson.id);
    } catch {}
  }, [
    activeLesson.id,
    hasResolvedRequestedLesson,
    previewStorageKeys.lastLesson,
    requestedLessonId,
  ]);

  useEffect(() => {
    if (!lessonParam || !canonicalLessonParam || lessonParam === canonicalLessonParam) {
      canonicalLessonReplaceHrefRef.current = null;
      return;
    }

    const nextCanonicalHref = `${pathname}?lesson=${encodeURIComponent(canonicalLessonParam)}`;
    if (canonicalLessonReplaceHrefRef.current === nextCanonicalHref) {
      return;
    }

    canonicalLessonReplaceHrefRef.current = nextCanonicalHref;
    router.replace(nextCanonicalHref);
  }, [canonicalLessonParam, lessonParam, pathname, router]);

  useEffect(() => {
    if (lessonParam) return;

    try {
      const last = localStorage.getItem(previewStorageKeys.lastLesson);
      const next = (last ? resolveCanonicalLessonId(last) : null) ?? defaultLessonId;
      router.replace(`${pathname}?lesson=${encodeURIComponent(next)}`);
    } catch {
      router.replace(`${pathname}?lesson=${encodeURIComponent(defaultLessonId)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLessonId, pathname, previewStorageKeys.lastLesson, resolveCanonicalLessonId, router]);

  useEffect(() => {
    let cancelled = false;

    const loadCourseContent = async () => {
      setCourseContentLoadState("loading");
      setCourseContentError(null);

      const params = new URLSearchParams();
      if (previewEnabled) {
        params.set("preview", "1");
        if (previewModeParam) {
          params.set("previewMode", previewModeParam);
        } else {
          params.set("previewMode", "published");
        }
      }
      const requestPath =
        params.size > 0 ? `/api/course/content?${params.toString()}` : "/api/course/content";
      const requestCache: RequestCache = previewEnabled ? "no-store" : "force-cache";

      try {
        const response = await fetch(requestPath, {
          method: "GET",
          credentials: "same-origin",
          cache: requestCache,
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          modules?: CourseModule[];
          error?: string;
        };

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload.ok || !Array.isArray(payload.modules)) {
          const fallbackError = previewEnabled
            ? "Could not load preview content."
            : "Could not load course content.";
          setCourseContentError(payload.error ?? fallbackError);
          setCourseContentLoadState(previewEnabled ? "error" : "success");
          if (!previewEnabled) {
            setCourseModules(COURSE_MODULES);
          }
          return;
        }

        setCourseModules(
          payload.modules.length > 0 ? payload.modules : previewEnabled ? [] : COURSE_MODULES
        );
        setCourseContentLoadState("success");
      } catch {
        if (cancelled) return;
        setCourseContentError(previewEnabled ? "Could not load preview content." : null);
        setCourseContentLoadState(previewEnabled ? "error" : "success");
        if (!previewEnabled) {
          // keep safe default
          setCourseModules(COURSE_MODULES);
        }
      }
    };

    void loadCourseContent();
    return () => {
      cancelled = true;
    };
  }, [previewEnabled, previewMode, previewModeParam]);

  useEffect(() => {
    if (!authStateLoaded || !signedInUserId) return;

    let cancelled = false;

    const loadRuntimeFlags = async () => {
      try {
        const response = await fetch("/api/runtime/flags", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          flags?: { dashboardVisible?: boolean };
        };

        if (cancelled) return;
        if (!response.ok || !payload.ok) return;

        if (typeof payload.flags?.dashboardVisible === "boolean") {
          setDashboardVisible(payload.flags.dashboardVisible);
        }
      } catch {
        // keep safe default
      }
    };

    void loadRuntimeFlags();
    return () => {
      cancelled = true;
    };
  }, [authStateLoaded, signedInUserId]);

  const mainMenuItems = useMemo(
    () => getMainMenuItems({ includeDashboard: dashboardVisible }),
    [dashboardVisible]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(OVERVIEW_STORAGE_KEY);
      if (saved === null) return;
      setOverviewExpanded(saved === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${COMMON_MISTAKES_STORAGE_KEY_PREFIX}${activeLesson.id}`);
      if (saved === "0") {
        setCommonMistakesExpanded(false);
        return;
      }
    } catch {}
    setCommonMistakesExpanded(true);
  }, [activeLesson.id]);

  useEffect(() => {
    setDoneGateChecksByLessonId((prev) => {
      const normalized = normalizeCourseLessonCriteriaCheckRecord(prev, {
        resolveLessonId: resolveCanonicalLessonId,
        getLessonById: (lessonId) => courseLessonById.get(lessonId) ?? null,
      });

      const prevKeys = Object.keys(prev);
      const normalizedKeys = Object.keys(normalized);
      if (prevKeys.length !== normalizedKeys.length) {
        return normalized;
      }

      for (const lessonId of prevKeys) {
        const prevChecks = prev[lessonId] ?? [];
        const normalizedChecks = normalized[lessonId] ?? [];
        if (prevChecks.length !== normalizedChecks.length) {
          return normalized;
        }
        for (let index = 0; index < prevChecks.length; index += 1) {
          if (prevChecks[index] !== normalizedChecks[index]) {
            return normalized;
          }
        }
      }

      return prev;
    });
  }, [courseLessonById, resolveCanonicalLessonId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(previewStorageKeys.doneLessons);
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalizedDoneLessonIds = normalizeDoneLessonIds(parsed, {
          resolveLessonId: resolveCanonicalLessonId,
        });
        for (const lessonId of normalizedDoneLessonIds) {
          knownProgressLessonIdsRef.current.add(lessonId);
        }
        doneLessonIdsRef.current = normalizedDoneLessonIds;
        setDoneLessonIds(normalizedDoneLessonIds);
      }
    } catch {}
    setDoneLessonIdsLoaded(true);
  }, [previewStorageKeys.doneLessons, resolveCanonicalLessonId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(previewStorageKeys.doneConfirmations);
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalizedDoneConfirmationByLessonId = normalizeDoneConfirmationRecord(parsed, {
          resolveLessonId: resolveCanonicalLessonId,
        });
        doneConfirmationByLessonIdRef.current = normalizedDoneConfirmationByLessonId;
        setDoneConfirmationByLessonId(normalizedDoneConfirmationByLessonId);
      }
    } catch {}
    setDoneConfirmationLoaded(true);
  }, [previewStorageKeys.doneConfirmations, resolveCanonicalLessonId]);

  useEffect(() => {
    if (!doneLessonIdsLoaded) return;
    try {
      localStorage.setItem(previewStorageKeys.doneLessons, JSON.stringify(doneLessonIds));
    } catch {}
  }, [doneLessonIds, doneLessonIdsLoaded, previewStorageKeys.doneLessons]);

  useEffect(() => {
    if (!doneConfirmationLoaded) return;
    try {
      localStorage.setItem(
        previewStorageKeys.doneConfirmations,
        JSON.stringify(doneConfirmationByLessonId)
      );
    } catch {}
  }, [doneConfirmationByLessonId, doneConfirmationLoaded, previewStorageKeys.doneConfirmations]);

  useEffect(() => {
    doneLessonIdsRef.current = doneLessonIds;
  }, [doneLessonIds]);

  useEffect(() => {
    doneConfirmationByLessonIdRef.current = doneConfirmationByLessonId;
  }, [doneConfirmationByLessonId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(previewStorageKeys.videoProgress);
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalized = normalizeVideoProgressRecord(parsed, {
          resolveLessonId: resolveCanonicalLessonId,
        });
        for (const lessonId of Object.keys(normalized)) {
          knownProgressLessonIdsRef.current.add(lessonId);
        }
        playbackProgressRef.current = normalized;
      }
    } catch {}
    setPlaybackProgressLoaded(true);
  }, [previewStorageKeys.videoProgress, resolveCanonicalLessonId]);

  useEffect(() => {
    let mounted = true;
    const supabase = createBrowserSupabaseClient();

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setSignedInUserId(null);
        setDashboardVisible(false);
        setAuthStateLoaded(true);
        return;
      }
      const nextSignedInUserId = data.session?.user.id ?? null;
      setSignedInUserId(nextSignedInUserId);
      if (!nextSignedInUserId) setDashboardVisible(false);
      setAuthStateLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const nextSignedInUserId = session?.user?.id ?? null;
      setSignedInUserId(nextSignedInUserId);
      if (!nextSignedInUserId) setDashboardVisible(false);
      setAuthStateLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (courseProgressSyncEnabled && signedInUserId) return;
    clearCourseSyncTimer();
    hydratedProgressUserIdRef.current = null;
    courseSyncDirtyRef.current = false;
    courseSyncDirtyLessonIdsRef.current.clear();
    courseSyncInFlightRef.current = false;
    setCourseSyncStatus("idle");
    setLastCourseSyncAtMs(null);
  }, [clearCourseSyncTimer, courseProgressSyncEnabled, signedInUserId]);

  useEffect(() => {
    if (
      !courseProgressSyncEnabled ||
      !authStateLoaded ||
      !localCourseProgressLoaded ||
      !signedInUserId
    )
      return;
    if (hydratedProgressUserIdRef.current === signedInUserId) return;

    hydratedProgressUserIdRef.current = signedInUserId;
    let cancelled = false;

    const hydrateFromServer = async () => {
      setCourseSyncStatus("syncing");
      const hydrateStartedAtMutation = courseProgressMutationRef.current;

      try {
        const response = await fetch(COURSE_PROGRESS_SYNC_API_PATH, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error(`Course progress hydrate failed (${response.status})`);
        }

        const payload = (await response.json()) as { rows?: unknown };
        if (cancelled) return;

        const remoteRows = normalizeCourseProgressRows(payload.rows ?? [], {
          resolveLessonId: resolveCanonicalLessonId,
        });
        for (const row of remoteRows) {
          knownProgressLessonIdsRef.current.add(row.lessonId);
        }

        const localRows = buildSyncRows();
        const mergedRows = mergeCourseProgressRows(localRows, remoteRows);
        for (const row of mergedRows) {
          knownProgressLessonIdsRef.current.add(row.lessonId);
        }

        const hasLocalMutationDuringHydrate =
          courseProgressMutationRef.current !== hydrateStartedAtMutation;

        if (!hasLocalMutationDuringHydrate) {
          applyLocalCourseProgress(
            buildLocalCourseProgressFromRows(mergedRows, {
              resolveLessonId: resolveCanonicalLessonId,
            })
          );
        }

        if (cancelled) return;

        const dirtyLessonIds = resolveCourseDirtyLessonIdsAfterHydrate({
          existingDirtyLessonIds: courseSyncDirtyLessonIdsRef.current,
          mergedRows,
          remoteRows,
        });

        courseSyncDirtyLessonIdsRef.current = new Set(dirtyLessonIds);
        courseSyncDirtyRef.current = dirtyLessonIds.length > 0;

        if (courseSyncDirtyRef.current) {
          setCourseSyncStatus("syncing");
          void syncCourseProgressNow({ force: true });
          return;
        }

        setCourseSyncStatus("synced");
        setLastCourseSyncAtMs(Date.now());
      } catch (error) {
        if (cancelled) return;
        console.error("[CoursePage] Could not hydrate course progress", error);
        setCourseSyncStatus("error");
      }
    };

    void hydrateFromServer();

    return () => {
      cancelled = true;
    };
  }, [
    applyLocalCourseProgress,
    authStateLoaded,
    buildSyncRows,
    courseProgressSyncEnabled,
    localCourseProgressLoaded,
    resolveCanonicalLessonId,
    signedInUserId,
    syncCourseProgressNow,
  ]);

  useEffect(() => {
    if (!courseProgressSyncEnabled || !signedInUserId || !localCourseProgressLoaded) return;
    clearCourseSyncTimer();
    courseSyncTimerRef.current = window.setInterval(() => {
      void syncCourseProgressNow();
    }, COURSE_PROGRESS_SYNC_INTERVAL_MS);

    return () => {
      clearCourseSyncTimer();
    };
  }, [
    clearCourseSyncTimer,
    courseProgressSyncEnabled,
    localCourseProgressLoaded,
    signedInUserId,
    syncCourseProgressNow,
  ]);

  useEffect(() => {
    if (!courseProgressSyncEnabled || !signedInUserId) return;

    const flushWhenBackgrounded = () => {
      if (document.visibilityState !== "hidden") return;
      void syncCourseProgressNow({ force: true });
    };

    const flushOnPageHide = () => {
      void syncCourseProgressNow({ force: true });
    };

    document.addEventListener("visibilitychange", flushWhenBackgrounded);
    window.addEventListener("pagehide", flushOnPageHide);

    return () => {
      document.removeEventListener("visibilitychange", flushWhenBackgrounded);
      window.removeEventListener("pagehide", flushOnPageHide);
    };
  }, [courseProgressSyncEnabled, signedInUserId, syncCourseProgressNow]);

  useEffect(() => {
    if (!courseProgressSyncEnabled || !signedInUserId || !doneLessonIdsLoaded) return;
    if (!courseSyncDirtyRef.current) return;
    void syncCourseProgressNow({ force: true });
  }, [
    courseProgressSyncEnabled,
    doneLessonIds,
    doneLessonIdsLoaded,
    signedInUserId,
    syncCourseProgressNow,
  ]);

  useEffect(() => {
    if (!playbackProgressLoaded) return;
    const savedSeconds = Math.floor(playbackProgressRef.current[activeLesson.id] ?? 0);
    setResumeAvailable(savedSeconds >= 2);
  }, [activeLesson.id, playbackProgressLoaded]);

  useEffect(() => {
    if (window.innerWidth >= 640) return;
    try {
      if (localStorage.getItem(SWIPE_NUX_STORAGE_KEY) === "1") return;
    } catch {}
    const timer = window.setTimeout(() => {
      setShowSwipeNux(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSwipeNux) return;
    const timer = window.setTimeout(() => {
      dismissSwipeNux();
    }, 7600);
    return () => window.clearTimeout(timer);
  }, [dismissSwipeNux, showSwipeNux]);

  const persistPlaybackProgress = useCallback(() => {
    try {
      localStorage.setItem(
        previewStorageKeys.videoProgress,
        JSON.stringify(playbackProgressRef.current)
      );
    } catch {}
  }, [previewStorageKeys.videoProgress]);

  const stopProgressSaveTimer = useCallback(() => {
    if (progressSaveTimerRef.current == null) return;
    window.clearInterval(progressSaveTimerRef.current);
    progressSaveTimerRef.current = null;
  }, []);

  const savePlaybackPosition = useCallback(
    (lessonId: string | null | undefined) => {
      if (!lessonId) return;
      const player = youtubePlayerRef.current;
      if (!player?.getCurrentTime) return;
      try {
        const seconds = player.getCurrentTime();
        if (!Number.isFinite(seconds) || seconds < 0) return;
        const normalizedSeconds = Math.floor(seconds);
        const previousSeconds = Math.floor(playbackProgressRef.current[lessonId] ?? 0);
        if (normalizedSeconds === previousSeconds) return;

        knownProgressLessonIdsRef.current.add(lessonId);
        playbackProgressRef.current[lessonId] = normalizedSeconds;
        persistPlaybackProgress();
        markCourseProgressDirty(lessonId);
        if (lessonId === activeLesson.id) {
          setResumeAvailable(normalizedSeconds >= 2);
        }
      } catch {}
    },
    [activeLesson.id, markCourseProgressDirty, persistPlaybackProgress]
  );

  useEffect(() => {
    return () => {
      stopProgressSaveTimer();
      clearCourseSyncTimer();
      void syncCourseProgressNow({ force: true });
    };
  }, [clearCourseSyncTimer, stopProgressSaveTimer, syncCourseProgressNow]);

  const playerTopRef = useRef<HTMLDivElement | null>(null);
  const canonicalLessonReplaceHrefRef = useRef<string | null>(null);

  const goToLesson = useCallback(
    (lessonId: string, options?: { scrollToPlayer?: boolean }) => {
      const nextLessonId = resolveCanonicalLessonId(lessonId) ?? lessonId;

      if (nextLessonId === activeLesson.id) {
        setDrawerOpen(false);
        setCloseDrawerOnLessonChange(false);
        return;
      }

      if (drawerOpen) {
        setCloseDrawerOnLessonChange(true);
      }

      router.push(`${pathname}?lesson=${encodeURIComponent(nextLessonId)}`, { scroll: false });
      const shouldScrollToPlayer = options?.scrollToPlayer ?? true;
      if (!drawerOpen && shouldScrollToPlayer) {
        const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";
        playerTopRef.current?.scrollIntoView({ behavior, block: "start" });
      }
    },
    [activeLesson.id, drawerOpen, pathname, resolveCanonicalLessonId, router]
  );

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
    setCommonMistakesExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(
          `${COMMON_MISTAKES_STORAGE_KEY_PREFIX}${activeLesson.id}`,
          next ? "1" : "0"
        );
      } catch {}
      return next;
    });
  }

  const clearInstallPromptTimer = useCallback(() => {
    if (installPromptTimerRef.current == null) return;
    window.clearTimeout(installPromptTimerRef.current);
    installPromptTimerRef.current = null;
  }, []);

  const markAutoPromptSeen = useCallback(() => {
    try {
      localStorage.setItem(A2HS_PROMPT_SEEN_KEY, "1");
    } catch {}
  }, []);

  const markAutoPromptDismissed = useCallback(() => {
    try {
      localStorage.setItem(A2HS_DISMISSED_AT_KEY, String(Date.now()));
    } catch {}
  }, []);

  const queueAutoInstallPrompt = useCallback(() => {
    if (!A2HS_AUTO_PROMPT_ENABLED) return;

    let hasSeenPrompt = false;
    let dismissedAtMs: number | null = null;
    try {
      hasSeenPrompt = localStorage.getItem(A2HS_PROMPT_SEEN_KEY) === "1";
      dismissedAtMs = parseStoredTimestamp(localStorage.getItem(A2HS_DISMISSED_AT_KEY));
    } catch {}

    const shouldShow = shouldShowAutoInstallPrompt({
      enabled: A2HS_AUTO_PROMPT_ENABLED,
      hasSeenPrompt,
      dismissedAtMs,
      isInstalled: install.isInstalled,
      canInstall: install.canInstall,
    });
    if (!shouldShow) return;

    clearInstallPromptTimer();
    installPromptTimerRef.current = window.setTimeout(() => {
      setShowInstallPrompt(true);
      setShowInstallIosGuide(false);
      setShowInstallMacSafariGuide(false);
      setShowInstallSuccessNotice(false);
      setInstallPromptFeedback(null);
      markAutoPromptSeen();
    }, A2HS_AUTO_PROMPT_DELAY_MS);
  }, [clearInstallPromptTimer, install.canInstall, install.isInstalled, markAutoPromptSeen]);

  async function handleInstallFromPrompt() {
    if (installPromptBusy) return;
    setInstallPromptBusy(true);
    setShowInstallSuccessNotice(false);
    setInstallPromptFeedback(null);

    const result = await install.requestInstall();
    setInstallPromptBusy(false);

    if (result === "accepted") {
      setShowInstallIosGuide(false);
      setShowInstallMacSafariGuide(false);
      setShowInstallSuccessNotice(true);
      setInstallPromptFeedback({
        tone: "success",
        message:
          "App installed. You can open FreeSwimming from your Dock, Start menu, or home screen.",
      });
      return;
    }
    if (result === "dismissed") {
      markAutoPromptDismissed();
      setShowInstallPrompt(false);
      setShowInstallIosGuide(false);
      setShowInstallMacSafariGuide(false);
      setShowInstallSuccessNotice(false);
      return;
    }
    if (result === "ios-instructions") {
      setShowInstallIosGuide(true);
      setShowInstallMacSafariGuide(false);
      setShowInstallSuccessNotice(false);
      return;
    }
    if (result === "mac-safari-instructions") {
      setShowInstallIosGuide(false);
      setShowInstallMacSafariGuide(true);
      setShowInstallSuccessNotice(false);
      return;
    }
    if (result === "already-installed") {
      setShowInstallPrompt(false);
      setShowInstallIosGuide(false);
      setShowInstallMacSafariGuide(false);
      setShowInstallSuccessNotice(false);
      return;
    }
    setShowInstallIosGuide(false);
    setShowInstallMacSafariGuide(false);
    setShowInstallSuccessNotice(false);
    setInstallPromptFeedback({
      tone: "warning",
      message:
        "Install is not available in this browser yet. For best support, use Safari, Chrome, or Edge.",
    });
  }

  function dismissInstallPrompt() {
    clearInstallPromptTimer();
    markAutoPromptDismissed();
    setAutoInstallPromptArmed(false);
    setShowInstallPrompt(false);
    setShowInstallIosGuide(false);
    setShowInstallMacSafariGuide(false);
    setShowInstallSuccessNotice(false);
    setInstallPromptFeedback(null);
  }

  function closeIosInstallGuide() {
    markAutoPromptDismissed();
    setAutoInstallPromptArmed(false);
    setShowInstallPrompt(false);
    setShowInstallIosGuide(false);
    setShowInstallMacSafariGuide(false);
    setShowInstallSuccessNotice(false);
    setInstallPromptFeedback(null);
  }

  function closeMacSafariInstallGuide() {
    markAutoPromptDismissed();
    setAutoInstallPromptArmed(false);
    setShowInstallPrompt(false);
    setShowInstallIosGuide(false);
    setShowInstallMacSafariGuide(false);
    setShowInstallSuccessNotice(false);
    setInstallPromptFeedback(null);
  }

  function closeInstallSuccessNotice() {
    setAutoInstallPromptArmed(false);
    setShowInstallPrompt(false);
    setShowInstallIosGuide(false);
    setShowInstallMacSafariGuide(false);
    setShowInstallSuccessNotice(false);
    setInstallPromptFeedback(null);
  }

  function dismissBackupPrompt() {
    try {
      localStorage.setItem(BACKUP_PROMPT_DISMISSED_AT_KEY, String(Date.now()));
    } catch {}
    setShowBackupPrompt(false);
  }

  useEffect(() => {
    return () => {
      clearInstallPromptTimer();
    };
  }, [clearInstallPromptTimer]);

  useEffect(() => {
    if (!autoInstallPromptArmed) return;
    if (install.isInstalled) {
      setAutoInstallPromptArmed(false);
      return;
    }
    if (!install.canInstall) return;

    queueAutoInstallPrompt();
    setAutoInstallPromptArmed(false);
  }, [autoInstallPromptArmed, install.canInstall, install.isInstalled, queueAutoInstallPrompt]);

  useEffect(() => {
    if (!install.isInstalled) return;
    clearInstallPromptTimer();
    setAutoInstallPromptArmed(false);
    setShowInstallPrompt(false);
    setShowInstallIosGuide(false);
    setShowInstallMacSafariGuide(false);
    setShowInstallSuccessNotice(false);
    setInstallPromptFeedback(null);
  }, [clearInstallPromptTimer, install.isInstalled]);

  function toggleDoneGateCriterion(criterion: string) {
    setDoneGateFeedback(null);
    setDoneGateChecksByLessonId((prev) => {
      const existing = normalizeCourseLessonCriteriaChecks(
        activeLesson,
        prev[activeLesson.id] ?? []
      );
      const nextSet = new Set(existing);
      if (nextSet.has(criterion)) {
        nextSet.delete(criterion);
      } else {
        nextSet.add(criterion);
      }

      return {
        ...prev,
        [activeLesson.id]: passCriteria.filter((item) => nextSet.has(item)),
      };
    });
  }

  function toggleLessonDone() {
    const willMarkAsDone = !doneLessonIds.includes(activeLesson.id);
    if (willMarkAsDone && markDoneBlockedByGate) {
      setDoneGateFeedback("Check each pass criterion before marking this lesson as done.");
      return;
    }

    knownProgressLessonIdsRef.current.add(activeLesson.id);
    markCourseProgressDirty(activeLesson.id);

    setDoneLessonIds((prev) => {
      const nextDoneLessonIds = prev.includes(activeLesson.id)
        ? prev.filter((id) => id !== activeLesson.id)
        : [...prev, activeLesson.id];

      doneLessonIdsRef.current = nextDoneLessonIds;

      return nextDoneLessonIds;
    });
    if (willMarkAsDone) {
      if (doneGateRequired) {
        setDoneConfirmationByLessonId((prev) => ({
          ...prev,
          [activeLesson.id]: new Date().toISOString(),
        }));
      }
      setAutoInstallPromptArmed(true);
      return;
    }

    setAutoInstallPromptArmed(false);
    setDoneConfirmationByLessonId((prev) => {
      if (!(activeLesson.id in prev)) return prev;
      const next = { ...prev };
      delete next[activeLesson.id];
      return next;
    });
  }

  const resetSwipeGesture = useCallback(() => {
    swipeTouchIdRef.current = null;
    swipeDirectionRef.current = null;
    swipeTravelRef.current = 0;
    swipeCancelledRef.current = false;
    setSwipeHint(null);
  }, []);

  const getTrackedTouch = useCallback((touches: React.TouchList) => {
    const trackedId = swipeTouchIdRef.current;
    if (trackedId == null) return null;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches.item(i);
      if (touch && touch.identifier === trackedId) return touch;
    }
    return null;
  }, []);

  const handleSwipeStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (window.innerWidth >= 640 || drawerOpen || event.touches.length !== 1) return;
      if (isSwipeBlockedTarget(event.target)) return;

      const touch = event.touches[0];
      const availableWidth = Math.max(0, window.innerWidth - SWIPE_ZONE_INSET_PX * 2);
      const sideZoneWidth = Math.min(
        SWIPE_SIDE_ZONE_MAX_PX,
        Math.max(SWIPE_SIDE_ZONE_MIN_PX, availableWidth * SWIPE_SIDE_ZONE_RATIO)
      );
      const leftZoneEnd = SWIPE_ZONE_INSET_PX + sideZoneWidth;
      const rightZoneStart = window.innerWidth - SWIPE_ZONE_INSET_PX - sideZoneWidth;

      let resolvedDirection: SwipeDirection | null = null;
      if (touch.clientX <= leftZoneEnd && prevId) resolvedDirection = "prev";
      if (touch.clientX >= rightZoneStart && nextId) resolvedDirection = "next";
      if (!resolvedDirection) return;

      swipeTouchIdRef.current = touch.identifier;
      swipeDirectionRef.current = resolvedDirection;
      swipeStartXRef.current = touch.clientX;
      swipeStartYRef.current = touch.clientY;
      swipeTravelRef.current = 0;
      swipeCancelledRef.current = false;
      setSwipeHint({ direction: resolvedDirection, progress: 0 });
      dismissSwipeNux();
    },
    [dismissSwipeNux, drawerOpen, nextId, prevId]
  );

  const beginSwipeFromVideoEdge = useCallback(
    (direction: SwipeDirection, event: React.TouchEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (window.innerWidth >= 640 || drawerOpen || event.touches.length !== 1) return;
      if (direction === "prev" && !prevId) return;
      if (direction === "next" && !nextId) return;

      const touch = event.touches[0];
      swipeTouchIdRef.current = touch.identifier;
      swipeDirectionRef.current = direction;
      swipeStartXRef.current = touch.clientX;
      swipeStartYRef.current = touch.clientY;
      swipeTravelRef.current = 0;
      swipeCancelledRef.current = false;
      setSwipeHint({ direction, progress: 0 });
      dismissSwipeNux();
    },
    [dismissSwipeNux, drawerOpen, nextId, prevId]
  );

  const handleSwipeMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const direction = swipeDirectionRef.current;
      if (!direction) return;
      const touch = getTrackedTouch(event.touches);
      if (!touch) return;

      const deltaX = touch.clientX - swipeStartXRef.current;
      const travel = direction === "prev" ? deltaX : -deltaX;
      const verticalTravel = Math.abs(touch.clientY - swipeStartYRef.current);
      const normalizedTravel = Math.max(0, travel);

      if (
        !swipeCancelledRef.current &&
        verticalTravel > SWIPE_VERTICAL_CANCEL_PX &&
        verticalTravel > normalizedTravel
      ) {
        swipeCancelledRef.current = true;
        setSwipeHint(null);
        return;
      }

      if (swipeCancelledRef.current) return;
      if (normalizedTravel > 0) {
        event.preventDefault();
      }

      swipeTravelRef.current = normalizedTravel;
      const progress = Math.min(1, normalizedTravel / SWIPE_DISTANCE_TO_NAVIGATE_PX);
      setSwipeHint({ direction, progress });
    },
    [getTrackedTouch]
  );

  const handleSwipeEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const direction = swipeDirectionRef.current;
      if (!direction) return;
      const trackedId = swipeTouchIdRef.current;
      if (trackedId == null) {
        resetSwipeGesture();
        return;
      }

      let relevantTouchEnded = false;
      for (let i = 0; i < event.changedTouches.length; i += 1) {
        const touch = event.changedTouches.item(i);
        if (touch?.identifier === trackedId) {
          relevantTouchEnded = true;
          break;
        }
      }
      if (!relevantTouchEnded) return;

      const shouldNavigate =
        !swipeCancelledRef.current && swipeTravelRef.current >= SWIPE_DISTANCE_TO_NAVIGATE_PX;
      const targetLessonId = direction === "prev" ? prevId : nextId;
      resetSwipeGesture();
      if (shouldNavigate && targetLessonId) {
        goToLesson(targetLessonId);
      }
    },
    [goToLesson, nextId, prevId, resetSwipeGesture]
  );

  const isFirstLesson = !prevId;
  const isLastLesson = !nextId;
  const isCourseDrawerOpen = drawerOpen && drawerView === "course";

  const youtubeWatchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${activeLesson.youtubeId}`,
    [activeLesson.youtubeId]
  );
  const activeLessonPosterUrl = useMemo(
    () => `https://i.ytimg.com/vi/${activeLesson.youtubeId}/hqdefault.jpg`,
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
  const lessonProgressStatusById = useMemo(
    () =>
      buildCourseLessonProgressStatusMap(
        courseLessonsFlat,
        doneLessonIdSet,
        doneGateChecksByLessonId
      ),
    [courseLessonsFlat, doneGateChecksByLessonId, doneLessonIdSet]
  );
  const doneLessonsCount = useMemo(
    () => courseLessonsFlat.filter((lesson) => doneLessonIdSet.has(lesson.id)).length,
    [courseLessonsFlat, doneLessonIdSet]
  );
  const inProgressLessonsCount = useMemo(
    () =>
      Object.values(lessonProgressStatusById).filter((status) => status === "in_progress").length,
    [lessonProgressStatusById]
  );
  const totalLessons = Math.max(1, moduleInfo.totalLessons);
  const donePct = useMemo(() => {
    return Math.min(100, Math.round((doneLessonsCount / totalLessons) * 100));
  }, [doneLessonsCount, totalLessons]);
  const currentLessonIndex = moduleInfo.lessonIndexGlobal >= 0 ? moduleInfo.lessonIndexGlobal : 0;
  const nextLesson = useMemo(() => {
    if (!nextId) return null;
    return courseLessonsFlat.find((lesson) => lesson.id === nextId) ?? null;
  }, [courseLessonsFlat, nextId]);
  const lessonExperience = useMemo(
    () => buildCourseLessonExperienceViewModel(activeLesson),
    [activeLesson]
  );
  const isLessonDone = doneLessonIds.includes(activeLesson.id);
  const lessonType = activeLesson.lessonType ?? "drill";
  const lessonNumberInModule =
    moduleInfo.lessonIndexInModule >= 0 ? moduleInfo.lessonIndexInModule + 1 : 1;
  const lessonDisplay = activeLesson.display;
  const commonMistakes = lessonExperience.commonMistakes;
  const showGoalSection = lessonDisplay?.goal !== false;
  const showWhyThisMattersSection = Boolean(lessonExperience.whyThisMatters);
  const showCuesSection = lessonDisplay?.cues !== false && lessonExperience.feelCues.length > 0;
  const showCommonMistakesSection =
    lessonDisplay?.commonMistakes !== false && commonMistakes.length > 0;
  const showDrillSection = lessonDisplay?.drill !== false;
  const showPassCriteria = lessonDisplay?.checkpoint !== false;
  const showNextStepSection = lessonDisplay?.nextStep !== false;
  const showPassOrNextCard = showPassCriteria || showNextStepSection;
  const supportStartAtLessonInModule = activeLesson.supportStartAtLessonInModule;
  const supportStartReached =
    typeof supportStartAtLessonInModule === "number"
      ? lessonNumberInModule >= supportStartAtLessonInModule
      : true;
  const supportCardActions = activeLesson.supportCard?.actions;
  const enabledSupportActions = SUPPORT_ACTION_ORDER.filter((actionId) => {
    if (actionId === "videoAnalysis") return supportCardActions?.videoAnalysis ?? true;
    if (actionId === "poolsideGuide") return supportCardActions?.poolsideGuide ?? true;
    if (actionId === "guide0To1000") return supportCardActions?.guide0To1000 ?? false;
    return supportCardActions?.contact ?? false;
  }).map((actionId) => ({ id: actionId, ...SUPPORT_ACTION_META[actionId] }));
  const configuredPrimarySupportAction =
    activeLesson.supportCard?.primaryAction &&
    enabledSupportActions.some((action) => action.id === activeLesson.supportCard?.primaryAction)
      ? activeLesson.supportCard.primaryAction
      : null;
  const showExtraHelpCard =
    lessonDisplay?.support !== false && supportStartReached && enabledSupportActions.length > 0;
  const showOpenOnPhoneCard = showExtraHelpCard && !previewEnabled;
  const openOnPhoneSharePath = useMemo(
    () => `/course?lesson=${encodeURIComponent(activeLesson.id)}`,
    [activeLesson.id]
  );
  const showLessonExperienceSections =
    showGoalSection ||
    showCuesSection ||
    showCommonMistakesSection ||
    showDrillSection ||
    showPassOrNextCard ||
    showExtraHelpCard;
  const lessonContentReady = courseContentLoadState !== "loading";
  const drillBadgeLabel =
    activeLesson.drillLabel?.trim() ||
    (lessonType === "learn" ? "Learn" : lessonType === "swim" ? "Swim" : "Drill");
  const passCriteria = lessonExperience.masteryCriteria;
  const doneGateChecks = useMemo(
    () =>
      normalizeCourseLessonCriteriaChecks(
        activeLesson,
        doneGateChecksByLessonId[activeLesson.id] ?? []
      ),
    [activeLesson, doneGateChecksByLessonId]
  );
  const doneGateChecksSet = useMemo(() => new Set(doneGateChecks), [doneGateChecks]);
  const doneGateRequired = showPassCriteria && !isLessonDone;
  const doneGateSatisfied =
    !doneGateRequired || passCriteria.every((criterion) => doneGateChecksSet.has(criterion));
  const markDoneBlockedByGate = !lessonContentReady || (!isLessonDone && !doneGateSatisfied);
  const activeLessonProgressStatus = lessonProgressStatusById[activeLesson.id] ?? "not_started";
  const activeLessonStatusMeta =
    activeLessonProgressStatus === "done"
      ? {
          label: "Done",
          className: "bg-emerald-50 text-emerald-700 ring-emerald-200/75",
        }
      : activeLessonProgressStatus === "in_progress"
        ? {
            label: "In progress",
            className: "bg-amber-50 text-amber-700 ring-amber-200/75",
          }
        : {
            label: "Ready to start",
            className: "bg-slate-50 text-slate-700 ring-slate-200/75",
          };
  const doneConfirmedAt = doneConfirmationByLessonId[activeLesson.id] ?? null;
  const doneConfirmedLabel = useMemo(() => {
    if (!doneConfirmedAt) return null;
    const parsed = Date.parse(doneConfirmedAt);
    if (!Number.isFinite(parsed)) return null;
    return new Date(parsed).toLocaleString();
  }, [doneConfirmedAt]);
  const showVideoOverlay = !videoStarted || videoPaused;
  const showResumeState = videoStarted && videoPaused;
  const showResumeCta = showResumeState || (!videoStarted && resumeAvailable);
  const isSignedIn = courseProgressSyncEnabled && Boolean(signedInUserId);
  const isGuest = courseProgressSyncEnabled && authStateLoaded && !signedInUserId;
  const backupSignInHref = `/auth/sign-in?next=${encodeURIComponent(
    `${pathname}?lesson=${encodeURIComponent(activeLesson.id)}`
  )}`;
  const courseProgressStatusCopy = previewEnabled
    ? "Preview progress is local only and isolated from learner progress."
    : isSignedIn
      ? courseSyncStatus === "error"
        ? "Sync paused right now. We'll retry automatically."
        : courseSyncStatus === "syncing"
          ? "Syncing lesson progress to your account..."
          : formatSyncStatusAgeLabel(lastCourseSyncAtMs)
      : null;

  const supportCardClass =
    "rounded-2xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.92))] shadow-[0_10px_24px_rgba(15,23,42,0.065)] lg:border-slate-300/70 lg:bg-white/96 lg:shadow-[0_14px_34px_rgba(15,23,42,0.08)]";

  useEffect(() => {
    if (previewEnabled || !isGuest) {
      setShowBackupPrompt(false);
      return;
    }
    if (doneLessonsCount < BACKUP_PROMPT_MIN_DONE_LESSONS) return;

    try {
      const dismissedAtMs = parseStoredTimestamp(
        localStorage.getItem(BACKUP_PROMPT_DISMISSED_AT_KEY)
      );
      if (dismissedAtMs && Date.now() - dismissedAtMs < BACKUP_PROMPT_COOLDOWN_MS) {
        return;
      }
    } catch {}

    setShowBackupPrompt(true);
  }, [doneLessonsCount, isGuest, previewEnabled]);

  useEffect(() => {
    setDoneGateFeedback(null);
  }, [activeLesson.id]);

  useEffect(() => {
    if (drawerOpen) {
      resetSwipeGesture();
    }
  }, [drawerOpen, resetSwipeGesture]);

  useEffect(() => {
    setOverviewJumpIndex(null);
  }, [activeLesson.id]);

  useEffect(() => {
    resetSwipeGesture();
  }, [activeLesson.id, resetSwipeGesture]);

  useEffect(() => {
    videoStartedRef.current = videoStarted;
  }, [videoStarted]);

  useEffect(() => {
    if (!videoStarted) return;

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
  }, [videoStarted]);

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

  const tryStartPlayback = useCallback(
    (restoreFromSaved = false) => {
      const player = youtubePlayerRef.current as {
        playVideo?: () => void;
        seekTo?: (seconds: number, allowSeekAhead?: boolean) => void;
      } | null;
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
    },
    [activeLesson.id]
  );

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
              knownProgressLessonIdsRef.current.add(lessonIdForPlayer);
              playbackProgressRef.current[lessonIdForPlayer] = 0;
              persistPlaybackProgress();
              markCourseProgressDirty(lessonIdForPlayer);
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
    markCourseProgressDirty,
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
      id: "course-prev",
      kind: "button",
      label: "Prev",
      testId: "course-nav-left",
      disabled: true,
      skin: "muted",
      ariaLabel: "No previous lesson",
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

  const activeSwipeProgress = swipeHint?.progress ?? 0;
  const swipeVisualStrength = Math.min(1, Math.max(0, (activeSwipeProgress - 0.08) / (1 - 0.08)));
  const swipeNearThreshold = activeSwipeProgress >= 0.72;
  const swipeBlueStrength = Math.min(1, Math.max(0, (activeSwipeProgress - 0.72) / 0.28));
  const swipeShapeWidth = 58 + swipeVisualStrength * 68;
  const swipeShapeOpacity = 0.01 + swipeVisualStrength * 0.36;
  const swipeIconOpacity = Math.min(1, Math.max(0, (swipeVisualStrength - 0.12) / 0.88));
  const swipeIconScale = 0.94 + swipeVisualStrength * 0.08;
  const swipeIconRevealOffset = SWIPE_HINT_REVEAL_PX * (1 - swipeVisualStrength);

  const swipeHintOverlay =
    swipeHint && !drawerOpen ? (
      <div
        aria-hidden
        className={cx(
          "pointer-events-none fixed top-[72px] bottom-[calc(88px+env(safe-area-inset-bottom))] z-40 sm:hidden",
          swipeHint.direction === "prev" ? "left-0" : "right-0"
        )}
        style={{ width: `${swipeShapeWidth}px` }}
      >
        <div className="absolute inset-0 flex items-center">
          <svg
            viewBox="0 0 120 100"
            preserveAspectRatio="none"
            shapeRendering="geometricPrecision"
            style={{
              opacity: swipeShapeOpacity,
            }}
            className={cx(
              "h-full w-full transition-[width,opacity] duration-[120ms] ease-out",
              swipeHint.direction === "next" && "-scale-x-100"
            )}
          >
            <path
              d="M0 0 C72 6 108 26 120 50 C108 74 72 94 0 100 Z"
              fill="rgba(148,163,184,0.82)"
            />
            <path d="M0 0 C56 8 88 28 100 50 C88 72 56 92 0 100 Z" fill="rgba(203,213,225,0.68)" />
            <path
              d="M0 0 C56 8 88 28 100 50 C88 72 56 92 0 100 Z"
              fill="rgba(59,130,246,0.52)"
              opacity={0.22 * swipeBlueStrength}
            />
          </svg>
        </div>
        <div
          className={cx(
            "absolute top-1/2 left-1/2 flex h-[72px] w-[44px] items-center justify-center rounded-full border bg-white/92 text-slate-600 shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition-[transform,opacity,color,border-color,background-color] duration-[120ms] ease-out",
            swipeNearThreshold
              ? "border-blue-300/88 bg-blue-50/92 text-blue-700"
              : "border-slate-300/82"
          )}
          style={{
            transform: `translate(-50%, -50%) translateX(${
              swipeHint.direction === "prev" ? -swipeIconRevealOffset : swipeIconRevealOffset
            }px) scale(${swipeIconScale})`,
            opacity: swipeIconOpacity,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={cx(
              "h-5 w-5 transition-transform duration-[120ms] ease-out",
              swipeHint.direction === "next" && "-scale-x-100"
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.45}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 5 8 12l6.5 7" />
          </svg>
        </div>
      </div>
    ) : null;

  const swipeNuxToast =
    showSwipeNux && !drawerOpen ? (
      <div className="fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 px-5 sm:hidden">
        <div className="mx-auto max-w-[520px] rounded-2xl border border-slate-200/78 bg-white/95 px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <p className="flex-1 text-[12px] leading-5 font-medium text-slate-700">
              Swipe from either side to switch lessons, or use{" "}
              <span className="font-semibold">Lessons</span> and{" "}
              <span className="font-semibold">Next/Prev</span>.
            </p>
            <PressButton
              tier="nav"
              onClick={dismissSwipeNux}
              className="inline-flex min-h-[28px] shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/75"
              aria-label="Dismiss swipe hint"
            >
              Got it
            </PressButton>
          </div>
        </div>
      </div>
    ) : null;

  const backupProgressPrompt =
    showBackupPrompt && !drawerOpen ? (
      <div
        data-testid="course-backup-prompt"
        className="fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[75] px-4 sm:bottom-6"
      >
        <div className="fs-library-card fs-library-card-accent mx-auto max-w-[520px] p-4 sm:p-5">
          <div className="text-[12px] font-semibold text-[color:var(--fs-color-brand-700)]">
            Progress backup
          </div>
          <h3 className="mt-1 text-[17px] font-semibold text-[color:var(--fs-color-ink-strong)]">
            Don&apos;t lose your progress
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-[color:var(--fs-color-muted)]">
            You&apos;ve completed {doneLessonsCount} lessons. Create a free account to back up and
            sync your progress across devices.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PressLink
              tier="cta"
              href={backupSignInHref}
              onClick={dismissBackupPrompt}
              className="fs-cta-primary inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              Create free account
            </PressLink>
            <PressButton
              tier="nav"
              onClick={dismissBackupPrompt}
              className="fs-cta-secondary inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              aria-label="Maybe later"
            >
              Maybe later
            </PressButton>
          </div>
        </div>
      </div>
    ) : null;

  const courseInstallFeedbackId = "course-install-prompt-feedback";
  const courseInstallIosGuideId = "course-install-ios-guide";
  const courseInstallMacSafariGuideId = "course-install-mac-safari-guide";
  const courseInstallDescriptionId = installPromptFeedback
    ? courseInstallFeedbackId
    : showInstallIosGuide
      ? courseInstallIosGuideId
      : showInstallMacSafariGuide
        ? courseInstallMacSafariGuideId
        : undefined;

  const autoInstallPrompt =
    showInstallPrompt && !showBackupPrompt && !drawerOpen ? (
      <div
        data-testid="a2hs-auto-prompt"
        className="fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[70] px-4 sm:bottom-6"
      >
        <div className={COURSE_INSTALL_PROMPT_CARD_CLASS}>
          <div className="text-[11px] font-semibold tracking-[0.08em] text-blue-700 uppercase">
            Quick access
          </div>
          <h3 className="mt-1 text-[17px] font-semibold text-slate-900">Install app</h3>
          {!showInstallIosGuide && !showInstallMacSafariGuide ? (
            <p className="mt-1 text-[13px] leading-6 text-slate-700">
              Open FreeSwimming directly from your home screen, Dock, or Start menu and continue
              where you left off.
            </p>
          ) : null}
          {showInstallIosGuide ? (
            <InstallFeedback
              id={courseInstallIosGuideId}
              tone="info"
              title="Install on iPhone/iPad (Safari)"
              className={cx("mt-2", COURSE_INSTALL_PROMPT_FEEDBACK_PANEL_CLASS)}
              testId="course-install-ios-guide"
            >
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-6 text-slate-700">
                <li>Tap Share.</li>
                <li>Choose “Add to Home Screen”.</li>
                <li>Tap “Add”.</li>
              </ol>
            </InstallFeedback>
          ) : null}
          {showInstallMacSafariGuide ? (
            <InstallFeedback
              id={courseInstallMacSafariGuideId}
              tone="info"
              title="Install on Mac (Safari)"
              className={cx("mt-2", COURSE_INSTALL_PROMPT_FEEDBACK_PANEL_CLASS)}
              testId="course-install-mac-safari-guide"
            >
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-6 text-slate-700">
                <li>Open File in Safari.</li>
                <li>Choose Add to Dock.</li>
                <li>Click Add.</li>
              </ol>
            </InstallFeedback>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!showInstallIosGuide && !showInstallMacSafariGuide && !showInstallSuccessNotice ? (
              <>
                <PressButton
                  tier="cta"
                  onClick={handleInstallFromPrompt}
                  disabled={installPromptBusy || install.isInstalled}
                  aria-describedby={courseInstallDescriptionId}
                  className={COURSE_INSTALL_PROMPT_PRIMARY_ACTION_CLASS}
                  aria-label="Install app"
                >
                  {install.isInstalled
                    ? "Installed"
                    : installPromptBusy
                      ? "Checking..."
                      : "Install app"}
                </PressButton>
                <PressButton
                  tier="nav"
                  onClick={dismissInstallPrompt}
                  className={COURSE_INSTALL_PROMPT_SECONDARY_ACTION_CLASS}
                  aria-label="Not now"
                >
                  Not now
                </PressButton>
              </>
            ) : (
              <>
                <PressButton
                  tier="cta"
                  onClick={
                    showInstallSuccessNotice
                      ? closeInstallSuccessNotice
                      : showInstallMacSafariGuide
                        ? closeMacSafariInstallGuide
                        : closeIosInstallGuide
                  }
                  className={COURSE_INSTALL_PROMPT_PRIMARY_ACTION_CLASS}
                >
                  Done
                </PressButton>
                {!showInstallSuccessNotice ? (
                  <PressButton
                    tier="nav"
                    onClick={dismissInstallPrompt}
                    className={COURSE_INSTALL_PROMPT_SECONDARY_ACTION_CLASS}
                    aria-label="Not now"
                  >
                    Not now
                  </PressButton>
                ) : null}
              </>
            )}
          </div>

          {installPromptFeedback ? (
            <InstallFeedback
              id={courseInstallFeedbackId}
              tone={installPromptFeedback.tone}
              className={cx("mt-3", COURSE_INSTALL_PROMPT_FEEDBACK_PANEL_CLASS)}
              testId="course-install-prompt-feedback"
            >
              {installPromptFeedback.message}
            </InstallFeedback>
          ) : null}
        </div>
      </div>
    ) : null;

  const previewLessonIndex = overviewJumpIndex ?? currentLessonIndex;
  const safePreviewLessonIndex = Math.min(
    Math.max(0, previewLessonIndex),
    Math.max(0, lessonJumpMeta.length - 1)
  );
  const previewProgressPct =
    totalLessons <= 1 ? 0 : (safePreviewLessonIndex / Math.max(1, totalLessons - 1)) * 100;
  const sliderTrackBackground = `linear-gradient(90deg, rgba(59,130,246,0.92) 0%, rgba(59,130,246,0.92) ${previewProgressPct}%, rgba(203,213,225,0.88) ${previewProgressPct}%, rgba(203,213,225,0.88) 100%)`;
  const previewLessonMeta = lessonJumpMeta[safePreviewLessonIndex] ?? lessonJumpMeta[0];

  const applyOverviewJump = useCallback(
    (targetIndex: number | null) => {
      if (targetIndex == null) return;
      const clampedIndex = Math.min(
        Math.max(0, targetIndex),
        Math.max(0, lessonJumpMeta.length - 1)
      );
      const targetLesson = lessonJumpMeta[clampedIndex]?.lesson;
      if (!targetLesson || targetLesson.id === activeLesson.id) {
        setOverviewJumpIndex(null);
        return;
      }
      setOverviewJumpIndex(null);
      goToLesson(targetLesson.id, { scrollToPlayer: false });
    },
    [activeLesson.id, goToLesson, lessonJumpMeta]
  );

  const setOverviewDragging = useCallback((next: boolean) => {
    overviewJumpDraggingRef.current = next;
    setIsOverviewJumpDragging(next);
  }, []);

  const commitOverviewJump = useCallback(
    (explicitIndex?: number) => {
      setOverviewDragging(false);
      applyOverviewJump(explicitIndex ?? overviewJumpIndex ?? currentLessonIndex);
    },
    [applyOverviewJump, currentLessonIndex, overviewJumpIndex, setOverviewDragging]
  );

  const handleOverviewSliderPointerDown = useCallback(
    (event: React.PointerEvent<HTMLInputElement>) => {
      if (totalLessons <= 1) return;

      const track = event.currentTarget;
      const rect = track.getBoundingClientRect();
      const currentRatio = safePreviewLessonIndex / Math.max(1, totalLessons - 1);
      const thumbX = rect.left + currentRatio * rect.width;
      const deltaFromThumb = event.clientX - thumbX;

      // Tap left/right of thumb steps one lesson; touching near thumb enables drag.
      if (Math.abs(deltaFromThumb) > 14) {
        event.preventDefault();
        const direction = deltaFromThumb > 0 ? 1 : -1;
        const steppedIndex = Math.min(
          totalLessons - 1,
          Math.max(0, safePreviewLessonIndex + direction)
        );
        setOverviewJumpIndex(steppedIndex);
        setOverviewDragging(true);
        return;
      }

      setOverviewDragging(true);
    },
    [safePreviewLessonIndex, setOverviewDragging, totalLessons]
  );

  const previewBanner = previewEnabled ? (
    <section
      className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
      data-testid="course-preview-mode-banner"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-amber-900">
          Preview mode - not visible to learners
        </p>
        <span className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
          {PREVIEW_MODE_COPY[previewMode]}
        </span>
        {previewContextLabel ? (
          <span className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-800">
            {previewContextLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-amber-800">
        Preview state is isolated to this browser and does not change learner progress.
      </p>
    </section>
  ) : null;

  const previewSurfaceState = previewEnabled
    ? courseContentLoadState === "loading" || courseContentLoadState === "idle"
      ? "loading"
      : courseContentLoadState === "error"
        ? "error"
        : courseModules.length === 0
          ? "empty"
          : "ready"
    : "ready";

  if (previewEnabled && previewSurfaceState !== "ready") {
    return (
      <SiteChrome
        menu={{
          mode: "custom",
          isOpen: drawerOpen,
          onOpen: () => {
            setDrawerView("main");
            setDrawerOpen(true);
          },
          onClose: () => setDrawerOpen(false),
          ariaLabel: "Toggle main menu",
        }}
        bottomBar={bottomBar}
      >
        <PageTemplate size="wide" showBack={false}>
          <PageIntro
            title="Free Course"
            subtitle="Learn. Drill. Swim."
            variant="compact"
            brandMarkClassName="h-auto w-full"
            brandMarkTestId="course-intro-brand-mark"
            rightSlotClassName="hidden sm:block"
            belowDivider={
              <div className="flex items-baseline gap-1 text-[12px] font-medium sm:text-[13px]">
                <span className="shrink-0 text-slate-500">Current lesson:</span>
                <span className="min-w-0 truncate text-slate-800">{activeLesson.title}</span>
              </div>
            }
          />
          {previewBanner}
          <section className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            {previewSurfaceState === "loading" ? (
              <p className="text-sm text-slate-700">Loading preview content...</p>
            ) : null}
            {previewSurfaceState === "empty" ? (
              <p className="text-sm text-slate-700">
                No lessons available for this preview mode yet. Publish or reclassify content and
                try again.
              </p>
            ) : null}
            {previewSurfaceState === "error" ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-rose-700">
                  {courseContentError ?? "Could not load preview content."}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <PressButton
                    tier="nav"
                    onClick={() => router.refresh()}
                    className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
                  >
                    Retry
                  </PressButton>
                  <PressLink
                    tier="nav"
                    href={
                      requestedLessonId
                        ? `/course?lesson=${encodeURIComponent(requestedLessonId)}`
                        : "/course"
                    }
                    className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
                  >
                    Open learner view
                  </PressLink>
                </div>
              </div>
            ) : null}
          </section>
        </PageTemplate>
      </SiteChrome>
    );
  }

  return (
    <SiteChrome
      menu={{
        mode: "custom",
        isOpen: drawerOpen,
        onOpen: () => {
          setDrawerView("main");
          setDrawerOpen(true);
        },
        onClose: () => setDrawerOpen(false),
        ariaLabel: "Toggle main menu",
      }}
      bottomBar={bottomBar}
    >
      <PageTemplate size="wide" showBack={false}>
        <div
          data-testid="course-page"
          data-course-content-state={courseContentLoadState}
          data-active-lesson-id={activeLesson.id}
          data-has-resolved-requested-lesson={hasResolvedRequestedLesson ? "true" : "false"}
          className="touch-pan-y"
          onTouchStart={handleSwipeStart}
          onTouchMove={handleSwipeMove}
          onTouchEnd={handleSwipeEnd}
          onTouchCancel={resetSwipeGesture}
        >
          <div ref={playerTopRef} />

          <PageIntro
            title="Free Course"
            subtitle="Learn. Drill. Swim."
            variant="compact"
            brandMarkClassName="h-auto w-full"
            brandMarkTestId="course-intro-brand-mark"
            rightSlotClassName="hidden sm:block"
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
                ariaLabel={isCourseDrawerOpen ? "Close lessons" : "Open lessons"}
              >
                {isCourseDrawerOpen ? "Close" : "Lessons"}
              </CourseNavButton>
            }
          />
          {previewBanner}

          <div className={styles.playerStack}>
            <section
              className={cx(
                styles.overviewPanel,
                "rounded-[20px] border border-slate-200/65 bg-white/90 p-3 shadow-[0_5px_14px_rgba(15,23,42,0.045)] lg:border-slate-300/70 lg:bg-white/96 lg:shadow-[0_10px_26px_rgba(15,23,42,0.08)]"
              )}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold text-slate-900">
                      <span>{overviewLabel.lesson}</span>
                      <span className="text-slate-300">•</span>
                      <span>{overviewLabel.module}</span>
                      <span className="text-slate-300">•</span>
                      <span
                        data-testid="course-lesson-status-chip"
                        className={cx(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                          activeLessonStatusMeta.className
                        )}
                      >
                        {activeLessonStatusMeta.label}
                      </span>
                    </div>
                    <PressButton
                      tier="nav"
                      onClick={toggleLessonDone}
                      disabled={markDoneBlockedByGate}
                      aria-pressed={isLessonDone}
                      aria-describedby={doneGateFeedback ? "course-done-gate-feedback" : undefined}
                      data-testid="course-mark-done-button"
                      className={cx(
                        "inline-flex min-h-[30px] shrink-0 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1",
                        isLessonDone
                          ? "bg-blue-50 text-blue-700 ring-blue-100/80"
                          : markDoneBlockedByGate
                            ? "cursor-not-allowed bg-slate-100/90 text-slate-400 ring-slate-200/80"
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
                  {!lessonContentReady ? (
                    <p
                      id="course-done-gate-feedback"
                      className="mt-1 text-[12px] font-medium text-slate-600"
                    >
                      Loading lesson details...
                    </p>
                  ) : markDoneBlockedByGate ? (
                    <p
                      id="course-done-gate-feedback"
                      className="mt-1 text-[12px] font-medium text-amber-700"
                    >
                      Check pass criteria below to unlock Mark as done.
                    </p>
                  ) : doneGateFeedback ? (
                    <p
                      id="course-done-gate-feedback"
                      className="mt-1 text-[12px] font-medium text-amber-700"
                    >
                      {doneGateFeedback}
                    </p>
                  ) : null}
                </div>

                <div className="hidden gap-2 sm:flex sm:pt-1">
                  {isFirstLesson ? (
                    <CourseNavButton
                      grow={false}
                      disabled
                      skin="muted"
                      className="px-4 py-2"
                      ariaLabel="No previous lesson"
                    >
                      Prev
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
                    className="inline-flex min-h-[42px] items-center justify-center rounded-2xl bg-white/92 px-3 py-2 text-[13px] font-semibold text-slate-800 ring-1 ring-slate-200/70 lg:bg-white lg:ring-slate-300/70"
                  >
                    {overviewExpanded ? "Hide details" : "Overview details"}
                  </PressButton>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div
                  className="flex-1 overflow-hidden rounded-full bg-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] ring-1 ring-slate-200/75"
                  role="progressbar"
                  aria-label="Course progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={donePct}
                  aria-valuetext={`${doneLessonsCount} of ${totalLessons} lessons marked done (${donePct}%), ${inProgressLessonsCount} in progress. Current: ${overviewLabel.lesson}.`}
                >
                  <div className="flex h-[10px] w-full overflow-hidden rounded-full bg-slate-200/95">
                    {courseLessonsFlat.map((lesson, index) => {
                      const isCurrentSegment = index === currentLessonIndex;
                      const lessonProgressStatus =
                        lessonProgressStatusById[lesson.id] ?? "not_started";
                      const isDoneSegment = lessonProgressStatus === "done";
                      const isInProgressSegment = lessonProgressStatus === "in_progress";
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
                                : isInProgressSegment
                                  ? "bg-amber-400/90"
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

              {isSignedIn && courseProgressStatusCopy ? (
                <CourseProgressSyncStatus
                  state={courseSyncStatus}
                  label={courseProgressStatusCopy}
                  onRetry={() => void syncCourseProgressNow({ force: true })}
                  className="mt-2"
                />
              ) : null}

              <div className="mt-2 sm:hidden">
                <PressButton
                  tier="nav"
                  onClick={toggleOverview}
                  aria-expanded={overviewExpanded}
                  aria-controls="course-overview-details"
                  className="inline-flex min-h-[42px] w-full items-center justify-center rounded-2xl bg-white/90 px-3 py-2 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200/65 lg:bg-white lg:ring-slate-300/70"
                >
                  {overviewExpanded ? "Hide details" : "Overview details"}
                </PressButton>
              </div>

              {overviewExpanded ? (
                <div
                  id="course-overview-details"
                  className="mt-2 rounded-2xl border border-slate-200/68 bg-white/78 p-3 lg:border-slate-300/65 lg:bg-white/92"
                >
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/72 p-3">
                    <div className="text-[12px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                      Jump to lesson
                    </div>
                    {previewLessonMeta ? (
                      <>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-slate-900">
                              {previewLessonMeta.lesson.title}
                            </div>
                            <div className="truncate text-[12px] font-medium text-slate-600">
                              {previewLessonMeta.moduleTitle}
                            </div>
                          </div>
                          <span
                            className={cx(
                              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition-all duration-150",
                              previewLessonMeta.lesson.id === activeLesson.id
                                ? "bg-blue-50 text-blue-700 ring-blue-100/80"
                                : lessonProgressStatusById[previewLessonMeta.lesson.id] === "done"
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-100/80"
                                  : lessonProgressStatusById[previewLessonMeta.lesson.id] ===
                                      "in_progress"
                                    ? "bg-amber-50 text-amber-700 ring-amber-200/80"
                                    : "bg-white text-slate-700 ring-slate-200/75",
                              isOverviewJumpDragging &&
                                "scale-[1.03] shadow-[0_8px_20px_rgba(37,99,235,0.16)]"
                            )}
                          >
                            <span className="block leading-[1.15]">
                              Module {previewLessonMeta.moduleIndex} of{" "}
                              {previewLessonMeta.moduleCount}
                            </span>
                            <span className="mt-0.5 block text-[10px] leading-[1.15] font-medium text-slate-600">
                              Lesson {previewLessonMeta.globalLessonIndex} of {totalLessons}
                            </span>
                          </span>
                        </div>

                        <input
                          type="range"
                          min={1}
                          max={Math.max(1, totalLessons)}
                          value={safePreviewLessonIndex + 1}
                          onChange={(event) => {
                            const next = Number(event.target.value);
                            if (Number.isNaN(next)) return;
                            setOverviewJumpIndex(next - 1);
                          }}
                          onPointerDown={handleOverviewSliderPointerDown}
                          onPointerUp={() => {
                            if (!overviewJumpDraggingRef.current) return;
                            commitOverviewJump();
                          }}
                          onPointerCancel={() => setOverviewDragging(false)}
                          onBlur={() => {
                            if (!overviewJumpDraggingRef.current) return;
                            if (overviewJumpIndex == null) {
                              setOverviewDragging(false);
                              return;
                            }
                            commitOverviewJump();
                          }}
                          aria-label="Jump to lesson"
                          aria-valuetext={`${previewLessonMeta.lesson.title}. Lesson ${safePreviewLessonIndex + 1} of ${totalLessons}.`}
                          className={cx(
                            "lesson-jump-slider mt-2 h-2.5 w-full cursor-pointer appearance-none rounded-full",
                            isOverviewJumpDragging && "is-dragging"
                          )}
                          style={{ background: sliderTrackBackground }}
                        />
                      </>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <div className="mt-3 text-[12px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                      Additional information
                    </div>
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-slate-600">
                    {isLastLesson
                      ? "Last lesson in this course."
                      : "Use Lessons to jump to any module or lesson."}
                    {previewEnabled && courseProgressStatusCopy ? (
                      <span className="ml-2 text-slate-500">{courseProgressStatusCopy}</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>

            <section
              data-testid="course-player-card"
              className={cx(
                styles.playerPanel,
                "rounded-[24px] border border-slate-200/72 bg-white/96 p-3 shadow-[0_14px_32px_rgba(15,23,42,0.08)] lg:border-slate-300/70 lg:bg-white lg:p-4"
              )}
            >
              <div className="relative overflow-hidden rounded-[20px] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/75">
                {!showVideoOverlay ? (
                  <>
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-0 z-[3] w-[22%] max-w-[112px] min-w-[68px] touch-pan-y"
                      onTouchStart={(event) => beginSwipeFromVideoEdge("prev", event)}
                      onTouchMove={(event) => {
                        event.stopPropagation();
                        handleSwipeMove(event);
                      }}
                      onTouchEnd={(event) => {
                        event.stopPropagation();
                        handleSwipeEnd(event);
                      }}
                      onTouchCancel={(event) => {
                        event.stopPropagation();
                        resetSwipeGesture();
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-y-0 right-0 z-[3] w-[22%] max-w-[112px] min-w-[68px] touch-pan-y"
                      onTouchStart={(event) => beginSwipeFromVideoEdge("next", event)}
                      onTouchMove={(event) => {
                        event.stopPropagation();
                        handleSwipeMove(event);
                      }}
                      onTouchEnd={(event) => {
                        event.stopPropagation();
                        handleSwipeEnd(event);
                      }}
                      onTouchCancel={(event) => {
                        event.stopPropagation();
                        resetSwipeGesture();
                      }}
                    />
                  </>
                ) : null}

                <div className="aspect-video w-full bg-slate-950">
                  <div ref={videoFrameRef} className="h-full w-full" />
                </div>

                {showVideoOverlay ? (
                  <PressButton
                    tier="card"
                    onClick={videoStarted ? resumePlayback : startVideoPlayback}
                    data-testid="course-video-overlay"
                    className="absolute inset-0 z-[2] w-full overflow-hidden bg-slate-950 p-4 text-left sm:p-5 lg:p-7"
                    aria-label={
                      showResumeCta
                        ? `Resume lesson: ${activeLesson.title}`
                        : `Play lesson: ${activeLesson.title}`
                    }
                  >
                    <Image
                      data-testid="course-video-poster"
                      src={activeLessonPosterUrl}
                      alt=""
                      aria-hidden="true"
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 640px) 282px, 880px"
                      className="object-cover opacity-[0.82] saturate-[0.92]"
                    />
                    <div className={styles.posterScrim} />
                    <div className={styles.overlayLayout}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                          <BrandImage
                            asset={BRAND_USAGE.compactSymbol}
                            decorative
                            className="h-8 w-auto shrink-0 drop-shadow-[0_2px_8px_rgba(15,23,42,0.35)]"
                            sizes="32px"
                          />
                          <span className="truncate rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-slate-700 uppercase ring-1 ring-white/50">
                            {overviewLabel.moduleName}
                          </span>
                        </span>
                        {overviewLabel.duration ? (
                          <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-white/50">
                            {overviewLabel.duration}
                          </span>
                        ) : null}
                      </div>

                      <div className={styles.videoCopy}>
                        <div data-testid="course-video-title" className={styles.videoTitle}>
                          {activeLesson.title}
                        </div>
                        {activeLesson.goal ? (
                          <p className={styles.videoGoal}>{activeLesson.goal}</p>
                        ) : null}
                        <div className="mt-3 flex items-center justify-center lg:justify-start">
                          <span
                            data-testid="course-video-play-cta"
                            className={cx(
                              "inline-flex min-h-[38px] w-full max-w-[250px] items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.30)] ring-1 ring-white/25 transition-colors duration-200 sm:min-h-[40px] sm:text-[14px] lg:min-h-[46px] lg:max-w-[180px] lg:px-5 lg:text-[15px]",
                              showResumeCta
                                ? "bg-gradient-to-b from-blue-400 to-blue-500"
                                : "bg-gradient-to-b from-blue-500 to-blue-600"
                            )}
                          >
                            <span
                              aria-hidden
                              className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white"
                            />
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
                        Up next:{" "}
                        <span className="font-semibold text-slate-800">{nextLesson.title}</span>
                      </>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        Last lesson in this course
                      </span>
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
          </div>

          {showLessonExperienceSections ? (
            <section
              data-testid="course-lesson-experience"
              className="mt-4 space-y-3"
              aria-labelledby="course-lesson-experience-heading"
            >
              <h2 id="course-lesson-experience-heading" className="sr-only">
                Lesson practice
              </h2>

              <div className="grid gap-3 lg:grid-cols-2">
                <article
                  data-testid="course-lesson-focus"
                  className="rounded-[28px] border border-slate-200/72 bg-white/96 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.075)] lg:col-span-2 lg:border-slate-300/68 lg:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                        Lesson focus
                      </p>
                      <h2 className="mt-1 text-[20px] leading-7 font-semibold text-slate-950">
                        {activeLesson.title}
                      </h2>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[13px] font-semibold text-blue-700 ring-1 ring-blue-100/80">
                      {lessonExperience.primaryCue}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-slate-200/72 pt-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)_minmax(0,1fr)] lg:divide-x lg:divide-slate-200/72 lg:border-t-0 lg:pt-0">
                    {showGoalSection ? (
                      <div className="lg:pr-4">
                        <p className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                          Goal
                        </p>
                        <h3 className="mt-2 text-[17px] leading-7 font-semibold text-slate-950">
                          {lessonExperience.goal}
                        </h3>
                      </div>
                    ) : null}

                    <div
                      className={cx(
                        showGoalSection &&
                          "border-t border-slate-200/72 pt-4 lg:border-t-0 lg:px-4 lg:pt-0"
                      )}
                    >
                      <p className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                        Quick explanation
                      </p>
                      <p className="mt-2 text-[15px] leading-7 text-slate-700">
                        {lessonExperience.quickExplanation}
                      </p>
                    </div>

                    {showWhyThisMattersSection ? (
                      <div
                        data-testid="course-lesson-why-this-matters"
                        className="border-t border-blue-100/80 bg-blue-50/50 pt-4 lg:border-t-0 lg:bg-transparent lg:pt-0 lg:pl-4"
                      >
                        <p className="text-[12px] font-semibold tracking-wide text-blue-700 uppercase">
                          Why this matters
                        </p>
                        <p className="mt-2 text-[15px] leading-7 font-medium text-slate-800">
                          {lessonExperience.whyThisMatters}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </article>

                {showDrillSection ? (
                  <>
                    <article className="overflow-hidden rounded-[28px] border border-slate-200/72 bg-white/96 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.075)] sm:p-4 lg:col-span-2 lg:border-slate-300/68">
                      <div className="grid gap-5 md:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] md:items-start">
                        <CoursePracticeMediaFrame
                          practice={lessonExperience.landPractice}
                          tone="land"
                        />
                        <div className="px-1 pb-2 sm:px-2 md:py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                              Land practice
                            </p>
                            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/72">
                              Before water
                            </span>
                          </div>
                          <h3 className="mt-3 text-[18px] leading-7 font-semibold text-slate-950">
                            {lessonExperience.landPractice.title}
                          </h3>
                          <CoursePracticeSteps
                            steps={lessonExperience.landPractice.steps}
                            tone="land"
                          />
                        </div>
                      </div>
                    </article>

                    <article className="overflow-hidden rounded-[28px] border border-blue-100/90 bg-white/96 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.075)] sm:p-4 lg:col-span-2">
                      <div className="grid gap-5 md:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] md:items-start">
                        <CoursePracticeMediaFrame
                          practice={lessonExperience.waterPractice}
                          tone="water"
                        />
                        <div className="px-1 pb-2 sm:px-2 md:py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                              Water practice
                            </p>
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100/80">
                              {drillBadgeLabel}
                            </span>
                          </div>
                          <h3 className="mt-3 text-[18px] leading-7 font-semibold text-slate-950">
                            {lessonExperience.waterPractice.title}
                          </h3>
                          <CoursePracticeSteps
                            steps={lessonExperience.waterPractice.steps}
                            tone="water"
                          />
                          {lessonExperience.waterPractice.safetyNote ? (
                            <p className="mt-4 rounded-2xl border border-amber-200/72 bg-amber-50/75 px-3 py-2 text-[13px] leading-6 font-medium text-amber-900">
                              {lessonExperience.waterPractice.safetyNote}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </>
                ) : null}

                {showCuesSection ? (
                  <article className="rounded-[24px] border border-slate-200/72 bg-white/94 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] lg:col-span-2 lg:border-slate-300/68 lg:bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                          Feel cues
                        </p>
                        <p className="mt-1 text-[12px] font-medium text-slate-500">
                          Use these immediately after the water practice.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100/80">
                        Choose one
                      </span>
                    </div>
                    <ul className="mt-3 grid gap-2 text-[14px] leading-6 text-slate-800 sm:grid-cols-3">
                      {lessonExperience.feelCues.map((cue) => (
                        <li
                          key={cue}
                          className="rounded-2xl border border-slate-200/72 bg-slate-50/72 px-3 py-2"
                        >
                          {cue}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[12px] font-medium text-slate-500">
                      Keep it simple: choose one cue per session.
                    </p>
                  </article>
                ) : null}

                {showCommonMistakesSection ? (
                  <article className="rounded-[24px] border border-slate-200/72 bg-white/94 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] lg:col-span-2 lg:border-slate-300/68 lg:bg-white">
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
                      <div className="mt-3">
                        <div
                          aria-hidden="true"
                          className="hidden grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 rounded-xl bg-slate-50/80 px-3 py-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase ring-1 ring-slate-200/70 sm:grid"
                        >
                          <span>Common mistake</span>
                          <span>Correction</span>
                        </div>
                        <ul
                          id="common-mistakes-list"
                          className="mt-2 space-y-2 text-[14px] leading-7 text-slate-800"
                        >
                          {commonMistakes.map((mistake) => (
                            <li
                              key={`${mistake.mistake}-${mistake.fix ?? "fallback"}`}
                              data-testid="course-common-mistake-row"
                              className="grid gap-2 rounded-2xl border border-slate-200/72 bg-white/78 p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                            >
                              <div>
                                <span className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:hidden">
                                  Common mistake
                                </span>
                                <span className="font-semibold text-slate-950">
                                  {mistake.mistake}
                                </span>
                              </div>
                              <div>
                                <span className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:hidden">
                                  Correction
                                </span>
                                {mistake.fix ? (
                                  <span className="text-slate-700">{mistake.fix}</span>
                                ) : (
                                  <span className="text-slate-500">Correction not added yet</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="mt-2 text-[12px] font-medium text-slate-600">
                        Expand to review common errors for this lesson.
                      </p>
                    )}
                  </article>
                ) : null}

                {showPassCriteria ? (
                  <article className={cx("p-5", supportCardClass)}>
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <div className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                        Pass criteria
                      </div>
                      <button
                        type="button"
                        onClick={toggleLessonDone}
                        disabled={markDoneBlockedByGate}
                        aria-pressed={isLessonDone}
                        data-testid="course-pass-criteria-mark-done-button"
                        className={cx(
                          "mt-1 inline-flex min-h-[30px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1 transition",
                          isLessonDone
                            ? "bg-blue-50 text-blue-700 ring-blue-100/80"
                            : markDoneBlockedByGate
                              ? "cursor-not-allowed bg-slate-100/90 text-slate-400 ring-slate-200/80"
                              : "bg-white/92 text-slate-700 ring-slate-200/72 hover:bg-slate-50"
                        )}
                      >
                        {isLessonDone ? "Done" : "Mark as done"}
                      </button>
                    </div>
                    {!lessonContentReady ? (
                      <p className="mt-2 text-[13px] leading-6 text-slate-600">
                        Loading pass criteria...
                      </p>
                    ) : doneGateRequired ? (
                      <ul
                        data-testid="course-done-gate-checklist"
                        className="mt-3 space-y-2 text-[13px] leading-6 text-slate-800"
                      >
                        {passCriteria.map((criterion, index) => {
                          const criterionId = `course-done-gate-${activeLesson.id}-${index}`;
                          const checked = doneGateChecksSet.has(criterion);
                          return (
                            <li key={criterionId}>
                              <label
                                htmlFor={criterionId}
                                className="flex cursor-pointer items-start gap-2 rounded-xl bg-white/76 px-2 py-1.5 ring-1 ring-slate-200/70 lg:bg-white/90 lg:ring-slate-300/65"
                              >
                                <input
                                  id={criterionId}
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleDoneGateCriterion(criterion)}
                                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>{criterion}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6 text-slate-800">
                        {passCriteria.map((criterion) => (
                          <li key={criterion}>{criterion}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 border-t border-slate-200/72 pt-2 text-[12px] leading-5 font-medium text-slate-500">
                      {doneGateRequired
                        ? activeLessonProgressStatus === "in_progress"
                          ? "Keep checking off what feels true. When all items are true, mark the lesson done."
                          : "Check off what feels true. When all items are true, mark the lesson done."
                        : doneConfirmedLabel
                          ? `Marked done after criteria check on ${doneConfirmedLabel}.`
                          : "When these are met, mark lesson as done here or in overview."}
                    </p>
                  </article>
                ) : null}

                {showNextStepSection ? (
                  <article className="rounded-[24px] border border-slate-200/72 bg-white/94 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] lg:border-slate-300/68 lg:bg-white">
                    <p className="text-[12px] font-semibold tracking-wide text-slate-500 uppercase">
                      Next step
                    </p>
                    <p className="mt-2 text-[15px] leading-7 text-slate-800">
                      {lessonExperience.nextStep}
                    </p>
                  </article>
                ) : null}
              </div>

              {showExtraHelpCard ? (
                <div data-testid="course-support-card" className={COURSE_SUPPORT_HELP_CARD_CLASS}>
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    {lessonExperience.support.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-5 text-slate-600">
                    {lessonExperience.support.body}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {enabledSupportActions.map((action) => {
                      const isPrimary =
                        configuredPrimarySupportAction !== null &&
                        configuredPrimarySupportAction === action.id;
                      return (
                        <PressLink
                          key={action.id}
                          tier={isPrimary ? "cta" : "nav"}
                          href={action.href}
                          data-testid={`course-support-action-${action.id}`}
                          className={
                            isPrimary
                              ? COURSE_SUPPORT_PRIMARY_ACTION_CLASS
                              : COURSE_SUPPORT_SECONDARY_ACTION_CLASS
                          }
                        >
                          {action.label}
                        </PressLink>
                      );
                    })}
                  </div>
                  {showOpenOnPhoneCard ? (
                    <CourseOpenOnPhoneCard
                      lessonTitle={activeLesson.title}
                      sharePath={openOnPhoneSharePath}
                    />
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}

          {dashboardVisible ? (
            <AdminContextNotesPanel
              contextType="course_lesson"
              contextRef={activeLesson.id}
              contextLabel={`Lesson: ${activeLesson.title} (${activeLesson.id})`}
              includeModuleContextForCourseLesson
              collapsedByDefault
              className="mt-4"
            />
          ) : null}

          <div className="h-6 sm:hidden" aria-hidden />

          <MenuDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            defaultView={drawerView}
            mainItems={mainMenuItems}
            course={{
              activeLessonId: activeLesson.id,
              onSelectLesson: goToLesson,
              doneLessonIds,
              doneGateChecksByLessonId,
              lessonProgressStatusById,
              modules: courseModules,
            }}
            titleMain="Main menu"
            titleCourse="Course menu"
          />
        </div>
      </PageTemplate>
      {swipeHintOverlay}
      {swipeNuxToast}
      {backupProgressPrompt}
      {autoInstallPrompt}
    </SiteChrome>
  );
}
