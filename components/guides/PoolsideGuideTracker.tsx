"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  MAX_GUIDE_PROGRESS_ROWS,
  normalizeGuideProgressRows,
  type GuideProgressRow,
} from "@/lib/course/guide-progress";
import { type PoolsideDrill } from "@/lib/guides/guide-poolside";

const GUIDE_PROGRESS_SYNC_API_PATH = "/api/progress/guide";
const GUIDE_PROGRESS_STORAGE_KEY = "fs_guide_poolside_progress_v1";
const GUIDE_PROGRESS_SYNC_INTERVAL_MS = 10_000;
const MAX_NOTES_LENGTH = 1000;
const SWIPE_MIN_DISTANCE_PX = 56;
const SWIPE_VERTICAL_TOLERANCE_PX = 72;

type SyncState = "idle" | "syncing" | "synced" | "error" | "offline";

type DrillProgress = {
  completed: boolean;
  notes: string;
  updatedAt: string;
};

type DrillProgressRecord = Record<string, DrillProgress>;

type Props = {
  guideSlug: string;
  drills: PoolsideDrill[];
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

function toProgressRecord(rows: GuideProgressRow[]): DrillProgressRecord {
  const next: DrillProgressRecord = {};
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
  record: DrillProgressRecord,
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

function formatUpdatedAt(updatedAt: string | undefined): string {
  if (!updatedAt) return "Not updated yet";
  const ts = Date.parse(updatedAt);
  if (!Number.isFinite(ts)) return "Not updated yet";

  const ageMs = Math.max(0, Date.now() - ts);
  if (ageMs < 10_000) return "Updated just now";
  if (ageMs < 60_000) return "Updated <1 min ago";

  const ageMinutes = Math.floor(ageMs / 60_000);
  if (ageMinutes < 60) return `Updated ${ageMinutes} min ago`;

  const ageHours = Math.floor(ageMinutes / 60);
  return `Updated ${ageHours}h ago`;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("a,button,input,textarea,select,label,[data-no-swipe='true']"));
}

export default function PoolsideGuideTracker({ guideSlug, drills }: Props) {
  const allowedSectionIds = useMemo(() => new Set(drills.map((drill) => drill.id)), [drills]);
  const [progressByDrillId, setProgressByDrillId] = useState<DrillProgressRecord>({});
  const progressByDrillIdRef = useRef<DrillProgressRecord>({});
  const [hydrationState, setHydrationState] = useState<"loading" | "ready">("loading");
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncError, setSyncError] = useState("");
  const [lastSyncAtMs, setLastSyncAtMs] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(getInitialOnlineState);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [visualDrillId, setVisualDrillId] = useState<string | null>(null);

  const dirtySectionIdsRef = useRef<Set<string>>(new Set());
  const syncInFlightRef = useRef(false);

  const swipeTouchIdRef = useRef<number | null>(null);
  const swipeStartXRef = useRef(0);
  const swipeStartYRef = useRef(0);
  const swipeLastXRef = useRef(0);
  const swipeLastYRef = useRef(0);

  const applyProgressRows = useCallback(
    (rows: GuideProgressRow[]) => {
      const normalizedRows = filterRowsForGuide(rows, guideSlug, allowedSectionIds);
      const nextRecord = toProgressRecord(normalizedRows);
      progressByDrillIdRef.current = nextRecord;
      setProgressByDrillId(nextRecord);
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
        throw new Error("Session expired. Sign in again to keep syncing your drill progress.");
      }
      throw new Error(`Drill progress sync failed (${response.status}).`);
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

      const allRows = toProgressRows(progressByDrillIdRef.current, guideSlug, allowedSectionIds);
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
            : "Could not sync drill progress right now. Try again.";
        setSyncError(message);
        setSyncState("error");
      } finally {
        syncInFlightRef.current = false;
      }
    },
    [allowedSectionIds, guideSlug, isOnline, persistRowsToServer]
  );

  useEffect(() => {
    progressByDrillIdRef.current = progressByDrillId;
  }, [progressByDrillId]);

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
            throw new Error("Session expired. Sign in again to load your drill progress.");
          }
          throw new Error(`Drill progress hydrate failed (${response.status}).`);
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
            : "Could not load drill progress right now. You can continue locally.";
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

  useEffect(() => {
    if (drills.length === 0) return;

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

      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (event.key === "ArrowRight") {
        setActiveIndex((prev) => Math.min(drills.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drills.length]);

  const updateDrillProgress = useCallback(
    (
      drillId: string,
      updater: (current: DrillProgress) => DrillProgress,
      options?: { markDirty?: boolean }
    ) => {
      setProgressByDrillId((previous) => {
        const current = previous[drillId] ?? {
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
          [drillId]: {
            completed: next.completed,
            notes: next.notes.slice(0, MAX_NOTES_LENGTH),
            updatedAt: getSafeIsoTimestamp(next.updatedAt),
          },
        };

        progressByDrillIdRef.current = nextRecord;
        const localRows = toProgressRows(nextRecord, guideSlug, allowedSectionIds);
        persistLocalRows(localRows);

        if (options?.markDirty !== false) {
          dirtySectionIdsRef.current.add(drillId);
          setSyncState((state) => (state === "offline" ? state : "idle"));
          setSyncError("");
        }

        return nextRecord;
      });
    },
    [allowedSectionIds, guideSlug]
  );

  const completedCount = useMemo(() => {
    return drills.reduce((count, drill) => {
      const progress = progressByDrillId[drill.id];
      return progress?.completed ? count + 1 : count;
    }, 0);
  }, [drills, progressByDrillId]);

  const completionPercent =
    drills.length === 0 ? 0 : Math.round((completedCount / drills.length) * 100);
  const currentDrill = drills[activeIndex] ?? null;
  const currentDrillProgress = currentDrill ? progressByDrillId[currentDrill.id] : undefined;
  const visualDrill = visualDrillId
    ? (drills.find((drill) => drill.id === visualDrillId) ?? null)
    : null;

  const syncLabel = useMemo(() => {
    if (syncState === "syncing") return "Saving drill progress...";
    if (syncState === "offline" || !isOnline) {
      return "Offline mode: changes stay on this device and sync when connection returns.";
    }
    if (syncState === "error") {
      return syncError || "Could not sync drill progress right now.";
    }
    if (syncState === "synced") return formatRelativeAge(lastSyncAtMs);
    return "Signed in. Drill progress sync is active.";
  }, [isOnline, lastSyncAtMs, syncError, syncState]);

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < drills.length - 1;

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(drills.length - 1, prev + 1));
  }, [drills.length]);

  if (drills.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6">
        <h2 className="text-base font-semibold text-slate-900">Guide content unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">
          Poolside drills are not configured yet. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-[0_12px_40px_rgba(24,58,107,0.12)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Poolside interactive guide</h1>
            <p className="mt-2 max-w-[660px] text-sm leading-relaxed text-slate-600">
              One drill at a time. Swipe or use next/previous, open visual view in fullscreen, and
              mark each drill complete as you progress.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOverviewOpen((open) => !open)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {overviewOpen ? "Close drills overview" : "Drills overview"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Completed
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {completedCount}/{drills.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Current drill
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">{activeIndex + 1}</p>
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

      {overviewOpen ? (
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_8px_26px_rgba(15,23,42,0.08)]">
          <h2 className="text-base font-semibold text-slate-900">Drills overview</h2>
          <p className="mt-1 text-sm text-slate-600">
            Jump directly to any drill. Completed drills stay marked.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {drills.map((drill, index) => {
              const completed = progressByDrillId[drill.id]?.completed ?? false;
              const isActive = index === activeIndex;
              return (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => {
                    setActiveIndex(index);
                    setOverviewOpen(false);
                  }}
                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "border-blue-300 bg-blue-50 text-blue-900"
                      : completed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide">
                    {drill.id}
                  </span>
                  <span className="mt-1 line-clamp-2 block font-medium">{drill.title}</span>
                  <span className="mt-1 block text-xs">
                    {completed ? "Completed" : "Not completed"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {hydrationState === "loading" ? (
        <div className="space-y-3" aria-label="Loading drill progress">
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200/70 bg-white/80" />
        </div>
      ) : currentDrill ? (
        <article
          className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.10)]"
          onTouchStart={(event) => {
            if (event.touches.length !== 1) return;
            if (isInteractiveTarget(event.target)) return;
            const touch = event.touches[0];
            swipeTouchIdRef.current = touch.identifier;
            swipeStartXRef.current = touch.clientX;
            swipeStartYRef.current = touch.clientY;
            swipeLastXRef.current = touch.clientX;
            swipeLastYRef.current = touch.clientY;
          }}
          onTouchMove={(event) => {
            const trackedId = swipeTouchIdRef.current;
            if (trackedId === null) return;
            for (let i = 0; i < event.touches.length; i += 1) {
              const touch = event.touches.item(i);
              if (!touch || touch.identifier !== trackedId) continue;
              swipeLastXRef.current = touch.clientX;
              swipeLastYRef.current = touch.clientY;
              return;
            }
          }}
          onTouchEnd={() => {
            if (swipeTouchIdRef.current === null) return;
            const deltaX = swipeLastXRef.current - swipeStartXRef.current;
            const deltaY = swipeLastYRef.current - swipeStartYRef.current;
            swipeTouchIdRef.current = null;

            if (Math.abs(deltaY) > SWIPE_VERTICAL_TOLERANCE_PX) return;
            if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE_PX) return;

            if (deltaX < 0) {
              goNext();
            } else {
              goPrev();
            }
          }}
          onTouchCancel={() => {
            swipeTouchIdRef.current = null;
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Drill {activeIndex + 1} of {drills.length} - {currentDrill.id}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{currentDrill.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{currentDrill.summary}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                const timestamp = new Date().toISOString();
                updateDrillProgress(currentDrill.id, (current) => ({
                  completed: !current.completed,
                  notes: current.notes,
                  updatedAt: timestamp,
                }));
              }}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                currentDrillProgress?.completed
                  ? "border border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {currentDrillProgress?.completed ? "Completed" : "Mark complete"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Setup
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{currentDrill.setup}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  What to think about
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {currentDrill.keyFocus.map((focus) => (
                    <li key={focus} className="flex items-start gap-2">
                      <span className="mt-[7px] inline-block h-[6px] w-[6px] rounded-full bg-blue-500" />
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <label
                  htmlFor={`poolside-note-${currentDrill.id}`}
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Drill notes
                </label>
                <textarea
                  id={`poolside-note-${currentDrill.id}`}
                  value={currentDrillProgress?.notes ?? ""}
                  onChange={(event) => {
                    const timestamp = new Date().toISOString();
                    const nextNotes = event.currentTarget.value.slice(0, MAX_NOTES_LENGTH);
                    updateDrillProgress(currentDrill.id, (current) => ({
                      completed: current.completed,
                      notes: nextNotes,
                      updatedAt: timestamp,
                    }));
                  }}
                  rows={4}
                  placeholder="Write what worked and what you will focus on next time."
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                />
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {(currentDrillProgress?.notes ?? "").length}/{MAX_NOTES_LENGTH}
                  </span>
                  <span>{formatUpdatedAt(currentDrillProgress?.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5">
                <Image
                  src={currentDrill.visualAssetPath}
                  alt={currentDrill.visualAlt}
                  width={1200}
                  height={750}
                  unoptimized
                  className="h-[220px] w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setVisualDrillId(currentDrill.id)}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Visual view
              </button>
              <p className="text-xs leading-relaxed text-slate-500">
                Opens fullscreen visual view for phone portrait and landscape. Rotate device for a
                larger angle.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="inline-flex min-h-[44px] min-w-[120px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Forrige
            </button>

            <p className="text-xs text-slate-500">Swipe left/right or use buttons to navigate.</p>

            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="inline-flex min-h-[44px] min-w-[120px] items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition enabled:hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Neste
            </button>
          </div>
        </article>
      ) : null}

      {visualDrill ? (
        <div className="bg-slate-950/92 fixed inset-0 z-[80]" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setVisualDrillId(null)}
            className="absolute inset-0"
            aria-label="Close visual view"
          />
          <div className="relative z-[1] flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-200">
                  Visual view
                </p>
                <p className="text-sm font-semibold">
                  {visualDrill.id} - {visualDrill.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVisualDrillId(null)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/35 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center px-2 pb-5 sm:px-5">
              <Image
                src={visualDrill.visualAssetPath}
                alt={visualDrill.visualAlt}
                width={1600}
                height={1000}
                unoptimized
                className="h-full max-h-full w-full max-w-[1200px] object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
