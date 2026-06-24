import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getLinkedInApiCapabilities,
  getLinkedInCredentialsStatus,
  verifyLinkedInToken,
} from "@/lib/linkedin/api-capabilities";
import { getLinkedInAccessToken } from "@/lib/linkedin/jobs";

export async function GET() {
  const session = await auth();
  const capabilities = getLinkedInApiCapabilities();
  const credentials = getLinkedInCredentialsStatus();

  const result: Record<string, unknown> = {
    capabilities,
    credentials,
  };

  if (session?.user?.id) {
    const accessToken = await getLinkedInAccessToken(session.user.id);
    if (accessToken) {
      result.tokenVerification = await verifyLinkedInToken(accessToken);
    } else {
      result.tokenVerification = {
        valid: false,
        profileAccessible: false,
        currentPosition: false,
        error: "No LinkedIn account connected. Sign in with LinkedIn first.",
      };
    }
  }

  return NextResponse.json(result);
}
