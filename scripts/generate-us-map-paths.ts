/**
 * One-time generator: npx tsx scripts/generate-us-map-paths.ts
 * Writes precomputed SVG paths so the app doesn't need d3-geo at runtime.
 */
import { writeFileSync } from "fs";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY",
};

const US_ATLAS_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

async function main() {
  const res = await fetch(US_ATLAS_URL);
  const topology = (await res.json()) as Topology;
  const states = feature(
    topology,
    topology.objects.states as GeometryCollection
  );
  const projection = geoAlbersUsa().scale(1100).translate([480, 290]);
  const pathGen = geoPath(projection);
  const items: { id: string; path: string; stateCode: string }[] = [];

  for (const f of states.features) {
    const fips = String(f.id ?? "");
    const stateCode = FIPS_TO_STATE[fips];
    if (!stateCode) continue;
    const d = pathGen(f);
    if (!d) continue;
    items.push({ id: fips, path: d, stateCode });
  }

  const out = "src/lib/jobs/us-state-paths.json";
  writeFileSync(out, JSON.stringify(items));
  console.log(`Wrote ${items.length} state paths to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
