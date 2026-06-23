import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateJobPreferences, parseJobPreferences } from "@/lib/jobs/scanner";
import {
  connectLinkedInProfile,
  getLinkedInProfileForUser,
  hasLinkedInAccount,
} from "@/lib/linkedin/store";
import { NotificationBell } from "@/components/notifications/notification-bell";
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="page-title">
            Welcome{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 text-base font-medium text-zinc-500">
            Your job application command center
          </p>
        </div>
        <NotificationBell />
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard label="Jobs found" value={jobCount} />
        <StatCard label="Applications" value={applicationCount} />
        <StatCard
          label="Auto-apply"
          value={preferences.autoApply ? "Yes" : "No"}
        />
      </div>

      <DashboardView
        initialPreferences={preferences}
        initialLinkedInProfile={linkedInProfile}
        hasLinkedInAccount={linkedInConnected}
      />

      <div className="mt-10 flex gap-6 text-base font-bold">
        <Link href="/resume" className="text-zinc-600 underline hover:text-zinc-900">
          Edit resume
        </Link>
        <Link href="/settings" className="text-zinc-600 underline hover:text-zinc-900">
          Advanced settings
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="card-label">{label}</p>
      <p className="card-value mt-2">{value}</p>
    </div>
  );
}
