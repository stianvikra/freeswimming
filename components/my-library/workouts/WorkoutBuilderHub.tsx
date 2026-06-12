"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cx } from "@/components/ui/cx";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import CreateManualWorkoutButton from "@/components/my-library/workouts/CreateManualWorkoutButton";
import SavedWorkoutsPanel from "@/components/my-library/workouts/SavedWorkoutsPanel";
import WorkoutEditor from "@/components/my-library/workouts/WorkoutEditor";
import {
  useAutoDismissNotice,
  WORKOUT_NOTICE_AUTO_DISMISS_MS,
} from "@/components/my-library/workouts/useAutoDismissNotice";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import { buildWorkoutBuilderTemplateSelectedPayload } from "@/lib/analytics/workout-builder";
import type { ManualWorkoutBuilderMode, ManualWorkoutDraftDefaults } from "@/lib/workouts/manual";
import {
  clearStoredManualWorkoutDraft,
  loadOrCreateStoredManualWorkoutDraft,
  writeStoredManualWorkoutDraft,
} from "@/lib/workouts/manual-local-draft";
import {
  buildWorkoutTemplateDraft,
  getActiveWorkoutTemplateByKey,
  listActiveWorkoutTemplates,
  type WorkoutBuilderTemplate,
} from "@/lib/workouts/templates";
import type {
  WorkoutDeleteApiResponse,
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutPoolsideFocusOption,
  WorkoutSaveApiResponse,
  WorkoutSummary,
} from "@/lib/workouts/shared";
import { haveWorkoutDraftChanges } from "@/lib/workouts/shared";

type Props = {
  workoutLibrary: WorkoutLibrarySnapshot;
  trainingFocusOptions?: WorkoutPoolsideFocusOption[];
  manualPoolCssMetricSecondsPer100m?: number | null;
  manualPoolCssPaceLabel?: string | null;
  swimmerName?: string | null;
  browseOnly?: boolean;
  hideShellIntro?: boolean;
  preferExpandedDetailsOnLoad?: boolean;
  userId?: string | null;
  manualLocalDraftMode?: ManualWorkoutBuilderMode | null;
  templateLocalDraftKey?: string | null;
};

type WorkoutBuilderFeedbackTone = "warning" | "error" | "success" | "empty";
type WorkoutBuilderFeedbackDensity = "regular" | "compact";

const workoutBuilderFeedbackToneClasses: Record<WorkoutBuilderFeedbackTone, string> = {
  warning: "border-amber-200 bg-amber-50/80 text-amber-900",
  error: "border-rose-200 bg-rose-50/80 text-rose-900",
  success: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
  empty: "border-slate-200 bg-slate-50/80 text-slate-700",
};

const actionBaseClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const primaryActionClass = cx("fs-cta-primary", actionBaseClass);
const secondaryActionClass = cx("fs-cta-secondary", actionBaseClass, "hover:bg-white");
const dangerActionClass = cx(
  actionBaseClass,
  "border border-rose-200 bg-white/80 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-400"
);
const dangerPrimaryActionClass = cx(
  actionBaseClass,
  "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 focus-visible:ring-rose-400"
);
const warningActionClass = cx(
  actionBaseClass,
  "border border-amber-200 bg-white/85 text-amber-900 hover:bg-amber-50 focus-visible:ring-amber-400"
);
const warningPrimaryActionClass = cx(
  actionBaseClass,
  "bg-amber-500 text-white hover:bg-amber-400 active:bg-amber-600 focus-visible:ring-amber-400"
);
const currentDangerPanelClass =
  "rounded-[var(--fs-radius-card)] border border-rose-200 bg-rose-50/80 p-3 sm:p-4";
const currentWarningPanelClass =
  "rounded-[var(--fs-radius-card)] border border-amber-200 bg-amber-50/80 p-3 sm:p-4";

function buildTemplateDraftHref(template: WorkoutBuilderTemplate) {
  const templateKey = encodeURIComponent(template.templateKey);
  return `/my-library/workouts?draft=${template.environment}&entry=template&template=${templateKey}`;
}

