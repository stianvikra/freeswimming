import type { ReactNode } from "react";
import { cx } from "@/components/ui/cx";

type AdminManagerStateTone =
  | "loading"
  | "info"
  | "neutral"
  | "warning"
  | "error"
  | "success"
  | "empty"
  | "no-results";
type AdminManagerStateAnnouncement = "polite" | "assertive" | "off";
type AdminManagerStateDensity = "normal" | "compact" | "spacious";
type AdminManagerStateElement = "div" | "article";
type AdminManagerStateTitleElement = "p" | "h3";

type AdminManagerStateProps = {
  tone: AdminManagerStateTone;
  children?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  as?: AdminManagerStateElement;
  titleElement?: AdminManagerStateTitleElement;
  announcement?: AdminManagerStateAnnouncement;
  density?: AdminManagerStateDensity;
  className?: string;
  actionsClassName?: string;
  testId?: string;
};

const toneClasses: Record<AdminManagerStateTone, string> = {
  loading: "border border-slate-200 bg-slate-50 text-slate-600",
  info: "border border-blue-200 bg-blue-50/60 text-blue-800",
  neutral: "border border-slate-200 bg-white text-slate-700",
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
  if (tone === "neutral") return "text-sm font-semibold text-slate-900";
  if (tone === "error") return "text-sm font-medium text-rose-700";
  if (tone === "info") return "text-sm font-semibold text-blue-900";
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
  as: Component = "div",
  titleElement: TitleElement = "p",
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
    <Component
      className={cx("mt-5", densityClasses[density], toneClasses[tone], className)}
      role={role}
      aria-live={ariaLive}
      data-testid={testId}
    >
      {title ? <TitleElement className={titleClassForTone(tone)}>{title}</TitleElement> : null}
      {children ? (
        <div className={messageClassForTone(tone, Boolean(title))}>{children}</div>
      ) : null}
      {actions ? (
        <div className={actionsClassName ?? "mt-3 flex flex-wrap gap-2"}>{actions}</div>
      ) : null}
    </Component>
  );
}
