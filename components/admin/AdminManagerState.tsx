import type { ReactNode } from "react";
import { cx } from "@/components/ui/cx";

type AdminManagerStateTone = "loading" | "warning" | "error" | "success" | "empty" | "no-results";
type AdminManagerStateAnnouncement = "polite" | "assertive" | "off";
type AdminManagerStateDensity = "normal" | "compact" | "spacious";

type AdminManagerStateProps = {
  tone: AdminManagerStateTone;
  children?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  announcement?: AdminManagerStateAnnouncement;
  density?: AdminManagerStateDensity;
  className?: string;
  actionsClassName?: string;
  testId?: string;
};

const toneClasses: Record<AdminManagerStateTone, string> = {
  loading: "border border-slate-200 bg-slate-50 text-slate-600",
  warning: "border border-amber-200 bg-amber-50 text-amber-800",
  error: "border border-rose-200 bg-rose-50 text-rose-700",
  success: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  empty: "border border-dashed border-slate-300 bg-slate-50 text-slate-600",
  "no-results": "border border-dashed border-slate-300 bg-slate-50 text-slate-600",
};

const densityClasses: Record<AdminManagerStateDensity, string> = {
  normal: "rounded-xl px-4 py-3",
  compact: "rounded-lg px-3 py-2",
  spacious: "rounded-xl p-4",
};

function defaultAnnouncementForTone(tone: AdminManagerStateTone): AdminManagerStateAnnouncement {
  if (tone === "empty" || tone === "no-results") return "off";
  if (tone === "error") return "assertive";
  return "polite";
}

function titleClassForTone(tone: AdminManagerStateTone): string {
  if (tone === "empty" || tone === "no-results") return "text-sm font-semibold text-slate-900";
  if (tone === "error") return "text-sm font-medium text-rose-700";
  return "text-sm font-medium";
}

function messageClassForTone(tone: AdminManagerStateTone, hasTitle: boolean): string {
  return cx(
    hasTitle ? "mt-1" : "",
    tone === "error" && !hasTitle ? "text-sm font-medium text-rose-700" : "text-sm"
  );
}

export default function AdminManagerState({
  tone,
  title,
  children,
  actions,
  announcement,
  density = "normal",
  className,
  actionsClassName,
  testId,
}: AdminManagerStateProps) {
  const resolvedAnnouncement = announcement ?? defaultAnnouncementForTone(tone);
  const role =
    resolvedAnnouncement === "assertive"
      ? "alert"
      : resolvedAnnouncement === "polite"
        ? "status"
        : undefined;
  const ariaLive =
    resolvedAnnouncement === "assertive"
      ? "assertive"
      : resolvedAnnouncement === "polite"
        ? "polite"
        : undefined;

  return (
    <div
      className={cx("mt-5", densityClasses[density], toneClasses[tone], className)}
      role={role}
      aria-live={ariaLive}
      data-testid={testId}
    >
      {title ? <p className={titleClassForTone(tone)}>{title}</p> : null}
      {children ? <p className={messageClassForTone(tone, Boolean(title))}>{children}</p> : null}
      {actions ? (
        <div className={actionsClassName ?? "mt-3 flex flex-wrap gap-2"}>{actions}</div>
      ) : null}
    </div>
  );
}
