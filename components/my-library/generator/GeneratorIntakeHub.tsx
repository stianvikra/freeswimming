"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import GeneratorFeedback from "@/components/my-library/generator/GeneratorFeedback";
import SessionGeneratorPanel from "@/components/my-library/generator/SessionGeneratorPanel";
import {
  buildGeneratorHandoffPayload,
  getDefaultGeneratorIntakeSelection,
  normalizeGeneratorIntakeOverrides,
  normalizeGeneratorIntakeSelection,
  type GeneratorIntakeHandoffPayload,
  type GeneratorIntakeOverrides,
  type GeneratorIntakeBlockKey,
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
type SessionOnlyOverrideKey = "focusText" | "constraintText";
type SwimProfileDataStatus = "Included" | "Excluded" | "Not in Swim Profile" | "Unavailable";

type SwimProfileDataRow = {
  key: GeneratorIntakeBlockKey;
  label: string;
  status: SwimProfileDataStatus;
  summary: string;
  manageHref: string;
  actionLabel: "Add" | "Edit";
};

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

function buildStatusTone(status: SwimProfileDataStatus) {
  if (status === "Included") {
    return {
      badge: "bg-emerald-100 text-emerald-800",
    };
  }

  if (status === "Unavailable") {
    return {
      badge: "bg-amber-100 text-amber-800",
    };
  }

  return {
    badge: "bg-slate-200 text-slate-700",
  };
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
  const swimProfileDataRows = buildSwimProfileDataRows(snapshot, payload, selection);
  const availableRowCount = swimProfileDataRows.filter(
    (row) => row.status === "Included" || row.status === "Excluded"
  ).length;
  const includedRows = swimProfileDataRows.filter((row) => row.status === "Included");
  const excludedRows = swimProfileDataRows.filter((row) => row.status === "Excluded");
  const unavailableRows = swimProfileDataRows.filter(
    (row) => row.status === "Not in Swim Profile" || row.status === "Unavailable"
  );
  const sourceSummary =
    availableRowCount === 0
      ? "No profile data"
      : includedRows.length === availableRowCount
        ? "All included"
        : `${includedRows.length}/${availableRowCount} included`;

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

  function resetRecoveredDraft() {
    const fallbackSelection = getDefaultGeneratorIntakeSelection(initialSnapshot);
    const fallbackOverrides = normalizeSessionOnlyOverrides(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setSelection(fallbackSelection);
    setOverrides(fallbackOverrides);
    setDraftRecovered(false);
    setStaleSourceWarning("");
  }

  return (
    <div
      data-testid="generator-intake-hub"
      data-client-ready={isClientReady ? "true" : "false"}
      className="space-y-6"
    >
      {draftRecovered ? (
        <GeneratorFeedback
          tone="success"
          testId="generator-intake-draft-recovered"
          action={
            <button
              type="button"
              onClick={resetRecoveredDraft}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-900 transition hover:bg-emerald-50"
            >
              Reset
            </button>
          }
        >
          <div>
            <p className="text-sm font-medium text-emerald-950">
              Generator draft settings restored.
            </p>
            <p className="text-xs text-emerald-900">Saved locally in this browser.</p>
          </div>
        </GeneratorFeedback>
      ) : null}

      {staleSourceWarning ? (
        <GeneratorFeedback tone="warning" testId="generator-intake-stale-source-warning">
          <p className="text-sm text-amber-900">{staleSourceWarning}</p>
        </GeneratorFeedback>
      ) : null}

      {snapshot.loadError ? (
        <GeneratorFeedback tone="error" testId="generator-intake-load-error">
          <p className="text-sm text-rose-900">{snapshot.loadError}</p>
        </GeneratorFeedback>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Use Swim Profile data</h2>
            {sourceOpen ? (
              <p className="mt-1 text-sm text-slate-600">Choose what this session can use.</p>
            ) : null}
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
              {sourceOpen ? "Done" : "Change"}
            </button>
          </div>
        </div>

        <div className="mt-5" data-testid="session-generator-swim-profile-context">
          {sourceOpen ? (
            <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/70">
              {swimProfileDataRows.map((row) => {
                const tone = buildStatusTone(row.status);
                const checkboxId = `generator-intake-${row.key}`;
                const block = snapshot.blocks[row.key];

                return (
                  <li
                    key={row.key}
                    className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={selection[row.key]}
                        disabled={!block.available}
                        onChange={() => toggleBlock(row.key)}
                        data-testid={`generator-intake-include-${row.key}`}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <label htmlFor={checkboxId} className="min-w-0 cursor-pointer">
                        <span className="block text-sm font-semibold text-slate-900">
                          {row.label}
                        </span>
                        <span className="mt-1 block text-sm text-slate-600">{row.summary}</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3 pl-7 sm:pl-0">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase ${tone.badge}`}
                      >
                        {row.status}
                      </span>
                      <Link
                        href={row.manageHref}
                        aria-label={`${row.actionLabel} ${row.label}`}
                        className="text-sm font-medium text-blue-700 underline-offset-4 hover:underline"
                      >
                        {row.actionLabel}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <SwimProfileDataCollapsedSummary
              includedRows={includedRows}
              unavailableRows={unavailableRows}
              excludedRows={excludedRows}
            />
          )}
        </div>
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

function SwimProfileDataCollapsedSummary({
  includedRows,
  unavailableRows,
  excludedRows,
}: {
  includedRows: SwimProfileDataRow[];
  unavailableRows: SwimProfileDataRow[];
  excludedRows: SwimProfileDataRow[];
}) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
      data-testid="generator-intake-profile-summary"
    >
      <SwimProfileSummaryRow
        title="Included"
        rows={includedRows}
        emptyLabel="None included"
        tone="included"
      />
      {unavailableRows.length > 0 ? (
        <SwimProfileSummaryRow
          title="Not in Swim Profile"
          rows={unavailableRows}
          emptyLabel="None"
          tone="missing"
        />
      ) : null}
      {excludedRows.length > 0 ? (
        <SwimProfileSummaryRow
          title="Excluded"
          rows={excludedRows}
          emptyLabel="None excluded"
          tone="excluded"
        />
      ) : null}
    </div>
  );
}

function SwimProfileSummaryRow({
  title,
  rows,
  emptyLabel,
  tone,
}: {
  title: string;
  rows: SwimProfileDataRow[];
  emptyLabel: string;
  tone: "included" | "missing" | "excluded";
}) {
  const chipClasses =
    tone === "included"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "missing"
        ? "border-slate-200 bg-white text-slate-700"
        : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div className="grid gap-2 border-b border-slate-200 py-3 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start">
      <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{title}</h3>
      {rows.length > 0 ? (
        <ul className="flex min-w-0 flex-wrap gap-2">
          {rows.map((row) => (
            <li key={row.key}>
              <span
                className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-sm font-medium ${chipClasses}`}
              >
                {row.label}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      )}
    </div>
  );
}

function buildSwimProfileDataRows(
  snapshot: GeneratorIntakeSnapshot,
  payload: GeneratorIntakeHandoffPayload,
  selection: GeneratorIntakeSelection
): SwimProfileDataRow[] {
  const record400 = payload.source.personalRecords.find((record) => record.distanceM === 400);
  const record1000 = payload.source.personalRecords.find((record) => record.distanceM === 1000);
  const personalRecordsSummary =
    snapshot.blocks.personal_records.available && snapshot.blocks.personal_records.summary
      ? snapshot.blocks.personal_records.summary
      : [
          record400 ? `400m ${record400.timeLabel} ${record400.strokeLabel}` : null,
          record1000 ? `1000m ${record1000.timeLabel} ${record1000.strokeLabel}` : null,
        ]
          .filter(Boolean)
          .join(" · ");
  const preferences = payload.source.preferences ?? snapshot.preferences;
  const cssMetric = payload.source.cssMetric ?? snapshot.cssMetric;
  const goals = payload.source.openGoals.length > 0 ? payload.source.openGoals : snapshot.openGoals;
  const limits =
    payload.source.swimCapabilityLimits.length > 0
      ? payload.source.swimCapabilityLimits
      : snapshot.swimCapabilityLimits;

  return buildRowsFromDefinitions(
    [
      {
        key: "preferences" as const,
        label: "Training preferences",
        summary:
          [preferences?.poolLengthLabel, preferences?.preferredSessionMinutesLabel]
            .filter(Boolean)
            .join(" · ") || "Not in Swim Profile",
        manageHref: "/my-library/profile",
      },
      {
        key: "css" as const,
        label: "CSS pace",
        summary: cssMetric?.paceLabel ? `${cssMetric.paceLabel}/100m` : "Not in Swim Profile",
        manageHref: "/my-library/profile",
      },
      {
        key: "personal_records" as const,
        label: "Best times",
        summary: personalRecordsSummary || "Not in Swim Profile",
        manageHref: "/my-library/profile",
      },
      {
        key: "goals" as const,
        label: "Goals",
        summary: goals[0]?.title ?? "Not in Swim Profile",
        manageHref: "/my-library/goals",
      },
      {
        key: "capability_limits" as const,
        label: "Stroke and skill limits",
        summary:
          limits.length > 0 ? snapshot.blocks.capability_limits.summary : "Not in Swim Profile",
        manageHref: "/my-library/profile",
      },
    ],
    snapshot,
    selection
  );
}

function buildRowsFromDefinitions(
  rows: Array<
    Pick<SwimProfileDataRow, "key" | "label" | "manageHref"> & {
      summary: string;
    }
  >,
  snapshot: GeneratorIntakeSnapshot,
  selection: GeneratorIntakeSelection
): SwimProfileDataRow[] {
  return rows.map((row) => {
    const block = snapshot.blocks[row.key];
    const status = resolveDataRowStatus(row.key, snapshot, selection);
    const isAddAction = status === "Not in Swim Profile";

    return {
      ...row,
      status,
      summary: block.available ? row.summary : (block.missingReason ?? "Not in Swim Profile"),
      actionLabel: isAddAction ? "Add" : "Edit",
    };
  });
}

function resolveDataRowStatus(
  key: GeneratorIntakeBlockKey,
  snapshot: GeneratorIntakeSnapshot,
  selection: GeneratorIntakeSelection
): SwimProfileDataStatus {
  const block = snapshot.blocks[key];
  if (!block.available) {
    return block.state === "error" || block.state === "syncing"
      ? "Unavailable"
      : "Not in Swim Profile";
  }

  return selection[key] ? "Included" : "Excluded";
}
