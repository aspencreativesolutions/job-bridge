"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { STATE_CODE_TO_NAME } from "@/lib/jobs/location";
import { loadUsStatePaths, type StatePath } from "@/lib/jobs/us-map-geo";
import type { JobMapMarker } from "@/lib/jobs/map-markers";
import { MapPin, Minus, Plus, RotateCcw, X } from "lucide-react";

const MAP_W = 960;
const MAP_H = 580;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.25;

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DEFAULT_VIEW_BOX: ViewBox = { x: 0, y: 0, w: MAP_W, h: MAP_H };

function clampViewBox(vb: ViewBox): ViewBox {
  const w = Math.min(MAP_W, Math.max(MAP_W / MAX_ZOOM, vb.w));
  const h = Math.min(MAP_H, Math.max(MAP_H / MAX_ZOOM, vb.h));
  return {
    x: Math.min(MAP_W - w, Math.max(0, vb.x)),
    y: Math.min(MAP_H - h, Math.max(0, vb.y)),
    w,
    h,
  };
}

function useMapZoom() {
  const [viewBox, setViewBox] = useState<ViewBox>(DEFAULT_VIEW_BOX);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    vbX: number;
    vbY: number;
  } | null>(null);
  const didInteractRef = useRef(false);

  const resetZoom = useCallback(() => {
    setViewBox(DEFAULT_VIEW_BOX);
  }, []);

  const zoomBy = useCallback((factor: number, focalX?: number, focalY?: number) => {
    setViewBox((current) => {
      const nextW = current.w / factor;
      const nextH = current.h / factor;
      if (nextW > MAP_W || nextH > MAP_H) {
        return DEFAULT_VIEW_BOX;
      }
      if (nextW < MAP_W / MAX_ZOOM || nextH < MAP_H / MAX_ZOOM) {
        return current;
      }

      const fx = focalX ?? current.x + current.w / 2;
      const fy = focalY ?? current.y + current.h / 2;
      const ratio = nextW / current.w;
      return clampViewBox({
        x: fx - (fx - current.x) * ratio,
        y: fy - (fy - current.y) * ratio,
        w: nextW,
        h: nextH,
      });
    });
    didInteractRef.current = true;
  }, []);

  const zoomIn = useCallback(() => zoomBy(ZOOM_STEP), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(1 / ZOOM_STEP), [zoomBy]);

  const clientToViewBox = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: viewBox.x + ((clientX - rect.left) / rect.width) * viewBox.w,
        y: viewBox.y + ((clientY - rect.top) / rect.height) * viewBox.h,
      };
    },
    [viewBox]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const point = clientToViewBox(e.clientX, e.clientY);
      if (!point) return;
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      zoomBy(factor, point.x, point.y);
    },
    [clientToViewBox, zoomBy]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        vbX: viewBox.x,
        vbY: viewBox.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [viewBox.x, viewBox.y]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag?.active) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = ((e.clientX - drag.startX) / rect.width) * viewBox.w;
    const dy = ((e.clientY - drag.startY) / rect.height) * viewBox.h;
    if (Math.abs(e.clientX - drag.startX) > 4 || Math.abs(e.clientY - drag.startY) > 4) {
      didInteractRef.current = true;
    }

    setViewBox((current) =>
      clampViewBox({
        ...current,
        x: drag.vbX - dx,
        y: drag.vbY - dy,
      })
    );
  }, [viewBox.w, viewBox.h]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const consumeInteraction = useCallback(() => {
    const consumed = didInteractRef.current;
    didInteractRef.current = false;
    return consumed;
  }, []);

  const isZoomed = viewBox.w < MAP_W - 1 || viewBox.h < MAP_H - 1;

  return {
    viewBox,
    containerRef,
    isZoomed,
    resetZoom,
    zoomIn,
    zoomOut,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    consumeInteraction,
  };
}

interface Props {
  markers: JobMapMarker[];
  selectedMarkerId: string | null;
  onSelectMarker: (id: string | null) => void;
  focused: boolean;
  onEnterFocus: () => void;
  onExitFocus: () => void;
  remoteCount: number;
}

function MapZoomHelp() {
  return (
    <p className="pointer-events-none text-center text-[11px] leading-snug text-slate-400">
      Scroll or pinch to zoom · drag to pan
      <span className="hidden sm:inline"> · hover a dot for job details</span>
    </p>
  );
}

