"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
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
  if (!lessonId) return "/course";
  return `/course?lesson=${encodeURIComponent(lessonId)}`;
}

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
    (source: "open_first" | "open_list_item", lessonId: string | null) => {
      if (!currentSignal) return;
      void sendClientAnalyticsEvent("library_new_content_notice_opened", {
        lessonCount: currentSignal.lessonCount,
        newLessonCount,
        signature: currentSignal.signature,
        source,
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
        className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3"
      >
        <p className="text-sm text-slate-600">Checking for new lessons...</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section
        data-testid="my-library-new-content-notice-error"
        className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            {errorMessage ?? "Could not check for new lessons."}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              setErrorMessage(null);
              void loadSignal();
            }}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
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
      className="rounded-[28px] border border-blue-200/80 bg-[linear-gradient(145deg,rgba(239,246,255,0.95),rgba(255,255,255,0.98))] px-4 py-4 shadow-[0_14px_40px_rgba(37,99,235,0.08)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700 ring-1 ring-blue-100">
              New content
            </p>
            <p className="text-xs font-medium text-blue-700">
              {newLessonCount} new lesson{newLessonCount === 1 ? "" : "s"}
            </p>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-900">
            +{newLessonCount} nye leksjoner i Free Course
          </p>
          <p className="mt-1 max-w-[54ch] text-sm text-slate-600">
            Freshly published lessons are waiting. Open the first one now, or expand the list when
            you want the full overview.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              data-testid="my-library-new-content-open"
              href={buildLessonHref(newLessons[0]?.lessonId ?? currentSignal.firstLessonId)}
              onClick={() =>
                trackOpen("open_first", newLessons[0]?.lessonId ?? currentSignal.firstLessonId)
              }
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Open first new lesson
            </Link>
            <button
              data-testid="my-library-new-content-toggle"
              type="button"
              onClick={() => setDetailsExpanded((current) => !current)}
              aria-expanded={detailsExpanded}
              aria-controls="my-library-new-content-details"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-50"
            >
              {detailsExpanded ? "Hide lesson list" : "Show lesson list"}
            </button>
          </div>
        </div>
        <button
          data-testid="my-library-new-content-dismiss"
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss new lesson notice"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          X
        </button>
      </div>

      {detailsExpanded ? (
        <div
          id="my-library-new-content-details"
          className="mt-4 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 ring-1 ring-blue-100/70"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            New lesson list
          </p>
          <ul data-testid="my-library-new-content-list" className="mt-3 space-y-2">
            {newLessons.map((lesson) => (
              <li key={lesson.lessonToken}>
                <Link
                  data-testid={`my-library-new-content-item-${lesson.lessonId}`}
                  href={buildLessonHref(lesson.lessonId)}
                  onClick={() => trackOpen("open_list_item", lesson.lessonId)}
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
