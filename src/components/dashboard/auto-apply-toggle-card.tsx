"use client";

import { useState } from "react";
import type { JobPreferencesData } from "@/lib/types";

interface Props {
  preferences: JobPreferencesData;
  onPreferencesChange: (prefs: JobPreferencesData) => void;
  className?: string;
  inline?: boolean;
}

export function AutoApplyToggleCard({
  preferences,
  onPreferencesChange,
  className = "",
  inline = false,
}: Props) {
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    const next = !preferences.autoApply;
    const payload = { ...preferences, autoApply: next };
    onPreferencesChange(payload);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: payload, refreshJobs: false }),
      });
      const data = await res.json();
      if (res.ok) onPreferencesChange(data.preferences);
      else onPreferencesChange({ ...preferences, autoApply: !next });
    } catch {
      onPreferencesChange({ ...preferences, autoApply: !next });
    } finally {
      setSaving(false);
    }
  }

  const toggleButton = (
    <button
      type="button"
      role="switch"
      aria-checked={preferences.autoApply}
      aria-label="Auto-apply to matching jobs"
      disabled={saving}
      onClick={() => void handleToggle()}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        preferences.autoApply
          ? inline
            ? "bg-cyan-500"
            : "bg-zinc-900 dark:bg-zinc-100"
          : inline
            ? "bg-slate-600"
            : "bg-zinc-300 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          inline ? "" : "dark:bg-zinc-900"
        } ${preferences.autoApply ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );

  if (inline) {
    return (
      <div
        className={`flex flex-1 items-center justify-between gap-4 px-4 py-3 sm:py-0 ${className}`}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Auto-apply
        </p>
        {toggleButton}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="card-label">Auto-apply</p>
        {toggleButton}
      </div>
    </div>
  );
}