function WorkoutTemplateSelectionSurface() {
  const templates = listActiveWorkoutTemplates();

  if (templates.length === 0) return null;

  function trackTemplateSelection(templateKey: string) {
    const payload = buildWorkoutBuilderTemplateSelectedPayload({ templateKey });
    if (!payload) return;

    void sendClientAnalyticsEvent("workout_builder_template_selected", payload);
  }

  return (
    <section
      aria-labelledby="workout-builder-template-selection-heading"
      data-testid="workout-builder-template-selection"
      className="space-y-3"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h3
            id="workout-builder-template-selection-heading"
            className="text-base font-semibold text-slate-900"
          >
            Start from template
          </h3>
        </div>
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {templates.length} available
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((template) => (
          <article
            key={template.templateKey}
            data-testid={`workout-builder-template-card-${template.templateKey}`}
            className="rounded-[var(--fs-radius-card)] border border-slate-200 bg-white/85 p-4 shadow-sm"
          >
            <div className="flex min-h-full flex-col gap-4">
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase">
                  {template.category}
                </p>
                <h4 className="text-base font-semibold text-slate-950">{template.title}</h4>
                <p className="text-sm leading-6 text-slate-600">{template.description}</p>
                <div
                  aria-label={`${template.title} summary`}
                  className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600"
                >
                  {template.summaryItems.map((summaryItem) => (
                    <span
                      key={summaryItem}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1"
                    >
                      {summaryItem}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-auto">
                <Link
                  href={buildTemplateDraftHref(template)}
                  data-testid={`workout-builder-template-use-${template.templateKey}`}
                  onClick={() => trackTemplateSelection(template.templateKey)}
                  className={cx(primaryActionClass, "w-full sm:w-auto")}
                >
                  Use template
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkoutBuilderFeedback({
  tone,
  children,
  action,
  density = "regular",
  className,
  testId,
}: {
  tone: WorkoutBuilderFeedbackTone;
  children: ReactNode;
  action?: ReactNode;
  density?: WorkoutBuilderFeedbackDensity;
  className?: string;
  testId?: string;
}) {
  const isError = tone === "error";
  const isStaticEmpty = tone === "empty";

  return (
    <div
      role={isStaticEmpty ? undefined : isError ? "alert" : "status"}
      aria-live={isStaticEmpty ? undefined : isError ? "assertive" : "polite"}
      aria-atomic={isStaticEmpty ? undefined : "true"}
      data-feedback-tone={tone}
      data-testid={testId}
      className={cx(
        "border",
        density === "compact" ? "rounded-xl p-3" : "rounded-2xl p-3 sm:p-4",
        workoutBuilderFeedbackToneClasses[tone],
        className
      )}
    >
      <div className="min-w-0 text-sm leading-6">{children}</div>
      {action ? <div className="mt-3 flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

function upsertRecentWorkoutSummary(current: WorkoutSummary[], next: WorkoutSummary) {
  const existing = current.filter((summary) => summary.id !== next.id);
  return [next, ...existing].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  );
}

export default function WorkoutBuilderHub({
  workoutLibrary,
  trainingFocusOptions = [],
  manualPoolCssMetricSecondsPer100m = null,
  manualPoolCssPaceLabel = null,
  swimmerName = null,
  browseOnly = false,
  hideShellIntro = false,
  preferExpandedDetailsOnLoad = false,
  userId = null,
  manualLocalDraftMode = null,
  templateLocalDraftKey = null,
}: Props) {
  const router = useRouter();
  const requestedTemplate = useMemo(
    () => (templateLocalDraftKey ? getActiveWorkoutTemplateByKey(templateLocalDraftKey) : null),
    [templateLocalDraftKey]
  );
  const [savedWorkout, setSavedWorkout] = useState<WorkoutEditorRecord | null>(
    workoutLibrary.selectedWorkout
  );
  const [draft, setDraft] = useState(workoutLibrary.selectedWorkout?.draft ?? null);
  const [recentWorkouts, setRecentWorkouts] = useState(workoutLibrary.recentWorkouts);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState<string | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pendingCurrentDelete, setPendingCurrentDelete] = useState(false);
  const [pendingCurrentDraftDiscard, setPendingCurrentDraftDiscard] = useState(false);
  const [discardUndoDraft, setDiscardUndoDraft] = useState<WorkoutEditorRecord["draft"] | null>(
    null
  );
  const [clientReady, setClientReady] = useState(false);
  const [activeLocalDraftMode, setActiveLocalDraftMode] = useState<ManualWorkoutBuilderMode | null>(
    workoutLibrary.selectedWorkout
      ? null
      : requestedTemplate
        ? requestedTemplate.environment
        : manualLocalDraftMode
  );
  const [activeTemplateKey, setActiveTemplateKey] = useState<string | null>(
    workoutLibrary.selectedWorkout ? null : (requestedTemplate?.templateKey ?? null)
  );
  const [localDraftRecovered, setLocalDraftRecovered] = useState(false);
  const activeTemplate = useMemo(
    () => (activeTemplateKey ? getActiveWorkoutTemplateByKey(activeTemplateKey) : null),
    [activeTemplateKey]
  );
  const templateRequestUnavailable =
    !savedWorkout && templateLocalDraftKey !== null && requestedTemplate === null;
  const hasUnsavedChanges =
    savedWorkout !== null ? haveWorkoutDraftChanges(draft, savedWorkout.draft) : false;
  const manualPoolDraftDefaults = useMemo<ManualWorkoutDraftDefaults | undefined>(() => {
    if (
      typeof manualPoolCssMetricSecondsPer100m === "number" &&
      Number.isFinite(manualPoolCssMetricSecondsPer100m) &&
      manualPoolCssMetricSecondsPer100m > 0
    ) {
      return {
        basePaceSecondsPer100m: manualPoolCssMetricSecondsPer100m,
        usedCssPaceLabel: manualPoolCssPaceLabel,
      };
    }

    return undefined;
  }, [manualPoolCssMetricSecondsPer100m, manualPoolCssPaceLabel]);

  useAutoDismissNotice(success, setSuccess);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    const nextRequestedTemplate = templateLocalDraftKey
      ? getActiveWorkoutTemplateByKey(templateLocalDraftKey)
      : null;
    const nextLocalDraftMode = workoutLibrary.selectedWorkout
      ? null
      : nextRequestedTemplate
        ? nextRequestedTemplate.environment
        : manualLocalDraftMode;

    setSavedWorkout(workoutLibrary.selectedWorkout);
    setDraft(workoutLibrary.selectedWorkout?.draft ?? null);
    setRecentWorkouts(workoutLibrary.recentWorkouts);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);
    setPendingDeleteWorkoutId(null);
    setDeletingWorkoutId(null);
    setBulkDeleting(false);
    setPendingCurrentDelete(false);
    setPendingCurrentDraftDiscard(false);
    setActiveLocalDraftMode(nextLocalDraftMode);
    setActiveTemplateKey(
      workoutLibrary.selectedWorkout ? null : (nextRequestedTemplate?.templateKey ?? null)
    );
    setLocalDraftRecovered(false);
  }, [
    manualLocalDraftMode,
    templateLocalDraftKey,
    workoutLibrary.recentWorkouts,
    workoutLibrary.selectedWorkout,
    workoutLibrary.selectedWorkoutMissing,
  ]);

  useEffect(() => {
    if (!discardUndoDraft) return;

    const timeoutId = window.setTimeout(() => {
      setDiscardUndoDraft(null);
    }, WORKOUT_NOTICE_AUTO_DISMISS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [discardUndoDraft]);

  useEffect(() => {
    if (!clientReady || !userId || !activeLocalDraftMode || savedWorkout || activeTemplateKey) {
      return;
    }

    const loadedDraft = loadOrCreateStoredManualWorkoutDraft(
      userId,
      activeLocalDraftMode,
      manualPoolDraftDefaults
    );

    setDraft(loadedDraft.draft);
    setLocalDraftRecovered(loadedDraft.recovered);
  }, [
    activeLocalDraftMode,
    activeTemplateKey,
    clientReady,
    manualPoolDraftDefaults,
    savedWorkout,
    userId,
  ]);

  useEffect(() => {
    if (!clientReady || !activeTemplateKey || savedWorkout) {
      return;
    }

    const templateDraft = buildWorkoutTemplateDraft(
      activeTemplateKey,
      new Date(),
      manualPoolDraftDefaults
    );

    if (!templateDraft) {
      setDraft(null);
      setActiveLocalDraftMode(null);
      setActiveTemplateKey(null);
      setError("That workout template is not available.");
      return;
    }

    setDraft(templateDraft);
    setLocalDraftRecovered(false);
  }, [activeTemplateKey, clientReady, manualPoolDraftDefaults, savedWorkout]);

  useEffect(() => {
    if (
      !clientReady ||
      !userId ||
      !activeLocalDraftMode ||
      activeTemplateKey ||
      savedWorkout ||
      !draft
    ) {
      return;
    }

    writeStoredManualWorkoutDraft(userId, activeLocalDraftMode, draft);
  }, [activeLocalDraftMode, activeTemplateKey, clientReady, draft, savedWorkout, userId]);

  async function saveWorkout() {
    const isFirstCanonicalSave = !savedWorkout && activeLocalDraftMode !== null;
    const savedWorkoutId = savedWorkout?.id ?? null;
    if (!draft || (!isFirstCanonicalSave && !savedWorkoutId)) return;

    setIsSaving(true);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);
    setPendingCurrentDraftDiscard(false);

    try {
      const response = await fetch(
        isFirstCanonicalSave
          ? "/api/my-library/workouts"
          : `/api/my-library/workouts/${savedWorkoutId}`,
        {
          method: isFirstCanonicalSave ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isFirstCanonicalSave
              ? {
                  draft,
                  sourceKind: "manual",
                }
              : {
                  draft,
                }
          ),
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

      if (isFirstCanonicalSave && userId && activeLocalDraftMode && !activeTemplateKey) {
        clearStoredManualWorkoutDraft(userId, activeLocalDraftMode);
      }

      const canonicalWorkout = responseBody.workout;
      const canonicalMode = draft.environment === "open_water" ? "open_water" : "pool";

      setSavedWorkout(canonicalWorkout);
      setDraft(canonicalWorkout.draft);
      setRecentWorkouts((current) => upsertRecentWorkoutSummary(current, responseBody.summary));
      setActiveLocalDraftMode(null);
      setActiveTemplateKey(null);
      setLocalDraftRecovered(false);
      setSuccess(
        isFirstCanonicalSave ? "Saved to My Swim Sessions." : "Changes saved to this session."
      );

      if (isFirstCanonicalSave) {
        const entryQuery = activeTemplateKey
          ? `entry=template&template=${encodeURIComponent(activeTemplateKey)}`
          : `entry=${canonicalMode === "pool" ? "manual-pool" : "manual-open-water"}`;

        router.replace(`/my-library/workouts/${canonicalWorkout.id}?${entryQuery}`);
        router.refresh();
      }
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
    setPendingCurrentDelete(false);
  }

  function undoDiscardDraftChanges() {
    if (!discardUndoDraft) return;

    setDraft(discardUndoDraft);
    setDiscardUndoDraft(null);
    setError("");
    setSuccess("");
  }

  function confirmDiscardLocalDraft() {
    if (!activeLocalDraftMode) return;

    const discardedMode = activeLocalDraftMode;
    const discardedTemplateTitle = activeTemplate?.title ?? null;

    if (userId && !activeTemplateKey) {
      clearStoredManualWorkoutDraft(userId, discardedMode);
    }
    setDraft(null);
    setSavedWorkout(null);
    setActiveLocalDraftMode(null);
    setActiveTemplateKey(null);
    setLocalDraftRecovered(false);
    setPendingCurrentDraftDiscard(false);
    setDiscardUndoDraft(null);
    setError("");
    setSuccess(
      discardedTemplateTitle
        ? `Discarded the local draft from ${discardedTemplateTitle}.`
        : discardedMode === "pool"
          ? "Discarded the local pool draft."
          : "Discarded the local open-water draft."
    );
    router.replace("/my-library/workouts");
    router.refresh();
  }

  async function confirmDeleteWorkout(workout: Pick<WorkoutSummary, "id" | "title">) {
    setDeletingWorkoutId(workout.id);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);

    try {
      const response = await fetch(`/api/my-library/workouts/${workout.id}`, {
        method: "DELETE",
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as WorkoutDeleteApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok
          ? responseBody.error
          : "Could not delete workout right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setRecentWorkouts((current) => current.filter((summary) => summary.id !== workout.id));
      setPendingDeleteWorkoutId(null);

      if (savedWorkout?.id === workout.id) {
        setPendingCurrentDelete(false);
        setSavedWorkout(null);
        setDraft(null);
        router.replace("/my-library/workouts");
        return;
      }

      setSuccess(`Deleted ${workout.title}.`);
      router.refresh();
    } catch {
      setError("Could not delete workout right now.");
    } finally {
      setDeletingWorkoutId(null);
    }
  }

  async function confirmDeleteWorkouts(workouts: WorkoutSummary[]) {
    if (workouts.length === 0) return;

    setBulkDeleting(true);
    setPendingDeleteWorkoutId(null);
    setPendingCurrentDelete(false);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);

    try {
      const results = await Promise.all(
        workouts.map(async (workout) => {
          try {
            const response = await fetch(`/api/my-library/workouts/${workout.id}`, {
              method: "DELETE",
            });
            const responseBody = (await response
              .json()
              .catch(() => null)) as WorkoutDeleteApiResponse | null;

            return {
              workout,
              ok: Boolean(response.ok && responseBody?.ok),
              error:
                response.ok && responseBody?.ok
                  ? null
                  : responseBody && !responseBody.ok
                    ? responseBody.error
                    : "Could not delete workout right now.",
            };
          } catch {
            return {
              workout,
              ok: false,
              error: "Could not delete workout right now.",
            };
          }
        })
      );

      const deletedIds = results.filter((result) => result.ok).map((result) => result.workout.id);
      const failedDeletes = results.filter((result) => !result.ok);

      if (deletedIds.length > 0) {
        setRecentWorkouts((current) =>
          current.filter((summary) => !deletedIds.includes(summary.id))
        );
      }

      if (deletedIds.length > 0 && failedDeletes.length === 0) {
        setSuccess(
          deletedIds.length === 1
            ? `Deleted ${results.find((result) => result.ok)?.workout.title ?? "1 session"}.`
            : `Deleted ${deletedIds.length} saved sessions.`
        );
      } else if (deletedIds.length > 0) {
        setError(
          `Deleted ${deletedIds.length} saved session${
            deletedIds.length === 1 ? "" : "s"
          }, but ${failedDeletes.length} could not be deleted right now.`
        );
      } else {
        setError(failedDeletes[0]?.error ?? "Could not delete the selected sessions right now.");
      }

      router.refresh();
    } finally {
      setBulkDeleting(false);
    }
  }

  const browseHeaderActionCount = workoutLibrary.schemaReady ? 3 : 1;

  return (
    <section
      data-testid="workout-builder-hub"
      data-client-ready={clientReady ? "true" : "false"}
      data-containment-style="flat"
      data-mobile-density="tight"
      className="space-y-4 sm:space-y-5"
    >
      {browseOnly ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            data-testid="workout-builder-browse-actions"
            className={getMobileActionGroupClass(browseHeaderActionCount, {
              desktopJustify: "start",
              stackOnMobile: true,
            })}
          >
            {workoutLibrary.schemaReady ? (
              <CreateManualWorkoutButton
                label="Build pool session"
                testId="workout-builder-browse-create-pool"
                manualPoolCssMetricSecondsPer100m={manualPoolCssMetricSecondsPer100m}
                manualPoolCssPaceLabel={manualPoolCssPaceLabel}
                className={cx(primaryActionClass, mobileActionItemClass)}
              />
            ) : null}
            {workoutLibrary.schemaReady ? (
              <CreateManualWorkoutButton
                label="Build open water session"
                builderMode="open_water"
                testId="workout-builder-browse-create-open-water"
                className={cx(secondaryActionClass, mobileActionItemClass)}
              />
            ) : null}
            <Link
              href="/my-library/generator"
              className={cx(secondaryActionClass, mobileActionItemClass)}
            >
              AI session generator
            </Link>
          </div>
          {recentWorkouts.length > 0 ? (
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {recentWorkouts.length} saved session{recentWorkouts.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
          {!hideShellIntro ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Swim session builder</h2>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            {recentWorkouts.length > 0 ? (
              <Link
                href="/my-library/workouts"
                data-testid="workout-builder-view-sessions-link"
                className={secondaryActionClass}
              >
                <span className="sm:hidden">Sessions</span>
                <span className="hidden sm:inline">My Swim Sessions</span>
              </Link>
            ) : null}
          </div>
        </div>
      )}

      {!workoutLibrary.schemaReady ? (
        <WorkoutBuilderFeedback tone="warning" testId="workout-builder-schema-warning">
          <p>
            Canonical workout save is still syncing in this environment. Come back once the workouts
            table is live to edit accepted workouts here.
          </p>
        </WorkoutBuilderFeedback>
      ) : null}

      {workoutLibrary.loadError ? (
        <WorkoutBuilderFeedback tone="error" testId="workout-builder-load-error">
          <p>{workoutLibrary.loadError}</p>
        </WorkoutBuilderFeedback>
      ) : null}

      {error ? (
        <WorkoutBuilderFeedback tone="error" testId="workout-builder-action-error">
          <p>{error}</p>
        </WorkoutBuilderFeedback>
      ) : null}

      {templateRequestUnavailable ? (
        <WorkoutBuilderFeedback tone="error" testId="workout-builder-template-unavailable">
          <p>That workout template is not available.</p>
        </WorkoutBuilderFeedback>
      ) : null}

      {success ? (
        <WorkoutBuilderFeedback tone="success" testId="workout-builder-action-success">
          <p>{success}</p>
        </WorkoutBuilderFeedback>
      ) : null}

      {activeLocalDraftMode && !savedWorkout && !activeTemplateKey && localDraftRecovered ? (
        <WorkoutBuilderFeedback tone="success" testId="workout-builder-local-draft-recovered">
          <p>
            {activeLocalDraftMode === "pool"
              ? "Recovered your unsaved local pool draft on this device."
              : "Recovered your unsaved local open-water draft on this device."}
          </p>
        </WorkoutBuilderFeedback>
      ) : null}

      <div className="space-y-4 sm:space-y-5">
        {!browseOnly && savedWorkout && pendingCurrentDelete ? (
          <div
            data-testid="workout-builder-current-workout-actions"
            className={currentDangerPanelClass}
          >
            <p className="text-sm font-medium text-rose-900">Delete this saved session?</p>
            <p className="mt-1 text-sm text-rose-900/90">
              This removes <span className="font-semibold">{savedWorkout.draft.title}</span> from My
              Library and discards any unsaved local builder edits tied to it.
            </p>
            <div
              data-testid="workout-builder-current-workout-confirm-actions"
              className={cx("mt-3", getMobileActionGroupClass(2, { desktopJustify: "start" }))}
            >
              <button
                type="button"
                onClick={() =>
                  void confirmDeleteWorkout({
                    id: savedWorkout.id,
                    title: savedWorkout.draft.title,
                  })
                }
                disabled={deletingWorkoutId === savedWorkout.id}
                data-testid="workout-builder-confirm-delete-current-workout"
                className={cx(dangerPrimaryActionClass, mobileActionItemClass)}
              >
                {deletingWorkoutId === savedWorkout.id ? "Deleting..." : "Delete session"}
              </button>
              <button
                type="button"
                onClick={() => setPendingCurrentDelete(false)}
                disabled={deletingWorkoutId === savedWorkout.id}
                className={cx(dangerActionClass, mobileActionItemClass)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {!browseOnly && !savedWorkout && activeLocalDraftMode && pendingCurrentDraftDiscard ? (
          <div
            data-testid="workout-builder-current-draft-actions"
            className={currentWarningPanelClass}
          >
            <p className="text-sm font-medium text-amber-900">Discard this local draft?</p>
            <p className="mt-1 text-sm text-amber-900/90">
              {activeTemplate
                ? `This removes the unsaved draft from ${activeTemplate.title}. Nothing is deleted from My Swim Sessions.`
                : activeLocalDraftMode === "pool"
                  ? "This removes the unsaved pool draft from this device. Nothing is deleted from My Swim Sessions."
                  : "This removes the unsaved open-water draft from this device. Nothing is deleted from My Swim Sessions."}
            </p>
            <div
              data-testid="workout-builder-current-draft-confirm-actions"
              className={cx("mt-3", getMobileActionGroupClass(2, { desktopJustify: "start" }))}
            >
              <button
                type="button"
                onClick={confirmDiscardLocalDraft}
                data-testid="workout-builder-confirm-discard-current-draft"
                className={cx(warningPrimaryActionClass, mobileActionItemClass)}
              >
                Discard draft
              </button>
              <button
                type="button"
                onClick={() => setPendingCurrentDraftDiscard(false)}
                className={cx(warningActionClass, mobileActionItemClass)}
              >
                Keep editing
              </button>
            </div>
          </div>
        ) : null}

        {browseOnly && workoutLibrary.schemaReady ? <WorkoutTemplateSelectionSurface /> : null}

        {browseOnly ? (
          recentWorkouts.length > 0 ? (
            <SavedWorkoutsPanel
              workouts={recentWorkouts}
              heading="My Swim Sessions"
              workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
              workoutPdfHrefBuilder={(workoutId) =>
                `/api/my-library/workouts/${workoutId}/export/pdf`
              }
              workoutPoolsidePdfHrefBuilder={(workoutId) =>
                `/my-library/workouts/poolside-preview?workoutId=${workoutId}`
              }
              editLabel="Open"
              testId="workout-builder-saved-sessions"
              showToggle={false}
              showInlinePreview
              showHeader={false}
              initialVisibleCount={null}
              enableBulkDelete
              editButtonTestIdBuilder={(workoutId) => `workout-builder-edit-workout-${workoutId}`}
              deleteButtonTestIdBuilder={(workoutId) =>
                `workout-builder-delete-workout-${workoutId}`
              }
              confirmDeleteButtonTestIdBuilder={(workoutId) =>
                `workout-builder-confirm-delete-workout-${workoutId}`
              }
              onRequestDeleteWorkout={(workout) => {
                setPendingDeleteWorkoutId(workout.id);
                setPendingCurrentDelete(false);
                setPendingCurrentDraftDiscard(false);
                setError("");
                setSuccess("");
              }}
              onCancelDeleteWorkout={() => setPendingDeleteWorkoutId(null)}
              onConfirmDeleteWorkout={confirmDeleteWorkout}
              onConfirmDeleteWorkouts={confirmDeleteWorkouts}
              pendingDeleteWorkoutId={pendingDeleteWorkoutId}
              deletingWorkoutId={deletingWorkoutId}
              bulkDeleting={bulkDeleting}
              trainingFocusOptions={trainingFocusOptions}
              swimmerName={swimmerName}
            />
          ) : (
            <WorkoutBuilderFeedback tone="empty" testId="workout-builder-empty">
              <p className="font-medium text-slate-900">No saved sessions yet.</p>
              <p className="mt-2 text-slate-600">
                Create your first pool or open water session here, then return to My Swim Sessions
                to browse, preview, or print saved work in one list.
              </p>
            </WorkoutBuilderFeedback>
          )
        ) : !savedWorkout && !activeLocalDraftMode ? (
          <div className="space-y-4 sm:space-y-5">
            <WorkoutBuilderFeedback
              tone="warning"
              testId={
                workoutLibrary.selectedWorkoutMissing
                  ? "workout-builder-missing-session"
                  : "workout-builder-no-loaded-session"
              }
              action={
                <>
                  {recentWorkouts.length > 0 ? (
                    <Link
                      href="/my-library/workouts"
                      data-testid="workout-builder-empty-view-sessions-link"
                      className={secondaryActionClass}
                    >
                      My Swim Sessions
                    </Link>
                  ) : null}
                  {workoutLibrary.schemaReady ? (
                    <CreateManualWorkoutButton
                      label="Build pool session"
                      testId="workout-builder-empty-create-pool"
                      manualPoolCssMetricSecondsPer100m={manualPoolCssMetricSecondsPer100m}
                      manualPoolCssPaceLabel={manualPoolCssPaceLabel}
                      className={primaryActionClass}
                    />
                  ) : null}
                  {workoutLibrary.schemaReady ? (
                    <CreateManualWorkoutButton
                      label="Build open water session"
                      builderMode="open_water"
                      testId="workout-builder-empty-create-open-water"
                      className={secondaryActionClass}
                    />
                  ) : null}
                  <Link href="/my-library/generator" className={secondaryActionClass}>
                    AI session generator
                  </Link>
                  <Link href="/my-library/workouts" className={secondaryActionClass}>
                    My Swim Sessions
                  </Link>
                </>
              }
            >
              <p className="font-medium">
                {workoutLibrary.selectedWorkoutMissing
                  ? "That saved swim session could not be found."
                  : "No saved swim session is loaded in this route yet."}
              </p>
              <p className="mt-2">
                Open My Swim Sessions when you want older work, or create a fresh session when you
                want a clean shell.
              </p>
            </WorkoutBuilderFeedback>
          </div>
        ) : null}

        {draft && !savedWorkout && activeTemplate ? (
          <WorkoutBuilderFeedback tone="empty" testId="workout-builder-template-draft-started">
            <p className="font-medium text-slate-900">Started from {activeTemplate.title}.</p>
            <p className="mt-2 text-slate-600">Edit anything here before saving.</p>
          </WorkoutBuilderFeedback>
        ) : null}

        {draft && (savedWorkout || activeLocalDraftMode) ? (
          <div>
            <WorkoutEditor
              draft={draft}
              savedWorkout={savedWorkout}
              trainingFocusOptions={trainingFocusOptions}
              recentWorkouts={[]}
              canonicalSaveReady={workoutLibrary.schemaReady}
              isSaving={isSaving}
              onSave={saveWorkout}
              hasUnsavedChanges={hasUnsavedChanges}
              onDraftChange={handleDraftChange}
              onDiscardChanges={savedWorkout ? discardDraftChanges : null}
              onRequestDiscardDraft={
                !savedWorkout && activeLocalDraftMode
                  ? () => {
                      setDiscardUndoDraft(null);
                      setPendingCurrentDelete(false);
                      setPendingDeleteWorkoutId(null);
                      setPendingCurrentDraftDiscard(true);
                      setError("");
                      setSuccess("");
                    }
                  : null
              }
              showDiscardUndoNotice={discardUndoDraft !== null}
              onUndoDiscardChanges={undoDiscardDraftChanges}
              startNewDraftHref={null}
              showLoadedBanner={false}
              showPdfPanel={false}
              manualBuilderMode={!savedWorkout ? activeLocalDraftMode : null}
              forceMetadataOpenOnLoad={preferExpandedDetailsOnLoad}
              onRequestDeleteCurrent={() => {
                setDiscardUndoDraft(null);
                setPendingCurrentDelete(true);
                setPendingCurrentDraftDiscard(false);
                setPendingDeleteWorkoutId(null);
                setError("");
                setSuccess("");
              }}
              isDeletingCurrent={savedWorkout ? deletingWorkoutId === savedWorkout.id : false}
              swimmerName={swimmerName}
              recentWorkoutsDescription="Edit another saved session when you want to switch what you are working on."
              workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
              saveButtonTestId="workout-builder-save"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
