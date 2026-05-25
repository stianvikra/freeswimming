import type { ReactNode } from "react";
import { cx } from "@/components/ui/cx";

export type InstallFeedbackTone = "info" | "success" | "warning";

export type InstallFeedbackMessage = {
  tone: InstallFeedbackTone;
  message: string;
};

type InstallFeedbackProps = {
  id?: string;
  tone: InstallFeedbackTone;
  title?: string;
  children: ReactNode;
  className?: string;
  testId?: string;
};

const toneClasses: Record<InstallFeedbackTone, string> = {
  info: "border-blue-100/70 bg-white/88 text-slate-700",
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-800",
  warning: "border-amber-200 bg-amber-50/90 text-amber-900",
};

export default function InstallFeedback({
  id,
  tone,
  title,
  children,
  className,
  testId,
}: InstallFeedbackProps) {
  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-feedback-tone={tone}
      data-testid={testId}
      className={cx("rounded-2xl border p-3 text-[12px] leading-6", toneClasses[tone], className)}
    >
      {title ? <p className="text-[13px] font-semibold text-slate-900">{title}</p> : null}
      <div className={title ? "mt-2" : ""}>{children}</div>
    </div>
  );
}
