export interface ResumeSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeContent {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: ResumeSection[];
  education: ResumeSection[];
  skills: string[];
  customSections: ResumeSection[];
}

export interface LinkedInExperience {
  title: string;
  company: string;
}

export interface LinkedInEducation {
  school: string;
  degree?: string;
}

export interface LinkedInJobPreference {
  title: string;
  location?: string;
}

export interface LinkedInProfileData {
  headline: string | null;
  skills: string[];
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  jobPreferences: LinkedInJobPreference[];
  profileCompleteness: number;
  profileUrl: string | null;
  warnings: string[];
  connectedAt: string;
  fetchedAt: string;
}

export interface JobPreferencesData {
  jobTitles: string[];
  industries: string[];
  locations: string[];
  keywords: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  autoApply: boolean;
  notifyEmail: boolean;
  notifyInApp: boolean;
  scanIntervalMin: number;
}

export const INDUSTRY_OPTIONS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Consulting",
  "Retail",
  "Manufacturing",
  "Media",
  "Nonprofit",
] as const;

export interface LinkedInJob {
  externalId: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  url?: string;
  postedAt?: Date;
}

export interface ApplicationField {
  name: string;
  label: string;
  required: boolean;
  value?: string;
}

export const DEFAULT_RESUME: ResumeContent = {
  contact: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  customSections: [],
};

export const DEFAULT_COVER_LETTER = `Dear Hiring Manager,

I am writing to express my interest in the {{job_title}} position at {{company}}. With my background and skills, I believe I would be a strong fit for your team.

{{summary}}

I would welcome the opportunity to discuss how my experience aligns with your needs. Thank you for your consideration.

Best regards,
{{name}}`;
