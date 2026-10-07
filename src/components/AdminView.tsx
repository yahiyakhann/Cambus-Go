import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { useAuth } from '../context/AuthContext';
import { CampusMap } from './CampusMap';
import { UserManager } from './UserManager';
import { ContentSettingsManager } from './ContentSettingsManager';
import {
  Bus,
  Users,
  Shield,
  Clock,
  Flame,
  Wrench,
  RotateCcw,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Trash2,
  Lock,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    buses,
    routes,
    activeAlerts,
    resolveAlert,
    triggerEmergency,
    reportVehicleIssue,
    resetDemo,
    selectRoute,
  } = useTransport();

  const { auditLogs, clearAuditLogs } = useAuth();

  const [activeTab, setActiveTab] = useState<'live_fleet' | 'routes' | 'users' | 'settings' | 'security_audit'>('live_fleet');
  const [selectedFleetBusId, setSelectedFleetBusId] = useState<string>(buses[0]?.id || 'bus_1');

  const activeBuses = buses.filter((b) => b.isTripActive);
  const emergencyBuses = buses.filter((b) => b.status === 'emergency');
  const delayedBuses = buses.filter((b) => b.delayMinutes > 0);
  const selectedBus = buses.find((b) => b.id === selectedFleetBusId) || buses[0];

  return (
    <div id="admin-view-container" className="space-y-6">
      {/* Top Fleet Operations Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Active Fleet</span>
            <Bus className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeBuses.length}
            <span className="text-sm font-semibold text-slate-400"> / {buses.length}</span>
          </div>
          <div className="text-xs text-teal-700 font-medium mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Transmitting live GPS</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Critical Incidents</span>
            <Flame className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {emergencyBuses.length}
          </div>
          <div className="text-xs mt-1">
            {emergencyBuses.length > 0 ? (
              <span className="text-red-600 font-bold animate-pulse">SOS beacon active</span>
            ) : (
              <span className="text-teal-700 font-medium">All corridors secure</span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Punctuality & Delays</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {delayedBuses.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {delayedBuses.length > 0 ? 'Traffic delay flagged' : '100% on schedule'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Fleet Ridership</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {buses.reduce((acc, b) => acc + b.occupancy.current, 0)}
            <span className="text-sm font-semibold text-slate-400">
              {' '}
              / {buses.reduce((acc, b) => acc + b.occupancy.capacity, 0)}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Total transit occupancy</div>
        </div>
      </div>

      {/* Operations Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('live_fleet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'live_fleet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Live Fleet Command
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Routes & Corridors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            User Accounts & Roles
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            System & Configuration
          </button>
          <button
            type="button"
            id="admin-security-audit-tab"
            onClick={() => setActiveTab('security_audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security_audit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Security & Compliance</span>
            {auditLogs.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'security_audit'
                    ? 'bg-white text-blue-700'
                    : 'bg-red-500 text-white'
                }`}
              >
                {auditLogs.length}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={resetDemo}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
          title="Reset simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Fleet</span>
        </button>
      </div>

      {/* TAB 1: LIVE FLEET COMMAND */}
      {activeTab === 'live_fleet' && (
        <div className="space-y-6">
          {/* Active Alerts Dispatch Panel */}
          {activeAlerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-red-200 mb-3">
                <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-red-600 animate-pulse" />
                  <span>Fleet Operational Incident Log ({activeAlerts.length} Actionable)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl bg-white border border-red-200 text-xs flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{alert.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-mono font-bold">
                          {alert.busNumber}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => resolveAlert(alert.id)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Map Display */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Campus Real-Time Geofence Map
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Showing all active transit corridors
              </span>
            </div>

            <CampusMap focusBusId={selectedFleetBusId} />
          </div>

          {/* Fleet Status Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fleet Units Status & Dispatch
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {buses.map((bus) => {
                const isSelected = bus.id === selectedFleetBusId;
                const isEmergency = bus.status === 'emergency';
                const busRoute = routes.find((r) => r.id === bus.routeId);

                return (
                  <div
                    key={bus.id}
                    onClick={() => setSelectedFleetBusId(bus.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-slate-900 font-mono">
                        {bus.busNumber}
                      </span>
                      {isEmergency ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                          SOS BEACON
                        </span>
                      ) : bus.isTripActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          ON ROUTE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          IDLE
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-700">
                      {busRoute?.code} • {busRoute?.name}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Driver:</span>
                        <span className="font-medium text-slate-900">{bus.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Speed:</span>
                        <span className="font-medium text-slate-900">{bus.speedKmh} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Occupancy:</span>
                        <span className="font-medium text-slate-900">
                          {bus.occupancy.current} / {bus.occupancy.capacity}
                        </span>
                      </div>
                    </div>

                    {/* Quick Admin Actions */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEmergency) {
                            reportVehicleIssue(bus.id, 'good');
                          } else {
                            triggerEmergency(bus.id);
                          }
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          isEmergency
                            ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                            : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {isEmergency ? 'Clear SOS' : 'Dispatch SOS'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFleetBusId(bus.id);
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        View on Map →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROUTES & CORRIDORS */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded text-xs font-bold text-white font-mono"
                      style={{ backgroundColor: route.color }}
                    >
                      {route.code}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {route.totalDistanceKm} km
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-1">{route.name}</h4>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Stops Sequence ({route.stops.length})
                    </div>
                    <div className="space-y-1.5">
                      {route.stops.map((stop, idx) => (
                        <div
                          key={stop.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50"
                        >
                          <span className="text-slate-700 font-medium truncate">
                            {idx + 1}. {stop.name}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px] shrink-0">
                            {stop.scheduledTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Buses assigned:{' '}
                    {buses.filter((b) => b.routeId === route.id).length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      selectRoute(route.id);
                      setActiveTab('live_fleet');
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Track Route →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER ACCOUNTS & ROLES */}
      {activeTab === 'users' && <UserManager />}

      {/* TAB 4: SYSTEM & CONFIGURATION */}
      {activeTab === 'settings' && <ContentSettingsManager />}

      {/* TAB 5: SECURITY COMPLIANCE AUDIT */}
      {activeTab === 'security_audit' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Security Compliance Audit Log
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase border border-red-200">
                    Audit Service Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitors unauthorized navigation attempts to protected corridors ('/buses') stored in AuthContext session data.
                </p>
              </div>
            </div>

            {auditLogs.length > 0 && (
              <button
                type="button"
                onClick={clearAuditLogs}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold border border-slate-300 hover:border-red-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Clear audit session logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Session Log</span>
              </button>
            )}
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Total Incursions Logged
              </div>
              <div className="text-2xl font-black text-slate-900">
                {auditLogs.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Session audit security events
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                '/buses' Incursions
              </div>
              <div className="text-2xl font-black text-red-600">
                {auditLogs.filter((l) => l.attemptedRoute === '/buses').length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Unauthorized attempts blocked
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Compliance Status
              </div>
              <div className="text-xl font-bold text-teal-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span>100% Policy Enforced</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Role boundaries strictly respected
              </div>
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-900">
                  Logged Unauthorized Route Incursions
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {auditLogs.length} entries recorded
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-slate-800">
                  No Unauthorized Navigation Attempts Logged
                </h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All navigation requests have adhered to designated role privileges. Any unauthorized attempt by a Student to access '/buses' will immediately be recorded here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                          {log.attemptedRoute}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                          Role: {log.userRole}
                        </span>
                        {log.severity && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.severity === 'high' || log.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {log.severity}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {log.reason}
                      </p>
                      <div className="text-[11px] text-slate-400 font-mono">
                        User: {log.userEmail || log.userId || 'anonymous'} • ID: {log.id}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
