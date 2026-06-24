import { INDUSTRY_OPTIONS } from "@/lib/types";

export type PositionCategory =
  | "software-development"
  | "design"
  | "data-analytics"
  | "product-management"
  | "project-management"
  | "marketing"
  | "customer-facing"
  | "hr-talent"
  | "operations"
  | "content-media"
  | "architecture";

export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];

export interface JobTitleSuggestion {
  title: string;
  crossIndustry: boolean;
  category: PositionCategory | null;
  crossIndustryTooltip?: string;
}

export const CROSS_INDUSTRY_TOOLTIP =
  "This position spans multiple industries. Your skills apply across sectors like retail, healthcare, finance, and more.";

export const ARCHITECT_CROSS_INDUSTRY_TOOLTIP =
  "This position spans multiple industries—architects design for residential, commercial, healthcare, and more.";

/** Industries surfaced for each cross-industry position category. */
export const POSITION_CATEGORY_INDUSTRIES: Record<
  PositionCategory,
  readonly IndustryOption[]
> = {
  "software-development": [
    "Technology",
    "Finance",
    "Healthcare",
    "Retail",
    "Manufacturing",
    "Media",
    "Consulting",
    "Education",
    "Marketing",
  ],
  design: [
    "Technology",
    "Retail",
    "Media",
    "Marketing",
    "Finance",
    "Healthcare",
    "Consulting",
    "Education",
  ],
  "data-analytics": [
    "Technology",
    "Finance",
    "Healthcare",
    "Retail",
    "Consulting",
    "Education",
    "Manufacturing",
  ],
  "product-management": [
    "Technology",
    "Finance",
    "Retail",
    "Healthcare",
    "Media",
    "Consulting",
    "Education",
  ],
  "project-management": [
    "Technology",
    "Finance",
    "Healthcare",
    "Retail",
    "Consulting",
    "Manufacturing",
    "Education",
  ],
  marketing: [
    "Marketing",
    "Retail",
    "Media",
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Consulting",
  ],
  "customer-facing": [
    "Technology",
    "Finance",
    "Retail",
    "Healthcare",
    "Consulting",
    "Manufacturing",
  ],
  "hr-talent": [
    "Technology",
    "Finance",
    "Healthcare",
    "Retail",
    "Manufacturing",
    "Consulting",
    "Education",
    "Nonprofit",
  ],
  operations: [
    "Retail",
    "Manufacturing",
    "Healthcare",
    "Finance",
    "Technology",
    "Consulting",
  ],
  "content-media": [
    "Media",
    "Marketing",
    "Technology",
    "Education",
    "Retail",
    "Nonprofit",
  ],
  architecture: [
    "Healthcare",
    "Retail",
    "Education",
    "Consulting",
    "Manufacturing",
    "Finance",
    "Nonprofit",
  ],
};

const CATEGORY_TITLES: Record<PositionCategory, readonly string[]> = {
  "software-development": [
    "Software Engineer",
    "Senior Software Engineer",
    "Staff Software Engineer",
    "Principal Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "iOS Developer",
    "Android Developer",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Cloud Engineer",
    "Security Engineer",
    "Cybersecurity Analyst",
    "Network Engineer",
    "Systems Administrator",
    "Database Administrator",
    "Solutions Architect",
    "Enterprise Architect",
    "Quality Assurance Engineer",
    "Test Engineer",
  ],
  design: [
    "UX Designer",
    "UI Designer",
    "UI/UX Designer",
    "Product Designer",
    "Graphic Designer",
    "Head of Design",
  ],
  "data-analytics": [
    "Data Analyst",
    "Business Analyst",
    "Data Scientist",
    "Data Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Financial Analyst",
    "Analyst",
  ],
  "product-management": [
    "Product Manager",
    "Senior Product Manager",
    "Product Owner",
    "Technical Product Manager",
    "Head of Product",
    "VP of Product",
    "CPO",
  ],
  "project-management": [
    "Project Manager",
    "Program Manager",
    "Scrum Master",
    "Agile Coach",
  ],
  marketing: [
    "Marketing Manager",
    "Digital Marketing Manager",
    "Growth Marketing Manager",
    "Content Marketing Manager",
    "SEO Specialist",
    "Social Media Manager",
    "CMO",
    "Head of Marketing",
    "VP of Marketing",
  ],
  "customer-facing": [
    "Customer Success Manager",
    "Account Manager",
    "Sales Representative",
    "Account Executive",
    "Business Development Representative",
    "Sales Manager",
    "Head of Sales",
    "VP of Sales",
  ],
  "hr-talent": [
    "Human Resources Manager",
    "Recruiter",
    "Talent Acquisition Specialist",
  ],
  operations: [
    "Operations Manager",
    "Supply Chain Manager",
    "Logistics Coordinator",
    "Warehouse Manager",
    "COO",
  ],
  "content-media": [
    "Technical Writer",
    "Copywriter",
    "Editor",
    "Journalist",
    "Video Producer",
    "Content Marketing Manager",
  ],
  architecture: [
    "Architect",
    "Architectural Designer",
    "Landscape Architect",
    "Building Architect",
    "Project Architect",
    "Design Architect",
  ],
};

