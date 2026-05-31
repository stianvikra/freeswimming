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

export const guideTrackerFullscreenOverlayClass =
  "fixed inset-0 z-[80] bg-slate-900/72 backdrop-blur-[1px]";

export const guideTrackerOverlayActionBarClass =
  "grid grid-cols-2 items-center gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/95 p-2 shadow-[0_18px_44px_rgba(2,6,23,0.18)] backdrop-blur sm:flex sm:flex-wrap";

export const guideTrackerOverlayPrimaryActionClass =
  "fs-cta-primary inline-flex min-h-11 w-full items-center justify-center px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-4";

export const guideTrackerOverlaySecondaryActionClass =
  "fs-cta-secondary inline-flex min-h-11 w-full items-center justify-center px-3 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-4";

export const guideTrackerOverlayCompletedActionClass =
  "inline-flex min-h-11 w-full items-center justify-center rounded-[var(--fs-radius-control)] border border-emerald-300 bg-emerald-100 px-3 text-sm font-semibold text-emerald-950 shadow-[0_10px_24px_rgba(15,118,110,0.08)] transition-none hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:w-auto sm:px-4";

export const guideTrackerOverlayVisualFrameClass =
  "flex h-full w-full max-w-[1280px] items-center justify-center overflow-hidden rounded-[var(--fs-radius-card)] border border-white/20 bg-white shadow-[0_20px_60px_rgba(2,6,23,0.32)]";

export const guideTrackerCompletionToastClass =
  "fs-library-card flex w-full max-w-[560px] flex-wrap items-center justify-between gap-3 border-emerald-200 bg-emerald-50/95 px-4 py-3 shadow-[0_12px_34px_rgba(15,23,42,0.18)]";

export const guideTrackerCompletionToastViewportClass =
  "fixed inset-x-0 bottom-4 z-[85] flex justify-center px-4";

export const guideTrackerOverlayCompletionToastViewportClass =
  "fixed inset-x-0 bottom-40 z-[85] flex justify-center px-4 sm:bottom-24";

export const guideTrackerCompletionUndoActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center border-emerald-300 bg-white px-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2";

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
