import { RefreshCcw } from "lucide-react";
import { cx } from "@/components/ui/cx";

export type GuideSyncStatusState = "idle" | "syncing" | "synced" | "error" | "offline";

type GuideSyncStatusProps = {
  state: GuideSyncStatusState;
  label: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
  testId?: string;
};

const stateClasses: Record<GuideSyncStatusState, string> = {
  idle: "border-slate-200 bg-white text-slate-700",
  syncing: "border-blue-200 bg-blue-50 text-blue-800",
  synced: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  offline: "border-amber-200 bg-amber-50 text-amber-800",
};

const stateTitles: Record<GuideSyncStatusState, string> = {
  idle: "Sync ready",
  syncing: "Syncing",
  synced: "Saved",
  error: "Needs attention",
  offline: "Offline",
};

export default function GuideSyncStatus({
  state,
  label,
  onRetry,
  retryLabel = "Retry sync",
  className,
  testId,
}: GuideSyncStatusProps) {
  const showRetry = state === "error" || state === "offline";

  return (
    <div
      className={cx(
        "inline-flex min-h-[52px] w-full flex-col gap-3 rounded-2xl border px-4 py-3 text-sm sm:w-auto sm:min-w-72 sm:flex-row sm:items-center sm:justify-between",
        stateClasses[state],
        className
      )}
      data-sync-state={state}
      data-testid={testId}
    >
      <div className="min-w-0" role="status" aria-live="polite">
        <p className="text-xs font-semibold">{stateTitles[state]}</p>
        <p className="mt-1 text-sm leading-snug">{label}</p>
      </div>
      {showRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
