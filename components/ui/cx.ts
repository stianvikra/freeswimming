// components/ui/cx.ts
export function cx(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}
