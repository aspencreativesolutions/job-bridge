import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ApplicationsList } from "@/components/applications/applications-list";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [jobCount, applicationCount, prefs] = await Promise.all([
    db.jobListing.count({ where: { userId: session.user.id } }),
    db.application.count({ where: { userId: session.user.id } }),
    db.jobPreference.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-zinc-500">Your job application command center</p>
        </div>
        <NotificationBell />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Jobs found" value={jobCount} href="/jobs" />
        <StatCard label="Applications" value={applicationCount} href="/jobs" />
        <StatCard
          label="Auto-apply"
          value={prefs?.autoApply ? "On" : "Off"}
          href="/settings"
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-medium">Recent applications</h2>
        <ApplicationsList />
      </section>

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/resume" className="text-zinc-600 underline hover:text-zinc-900">
          Edit resume
        </Link>
        <Link href="/settings" className="text-zinc-600 underline hover:text-zinc-900">
          Configure settings
        </Link>
        <Link href="/jobs" className="text-zinc-600 underline hover:text-zinc-900">
          View all jobs
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </Link>
  );
}
