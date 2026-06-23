import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobList } from "@/components/jobs/job-list";

export default async function JobsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <JobList />
    </div>
  );
}
