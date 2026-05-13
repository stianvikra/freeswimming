"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateManualDrylandSessionButton from "@/components/my-library/dryland/CreateManualDrylandSessionButton";
import DrylandMicroPlanPanel from "@/components/my-library/dryland/DrylandMicroPlanPanel";
import DrylandSessionEditor from "@/components/my-library/dryland/DrylandSessionEditor";
import { useAutoDismissNotice } from "@/components/my-library/workouts/useAutoDismissNotice";
import type {
  DrylandMicroPlanApiResponse,
  DrylandMicroPlanRecord,
} from "@/lib/dryland/micro-plans";
import {
  buildDrylandSessionSummarySubtitle,
  getDrylandSessionKindLabel,
  normalizeDrylandSessionDraft,
  type DrylandDeleteApiResponse,
  type DrylandLibrarySnapshot,
  type DrylandSaveApiResponse,
  type DrylandSessionDraft,
  type DrylandSessionRecord,
  type DrylandSessionSummary,
} from "@/lib/dryland/shared";

type Props = {
  drylandLibrary: DrylandLibrarySnapshot;
  browseOnly?: boolean;
  initialMicroPlanEditorOpen?: boolean;
};

type PostSaveCta = {
  href: string;
  label: string;
};

function upsertRecentSessionSummary(current: DrylandSessionSummary[], next: DrylandSessionSummary) {
  const existing = current.filter((summary) => summary.id !== next.id);
  return [next, ...existing].slice(0, 8);
}

function haveDrylandDraftChanges(
  draft: DrylandSessionRecord["draft"] | null,
  savedDraft: DrylandSessionRecord["draft"] | null
) {
  return JSON.stringify(draft) !== JSON.stringify(savedDraft);
}

const LOCAL_DRYLAND_DRAFT_VERSION = 1;

function getLocalDraftKey(sessionId: string) {
  return `freeswimming:dryland:draft:${sessionId}:v${LOCAL_DRYLAND_DRAFT_VERSION}`;
}

function readLocalDrylandDraft(session: DrylandSessionRecord | null): DrylandSessionDraft | null {
  if (!session || typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getLocalDraftKey(session.id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      savedUpdatedAt?: unknown;
      draft?: unknown;
    };
    if (parsed.savedUpdatedAt !== session.updatedAt) return null;

    const normalized = normalizeDrylandSessionDraft(parsed.draft);
    if (!normalized.ok || normalized.value.sessionKind !== session.draft.sessionKind) return null;
    if (!haveDrylandDraftChanges(normalized.value, session.draft)) return null;
    return normalized.value;
  } catch {
    return null;
  }
}

function writeLocalDrylandDraft(session: DrylandSessionRecord | null, draft: DrylandSessionDraft) {
  if (!session || typeof window === "undefined") return;

  try {
    if (!haveDrylandDraftChanges(draft, session.draft)) {
      window.localStorage.removeItem(getLocalDraftKey(session.id));
      return;
    }

    window.localStorage.setItem(
      getLocalDraftKey(session.id),
      JSON.stringify({
        savedUpdatedAt: session.updatedAt,
        draft,
      })
    );
  } catch {
    // Local draft persistence is best-effort; server save remains canonical.
  }
}

function clearLocalDrylandDraft(sessionId: string | null | undefined) {
  if (!sessionId || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getLocalDraftKey(sessionId));
  } catch {
    // Ignore blocked localStorage cleanup.
  }
}

