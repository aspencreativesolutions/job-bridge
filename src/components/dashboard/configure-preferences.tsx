"use client";

import { useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import type { JobPreferencesData } from "@/lib/types";
import { INDUSTRY_OPTIONS } from "@/lib/types";

interface Props {
  initialPreferences: JobPreferencesData;
  onSaved: (prefs: JobPreferencesData, scanResult?: { newJobs: number; applicationsCreated: number }) => void;
}

export function ConfigurePreferences({ initialPreferences, onSaved }: Props) {
  const [preferences, setPreferences] =
    useState<JobPreferencesData>(initialPreferences);
  const [jobTitleInput, setJobTitleInput] = useState(
    initialPreferences.jobTitles.join(", ")
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggleIndustry(industry: string) {
    setPreferences((p) => ({
      ...p,
      industries: p.industries.includes(industry)
        ? p.industries.filter((i) => i !== industry)
        : [...p.industries, industry],
    }));
  }

  async function saveAndRefresh() {
    setSaving(true);
    setMessage("");
    const jobTitles = jobTitleInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = { ...preferences, jobTitles };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: payload, refreshJobs: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Save failed");

      setPreferences(data.preferences);
      onSaved(data.preferences, data.scanResult);

      const newJobs = data.scanResult?.newJobs ?? 0;
      const apps = data.scanResult?.applicationsCreated ?? 0;
      setMessage(
        `Preferences saved. ${newJobs} new job(s) found${apps > 0 ? `, ${apps} auto-applied` : ""}.`
      );
    } catch {
      setMessage("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-md ring-1 ring-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:ring-indigo-900">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-indigo-950 dark:text-indigo-50">
          Configure Preferences
        </h2>
        <p className="mt-1 text-sm text-indigo-700/80 dark:text-indigo-300/80">
          Set your job search criteria. Saving refreshes your job feed.
        </p>
      </div>

      {message && (
        <p className="mb-4 rounded-md bg-white/70 px-3 py-2 text-sm font-medium text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100">
          {message}
        </p>
      )}

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-indigo-900 dark:text-indigo-100">
            Job titles
          </label>
          <input
            className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-zinc-100"
            value={jobTitleInput}
            onChange={(e) => setJobTitleInput(e.target.value)}
            placeholder="Software Engineer, Product Manager"
          />
          <p className="mt-1 text-xs text-indigo-600/70 dark:text-indigo-400/70">
            Comma-separated
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-indigo-900 dark:text-indigo-100">
            Annual salary range (USD)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1000}
              className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-zinc-100"
              placeholder="Min"
              value={preferences.salaryMin ?? ""}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  salaryMin: e.target.value ? parseInt(e.target.value, 10) : null,
                }))
              }
            />
            <span className="shrink-0 font-bold text-indigo-300">–</span>
            <input
              type="number"
              min={0}
              step={1000}
              className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-zinc-100"
              placeholder="Max"
              value={preferences.salaryMax ?? ""}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  salaryMax: e.target.value ? parseInt(e.target.value, 10) : null,
                }))
              }
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-indigo-900 dark:text-indigo-100">
            Industries
          </label>
          <div className="flex flex-wrap gap-1.5">
            {INDUSTRY_OPTIONS.map((industry) => {
              const selected = preferences.industries.includes(industry);
              return (
                <button
                  key={industry}
                  type="button"
                  onClick={() => toggleIndustry(industry)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    selected
                      ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-400 dark:text-indigo-950"
                      : "border border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:border-indigo-500"
                  }`}
                >
                  {industry}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-indigo-200 bg-white/60 p-3 dark:border-indigo-800 dark:bg-indigo-900/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                Auto-Apply
              </p>
              <p className="mt-0.5 text-xs text-indigo-700/80 dark:text-indigo-300/80">
                {preferences.autoApply
                  ? "Matching jobs are applied automatically and marked Applied."
                  : "Jobs appear with an Apply button for manual submission."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.autoApply}
              aria-label="Auto-apply to matching jobs"
              onClick={() =>
                setPreferences((p) => ({ ...p, autoApply: !p.autoApply }))
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                preferences.autoApply
                  ? "bg-indigo-600 dark:bg-indigo-400"
                  : "bg-indigo-200 dark:bg-indigo-800"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  preferences.autoApply ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={saveAndRefresh}
        disabled={saving}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {saving ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Saving…" : "Save & refresh jobs"}
      </button>
    </section>
  );
}
