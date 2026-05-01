"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import SessionGeneratorPanel from "@/components/my-library/generator/SessionGeneratorPanel";
import {
  GENERATOR_INTAKE_BLOCK_KEYS,
  buildGeneratorHandoffPayload,
  getDefaultGeneratorIntakeSelection,
  normalizeGeneratorIntakeOverrides,
  normalizeGeneratorIntakeSelection,
  type GeneratorIntakeHandoffPayload,
  type GeneratorIntakeOverrides,
  type GeneratorIntakeBlockKey,
  type GeneratorIntakeBlockSummary,
  type GeneratorIntakeSelection,
  type GeneratorIntakeSnapshot,
} from "@/lib/generator-intake/shared";
import type { WorkoutLibrarySnapshot } from "@/lib/workouts/shared";

type Props = {
  initialSnapshot: GeneratorIntakeSnapshot;
  userId: string;
  workoutLibrary: WorkoutLibrarySnapshot;
};

type StoredDraft = {
  sourceFingerprint: string;
  selection: GeneratorIntakeSelection;
  overrides: GeneratorIntakeOverrides;
};

const STORAGE_KEY_PREFIX = "my-library-generator-intake-draft:";
const BLOCK_COPY_ORDER = [...GENERATOR_INTAKE_BLOCK_KEYS];
type SessionOnlyOverrideKey = "focusText" | "constraintText";

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

function normalizeSessionOnlyOverrides(overrides: StoredDraft["overrides"] | null | undefined) {
  const normalized = normalizeGeneratorIntakeOverrides(overrides);
  return {
    ...normalized,
    targetType: "session" as const,
    desiredSessionCount: "",
  };
}