const SOFTWARE_ARCHITECT_RE =
  /\b(solutions|enterprise|software|cloud|data|security|systems|technical|application|infrastructure|platform|network|database|integration|domain)\s+architect\b/i;

const BUILDING_ARCHITECT_RE =
  /\b(architectural designer|landscape architect|building architect|project architect|design architect|interior architect)\b/i;

export function isBuildingArchitectVariant(title: string): boolean {
  const normalized = title.trim();
  if (!normalized) return false;
  if (SOFTWARE_ARCHITECT_RE.test(normalized)) return false;
  if (BUILDING_ARCHITECT_RE.test(normalized)) return true;
  return /\barchitect\b/i.test(normalized);
}

const TITLE_CATEGORY_LOOKUP = new Map<string, PositionCategory>();
for (const [category, titles] of Object.entries(CATEGORY_TITLES) as [
  PositionCategory,
  readonly string[],
][]) {
  for (const title of titles) {
    TITLE_CATEGORY_LOOKUP.set(title.toLowerCase(), category);
  }
}

const CATEGORY_KEYWORD_PATTERNS: {
  category: PositionCategory;
  patterns: RegExp[];
}[] = [
  {
    category: "software-development",
    patterns: [
      /\bsoftware (engineer|developer|architect)\b/i,
      /\b(full[- ]?stack|front[- ]?end|back[- ]?end|mobile|ios|android) (developer|engineer)\b/i,
      /\bdevops\b/i,
      /\bsite reliability\b/i,
      /\bcloud engineer\b/i,
      /\bcybersecurity\b/i,
      /\bqa engineer\b/i,
      /\btest engineer\b/i,
    ],
  },
  {
    category: "design",
    patterns: [
      /\b(ui\/ux|ux\/ui|ui|ux|product|graphic) designer\b/i,
      /\buser experience designer\b/i,
      /\buser interface designer\b/i,
    ],
  },
  {
    category: "data-analytics",
    patterns: [
      /\bdata (analyst|scientist|engineer)\b/i,
      /\bbusiness analyst\b/i,
      /\bmachine learning engineer\b/i,
      /\bai engineer\b/i,
      /\bfinancial analyst\b/i,
    ],
  },
  {
    category: "product-management",
    patterns: [
      /\bproduct (manager|owner)\b/i,
      /\btechnical product manager\b/i,
      /\bhead of product\b/i,
      /\bvp of product\b/i,
      /\bchief product officer\b/i,
      /\bcpo\b/i,
    ],
  },
  {
    category: "project-management",
    patterns: [
      /\bproject manager\b/i,
      /\bprogram manager\b/i,
      /\bscrum master\b/i,
      /\bagile coach\b/i,
    ],
  },
  {
    category: "marketing",
    patterns: [
      /\bmarketing (manager|specialist|director)\b/i,
      /\bdigital marketing\b/i,
      /\bgrowth marketing\b/i,
      /\bseo specialist\b/i,
      /\bsocial media manager\b/i,
      /\bchief marketing officer\b/i,
      /\bcmo\b/i,
    ],
  },
  {
    category: "customer-facing",
    patterns: [
      /\bcustomer success\b/i,
      /\baccount (manager|executive)\b/i,
      /\bsales (representative|manager|director)\b/i,
      /\bbusiness development representative\b/i,
      /\baccount executive\b/i,
    ],
  },
  {
    category: "hr-talent",
    patterns: [
      /\bhuman resources\b/i,
      /\brecruiter\b/i,
      /\btalent acquisition\b/i,
    ],
  },
  {
    category: "operations",
    patterns: [
      /\boperations manager\b/i,
      /\bsupply chain\b/i,
      /\blogistics coordinator\b/i,
      /\bwarehouse manager\b/i,
      /\bchief operating officer\b/i,
      /\bcoo\b/i,
    ],
  },
  {
    category: "content-media",
    patterns: [
      /\btechnical writer\b/i,
      /\bcopywriter\b/i,
      /\b(editor|journalist|video producer)\b/i,
      /\bcontent (strategist|creator)\b/i,
    ],
  },
];

