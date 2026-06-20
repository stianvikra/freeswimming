import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/components/ui/cx";
import { buildMyLibraryCalendarPlanHref } from "@/lib/my-library/calendar";
import type {
  MyLibraryCalendarPlanDay,
  MyLibraryCalendarPlanModel,
  MyLibraryCalendarPlanSession,
} from "@/lib/my-library/calendar-plan";
import type { ProgramSummary } from "@/lib/programs/shared";

type Props = {
  model: MyLibraryCalendarPlanModel;
};

type FeedbackTone = "warning" | "error" | "empty";

const cardClass = "fs-library-card p-4 sm:p-5";
const mutedCardClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const eyebrowClass =
  "text-[12px] font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const actionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const calendarActionClass = cx(actionClass, "w-full sm:w-40");
const sessionActionClass = cx(actionClass, "w-full sm:w-[9rem]");
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const filterClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] border px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const selectedFilterClass =
  "border-[color:var(--fs-color-brand-700)] bg-[color:var(--fs-color-brand-700)] text-white";
const idleFilterClass =
  "border-[color:var(--fs-border-soft)] bg-white/80 text-[color:var(--fs-color-ink)] hover:bg-white";
const statusChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800";
const missingChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900";

const feedbackToneClasses: Record<FeedbackTone, string> = {
  warning: "border-amber-200 bg-amber-50/80 text-amber-950",
  error: "border-rose-200 bg-rose-50/80 text-rose-900",
  empty: "border-slate-200 bg-slate-50/80 text-slate-700",
};

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatPlanDateLabel(dateKey: string) {
  return DATE_LABEL_FORMATTER.format(new Date(`${dateKey}T00:00:00.000Z`));
}

function Feedback({
  tone,
  children,
  testId,
}: {
  tone: FeedbackTone;
  children: ReactNode;
  testId: string;
}) {
  const isError = tone === "error";
  const isEmpty = tone === "empty";

  return (
    <div
      role={isEmpty ? undefined : isError ? "alert" : "status"}
      aria-live={isEmpty ? undefined : isError ? "assertive" : "polite"}
      data-feedback-tone={tone}
      data-testid={testId}
      className={cx(
        "rounded-[var(--fs-radius-card)] border p-4 text-sm leading-6",
        feedbackToneClasses[tone]
      )}
    >
      {children}
    </div>
  );
}

