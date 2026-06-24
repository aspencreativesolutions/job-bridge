import { v4 as uuidv4 } from "uuid";
import type { LinkedInProfileData, ResumeContent, ResumeSection } from "../types";
import { DEFAULT_RESUME } from "../types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseNameFromHeadline(headline: string | null): {
  name: string | null;
  email: string | null;
} {
  if (!headline) return { name: null, email: null };
  const emailMatch = headline.match(/[\w.+-]+@[\w.-]+\.\w+/);
  const email = emailMatch?.[0] ?? null;
  const namePart = headline.split("·")[0]?.trim() ?? headline;
  const name =
    namePart && !namePart.includes("@") ? namePart : null;
  return { name, email };
}

export function linkedInProfileToResume(
  profile: LinkedInProfileData | null,
  user?: { name?: string | null; email?: string | null }
): { content: ResumeContent; imported: boolean; warnings: string[] } {
  const warnings: string[] = profile?.warnings ?? [];

  if (!profile) {
    return {
      content: {
        ...DEFAULT_RESUME,
        contact: {
          ...DEFAULT_RESUME.contact,
          name: user?.name ?? "",
          email: user?.email ?? "",
        },
      },
      imported: false,
      warnings: [
        "No LinkedIn profile connected. Fill in each section manually, then save.",
      ],
    };
  }

  const fromHeadline = parseNameFromHeadline(profile.headline);

  const experience: ResumeSection[] = profile.experience.map((exp) => ({
    id: uuidv4(),
    title: `${exp.title} at ${exp.company}`,
    content: `<p><strong>${escapeHtml(exp.title)}</strong> — ${escapeHtml(exp.company)}</p>`,
  }));

  const education: ResumeSection[] = profile.education.map((edu) => ({
    id: uuidv4(),
    title: edu.school,
    content: edu.degree
      ? `<p>${escapeHtml(edu.degree)}</p>`
      : "<p></p>",
  }));

  const skills = profile.skills;

  const hasResumeData =
    experience.length > 0 || education.length > 0 || skills.length > 0;

  if (!hasResumeData) {
    warnings.push(
      "LinkedIn returned limited profile data. Add experience, education, and skills manually below."
    );
  }

  const content: ResumeContent = {
    contact: {
      name: user?.name ?? fromHeadline.name ?? "",
      email: user?.email ?? fromHeadline.email ?? "",
      phone: "",
      location: "",
      linkedin: profile.profileUrl ?? "",
    },
    summary: profile.headline
      ? `<p>${escapeHtml(profile.headline)}</p>`
      : "",
    experience,
    education,
    skills,
    customSections: [],
  };

  return { content, imported: hasResumeData, warnings };
}

export function isResumeEmpty(content: ResumeContent): boolean {
  const hasContact = Boolean(
    content.contact.name.trim() ||
      content.contact.email.trim() ||
      content.contact.linkedin.trim()
  );
  return (
    !hasContact &&
    !content.summary.trim() &&
    content.experience.length === 0 &&
    content.education.length === 0 &&
    content.skills.length === 0
  );
}
