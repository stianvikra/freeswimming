"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_GUIDE_PROGRESS_ROWS,
  normalizeGuideProgressRows,
  type GuideProgressRow,
} from "@/lib/course/guide-progress";
import { type Guide0To1000Session } from "@/lib/guides/guide-0-1000m";

const GUIDE_PROGRESS_SYNC_API_PATH = "/api/progress/guide";
const GUIDE_PROGRESS_STORAGE_KEY = "fs_guide_0_1000m_progress_v1";
const GUIDE_PROGRESS_SYNC_INTERVAL_MS = 10_000;
const MAX_NOTES_LENGTH = 4000;

type SyncState = "idle" | "syncing" | "synced" | "error" | "offline";

type SessionProgress = {
  completed: boolean;
  notes: string;
  updatedAt: string;
};

type SessionProgressRecord = Record<string, SessionProgress>;

type Props = {
  guideSlug: string;
  sessions: Guide0To1000Session[];
};

function getInitialOnlineState(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

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
  const [isOnline, setIsOnline] = useState(getInitialOnlineState);
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

      if (!navigator.onLine) {
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
        setSyncState(navigator.onLine ? "error" : "offline");
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
  }, [allowedSectionIds, applyProgressRows, guideSlug, persistRowsToServer]);

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

  const sessionsByWeek = useMemo(() => {
    const grouped = new Map<number, Guide0To1000Session[]>();
    for (const session of sessions) {
      const existing = grouped.get(session.weekNumber) ?? [];
      existing.push(session);
      grouped.set(session.weekNumber, existing);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([weekNumber, weekSessions]) => ({
        weekNumber,
        sessions: weekSessions.sort((left, right) => left.id.localeCompare(right.id)),
      }));
  }, [sessions]);

  const completedCount = useMemo(() => {
    return sessions.reduce((total, session) => {
      const progress = progressBySessionId[session.id];
      return progress?.completed ? total + 1 : total;
    }, 0);
  }, [progressBySessionId, sessions]);

  const remainingCount = Math.max(0, sessions.length - completedCount);
  const completionPercent =
    sessions.length === 0 ? 0 : Math.round((completedCount / sessions.length) * 100);

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

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6">
        <h2 className="text-base font-semibold text-slate-900">Guide content unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sessions are not configured yet. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-blue-100 bg-white/95 p-6 shadow-[0_12px_40px_rgba(24,58,107,0.12)]">
        <h1 className="text-3xl font-bold text-slate-900">0-1000m interactive plan</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Track each session with completion and notes. Progress is stored locally immediately and
          synced to your account in the background.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Completed
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {completedCount}/{sessions.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Remaining
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{remainingCount}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Progress</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{completionPercent}%</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-600" aria-live="polite">
            {syncLabel}
          </p>
          {(syncState === "error" || syncState === "offline") && (
            <button
              type="button"
              onClick={() => {
                void syncGuideProgressNow({ force: true });
              }}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Retry sync
            </button>
          )}
        </div>
      </section>

      {hydrationState === "loading" ? (
        <div className="space-y-3" aria-label="Loading guide progress">
          <div className="h-28 animate-pulse rounded-2xl border border-slate-200/70 bg-white/80" />
          <div className="h-28 animate-pulse rounded-2xl border border-slate-200/70 bg-white/80" />
          <div className="h-28 animate-pulse rounded-2xl border border-slate-200/70 bg-white/80" />
        </div>
      ) : (
        <div className="space-y-5">
          {sessionsByWeek.map((week) => (
            <section
              key={week.weekNumber}
              className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            >
              <h2 className="text-lg font-semibold text-slate-900">Week {week.weekNumber}</h2>
              <div className="mt-4 grid gap-3">
                {week.sessions.map((session) => {
                  const progress = progressBySessionId[session.id];
                  const completed = progress?.completed ?? false;
                  const notes = progress?.notes ?? "";
                  const textareaId = `guide-${session.id}-notes`;

                  return (
                    <article
                      key={session.id}
                      className={`rounded-2xl border p-4 transition ${
                        completed
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Session {session.id}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-slate-900">
                            {session.title}
                          </h3>
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={completed}
                            onChange={() => {
                              const timestamp = new Date().toISOString();
                              updateSessionProgress(session.id, (current) => ({
                                completed: !current.completed,
                                notes: current.notes,
                                updatedAt: timestamp,
                              }));
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          {completed ? "Completed" : "Mark complete"}
                        </label>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Focus:</span> {session.focus}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Target set:</span>{" "}
                        {session.targetSet}
                      </p>

                      <div className="mt-3 space-y-2">
                        <label
                          htmlFor={textareaId}
                          className="text-xs font-semibold text-slate-700"
                        >
                          Session notes
                        </label>
                        <textarea
                          id={textareaId}
                          value={notes}
                          onChange={(event) => {
                            const timestamp = new Date().toISOString();
                            const nextNotes = event.currentTarget.value.slice(0, MAX_NOTES_LENGTH);
                            updateSessionProgress(session.id, (current) => ({
                              completed: current.completed,
                              notes: nextNotes,
                              updatedAt: timestamp,
                            }));
                          }}
                          rows={3}
                          placeholder="Write what felt good, what to adjust next time, and pacing notes."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
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
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
