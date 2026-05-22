import type { ReactNode } from "react";
import { cx } from "@/components/ui/cx";

type CommerceActionFeedbackTone = "pending" | "success" | "error";

type CommerceActionFeedbackProps = {
  id?: string;
  tone: CommerceActionFeedbackTone;
  children: ReactNode;
  className?: string;
  testId?: string;
};

const toneClasses: Record<CommerceActionFeedbackTone, string> = {
  pending: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function CommerceActionFeedback({
  id,
  tone,
  children,
  className,
  testId,
}: CommerceActionFeedbackProps) {
  return (
    <p
      id={id}
      role="status"
      aria-live="polite"
      data-feedback-tone={tone}
      data-testid={testId}
      className={cx(
        "rounded-lg border px-3 py-2 text-xs leading-5 font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </p>
  );
}
