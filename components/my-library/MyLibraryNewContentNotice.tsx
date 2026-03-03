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

function buildOpenLessonsHref(firstLessonId: string | null): string {
  if (!firstLessonId) return "/course";
  return `/course?lesson=${encodeURIComponent(firstLessonId)}`;
}

export default function MyLibraryNewContentNotice({ userId }: Props) {
  const storageKey = useMemo(() => buildMyLibrarySeenStorageKey(userId), [userId]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentSignal, setCurrentSignal] = useState<MyLibraryCourseSignal | null>(null);
  const [newLessonCount, setNewLessonCount] = useState(0);
  const [visible, setVisible] = useState(false);
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
        setVisible(true);
      } else {
        setNewLessonCount(0);
        setVisible(false);
      }
      setStatus("ready");
    } catch {
      setStatus("error");
      setVisible(false);
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

  const handleMarkSeen = useCallback(
    (source: "dismiss" | "open_lessons") => {
      if (!currentSignal) return;
      persistSeenSignal(currentSignal);
      setVisible(false);
      setNewLessonCount(0);

      const eventName =
        source === "open_lessons"
          ? "library_new_content_notice_opened"
          : "library_new_content_notice_seen";
      void sendClientAnalyticsEvent(eventName, {
        lessonCount: currentSignal.lessonCount,
        signature: currentSignal.signature,
      });
    },
    [currentSignal, persistSeenSignal]
  );

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

  if (!visible || !currentSignal || newLessonCount <= 0) {
    return null;
  }

  return (
    <section
      data-testid="my-library-new-content-notice"
      className="rounded-2xl border border-blue-200 bg-blue-50/55 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">New content</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            +{newLessonCount} nye leksjoner i Free Course
          </p>
          <p className="mt-1 text-sm text-slate-600">
            New published lessons are available. Open now or mark this notice as seen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            data-testid="my-library-new-content-open"
            href={buildOpenLessonsHref(currentSignal.firstLessonId)}
            onClick={() => handleMarkSeen("open_lessons")}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500"
          >
            Open new lessons
          </Link>
          <button
            data-testid="my-library-new-content-dismiss"
            type="button"
            onClick={() => handleMarkSeen("dismiss")}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Dismiss
          </button>
        </div>
      </div>
    </section>
  );
}
