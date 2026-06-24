import statePaths from "./us-state-paths.json";

export interface StatePath {
  id: string;
  path: string;
  stateCode: string;
}

/** Precomputed SVG paths — no runtime fetch or d3-geo needed. */
export function loadUsStatePaths(): Promise<StatePath[]> {
  return Promise.resolve(statePaths as StatePath[]);
}
