import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserRole,
  CampusRoute,
  Bus,
  AlertNotification,
  StudentProfile,
  DriverProfile,
  TripHistoryLog,
  VehicleCondition,
  TransitSystemSettings,
} from '../types';
import {
  INITIAL_ROUTES,
  INITIAL_BUSES,
  INITIAL_STUDENT,
  INITIAL_DRIVER,
  INITIAL_TRIP_LOGS,
} from '../data/mockRoutes';
import { getPositionAlongPath, calculateDistanceKm } from '../utils/geo';
import { playApproachingChime, playEmergencyAlertSound, playActionBeep } from '../utils/audio';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const DEFAULT_SETTINGS: TransitSystemSettings = {
  systemName: 'Cambus go — Smart College Transit',
  campusCenterLat: 17.385,
  campusCenterLng: 78.4867,
  emergencyContactPhone: '+91 98480 99999 (Campus Security & Medical SOS)',
  announcementBanner: 'Welcome to Cambus go! Live tracking active for all academic & hostel lines.',
  enablePublicSignup: true,
  defaultAlertDistanceMeters: 500,
  liveSyncIntervalSeconds: 3,
  maintenanceMode: false,
};

interface TransportContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  viewMode: 'standard' | 'split_demo';
  setViewMode: (mode: 'standard' | 'split_demo') => void;
  routes: CampusRoute[];
  buses: Bus[];
  activeAlerts: AlertNotification[];
  student: StudentProfile;
  driver: DriverProfile;
  tripHistory: TripHistoryLog[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  resetDemo: () => void;
  isAutoDrive: boolean;
  setIsAutoDrive: (auto: boolean) => void;
  toggleAutoDrive: () => void;
  // Driver Actions
  startTrip: (busId: string) => void;
  endTrip: (busId: string) => void;
  setBusSpeed: (busId: string, speedKmh: number) => void;
  setBusProgress: (busId: string, progress: number) => void;
  setPassengerCount: (busId: string, count: number) => void;
  reportVehicleIssue: (busId: string, condition: VehicleCondition) => void;
  triggerEmergency: (busId: string) => void;
  // Student Actions
  selectRoute: (routeId: string) => void;
  selectStop: (stopId: string) => void;
  setAlertDistance: (meters: number) => void;
  // Admin Actions
  resolveAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  selectedBusId: string;
  setSelectedBusId: (busId: string) => void;
  // Content & Settings Management
  settings: TransitSystemSettings;
  updateSettings: (newSettings: Partial<TransitSystemSettings>) => Promise<void>;
  updateBusDetails: (busId: string, updates: Partial<Bus>) => Promise<void>;
  addNewBus: (newBus: Bus) => Promise<void>;
  deleteBus: (busId: string) => Promise<void>;
  addNewRoute: (newRoute: CampusRoute) => Promise<void>;
  deleteRoute: (routeId: string) => Promise<void>;
  broadcastAnnouncement: (title: string, message: string) => void;
}

const TransportContext = createContext<TransportContextType | undefined>(undefined);

