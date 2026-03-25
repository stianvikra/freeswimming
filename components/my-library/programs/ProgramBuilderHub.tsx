"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CreateManualProgramButton from "@/components/my-library/programs/CreateManualProgramButton";
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

type Props = {
  programLibrary: ProgramLibrarySnapshot;
};

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

export default function ProgramBuilderHub({ programLibrary }: Props) {
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
  }, [programLibrary]);

  const workoutLookup = useMemo(
    () => new Map(availableWorkouts.map((workout) => [workout.id, workout])),
    [availableWorkouts]
  );

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
      setSuccess("Program changes saved to the canonical program.");
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

  return (
    <section
      data-testid="program-builder-hub"
      data-client-ready={clientReady ? "true" : "false"}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Program shell</h2>
          <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
            Save a canonical program shell, place accepted workouts into week/day slots, and keep
            one shared program surface ready for later planner and export work.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {programLibrary.schemaReady ? (
            <CreateManualProgramButton
              testId="program-builder-create-manual"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            />
          ) : null}
          <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Canonical program
          </p>
        </div>
      </div>

      {!programLibrary.schemaReady ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            Canonical program save is still syncing in this environment. Come back once the programs
            table is live to build saved program shells here.
          </p>
        </div>
      ) : null}

      {programLibrary.loadError ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{programLibrary.loadError}</p>
        </div>
      ) : null}

      {missingWorkoutIds.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            {missingWorkoutIds.length === 1
              ? "One scheduled workout could not be loaded for this account."
              : `${missingWorkoutIds.length} scheduled workouts could not be loaded for this account.`}
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm text-emerald-900">{success}</p>
        </div>
      ) : null}

      {!savedProgram ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm font-medium text-amber-900">
              {programLibrary.selectedProgramMissing
                ? "That saved program could not be found."
                : "No canonical program is loaded in this route."}
            </p>
            <p className="mt-2 text-sm text-amber-900/90">
              Create a starter program here, return to My Library, or reopen another saved program
              below.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
            </div>
          </div>

          {recentPrograms.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Recent saved programs</h3>
              <p className="mt-1 text-sm text-slate-600">
                Reopen another canonical program shell directly in this route.
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
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
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
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
                <p data-testid="program-editor-save-state" className="mt-3 text-sm text-slate-600">
                  {hasUnsavedChanges
                    ? "Unsaved changes stay local until you save this program."
                    : "All program changes are saved to the canonical program."}
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
                      shell simple and canonical.
                    </p>
                  </div>
                  <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {week.assignments.length} scheduled
                  </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                  {PROGRAM_WEEKDAY_LABELS.map((dayLabel, dayIndex) => {
                    const pickerKey = `${week.id}-${dayIndex}`;
                    const dayAssignments = days[dayIndex];

                    return (
                      <div
                        key={dayLabel}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
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
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                                  className="rounded-xl border border-white bg-white p-3 shadow-sm"
                                >
                                  <p className="text-sm font-medium text-slate-900">
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

                                  <div className="mt-3 space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
        </div>
      ) : null}
    </section>
  );
}
