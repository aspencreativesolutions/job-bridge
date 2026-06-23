"use client";

import { useState, useTransition } from "react";
import { Loader2, Link2 } from "lucide-react";
import { signInWithLinkedIn } from "@/app/actions/auth";

interface Props {
  hasLinkedInAccount: boolean;
  onConnected: () => void;
}

export function ConnectLinkedInGate({ hasLinkedInAccount, onConnected }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function connect() {
    setError("");

    if (!hasLinkedInAccount) {
      startTransition(async () => {
        try {
          await signInWithLinkedIn("/dashboard");
        } catch {
          setError("LinkedIn sign-in failed. Please try again.");
        }
      });
      return;
    }

    setLoading(true);
    fetch("/api/linkedin/connect", { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Connection failed");
        onConnected();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Connection failed");
      })
      .finally(() => setLoading(false));
  }

  const busy = loading || isPending;

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0A66C2]/40 bg-[#0A66C2]/5 px-6 py-16 text-center dark:border-[#0A66C2]/30 dark:bg-[#0A66C2]/10">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#0A66C2]/15">
        <Link2 className="h-8 w-8 text-[#0A66C2]" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Connect your LinkedIn profile
      </h2>
      <p className="mt-3 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        Job Bridge needs your LinkedIn metadata — skills, experience, education,
        headline, and job preferences — to personalize your dashboard and job
        matches.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={connect}
        disabled={busy}
        className="mt-8 flex items-center gap-2 rounded-md bg-[#0A66C2] px-6 py-3 text-sm font-bold text-white hover:bg-[#004182] disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Link2 className="h-5 w-5" />
        )}
        {busy ? "Connecting…" : "Connect LinkedIn"}
      </button>

      <p className="mt-4 text-xs text-zinc-500">
        Required before you can use your job feed and preferences.
      </p>
    </div>
  );
}
