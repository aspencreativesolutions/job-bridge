import type { LinkedInExperience, LinkedInProfileData } from "../types";
import type { JobPreferencesData } from "../types";

export function extractJobTitlesFromExperience(
  experience: LinkedInExperience[]
): string[] {
  const seen = new Set<string>();
  const titles: string[] = [];

  for (const entry of experience) {
    const title = entry.title?.trim();
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    titles.push(title);
  }

  return titles;
}

export function extractJobTitlesFromProfile(
  profile: LinkedInProfileData | null
): string[] {
  if (!profile) return [];
  return extractJobTitlesFromExperience(profile.experience);
}

/**
 * Build search keywords from user preferences, falling back to
 * LinkedIn profile positions when no titles are configured.
 */
export function buildJobSearchKeywords(
  preferences: JobPreferencesData,
  profileTitles: string[] = []
): string[] {
  const configured = preferences.jobTitles.filter((t) => t.trim());
  if (configured.length > 0) return configured;

  if (profileTitles.length > 0) return profileTitles;

  return ["Software Engineer"];
}

export function mergeKeywords(
  titles: string[],
  extraKeywords: string[]
): string {
  return [...titles, ...extraKeywords.filter((k) => k.trim())].join(" ");
}
