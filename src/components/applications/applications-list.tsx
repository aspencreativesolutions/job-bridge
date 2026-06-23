"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  missingFields: { name: string; label: string; required: boolean }[];
  createdAt: string;
  jobListing: { title: string; company: string; url: string | null };
}

export function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then(setApplications)
      .catch(() => {});
  }, []);

  if (applications.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No applications yet. Apply from the Jobs page or enable auto-apply in Settings.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {applications.map((app) => (
        <li key={app.id} className="px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="item-title">{app.jobListing.title}</h3>
              <p className="text-sm text-zinc-500">{app.jobListing.company}</p>
            </div>
            <StatusBadge status={app.status} />
          </div>

          {app.status === "needs_review" && app.missingFields.length > 0 && (
            <div className="mt-3 rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                Additional fields required
              </div>
              <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                {app.missingFields.map((f) => (
                  <li key={f.name}>
                    {f.label}
                    {f.required ? " (required)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    submitted:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    needs_review:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? colors.pending}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
