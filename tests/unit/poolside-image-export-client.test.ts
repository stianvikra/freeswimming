import { beforeEach, describe, expect, it, vi } from "vitest";
import { toBlob } from "html-to-image";
import {
  getWorkoutPoolsideImageExportDriver,
  resolvePoolsideNoteCaptureBounds,
} from "@/lib/workouts/poolside-image-export-client";

vi.mock("html-to-image", () => ({
  toBlob: vi.fn(async () => new Blob(["png"], { type: "image/png" })),
}));

function defineElementLayout(
  element: HTMLElement,
  size: { width: number; height: number; scrollWidth?: number; scrollHeight?: number }
) {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: size.height },
    clientWidth: { configurable: true, value: size.width },
    offsetHeight: { configurable: true, value: size.height },
    offsetWidth: { configurable: true, value: size.width },
    scrollHeight: { configurable: true, value: size.scrollHeight ?? size.height },
    scrollWidth: { configurable: true, value: size.scrollWidth ?? size.width },
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

  it("does not expand the export canvas for visual overflow", () => {
    const noteElement = document.createElement("article");
    const overflowingChild = document.createElement("div");
    defineElementLayout(noteElement, { width: 326, height: 278, scrollWidth: 340 });
    noteElement.appendChild(overflowingChild);
    overflowingChild.getBoundingClientRect = () =>
      ({
        bottom: 180,
        height: 40,
        left: 280,
        right: 340,
        top: 140,
        width: 60,
        x: 280,
        y: 140,
        toJSON: () => ({}),
      }) as DOMRect;

    expect(resolvePoolsideNoteCaptureBounds(noteElement)).toEqual({
      height: 278,
      width: 326,
    });
  });

  it("passes centered note dimensions to html-to-image so mobile export has no asymmetric margin", async () => {
    const noteElement = document.createElement("article");
    defineElementLayout(noteElement, { width: 326, height: 278 });
    document.body.appendChild(noteElement);

    await getWorkoutPoolsideImageExportDriver().captureNoteBlob(noteElement);

    const captureNode = vi.mocked(toBlob).mock.calls[0][0];

    expect(captureNode).not.toBe(noteElement);
    expect(captureNode.style.background).toBe("rgb(255, 255, 255)");
    expect(captureNode.style.height).toBe("294px");
    expect(captureNode.style.padding).toBe("8px");
    expect(captureNode.style.width).toBe("342px");
    expect(captureNode.firstElementChild).not.toBe(noteElement);
    expect((captureNode.firstElementChild as HTMLElement).style.boxShadow).toBe("none");
    expect((captureNode.firstElementChild as HTMLElement).style.margin).toBe("0px");
    expect((captureNode.firstElementChild as HTMLElement).style.width).toBe("326px");
    expect(captureNode.isConnected).toBe(false);
    expect(toBlob).toHaveBeenCalledWith(
      captureNode,
      expect.objectContaining({
        backgroundColor: "#ffffff",
        cacheBust: true,
        height: 294,
        pixelRatio: 2,
        width: 342,
      })
    );
    expect(vi.mocked(toBlob).mock.calls[0][1]).not.toHaveProperty("style");

    noteElement.remove();
  });
});
