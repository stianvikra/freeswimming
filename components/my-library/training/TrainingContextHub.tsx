"use client";

import { useEffect, useMemo, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import {
  getTrainingNoteStatusLabel,
  getTrainingNoteTypeLabel,
  type TrainingNoteStatus,
} from "@/lib/training-context/mvp";
import type { TrainingContextSnapshot, TrainingNoteView } from "@/lib/training-context/server";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

export type TrainingGoalPrefill = {
  goalId: string;
  intent: "focus" | "note";
};

type Props = {
  initialSnapshot: TrainingContextSnapshot;
  initialGoalPrefill?: TrainingGoalPrefill | null;
};

type ApiError = {
  ok?: boolean;
  error?: string;
  snapshot?: TrainingContextSnapshot;
};

type FocusDraft = {
  title: string;
  details: string;
  goalId: string;
};

type NoteDraft = {
  noteType: "observation" | "question";
  body: string;
  goalId: string;
  focusId: string;
};

type NoteEditState = {
  body: string;
  status: TrainingNoteStatus;
  answer: string;
};

const FOCUS_DRAFT_STORAGE_KEY = "training-context-focus-draft";
const NOTE_DRAFT_STORAGE_KEY = "training-context-note-draft";

function getDefaultFocusDraft(): FocusDraft {
  return {
    title: "",
    details: "",
    goalId: "",
  };
}

function getDefaultNoteDraft(): NoteDraft {
  return {
    noteType: "observation",
    body: "",
    goalId: "",
    focusId: "",
  };
}

function getStorageValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return {
      ...fallback,
      ...(JSON.parse(raw) as Record<string, unknown>),
    } as T;
  } catch {
    return fallback;
  }
}

