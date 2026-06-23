import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanJobsForUser, scanAllUsers } from "@/lib/jobs/scanner";

function isCronAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

/** Cron / worker: scan all users */
export async function POST(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await scanAllUsers();
  return NextResponse.json({
    success: true,
    ...result,
    scannedAt: new Date().toISOString(),
  });
}

/** Manual scan (logged-in user) or Vercel cron (GET + secret) */
export async function GET(request: Request) {
  if (isCronAuthorized(request)) {
    const result = await scanAllUsers();
    return NextResponse.json({
      success: true,
      ...result,
      scannedAt: new Date().toISOString(),
    });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await scanJobsForUser(session.user.id);
  return NextResponse.json({ success: true, ...result });
}
