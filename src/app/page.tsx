import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Briefcase, FileText, Zap } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Apply smarter with Job Bridge
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        Upload your resume, connect LinkedIn, set job filters, and let Job Bridge monitor
        listings and apply on your behalf — with full control over every setting.
      </p>

      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/login"
          className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Get started with LinkedIn
        </Link>
      </div>

      <p className="mt-16 text-xs text-zinc-400">
        <Link href="/privacy" className="underline hover:text-zinc-600">
          Privacy Policy
        </Link>
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-3 text-left">
        <Feature
          icon={FileText}
          title="Resume editor"
          description="Upload PDF or DOCX, edit every section, and save as your active template."
        />
        <Feature
          icon={Briefcase}
          title="Job monitoring"
          description="Background scans match LinkedIn jobs to your industries and titles."
        />
        <Feature
          icon={Zap}
          title="Auto-apply"
          description="Send resume and cover letter automatically, with review for extra fields."
        />
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <Icon className="mb-3 h-8 w-8 text-zinc-700 dark:text-zinc-300" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