export default function DrylandBuilderHub({
  drylandLibrary,
  browseOnly = false,
  initialMicroPlanEditorOpen = false,
}: Props) {
  const router = useRouter();
  const [savedSession, setSavedSession] = useState<DrylandSessionRecord | null>(
    drylandLibrary.selectedSession
  );
  const [draft, setDraft] = useState(drylandLibrary.selectedSession?.draft ?? null);
  const [recentSessions, setRecentSessions] = useState(drylandLibrary.recentSessions);
  const [activeMicroPlan, setActiveMicroPlan] = useState<DrylandMicroPlanRecord | null>(
    drylandLibrary.microPlan
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [postSaveCta, setPostSaveCta] = useState<PostSaveCta | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingCurrentMicroPlan, setIsUpdatingCurrentMicroPlan] = useState(false);
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isMicroSourceSelectionActive, setIsMicroSourceSelectionActive] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const hasUnsavedChanges = haveDrylandDraftChanges(draft, savedSession?.draft ?? null);

  useAutoDismissNotice(success, setSuccess);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    setSavedSession(drylandLibrary.selectedSession);
    setDraft(
      readLocalDrylandDraft(drylandLibrary.selectedSession) ??
        drylandLibrary.selectedSession?.draft ??
        null
    );
    setRecentSessions(drylandLibrary.recentSessions);
    setActiveMicroPlan(drylandLibrary.microPlan);
    setError("");
    setSuccess("");
    setPostSaveCta(null);
    setIsUpdatingCurrentMicroPlan(false);
    setPendingDeleteSessionId(null);
    setDeletingSessionId(null);
    setIsMicroSourceSelectionActive(
      initialMicroPlanEditorOpen && drylandLibrary.microPlanSchemaReady
    );
  }, [
    initialMicroPlanEditorOpen,
    drylandLibrary.microPlanSchemaReady,
    drylandLibrary.microPlan,
    drylandLibrary.recentSessions,
    drylandLibrary.selectedSession,
    drylandLibrary.selectedSessionMissing,
  ]);

  async function saveSession() {
    if (!draft || !savedSession) return;

    setIsSaving(true);
    setError("");
    setSuccess("");
    setPostSaveCta(null);

    try {
      const response = await fetch(`/api/my-library/dryland/${savedSession.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as DrylandSaveApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok
          ? responseBody.error
          : "Could not save dryland session right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setSavedSession(responseBody.session);
      setDraft(responseBody.session.draft);
      clearLocalDrylandDraft(savedSession.id);
      setRecentSessions((current) => upsertRecentSessionSummary(current, responseBody.summary));
      setSuccess("Dryland session changes saved.");
      const savedSessionFeedsCurrentPlan =
        activeMicroPlan?.sourceSessionSnapshots.some(
          (source) => source.sourceDrylandSessionId === savedSession.id
        ) ?? false;
      setPostSaveCta({
        href: "/my-library/dryland?micro=edit",
        label: activeMicroPlan
          ? savedSessionFeedsCurrentPlan
            ? "Go to current micro session"
            : "Add to current micro session"
          : "Build micro session",
      });
    } catch {
      setError("Could not save dryland session right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetDraftToSavedSession() {
    if (!savedSession) return;
    clearLocalDrylandDraft(savedSession.id);
    setDraft(savedSession.draft);
    setSuccess("Unsaved dryland edits were reset to the last saved session.");
    setPostSaveCta(null);
    setError("");
  }

  async function updateCurrentMicroPlanFromSavedSession() {
    if (!activeMicroPlan || !savedSession) return;

    const sourceIds = activeMicroPlan.sourceSessionSnapshots
      .map((source) => source.sourceDrylandSessionId)
      .filter((sourceId): sourceId is string => Boolean(sourceId));
    if (!sourceIds.includes(savedSession.id)) {
      setError("This saved session is not part of the current Micro Session.");
      setSuccess("");
      return;
    }

    const sourceReleaseOffsetDays = activeMicroPlan.sourceSessionSnapshots.reduce<
      Record<string, number>
    >((assignments, source) => {
      if (source.sourceDrylandSessionId && source.releaseOffsetDays !== null) {
        assignments[source.sourceDrylandSessionId] = source.releaseOffsetDays;
      }
      return assignments;
    }, {});

    setIsUpdatingCurrentMicroPlan(true);
    setError("");
    setSuccess("");
    setPostSaveCta(null);

    try {
      const response = await fetch(`/api/my-library/dryland/micro-plans/${activeMicroPlan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: activeMicroPlan.title,
          sourceDrylandSessionIds: sourceIds,
          releaseMode: activeMicroPlan.releaseMode,
          releaseTime: activeMicroPlan.releaseTime,
          sourceReleaseOffsetDays,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as DrylandMicroPlanApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        setError(
          responseBody && !responseBody.ok
            ? responseBody.error
            : "Could not update current micro session."
        );
        return;
      }

      setActiveMicroPlan(responseBody.plan);
      setSuccess("Current micro session updated. Completed and skipped units were preserved.");
      setPostSaveCta({
        href: "/my-library/dryland?micro=edit",
        label: "Go to current micro session",
      });
    } catch {
      setError("Could not update current micro session.");
    } finally {
      setIsUpdatingCurrentMicroPlan(false);
    }
  }

  async function confirmDeleteSession(session: Pick<DrylandSessionSummary, "id" | "title">) {
    setDeletingSessionId(session.id);
    setError("");
    setSuccess("");
    setPostSaveCta(null);

    try {
      const response = await fetch(`/api/my-library/dryland/${session.id}`, {
        method: "DELETE",
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as DrylandDeleteApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok
          ? responseBody.error
          : "Could not delete dryland session right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setRecentSessions((current) => current.filter((summary) => summary.id !== session.id));
      setPendingDeleteSessionId(null);

      if (savedSession?.id === session.id) {
        clearLocalDrylandDraft(session.id);
        setSavedSession(null);
        setDraft(null);
        router.replace("/my-library/dryland");
        return;
      }

      setSuccess(`Deleted ${session.title}.`);
      router.refresh();
    } catch {
      setError("Could not delete dryland session right now.");
    } finally {
      setDeletingSessionId(null);
    }
  }

  return (
    <section
      data-testid="dryland-builder-hub"
      data-client-ready={clientReady ? "true" : "false"}
      className="space-y-6"
    >
      {browseOnly || !savedSession ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {browseOnly ? "Dryland Sessions" : "Dryland builder"}
            </h2>
            {!browseOnly ? (
              <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
                Create a strength or stretching session.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {drylandLibrary.schemaReady ? (
              <>
                <CreateManualDrylandSessionButton
                  sessionKind="strength"
                  label="Create strength session"
                  testId={browseOnly ? "dryland-browse-create-strength" : "dryland-create-strength"}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                />
                <CreateManualDrylandSessionButton
                  sessionKind="stretching"
                  label="Create stretching session"
                  testId={
                    browseOnly ? "dryland-browse-create-stretching" : "dryland-create-stretching"
                  }
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {!drylandLibrary.schemaReady ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            Dryland builder is still syncing in this environment. Come back once the foundation
            table is live to create or edit saved dryland sessions here.
          </p>
        </div>
      ) : null}

      {drylandLibrary.loadError ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{drylandLibrary.loadError}</p>
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
          {postSaveCta ? (
            <Link
              href={postSaveCta.href}
              data-testid="dryland-post-save-micro-cta"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600 active:bg-emerald-800"
            >
              {postSaveCta.label}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
        {browseOnly ? (
          <DrylandMicroPlanPanel
            initialPlan={activeMicroPlan}
            sessions={recentSessions}
            schemaReady={drylandLibrary.microPlanSchemaReady}
            loadError={drylandLibrary.microPlanLoadError}
            initialEditorOpen={initialMicroPlanEditorOpen}
            onSourceSelectionChange={setIsMicroSourceSelectionActive}
            onPlanChange={setActiveMicroPlan}
          />
        ) : null}

        {browseOnly ? (
          isMicroSourceSelectionActive ? null : recentSessions.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {recentSessions.map((session) => {
                const isPendingDelete = pendingDeleteSessionId === session.id;
                return (
                  <article
                    key={session.id}
                    className="border-b border-slate-200 p-4 last:border-b-0 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{session.title}</h3>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                            {getDrylandSessionKindLabel(session.sessionKind)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {buildDrylandSessionSummarySubtitle(session)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/my-library/dryland/${session.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/my-library/dryland/${session.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          data-testid={`dryland-delete-session-${session.id}`}
                          onClick={() => {
                            setPendingDeleteSessionId((current) =>
                              current === session.id ? null : session.id
                            );
                            setError("");
                            setSuccess("");
                          }}
                          disabled={deletingSessionId === session.id}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingSessionId === session.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {isPendingDelete ? (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
                        <p className="text-sm font-medium text-rose-900">Delete {session.title}?</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            data-testid={`dryland-confirm-delete-session-${session.id}`}
                            onClick={() => void confirmDeleteSession(session)}
                            disabled={deletingSessionId === session.id}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingSessionId === session.id ? "Deleting..." : "Delete session"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteSessionId(null)}
                            disabled={deletingSessionId === session.id}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-medium text-slate-900">No dryland sessions yet.</p>
              <p className="mt-2 text-sm text-slate-600">
                Create a first strength or stretching session here, then come back to browse and
                reopen saved work in one list.
              </p>
            </div>
          )
        ) : !savedSession || !draft ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm font-medium text-amber-900">
              {drylandLibrary.selectedSessionMissing
                ? "That dryland session could not be found."
                : "No saved dryland session is loaded in this route yet."}
            </p>
            <p className="mt-2 text-sm text-amber-900/90">
              Open a saved session when you want to continue older work, or create a fresh strength
              or stretching session from scratch.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {recentSessions.length > 0 ? (
                <Link
                  href="/my-library/dryland"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  Dryland Sessions
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <DrylandSessionEditor
            draft={draft}
            savedSession={savedSession}
            activeMicroPlan={activeMicroPlan}
            isSaving={isSaving}
            isUpdatingCurrentMicroPlan={isUpdatingCurrentMicroPlan}
            hasUnsavedChanges={hasUnsavedChanges}
            onDraftChange={(nextDraft) => {
              setDraft(nextDraft);
              writeLocalDrylandDraft(savedSession, nextDraft);
              setSuccess("");
              setPostSaveCta(null);
            }}
            onSave={saveSession}
            onUpdateCurrentMicroPlan={updateCurrentMicroPlanFromSavedSession}
            onResetToSaved={resetDraftToSavedSession}
          />
        )}
      </div>
    </section>
  );
}
