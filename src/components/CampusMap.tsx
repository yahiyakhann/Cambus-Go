import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { getPositionAlongPath } from '../utils/geo';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bus as BusIcon,
} from 'lucide-react';

interface CampusMapProps {
  interactive?: boolean;
  compact?: boolean;
  highlightStopId?: string;
  focusBusId?: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  compact = false,
  highlightStopId,
  focusBusId,
}) => {
  const {
    routes,
    buses,
    student,
    selectedBusId,
    setSelectedBusId,
    selectStop,
  } = useTransport();

  const [activeRouteFilter, setActiveRouteFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewBoxOffset, setViewBoxOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeFocusBusId = focusBusId || selectedBusId;
  const activeHighlightStopId = highlightStopId || student.selectedStopId;

  // Filter routes to display
  const displayedRoutes =
    activeRouteFilter === 'all' ? routes : routes.filter((r) => r.id === activeRouteFilter);

  // Generate SVG path string for a route
  const getRouteSvgPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const pPrev = points[i - 1];
      const pCurr = points[i];
      const midX = (pPrev.x + pCurr.x) / 2;
      const midY = (pPrev.y + pCurr.y) / 2;
      d += ` Q ${pPrev.x} ${pPrev.y}, ${midX} ${midY} T ${pCurr.x} ${pCurr.y}`;
    }
    return d;
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.8, prev + delta), 2.2));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setViewBoxOffset({ x: 0, y: 0 });
  };

  // Center on active bus
  const handleCenterOnBus = () => {
    const bus = buses.find((b) => b.id === activeFocusBusId) || buses[0];
    if (!bus) return;
    const route = routes.find((r) => r.id === bus.routeId);
    if (!route) return;
    const pos = getPositionAlongPath(route.pathPoints, bus.progress);
    setViewBoxOffset({ x: -(pos.x - 500) * 0.4, y: -(pos.y - 300) * 0.4 });
    setZoomLevel(1.3);
  };

  return (
    <div
      id="campus-live-map-container"
      className={`relative w-full bg-slate-100/90 border border-slate-200/90 rounded-2xl overflow-hidden select-none ${
        compact ? 'h-[320px] sm:h-[380px]' : 'h-[460px] sm:h-[540px] md:h-[600px]'
      }`}
    >
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-wide">
            Live Transit GPS
          </span>
          <span className="text-[11px] text-slate-500 border-l border-slate-200 pl-2 font-mono">
            17.3850°N, 78.4867°E
          </span>
        </div>

        {/* Route Selector Filter Pills */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveRouteFilter('all')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeRouteFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Routes
          </button>
          {routes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRouteFilter(r.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeRouteFilter === r.id
                  ? 'bg-slate-200 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              <span>{r.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Map Navigation Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => handleZoom(0.2)}
          title="Zoom In"
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-0.2)}
          title="Zoom Out"
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          title="Reset View"
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleCenterOnBus}
          title="Center on Active Bus"
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <BusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend on Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-300 animate-pulse" />
          <span>Active Bus</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300" />
          <span>My Boarding Stop</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 ring-2 ring-teal-200" />
          <span>Passed Stops</span>
        </div>
      </div>

      {/* Main Vector SVG Map Canvas (Clean Modern Light Transit Style) */}
      <div className="w-full h-full overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`${viewBoxOffset.x} ${viewBoxOffset.y} 1000 600`}
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Map Base Canvas */}
          <rect width="1000" height="600" fill="#f8fafc" />
          <rect width="1000" height="600" fill="url(#lightGrid)" />

          {/* Campus Greenery & Parks */}
          <path
            d="M 680 80 C 750 60, 920 60, 940 180 C 940 230, 800 240, 720 180 Z"
            fill="#e2f5ea"
            stroke="#a7f3d0"
            strokeWidth="1"
          />
          <path
            d="M 120 400 C 220 370, 320 430, 290 520 C 200 560, 100 500, 120 400 Z"
            fill="#e2f5ea"
            stroke="#a7f3d0"
            strokeWidth="1"
          />
          <path
            d="M 420 120 C 500 100, 600 120, 580 220 C 500 240, 400 200, 420 120 Z"
            fill="#e2f5ea"
            stroke="#a7f3d0"
            strokeWidth="1"
          />

          {/* Campus Landmark Buildings (Clean Crisp White Cards with Slate Borders) */}
          {/* 1. Main Campus Admin Block */}
          <g transform="translate(890, 110)">
            <circle r="36" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
            <circle r="18" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1" />
            <rect x="-14" y="-14" width="28" height="28" rx="4" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#1e293b" fontSize="8.5" fontWeight="700">
              ADMIN
            </text>
            <text x="0" y="-42" textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="700">
              Campus Main Terminal
            </text>
          </g>

          {/* 2. Engineering & Science Quad */}
          <g transform="translate(810, 140)">
            <rect x="-18" y="-12" width="36" height="24" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="700">
              ENG-CS
            </text>
          </g>

          {/* 3. Central Library */}
          <g transform="translate(840, 190)">
            <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="700">
              LIB
            </text>
          </g>

          {/* 4. University Sports Complex */}
          <g transform="translate(770, 240)">
            <rect x="-22" y="-14" width="44" height="28" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <text x="0" y="4" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="700">
              ARENA
            </text>
          </g>

          {/* 5. Student Hostels Wing */}
          <g transform="translate(620, 140)">
            <rect x="-24" y="-12" width="48" height="24" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="700">
              HOSTELS
            </text>
          </g>

          {/* 6. City Metro Terminal */}
          <g transform="translate(90, 510)">
            <circle r="26" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="-12" y="-12" width="24" height="24" rx="3" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#2563eb" fontSize="8.5" fontWeight="700">
              METRO
            </text>
            <text x="0" y="38" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="700">
              City Metro Hub
            </text>
          </g>

          {/* 7. North Tech Park Gate */}
          <g transform="translate(120, 110)">
            <rect x="-20" y="-14" width="40" height="28" rx="4" fill="#ffffff" stroke="#059669" strokeWidth="1.2" />
            <text x="0" y="4" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="700">
              TECH
            </text>
            <text x="0" y="-20" textAnchor="middle" fill="#047857" fontSize="9" fontWeight="700">
              Tech Zone Circle
            </text>
          </g>

          {/* Arterial Road Grid (Clean slate roads) */}
          <path
            d="M 50 250 L 950 250 M 450 50 L 450 550 M 250 100 L 250 500 M 700 80 L 700 520"
            stroke="#e2e8f0"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Route Polylines (Underlay wide glow + main sharp track) */}
          {displayedRoutes.map((route) => {
            const svgPath = getRouteSvgPath(route.pathPoints);
            const isSelected = student.selectedRouteId === route.id;
            return (
              <g key={route.id} className="route-layer">
                {/* Route Road bed */}
                <path
                  d={svgPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 10 : 7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Route Colored Centerline */}
                <path
                  d={svgPath}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={isSelected ? 4.5 : 3}
                  strokeDasharray={isSelected ? '8 4' : 'none'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.95}
                />
              </g>
            );
          })}

          {/* Route Stops */}
          {displayedRoutes.map((route) => {
            return route.stops.map((stop, sIdx) => {
              const progress = stop.distanceFromStartKm / route.totalDistanceKm;
              const pos = getPositionAlongPath(route.pathPoints, progress);
              const isSelectedStop = stop.id === activeHighlightStopId;

              return (
                <g
                  key={stop.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => selectStop(stop.id)}
                >
                  {/* Selected Stop Pulsing Rings */}
                  {isSelectedStop && (
                    <>
                      <circle r="20" fill="#f59e0b" fillOpacity="0.25" className="animate-ping" />
                      <circle r="14" fill="#f59e0b" fillOpacity="0.25" />
                    </>
                  )}

                  {/* Stop Marker Dot */}
                  <circle
                    r={isSelectedStop ? 7 : 5}
                    fill={isSelectedStop ? '#f59e0b' : '#ffffff'}
                    stroke={isSelectedStop ? '#ffffff' : route.color}
                    strokeWidth={isSelectedStop ? 2.5 : 2}
                  />

                  {/* Stop Number text */}
                  <text
                    x="0"
                    y="2.5"
                    textAnchor="middle"
                    fill={isSelectedStop ? '#ffffff' : '#334155'}
                    fontSize="6"
                    fontWeight="bold"
                  >
                    {sIdx + 1}
                  </text>

                  {/* Stop Label Pill (Clean white badge) */}
                  <g transform={`translate(0, ${pos.y > 450 ? -16 : 16})`}>
                    <rect
                      x={-stop.name.length * 3.2 - 8}
                      y="-10"
                      width={stop.name.length * 6.4 + 16}
                      height="17"
                      rx="8.5"
                      fill={isSelectedStop ? '#f59e0b' : '#ffffff'}
                      stroke={isSelectedStop ? '#d97706' : '#cbd5e1'}
                      strokeWidth="1"
                      className="shadow-xs"
                    />
                    <text
                      x="0"
                      y="1.5"
                      textAnchor="middle"
                      fill={isSelectedStop ? '#ffffff' : '#1e293b'}
                      fontSize="7.5"
                      fontWeight={isSelectedStop ? '700' : '600'}
                    >
                      {stop.name}
                    </text>
                  </g>
                </g>
              );
            });
          })}

          {/* Active Buses Layer */}
          {buses.map((bus) => {
            const route = routes.find((r) => r.id === bus.routeId);
            if (!route) return null;
            if (activeRouteFilter !== 'all' && bus.routeId !== activeRouteFilter) return null;

            const pos = getPositionAlongPath(route.pathPoints, bus.progress);
            const isEmergency = bus.status === 'emergency';
            const isDelayed = bus.status === 'delayed';
            const isSelected = bus.id === selectedBusId;

            return (
              <g
                key={bus.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-300"
                onClick={() => setSelectedBusId(bus.id)}
              >
                {/* Emergency SOS Alarm Radar Rings */}
                {isEmergency && (
                  <g>
                    <circle r="36" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
                    <circle r="24" fill="#ef4444" fillOpacity="0.35" />
                  </g>
                )}

                {/* Delay Yellow Ring */}
                {isDelayed && (
                  <circle r="20" fill="#f59e0b" fillOpacity="0.25" className="animate-pulse" />
                )}

                {/* Selection Halo */}
                {isSelected && !isEmergency && (
                  <circle r="22" fill="#2563eb" fillOpacity="0.2" className="animate-pulse" />
                )}

                {/* Heading Arrow */}
                <g transform={`rotate(${pos.heading})`}>
                  <polygon
                    points="0,-16 -5,-8 5,-8"
                    fill={isEmergency ? '#ef4444' : isDelayed ? '#f59e0b' : '#2563eb'}
                  />
                </g>

                {/* Bus Body */}
                <rect
                  x="-14"
                  y="-10"
                  width="28"
                  height="20"
                  rx="5"
                  fill={isEmergency ? '#dc2626' : isDelayed ? '#d97706' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="shadow-sm"
                />

                {/* Windshield */}
                <rect x="-10" y="-8" width="20" height="4" rx="1.5" fill="#ffffff" fillOpacity="0.9" />

                {/* Bus Number Label on roof */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontWeight="bold"
                >
                  {bus.busNumber.replace('BUS-', '')}
                </text>

                {/* Bus Badge Callout */}
                <g transform="translate(0, -22)">
                  <rect
                    x="-32"
                    y="-11"
                    width="64"
                    height="18"
                    rx="9"
                    fill="#ffffff"
                    stroke={isEmergency ? '#ef4444' : isDelayed ? '#f59e0b' : '#2563eb'}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="1.5"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="7.5"
                    fontWeight="700"
                  >
                    {bus.busNumber} • {bus.speedKmh} km/h
                  </text>
                </g>

                {/* Stale GPS Telemetry Badge if older than 30s */}
                {Date.now() - bus.lastUpdated > 30000 && (
                  <g transform="translate(0, 17)">
                    <rect
                      x="-24"
                      y="-7"
                      width="48"
                      height="13"
                      rx="6.5"
                      fill="#fef3c7"
                      stroke="#d97706"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="2.5"
                      textAnchor="middle"
                      fill="#92400e"
                      fontSize="6"
                      fontWeight="bold"
                    >
                      STALE GPS
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