function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  showReset,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  showReset: boolean;
}) {
  const btnClass =
    "flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-slate-900/80 text-slate-200 backdrop-blur-sm transition hover:border-cyan-500/40 hover:bg-slate-800 hover:text-cyan-300";

  return (
    <div className="pointer-events-auto flex items-center gap-1.5">
      <button type="button" onClick={onZoomOut} className={btnClass} aria-label="Zoom out">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onZoomIn} className={btnClass} aria-label="Zoom in">
        <Plus className="h-3.5 w-3.5" />
      </button>
      {showReset && (
        <button type="button" onClick={onReset} className={btnClass} aria-label="Reset zoom">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function MarkerTooltip({ marker }: { marker: JobMapMarker }) {
  return (
    <div className="w-max min-w-[220px] max-w-[calc(100vw-2rem)] rounded-lg border border-cyan-500/30 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-cyan-400/90">
        Job offering at {marker.placeName}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-white">
        {marker.title}
      </p>
      <p className="truncate text-xs text-slate-300">{marker.company}</p>
      <p className="truncate text-xs text-slate-500">{marker.location}</p>
    </div>
  );
}

function MarkerDot({
  marker,
  selected,
  interactive,
  hovered,
  glowId,
  onSelect,
  onHover,
}: {
  marker: JobMapMarker;
  selected: boolean;
  interactive: boolean;
  hovered: boolean;
  glowId: string;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const r = selected ? 3.5 : 2.5;
  return (
    <g
      className="cursor-pointer"
      style={{ pointerEvents: "all" }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation();
              onSelect();
            }
          : (e) => e.stopPropagation()
      }
    >
      <circle
        cx={marker.x}
        cy={marker.y}
        r={r + 2}
        fill="rgba(34, 211, 238, 0.15)"
        className="transition-all duration-200"
      />
      <circle
        cx={marker.x}
        cy={marker.y}
        r={hovered || selected ? r + 1 : r}
        fill={selected || hovered ? "rgb(34, 211, 238)" : "rgb(56, 189, 248)"}
        stroke={selected ? "white" : "rgba(255,255,255,0.7)"}
        strokeWidth={selected ? 1.5 : 0.75}
        className="transition-all duration-200"
        style={{
          filter: selected || hovered ? `url(#${glowId})` : undefined,
        }}
      />
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
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const glowId = useId().replace(/:/g, "");
  const zoom = useMapZoom();

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

  const hoveredMarker = useMemo(
    () => markers.find((m) => m.id === hoveredMarkerId) ?? null,
    [markers, hoveredMarkerId]
  );

  const viewBoxStr = `${zoom.viewBox.x} ${zoom.viewBox.y} ${zoom.viewBox.w} ${zoom.viewBox.h}`;

  const mapSvg = (
    <svg
      viewBox={viewBoxStr}
      className="h-full w-full touch-none select-none"
      role="img"
      aria-label="United States job location map"
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
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
          hovered={hoveredMarkerId === marker.id}
          interactive={focused}
          glowId={glowId}
          onHover={(hovered) =>
            setHoveredMarkerId(hovered ? marker.id : null)
          }
          onSelect={() =>
            onSelectMarker(
              selectedMarkerId === marker.id ? null : marker.id
            )
          }
        />
      ))}
    </svg>
  );

  const mapTopBar = (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-col items-center gap-2 px-4">
      <MapZoomHelp />
      {hoveredMarker ? <MarkerTooltip marker={hoveredMarker} /> : null}
    </div>
  );

  const zoomControls = (
    <div className="pointer-events-auto absolute right-4 top-3 z-20">
      <MapZoomControls
        onZoomIn={zoom.zoomIn}
        onZoomOut={zoom.zoomOut}
        onReset={zoom.resetZoom}
        showReset={zoom.isZoomed}
      />
    </div>
  );

  const mapViewport = (
    <div
      ref={zoom.containerRef}
      className="h-full w-full cursor-grab active:cursor-grabbing"
      onWheel={zoom.handleWheel}
      onPointerDown={zoom.handlePointerDown}
      onPointerMove={zoom.handlePointerMove}
      onPointerUp={zoom.handlePointerUp}
      onPointerCancel={zoom.handlePointerUp}
      onClick={(e) => e.stopPropagation()}
    >
      {mapSvg}
    </div>
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
          {mapTopBar}
          {zoomControls}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            {mapViewport}
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
      onClick={() => {
        if (zoom.consumeInteraction()) return;
        onEnterFocus();
      }}
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
      {mapTopBar}
      {zoomControls}
      <div className="absolute inset-0 opacity-90 transition group-hover:opacity-100 [&_g]:pointer-events-auto">
        {mapViewport}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-[#0a0e1a]/60" />

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
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
