import { geoAlbersUsa } from "d3-geo";

export const MAP_W = 960;
export const MAP_H = 580;

/** Same projection as us-state-paths.json and generate-us-map-coords.ts */
const projection = geoAlbersUsa().scale(1100).translate([480, 290]);

export function projectLngLat(lng: number, lat: number): [number, number] | null {
  const pt = projection([lng, lat]);
  if (!pt || Number.isNaN(pt[0]) || Number.isNaN(pt[1])) return null;
  return [pt[0], pt[1]];
}
