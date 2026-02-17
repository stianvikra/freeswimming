"use client";

import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

type Props = {
  showExploreTab: boolean;
};

const TAB_CLASS =
  "inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100";

export default function LibrarySectionTabs({ showExploreTab }: Props) {
  function trackTab(tab: "library" | "explore") {
    void sendClientAnalyticsEvent("library_tab_switched", {
      tab,
      source: "library_section_nav",
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href="#my-library-owned"
        onClick={() => trackTab("library")}
        className={TAB_CLASS}
        aria-label="Jump to owned items"
      >
        My Library
      </a>
      {showExploreTab ? (
        <a
          href="#my-library-explore"
          onClick={() => trackTab("explore")}
          className={TAB_CLASS}
          aria-label="Jump to explore section"
        >
          Explore More
        </a>
      ) : null}
    </div>
  );
}
