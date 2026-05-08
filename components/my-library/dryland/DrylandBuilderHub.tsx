"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateManualDrylandSessionButton from "@/components/my-library/dryland/CreateManualDrylandSessionButton";
import DrylandMicroPlanPanel from "@/components/my-library/dryland/DrylandMicroPlanPanel";
import DrylandSessionEditor from "@/components/my-library/dryland/DrylandSessionEditor";
import { useAutoDismissNotice } from "@/components/my-library/workouts/useAutoDismissNotice";
import {
  buildDrylandSessionSummarySubtitle,
  getDrylandSessionKindLabel,
  type DrylandDeleteApiResponse,
  type DrylandLibrarySnapshot,
  type DrylandSaveApiResponse,
  type DrylandSessionRecord,
  type DrylandSessionSummary,
} from "@/lib/dryland/shared";

type Props = {
  drylandLibrary: DrylandLibrarySnapshot;
  browseOnly?: boolean;
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

export default function DrylandBuilderHub({ drylandLibrary, browseOnly = false }: Props) {
  const router = useRouter();
  const [savedSession, setSavedSession] = useState<DrylandSessionRecord | null>(
    drylandLibrary.selectedSession
  );
  const [draft, setDraft] = useState(drylandLibrary.selectedSession?.draft ?? null);
  const [recentSessions, setRecentSessions] = useState(drylandLibrary.recentSessions);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const hasUnsavedChanges = haveDrylandDraftChanges(draft, savedSession?.draft ?? null);

  useAutoDismissNotice(success, setSuccess);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    setSavedSession(drylandLibrary.selectedSession);
    setDraft(drylandLibrary.selectedSession?.draft ?? null);
    setRecentSessions(drylandLibrary.recentSessions);
    setError("");
    setSuccess("");
    setPendingDeleteSessionId(null);
    setDeletingSessionId(null);
  }, [
    drylandLibrary.recentSessions,
    drylandLibrary.selectedSession,
    drylandLibrary.selectedSessionMissing,
  ]);

  async function saveSession() {
    if (!draft || !savedSession) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

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
      setRecentSessions((current) => upsertRecentSessionSummary(current, responseBody.summary));
      setSuccess("Dryland session changes saved.");
    } catch {
      setError("Could not save dryland session right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetDraftToSavedSession() {
    if (!savedSession) return;
    setDraft(savedSession.draft);
    setSuccess("Unsaved dryland edits were reset to the last saved session.");
    setError("");
  }

  async function confirmDeleteSession(session: Pick<DrylandSessionSummary, "id" | "title">) {
    setDeletingSessionId(session.id);
    setError("");
    setSuccess("");

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
      className={browseOnly ? "rounded-2xl border border-slate-200 bg-white p-5" : "space-y-6"}
    >
      {browseOnly || !savedSession ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {browseOnly ? "Dryland Sessions" : "Dryland builder"}
            </h2>
            <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
              {browseOnly
                ? "Saved dryland sessions and weekly micro blocks."
                : "Create a strength or stretching session."}
            </p>
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
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
        {browseOnly ? (
          <DrylandMicroPlanPanel
            initialPlan={drylandLibrary.microPlan}
            sessions={recentSessions}
            schemaReady={drylandLibrary.microPlanSchemaReady}
            loadError={drylandLibrary.microPlanLoadError}
          />
        ) : null}

        {browseOnly ? (
          recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => {
                const isPendingDelete = pendingDeleteSessionId === session.id;
                return (
                  <article
                    key={session.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
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
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            onDraftChange={(nextDraft) => {
              setDraft(nextDraft);
              setSuccess("");
            }}
            onSave={saveSession}
            onResetToSaved={resetDraftToSavedSession}
          />
        )}
      </div>
    </section>
  );
}
