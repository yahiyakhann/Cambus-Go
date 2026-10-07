import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { useNavigation } from '../context/NavigationContext';
import { Bus, VehicleCondition } from '../types';
import {
  Bus as BusIcon,
  Shield,
  Radio,
  Clock,
  Flame,
  AlertTriangle,
  Users,
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Phone,
} from 'lucide-react';

export const LiveBusesView: React.FC = () => {
  const {
    buses,
    routes,
    startTrip,
    endTrip,
    setSelectedBusId,
  } = useTransport();
  const { navigate } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle' | 'emergency'>('all');

  const activeBuses = buses.filter((b) => b.isTripActive);
  const emergencyBuses = buses.filter((b) => b.status === 'emergency');
  const delayedBuses = buses.filter((b) => (b.delayMinutes || 0) > 0);

  const filteredBuses = buses.filter((b) => {
    const matchesSearch =
      b.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.driverName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'active') return b.isTripActive;
    if (filterStatus === 'idle') return !b.isTripActive;
    if (filterStatus === 'emergency') return b.status === 'emergency';
    return true;
  });

  const handleTrackOnMap = (busId: string) => {
    setSelectedBusId(busId);
    navigate('/track');
  };

  return (
    <div id="live-buses-management-page" className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <BusIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Live Buses Fleet Management
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase border border-amber-200 dark:border-amber-800">
                Staff Only
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Authorized Fleet Oversight, Telemetry Status & Operations Dispatch
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Fleet Admin Console</span>
        </button>
      </div>

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>Total Fleet</span>
            <BusIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {buses.length} Units
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {activeBuses.length} transmitting live
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>In Service</span>
            <Radio className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 dark:text-teal-400">
            {activeBuses.length}
          </div>
          <div className="text-xs text-teal-700 dark:text-teal-400 mt-1 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Active trips on route</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>Delayed Buses</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {delayedBuses.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {delayedBuses.length > 0 ? 'Traffic flagged' : '100% on schedule'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>Distress / SOS</span>
            <Flame className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {emergencyBuses.length}
          </div>
          <div className="text-xs mt-1">
            {emergencyBuses.length > 0 ? (
              <span className="text-red-600 font-bold animate-pulse">Action Required</span>
            ) : (
              <span className="text-teal-700 font-medium">All corridors normal</span>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by bus number, registration, or driver..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All ({buses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            In-Trip ({activeBuses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('idle')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'idle'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Idle ({buses.length - activeBuses.length})
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuses.map((bus) => {
          const route = routes.find((r) => r.id === bus.routeId);
          const isEmergency = bus.status === 'emergency';
          const isDelayed = (bus.delayMinutes || 0) > 0;
          const isStale = Date.now() - bus.lastUpdated > 30000;
          const nextStop = route?.stops[bus.currentStopIndex || 0];

          return (
            <div
              key={bus.id}
              className={`p-5 rounded-2xl border transition-all bg-white dark:bg-slate-900 shadow-xs space-y-4 ${
                isEmergency
                  ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-950'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-slate-900 dark:text-white font-mono">
                      {bus.busNumber}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {bus.registrationNumber}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {route?.code || 'UNASSIGNED'} • {route?.name}
                  </div>
                </div>

                <div className="text-right">
                  {isEmergency ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-300 animate-pulse">
                      SOS Active
                    </span>
                  ) : bus.isTripActive ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                      In Service
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      Idle
                    </span>
                  )}
                </div>
              </div>

              {/* Telemetry info */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Driver</div>
                  <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {bus.driverName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{bus.driverPhone}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Velocity</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {bus.speedKmh} km/h
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isStale ? (
                      <span className="text-amber-600 font-bold">Stale Signal</span>
                    ) : (
                      <span>GPS Live</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Next stop & occupancy */}
              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <span className="text-slate-400">Next: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {nextStop?.name || 'Terminus'}
                  </span>
                </div>
                <div className="font-mono text-slate-500">
                  {bus.occupancy.current} / {bus.occupancy.capacity} pax
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleTrackOnMap(bus.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Track on Map</span>
                </button>

                {!bus.isTripActive ? (
                  <button
                    type="button"
                    onClick={() => startTrip(bus.id)}
                    className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Dispatch
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => endTrip(bus.id)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    End Trip
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
