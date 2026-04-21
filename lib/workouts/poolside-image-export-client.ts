import { toBlob } from "html-to-image";

const CAPTURE_EDGE_SAFETY_PX = 16;

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
  const width = Math.ceil(Math.max(rect.width, noteElement.offsetWidth, noteElement.scrollWidth));
  const height = Math.ceil(
    Math.max(rect.height, noteElement.offsetHeight, noteElement.scrollHeight)
  );

  if (width <= 0 || height <= 0) {
    throw new Error("Poolside note is not ready to export yet. Try again.");
  }

  return { width, height };
}

async function capturePoolsideNoteBlob(noteElement: HTMLElement) {
  await waitForDocumentAssets(noteElement.ownerDocument);
  await waitForNextFrame(noteElement.ownerDocument);
  await waitForNextFrame(noteElement.ownerDocument);

  const { width, height } = resolvePoolsideNoteCaptureBounds(noteElement);
  const captureWidth = width + CAPTURE_EDGE_SAFETY_PX;
  const pixelRatio =
    typeof window === "undefined" ? 2 : Math.max(2, Math.min(3, window.devicePixelRatio || 1));

  const blob = await toBlob(noteElement, {
    backgroundColor: "#ffffff",
    cacheBust: true,
    height,
    pixelRatio,
    style: {
      height: `${height}px`,
      maxHeight: "none",
      maxWidth: "none",
      transform: "none",
      width: `${captureWidth}px`,
    },
    width: captureWidth,
  });

  if (!blob) {
    throw new Error("Could not capture the poolside note image.");
  }

  return blob;
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
