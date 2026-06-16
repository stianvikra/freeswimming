"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COURSE_MODULES } from "@/app/course/courseData";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import { buildCourseLessonHref, buildCourseOverviewPath } from "@/lib/course/canonical-routes";
import {
  buildMyLibrarySeenState,
  buildMyLibrarySeenStorageKey,
  parseMyLibrarySeenState,
  resolveNewContentDecision,
  type MyLibraryCourseSignal,
  type MyLibrarySignalLesson,
} from "@/lib/my-library/new-content-notice";

type Props = {
  userId: string;
};

type NewContentSignalResponse =
  | {
      ok: true;
      signal: MyLibraryCourseSignal;
    }
  | {
      ok: false;
      error?: string;
    };

function buildLessonHref(lessonId: string | null): string {
  if (!lessonId) return buildCourseOverviewPath();
  return buildCourseLessonHref(COURSE_MODULES, lessonId);
}

const quietButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80 px-3 text-xs font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export default function MyLibraryNewContentNotice({ userId }: Props) {
  const storageKey = useMemo(() => buildMyLibrarySeenStorageKey(userId), [userId]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentSignal, setCurrentSignal] = useState<MyLibraryCourseSignal | null>(null);
  const [newLessonCount, setNewLessonCount] = useState(0);
  const [newLessons, setNewLessons] = useState<MyLibrarySignalLesson[]>([]);
  const [visible, setVisible] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const shownEventKeyRef = useRef<string | null>(null);

  const persistSeenSignal = useCallback(
    (signal: MyLibraryCourseSignal) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(buildMyLibrarySeenState(signal)));
      } catch {
        // Local storage failures should not block library usage.
      }
    },
    [storageKey]
  );

  const loadSignal = useCallback(async () => {
    try {
      const response = await fetch("/api/my-library/new-content-signal", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as NewContentSignalResponse;
      if (!response.ok || !payload.ok) {
        setStatus("error");
        setVisible(false);
        setDetailsExpanded(false);
        setErrorMessage(payload.ok ? null : (payload.error ?? "Could not check for new lessons."));
        return;
      }

      const signal = payload.signal;
      setCurrentSignal(signal);

      const seen = parseMyLibrarySeenState(localStorage.getItem(storageKey));
      const decision = resolveNewContentDecision(signal, seen);

      if (decision.shouldPersistCurrent) {
        persistSeenSignal(signal);
      }

      if (decision.state === "show") {
        setNewLessonCount(decision.newLessonCount);
        setNewLessons(decision.newLessons);
        setVisible(true);
        setDetailsExpanded(false);
      } else {
        setNewLessonCount(0);
        setNewLessons([]);
        setVisible(false);
        setDetailsExpanded(false);
      }
      setStatus("ready");
    } catch {
      setStatus("error");
      setVisible(false);
      setNewLessons([]);
      setDetailsExpanded(false);
      setErrorMessage("Could not check for new lessons.");
    }
  }, [persistSeenSignal, storageKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSignal();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loadSignal]);

  useEffect(() => {
    if (!visible || !currentSignal) return;
    const eventKey = `${currentSignal.signature}:${newLessonCount}`;
    if (shownEventKeyRef.current === eventKey) return;
    shownEventKeyRef.current = eventKey;
    void sendClientAnalyticsEvent("library_new_content_notice_shown", {
      lessonCount: newLessonCount,
      signature: currentSignal.signature,
    });
  }, [currentSignal, newLessonCount, visible]);

  const trackOpen = useCallback(
    (lessonId: string | null) => {
      if (!currentSignal) return;
      void sendClientAnalyticsEvent("library_new_content_notice_opened", {
        lessonCount: currentSignal.lessonCount,
        newLessonCount,
        signature: currentSignal.signature,
        source: "open_list_item",
        lessonId,
      });
    },
    [currentSignal, newLessonCount]
  );

  const handleDismiss = useCallback(() => {
    if (!currentSignal) return;
    persistSeenSignal(currentSignal);
    setVisible(false);
    setNewLessonCount(0);
    setNewLessons([]);
    setDetailsExpanded(false);
    void sendClientAnalyticsEvent("library_new_content_notice_seen", {
      lessonCount: currentSignal.lessonCount,
      newLessonCount,
      signature: currentSignal.signature,
    });
  }, [currentSignal, newLessonCount, persistSeenSignal]);

  if (status === "loading") {
    return (
      <section
        data-testid="my-library-new-content-notice-loading"
        className="fs-library-card fs-library-card-muted px-4 py-3"
      >
        <p className="text-sm text-[color:var(--fs-color-muted)]">Checking for new lessons...</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section
        data-testid="my-library-new-content-notice-error"
        className="fs-library-card fs-library-card-muted px-4 py-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[color:var(--fs-color-muted)]">
            {errorMessage ?? "Could not check for new lessons."}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              setErrorMessage(null);
              void loadSignal();
            }}
            className={quietButtonClass}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!visible || !currentSignal || newLessonCount <= 0 || newLessons.length <= 0) {
    return null;
  }

  return (
    <section
      data-testid="my-library-new-content-notice"
      className="fs-library-card fs-library-card-muted p-5"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="inline-flex items-center rounded-[var(--fs-radius-control)] bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--fs-color-brand-700)] ring-1 ring-[color:var(--fs-border-brand)]">
              New lessons
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            data-testid="my-library-new-content-toggle"
            type="button"
            onClick={() => setDetailsExpanded((current) => !current)}
            aria-expanded={detailsExpanded}
            aria-controls="my-library-new-content-details"
            className="fs-cta-secondary inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {detailsExpanded ? "Hide list" : "Show list"}
          </button>
          <button
            data-testid="my-library-new-content-dismiss"
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss new lesson notice"
            className="inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80 text-sm font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            X
          </button>
        </div>
      </div>

      {detailsExpanded ? (
        <div
          id="my-library-new-content-details"
          className="mt-4 rounded-[var(--fs-radius-card)] border border-white/80 bg-white/85 px-4 py-3 ring-1 ring-blue-100/70"
        >
          <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
            New lesson list
          </p>
          <ul data-testid="my-library-new-content-list" className="mt-3 space-y-2">
            {newLessons.map((lesson) => (
              <li key={lesson.lessonToken}>
                <Link
                  data-testid={`my-library-new-content-item-${lesson.lessonId}`}
                  href={buildLessonHref(lesson.lessonId)}
                  onClick={() => trackOpen(lesson.lessonId)}
                  className="inline-flex flex-wrap items-center gap-1 text-sm font-medium text-blue-800 hover:text-blue-700 hover:underline"
                >
                  <span>{lesson.lessonTitle}</span>
                  <span className="text-xs text-slate-500">({lesson.moduleTitle})</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
