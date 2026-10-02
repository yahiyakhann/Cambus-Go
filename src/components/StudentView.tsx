import React, { useState, useEffect } from 'react';
import { useTransport } from '../context/TransportContext';
import { CampusMap } from './CampusMap';
import { calculateETA, formatDistance, getRemainingDistanceToStop } from '../utils/geo';
import {
  Clock,
  Bus,
  Users,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Radio,
  ArrowDown,
} from 'lucide-react';

export const StudentView: React.FC = () => {
  const {
    routes,
    buses,
    student,
    selectRoute,
    selectStop,
    setAlertDistance,
  } = useTransport();

  const [secondsAgo, setSecondsAgo] = useState<number>(12);

  // Find active route and student's selected bus
  const currentRoute = routes.find((r) => r.id === student.selectedRouteId) || routes[0];
  const assignedBus =
    buses.find((b) => b.routeId === currentRoute.id) ||
    buses.find((b) => b.status === 'active') ||
    buses[0];

  const currentStop =
    currentRoute.stops.find((s) => s.id === student.selectedStopId) || currentRoute.stops[0];

  // Calculate distance and ETA to student's selected stop
  const remainingDistanceKm = assignedBus
    ? getRemainingDistanceToStop(
        assignedBus.latitude,
        assignedBus.longitude,
        currentStop,
        currentRoute.stops,
        assignedBus.currentStopIndex
      )
    : 0;

  const eta = calculateETA(
    remainingDistanceKm,
    assignedBus?.speedKmh || 32,
    assignedBus?.delayMinutes || 0
  );

  const isEmergency = assignedBus?.status === 'emergency';
  const isDelayed = (assignedBus?.delayMinutes || 0) > 0;

  // Live updated seconds ticker
  useEffect(() => {
    const updateTick = () => {
      if (assignedBus?.lastUpdated) {
        const diff = Math.max(1, Math.round((Date.now() - assignedBus.lastUpdated) / 1000));
        setSecondsAgo(diff);
      }
    };
    updateTick();
    const timer = setInterval(updateTick, 1000);
    return () => clearInterval(timer);
  }, [assignedBus?.lastUpdated]);

  // Next stop calculation
  const nextStopObj = currentRoute.stops[assignedBus?.currentStopIndex || 0] || currentRoute.stops[0];

  // Occupancy calculation
  const occPercent = assignedBus
    ? Math.round((assignedBus.occupancy.current / assignedBus.occupancy.capacity) * 100)
    : 0;

  const handleScrollToMap = () => {
    const el = document.getElementById('student-live-map-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="student-view-container" className="space-y-6">
      {/* Route & Boarding Stop Selectors Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Select Route */}
          <div>
            <label
              htmlFor="student-route-selector"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
            >
              Select College Route
            </label>
            <select
              id="student-route-selector"
              value={student.selectedRouteId}
              onChange={(e) => selectRoute(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all cursor-pointer min-h-[44px]"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} • {r.name} ({r.totalDistanceKm} km)
                </option>
              ))}
            </select>
          </div>

          {/* Select My Boarding Stop */}
          <div>
            <label
              htmlFor="student-stop-selector"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
            >
              My Boarding Stop
            </label>
            <select
              id="student-stop-selector"
              value={student.selectedStopId}
              onChange={(e) => selectStop(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all cursor-pointer min-h-[44px]"
            >
              {currentRoute.stops.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  Stop {idx + 1}: {s.name} ({s.scheduledTime})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      {isEmergency && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex items-start gap-3.5 text-red-900 shadow-sm animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-900">
              Emergency reported • {assignedBus.busNumber}
            </h4>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              Driver has reported an emergency. Fleet operations have been notified. Campus security
              and response team are responding.
            </p>
          </div>
        </div>
      )}

      {/* Major First Focus Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {assignedBus?.busNumber || 'BUS-01'}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono border border-slate-200">
                  {assignedBus?.registrationNumber || 'KA-01-EXP-2024'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 mt-0.5">
                {currentRoute.name}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isEmergency ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                Emergency SOS
              </span>
            ) : isDelayed ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Delayed +{assignedBus.delayMinutes}m
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                Live On-Route
              </span>
            )}
          </div>
        </div>

        {/* Visually Dominant ETA Display */}
        <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Estimated arrival at {currentStop.name}</span>
            <span className="font-mono text-slate-700">Target: {currentStop.scheduledTime}</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 my-1">
            <span className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
              {eta.formattedText}
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-600">
              ({formatDistance(remainingDistanceKm)} away)
            </span>
          </div>

          {/* Key Telemetry Badges */}
          <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-400">Next stop: </span>
                <span className="font-bold text-slate-900">{nextStopObj.name}</span>
              </div>
              <div className="border-l border-slate-300 pl-3">
                <span className="text-slate-400">Speed: </span>
                <span className="font-bold text-slate-900">{assignedBus?.speedKmh || 32} km/h</span>
              </div>
              <div className="border-l border-slate-300 pl-3 flex items-center gap-1.5 text-teal-700 font-medium">
                <Radio className="w-3.5 h-3.5 text-teal-600" />
                <span>Updated {secondsAgo} sec ago</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScrollToMap}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[40px]"
            >
              <span>View Live Map</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Route Progress Timeline: Immediate Visibility */}
        <div className="mt-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Route Progress
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {currentRoute.stops.map((stop, idx) => {
              const isPassed = (assignedBus?.currentStopIndex || 0) > idx;
              const isCurrent = (assignedBus?.currentStopIndex || 0) === idx;
              const isStudentStop = stop.id === student.selectedStopId;

              return (
                <div
                  key={stop.id}
                  onClick={() => selectStop(stop.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isStudentStop
                      ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-xs ring-1 ring-blue-300'
                      : isCurrent
                      ? 'bg-teal-50/70 border-teal-300 text-teal-900'
                      : isPassed
                      ? 'bg-slate-50 border-slate-200 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold">
                      {isPassed ? (
                        <span className="flex items-center gap-1 text-teal-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : isCurrent ? (
                        <span className="text-teal-700 font-bold">● Next Stop</span>
                      ) : (
                        `Stop ${idx + 1}`
                      )}
                    </span>
                    <span className="font-mono text-slate-500">{stop.scheduledTime}</span>
                  </div>

                  <div className="font-semibold text-xs truncate">{stop.name}</div>

                  {isStudentStop && (
                    <div className="mt-1.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      My Boarding Stop
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary Info: Passengers & Approaching Threshold */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Passenger Occupancy */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Passengers</div>
                <div className="text-[11px] text-slate-500">
                  {assignedBus?.occupancy.current || 36} / {assignedBus?.occupancy.capacity || 50} seats occupied
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                occPercent > 80
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {occPercent > 80 ? 'Crowded' : 'Seats Available'}
            </span>
          </div>

          {/* Proximity Alert Distance Trigger */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">Arrival Notification</div>
                <div className="text-[11px] text-slate-500">Alert chime when bus is near</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[300, 500, 1000].map((meters) => (
                <button
                  key={meters}
                  type="button"
                  onClick={() => setAlertDistance(meters)}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    student.alertDistanceMeters === meters
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {meters >= 1000 ? '1km' : `${meters}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Campus Vector Map Section */}
      <div id="student-live-map-section" className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">Live Campus Tracking Map</h3>
            <span className="text-xs text-slate-500">
              • Tracking {assignedBus?.busNumber} ({currentRoute.code})
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Next Stop: {nextStopObj.name}
          </span>
        </div>

        <CampusMap highlightStopId={currentStop.id} focusBusId={assignedBus?.id} />
      </div>
    </div>
  );
};
