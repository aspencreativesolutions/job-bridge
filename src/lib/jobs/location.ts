/** US state abbreviations and names for location parsing. */
export const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

export const STATE_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_TO_CODE).map(([name, code]) => [
    code,
    name.replace(/\b\w/g, (c) => c.toUpperCase()),
  ])
);

/** FIPS code (from us-atlas) → state abbreviation */
export const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL",
  "02": "AK",
  "04": "AZ",
  "05": "AR",
  "06": "CA",
  "08": "CO",
  "09": "CT",
  "10": "DE",
  "11": "DC",
  "12": "FL",
  "13": "GA",
  "15": "HI",
  "16": "ID",
  "17": "IL",
  "18": "IN",
  "19": "IA",
  "20": "KS",
  "21": "KY",
  "22": "LA",
  "23": "ME",
  "24": "MD",
  "25": "MA",
  "26": "MI",
  "27": "MN",
  "28": "MS",
  "29": "MO",
  "30": "MT",
  "31": "NE",
  "32": "NV",
  "33": "NH",
  "34": "NJ",
  "35": "NM",
  "36": "NY",
  "37": "NC",
  "38": "ND",
  "39": "OH",
  "40": "OK",
  "41": "OR",
  "42": "PA",
  "44": "RI",
  "45": "SC",
  "46": "SD",
  "47": "TN",
  "48": "TX",
  "49": "UT",
  "50": "VT",
  "51": "VA",
  "53": "WA",
  "54": "WV",
  "55": "WI",
  "56": "WY",
};

const STATE_CODES = new Set(Object.values(STATE_NAME_TO_CODE));

export interface ParsedLocation {
  stateCode: string | null;
  isRemote: boolean;
  raw: string;
}

export function parseJobLocation(location: string | null | undefined): ParsedLocation {
  const raw = (location ?? "").trim();
  if (!raw) return { stateCode: null, isRemote: false, raw };

  const lower = raw.toLowerCase();
  if (/\bremote\b/.test(lower) || lower === "anywhere") {
    return { stateCode: null, isRemote: true, raw };
  }

  const abbrevMatch = raw.match(/,\s*([A-Z]{2})\b/);
  if (abbrevMatch) {
    const code = abbrevMatch[1].toUpperCase();
    if (STATE_CODES.has(code)) {
      return { stateCode: code, isRemote: false, raw };
    }
  }

  const trailingAbbrev = raw.match(/\b([A-Z]{2})\b$/);
  if (trailingAbbrev && STATE_CODES.has(trailingAbbrev[1])) {
    return { stateCode: trailingAbbrev[1], isRemote: false, raw };
  }

  for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
    if (lower.includes(name)) {
      return { stateCode: code, isRemote: false, raw };
    }
  }

  return { stateCode: null, isRemote: false, raw };
}

export function countJobsByState(
  jobs: { location: string | null }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const job of jobs) {
    const { stateCode } = parseJobLocation(job.location);
    if (stateCode) {
      counts[stateCode] = (counts[stateCode] ?? 0) + 1;
    }
  }
  return counts;
}
