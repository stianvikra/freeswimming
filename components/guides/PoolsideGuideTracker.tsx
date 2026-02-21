"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import {
  MAX_GUIDE_PROGRESS_ROWS,
  normalizeGuideProgressRows,
  type GuideProgressRow,
} from "@/lib/course/guide-progress";
import { type PoolsideDrill } from "@/lib/guides/guide-poolside";
import { getFirstIncompleteId, splitItemsByCompletion } from "@/lib/guides/guide-tracker-ui";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

const GUIDE_PROGRESS_SYNC_API_PATH = "/api/progress/guide";
const GUIDE_PROGRESS_STORAGE_KEY = "fs_guide_poolside_progress_v1";
const GUIDE_LAST_DRILL_STORAGE_KEY = "fs_guide_poolside_last_drill_v1";
const GUIDE_OVERVIEW_COMPLETED_VISIBILITY_STORAGE_KEY =
  "fs_guide_poolside_show_completed_overview_v1";
const GUIDE_PROGRESS_SYNC_INTERVAL_MS = 10_000;
const MAX_NOTES_LENGTH = 1000;
const SWIPE_MIN_DISTANCE_PX = 56;
const SWIPE_VERTICAL_TOLERANCE_PX = 72;
const VISUAL_MAX_SCALE = 3;
const VISUAL_MIN_SCALE = 1;
const DOUBLE_TAP_WINDOW_MS = 280;
const COMPLETION_UNDO_TIMEOUT_MS = 8_000;

type SyncState = "idle" | "syncing" | "synced" | "error" | "offline";

type DrillProgress = {
  completed: boolean;
  notes: string;
  updatedAt: string;
};

type DrillProgressRecord = Record<string, DrillProgress>;

type CompletionUndoState = {
  drillId: string;
  previousCompleted: boolean;
  expiresAt: number;
};

type Props = {
  guideSlug: string;
  drills: PoolsideDrill[];
};

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

function clampScale(value: number): number {
  if (!Number.isFinite(value)) return VISUAL_MIN_SCALE;
  return Math.min(VISUAL_MAX_SCALE, Math.max(VISUAL_MIN_SCALE, value));
}

