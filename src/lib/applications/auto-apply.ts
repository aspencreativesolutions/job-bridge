import { db } from "../db";
import { DEFAULT_COVER_LETTER } from "../types";
import { parseResumeContent } from "../resume";

interface AutoApplyResult {
  created: boolean;
  applicationId?: string;
  status: string;
}

export async function autoApplyToJob(
  userId: string,
  jobListingId: string
): Promise<AutoApplyResult> {
  const existing = await db.application.findFirst({
    where: { userId, jobListingId },
  });
  if (existing) {
    return { created: false, applicationId: existing.id, status: existing.status };
  }

  const [resume, coverLetterTemplate, job] = await Promise.all([
    db.resume.findUnique({ where: { userId } }),
    db.coverLetterTemplate.findUnique({ where: { userId } }),
    db.jobListing.findUnique({ where: { id: jobListingId } }),
  ]);

  if (!job) {
    return { created: false, status: "failed" };
  }

  const resumeContent = resume
    ? parseResumeContent(resume.content)
    : null;

  const coverLetter = renderCoverLetter(
    coverLetterTemplate?.content ?? DEFAULT_COVER_LETTER,
    job.title,
    job.company,
    resumeContent?.contact.name ?? "",
    resumeContent?.summary ?? ""
  );

  const missingFields = detectMissingFields(resumeContent, job.description);

  const status = missingFields.length > 0 ? "needs_review" : "submitted";

  const application = await db.application.create({
    data: {
      userId,
      jobListingId,
      status,
      coverLetter,
      missingFields: JSON.stringify(missingFields),
      submittedAt: status === "submitted" ? new Date() : null,
    },
  });

  const { createNotification } = await import("../notifications");
  await createNotification(userId, {
    type: status === "needs_review" ? "needs_review" : "application_submitted",
    title:
      status === "needs_review"
        ? "Application needs your input"
        : "Application submitted",
    message: `${job.title} at ${job.company}`,
    metadata: { applicationId: application.id, jobListingId },
  });

  return {
    created: true,
    applicationId: application.id,
    status,
  };
}

function renderCoverLetter(
  template: string,
  jobTitle: string,
  company: string,
  name: string,
  summary: string
): string {
  return template
    .replace(/\{\{job_title\}\}/g, jobTitle)
    .replace(/\{\{company\}\}/g, company)
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{summary\}\}/g, summary);
}

function detectMissingFields(
  resume: ReturnType<typeof parseResumeContent> | null,
  description?: string | null
): { name: string; label: string; required: boolean }[] {
  const missing: { name: string; label: string; required: boolean }[] = [];

  if (!resume?.contact.phone) {
    missing.push({ name: "phone", label: "Phone number", required: true });
  }

  if (!resume?.contact.linkedin) {
    missing.push({ name: "linkedin", label: "LinkedIn profile URL", required: false });
  }

  const desc = (description ?? "").toLowerCase();
  if (desc.includes("portfolio") || desc.includes("github")) {
    missing.push({ name: "portfolio", label: "Portfolio / GitHub URL", required: true });
  }
  if (desc.includes("salary") || desc.includes("compensation")) {
    missing.push({ name: "salary_expectation", label: "Salary expectation", required: true });
  }
  if (desc.includes("work authorization") || desc.includes("visa")) {
    missing.push({ name: "work_authorization", label: "Work authorization status", required: true });
  }

  return missing;
}
