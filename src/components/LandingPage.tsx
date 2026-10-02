import React from 'react';
import { useTransport } from '../context/TransportContext';
import { UserRole } from '../types';
import {
  Bus,
  GraduationCap,
  Shield,
  Smartphone,
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Bell,
  Sliders,
} from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onLaunchDemoWalkthrough: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  onLaunchDemoWalkthrough,
}) => {
  const { buses, routes, activeAlerts } = useTransport();

  const activeBuses = buses.filter((b) => b.isTripActive);

  return (
    <div id="landing-overview-page" className="space-y-12 pb-12">
      {/* Live Operational Status Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
          <div className="text-white">
            <span className="font-bold">LIVE CAMPUS TRANSIT NETWORK</span>
            <span className="text-slate-400 hidden sm:inline"> • Real-Time Telemetry Streaming</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <div>
            Active Buses:{' '}
            <span className="font-bold text-white">
              {activeBuses.length} / {buses.length}
            </span>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            Routes:{' '}
            <span className="font-bold text-white">{routes.length} Active Corridors</span>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            Distress Beacons:{' '}
            <span className={`font-bold ${activeAlerts.length > 0 ? 'text-red-400' : 'text-teal-400'}`}>
              {activeAlerts.length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-time GPS Tracking for Campus Transit</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          College Transport, <br className="hidden sm:inline" />
          <span className="text-blue-600">Clearly Connected.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Zero-cost tracking leveraging standard smartphones as GPS emitters. Dynamic ETA calculations,
          automated approaching stop notifications, real-time driver telemetry, and fleet operations console.
        </p>

        {/* Guided Step Demo CTA */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onLaunchDemoWalkthrough}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer min-h-[46px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Demo Walkthrough (7 Steps)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Core Roles Switchboard */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Choose Your Workspace Role
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role 1: Student */}
          <div
            onClick={() => onSelectRole('student')}
            className="bg-white border-2 border-slate-200/90 hover:border-blue-500 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Portal</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Real-time bus arrival countdowns, live GPS polyline map, seat availability, and
                  automated audio chimes when your bus approaches your stop.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dynamic ETA (Distance ÷ Speed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-teal-600" />
                  <span>Approaching stop alerts (500m geofence)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Live passenger seat occupancy</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <div className="w-full py-2.5 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                <span>Enter Student View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Role 2: Driver */}
          <div
            onClick={() => onSelectRole('driver')}
            className="bg-white border-2 border-slate-200/90 hover:border-teal-500 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <Bus className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Driver Console</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mobile-first cockpit turning driver smartphones into GPS emitters. Start/End
                  trips, adjust passenger counts, log delays, and trigger emergency SOS.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Zero-cost smartphone GPS emitter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span>One-touch START / END trip toggle</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Instant Emergency SOS distress beacon</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <div className="w-full py-2.5 rounded-xl bg-teal-50 group-hover:bg-teal-700 text-teal-800 group-hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                <span>Enter Driver Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Role 3: Fleet Operations / Admin */}
          <div
            onClick={() => onSelectRole('admin')}
            className="bg-white border-2 border-slate-200/90 hover:border-indigo-500 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                <Shield className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Fleet Operations</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Campus-wide oversight map, vehicle speed and punctuality tracking, emergency incident
                  dispatch, user role administration, and database settings.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Real-time multi-bus telemetry map</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Incident resolution & SOS triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Full user management and settings</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <div className="w-full py-2.5 rounded-xl bg-indigo-50 group-hover:bg-indigo-700 text-indigo-800 group-hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                <span>Enter Fleet Operations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 text-center">
          Key System Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">1. Smart Dynamic ETA</h4>
            <p className="text-slate-600 leading-relaxed">
              Computes remaining polyline distance using the Haversine formula divided by real-time GPS
              speed, incorporating live traffic delay offsets.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Smart Geofence Notifications</h4>
            <p className="text-slate-600 leading-relaxed">
              When a bus crosses within 500m of a student’s stop, the system fires automated visual
              alerts and web audio arrival chimes.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">3. Zero-Cost Campus Hardware</h4>
            <p className="text-slate-600 leading-relaxed">
              Eliminates the need for expensive third-party GPS hardware modules by turning existing driver
              smartphones into cloud-synced transmitters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
