// app/course/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import MenuDrawer from "@/components/MenuDrawer";

import {
  COURSE_MODULES,
  DEFAULT_LESSON_ID,
  findLesson,
  getNextPrevLessonIds,
  COURSE_LESSONS_FLAT,
  type CourseLesson,
} from "./courseData";

const STORAGE_KEY = "fs_course_last_lesson";

// Main site navigation shown inside the same drawer (no extra modal / no extra route)
const MAIN_MENU_ITEMS = [
  { href: "/", title: "Home", subtitle: "Back to start" },
  { href: "/course", title: "Free course", subtitle: "Modules & lessons" },
  { href: "/programs", title: "Swim programs", subtitle: "Structured plans & PDFs" },
  { href: "/analysis", title: "Video analysis", subtitle: "Personal feedback — optional" },
  { href: "/how-we-teach", title: "How we teach", subtitle: "Learn. Drill. Swim." },
  { href: "/contact", title: "Contact", subtitle: "Questions or help" },
];

export default function CoursePage() {
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

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeLesson.id);
    } catch {}
  }, [activeLesson.id]);

  // Restore last lesson if ?lesson missing
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

  const playerTopRef = useRef<HTMLDivElement | null>(null);

  function goToLesson(lessonId: string) {
    router.push(`${pathname}?lesson=${encodeURIComponent(lessonId)}`);
    setDrawerOpen(false);

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";
    playerTopRef.current?.scrollIntoView({ behavior, block: "start" });
  }

  const youtubeSrc = useMemo(
    () => `https://www.youtube-nocookie.com/embed/${activeLesson.youtubeId}`,
    [activeLesson.youtubeId]
  );
  const youtubeWatchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${activeLesson.youtubeId}`,
    [activeLesson.youtubeId]
  );

  const progressLabel = useMemo(() => {
    const modNum = moduleInfo.moduleIndex >= 0 ? moduleInfo.moduleIndex + 1 : 1;
    const lessonInMod =
      moduleInfo.lessonIndexInModule >= 0 ? moduleInfo.lessonIndexInModule + 1 : 1;
    const lessonGlobal = moduleInfo.lessonIndexGlobal >= 0 ? moduleInfo.lessonIndexGlobal + 1 : 1;

    return {
      top: `Module ${modNum}/${moduleInfo.moduleCount} • Lesson ${lessonInMod}/${moduleInfo.moduleLessonCount}`,
      sub: `Course progress: ${lessonGlobal}/${moduleInfo.totalLessons}`,
    };
  }, [moduleInfo]);

  const progressPct = useMemo(() => {
    const idx = moduleInfo.lessonIndexGlobal >= 0 ? moduleInfo.lessonIndexGlobal + 1 : 1;
    const total = Math.max(1, moduleInfo.totalLessons);
    return Math.min(100, Math.round((idx / total) * 100));
  }, [moduleInfo.lessonIndexGlobal, moduleInfo.totalLessons]);

  // Bottom bar (mobile)
  const bottomBar = (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] sm:hidden">
      <div className="mx-auto max-w-[520px]">
        <div className="rounded-[22px] bg-white/80 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] ring-1 ring-white/70 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!prevId}
              onClick={() => prevId && goToLesson(prevId)}
              className={[
                "flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold transition",
                prevId
                  ? "bg-slate-100/80 text-slate-900"
                  : "cursor-not-allowed bg-slate-100/50 text-slate-400",
              ].join(" ")}
            >
              Prev
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className={[
                "flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold ring-1 ring-white/70 transition",
                drawerOpen ? "bg-slate-100/80 text-slate-900" : "bg-white/90 text-slate-900",
              ].join(" ")}
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? "Close lessons" : "Open lessons"}
            >
              {drawerOpen ? "Back" : "Lessons"}
            </button>

            <button
              type="button"
              disabled={!nextId}
              onClick={() => nextId && goToLesson(nextId)}
              className={[
                "flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold transition",
                nextId
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)]"
                  : "cursor-not-allowed bg-slate-100/50 text-slate-400",
              ].join(" ")}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SiteChrome
      menu={{
        mode: "custom",
        isOpen: drawerOpen,
        onOpen: () => setDrawerOpen(true),
        onClose: () => setDrawerOpen(false),
        ariaLabel: "Toggle lessons",
      }}
      bottomBar={bottomBar}
    >
      <PageTemplate size="wide" showBack={false}>
        <div ref={playerTopRef} />

        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Free Course</h1>
            <p className="mt-1 text-[15px] leading-6 text-slate-700">
              One focus at a time. Watch → drill → repeat.
            </p>

            <div className="mt-2 text-[12.5px] font-semibold tracking-wide text-slate-500">
              {progressLabel.top}
            </div>
            <div className="mt-1 text-[12px] font-medium text-slate-500">{progressLabel.sub}</div>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            className="hidden shrink-0 rounded-2xl bg-white/80 px-4 py-3 text-[14px] font-semibold text-slate-900 shadow-sm ring-1 ring-white/70 transition hover:bg-white sm:inline-flex"
            aria-label={drawerOpen ? "Close lessons" : "Open lessons"}
          >
            {drawerOpen ? "Close" : "Lessons"}
          </button>
        </header>

        <div className="mt-4 overflow-hidden rounded-full bg-white/60 ring-1 ring-white/70">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
            style={{ width: `${progressPct}%` }}
            aria-label={`Progress ${progressPct}%`}
          />
        </div>

        <section className="mt-5 rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                {moduleInfo.module?.title ?? "Course"}
                {activeLesson.estMinutes ? ` • ${activeLesson.estMinutes} min` : ""}
              </div>
              <div className="mt-1 text-[18px] font-semibold text-slate-900">{activeLesson.title}</div>
            </div>

            <div className="hidden gap-2 sm:flex sm:pt-1">
              <button
                type="button"
                disabled={!prevId}
                onClick={() => prevId && goToLesson(prevId)}
                className={[
                  "rounded-2xl px-4 py-2 text-[14px] font-semibold transition",
                  prevId
                    ? "bg-slate-100/80 text-slate-900 hover:bg-slate-100"
                    : "cursor-not-allowed bg-slate-100/50 text-slate-400",
                ].join(" ")}
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!nextId}
                onClick={() => nextId && goToLesson(nextId)}
                className={[
                  "rounded-2xl px-4 py-2 text-[14px] font-semibold transition",
                  nextId
                    ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)] hover:from-blue-600 hover:to-blue-700"
                    : "cursor-not-allowed bg-slate-100/50 text-slate-400",
                ].join(" ")}
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[18px] ring-1 ring-slate-200/70">
            <div className="aspect-video w-full bg-slate-100">
              <iframe
                className="h-full w-full"
                src={youtubeSrc}
                title={`${activeLesson.title} (YouTube video)`}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50/80 px-4 py-3 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200/60">
            <span>If the video doesn’t play, open it on YouTube.</span>
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-semibold text-slate-900 ring-1 ring-white/70 hover:bg-white/90"
            >
              Open on YouTube →
            </a>
          </div>

          <div className="mt-2 text-center text-[11.5px] font-medium text-slate-500">
            Progress is saved on this device.
          </div>
        </section>

        <section className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-[24px] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur lg:col-span-2">
            <h2 className="text-[16px] font-semibold tracking-wide text-slate-900">Goal</h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">{activeLesson.goal}</p>

            <div className="mt-5">
              <h3 className="text-[16px] font-semibold tracking-wide text-slate-900">Cues (pick one)</h3>
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
              <div className="mt-5">
                <h3 className="text-[16px] font-semibold tracking-wide text-slate-900">
                  Common mistakes
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-7 text-slate-700">
                  {activeLesson.commonMistakes.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-blue-100/70 bg-blue-50/60 p-6 shadow-sm">
            <div className="inline-flex rounded-full bg-white/70 px-3 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-white/70">
              Drill
            </div>

            <h2 className="mt-3 text-[18px] font-semibold text-slate-900">{activeLesson.drill.title}</h2>

            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-7 text-slate-800">
              {activeLesson.drill.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            <div className="mt-5 rounded-2xl bg-white/80 p-4 ring-1 ring-white/70">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                Next step
              </div>
              <div className="mt-1 text-[14px] leading-6 text-slate-800">{activeLesson.nextStep}</div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/programs"
                className="flex items-center justify-center rounded-2xl bg-white/90 px-4 py-3 text-[14px] font-semibold text-slate-900 shadow-sm ring-1 ring-white/70 transition hover:bg-white"
              >
                View programs & PDFs
              </Link>
              <Link
                href="/analysis"
                className="flex items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-3 text-[14px] font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)] transition hover:from-blue-600 hover:to-blue-700"
              >
                Get video analysis
              </Link>

              <p className="mt-1 text-center text-[12px] font-medium text-slate-600">
                Prices in USD. Local taxes may apply.
              </p>
            </div>
          </div>
        </section>

        {/* Spacer so content isn't hidden behind bottom nav */}
        <div className="h-32 sm:h-0" />

        {/* Drawer */}
        <MenuDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          defaultView="course"
          mainItems={MAIN_MENU_ITEMS}
          course={{
            activeLessonId: activeLesson.id,
            onSelectLesson: goToLesson,
          }}
          titleMain="Main menu"
          titleCourse="Course menu"
        />
      </PageTemplate>
    </SiteChrome>
  );
}