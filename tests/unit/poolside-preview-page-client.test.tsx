import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
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
  const actual =
    await vi.importActual<typeof import("@/lib/workouts/shared")>("@/lib/workouts/shared");

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
    <main class="shell">
      <article data-testid="workout-pdf-print-view" data-poolside-page-width-mm="90">
        <h1 data-testid="workout-pdf-title">${title}</h1>
      </article>
    </main>
  `;
  const shell = frameDocument.querySelector<HTMLElement>(".shell");
  const article = frameDocument.querySelector<HTMLElement>(
    '[data-testid="workout-pdf-print-view"]'
  );

  if (shell) {
    defineElementLayout(shell, { width: 388, height: 260 });
  }

  if (article) {
    defineElementLayout(article, { width: 340, height: 240 });
  }

  Object.defineProperty(frameDocument, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });

  return frameDocument;
}

function defineElementLayout(element: HTMLElement, size: { width: number; height: number }) {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: size.height },
    clientWidth: { configurable: true, value: size.width },
    offsetHeight: { configurable: true, value: size.height },
    offsetWidth: { configurable: true, value: size.width },
    scrollHeight: { configurable: true, value: size.height },
    scrollWidth: { configurable: true, value: size.width },
  });
  element.getBoundingClientRect = () =>
    ({
      bottom: size.height,
      height: size.height,
      left: 0,
      right: size.width,
      top: 0,
      width: size.width,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}

async function markEmbeddedPreviewReady() {
  fireEvent.load(screen.getByTestId("poolside-preview-frame"));

  await waitFor(() => {
    expect(screen.getByTestId("poolside-preview-frame-state")).toHaveAttribute(
      "data-preview-ready",
      "true"
    );
  });
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
  const originalInnerWidthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth");
  const iframeDescriptor = Object.getOwnPropertyDescriptor(
    HTMLIFrameElement.prototype,
    "contentWindow"
  );

  beforeEach(() => {
    navigationState.searchParams = new URLSearchParams("previewId=preview-1");
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

    if (originalInnerWidthDescriptor) {
      Object.defineProperty(window, "innerWidth", originalInnerWidthDescriptor);
    } else {
      Reflect.deleteProperty(window, "innerWidth");
    }
  });

  it("keeps the embedded preview frame SSR-stable before viewport measurement", () => {
    navigationState.searchParams = new URLSearchParams("workoutId=workout-1");
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });

    const html = renderToString(<PoolsidePreviewPageClient />);

    expect(html).toContain('data-testid="poolside-preview-frame-state"');
    expect(html).toContain("width:388px");
    expect(html).toContain("height:180px");
  });

  it("uses mobile action layout and button semantics for preview actions", () => {
    render(<PoolsidePreviewPageClient />);

    const actions = screen.getByTestId("poolside-preview-actions");
    expect(actions).toHaveClass("grid", "w-full", "grid-cols-2", "[&>*:nth-child(3)]:col-span-2");
    expect(screen.getByTestId("poolside-preview-print")).toHaveClass(
      "fs-cta-primary",
      "w-full",
      "sm:w-auto"
    );
    expect(screen.getByTestId("poolside-preview-save-image")).toHaveClass(
      "fs-cta-secondary",
      "w-full",
      "sm:w-auto"
    );
    expect(screen.getByTestId("poolside-preview-close")).toHaveClass(
      "fs-cta-secondary",
      "w-full",
      "sm:w-auto"
    );
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
    await markEmbeddedPreviewReady();

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));

    await waitFor(() => {
      expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      const notice = screen.getByTestId("poolside-preview-save-image-notice");
      expect(notice).toHaveAttribute("role", "status");
      expect(notice).toHaveAttribute("aria-live", "polite");
      expect(notice).toHaveTextContent("Image saved");
      expect(notice).toHaveTextContent(
        "Saved freeswimming-poolside-preview-draft-poolside-note-portrait.png."
      );
    });
  });

  it("shows polite pending feedback while preparing the image export", async () => {
    const createObjectUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:http://127.0.0.1/mock-poolside-image");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    let resolveCapture!: (blob: Blob) => void;
    const capturePromise = new Promise<Blob>((resolve) => {
      resolveCapture = resolve;
    });

    setExportOverride({
      captureNoteBlob: async () => capturePromise,
    });

    render(<PoolsidePreviewPageClient />);
    await markEmbeddedPreviewReady();

    const button = screen.getByTestId("poolside-preview-save-image");
    fireEvent.click(button);

    const pending = await screen.findByTestId("poolside-preview-save-image-pending");
    expect(pending).toHaveTextContent("Preparing image");
    expect(pending).toHaveTextContent("Preparing image export...");
    expect(pending).toHaveAttribute("role", "status");
    expect(pending).toHaveAttribute("aria-live", "polite");
    expect(button).toHaveAttribute("aria-describedby", pending.id);

    resolveCapture(new Blob(["png"], { type: "image/png" }));

    await waitFor(() => {
      expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
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
    await markEmbeddedPreviewReady();

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("poolside-preview-save-image-notice")).toHaveTextContent(
        "Image ready to share."
      );
      expect(screen.getByTestId("poolside-preview-save-image-notice")).toHaveAttribute(
        "aria-live",
        "polite"
      );
    });
  });

  it("does not show false success or fallback download when native share is cancelled", async () => {
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

    const shareSpy = vi.fn().mockRejectedValue(new Error("AbortError"));
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
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
    await markEmbeddedPreviewReady();

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("poolside-preview-save-image")).not.toBeDisabled();
    });

    expect(clickSpy).not.toHaveBeenCalled();
    expect(screen.queryByTestId("poolside-preview-save-image-notice")).toBeNull();
    expect(screen.queryByTestId("poolside-preview-save-image-error")).toBeNull();
  });

  it("shows recoverable feedback when capture fails", async () => {
    setExportOverride({
      captureNoteBlob: async () => {
        throw new Error("Could not capture the poolside note image.");
      },
    });

    render(<PoolsidePreviewPageClient />);
    await markEmbeddedPreviewReady();

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));

    await waitFor(() => {
      const error = screen.getByTestId("poolside-preview-save-image-error");
      expect(error).toHaveAttribute("role", "alert");
      expect(error).toHaveAttribute("aria-live", "assertive");
      expect(error).toHaveTextContent("Image export failed");
      expect(error).toHaveTextContent("Could not capture the poolside note image.");
    });
  });

  it("clears failed export feedback when the next image attempt starts", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:http://127.0.0.1/mock-poolside-image");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    let callCount = 0;
    let resolveRetry!: (blob: Blob) => void;
    const retryPromise = new Promise<Blob>((resolve) => {
      resolveRetry = resolve;
    });

    setExportOverride({
      captureNoteBlob: async () => {
        callCount += 1;
        if (callCount === 1) {
          throw new Error("Could not capture the poolside note image.");
        }
        return retryPromise;
      },
    });

    render(<PoolsidePreviewPageClient />);
    await markEmbeddedPreviewReady();

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));
    await screen.findByTestId("poolside-preview-save-image-error");

    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));
    const pending = await screen.findByTestId("poolside-preview-save-image-pending");
    expect(pending).toHaveTextContent("Preparing image export...");
    expect(screen.queryByTestId("poolside-preview-save-image-error")).toBeNull();

    resolveRetry(new Blob(["png"], { type: "image/png" }));

    await waitFor(() => {
      expect(screen.getByTestId("poolside-preview-save-image-notice")).toHaveTextContent(
        "Saved freeswimming-poolside-preview-draft-poolside-note-portrait.png."
      );
    });
  });

  it("does not allow image export until the embedded note has rendered", async () => {
    const captureSpy = vi.fn(async () => new Blob(["png"], { type: "image/png" }));
    setExportOverride({
      captureNoteBlob: captureSpy,
    });

    render(<PoolsidePreviewPageClient />);

    expect(screen.getByTestId("poolside-preview-save-image")).toBeDisabled();
    fireEvent.click(screen.getByTestId("poolside-preview-save-image"));
    expect(captureSpy).not.toHaveBeenCalled();

    await markEmbeddedPreviewReady();
    expect(screen.getByTestId("poolside-preview-save-image")).not.toBeDisabled();
  });

  it("keeps note controls off by default and syncs selected note modes into the URL", async () => {
    render(<PoolsidePreviewPageClient />);

    expect(screen.getByTestId("poolside-preview-session-note")).toHaveValue("off");
    expect(screen.getByTestId("poolside-preview-step-notes")).toHaveValue("off");

    fireEvent.change(screen.getByTestId("poolside-preview-session-note"), {
      target: { value: "include" },
    });
    fireEvent.change(screen.getByTestId("poolside-preview-step-notes"), {
      target: { value: "drills_only" },
    });

    await waitFor(() => {
      expect(window.location.search).toContain("sessionNoteMode=include");
      expect(window.location.search).toContain("stepNotesMode=drills_only");
    });
  });
});
