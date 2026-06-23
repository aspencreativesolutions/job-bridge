"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import type { JobPreferencesData } from "@/lib/types";

interface Props {
  initialPreferences: JobPreferencesData;
  initialCoverLetter: string;
  linkedInConnected: boolean;
}

export function SettingsPanel({
  initialPreferences,
  initialCoverLetter,
  linkedInConnected,
}: Props) {
  const [preferences, setPreferences] =
    useState<JobPreferencesData>(initialPreferences);
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateList(
    field: "jobTitles" | "industries" | "locations" | "keywords",
    value: string
  ) {
    setPreferences((p) => ({
      ...p,
      [field]: value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences, coverLetter }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Settings saved.");
    } catch {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-sm text-zinc-500">
            Configure job filters, notifications, auto-apply, and cover letter.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>

      {message && (
        <p className="rounded-md bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-900">
          {message}
        </p>
      )}

      <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="section-title mb-4">LinkedIn</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Connect LinkedIn to search jobs with your OAuth token.
        </p>
        {linkedInConnected ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Connected
          </span>
        ) : (
          <a
            href="/login"
            className="inline-flex rounded-md bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white hover:bg-[#004182]"
          >
            Connect LinkedIn
          </a>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="section-title mb-4">Job filters</h2>
        <div className="grid gap-4">
          <ListField
            label="Target job titles (comma-separated)"
            value={preferences.jobTitles.join(", ")}
            onChange={(v) => updateList("jobTitles", v)}
            placeholder="Software Engineer, Product Manager"
          />
          <ListField
            label="Industries (comma-separated)"
            value={preferences.industries.join(", ")}
            onChange={(v) => updateList("industries", v)}
            placeholder="Technology, Finance, Healthcare"
          />
          <ListField
            label="Locations (comma-separated)"
            value={preferences.locations.join(", ")}
            onChange={(v) => updateList("locations", v)}
            placeholder="Remote, San Francisco, New York"
          />
          <ListField
            label="Keywords (comma-separated)"
            value={preferences.keywords.join(", ")}
            onChange={(v) => updateList("keywords", v)}
            placeholder="React, TypeScript, remote"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Min salary (USD / yr)</span>
              <input
                type="number"
                min={0}
                step={1000}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={preferences.salaryMin ?? ""}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    salaryMin: e.target.value ? parseInt(e.target.value, 10) : null,
                  }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-500">Max salary (USD / yr)</span>
              <input
                type="number"
                min={0}
                step={1000}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={preferences.salaryMax ?? ""}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    salaryMax: e.target.value ? parseInt(e.target.value, 10) : null,
                  }))
                }
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">
              Scan interval (minutes)
            </span>
            <input
              type="number"
              min={15}
              max={1440}
              className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={preferences.scanIntervalMin}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  scanIntervalMin: parseInt(e.target.value, 10) || 60,
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="section-title mb-4">Notifications & auto-apply</h2>
        <div className="space-y-3">
          <Toggle
            label="In-app notifications for new jobs"
            checked={preferences.notifyInApp}
            onChange={(v) =>
              setPreferences((p) => ({ ...p, notifyInApp: v }))
            }
          />
          <Toggle
            label="Email notifications for new jobs"
            checked={preferences.notifyEmail}
            onChange={(v) =>
              setPreferences((p) => ({ ...p, notifyEmail: v }))
            }
          />
          <Toggle
            label="Auto-apply to new matching jobs"
            checked={preferences.autoApply}
            onChange={(v) =>
              setPreferences((p) => ({ ...p, autoApply: v }))
            }
          />
          {preferences.autoApply && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Auto-apply sends your active resume and cover letter. Jobs requiring
              extra fields are logged for your review.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="section-title mb-2">Cover letter template</h2>
        <p className="mb-4 text-xs text-zinc-500">
          Use {"{{job_title}}"}, {"{{company}}"}, {"{{name}}"}, {"{{summary}}"} as
          placeholders.
        </p>
        <textarea
          className="w-full rounded-md border border-zinc-300 p-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          rows={12}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
      </section>
    </div>
  );
}

function ListField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-zinc-500">{label}</span>
      <input
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-300"
      />
      {label}
    </label>
  );
}
