import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
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
  ChevronDown,
  Home,
  Sliders,
  Sun,
  Moon,
  WifiOff,
  User as UserIcon,
  MapPin,
  Radio,
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

  const { currentUser, userProfile, logout, switchUserRole } = useAuth();
  const { currentPath, navigate, theme, toggleTheme, isOnline } = useNavigation();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  const activeRole: UserRole = userProfile?.role || role;
  const activeBuses = buses.filter((b) => b.isTripActive);

  const handleRoleSelect = (newRole: UserRole) => {
    switchUserRole(newRole);
    setRole(newRole);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);

    if (newRole === 'student') navigate('/student');
    else if (newRole === 'driver') navigate('/driver');
    else if (newRole === 'admin') navigate('/admin');
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
      {/* Offline Alert Strip if internet connection is lost */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>You are currently offline. Running on local cached transit data.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Route Links */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (onNavigateLanding) onNavigateLanding();
              navigate('/');
            }}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            title="Cambus G0 Home"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Cambus G0
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Live Transit
                </span>
              </div>
            </div>
          </button>

          {/* Role-Specific Navigation Links (STRICT RBAC) */}
          <nav className="hidden lg:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-4 text-xs font-semibold">
            {/* 1. STUDENT NAVIGATION ONLY: Student Dashboard & Track Map */}
            {activeRole === 'student' && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/student')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentPath === '/student'
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Student Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/track')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentPath === '/track'
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Track Map</span>
                </button>
              </>
            )}

            {/* 2. DRIVER NAVIGATION ONLY: Driver Console, Live Buses, Track Map */}
            {activeRole === 'driver' && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/driver')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentPath === '/driver'
                      ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5 text-teal-600" />
                  <span>Driver Console</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/buses')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentPath === '/buses'
                      ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-teal-600" />
                  <span>Live Buses</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/track')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentPath === '/track'
                      ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Track Map</span>
                </button>
              </>
            )}

            {/* 3. ADMIN NAVIGATION ONLY: Fleet Operations, Live Buses, Track Map */}
            {activeRole === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentPath === '/admin'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Fleet Ops</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/buses')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentPath === '/buses'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Live Buses</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/track')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentPath === '/track'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Track Map</span>
                </button>
              </>
            )}

            {/* Common Profile Tab */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentPath === '/profile'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Center Status Pill */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            {activeRole === 'student' ? (
              <span>Transit Telemetry Active</span>
            ) : (
              <span>{activeBuses.length} Fleet Units Active</span>
            )}
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono">17.385°N, 78.486°E</span>
          </div>
        </div>

        {/* Right Actions: Theme Toggle, Sound, Notifications, User Menu */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center ${
              soundEnabled
                ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
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
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 relative transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications & Broadcasts
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAlertsDropdown(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-xl border text-xs ${
                          alert.type === 'emergency'
                            ? 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
                            : alert.type === 'approaching_stop'
                            ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
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

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              type="button"
              id="user-profile-menu-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-xs cursor-pointer min-h-[38px]"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-slate-900 dark:text-white leading-none">
                  {userProfile?.displayName || (activeRole === 'admin' ? 'Fleet Admin' : activeRole === 'driver' ? 'Driver Kumar' : 'Student Aanya')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {activeRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-150">
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {userProfile?.displayName || 'Campus User'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {userProfile?.email || 'student@campusgo.edu'}
                  </div>
                </div>

                {/* Profile Navigation */}
                <button
                  type="button"
                  onClick={() => {
                    navigate('/profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>My Profile & Preferences</span>
                </button>

                {/* Common Navigation Quicklinks */}
                <div className="p-1.5 border-t border-slate-100 dark:border-slate-800 mt-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeRole === 'student') navigate('/student');
                      else if (activeRole === 'driver') navigate('/driver');
                      else navigate('/admin');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    {activeRole === 'student' ? (
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    ) : activeRole === 'driver' ? (
                      <Bus className="w-3.5 h-3.5 text-teal-600" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>
                      {activeRole === 'student'
                        ? 'My Student Dashboard'
                        : activeRole === 'driver'
                        ? 'Driver Console'
                        : 'Fleet Operations'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate('/track');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Track Map</span>
                  </button>

                  {/* Live Buses visible only for Driver and Admin */}
                  {(activeRole === 'admin' || activeRole === 'driver') && (
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/buses');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Radio className="w-3.5 h-3.5 text-teal-600" />
                      <span>Live Buses Fleet</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateLanding) onNavigateLanding();
                      navigate('/');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5 text-slate-500" />
                    <span>Public Overview</span>
                  </button>

                  {onOpenSimulation && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSimulation();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>Simulation Controls</span>
                    </button>
                  )}

                  {userProfile || currentUser ? (
                    <button
                      type="button"
                      id="navbar-signout-btn"
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="navbar-signin-btn"
                      onClick={() => {
                        navigate('/login');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center gap-2 font-semibold cursor-pointer"
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
            className="lg:hidden p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Mobile Drawer Navigation (STRICT RBAC) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs shadow-md">
          <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] px-1">
            Navigation Corridors
          </div>

          {/* 1. STUDENT ONLY MOBILE NAV */}
          {activeRole === 'student' && (
            <>
              <button
                type="button"
                onClick={() => {
                  navigate('/student');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
                  currentPath === '/student'
                    ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Student Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/track');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
                  currentPath === '/track'
                    ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Track Map</span>
              </button>
            </>
          )}

          {/* 2. DRIVER ONLY MOBILE NAV */}
          {activeRole === 'driver' && (
            <>
              <button
                type="button"
                onClick={() => {
                  navigate('/driver');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
                  currentPath === '/driver'
                    ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <Bus className="w-4 h-4 text-teal-600" />
                <span>Driver Console</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/buses');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
                  currentPath === '/buses'
                    ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <Radio className="w-4 h-4 text-teal-600" />
                <span>Live Buses Fleet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/track');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
                  currentPath === '/track'
                    ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Track Map</span>
              </button>
            </>
          )}

          {/* 3. ADMIN ONLY MOBILE NAV */}
          {activeRole === 'admin' && (
            <>
              <button
                type="button"
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
                  currentPath === '/admin'
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Fleet Operations</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/buses');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
                  currentPath === '/buses'
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <Radio className="w-4 h-4 text-indigo-600" />
                <span>Live Buses Fleet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/track');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl font-semibold flex items-center gap-2.5 min-h-[44px] ${
                  currentPath === '/track'
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200'
                    : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Track Map</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              navigate('/profile');
              setMobileMenuOpen(false);
            }}
            className="w-full p-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 flex items-center gap-2.5 min-h-[44px]"
          >
            <UserIcon className="w-4 h-4 text-slate-500" />
            <span>My Profile</span>
          </button>

          {!(userProfile || currentUser) ? (
            <button
              type="button"
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold flex items-center justify-center gap-2 min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
