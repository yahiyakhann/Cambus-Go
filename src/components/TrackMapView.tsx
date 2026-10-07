import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { CampusMap } from './CampusMap';
import {
  MapPin,
  Bus as BusIcon,
  Radio,
  Clock,
  Gauge,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export const TrackMapView: React.FC = () => {
  const { routes, buses, selectedBusId, setSelectedBusId } = useTransport();

  const [activeRouteFilter, setActiveRouteFilter] = useState<string>('all');

  const activeBuses = buses.filter((b) => b.isTripActive);
  const selectedBus = buses.find((b) => b.id === selectedBusId) || buses[0];
  const busRoute = routes.find((r) => r.id === selectedBus?.routeId) || routes[0];
  const nextStop = busRoute.stops[selectedBus?.currentStopIndex || 0] || busRoute.stops[0];
  const isGpsStale = selectedBus ? Date.now() - selectedBus.lastUpdated > 30000 : false;

  return (
    <div id="track-map-page-container" className="space-y-6">
      {/* Dedicated Track Map Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Track Map
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Live GPS Campus Transit Map & Vehicle Positioning
              </p>
            </div>
          </div>
        </div>

        {/* Live Network Status Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
            <span>Telemetry Active • {activeBuses.length} in Service</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>17.3850°N, 78.4867°E</span>
          </div>
        </div>
      </div>

      {/* Stale GPS Warning Banner */}
      {isGpsStale && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3 text-amber-900 dark:text-amber-300 text-xs shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Notice — Stale GPS Telemetry: </span>
            <span>
              {selectedBus?.busNumber} telemetry has not transmitted in &gt;30s. Showing last verified coordinates on map.
            </span>
          </div>
        </div>
      )}

      {/* Corridor Quick Filter & Bus Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[11px] mr-1">
            Corridors:
          </span>
          <button
            type="button"
            onClick={() => setActiveRouteFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeRouteFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            All Corridors
          </button>
          {routes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRouteFilter(r.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeRouteFilter === r.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span>{r.code}</span>
            </button>
          ))}
        </div>

        {/* Bus Tracker Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[11px] mr-1">
            Track Bus:
          </span>
          {buses.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBusId(b.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedBusId === b.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {b.busNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Dedicated Interactive Full Map Component */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-sm space-y-3">
        <CampusMap focusBusId={selectedBusId} />
      </div>

      {/* Selected Vehicle Telemetry Details */}
      {selectedBus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Tracked Unit</span>
              <BusIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {selectedBus.busNumber}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {selectedBus.registrationNumber} • {busRoute.code} ({busRoute.name})
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Next Scheduled Stop</span>
              <Navigation className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white truncate">
              {nextStop.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled Arrival: <span className="font-bold text-slate-800 dark:text-slate-200">{nextStop.scheduledTime}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Current Velocity</span>
              <Gauge className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {selectedBus.speedKmh} km/h
            </div>
            <div className="text-xs text-teal-700 dark:text-teal-400 font-medium mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Heading {Math.round(selectedBus.heading)}°</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
