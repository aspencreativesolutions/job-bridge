"use client";

import { useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import type { JobPreferencesData } from "@/lib/types";
import { INDUSTRY_OPTIONS } from "@/lib/types";
import { JobTitlesInput } from "@/components/ui/job-titles-input";
import { SalaryRangeSelect } from "@/components/ui/salary-range-select";

interface Props {
  preferences: JobPreferencesData;
  onPreferencesChange: (prefs: JobPreferencesData) => void;
  onSaved: (prefs: JobPreferencesData, scanResult?: { newJobs: number; applicationsCreated: number }) => void;
  glass?: boolean;
}

export function ConfigurePreferences({
  preferences,
  onPreferencesChange,
  onSaved,
  glass,
}: Props) {
  const [jobTitleInput, setJobTitleInput] = useState(
    preferences.jobTitles.join(", ")
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggleIndustry(industry: string) {
    onPreferencesChange({
      ...preferences,
      industries: preferences.industries.includes(industry)
        ? preferences.industries.filter((i) => i !== industry)
        : [...preferences.industries, industry],
    });
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

      onPreferencesChange(data.preferences);
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

  const outer = glass
    ? "dash-box"
    : "rounded-xl border border-indigo-200 bg-indigo-50 shadow-md dark:border-indigo-800 dark:bg-indigo-950/60";
  const divider = glass
    ? "border-t border-slate-600/50 pt-5"
    : "border-t border-indigo-200/80 pt-5 dark:border-indigo-800";
  const titleText = glass
    ? "text-lg font-bold text-white"
    : "text-xl font-bold text-indigo-950 dark:text-indigo-50";
  const subText = glass
    ? "text-sm text-slate-400"
    : "text-sm text-indigo-700/80 dark:text-indigo-300/80";
  const labelText = glass
    ? "text-sm font-bold text-slate-200"
    : "text-sm font-bold text-indigo-900 dark:text-indigo-100";
  const hintText = glass
    ? "text-xs text-slate-500"
    : "text-xs text-indigo-600/70 dark:text-indigo-400/70";
  const inputClass = glass
    ? "w-full rounded-md border border-slate-600/60 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder:text-slate-500"
    : "w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-zinc-100";

  return (
    <section className={outer}>
      <h2 className={titleText}>Configure Preferences</h2>
      <p className={`mt-1 ${subText}`}>
        Set your job search criteria. Saving refreshes your job feed.
      </p>

      {message && (
        <p
          className={`mt-3 rounded-md border px-3 py-2 text-sm font-medium ${
            glass
              ? "border-white/10 bg-white/5 text-slate-200"
              : "bg-white/70 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100"
          }`}
        >
          {message}
        </p>
      )}

      <div className={divider}>
        <label className={`mb-1.5 block ${labelText}`}>Job titles</label>
        <JobTitlesInput
          value={jobTitleInput}
          onChange={(value) => {
            setJobTitleInput(value);
            const jobTitles = value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            onPreferencesChange({ ...preferences, jobTitles });
          }}
          inputClassName={inputClass}
        />
        <p className={`mt-1 ${hintText}`}>
          Comma-separated — type to see suggestions, or enter a custom title
        </p>
      </div>

      <div className={divider}>
        <label className={`mb-1.5 block ${labelText}`}>Annual salary range (USD)</label>
        <SalaryRangeSelect
          salaryMin={preferences.salaryMin}
          salaryMax={preferences.salaryMax}
          onChange={(salaryMin, salaryMax) =>
            onPreferencesChange({ ...preferences, salaryMin, salaryMax })
          }
          className={inputClass}
        />
      </div>

      <div className={divider}>
        <label className={`mb-2 block ${labelText}`}>Industries</label>
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
                    ? glass
                      ? "bg-violet-500 text-white shadow-sm"
                      : "bg-indigo-600 text-white shadow-sm dark:bg-indigo-400 dark:text-indigo-950"
                    : glass
                      ? "border border-slate-600/60 bg-slate-700/50 text-slate-300 hover:border-violet-400/50"
                      : "border border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:border-indigo-500"
                }`}
              >
                {industry}
              </button>
            );
          })}
        </div>
      </div>

      <div className={divider}>
        <button
          onClick={saveAndRefresh}
          disabled={saving}
          className={
            glass
              ? "flex w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-500 disabled:opacity-50"
              : "flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          }
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving…" : "Save & refresh jobs"}
        </button>
      </div>
    </section>
  );
}
