"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import SessionGeneratorPanel from "@/components/my-library/generator/SessionGeneratorPanel";
import {
  GENERATOR_INTAKE_BLOCK_KEYS,
  buildGeneratorHandoffPayload,
  getDefaultGeneratorIntakeOverrides,
  getDefaultGeneratorIntakeSelection,
  normalizeGeneratorIntakeOverrides,
  normalizeGeneratorIntakeSelection,
  type GeneratorIntakeBlockKey,
  type GeneratorIntakeBlockSummary,
  type GeneratorIntakeOverrides,
  type GeneratorIntakeSelection,
  type GeneratorIntakeSnapshot,
} from "@/lib/generator-intake/shared";
import { TRAINING_SESSION_DURATION_OPTIONS } from "@/lib/athlete-profile/training-setup";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";
import type { WorkoutLibrarySnapshot } from "@/lib/workouts/shared";

type Props = {
  initialSnapshot: GeneratorIntakeSnapshot;
  userId: string;
  workoutLibrary: WorkoutLibrarySnapshot;
};

type ApiPayload = {
  ok?: boolean;
  error?: string;
  snapshot?: GeneratorIntakeSnapshot;
};

type StoredDraft = {
  sourceFingerprint: string;
  selection: GeneratorIntakeSelection;
  overrides: GeneratorIntakeOverrides;
};

type GeneratorSectionKey = "source" | "overrides" | "technical";

const STORAGE_KEY_PREFIX = "my-library-generator-intake-draft:";
const BLOCK_COPY_ORDER = [...GENERATOR_INTAKE_BLOCK_KEYS];

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function readDraft(key: string): StoredDraft | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDraft;
  } catch {
    return null;
  }
}

function writeDraft(key: string, value: StoredDraft) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function clearDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function serializeValue(value: unknown) {
  return JSON.stringify(value);
}

function buildBlockTone(block: GeneratorIntakeBlockSummary) {
  if (block.state === "available") {
    return {
      container: "border-emerald-200 bg-emerald-50/50",
      badge: "bg-emerald-100 text-emerald-800",
      label: "Available now",
    };
  }

  if (block.state === "syncing") {
    return {
      container: "border-amber-200 bg-amber-50/60",
      badge: "bg-amber-100 text-amber-800",
      label: "Syncing",
    };
  }

  if (block.state === "error") {
    return {
      container: "border-rose-200 bg-rose-50/70",
      badge: "bg-rose-100 text-rose-800",
      label: "Needs retry",
    };
  }

  return {
    container: "border-slate-200 bg-slate-50/70",
    badge: "bg-slate-200 text-slate-700",
    label: "Optional",
  };
}

function toBlockLabel(key: GeneratorIntakeBlockKey) {
  return key.replaceAll("_", " ");
}

