import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserRole } from '../types';
import {
  Bus,
  GraduationCap,
  Shield,
  Volume2,
  VolumeX,
  Bell,
  Menu,
  X,
  LogOut,
  LogIn,
  CheckCircle2,
  ChevronDown,
  Home,
  Sliders,
} from 'lucide-react';

interface NavbarProps {
  onNavigateLanding?: () => void;
  isLanding?: boolean;
  onOpenSimulation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateLanding,
  isLanding = false,
  onOpenSimulation,
}) => {
  const {
    role,
    setRole,
    soundEnabled,
    toggleSound,
    activeAlerts,
    buses,
  } = useTransport();

  const { currentUser, logout } = useAuth();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  const activeBuses = buses.filter((b) => b.isTripActive);

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Role Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateLanding}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            title="Go to overview"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Cambus G0
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Live Transit
                </span>
              </div>
            </div>
          </button>

          {/* Role Pill Display */}
          {!isLanding && (
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3">
              {role === 'student' && (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </div>
              )}
              {role === 'driver' && (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                  <Bus className="w-3.5 h-3.5" />
                  <span>Driver</span>
                </div>
              )}
              {role === 'admin' && (
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Fleet Operations</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Operational Context Status */}
        {!isLanding && (
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600">
            {role === 'student' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span>{activeBuses.length} active buses streaming</span>
              </div>
            )}
            {role === 'driver' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span>GPS Connected • Telemetry Live</span>
              </div>
            )}
            {role === 'admin' && (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>Active fleet: {activeBuses.length} / {buses.length}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  Alerts: {activeAlerts.length > 0 ? `${activeAlerts.length} active` : '0 nominal'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Right Actions: Sound, Alerts, Profile / Switcher */}
        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center ${
              soundEnabled
                ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
            title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Alerts Notification Bell */}
          <div className="relative">
            <button
              type="button"
              id="nav-alerts-bell"
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 relative transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications & Broadcasts
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAlertsDropdown(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No active notifications
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-xl border text-xs ${
                          alert.type === 'emergency'
                            ? 'bg-red-50 border-red-200 text-red-900'
                            : alert.type === 'approaching_stop'
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{alert.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {alert.busNumber}
                          </span>
                        </div>
                        <p className="mt-1 opacity-90">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile / Role Switcher Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs cursor-pointer min-h-[38px]"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-slate-900 leading-none">
                  {currentUser?.displayName || (role === 'admin' ? 'Fleet Admin' : role === 'driver' ? 'Driver' : 'Student')}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">
                  {role === 'admin' ? 'Fleet Operations' : role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-150">
                {currentUser && (
                  <div className="p-2.5 border-b border-slate-100 mb-1">
                    <div className="font-bold text-slate-900 text-xs">{currentUser.displayName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  </div>
                )}

                {/* Role Switcher in Menu */}
                <div className="p-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Switch Workspace Role
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('student')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      role === 'student' && !isLanding
                        ? 'bg-blue-50 text-blue-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Student View</span>
                    </span>
                    {role === 'student' && !isLanding && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('driver')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      role === 'driver' && !isLanding
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Bus className="w-3.5 h-3.5 text-teal-600" />
                      <span>Driver View</span>
                    </span>
                    {role === 'driver' && !isLanding && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      role === 'admin' && !isLanding
                        ? 'bg-indigo-50 text-indigo-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Fleet Operations</span>
                    </span>
                    {role === 'admin' && !isLanding && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                  </button>
                </div>

                <div className="border-t border-slate-100 my-1 pt-1">
                  {onNavigateLanding && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateLanding();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Home className="w-3.5 h-3.5 text-slate-500" />
                      <span>Landing Overview</span>
                    </button>
                  )}

                  {onOpenSimulation && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSimulation();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>Simulation / Demo Data</span>
                    </button>
                  )}

                  {currentUser ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 font-semibold"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 text-xs shadow-md">
          <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] px-1">
            Active Workspace
          </div>
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
              role === 'student' && !isLanding
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'text-slate-700 bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Student Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('driver')}
            className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
              role === 'driver' && !isLanding
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-700 bg-slate-50'
            }`}
          >
            <Bus className="w-4 h-4 text-teal-600" />
            <span>Driver Console</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
              role === 'admin' && !isLanding
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                : 'text-slate-700 bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Fleet Operations</span>
          </button>

          {onNavigateLanding && (
            <button
              type="button"
              onClick={() => {
                onNavigateLanding();
                setMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-xl font-semibold text-slate-700 bg-slate-50 flex items-center gap-2.5 min-h-[44px]"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Public Landing Overview</span>
            </button>
          )}

          {!currentUser && (
            <button
              type="button"
              onClick={() => {
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
