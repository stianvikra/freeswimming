export const guideTrackerEmptyClass =
  "fs-library-card fs-library-card-muted border-dashed p-5 sm:p-6";

export const guideTrackerHeroShellClass = "fs-library-card fs-library-card-accent p-5 sm:p-6";

export const guideTrackerPanelClass = "fs-library-card p-4 sm:p-5";

export const guideTrackerMutedPanelClass = "fs-library-card fs-library-card-muted p-4";

export const guideTrackerMetricClass = "fs-library-card p-4";

export const guideTrackerPrimaryActionClass =
  "fs-cta-primary inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

export const guideTrackerSecondaryActionClass =
  "fs-cta-secondary inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

export const guideTrackerSmallSecondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-3 text-xs font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

export const guideTrackerCompletedActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--fs-radius-control)] border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2";

export const guideTrackerTextareaClass =
  "mt-2 w-full rounded-[var(--fs-radius-control)] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export function getGuideTrackerSessionCardClass(completed: boolean, muted = false): string {
  if (!completed) {
    return "fs-library-card p-4 transition";
  }

  return muted
    ? "fs-library-card fs-library-card-muted border-emerald-200 bg-emerald-50/30 p-4 transition"
    : "fs-library-card border-emerald-200 bg-emerald-50/50 p-4 transition";
}
