// app/programs/page.tsx
 "use client";

 import SiteChrome from "@/components/SiteChrome";
 import PageTemplate from "@/components/PageTemplate";

export default function ProgramsPage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <h1 className="text-2xl font-semibold text-slate-900">Swim Programs</h1>
        <p className="mt-3 text-slate-700">
          Placeholder page for MVP. Add your PDFs, plans, and links here.
        </p>
      </PageTemplate>
    </SiteChrome>
  );
}


