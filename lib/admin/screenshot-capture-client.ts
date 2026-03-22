import {
  buildAdminScreenshotFileName,
  clampAdminScreenshotSelection,
  type AdminScreenshotFrame,
  type AdminScreenshotSelection,
} from "@/lib/admin/screenshot-capture";

export type AdminScreenshotCaptureDriver = {
  isSupported: () => boolean;
  capture: () => Promise<AdminScreenshotFrame>;
  cropToFile: (params: {
    frame: AdminScreenshotFrame;
    selection: AdminScreenshotSelection;
  }) => Promise<File>;
};

declare global {
  interface Window {
    __FS_ADMIN_SCREENSHOT_CAPTURE_OVERRIDE__?: Partial<AdminScreenshotCaptureDriver>;
  }
}

function getAdminScreenshotCaptureOverride(): Partial<AdminScreenshotCaptureDriver> | undefined {
  if (typeof window === "undefined") return undefined;
  return window.__FS_ADMIN_SCREENSHOT_CAPTURE_OVERRIDE__;
}

function isBrowserCaptureSupported() {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);
}

function waitForLoadedVideoFrame(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.oncanplay = null;
      video.onerror = null;
    };

    const finish = (cb: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      cb();
    };

    video.onloadedmetadata = () => finish(resolve);
    video.oncanplay = () => finish(resolve);
    video.onerror = () => finish(() => reject(new Error("Could not read screenshot frame.")));
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Could not convert screenshot preview to image."));
    }, "image/png");
  });
}

async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not load screenshot preview."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function captureAdminScreenshotFrame(): Promise<AdminScreenshotFrame> {
  if (!isBrowserCaptureSupported()) {
    throw Object.assign(new Error("Browser capture is not supported."), {
      name: "NotSupportedError",
    });
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      frameRate: 1,
    },
    audio: false,
  });

  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = stream;

    const playback = video.play();
    await Promise.race([waitForLoadedVideoFrame(video), playback.catch(() => undefined)]);
    await playback.catch(() => undefined);

    const width = Math.max(1, video.videoWidth || 0);
    const height = Math.max(1, video.videoHeight || 0);

    if (!width || !height) {
      throw new Error("Could not read screenshot size from the selected source.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not prepare screenshot preview.");
    }

    context.drawImage(video, 0, 0, width, height);
    const blob = await canvasToBlob(canvas);

    return {
      blob,
      width,
      height,
      fileName: buildAdminScreenshotFileName(),
    };
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

async function cropAdminScreenshotToFile(params: {
  frame: AdminScreenshotFrame;
  selection: AdminScreenshotSelection;
}): Promise<File> {
  const normalizedSelection = clampAdminScreenshotSelection({
    selection: params.selection,
    bounds: params.frame,
  });
  const image = await loadImageFromBlob(params.frame.blob);
  const canvas = document.createElement("canvas");
  canvas.width = normalizedSelection.width;
  canvas.height = normalizedSelection.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare screenshot crop.");
  }

  context.drawImage(
    image,
    normalizedSelection.x,
    normalizedSelection.y,
    normalizedSelection.width,
    normalizedSelection.height,
    0,
    0,
    normalizedSelection.width,
    normalizedSelection.height
  );

  const blob = await canvasToBlob(canvas);
  return new File([blob], params.frame.fileName, {
    type: "image/png",
  });
}

export function getAdminScreenshotCaptureDriver(): AdminScreenshotCaptureDriver {
  return {
    isSupported() {
      const override = getAdminScreenshotCaptureOverride();
      if (override?.isSupported) {
        return override.isSupported();
      }
      if (override?.capture) {
        return true;
      }
      return isBrowserCaptureSupported();
    },
    async capture() {
      const override = getAdminScreenshotCaptureOverride();
      if (override?.capture) {
        return override.capture();
      }
      return captureAdminScreenshotFrame();
    },
    async cropToFile(params) {
      const override = getAdminScreenshotCaptureOverride();
      if (override?.cropToFile) {
        return override.cropToFile(params);
      }
      return cropAdminScreenshotToFile(params);
    },
  };
}
