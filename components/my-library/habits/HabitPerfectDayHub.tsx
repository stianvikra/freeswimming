"use client";

import { Archive, CheckCircle2, Plus, RotateCcw, Save, Target } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  HABIT_CATEGORY_VALUES,
  HABIT_TYPE_VALUES,
  type HabitDayItem,
  type HabitSnapshot,
  type HabitType,
  type HabitUnit,
} from "@/lib/habits/shared";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

type Props = {
  initialSnapshot: HabitSnapshot;
};

type ApiResponse = {
  ok?: boolean;
  error?: string;
  snapshot?: HabitSnapshot;
};

type HabitDraft = {
  title: string;
  habitType: HabitType;
  category: string;
  targetValueNumeric: string;
  targetUnit: HabitUnit;
  targetTime: string;
  notes: string;
};

const DEFAULT_DRAFT: HabitDraft = {
  title: "",
  habitType: "binary",
  category: "movement",
  targetValueNumeric: "10",
  targetUnit: "minutes",
  targetTime: "05:00",
  notes: "",
};

function getInputValue(item: HabitDayItem) {
  if (item.habit.habitType === "time_of_day") {
    return item.checkIn?.valueTime?.slice(0, 5) ?? "";
  }

  if (
    item.habit.habitType === "count" ||
    item.habit.habitType === "duration" ||
    item.habit.habitType === "avoidance"
  ) {
    return item.checkIn?.valueNumeric === null || item.checkIn?.valueNumeric === undefined
      ? ""
      : String(item.checkIn.valueNumeric);
  }

  return "";
}

function buildInputState(snapshot: HabitSnapshot) {
  return Object.fromEntries(
    snapshot.daySummary.items.map((item) => [item.habit.id, getInputValue(item)])
  );
}

function getUnitOptions(habitType: HabitType): HabitUnit[] {
  if (habitType === "duration") return ["minutes", "seconds"];
  if (habitType === "count") return ["times", "steps", "pages", "glasses", "custom"];
  if (habitType === "avoidance") return ["times", "glasses", "custom"];
  return ["times"];
}

function getWeekdayLabel(date: string) {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return date;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(parsed));
}

function getLongDateLabel(date: string) {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(parsed));
}

function getHabitTypeLabel(type: HabitType) {
  switch (type) {
    case "avoidance":
      return "Avoid/limit";
    case "time_of_day":
      return "Time";
    case "duration":
      return "Minutes";
    case "count":
      return "Count";
    case "binary":
    default:
      return "Done";
  }
}

function getCategoryLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function HabitPerfectDayHub({ initialSnapshot }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [draft, setDraft] = useState<HabitDraft>(DEFAULT_DRAFT);
  const [checkInInputs, setCheckInInputs] = useState<Record<string, string>>(() =>
    buildInputState(initialSnapshot)
  );
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialSnapshot.loadError);

  useEffect(() => {
    setCheckInInputs(buildInputState(snapshot));
  }, [snapshot]);

  const activeCount = snapshot.activeHabits.length;
  const preferredCountLabel =
    activeCount === 0
      ? "No habits yet"
      : activeCount < 3
        ? `${activeCount} active · add a few more when ready`
        : `${activeCount} active`;

  const draftUnitOptions = useMemo(() => getUnitOptions(draft.habitType), [draft.habitType]);

  async function applyResponse(response: Response, fallback: string) {
    let payload: ApiResponse;
    try {
      payload = (await response.json()) as ApiResponse;
    } catch {
      throw new Error(fallback);
    }

    if (!response.ok || payload.ok === false || !payload.snapshot) {
      throw new Error(payload.error ?? fallback);
    }

    setSnapshot(payload.snapshot);
    setError(null);
    return payload.snapshot;
  }

  async function createHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!snapshot.schemaReady) return;

    setPendingKey("create");
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          selectedDate: snapshot.selectedDate,
          isPerfectDayItem: true,
        }),
      });
      await applyResponse(response, "Could not create that habit right now.");
      setDraft(DEFAULT_DRAFT);
      setNotice("Habit added.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create that habit right now.");
    } finally {
      setPendingKey(null);
    }
  }

  async function archiveHabit(habitId: string) {
    setPendingKey(`archive-${habitId}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch(`/api/my-library/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "archived",
          selectedDate: snapshot.selectedDate,
        }),
      });
      await applyResponse(response, "Could not archive that habit right now.");
      setNotice("Habit archived.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not archive that habit right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function saveCheckIn(item: HabitDayItem, completeBinary = false) {
    const habit = item.habit;
    const input = checkInInputs[habit.id]?.trim() ?? "";
    const body: Record<string, unknown> = {
      habitId: habit.id,
      checkInDate: snapshot.selectedDate,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };

    if (habit.habitType === "binary") {
      body.valueBoolean = completeBinary || true;
    } else if (habit.habitType === "time_of_day") {
      body.valueTime = input;
    } else {
      body.valueNumeric = input;
    }

    setPendingKey(`check-${habit.id}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await applyResponse(response, "Could not save that check-in right now.");
      setNotice("Check-in saved.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save that check-in right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function resetCheckIn(item: HabitDayItem) {
    setPendingKey(`reset-${item.habit.id}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: item.habit.id,
          checkInDate: snapshot.selectedDate,
          clear: true,
        }),
      });
      await applyResponse(response, "Could not reset that check-in right now.");
      setNotice("Check-in reset.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not reset that check-in right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  if (!snapshot.schemaReady) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold text-slate-900">My Perfect Day</h2>
        <p className="mt-2 text-sm text-amber-800">Habits are still syncing in this environment.</p>
      </section>
    );
  }

  const online = readNavigatorOnlineState();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
              My Perfect Day
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {snapshot.daySummary.isPerfectDay ? "Perfect day logged" : "Today"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {snapshot.daySummary.satisfiedPerfectDayItemCount}/
              {snapshot.daySummary.perfectDayItemCount} habits on target · {preferredCountLabel}
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="My Perfect Day completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={snapshot.daySummary.completionPercent}
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-center"
          >
            <span className="text-2xl font-bold text-blue-800">
              {snapshot.daySummary.completionPercent}%
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Perfect days
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.perfectDayCount}/7
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Minutes</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.totalDurationMinutes}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Count</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.totalCount}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2" aria-label="Seven day habit consistency">
          {snapshot.weekSummary.days.map((day) => (
            <div key={day.date} className="min-w-0">
              <div className="flex h-20 items-end rounded-xl border border-slate-200 bg-slate-50 p-1">
                <div
                  className="w-full rounded-lg bg-blue-600"
                  style={{ height: `${Math.max(6, day.completionPercent)}%` }}
                  aria-label={`${getWeekdayLabel(day.date)} ${day.completionPercent}% complete`}
                />
              </div>
              <p className="mt-1 truncate text-center text-[11px] font-semibold text-slate-600">
                {getWeekdayLabel(day.date)}
              </p>
              <p className="text-center text-[11px] text-slate-500">{day.completionPercent}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Habits</h2>
            <p className="mt-1 text-sm text-slate-600">{getLongDateLabel(snapshot.selectedDate)}</p>
          </div>
          {online === false ? (
            <p className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Offline
            </p>
          ) : null}
        </div>

        {snapshot.daySummary.items.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Add the first habit below.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {snapshot.daySummary.items.map((item) => {
              const habit = item.habit;
              const disabled = pendingKey !== null;
              const isSatisfied = item.evaluation.isSatisfied;
              return (
                <article
                  key={habit.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{habit.title}</h3>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {getHabitTypeLabel(habit.habitType)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isSatisfied
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          {item.evaluation.stateLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {habit.targetLabel} · {getCategoryLabel(habit.category)}
                      </p>
                      {habit.notes ? (
                        <p className="mt-2 text-sm text-slate-500">{habit.notes}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => archiveHabit(habit.id)}
                      disabled={disabled}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Archive className="h-4 w-4" aria-hidden="true" />
                      Archive
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end gap-2">
                    {habit.habitType === "binary" ? (
                      <button
                        type="button"
                        onClick={() => saveCheckIn(item, true)}
                        disabled={disabled || isSatisfied}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Done
                      </button>
                    ) : (
                      <label className="block">
                        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          {habit.habitType === "time_of_day" ? "Time" : "Value"}
                        </span>
                        <input
                          type={habit.habitType === "time_of_day" ? "time" : "number"}
                          min={habit.habitType === "time_of_day" ? undefined : 0}
                          step={habit.habitType === "time_of_day" ? undefined : "0.25"}
                          value={checkInInputs[habit.id] ?? ""}
                          onChange={(event) =>
                            setCheckInInputs((current) => ({
                              ...current,
                              [habit.id]: event.target.value,
                            }))
                          }
                          className="mt-1 h-10 w-36 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                    )}

                    {habit.habitType !== "binary" ? (
                      <button
                        type="button"
                        onClick={() => saveCheckIn(item)}
                        disabled={disabled}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" aria-hidden="true" />
                        Save
                      </button>
                    ) : null}

                    {item.checkIn ? (
                      <button
                        type="button"
                        onClick={() => resetCheckIn(item)}
                        disabled={disabled}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Reset
                      </button>
                    ) : null}

                    <p className="text-sm text-slate-500">{item.evaluation.valueLabel}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Add habit</h2>
        <form onSubmit={createHabit} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Name
            </span>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Read 10 pages"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Type
            </span>
            <select
              value={draft.habitType}
              onChange={(event) => {
                const habitType = event.target.value as HabitType;
                const unitOptions = getUnitOptions(habitType);
                setDraft((current) => ({
                  ...current,
                  habitType,
                  targetUnit: unitOptions[0] ?? "times",
                  targetValueNumeric: habitType === "avoidance" ? "0" : current.targetValueNumeric,
                }));
              }}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {HABIT_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>
                  {getHabitTypeLabel(type)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Category
            </span>
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value }))
              }
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {HABIT_CATEGORY_VALUES.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </label>

          {draft.habitType === "time_of_day" ? (
            <label className="block">
              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Target time
              </span>
              <input
                type="time"
                value={draft.targetTime}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, targetTime: event.target.value }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          ) : null}

          {draft.habitType !== "binary" && draft.habitType !== "time_of_day" ? (
            <>
              <label className="block">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Target
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.25"
                  value={draft.targetValueNumeric}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      targetValueNumeric: event.target.value,
                    }))
                  }
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Unit
                </span>
                <select
                  value={draft.targetUnit}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      targetUnit: event.target.value as HabitUnit,
                    }))
                  }
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {draftUnitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          <label className="block md:col-span-2">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Note
            </span>
            <input
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Optional"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={pendingKey !== null}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add habit
            </button>
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Target className="h-4 w-4" aria-hidden="true" />
              Best with 3-7 active habits.
            </p>
          </div>
        </form>
      </section>

      <div aria-live="polite" className="min-h-6">
        {notice ? <p className="text-sm font-medium text-emerald-700">{notice}</p> : null}
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
