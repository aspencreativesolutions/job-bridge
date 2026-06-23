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

export interface JobPreferencesData {
  jobTitles: string[];
  industries: string[];
  locations: string[];
  keywords: string[];
  autoApply: boolean;
  notifyEmail: boolean;
  notifyInApp: boolean;
  scanIntervalMin: number;
}

export interface LinkedInJob {
  externalId: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
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
