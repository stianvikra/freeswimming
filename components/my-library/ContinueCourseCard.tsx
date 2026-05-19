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
    <section className="fs-library-card fs-library-card-accent p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
          Free Course
        </h2>
        <Link
          href={continueHref}
          onClick={onResumeClick}
          className="fs-cta-primary inline-flex min-h-11 items-center justify-center self-start px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          {hasSavedProgress ? "Continue" : "Start"}
        </Link>
      </div>
    </section>
  );
}
