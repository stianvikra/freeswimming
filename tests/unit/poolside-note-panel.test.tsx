import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import PoolsideNotePanel from "@/components/my-library/workouts/PoolsideNotePanel";
import type { WorkoutPoolsideFocusOption } from "@/lib/workouts/shared";

function renderPoolsideNotePanel(
  focusOptions: WorkoutPoolsideFocusOption[],
  options?: {
    selectedFocusIds?: string[];
  }
) {
  return render(
    <PoolsideNotePanel
      testIdPrefix="poolside-note-test"
      swimmerName="Poolside Stian"
      focusOptions={focusOptions}
      selectedFocusIds={options?.selectedFocusIds ?? []}
      onToggleFocus={vi.fn()}
      actionSlot={<button type="button">Print Preview</button>}
    />
  );
}

describe("PoolsideNotePanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses the stacked layout when no focus options are available", () => {
    renderPoolsideNotePanel([]);

    expect(screen.getByTestId("poolside-note-test-panel")).toHaveAttribute(
      "data-layout-mode",
      "stacked"
    );
    expect(screen.getByTestId("poolside-note-test-reference-panel")).toHaveAttribute(
      "data-layout-mode",
      "stacked"
    );
    expect(screen.getByText(/No open focuses are available/i)).toBeInTheDocument();
    expect(screen.queryByText("Print Preview owns the final layout")).not.toBeInTheDocument();
  });

  it("keeps long focus lists on a stacked page-scroll-first layout", () => {
    renderPoolsideNotePanel(
      Array.from({ length: 8 }, (_, index) => ({
        id: `focus-${index + 1}`,
        title: `Focus ${index + 1}`,
        description:
          index === 0
            ? "Keep the catch patient, the line long, and the pressure steady through every stroke."
            : null,
        isPrimary: index === 0,
      }))
    );

    expect(screen.getByTestId("poolside-note-test-panel")).toHaveAttribute(
      "data-layout-mode",
      "stacked"
    );
    expect(screen.getByTestId("poolside-note-test-focus-list")).not.toHaveClass("overflow-y-auto");
    expect(screen.getByTestId("poolside-note-test-reference-panel")).toHaveAttribute(
      "data-layout-mode",
      "stacked"
    );
  });

  it("toggles abbreviations with a fully clickable disclosure row and includes Mod", async () => {
    const user = userEvent.setup();

    renderPoolsideNotePanel([
      {
        id: "focus-1",
        title: "High elbow catch",
        description: "Keep the forearm vertical before pressing back.",
        isPrimary: true,
      },
      {
        id: "focus-2",
        title: "Calm exhale",
        description: "Start the exhale before the head turns to breathe.",
      },
    ]);

    expect(screen.getByTestId("poolside-note-test-panel")).toHaveAttribute(
      "data-layout-mode",
      "split"
    );

    const toggle = screen.getByTestId("poolside-note-test-abbreviations-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("poolside-note-test-abbreviations-panel")).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("poolside-note-test-abbreviations-list")).toHaveAttribute(
      "data-column-mode",
      "up-to-2"
    );
    expect(screen.getByText("Mod")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Snorkel")).toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("poolside-note-test-abbreviations-panel")).not.toBeInTheDocument();
  });
});
