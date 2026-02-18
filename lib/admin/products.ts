export type UpdateAdminProductPayload = {
  title?: unknown;
  active?: unknown;
};

type UpdateAdminProductNormalized = {
  title?: string;
  active?: boolean;
};

type ParseUpdateAdminProductResult =
  | {
      ok: true;
      value: UpdateAdminProductNormalized;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasOwn(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

export function parseUpdateAdminProductPayload(
  payload: UpdateAdminProductPayload
): ParseUpdateAdminProductResult {
  const source = payload as Record<string, unknown>;
  const value: UpdateAdminProductNormalized = {};
  let changes = 0;

  if (hasOwn(source, "title")) {
    const title = normalizeString(payload.title);
    if (title.length < 2 || title.length > 120) {
      return { ok: false, error: "Title must be between 2 and 120 characters." };
    }
    value.title = title;
    changes += 1;
  }

  if (hasOwn(source, "active")) {
    if (typeof payload.active !== "boolean") {
      return { ok: false, error: "active must be true or false." };
    }
    value.active = payload.active;
    changes += 1;
  }

  if (changes === 0) {
    return { ok: false, error: "No updatable fields were provided." };
  }

  return {
    ok: true,
    value,
  };
}
