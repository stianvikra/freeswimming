"use client";

import { useEffect, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import WorkoutEditor from "@/components/my-library/workouts/WorkoutEditor";
import { WORKOUT_NOTICE_AUTO_DISMISS_MS } from "@/components/my-library/workouts/useAutoDismissNotice";
import {
  type GeneratorIntakeHandoffPayload,
  type GeneratorIntakeOverrides,
  type GeneratorIntakeSelection,
} from "@/lib/generator-intake/shared";
import {
  SESSION_DRAFT_POOL_LENGTH_UNITS,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_STROKES,
  formatPoolLengthLabel,
  convertMetersToPoolUnitValue,
  convertPoolUnitValueToMeters,
  getDefaultSessionGeneratorFormState,
  getSessionEnvironmentLabel,
  getSessionEquipmentLabel,
  getSessionStrokeLabel,
  getSessionTypeLabel,
  normalizeSessionGeneratorFormState,
  validateSessionGeneratorFormState,
  type SessionDraft,
  type SessionDraftApiResponse,
  type SessionGeneratorEquipment,
  type SessionGeneratorFormState,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";
import type {
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutSaveApiResponse,
} from "@/lib/workouts/shared";
import { haveWorkoutDraftChanges } from "@/lib/workouts/shared";

const POOL_LENGTH_QUICK_CHOICES = [25, 50] as const;

type Props = {
  payload: GeneratorIntakeHandoffPayload;
  selection: GeneratorIntakeSelection;
  overrides: GeneratorIntakeOverrides;
  onOverrideChange: (key: "focusText" | "constraintText", value: string) => void;
  onResetOverrides: () => void;
  workoutLibrary: WorkoutLibrarySnapshot;
};

type ProfileSkillLimit = GeneratorIntakeHandoffPayload["source"]["swimCapabilityLimits"][number];

function createEmptyStrokeLimitFormState(): SessionGeneratorFormState["strokeLimits"] {
  return SESSION_GENERATOR_STROKES.reduce(
    (result, stroke) => {
      result[stroke] = {
        maxRepeatDistance: "",
        maxTotalDistance: "",
      };
      return result;
    },
    {} as SessionGeneratorFormState["strokeLimits"]
  );
}

function formatProfileSkillLimitText(limit: ProfileSkillLimit | null | undefined) {
  if (!limit) return "";

  return [
    limit.maxRepeatDistanceLabel ? `max length ${limit.maxRepeatDistanceLabel}` : null,
    limit.targetTotalDistanceLabel ? `approx ${limit.targetTotalDistanceLabel}/session` : null,
    limit.maxTotalDistanceLabel ? `max ${limit.maxTotalDistanceLabel}/session` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getProfileSkillLimitName(limit: ProfileSkillLimit) {
  if (limit.kind === "drill") return "Drills";
  if (limit.kind === "kick") return "Kick";

  return limit.strokeLabel ?? "Stroke";
}

function formatPoolQuickChoiceLabel(
  value: number,
  unit: SessionGeneratorFormState["poolLengthUnit"]
) {
  return unit === "yd" ? `${value}yd` : formatPoolLengthLabel(value, unit);
}

function formatDistanceForForm(
  value: number | null | undefined,
  unit: SessionGeneratorFormState["poolLengthUnit"]
) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  const converted = convertMetersToPoolUnitValue(value, unit);
  return converted.toFixed(2).replace(/\.?0+$/, "");
}

function parseDistanceForComparison(
  value: string,
  unit: SessionGeneratorFormState["poolLengthUnit"]
) {
  const parsed = Number.parseFloat(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return convertPoolUnitValueToMeters(parsed, unit);
}

function isDistanceChangedFromProfile(
  value: string,
  profileMeters: number | null | undefined,
  unit: SessionGeneratorFormState["poolLengthUnit"]
) {
  const parsedMeters = value ? parseDistanceForComparison(value, unit) : null;
  if (typeof profileMeters !== "number" || !Number.isFinite(profileMeters) || profileMeters <= 0) {
    return parsedMeters !== null;
  }
  if (parsedMeters === null) return true;

  return Math.abs(parsedMeters - profileMeters) > 0.01;
}

function getLimitStatusLabel(hasProfileValue: boolean, hasChangedValue: boolean) {
  if (hasChangedValue) return "Changed";
  if (hasProfileValue) return "Profile active";
  return "No profile value";
}

function getLimitStatusClass(label: string) {
  if (label === "Changed") {
    return "bg-blue-100 text-blue-800";
  }
  if (label === "Profile active") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-slate-100 text-slate-500";
}

const LIMIT_INPUT_CLASS =
  "mt-2 block h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

function LimitLegend({ label, status }: { label: string; status: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap uppercase ${getLimitStatusClass(
          status
        )}`}
      >
        {status}
      </span>
    </span>
  );
}

function LimitNumberField({
  label,
  unit,
  value,
  testId,
  onChange,
}: {
  label: string;
  unit: SessionGeneratorFormState["poolLengthUnit"];
  value: string;
  testId: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm text-slate-700">
      {label} ({unit})
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
        placeholder=""
        className={LIMIT_INPUT_CLASS}
      />
    </label>
  );
}

export default function SessionGeneratorPanel({
  payload,
  selection,
  overrides,
  onOverrideChange,
  onResetOverrides,
  workoutLibrary,
}: Props) {
  const [formState, setFormState] = useState<SessionGeneratorFormState>(() =>
    getDefaultSessionGeneratorFormState(payload)
  );
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [savedWorkout, setSavedWorkout] = useState<WorkoutEditorRecord | null>(
    workoutLibrary.selectedWorkout
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [regenerateSettingsOpen, setRegenerateSettingsOpen] = useState(false);
  const [skillLimitsExpanded, setSkillLimitsExpanded] = useState(false);
  const [discardUndoDraft, setDiscardUndoDraft] = useState<WorkoutEditorRecord["draft"] | null>(
    null
  );

  useEffect(() => {
    if (workoutLibrary.selectedWorkout) {
      setSavedWorkout(workoutLibrary.selectedWorkout);
      setDraft(workoutLibrary.selectedWorkout.draft);
      setError("");
      setSuccess("");
      setRegenerateSettingsOpen(false);
      setSkillLimitsExpanded(false);
      setDiscardUndoDraft(null);
      return;
    }

    setSavedWorkout(null);
    setDraft(null);
    setError("");
    setSuccess("");
    setRegenerateSettingsOpen(false);
    setSkillLimitsExpanded(false);
    setDiscardUndoDraft(null);
  }, [workoutLibrary.selectedWorkout]);

  useEffect(() => {
    if (workoutLibrary.selectedWorkout) return;
    setFormState((current) => normalizeSessionGeneratorFormState(current, payload));
  }, [payload, workoutLibrary.selectedWorkout]);

  useEffect(() => {
    if (!discardUndoDraft) return;

    const timeoutId = window.setTimeout(() => {
      setDiscardUndoDraft(null);
    }, WORKOUT_NOTICE_AUTO_DISMISS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [discardUndoDraft]);

  const sessionReady = payload.overrides.targetType === "session";
  const canonicalSaveReady = workoutLibrary.schemaReady;
  const hasLoadedCanonicalWorkout = Boolean(savedWorkout);
  const hasUnsavedChanges = savedWorkout
    ? haveWorkoutDraftChanges(draft, savedWorkout.draft)
    : true;
  const showGeneratorSettings = !draft || regenerateSettingsOpen;
  const hasProfileSkillLimits =
    selection.capability_limits && payload.source.swimCapabilityLimits.length > 0;
  const profileDrillLimit = hasProfileSkillLimits
    ? payload.source.swimCapabilityLimits.find(
        (limit) => limit.kind === "drill" && limit.maxRepeatDistanceM
      )
    : null;
  const profileKickLimit = hasProfileSkillLimits
    ? payload.source.swimCapabilityLimits.find(
        (limit) => limit.kind === "kick" && limit.maxRepeatDistanceM
      )
    : null;
  const profileSkillLimitSummaryItems = hasProfileSkillLimits
    ? payload.source.swimCapabilityLimits
        .map((limit) => ({
          id: limit.id,
          name: getProfileSkillLimitName(limit),
          details: formatProfileSkillLimitText(limit),
        }))
        .filter((item) => item.details)
        .slice(0, 4)
    : [];
  const profileSkillLimitOverflowCount = hasProfileSkillLimits
    ? Math.max(payload.source.swimCapabilityLimits.length - profileSkillLimitSummaryItems.length, 0)
    : 0;
  const profileDrillLimitText = formatProfileSkillLimitText(profileDrillLimit);
  const profileKickLimitText = formatProfileSkillLimitText(profileKickLimit);
  const isSkillLimitOverride = formState.skillLimitMode === "override" || !hasProfileSkillLimits;
  const showSkillLimitEditor = isSkillLimitOverride && skillLimitsExpanded;
  const getProfileStrokeLimit = (stroke: SessionGeneratorStroke) =>
    hasProfileSkillLimits
      ? payload.source.swimCapabilityLimits.find(
          (limit) => limit.kind === "stroke" && limit.stroke === stroke
        )
      : null;
  const hasProfileDrillValue = Boolean(
    profileDrillLimit?.maxRepeatDistanceM || profileDrillLimit?.targetTotalDistanceM
  );
  const drillLimitStatus = getLimitStatusLabel(
    hasProfileDrillValue,
    isDistanceChangedFromProfile(
      formState.drillMaxRepeatDistance,
      profileDrillLimit?.maxRepeatDistanceM,
      formState.poolLengthUnit
    ) ||
      isDistanceChangedFromProfile(
        formState.drillApproxTotalDistance,
        profileDrillLimit?.targetTotalDistanceM,
        formState.poolLengthUnit
      )
  );
  const hasProfileKickValue = Boolean(
    profileKickLimit?.maxRepeatDistanceM || profileKickLimit?.targetTotalDistanceM
  );
  const kickLimitStatus = getLimitStatusLabel(
    hasProfileKickValue,
    isDistanceChangedFromProfile(
      formState.kickIntervalMeters,
      profileKickLimit?.maxRepeatDistanceM,
      formState.poolLengthUnit
    ) ||
      isDistanceChangedFromProfile(
        formState.kickApproxTotalDistance,
        profileKickLimit?.targetTotalDistanceM,
        formState.poolLengthUnit
      )
  );

  function getProfileLimitFormPatch(unit: SessionGeneratorFormState["poolLengthUnit"]) {
    const strokeLimits = createEmptyStrokeLimitFormState();
    const drillLimit = payload.source.swimCapabilityLimits.find((limit) => limit.kind === "drill");
    const kickLimit = payload.source.swimCapabilityLimits.find((limit) => limit.kind === "kick");

    for (const limit of payload.source.swimCapabilityLimits) {
      if (limit.kind !== "stroke" || !limit.stroke || !strokeLimits[limit.stroke]) continue;

      strokeLimits[limit.stroke] = {
        maxRepeatDistance: formatDistanceForForm(limit.maxRepeatDistanceM, unit),
        maxTotalDistance: formatDistanceForForm(limit.maxTotalDistanceM, unit),
      };
    }

    return {
      drillMaxRepeatDistance: formatDistanceForForm(drillLimit?.maxRepeatDistanceM, unit),
      drillApproxTotalDistance: formatDistanceForForm(drillLimit?.targetTotalDistanceM, unit),
      kickIntervalMeters: formatDistanceForForm(kickLimit?.maxRepeatDistanceM, unit),
      kickApproxTotalDistance: formatDistanceForForm(kickLimit?.targetTotalDistanceM, unit),
      strokeLimits,
    };
  }

  function applyOverrideChange(key: "focusText" | "constraintText", value: string) {
    setError("");
    setSuccess("");
    onOverrideChange(key, value);
  }

  function handleResetOverrides() {
    setError("");
    setSuccess("");
    onResetOverrides();
  }

  function updateFormState<K extends keyof SessionGeneratorFormState>(
    key: K,
    value: SessionGeneratorFormState[K]
  ) {
    setFormState((current) =>
      normalizeSessionGeneratorFormState(
        {
          ...current,
          [key]: value,
        },
        payload
      )
    );
    setError("");
    setSuccess("");
  }

  function updateStrokeLimit(
    stroke: SessionGeneratorStroke,
    key: keyof SessionGeneratorFormState["strokeLimits"][SessionGeneratorStroke],
    value: string
  ) {
    updateFormState("strokeLimits", {
      ...formState.strokeLimits,
      [stroke]: {
        ...formState.strokeLimits[stroke],
        [key]: value,
      },
    });
  }

  function updateSkillLimitMode(mode: SessionGeneratorFormState["skillLimitMode"]) {
    setFormState((current) =>
      normalizeSessionGeneratorFormState(
        {
          ...current,
          ...(hasProfileSkillLimits
            ? getProfileLimitFormPatch(current.poolLengthUnit)
            : {
                drillMaxRepeatDistance: current.drillMaxRepeatDistance,
                drillApproxTotalDistance: current.drillApproxTotalDistance,
                kickIntervalMeters: current.kickIntervalMeters,
                kickApproxTotalDistance: current.kickApproxTotalDistance,
                strokeLimits: current.strokeLimits,
              }),
          skillLimitMode: mode,
        },
        payload
      )
    );
    setSkillLimitsExpanded(mode === "override");
    setError("");
    setSuccess("");
  }

  function updatePoolLengthUnit(unit: SessionGeneratorFormState["poolLengthUnit"]) {
    setFormState((current) =>
      normalizeSessionGeneratorFormState(
        {
          ...current,
          poolLengthUnit: unit,
          poolLengthM: unit === "yd" ? "25" : "25",
        },
        payload
      )
    );
    setError("");
    setSuccess("");
  }

  function toggleStroke(stroke: SessionGeneratorStroke) {
    const exists = formState.allowedStrokes.includes(stroke);
    updateFormState(
      "allowedStrokes",
      exists
        ? formState.allowedStrokes.filter((value) => value !== stroke)
        : [...formState.allowedStrokes, stroke]
    );
  }

  function toggleEquipment(item: SessionGeneratorEquipment) {
    const exists = formState.equipmentAllowlist.includes(item);
    updateFormState(
      "equipmentAllowlist",
      exists
        ? formState.equipmentAllowlist.filter((value) => value !== item)
        : [...formState.equipmentAllowlist, item]
    );
  }

  async function generateDraft() {
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);

    const validation = validateSessionGeneratorFormState(formState, payload);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/my-library/generator/session-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selection,
          overrides,
          input: formState,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as SessionDraftApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok
          ? responseBody.error
          : "Could not generate a session draft right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setDraft(responseBody.draft);
      setSavedWorkout(null);
      setRegenerateSettingsOpen(false);
      void sendClientAnalyticsEvent("session_draft_generated", {
        sessionType: responseBody.draft.sessionType,
        environment: responseBody.draft.environment,
        sizeMode: responseBody.draft.sizeMode,
        hasCss: Boolean(responseBody.draft.usedCssPaceLabel),
      });
    } catch {
      setError("Could not generate a session draft right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveWorkout() {
    if (!draft) return;

    setIsSaving(true);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);

    try {
      const response = await fetch(
        savedWorkout ? `/api/my-library/workouts/${savedWorkout.id}` : "/api/my-library/workouts",
        {
          method: savedWorkout ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft,
          }),
        }
      );
      const responseBody = (await response
        .json()
        .catch(() => null)) as WorkoutSaveApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok ? responseBody.error : "Could not save workout right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setSavedWorkout(responseBody.workout);
      setDraft(responseBody.workout.draft);
      setSuccess(
        savedWorkout
          ? "Session changes saved to My Swim Sessions."
          : "Session saved to My Swim Sessions."
      );
    } catch {
      setError("Could not save workout right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDraftChange(nextDraft: WorkoutEditorRecord["draft"]) {
    setDraft(nextDraft);
    setSuccess("");

    if (
      discardUndoDraft &&
      savedWorkout &&
      !haveWorkoutDraftChanges(nextDraft, savedWorkout.draft)
    ) {
      return;
    }

    setDiscardUndoDraft(null);
  }

  function discardDraftChanges() {
    if (!savedWorkout || !draft || !hasUnsavedChanges) return;

    setDiscardUndoDraft(draft);
    setDraft(savedWorkout.draft);
    setError("");
    setSuccess("");
  }

  function undoDiscardDraftChanges() {
    if (!discardUndoDraft) return;

    setDraft(discardUndoDraft);
    setDiscardUndoDraft(null);
    setError("");
    setSuccess("");
  }

  return (
    <section data-testid="session-generator-panel" className="space-y-5">
      {workoutLibrary.loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{workoutLibrary.loadError}</p>
        </div>
      ) : null}

      {workoutLibrary.selectedWorkoutMissing ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            That saved session could not be found. Start a fresh AI session here or open My Swim
            Sessions instead.
          </p>
        </div>
      ) : null}

      {!canonicalSaveReady ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            Saving to My Swim Sessions is still syncing in this environment. You can generate and
            review a session here, but Save to My Swim Sessions stays unavailable until sync
            finishes.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm text-emerald-900">{success}</p>
        </div>
      ) : null}

      {!hasLoadedCanonicalWorkout && sessionReady ? (
        <>
          {draft ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">
                Draft generated. Review the session below before saving.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRegenerateSettingsOpen((current) => !current)}
                  aria-expanded={regenerateSettingsOpen}
                  data-testid="session-generator-regenerate-settings-toggle"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  {regenerateSettingsOpen ? "Hide settings" : "Regenerate settings"}
                </button>
                <button
                  type="button"
                  onClick={generateDraft}
                  disabled={isGenerating}
                  data-testid="session-generator-generate"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? "Generating..." : "Regenerate"}
                </button>
              </div>
            </div>
          ) : null}

          {showGeneratorSettings ? (
            <>
              <section
                className="rounded-2xl border border-slate-200 bg-white p-4"
                data-testid="session-generator-profile-limits-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">
                      Stroke and skill limits
                    </h3>
                    {!hasProfileSkillLimits ? (
                      <p className="mt-1 text-sm text-slate-600">
                        Add limits for this session generation only.
                      </p>
                    ) : null}
                  </div>
                  {hasProfileSkillLimits ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800 uppercase">
                      {isSkillLimitOverride ? "Session-specific" : "From Swim Profile"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700 uppercase">
                      Not in Swim Profile
                    </span>
                  )}
                </div>

                {hasProfileSkillLimits && !showSkillLimitEditor ? (
                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <ul className="grid gap-1.5 text-sm text-slate-700 sm:grid-cols-2">
                        {profileSkillLimitSummaryItems.map((item) => (
                          <li key={item.id} className="min-w-0">
                            <span className="font-medium text-slate-900">{item.name}:</span>{" "}
                            {item.details}
                          </li>
                        ))}
                        {profileSkillLimitOverflowCount > 0 ? (
                          <li className="text-slate-500">
                            +{profileSkillLimitOverflowCount} more from Swim Profile
                          </li>
                        ) : null}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSkillLimitMode("override")}
                      data-testid="session-generator-skill-limits-override"
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      Change for this session
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="max-w-2xl text-sm text-slate-600">
                        {hasProfileSkillLimits
                          ? "Adjust limits for this session generation only."
                          : "Add limits for this session generation only."}
                      </p>
                      {hasProfileSkillLimits ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateSkillLimitMode("profile")}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                          >
                            Reset to Swim Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => setSkillLimitsExpanded(false)}
                            className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-800 active:bg-slate-950"
                          >
                            Done
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <fieldset className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <legend className="px-1 text-sm font-medium text-slate-900">
                          <LimitLegend label="Drills" status={drillLimitStatus} />
                        </legend>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <LimitNumberField
                            label="Max length"
                            unit={formState.poolLengthUnit}
                            value={formState.drillMaxRepeatDistance}
                            testId="session-generator-drill-max-repeat"
                            onChange={(value) => updateFormState("drillMaxRepeatDistance", value)}
                          />
                          <LimitNumberField
                            label="Approx per session"
                            unit={formState.poolLengthUnit}
                            value={formState.drillApproxTotalDistance}
                            testId="session-generator-drill-approx-total"
                            onChange={(value) => updateFormState("drillApproxTotalDistance", value)}
                          />
                        </div>
                      </fieldset>

                      <fieldset className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <legend className="px-1 text-sm font-medium text-slate-900">
                          <LimitLegend label="Kick" status={kickLimitStatus} />
                        </legend>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <LimitNumberField
                            label="Max length"
                            unit={formState.poolLengthUnit}
                            value={formState.kickIntervalMeters}
                            testId="session-generator-kick-interval"
                            onChange={(value) => updateFormState("kickIntervalMeters", value)}
                          />
                          <LimitNumberField
                            label="Approx per session"
                            unit={formState.poolLengthUnit}
                            value={formState.kickApproxTotalDistance}
                            testId="session-generator-kick-approx-total"
                            onChange={(value) => updateFormState("kickApproxTotalDistance", value)}
                          />
                        </div>
                      </fieldset>
                    </div>

                    <fieldset className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                      <legend className="px-1 text-sm font-medium text-slate-900">
                        Stroke limits
                      </legend>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {SESSION_GENERATOR_STROKES.map((stroke) => {
                          const strokeLimit = formState.strokeLimits[stroke];
                          const profileLimit = getProfileStrokeLimit(stroke);
                          const hasProfileValue = Boolean(
                            profileLimit?.maxRepeatDistanceM || profileLimit?.maxTotalDistanceM
                          );
                          const statusLabel = getLimitStatusLabel(
                            hasProfileValue,
                            isDistanceChangedFromProfile(
                              strokeLimit.maxRepeatDistance,
                              profileLimit?.maxRepeatDistanceM,
                              formState.poolLengthUnit
                            ) ||
                              isDistanceChangedFromProfile(
                                strokeLimit.maxTotalDistance,
                                profileLimit?.maxTotalDistanceM,
                                formState.poolLengthUnit
                              )
                          );

                          return (
                            <fieldset
                              key={stroke}
                              className="rounded-xl border border-slate-200 bg-white p-3"
                            >
                              <legend className="px-1 text-sm font-medium text-slate-900">
                                <LimitLegend
                                  label={getSessionStrokeLabel(stroke)}
                                  status={statusLabel}
                                />
                              </legend>
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <LimitNumberField
                                  label="Max length"
                                  unit={formState.poolLengthUnit}
                                  value={strokeLimit.maxRepeatDistance}
                                  testId={`session-generator-stroke-limit-${stroke}-repeat`}
                                  onChange={(value) =>
                                    updateStrokeLimit(stroke, "maxRepeatDistance", value)
                                  }
                                />
                                <LimitNumberField
                                  label="Max per session"
                                  unit={formState.poolLengthUnit}
                                  value={strokeLimit.maxTotalDistance}
                                  testId={`session-generator-stroke-limit-${stroke}-total`}
                                  onChange={(value) =>
                                    updateStrokeLimit(stroke, "maxTotalDistance", value)
                                  }
                                />
                              </div>
                            </fieldset>
                          );
                        })}
                      </div>
                    </fieldset>
                  </div>
                )}
              </section>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Session setup</h3>
                  </div>
                  {overrides.constraintText ? (
                    <button
                      type="button"
                      onClick={handleResetOverrides}
                      data-testid="session-generator-reset-overrides"
                      aria-label="Clear additional instructions"
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
                  <label className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
                    Session type
                    <select
                      value={formState.sessionType}
                      onChange={(event) =>
                        updateFormState(
                          "sessionType",
                          event.target.value as SessionGeneratorFormState["sessionType"]
                        )
                      }
                      data-testid="session-generator-session-type"
                      className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      {SESSION_GENERATOR_SESSION_TYPES.map((value) => (
                        <option key={value} value={value}>
                          {getSessionTypeLabel(value)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
                    Additional instructions (optional)
                    <textarea
                      value={overrides.constraintText}
                      onChange={(event) =>
                        applyOverrideChange("constraintText", event.target.value)
                      }
                      data-testid="session-generator-constraint-text"
                      rows={4}
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Anything you want your AI coach to consider before generating the session."
                    />
                  </label>
                </div>
              </div>

              <div
                data-testid="session-generator-rules-card"
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <h3 className="text-base font-semibold text-slate-900">Session Rules</h3>
                <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
                  <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
                    <legend className="px-1 text-sm font-semibold text-slate-900">
                      Environment
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {SESSION_GENERATOR_ENVIRONMENTS.map((value) => (
                        <label
                          key={value}
                          className="inline-flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="radio"
                            name="session-generator-environment"
                            checked={formState.environment === value}
                            onChange={() => updateFormState("environment", value)}
                            data-testid={`session-generator-environment-${value}`}
                          />
                          {getSessionEnvironmentLabel(value)}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {formState.environment === "pool" ? (
                    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
                      <legend className="px-1 text-sm font-semibold text-slate-900">
                        Pool size
                      </legend>
                      <div
                        data-testid="session-generator-pool-size-inline-row"
                        data-layout="compact-inline"
                        className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3"
                      >
                        <div
                          role="group"
                          aria-label="Pool size unit"
                          className="flex shrink-0 flex-wrap items-center gap-2"
                        >
                          {SESSION_DRAFT_POOL_LENGTH_UNITS.map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              aria-pressed={formState.poolLengthUnit === unit}
                              onClick={() => updatePoolLengthUnit(unit)}
                              data-testid={`session-generator-pool-length-unit-${unit}`}
                              className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-sm transition ${
                                formState.poolLengthUnit === unit
                                  ? "border-blue-600 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {unit === "m" ? "Meters" : "Yards"}
                            </button>
                          ))}
                        </div>

                        <div
                          role="group"
                          aria-label="Common pool sizes"
                          className="flex shrink-0 flex-wrap items-center gap-2"
                        >
                          {POOL_LENGTH_QUICK_CHOICES.map((value) => {
                            const isSelected = formState.poolLengthM === String(value);
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => updateFormState("poolLengthM", String(value))}
                                className={`inline-flex h-10 items-center justify-center rounded-full border px-3 text-sm transition ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {formatPoolQuickChoiceLabel(value, formState.poolLengthUnit)}
                              </button>
                            );
                          })}
                        </div>

                        <div className="min-w-0 shrink-0">
                          <div className="relative w-[8.75rem] sm:w-[9.25rem]">
                            <input
                              type="text"
                              inputMode="decimal"
                              aria-label={`Exact pool size (${formState.poolLengthUnit})`}
                              value={formState.poolLengthM}
                              onChange={(event) =>
                                updateFormState("poolLengthM", event.target.value)
                              }
                              data-testid="session-generator-pool-length"
                              className="block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 pr-10 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-500"
                            >
                              {formState.poolLengthUnit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  ) : null}

                  <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
                    <legend className="px-1 text-sm font-semibold text-slate-900">
                      Session size
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="radio"
                          name="session-generator-size-mode"
                          checked={formState.sizeMode === "distance"}
                          onChange={() => updateFormState("sizeMode", "distance")}
                          data-testid="session-generator-size-distance"
                        />
                        Distance
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="radio"
                          name="session-generator-size-mode"
                          checked={formState.sizeMode === "estimated_time"}
                          onChange={() => updateFormState("sizeMode", "estimated_time")}
                          data-testid="session-generator-size-time"
                        />
                        Estimated duration
                      </label>
                    </div>

                    {formState.sizeMode === "distance" ? (
                      <label className="mt-4 block text-sm text-slate-700">
                        Target distance ({formState.poolLengthUnit})
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formState.targetDistanceM}
                          onChange={(event) =>
                            updateFormState("targetDistanceM", event.target.value)
                          }
                          data-testid="session-generator-target-distance"
                          className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </label>
                    ) : (
                      <label className="mt-4 block text-sm text-slate-700">
                        Duration
                        <div className="relative mt-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formState.targetTimeMin}
                            onChange={(event) =>
                              updateFormState("targetTimeMin", event.target.value)
                            }
                            data-testid="session-generator-target-time"
                            className="block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 pr-14 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-500"
                          >
                            min
                          </span>
                        </div>
                      </label>
                    )}
                  </fieldset>

                  <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
                    <legend className="px-1 text-sm font-semibold text-slate-900">
                      Optional structure
                    </legend>
                    <div className="mt-3 flex flex-col gap-3">
                      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={formState.includeDrills}
                          onChange={(event) =>
                            updateFormState("includeDrills", event.target.checked)
                          }
                          data-testid="session-generator-include-drills"
                        />
                        Include drills
                      </label>
                      {formState.includeDrills ? (
                        <div className="ml-6 grid gap-3 border-l border-slate-200 pl-4">
                          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="session-generator-drill-volume-mode"
                              checked={formState.drillVolumeMode === "coach_decides"}
                              onChange={() => updateFormState("drillVolumeMode", "coach_decides")}
                              data-testid="session-generator-drill-volume-coach"
                            />
                            Coach decides drill meters
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="session-generator-drill-volume-mode"
                              checked={formState.drillVolumeMode === "explicit"}
                              onChange={() => updateFormState("drillVolumeMode", "explicit")}
                              data-testid="session-generator-drill-volume-explicit"
                            />
                            Set drill meters
                          </label>
                          {formState.drillVolumeMode === "explicit" ? (
                            <label className="block text-sm text-slate-700">
                              Drill distance ({formState.poolLengthUnit})
                              <input
                                type="text"
                                inputMode="numeric"
                                value={formState.drillTargetMeters}
                                onChange={(event) =>
                                  updateFormState("drillTargetMeters", event.target.value)
                                }
                                data-testid="session-generator-drill-meters"
                                className="mt-2 block h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              />
                            </label>
                          ) : null}
                          {profileDrillLimitText ||
                          (isSkillLimitOverride && formState.drillMaxRepeatDistance) ? (
                            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                              Drill max length:{" "}
                              <span className="font-medium text-slate-900">
                                {isSkillLimitOverride && formState.drillMaxRepeatDistance
                                  ? `${formState.drillMaxRepeatDistance}${formState.poolLengthUnit}`
                                  : profileDrillLimit?.maxRepeatDistanceLabel}
                              </span>
                              {isSkillLimitOverride && formState.drillMaxRepeatDistance
                                ? " for this session"
                                : " from Swim Profile"}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={formState.includeKick}
                          onChange={(event) => updateFormState("includeKick", event.target.checked)}
                          data-testid="session-generator-include-kick"
                        />
                        Include kick work
                      </label>
                      {formState.includeKick ? (
                        <div className="ml-6 grid gap-3 border-l border-slate-200 pl-4">
                          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="session-generator-kick-volume-mode"
                              checked={formState.kickVolumeMode === "coach_decides"}
                              onChange={() => updateFormState("kickVolumeMode", "coach_decides")}
                              data-testid="session-generator-kick-volume-coach"
                            />
                            Coach decides kick meters
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="session-generator-kick-volume-mode"
                              checked={formState.kickVolumeMode === "explicit"}
                              onChange={() => updateFormState("kickVolumeMode", "explicit")}
                              data-testid="session-generator-kick-volume-explicit"
                            />
                            Set kick distance
                          </label>
                          {formState.kickVolumeMode === "explicit" ? (
                            <div className="grid gap-3">
                              <label className="block text-sm text-slate-700">
                                Kick distance ({formState.poolLengthUnit})
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={formState.kickTargetMeters}
                                  onChange={(event) =>
                                    updateFormState("kickTargetMeters", event.target.value)
                                  }
                                  data-testid="session-generator-kick-meters"
                                  className="mt-2 block h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                              </label>
                              {profileKickLimitText ||
                              (isSkillLimitOverride && formState.kickIntervalMeters) ? (
                                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                  Kick max length:{" "}
                                  <span className="font-medium text-slate-900">
                                    {isSkillLimitOverride && formState.kickIntervalMeters
                                      ? `${formState.kickIntervalMeters}${formState.poolLengthUnit}`
                                      : profileKickLimit?.maxRepeatDistanceLabel}
                                  </span>
                                  {isSkillLimitOverride && formState.kickIntervalMeters
                                    ? " for this session"
                                    : " from Swim Profile"}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="grid gap-3 border-t border-slate-200 pt-3">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="radio"
                            name="session-generator-rest-mode"
                            checked={formState.restMode === "coach_decides"}
                            onChange={() => updateFormState("restMode", "coach_decides")}
                            data-testid="session-generator-rest-coach"
                          />
                          Coach decides rest
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="radio"
                            name="session-generator-rest-mode"
                            checked={formState.restMode === "explicit"}
                            onChange={() => updateFormState("restMode", "explicit")}
                            data-testid="session-generator-rest-explicit"
                          />
                          Set rest seconds
                        </label>
                        {formState.restMode === "explicit" ? (
                          <label className="block text-sm text-slate-700">
                            Rest seconds
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formState.restSeconds}
                              onChange={(event) =>
                                updateFormState("restSeconds", event.target.value)
                              }
                              data-testid="session-generator-rest-seconds"
                              className="mt-2 block h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                          </label>
                        ) : null}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
                    <legend className="px-1 text-sm font-semibold text-slate-900">
                      Select strokes
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {SESSION_GENERATOR_STROKES.map((stroke) => (
                        <label
                          key={stroke}
                          className="inline-flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={formState.allowedStrokes.includes(stroke)}
                            onChange={() => toggleStroke(stroke)}
                            data-testid={`session-generator-stroke-${stroke}`}
                          />
                          {getSessionStrokeLabel(stroke)}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
                    <legend className="px-1 text-sm font-semibold text-slate-900">
                      Select equipment
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {SESSION_GENERATOR_EQUIPMENT.map((item) => (
                        <label
                          key={item}
                          className="inline-flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={formState.equipmentAllowlist.includes(item)}
                            onChange={() => toggleEquipment(item)}
                            data-testid={`session-generator-equipment-${item}`}
                          />
                          {getSessionEquipmentLabel(item)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-600">
                  {draft
                    ? "Change settings here only when you want to regenerate the draft."
                    : "Generated draft will be editable."}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={generateDraft}
                    disabled={isGenerating}
                    data-testid="session-generator-generate"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating ? "Generating..." : draft ? "Regenerate" : "Generate session"}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {draft ? (
        <div className="border-t border-slate-200 pt-6">
          <WorkoutEditor
            draft={draft}
            savedWorkout={savedWorkout}
            recentWorkouts={[]}
            canonicalSaveReady={canonicalSaveReady}
            isSaving={isSaving}
            onSave={saveWorkout}
            hasUnsavedChanges={hasUnsavedChanges}
            onDraftChange={handleDraftChange}
            onDiscardChanges={discardDraftChanges}
            showDiscardUndoNotice={discardUndoDraft !== null}
            onUndoDiscardChanges={undoDiscardDraftChanges}
            copyVariant="generator"
            startNewDraftHref="/my-library/generator"
            startNewDraftLabel="Start a fresh AI session"
            loadedBannerTitle="Saved session loaded."
            loadedBannerDescription="Save changes below, or start a fresh session in the AI session generator when you want a brand-new version."
            recentWorkoutsDescription="Edit another saved session in the dedicated workout builder route."
            workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
          />
        </div>
      ) : null}
    </section>
  );
}
