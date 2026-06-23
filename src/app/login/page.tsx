import { signIn, isLinkedInConfigured } from "@/lib/auth";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = isLinkedInConfigured();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <h1 className="text-2xl font-semibold">Sign in to Job Bridge</h1>
      <p className="mt-2 text-center text-sm text-zinc-500">
        Connect your LinkedIn account to search jobs and manage applications.
      </p>

      {!configured ? (
        <div className="mt-8 w-full rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">LinkedIn OAuth is not configured</p>
          <p className="mt-2 text-amber-800 dark:text-amber-300">
            Add your LinkedIn app credentials to{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
              .env
            </code>{" "}
            and restart the dev server:
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-amber-100/80 p-3 text-xs dark:bg-amber-900/40">
{`AUTH_LINKEDIN_ID=your_client_id
AUTH_LINKEDIN_SECRET=your_client_secret
AUTH_URL=http://localhost:3000`}
          </pre>
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
            Create an app at{" "}
            <a
              href="https://www.linkedin.com/developers/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              linkedin.com/developers
            </a>
            . Set the redirect URL to{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
              http://localhost:3000/api/auth/callback/linkedin
            </code>
            .
          </p>
        </div>
      ) : (
        <>
          {error && (
            <p className="mt-4 w-full rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              Sign-in failed. Check your LinkedIn app settings and try again.
            </p>
          )}

          <form
            className="mt-8 w-full"
            action={async () => {
              "use server";
              await signIn("linkedin", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0A66C2] px-4 py-3 text-sm font-medium text-white hover:bg-[#004182]"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Continue with LinkedIn
            </button>
          </form>
        </>
      )}

      <Link
        href="/"
        className="mt-6 text-sm text-zinc-500 underline hover:text-zinc-700"
      >
        Back to home
      </Link>
    </div>
  );
}
