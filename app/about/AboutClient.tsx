"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import Image from "next/image";

export default function AboutClient() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/logos/01_icon_transparent.png"
              alt="Freeswimming logo"
              fill
              className="object-contain"
              sizes="48px"
            />
          </div>

          <div className="leading-tight">
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
              How we teach
            </h1>
            <p className="mt-1 text-[14px] font-medium text-slate-600">
              Learn. Drill. Swim.
            </p>
          </div>
        </div>

        {/* resten av innholdet ditt – uendret */}
      </PageTemplate>
    </SiteChrome>
  );
}