export default function GeneratorIntakeHub({ initialSnapshot, userId, workoutLibrary }: Props) {
  const snapshot = initialSnapshot;
  const [selection, setSelection] = useState<GeneratorIntakeSelection>(() =>
    getDefaultGeneratorIntakeSelection(initialSnapshot)
  );
  const [overrides, setOverrides] = useState(() => normalizeSessionOnlyOverrides(null));
  const [isClientReady, setIsClientReady] = useState(false);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [staleSourceWarning, setStaleSourceWarning] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);

  const storageKey = getStorageKey(userId);
  const payload = useMemo(
    () =>
      buildGeneratorHandoffPayload(initialSnapshot, selection, overrides, {
        createdAt: initialSnapshot.loadedAt,
      }),
    [initialSnapshot, selection, overrides]
  );
  const swimProfileContext = buildSwimProfileContextRows(payload, selection);
  const selectedBlockCount = payload.includedBlocks.length;
  const sourceSummary =
    selectedBlockCount > 0
      ? `${selectedBlockCount} context section${selectedBlockCount === 1 ? "" : "s"} included`
      : "No context sections included";

  // Restoring unsaved generator choices must happen after hydration because the
  // server render cannot read localStorage for this private My Library flow.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const fallbackSelection = getDefaultGeneratorIntakeSelection(initialSnapshot);
    const fallbackOverrides = normalizeSessionOnlyOverrides(null);
    const storedDraft = readDraft(storageKey);
    const nextSelection = normalizeGeneratorIntakeSelection(
      initialSnapshot,
      storedDraft?.selection ?? fallbackSelection
    );
    const nextOverrides = normalizeSessionOnlyOverrides(
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
        ? "Saved generator choices were restored from older My Library data. Review the included sections before you continue."
        : ""
    );
    setIsClientReady(true);
  }, [initialSnapshot, storageKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isClientReady) return;

    writeDraft(storageKey, {
      sourceFingerprint: initialSnapshot.sourceFingerprint,
      selection,
      overrides,
    });
  }, [initialSnapshot.sourceFingerprint, isClientReady, overrides, selection, storageKey]);

  function toggleBlock(blockKey: GeneratorIntakeBlockKey) {
    const block = snapshot.blocks[blockKey];
    if (!block.available) return;

    const nextSelection = {
      ...selection,
      [blockKey]: !selection[blockKey],
    };

    setSelection(nextSelection);
    void sendClientAnalyticsEvent("generator_intake_block_toggled", {
      blockKey,
      included: nextSelection[blockKey],
      selectedBlockCount: Object.values(nextSelection).filter(Boolean).length,
    });
  }

  function updateOverride(key: SessionOnlyOverrideKey, value: string) {
    setOverrides((current) =>
      normalizeSessionOnlyOverrides({
        ...current,
        [key]: value,
      })
    );
  }

  function toggleSourceSection() {
    setSourceOpen((current) => !current);
  }

  function resetSessionOverrides() {
    setOverrides(normalizeSessionOnlyOverrides(null));
  }

  return (
    <div
      data-testid="generator-intake-hub"
      data-client-ready={isClientReady ? "true" : "false"}
      className="space-y-6"
    >
      {draftRecovered ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm text-emerald-900">
            Your unsaved AI session generator choices were restored on this device.
          </p>
        </section>
      ) : null}

      {staleSourceWarning ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">{staleSourceWarning}</p>
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
            <h2 className="text-lg font-semibold text-slate-900">
              Include data from your Swim Profile
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700 uppercase">
              {sourceSummary}
            </p>
            <button
              type="button"
              onClick={toggleSourceSection}
              aria-expanded={sourceOpen}
              data-testid="generator-intake-source-toggle"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {sourceOpen ? "Hide choices" : "Choose data"}
            </button>
          </div>
        </div>

        <dl
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="session-generator-swim-profile-context"
        >
          {swimProfileContext.map((row) => (
            <div key={row.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <dt className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <span>{row.label}</span>
                <span
                  className={
                    row.included
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800"
                      : "rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600"
                  }
                >
                  {row.included ? "Included" : "Off"}
                </span>
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{row.value}</dd>
            </div>
          ))}
        </dl>

        {sourceOpen ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {BLOCK_COPY_ORDER.map((blockKey) => {
              const block = snapshot.blocks[blockKey];
              const tone = buildBlockTone(block);
              const checkboxId = `generator-intake-${blockKey}`;

              return (
                <article key={block.key} className={`rounded-2xl border p-4 ${tone.container}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="mt-1 text-base font-semibold text-slate-900">{block.label}</h3>
                      <p className="mt-2 text-sm text-slate-700">{block.description}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${tone.badge}`}
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
                      Use {toBlockLabel(blockKey)} for this generation
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

      <SessionGeneratorPanel
        payload={payload}
        selection={selection}
        overrides={overrides}
        onOverrideChange={updateOverride}
        onResetOverrides={resetSessionOverrides}
        workoutLibrary={workoutLibrary}
      />
    </div>
  );
}

function buildSwimProfileContextRows(
  payload: GeneratorIntakeHandoffPayload,
  selection: GeneratorIntakeSelection
) {
  const record400 = payload.source.personalRecords.find((record) => record.distanceM === 400);
  const record1000 = payload.source.personalRecords.find((record) => record.distanceM === 1000);

  return [
    {
      label: "Swimmer",
      value:
        payload.source.profile?.primaryName ??
        payload.source.profile?.displayName ??
        "No profile name",
      included: selection.profile && Boolean(payload.source.profile),
    },
    {
      label: "400m test",
      value: record400 ? `${record400.timeLabel} ${record400.strokeLabel}` : "Not saved",
      included: selection.personal_records && Boolean(record400),
    },
    {
      label: "CSS",
      value: payload.source.cssMetric?.paceLabel
        ? `${payload.source.cssMetric.paceLabel}/100m`
        : "Not saved",
      included: selection.css && Boolean(payload.source.cssMetric),
    },
    {
      label: "1000m test",
      value: record1000 ? `${record1000.timeLabel} ${record1000.strokeLabel}` : "Not saved",
      included: selection.personal_records && Boolean(record1000),
    },
    {
      label: "Pool default",
      value: payload.source.preferences?.poolLengthLabel ?? "No saved pool length",
      included: selection.preferences && Boolean(payload.source.preferences?.poolLengthLabel),
    },
    {
      label: "Session length",
      value: payload.source.preferences?.preferredSessionMinutesLabel ?? "No saved preference",
      included:
        selection.preferences && Boolean(payload.source.preferences?.preferredSessionMinutesLabel),
    },
    {
      label: "Active focus",
      value: payload.source.activeFocus?.title ?? "No active focus",
      included: selection.focus && Boolean(payload.source.activeFocus),
    },
    {
      label: "Open goal",
      value: payload.source.openGoals[0]?.title ?? "No open goal",
      included: selection.goals && payload.source.openGoals.length > 0,
    },
  ];
}
