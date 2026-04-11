"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildManualDrylandStarterDraft } from "@/lib/dryland/manual";
import type { DrylandSaveApiResponse, DrylandSessionKind } from "@/lib/dryland/shared";

type Props = {
  sessionKind: DrylandSessionKind;
  label: string;
  pendingLabel?: string;
  className?: string;
  testId?: string;
};

export default function CreateManualDrylandSessionButton({
  sessionKind,
  label,
  pendingLabel = "Creating session...",
  className = "",
  testId = "create-manual-dryland-session",
}: Props) {
  const router = useRouter();
  const [clientReady, setClientReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setClientReady(true);
  }, []);

  async function handleCreateSession() {
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/my-library/dryland", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceKind: "manual",
          sessionKind,
          draft: buildManualDrylandStarterDraft(sessionKind),
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as DrylandSaveApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        setError(
          responseBody && !responseBody.ok
            ? responseBody.error
            : "Could not create dryland session."
        );
        return;
      }

      router.push(`/my-library/dryland/${responseBody.session.id}`);
      router.refresh();
    } catch {
      setError("Could not create dryland session.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        data-testid={testId}
        data-client-ready={clientReady ? "true" : "false"}
        onClick={() => void handleCreateSession()}
        disabled={!clientReady || isCreating}
        className={className}
      >
        {isCreating ? pendingLabel : label}
      </button>
      {error ? (
        <p data-testid={`${testId}-error`} className="text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
