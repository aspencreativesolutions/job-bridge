"use client";

import { useEffect, useState, useCallback } from "react";
import { Send, ExternalLink, CheckCircle2, X } from "lucide-react";
import { parseJobLocation } from "@/lib/jobs/location";
import { formatJobPostedDate } from "@/lib/jobs/format-date";
import { JobSalary } from "@/components/jobs/job-salary";

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
  postedAt: string | null;
  discoveredAt: string;
  isNew: boolean;
  applications: JobApplication[];
}

interface Props {
  jobs?: DashboardJob[];
  onJobsChange?: (jobs: DashboardJob[]) => void;
  glass?: boolean;
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

export function DashboardJobFeed({ jobs: externalJobs, onJobsChange, glass }: Props) {
  const [internalJobs, setInternalJobs] = useState<DashboardJob[]>([]);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const jobs = externalJobs ?? internalJobs;
  const setJobs = onJobsChange ?? setInternalJobs;

  const loadJobs = useCallback(async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
  }, [setJobs]);

  useEffect(() => {
    if (externalJobs !== undefined) return;
    loadJobs();
  }, [loadJobs, externalJobs]);

  useEffect(() => {
    if (externalJobs !== undefined) return;
    const handler = () => loadJobs();
    window.addEventListener("jobbridge:refresh-jobs", handler);
    return () => window.removeEventListener("jobbridge:refresh-jobs", handler);
  }, [loadJobs, externalJobs]);

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

  const messageClass = glass
    ? "dash-box text-sm font-medium text-slate-200"
    : "rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-zinc-900";

  return (
    <div className="space-y-5">
      {message && <p className={messageClass}>{message}</p>}

      <JobSection
        title="Applied"
        description="Jobs you've applied to (auto or manual)."
        jobs={appliedJobs}
        emptyText="No applied jobs yet. Enable Auto-Apply or click Apply on a matching job."
        glass={glass}
        renderAction={(job) => {
          const app = job.applications[0];
          const label = appliedLabel(app.status);
          return (
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                  app.status === "submitted"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : app.status === "needs_review"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-white/10 text-slate-400"
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
                  className="flex items-center gap-1 text-sm font-bold text-cyan-400 underline hover:text-cyan-300"
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
                className="rounded-md p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
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
        emptyText="No new matches. Update your preferences and click Save & refresh jobs."
        glass={glass}
        renderAction={(job) => (
          <div className="flex items-center gap-2">
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-slate-400 hover:bg-white/5"
                title="View job posting"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => apply(job.id)}
              className="flex items-center gap-1.5 rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-cyan-400"
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
  glass,
}: {
  title: string;
  description: string;
  jobs: DashboardJob[];
  emptyText: string;
  renderAction: (job: DashboardJob) => React.ReactNode;
  glass?: boolean;
}) {
  const sectionWrap = glass ? "dash-box" : "";
  const titleClass = glass
    ? "text-lg font-bold text-white"
    : "section-title mb-1";
  const descClass = glass ? "text-sm text-slate-400" : "text-sm text-zinc-500";
  const emptyClass = glass
    ? "dash-box-sm py-8 text-center text-sm text-slate-500"
    : "rounded-lg border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700";
  const metaClass = glass
    ? "text-sm font-medium text-slate-400"
    : "text-sm font-medium text-zinc-500";

  return (
    <section className={sectionWrap}>
      <h2 className={titleClass}>{title}</h2>
      <p className={`mb-4 mt-1 ${descClass}`}>{description}</p>

      {jobs.length === 0 ? (
        <p className={emptyClass}>{emptyText}</p>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-1">
          <ul className="space-y-3">
          {jobs.map((job) => {
            const { stateCode } = parseJobLocation(job.location);
            const postedLabel = formatJobPostedDate(
              job.postedAt,
              job.discoveredAt
            );
            const itemClass = glass
              ? "dash-box-sm flex flex-wrap items-center justify-between gap-4"
              : "flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-200 px-6 py-4 dark:border-zinc-800";
            return (
              <li key={job.id} className={itemClass}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={
                        glass ? "text-lg font-bold text-white" : "item-title"
                      }
                    >
                      {job.title}
                    </h3>
                    {postedLabel && (
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-300">
                        {postedLabel}
                      </span>
                    )}
                    <JobSalary
                      salaryMin={job.salaryMin}
                      salaryMax={job.salaryMax}
                      variant={glass ? "glass" : "default"}
                    />
                  </div>
                  <p className={metaClass}>
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                    {stateCode && glass ? ` (${stateCode})` : ""}
                  </p>
                </div>
                {renderAction(job)}
              </li>
            );
          })}
          </ul>
        </div>
      )}
    </section>
  );
}
