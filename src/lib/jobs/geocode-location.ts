import {
  explicitStateCode,
  lookupKnownLocation,
  normalizeLocationString,
} from "./known-locations";
import { parseJobLocation, STATE_CODE_TO_NAME, STATE_NAME_TO_CODE } from "./location";

const geocodeCache = new Map<string, [number, number] | null>();
const reverseGeocodeCache = new Map<string, string | null>();
let lastNominatimRequestAt = 0;

const NOMINATIM_MIN_INTERVAL_MS = 1100;

async function throttleNominatim(): Promise<void> {
  const elapsed = Date.now() - lastNominatimRequestAt;
  if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, NOMINATIM_MIN_INTERVAL_MS - elapsed)
    );
  }
  lastNominatimRequestAt = Date.now();
}

function stateCodeFromAddress(address: NominatimAddress): string | null {
  const fromIso = address["ISO3166-2-lvl4"]?.replace(/^US-/, "");
  if (fromIso && fromIso.length === 2) return fromIso.toUpperCase();

  if (address.state) {
    return STATE_NAME_TO_CODE[address.state.toLowerCase()] ?? null;
  }

  return null;
}

interface NominatimSearchHit {
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

function coordsFromHit(hit: NominatimSearchHit): [number, number] | null {
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lng, lat];
}

function pickGeocodeHit(
  hits: NominatimSearchHit[],
  expectedStateCode: string | null
): [number, number] | null {
  if (!hits.length) return null;

  if (expectedStateCode) {
    for (const hit of hits) {
      const state = hit.address ? stateCodeFromAddress(hit.address) : null;
      if (state === expectedStateCode) {
        const coords = coordsFromHit(hit);
        if (coords) return coords;
      }
    }
    return null;
  }

  return coordsFromHit(hits[0]);
}

async function fetchNominatimSearch(
  query: string,
  limit: number
): Promise<NominatimSearchHit[]> {
  await throttleNominatim();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "JobBridge/1.0 (job location map)" },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!res.ok) return [];

  return (await res.json()) as NominatimSearchHit[];
}

async function geocodeWithNominatim(
  location: string,
  expectedStateCode: string | null = null
): Promise<[number, number] | null> {
  const query = location.match(/\b(USA|United States)\b/i)
    ? location
    : `${location}, USA`;

  const hits = await fetchNominatimSearch(query, expectedStateCode ? 8 : 1);
  const match = pickGeocodeHit(hits, expectedStateCode);
  if (match) return match;

  if (!expectedStateCode) return null;

  const stateName = STATE_CODE_TO_NAME[expectedStateCode];
  if (!stateName) return null;

  const cityMatch = normalizeLocationString(location).match(/^([^,]+),/);
  if (!cityMatch) return null;

  const city = cityMatch[1].trim();
  const structuredQuery = `${city}, ${stateName}, USA`;
  const structuredHits = await fetchNominatimSearch(structuredQuery, 8);
  return pickGeocodeHit(structuredHits, expectedStateCode);
}

export async function geocodeLocation(
  location: string
): Promise<[number, number] | null> {
  const raw = location.trim();
  if (!raw) return null;

  const cacheKey = raw.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  const { stateCode: expectedState } = parseJobLocation(raw);
  const normalized = normalizeLocationString(raw);

  const known =
    lookupKnownLocation(raw) ??
    lookupKnownLocation(normalized);
  if (known) {
    geocodeCache.set(cacheKey, known);
    return known;
  }

  try {
    const coords = await geocodeWithNominatim(
      normalized,
      expectedState ?? explicitStateCode(normalized)
    );
    geocodeCache.set(cacheKey, coords);
    return coords;
  } catch {
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

export async function geocodeLocations(
  locations: string[]
): Promise<Map<string, [number, number] | null>> {
  const unique = [...new Set(locations.map((l) => l.trim()).filter(Boolean))];
  const results = new Map<string, [number, number] | null>();

  for (const location of unique) {
    results.set(location, await geocodeLocation(location));
  }

  return results;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state?: string;
  "ISO3166-2-lvl4"?: string;
}

function coordCacheKey(lng: number, lat: number): string {
  return `${lng.toFixed(4)},${lat.toFixed(4)}`;
}

function formatPlaceLabel(address: NominatimAddress): string | null {
  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.hamlet ??
    address.municipality ??
    address.county;
  if (!locality) return null;

  const stateCode =
    address["ISO3166-2-lvl4"]?.replace(/^US-/, "") ??
    (address.state
      ? STATE_NAME_TO_CODE[address.state.toLowerCase()] ?? address.state
      : null);
  if (!stateCode) return null;

  return `${locality}, ${stateCode}`;
}

async function reverseGeocodeWithNominatim(
  lng: number,
  lat: number
): Promise<string | null> {
  await throttleNominatim();

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("zoom", "10");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "JobBridge/1.0 (job location map)" },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { address?: NominatimAddress };
  if (!data.address) return null;

  return formatPlaceLabel(data.address);
}

export async function reverseGeocodeLngLat(
  lng: number,
  lat: number
): Promise<string | null> {
  const key = coordCacheKey(lng, lat);
  if (reverseGeocodeCache.has(key)) {
    return reverseGeocodeCache.get(key) ?? null;
  }

  try {
    const label = await reverseGeocodeWithNominatim(lng, lat);
    reverseGeocodeCache.set(key, label);
    return label;
  } catch {
    reverseGeocodeCache.set(key, null);
    return null;
  }
}

export async function reverseGeocodeLngLats(
  coords: [number, number][]
): Promise<Map<string, string | null>> {
  const unique = new Map<string, [number, number]>();
  for (const [lng, lat] of coords) {
    unique.set(coordCacheKey(lng, lat), [lng, lat]);
  }

  const results = new Map<string, string | null>();
  for (const [key, [lng, lat]] of unique) {
    results.set(key, await reverseGeocodeLngLat(lng, lat));
  }

  return results;
}
