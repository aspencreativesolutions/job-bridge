import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await db.jobListing.findMany({
    where: { userId: session.user.id },
    orderBy: { discoveredAt: "desc" },
    take: 100,
    include: {
      applications: { select: { id: true, status: true } },
    },
  });

  return NextResponse.json(jobs);
}
