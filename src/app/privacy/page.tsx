import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Job Bridge",
  description: "How Job Bridge collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="text-sm text-zinc-500 underline hover:text-zinc-700"
      >
        ← Back to home
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: June 21, 2026</p>

      <div className="prose prose-zinc mt-8 max-w-none space-y-6 text-sm leading-relaxed dark:prose-invert">
        <section>
          <h2 className="text-lg font-semibold">1. Who we are</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Job Bridge (&quot;we&quot;, &quot;us&quot;) is operated by Aspen
            Creative Solutions. Job Bridge helps users manage resumes, connect a
            LinkedIn account, monitor job listings, and manage job applications.
          </p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Contact:{" "}
            <a href="mailto:privacy@jobbridgeapp.com" className="underline">
              privacy@jobbridgeapp.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Information we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Account information</strong> from LinkedIn sign-in (such as
              name, email address, and profile image)
            </li>
            <li>
              <strong>Resume data</strong> you upload or create in the app
              (contact details, work history, education, skills)
            </li>
            <li>
              <strong>Job preferences</strong> (target titles, industries,
              locations, keywords, notification and auto-apply settings)
            </li>
            <li>
              <strong>Application records</strong> (jobs matched, applications
              submitted or prepared, and fields requiring your review)
            </li>
            <li>
              <strong>Technical data</strong> needed to operate the service
              (session tokens, OAuth tokens, and basic usage logs)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. How we use your information</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
            <li>Authenticate you and maintain your account</li>
            <li>Store, edit, and manage your resume</li>
            <li>Search and monitor job listings based on your preferences</li>
            <li>Send in-app and email notifications about new job matches</li>
            <li>
              Prepare or submit job applications when you enable auto-apply
            </li>
            <li>Improve and secure the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Third-party services</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            We use LinkedIn for authentication and job-related features. We may
            use email and cloud hosting providers to operate the app. We do not
            sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Data retention</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            We retain your data while your account is active or as needed to
            provide the service. You may request deletion of your account and
            associated data by contacting us at the email above.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Your rights</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Depending on your location, you may have the right to access,
            correct, delete, or export your personal data. Contact us to make a
            request.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Security</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            We use reasonable technical and organizational measures to protect
            your information, including encrypted connections and secure storage
            of credentials.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Changes to this policy</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            We may update this policy from time to time. We will post the
            updated version on this page with a revised date.
          </p>
        </section>
      </div>
    </div>
  );
}