export default function GeneratorIntakeHub({ initialSnapshot, userId, workoutLibrary }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [selection, setSelection] = useState<GeneratorIntakeSelection>(() =>
    getDefaultGeneratorIntakeSelection(initialSnapshot)
  );
  const [overrides, setOverrides] = useState<GeneratorIntakeOverrides>(() =>
    getDefaultGeneratorIntakeOverrides()
  );
  const [isClientReady, setIsClientReady] = useState(false);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [staleSourceWarning, setStaleSourceWarning] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastPreparedSignature, setLastPreparedSignature] = useState<string | null>(null);
  const [sectionOpen, setSectionOpen] = useState<Record<GeneratorSectionKey, boolean>>({
    source: false,
    overrides: false,
    technical: false,
  });

  const storageKey = getStorageKey(userId);
  const payload = buildGeneratorHandoffPayload(snapshot, selection, overrides, {
    createdAt: snapshot.loadedAt,
  });
  const payloadPreview = JSON.stringify(payload, null, 2);
  const payloadSignature = JSON.stringify(payload);
  const isPreparedCurrent = lastPreparedSignature === payloadSignature;
  const selectedBlockCount = payload.includedBlocks.length;
  const sourceSummary =
    selectedBlockCount > 0
      ? `${selectedBlockCount} block${selectedBlockCount === 1 ? "" : "s"} included`
      : "No saved blocks included";
  const overrideSummary =
    overrides.targetType === "program"
      ? payload.effectiveDefaults.sessionCount
        ? `${payload.effectiveDefaults.sessionCount} swim session${
            payload.effectiveDefaults.sessionCount === 1 ? "" : "s"
          } per week`
        : "Multi-session program"
      : "Single session";
  const technicalSummary = isPreparedCurrent
    ? "Prepared with current choices"
    : "Hidden by default";
  const hasActiveOverrides =
    Boolean(payload.overrides.desiredSessionCount) ||
    Boolean(payload.overrides.desiredSessionMinutes) ||
    Boolean(payload.overrides.focusText) ||
    Boolean(payload.overrides.constraintText) ||
    payload.overrides.targetType !== "session";

  useEffect(() => {
    setIsOnline(readNavigatorOnlineState());

    const fallbackSelection = getDefaultGeneratorIntakeSelection(initialSnapshot);
    const fallbackOverrides = getDefaultGeneratorIntakeOverrides();
    const storedDraft = readDraft(storageKey);
    const nextSelection = normalizeGeneratorIntakeSelection(
      initialSnapshot,
      storedDraft?.selection ?? fallbackSelection
    );
    const nextOverrides = normalizeGeneratorIntakeOverrides(
      storedDraft?.overrides ?? fallbackOverrides
    );
    const restored =
      serializeValue(nextSelection) !== serializeValue(fallbackSelection) ||
      serializeValue(nextOverrides) !== serializeValue(fallbackOverrides);

    setSelection(nextSelection);
    setOverrides(nextOverrides);
    setDraftRecovered(restored);
    setStaleSourceWarning(
      storedDraft && storedDraft.sourceFingerprint !== initialSnapshot.sourceFingerprint
        ? "Saved intake choices were restored from older My Library data. Review included blocks before continuing."
        : ""
    );
    setIsClientReady(true);

    function onOnline() {
      setIsOnline(true);
    }

    function onOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [initialSnapshot, storageKey]);

  useEffect(() => {
    if (!isClientReady) return;

    writeDraft(storageKey, {
      sourceFingerprint: snapshot.sourceFingerprint,
      selection,
      overrides,
    });
  }, [isClientReady, overrides, selection, snapshot.sourceFingerprint, storageKey]);

  async function parseError(response: Response, fallback: string) {
    const responseBody = (await response.json().catch(() => null)) as ApiPayload | null;
    return responseBody?.error || fallback;
  }

  async function refreshSnapshot() {
    if (!isOnline) {
      setActionError(
        "You are offline. Existing intake context stays visible, but refresh is paused."
      );
      return;
    }

    setIsRefreshing(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch("/api/my-library/generator-intake", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not refresh generator intake right now."));
        return;
      }

      const responseBody = (await response.json().catch(() => null)) as ApiPayload | null;
      if (!responseBody?.ok || !responseBody.snapshot) {
        setActionError("Could not refresh generator intake right now.");
        return;
      }

      const nextSnapshot = responseBody.snapshot;
      const nextSelection = normalizeGeneratorIntakeSelection(nextSnapshot, selection);
      const droppedBlocks = BLOCK_COPY_ORDER.filter(
        (key) => selection[key] && !nextSelection[key] && snapshot.blocks[key].available
      );

      setSnapshot(nextSnapshot);
      setSelection(nextSelection);
      setStaleSourceWarning(
        nextSnapshot.sourceFingerprint !== snapshot.sourceFingerprint
          ? droppedBlocks.length > 0
            ? `${droppedBlocks.map((key) => nextSnapshot.blocks[key].label).join(", ")} changed or became unavailable after refresh. Review the handoff before continuing.`
            : "Saved My Library context changed after refresh. Review included blocks before continuing."
          : ""
      );
      setActionSuccess("Generator intake refreshed.");
      void sendClientAnalyticsEvent("generator_intake_refreshed", {
        availableBlockCount: Object.values(nextSnapshot.blocks).filter((block) => block.available)
          .length,
        selectedBlockCount: Object.values(nextSelection).filter(Boolean).length,
      });
    } catch {
      setActionError("Could not refresh generator intake right now.");
    } finally {
      setIsRefreshing(false);
    }
  }

  function toggleBlock(blockKey: GeneratorIntakeBlockKey) {
    const block = snapshot.blocks[blockKey];
    if (!block.available) return;

    const nextSelection = {
      ...selection,
      [blockKey]: !selection[blockKey],
    };

    setSelection(nextSelection);
    setActionError("");
    setActionSuccess("");
    void sendClientAnalyticsEvent("generator_intake_block_toggled", {
      blockKey,
      included: nextSelection[blockKey],
      selectedBlockCount: Object.values(nextSelection).filter(Boolean).length,
    });
  }

  function updateOverride<K extends keyof GeneratorIntakeOverrides>(
    key: K,
    value: GeneratorIntakeOverrides[K]
  ) {
    setOverrides((current) =>
      normalizeGeneratorIntakeOverrides({
        ...current,
        [key]: value,
      })
    );
    setActionError("");
    setActionSuccess("");
  }

  function toggleSection(section: GeneratorSectionKey) {
    setSectionOpen((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function resetIntakeDraft() {
    clearDraft(storageKey);
    setSelection(getDefaultGeneratorIntakeSelection(snapshot));
    setOverrides(getDefaultGeneratorIntakeOverrides());
    setDraftRecovered(false);
    setStaleSourceWarning("");
    setActionError("");
    setActionSuccess("Generator intake draft reset.");
    setLastPreparedSignature(null);
  }

  function prepareHandoff() {
    setActionError("");
    setActionSuccess("Generator is ready for this run.");
    setLastPreparedSignature(payloadSignature);
    void sendClientAnalyticsEvent("generator_intake_handoff_prepared", {
      targetType: payload.overrides.targetType,
      selectedBlockCount,
      omittedBlockCount: payload.omittedBlocks.length,
      hasOverrides: hasActiveOverrides,
      hasConstraintText: Boolean(payload.overrides.constraintText),
      hasFocusOverride: Boolean(payload.overrides.focusText),
    });
  }

  return (
    <div
      data-testid="generator-intake-hub"
      data-client-ready={isClientReady ? "true" : "false"}
      className="space-y-6"
    >
      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Before you continue</h2>
            <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
              Review what to bring in from My Library, then choose any one-off settings for this
              run. Nothing here writes back into your saved records. Notes stay out of default
              generator prefill in v1.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshSnapshot}
              disabled={isRefreshing}
              data-testid="generator-intake-refresh"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh intake"}
            </button>
            <button
              type="button"
              onClick={resetIntakeDraft}
              data-testid="generator-intake-reset"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Reset draft
            </button>
          </div>
        </div>
      </section>

      {!isOnline ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            You are offline. Saved intake context stays visible, but refresh is paused until you
            reconnect.
          </p>
        </section>
      ) : null}

      {draftRecovered ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm text-emerald-900">
            Unsaved generator-intake choices were restored on this device.
          </p>
        </section>
      ) : null}

      {staleSourceWarning ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">{staleSourceWarning}</p>
        </section>
      ) : null}

      {actionError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{actionError}</p>
        </section>
      ) : null}

      {actionSuccess ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm text-emerald-900">{actionSuccess}</p>
        </section>
      ) : null}

      {snapshot.loadError ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">{snapshot.loadError}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Loaded from My Library</h2>
            <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
              Read-only information for this run. Open it when you want to review what is coming
              from your saved My Library data before generating anything.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              {sourceSummary}
            </p>
            <button
              type="button"
              onClick={() => toggleSection("source")}
              aria-expanded={sectionOpen.source}
              data-testid="generator-intake-source-toggle"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {sectionOpen.source ? "Hide details" : "Show details"}
            </button>
          </div>
        </div>

        {sectionOpen.source ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {BLOCK_COPY_ORDER.map((blockKey) => {
              const block = snapshot.blocks[blockKey];
              const tone = buildBlockTone(block);
              const checkboxId = `generator-intake-${blockKey}`;

              return (
                <article key={block.key} className={`rounded-2xl border p-4 ${tone.container}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        From My Library
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900">{block.label}</h3>
                      <p className="mt-2 text-sm text-slate-700">{block.description}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone.badge}`}
                    >
                      {tone.label}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-700">{block.summary}</p>

                  {block.missingReason ? (
                    <p className="mt-2 text-sm text-slate-600">{block.missingReason}</p>
                  ) : null}

                  {block.lastUpdatedAt ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Last updated: {block.lastUpdatedAt}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <label
                      htmlFor={checkboxId}
                      className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-900"
                    >
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={selection[blockKey]}
                        disabled={!block.available}
                        onChange={() => toggleBlock(blockKey)}
                        data-testid={`generator-intake-include-${blockKey}`}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      Include {toBlockLabel(blockKey)} for this run
                    </label>

                    <Link
                      href={block.manageHref}
                      className="text-sm font-medium text-blue-700 underline-offset-4 hover:underline"
                    >
                      {block.manageLabel}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Just this run</h2>
            <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
              These choices only affect this generator attempt. Use them when you want to steer this
              run without editing your saved My Library information.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              {overrideSummary}
            </p>
            <button
              type="button"
              onClick={() => toggleSection("overrides")}
              aria-expanded={sectionOpen.overrides}
              data-testid="generator-intake-overrides-toggle"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {sectionOpen.overrides ? "Hide choices" : "Show choices"}
            </button>
          </div>
        </div>

        {sectionOpen.overrides ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-900">
                  What do you want to generate?
                </legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="generator-target-type"
                      checked={overrides.targetType === "session"}
                      onChange={() => updateOverride("targetType", "session")}
                      data-testid="generator-intake-target-session"
                    />
                    Single session
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="generator-target-type"
                      checked={overrides.targetType === "program"}
                      onChange={() => updateOverride("targetType", "program")}
                      data-testid="generator-intake-target-program"
                    />
                    Multi-session program
                  </label>
                </div>
              </fieldset>

              {overrides.targetType === "program" ? (
                <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                  Swim sessions per week
                  <input
                    type="text"
                    inputMode="numeric"
                    value={overrides.desiredSessionCount}
                    onChange={(event) => updateOverride("desiredSessionCount", event.target.value)}
                    data-testid="generator-intake-session-count"
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Leave blank to use saved weekly preference later"
                  />
                </label>
              ) : null}

              <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                Desired session length
                <select
                  value={overrides.desiredSessionMinutes}
                  onChange={(event) => updateOverride("desiredSessionMinutes", event.target.value)}
                  data-testid="generator-intake-session-minutes"
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Use saved preference or leave open</option>
                  {TRAINING_SESSION_DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                Focus for this run
                <input
                  type="text"
                  value={overrides.focusText}
                  onChange={(event) => updateOverride("focusText", event.target.value)}
                  data-testid="generator-intake-focus-text"
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Example: Breathing timing under fatigue"
                />
              </label>
            </div>

            <label className="mt-4 block rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
              Constraints for this run
              <textarea
                value={overrides.constraintText}
                onChange={(event) => updateOverride("constraintText", event.target.value)}
                data-testid="generator-intake-constraint-text"
                rows={4}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Example: Keep total volume moderate and avoid heavy kick work."
              />
            </label>
          </>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Prepare the generator</h2>
            <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
              Lock this run to the saved information and one-off choices you want to use. The raw
              technical preview stays hidden unless you explicitly open it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              {technicalSummary}
            </p>
            <button
              type="button"
              onClick={() => toggleSection("technical")}
              aria-expanded={sectionOpen.technical}
              data-testid="generator-intake-technical-toggle"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {sectionOpen.technical ? "Hide technical preview" : "Show technical preview"}
            </button>
            <button
              type="button"
              onClick={prepareHandoff}
              data-testid="generator-intake-prepare"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
            >
              {isPreparedCurrent ? "Prepared for this run" : "Prepare generator"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Included blocks
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedBlockCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target type
            </p>
            <p className="mt-2 text-2xl font-semibold capitalize text-slate-900">
              {payload.overrides.targetType}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes prefill
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">Excluded</p>
          </div>
        </div>

        {!selectedBlockCount && !hasActiveOverrides ? (
          <p className="mt-4 text-sm text-slate-600">
            You can still prepare a near-empty handoff now, or go back and add saved profile, goals,
            or focus data before later generation.
          </p>
        ) : null}

        {lastPreparedSignature && !isPreparedCurrent ? (
          <p className="mt-4 text-sm text-amber-800">
            Intake choices changed after the last prepare action. Review them and prepare again
            before moving downstream.
          </p>
        ) : null}

        {sectionOpen.technical ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <pre
              data-testid="generator-intake-handoff-preview"
              className="max-h-[420px] overflow-auto px-4 py-4 text-xs leading-relaxed text-slate-100"
            >
              {payloadPreview}
            </pre>
          </div>
        ) : null}
      </section>

      <SessionGeneratorPanel
        payload={payload}
        selection={selection}
        overrides={overrides}
        handoffPrepared={isPreparedCurrent}
        workoutLibrary={workoutLibrary}
      />
    </div>
  );
}
