interface CompanyStats {
  employees: number;
  payIndex: number;
}

/** Approximate headcount and pay relative to US market average (1.0). */
export const COMPANY_STATS: Record<string, CompanyStats> = {
  "3M": { employees: 92_000, payIndex: 1.05 },
  "2U": { employees: 3_500, payIndex: 0.95 },
  Abbott: { employees: 114_000, payIndex: 1.1 },
  Accenture: { employees: 774_000, payIndex: 1.15 },
  Adobe: { employees: 30_000, payIndex: 1.28 },
  Amazon: { employees: 1_500_000, payIndex: 1.2 },
  Amgen: { employees: 27_000, payIndex: 1.15 },
  Apple: { employees: 164_000, payIndex: 1.25 },
  "Bain & Company": { employees: 16_000, payIndex: 1.35 },
  "Bank of America": { employees: 213_000, payIndex: 1.1 },
  "Best Buy": { employees: 85_000, payIndex: 0.95 },
  BlackRock: { employees: 21_000, payIndex: 1.35 },
  "Boeing": { employees: 171_000, payIndex: 1.1 },
  "Boston Consulting Group": { employees: 32_000, payIndex: 1.4 },
  Braze: { employees: 1_800, payIndex: 1.2 },
  "Boys & Girls Clubs": { employees: 50_000, payIndex: 0.7 },
  Capgemini: { employees: 340_000, payIndex: 1.05 },
  Caterpillar: { employees: 113_000, payIndex: 1.05 },
  "Charles Schwab": { employees: 35_000, payIndex: 1.15 },
  Chegg: { employees: 1_700, payIndex: 1.05 },
  Citigroup: { employees: 240_000, payIndex: 1.15 },
  Comcast: { employees: 186_000, payIndex: 1.05 },
  "Condé Nast": { employees: 6_000, payIndex: 0.95 },
  Costco: { employees: 333_000, payIndex: 1.05 },
  Coursera: { employees: 1_200, payIndex: 1.1 },
  "CVS Health": { employees: 300_000, payIndex: 0.95 },
  Deloitte: { employees: 460_000, payIndex: 1.2 },
  Disney: { employees: 225_000, payIndex: 1.05 },
  "Doctors Without Borders": { employees: 45_000, payIndex: 0.75 },
  Duolingo: { employees: 800, payIndex: 1.25 },
  EY: { employees: 400_000, payIndex: 1.15 },
  "Elevance Health": { employees: 104_000, payIndex: 1.05 },
  "Feeding America": { employees: 200, payIndex: 0.72 },
  Fidelity: { employees: 74_000, payIndex: 1.2 },
  Ford: { employees: 177_000, payIndex: 1.05 },
  "Fox Corporation": { employees: 9_000, payIndex: 1.0 },
  "General Electric": { employees: 125_000, payIndex: 1.1 },
  "General Motors": { employees: 163_000, payIndex: 1.05 },
  Goodwill: { employees: 120_000, payIndex: 0.68 },
  Google: { employees: 182_000, payIndex: 1.35 },
  "Goldman Sachs": { employees: 45_000, payIndex: 1.45 },
  "Habitat for Humanity": { employees: 1_200, payIndex: 0.72 },
  "HCA Healthcare": { employees: 280_000, payIndex: 0.95 },
  "Home Depot": { employees: 470_000, payIndex: 0.95 },
  Honeywell: { employees: 103_000, payIndex: 1.1 },
  Hootsuite: { employees: 1_000, payIndex: 1.05 },
  HubSpot: { employees: 8_000, payIndex: 1.2 },
  IBM: { employees: 288_000, payIndex: 1.1 },
  "IBM Consulting": { employees: 160_000, payIndex: 1.12 },
  Instructure: { employees: 1_500, payIndex: 1.05 },
  "Interpublic Group": { employees: 58_000, payIndex: 1.0 },
  "JPMorgan Chase": { employees: 310_000, payIndex: 1.15 },
  "Johnson & Johnson": { employees: 152_000, payIndex: 1.15 },
  "Khan Academy": { employees: 250, payIndex: 0.85 },
  Klaviyo: { employees: 1_600, payIndex: 1.15 },
  KPMG: { employees: 275_000, payIndex: 1.12 },
  Kroger: { employees: 430_000, payIndex: 0.9 },
  "Lockheed Martin": { employees: 122_000, payIndex: 1.12 },
  "Lowe's": { employees: 300_000, payIndex: 0.95 },
  Mailchimp: { employees: 1_200, payIndex: 1.05 },
  Mastercard: { employees: 34_000, payIndex: 1.25 },
  "McGraw Hill": { employees: 4_000, payIndex: 1.0 },
  "McKinsey & Company": { employees: 45_000, payIndex: 1.42 },
  Medtronic: { employees: 95_000, payIndex: 1.1 },
  Merck: { employees: 71_000, payIndex: 1.15 },
  Meta: { employees: 67_000, payIndex: 1.35 },
  Microsoft: { employees: 228_000, payIndex: 1.3 },
  "Morgan Stanley": { employees: 82_000, payIndex: 1.35 },
  Netflix: { employees: 14_000, payIndex: 1.4 },
  Nike: { employees: 83_000, payIndex: 1.1 },
  NVIDIA: { employees: 36_000, payIndex: 1.4 },
  "New York Times": { employees: 5_800, payIndex: 1.0 },
  "Omnicom Group": { employees: 75_000, payIndex: 1.0 },
  Oracle: { employees: 160_000, payIndex: 1.15 },
  Paramount: { employees: 22_000, payIndex: 1.0 },
  Pearson: { employees: 20_000, payIndex: 1.0 },
  Pfizer: { employees: 88_000, payIndex: 1.15 },
  PowerSchool: { employees: 3_000, payIndex: 1.0 },
  "Procter & Gamble": { employees: 107_000, payIndex: 1.08 },
  PwC: { employees: 370_000, payIndex: 1.18 },
  "Publicis Groupe": { employees: 103_000, payIndex: 1.0 },
  "Red Cross": { employees: 20_000, payIndex: 0.75 },
  Salesforce: { employees: 73_000, payIndex: 1.25 },
  "Salvation Army": { employees: 25_000, payIndex: 0.68 },
  Siemens: { employees: 320_000, payIndex: 1.08 },
  Sony: { employees: 113_000, payIndex: 1.05 },
  Spotify: { employees: 9_000, payIndex: 1.25 },
  "Sprout Social": { employees: 1_200, payIndex: 1.1 },
  Starbucks: { employees: 402_000, payIndex: 0.9 },
  Stride: { employees: 5_000, payIndex: 0.95 },
  Target: { employees: 440_000, payIndex: 0.95 },
  "United Way": { employees: 2_500, payIndex: 0.72 },
  "UnitedHealth Group": { employees: 440_000, payIndex: 1.1 },
  Visa: { employees: 28_000, payIndex: 1.3 },
  Walmart: { employees: 2_100_000, payIndex: 0.92 },
  "Warner Bros. Discovery": { employees: 35_000, payIndex: 1.05 },
  WPP: { employees: 115_000, payIndex: 1.0 },
  "World Wildlife Fund": { employees: 6_000, payIndex: 0.78 },
  YMCA: { employees: 20_000, payIndex: 0.7 },
};

