import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateJobPreferences, parseJobPreferences } from "@/lib/jobs/scanner";
import {
  connectLinkedInProfile,
  getLinkedInProfileForUser,
  hasLinkedInAccount,
} from "@/lib/linkedin/store";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const prefs = await getOrCreateJobPreferences(session.user.id);
  const preferences = parseJobPreferences(prefs);

  const [jobCount, applicationCount, linkedInConnected] = await Promise.all([
    db.jobListing.count({ where: { userId: session.user.id } }),
    db.application.count({ where: { userId: session.user.id } }),
    hasLinkedInAccount(session.user.id),
  ]);

  let linkedInProfile = await getLinkedInProfileForUser(session.user.id);
  if (!linkedInProfile && linkedInConnected) {
    try {
      linkedInProfile = await connectLinkedInProfile(session.user.id);
    } catch {
      linkedInProfile = null;
    }
  }

  return (
    <div className="dash-page relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <div className="dash-page-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[90rem] px-4 py-8">
        <DashboardView
          initialPreferences={preferences}
          initialLinkedInProfile={linkedInProfile}
          hasLinkedInAccount={linkedInConnected}
          jobCount={jobCount}
          applicationCount={applicationCount}
        />

        <div className="dash-box mt-10 flex gap-6 text-sm font-medium">
          <Link
            href="/resume"
            className="text-slate-400 underline decoration-slate-600 underline-offset-4 hover:text-cyan-400"
          >
            Edit resume
          </Link>
          <Link
            href="/settings"
            className="text-slate-400 underline decoration-slate-600 underline-offset-4 hover:text-cyan-400"
          >
            Advanced settings
          </Link>
        </div>
      </div>
    </div>
  );
}
