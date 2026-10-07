import React, { useState, useEffect } from 'react';
import { useTransport } from '../context/TransportContext';
import { CampusMap } from './CampusMap';
import { VehicleCondition } from '../types';
import {
  Play,
  Square,
  AlertOctagon,
  Radio,
  Users,
  Wrench,
  Gauge,
  Flame,
  X,
  Plus,
  Minus,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const DriverView: React.FC = () => {
  const {
    driver,
    buses,
    routes,
    startTrip,
    endTrip,
    setBusSpeed,
    setPassengerCount,
    reportVehicleIssue,
    triggerEmergency,
    updateBusDetails,
  } = useTransport();

  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState<boolean>(false);
  const [deviceGpsActive, setDeviceGpsActive] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const assignedBus = buses.find((b) => b.id === driver.assignedBusId) || buses[0];
  const assignedRoute = routes.find((r) => r.id === assignedBus.routeId) || routes[0];

  const isTripActive = assignedBus.isTripActive;
  const isEmergency = assignedBus.status === 'emergency';
  const nextStop = assignedRoute.stops[assignedBus.currentStopIndex] || assignedRoute.stops[0];
  const isGpsStale = Date.now() - assignedBus.lastUpdated > 30000;

  // Real device GPS emitter with permission error handling
  useEffect(() => {
    let watchId: number | null = null;
    if (deviceGpsActive && typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          updateBusDetails(assignedBus.id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speedKmh: Math.round((pos.coords.speed || 0) * 3.6) || 28,
            lastUpdated: Date.now(),
          });
          setGpsMessage({ text: 'Transmitting phone GPS coordinates live', isError: false });
        },
        (err) => {
          setDeviceGpsActive(false);
          if (err.code === 1) {
            setGpsMessage({
              text: 'Location permission denied by browser. Switched back to simulated route GPS.',
              isError: true,
            });
          } else {
            setGpsMessage({
              text: 'Could not acquire phone GPS fix. Running on route polyline sync.',
              isError: true,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [deviceGpsActive, assignedBus.id]);

  const toggleDeviceGps = () => {
    setGpsMessage(null);
    if (!deviceGpsActive) {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setGpsMessage({
          text: 'Geolocation API is not available on this browser/environment.',
          isError: true,
        });
        return;
      }
      setDeviceGpsActive(true);
    } else {
      setDeviceGpsActive(false);
      setGpsMessage({ text: 'Phone GPS emitter turned off. Resumed route simulation.', isError: false });
      setTimeout(() => setGpsMessage(null), 3000);
    }
  };

  const handleIssueSelect = (condition: VehicleCondition) => {
    reportVehicleIssue(assignedBus.id, condition);
    setShowIssueModal(false);
  };

  return (
    <div id="driver-view-container" className="max-w-2xl mx-auto space-y-5">
      {/* Emergency Active Banner */}
      {isEmergency && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 text-red-900 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-base font-bold">Emergency SOS Broadcast Active</div>
              <div className="text-xs text-red-700 mt-1 leading-relaxed">
                Coordinates ({assignedBus.latitude.toFixed(4)}°N, {assignedBus.longitude.toFixed(4)}°E)
                transmitted to fleet operations and campus security desk.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => reportVehicleIssue(assignedBus.id, 'good')}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 cursor-pointer min-h-[40px]"
          >
            Clear SOS
          </button>
        </div>
      )}

      {/* Primary Mobile-First Driver Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
        {/* Vehicle Header & Live GPS Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {assignedBus.busNumber}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono border border-slate-200">
                {assignedBus.registrationNumber}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">
              {assignedRoute.code} • {assignedRoute.name}
            </p>
          </div>

          {/* GPS Status & Transmitter Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {isGpsStale ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>GPS Stale (&gt;30s)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                <span>GPS Connected</span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleDeviceGps}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                deviceGpsActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Use Phone's Hardware GPS Sensor"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{deviceGpsActive ? 'Phone GPS Broadcasting' : 'Transmit Phone GPS'}</span>
            </button>
          </div>
        </div>

        {/* GPS Sensor Alert or Permission Denied Message */}
        {gpsMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              gpsMessage.isError
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-teal-50 border-teal-200 text-teal-800'
            }`}
          >
            {gpsMessage.isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
            )}
            <span>{gpsMessage.text}</span>
          </div>
        )}

        {/* Next Stop Callout */}
        <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Next Stop
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {nextStop.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Scheduled arrival: {nextStop.scheduledTime}
          </div>
        </div>

        {/* Primary Large Touch-Friendly Trip Action */}
        <div>
          {!isTripActive ? (
            <button
              type="button"
              id="driver-start-trip-btn"
              onClick={() => startTrip(assignedBus.id)}
              className="w-full py-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-md shadow-teal-700/20 transition-all cursor-pointer min-h-[56px]"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>START TRIP</span>
            </button>
          ) : (
            <button
              type="button"
              id="driver-end-trip-btn"
              onClick={() => endTrip(assignedBus.id)}
              className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer min-h-[56px]"
            >
              <Square className="w-5 h-5 fill-white" />
              <span>END TRIP</span>
            </button>
          )}
        </div>

        {/* Passengers & Speed Controls (Touch-Friendly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Passengers Stepper */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Passengers</span>
              </span>
              <span className="text-slate-400 font-normal">Cap: {assignedBus.occupancy.capacity}</span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <button
                type="button"
                onClick={() =>
                  setPassengerCount(assignedBus.id, assignedBus.occupancy.current - 1)
                }
                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xl flex items-center justify-center shadow-xs transition-colors cursor-pointer min-h-[48px] min-w-[48px]"
                title="Decrease Passengers"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="text-3xl font-black text-slate-900">
                  {assignedBus.occupancy.current}
                </span>
                <span className="text-xs text-slate-500 font-medium block">
                  / {assignedBus.occupancy.capacity} seats
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPassengerCount(assignedBus.id, assignedBus.occupancy.current + 1)
                }
                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xl flex items-center justify-center shadow-xs transition-colors cursor-pointer min-h-[48px] min-w-[48px]"
                title="Increase Passengers"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Speed Stepper */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-teal-600" />
                <span>Speed</span>
              </span>
              <span className="text-teal-700 font-semibold font-mono">Live</span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <button
                type="button"
                onClick={() => setBusSpeed(assignedBus.id, assignedBus.speedKmh - 5)}
                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xl flex items-center justify-center shadow-xs transition-colors cursor-pointer min-h-[48px] min-w-[48px]"
                title="Decrease Speed"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="text-3xl font-black text-slate-900">
                  {assignedBus.speedKmh}
                </span>
                <span className="text-xs text-slate-500 font-medium block">km/h</span>
              </div>

              <button
                type="button"
                onClick={() => setBusSpeed(assignedBus.id, assignedBus.speedKmh + 5)}
                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xl flex items-center justify-center shadow-xs transition-colors cursor-pointer min-h-[48px] min-w-[48px]"
                title="Increase Speed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Two Priority Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Report Vehicle Issue Button */}
          <button
            type="button"
            onClick={() => setShowIssueModal(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 border border-slate-300 transition-colors cursor-pointer min-h-[48px]"
          >
            <Wrench className="w-4 h-4 text-slate-600" />
            <span>
              {assignedBus.vehicleCondition !== 'good'
                ? `Condition: ${assignedBus.vehicleCondition.toUpperCase()}`
                : 'Report Vehicle Issue'}
            </span>
          </button>

          {/* Emergency SOS Button */}
          <button
            type="button"
            id="driver-sos-btn"
            onClick={() => setShowEmergencyConfirm(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer min-h-[48px]"
          >
            <Flame className="w-4 h-4 fill-white" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* Driver Map Preview */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">Driver Live Map Preview</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Next Stop: {nextStop.name}
          </span>
        </div>

        <CampusMap compact focusBusId={assignedBus.id} />
      </div>

      {/* Emergency Confirmation Modal */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Flame className="w-6 h-6 fill-red-600" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Broadcast Emergency SOS?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This will immediately broadcast a critical distress beacon with your exact GPS coordinates
                to campus security and fleet operations.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerEmergency(assignedBus.id);
                  setShowEmergencyConfirm(false);
                }}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider transition-colors min-h-[44px] cursor-pointer"
              >
                Confirm SOS Distress Signal
              </button>
              <button
                type="button"
                onClick={() => setShowEmergencyConfirm(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Wrench className="w-4 h-4 text-slate-600" />
                <span>Report Vehicle Condition</span>
              </div>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleIssueSelect('good')}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-left transition-colors min-h-[44px] cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900">All Clear / Normal</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Vehicle operating nominally without issues</div>
              </button>

              <button
                type="button"
                onClick={() => handleIssueSelect('traffic')}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-left transition-colors min-h-[44px] cursor-pointer"
              >
                <div className="font-bold text-xs text-amber-800">Heavy Traffic (+5m delay)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Route congestion causing schedule delay</div>
              </button>

              <button
                type="button"
                onClick={() => handleIssueSelect('tyre')}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-left transition-colors min-h-[44px] cursor-pointer"
              >
                <div className="font-bold text-xs text-amber-800">Tyre / Puncture Concern</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Low tyre pressure or maintenance needed</div>
              </button>

              <button
                type="button"
                onClick={() => handleIssueSelect('engine')}
                className="p-3 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 text-left transition-colors min-h-[44px] cursor-pointer"
              >
                <div className="font-bold text-xs text-red-800">Engine Check Warning</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Engine heat or mechanical inspection flagged</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
