import type {
  LinkedInEducation,
  LinkedInExperience,
  LinkedInJobPreference,
  LinkedInProfileData,
} from "../types";
import { getLinkedInProfileTier, hasVerifiedProfileScopes } from "./scopes";

const LINKEDIN_USERINFO = "https://api.linkedin.com/v2/userinfo";
const LINKEDIN_REST_IDENTITY = "https://api.linkedin.com/rest/identityMe";
const LINKEDIN_API_VERSION = "202510";

interface FetchResult {
  profile: Omit<
    LinkedInProfileData,
    "connectedAt" | "fetchedAt" | "profileCompleteness"
  >;
  raw: Record<string, unknown>;
  warnings: string[];
}

export async function fetchLinkedInProfileMetadata(
  accessToken: string
): Promise<FetchResult> {
  const raw: Record<string, unknown> = {};
  const warnings: string[] = [];
  const tier = getLinkedInProfileTier();

  let headline: string | null = null;
  let skills: string[] = [];
  let experience: LinkedInExperience[] = [];
  let education: LinkedInEducation[] = [];
  let jobPreferences: LinkedInJobPreference[] = [];
  let profileUrl: string | null = null;
  let profilePictureUrl: string | null = null;

  const identityResult = await linkedInGet(LINKEDIN_REST_IDENTITY, accessToken, {
    "Linkedin-Version": LINKEDIN_API_VERSION,
  });

  if (identityResult.data) {
    raw.identityMe = identityResult.data;
    const parsed = parseIdentityMe(identityResult.data);
    headline = parsed.headline;
    experience = parsed.experience;
    education = parsed.education;
    profileUrl = parsed.profileUrl;
    profilePictureUrl = parsed.profilePictureUrl;
  } else if (identityResult.status === 403) {
    if (!hasVerifiedProfileScopes()) {
      warnings.push(
        "Profile details need LinkedIn’s Verified on LinkedIn product. Set LINKEDIN_PROFILE_TIER=development (or lite/plus) in .env, add the product in your LinkedIn developer app, then sign out and sign in again."
      );
    } else {
      warnings.push(
        "LinkedIn denied profile access (403). Confirm “Verified on LinkedIn” is enabled on your developer app and that you re-authorized after adding scopes."
      );
    }
  } else if (identityResult.error) {
    warnings.push(`LinkedIn profile API: ${identityResult.error}`);
  }

  const userinfoResult = await linkedInGet(LINKEDIN_USERINFO, accessToken);
  if (userinfoResult.data) {
    raw.userinfo = userinfoResult.data;
    const parsed = parseUserinfo(userinfoResult.data);
    if (!profileUrl && parsed.profileUrl) profileUrl = parsed.profileUrl;
    if (!headline && parsed.headline) headline = parsed.headline;
    if (!profilePictureUrl && parsed.profilePictureUrl) {
      profilePictureUrl = parsed.profilePictureUrl;
    }
  }

  if (!skills.length) {
    warnings.push(
      "Skills are not available from LinkedIn’s API (including Verified on LinkedIn). Add skills on your resume page or import a resume."
    );
  }

  if (!jobPreferences.length) {
    warnings.push(
      "Open-to-work job preferences are not exposed by LinkedIn’s public API."
    );
  }

  if (tier === "basic" && !experience.length && !education.length) {
    warnings.push(
      "Experience and education require LINKEDIN_PROFILE_TIER=plus in .env plus the Verified on LinkedIn Plus tier on your developer app."
    );
  } else if (tier === "development" || tier === "lite") {
    if (!experience.length && !education.length && identityResult.data) {
      warnings.push(
        "Current job and education require Verified on LinkedIn Plus (LINKEDIN_PROFILE_TIER=plus)."
      );
    }
  }

  if (!headline && !experience.length && !education.length && !profileUrl) {
    throw new Error(
      warnings[0] ??
        "LinkedIn did not return profile data. Enable Verified on LinkedIn on your developer app."
    );
  }

  raw.source = "live";
  raw.profileTier = tier;

  return {
    profile: {
      headline,
      skills,
      experience,
      education,
      jobPreferences,
      profileUrl,
      profilePictureUrl,
      warnings,
    },
    raw,
    warnings,
  };
}

function parseUserinfo(data: unknown): {
  headline: string | null;
  profileUrl: string | null;
  profilePictureUrl: string | null;
} {
  const info = data as Record<string, unknown>;
  const name =
    typeof info.name === "string"
      ? info.name
      : [info.given_name, info.family_name]
          .filter((v) => typeof v === "string")
          .join(" ")
          .trim() || null;

  const profileUrl = typeof info.profile === "string" ? info.profile : null;
  const profilePictureUrl =
    typeof info.picture === "string" && info.picture.trim()
      ? info.picture
      : null;

  const headline =
    typeof info.headline === "string" && info.headline.trim()
      ? info.headline
      : name;

  return { headline, profileUrl, profilePictureUrl };
}

