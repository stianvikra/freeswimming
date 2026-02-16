const DEFAULT_NEXT_PATH = "/my-library";

export function getSafeNextPath(input: string | null | undefined): string {
  if (!input) return DEFAULT_NEXT_PATH;
  if (!input.startsWith("/")) return DEFAULT_NEXT_PATH;
  if (input.startsWith("//")) return DEFAULT_NEXT_PATH;
  return input;
}