/** Common job titles for autocomplete — expandable or replaceable with an external API. */
export const JOB_TITLES: readonly string[] = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Principal Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "iOS Developer",
  "Android Developer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Cloud Engineer",
  "Data Engineer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "Product Manager",
  "Senior Product Manager",
  "Product Owner",
  "Technical Product Manager",
  "Program Manager",
  "Project Manager",
  "Engineering Manager",
  "Director of Engineering",
  "VP of Engineering",
  "Chief Technology Officer",
  "UX Designer",
  "UI Designer",
  "UI/UX Designer",
  "Product Designer",
  "Graphic Designer",
  "Marketing Manager",
  "Digital Marketing Manager",
  "Growth Marketing Manager",
  "Content Marketing Manager",
  "SEO Specialist",
  "Social Media Manager",
  "Sales Representative",
  "Account Executive",
  "Business Development Representative",
  "Sales Manager",
  "Customer Success Manager",
  "Account Manager",
  "Financial Analyst",
  "Investment Analyst",
  "Accountant",
  "Controller",
  "Human Resources Manager",
  "Recruiter",
  "Talent Acquisition Specialist",
  "Operations Manager",
  "Business Analyst",
  "Management Consultant",
  "Strategy Consultant",
  "Legal Counsel",
  "Paralegal",
  "Registered Nurse",
  "Physician",
  "Physical Therapist",
  "Pharmacist",
  "Teacher",
  "Professor",
  "Instructional Designer",
  "Research Scientist",
  "Laboratory Technician",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Civil Engineer",
  "Chemical Engineer",
  "Manufacturing Engineer",
  "Quality Assurance Engineer",
  "Test Engineer",
  "Security Engineer",
  "Cybersecurity Analyst",
  "Network Engineer",
  "Systems Administrator",
  "Database Administrator",
  "Solutions Architect",
  "Enterprise Architect",
  "Scrum Master",
  "Agile Coach",
  "Technical Writer",
  "Copywriter",
  "Editor",
  "Journalist",
  "Video Producer",
  "Photographer",
  "Executive Assistant",
  "Office Manager",
  "Administrative Assistant",
  "Supply Chain Manager",
  "Logistics Coordinator",
  "Warehouse Manager",
  "Retail Store Manager",
  "Chef",
  "Restaurant Manager",
  "Real Estate Agent",
  "Property Manager",
  "Architect",
  "Architectural Designer",
  "Landscape Architect",
  "Building Architect",
  "Project Architect",
  "Design Architect",
  "Interior Designer",
  "Construction Manager",
  "Electrician",
  "Plumber",
  "Founder",
  "Co-Founder",
  "CEO",
  "COO",
  "CFO",
  "CMO",
  "CPO",
  "Head of Product",
  "Head of Growth",
  "Head of Design",
  "Head of Sales",
  "Head of Marketing",
  "VP of Product",
  "VP of Sales",
  "VP of Marketing",
  "Intern",
  "Associate",
  "Analyst",
  "Specialist",
  "Coordinator",
  "Director",
  "Vice President",
];

export function resolvePositionCategory(
  title: string
): PositionCategory | null {
  const normalized = title.trim().toLowerCase();
  if (!normalized) return null;

  const exact = TITLE_CATEGORY_LOOKUP.get(normalized);
  if (exact) return exact;

  for (const { category, patterns } of CATEGORY_KEYWORD_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(title))) {
      return category;
    }
  }

  if (isBuildingArchitectVariant(title)) {
    return "architecture";
  }

  return null;
}

export function getCrossIndustryTooltip(title: string): string {
  const category = resolvePositionCategory(title);
  if (category === "architecture") return ARCHITECT_CROSS_INDUSTRY_TOOLTIP;
  return CROSS_INDUSTRY_TOOLTIP;
}

export function getTitleMetadata(title: string): {
  crossIndustry: boolean;
  category: PositionCategory | null;
  crossIndustryTooltip?: string;
} {
  const category = resolvePositionCategory(title);
  return {
    crossIndustry: category !== null,
    category,
    crossIndustryTooltip: category !== null
      ? getCrossIndustryTooltip(title)
      : undefined,
  };
}

export function getIndustriesForCategories(
  categories: PositionCategory[]
): IndustryOption[] {
  const seen = new Set<IndustryOption>();
  const industries: IndustryOption[] = [];

  for (const category of categories) {
    for (const industry of POSITION_CATEGORY_INDUSTRIES[category]) {
      if (!seen.has(industry)) {
        seen.add(industry);
        industries.push(industry);
      }
    }
  }

  return industries;
}

export function getCrossIndustryContext(jobTitles: string[]): {
  hasCrossIndustry: boolean;
  categories: PositionCategory[];
  relevantIndustries: IndustryOption[];
} {
  const categories = new Set<PositionCategory>();

  for (const title of jobTitles) {
    const category = resolvePositionCategory(title);
    if (category) categories.add(category);
  }

  const categoryList = [...categories];
  return {
    hasCrossIndustry: categoryList.length > 0,
    categories: categoryList,
    relevantIndustries: getIndustriesForCategories(categoryList),
  };
}

export function toJobTitleSuggestion(title: string): JobTitleSuggestion {
  const { crossIndustry, category, crossIndustryTooltip } =
    getTitleMetadata(title);
  return { title, crossIndustry, category, crossIndustryTooltip };
}

export function searchJobTitles(query: string, limit = 8): JobTitleSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: { title: string; score: number }[] = [];

  for (const title of JOB_TITLES) {
    const lower = title.toLowerCase();
    if (!lower.includes(q)) continue;

    let score = 0;
    if (lower.startsWith(q)) score += 10;
    if (lower === q) score += 20;
    const wordStart = lower.split(/\s+/).some((w) => w.startsWith(q));
    if (wordStart) score += 5;
    score -= lower.length * 0.01;

    scored.push({ title, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => toJobTitleSuggestion(s.title));
}
