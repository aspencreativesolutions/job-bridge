"use client";

import { useEffect, useMemo, useState } from "react";
import { STATE_CODE_TO_NAME } from "@/lib/jobs/location";
import { loadUsStatePaths, type StatePath } from "@/lib/jobs/us-map-geo";
import type { JobMapMarker } from "@/lib/jobs/map-markers";
import { MapPin, X } from "lucide-react";

interface Props {
  markers: JobMapMarker[];
  selectedMarkerId: string | null;
  onSelectMarker: (id: string | null) => void;
  focused: boolean;
  onEnterFocus: () => void;
  onExitFocus: () => void;
  remoteCount: number;
}

function MarkerDot({
  marker,
  selected,
  interactive,
  onSelect,
}: {
  marker: JobMapMarker;
  selected: boolean;
  interactive: boolean;
  onSelect: () => void;
}) {
  const r = selected ? 7 : 5;
  return (
    <g
      className={interactive ? "cursor-pointer" : undefined}
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation();
              onSelect();
            }
          : undefined
      }
    >
      <circle
        cx={marker.x}
        cy={marker.y}
        r={r + 4}
        fill="rgba(34, 211, 238, 0.2)"
        className="transition-all duration-200"
      />
      <circle
        cx={marker.x}
        cy={marker.y}
        r={r}
        fill={selected ? "rgb(34, 211, 238)" : "rgb(56, 189, 248)"}
        stroke={selected ? "white" : "rgba(255,255,255,0.8)"}
        strokeWidth={selected ? 2 : 1}
        className="transition-all duration-200"
        style={{
          filter: selected ? "url(#map-glow)" : undefined,
        }}
      />
      <title>
        {marker.company} — {marker.location}
      </title>
    </g>
  );
}

export function UsJobMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  focused,
  onEnterFocus,
  onExitFocus,
  remoteCount,
}: Props) {
  const [features, setFeatures] = useState<StatePath[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadUsStatePaths()
      .then((items) => {
        if (!cancelled) setFeatures(items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const locatedCount = markers.length;

  const selectedMarker = useMemo(
    () => markers.find((m) => m.id === selectedMarkerId) ?? null,
    [markers, selectedMarkerId]
  );

  const mapSvg = (
    <svg
      viewBox="0 0 960 580"
      className="h-full w-full"
      role="img"
      aria-label="United States job location map"
    >
      <defs>
        <filter id="map-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {features.map(({ id, path }) => (
        <path
          key={id}
          d={path}
          fill="rgba(30, 41, 59, 0.35)"
          stroke="rgba(148, 163, 184, 0.35)"
          strokeWidth={0.6}
          className="pointer-events-none"
        />
      ))}
      {markers.map((marker) => (
        <MarkerDot
          key={marker.id}
          marker={marker}
          selected={selectedMarkerId === marker.id}
          interactive={focused}
          onSelect={() =>
            onSelectMarker(
              selectedMarkerId === marker.id ? null : marker.id
            )
          }
        />
      ))}
    </svg>
  );

  if (focused) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-[#0a0e1a]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-white">Job location map</h2>
            <p className="text-sm text-slate-400">
              Click a dot to see where each company is hiring
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectMarker(null);
              onExitFocus();
            }}
            className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
            Exit map
          </button>
        </div>

        <div className="relative flex flex-1 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            {mapSvg}
          </div>

          <aside className="relative z-10 m-4 w-72 shrink-0 self-end rounded-xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl md:m-6 md:self-start md:w-80">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Overview
            </p>
            <p className="mt-2 text-3xl font-bold text-white">{locatedCount}</p>
            <p className="text-sm text-slate-400">jobs with US locations</p>
            {remoteCount > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                + {remoteCount} remote
              </p>
            )}

            {selectedMarker ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                  <p className="text-sm font-bold text-cyan-300">
                    {selectedMarker.company}
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    {selectedMarker.title}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {selectedMarker.location}
                    {selectedMarker.stateCode && (
                      <>
                        {" "}
                        ·{" "}
                        {STATE_CODE_TO_NAME[selectedMarker.stateCode] ??
                          selectedMarker.stateCode}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400">
                  Locations
                </p>
                <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
                  {markers.length === 0 ? (
                    <li className="text-sm text-slate-500">
                      No location data yet
                    </li>
                  ) : (
                    markers.map((marker) => (
                      <li key={marker.id}>
                        <button
                          type="button"
                          onClick={() => onSelectMarker(marker.id)}
                          className="flex w-full flex-col rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-white/5"
                        >
                          <span className="font-medium text-slate-200">
                            {marker.company}
                          </span>
                          <span className="text-xs text-slate-500">
                            {marker.location}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative h-full min-h-[280px] w-full cursor-pointer overflow-hidden rounded-lg bg-slate-900/60"
      onClick={onEnterFocus}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEnterFocus();
        }
      }}
      aria-label="Open job location map"
    >
      <div className="pointer-events-none absolute inset-0 opacity-90 transition group-hover:opacity-100">
        {mapSvg}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-[#0a0e1a]/60" />

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div className="dash-box-sm">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <MapPin className="h-3.5 w-3.5" />
            US job locations
          </p>
          <p className="text-sm text-slate-300">
            {locatedCount} located · {remoteCount} remote
          </p>
        </div>
        <span className="dash-box-sm text-xs font-bold text-cyan-300 transition group-hover:border-cyan-500/50">
          Click to explore map →
        </span>
      </div>
    </div>
  );
}
