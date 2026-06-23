import type {
  LinkedInEducation,
  LinkedInExperience,
  LinkedInJobPreference,
  LinkedInProfileData,
} from "../types";

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

  let headline: string | null = null;
  let skills: string[] = [];
  let experience: LinkedInExperience[] = [];
  let education: LinkedInEducation[] = [];
  let jobPreferences: LinkedInJobPreference[] = [];
  let profileUrl: string | null = null;

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
  } else if (identityResult.status === 403) {
    warnings.push(
      "LinkedIn denied profile access. Add the “Verified on LinkedIn” product and r_profile_basicinfo scope in your LinkedIn developer app, then sign out and sign in again."
    );
  } else if (identityResult.error) {
    warnings.push(`LinkedIn profile API: ${identityResult.error}`);
  }

  const userinfoResult = await linkedInGet(LINKEDIN_USERINFO, accessToken);
  if (userinfoResult.data) {
    raw.userinfo = userinfoResult.data;
    const parsed = parseUserinfo(userinfoResult.data);
    if (!profileUrl && parsed.profileUrl) profileUrl = parsed.profileUrl;
    if (!headline && parsed.headline) headline = parsed.headline;
    if (!experience.length && parsed.experience.length) {
      experience = parsed.experience;
    }
  }

  const legacyResult = await linkedInGet(
    "https://api.linkedin.com/v2/me?projection=(id,localizedHeadline,vanityName)",
    accessToken
  );
  if (legacyResult.data) {
    raw.legacyMe = legacyResult.data;
    const leg = legacyResult.data as Record<string, unknown>;
    if (!headline && leg.localizedHeadline) {
      headline = String(leg.localizedHeadline);
    }
    if (!profileUrl && leg.vanityName) {
      profileUrl = `https://www.linkedin.com/in/${leg.vanityName}`;
    }
  }

  const positionsResult = await linkedInGet(
    "https://api.linkedin.com/v2/positions?q=owners&owners=urn:li:person:" +
      encodeURIComponent(
        String((raw.identityMe as Record<string, unknown>)?.id ?? "")
      ) +
      "&projection=(elements*(title,companyName,company~(localizedName)))",
    accessToken
  );
  if (positionsResult.data) {
    raw.positions = positionsResult.data;
    const fromPositions = parsePositions(positionsResult.data);
    if (fromPositions.length > experience.length) {
      experience = fromPositions;
    }
  }

  const skillsResult = await linkedInGet(
    "https://api.linkedin.com/v2/skills?q=owners&owners=urn:li:person:" +
      encodeURIComponent(
        String((raw.identityMe as Record<string, unknown>)?.id ?? "")
      ),
    accessToken
  );
  if (skillsResult.data) {
    raw.skills = skillsResult.data;
    skills = parseSkills(skillsResult.data);
  }

  if (!skills.length) {
    warnings.push(
      "Skills are not exposed by LinkedIn’s API for this app tier. Only data LinkedIn returns is shown."
    );
  }
  if (!jobPreferences.length) {
    warnings.push(
      "Open-to-work job preferences are not available via LinkedIn’s public API."
    );
  }

  if (
    !headline &&
    !experience.length &&
    !education.length &&
    !profileUrl
  ) {
    throw new Error(
      warnings[0] ??
        "LinkedIn did not return profile data. Your app may need the Verified on LinkedIn product for job and education details."
    );
  }

  raw.source = "live";

  return {
    profile: {
      headline,
      skills,
      experience,
      education,
      jobPreferences,
      profileUrl,
      warnings,
    },
    raw,
    warnings,
  };
}

function parseUserinfo(data: unknown): {
  headline: string | null;
  profileUrl: string | null;
  experience: LinkedInExperience[];
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

  const headline =
    typeof info.headline === "string"
      ? info.headline
      : name
        ? `${name}${typeof info.email === "string" ? ` · ${info.email}` : ""}`
        : null;

  return { headline, profileUrl, experience: [] };
}

function parseIdentityMe(data: unknown): {
  headline: string | null;
  profileUrl: string | null;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
} {
  const root = data as Record<string, unknown>;
  const basicInfo = root.basicInfo as Record<string, unknown> | undefined;
  const profileUrl =
    typeof basicInfo?.profileUrl === "string" ? basicInfo.profileUrl : null;

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
      : null;

  return { headline, profileUrl, experience, education };
}

function parsePositions(data: unknown): LinkedInExperience[] {
  const elements =
    (data as { elements?: unknown[] })?.elements ?? [];
  const experience: LinkedInExperience[] = [];

  for (const item of elements) {
    const pos = item as Record<string, unknown>;
    const title =
      localizedString(pos.title) ??
      (typeof pos.localizedTitle === "string" ? pos.localizedTitle : null);
    const company =
      localizedString(pos.companyName) ??
      localizedString((pos.company as Record<string, unknown>)?.localizedName) ??
      (typeof pos.companyName === "string" ? pos.companyName : null);
    if (title && company) {
      experience.push({ title, company });
    }
  }

  return experience;
}

function parseSkills(data: unknown): string[] {
  const elements = (data as { elements?: unknown[] })?.elements ?? [];
  const skills: string[] = [];

  for (const item of elements) {
    const skill = item as Record<string, unknown>;
    const name =
      localizedString(skill.name) ??
      (typeof skill.localizedName === "string" ? skill.localizedName : null);
    if (name) skills.push(name);
  }

  return skills;
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