function parseIdentityMe(data: unknown): {
  headline: string | null;
  profileUrl: string | null;
  profilePictureUrl: string | null;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
} {
  const root = data as Record<string, unknown>;
  const basicInfo = root.basicInfo as Record<string, unknown> | undefined;
  const profileUrl =
    typeof basicInfo?.profileUrl === "string" ? basicInfo.profileUrl : null;
  const profilePictureUrl = extractProfilePictureUrl(basicInfo?.profilePicture);

  const firstName = localizedString(basicInfo?.firstName);
  const lastName = localizedString(basicInfo?.lastName);
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim() || null;

  const experience: LinkedInExperience[] = [];
  const position = root.primaryCurrentPosition as
    | Record<string, unknown>
    | undefined;
  if (position) {
    const title = localizedString(position.title);
    const company = localizedString(position.companyName);
    if (title && company) {
      experience.push({ title, company });
    }
  }

  const education: LinkedInEducation[] = [];
  const edu = root.mostRecentEducation as Record<string, unknown> | undefined;
  if (edu) {
    const school = localizedString(edu.schoolName);
    const degree = localizedString(edu.degreeName);
    if (school) {
      education.push({ school, degree: degree ?? undefined });
    }
  }

  const headline =
    experience.length > 0
      ? `${experience[0].title} at ${experience[0].company}`
      : displayName;

  return { headline, profileUrl, profilePictureUrl, experience, education };
}

function extractProfilePictureUrl(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;

  if (!value || typeof value !== "object") return null;

  const obj = value as Record<string, unknown>;
  const direct =
    obj.url ?? obj.profilePictureUrl ?? obj.displayImageUrl ?? obj.imageUrl;
  if (typeof direct === "string" && direct.trim()) return direct;

  const displayImage = obj.displayImage;
  if (typeof displayImage === "string" && displayImage.startsWith("http")) {
    return displayImage;
  }

  const decorated = obj["displayImage~"] as
    | { elements?: { identifiers?: { identifier?: string }[] }[] }
    | undefined;
  const elements = decorated?.elements ?? [];
  for (const element of elements) {
    for (const id of element.identifiers ?? []) {
      if (typeof id.identifier === "string" && id.identifier.startsWith("http")) {
        return id.identifier;
      }
    }
  }

  return null;
}

function localizedString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;

  const obj = value as {
    localized?: Record<string, string>;
    preferredLocale?: { language: string; country: string };
  };

  if (obj.localized) {
    const preferred = obj.preferredLocale;
    if (preferred) {
      const key = `${preferred.language}_${preferred.country}`;
      if (obj.localized[key]) return obj.localized[key];
    }
    const values = Object.values(obj.localized);
    if (values[0]) return values[0];
  }

  return null;
}

export function computeProfileCompleteness(profile: {
  headline: string | null;
  skills: string[];
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  jobPreferences: LinkedInJobPreference[];
}): number {
  let score = 0;
  if (profile.headline?.trim()) score += 15;
  if (profile.skills.length >= 5) score += 20;
  else if (profile.skills.length > 0) score += 10;
  if (profile.experience.length >= 2) score += 25;
  else if (profile.experience.length === 1) score += 15;
  if (profile.education.length >= 1) score += 20;
  if (profile.jobPreferences.length >= 1) score += 10;
  if (
    profile.headline &&
    profile.skills.length &&
    profile.experience.length &&
    profile.education.length
  ) {
    score += 10;
  }
  return Math.min(100, score);
}

export function parseLinkedInProfileRecord(record: {
  headline: string | null;
  skills: string;
  experience: string;
  education: string;
  jobPreferences: string;
  profileCompleteness: number;
  profileUrl: string | null;
  profilePictureUrl?: string | null;
  warnings: string | null;
  connectedAt: Date;
  fetchedAt: Date;
}): LinkedInProfileData {
  return {
    headline: record.headline,
    skills: JSON.parse(record.skills) as string[],
    experience: JSON.parse(record.experience) as LinkedInExperience[],
    education: JSON.parse(record.education) as LinkedInEducation[],
    jobPreferences: JSON.parse(record.jobPreferences) as LinkedInJobPreference[],
    profileCompleteness: record.profileCompleteness,
    profileUrl: record.profileUrl,
    profilePictureUrl: record.profilePictureUrl ?? null,
    warnings: record.warnings ? (JSON.parse(record.warnings) as string[]) : [],
    connectedAt: record.connectedAt.toISOString(),
    fetchedAt: record.fetchedAt.toISOString(),
  };
}

async function linkedInGet(
  url: string,
  accessToken: string,
  extraHeaders?: Record<string, string>
): Promise<{ data: unknown | null; status?: number; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        ...extraHeaders,
      },
    });
    if (!response.ok) {
      const body = await response.text();
      console.warn(`LinkedIn API ${response.status} ${url}:`, body.slice(0, 300));
      return {
        data: null,
        status: response.status,
        error: `${response.status} ${response.statusText}`,
      };
    }
    return { data: await response.json(), status: response.status };
  } catch (err) {
    console.warn(`LinkedIn API error ${url}:`, err);
    return { data: null, error: String(err) };
  }
}
