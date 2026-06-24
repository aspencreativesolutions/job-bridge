/**
 * LinkedIn OAuth scopes.
 *
 * Basic sign-in (openid profile email) only returns name, email, and photo.
 * Experience, education, and profile URL require the "Verified on LinkedIn"
 * product on your LinkedIn developer app:
 * https://learn.microsoft.com/en-us/linkedin/consumer/integrations/verified-on-linkedin/
 *
 * Set LINKEDIN_PROFILE_TIER in .env:
 *   basic        — sign-in only (default)
 *   development  — + r_profile_basicinfo, r_verify
 *   lite         — same as development
 *   plus         — + r_primary_current_experience, r_most_recent_education, r_verify_details
 */

export type LinkedInProfileTier = "basic" | "development" | "lite" | "plus";

export function getLinkedInProfileTier(): LinkedInProfileTier {
  const raw = (process.env.LINKEDIN_PROFILE_TIER ?? "basic").toLowerCase();
  if (raw === "development" || raw === "lite" || raw === "plus") return raw;
  return "basic";
}

export function getLinkedInOAuthScopes(): string {
  const override = process.env.LINKEDIN_OAUTH_SCOPES?.trim();
  if (override) return override;

  const tier = getLinkedInProfileTier();
  const base = "openid profile email";

  if (tier === "basic") return base;

  const verified = `${base} r_profile_basicinfo r_verify`;

  if (tier === "development" || tier === "lite") return verified;

  return `${verified} r_verify_details r_primary_current_experience r_most_recent_education`;
}

export function hasVerifiedProfileScopes(): boolean {
  return getLinkedInProfileTier() !== "basic";
}