const ROLE_BASE_SALARIES: { keywords: string[]; base: number }[] = [
  {
    keywords: ["principal", "staff", "director", "vp", "head of", "chief"],
    base: 185_000,
  },
  {
    keywords: ["senior", "sr.", "lead", "manager"],
    base: 155_000,
  },
  {
    keywords: [
      "software",
      "engineer",
      "developer",
      "programmer",
      "sre",
      "devops",
      "data scientist",
      "machine learning",
      "cybersecurity",
    ],
    base: 130_000,
  },
  {
    keywords: ["product", "pm"],
    base: 135_000,
  },
  {
    keywords: ["designer", "ux", "ui"],
    base: 115_000,
  },
  {
    keywords: ["marketing", "brand", "content", "seo"],
    base: 90_000,
  },
  {
    keywords: ["consultant", "analyst", "strategy"],
    base: 120_000,
  },
  {
    keywords: ["nurse", "physician", "clinical", "pharmacist", "healthcare"],
    base: 85_000,
  },
  {
    keywords: ["teacher", "instructor", "professor", "education"],
    base: 65_000,
  },
  {
    keywords: ["finance", "accountant", "banking", "trader"],
    base: 105_000,
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBaseSalaryForTitles(jobTitles: string[]): number {
  const combined = jobTitles.join(" ").toLowerCase();
  for (const role of ROLE_BASE_SALARIES) {
    if (role.keywords.some((keyword) => combined.includes(keyword))) {
      return role.base;
    }
  }
  return 85_000;
}

export function formatEmployeeCount(employees: number): string {
  if (employees >= 1_000_000) {
    const millions = employees / 1_000_000;
    const formatted =
      millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10;
    return `${formatted}M employees`;
  }
  if (employees >= 1_000) {
    return `${Math.round(employees / 1_000)}K employees`;
  }
  return `${employees.toLocaleString("en-US")} employees`;
}

export function getCompanyTooltipText(
  company: string,
  jobTitles: string[]
): string {
  const stats = COMPANY_STATS[company] ?? {
    employees: 25_000,
    payIndex: 1.0,
  };
  const roleLabel =
    jobTitles.length > 0 ? jobTitles[0] : "similar roles";
  const base = getBaseSalaryForTitles(jobTitles);
  const estimated = Math.round((base * stats.payIndex) / 1_000) * 1_000;

  return `${formatEmployeeCount(stats.employees)}\nAvg. ${formatCurrency(estimated)}/yr for ${roleLabel}`;
}
