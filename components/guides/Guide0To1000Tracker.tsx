"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import GuideSyncStatus from "@/components/guides/GuideSyncStatus";
import {
  getGuideTrackerSessionCardClass,
  guideTrackerCompletedActionClass,
  guideTrackerEmptyClass,
  guideTrackerHeroShellClass,
  guideTrackerMetricClass,
  guideTrackerMutedPanelClass,
  guideTrackerPanelClass,
  guideTrackerPrimaryActionClass,
  guideTrackerSecondaryActionClass,
  guideTrackerSmallSecondaryActionClass,
  guideTrackerTextareaClass,
} from "@/components/guides/guideTrackerShellStyles";
import {
  MAX_GUIDE_PROGRESS_ROWS,
  normalizeGuideProgressRows,
  type GuideProgressRow,
} from "@/lib/course/guide-progress";
import { type Guide0To1000Session } from "@/lib/guides/guide-0-1000m";
import { getFirstIncompleteId, splitItemsByCompletion } from "@/lib/guides/guide-tracker-ui";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

const GUIDE_PROGRESS_SYNC_API_PATH = "/api/progress/guide";
const GUIDE_PROGRESS_STORAGE_KEY = "fs_guide_0_1000m_progress_v1";
const GUIDE_LAST_SESSION_STORAGE_KEY = "fs_guide_0_1000m_last_session_v1";
const GUIDE_COMPLETED_WEEKS_VISIBILITY_STORAGE_KEY =
  "fs_guide_0_1000m_completed_weeks_visibility_v1";
const GUIDE_PROGRESS_SYNC_INTERVAL_MS = 10_000;
const MAX_NOTES_LENGTH = 4000;
const COMPLETION_UNDO_TIMEOUT_MS = 8_000;

type SyncState = "idle" | "syncing" | "synced" | "error" | "offline";

type SessionProgress = {
  completed: boolean;
  notes: string;
  updatedAt: string;
};

type SessionProgressRecord = Record<string, SessionProgress>;

type CompletionUndoState = {
  sessionId: string;
  previousCompleted: boolean;
  expiresAt: number;
};

type Props = {
  guideSlug: string;
  sessions: Guide0To1000Session[];
};

function getSafeIsoTimestamp(value: string | undefined): string {
  if (!value) return new Date().toISOString();
  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return new Date().toISOString();
  return new Date(ts).toISOString();
}

function toProgressRecord(rows: GuideProgressRow[]): SessionProgressRecord {
  const next: SessionProgressRecord = {};
  for (const row of rows) {
    next[row.sectionId] = {
      completed: row.completed,
      notes: row.notes,
      updatedAt: getSafeIsoTimestamp(row.updatedAt),
    };
  }
  return next;
}

function toProgressRows(
  record: SessionProgressRecord,
  guideSlug: string,
  allowedSectionIds: Set<string>
): GuideProgressRow[] {
  const rows = Object.entries(record)
    .filter(([sectionId]) => allowedSectionIds.has(sectionId))
    .map(([sectionId, value]) => ({
      guideSlug,
      sectionId,
      completed: value.completed,
      notes: value.notes,
      updatedAt: getSafeIsoTimestamp(value.updatedAt),
    }));

  return normalizeGuideProgressRows(rows, { maxRows: MAX_GUIDE_PROGRESS_ROWS });
}

function filterRowsForGuide(
  rows: unknown,
  guideSlug: string,
  allowedSectionIds: Set<string>
): GuideProgressRow[] {
  return normalizeGuideProgressRows(rows, { maxRows: MAX_GUIDE_PROGRESS_ROWS }).filter(
    (row) => row.guideSlug === guideSlug && allowedSectionIds.has(row.sectionId)
  );
}

function areRowsEqual(left: GuideProgressRow[], right: GuideProgressRow[]): boolean {
  if (left.length !== right.length) return false;

  for (let i = 0; i < left.length; i += 1) {
    const a = left[i];
    const b = right[i];
    if (a.guideSlug !== b.guideSlug) return false;
    if (a.sectionId !== b.sectionId) return false;
    if (a.completed !== b.completed) return false;
    if (a.notes !== b.notes) return false;
    if (a.updatedAt !== b.updatedAt) return false;
  }

  return true;
}

