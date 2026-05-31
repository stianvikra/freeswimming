"use client";

import { startTransition, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminNoteQuickCaptureLauncher from "@/components/admin/AdminNoteQuickCaptureLauncher";
import AdminCommerceManager from "@/components/admin/AdminCommerceManager";
import AdminContentManager from "@/components/admin/AdminContentManager";
import AdminCategoriesManager from "@/components/admin/AdminCategoriesManager";
import AdminEmailTemplatesManager from "@/components/admin/AdminEmailTemplatesManager";
import AdminHelpCenter, { ADMIN_HELP_QUICK_ACTIONS } from "@/components/admin/AdminHelpCenter";
import AdminMessagesManager from "@/components/admin/AdminMessagesManager";
import AdminNotesManager from "@/components/admin/AdminNotesManager";
import AdminOperationsManager from "@/components/admin/AdminOperationsManager";
import AdminQrLinksManager from "@/components/admin/AdminQrLinksManager";
import { cx } from "@/components/ui/cx";
import type { AdminRole } from "@/lib/admin/access";
import {
  applyAdminTabToSearchParams,
  parseAdminTab,
  type AdminTab,
} from "@/lib/admin/admin-workspace";

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
    id: "email-templates",
    label: "Email templates",
    subtitle: "Draft, review, publish, and rollback-safe message copy",
  },
  {
    id: "messages",
    label: "Messages",
    subtitle: "Stored intake, triage status, and notification diagnostics",
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

const adminTabButtonBaseClass =
  "fs-library-card w-full p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const adminTabActiveClass = "fs-library-card-accent border-[color:var(--fs-border-brand)]";
const adminTabInactiveClass = "hover:border-[color:var(--fs-border-brand)] hover:bg-white";
const adminHelpSubnavClass =
  "hidden rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 p-3 lg:block";
const adminHelpSubnavLinkClass =
  "block rounded-[var(--fs-radius-control)] px-3 py-2 text-xs font-semibold text-[color:var(--fs-color-muted)] transition-colors hover:bg-white hover:text-[color:var(--fs-color-brand-700)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700";
const adminShellActionClass =
  "fs-cta-secondary inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const adminCardHeadingClass = "text-base font-semibold text-[color:var(--fs-color-ink-strong)]";
const adminMutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";

type Props = {
  role: AdminRole | null;
};

export default function AdminWorkspace({ role }: Props) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = useMemo(
    () => parseAdminTab(searchParams?.get("tab") ?? null) ?? "content",
    [searchParams]
  );

  const activeMeta = useMemo(
    () => TAB_LABELS.find((tab) => tab.id === activeTab) ?? TAB_LABELS[0],
    [activeTab]
  );

  function selectTab(tab: AdminTab) {
    const nextParams = applyAdminTabToSearchParams(
      new URLSearchParams(searchParams?.toString() ?? ""),
      tab
    );
    const nextHref = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextHref, { scroll: false });
    });
  }

  return (
    <div className="contents" data-testid="admin-workspace-shell">
      <nav
        aria-label="Admin sections"
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:sticky lg:top-28 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:max-h-[calc(100vh-8rem)] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1"
        data-testid="admin-tab-grid"
      >
        {activeTab === "help" ? (
          <nav
            aria-label="Help/Guide sections"
            className={adminHelpSubnavClass}
            data-testid="admin-help-subnav"
          >
            <p className="px-3 text-[11px] font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase">
              On this page
            </p>
            <div className="mt-2 space-y-1">
              {ADMIN_HELP_QUICK_ACTIONS.map((action) => (
                <a
                  key={action.id}
                  href={`#${action.id}`}
                  className={adminHelpSubnavLinkClass}
                  data-testid={`admin-help-subnav-${action.id}`}
                >
                  {action.label}
                </a>
              ))}
            </div>
          </nav>
        ) : null}

        {TAB_LABELS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <div key={tab.id}>
              <button
                type="button"
                onClick={() => selectTab(tab.id)}
                data-testid={`admin-tab-${tab.id}`}
                className={cx(
                  adminTabButtonBaseClass,
                  isActive ? adminTabActiveClass : adminTabInactiveClass
                )}
                aria-pressed={isActive}
              >
                <p
                  className={cx(
                    "text-sm font-semibold",
                    isActive ? "text-[color:var(--fs-color-brand-700)]" : "text-slate-900"
                  )}
                >
                  {tab.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[color:var(--fs-color-muted)]">
                  {tab.subtitle}
                </p>
              </button>
            </div>
          );
        })}
      </nav>

      <div className="mt-6 min-w-0 lg:col-start-2" data-testid="admin-workspace-main">
        <div
          className="fs-library-card fs-library-card-muted p-4 sm:p-5"
          data-testid="admin-active-section-panel"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                Active section
              </p>
              <p
                className={`mt-1 ${adminCardHeadingClass}`}
                data-testid="admin-active-section-label"
              >
                {activeMeta.label}
              </p>
              <p className={`mt-1 ${adminMutedTextClass}`}>{activeMeta.subtitle}</p>
            </div>
            <AdminNoteQuickCaptureLauncher
              adminRole={role}
              contextType="page"
              contextRef="/admin"
              contextLabel="Admin dashboard"
              triggerLabel="Quick note"
              triggerTestId="admin-workspace-quick-note-trigger"
              triggerClassName={adminShellActionClass}
              description="Capture a page-level admin note from the dashboard without switching to the Notes tab first."
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {activeTab === "content" ? <AdminContentManager /> : null}
          {activeTab === "qr-links" ? <AdminQrLinksManager /> : null}
          {activeTab === "commerce" ? <AdminCommerceManager /> : null}
          {activeTab === "operations" ? <AdminOperationsManager /> : null}
          {activeTab === "email-templates" ? <AdminEmailTemplatesManager /> : null}
          {activeTab === "messages" ? <AdminMessagesManager adminRole={role} /> : null}
          {activeTab === "notes" ? <AdminNotesManager /> : null}
          {activeTab === "categories" ? <AdminCategoriesManager /> : null}
          {activeTab === "help" ? <AdminHelpCenter /> : null}
        </div>
      </div>
    </div>
  );
}
