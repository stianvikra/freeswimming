import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DrylandBuilderHub from "@/components/my-library/dryland/DrylandBuilderHub";
import type {
  DrylandLibrarySnapshot,
  DrylandSessionDraft,
  DrylandSessionRecord,
  DrylandSessionSummary,
} from "@/lib/dryland/shared";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

function buildDraft(overrides?: Partial<DrylandSessionDraft>): DrylandSessionDraft {
  return {
    version: 1,
    sessionKind: "strength",
    title: "Strength session 2026-03-29",
    description: "Simple dryland test session.",
    focusText: "Brace first.",
    startedAt: null,
    completedAt: null,
    actualDurationSeconds: null,
    exercises: [
      {
        id: "exercise-1",
        source: "bank",
        bankExerciseId: "strength-air-squat",
        title: "Air squat",
        summary: "Lower-body strength.",
        howTo: "Sit back and stand tall.",
        targetAreas: ["Quads", "Glutes"],
        accent: "blue",
        mediaType: "none",
        mediaUrl: null,
        mediaPosterUrl: null,
        mediaLabel: null,
        notes: "",
        sets: [
          {
            id: "set-1",
            reps: 12,
            holdSeconds: null,
            loadKg: null,
            restSeconds: 90,
            isCompleted: false,
            completedAt: null,
          },
        ],
      },
    ],
    ...overrides,
  };
}

function buildRecord(overrides?: Partial<DrylandSessionRecord>): DrylandSessionRecord {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    createdAt: "2026-03-29T10:00:00.000Z",
    updatedAt: "2026-03-29T10:00:00.000Z",
    sourceKind: "manual",
    status: "draft",
    draft: buildDraft(),
    ...overrides,
  };
}

function buildSummary(overrides?: Partial<DrylandSessionSummary>): DrylandSessionSummary {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Strength session 2026-03-29",
    sessionKind: "strength",
    status: "draft",
    updatedAt: "2026-03-29T10:00:00.000Z",
    completedAt: null,
    exerciseCount: 1,
    setCount: 1,
    actualDurationSeconds: null,
    ...overrides,
  };
}

function buildLibrary(overrides?: Partial<DrylandLibrarySnapshot>): DrylandLibrarySnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedSession: buildRecord(),
    selectedSessionMissing: false,
    recentSessions: [buildSummary()],
    ...overrides,
  };
}

describe("DrylandBuilderHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("loads a dryland session, lets the owner update it, and saves the canonical session", async () => {
    vi.mocked(fetch).mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        draft: DrylandSessionDraft;
      };

      return {
        ok: true,
        json: async () => ({
          ok: true,
          session: buildRecord({
            status: body.draft.completedAt
              ? "completed"
              : body.draft.startedAt
                ? "in_progress"
                : "draft",
            draft: body.draft,
          }),
          summary: buildSummary({
            title: body.draft.title,
            status: body.draft.completedAt
              ? "completed"
              : body.draft.startedAt
                ? "in_progress"
                : "draft",
            actualDurationSeconds: body.draft.actualDurationSeconds,
          }),
        }),
      } as Response;
    });

    render(<DrylandBuilderHub drylandLibrary={buildLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.change(screen.getByTestId("dryland-draft-title"), {
      target: { value: "Updated dryland session" },
    });
    fireEvent.change(screen.getByTestId("dryland-draft-actual-duration"), {
      target: { value: "18" },
    });
    fireEvent.click(screen.getByTestId("dryland-add-custom-exercise"));
    fireEvent.click(screen.getByTestId("dryland-set-chip-0-0"));

    expect(screen.getByTestId("dryland-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save"
    );

    fireEvent.click(screen.getByTestId("dryland-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/11111111-1111-4111-8111-111111111111",
        expect.objectContaining<Record<string, unknown>>({
          method: "PATCH",
          body: expect.stringContaining('"title":"Updated dryland session"'),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Dryland session changes saved.")).toBeVisible();
    });
  });

  it("browses and deletes a dryland session from the list view", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        deletedSessionId: "11111111-1111-4111-8111-111111111111",
      }),
    } as Response);

    render(
      <DrylandBuilderHub drylandLibrary={buildLibrary({ selectedSession: null })} browseOnly />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(
      screen.getByTestId("dryland-delete-session-11111111-1111-4111-8111-111111111111")
    );
    fireEvent.click(
      screen.getByTestId("dryland-confirm-delete-session-11111111-1111-4111-8111-111111111111")
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/11111111-1111-4111-8111-111111111111",
        expect.objectContaining<Record<string, unknown>>({
          method: "DELETE",
        })
      );
    });
  });

  it("replaces back to the dryland list after deleting the current session", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        deletedSessionId: "11111111-1111-4111-8111-111111111111",
      }),
    } as Response);

    render(<DrylandBuilderHub drylandLibrary={buildLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("dryland-delete-current-session"));
    fireEvent.click(screen.getByTestId("dryland-confirm-delete-current-session"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/11111111-1111-4111-8111-111111111111",
        expect.objectContaining<Record<string, unknown>>({
          method: "DELETE",
        })
      );
    });

    await waitFor(() => {
      expect(navigationState.replace).toHaveBeenCalledWith("/my-library/dryland");
    });

    expect(navigationState.refresh).not.toHaveBeenCalled();
  });
});
