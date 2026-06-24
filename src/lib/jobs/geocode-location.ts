import { lookupKnownLocation, normalizeLocationString } from "./known-locations";
import { STATE_NAME_TO_CODE } from "./location";

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

async function geocodeWithNominatim(
  location: string
): Promise<[number, number] | null> {
  const query = location.match(/\b(USA|United States)\b/i)
    ? location
    : `${location}, USA`;

  await throttleNominatim();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "JobBridge/1.0 (job location map)" },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { lat: string; lon: string }[];
  if (!data.length) return null;

  const lat = Number(data[0].lat);
  const lng = Number(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return [lng, lat];
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

  const known = lookupKnownLocation(raw);
  if (known) {
    geocodeCache.set(cacheKey, known);
    return known;
  }

  const normalized = normalizeLocationString(raw);
  const normalizedKnown = lookupKnownLocation(normalized);
  if (normalizedKnown) {
    geocodeCache.set(cacheKey, normalizedKnown);
    return normalizedKnown;
  }

  try {
    const coords = await geocodeWithNominatim(normalized);
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
