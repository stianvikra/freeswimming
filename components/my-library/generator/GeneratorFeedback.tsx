import type { ReactNode } from "react";
import { cx } from "@/components/ui/cx";

type GeneratorFeedbackTone = "warning" | "error" | "success";
type GeneratorFeedbackAnnouncement = "polite" | "assertive" | "none";

type GeneratorFeedbackProps = {
  id?: string;
  tone: GeneratorFeedbackTone;
  children: ReactNode;
  action?: ReactNode;
  announcement?: GeneratorFeedbackAnnouncement;
  density?: "regular" | "compact";
  className?: string;
  testId?: string;
};

const toneClasses: Record<GeneratorFeedbackTone, string> = {
  warning: "border-amber-200 bg-amber-50/80 text-amber-900",
  error: "border-rose-200 bg-rose-50/80 text-rose-900",
  success: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
};

function resolveAnnouncement(
  tone: GeneratorFeedbackTone,
  announcement: GeneratorFeedbackAnnouncement | undefined
) {
  if (announcement) return announcement;
  return tone === "error" ? "assertive" : "polite";
}

export default function GeneratorFeedback({
  id,
  tone,
  children,
  action,
  announcement,
  density = "regular",
  className,
  testId,
}: GeneratorFeedbackProps) {
  const resolvedAnnouncement = resolveAnnouncement(tone, announcement);
  const isSilent = resolvedAnnouncement === "none";

  return (
    <div
      id={id}
      role={isSilent ? undefined : resolvedAnnouncement === "assertive" ? "alert" : "status"}
      aria-live={isSilent ? undefined : resolvedAnnouncement}
      aria-atomic={isSilent ? undefined : "true"}
      data-feedback-tone={tone}
      data-testid={testId}
      className={cx(
        "border",
        action ? "flex flex-wrap items-center justify-between gap-3" : "",
        density === "compact" ? "rounded-xl p-3" : "rounded-2xl p-4",
        toneClasses[tone],
        className
      )}
    >
      <div className="min-w-0 text-sm leading-6">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
