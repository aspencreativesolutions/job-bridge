import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getOrCreateJobPreferences,
  parseJobPreferences,
  scanJobsForUser,
} from "@/lib/jobs/scanner";
import { DEFAULT_COVER_LETTER } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [prefs, coverLetter] = await Promise.all([
    getOrCreateJobPreferences(session.user.id),
    db.coverLetterTemplate.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({
    preferences: parseJobPreferences(prefs),
    coverLetter: coverLetter?.content ?? DEFAULT_COVER_LETTER,
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { preferences, coverLetter, refreshJobs } = body;

  await getOrCreateJobPreferences(session.user.id);

  const updated = await db.jobPreference.update({
    where: { userId: session.user.id },
    data: {
      jobTitles: JSON.stringify(preferences.jobTitles ?? []),
      industries: JSON.stringify(preferences.industries ?? []),
      locations: JSON.stringify(preferences.locations ?? []),
      keywords: JSON.stringify(preferences.keywords ?? []),
      salaryMin: preferences.salaryMin ?? null,
      salaryMax: preferences.salaryMax ?? null,
      autoApply: preferences.autoApply ?? false,
      notifyEmail: preferences.notifyEmail ?? true,
      notifyInApp: preferences.notifyInApp ?? true,
      scanIntervalMin: preferences.scanIntervalMin ?? 60,
    },
  });

  if (coverLetter !== undefined) {
    await db.coverLetterTemplate.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        content: coverLetter,
      },
      update: { content: coverLetter },
    });
  }

  let scanResult = null;
  if (refreshJobs) {
    scanResult = await scanJobsForUser(session.user.id);
  }

  return NextResponse.json({
    preferences: parseJobPreferences(updated),
    coverLetter,
    scanResult,
  });
}
