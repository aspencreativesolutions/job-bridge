import { projectLngLat } from "./map-projection";
import { parseJobLocation } from "./location";

export interface JobMapMarker {
  id: string;
  x: number;
  y: number;
  title: string;
  company: string;
  location: string;
  placeName: string;
  stateCode: string | null;
}

/** Tiny spread so overlapping jobs remain visible without crossing state borders. */
function clusterOffset(id: string, index: number): [number, number] {
  let hash = index * 17;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 1 + (Math.abs(hash) % 2);
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function coordCacheKey(lng: number, lat: number): string {
  return `${lng.toFixed(4)},${lat.toFixed(4)}`;
}

export function buildJobMapMarkers(
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string | null;
  }[],
  geocoded: Map<string, [number, number] | null>,
  placeNames: Map<string, string | null>
): JobMapMarker[] {
  const locationGroups = new Map<string, number>();

  return jobs
    .map((job) => {
      const parsed = parseJobLocation(job.location);
      if (parsed.isRemote || !job.location?.trim()) return null;

      const locationKey = job.location.trim();
      const lngLat = geocoded.get(locationKey);
      if (!lngLat) return null;

      const projected = projectLngLat(lngLat[0], lngLat[1]);
      if (!projected) return null;

      const groupKey = locationKey.toLowerCase();
      const index = locationGroups.get(groupKey) ?? 0;
      locationGroups.set(groupKey, index + 1);

      const [dx, dy] = clusterOffset(job.id, index);
      const placeName =
        placeNames.get(coordCacheKey(lngLat[0], lngLat[1])) ?? locationKey;

      return {
        id: job.id,
        x: projected[0] + dx,
        y: projected[1] + dy,
        title: job.title,
        company: job.company,
        location: locationKey,
        placeName,
        stateCode: parsed.stateCode,
      };
    })
    .filter((m): m is JobMapMarker => m !== null);
}
