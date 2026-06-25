import { STATE_NAME_TO_CODE } from "./location";

/** [longitude, latitude] for US cities and common LinkedIn location aliases. */
const CITY_COORDS: Record<string, [number, number]> = {
  "san francisco, ca": [-122.4194, 37.7749],
  "los angeles, ca": [-118.2437, 34.0522],
  "san diego, ca": [-117.1611, 32.7157],
  "san jose, ca": [-121.8863, 37.3382],
  "sacramento, ca": [-121.4944, 38.5816],
  "new york, ny": [-74.006, 40.7128],
  "brooklyn, ny": [-73.9442, 40.6782],
  "buffalo, ny": [-78.8784, 42.8864],
  "austin, tx": [-97.7431, 30.2672],
  "dallas, tx": [-96.797, 32.7767],
  "houston, tx": [-95.3698, 29.7604],
  "san antonio, tx": [-98.4936, 29.4241],
  "seattle, wa": [-122.3321, 47.6062],
  "chicago, il": [-87.6298, 41.8781],
  "denver, co": [-104.9903, 39.7392],
  "boston, ma": [-71.0589, 42.3601],
  "atlanta, ga": [-84.388, 33.749],
  "miami, fl": [-80.1918, 25.7617],
  "portland, or": [-122.6784, 45.5152],
  "phoenix, az": [-112.074, 33.4484],
  "philadelphia, pa": [-75.1652, 39.9526],
  "pittsburgh, pa": [-79.9959, 40.4406],
  "detroit, mi": [-83.0458, 42.3314],
  "minneapolis, mn": [-93.265, 44.9778],
  "nashville, tn": [-86.7816, 36.1627],
  "charlotte, nc": [-80.8431, 35.2271],
  "raleigh, nc": [-78.6382, 35.7796],
  "washington, dc": [-77.0369, 38.9072],
  "baltimore, md": [-76.6122, 39.2904],
  "columbus, oh": [-82.9988, 39.9612],
  "indianapolis, in": [-86.1581, 39.7684],
  "kansas city, mo": [-94.5786, 39.0997],
  "st. louis, mo": [-90.1994, 38.627],
  "las vegas, nv": [-115.1398, 36.1699],
  "salt lake city, ut": [-111.891, 40.7608],
  "albuquerque, nm": [-106.6504, 35.0844],
  "honolulu, hi": [-157.8583, 21.3069],
  "anchorage, ak": [-149.9003, 61.2181],
  "jersey city, nj": [-74.0431, 40.7178],
  "newark, nj": [-74.1724, 40.7357],
  "hoboken, nj": [-74.0324, 40.7439],
  "west new york, nj": [-74.0124, 40.7879],
  "secaucus, nj": [-74.0565, 40.7895],
  "fort lee, nj": [-73.9701, 40.8509],
  "edison, nj": [-74.4121, 40.5187],
  "princeton, nj": [-74.6593, 40.3573],
  "paramus, nj": [-74.0754, 40.9445],
  "morristown, nj": [-74.4774, 40.7968],
  "woodbridge, nj": [-74.2846, 40.5576],
  "east rutherford, nj": [-74.0971, 40.8339],
  "elizabeth, nj": [-74.2107, 40.6639],
  "summit, nj": [-74.3596, 40.7176],
  "short hills, nj": [-74.3254, 40.7479],
  "parsippany, nj": [-74.4257, 40.8579],
  "long island city, ny": [-73.9442, 40.7447],
  "queens, ny": [-73.7949, 40.7282],
  "bronx, ny": [-73.8648, 40.8448],
  "staten island, ny": [-74.1502, 40.5795],
  "white plains, ny": [-73.7629, 41.034],
  "yonkers, ny": [-73.8987, 40.9312],
  "palo alto, ca": [-122.143, 37.4419],
  "mountain view, ca": [-122.0838, 37.3861],
  "sunnyvale, ca": [-122.0363, 37.3688],
  "redmond, wa": [-122.1215, 47.674],
  "bellevue, wa": [-122.2015, 47.6101],
  "cambridge, ma": [-71.1097, 42.3736],
  "arlington, va": [-77.1044, 38.8816],
  "irvine, ca": [-117.8265, 33.6846],
};

