import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLinkedInProfileForUser } from "@/lib/linkedin/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getLinkedInProfileForUser(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Not connected" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
