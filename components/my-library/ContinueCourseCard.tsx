"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { buildCourseContinueHref, COURSE_LAST_LESSON_STORAGE_KEY } from "@/lib/course/resume";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

const EMPTY_SUBSCRIBE = () => () => {};

function getLastLessonSnapshot(): string {
  try {
    const lastLessonId = localStorage.getItem(COURSE_LAST_LESSON_STORAGE_KEY);
    return lastLessonId?.trim() ?? "";
  } catch {
    return "";
  }
}

export default function ContinueCourseCard() {
  const lastLessonId = useSyncExternalStore(EMPTY_SUBSCRIBE, getLastLessonSnapshot, () => "");
  const hasSavedProgress = lastLessonId.length > 0;
  const continueHref = buildCourseContinueHref(lastLessonId);

  function onResumeClick() {
    void sendClientAnalyticsEvent("resume_clicked", {
      hasSavedProgress,
      destination: continueHref,
    });
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Continue Free Course</h2>
        <Link
          href={continueHref}
          onClick={onResumeClick}
          className="inline-flex h-10 items-center justify-center self-start rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500 active:bg-blue-700"
        >
          {hasSavedProgress ? "Continue course" : "Start free course"}
        </Link>
      </div>
    </section>
  );
}
