import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PoolsidePreviewPageClient from "@/components/my-library/workouts/PoolsidePreviewPageClient";
import { writeStoredWorkoutPoolsidePreviewDraft } from "@/lib/workouts/poolside-preview";

const navigationState = vi.hoisted(() => ({
  searchParams: new URLSearchParams("previewId=preview-1"),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => navigationState.searchParams,
}));

vi.mock("@/lib/workouts/shared", async () => {
  const actual = await vi.importActual<typeof import("@/lib/workouts/shared")>(
    "@/lib/workouts/shared"
  );

  return {
    ...actual,
    buildWorkoutPdfHtmlDocument: vi.fn(() => "<!doctype html><html><body>preview</body></html>"),
  };
});

function buildDraft() {
  return {
    version: 1 as const,
    status: "draft" as const,
    generatorKind: "rule_engine_v1" as const,
    createdAt: "2026-04-20T08:00:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Poolside preview draft",
    titleSuggestions: [],
    description: "",
    environment: "pool" as const,
    poolLengthUnit: "m" as const,
    poolLengthM: 25,
    sessionType: "threshold_css" as const,
    effort: "moderate" as const,
    sizeMode: "distance" as const,
    targetDistanceM: 1600,
    targetTimeMin: null,
    totalDistanceM: 1600,
    estimatedDurationMin: 35,
    basePaceSecondsPer100m: 120,
    usedCssPaceLabel: null,
    allowedStrokes: ["freestyle" as const],
    equipmentAllowlist: [],
    focusText: "",
    goalTitle: "",
    constraintText: "",
    warnings: [],
    steps: [
      {
        id: "step-1",
        category: "warmup" as const,
        name: "Warmup swim",
        stroke: "freestyle" as const,
        intensity: "easy" as const,
        durationMode: "distance" as const,
        distanceM: 400,
        timeMin: null,
        targetSummary: "",
        notes: "",
      },
    ],
  };
}

function buildFrameDocument(title = "Poolside preview draft") {
  const frameDocument = document.implementation.createHTMLDocument("poolside-export");
  frameDocument.body.innerHTML = `
    <article data-testid="workout-pdf-print-view">
      <h1 data-testid="workout-pdf-title">${title}</h1>
    </article>
  `;

  Object.defineProperty(frameDocument, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });

  return frameDocument;
}

function setExportOverride(
  override: NonNullable<Window["__FS_WORKOUT_POOLSIDE_IMAGE_EXPORT_OVERRIDE__"]>
) {
  window.__FS_WORKOUT_POOLSIDE_IMAGE_EXPORT_OVERRIDE__ = override;
}

function clearExportOverride() {
  delete window.__FS_WORKOUT_POOLSIDE_IMAGE_EXPORT_OVERRIDE__;
}

describe("PoolsidePreviewPageClient", () => {
  const originalMatchMedia = window.matchMedia;
  const iframeDescriptor = Object.getOwnPropertyDescriptor(
    HTMLIFrameElement.prototype,
    "contentWindow"
  );

  beforeEach(() => {
    writeStoredWorkoutPoolsidePreviewDraft("preview-1", {
      draft: buildDraft(),
      draftState: "local_draft",
      focusPoints: ["Hold the line"],
      swimmerName: "Stian Vikra",
    });

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        media: "(pointer: coarse)",
        onchange: null,
      })),
    });

    const frameDocument = buildFrameDocument();
    const frameWindow = {
      document: frameDocument,
      setTimeout: window.setTimeout.bind(window),
      focus: vi.fn(),
      print: vi.fn(),
    } as unknown as Window;

    Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
      configurable: true,
      get: () => frameWindow,
    });
  });

  afterEach(() => {
    cleanup();
    clearExportOverride();
    vi.restoreAllMocks();
    window.localStorage.clear();

    if (iframeDescriptor) {
      Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", iframeDescriptor);
    }

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("downloads a PNG on desktop fallback", async () => {
    const createObjectUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:http://127.0.0.1/mock-poolside-image");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    setExportOverride({
      captureNoteBlob: async () => new Blob(["png"], { type: "image/png" }),
    });

    render(<PoolsidePreviewPageClient />);

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));

    await waitFor(() => {
      expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("poolside-preview-save-image-notice")).toHaveTextContent(
        "Saved freeswimming-poolside-preview-draft-poolside-note-portrait.png."
      );
    });
  });

  it("uses native share on coarse-pointer devices when file sharing is available", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        media: "(pointer: coarse)",
        onchange: null,
      })),
    });

    const shareSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: shareSpy,
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: vi.fn(() => true),
    });

    setExportOverride({
      captureNoteBlob: async () => new Blob(["png"], { type: "image/png" }),
    });

    render(<PoolsidePreviewPageClient />);

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("poolside-preview-save-image-notice")).toHaveTextContent(
        "Image ready to share."
      );
    });
  });

  it("shows recoverable feedback when capture fails", async () => {
    setExportOverride({
      captureNoteBlob: async () => {
        throw new Error("Could not capture the poolside note image.");
      },
    });

    render(<PoolsidePreviewPageClient />);

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));

    await waitFor(() => {
      expect(screen.getByTestId("poolside-preview-save-image-error")).toHaveTextContent(
        "Could not capture the poolside note image."
      );
    });
  });
});
