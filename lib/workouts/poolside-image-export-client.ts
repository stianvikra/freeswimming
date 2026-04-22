import { toBlob } from "html-to-image";

const CAPTURE_EDGE_PADDING_PX = 8;

export type WorkoutPoolsideImageExportDriver = {
  captureNoteBlob: (noteElement: HTMLElement) => Promise<Blob>;
};

declare global {
  interface Window {
    __FS_WORKOUT_POOLSIDE_IMAGE_EXPORT_OVERRIDE__?: Partial<WorkoutPoolsideImageExportDriver>;
  }
}

function getPoolsideImageExportOverride(): Partial<WorkoutPoolsideImageExportDriver> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.__FS_WORKOUT_POOLSIDE_IMAGE_EXPORT_OVERRIDE__;
}

function waitForImageReady(image: HTMLImageElement) {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
    };

    const finish = (cb: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      cb();
    };

    image.onload = () => finish(resolve);
    image.onerror = () =>
      finish(() => reject(new Error("Poolside note assets are not ready to export yet.")));
  });
}

async function waitForDocumentAssets(document: Document) {
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  await fontsReady.catch(() => undefined);

  const images = Array.from(document.images);
  await Promise.all(images.map((image) => waitForImageReady(image)));
}

function waitForNextFrame(document: Document) {
  const frameWindow = document.defaultView ?? window;

  return new Promise<void>((resolve) => {
    if (typeof frameWindow.requestAnimationFrame === "function") {
      frameWindow.requestAnimationFrame(() => resolve());
      return;
    }

    frameWindow.setTimeout(resolve, 0);
  });
}

export function resolvePoolsideNoteCaptureBounds(noteElement: HTMLElement) {
  const rect = noteElement.getBoundingClientRect();
  const width = Math.ceil(Math.max(rect.width, noteElement.offsetWidth));
  const height = Math.ceil(
    Math.max(rect.height, noteElement.offsetHeight, noteElement.scrollHeight)
  );

  if (width <= 0 || height <= 0) {
    throw new Error("Poolside note is not ready to export yet. Try again.");
  }

  return { width, height };
}

function createPoolsideNoteCaptureWrapper(noteElement: HTMLElement, width: number, height: number) {
  const document = noteElement.ownerDocument;
  const captureWidth = width + CAPTURE_EDGE_PADDING_PX * 2;
  const captureHeight = height + CAPTURE_EDGE_PADDING_PX * 2;
  const wrapper = document.createElement("div");
  const noteClone = noteElement.cloneNode(true) as HTMLElement;

  wrapper.setAttribute("aria-hidden", "true");
  wrapper.style.background = "#ffffff";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.height = `${captureHeight}px`;
  wrapper.style.left = "0";
  wrapper.style.overflow = "visible";
  wrapper.style.padding = `${CAPTURE_EDGE_PADDING_PX}px`;
  wrapper.style.pointerEvents = "none";
  wrapper.style.position = "fixed";
  wrapper.style.top = "0";
  wrapper.style.width = `${captureWidth}px`;
  wrapper.style.zIndex = "2147483647";

  noteClone.style.height = `${height}px`;
  noteClone.style.margin = "0";
  noteClone.style.maxHeight = "none";
  noteClone.style.maxWidth = "none";
  noteClone.style.boxShadow = "none";
  noteClone.style.width = `${width}px`;

  wrapper.appendChild(noteClone);
  document.body.appendChild(wrapper);

  return wrapper;
}

async function capturePoolsideNoteBlob(noteElement: HTMLElement) {
  await waitForDocumentAssets(noteElement.ownerDocument);
  await waitForNextFrame(noteElement.ownerDocument);
  await waitForNextFrame(noteElement.ownerDocument);

  const { width, height } = resolvePoolsideNoteCaptureBounds(noteElement);
  const captureWidth = width + CAPTURE_EDGE_PADDING_PX * 2;
  const captureHeight = height + CAPTURE_EDGE_PADDING_PX * 2;
  const pixelRatio =
    typeof window === "undefined" ? 2 : Math.max(2, Math.min(3, window.devicePixelRatio || 1));

  const captureWrapper = createPoolsideNoteCaptureWrapper(noteElement, width, height);

  try {
    await waitForNextFrame(noteElement.ownerDocument);

    const blob = await toBlob(captureWrapper, {
      backgroundColor: "#ffffff",
      cacheBust: true,
      height: captureHeight,
      pixelRatio,
      width: captureWidth,
    });

    if (!blob) {
      throw new Error("Could not capture the poolside note image.");
    }

    return blob;
  } finally {
    captureWrapper.remove();
  }
}

export function getWorkoutPoolsideImageExportDriver(): WorkoutPoolsideImageExportDriver {
  return {
    async captureNoteBlob(noteElement) {
      const override = getPoolsideImageExportOverride();
      if (override?.captureNoteBlob) {
        return override.captureNoteBlob(noteElement);
      }

      return capturePoolsideNoteBlob(noteElement);
    },
  };
}
