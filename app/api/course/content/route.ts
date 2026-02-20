import { NextResponse } from "next/server";
import { COURSE_MODULES } from "@/app/course/courseData";
import { loadPublishedCourseModules } from "@/lib/admin/content-course";

export const dynamic = "force-dynamic";

function noStoreJson(
  body: Record<string, unknown>,
  init?: {
    status?: number;
  }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  try {
    const modules = await loadPublishedCourseModules();
    return noStoreJson({
      ok: true,
      modules: modules.length > 0 ? modules : COURSE_MODULES,
    });
  } catch (error) {
    console.error("[CourseContent] Could not load published course modules", error);
    return noStoreJson({
      ok: true,
      modules: COURSE_MODULES,
    });
  }
}
