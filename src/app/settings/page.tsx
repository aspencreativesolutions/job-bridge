import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateJobPreferences, parseJobPreferences } from "@/lib/jobs/scanner";
import { DEFAULT_COVER_LETTER } from "@/lib/types";
import { SettingsPanel } from "@/components/settings/settings-panel";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [prefs, coverLetter, linkedInAccount] = await Promise.all([
    getOrCreateJobPreferences(session.user.id),
    db.coverLetterTemplate.findUnique({ where: { userId: session.user.id } }),
    db.account.findFirst({
      where: { userId: session.user.id, provider: "linkedin" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <SettingsPanel
        initialPreferences={parseJobPreferences(prefs)}
        initialCoverLetter={coverLetter?.content ?? DEFAULT_COVER_LETTER}
        linkedInConnected={!!linkedInAccount}
      />
    </div>
  );
}
