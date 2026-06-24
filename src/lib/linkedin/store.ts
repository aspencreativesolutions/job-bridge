import { db } from "../db";
import type { LinkedInProfileData } from "../types";
import {
  computeProfileCompleteness,
  fetchLinkedInProfileMetadata,
  parseLinkedInProfileRecord,
} from "./profile";
import { getLinkedInAccessToken } from "./jobs";
import { extractJobTitlesFromProfile } from "./positions";
import { parseJobPreferences } from "../jobs/scanner";

export async function getLinkedInProfileForUser(
  userId: string
): Promise<LinkedInProfileData | null> {
  const record = await db.linkedInProfile.findUnique({ where: { userId } });
  if (!record) return null;
  if (isMockProfileRecord(record)) {
    await db.linkedInProfile.delete({ where: { userId } });
    return null;
  }
  return parseLinkedInProfileRecord(record);
}

function isMockProfileRecord(record: { rawData: string | null; experience: string }): boolean {
  if (record.rawData) {
    try {
      const raw = JSON.parse(record.rawData) as Record<string, unknown>;
      if (raw.source === "mock" || raw.supplementedWith === "mock_partial") {
        return true;
      }
    } catch {
      /* ignore */
    }
  }
  const experience = JSON.parse(record.experience) as { company: string }[];
  return experience.some((e) =>
    ["Stealth Startup", "Series B SaaS", "Fortune 500 Tech"].includes(e.company)
  );
}

export async function connectLinkedInProfile(
  userId: string
): Promise<LinkedInProfileData> {
  const accessToken = await getLinkedInAccessToken(userId);
  if (!accessToken) {
    throw new Error("LINKEDIN_NOT_CONNECTED");
  }

  const { profile, raw, warnings } = await fetchLinkedInProfileMetadata(
    accessToken
  );
  const profileCompleteness = computeProfileCompleteness(profile);
  const now = new Date();

  const record = await db.linkedInProfile.upsert({
    where: { userId },
    create: {
      userId,
      headline: profile.headline,
      skills: JSON.stringify(profile.skills),
      experience: JSON.stringify(profile.experience),
      education: JSON.stringify(profile.education),
      jobPreferences: JSON.stringify(profile.jobPreferences),
      profileCompleteness,
      profileUrl: profile.profileUrl,
      profilePictureUrl: profile.profilePictureUrl,
      warnings: JSON.stringify(warnings.length ? warnings : profile.warnings),
      rawData: JSON.stringify(raw),
      connectedAt: now,
      fetchedAt: now,
    },
    update: {
      headline: profile.headline,
      skills: JSON.stringify(profile.skills),
      experience: JSON.stringify(profile.experience),
      education: JSON.stringify(profile.education),
      jobPreferences: JSON.stringify(profile.jobPreferences),
      profileCompleteness,
      profileUrl: profile.profileUrl,
      profilePictureUrl: profile.profilePictureUrl,
      warnings: JSON.stringify(warnings.length ? warnings : profile.warnings),
      rawData: JSON.stringify(raw),
      fetchedAt: now,
    },
  });

  const parsed = parseLinkedInProfileRecord(record);
  await seedJobTitlesFromProfile(userId, parsed);

  return parsed;
}

async function seedJobTitlesFromProfile(
  userId: string,
  profile: LinkedInProfileData
): Promise<void> {
  const prefs = await db.jobPreference.findUnique({ where: { userId } });
  if (!prefs) return;

  const existing = parseJobPreferences(prefs).jobTitles;
  if (existing.length > 0) return;

  const titles = extractJobTitlesFromProfile(profile);
  if (titles.length === 0) return;

  await db.jobPreference.update({
    where: { userId },
    data: { jobTitles: JSON.stringify(titles) },
  });
}

export async function hasLinkedInAccount(userId: string): Promise<boolean> {
  const account = await db.account.findFirst({
    where: { userId, provider: "linkedin" },
  });
  return Boolean(account?.access_token);
}