function setStorageValue(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function clearStorageValue(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function getNoteStatusOptions(noteType: TrainingNoteView["noteType"]): TrainingNoteStatus[] {
  if (noteType === "question") {
    return ["unanswered", "answered", "no_answer_needed"];
  }
  return ["open", "actioned", "no_action_needed"];
}

function createNoteEditState(note: TrainingNoteView): NoteEditState {
  return {
    body: note.body,
    status: note.status,
    answer: note.answer ?? "",
  };
}

export default function TrainingContextHub({ initialSnapshot, initialGoalPrefill }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [isOnline, setIsOnline] = useState(true);
  const [clientReady, setClientReady] = useState(false);
  const [focusDraft, setFocusDraft] = useState<FocusDraft>(getDefaultFocusDraft);
  const [noteDraft, setNoteDraft] = useState<NoteDraft>(getDefaultNoteDraft);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteEditState, setNoteEditState] = useState<NoteEditState | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [contextMessage, setContextMessage] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingFocusCreate, setPendingFocusCreate] = useState(false);
  const [pendingFocusActionId, setPendingFocusActionId] = useState<string | null>(null);
  const [showFocusHistory, setShowFocusHistory] = useState(false);
  const [pendingNoteCreate, setPendingNoteCreate] = useState(false);
  const [pendingNoteSaveId, setPendingNoteSaveId] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(readNavigatorOnlineState());
    const restoredFocusDraft = getStorageValue(FOCUS_DRAFT_STORAGE_KEY, getDefaultFocusDraft());
    const restoredNoteDraft = getStorageValue(NOTE_DRAFT_STORAGE_KEY, getDefaultNoteDraft());
    const nextFocusDraft = { ...restoredFocusDraft };
    const nextNoteDraft = { ...restoredNoteDraft };

    let nextSelectedGoalId = "";
    let nextContextMessage = "";

    if (initialGoalPrefill?.goalId) {
      const prefilledGoal = initialSnapshot.goalOptions.find(
        (goal) => goal.id === initialGoalPrefill.goalId
      );

      if (prefilledGoal) {
        const hadExistingLocalDraft =
          restoredFocusDraft.title.trim().length > 0 ||
          restoredFocusDraft.details.trim().length > 0 ||
          restoredFocusDraft.goalId.trim().length > 0 ||
          restoredNoteDraft.body.trim().length > 0 ||
          restoredNoteDraft.goalId.trim().length > 0 ||
          restoredNoteDraft.focusId.trim().length > 0;

        nextSelectedGoalId = prefilledGoal.id;
        if (!nextFocusDraft.goalId) {
          nextFocusDraft.goalId = prefilledGoal.id;
        }
        if (!nextNoteDraft.goalId) {
          nextNoteDraft.goalId = prefilledGoal.id;
        }

        nextContextMessage = hadExistingLocalDraft
          ? `${prefilledGoal.title} was selected from Goals. Existing draft text stayed in place.`
          : `${prefilledGoal.title} was selected from Goals. Choose whether to turn it into a focus or a note below.`;
      } else {
        nextContextMessage =
          "The goal selected from Goals is no longer available. Pick another goal below.";
      }
    }

    setFocusDraft(nextFocusDraft);
    setNoteDraft(nextNoteDraft);
    setSelectedGoalId(nextSelectedGoalId);
    setContextMessage(nextContextMessage);
    setClientReady(true);

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
  }, [initialGoalPrefill?.goalId, initialSnapshot.goalOptions]);

  useEffect(() => {
    setStorageValue(FOCUS_DRAFT_STORAGE_KEY, focusDraft);
  }, [focusDraft]);

  useEffect(() => {
    setStorageValue(NOTE_DRAFT_STORAGE_KEY, noteDraft);
  }, [noteDraft]);

  const goalOptionById = useMemo(
    () => new Map(snapshot.goalOptions.map((goal) => [goal.id, goal] as const)),
    [snapshot.goalOptions]
  );

  const selectedGoal = selectedGoalId ? (goalOptionById.get(selectedGoalId) ?? null) : null;

  async function parseError(response: Response, fallback: string) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    return payload?.error || fallback;
  }

  function applyGoalContext(goalId: string, intent: "focus" | "note") {
    const goal = goalOptionById.get(goalId);
    if (!goal) {
      setContextMessage("That goal is no longer available. Pick another goal below.");
      return;
    }

    setSelectedGoalId(goal.id);
    setActionError("");
    setActionSuccess("");

    if (intent === "focus") {
      setFocusDraft((prev) => ({ ...prev, goalId: goal.id }));
      setContextMessage(`${goal.title} is selected for your next focus.`);
      return;
    }

    setNoteDraft((prev) => ({ ...prev, goalId: goal.id }));
    setContextMessage(`${goal.title} is selected for your next note.`);
  }

  function clearGoalContext() {
    const currentGoalId = selectedGoalId;
    setSelectedGoalId("");
    setContextMessage("Goal context cleared. You can still link a goal manually from either form.");
    setFocusDraft((prev) => (prev.goalId === currentGoalId ? { ...prev, goalId: "" } : prev));
    setNoteDraft((prev) => (prev.goalId === currentGoalId ? { ...prev, goalId: "" } : prev));
  }

  async function refreshSnapshot() {
    setIsRefreshing(true);
    setActionError("");

    try {
      const response = await fetch("/api/my-library/training-context", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not refresh Focus and Notes right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not refresh Focus and Notes right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      void sendClientAnalyticsEvent("training_context_refreshed", {
        noteCount: payload.snapshot.recentNotes.length,
        hasPrimaryFocus: Boolean(payload.snapshot.primaryFocus),
        openFocusCount: payload.snapshot.openFocuses.length,
      });
    } catch {
      setActionError("Could not refresh Focus and Notes right now.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createFocus(e: React.FormEvent) {
    e.preventDefault();
    if (!isOnline) {
      setActionError("You are offline. Reconnect before saving a new focus.");
      return;
    }

    setPendingFocusCreate(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch("/api/my-library/training-context/focus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: focusDraft.title,
          details: focusDraft.details,
          goalId: focusDraft.goalId || null,
        }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not save focus right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not save focus right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      setFocusDraft(getDefaultFocusDraft());
      clearStorageValue(FOCUS_DRAFT_STORAGE_KEY);
      setActionSuccess(
        payload.snapshot.primaryFocus
          ? "Focus saved."
          : "Focus saved. Choose a primary focus when you want one cue used elsewhere in My Library."
      );
      void sendClientAnalyticsEvent("training_focus_created", {
        linkedGoal: Boolean(focusDraft.goalId),
        openFocusCount: payload.snapshot.openFocuses.length,
        hasPrimaryFocus: Boolean(payload.snapshot.primaryFocus),
      });
    } catch {
      setActionError("Could not save focus right now.");
    } finally {
      setPendingFocusCreate(false);
    }
  }

  async function updateFocusStatus(
    focusId: string,
    action: "complete" | "archive" | "reopen" | "set_primary"
  ) {
    if (!isOnline) {
      setActionError("You are offline. Reconnect before updating focus.");
      return;
    }

    setPendingFocusActionId(focusId);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`/api/my-library/training-context/focus/${focusId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not update focus right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not update focus right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      setActionSuccess(
        action === "complete"
          ? "Focus marked completed."
          : action === "archive"
            ? "Focus archived."
            : action === "reopen"
              ? "Focus reopened."
              : "Primary focus updated."
      );
      void sendClientAnalyticsEvent(
        action === "set_primary" ? "training_focus_primary_set" : "training_focus_resolved",
        {
          action,
          openFocusCount: payload.snapshot.openFocuses.length,
          hasPrimaryFocus: Boolean(payload.snapshot.primaryFocus),
        }
      );
    } catch {
      setActionError("Could not update focus right now.");
    } finally {
      setPendingFocusActionId(null);
    }
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    if (!isOnline) {
      setActionError("You are offline. Reconnect before saving a note.");
      return;
    }

    setPendingNoteCreate(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch("/api/my-library/training-context/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteType: noteDraft.noteType,
          body: noteDraft.body,
          goalId: noteDraft.goalId || null,
          focusId: noteDraft.focusId || null,
        }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not save note right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not save note right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      setNoteDraft(getDefaultNoteDraft());
      clearStorageValue(NOTE_DRAFT_STORAGE_KEY);
      setActionSuccess(
        noteDraft.noteType === "question" ? "Question saved." : "Observation saved."
      );
      void sendClientAnalyticsEvent("training_note_created", {
        noteType: noteDraft.noteType,
        linkedGoal: Boolean(noteDraft.goalId),
        linkedFocus: Boolean(noteDraft.focusId),
      });
    } catch {
      setActionError("Could not save note right now.");
    } finally {
      setPendingNoteCreate(false);
    }
  }

  function openNoteEditor(note: TrainingNoteView) {
    setEditingNoteId(note.id);
    setNoteEditState(createNoteEditState(note));
    setActionError("");
    setActionSuccess("");
  }

  async function saveNote(noteId: string) {
    if (!noteEditState) return;
    if (!isOnline) {
      setActionError("You are offline. Reconnect before updating a note.");
      return;
    }

    setPendingNoteSaveId(noteId);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`/api/my-library/training-context/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: noteEditState.body,
          status: noteEditState.status,
          answer: noteEditState.answer,
        }),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not update note right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not update note right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      setEditingNoteId(null);
      setNoteEditState(null);
      setActionSuccess("Note updated.");
      void sendClientAnalyticsEvent("training_note_updated", {
        status: noteEditState.status,
      });
    } catch {
      setActionError("Could not update note right now.");
    } finally {
      setPendingNoteSaveId(null);
    }
  }

  const focusOptions = [...snapshot.openFocuses, ...snapshot.focusHistory];
  const selectedFocus = snapshot.activeFocus;
  const primaryFocus = snapshot.primaryFocus;

  return (
    <div
      className="space-y-8"
      data-testid="training-context-hub"
      data-client-ready={clientReady ? "true" : "false"}
    >
      {!snapshot.schemaReady ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Focus & Notes are syncing</h2>
          <p className="mt-2 text-sm text-slate-700">
            The new training-context tables are not ready in this environment yet. Refresh after the
            migration has finished.
          </p>
          <button
            type="button"
            onClick={() => void refreshSnapshot()}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-amber-50"
          >
            {isRefreshing ? "Refreshing..." : "Retry"}
          </button>
        </section>
      ) : null}

      {isOnline ? null : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
          You are offline. Existing Focus and Notes stay visible, but save/update actions are paused
          until you reconnect.
        </section>
      )}

      {snapshot.loadError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
          <p className="text-sm font-medium text-red-700">{snapshot.loadError}</p>
          <button
            type="button"
            onClick={() => void refreshSnapshot()}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-red-50"
          >
            {isRefreshing ? "Refreshing..." : "Retry"}
          </button>
        </section>
      ) : null}

      {contextMessage ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
          <p className="text-sm font-medium text-blue-800">{contextMessage}</p>
        </section>
      ) : null}

      {actionError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
          <p className="text-sm font-medium text-red-700">{actionError}</p>
        </section>
      ) : null}

      {actionSuccess ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm font-medium text-emerald-700">{actionSuccess}</p>
        </section>
      ) : null}

      {snapshot.goalOptions.length > 0 ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Turn a goal into today&apos;s work
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Goals stay long-term. Use one here to prefill the next focus or note without
                re-selecting it everywhere.
              </p>
            </div>
            {selectedGoal ? (
              <button
                type="button"
                onClick={clearGoalContext}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Clear selection
              </button>
            ) : null}
          </div>

          {selectedGoal ? (
            <div
              className="mt-4 rounded-2xl border border-blue-200 bg-white/90 p-4"
              data-testid="training-context-selected-goal"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Selected goal
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{selectedGoal.title}</h3>
                <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {selectedGoal.statusLabel}
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.goalOptions.map((goal) => {
              const isSelected = selectedGoalId === goal.id;

              return (
                <article
                  key={goal.id}
                  data-testid={`training-goal-context-card-${goal.id}`}
                  className={`rounded-2xl border p-4 ${
                    isSelected
                      ? "border-blue-300 bg-white shadow-[0_8px_24px_rgba(37,99,235,0.08)]"
                      : "border-white/80 bg-white/85"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{goal.title}</h3>
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {goal.statusLabel}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid={`training-goal-context-use-focus-${goal.id}`}
                      onClick={() => applyGoalContext(goal.id, "focus")}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      Use for focus
                    </button>
                    <button
                      type="button"
                      data-testid={`training-goal-context-use-note-${goal.id}`}
                      onClick={() => applyGoalContext(goal.id, "note")}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Use for note
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Open focuses</h2>
            <p className="mt-2 text-sm text-slate-600">
              Keep several current training cues open. Choose one as your primary focus when My
              Library needs one clear cue elsewhere.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshSnapshot()}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            {snapshot.focusNeedsPrimarySelection ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">Choose a primary focus</h3>
                  <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                    Action needed
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  You have {snapshot.openFocuses.length} open focuses and no primary focus selected
                  yet. Pick one below before other My Library surfaces try to use a single current
                  cue.
                </p>
              </div>
            ) : selectedFocus ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {primaryFocus ? "Primary focus" : "Current focus cue"}
                  </h3>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                    {selectedFocus.title}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  {selectedFocus.details ??
                    "This is the clearest current cue available across your open focus list."}
                </p>
                {selectedFocus.goalTitle ? (
                  <p className="mt-3 text-xs font-medium text-slate-600">
                    Linked goal: {selectedFocus.goalTitle}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
                <h3 className="text-base font-semibold text-slate-900">No open focus yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Add the next technical or tactical cue you want to carry into the pool.
                </p>
              </div>
            )}

            {snapshot.focusHistory.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowFocusHistory((prev) => !prev)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {showFocusHistory ? "Hide completed & archived" : "Show completed & archived"}
              </button>
            ) : null}
          </div>

          <form
            onSubmit={createFocus}
            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
          >
            <h3 className="text-base font-semibold text-slate-900">Add a new open focus</h3>
            <p className="mt-2 text-sm text-slate-600">
              Saving a new focus will never auto-complete or auto-archive the ones you already have.
            </p>
            {focusDraft.goalId ? (
              <p className="mt-2 text-sm text-slate-600">
                This focus will support:{" "}
                <span className="font-medium text-slate-900">
                  {goalOptionById.get(focusDraft.goalId)?.title ?? "Selected goal"}
                </span>
              </p>
            ) : null}
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Focus title</span>
                <input
                  value={focusDraft.title}
                  onChange={(e) => setFocusDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Exhale calmly before turning to breathe"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Optional detail</span>
                <textarea
                  value={focusDraft.details}
                  onChange={(e) => setFocusDraft((prev) => ({ ...prev, details: e.target.value }))}
                  rows={3}
                  placeholder="What do you want to watch for in the next session?"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Optional linked goal</span>
                <select
                  data-testid="training-focus-goal-select"
                  value={focusDraft.goalId}
                  onChange={(e) => setFocusDraft((prev) => ({ ...prev, goalId: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                >
                  <option value="">No linked goal</option>
                  {snapshot.goalOptions.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title} ({goal.statusLabel})
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={!snapshot.schemaReady || pendingFocusCreate}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingFocusCreate ? "Saving..." : "Save open focus"}
              </button>
            </div>
          </form>
        </div>

        {snapshot.openFocuses.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Open focus list
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {snapshot.openFocuses.map((focus) => (
                <article
                  key={focus.id}
                  data-testid={`training-focus-card-${focus.id}`}
                  className={`rounded-2xl border p-4 ${
                    focus.isPrimary
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{focus.title}</h4>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {focus.statusLabel}
                    </span>
                    {focus.isPrimary ? (
                      <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {focus.details ?? "No extra detail saved for this focus yet."}
                  </p>
                  {focus.goalTitle ? (
                    <p className="mt-2 text-xs text-slate-600">Goal: {focus.goalTitle}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!focus.isPrimary ? (
                      <button
                        type="button"
                        data-testid={`training-focus-set-primary-${focus.id}`}
                        onClick={() => void updateFocusStatus(focus.id, "set_primary")}
                        disabled={pendingFocusActionId === focus.id}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingFocusActionId === focus.id ? "Saving..." : "Set primary"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      data-testid={`training-focus-complete-${focus.id}`}
                      onClick={() => void updateFocusStatus(focus.id, "complete")}
                      disabled={pendingFocusActionId === focus.id}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingFocusActionId === focus.id ? "Saving..." : "Mark completed"}
                    </button>
                    <button
                      type="button"
                      data-testid={`training-focus-archive-${focus.id}`}
                      onClick={() => void updateFocusStatus(focus.id, "archive")}
                      disabled={pendingFocusActionId === focus.id}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Archive
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {showFocusHistory && snapshot.focusHistory.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Completed & archived
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {snapshot.focusHistory.map((focus) => (
                <article
                  key={focus.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{focus.title}</h4>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {focus.statusLabel}
                    </span>
                  </div>
                  {focus.goalTitle ? (
                    <p className="mt-2 text-xs text-slate-600">Goal: {focus.goalTitle}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid={`training-focus-reopen-${focus.id}`}
                      onClick={() => void updateFocusStatus(focus.id, "reopen")}
                      disabled={pendingFocusActionId === focus.id}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingFocusActionId === focus.id ? "Saving..." : "Reopen"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
            <p className="mt-2 text-sm text-slate-600">
              Save observations and questions while they are fresh, then answer or close them later.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">{snapshot.unresolvedObservationCount}</p>
              <p className="text-xs text-slate-600">Open observations</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">{snapshot.unansweredQuestionCount}</p>
              <p className="text-xs text-slate-600">Unanswered questions</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={createNote}
          className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
        >
          <h3 className="text-base font-semibold text-slate-900">Add a note</h3>
          {noteDraft.goalId ? (
            <p className="mt-2 text-sm text-slate-600">
              This note is linked to:{" "}
              <span className="font-medium text-slate-900">
                {goalOptionById.get(noteDraft.goalId)?.title ?? "Selected goal"}
              </span>
            </p>
          ) : null}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Type</span>
              <select
                value={noteDraft.noteType}
                onChange={(e) =>
                  setNoteDraft((prev) => ({
                    ...prev,
                    noteType: e.target.value as NoteDraft["noteType"],
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
              >
                <option value="observation">{getTrainingNoteTypeLabel("observation")}</option>
                <option value="question">{getTrainingNoteTypeLabel("question")}</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Optional linked goal</span>
              <select
                data-testid="training-note-goal-select"
                value={noteDraft.goalId}
                onChange={(e) => setNoteDraft((prev) => ({ ...prev, goalId: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
              >
                <option value="">No linked goal</option>
                {snapshot.goalOptions.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title} ({goal.statusLabel})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">
              {noteDraft.noteType === "question" ? "Question" : "Observation"}
            </span>
            <textarea
              value={noteDraft.body}
              onChange={(e) => setNoteDraft((prev) => ({ ...prev, body: e.target.value }))}
              rows={4}
              placeholder={
                noteDraft.noteType === "question"
                  ? "What do you want to check later?"
                  : "What did you notice in the pool?"
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Optional linked focus</span>
            <select
              value={noteDraft.focusId}
              onChange={(e) => setNoteDraft((prev) => ({ ...prev, focusId: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
            >
              <option value="">No linked focus</option>
              {focusOptions.map((focus) => (
                <option key={focus.id} value={focus.id}>
                  {focus.title}
                  {focus.isPrimary ? " (Primary)" : ""}
                  {` (${focus.statusLabel})`}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={!snapshot.schemaReady || pendingNoteCreate}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingNoteCreate ? "Saving..." : "Save note"}
          </button>
        </form>

        {snapshot.recentNotes.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6">
            <p className="text-sm text-slate-600">
              No notes yet. Start with the first observation or question that comes up in the pool.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {snapshot.recentNotes.map((note) => {
              const isEditing = editingNoteId === note.id && noteEditState !== null;
              const currentStatusLabel = isEditing
                ? getTrainingNoteStatusLabel(noteEditState.status)
                : note.statusLabel;

              return (
                <article key={note.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      {note.noteTypeLabel}
                    </span>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {currentStatusLabel}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Text</span>
                        <textarea
                          value={noteEditState.body}
                          onChange={(e) =>
                            setNoteEditState((prev) =>
                              prev ? { ...prev, body: e.target.value } : prev
                            )
                          }
                          rows={4}
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Status</span>
                        <select
                          value={noteEditState.status}
                          onChange={(e) =>
                            setNoteEditState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    status: e.target.value as TrainingNoteStatus,
                                    answer:
                                      e.target.value === "answered"
                                        ? prev.answer
                                        : note.noteType === "question" &&
                                            e.target.value !== "answered"
                                          ? ""
                                          : prev.answer,
                                  }
                                : prev
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                        >
                          {getNoteStatusOptions(note.noteType).map((status) => (
                            <option key={status} value={status}>
                              {getTrainingNoteStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {note.noteType === "question" ? (
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">Answer</span>
                          <textarea
                            value={noteEditState.answer}
                            onChange={(e) =>
                              setNoteEditState((prev) =>
                                prev ? { ...prev, answer: e.target.value } : prev
                              )
                            }
                            rows={3}
                            placeholder="Write the answer when you have tested or reviewed it."
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                          />
                        </label>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void saveNote(note.id)}
                          disabled={pendingNoteSaveId === note.id}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingNoteSaveId === note.id ? "Saving..." : "Save note"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(null);
                            setNoteEditState(null);
                          }}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                        {note.body}
                      </p>
                      {note.answer ? (
                        <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Answer
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                            {note.answer}
                          </p>
                        </div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                        {note.goalTitle ? <span>Goal: {note.goalTitle}</span> : null}
                        {note.focusTitle ? <span>Focus: {note.focusTitle}</span> : null}
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => openNoteEditor(note)}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit note
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
