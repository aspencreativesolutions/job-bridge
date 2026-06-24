/**
 * One-time generator: npx tsx scripts/generate-us-map-coords.ts
 * Projects city/state coordinates onto the same SVG space as us-state-paths.json.
 */
import { writeFileSync } from "fs";
import { geoAlbersUsa } from "d3-geo";

const projection = geoAlbersUsa().scale(1100).translate([480, 290]);

function project(lng: number, lat: number): [number, number] | null {
  const pt = projection([lng, lat]);
  if (!pt || Number.isNaN(pt[0]) || Number.isNaN(pt[1])) return null;
  return [Math.round(pt[0] * 100) / 100, Math.round(pt[1] * 100) / 100];
}

/** [lng, lat] — major US cities + mock job locations */
const CITIES: Record<string, [number, number]> = {
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
};

/** Approximate geographic centers [lng, lat] */
const STATE_CENTROIDS: Record<string, [number, number]> = {
  AL: [-86.7911, 32.8067],
  AK: [-152.4044, 61.3707],
  AZ: [-111.4312, 33.7298],
  AR: [-92.3731, 34.9697],
  CA: [-119.4179, 36.7783],
  CO: [-105.3111, 39.0598],
  CT: [-72.7554, 41.5978],
  DE: [-75.5071, 39.3185],
  DC: [-77.0369, 38.9072],
  FL: [-81.5158, 27.8333],
  GA: [-83.5007, 32.9866],
  HI: [-157.4983, 21.0943],
  ID: [-114.4788, 44.2405],
  IL: [-89.3985, 40.3495],
  IN: [-86.2816, 39.8494],
  IA: [-93.2105, 42.0115],
  KS: [-98.3804, 38.5266],
  KY: [-84.6701, 37.6681],
  LA: [-91.8749, 31.1695],
  ME: [-69.3977, 44.6939],
  MD: [-76.8021, 39.0639],
  MA: [-71.5376, 42.2302],
  MI: [-84.5467, 43.3266],
  MN: [-94.6859, 46.7296],
  MS: [-89.6678, 32.7416],
  MO: [-92.1893, 38.4561],
  MT: [-110.3626, 47.0527],
  NE: [-99.9018, 41.1254],
  NV: [-117.0554, 38.3135],
  NH: [-71.5653, 43.4525],
  NJ: [-74.521, 40.2989],
  NM: [-106.2485, 34.8405],
  NY: [-74.9481, 42.9538],
  NC: [-79.0193, 35.6301],
  ND: [-99.784, 47.5289],
  OH: [-82.7649, 40.3888],
  OK: [-97.5349, 35.5653],
  OR: [-120.5542, 43.9336],
  PA: [-77.2098, 40.5908],
  RI: [-71.5118, 41.6809],
  SC: [-80.945, 33.8569],
  SD: [-99.9018, 44.2998],
  TN: [-86.6923, 35.7478],
  TX: [-99.9018, 31.9686],
  UT: [-111.8624, 40.1505],
  VT: [-72.7317, 44.0459],
  VA: [-78.1699, 37.7693],
  WA: [-121.4905, 47.4009],
  WV: [-80.9696, 38.4912],
  WI: [-89.6165, 44.2685],
  WY: [-107.3025, 42.7559],
};

const cityCoords: Record<string, [number, number]> = {};
for (const [key, coords] of Object.entries(CITIES)) {
  const pt = project(coords[0], coords[1]);
  if (pt) cityCoords[key] = pt;
}

const stateCentroids: Record<string, [number, number]> = {};
for (const [code, coords] of Object.entries(STATE_CENTROIDS)) {
  const pt = project(coords[0], coords[1]);
  if (pt) stateCentroids[code] = pt;
}

const out = "src/lib/jobs/us-map-coords.json";
writeFileSync(out, JSON.stringify({ cities: cityCoords, stateCentroids }, null, 2));
console.log(
  `Wrote ${Object.keys(cityCoords).length} cities and ${Object.keys(stateCentroids).length} state centroids to ${out}`
);
