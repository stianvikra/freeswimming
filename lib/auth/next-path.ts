const DEFAULT_NEXT_PATH = "/my-library";

export function getSafeNextPath(
  input: string | null | undefined,
  fallback = DEFAULT_NEXT_PATH
): string {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  return input;
}
