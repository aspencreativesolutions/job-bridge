import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { autoApplyToJob } from "@/lib/applications/auto-apply";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await db.application.findMany({
    where: { userId: session.user.id },
    include: {
      jobListing: {
        select: { title: true, company: true, url: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    applications.map((a) => ({
      ...a,
      missingFields: a.missingFields ? JSON.parse(a.missingFields) : [],
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobListingId } = await request.json();
  if (!jobListingId) {
    return NextResponse.json({ error: "jobListingId required" }, { status: 400 });
  }

  const result = await autoApplyToJob(session.user.id, jobListingId);
  return NextResponse.json(result);
}
