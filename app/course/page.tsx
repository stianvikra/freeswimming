"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import Modal from "@/components/Modal";

import {
  COURSE_MODULES,
  DEFAULT_LESSON_ID,
  findLesson,
  getNextPrevLessonIds,
  COURSE_LESSONS_FLAT,
  type CourseLesson,
} from "./courseData";

const STORAGE_KEY = "fs_course_last_lesson";

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

  const defaultOpenModuleId = useMemo(
    () => moduleInfo.module?.id ?? COURSE_MODULES[0]?.id ?? "m1",
    [moduleInfo.module?.id]
  );
  const [openModuleId, setOpenModuleId] = useState<string>(defaultOpenModuleId);

  useEffect(() => setOpenModuleId(defaultOpenModuleId), [defaultOpenModuleId]);

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
      compact: `${lessonGlobal}/${moduleInfo.totalLessons}`,
    };
  }, [moduleInfo]);

  const progressPct = useMemo(() => {
    const idx = moduleInfo.lessonIndexGlobal >= 0 ? moduleInfo.lessonIndexGlobal + 1 : 1;
    const total = Math.max(1, moduleInfo.totalLessons);
    return Math.min(100, Math.round((idx / total) * 100));
  }, [moduleInfo.lessonIndexGlobal, moduleInfo.totalLessons]);

  // ✅ NEW: bottom bar rendered globally via SiteChrome (fixes iOS fixed issues)
  const bottomBar = (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] sm:hidden">
      <div className="mx-auto max-w-[520px]">
        <div className="rounded-[22px] bg-white/80 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] ring-1 ring-white/70 backdrop-blur">
          <div className="px-2 pb-2 text-center text-[12px] font-semibold text-slate-600">
            {progressLabel.compact}
          </div>

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
              onClick={() => setDrawerOpen(true)}
              className="flex-1 rounded-2xl bg-white/90 px-4 py-3 text-[14px] font-semibold text-slate-900 ring-1 ring-white/70"
            >
              Menu
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
        ariaLabel: "Toggle course menu",
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
            onClick={() => setDrawerOpen(true)}
            className="hidden shrink-0 rounded-2xl bg-white/80 px-4 py-3 text-[14px] font-semibold text-slate-900 shadow-sm ring-1 ring-white/70 transition hover:bg-white sm:inline-flex"
            aria-label="Open course navigation"
          >
            Modules & lessons
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
              <div className="mt-1 text-[18px] font-semibold text-slate-900">
                {activeLesson.title}
              </div>
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

            <h2 className="mt-3 text-[18px] font-semibold text-slate-900">
              {activeLesson.drill.title}
            </h2>

            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-7 text-slate-800">
              {activeLesson.drill.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            <div className="mt-5 rounded-2xl bg-white/80 p-4 ring-1 ring-white/70">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                Next step
              </div>
              <div className="mt-1 text-[14px] leading-6 text-slate-800">
                {activeLesson.nextStep}
              </div>
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

        {/* ✅ Spacer so the bottom bar doesn't cover content on mobile */}
        <div className="h-28 sm:h-0" />

        {/* Drawer */}
        <Modal open={drawerOpen} onClose={() => setDrawerOpen(false)} ariaLabel="Course navigation">
          <div className="flex h-full flex-col">
            <div className="px-5 pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[16px] font-semibold text-slate-900">Course menu</div>
                  <div className="mt-1 text-[13px] font-medium text-slate-500">
                    Pick a module, then choose a lesson.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-2xl bg-slate-100/70 px-3 py-2 text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
                  aria-label="Close course menu"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
              <div className="flex flex-col gap-4">
                {COURSE_MODULES.map((mod, idx) => {
                  const isOpen = openModuleId === mod.id;
                  const isActiveModule = mod.lessons.some((l) => l.id === activeLesson.id);

                  const wrapperClass = [
                    "relative overflow-hidden rounded-[22px] border bg-white/80 shadow-sm transition",
                    isActiveModule ? "border-blue-200/70" : "border-white/70",
                    isOpen && !isActiveModule
                      ? "shadow-[0_18px_60px_rgba(15,23,42,0.10)] border-slate-200/70"
                      : "",
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

                  const headerButtonClass = [
                    "flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition",
                    isOpen
                      ? "bg-[radial-gradient(600px_180px_at_20%_0%,rgba(99,168,255,0.16),rgba(255,255,255,0)_60%)]"
                      : "",
                  ].join(" ");

                  return (
                    <div key={mod.id} className={wrapperClass}>
                      <div className={accentClass} />

                      <button
                        type="button"
                        onClick={() => setOpenModuleId(isOpen ? "" : mod.id)}
                        className={headerButtonClass}
                        aria-expanded={isOpen}
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
                          </div>

                          <div className="mt-2 text-[16px] font-semibold text-slate-900">
                            {mod.title}
                          </div>

                          {mod.subtitle ? (
                            <div className="mt-1 text-[13px] font-medium text-slate-600">
                              {mod.subtitle}
                            </div>
                          ) : null}
                        </div>

                        <span
                          className={[
                            "mt-0.5 rounded-2xl px-3 py-2 text-[12px] font-semibold transition",
                            isOpen
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100/70"
                              : "bg-slate-100/80 text-slate-700",
                          ].join(" ")}
                        >
                          {isOpen ? "–" : "+"}
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="px-5 pb-4">
                          <div className="rounded-[18px] bg-slate-50/70 p-2 ring-1 ring-slate-200/60">
                            {mod.lessons.map((l) => {
                              const active = l.id === activeLesson.id;

                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => goToLesson(l.id)}
                                  className={[
                                    "w-full rounded-[16px] px-4 py-3 text-left transition",
                                    active
                                      ? "bg-blue-50/90 ring-1 ring-blue-200/60"
                                      : "hover:bg-white/80",
                                  ].join(" ")}
                                  aria-current={active ? "true" : undefined}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-[14px] font-semibold text-slate-900">
                                      {l.title}
                                    </div>
                                    {l.estMinutes ? (
                                      <span className="shrink-0 text-[12px] font-semibold text-slate-500">
                                        {l.estMinutes}m
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium text-slate-600">
                                    {l.goal}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[20px] border border-slate-200/70 bg-white/70 p-4">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Tip
                </div>
                <div className="mt-1 text-[13px] leading-6 text-slate-700">
                  Don’t “binge” lessons. Repeat each focus in 2 sessions before moving on.
                </div>
              </div>

              <div className="h-24" />
            </div>

            <div className="sticky bottom-0 border-t border-slate-200/70 bg-white/80 px-5 py-3 backdrop-blur rounded-bl-3xl">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-100/80 px-5 py-3 text-[14px] font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Back to lesson
              </button>
            </div>
          </div>
        </Modal>
      </PageTemplate>
    </SiteChrome>
  );
}