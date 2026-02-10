// components/ui/mobileNavTheme.ts
export const MOBILE_NAV_SHELL =
  "rounded-[22px] bg-white/95 p-2 shadow-[0_8px_20px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur";

export const MOBILE_NAV_BUTTON_BASE =
  "inline-flex min-h-[46px] items-center justify-center rounded-2xl px-4 py-3 text-center text-[14px] font-semibold leading-none";

export const MOBILE_NAV_SKIN_MUTED = "bg-transparent text-slate-800";

export const MOBILE_NAV_SKIN_NEUTRAL =
  "bg-white/95 text-slate-900 ring-1 ring-slate-200/70 shadow-[0_2px_6px_rgba(15,23,42,0.06)]";

export const MOBILE_NAV_SKIN_ACTIVE =
  "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.16)]";

export const MOBILE_NAV_SKIN_PRIMARY =
  "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_5px_12px_rgba(37,99,235,0.18)]";

export const MOBILE_NAV_SKIN_DISABLED = "bg-transparent text-slate-400";

export const MOBILE_NAV_SEGMENT_ROW = "flex items-center gap-1 rounded-[18px] bg-slate-100/72 p-1";

export type MobileNavSkin = "muted" | "neutral" | "active" | "primary";

export const MOBILE_NAV_SKIN_CLASS: Record<MobileNavSkin, string> = {
  muted: MOBILE_NAV_SKIN_MUTED,
  neutral: MOBILE_NAV_SKIN_NEUTRAL,
  active: MOBILE_NAV_SKIN_ACTIVE,
  primary: MOBILE_NAV_SKIN_PRIMARY,
};

export function getMobileNavSkinClass(skin: MobileNavSkin, disabled = false) {
  return disabled ? MOBILE_NAV_SKIN_DISABLED : MOBILE_NAV_SKIN_CLASS[skin];
}
