"use client";

import { useMemo, useState } from "react";
import { Save, RefreshCw, X } from "lucide-react";
import type { JobPreferencesData } from "@/lib/types";
import { INDUSTRY_OPTIONS } from "@/lib/types";
import {
  getCrossIndustryContext,
  getCrossIndustryTooltip,
  getTitleMetadata,
  type IndustryOption,
} from "@/lib/jobs/job-titles";
import { JobTitlesInput } from "@/components/ui/job-titles-input";
import { SalaryRangeSelect } from "@/components/ui/salary-range-select";
import { CrossIndustryTag } from "@/components/ui/cross-industry-tag";

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
  const [jobTitleDraft, setJobTitleDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const crossIndustry = useMemo(
    () => getCrossIndustryContext(preferences.jobTitles),
    [preferences.jobTitles]
  );

  const industryOptions = crossIndustry.hasCrossIndustry
    ? crossIndustry.relevantIndustries
    : [...INDUSTRY_OPTIONS];

  const preferredIndustry =
    preferences.industries.find((i) =>
      (industryOptions as readonly string[]).includes(i)
    ) ?? "";

  function updateJobTitles(jobTitles: string[]) {
    const ctx = getCrossIndustryContext(jobTitles);
    const industries = ctx.hasCrossIndustry
      ? preferences.industries.filter((i) =>
          ctx.relevantIndustries.includes(i as IndustryOption)
        )
      : preferences.industries;
    const next = { ...preferences, jobTitles, industries };
    onPreferencesChange(next);
    void persistJobTitles(next);
  }

  async function persistJobTitles(next: JobPreferencesData) {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: next, refreshJobs: false }),
      });
      const data = await res.json();
      if (res.ok) onPreferencesChange(data.preferences);
    } catch {
      // Keep optimistic local state if save fails.
    }
  }

  function addTitle() {
    const title = jobTitleDraft.trim();
    if (!title) return;

    const exists = preferences.jobTitles.some(
      (t) => t.toLowerCase() === title.toLowerCase()
    );
    if (exists) {
      setJobTitleDraft("");
      return;
    }

    updateJobTitles([...preferences.jobTitles, title]);
    setJobTitleDraft("");
  }

  function removeTitle(title: string) {
    updateJobTitles(preferences.jobTitles.filter((t) => t !== title));
  }

  function toggleIndustry(industry: string) {
    onPreferencesChange({
      ...preferences,
      industries: preferences.industries.includes(industry)
        ? preferences.industries.filter((i) => i !== industry)
        : [...preferences.industries, industry],
    });
  }

  function setPreferredIndustry(industry: string) {
    onPreferencesChange({
      ...preferences,
      industries: industry ? [industry] : [],
    });
  }

  async function saveAndRefresh() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences, refreshJobs: true }),
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
    ? "border-t border-slate-600/50 pt-4"
    : "border-t border-indigo-200/80 pt-4 dark:border-indigo-800";
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
    ? "text-white placeholder:text-slate-500"
    : "text-zinc-900 dark:text-zinc-100";

  const listContainerClass = glass
    ? "rounded-lg border border-slate-600/50 bg-slate-800/40 p-2.5"
    : "rounded-lg border border-indigo-200 bg-white/60 p-2.5 dark:border-indigo-800 dark:bg-indigo-950/40";

  const listItemClass = glass
    ? "flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-200"
    : "flex items-center gap-1.5 rounded-md border border-indigo-100 bg-white px-2 py-1 text-sm text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-50";

  return (
    <section className={outer}>
      <h2 className={titleText}>Preferences</h2>
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
        <div className="mb-2 grid grid-cols-1 items-start gap-2">
          <div className={`${listContainerClass} space-y-2`}>
            <div>
              <p className={`text-sm font-bold ${glass ? "text-white" : "text-indigo-950 dark:text-indigo-50"}`}>
                Your Position
              </p>
              <p className={`text-xs ${hintText}`}>
                Positions you&apos;re actively searching for
              </p>
            </div>
            {preferences.jobTitles.length === 0 ? (
              <p className={`text-xs ${hintText}`}>
                No titles added yet. Add a role below to build your search list.
              </p>
            ) : (
              <ul className="space-y-1">
                {preferences.jobTitles.map((title) => {
                  const { crossIndustry: isCrossIndustry } =
                    getTitleMetadata(title);
                  return (
                    <li key={title} className={listItemClass}>
                      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
                      {isCrossIndustry && (
                        <CrossIndustryTag
                          glass={glass}
                          showTooltip
                          tooltip={getCrossIndustryTooltip(title)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeTitle(title)}
                        className={`ml-auto shrink-0 rounded p-0.5 transition ${
                          glass
                            ? "text-slate-400 hover:bg-white/10 hover:text-white"
                            : "text-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900 dark:hover:text-indigo-200"
                        }`}
                        aria-label={`Remove ${title}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className={`border-t pt-2 ${glass ? "border-slate-600/40" : "border-indigo-200/80 dark:border-indigo-800"}`}>
              <label className={`mb-1 block text-xs font-bold ${glass ? "text-slate-200" : "text-indigo-900 dark:text-indigo-100"}`}>
                Add a job title
              </label>
              <JobTitlesInput
                value={jobTitleDraft}
                onChange={setJobTitleDraft}
                onAddTitle={addTitle}
                inputClassName={inputClass}
                glass={glass}
              />
            </div>
          </div>

          {crossIndustry.hasCrossIndustry && (
            <div className={`${listContainerClass} space-y-2`}>
              <div>
                <label htmlFor="preferred-industry" className={labelText}>
                  Desired Industry
                </label>
              </div>
              <select
                id="preferred-industry"
                value={preferredIndustry}
                onChange={(e) => setPreferredIndustry(e.target.value)}
                className={
                  glass
                    ? "w-full rounded-md border border-slate-600/60 bg-slate-700/50 px-3 py-2 text-sm text-white"
                    : "w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-zinc-100"
                }
              >
                  <option value="">Select an industry for your role…</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              <p className={hintText}>
                Options are tailored to your selected cross-industry role
                {crossIndustry.categories.length > 1 ? "s" : ""}.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className={divider}>
        <label className={`mb-1.5 block ${labelText}`}>Annual salary range (USD)</label>
        <SalaryRangeSelect
          salaryMin={preferences.salaryMin}
          salaryMax={preferences.salaryMax}
          onChange={(salaryMin, salaryMax) =>
            onPreferencesChange({ ...preferences, salaryMin, salaryMax })
          }
          className={
            glass
              ? "w-full rounded-md border border-slate-600/60 bg-slate-700/50 px-3 py-2 text-sm text-white"
              : "w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-indigo-700 dark:bg-indigo-950 dark:text-zinc-100"
          }
        />
      </div>

      <div className={divider}>
        <label className={`mb-2 block ${labelText}`}>
          {crossIndustry.hasCrossIndustry ? "Related industries" : "Industries"}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {industryOptions.map((industry) => {
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
