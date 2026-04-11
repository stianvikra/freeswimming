"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProgramSaveApiResponse } from "@/lib/programs/shared";

type Props = {
  label?: string;
  pendingLabel?: string;
  className?: string;
  testId?: string;
};

export default function CreateManualProgramButton({
  label = "Create program shell",
  pendingLabel = "Creating program shell...",
  className = "",
  testId = "create-manual-program",
}: Props) {
  const router = useRouter();
  const [clientReady, setClientReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setClientReady(true);
  }, []);

  async function handleCreate() {
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/my-library/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as ProgramSaveApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        setError(
          responseBody && !responseBody.ok ? responseBody.error : "Could not create program."
        );
        return;
      }

      router.push(`/my-library/programs/${responseBody.program.id}`);
      router.refresh();
    } catch {
      setError("Could not create program.");
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
        onClick={handleCreate}
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
