const QR_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_QR_SLUG_LENGTH = 2;
const MAX_QR_SLUG_LENGTH = 120;

export function normalizeQrSlug(value: string): string {
  return value.trim().toLowerCase();
}

export function isQrSlug(value: string): boolean {
  if (value.length < MIN_QR_SLUG_LENGTH || value.length > MAX_QR_SLUG_LENGTH) {
    return false;
  }

  return QR_SLUG_PATTERN.test(value);
}

export function parseQrSlug(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = normalizeQrSlug(value);
  return isQrSlug(normalized) ? normalized : null;
}
