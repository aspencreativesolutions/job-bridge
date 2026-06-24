import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  connectLinkedInProfile,
  getLinkedInProfileForUser,
  hasLinkedInAccount,
} from "@/lib/linkedin/store";
import { linkedInProfileToResume } from "@/lib/resume/linkedin-import";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const linkedInConnected = await hasLinkedInAccount(session.user.id);
  if (!linkedInConnected) {
    return NextResponse.json(
      {
        error: "LinkedIn not connected. Sign in with LinkedIn first.",
        hasLinkedInAccount: false,
      },
      { status: 400 }
    );
  }

  let profile = await getLinkedInProfileForUser(session.user.id);
  if (!profile) {
    try {
      profile = await connectLinkedInProfile(session.user.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch LinkedIn profile";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const { content, imported, warnings } = linkedInProfileToResume(profile, {
    name: session.user.name,
    email: session.user.email,
  });

  return NextResponse.json({
    content,
    imported,
    warnings,
    hasLinkedInAccount: true,
  });
}
