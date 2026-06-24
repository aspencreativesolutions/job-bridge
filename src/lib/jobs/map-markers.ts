import mapCoords from "./us-map-coords.json";
import { parseJobLocation } from "./location";

export interface JobMapMarker {
  id: string;
  x: number;
  y: number;
  title: string;
  company: string;
  location: string;
  stateCode: string | null;
}

const cities = mapCoords.cities as unknown as Record<string, [number, number]>;
const stateCentroids = mapCoords.stateCentroids as unknown as Record<
  string,
  [number, number]
>;

function parseCityKey(location: string): string | null {
  const raw = location.trim();
  const commaMatch = raw.match(/^([^,]+),\s*([A-Za-z]{2})\b/);
  if (commaMatch) {
    return `${commaMatch[1].trim().toLowerCase()}, ${commaMatch[2].toUpperCase()}`.toLowerCase();
  }
  return null;
}

function hashOffset(id: string, index: number): [number, number] {
  let hash = index * 17;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 4 + (Math.abs(hash) % 3) * 2;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function resolveCoords(
  location: string,
  stateCode: string | null,
  id: string,
  index: number
): [number, number] | null {
  const cityKey = parseCityKey(location);
  if (cityKey && cities[cityKey]) {
    const [x, y] = cities[cityKey];
    const [dx, dy] = hashOffset(id, index);
    return [x + dx, y + dy];
  }

  if (stateCode && stateCentroids[stateCode]) {
    const [x, y] = stateCentroids[stateCode];
    const [dx, dy] = hashOffset(id, index + 1);
    return [x + dx * 2, y + dy * 2];
  }

  return null;
}

export function getJobMapMarkers(
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string | null;
  }[]
): JobMapMarker[] {
  const locationGroups = new Map<string, number>();

  return jobs
    .map((job) => {
      const parsed = parseJobLocation(job.location);
      if (parsed.isRemote || !job.location?.trim()) return null;

      const groupKey = job.location.trim().toLowerCase();
      const index = locationGroups.get(groupKey) ?? 0;
      locationGroups.set(groupKey, index + 1);

      const coords = resolveCoords(job.location, parsed.stateCode, job.id, index);
      if (!coords) return null;

      return {
        id: job.id,
        x: coords[0],
        y: coords[1],
        title: job.title,
        company: job.company,
        location: job.location,
        stateCode: parsed.stateCode,
      };
    })
    .filter((m): m is JobMapMarker => m !== null);
}
