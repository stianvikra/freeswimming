"use client";

import { useRouter } from "next/navigation";
import { CalendarClock, RotateCcw, SkipForward, XCircle } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { cx } from "@/components/ui/cx";
import type { MyLibraryCalendarPlanSession } from "@/lib/my-library/calendar-plan";

type Props = {
  session: MyLibraryCalendarPlanSession;
};

type ActionState = {
  tone: "success" | "error";
  message: string;
};

type PlanAction = "move" | "skip" | "cancel" | "recover";

const smallButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55";
const neutralButtonClass = cx(
  smallButtonClass,
  "border-[color:var(--fs-border-soft)] bg-white text-[color:var(--fs-color-ink)] hover:bg-slate-50"
);
const warningButtonClass = cx(
  smallButtonClass,
  "border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100"
);
const cancelButtonClass = cx(
  smallButtonClass,
  "border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"
);
const recoverButtonClass = cx(
  smallButtonClass,
  "w-full border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 sm:w-auto"
);

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // Fall through to generic message below.
  }

  return "Could not update this plan item right now.";
}

export default function CalendarPlanSessionActions({ session }: Props) {
  const router = useRouter();
  const inputId = useId();
  const [plannedOn, setPlannedOn] = useState(session.date);
  const [pendingAction, setPendingAction] = useState<PlanAction | null>(null);
  const [state, setState] = useState<ActionState | null>(null);
  const canChangePlanned = session.statusSelection === "planned";
  const canRecover =
    session.statusSelection === "skipped" || session.statusSelection === "cancelled";
  const canMutate = canChangePlanned || canRecover;

  async function submitAction(action: PlanAction, nextDate?: string) {
    setPendingAction(action);
    setState(null);

    try {
      const response = await fetch(`/api/my-library/calendar/planned-instances/${session.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          plannedOn: nextDate,
          expectedUpdatedAt: session.updatedAt,
        }),
      });

      if (!response.ok) {
        setState({ tone: "error", message: await readErrorMessage(response) });
        return;
      }

      setState({ tone: "success", message: "Plan item updated." });
      router.refresh();
    } catch {
      setState({ tone: "error", message: "Could not update this plan item right now." });
    } finally {
      setPendingAction(null);
    }
  }

  function handleReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitAction("move", plannedOn);
  }

  if (!canMutate) {
    return (
      <p
        data-testid={`calendar-plan-session-actions-${session.id}`}
        className="mt-3 text-xs leading-5 font-medium text-[color:var(--fs-color-muted)]"
      >
        This plan item needs review before it can be changed.
      </p>
    );
  }

  return (
    <div data-testid={`calendar-plan-session-actions-${session.id}`} className="mt-3 space-y-2">
      {canChangePlanned ? (
        <form
          className="grid gap-2 sm:flex sm:flex-wrap sm:items-center"
          onSubmit={handleReschedule}
        >
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[color:var(--fs-color-muted)]"
          >
            Reschedule to
          </label>
          <input
            id={inputId}
            type="date"
            value={plannedOn}
            onChange={(event) => setPlannedOn(event.target.value)}
            className="min-h-10 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm font-semibold text-[color:var(--fs-color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          />
          <button
            type="submit"
            className={neutralButtonClass}
            disabled={pendingAction !== null}
            aria-label="Reschedule planned session"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Reschedule
          </button>
          <button
            type="button"
            className={warningButtonClass}
            disabled={pendingAction !== null}
            onClick={() => void submitAction("skip")}
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
            Skip
          </button>
          <button
            type="button"
            className={cancelButtonClass}
            disabled={pendingAction !== null}
            onClick={() => void submitAction("cancel")}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          className={recoverButtonClass}
          disabled={pendingAction !== null}
          onClick={() => void submitAction("recover")}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Recover
        </button>
      )}

      {state ? (
        <p
          role={state.tone === "error" ? "alert" : "status"}
          aria-live={state.tone === "error" ? "assertive" : "polite"}
          className={cx(
            "text-xs leading-5 font-semibold",
            state.tone === "error" ? "text-rose-800" : "text-emerald-800"
          )}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
