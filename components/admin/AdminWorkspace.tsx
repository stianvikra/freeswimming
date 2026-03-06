"use client";

import { useMemo, useState } from "react";
import AdminCommerceManager from "@/components/admin/AdminCommerceManager";
import AdminContentManager from "@/components/admin/AdminContentManager";
import AdminCategoriesManager from "@/components/admin/AdminCategoriesManager";
import AdminHelpCenter from "@/components/admin/AdminHelpCenter";
import AdminNotesManager from "@/components/admin/AdminNotesManager";
import AdminOperationsManager from "@/components/admin/AdminOperationsManager";
import AdminQrLinksManager from "@/components/admin/AdminQrLinksManager";

type AdminTab =
  | "content"
  | "qr-links"
  | "commerce"
  | "operations"
  | "notes"
  | "categories"
  | "help";

const TAB_LABELS: Array<{ id: AdminTab; label: string; subtitle: string }> = [
  {
    id: "content",
    label: "Content",
    subtitle: "Lessons, guides, and publish state",
  },
  {
    id: "qr-links",
    label: "QR Links",
    subtitle: "Stable redirect registry and ownership",
  },
  {
    id: "commerce",
    label: "Commerce",
    subtitle: "Products, titles, and active sales status",
  },
  {
    id: "operations",
    label: "Operations",
    subtitle: "Runtime flags and private-access status",
  },
  {
    id: "notes",
    label: "Notes",
    subtitle: "Internal tasks, categories, and completion status",
  },
  {
    id: "categories",
    label: "Categories",
    subtitle: "Manage note/content taxonomy for dashboard workflows",
  },
  {
    id: "help",
    label: "Help/Guide",
    subtitle: "How admin works, what each service does, and recovery playbooks",
  },
];

export default function AdminWorkspace() {
  const [activeTab, setActiveTab] = useState<AdminTab>("content");

  const activeMeta = useMemo(
    () => TAB_LABELS.find((tab) => tab.id === activeTab) ?? TAB_LABELS[0],
    [activeTab]
  );

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {TAB_LABELS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-testid={`admin-tab-${tab.id}`}
              className={[
                "rounded-2xl border px-4 py-3 text-left transition",
                isActive
                  ? "border-blue-300 bg-blue-50/70 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.12)]"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
              aria-pressed={isActive}
            >
              <p
                className={[
                  "text-sm font-semibold",
                  isActive ? "text-blue-800" : "text-slate-900",
                ].join(" ")}
              >
                {tab.label}
              </p>
              <p className="mt-1 text-xs text-slate-600">{tab.subtitle}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Active section
        </p>
        <p
          className="mt-1 text-sm font-semibold text-slate-900"
          data-testid="admin-active-section-label"
        >
          {activeMeta.label}
        </p>
        <p className="mt-1 text-sm text-slate-600">{activeMeta.subtitle}</p>
      </div>

      <div className="mt-6 space-y-6">
        {activeTab === "content" ? <AdminContentManager /> : null}
        {activeTab === "qr-links" ? <AdminQrLinksManager /> : null}
        {activeTab === "commerce" ? <AdminCommerceManager /> : null}
        {activeTab === "operations" ? <AdminOperationsManager /> : null}
        {activeTab === "notes" ? <AdminNotesManager /> : null}
        {activeTab === "categories" ? <AdminCategoriesManager /> : null}
        {activeTab === "help" ? <AdminHelpCenter /> : null}
      </div>
    </div>
  );
}