function touchDistance(
  touchA: { clientX: number; clientY: number },
  touchB: { clientX: number; clientY: number }
): number {
  const dx = touchA.clientX - touchB.clientX;
  const dy = touchA.clientY - touchB.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function PoolsideGuideTracker({ guideSlug, drills }: Props) {
  const allowedSectionIds = useMemo(() => new Set(drills.map((drill) => drill.id)), [drills]);
  const [progressByDrillId, setProgressByDrillId] = useState<DrillProgressRecord>({});
  const progressByDrillIdRef = useRef<DrillProgressRecord>({});
  const [hydrationState, setHydrationState] = useState<"loading" | "ready">("loading");
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncError, setSyncError] = useState("");
  const [lastSyncAtMs, setLastSyncAtMs] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(readNavigatorOnlineState);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [visualDrillId, setVisualDrillId] = useState<string | null>(null);
  const [visualScale, setVisualScale] = useState(1);
  const [lastDrillId, setLastDrillId] = useState<string | null>(null);
  const [showCompletedInOverview, setShowCompletedInOverview] = useState(false);
  const [completionUndoState, setCompletionUndoState] = useState<CompletionUndoState | null>(null);

  const dirtySectionIdsRef = useRef<Set<string>>(new Set());
  const syncInFlightRef = useRef(false);

  const swipeTouchIdRef = useRef<number | null>(null);
  const swipeStartXRef = useRef(0);
  const swipeStartYRef = useRef(0);
  const swipeLastXRef = useRef(0);
  const swipeLastYRef = useRef(0);
  const visualSwipeTouchIdRef = useRef<number | null>(null);
  const visualSwipeStartXRef = useRef(0);
  const visualSwipeStartYRef = useRef(0);
  const visualSwipeLastXRef = useRef(0);
  const visualSwipeLastYRef = useRef(0);
  const visualPinchStartDistanceRef = useRef<number | null>(null);
  const visualPinchStartScaleRef = useRef(VISUAL_MIN_SCALE);
  const visualLastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

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
    if (typeof window === "undefined") return;

    try {
      const storedLastDrillId = localStorage.getItem(GUIDE_LAST_DRILL_STORAGE_KEY);
      if (storedLastDrillId) {
        setLastDrillId(storedLastDrillId);
      }
    } catch {}

    try {
      const raw = localStorage.getItem(GUIDE_OVERVIEW_COMPLETED_VISIBILITY_STORAGE_KEY);
      if (raw === "1") {
        setShowCompletedInOverview(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!lastDrillId) return;
    try {
      localStorage.setItem(GUIDE_LAST_DRILL_STORAGE_KEY, lastDrillId);
    } catch {}
  }, [lastDrillId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        GUIDE_OVERVIEW_COMPLETED_VISIBILITY_STORAGE_KEY,
        showCompletedInOverview ? "1" : "0"
      );
    } catch {}
  }, [showCompletedInOverview]);

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

  const toggleDrillCompleted = useCallback(
    (drillId: string) => {
      const previousCompleted = progressByDrillId[drillId]?.completed ?? false;
      const nextCompletedState = !previousCompleted;
      const timestamp = new Date().toISOString();

      updateDrillProgress(drillId, (current) => ({
        completed: nextCompletedState,
        notes: current.notes,
        updatedAt: timestamp,
      }));

      if (nextCompletedState) {
        setCompletionUndoState({
          drillId,
          previousCompleted,
          expiresAt: Date.now() + COMPLETION_UNDO_TIMEOUT_MS,
        });
      } else {
        setCompletionUndoState(null);
      }
    },
    [progressByDrillId, updateDrillProgress]
  );

  const updateDrillNotes = useCallback(
    (drillId: string, nextNotes: string) => {
      const timestamp = new Date().toISOString();
      updateDrillProgress(drillId, (current) => ({
        completed: current.completed,
        notes: nextNotes.slice(0, MAX_NOTES_LENGTH),
        updatedAt: timestamp,
      }));
    },
    [updateDrillProgress]
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
  const lastDrill = lastDrillId ? (drills.find((drill) => drill.id === lastDrillId) ?? null) : null;
  const visualDrill = visualDrillId
    ? (drills.find((drill) => drill.id === visualDrillId) ?? null)
    : null;
  const visualDrillIndex = visualDrill
    ? drills.findIndex((drill) => drill.id === visualDrill.id)
    : -1;
  const canGoVisualPrevious = visualDrillIndex > 0;
  const canGoVisualNext = visualDrillIndex >= 0 && visualDrillIndex < drills.length - 1;

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
    setActiveIndex((prev) => {
      const nextIndex = Math.max(0, prev - 1);
      const nextDrill = drills[nextIndex];
      if (nextDrill) {
        setLastDrillId(nextDrill.id);
      }
      return nextIndex;
    });
  }, [drills]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => {
      const nextIndex = Math.min(drills.length - 1, prev + 1);
      const nextDrill = drills[nextIndex];
      if (nextDrill) {
        setLastDrillId(nextDrill.id);
      }
      return nextIndex;
    });
  }, [drills]);

  const closeVisualView = useCallback(() => {
    setVisualDrillId(null);
    setVisualScale(VISUAL_MIN_SCALE);
  }, []);

  const openVisualPrevious = useCallback(() => {
    if (!canGoVisualPrevious) return;
    const previousDrill = drills[visualDrillIndex - 1];
    if (!previousDrill) return;
    setVisualDrillId(previousDrill.id);
    setLastDrillId(previousDrill.id);
    setVisualScale(VISUAL_MIN_SCALE);
  }, [canGoVisualPrevious, drills, visualDrillIndex]);

  const openVisualNext = useCallback(() => {
    if (!canGoVisualNext) return;
    const nextDrill = drills[visualDrillIndex + 1];
    if (!nextDrill) return;
    setVisualDrillId(nextDrill.id);
    setLastDrillId(nextDrill.id);
    setVisualScale(VISUAL_MIN_SCALE);
  }, [canGoVisualNext, drills, visualDrillIndex]);

  const openVisualViewForDrill = useCallback((drillId: string) => {
    setVisualDrillId(drillId);
    setLastDrillId(drillId);
    setVisualScale(VISUAL_MIN_SCALE);
  }, []);

  const undoLatestCompletion = useCallback(() => {
    if (!completionUndoState) return;
    const timestamp = new Date().toISOString();
    updateDrillProgress(completionUndoState.drillId, (current) => ({
      completed: completionUndoState.previousCompleted,
      notes: current.notes,
      updatedAt: timestamp,
    }));
    setCompletionUndoState(null);
  }, [completionUndoState, updateDrillProgress]);

  useEffect(() => {
    const activeDrill = drills[activeIndex];
    if (!activeDrill) return;
    setLastDrillId(activeDrill.id);
  }, [activeIndex, drills]);

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

      if (visualDrillIndex >= 0) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeVisualView();
          return;
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          openVisualPrevious();
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          openVisualNext();
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    closeVisualView,
    drills.length,
    goNext,
    goPrev,
    openVisualNext,
    openVisualPrevious,
    visualDrillIndex,
  ]);

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
          {lastDrill ? (
            <button
              type="button"
              onClick={() => {
                const resumeIndex = drills.findIndex((drill) => drill.id === lastDrill.id);
                if (resumeIndex < 0) return;
                setActiveIndex(resumeIndex);
              }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continue where you left off ({lastDrill.id})
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const nextId = getFirstIncompleteId(drills, progressByDrillId);
              if (!nextId) return;
              const nextIndex = drills.findIndex((drill) => drill.id === nextId);
              if (nextIndex < 0) return;
              setActiveIndex(nextIndex);
            }}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Open next drill
          </button>
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

          {(() => {
            const split = splitItemsByCompletion(drills, progressByDrillId);
            const visibleDrills = showCompletedInOverview
              ? [...split.incomplete, ...split.completed]
              : split.incomplete;

            return (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {visibleDrills.map((drill) => {
                    const index = drills.findIndex((candidate) => candidate.id === drill.id);
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

                {split.completed.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        Completed drills ({split.completed.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowCompletedInOverview((value) => !value)}
                        className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {showCompletedInOverview ? "Hide completed" : "Show completed"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            );
          })()}
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
              onClick={() => toggleDrillCompleted(currentDrill.id)}
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
                    updateDrillNotes(currentDrill.id, event.currentTarget.value);
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

              <AdminContextNotesPanel
                contextType="guide_drill"
                contextRef={currentDrill.id}
                contextLabel={`Drill: ${currentDrill.title} (${currentDrill.id})`}
                collapsedByDefault
              />
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
                onClick={() => openVisualViewForDrill(currentDrill.id)}
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
              Previous
            </button>

            <p className="text-xs text-slate-500">Swipe left/right or use buttons to navigate.</p>

            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="inline-flex min-h-[44px] min-w-[120px] items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition enabled:hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
            </button>
          </div>
        </article>
      ) : null}

      {visualDrill ? (
        <div className="bg-slate-950/92 fixed inset-0 z-[80]" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={closeVisualView}
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
              <p className="text-xs font-semibold text-slate-200">
                Zoom {Math.round(visualScale * 100)}%
              </p>
            </div>

            <div
              className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 pb-4 sm:px-5"
              onTouchStart={(event) => {
                if (event.touches.length === 2) {
                  const touchA = event.touches.item(0);
                  const touchB = event.touches.item(1);
                  if (!touchA || !touchB) return;
                  visualPinchStartDistanceRef.current = touchDistance(touchA, touchB);
                  visualPinchStartScaleRef.current = visualScale;
                  visualSwipeTouchIdRef.current = null;
                  return;
                }

                if (event.touches.length !== 1) return;
                const touch = event.touches[0];
                const now = Date.now();
                const lastTap = visualLastTapRef.current;

                if (
                  lastTap &&
                  now - lastTap.time <= DOUBLE_TAP_WINDOW_MS &&
                  Math.abs(lastTap.x - touch.clientX) <= 24 &&
                  Math.abs(lastTap.y - touch.clientY) <= 24
                ) {
                  setVisualScale((current) =>
                    current > VISUAL_MIN_SCALE + 0.05 ? VISUAL_MIN_SCALE : 2
                  );
                  visualLastTapRef.current = null;
                  return;
                }

                visualLastTapRef.current = {
                  time: now,
                  x: touch.clientX,
                  y: touch.clientY,
                };
                visualSwipeTouchIdRef.current = touch.identifier;
                visualSwipeStartXRef.current = touch.clientX;
                visualSwipeStartYRef.current = touch.clientY;
                visualSwipeLastXRef.current = touch.clientX;
                visualSwipeLastYRef.current = touch.clientY;
              }}
              onTouchMove={(event) => {
                if (event.touches.length === 2) {
                  const touchA = event.touches.item(0);
                  const touchB = event.touches.item(1);
                  if (!touchA || !touchB) return;
                  const startDistance = visualPinchStartDistanceRef.current;
                  if (!startDistance || startDistance <= 0) return;
                  const distance = touchDistance(touchA, touchB);
                  const ratio = distance / startDistance;
                  setVisualScale(clampScale(visualPinchStartScaleRef.current * ratio));
                  return;
                }

                const trackedId = visualSwipeTouchIdRef.current;
                if (trackedId === null) return;
                for (let i = 0; i < event.touches.length; i += 1) {
                  const touch = event.touches.item(i);
                  if (!touch || touch.identifier !== trackedId) continue;
                  visualSwipeLastXRef.current = touch.clientX;
                  visualSwipeLastYRef.current = touch.clientY;
                  return;
                }
              }}
              onTouchEnd={() => {
                if (visualPinchStartDistanceRef.current) {
                  visualPinchStartDistanceRef.current = null;
                }

                if (visualSwipeTouchIdRef.current === null) return;
                if (visualScale > VISUAL_MIN_SCALE + 0.05) {
                  visualSwipeTouchIdRef.current = null;
                  return;
                }

                const deltaX = visualSwipeLastXRef.current - visualSwipeStartXRef.current;
                const deltaY = visualSwipeLastYRef.current - visualSwipeStartYRef.current;
                visualSwipeTouchIdRef.current = null;

                if (Math.abs(deltaY) > SWIPE_VERTICAL_TOLERANCE_PX) return;
                if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE_PX) return;

                if (deltaX < 0) {
                  openVisualNext();
                } else {
                  openVisualPrevious();
                }
              }}
              onTouchCancel={() => {
                visualSwipeTouchIdRef.current = null;
                visualPinchStartDistanceRef.current = null;
              }}
              onDoubleClick={() => {
                setVisualScale((current) =>
                  current > VISUAL_MIN_SCALE + 0.05 ? VISUAL_MIN_SCALE : 2
                );
              }}
            >
              <div className="flex h-full w-full max-w-[1280px] items-center justify-center overflow-hidden rounded-2xl">
                <Image
                  src={visualDrill.visualAssetPath}
                  alt={visualDrill.visualAlt}
                  width={1600}
                  height={1000}
                  unoptimized
                  draggable={false}
                  className="h-full max-h-full w-full max-w-[1200px] select-none object-contain"
                  style={{
                    transform: `scale(${visualScale})`,
                    transformOrigin: "center center",
                    transition:
                      visualScale <= VISUAL_MIN_SCALE + 0.01 ? "transform 120ms ease-out" : "none",
                  }}
                />
              </div>
            </div>

            <div className="mx-3 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-slate-900/55 p-2 backdrop-blur sm:mx-5">
              <button
                type="button"
                onClick={openVisualPrevious}
                disabled={!canGoVisualPrevious}
                className="inline-flex min-h-[44px] min-w-[104px] items-center justify-center rounded-xl border border-white/35 px-4 text-sm font-semibold text-white transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={openVisualNext}
                disabled={!canGoVisualNext}
                className="inline-flex min-h-[44px] min-w-[104px] items-center justify-center rounded-xl border border-white/35 bg-white px-4 text-sm font-semibold text-slate-900 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => toggleDrillCompleted(visualDrill.id)}
                className={`inline-flex min-h-[44px] min-w-[126px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                  progressByDrillId[visualDrill.id]?.completed
                    ? "border border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                {progressByDrillId[visualDrill.id]?.completed ? "Completed" : "Mark complete"}
              </button>
              <button
                type="button"
                onClick={closeVisualView}
                className="inline-flex min-h-[44px] min-w-[96px] items-center justify-center rounded-xl border border-white/35 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Close
              </button>
              <p className="ml-auto text-xs text-slate-200">
                Pinch or double tap to zoom. Swipe to move between visuals.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {completionUndoState ? (
        <div className="fixed inset-x-0 bottom-4 z-[85] flex justify-center px-4">
          <div className="flex w-full max-w-[560px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-[0_12px_34px_rgba(15,23,42,0.18)]">
            <p className="text-sm font-medium text-emerald-900">Drill marked complete.</p>
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
