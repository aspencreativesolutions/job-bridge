import type { LinkedInJob } from "../types";
import { formatSalaryRange } from "../jobs/format-salary";

export async function sendJobAlertEmail(
  to: string,
  job: LinkedInJob
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] New job alert for ${to}: ${job.title} at ${job.company}`);
    return;
  }

  const salary = formatSalaryRange(job.salaryMin, job.salaryMax);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Job Bridge <onboarding@resend.dev>",
        to: [to],
        subject: `New job match: ${job.title} at ${job.company}`,
        html: `
          <h2>New job match found</h2>
          <p><strong>${job.title}</strong> at <strong>${job.company}</strong></p>
          ${job.location ? `<p>Location: ${job.location}</p>` : ""}
          ${salary ? `<p>Salary: ${salary}</p>` : ""}
          ${job.url ? `<p><a href="${job.url}">View job posting</a></p>` : ""}
          <p>Log in to Job Bridge to review or auto-apply.</p>
        `,
      }),
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
