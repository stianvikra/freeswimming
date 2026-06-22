"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { cx } from "@/components/ui/cx";
import WorkoutEditor from "@/components/my-library/workouts/WorkoutEditor";
import { SessionStepViewSections } from "@/components/my-library/workouts/SessionStepSurfaceRenderer";
import type { SessionStepViewSection } from "@/components/my-library/workouts/sessionStepSurfaceContract";
import {
  computeSessionDraftDerivedTotals,
  resolveSessionDraftPoolLengthUnit,
  type SessionDraft,
} from "@/lib/session-generator-v1/shared";
import type {
  ReviewActualEditorEvent,
  ReviewActualEditorModel,
  ReviewActualEditorPlan,
} from "@/lib/my-library/review-actual";
import type { CompletedActivityEventOutcome } from "@/lib/my-library/completed-activity-events";

type Props = {
  model: ReviewActualEditorModel;
};

type FormState = {
  outcome: CompletedActivityEventOutcome;
  completedOn: string;
  actualStartTime: string;
  correctionNote: string;
  expectedActualUpdatedAt: string;
};

type NoticeState = {
  tone: "success" | "error";
  message: string;
};

const outcomeOptions: Array<{ value: CompletedActivityEventOutcome; label: string }> = [
  { value: "completed_as_planned", label: "As planned" },
  { value: "completed_different", label: "Changed" },
  { value: "partial", label: "Partly done" },
  { value: "completed_on_another_day", label: "Another day" },
  { value: "cancelled_as_actual", label: "Cancelled actual" },
  { value: "needs_review", label: "Review needed" },
];

const cardClass = "fs-library-card p-4 sm:p-5";
const mutedCardClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const labelClass = "text-xs font-semibold text-[color:var(--fs-color-muted)]";
const inputClass =
  "min-h-11 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm font-semibold text-[color:var(--fs-color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const fieldHelpClass = "mt-1 text-xs leading-5 text-[color:var(--fs-color-muted)]";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:w-auto";

function getOutcomeLabel(outcome: string) {
  return outcomeOptions.find((option) => option.value === outcome)?.label ?? "Review needed";
}

function formatDateLabel(dateKey: string | null) {
  if (!dateKey) return "Not linked";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
}

function formatDateTimeLabel(value: string | null) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(parsed);
}

function formatDistance(meters: number | null) {
  if (typeof meters !== "number" || !Number.isFinite(meters)) return "Not set";
  return `${meters.toFixed(meters % 1 === 0 ? 0 : 1)}m`;
}

function formatDuration(seconds: number | null) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) return "Not set";
  const minutes = Math.round(seconds / 60);
  return minutes === 1 ? "1 min" : `${minutes} min`;
}

function formatPlannedLoad(plan: ReviewActualEditorPlan) {
  const distance = formatDistance(plan.workout?.totalDistanceM ?? null);
  const duration =
    typeof plan.workout?.estimatedDurationMin === "number"
      ? `~${plan.workout.estimatedDurationMin} min`
      : "Not set";
  return `${distance} · ${duration}`;
}

function formatContext(input: {
  environment: string | null;
  poolLengthM: number | null;
  poolLengthUnit: string | null;
}) {
  if (input.environment === "open_water") return "Open water";
  if (input.environment === "pool") {
    const length =
      typeof input.poolLengthM === "number"
        ? ` ${input.poolLengthM.toFixed(input.poolLengthM % 1 === 0 ? 0 : 1)}${
            input.poolLengthUnit ?? "m"
          }`
        : "";
    return `Pool${length}`;
  }
  return "Not set";
}

function buildPlannedStepViewSections(plan: ReviewActualEditorPlan): SessionStepViewSection[] {
  const sections = plan.workout?.previewSections ?? [];

  return sections.map((section, sectionIndex) => ({
    key: section.key || `planned-section-${sectionIndex}`,
    title: section.title,
    category: section.category,
    lines: section.rows.map((row, rowIndex) => ({
      key: row.key || `${section.key || `planned-section-${sectionIndex}`}-row-${rowIndex}`,
      primaryText: row.text,
      secondaryText: row.secondaryText,
    })),
  }));
}

