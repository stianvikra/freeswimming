import { RefreshCcw } from "lucide-react";
import { cx } from "@/components/ui/cx";

export type CourseProgressSyncStatusState = "idle" | "syncing" | "synced" | "error";

type CourseProgressSyncStatusProps = {
  state: CourseProgressSyncStatusState | string;
  label: string;
  onRetry: () => void;
  className?: string;
  testId?: string;
};

const stateClasses: Record<CourseProgressSyncStatusState, string> = {
  idle: "border-slate-200 bg-white/88 text-slate-700",
  syncing: "border-blue-200 bg-blue-50/90 text-blue-800",
  synced: "border-emerald-200 bg-emerald-50/90 text-emerald-800",
  error: "border-rose-200 bg-rose-50/90 text-rose-800",
};

const stateTitles: Record<CourseProgressSyncStatusState, string> = {
  idle: "Account sync",
  syncing: "Syncing",
  synced: "Saved",
  error: "Needs retry",
};

export function normalizeCourseProgressSyncStatusState(
  state: CourseProgressSyncStatusState | string
): CourseProgressSyncStatusState {
  if (state === "idle" || state === "syncing" || state === "synced" || state === "error") {
    return state;
  }
  return "idle";
}

export default function CourseProgressSyncStatus({
  state,
  label,
  onRetry,
  className,
  testId = "course-progress-sync-status",
}: CourseProgressSyncStatusProps) {
  const normalizedState = normalizeCourseProgressSyncStatusState(state);
  const showRetry = normalizedState === "error";

  return (
    <div
      className={cx(
        "flex min-h-[48px] flex-col gap-2 rounded-2xl border px-3 py-2 text-[12px] sm:flex-row sm:items-center sm:justify-between",
        stateClasses[normalizedState],
        className
      )}
      data-sync-state={normalizedState}
      data-testid={testId}
    >
      <div className="min-w-0" role="status" aria-live="polite">
        <p className="leading-snug font-semibold">{stateTitles[normalizedState]}</p>
        <p className="mt-0.5 leading-snug">{label}</p>
      </div>
      {showRetry ? (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Retry course progress sync"
          className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Retry now
        </button>
      ) : null}
    </div>
  );
}
