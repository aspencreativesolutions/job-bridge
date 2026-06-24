import type { LinkedInJob } from "../types";
import { parseSalaryFromText } from "../jobs/format-salary";
import { withLinkedInRateLimit } from "./rate-limit";

const GUEST_JOBS_API =
  "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";
const GUEST_JOB_DETAIL_API =
  "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJobCard(cardHtml: string): LinkedInJob | null {
  const idMatch = cardHtml.match(/data-entity-urn="urn:li:jobPosting:(\d+)"/);
  if (!idMatch) return null;

  const titleMatch = cardHtml.match(
    /base-search-card__title[^>]*>([\s\S]*?)<\/h3/
  );
  const companyMatch = cardHtml.match(
    /base-search-card__subtitle[\s\S]*?>([\s\S]*?)<\/a/
  );
  const locationMatch = cardHtml.match(
    /job-search-card__location[^>]*>([\s\S]*?)<\/span/
  );
  const dateMatch = cardHtml.match(
    /job-search-card__listdate[^>]*datetime="([^"]+)"/
  );
  const urlMatch = cardHtml.match(
    /href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^"]+)"/
  );

  const title = titleMatch ? stripHtml(titleMatch[1]) : null;
  if (!title) return null;

  const externalId = idMatch[1];
  const company = companyMatch ? stripHtml(companyMatch[1]) : "Unknown";
  const location = locationMatch ? stripHtml(locationMatch[1]) : "";
  const url = urlMatch
    ? urlMatch[1].replace(/&amp;/g, "&")
    : `https://www.linkedin.com/jobs/view/${externalId}`;

  return {
    externalId: `li-guest-${externalId}`,
    title,
    company,
    location,
    description: "",
    url,
    postedAt: dateMatch ? new Date(dateMatch[1]) : undefined,
  };
}

export function parseGuestJobHtml(html: string): LinkedInJob[] {
  const cards = html.split(/<li>/).slice(1);
  const jobs: LinkedInJob[] = [];
  const seen = new Set<string>();

  for (const card of cards) {
    const job = parseJobCard(card);
    if (!job || seen.has(job.externalId)) continue;
    seen.add(job.externalId);
    jobs.push(job);
  }

  return jobs;
}

export async function searchGuestJobs(options: {
  keywords: string;
  location?: string;
  start?: number;
}): Promise<LinkedInJob[]> {
  const params = new URLSearchParams({
    keywords: options.keywords,
    location: options.location ?? "United States",
    start: String(options.start ?? 0),
  });

  const html = await withLinkedInRateLimit(async () => {
    const response = await fetch(`${GUEST_JOBS_API}?${params}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`Guest jobs API returned ${response.status}`);
    }

    return response.text();
  });

  return parseGuestJobHtml(html);
}

/**
 * Search for multiple keyword/location combinations with rate limiting.
 * Caps total requests to stay within compliance bounds.
 */
export async function searchGuestJobsForPreferences(options: {
  keywords: string[];
  locations: string[];
  maxRequests?: number;
  pagesPerSearch?: number;
}): Promise<LinkedInJob[]> {
  const maxRequests = options.maxRequests ?? 6;
  const pagesPerSearch = options.pagesPerSearch ?? 2;
  const titles =
    options.keywords.length > 0 ? options.keywords : ["Software Engineer"];
  const locations =
    options.locations.length > 0 ? options.locations : ["United States"];

  const allJobs: LinkedInJob[] = [];
  const seen = new Set<string>();
  let requests = 0;

  for (const title of titles) {
    for (const location of locations) {
      for (let page = 0; page < pagesPerSearch; page++) {
        if (requests >= maxRequests) break;
        requests++;

        try {
          const jobs = await searchGuestJobs({
            keywords: title,
            location,
            start: page * 25,
          });
          for (const job of jobs) {
            if (seen.has(job.externalId)) continue;
            seen.add(job.externalId);
            allJobs.push(job);
          }
          if (jobs.length < 10) break;
        } catch (err) {
          console.warn(
            `Guest job search failed for "${title}" in "${location}":`,
            err
          );
        }
      }
      if (requests >= maxRequests) break;
    }
    if (requests >= maxRequests) break;
  }

  return allJobs;
}

function extractJobDescription(html: string): string {
  const match = html.match(
    /class="description__text description__text--rich"[^>]*>([\s\S]*?)<\/div/
  );
  return match ? stripHtml(match[1]) : stripHtml(html);
}

function guestJobNumericId(externalId: string): string | null {
  const match = externalId.match(/li-guest-(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Fetches the public job detail page to extract description and salary when available.
 */
export async function enrichGuestJobWithDetails(
  job: LinkedInJob
): Promise<LinkedInJob> {
  const jobId = guestJobNumericId(job.externalId);
  if (!jobId) return job;

  try {
    const html = await withLinkedInRateLimit(async () => {
      const response = await fetch(`${GUEST_JOB_DETAIL_API}/${jobId}`, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html",
        },
      });

      if (!response.ok) {
        throw new Error(`Guest job detail returned ${response.status}`);
      }

      return response.text();
    });

    const description = extractJobDescription(html);
    const salary = parseSalaryFromText(description);

    return {
      ...job,
      description: description || job.description,
      salaryMin: salary?.min ?? job.salaryMin,
      salaryMax: salary?.max ?? job.salaryMax,
    };
  } catch (err) {
    console.warn(`Failed to enrich guest job ${job.externalId}:`, err);
    return job;
  }
}
