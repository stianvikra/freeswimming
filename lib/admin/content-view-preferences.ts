import { ADMIN_CONTENT_TYPE_VALUES, type AdminContentType } from "@/lib/admin/content";

export type ContentPrimaryView = "course_workspace" | "all_content";

export const ALL_CONTENT_SCOPE_STORAGE_KEY = "fs_admin_all_content_scope";
export const CONTENT_PRIMARY_VIEW_STORAGE_KEY = "fs_admin_content_primary_view";

export function parseStoredAllContentScope(value: string | null): "all" | AdminContentType | null {
  if (!value) return null;
  if (value === "all") return "all";
  if (ADMIN_CONTENT_TYPE_VALUES.includes(value as AdminContentType)) {
    return value as AdminContentType;
  }
  return null;
}

export function parseStoredContentPrimaryView(value: string | null): ContentPrimaryView | null {
  if (value === "course_workspace" || value === "all_content") {
    return value;
  }
  return null;
}
