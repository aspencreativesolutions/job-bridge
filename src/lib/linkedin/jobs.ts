import type { LinkedInJob, JobPreferencesData } from "../types";

const LINKEDIN_JOBS_API = "https://api.linkedin.com/v2/jobSearch";

export async function getLinkedInAccessToken(
  userId: string
): Promise<string | null> {
  const { db } = await import("../db");
  const account = await db.account.findFirst({
    where: { userId, provider: "linkedin" },
  });
  return account?.access_token ?? null;
}

export async function searchLinkedInJobs(
  accessToken: string | null,
  preferences: JobPreferencesData
): Promise<LinkedInJob[]> {
  if (process.env.USE_MOCK_JOBS === "true" || !accessToken) {
    return mockJobSearch(preferences);
  }

  try {
    const keywords = [
      ...preferences.jobTitles,
      ...preferences.keywords,
    ].join(" ");

    const params = new URLSearchParams({
      keywords,
      count: "25",
    });

    if (preferences.locations.length > 0) {
      params.set("location", preferences.locations[0]);
    }

    const response = await fetch(`${LINKEDIN_JOBS_API}?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!response.ok) {
      console.warn("LinkedIn API error, falling back to mock:", response.status);
      return mockJobSearch(preferences);
    }

    const data = await response.json();
    return parseLinkedInResponse(data);
  } catch (error) {
    console.warn("LinkedIn job search failed, using mock:", error);
    return mockJobSearch(preferences);
  }
}

function parseLinkedInResponse(data: unknown): LinkedInJob[] {
  const items = (data as { elements?: unknown[] })?.elements ?? [];
  return items.map((item, i) => {
    const job = item as Record<string, unknown>;
    return {
      externalId: String(job.id ?? `li-${i}`),
      title: String(job.title ?? "Unknown"),
      company: String((job.company as Record<string, string>)?.name ?? "Unknown"),
      location: String(job.location ?? ""),
      description: String(job.description ?? ""),
      url: String(job.applyUrl ?? job.url ?? ""),
      postedAt: job.listedAt ? new Date(Number(job.listedAt)) : undefined,
    };
  });
}

function mockJobSearch(preferences: JobPreferencesData): LinkedInJob[] {
  const titles =
    preferences.jobTitles.length > 0
      ? preferences.jobTitles
      : ["Software Engineer"];

  const industries =
    preferences.industries.length > 0
      ? preferences.industries
      : ["Technology"];

  const companies = [
    "Acme Corp",
    "TechFlow Inc",
    "DataBridge",
    "CloudNine",
    "InnovateLabs",
  ];

  const now = Date.now();
  return titles.flatMap((title, ti) =>
    industries.slice(0, 2).map((industry, ii) => {
      const idx = ti * 2 + ii;
      return {
        externalId: `mock-${title.toLowerCase().replace(/\s+/g, "-")}-${idx}-${Math.floor(now / 86400000)}`,
        title: `${title} — ${industry}`,
        company: companies[idx % companies.length],
        location: preferences.locations[0] ?? "Remote",
        description: `We are looking for a talented ${title} to join our ${industry} team.`,
        url: `https://www.linkedin.com/jobs/view/mock-${idx}`,
        postedAt: new Date(now - idx * 3600000),
      };
    })
  );
}
