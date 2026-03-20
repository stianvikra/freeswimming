"use client";

import { useEffect, useMemo, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import type {
  GeneratorIntakeHandoffPayload,
  GeneratorIntakeOverrides,
  GeneratorIntakeSelection,
} from "@/lib/generator-intake/shared";
import {
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_DURATION_MODES,
  SESSION_GENERATOR_EFFORT_PRESETS,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_POOL_LENGTHS,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_STROKES,
  buildSessionTargetSummary,
  computeSessionDraftDerivedTotals,
  formatPoolLengthLabel,
  getDefaultSessionGeneratorFormState,
  getSessionEffortLabel,
  getSessionEnvironmentLabel,
  getSessionEquipmentLabel,
  getSessionStepCategoryLabel,
  getSessionStrokeLabel,
  getSessionTypeLabel,
  normalizeSessionGeneratorFormState,
  type SessionDraft,
  type SessionDraftApiResponse,
  type SessionDraftStep,
  type SessionDraftStepCategory,
  type SessionDraftStepDurationMode,
  type SessionGeneratorEquipment,
  type SessionGeneratorEnvironment,
  type SessionGeneratorFormState,
  type SessionGeneratorPoolLength,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";

type Props = {
  payload: GeneratorIntakeHandoffPayload;
  selection: GeneratorIntakeSelection;
  overrides: GeneratorIntakeOverrides;
  handoffPrepared: boolean;
};

function buildBlankStep(index: number): SessionDraftStep {
  return {
    id: `step-${Date.now()}-${index}`,
    category: "main",
    name: "Custom step",
    stroke: "choice",
    intensity: "moderate",
    durationMode: "distance",
    distanceM: 100,
    timeMin: null,
    targetSummary: "",
    notes: "",
  };
}

function parsePositiveNumber(value: string) {
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export default function SessionGeneratorPanel({
  payload,
  selection,
  overrides,
  handoffPrepared,
}: Props) {
  const [formState, setFormState] = useState<SessionGeneratorFormState>(() =>
    getDefaultSessionGeneratorFormState(payload)
  );
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setFormState(getDefaultSessionGeneratorFormState(payload));
    setDraft(null);
    setError("");
    setSuccess("");
  }, [payload]);

  const sessionReady = payload.overrides.targetType === "session" && handoffPrepared;
  const draftTotals = useMemo(
    () => (draft ? computeSessionDraftDerivedTotals(draft) : null),
    [draft]
  );

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
    setIsGenerating(true);
    setError("");
    setSuccess("");

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
      setSuccess(
        "Session draft generated. Review and edit it locally before later save/accept work lands."
      );
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

  function updateDraft<K extends keyof SessionDraft>(key: K, value: SessionDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setSuccess("");
  }

  function updateDraftStep(stepId: string, updater: (step: SessionDraftStep) => SessionDraftStep) {
    setDraft((current) =>
      current
        ? {
            ...current,
            steps: current.steps.map((step) => (step.id === stepId ? updater(step) : step)),
          }
        : current
    );
    setSuccess("");
  }

  function moveStep(stepId: string, direction: -1 | 1) {
    setDraft((current) => {
      if (!current) return current;
      const index = current.steps.findIndex((step) => step.id === stepId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.steps.length) return current;
      const nextSteps = [...current.steps];
      const [step] = nextSteps.splice(index, 1);
      nextSteps.splice(nextIndex, 0, step);
      return {
        ...current,
        steps: nextSteps,
      };
    });
  }

  function addStep() {
    setDraft((current) =>
      current
        ? {
            ...current,
            steps: [...current.steps, buildBlankStep(current.steps.length + 1)],
          }
        : current
    );
  }

  function removeStep(stepId: string) {
    setDraft((current) =>
      current
        ? {
            ...current,
            steps: current.steps.filter((step) => step.id !== stepId),
          }
        : current
    );
  }

  function toggleDraftStroke(stroke: SessionGeneratorStroke) {
    if (!draft) return;
    const exists = draft.allowedStrokes.includes(stroke);
    updateDraft(
      "allowedStrokes",
      exists
        ? draft.allowedStrokes.filter((value) => value !== stroke)
        : [...draft.allowedStrokes, stroke]
    );
  }

  function toggleDraftEquipment(item: SessionGeneratorEquipment) {
    if (!draft) return;
    const exists = draft.equipmentAllowlist.includes(item);
    updateDraft(
      "equipmentAllowlist",
      exists
        ? draft.equipmentAllowlist.filter((value) => value !== item)
        : [...draft.equipmentAllowlist, item]
    );
  }

  return (
    <section
      data-testid="session-generator-panel"
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Session draft generator</h2>
          <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
            Build one Garmin-familiar swim-session draft from the prepared intake handoff, then edit
            the entire draft locally before later save and builder handoff work lands.
          </p>
        </div>
        <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Session only
        </p>
      </div>

      {payload.overrides.targetType === "program" ? (
        <div
          data-testid="session-generator-program-deferred"
          className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4"
        >
          <p className="text-sm text-amber-900">
            Program generation stays deferred for now. Switch the generator target back to
            <span className="font-semibold"> Single session </span>
            to draft one workout in this slice.
          </p>
        </div>
      ) : null}

      {payload.overrides.targetType === "session" && !handoffPrepared ? (
        <div
          data-testid="session-generator-prepare-needed"
          className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/80 p-4"
        >
          <p className="text-sm text-blue-900">
            Prepare the deterministic handoff above before generating a session draft, so this run
            uses the exact saved profile, goal, and focus context you just reviewed.
          </p>
        </div>
      ) : null}

      {sessionReady ? (
        <>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Goal context
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {payload.source.openGoals[0]?.title ?? "No goal included"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Focus context
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {payload.overrides.focusText ?? payload.source.activeFocus?.title ?? "No focus cue"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                CSS anchor
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {payload.source.cssMetric?.paceLabel
                  ? `${payload.source.cssMetric.paceLabel}/100m`
                  : "Fallback pace guidance"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
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
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {SESSION_GENERATOR_SESSION_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {getSessionTypeLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
              Effort
              <select
                value={formState.effort}
                onChange={(event) =>
                  updateFormState(
                    "effort",
                    event.target.value as SessionGeneratorFormState["effort"]
                  )
                }
                data-testid="session-generator-effort"
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {SESSION_GENERATOR_EFFORT_PRESETS.map((value) => (
                  <option key={value} value={value}>
                    {getSessionEffortLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">Environment</legend>
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
              <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                Pool length
                <select
                  value={formState.poolLengthM}
                  onChange={(event) => updateFormState("poolLengthM", event.target.value)}
                  data-testid="session-generator-pool-length"
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {SESSION_GENERATOR_POOL_LENGTHS.map((value) => (
                    <option key={value} value={String(value)}>
                      {formatPoolLengthLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">Session size</legend>
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
                  Estimated time
                </label>
              </div>

              {formState.sizeMode === "distance" ? (
                <label className="mt-4 block text-sm text-slate-700">
                  Target distance (m)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formState.targetDistanceM}
                    onChange={(event) => updateFormState("targetDistanceM", event.target.value)}
                    data-testid="session-generator-target-distance"
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              ) : (
                <label className="mt-4 block text-sm text-slate-700">
                  Estimated duration (min)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formState.targetTimeMin}
                    onChange={(event) => updateFormState("targetTimeMin", event.target.value)}
                    data-testid="session-generator-target-time"
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              )}
            </fieldset>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">
                Optional structure
              </legend>
              <div className="mt-3 flex flex-col gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.includeDrills}
                    onChange={(event) => updateFormState("includeDrills", event.target.checked)}
                    data-testid="session-generator-include-drills"
                  />
                  Include drills
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.includeKick}
                    onChange={(event) => updateFormState("includeKick", event.target.checked)}
                    data-testid="session-generator-include-kick"
                  />
                  Include kick work
                </label>
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
              <legend className="px-1 text-sm font-semibold text-slate-900">Allowed strokes</legend>
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

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
              <legend className="px-1 text-sm font-semibold text-slate-900">
                Allowed equipment
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

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Drafts stay local in this slice. They do not save or overwrite a canonical workout
              yet.
            </p>
            <button
              type="button"
              onClick={generateDraft}
              disabled={isGenerating}
              data-testid="session-generator-generate"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating
                ? "Generating..."
                : draft
                  ? "Regenerate draft"
                  : "Generate session draft"}
            </button>
          </div>
        </>
      ) : null}

      {draft ? (
        <div className="mt-6 space-y-5 border-t border-slate-200 pt-6">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
            <p className="text-sm text-blue-900">
              Draft only: review and edit everything below. Save/accept into the shared workout
              editor lands in a later slice once canonical workout entities exist.
            </p>
          </div>

          {draft.warnings.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <ul className="space-y-2 text-sm text-amber-900">
                {draft.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Draft</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Session
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {buildSessionTargetSummary({
                  ...draft,
                  totalDistanceM: draftTotals?.totalDistanceM ?? draft.totalDistanceM,
                  estimatedDurationMin:
                    draftTotals?.estimatedDurationMin ?? draft.estimatedDurationMin,
                })}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Context
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {draft.goalTitle ?? draft.focusText ?? "Session-only request"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-900">Title suggestions</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.titleSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => updateDraft("title", suggestion)}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
              Draft title
              <input
                type="text"
                value={draft.title}
                onChange={(event) => updateDraft("title", event.target.value)}
                data-testid="session-draft-title"
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
              Session type
              <select
                value={draft.sessionType}
                onChange={(event) =>
                  updateDraft("sessionType", event.target.value as SessionDraft["sessionType"])
                }
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {SESSION_GENERATOR_SESSION_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {getSessionTypeLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700 md:col-span-2">
              Draft description
              <textarea
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
                data-testid="session-draft-description"
                rows={4}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">Environment</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {SESSION_GENERATOR_ENVIRONMENTS.map((value) => (
                  <label
                    key={value}
                    className="inline-flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="radio"
                      name="session-draft-environment"
                      checked={draft.environment === value}
                      onChange={() =>
                        updateDraft("environment", value as SessionGeneratorEnvironment)
                      }
                    />
                    {getSessionEnvironmentLabel(value)}
                  </label>
                ))}
              </div>
            </fieldset>

            {draft.environment === "pool" ? (
              <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                Pool length
                <select
                  value={draft.poolLengthM ? String(draft.poolLengthM) : ""}
                  onChange={(event) =>
                    updateDraft(
                      "poolLengthM",
                      (parsePositiveNumber(
                        event.target.value
                      ) as SessionGeneratorPoolLength | null) ?? null
                    )
                  }
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {SESSION_GENERATOR_POOL_LENGTHS.map((value) => (
                    <option key={value} value={String(value)}>
                      {formatPoolLengthLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
              Effort
              <select
                value={draft.effort}
                onChange={(event) =>
                  updateDraft("effort", event.target.value as SessionDraft["effort"])
                }
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {SESSION_GENERATOR_EFFORT_PRESETS.map((value) => (
                  <option key={value} value={value}>
                    {getSessionEffortLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
              <legend className="px-1 text-sm font-semibold text-slate-900">Session strokes</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {SESSION_GENERATOR_STROKES.map((stroke) => (
                  <label
                    key={stroke}
                    className="inline-flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={draft.allowedStrokes.includes(stroke)}
                      onChange={() => toggleDraftStroke(stroke)}
                    />
                    {getSessionStrokeLabel(stroke)}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
              <legend className="px-1 text-sm font-semibold text-slate-900">Equipment</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {SESSION_GENERATOR_EQUIPMENT.map((item) => (
                  <label
                    key={item}
                    className="inline-flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={draft.equipmentAllowlist.includes(item)}
                      onChange={() => toggleDraftEquipment(item)}
                    />
                    {getSessionEquipmentLabel(item)}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">Editable draft steps</h3>
              <button
                type="button"
                onClick={addStep}
                data-testid="session-draft-add-step"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Add step
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {draft.steps.map((step, index) => (
                <article
                  key={step.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {getSessionStepCategoryLabel(step.category)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveStep(step.id, -1)}
                        disabled={index === 0}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(step.id, 1)}
                        disabled={index === draft.steps.length - 1}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm text-rose-700 transition hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="text-sm text-slate-700">
                      Step name
                      <input
                        type="text"
                        value={step.name}
                        onChange={(event) =>
                          updateDraftStep(step.id, (current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        data-testid={`session-draft-step-name-${index}`}
                        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </label>

                    <label className="text-sm text-slate-700">
                      Category
                      <select
                        value={step.category}
                        onChange={(event) =>
                          updateDraftStep(step.id, (current) => ({
                            ...current,
                            category: event.target.value as SessionDraftStepCategory,
                          }))
                        }
                        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        {SESSION_DRAFT_STEP_CATEGORIES.map((value) => (
                          <option key={value} value={value}>
                            {getSessionStepCategoryLabel(value)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-slate-700">
                      Stroke
                      <select
                        value={step.stroke}
                        onChange={(event) =>
                          updateDraftStep(step.id, (current) => ({
                            ...current,
                            stroke: event.target.value as SessionDraftStep["stroke"],
                          }))
                        }
                        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="choice">Stroke choice</option>
                        {SESSION_GENERATOR_STROKES.map((value) => (
                          <option key={value} value={value}>
                            {getSessionStrokeLabel(value)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-slate-700">
                      Intensity
                      <select
                        value={step.intensity}
                        onChange={(event) =>
                          updateDraftStep(step.id, (current) => ({
                            ...current,
                            intensity: event.target.value as SessionDraft["effort"],
                          }))
                        }
                        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        {SESSION_GENERATOR_EFFORT_PRESETS.map((value) => (
                          <option key={value} value={value}>
                            {getSessionEffortLabel(value)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-slate-700">
                      Duration mode
                      <select
                        value={step.durationMode}
                        onChange={(event) =>
                          updateDraftStep(step.id, (current) => ({
                            ...current,
                            durationMode: event.target.value as SessionDraftStepDurationMode,
                            distanceM:
                              event.target.value === "distance" ? (current.distanceM ?? 100) : null,
                            timeMin: event.target.value === "time" ? (current.timeMin ?? 10) : null,
                          }))
                        }
                        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        {SESSION_DRAFT_STEP_DURATION_MODES.map((value) => (
                          <option key={value} value={value}>
                            {value === "distance" ? "Distance" : "Time"}
                          </option>
                        ))}
                      </select>
                    </label>

                    {step.durationMode === "distance" ? (
                      <label className="text-sm text-slate-700">
                        Distance (m)
                        <input
                          type="text"
                          inputMode="numeric"
                          value={step.distanceM ?? ""}
                          onChange={(event) =>
                            updateDraftStep(step.id, (current) => ({
                              ...current,
                              distanceM: parsePositiveNumber(event.target.value),
                            }))
                          }
                          className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </label>
                    ) : (
                      <label className="text-sm text-slate-700">
                        Time (min)
                        <input
                          type="text"
                          inputMode="numeric"
                          value={step.timeMin ?? ""}
                          onChange={(event) =>
                            updateDraftStep(step.id, (current) => ({
                              ...current,
                              timeMin: parsePositiveNumber(event.target.value),
                            }))
                          }
                          className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </label>
                    )}

                    <label className="text-sm text-slate-700 md:col-span-2">
                      Target summary
                      <input
                        type="text"
                        value={step.targetSummary}
                        onChange={(event) =>
                          updateDraftStep(step.id, (current) => ({
                            ...current,
                            targetSummary: event.target.value,
                          }))
                        }
                        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </label>

                    <label className="text-sm text-slate-700 md:col-span-2">
                      Notes
                      <textarea
                        value={step.notes}
                        onChange={(event) =>
                          updateDraftStep(step.id, (current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        rows={3}
                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <pre
              data-testid="session-generator-draft-preview"
              className="max-h-[420px] overflow-auto px-4 py-4 text-xs leading-relaxed text-slate-100"
            >
              {JSON.stringify(
                {
                  ...draft,
                  totalDistanceM: draftTotals?.totalDistanceM ?? draft.totalDistanceM,
                  estimatedDurationMin:
                    draftTotals?.estimatedDurationMin ?? draft.estimatedDurationMin,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
