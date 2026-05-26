import type { ReactNode } from "react";
import { cx } from "@/components/ui/cx";

type DrylandFeedbackTone = "warning" | "error" | "success" | "empty";

type DrylandFeedbackProps = {
  id?: string;
  tone: DrylandFeedbackTone;
  children: ReactNode;
  action?: ReactNode;
  density?: "regular" | "compact";
  className?: string;
  testId?: string;
};

const toneClasses: Record<DrylandFeedbackTone, string> = {
  warning: "border-amber-200 bg-amber-50/80 text-amber-900",
  error: "border-rose-200 bg-rose-50/80 text-rose-900",
  success: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
  empty: "border-slate-200 bg-slate-50/80 text-slate-900",
};

export default function DrylandFeedback({
  id,
  tone,
  children,
  action,
  density = "regular",
  className,
  testId,
}: DrylandFeedbackProps) {
  const isError = tone === "error";
  const isStaticEmpty = tone === "empty";

  return (
    <div
      id={id}
      role={isStaticEmpty ? undefined : isError ? "alert" : "status"}
      aria-live={isStaticEmpty ? undefined : isError ? "assertive" : "polite"}
      data-feedback-tone={tone}
      data-testid={testId}
      className={cx(
        "flex flex-wrap items-center justify-between gap-3 border",
        density === "compact" ? "rounded-xl p-3" : "rounded-2xl p-4",
        toneClasses[tone],
        className
      )}
    >
      <div className="max-w-[58ch] min-w-0 text-sm leading-6">{children}</div>
      {action ? <div className="max-w-full min-w-0 sm:shrink-0">{action}</div> : null}
    </div>
  );
}
