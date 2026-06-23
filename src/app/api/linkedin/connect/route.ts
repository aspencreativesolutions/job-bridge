import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectLinkedInProfile } from "@/lib/linkedin/store";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await connectLinkedInProfile(session.user.id);
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && error.message === "LINKEDIN_NOT_CONNECTED") {
      return NextResponse.json(
        { error: "LinkedIn account not connected. Sign in with LinkedIn first." },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to fetch LinkedIn profile";
    console.error("LinkedIn connect failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
