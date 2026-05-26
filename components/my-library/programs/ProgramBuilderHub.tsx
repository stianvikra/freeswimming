"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import CreateManualProgramButton from "@/components/my-library/programs/CreateManualProgramButton";
import { getManualPoolCategoryLabelClass } from "@/components/my-library/workouts/sessionStepSurfaceContract";
import { cx } from "@/components/ui/cx";
import {
  buildProgramGarminReadyExportFileName,
  buildProgramPdfFileName,
} from "@/lib/programs/export";
import {
  PROGRAM_WEEKDAY_LABELS,
  buildProgramWeekdayGroups,
  createProgramEntityId,
  haveProgramDraftChanges,
  type ProgramAssignment,
  type ProgramEditorRecord,
  type ProgramLibrarySnapshot,
  type ProgramSaveApiResponse,
  type ProgramSummary,
} from "@/lib/programs/shared";
import type {
  WorkoutSummary,
  WorkoutSummaryPreviewLineItem,
  WorkoutSummaryPreviewSection,
} from "@/lib/workouts/shared";

type Props = {
  programLibrary: ProgramLibrarySnapshot;
};

type RetryablePreviewError = Error & {
  status?: number;
};

type ProgramBuilderFeedbackTone = "warning" | "error" | "success" | "empty";
type ProgramExportFeedbackTone = "pending" | "success" | "error";

type ProgramBuilderFeedbackProps = {
  tone: ProgramBuilderFeedbackTone;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  testId?: string;
};

type ProgramExportFeedbackProps = {
  id?: string;
  title: string;
  message: string;
  tone: ProgramExportFeedbackTone;
  testId: string;
};

const PROGRAM_EXPORT_PREVIEW_TIMEOUT_MS = 15_000;
const PROGRAM_SCHEDULED_WORKOUT_PREVIEW_ROW_LIMIT = 6;

const programBuilderFeedbackToneClasses: Record<ProgramBuilderFeedbackTone, string> = {
  warning: "border-amber-200 bg-amber-50/80 text-amber-900",
  error: "border-rose-200 bg-rose-50/80 text-rose-900",
  success: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
  empty: "border-slate-200 bg-slate-50/80 text-slate-700",
};

const programExportFeedbackToneClasses: Record<ProgramExportFeedbackTone, string> = {
  pending: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};

function buildProgramExportPreviewError(message: string, status?: number): RetryablePreviewError {
  const error = new Error(message) as RetryablePreviewError;
  error.status = status;
  return error;
}

function isRetryableProgramExportPreviewError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const candidateStatus = (error as RetryablePreviewError).status;
  const status = typeof candidateStatus === "number" ? candidateStatus : null;

  if (status === 401 || status === 408 || status === 429) {
    return true;
  }

  if (status !== null && status >= 500) {
    return true;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("aborted") ||
    message.includes("econnreset") ||
    message.includes("connection reset")
  );
}

function upsertRecentProgramSummary(current: ProgramSummary[], next: ProgramSummary) {
  const existing = current.filter((summary) => summary.id !== next.id);
  return [next, ...existing].slice(0, 6);
}

function reindexAssignments(assignments: ProgramAssignment[]) {
  return PROGRAM_WEEKDAY_LABELS.flatMap((_, dayIndex) =>
    assignments
      .filter((assignment) => assignment.dayIndex === dayIndex)
      .sort((left, right) => left.position - right.position)
      .map((assignment, position) => ({
        ...assignment,
        position,
      }))
  );
}

type VisibleWorkoutPreviewSection = Omit<WorkoutSummaryPreviewSection, "rows"> & {
  rows: WorkoutSummaryPreviewLineItem[];
};

function buildVisibleWorkoutPreviewSections(
  sections: WorkoutSummaryPreviewSection[] | null | undefined
): {
  visibleSections: VisibleWorkoutPreviewSection[];
  hiddenRowCount: number;
} {
  let remainingRows = PROGRAM_SCHEDULED_WORKOUT_PREVIEW_ROW_LIMIT;
  let hiddenRowCount = 0;
  const visibleSections: VisibleWorkoutPreviewSection[] = [];

  for (const section of sections ?? []) {
    const rows = section.rows.filter((row) => row.text.trim().length > 0);
    if (rows.length === 0) continue;

    if (remainingRows <= 0) {
      hiddenRowCount += rows.length;
      continue;
    }

    const visibleRows = rows.slice(0, remainingRows);
    hiddenRowCount += rows.length - visibleRows.length;
    visibleSections.push({
      ...section,
      rows: visibleRows,
    });
    remainingRows -= visibleRows.length;
  }

  return { visibleSections, hiddenRowCount };
}

