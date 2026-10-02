import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { Bus } from '../types';
import {
  Settings,
  Sliders,
  Plus,
  Trash2,
  Save,
  PhoneCall,
  Megaphone,
  CheckCircle2,
  Layers,
  X,
} from 'lucide-react';

export const ContentSettingsManager: React.FC = () => {
  const {
    settings,
    updateSettings,
    buses,
    routes,
    updateBusDetails,
    addNewBus,
    deleteBus,
    broadcastAnnouncement,
  } = useTransport();

  const [activeSubSection, setActiveSubSection] = useState<'system' | 'buses' | 'broadcast'>('system');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings form state
  const [formData, setFormData] = useState({
    systemName: settings.systemName,
    emergencyContactPhone: settings.emergencyContactPhone,
    announcementBanner: settings.announcementBanner,
    defaultAlertDistanceMeters: settings.defaultAlertDistanceMeters,
    liveSyncIntervalSeconds: settings.liveSyncIntervalSeconds,
    enablePublicSignup: settings.enablePublicSignup,
    maintenanceMode: settings.maintenanceMode,
  });

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('Campus Weather & Delay Notice');
  const [broadcastMessage, setBroadcastMessage] = useState('Bus Route R-101 and R-202 will run on normal schedule today.');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Add Bus Modal state
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newBusForm, setNewBusForm] = useState({
    busNumber: 'BUS-04',
    registrationNumber: 'TS 09 UD 7741',
    routeId: 'route_1',
    driverName: 'Anil Reddy',
    driverPhone: '+91 99887 76655',
    capacity: 50,
  });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    broadcastAnnouncement(broadcastTitle, broadcastMessage);
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    const route = routes.find((r) => r.id === newBusForm.routeId) || routes[0];
    const newBus: Bus = {
      id: 'bus_' + Date.now(),
      busNumber: newBusForm.busNumber,
      registrationNumber: newBusForm.registrationNumber,
      routeId: newBusForm.routeId,
      driverId: 'driver_' + Date.now(),
      driverName: newBusForm.driverName,
      driverPhone: newBusForm.driverPhone,
      latitude: route.stops[0]?.lat || 17.385,
      longitude: route.stops[0]?.lng || 78.4867,
      speedKmh: 0,
      heading: 0,
      progress: 0,
      status: 'idle',
      occupancy: { current: 0, capacity: Number(newBusForm.capacity) || 50 },
      delayMinutes: 0,
      lastUpdated: Date.now(),
      vehicleCondition: 'good',
      isTripActive: false,
      currentStopIndex: 0,
    };
    await addNewBus(newBus);
    setShowAddBusModal(false);
  };

  return (
    <div id="content-settings-manager" className="space-y-5">
      {/* Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubSection('system')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === 'system'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>System & Geofence Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('buses')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === 'buses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fleet Hardware & Capacity ({buses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('broadcast')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === 'broadcast'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast Public Announcement</span>
        </button>
      </div>

      {/* SECTION 1: SYSTEM SETTINGS */}
      {activeSubSection === 'system' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Transit Core Infrastructure Settings
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure database parameters, geofencing thresholds, and campus emergency lines
              </p>
            </div>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Persisted to Cloud Firestore!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                System Brand Title
              </label>
              <input
                type="text"
                value={formData.systemName}
                onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Campus Security & SOS Hotline
                </label>
                <div className="relative">
                  <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContactPhone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Default Approaching Geofence Distance (Meters)
                </label>
                <select
                  value={formData.defaultAlertDistanceMeters}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultAlertDistanceMeters: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value={300}>300 Meters (~1 Stop Ahead)</option>
                  <option value={500}>500 Meters (Recommended Default)</option>
                  <option value={1000}>1000 Meters (Early Notification)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                Top Announcement Banner (Displayed to Students & Drivers)
              </label>
              <textarea
                rows={2}
                value={formData.announcementBanner}
                onChange={(e) =>
                  setFormData({ ...formData, announcementBanner: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Security & Registration Policies
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Enable Open Student Sign-up</div>
                  <div className="text-[11px] text-slate-500">
                    Allow students to register with email/password directly
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enablePublicSignup}
                  onChange={(e) =>
                    setFormData({ ...formData, enablePublicSignup: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 bg-white border-slate-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Transit Maintenance Mode</div>
                  <div className="text-[11px] text-slate-500">
                    Pause simulated GPS updates and display scheduled maintenance notice
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) =>
                    setFormData({ ...formData, maintenanceMode: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 bg-white border-slate-300 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors min-h-[40px]"
              >
                <Save className="w-4 h-4" />
                <span>Save & Persist Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: FLEET HARDWARE & BUS MANAGEMENT */}
      {activeSubSection === 'buses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Fleet Vehicle Catalog</h4>
              <p className="text-xs text-slate-500">
                Register new buses, adjust seating capacities, or reassign transit routes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBusModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buses.map((bus) => {
              const route = routes.find((r) => r.id === bus.routeId);
              return (
                <div
                  key={bus.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-slate-900 font-mono">
                        {bus.busNumber}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white font-mono"
                        style={{ backgroundColor: route?.color || '#2563eb' }}
                      >
                        {route?.code || 'UNASSIGNED'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mb-3">
                      Plate: {bus.registrationNumber}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Driver:</span>
                        <span className="font-semibold text-slate-900">{bus.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Driver Phone:</span>
                        <span className="text-slate-700">{bus.driverPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Passenger Capacity:</span>
                        <span className="font-semibold text-slate-900">{bus.occupancy.capacity} Seats</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vehicle Condition:</span>
                        <span className="text-teal-700 capitalize font-bold">
                          {bus.vehicleCondition}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const newCap = prompt(
                          `Update seating capacity for ${bus.busNumber}:`,
                          String(bus.occupancy.capacity)
                        );
                        if (newCap && !isNaN(Number(newCap))) {
                          updateBusDetails(bus.id, {
                            occupancy: { ...bus.occupancy, capacity: Number(newCap) },
                          });
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      Edit Capacity
                    </button>

                    {buses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove ${bus.busNumber} from active fleet catalog?`)) {
                            deleteBus(bus.id);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: BROADCAST ANNOUNCEMENT */}
      {activeSubSection === 'broadcast' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs max-w-2xl">
          <div className="pb-4 border-b border-slate-100 mb-6">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Broadcast System Announcement
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Send an instant broadcast banner to all active student devices and driver consoles
            </p>
          </div>

          {broadcastSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Broadcast dispatched to all connected clients!</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                Announcement Headline *
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Weather Alert / Special Route Extended"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                Message Body *
              </label>
              <textarea
                rows={3}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Details of transit change..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors min-h-[40px]"
            >
              <Megaphone className="w-4 h-4" />
              <span>Send Broadcast Push</span>
            </button>
          </form>
        </div>
      )}

      {/* ADD BUS MODAL */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add New Transit Vehicle
              </h4>
              <button
                type="button"
                onClick={() => setShowAddBusModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBus} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Bus Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBusForm.busNumber}
                    onChange={(e) => setNewBusForm({ ...newBusForm, busNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Registration Plate *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBusForm.registrationNumber}
                    onChange={(e) =>
                      setNewBusForm({ ...newBusForm, registrationNumber: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Assign Campus Route
                </label>
                <select
                  value={newBusForm.routeId}
                  onChange={(e) => setNewBusForm({ ...newBusForm, routeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Driver Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBusForm.driverName}
                    onChange={(e) => setNewBusForm({ ...newBusForm, driverName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    required
                    value={newBusForm.capacity}
                    onChange={(e) =>
                      setNewBusForm({ ...newBusForm, capacity: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Driver Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={newBusForm.driverPhone}
                  onChange={(e) => setNewBusForm({ ...newBusForm, driverPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer min-h-[36px]"
                >
                  Add Vehicle to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
