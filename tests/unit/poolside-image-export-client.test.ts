import { beforeEach, describe, expect, it, vi } from "vitest";
import { toBlob } from "html-to-image";
import {
  getWorkoutPoolsideImageExportDriver,
  resolvePoolsideNoteCaptureBounds,
} from "@/lib/workouts/poolside-image-export-client";

vi.mock("html-to-image", () => ({
  toBlob: vi.fn(async () => new Blob(["png"], { type: "image/png" })),
}));

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

describe("poolside image export client", () => {
  beforeEach(() => {
    vi.mocked(toBlob).mockClear();

    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 1,
    });
  });

  it("resolves the full rendered note bounds for export", () => {
    const noteElement = document.createElement("article");
    defineElementLayout(noteElement, { width: 326, height: 278 });

    expect(resolvePoolsideNoteCaptureBounds(noteElement)).toEqual({
      height: 278,
      width: 326,
    });
  });

  it("passes explicit note dimensions to html-to-image so mobile export does not clip", async () => {
    const noteElement = document.createElement("article");
    defineElementLayout(noteElement, { width: 326, height: 278 });
    document.body.appendChild(noteElement);

    await getWorkoutPoolsideImageExportDriver().captureNoteBlob(noteElement);

    expect(toBlob).toHaveBeenCalledWith(
      noteElement,
      expect.objectContaining({
        backgroundColor: "#ffffff",
        cacheBust: true,
        height: 278,
        pixelRatio: 2,
        style: expect.objectContaining({
          height: "278px",
          maxHeight: "none",
          maxWidth: "none",
          transform: "none",
          width: "342px",
        }),
        width: 342,
      })
    );

    noteElement.remove();
  });
});
