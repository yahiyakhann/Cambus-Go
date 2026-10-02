export type UserRole = 'student' | 'driver' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  department?: string;
  assignedBusNumber?: string;
  createdAt: number;
  status: 'active' | 'suspended';
}

export type VehicleCondition = 'good' | 'engine' | 'tyre' | 'fuel' | 'traffic';

export interface RouteStop {
  id: string;
  name: string;
  scheduledTime: string;
  distanceFromStartKm: number;
  lat: number;
  lng: number;
}

export interface PathPoint {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export interface CampusRoute {
  id: string;
  code: string;
  name: string;
  color: string;
  totalDistanceKm: number;
  pathPoints: PathPoint[];
  stops: RouteStop[];
}

export interface BusOccupancy {
  current: number;
  capacity: number;
}

export interface Bus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  routeId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  progress: number;
  status: 'active' | 'idle' | 'delayed' | 'emergency';
  occupancy: BusOccupancy;
  delayMinutes?: number;
  lastUpdated: number;
  vehicleCondition: VehicleCondition;
  isTripActive: boolean;
  currentStopIndex: number;
  tripStartTime?: string;
}

export interface AlertNotification {
  id: string;
  busId: string;
  busNumber: string;
  type: 'emergency' | 'delay' | 'approaching_stop' | 'trip_started' | 'trip_ended' | 'vehicle_problem';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  resolved: boolean;
  location?: { lat: number; lng: number };
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  selectedRouteId: string;
  selectedStopId: string;
  alertDistanceMeters: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  assignedBusId: string;
  phone: string;
}

export interface TripHistoryLog {
  id: string;
  busId: string;
  busNumber: string;
  routeName: string;
  driverName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'incident' | 'delayed';
  passengerCount: number;
  avgSpeedKmh: number;
}

export interface TransitSystemSettings {
  systemName: string;
  campusCenterLat: number;
  campusCenterLng: number;
  emergencyContactPhone: string;
  announcementBanner: string;
  enablePublicSignup: boolean;
  defaultAlertDistanceMeters: number;
  liveSyncIntervalSeconds: number;
  maintenanceMode: boolean;
}