function ScheduledWorkoutStepPreview({
  assignmentId,
  workout,
}: {
  assignmentId: string;
  workout: WorkoutSummary;
}) {
  const { visibleSections, hiddenRowCount } = buildVisibleWorkoutPreviewSections(
    workout.previewSections
  );

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <div
      data-testid={`program-assignment-step-preview-${assignmentId}`}
      aria-label={`Scheduled workout step preview for ${workout.title}`}
      className="mt-3 space-y-2 border-t border-slate-100 pt-3"
    >
      {visibleSections.map((section) => {
        const category = section.category ?? "main";

        return (
          <div key={section.key} className="space-y-1.5">
            <p
              className={`text-[11px] font-semibold tracking-wide uppercase ${getManualPoolCategoryLabelClass(
                category
              )}`}
            >
              {section.title}
            </p>
            <div className="space-y-1 border-l border-slate-200 pl-2">
              {section.rows.map((row, rowIndex) => (
                <div key={`${section.key}-${rowIndex}`} className="space-y-0.5">
                  <p className="text-xs leading-5 break-words text-slate-800">{row.text}</p>
                  {row.secondaryText ? (
                    <p className="text-xs leading-5 font-semibold text-blue-800">
                      {row.secondaryText}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {hiddenRowCount > 0 ? (
        <p
          data-testid={`program-assignment-step-preview-more-${assignmentId}`}
          className="text-xs font-medium text-slate-500"
        >
          +{hiddenRowCount} more scheduled step{hiddenRowCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}

function ProgramBuilderFeedback({
  tone,
  children,
  action,
  className,
  testId,
}: ProgramBuilderFeedbackProps) {
  const isError = tone === "error";
  const isStaticEmpty = tone === "empty";

  return (
    <div
      role={isStaticEmpty ? undefined : isError ? "alert" : "status"}
      aria-live={isStaticEmpty ? undefined : isError ? "assertive" : "polite"}
      aria-atomic={isStaticEmpty ? undefined : "true"}
      data-feedback-tone={tone}
      data-testid={testId}
      className={cx("rounded-2xl border p-4", programBuilderFeedbackToneClasses[tone], className)}
    >
      <div className="min-w-0 text-sm leading-6">{children}</div>
      {action ? <div className="mt-4 flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

function ProgramExportFeedback({ id, title, message, tone, testId }: ProgramExportFeedbackProps) {
  return (
    <div
      id={id}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      data-feedback-tone={tone}
      data-testid={testId}
      className={`mt-3 max-w-2xl rounded-xl border px-3 py-2 text-sm leading-6 ${programExportFeedbackToneClasses[tone]}`}
    >
      <p className="font-semibold">{title}</p>
      <p className="text-xs leading-5">{message}</p>
    </div>
  );
}

export default function ProgramBuilderHub({ programLibrary }: Props) {
  const programExportFeedbackId = useId();
  const programPdfFeedbackId = useId();
  const [savedProgram, setSavedProgram] = useState<ProgramEditorRecord | null>(
    programLibrary.selectedProgram
  );
  const [draftTitle, setDraftTitle] = useState(programLibrary.selectedProgram?.title ?? "");
  const [draftWeeks, setDraftWeeks] = useState(programLibrary.selectedProgram?.weeks ?? []);
  const [recentPrograms, setRecentPrograms] = useState(programLibrary.recentPrograms);
  const [availableWorkouts, setAvailableWorkouts] = useState(programLibrary.availableWorkouts);
  const [missingWorkoutIds, setMissingWorkoutIds] = useState(programLibrary.missingWorkoutIds);
  const [pickerSelections, setPickerSelections] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [programExportPreview, setProgramExportPreview] = useState("");
  const [programExportPreviewError, setProgramExportPreviewError] = useState("");
  const [isProgramExportLoading, setIsProgramExportLoading] = useState(false);
  const [isProgramExportDownloading, setIsProgramExportDownloading] = useState(false);
  const [programExportNotice, setProgramExportNotice] = useState("");
  const [programExportError, setProgramExportError] = useState("");
  const [programPdfNotice, setProgramPdfNotice] = useState("");
  const [programPdfError, setProgramPdfError] = useState("");
  const hasUnsavedChanges = haveProgramDraftChanges(
    savedProgram ? { title: draftTitle, weeks: draftWeeks } : null,
    savedProgram ? { title: savedProgram.title, weeks: savedProgram.weeks } : null
  );

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    setSavedProgram(programLibrary.selectedProgram);
    setDraftTitle(programLibrary.selectedProgram?.title ?? "");
    setDraftWeeks(programLibrary.selectedProgram?.weeks ?? []);
    setRecentPrograms(programLibrary.recentPrograms);
    setAvailableWorkouts(programLibrary.availableWorkouts);
    setMissingWorkoutIds(programLibrary.missingWorkoutIds);
    setPickerSelections({});
    setError("");
    setSuccess("");
    setProgramExportPreview("");
    setProgramExportPreviewError("");
    setIsProgramExportDownloading(false);
    setProgramExportNotice("");
    setProgramExportError("");
    setProgramPdfNotice("");
    setProgramPdfError("");
  }, [programLibrary]);

  const workoutLookup = useMemo(
    () => new Map(availableWorkouts.map((workout) => [workout.id, workout])),
    [availableWorkouts]
  );
  const programGarminExportRoute = savedProgram
    ? `/api/my-library/programs/${savedProgram.id}/export/garmin-ready`
    : null;
  const programPdfRoute = savedProgram
    ? `/api/my-library/programs/${savedProgram.id}/export/pdf`
    : null;
  const programGarminExportFileName = buildProgramGarminReadyExportFileName(savedProgram);
  const programPdfFileName = buildProgramPdfFileName(savedProgram);
  const programExportStateLabel = "Saved program export";
  const programExportStateDescription = hasUnsavedChanges
    ? "Export preview uses the last saved version. Save first if you want export output to include current edits."
    : "Export preview matches the saved program.";
  const programPdfStateLabel = "Saved program PDF";
  const programPdfStateDescription = hasUnsavedChanges
    ? "Print view opens the last saved version. Save first if you want the PDF to include current edits."
    : "Print view matches the saved program.";
  const programExportFeedbackTone = isProgramExportDownloading
    ? "pending"
    : programExportError
      ? "error"
      : programExportNotice
        ? "success"
        : null;
  const programExportFeedbackTitle =
    programExportFeedbackTone === "pending"
      ? "Preparing export"
      : programExportFeedbackTone === "error"
        ? "Export failed"
        : "Export downloaded";
  const programExportFeedbackMessage =
    programExportFeedbackTone === "pending"
      ? "Preparing the saved program JSON..."
      : programExportError || programExportNotice;
  const programPdfFeedbackTone = programPdfError ? "error" : programPdfNotice ? "success" : null;
  const programPdfFeedbackTitle =
    programPdfFeedbackTone === "error" ? "Print view blocked" : "Print view opened";
  const programPdfFeedbackMessage = programPdfError || programPdfNotice;

  useEffect(() => {
    let cancelled = false;

    async function loadProgramExportPreview() {
      if (!programGarminExportRoute) {
        setProgramExportPreview("");
        setProgramExportPreviewError("");
        setIsProgramExportLoading(false);
        return;
      }

      setIsProgramExportLoading(true);
      setProgramExportPreviewError("");

      try {
        let previewJson = "";

        for (let attempt = 0; attempt < 3; attempt += 1) {
          const controller = new AbortController();
          const timeout = window.setTimeout(
            () => controller.abort(),
            PROGRAM_EXPORT_PREVIEW_TIMEOUT_MS
          );

          try {
            const response = await fetch(programGarminExportRoute, {
              method: "GET",
              cache: "no-store",
              signal: controller.signal,
            });
            window.clearTimeout(timeout);
            const responseBody = (await response.json().catch(() => null)) as Record<
              string,
              unknown
            > | null;
            const responseError =
              responseBody && typeof responseBody.error === "string"
                ? responseBody.error
                : "Could not load the saved program export preview right now.";

            if (!response.ok || !responseBody) {
              throw buildProgramExportPreviewError(responseError, response.status);
            }

            previewJson = JSON.stringify(responseBody, null, 2);
            break;
          } catch (error) {
            const normalizedError =
              error instanceof DOMException && error.name === "AbortError"
                ? buildProgramExportPreviewError(
                    "Could not load the saved program export preview right now.",
                    408
                  )
                : error;
            const shouldRetry =
              attempt < 2 && isRetryableProgramExportPreviewError(normalizedError);
            if (!shouldRetry) {
              throw normalizedError;
            }
          } finally {
            window.clearTimeout(timeout);
          }
        }

        if (!cancelled) {
          setProgramExportPreview(previewJson);
        }
      } catch (error) {
        if (!cancelled) {
          setProgramExportPreview("");
          setProgramExportPreviewError(
            error instanceof Error
              ? error.message
              : "Could not load the saved program export preview right now."
          );
        }
      } finally {
        if (!cancelled) {
          setIsProgramExportLoading(false);
        }
      }
    }

    void loadProgramExportPreview();

    return () => {
      cancelled = true;
    };
  }, [programGarminExportRoute, savedProgram?.updatedAt]);

  useEffect(() => {
    setProgramExportNotice("");
    setProgramExportError("");
    setProgramPdfNotice("");
    setProgramPdfError("");
  }, [savedProgram?.id, savedProgram?.updatedAt]);

  async function saveProgram() {
    if (!savedProgram) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/my-library/programs/${savedProgram.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draftTitle,
          weeks: draftWeeks,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as ProgramSaveApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok ? responseBody.error : "Could not save program right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setSavedProgram(responseBody.program);
      setDraftTitle(responseBody.program.title);
      setDraftWeeks(responseBody.program.weeks);
      setRecentPrograms((current) => upsertRecentProgramSummary(current, responseBody.summary));
      setSuccess("Program saved.");
    } catch {
      setError("Could not save program right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetDraftToSavedProgram() {
    if (!savedProgram) return;

    setDraftTitle(savedProgram.title);
    setDraftWeeks(savedProgram.weeks);
    setPickerSelections({});
    setError("");
    setSuccess("Unsaved program changes were reset to the last saved program.");
  }

  function setWeekAssignments(
    weekId: string,
    updater: (assignments: ProgramAssignment[]) => ProgramAssignment[]
  ) {
    setDraftWeeks((current) =>
      current.map((week) =>
        week.id === weekId
          ? {
              ...week,
              assignments: reindexAssignments(updater(week.assignments)),
            }
          : week
      )
    );
    setSuccess("");
    setError("");
  }

  function addAssignment(weekId: string, dayIndex: number) {
    const pickerKey = `${weekId}-${dayIndex}`;
    const workoutId = pickerSelections[pickerKey];
    if (!workoutId) return;

    setWeekAssignments(weekId, (assignments) => {
      const nextPosition = assignments.filter(
        (assignment) => assignment.dayIndex === dayIndex
      ).length;
      return [
        ...assignments,
        {
          id: createProgramEntityId(),
          workoutId,
          dayIndex,
          position: nextPosition,
        },
      ];
    });
    setPickerSelections((current) => ({
      ...current,
      [pickerKey]: "",
    }));
  }

  function removeAssignment(weekId: string, assignmentId: string) {
    setWeekAssignments(weekId, (assignments) =>
      assignments.filter((assignment) => assignment.id !== assignmentId)
    );
  }

  function moveAssignmentDay(weekId: string, assignmentId: string, nextDayIndex: number) {
    setWeekAssignments(weekId, (assignments) =>
      assignments.map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, dayIndex: nextDayIndex } : assignment
      )
    );
  }

  function moveAssignmentPosition(weekId: string, assignmentId: string, direction: -1 | 1) {
    setWeekAssignments(weekId, (assignments) => {
      const target = assignments.find((assignment) => assignment.id === assignmentId);
      if (!target) return assignments;

      const dayAssignments = assignments
        .filter((assignment) => assignment.dayIndex === target.dayIndex)
        .sort((left, right) => left.position - right.position);
      const targetIndex = dayAssignments.findIndex((assignment) => assignment.id === assignmentId);
      const swapIndex = targetIndex + direction;

      if (targetIndex < 0 || swapIndex < 0 || swapIndex >= dayAssignments.length) {
        return assignments;
      }

      const nextDayAssignments = [...dayAssignments];
      [nextDayAssignments[targetIndex], nextDayAssignments[swapIndex]] = [
        nextDayAssignments[swapIndex],
        nextDayAssignments[targetIndex],
      ];

      const otherAssignments = assignments.filter(
        (assignment) => assignment.dayIndex !== target.dayIndex
      );
      return [...otherAssignments, ...nextDayAssignments];
    });
  }

  async function downloadProgramGarminReadyExport() {
    if (!programGarminExportRoute || isProgramExportDownloading) return;

    setIsProgramExportDownloading(true);
    setProgramExportNotice("");
    setProgramExportError("");

    try {
      const response = await fetch(programGarminExportRoute, {
        method: "GET",
        cache: "no-store",
      });
      const responseBody = (await response.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      const responseError =
        responseBody && typeof responseBody.error === "string"
          ? responseBody.error
          : "Could not download the program export right now.";

      if (!response.ok || !responseBody) {
        throw new Error(responseError);
      }

      const jsonPayload = JSON.stringify(responseBody, null, 2);
      const blob = new Blob([jsonPayload], {
        type: "application/json;charset=utf-8",
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = programGarminExportFileName;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setProgramExportPreview(jsonPayload);
      setProgramExportNotice(`Downloaded ${programGarminExportFileName}.`);
    } catch (error) {
      setProgramExportError(
        error instanceof Error ? error.message : "Could not download the program export right now."
      );
    } finally {
      setIsProgramExportDownloading(false);
    }
  }

  function openProgramPdfPrintView() {
    if (!programPdfRoute) return;

    setProgramPdfNotice("");
    setProgramPdfError("");

    try {
      if (typeof window === "undefined") {
        throw new Error("Window unavailable.");
      }

      const printWindow = window.open(programPdfRoute, "_blank");
      if (!printWindow) {
        throw new Error("Popup blocked.");
      }

      printWindow.focus?.();
      setProgramPdfNotice(
        `Opened print view for ${programPdfFileName}. Use Print / Save PDF in that tab.`
      );
    } catch {
      setProgramPdfError(
        "Could not open the program PDF print view. Check whether pop-ups are blocked."
      );
    }
  }

  return (
    <section
      data-testid="program-builder-hub"
      data-client-ready={clientReady ? "true" : "false"}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Program builder preview</h2>
          <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
            Save a program, place accepted workouts into week/day slots, and keep one shared
            planning surface ready for later planner and export work.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {programLibrary.schemaReady ? (
            <CreateManualProgramButton
              testId="program-builder-create-manual"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            />
          ) : null}
          <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 uppercase">
            Saved program
          </p>
        </div>
      </div>

      {!programLibrary.schemaReady ? (
        <ProgramBuilderFeedback
          tone="warning"
          className="mt-5"
          testId="program-builder-schema-warning"
        >
          <p>
            Program save is still syncing in this environment. Come back once the programs table is
            live to build saved program shells here.
          </p>
        </ProgramBuilderFeedback>
      ) : null}

      {programLibrary.loadError ? (
        <ProgramBuilderFeedback tone="error" className="mt-5" testId="program-builder-load-error">
          <p>{programLibrary.loadError}</p>
        </ProgramBuilderFeedback>
      ) : null}

      {missingWorkoutIds.length > 0 ? (
        <ProgramBuilderFeedback
          tone="warning"
          className="mt-5"
          testId="program-builder-missing-workouts-warning"
        >
          <p>
            {missingWorkoutIds.length === 1
              ? "One scheduled workout could not be loaded for this account."
              : `${missingWorkoutIds.length} scheduled workouts could not be loaded for this account.`}
          </p>
        </ProgramBuilderFeedback>
      ) : null}

      {error ? (
        <ProgramBuilderFeedback tone="error" className="mt-5" testId="program-builder-action-error">
          <p>{error}</p>
        </ProgramBuilderFeedback>
      ) : null}

      {success ? (
        <ProgramBuilderFeedback
          tone="success"
          className="mt-5"
          testId="program-builder-action-success"
        >
          <p>{success}</p>
        </ProgramBuilderFeedback>
      ) : null}

      {!savedProgram ? (
        <div className="mt-6 space-y-5">
          <ProgramBuilderFeedback
            tone={programLibrary.selectedProgramMissing ? "warning" : "empty"}
            testId="program-builder-empty-state"
            action={
              <>
                {programLibrary.schemaReady ? (
                  <CreateManualProgramButton
                    testId="program-builder-empty-create-manual"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  />
                ) : null}
                <Link
                  href="/my-library"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  Back to My Library
                </Link>
              </>
            }
          >
            <p className="font-medium text-slate-900">
              {programLibrary.selectedProgramMissing
                ? "That saved program could not be found."
                : "No saved program is open here."}
            </p>
            <p className="mt-2">
              Create a starter program here, return to My Library, or reopen another saved program
              below.
            </p>
          </ProgramBuilderFeedback>

          {recentPrograms.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Recent saved programs</h3>
              <p className="mt-1 text-sm text-slate-600">
                Reopen another saved program directly in this route.
              </p>
              <div className="mt-4 grid gap-3">
                {recentPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{program.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {program.weekCount} week{program.weekCount === 1 ? "" : "s"} ·{" "}
                        {program.assignmentCount} scheduled workout
                        {program.assignmentCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link
                      href={`/my-library/programs/${program.id}`}
                      data-testid={`program-builder-open-program-${program.id}`}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {savedProgram ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-[48rem]">
                <label
                  htmlFor="program-draft-title"
                  className="text-xs font-semibold tracking-wide text-slate-500 uppercase"
                >
                  Program title
                </label>
                <input
                  id="program-draft-title"
                  data-testid="program-draft-title"
                  type="text"
                  value={draftTitle}
                  onChange={(event) => {
                    setDraftTitle(event.target.value);
                    setSuccess("");
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
                <p data-testid="program-editor-save-state" className="mt-3 text-sm text-slate-600">
                  {hasUnsavedChanges
                    ? "Unsaved changes stay local until you save this program."
                    : "All changes are saved."}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Program export uses the saved version.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="program-editor-reset"
                  onClick={resetDraftToSavedProgram}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset
                </button>
                <button
                  type="button"
                  data-testid="program-builder-save"
                  onClick={saveProgram}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSaving ? "Saving..." : "Save program"}
                </button>
              </div>
            </div>
          </div>

          {draftWeeks.map((week, weekIndex) => {
            const days = buildProgramWeekdayGroups(week);
            return (
              <section
                key={week.id}
                data-testid={`program-week-${weekIndex}`}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{week.label}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Place accepted workouts into day slots. This first program slice keeps the
                      shell simple and ready to save.
                    </p>
                  </div>
                  <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                    {week.assignments.length} scheduled
                  </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {PROGRAM_WEEKDAY_LABELS.map((dayLabel, dayIndex) => {
                    const pickerKey = `${week.id}-${dayIndex}`;
                    const dayAssignments = days[dayIndex];

                    return (
                      <div
                        key={dayLabel}
                        className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                      >
                        <p className="text-sm font-semibold text-slate-900">{dayLabel}</p>
                        <div className="mt-3 flex flex-col gap-2">
                          <select
                            data-testid={`program-day-picker-week-${weekIndex}-day-${dayIndex}`}
                            value={pickerSelections[pickerKey] ?? ""}
                            onChange={(event) =>
                              setPickerSelections((current) => ({
                                ...current,
                                [pickerKey]: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                          >
                            <option value="">Choose workout</option>
                            {availableWorkouts.map((workout) => (
                              <option key={workout.id} value={workout.id}>
                                {workout.title}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            data-testid={`program-day-add-week-${weekIndex}-day-${dayIndex}`}
                            onClick={() => addAssignment(week.id, dayIndex)}
                            disabled={!pickerSelections[pickerKey]}
                            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Add workout
                          </button>
                        </div>

                        {dayAssignments.length === 0 ? (
                          <p className="mt-3 text-sm text-slate-500">No workout scheduled.</p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {dayAssignments.map((assignment, assignmentIndex) => {
                              const workout = workoutLookup.get(assignment.workoutId);
                              return (
                                <div
                                  key={assignment.id}
                                  data-testid={`program-assignment-card-${assignment.id}`}
                                  className="min-w-0 rounded-xl border border-white bg-white p-3 shadow-sm"
                                >
                                  <p className="text-sm font-medium break-words text-slate-900">
                                    {workout?.title ?? "Missing workout reference"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {workout
                                      ? [
                                          workout.totalDistanceM
                                            ? `${workout.totalDistanceM}m`
                                            : null,
                                          workout.estimatedDurationMin
                                            ? `~${workout.estimatedDurationMin} min`
                                            : null,
                                        ]
                                          .filter(Boolean)
                                          .join(" · ")
                                      : assignment.workoutId}
                                  </p>

                                  {workout ? (
                                    <ScheduledWorkoutStepPreview
                                      assignmentId={assignment.id}
                                      workout={workout}
                                    />
                                  ) : null}

                                  <div className="mt-3 space-y-2">
                                    <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                      Move to day
                                    </label>
                                    <select
                                      data-testid={`program-assignment-day-${assignment.id}`}
                                      value={String(assignment.dayIndex)}
                                      onChange={(event) =>
                                        moveAssignmentDay(
                                          week.id,
                                          assignment.id,
                                          Number(event.target.value)
                                        )
                                      }
                                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                    >
                                      {PROGRAM_WEEKDAY_LABELS.map((label, optionDayIndex) => (
                                        <option key={label} value={optionDayIndex}>
                                          {label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      data-testid={`program-assignment-up-${assignment.id}`}
                                      disabled={assignmentIndex === 0}
                                      onClick={() =>
                                        moveAssignmentPosition(week.id, assignment.id, -1)
                                      }
                                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Move up
                                    </button>
                                    <button
                                      type="button"
                                      data-testid={`program-assignment-down-${assignment.id}`}
                                      disabled={assignmentIndex === dayAssignments.length - 1}
                                      onClick={() =>
                                        moveAssignmentPosition(week.id, assignment.id, 1)
                                      }
                                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Move down
                                    </button>
                                    <button
                                      type="button"
                                      data-testid={`program-assignment-remove-${assignment.id}`}
                                      onClick={() => removeAssignment(week.id, assignment.id)}
                                      className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm text-rose-700 transition hover:bg-rose-50"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-sky-700 uppercase">
                  Garmin-ready JSON
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  Download the saved program as the truthful FreeSwimming `garmin-ready` bundle. It
                  keeps missing references and workout review warnings explicit so later provider
                  delivery can stay deterministic.
                </p>
                <p
                  data-testid="program-editor-garmin-export-source"
                  data-export-state="canonical"
                  className="mt-2 text-xs font-semibold tracking-wide text-slate-600 uppercase"
                >
                  {programExportStateLabel}
                </p>
                <p className="mt-1 text-sm text-slate-600">{programExportStateDescription}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="program-editor-garmin-export-download"
                  onClick={downloadProgramGarminReadyExport}
                  disabled={!savedProgram || isProgramExportDownloading}
                  aria-describedby={programExportFeedbackTone ? programExportFeedbackId : undefined}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProgramExportDownloading ? "Downloading..." : "Download .json"}
                </button>
              </div>
            </div>

            {programExportFeedbackTone ? (
              <ProgramExportFeedback
                id={programExportFeedbackId}
                tone={programExportFeedbackTone}
                title={programExportFeedbackTitle}
                message={programExportFeedbackMessage}
                testId={
                  programExportFeedbackTone === "error"
                    ? "program-editor-garmin-export-error"
                    : "program-editor-garmin-export-notice"
                }
              />
            ) : null}

            {programExportPreviewError ? (
              <ProgramExportFeedback
                tone="error"
                title="Preview unavailable"
                message={programExportPreviewError}
                testId="program-editor-garmin-export-preview-error"
              />
            ) : null}

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
              <pre
                data-testid="program-editor-garmin-export-preview"
                className="max-h-[320px] overflow-auto px-4 py-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-100"
              >
                {programExportPreview ||
                  (isProgramExportLoading
                    ? "Loading saved program export preview..."
                    : "Saved program export preview will appear here once the saved program loads.")}
              </pre>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">
                  Program PDF
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  Open a print-ready program schedule in a dedicated tab, then use your
                  browser&apos;s Print / Save PDF flow for a coach-readable weekly handoff.
                </p>
                <p
                  data-testid="program-editor-pdf-source"
                  data-pdf-state="canonical"
                  className="mt-2 text-xs font-semibold tracking-wide text-slate-600 uppercase"
                >
                  {programPdfStateLabel}
                </p>
                <p className="mt-1 text-sm text-slate-600">{programPdfStateDescription}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="program-editor-pdf-open"
                  onClick={openProgramPdfPrintView}
                  disabled={!savedProgram}
                  aria-describedby={programPdfFeedbackTone ? programPdfFeedbackId : undefined}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Open print view
                </button>
              </div>
            </div>

            {programPdfNotice ? (
              <ProgramExportFeedback
                id={programPdfFeedbackId}
                tone="success"
                title={programPdfFeedbackTitle}
                message={programPdfFeedbackMessage}
                testId="program-editor-pdf-notice"
              />
            ) : programPdfError ? (
              <ProgramExportFeedback
                id={programPdfFeedbackId}
                tone="error"
                title={programPdfFeedbackTitle}
                message={programPdfFeedbackMessage}
                testId="program-editor-pdf-error"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
