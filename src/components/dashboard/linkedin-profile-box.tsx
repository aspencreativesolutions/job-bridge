"use client";

import { useState } from "react";
import {
  Briefcase,
  ChevronDown,
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
  glass?: boolean;
}

export function LinkedInProfileBox({ profile, onRefresh, glass }: Props) {
  const [expanded, setExpanded] = useState(false);
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

  const outer = glass
    ? "dash-box"
    : "rounded-xl border border-emerald-200 bg-emerald-50 shadow-md dark:border-emerald-800 dark:bg-emerald-950/60";
  const divider = glass
    ? "border-t border-slate-600/50"
    : "border-t border-emerald-200/80 dark:border-emerald-800";
  const titleText = glass
    ? "text-lg font-bold text-white"
    : "text-xl font-bold text-emerald-950 dark:text-emerald-50";
  const subText = glass
    ? "text-sm text-slate-400"
    : "text-sm text-emerald-700/80 dark:text-emerald-300/80";
  const labelText = glass
    ? "text-sm font-bold text-slate-200"
    : "font-bold text-emerald-900 dark:text-emerald-100";
  const bodyText = glass
    ? "text-sm text-slate-300"
    : "text-sm text-emerald-900 dark:text-emerald-100";
  const mutedText = glass
    ? "text-xs text-slate-500"
    : "text-xs italic text-emerald-600/60 dark:text-emerald-400/60";

  return (
    <section className={outer}>
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <ChevronDown
            className={`mt-3 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
          <ProfileAvatar
            pictureUrl={profile.profilePictureUrl}
            glass={glass}
          />
          <div className="min-w-0">
            <h2 className={titleText}>LinkedIn Profile</h2>
            <p className={subText}>Live data from your LinkedIn account</p>
            {!expanded && (
              <p className={`mt-1 ${mutedText}`}>
                {profile.profileCompleteness}% complete · Click to expand
              </p>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          title="Sync from LinkedIn"
          className={
            glass
              ? "shrink-0 rounded-md border border-slate-600/60 p-2 text-emerald-400 hover:bg-slate-700/50 disabled:opacity-50"
              : "shrink-0 rounded-md p-2 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-900"
          }
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {expanded && (
        <>
      {profile.profileUrl && (
        <a
          href={profile.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 flex items-center gap-1 text-xs font-bold underline ${
            glass ? "text-emerald-400" : "text-emerald-700 dark:text-emerald-300"
          }`}
        >
          View on LinkedIn
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      <div className={`${divider} mt-4 pt-4`}>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className={labelText}>Profile completeness</span>
          <span
            className={
              glass
                ? "font-bold text-emerald-400"
                : "font-bold text-emerald-700 dark:text-emerald-300"
            }
          >
            {profile.profileCompleteness}%
          </span>
        </div>
        <div
          className={`h-2 overflow-hidden rounded-full ${
            glass ? "bg-slate-700" : "bg-emerald-200/80 dark:bg-emerald-900"
          }`}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${profile.profileCompleteness}%` }}
          />
        </div>
      </div>

      {profile.headline && (
        <ProfileSection
          icon={User}
          title="Headline"
          divider={divider}
          labelText={labelText}
        >
          <p className={bodyText}>{profile.headline}</p>
        </ProfileSection>
      )}

      <ProfileSection
        icon={Sparkles}
        title="Skills"
        divider={divider}
        labelText={labelText}
      >
        {profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className={
                  glass
                    ? "rounded-full border border-slate-600/60 bg-slate-700/50 px-2.5 py-0.5 text-xs font-bold text-slate-200"
                    : "rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                }
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className={mutedText}>
            Skills aren&apos;t available from LinkedIn&apos;s API — add them on your
            resume page.
          </p>
        )}
      </ProfileSection>

      <ProfileSection
        icon={Briefcase}
        title="Experience"
        divider={divider}
        labelText={labelText}
      >
        {profile.experience.length > 0 ? (
          <ul className="space-y-2">
            {profile.experience.map((exp, i) => (
              <li key={`${exp.title}-${exp.company}-${i}`}>
                <p className={`font-bold ${bodyText}`}>{exp.title}</p>
                <p className={subText}>{exp.company}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={mutedText}>
            Requires Verified on LinkedIn Plus on your developer app
            (LINKEDIN_PROFILE_TIER=plus).
          </p>
        )}
      </ProfileSection>

      <ProfileSection
        icon={GraduationCap}
        title="Education"
        divider={divider}
        labelText={labelText}
      >
        {profile.education.length > 0 ? (
          <ul className="space-y-2">
            {profile.education.map((edu, i) => (
              <li key={`${edu.school}-${i}`}>
                <p className={`font-bold ${bodyText}`}>{edu.school}</p>
                {edu.degree && <p className={subText}>{edu.degree}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className={mutedText}>
            Requires Verified on LinkedIn Plus on your developer app
            (LINKEDIN_PROFILE_TIER=plus).
          </p>
        )}
      </ProfileSection>

      <ProfileSection
        icon={Target}
        title="Job preferences"
        divider={divider}
        labelText={labelText}
      >
        {profile.jobPreferences.length > 0 ? (
          <ul className="space-y-2">
            {profile.jobPreferences.map((pref, i) => (
              <li key={`${pref.title}-${i}`}>
                <p className={`font-bold ${bodyText}`}>{pref.title}</p>
                {pref.location && <p className={subText}>{pref.location}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className={mutedText}>
            Open-to-work preferences are not available via LinkedIn API.
          </p>
        )}
      </ProfileSection>

      {profile.warnings.length > 0 && (
        <div
          className={`${divider} mt-0 space-y-2 pt-4 text-xs ${
            glass ? "text-amber-200" : "text-amber-900 dark:text-amber-200"
          }`}
        >
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

      <p className={`${divider} pt-4 ${mutedText}`}>
        Last synced{" "}
        {new Date(profile.fetchedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
        </>
      )}
    </section>
  );
}

function ProfileAvatar({
  pictureUrl,
  glass,
}: {
  pictureUrl: string | null;
  glass?: boolean;
}) {
  const ring = glass
    ? "ring-slate-600/60 bg-slate-700/50 text-slate-400"
    : "ring-emerald-200 bg-emerald-100 text-emerald-700 dark:ring-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300";

  if (pictureUrl) {
    return (
      <img
        src={pictureUrl}
        alt="LinkedIn profile"
        referrerPolicy="no-referrer"
        className={`mt-0.5 h-11 w-11 shrink-0 rounded-full object-cover ring-2 ${ring}`}
      />
    );
  }

  return (
    <div
      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-2 ${ring}`}
      aria-hidden
    >
      <User className="h-5 w-5" />
    </div>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  children,
  divider,
  labelText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  divider: string;
  labelText: string;
}) {
  return (
    <div className={`${divider} pt-4`}>
      <h3 className={`mb-2 flex items-center gap-1.5 ${labelText}`}>
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      {children}
    </div>
  );
}