function getTimeInputValue(value: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${String(parsed.getUTCHours()).padStart(2, "0")}:${String(
    parsed.getUTCMinutes()
  ).padStart(2, "0")}`;
}

function buildInitialForm(event: ReviewActualEditorEvent): FormState {
  return {
    outcome: event.outcome,
    completedOn: event.completedOn,
    actualStartTime: getTimeInputValue(event.actualStartedAt),
    correctionNote: event.correctionNote ?? "",
    expectedActualUpdatedAt: event.updatedAt,
  };
}

function cloneDraft(draft: SessionDraft | null | undefined): SessionDraft | null {
  if (!draft) return null;
  return JSON.parse(JSON.stringify(draft)) as SessionDraft;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  } catch {
    // Fall through to generic message.
  }
  return "Could not update this actual right now.";
}

function StateCard({
  model,
  title,
  children,
}: {
  model: ReviewActualEditorModel;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={mutedCardClass} data-testid="review-actual-state-card">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
            {title}
          </h2>
          <div className="mt-2 text-sm leading-6 text-[color:var(--fs-color-muted)]">
            {children}
          </div>
          <Link href={model.returnHref} className={cx(secondaryActionClass, "mt-4")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReviewActualReady({
  model,
}: {
  model: Extract<ReviewActualEditorModel, { status: "ready" }>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => buildInitialForm(model.event));
  const [actualDraft, setActualDraft] = useState<SessionDraft | null>(() =>
    cloneDraft(model.event.actualSessionDraft ?? model.plan.workout?.draft ?? null)
  );
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const plannedStepSections = useMemo(() => buildPlannedStepViewSections(model.plan), [model.plan]);
  const actualDraftTotals = useMemo(
    () => (actualDraft ? computeSessionDraftDerivedTotals(actualDraft) : null),
    [actualDraft]
  );

  const actualStartedAt = useMemo(() => {
    if (!form.actualStartTime) return null;
    return `${form.completedOn}T${form.actualStartTime}:00.000Z`;
  }, [form.actualStartTime, form.completedOn]);

  const fieldError = useMemo(() => {
    if (!form.completedOn) {
      return "Completion date is required.";
    }

    if (form.correctionNote.length > 1000) {
      return "Keep correction notes under 1000 characters.";
    }

    if (!actualDraft) {
      return "Actual session steps are not available for this actual.";
    }

    return null;
  }, [actualDraft, form]);

  async function handleSave() {
    if (fieldError || isSaving) return;

    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/my-library/calendar/planned-instances/${model.plan.plannedWorkoutInstanceId}/completion`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            outcome: form.outcome,
            completedOn: form.completedOn,
            actualStartedAt,
            actualSessionDraft: actualDraft,
            correctionNote: form.correctionNote,
            expectedActualUpdatedAt: form.expectedActualUpdatedAt,
          }),
        }
      );

      if (!response.ok) {
        setNotice({ tone: "error", message: await readErrorMessage(response) });
        return;
      }

      const payload = (await response.json()) as {
        event?: {
          updatedAt?: string;
          outcome?: CompletedActivityEventOutcome;
          completedOn?: string;
          actualStartedAt?: string | null;
          actualDurationSeconds?: number | null;
          actualDistanceM?: number | null;
          actualEnvironment?: string | null;
          actualPoolLengthM?: number | null;
          actualPoolLengthUnit?: string | null;
          actualSessionDraft?: SessionDraft | null;
          correctionNote?: string | null;
        };
      };

      const updatedEvent = payload.event;
      if (updatedEvent?.updatedAt) {
        const updatedAt = updatedEvent.updatedAt;
        setForm((current) => ({
          ...current,
          outcome: updatedEvent.outcome ?? current.outcome,
          completedOn: updatedEvent.completedOn ?? current.completedOn,
          actualStartTime: getTimeInputValue(updatedEvent.actualStartedAt ?? null),
          correctionNote: updatedEvent.correctionNote ?? "",
          expectedActualUpdatedAt: updatedAt,
        }));
      }
      if (updatedEvent?.actualSessionDraft) {
        setActualDraft(cloneDraft(updatedEvent.actualSessionDraft));
      }

      setNotice({ tone: "success", message: "Actual updated." });
      router.refresh();
    } catch {
      setNotice({ tone: "error", message: "Could not update this actual right now." });
    } finally {
      setIsSaving(false);
    }
  }

  const actualContext = actualDraft
    ? {
        environment: actualDraft.environment,
        poolLengthM: actualDraft.environment === "pool" ? actualDraft.poolLengthM : null,
        poolLengthUnit:
          actualDraft.environment === "pool"
            ? resolveSessionDraftPoolLengthUnit(actualDraft.poolLengthUnit)
            : null,
      }
    : {
        environment: model.event.actualEnvironment,
        poolLengthM: model.event.actualPoolLengthM,
        poolLengthUnit: model.event.actualPoolLengthUnit,
      };

  return (
    <div className="space-y-5" data-testid="review-actual-editor">
      <div className={cardClass}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
              Manual actual
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[color:var(--fs-color-ink-strong)]">
              {model.plan.workoutTitle ?? "Workout reference needs review"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--fs-color-muted)]">
              Actual history ID {model.event.id}. Planned item {model.plan.plannedWorkoutInstanceId}
              .
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
            <span className="inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-[color:var(--fs-color-brand-700)]">
              Source: Manual
            </span>
            <Link href={model.returnHref} className={secondaryActionClass}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Calendar
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Plan and actual comparison">
        <div className={mutedCardClass} data-testid="review-actual-plan-summary">
          <p className="text-xs font-semibold text-[color:var(--fs-color-muted)] uppercase">
            Planned
          </p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className={labelClass}>Planned date</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {formatDateLabel(model.plan.plannedOn)}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Planned load</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {formatPlannedLoad(model.plan)}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Plan</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {model.plan.programTitle ?? "Missing plan"}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Context</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {formatContext({
                  environment: model.plan.workout?.environment ?? null,
                  poolLengthM: model.plan.workout?.poolLengthM ?? null,
                  poolLengthUnit: model.plan.workout?.poolLengthUnit ?? null,
                })}
              </dd>
            </div>
          </dl>
        </div>

        <div className={mutedCardClass} data-testid="review-actual-current-summary">
          <p className="text-xs font-semibold text-[color:var(--fs-color-muted)] uppercase">
            Actual
          </p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className={labelClass}>Completion status</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {getOutcomeLabel(form.outcome)}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Completion date</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {formatDateLabel(form.completedOn)}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Actual load</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {formatDistance(actualDraftTotals?.totalDistanceM ?? model.event.actualDistanceM)} ·{" "}
                {formatDuration(
                  typeof actualDraftTotals?.estimatedDurationMin === "number"
                    ? Math.round(actualDraftTotals.estimatedDurationMin * 60)
                    : model.event.actualDurationSeconds
                )}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Context</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {formatContext(actualContext)}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Start time</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {formatDateTimeLabel(actualStartedAt)}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Last updated</dt>
              <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                {formatDateTimeLabel(form.expectedActualUpdatedAt)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className="space-y-3"
        aria-labelledby="review-actual-planned-steps-heading"
        data-testid="review-actual-planned-steps"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[color:var(--fs-color-muted)] uppercase">
              Planned session
            </p>
            <h3
              id="review-actual-planned-steps-heading"
              className="mt-1 text-lg font-semibold text-[color:var(--fs-color-ink-strong)]"
            >
              {model.plan.workoutTitle ?? "Workout detail needs review"}
            </h3>
          </div>
          <span className="inline-flex min-h-9 items-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80 px-3 text-sm font-semibold text-[color:var(--fs-color-muted)]">
            Read-only
          </span>
        </div>
        {plannedStepSections.length > 0 ? (
          <SessionStepViewSections
            sections={plannedStepSections}
            sectionTestIdPrefix="review-actual-planned-step-section"
          />
        ) : (
          <div className={mutedCardClass} data-testid="review-actual-planned-steps-empty">
            <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              Planned step detail is not available for this source workout.
            </p>
          </div>
        )}
      </section>

      <section className={cardClass} data-testid="review-actual-metadata-form">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Completion status</span>
            <select
              className={cx(inputClass, "mt-1")}
              value={form.outcome}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  outcome: event.target.value as CompletedActivityEventOutcome,
                }))
              }
            >
              {outcomeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Completion date</span>
            <input
              className={cx(inputClass, "mt-1")}
              type="date"
              value={form.completedOn}
              onChange={(event) =>
                setForm((current) => ({ ...current, completedOn: event.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className={labelClass}>Start time</span>
            <input
              className={cx(inputClass, "mt-1")}
              type="time"
              value={form.actualStartTime}
              onChange={(event) =>
                setForm((current) => ({ ...current, actualStartTime: event.target.value }))
              }
            />
            <span className={fieldHelpClass}>Leave empty when the start time is unknown.</span>
          </label>
        </div>

        <label className="mt-4 block">
          <span className={labelClass}>Correction note</span>
          <textarea
            className={cx(inputClass, "mt-1 min-h-28 py-3 leading-6 font-medium")}
            value={form.correctionNote}
            maxLength={1000}
            onChange={(event) =>
              setForm((current) => ({ ...current, correctionNote: event.target.value }))
            }
          />
          <span className={fieldHelpClass}>
            Short private note. Provider files and raw device data do not belong here.
          </span>
        </label>

        {fieldError ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-rose-800">
            {fieldError}
          </p>
        ) : null}

        {notice ? (
          <p
            role={notice.tone === "error" ? "alert" : "status"}
            aria-live={notice.tone === "error" ? "assertive" : "polite"}
            className={cx(
              "mt-4 text-sm font-semibold",
              notice.tone === "error" ? "text-rose-800" : "text-emerald-800"
            )}
          >
            {notice.message}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
          <Link href={model.returnHref} className={secondaryActionClass}>
            Cancel
          </Link>
        </div>
      </section>

      <section
        className="space-y-3"
        aria-labelledby="review-actual-actual-session-heading"
        data-testid="review-actual-actual-session"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[color:var(--fs-color-muted)] uppercase">
              Actual session
            </p>
            <h3
              id="review-actual-actual-session-heading"
              className="mt-1 text-lg font-semibold text-[color:var(--fs-color-ink-strong)]"
            >
              Edit what was performed
            </h3>
          </div>
          <span className="inline-flex min-h-9 items-center rounded-[var(--fs-radius-control)] border border-emerald-100 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800">
            Editable actual
          </span>
        </div>
        {actualDraft ? (
          <WorkoutEditor
            draft={actualDraft}
            savedWorkout={null}
            trainingFocusOptions={[]}
            recentWorkouts={[]}
            canonicalSaveReady={!fieldError}
            isSaving={isSaving}
            hasUnsavedChanges
            onSave={handleSave}
            onDraftChange={setActualDraft}
            showLoadedBanner={false}
            showPdfPanel={false}
            copyVariant="actual"
            manualBuilderMode={actualDraft.environment === "open_water" ? "open_water" : "pool"}
            saveButtonTestId="review-actual-save-session"
          />
        ) : (
          <div className={mutedCardClass} data-testid="review-actual-actual-session-empty">
            <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              Actual session steps are not available for this actual.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ReviewActualEditor({ model }: Props) {
  if (model.status === "ready") return <ReviewActualReady model={model} />;

  if (model.status === "missing_actual") {
    return (
      <StateCard model={model} title="Actual not found">
        Mark this planned swim done from Calendar before reviewing its actual history.
      </StateCard>
    );
  }

  if (model.status === "review_required") {
    return (
      <StateCard model={model} title="Actual needs support review">
        Source: {model.sourceKind}. Outcome: {model.outcome}. This actual cannot be edited in the
        manual v1 editor until that source is mapped.
      </StateCard>
    );
  }

  if (model.status === "orphan_actual") {
    return (
      <StateCard model={model} title="Plan reference missing">
        Manual actual {model.event.id} still exists, but the linked planned session could not be
        loaded. Support should repair the planned reference before editing.
      </StateCard>
    );
  }

  if (model.status === "schema_missing") {
    return (
      <StateCard model={model} title="Actual history is syncing">
        {model.message}
      </StateCard>
    );
  }

  if (model.status === "error") {
    return (
      <StateCard model={model} title="Could not load actual">
        {model.message}
      </StateCard>
    );
  }

  return (
    <StateCard model={model} title="Actual not found">
      This actual could not be found for your account.
    </StateCard>
  );
}
