import { db } from "../db";
import type { JobPreferencesData } from "../types";
import { getLinkedInJobSource } from "../linkedin/api-capabilities";
import { enrichGuestJobWithDetails } from "../linkedin/guest-jobs";
import { jobMatchesSalary } from "./match";

export function parseJobPreferences(raw: {
  jobTitles: string;
  industries: string;
  locations: string;
  keywords: string;
  salaryMin: number | null;
  salaryMax: number | null;
  autoApply: boolean;
  notifyEmail: boolean;
  notifyInApp: boolean;
  scanIntervalMin: number;
}): JobPreferencesData {
  const parseJson = (s: string, fallback: string[] = []) => {
    try {
      return JSON.parse(s) as string[];
    } catch {
      return fallback;
    }
  };

  return {
    jobTitles: parseJson(raw.jobTitles),
    industries: parseJson(raw.industries),
    locations: parseJson(raw.locations),
    keywords: parseJson(raw.keywords),
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    autoApply: raw.autoApply,
    notifyEmail: raw.notifyEmail,
    notifyInApp: raw.notifyInApp,
    scanIntervalMin: raw.scanIntervalMin,
  };
}

export async function getOrCreateJobPreferences(userId: string) {
  let prefs = await db.jobPreference.findUnique({ where: { userId } });
  if (!prefs) {
    prefs = await db.jobPreference.create({ data: { userId } });
  }
  return prefs;
}

export async function scanJobsForUser(userId: string): Promise<{
  newJobs: number;
  applicationsCreated: number;
}> {
  const { searchLinkedInJobs, getLinkedInAccessToken } = await import(
    "../linkedin/jobs"
  );
  const { autoApplyToJob } = await import("../applications/auto-apply");
  const { createNotification } = await import("../notifications");

  const prefs = await getOrCreateJobPreferences(userId);
  const preferences = parseJobPreferences(prefs);

  if (getLinkedInJobSource() !== "mock") {
    await purgeMockJobListings(userId);
  }

  const accessToken = await getLinkedInAccessToken(userId);
  const profileTitles = await getProfileTitlesForUser(userId);

  const jobs = await searchLinkedInJobs(accessToken, preferences, {
    profileTitles,
  });

  let newJobs = 0;
  let applicationsCreated = 0;

  for (const job of jobs) {
    if (!jobMatchesSalary(job, preferences)) continue;

    const existing = await db.jobListing.findUnique({
      where: {
        userId_externalId: { userId, externalId: job.externalId },
      },
    });

    if (existing) continue;

    const enrichedJob =
      getLinkedInJobSource() === "guest" &&
      job.externalId.startsWith("li-guest-")
        ? await enrichGuestJobWithDetails(job)
        : job;

    if (!jobMatchesSalary(enrichedJob, preferences)) continue;

    const listing = await db.jobListing.create({
      data: {
        userId,
        externalId: enrichedJob.externalId,
        title: enrichedJob.title,
        company: enrichedJob.company,
        location: enrichedJob.location,
        description: enrichedJob.description,
        salaryMin: enrichedJob.salaryMin,
        salaryMax: enrichedJob.salaryMax,
        url: enrichedJob.url,
        postedAt: enrichedJob.postedAt,
        isNew: true,
      },
    });

    newJobs++;

    if (preferences.notifyInApp) {
      await createNotification(userId, {
        type: "new_job",
        title: "New job match",
        message: `${enrichedJob.title} at ${enrichedJob.company}`,
        metadata: { jobListingId: listing.id },
      });
    }

    if (preferences.notifyEmail) {
      const { sendJobAlertEmail } = await import("../notifications/email");
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await sendJobAlertEmail(user.email, enrichedJob);
      }
    }

    if (preferences.autoApply) {
      const result = await autoApplyToJob(userId, listing.id);
      if (result.created) applicationsCreated++;
    }
  }

  await db.jobPreference.update({
    where: { userId },
    data: { lastScanAt: new Date() },
  });

  return { newJobs, applicationsCreated };
}

export async function scanAllUsers(): Promise<{
  usersScanned: number;
  totalNewJobs: number;
}> {
  const users = await db.user.findMany({
    where: { jobPreferences: { isNot: null } },
    select: { id: true, jobPreferences: true },
  });

  let usersScanned = 0;
  let totalNewJobs = 0;

  for (const user of users) {
    const prefs = user.jobPreferences;
    if (!prefs) continue;

    const intervalMs = prefs.scanIntervalMin * 60 * 1000;
    if (
      prefs.lastScanAt &&
      Date.now() - prefs.lastScanAt.getTime() < intervalMs
    ) {
      continue;
    }

    const { newJobs } = await scanJobsForUser(user.id);
    usersScanned++;
    totalNewJobs += newJobs;
  }

  return { usersScanned, totalNewJobs };
}

async function getProfileTitlesForUser(userId: string): Promise<string[]> {
  const record = await db.linkedInProfile.findUnique({
    where: { userId },
    select: { experience: true },
  });
  if (!record) return [];

  try {
    const experience = JSON.parse(record.experience) as { title: string }[];
    return experience.map((e) => e.title).filter(Boolean);
  } catch {
    return [];
  }
}

async function purgeMockJobListings(userId: string): Promise<void> {
  await db.jobListing.deleteMany({
    where: {
      userId,
      OR: [
        { externalId: { startsWith: "mock-" } },
        { url: { contains: "/jobs/view/mock-" } },
      ],
    },
  });
}
