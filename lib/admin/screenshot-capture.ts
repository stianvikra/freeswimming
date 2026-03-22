export type AdminScreenshotCapturePhase =
  | "idle"
  | "requesting_permission"
  | "preview"
  | "saving"
  | "permission_denied"
  | "cancelled"
  | "unsupported"
  | "error";

export type AdminScreenshotSelection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AdminScreenshotFrame = {
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
};

export type AdminScreenshotCaptureFailure = {
  phase: Extract<
    AdminScreenshotCapturePhase,
    "permission_denied" | "cancelled" | "unsupported" | "error"
  >;
  message: string;
};

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function buildDefaultAdminScreenshotSelection(
  width: number,
  height: number
): AdminScreenshotSelection {
  return {
    x: 0,
    y: 0,
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

export function clampAdminScreenshotSelection(params: {
  selection: AdminScreenshotSelection;
  bounds: Pick<AdminScreenshotFrame, "width" | "height">;
}): AdminScreenshotSelection {
  const maxWidth = Math.max(1, Math.round(params.bounds.width));
  const maxHeight = Math.max(1, Math.round(params.bounds.height));
  const width = clampNumber(Math.round(params.selection.width), 1, maxWidth);
  const height = clampNumber(Math.round(params.selection.height), 1, maxHeight);
  const x = clampNumber(Math.round(params.selection.x), 0, maxWidth - width);
  const y = clampNumber(Math.round(params.selection.y), 0, maxHeight - height);

  return { x, y, width, height };
}

export function buildAdminScreenshotSelectionFromDrag(params: {
  start: { x: number; y: number };
  current: { x: number; y: number };
  bounds: Pick<AdminScreenshotFrame, "width" | "height">;
}): AdminScreenshotSelection {
  const rawSelection = {
    x: Math.min(params.start.x, params.current.x),
    y: Math.min(params.start.y, params.current.y),
    width: Math.abs(params.current.x - params.start.x),
    height: Math.abs(params.current.y - params.start.y),
  };

  return clampAdminScreenshotSelection({
    selection: {
      x: rawSelection.x,
      y: rawSelection.y,
      width: Math.max(1, rawSelection.width),
      height: Math.max(1, rawSelection.height),
    },
    bounds: params.bounds,
  });
}

export function buildAdminScreenshotFileName(now: Date = new Date()): string {
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  const minute = String(now.getUTCMinutes()).padStart(2, "0");
  const second = String(now.getUTCSeconds()).padStart(2, "0");

  return `admin-note-capture-${year}${month}${day}-${hour}${minute}${second}.png`;
}

export function classifyAdminScreenshotCaptureError(error: unknown): AdminScreenshotCaptureFailure {
  const name = typeof error === "object" && error && "name" in error ? String(error.name) : "";
  const message =
    typeof error === "object" && error && "message" in error ? String(error.message) : "";
  const normalizedName = name.trim().toLowerCase();
  const normalizedMessage = message.trim().toLowerCase();

  if (
    normalizedName === "notallowederror" ||
    normalizedName === "securityerror" ||
    normalizedMessage.includes("permission") ||
    normalizedMessage.includes("not allowed")
  ) {
    return {
      phase: "permission_denied",
      message:
        "Screenshot permission was denied. Retry capture or use Add images if you already have a screenshot file.",
    };
  }

  if (
    normalizedName === "aborterror" ||
    normalizedMessage.includes("cancel") ||
    normalizedMessage.includes("aborted")
  ) {
    return {
      phase: "cancelled",
      message:
        "Screenshot capture was cancelled before anything was saved. Retry when you are ready.",
    };
  }

  if (normalizedName === "notsupportederror" || normalizedMessage.includes("not supported")) {
    return {
      phase: "unsupported",
      message:
        "This browser does not support in-app screenshot capture yet. Use Add images instead.",
    };
  }

  return {
    phase: "error",
    message: "Could not capture a screenshot right now. Retry capture or use Add images instead.",
  };
}
