"use client";

import { useState } from "react";
import Link from "next/link";
import { buildCourseContinueHref, COURSE_LAST_LESSON_STORAGE_KEY } from "@/lib/course/resume";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

type ResumeState = {
  continueHref: string;
  hasSavedProgress: boolean;
};

function getInitialResumeState(): ResumeState {
  if (typeof window === "undefined") {
    return { continueHref: "/course", hasSavedProgress: false };
  }

  try {
    const lastLessonId = localStorage.getItem(COURSE_LAST_LESSON_STORAGE_KEY);
    return {
      continueHref: buildCourseContinueHref(lastLessonId),
      hasSavedProgress: Boolean(lastLessonId && lastLessonId.trim().length > 0),
    };
  } catch {
    return { continueHref: "/course", hasSavedProgress: false };
  }
}

export default function ContinueCourseCard() {
  const [{ continueHref, hasSavedProgress }] = useState<ResumeState>(getInitialResumeState);

  function onResumeClick() {
    void sendClientAnalyticsEvent("resume_clicked", {
      hasSavedProgress,
      destination: continueHref,
    });
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
      <h2 className="text-lg font-semibold text-slate-900">Continue Free Course</h2>
      <p className="mt-2 text-sm text-slate-600">
        {hasSavedProgress
          ? "We saved your latest lesson on this device. Continue where you left off."
          : "Start the free course and your lesson progress will be saved on this device."}
      </p>
      <div className="mt-4">
        <Link
          href={continueHref}
          onClick={onResumeClick}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500 active:bg-blue-700"
        >
          {hasSavedProgress ? "Continue course" : "Start free course"}
        </Link>
      </div>
    </section>
  );
}
