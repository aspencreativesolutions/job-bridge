"use client";

import { useState } from "react";
import {
  Briefcase,
  ExternalLink,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import type { LinkedInProfileData } from "@/lib/types";
import { signInWithLinkedIn } from "@/app/actions/auth";

interface Props {
  profile: LinkedInProfileData;
  onRefresh: (profile: LinkedInProfileData) => void;
}

export function LinkedInProfileBox({ profile, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/linkedin/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refresh failed");
      onRefresh(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-md ring-1 ring-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:ring-emerald-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
            LinkedIn Profile
          </h2>
          <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
            Live data from your LinkedIn account
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          title="Sync from LinkedIn"
          className="rounded-md p-2 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-900"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {profile.profileUrl && (
        <a
          href={profile.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 flex items-center gap-1 text-xs font-bold text-emerald-700 underline dark:text-emerald-300"
        >
          View on LinkedIn
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      <div className="mb-5">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-bold text-emerald-900 dark:text-emerald-100">
            Profile completeness
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300">
            {profile.profileCompleteness}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-emerald-200/80 dark:bg-emerald-900">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all dark:bg-emerald-400"
            style={{ width: `${profile.profileCompleteness}%` }}
          />
        </div>
      </div>

      {profile.headline && (
        <ProfileSection icon={User} title="Headline">
          <p className="text-sm text-emerald-900 dark:text-emerald-100">
            {profile.headline}
          </p>
        </ProfileSection>
      )}

      <ProfileSection icon={Sparkles} title="Skills">
        {profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <EmptyField label="LinkedIn did not return skills for this app." />
        )}
      </ProfileSection>

      <ProfileSection icon={Briefcase} title="Experience">
        {profile.experience.length > 0 ? (
          <ul className="space-y-2">
            {profile.experience.map((exp, i) => (
              <li key={`${exp.title}-${exp.company}-${i}`} className="text-sm">
                <p className="font-bold text-emerald-900 dark:text-emerald-100">
                  {exp.title}
                </p>
                <p className="text-emerald-700/80 dark:text-emerald-300/80">
                  {exp.company}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyField label="No experience returned. Plus-tier scopes may be required." />
        )}
      </ProfileSection>

      <ProfileSection icon={GraduationCap} title="Education">
        {profile.education.length > 0 ? (
          <ul className="space-y-2">
            {profile.education.map((edu, i) => (
              <li key={`${edu.school}-${i}`} className="text-sm">
                <p className="font-bold text-emerald-900 dark:text-emerald-100">
                  {edu.school}
                </p>
                {edu.degree && (
                  <p className="text-emerald-700/80 dark:text-emerald-300/80">
                    {edu.degree}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyField label="No education returned. Plus-tier scopes may be required." />
        )}
      </ProfileSection>

      <ProfileSection icon={Target} title="Job preferences">
        {profile.jobPreferences.length > 0 ? (
          <ul className="space-y-2">
            {profile.jobPreferences.map((pref, i) => (
              <li key={`${pref.title}-${i}`} className="text-sm">
                <p className="font-bold text-emerald-900 dark:text-emerald-100">
                  {pref.title}
                </p>
                {pref.location && (
                  <p className="text-emerald-700/80 dark:text-emerald-300/80">
                    {pref.location}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyField label="Open-to-work preferences are not available via LinkedIn API." />
        )}
      </ProfileSection>

      {profile.warnings.length > 0 && (
        <div className="mt-4 space-y-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          {profile.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
          <button
            type="button"
            onClick={() => signInWithLinkedIn("/dashboard")}
            className="font-bold underline"
          >
            Re-authorize LinkedIn
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-emerald-600/70 dark:text-emerald-400/70">
        Last synced{" "}
        {new Date(profile.fetchedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </section>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 border-t border-emerald-200/80 pt-4 first:border-t-0 first:pt-0 dark:border-emerald-800">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-emerald-900 dark:text-emerald-100">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyField({ label }: { label: string }) {
  return (
    <p className="text-xs italic text-emerald-600/60 dark:text-emerald-400/60">
      {label}
    </p>
  );
}
