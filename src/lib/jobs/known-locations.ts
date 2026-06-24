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
  return `${city.trim().toLowerCase()}, ${stateCode.toUpperCase()}`;
}

export function normalizeLocationString(location: string): string {
  let raw = location.trim();
  raw = raw.replace(/,\s*(United States(?: of America)?|USA|U\.S\.A\.|US|U\.S\.)\s*$/i, "");
  raw = raw.replace(/^(?:on[- ]site|hybrid|remote|full[- ]time|part[- ]time)\s*[·•\-–—|]\s*/i, "");
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

  for (const [alias, canonical] of Object.entries(LOCATION_ALIASES)) {
    if (lower.includes(alias) && CITY_COORDS[canonical]) {
      return CITY_COORDS[canonical];
    }
  }

  return null;
}