function readLocalRows(guideSlug: string, allowedSectionIds: Set<string>): GuideProgressRow[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(GUIDE_PROGRESS_STORAGE_KEY);
    if (!raw) return [];
    return filterRowsForGuide(JSON.parse(raw), guideSlug, allowedSectionIds);
  } catch {
    return [];
  }
}

function persistLocalRows(rows: GuideProgressRow[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUIDE_PROGRESS_STORAGE_KEY, JSON.stringify(rows));
  } catch {}
}

function formatRelativeAge(timestampMs: number | null): string {
  if (!timestampMs) return "Saved recently.";

  const ageMs = Math.max(0, Date.now() - timestampMs);
  if (ageMs < 15_000) return "Saved just now.";

  const ageMinutes = Math.floor(ageMs / 60_000);
  if (ageMinutes < 1) return "Saved less than a minute ago.";
  if (ageMinutes === 1) return "Saved 1 minute ago.";
  if (ageMinutes < 60) return `Saved ${ageMinutes} minutes ago.`;

  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours === 1) return "Saved 1 hour ago.";
  return `Saved ${ageHours} hours ago.`;
}

function formatSessionUpdatedLabel(updatedAt: string | undefined): string {
  if (!updatedAt) return "Not updated yet";
  const ts = Date.parse(updatedAt);
  if (!Number.isFinite(ts)) return "Not updated yet";

  const ageMs = Math.max(0, Date.now() - ts);
  if (ageMs < 10_000) return "Updated just now";
  if (ageMs < 60_000) return "Updated <1 min ago";

  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 60) return `Updated ${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  return `Updated ${hours}h ago`;
}

export default function Guide0To1000Tracker({ guideSlug, sessions }: Props) {
  const allowedSectionIds = useMemo(
    () => new Set(sessions.map((session) => session.id)),
    [sessions]
  );
  const [progressBySessionId, setProgressBySessionId] = useState<SessionProgressRecord>({});
  const progressBySessionIdRef = useRef<SessionProgressRecord>({});
  const [hydrationState, setHydrationState] = useState<"loading" | "ready">("loading");
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncError, setSyncError] = useState("");
  const [lastSyncAtMs, setLastSyncAtMs] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(readNavigatorOnlineState);
  const [hydrateRetryKey, setHydrateRetryKey] = useState(0);
  const [focusedSessionId, setFocusedSessionId] = useState<string | null>(null);
  const [expandedCompletedWeeks, setExpandedCompletedWeeks] = useState<Record<number, boolean>>({});
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [completionUndoState, setCompletionUndoState] = useState<CompletionUndoState | null>(null);
  const dirtySectionIdsRef = useRef<Set<string>>(new Set());
  const syncInFlightRef = useRef(false);

  const applyProgressRows = useCallback(
    (rows: GuideProgressRow[]) => {
      const normalizedRows = filterRowsForGuide(rows, guideSlug, allowedSectionIds);
      const nextRecord = toProgressRecord(normalizedRows);
      progressBySessionIdRef.current = nextRecord;
      setProgressBySessionId(nextRecord);
      persistLocalRows(normalizedRows);
    },
    [allowedSectionIds, guideSlug]
  );

  const persistRowsToServer = useCallback(async (rows: GuideProgressRow[]) => {
    const response = await fetch(GUIDE_PROGRESS_SYNC_API_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "same-origin",
      body: JSON.stringify({ rows }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Sign in again to keep syncing your guide progress.");
      }
      throw new Error(`Guide progress sync failed (${response.status}).`);
    }
  }, []);

  const syncGuideProgressNow = useCallback(
    async (options?: { force?: boolean }) => {
      if (syncInFlightRef.current) return;
      if (!isOnline) {
        setSyncState("offline");
        return;
      }

      const dirtyIds = new Set(dirtySectionIdsRef.current);
      if (!options?.force && dirtyIds.size === 0) return;

      const allRows = toProgressRows(progressBySessionIdRef.current, guideSlug, allowedSectionIds);
      const rows = allRows.filter((row) => options?.force || dirtyIds.has(row.sectionId));
      if (rows.length === 0) return;

      syncInFlightRef.current = true;
      setSyncState("syncing");
      setSyncError("");

      try {
        await persistRowsToServer(rows);
        if (options?.force) {
          dirtySectionIdsRef.current.clear();
        } else {
          for (const row of rows) {
            dirtySectionIdsRef.current.delete(row.sectionId);
          }
        }
        setSyncState("synced");
        setLastSyncAtMs(Date.now());
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not sync guide progress right now. Try again.";
        setSyncError(message);
        setSyncState("error");
      } finally {
        syncInFlightRef.current = false;
      }
    },
    [allowedSectionIds, guideSlug, isOnline, persistRowsToServer]
  );

  useEffect(() => {
    progressBySessionIdRef.current = progressBySessionId;
  }, [progressBySessionId]);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      setSyncState("idle");
    };
    const onOffline = () => {
      setIsOnline(false);
      setSyncState("offline");
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (hydrationState !== "ready") return;
    if (!isOnline) return;
    if (dirtySectionIdsRef.current.size === 0) return;
    void syncGuideProgressNow();
  }, [hydrationState, isOnline, syncGuideProgressNow]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const localRows = readLocalRows(guideSlug, allowedSectionIds);
      applyProgressRows(localRows);

      if (!readNavigatorOnlineState()) {
        if (!cancelled) {
          setHydrationState("ready");
          setSyncState("offline");
        }
        return;
      }

      setSyncState("syncing");
      setSyncError("");

      try {
        const response = await fetch(GUIDE_PROGRESS_SYNC_API_PATH, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Sign in again to load your guide progress.");
          }
          throw new Error(`Guide progress hydrate failed (${response.status}).`);
        }

        const payload = (await response.json()) as { rows?: unknown };
        if (cancelled) return;

        const remoteRows = filterRowsForGuide(payload.rows ?? [], guideSlug, allowedSectionIds);
        const mergedRows = normalizeGuideProgressRows([...localRows, ...remoteRows], {
          maxRows: MAX_GUIDE_PROGRESS_ROWS,
        });
        applyProgressRows(mergedRows);

        if (!areRowsEqual(mergedRows, remoteRows)) {
          await persistRowsToServer(mergedRows);
        }

        if (cancelled) return;
        setSyncState("synced");
        setLastSyncAtMs(Date.now());
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Could not load guide progress right now. You can continue locally.";
        setSyncError(message);
        setSyncState(readNavigatorOnlineState() ? "error" : "offline");
      } finally {
        if (!cancelled) {
          setHydrationState("ready");
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [allowedSectionIds, applyProgressRows, guideSlug, hydrateRetryKey, persistRowsToServer]);

  useEffect(() => {
    if (hydrationState !== "ready") return;

    const syncTimer = window.setInterval(() => {
      void syncGuideProgressNow();
    }, GUIDE_PROGRESS_SYNC_INTERVAL_MS);

    return () => {
      window.clearInterval(syncTimer);
    };
  }, [hydrationState, syncGuideProgressNow]);

  useEffect(() => {
    if (hydrationState !== "ready") return;

    const flushWhenBackgrounded = () => {
      if (document.visibilityState !== "hidden") return;
      void syncGuideProgressNow({ force: true });
    };
    const flushOnPageHide = () => {
      void syncGuideProgressNow({ force: true });
    };

    document.addEventListener("visibilitychange", flushWhenBackgrounded);
    window.addEventListener("pagehide", flushOnPageHide);

    return () => {
      document.removeEventListener("visibilitychange", flushWhenBackgrounded);
      window.removeEventListener("pagehide", flushOnPageHide);
    };
  }, [hydrationState, syncGuideProgressNow]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedLastSessionId = localStorage.getItem(GUIDE_LAST_SESSION_STORAGE_KEY);
      if (storedLastSessionId) {
        setLastSessionId(storedLastSessionId);
      }
    } catch {}

    try {
      const raw = localStorage.getItem(GUIDE_COMPLETED_WEEKS_VISIBILITY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object") return;
      const next: Record<number, boolean> = {};
      for (const [weekKey, value] of Object.entries(parsed as Record<string, unknown>)) {
        const week = Number(weekKey);
        if (!Number.isFinite(week) || week <= 0) continue;
        next[week] = value === true;
      }
      setExpandedCompletedWeeks(next);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!lastSessionId) return;
    try {
      localStorage.setItem(GUIDE_LAST_SESSION_STORAGE_KEY, lastSessionId);
    } catch {}
  }, [lastSessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        GUIDE_COMPLETED_WEEKS_VISIBILITY_STORAGE_KEY,
        JSON.stringify(expandedCompletedWeeks)
      );
    } catch {}
  }, [expandedCompletedWeeks]);

  const updateSessionProgress = useCallback(
    (
      sessionId: string,
      updater: (current: SessionProgress) => SessionProgress,
      options?: { markDirty?: boolean }
    ) => {
      setProgressBySessionId((previous) => {
        const current = previous[sessionId] ?? {
          completed: false,
          notes: "",
          updatedAt: new Date().toISOString(),
        };
        const next = updater(current);
        if (
          next.completed === current.completed &&
          next.notes === current.notes &&
          next.updatedAt === current.updatedAt
        ) {
          return previous;
        }

        const nextRecord = {
          ...previous,
          [sessionId]: {
            completed: next.completed,
            notes: next.notes.slice(0, MAX_NOTES_LENGTH),
            updatedAt: getSafeIsoTimestamp(next.updatedAt),
          },
        };

        progressBySessionIdRef.current = nextRecord;
        const localRows = toProgressRows(nextRecord, guideSlug, allowedSectionIds);
        persistLocalRows(localRows);

        if (options?.markDirty !== false) {
          dirtySectionIdsRef.current.add(sessionId);
          setSyncState((state) => (state === "offline" ? state : "idle"));
          setSyncError("");
        }

        return nextRecord;
      });
    },
    [allowedSectionIds, guideSlug]
  );

  const sortedSessions = useMemo(
    () => [...sessions].sort((left, right) => left.id.localeCompare(right.id)),
    [sessions]
  );

  const sessionsByWeek = useMemo(() => {
    const grouped = new Map<number, Guide0To1000Session[]>();
    for (const session of sortedSessions) {
      const existing = grouped.get(session.weekNumber) ?? [];
      existing.push(session);
      grouped.set(session.weekNumber, existing);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([weekNumber, weekSessions]) => ({
        weekNumber,
        sessions: weekSessions,
      }));
  }, [sortedSessions]);

  const completedCount = useMemo(() => {
    return sortedSessions.reduce((total, session) => {
      const progress = progressBySessionId[session.id];
      return progress?.completed ? total + 1 : total;
    }, 0);
  }, [progressBySessionId, sortedSessions]);

  const remainingCount = Math.max(0, sortedSessions.length - completedCount);
  const completionPercent =
    sortedSessions.length === 0 ? 0 : Math.round((completedCount / sortedSessions.length) * 100);

  const focusedSessionIndex = useMemo(() => {
    if (!focusedSessionId) return -1;
    return sortedSessions.findIndex((session) => session.id === focusedSessionId);
  }, [focusedSessionId, sortedSessions]);

  const focusedSession = focusedSessionIndex >= 0 ? sortedSessions[focusedSessionIndex] : null;
  const focusedSessionProgress = focusedSession
    ? progressBySessionId[focusedSession.id]
    : undefined;
  const lastSession = lastSessionId
    ? (sortedSessions.find((session) => session.id === lastSessionId) ?? null)
    : null;

  const openSessionFullscreen = useCallback((sessionId: string) => {
    setFocusedSessionId(sessionId);
    setLastSessionId(sessionId);
  }, []);

  const closeSessionFullscreen = useCallback(() => {
    setFocusedSessionId(null);
  }, []);

  const openNextSessionFullscreen = useCallback(() => {
    if (focusedSessionIndex < 0 || focusedSessionIndex >= sortedSessions.length - 1) return;
    const nextId = sortedSessions[focusedSessionIndex + 1]?.id ?? null;
    setFocusedSessionId(nextId);
    if (nextId) {
      setLastSessionId(nextId);
    }
  }, [focusedSessionIndex, sortedSessions]);

  const openPreviousSessionFullscreen = useCallback(() => {
    if (focusedSessionIndex <= 0) return;
    const previousId = sortedSessions[focusedSessionIndex - 1]?.id ?? null;
    setFocusedSessionId(previousId);
    if (previousId) {
      setLastSessionId(previousId);
    }
  }, [focusedSessionIndex, sortedSessions]);

  const toggleSessionCompleted = useCallback(
    (session: Guide0To1000Session) => {
      const timestamp = new Date().toISOString();
      const previousCompleted = progressBySessionId[session.id]?.completed ?? false;
      const nextCompletedState = !previousCompleted;

      updateSessionProgress(session.id, (current) => {
        return {
          completed: nextCompletedState,
          notes: current.notes,
          updatedAt: timestamp,
        };
      });

      if (nextCompletedState) {
        setCompletionUndoState({
          sessionId: session.id,
          previousCompleted,
          expiresAt: Date.now() + COMPLETION_UNDO_TIMEOUT_MS,
        });
      } else {
        setCompletionUndoState(null);
      }

      if (nextCompletedState) {
        setExpandedCompletedWeeks((previous) => ({
          ...previous,
          [session.weekNumber]: false,
        }));
      }
    },
    [progressBySessionId, updateSessionProgress]
  );

  const updateSessionNotes = useCallback(
    (sessionId: string, nextNotes: string) => {
      const timestamp = new Date().toISOString();
      updateSessionProgress(sessionId, (current) => ({
        completed: current.completed,
        notes: nextNotes.slice(0, MAX_NOTES_LENGTH),
        updatedAt: timestamp,
      }));
    },
    [updateSessionProgress]
  );

  const syncLabel = useMemo(() => {
    if (syncState === "syncing") return "Saving guide progress...";
    if (syncState === "offline" || !isOnline) {
      return "Offline mode: changes stay on this device and sync when connection returns.";
    }
    if (syncState === "error") {
      return syncError || "Could not sync guide progress right now.";
    }
    if (syncState === "synced") return formatRelativeAge(lastSyncAtMs);
    return "Signed in. Guide progress sync is active.";
  }, [isOnline, lastSyncAtMs, syncError, syncState]);

  const retryGuideProgressSync = useCallback(() => {
    if (syncState === "error") {
      setHydrationState("loading");
      setHydrateRetryKey((value) => value + 1);
      return;
    }

    void syncGuideProgressNow({ force: true });
  }, [syncGuideProgressNow, syncState]);

  const undoLatestCompletion = useCallback(() => {
    if (!completionUndoState) return;
    const timestamp = new Date().toISOString();
    updateSessionProgress(completionUndoState.sessionId, (current) => ({
      completed: completionUndoState.previousCompleted,
      notes: current.notes,
      updatedAt: timestamp,
    }));
    setCompletionUndoState(null);
  }, [completionUndoState, updateSessionProgress]);

  useEffect(() => {
    if (!completionUndoState) return;

    const remaining = completionUndoState.expiresAt - Date.now();
    if (remaining <= 0) {
      setCompletionUndoState(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setCompletionUndoState(null);
    }, remaining);

    return () => {
      window.clearTimeout(timer);
    };
  }, [completionUndoState]);

  useEffect(() => {
    if (focusedSessionIndex < 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeSessionFullscreen();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        openPreviousSessionFullscreen();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        openNextSessionFullscreen();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    closeSessionFullscreen,
    focusedSessionIndex,
    openNextSessionFullscreen,
    openPreviousSessionFullscreen,
  ]);

  const renderSessionCard = (session: Guide0To1000Session, options?: { muted?: boolean }) => {
    const progress = progressBySessionId[session.id];
    const completed = progress?.completed ?? false;
    const notes = progress?.notes ?? "";
    const textareaId = `guide-${session.id}-notes`;

    return (
      <article
        key={session.id}
        className={getGuideTrackerSessionCardClass(completed, options?.muted)}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Session {session.id}
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{session.title}</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openSessionFullscreen(session.id)}
              className={guideTrackerSmallSecondaryActionClass}
            >
              Open full screen
            </button>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={completed}
                onChange={() => toggleSessionCompleted(session)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {completed ? "Completed" : "Mark complete"}
            </label>
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Focus:</span> {session.focus}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Target set:</span> {session.targetSet}
        </p>

        <div className="mt-3 space-y-2">
          <label htmlFor={textareaId} className="text-xs font-semibold text-slate-700">
            Session notes
          </label>
          <textarea
            id={textareaId}
            value={notes}
            onChange={(event) => {
              updateSessionNotes(session.id, event.currentTarget.value);
            }}
            rows={3}
            placeholder="Write what felt good, what to adjust next time, and pacing notes."
            className={guideTrackerTextareaClass}
          />
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              {notes.length}/{MAX_NOTES_LENGTH}
            </span>
            <span>{formatSessionUpdatedLabel(progress?.updatedAt)}</span>
          </div>
        </div>
      </article>
    );
  };

  if (sortedSessions.length === 0) {
    return (
      <div className={guideTrackerEmptyClass}>
        <h2 className="text-base font-semibold text-slate-900">Guide content unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sessions are not configured yet. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className={guideTrackerHeroShellClass} data-testid="guide-0-1000m-action-shell">
        <h1 className="text-3xl font-bold text-slate-900">0-1000m interactive plan</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Track each session with completion and notes. Progress is stored locally immediately and
          synced to your account in the background.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className={`${guideTrackerMetricClass} border-emerald-200 bg-emerald-50/50`}>
            <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
              Completed
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {completedCount}/{sortedSessions.length}
            </p>
          </div>
          <div className={guideTrackerMutedPanelClass}>
            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Remaining
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{remainingCount}</p>
          </div>
          <div className={`${guideTrackerMetricClass} border-blue-100 bg-blue-50/60`}>
            <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Progress</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{completionPercent}%</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <GuideSyncStatus
            state={syncState}
            label={syncLabel}
            onRetry={retryGuideProgressSync}
            testId="guide-0-1000m-sync-status"
          />
          {lastSession ? (
            <button
              type="button"
              onClick={() => openSessionFullscreen(lastSession.id)}
              className={guideTrackerSmallSecondaryActionClass}
            >
              Continue where you left off ({lastSession.id})
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const nextId = getFirstIncompleteId(sortedSessions, progressBySessionId);
              if (!nextId) return;
              openSessionFullscreen(nextId);
            }}
            className={guideTrackerSmallSecondaryActionClass}
          >
            Open next session full screen
          </button>
        </div>
      </section>

      {hydrationState === "loading" ? (
        <div className="space-y-3" aria-label="Loading guide progress">
          <div className="fs-library-card fs-library-card-muted h-28 animate-pulse" />
          <div className="fs-library-card fs-library-card-muted h-28 animate-pulse" />
          <div className="fs-library-card fs-library-card-muted h-28 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-5">
          {sessionsByWeek.map((week) => {
            const split = splitItemsByCompletion(week.sessions, progressBySessionId);
            const showCompleted = expandedCompletedWeeks[week.weekNumber] ?? false;

            return (
              <section key={week.weekNumber} className={guideTrackerPanelClass}>
                <h2 className="text-lg font-semibold text-slate-900">Week {week.weekNumber}</h2>

                {split.incomplete.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {split.incomplete.map((session) => renderSessionCard(session))}
                  </div>
                ) : (
                  <div className="fs-library-card mt-4 border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-900">
                    All sessions in this week are currently marked complete.
                  </div>
                )}

                {split.completed.length > 0 ? (
                  <div className={`${guideTrackerMutedPanelClass} mt-4`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Completed sessions ({split.completed.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedCompletedWeeks((previous) => ({
                            ...previous,
                            [week.weekNumber]: !showCompleted,
                          }));
                        }}
                        className={guideTrackerSmallSecondaryActionClass}
                      >
                        {showCompleted ? "Hide completed" : "Show completed"}
                      </button>
                    </div>
                    {showCompleted ? (
                      <div className="mt-3 grid gap-3">
                        {split.completed.map((session) =>
                          renderSessionCard(session, { muted: true })
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-600">
                        Completed sessions are collapsed to keep the overview focused. Open anytime.
                      </p>
                    )}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      {focusedSession ? (
        <div className="fixed inset-0 z-[80] bg-slate-950/92">
          <button
            type="button"
            onClick={closeSessionFullscreen}
            className="absolute inset-0"
            aria-label="Close full screen session view"
          />

          <div className="relative z-[1] mx-auto flex h-full w-full max-w-[980px] flex-col px-3 pt-3 pb-4 sm:px-6 sm:pt-5 sm:pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-white">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-200 uppercase">
                  Session full screen
                </p>
                <p className="text-sm font-semibold">
                  {focusedSession.id} - {focusedSession.title}
                </p>
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-3xl border border-white/20 bg-white p-4 shadow-[0_20px_60px_rgba(2,6,23,0.45)] sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Session {focusedSession.id}
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">{focusedSession.title}</h3>

              <p className="mt-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Focus:</span> {focusedSession.focus}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Target set:</span>{" "}
                {focusedSession.targetSet}
              </p>

              <p className="mt-4 text-xs text-slate-500">
                {formatSessionUpdatedLabel(focusedSessionProgress?.updatedAt)}
              </p>

              <div className="mt-4 space-y-2">
                <label
                  htmlFor={`guide-session-fullscreen-${focusedSession.id}`}
                  className="text-xs font-semibold text-slate-700"
                >
                  Session notes
                </label>
                <textarea
                  id={`guide-session-fullscreen-${focusedSession.id}`}
                  value={focusedSessionProgress?.notes ?? ""}
                  onChange={(event) => {
                    updateSessionNotes(focusedSession.id, event.currentTarget.value);
                  }}
                  rows={8}
                  placeholder="Write what felt good, what to adjust next time, and pacing notes."
                  className={guideTrackerTextareaClass}
                />
                <p className="text-xs text-slate-500">
                  {(focusedSessionProgress?.notes ?? "").length}/{MAX_NOTES_LENGTH}
                </p>
              </div>

              <AdminContextNotesPanel
                contextType="guide_session"
                contextRef={focusedSession.id}
                contextLabel={`Session: ${focusedSession.title} (${focusedSession.id})`}
                collapsedByDefault
                className="mt-4"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-slate-900/55 p-2 backdrop-blur">
              <button
                type="button"
                onClick={openPreviousSessionFullscreen}
                disabled={focusedSessionIndex <= 0}
                className={`${guideTrackerSecondaryActionClass} min-w-[108px] border-white/35 bg-white/10 text-white hover:bg-white/15`}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={openNextSessionFullscreen}
                disabled={
                  focusedSessionIndex < 0 || focusedSessionIndex >= sortedSessions.length - 1
                }
                className={`${guideTrackerPrimaryActionClass} min-w-[108px]`}
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => toggleSessionCompleted(focusedSession)}
                className={`min-w-[128px] ${
                  focusedSessionProgress?.completed
                    ? guideTrackerCompletedActionClass
                    : guideTrackerPrimaryActionClass
                }`}
              >
                {focusedSessionProgress?.completed ? "Completed" : "Mark complete"}
              </button>
              <button
                type="button"
                onClick={closeSessionFullscreen}
                className={`${guideTrackerSecondaryActionClass} min-w-[96px] border-white/35 bg-white/10 text-white hover:bg-white/15`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {completionUndoState ? (
        <div className="fixed inset-x-0 bottom-4 z-[85] flex justify-center px-4">
          <div className="flex w-full max-w-[560px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-[0_12px_34px_rgba(15,23,42,0.18)]">
            <p className="text-sm font-medium text-emerald-900">Session marked complete.</p>
            <button
              type="button"
              onClick={undoLatestCompletion}
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-emerald-300 bg-white px-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Undo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
