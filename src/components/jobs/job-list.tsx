"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Send, ExternalLink } from "lucide-react";
import { formatJobPostedDate } from "@/lib/jobs/format-date";
import { JobSalary } from "@/components/jobs/job-salary";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  postedAt: string | null;
  isNew: boolean;
  discoveredAt: string;
  applications: { id: string; status: string }[];
}

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  async function loadJobs() {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function scanNow() {
    setScanning(true);
    setMessage("");
    try {
      const res = await fetch("/api/jobs/scan");
      const data = await res.json();
      setMessage(`Scan complete: ${data.newJobs ?? 0} new job(s) found.`);
      await loadJobs();
    } catch {
      setMessage("Scan failed.");
    } finally {
      setScanning(false);
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Job listings</h1>
          <p className="text-sm text-zinc-500">
            Jobs matching your criteria from LinkedIn.
          </p>
        </div>
        <button
          onClick={scanNow}
          disabled={scanning}
          className="flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning…" : "Scan now"}
        </button>
      </div>

      {message && (
        <p className="rounded-md bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-900">
          {message}
        </p>
      )}

      {jobs.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-12">
          No jobs yet. Configure filters in Settings and run a scan.
        </p>
      ) : (
        <div className="max-h-80 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {jobs.map((job) => {
            const applied = job.applications.length > 0;
            const postedLabel = formatJobPostedDate(
              job.postedAt,
              job.discoveredAt
            );
            return (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-bold leading-tight">{job.title}</h3>
                    {postedLabel && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {postedLabel}
                      </span>
                    )}
                    <JobSalary salaryMin={job.salaryMin} salaryMax={job.salaryMax} />
                  </div>
                  <p className="text-xs leading-tight text-zinc-500">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {applied ? (
                    <span className="text-xs text-zinc-500">
                      {job.applications[0].status.replace("_", " ")}
                    </span>
                  ) : (
                    <button
                      onClick={() => apply(job.id)}
                      className="flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-xs text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Apply
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          </ul>
        </div>
      )}
    </div>
  );
}
