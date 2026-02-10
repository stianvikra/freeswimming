"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import PageIntro from "@/components/PageIntro";

export default function AboutClient() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <PageIntro title="Our Method" subtitle="Learn. Drill. Swim." />

        {/* resten av innholdet ditt – uendret */}
      </PageTemplate>
    </SiteChrome>
  );
}
