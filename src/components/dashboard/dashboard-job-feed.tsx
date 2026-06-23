"use client";

import { useEffect, useState, useCallback } from "react";
import { Send, ExternalLink, CheckCircle2, X } from "lucide-react";

interface JobApplication {
  id: string;
  status: string;
}

export interface DashboardJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  isNew: boolean;
  applications: JobApplication[];
}

function formatSalaryRange(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min != null) return `From ${fmt(min)} / yr`;
  return `Up to ${fmt(max!)} / yr`;
}

function isApplied(job: DashboardJob): boolean {
  return job.applications.length > 0;
}

function appliedLabel(status: string): string {
  if (status === "submitted") return "Applied";
  if (status === "needs_review") return "Needs review";
  if (status === "failed") return "Failed";
  return "Pending";
}

export function DashboardJobFeed() {
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    const handler = () => loadJobs();
    window.addEventListener("jobbridge:refresh-jobs", handler);
    return () => window.removeEventListener("jobbridge:refresh-jobs", handler);
  }, [loadJobs]);

  async function apply(jobId: string) {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobListingId: jobId }),
    });
    const data = await res.json();
    setMessage(
      data.status === "needs_review"
        ? "Application created — additional fields need your review."
        : "Application submitted."
    );
    await loadJobs();
  }

  async function removeApplication(applicationId: string) {
    setDeletingId(applicationId);
    setMessage("");
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setMessage("Application removed.");
      await loadJobs();
    } catch {
      setMessage("Failed to remove application.");
    } finally {
      setDeletingId(null);
    }
  }

  const appliedJobs = jobs.filter(isApplied);
  const readyJobs = jobs.filter((j) => !isApplied(j));

  return (
    <div className="space-y-8">
      {message && (
        <p className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-zinc-900">
          {message}
        </p>
      )}

      <JobSection
        title="Applied"
        description="Jobs you've applied to (auto or manual)."
        jobs={appliedJobs}
        emptyText="No applied jobs yet. Enable Auto-Apply or click Apply on a matching job."
        renderAction={(job) => {
          const app = job.applications[0];
          const label = appliedLabel(app.status);
          return (
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                  app.status === "submitted"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : app.status === "needs_review"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {label}
              </span>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-bold text-blue-600 underline hover:text-blue-800"
                >
                  View application
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => removeApplication(app.id)}
                disabled={deletingId === app.id}
                title="Remove application"
                className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        }}
      />

      <JobSection
        title="Ready to apply"
        description="Matching jobs waiting for your action."
        jobs={readyJobs}
        emptyText="No new matches. Update your preferences on the right and click Save & refresh jobs."
        renderAction={(job) => (
          <div className="flex items-center gap-2">
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                title="View job posting"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => apply(job.id)}
              className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Send className="h-3.5 w-3.5" />
              Apply
            </button>
          </div>
        )}
      />
    </div>
  );
}

function JobSection({
  title,
  description,
  jobs,
  emptyText,
  renderAction,
}: {
  title: string;
  description: string;
  jobs: DashboardJob[];
  emptyText: string;
  renderAction: (job: DashboardJob) => React.ReactNode;
}) {
  return (
    <section>
      <h2 className="section-title mb-1">{title}</h2>
      <p className="mb-4 text-sm text-zinc-500">{description}</p>

      {jobs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {emptyText}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {jobs.map((job) => {
            const salary = formatSalaryRange(job.salaryMin, job.salaryMax);
            return (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="item-title">{job.title}</h3>
                    {job.isNew && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-500">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                    {salary ? ` · ${salary}` : ""}
                  </p>
                </div>
                {renderAction(job)}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
