"use client";

import { useState } from "react";
import type { JobPreferencesData, LinkedInProfileData } from "@/lib/types";
import { ConfigurePreferences } from "./configure-preferences";
import { ConnectLinkedInGate } from "./connect-linkedin-gate";
import { DashboardJobFeed } from "./dashboard-job-feed";
import { LinkedInProfileBox } from "./linkedin-profile-box";

interface Props {
  initialPreferences: JobPreferencesData;
  initialLinkedInProfile: LinkedInProfileData | null;
  hasLinkedInAccount: boolean;
}

export function DashboardView({
  initialPreferences,
  initialLinkedInProfile,
  hasLinkedInAccount,
}: Props) {
  const [linkedInProfile, setLinkedInProfile] =
    useState<LinkedInProfileData | null>(initialLinkedInProfile);

  function handleSaved() {
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

  if (!linkedInProfile) {
    return (
      <ConnectLinkedInGate
        hasLinkedInAccount={hasLinkedInAccount}
        onConnected={handleConnected}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1">
        <DashboardJobFeed />
      </div>
      <div className="flex w-full shrink-0 flex-col gap-6 lg:flex-row xl:w-[44rem] xl:flex-row">
        <aside className="w-full lg:w-80 lg:shrink-0 xl:sticky xl:top-8">
          <LinkedInProfileBox
            profile={linkedInProfile}
            onRefresh={setLinkedInProfile}
          />
        </aside>
        <aside className="w-full lg:w-80 lg:shrink-0 xl:sticky xl:top-8">
          <ConfigurePreferences
            initialPreferences={initialPreferences}
            onSaved={handleSaved}
          />
        </aside>
      </div>
    </div>
  );
}