export const TransportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [viewMode, setViewMode] = useState<'standard' | 'split_demo'>('standard');
  const [routes, setRoutes] = useState<CampusRoute[]>(() => {
    const cached = localStorage.getItem('campusgo_routes');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return INITIAL_ROUTES;
  });

  const [buses, setBuses] = useState<Bus[]>(() => {
    const cached = localStorage.getItem('campusgo_buses');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return INITIAL_BUSES;
  });

  const [activeAlerts, setActiveAlerts] = useState<AlertNotification[]>([
    {
      id: 'alert_init_1',
      busId: 'bus_02',
      busNumber: 'BUS-02',
      type: 'delay',
      title: 'Minor Traffic Delay',
      message: 'BUS-02 is experiencing heavy morning traffic near Hostels (+4 mins delay).',
      timestamp: Date.now() - 5 * 60 * 1000,
      read: false,
      resolved: false,
    },
  ]);
  const [student, setStudent] = useState<StudentProfile>(INITIAL_STUDENT);
  const [driver] = useState<DriverProfile>(INITIAL_DRIVER);
  const [tripHistory, setTripHistory] = useState<TripHistoryLog[]>(INITIAL_TRIP_LOGS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [demoStep, setDemoStep] = useState<number>(1);
  const [isAutoDrive, setIsAutoDrive] = useState<boolean>(true);
  const [selectedBusId, setSelectedBusId] = useState<string>('bus_01');
  const [settings, setSettings] = useState<TransitSystemSettings>(DEFAULT_SETTINGS);

  // Sync settings and core transit data with Firestore
  useEffect(() => {
    try {
      const settingsDocRef = doc(db, 'system_config', 'transit_settings');
      const unsubscribe = onSnapshot(
        settingsDocRef,
        (snap) => {
          if (snap.exists()) {
            setSettings(snap.data() as TransitSystemSettings);
          } else {
            // Initialize document
            setDoc(settingsDocRef, DEFAULT_SETTINGS).catch(console.warn);
          }
        },
        (err) => {
          console.warn('Firestore settings listener error (falling back to local):', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase settings load error', e);
    }
  }, []);

  // Save changes to localStorage as backup
  useEffect(() => {
    try {
      localStorage.setItem('campusgo_buses', JSON.stringify(buses));
    } catch (e) {}
  }, [buses]);

  useEffect(() => {
    try {
      localStorage.setItem('campusgo_routes', JSON.stringify(routes));
    } catch (e) {}
  }, [routes]);

  // Track if we already triggered approaching alert for a stop to prevent duplicates
  const notifiedStopRef = useRef<{ [busId: string]: string }>({});

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
    if (!soundEnabled) playActionBeep();
  };

  const toggleAutoDrive = () => {
    setIsAutoDrive((prev) => !prev);
  };

  const selectRoute = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return;
    setStudent((prev) => ({
      ...prev,
      selectedRouteId: routeId,
      selectedStopId: route.stops[0]?.id || '',
    }));
    const busOnRoute = buses.find((b) => b.routeId === routeId);
    if (busOnRoute) {
      setSelectedBusId(busOnRoute.id);
    }
  };

  const selectStop = (stopId: string) => {
    setStudent((prev) => ({ ...prev, selectedStopId: stopId }));
  };

  const setAlertDistance = (meters: number) => {
    setStudent((prev) => ({ ...prev, alertDistanceMeters: meters }));
  };

  const startTrip = (busId: string) => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id !== busId) return b;
        return {
          ...b,
          isTripActive: true,
          status: 'active',
          tripStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          speedKmh: Math.max(25, b.speedKmh),
          lastUpdated: Date.now(),
        };
      })
    );

    const targetBus = buses.find((b) => b.id === busId);
    const busNum = targetBus?.busNumber || 'BUS-01';

    setActiveAlerts((prev) => [
      {
        id: 'alert_' + Date.now(),
        busId,
        busNumber: busNum,
        type: 'trip_started',
        title: 'Trip Commenced',
        message: `${busNum} started route journey. Live GPS tracking broadcast active.`,
        timestamp: Date.now(),
        read: false,
        resolved: false,
      },
      ...prev,
    ]);

    if (soundEnabled) playActionBeep();
  };

  const endTrip = (busId: string) => {
    const targetBus = buses.find((b) => b.id === busId);
    if (!targetBus) return;

    setBuses((prev) =>
      prev.map((b) => {
        if (b.id !== busId) return b;
        return {
          ...b,
          isTripActive: false,
          status: 'idle',
          speedKmh: 0,
          lastUpdated: Date.now(),
        };
      })
    );

    // Record in history log
    const route = routes.find((r) => r.id === targetBus.routeId);
    const newLog: TripHistoryLog = {
      id: 'trip_' + Date.now(),
      busId: targetBus.id,
      busNumber: targetBus.busNumber,
      routeName: route?.name || 'Campus Transit',
      driverName: targetBus.driverName,
      date: 'Today',
      startTime: targetBus.tripStartTime || '08:00 AM',
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: targetBus.status === 'emergency' ? 'incident' : 'completed',
      passengerCount: targetBus.occupancy.current,
      avgSpeedKmh: 32,
    };
    setTripHistory((prev) => [newLog, ...prev]);

    setActiveAlerts((prev) => [
      {
        id: 'alert_' + Date.now(),
        busId,
        busNumber: targetBus.busNumber,
        type: 'trip_ended',
        title: 'Trip Ended',
        message: `${targetBus.busNumber} completed route and arrived safely at terminus.`,
        timestamp: Date.now(),
        read: false,
        resolved: false,
      },
      ...prev,
    ]);

    if (soundEnabled) playActionBeep();
  };

  const setBusSpeed = (busId: string, speedKmh: number) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, speedKmh, lastUpdated: Date.now() } : b))
    );
  };

  const setBusProgress = (busId: string, progress: number) => {
    const targetBus = buses.find((b) => b.id === busId);
    if (!targetBus) return;
    const route = routes.find((r) => r.id === targetBus.routeId);
    if (!route) return;

    const { lat, lng, heading } = getPositionAlongPath(route.pathPoints, progress);

    // Calculate current stop index
    let currentStopIdx = 0;
    for (let i = 0; i < route.stops.length; i++) {
      const stopRatio = route.stops[i].distanceFromStartKm / route.totalDistanceKm;
      if (progress >= stopRatio) {
        currentStopIdx = i;
      }
    }

    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              progress,
              latitude: lat,
              longitude: lng,
              heading,
              currentStopIndex: currentStopIdx,
              lastUpdated: Date.now(),
            }
          : b
      )
    );
  };

  const setPassengerCount = (busId: string, count: number) => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id !== busId) return b;
        const bounded = Math.max(0, Math.min(b.occupancy.capacity, count));
        return {
          ...b,
          occupancy: { ...b.occupancy, current: bounded },
          lastUpdated: Date.now(),
        };
      })
    );
  };

  const reportVehicleIssue = (busId: string, condition: VehicleCondition) => {
    const bus = buses.find((b) => b.id === busId);
    if (!bus) return;

    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              vehicleCondition: condition,
              delayMinutes: condition === 'good' ? 0 : (b.delayMinutes || 0) + 5,
              lastUpdated: Date.now(),
            }
          : b
      )
    );

    if (condition !== 'good') {
      const labelMap: Record<VehicleCondition, string> = {
        good: 'All Nominal',
        engine: 'Engine Warning Check',
        tyre: 'Tyre Pressure Low / Puncture',
        fuel: 'Fuel Level Critical',
        traffic: 'Heavy Route Traffic Congestion',
      };

      setActiveAlerts((prev) => [
        {
          id: 'alert_' + Date.now(),
          busId,
          busNumber: bus.busNumber,
          type: 'vehicle_problem',
          title: `Vehicle Issue: ${labelMap[condition]}`,
          message: `${bus.busNumber} driver reported ${labelMap[condition]}. Schedule adjusted (+5 mins).`,
          timestamp: Date.now(),
          read: false,
          resolved: false,
          location: { lat: bus.latitude, lng: bus.longitude },
        },
        ...prev,
      ]);
    }
  };

  const triggerEmergency = (busId: string) => {
    const bus = buses.find((b) => b.id === busId);
    if (!bus) return;

    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              status: 'emergency',
              lastUpdated: Date.now(),
            }
          : b
      )
    );

    const newAlert: AlertNotification = {
      id: 'emergency_' + Date.now(),
      busId,
      busNumber: bus.busNumber,
      type: 'emergency',
      title: `SOS EMERGENCY SIGNAL from ${bus.busNumber}`,
      message: `Driver ${bus.driverName} pressed the SOS Panic Button! Coordinates: ${bus.latitude.toFixed(4)}°N, ${bus.longitude.toFixed(4)}°E. Immediate assistance requested.`,
      timestamp: Date.now(),
      read: false,
      resolved: false,
      location: { lat: bus.latitude, lng: bus.longitude },
    };

    setActiveAlerts((prev) => [newAlert, ...prev]);

    if (soundEnabled) {
      playEmergencyAlertSound();
    }
  };

  const resolveAlert = (alertId: string) => {
    setActiveAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        return { ...a, resolved: true, read: true };
      })
    );

    const alert = activeAlerts.find((a) => a.id === alertId);
    if (alert && alert.type === 'emergency') {
      setBuses((prev) =>
        prev.map((b) => (b.id === alert.busId ? { ...b, status: b.isTripActive ? 'active' : 'idle' } : b))
      );
    }
  };

  const clearAllAlerts = () => {
    setActiveAlerts([]);
  };

  // Demo step navigation (1 through 7)
  const handleDemoStepAction = (step: number) => {
    if (step === 1) {
      setRole('driver');
      setSelectedBusId('bus_01');
    } else if (step === 2) {
      setRole('driver');
      startTrip('bus_01');
      setIsAutoDrive(true);
    } else if (step === 3) {
      setRole('student');
      setViewMode('standard');
    } else if (step === 4) {
      setRole('student');
      setStudent((prev) => ({
        ...prev,
        selectedRouteId: 'route_1',
        selectedStopId: 'stop_r1_4',
      }));
    } else if (step === 5) {
      setBusProgress('bus_01', 0.72);
      if (soundEnabled) playApproachingChime();
    } else if (step === 6) {
      setRole('driver');
      triggerEmergency('bus_01');
    } else if (step === 7) {
      setRole('admin');
      setViewMode('standard');
    }
  };

  const nextDemoStep = () => {
    setDemoStep((prev) => {
      const next = Math.min(prev + 1, 7);
      handleDemoStepAction(next);
      return next;
    });
  };

  const prevDemoStep = () => {
    setDemoStep((prev) => Math.max(prev - 1, 1));
  };

  const resetDemo = () => {
    setDemoStep(1);
    setBuses(INITIAL_BUSES);
    setSelectedBusId('bus_01');
    notifiedStopRef.current = {};
    if (soundEnabled) playActionBeep();
  };

  // Admin Settings & Content Management
  const updateSettings = async (newSettings: Partial<TransitSystemSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      await setDoc(doc(db, 'system_config', 'transit_settings'), merged);
    } catch (err) {
      console.warn('Could not persist settings to Firestore:', err);
    }
  };

  const updateBusDetails = async (busId: string, updates: Partial<Bus>) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, ...updates, lastUpdated: Date.now() } : b))
    );
    try {
      await setDoc(doc(db, 'buses', busId), updates, { merge: true });
    } catch (err) {
      console.warn('Could not persist bus update to Firestore:', err);
    }
  };

  const addNewBus = async (newBus: Bus) => {
    setBuses((prev) => [...prev, newBus]);
    try {
      await setDoc(doc(db, 'buses', newBus.id), newBus);
    } catch (err) {
      console.warn('Could not save new bus to Firestore:', err);
    }
  };

  const deleteBus = async (busId: string) => {
    setBuses((prev) => prev.filter((b) => b.id !== busId));
    if (selectedBusId === busId && buses.length > 1) {
      setSelectedBusId(buses.find((b) => b.id !== busId)?.id || '');
    }
  };

  const addNewRoute = async (newRoute: CampusRoute) => {
    setRoutes((prev) => [...prev, newRoute]);
  };

  const deleteRoute = async (routeId: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
  };

  const broadcastAnnouncement = (title: string, message: string) => {
    const alert: AlertNotification = {
      id: 'broadcast_' + Date.now(),
      busId: 'system',
      busNumber: 'ADMIN',
      type: 'delay',
      title,
      message,
      timestamp: Date.now(),
      read: false,
      resolved: false,
    };
    setActiveAlerts((prev) => [alert, ...prev]);
    if (soundEnabled) playApproachingChime();
  };

  // Real-time animation loop for bus movement
  useEffect(() => {
    if (!isAutoDrive) return;

    const interval = setInterval(() => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          if (!bus.isTripActive) return bus;

          const route = routes.find((r) => r.id === bus.routeId);
          if (!route) return bus;

          const speedFactor = (bus.speedKmh || 25) / 12000;
          let newProgress = bus.progress + speedFactor;

          if (newProgress >= 1) {
            newProgress = 0.02;
          }

          const { lat, lng, heading } = getPositionAlongPath(route.pathPoints, newProgress);

          let currentStopIdx = 0;
          for (let i = 0; i < route.stops.length; i++) {
            const stopRatio = route.stops[i].distanceFromStartKm / route.totalDistanceKm;
            if (newProgress >= stopRatio) {
              currentStopIdx = i;
            }
          }

          // Check if student is on this route and near their selected stop
          if (student.selectedRouteId === bus.routeId && student.selectedStopId) {
            const myStop = route.stops.find((s) => s.id === student.selectedStopId);
            if (myStop) {
              const distToStopKm = calculateDistanceKm(lat, lng, myStop.lat, myStop.lng);
              const distMeters = distToStopKm * 1000;

              if (
                distMeters <= (student.alertDistanceMeters || 500) &&
                notifiedStopRef.current[bus.id] !== myStop.id
              ) {
                notifiedStopRef.current[bus.id] = myStop.id;

                const estTimeMins = Math.max(1, Math.round((distToStopKm / Math.max(15, bus.speedKmh)) * 60));
                setActiveAlerts((prev) => [
                  {
                    id: 'approaching_' + Date.now(),
                    busId: bus.id,
                    busNumber: bus.busNumber,
                    type: 'approaching_stop',
                    title: `Bus Approaching: ${myStop.name}`,
                    message: `${bus.busNumber} is ~${Math.round(distMeters)}m away (${estTimeMins} min). Head to your boarding stop.`,
                    timestamp: Date.now(),
                    read: false,
                    resolved: false,
                    location: { lat, lng },
                  },
                  ...prev,
                ]);

                if (soundEnabled) {
                  playApproachingChime();
                }
              }
            }
          }

          return {
            ...bus,
            progress: newProgress,
            latitude: lat,
            longitude: lng,
            heading,
            currentStopIndex: currentStopIdx,
            lastUpdated: Date.now(),
          };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoDrive, routes, student, soundEnabled]);

  return (
    <TransportContext.Provider
      value={{
        role,
        setRole,
        viewMode,
        setViewMode,
        routes,
        buses,
        activeAlerts,
        student,
        driver,
        tripHistory,
        soundEnabled,
        setSoundEnabled,
        toggleSound,
        demoStep,
        setDemoStep,
        nextDemoStep,
        prevDemoStep,
        resetDemo,
        isAutoDrive,
        setIsAutoDrive,
        toggleAutoDrive,
        startTrip,
        endTrip,
        setBusSpeed,
        setBusProgress,
        setPassengerCount,
        reportVehicleIssue,
        triggerEmergency,
        selectRoute,
        selectStop,
        setAlertDistance,
        resolveAlert,
        clearAllAlerts,
        selectedBusId,
        setSelectedBusId,
        settings,
        updateSettings,
        updateBusDetails,
        addNewBus,
        deleteBus,
        addNewRoute,
        deleteRoute,
        broadcastAnnouncement,
      }}
    >
      {children}
    </TransportContext.Provider>
  );
};

export const useTransport = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within a TransportProvider');
  }
  return context;
};