/** Metro-area and shorthand strings → canonical city key in CITY_COORDS. */
const LOCATION_ALIASES: Record<string, string> = {
  "new york": "new york, ny",
  "new york city": "new york, ny",
  nyc: "new york, ny",
  manhattan: "new york, ny",
  "long island city": "long island city, ny",
  queens: "queens, ny",
  bronx: "bronx, ny",
  "staten island": "staten island, ny",
  "greater new york city area": "new york, ny",
  "new york city metropolitan area": "new york, ny",
  "san francisco bay area": "san francisco, ca",
  "sf bay area": "san francisco, ca",
  "bay area": "san francisco, ca",
  "silicon valley": "san jose, ca",
  "greater boston area": "boston, ma",
  "greater chicago area": "chicago, il",
  "greater los angeles area": "los angeles, ca",
  "greater seattle area": "seattle, wa",
  "washington dc": "washington, dc",
  "washington, dc": "washington, dc",
  "district of columbia": "washington, dc",
};

function cityKey(city: string, stateCode: string): string {
  return `${city.trim().toLowerCase()}, ${stateCode.trim().toLowerCase()}`;
}

export function normalizeLocationString(location: string): string {
  let raw = location.trim();
  raw = raw.replace(/,\s*(United States(?: of America)?|USA|U\.S\.A\.|US|U\.S\.)\s*$/i, "");
  raw = raw.replace(/^(?:on[- ]site|hybrid|remote|full[- ]time|part[- ]time)\s*[·•\-–—|]\s*/i, "");
  raw = raw.replace(/\s*[·•\-–—|]\s*(?:on[- ]site|hybrid|remote|full[- ]time|part[- ]time)\s*$/i, "");
  raw = raw.replace(/\s*\([^)]*\)\s*$/g, "");
  raw = raw.replace(/\s+/g, " ");

  const commaMatch = raw.match(/^([^,]+),\s*([A-Za-z.\s]+)$/);
  if (commaMatch) {
    const place = commaMatch[1].trim();
    const region = commaMatch[2].trim().toLowerCase();
    const stateCode = STATE_NAME_TO_CODE[region];
    if (stateCode) {
      return `${place}, ${stateCode}`;
    }
  }

  return raw;
}

function parseCityStateKey(location: string): string | null {
  const normalized = normalizeLocationString(location);
  const match = normalized.match(/([^,]+),\s*([A-Za-z]{2})\b/);
  if (!match) return null;
  return cityKey(match[1], match[2]);
}

export function explicitStateCode(location: string): string | null {
  const key = parseCityStateKey(location);
  if (!key) return null;
  const state = key.split(", ")[1]?.toUpperCase();
  return state ?? null;
}

function canonicalStateCode(canonicalKey: string): string | null {
  return canonicalKey.split(", ")[1]?.toUpperCase() ?? null;
}

export function lookupKnownLocation(location: string): [number, number] | null {
  const normalized = normalizeLocationString(location);
  const lower = normalized.toLowerCase();

  const aliasKey = LOCATION_ALIASES[lower];
  if (aliasKey && CITY_COORDS[aliasKey]) {
    return CITY_COORDS[aliasKey];
  }

  const cityStateKey = parseCityStateKey(normalized);
  if (cityStateKey && CITY_COORDS[cityStateKey]) {
    return CITY_COORDS[cityStateKey];
  }

  const explicitState = explicitStateCode(normalized);

  const aliasesByLength = Object.entries(LOCATION_ALIASES).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [alias, canonical] of aliasesByLength) {
    if (!lower.includes(alias) || !CITY_COORDS[canonical]) continue;

    const aliasState = canonicalStateCode(canonical);
    if (explicitState && aliasState && explicitState !== aliasState) {
      continue;
    }

    return CITY_COORDS[canonical];
  }

  return null;
}
