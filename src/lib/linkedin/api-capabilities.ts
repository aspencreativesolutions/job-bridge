import { getLinkedInCredentials, isLinkedInConfigured } from "../auth";
import { getLinkedInProfileTier, type LinkedInProfileTier } from "./scopes";

export interface LinkedInPermissionStatus {
  allowed: boolean;
  note: string;
}

export interface LinkedInApiCapabilities {
  oauthConfigured: boolean;
  profileTier: LinkedInProfileTier;
  jobSource: "guest" | "mock" | "official";
  permissions: {
    signIn: LinkedInPermissionStatus;
    basicProfile: LinkedInPermissionStatus;
    currentPosition: LinkedInPermissionStatus;
    pastPositions: LinkedInPermissionStatus;
    education: LinkedInPermissionStatus;
    skills: LinkedInPermissionStatus;
    resumeExtraction: LinkedInPermissionStatus;
    jobSearch: LinkedInPermissionStatus;
    openToWork: LinkedInPermissionStatus;
  };
  compliance: {
    rateLimitMs: number;
    dataRetention: string;
    termsUrl: string;
  };
  setupSteps: string[];
}

export function getLinkedInJobSource(): "guest" | "mock" | "official" {
  if (process.env.USE_MOCK_JOBS === "true") return "mock";
  const raw = (process.env.LINKEDIN_JOB_SOURCE ?? "guest").toLowerCase();
  if (raw === "official" || raw === "mock") return raw;
  return "guest";
}

export function getLinkedInRateLimitMs(): number {
  const parsed = Number(process.env.LINKEDIN_RATE_LIMIT_MS ?? "2500");
  return Number.isFinite(parsed) && parsed >= 1000 ? parsed : 2500;
}

export function getLinkedInApiCapabilities(): LinkedInApiCapabilities {
  const tier = getLinkedInProfileTier();
  const oauthConfigured = isLinkedInConfigured();
  const jobSource = getLinkedInJobSource();

  const plusOrDev = tier === "plus" || tier === "development" || tier === "lite";

  return {
    oauthConfigured,
    profileTier: tier,
    jobSource,
    permissions: {
      signIn: {
        allowed: oauthConfigured,
        note: oauthConfigured
          ? "OAuth 2.0 via NextAuth (openid, profile, email)."
          : "Set AUTH_LINKEDIN_ID and AUTH_LINKEDIN_SECRET in .env.",
      },
      basicProfile: {
        allowed: plusOrDev,
        note: plusOrDev
          ? "Name, email, photo, profile URL via Verified on LinkedIn."
          : "Requires LINKEDIN_PROFILE_TIER=development+ and Verified on LinkedIn product.",
      },
      currentPosition: {
        allowed: tier === "plus",
        note:
          tier === "plus"
            ? "Current role via /identityMe (r_primary_current_experience)."
            : "Requires LINKEDIN_PROFILE_TIER=plus and Verified on LinkedIn Plus.",
      },
      pastPositions: {
        allowed: false,
        note: "LinkedIn does not expose full work history via public API. Only the current position is available at Plus tier.",
      },
      education: {
        allowed: tier === "plus",
        note:
          tier === "plus"
            ? "Most recent education via /identityMe (r_most_recent_education)."
            : "Requires LINKEDIN_PROFILE_TIER=plus.",
      },
      skills: {
        allowed: false,
        note: "Skills are not available from any LinkedIn API tier. Add them manually or upload a resume.",
      },
      resumeExtraction: {
        allowed: tier === "plus",
        note:
          tier === "plus"
            ? "Partial — current role and education can be mapped to resume sections."
            : "Limited to name/email from sign-in until Plus tier is enabled.",
      },
      jobSearch: {
        allowed: jobSource !== "mock",
        note:
          jobSource === "mock"
            ? "Mock mode (USE_MOCK_JOBS=true). No live job data."
            : jobSource === "official"
              ? "Official LinkedIn job search API is partner-only and not publicly available."
              : "Public guest job listings (same data visible without login). Rate-limited per LinkedIn ToS.",
      },
      openToWork: {
        allowed: false,
        note: "Open-to-work preferences are not exposed by LinkedIn's API.",
      },
    },
    compliance: {
      rateLimitMs: getLinkedInRateLimitMs(),
      dataRetention: "Job listings stored per user in local DB; refresh on scan. No profile data shared with third parties.",
      termsUrl: "https://www.linkedin.com/legal/api-terms-of-use",
    },
    setupSteps: buildSetupSteps(oauthConfigured, tier),
  };
}

function buildSetupSteps(
  oauthConfigured: boolean,
  tier: LinkedInProfileTier
): string[] {
  const steps: string[] = [];

  if (!oauthConfigured) {
    steps.push(
      "Register an app at https://www.linkedin.com/developers/apps",
      "Add redirect URL: http://localhost:3000/api/auth/callback/linkedin",
      "Copy Client ID → AUTH_LINKEDIN_ID and Client Secret → AUTH_LINKEDIN_SECRET"
    );
  }

  if (tier === "basic") {
    steps.push(
      'Add "Sign In with LinkedIn using OpenID Connect" product to your app',
      "For profile data, add Verified on LinkedIn and set LINKEDIN_PROFILE_TIER=plus"
    );
  } else if (tier !== "plus") {
    steps.push(
      'Add "Verified on LinkedIn" product to your developer app',
      "Set LINKEDIN_PROFILE_TIER=plus for current position and education"
    );
  }

  if (getLinkedInJobSource() === "mock") {
    steps.push('Set USE_MOCK_JOBS=false to enable live job search via guest API');
  }

  if (steps.length === 0) {
    steps.push("OAuth is configured. Sign in with LinkedIn to connect your profile.");
  }

  return steps;
}

export async function verifyLinkedInToken(
  accessToken: string
): Promise<{
  valid: boolean;
  profileAccessible: boolean;
  currentPosition: boolean;
  error?: string;
}> {
  try {
    const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      return {
        valid: false,
        profileAccessible: false,
        currentPosition: false,
        error: `Token invalid (${userinfoRes.status})`,
      };
    }

    const tier = getLinkedInProfileTier();
    if (tier === "basic") {
      return { valid: true, profileAccessible: false, currentPosition: false };
    }

    const identityRes = await fetch(
      "https://api.linkedin.com/rest/identityMe",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Linkedin-Version": "202510",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!identityRes.ok) {
      return {
        valid: true,
        profileAccessible: false,
        currentPosition: false,
        error: `Profile API denied (${identityRes.status}). Enable Verified on LinkedIn.`,
      };
    }

    const data = (await identityRes.json()) as Record<string, unknown>;
    const hasPosition = Boolean(data.primaryCurrentPosition);

    return {
      valid: true,
      profileAccessible: true,
      currentPosition: hasPosition,
    };
  } catch (err) {
    return {
      valid: false,
      profileAccessible: false,
      currentPosition: false,
      error: String(err),
    };
  }
}

export function getLinkedInCredentialsStatus(): {
  configured: boolean;
  clientIdPrefix: string | null;
} {
  const { clientId } = getLinkedInCredentials();
  return {
    configured: Boolean(clientId),
    clientIdPrefix: clientId ? `${clientId.slice(0, 6)}…` : null,
  };
}
