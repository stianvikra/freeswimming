export const USER_DELETE_CONFIRM_VALUE = "DELETE";

type ParseUserDeleteRequestBodyResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

export function parseUserDeleteRequestBody(body: unknown): ParseUserDeleteRequestBodyResult {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      error: "Invalid JSON.",
      status: 400,
    };
  }

  const confirm = "confirm" in body ? String((body as { confirm?: unknown }).confirm ?? "") : "";
  if (confirm !== USER_DELETE_CONFIRM_VALUE) {
    return {
      ok: false,
      error: `Confirmation required. Send confirm=\"${USER_DELETE_CONFIRM_VALUE}\".`,
      status: 400,
    };
  }

  return { ok: true };
}
