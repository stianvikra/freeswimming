// app/course/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";

export default function CoursePage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <h1 className="text-2xl font-semibold text-slate-900">Free Course</h1>
        <p className="mt-3 text-slate-700">
          Placeholder page for MVP. Put your YouTube playlist embed or course modules here.
        </p>
      </PageTemplate>
    </SiteChrome>
  );
}