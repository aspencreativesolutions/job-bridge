"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { JobPreferencesData, LinkedInProfileData } from "@/lib/types";
import { parseJobLocation } from "@/lib/jobs/location";
import { getJobMapMarkers } from "@/lib/jobs/map-markers";
import { ConfigurePreferences } from "./configure-preferences";
import { ConnectLinkedInGate } from "./connect-linkedin-gate";
import {
  DashboardJobFeed,
  type DashboardJob,
} from "./dashboard-job-feed";
import { AutoApplyToggleCard } from "./auto-apply-toggle-card";
import { CompaniesInFieldBox } from "./companies-in-field-box";
import { LinkedInProfileBox } from "./linkedin-profile-box";
import { UsJobMap } from "./us-job-map";
import { Briefcase, MapPin, Send, X } from "lucide-react";

interface Props {
  initialPreferences: JobPreferencesData;
  initialLinkedInProfile: LinkedInProfileData | null;
  hasLinkedInAccount: boolean;
  jobCount: number;
  applicationCount: number;
}

export function DashboardView({
  initialPreferences,
  initialLinkedInProfile,
  hasLinkedInAccount,
  jobCount,
  applicationCount,
}: Props) {
  const [linkedInProfile, setLinkedInProfile] =
    useState<LinkedInProfileData | null>(initialLinkedInProfile);
  const [preferences, setPreferences] =
    useState<JobPreferencesData>(initialPreferences);
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [mapFocused, setMapFocused] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!mapFocused) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedMarkerId(null);
        setMapFocused(false);
      }
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mapFocused]);

  function handleSaved(
    prefs: JobPreferencesData,
    _scanResult?: { newJobs: number; applicationsCreated: number }
  ) {
    setPreferences(prefs);
    window.dispatchEvent(new CustomEvent("jobbridge:refresh-jobs"));
  }

  function handleConnected() {
    fetch("/api/linkedin/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setLinkedInProfile(data);
      })
      .catch(() => {});
  }

  const mapMarkers = useMemo(() => getJobMapMarkers(jobs), [jobs]);
  const remoteCount = useMemo(
    () => jobs.filter((j) => parseJobLocation(j.location).isRemote).length,
    [jobs]
  );

  const selectedMarker = useMemo(
    () => mapMarkers.find((m) => m.id === selectedMarkerId) ?? null,
    [mapMarkers, selectedMarkerId]
  );

  const filteredJobs = useMemo(() => {
    if (!selectedMarker) return jobs;
    const loc = selectedMarker.location.trim().toLowerCase();
    return jobs.filter(
      (j) => (j.location ?? "").trim().toLowerCase() === loc
    );
  }, [jobs, selectedMarker]);

  if (!linkedInProfile) {
    return (
      <ConnectLinkedInGate
        hasLinkedInAccount={hasLinkedInAccount}
        onConnected={handleConnected}
      />
    );
  }

  if (mapFocused) {
    return (
      <UsJobMap
        markers={mapMarkers}
        selectedMarkerId={selectedMarkerId}
        onSelectMarker={setSelectedMarkerId}
        focused
        onEnterFocus={() => setMapFocused(true)}
        onExitFocus={() => setMapFocused(false)}
        remoteCount={remoteCount}
      />
    );
  }

  return (
    <div className="relative space-y-5">
        <div className="dash-box flex shrink-0 flex-col divide-y divide-white/10 sm:flex-row sm:items-center sm:divide-x sm:divide-y-0">
          <GlassStat
            icon={<Briefcase className="h-4 w-4 text-cyan-400" />}
            label="Jobs found"
            value={String(jobCount)}
            inline
          />
          <GlassStat
            icon={<Send className="h-4 w-4 text-violet-400" />}
            label="Applications"
            value={String(applicationCount)}
            inline
          />
          <AutoApplyToggleCard
            preferences={preferences}
            onPreferencesChange={setPreferences}
            inline
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
          <div className="dash-box flex min-h-[320px] flex-col p-0 overflow-hidden">
            <div className="flex-1">
              <UsJobMap
                markers={mapMarkers}
                selectedMarkerId={selectedMarkerId}
                onSelectMarker={setSelectedMarkerId}
                focused={false}
                onEnterFocus={() => setMapFocused(true)}
                onExitFocus={() => setMapFocused(false)}
                remoteCount={remoteCount}
              />
            </div>
          </div>
          <ConfigurePreferences
            preferences={preferences}
            onPreferencesChange={setPreferences}
            onSaved={handleSaved}
            glass
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-7">
            {selectedMarker && (
              <div className="dash-box flex items-center gap-2 text-sm text-cyan-200">
                <MapPin className="h-4 w-4 shrink-0" />
                Filtering by {selectedMarker.location}
                <button
                  type="button"
                  onClick={() => setSelectedMarkerId(null)}
                  className="ml-auto rounded p-1 hover:bg-white/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <DashboardJobFeed
              jobs={filteredJobs}
              onJobsChange={setJobs}
              glass
            />
          </div>

          <div className="space-y-5 xl:col-span-5">
            <LinkedInProfileBox
              profile={linkedInProfile}
              onRefresh={setLinkedInProfile}
              glass
            />
            <CompaniesInFieldBox preferences={preferences} glass />
          </div>
        </div>
    </div>
  );
}

function GlassStat({
  icon,
  label,
  value,
  inline = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  inline?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 items-center gap-4 ${inline ? "px-4 py-3 sm:py-0" : ""}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
