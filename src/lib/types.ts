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

export const SALARY_TIERS = [
  { id: "entry", label: "Entry Level (30K-50K)", min: 30_000, max: 50_000 },
  { id: "mid", label: "Mid-Level (60K-100K)", min: 60_000, max: 100_000 },
  { id: "senior", label: "Senior (100K+)", min: 100_000, max: null },
  { id: "executive", label: "Executive (150K+)", min: 150_000, max: null },
] as const;

export type SalaryTierId = (typeof SALARY_TIERS)[number]["id"];

export function getSalaryTierId(
  salaryMin: number | null,
  salaryMax: number | null
): SalaryTierId | "" {
  const tier = SALARY_TIERS.find(
    (t) => t.min === salaryMin && t.max === salaryMax
  );
  return tier?.id ?? "";
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

export const INDUSTRY_TOP_COMPANIES: Record<
  (typeof INDUSTRY_OPTIONS)[number],
  string[]
> = {
  Technology: [
    "Google",
    "Microsoft",
    "Apple",
    "Amazon",
    "Meta",
    "NVIDIA",
    "Salesforce",
    "Adobe",
    "Oracle",
    "IBM",
  ],
  Finance: [
    "JPMorgan Chase",
    "Goldman Sachs",
    "Morgan Stanley",
    "BlackRock",
    "Citigroup",
    "Bank of America",
    "Visa",
    "Mastercard",
    "Charles Schwab",
    "Fidelity",
  ],
  Healthcare: [
    "UnitedHealth Group",
    "Johnson & Johnson",
    "Pfizer",
    "Merck",
    "Abbott",
    "CVS Health",
    "Elevance Health",
    "Medtronic",
    "HCA Healthcare",
    "Amgen",
  ],
  Education: [
    "Pearson",
    "Chegg",
    "Coursera",
    "Duolingo",
    "2U",
    "Instructure",
    "PowerSchool",
    "Khan Academy",
    "McGraw Hill",
    "Stride",
  ],
  Marketing: [
    "Omnicom Group",
    "WPP",
    "Publicis Groupe",
    "Interpublic Group",
    "HubSpot",
    "Mailchimp",
    "Sprout Social",
    "Hootsuite",
    "Braze",
    "Klaviyo",
  ],
  Consulting: [
    "McKinsey & Company",
    "Boston Consulting Group",
    "Bain & Company",
    "Deloitte",
    "Accenture",
    "PwC",
    "EY",
    "KPMG",
    "Capgemini",
    "IBM Consulting",
  ],
  Retail: [
    "Walmart",
    "Amazon",
    "Costco",
    "Target",
    "Home Depot",
    "Lowe's",
    "Kroger",
    "Best Buy",
    "Nike",
    "Starbucks",
  ],
  Manufacturing: [
    "General Electric",
    "3M",
    "Caterpillar",
    "Boeing",
    "Lockheed Martin",
    "Honeywell",
    "Siemens",
    "Ford",
    "General Motors",
    "Procter & Gamble",
  ],
  Media: [
    "Disney",
    "Netflix",
    "Warner Bros. Discovery",
    "Comcast",
    "Paramount",
    "Spotify",
    "Sony",
    "Fox Corporation",
    "New York Times",
    "Condé Nast",
  ],
  Nonprofit: [
    "Red Cross",
    "Doctors Without Borders",
    "World Wildlife Fund",
    "Habitat for Humanity",
    "United Way",
    "Goodwill",
    "Salvation Army",
    "Feeding America",
    "Boys & Girls Clubs",
    "YMCA",
  ],
};

export function getCompaniesForIndustries(industries: string[]): string[] {
  const seen = new Set<string>();
  const companies: string[] = [];

  for (const industry of industries) {
    const list =
      INDUSTRY_TOP_COMPANIES[industry as (typeof INDUSTRY_OPTIONS)[number]];
    if (!list) continue;
    for (const company of list) {
      if (!seen.has(company)) {
        seen.add(company);
        companies.push(company);
      }
    }
  }

  return companies;
}

const JOB_TITLE_INDUSTRY_KEYWORDS: Record<
  (typeof INDUSTRY_OPTIONS)[number],
  string[]
> = {
  Technology: [
    "software",
    "developer",
    "programmer",
    "devops",
    "data scientist",
    "frontend",
    "backend",
    "full stack",
    "fullstack",
    "sre",
    "cloud",
    "cybersecurity",
    "machine learning",
    "ai engineer",
    "web developer",
    "mobile developer",
    "it ",
    "tech",
  ],
  Finance: [
    "finance",
    "financial",
    "accountant",
    "banking",
    "banker",
    "investment",
    "trader",
    "actuary",
    "portfolio",
    "underwriter",
  ],
  Healthcare: [
    "nurse",
    "physician",
    "doctor",
    "clinical",
    "pharmacist",
    "medical",
    "healthcare",
    "therapist",
    "dentist",
  ],
  Education: [
    "teacher",
    "professor",
    "educator",
    "instructor",
    "tutor",
    "academic",
    "principal",
    "curriculum",
  ],
  Marketing: [
    "marketing",
    "brand",
    "growth",
    "seo",
    "copywriter",
    "content strategist",
    "social media",
  ],
  Consulting: ["consultant", "consulting", "advisory", "advisor"],
  Retail: ["retail", "store manager", "merchandis", "cashier", "e-commerce"],
  Manufacturing: [
    "manufacturing",
    "production",
    "plant manager",
    "quality engineer",
    "supply chain",
  ],
  Media: [
    "journalist",
    "editor",
    "producer",
    "media",
    "broadcast",
    "filmmaker",
    "content creator",
  ],
  Nonprofit: ["nonprofit", "ngo", "fundraising", "volunteer coordinator"],
};

export function inferIndustriesFromJobTitles(
  jobTitles: string[]
): (typeof INDUSTRY_OPTIONS)[number][] {
  const haystack = jobTitles.join(" ").toLowerCase();
  if (!haystack.trim()) return [];

  const matched = INDUSTRY_OPTIONS.filter((industry) =>
    JOB_TITLE_INDUSTRY_KEYWORDS[industry].some((keyword) =>
      haystack.includes(keyword)
    )
  );

  if (
    matched.length === 0 &&
    /\bengineer\b/.test(haystack) &&
    !/\b(civil|mechanical|electrical|chemical|industrial|quality|manufacturing)\b/.test(
      haystack
    )
  ) {
    return ["Technology"];
  }

  return [...matched];
}

export function resolvePreferenceIndustries(preferences: {
  industries: string[];
  jobTitles: string[];
}): (typeof INDUSTRY_OPTIONS)[number][] {
  const explicit = preferences.industries.filter(
    (industry): industry is (typeof INDUSTRY_OPTIONS)[number] =>
      (INDUSTRY_OPTIONS as readonly string[]).includes(industry)
  );
  if (explicit.length > 0) return explicit;
  return inferIndustriesFromJobTitles(preferences.jobTitles);
}

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
