"use server";

import { signIn } from "@/lib/auth";

export async function signInWithLinkedIn(callbackUrl = "/dashboard") {
  await signIn("linkedin", { redirectTo: callbackUrl });
}