function WeekNavigation({ model }: { model: MyLibraryCalendarPlanModel }) {
  const { window } = model;
  const selectedProgramId = model.selectedProgramId ?? undefined;

  return (
    <div className="grid grid-cols-2 items-center gap-3 sm:flex sm:justify-between">
      <Link
        href={buildMyLibraryCalendarPlanHref({
          selectedDate: window.previousWindowDate,
          programId: selectedProgramId,
        })}
        className={calendarActionClass}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous week
      </Link>
      <Link
        href={buildMyLibraryCalendarPlanHref({
          selectedDate: window.nextWindowDate,
          programId: selectedProgramId,
        })}
        className={calendarActionClass}
      >
        Next week
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function ProgramFilter({
  model,
  program,
}: {
  model: MyLibraryCalendarPlanModel;
  program: ProgramSummary;
}) {
  const isSelected = model.selectedProgramId === program.id;
  const href = buildMyLibraryCalendarPlanHref({
    selectedDate: model.selectedDate,
    programId: program.id,
  });

  return (
    <Link
      href={href}
      aria-current={isSelected ? "true" : undefined}
      className={cx(filterClass, isSelected ? selectedFilterClass : idleFilterClass)}
    >
      {program.title}
    </Link>
  );
}

function SessionRow({ session }: { session: MyLibraryCalendarPlanSession }) {
  const workoutSummary = session.workout
    ? [
        session.workout.totalDistanceM ? `${session.workout.totalDistanceM}m` : null,
        session.workout.estimatedDurationMin
          ? `~${session.workout.estimatedDurationMin} min`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : (session.workoutId ?? "Missing workout reference");
  const programTitle = session.program?.title ?? "Missing plan";

  return (
    <div
      data-testid={`calendar-plan-session-${session.id}`}
      className="border-t border-[color:var(--fs-border-soft)] py-3 first:border-t-0 first:pt-0 last:pb-0"
    >
      <div className="space-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={session.workout ? statusChipClass : missingChipClass}>
              {session.workout ? "Planned" : "Missing workout"}
            </span>
            <p className="text-xs font-semibold text-[color:var(--fs-color-brand-700)] uppercase">
              {programTitle} · {session.weekLabel}
            </p>
          </div>
          <h3 className="mt-2 text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
            {session.workout?.title ?? "Workout reference needs review"}
          </h3>
          <p className="mt-1 text-sm text-[color:var(--fs-color-muted)]">{workoutSummary}</p>
          <p className="mt-1 text-xs font-medium text-[color:var(--fs-color-muted)]">
            Completion history is not connected yet.
          </p>
        </div>
        <div
          className={cx(
            "grid gap-2 sm:flex sm:flex-wrap sm:items-center",
            session.workout ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          {session.program ? (
            <Link
              href={`/my-library/programs/${session.program.id}`}
              className={sessionActionClass}
            >
              Edit Plan
            </Link>
          ) : null}
          {session.workout ? (
            <Link
              href={`/my-library/workouts/${session.workout.id}`}
              className={sessionActionClass}
            >
              Open workout
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DayPlan({ day }: { day: MyLibraryCalendarPlanDay }) {
  return (
    <section data-testid={`calendar-plan-day-${day.date}`} className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={eyebrowClass}>{day.dayLabel}</p>
          <h2 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
            {formatPlanDateLabel(day.date)}
          </h2>
        </div>
        <span className="rounded-[var(--fs-radius-control)] bg-white/85 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-muted)] ring-1 ring-[color:var(--fs-border-soft)]">
          {day.sessions.length} planned
        </span>
      </div>

      {day.sessions.length > 0 ? (
        <div className="mt-4">
          {day.sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <p className={cx("mt-4", mutedTextClass)}>No planned swim session on this date.</p>
      )}
    </section>
  );
}

export default function CalendarPlanWeekHub({ model }: Props) {
  const selectedProgram = model.programs.find((program) => program.id === model.selectedProgramId);
  const primaryProgram = selectedProgram ?? model.programs[0] ?? model.unanchoredPrograms[0];
  const primaryProgramHref = primaryProgram
    ? `/my-library/programs/${primaryProgram.id}`
    : "/my-library";
  const primaryProgramActionLabel = primaryProgram ? "Open Plan" : "Back to My Library";

  return (
    <section data-testid="calendar-plan-week-hub" className="space-y-5">
      {!model.schemaReady ? (
        <Feedback tone="warning" testId="calendar-plan-schema-warning">
          Program calendar planning is still syncing in this environment.
        </Feedback>
      ) : null}

      {model.loadError ? (
        <Feedback tone="error" testId="calendar-plan-load-error">
          {model.loadError}
        </Feedback>
      ) : null}

      {model.selectedProgramMissing ? (
        <Feedback tone="warning" testId="calendar-plan-selected-missing-warning">
          That saved program could not be found for this account.
        </Feedback>
      ) : null}

      {model.unanchoredPrograms.length > 0 ? (
        <Feedback tone="warning" testId="calendar-plan-unanchored-warning">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">
                {model.unanchoredPrograms.length === 1
                  ? "One saved plan needs a Week 1 start date."
                  : `${model.unanchoredPrograms.length} saved plans need a Week 1 start date.`}
              </p>
              <p className="mt-1">
                Set the start week in the program editor before it appears in Plan.
              </p>
            </div>
            <Link
              href={`/my-library/programs/${model.unanchoredPrograms[0].id}`}
              className={cx(primaryActionClass, "w-40")}
            >
              Open Plan
            </Link>
          </div>
        </Feedback>
      ) : null}

      {model.missingWorkoutIds.length > 0 ? (
        <Feedback tone="warning" testId="calendar-plan-missing-workouts-warning">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              {model.missingWorkoutIds.length === 1
                ? "One planned workout could not be loaded for this account."
                : `${model.missingWorkoutIds.length} planned workouts could not be loaded for this account.`}
            </p>
          </div>
        </Feedback>
      ) : null}

      <div className={mutedCardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={eyebrowClass}>Plan week</p>
            <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[color:var(--fs-color-ink-strong)]">
              <CalendarDays className="h-5 w-5 text-[color:var(--fs-color-brand-700)]" />
              {model.window.weekLabel}
            </h2>
            <p className={cx("mt-2", mutedTextClass)}>
              {formatPlanDateLabel(model.window.startDate)} to{" "}
              {formatPlanDateLabel(model.window.endDate)} · {model.sessionCount} planned session
              {model.sessionCount === 1 ? "" : "s"}
              {selectedProgram ? ` · ${selectedProgram.title}` : ""}
            </p>
          </div>
          <Link href={primaryProgramHref} className={calendarActionClass}>
            {primaryProgramActionLabel}
          </Link>
        </div>

        <div className="mt-5">
          <WeekNavigation model={model} />
        </div>
      </div>

      {model.programs.length > 0 ? (
        <div className={mutedCardClass}>
          <p className={eyebrowClass}>Saved plans</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={buildMyLibraryCalendarPlanHref({ selectedDate: model.selectedDate })}
              aria-current={!model.selectedProgramId ? "true" : undefined}
              className={cx(
                filterClass,
                !model.selectedProgramId ? selectedFilterClass : idleFilterClass
              )}
            >
              All plans
            </Link>
            {model.programs.map((program) => (
              <ProgramFilter key={program.id} model={model} program={program} />
            ))}
          </div>
        </div>
      ) : null}

      {model.programs.length === 0 && model.schemaReady && !model.loadError ? (
        <Feedback tone="empty" testId="calendar-plan-empty-state">
          No saved plans are available yet.
        </Feedback>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {model.days.map((day) => (
            <DayPlan key={day.date} day={day} />
          ))}
        </div>
      )}
    </section>
  );
}
