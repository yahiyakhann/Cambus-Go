import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransportProvider, useTransport } from './context/TransportContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { StudentView } from './components/StudentView';
import { TrackMapView } from './components/TrackMapView';
import { LiveBusesView } from './components/LiveBusesView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { LandingPage } from './components/LandingPage';
import { LiveDemoWalkthrough } from './components/LiveDemoWalkthrough';
import { SplitScreenDemo } from './components/SplitScreenDemo';
import { NotificationToast } from './components/NotificationToast';
import { SimulationDrawer } from './components/SimulationDrawer';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { AccessDenied } from './components/AccessDenied';
import { auditService } from './services/auditService';
import { UserRole } from './types';
import { Sliders } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    role,
    setRole,
    viewMode,
    settings,
  } = useTransport();

  const { userProfile, switchUserRole, recordAuditLog } = useAuth();
  const { currentPath, navigate, theme } = useNavigation();

  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(true);
  const [simulationDrawerOpen, setSimulationDrawerOpen] = useState<boolean>(false);

  // Sync role with userProfile when user logs in or switches profile
  useEffect(() => {
    if (userProfile?.role && userProfile.role !== role) {
      setRole(userProfile.role);
    }
  }, [userProfile?.role]);

  const activeRole: UserRole = userProfile?.role || role;

  // Track last audited unauthorized route visit to prevent duplicate logs while remaining on the page
  const auditedRouteRef = useRef<string | null>(null);

  // Audit Service: Monitor and log unauthorized navigation attempts to '/buses'
  useEffect(() => {
    const isUnauthorized = currentPath === '/buses' && !auditService.isRoleAuthorized(activeRole, '/buses');

    if (isUnauthorized) {
      // Prevent redundant log entries when a student remains on the unauthorized route
      if (auditedRouteRef.current === currentPath) {
        return;
      }

      const logParams = {
        attemptedRoute: currentPath,
        userRole: activeRole,
        userId: userProfile?.uid,
        userEmail: userProfile?.email,
      };

      if (auditService.shouldLogAttempt(logParams)) {
        auditedRouteRef.current = currentPath;
        const auditLog = auditService.createUnauthorizedAttemptLog(logParams);
        recordAuditLog(auditLog);
      }
    } else {
      // Reset tracker when navigating away from the unauthorized route
      if (auditedRouteRef.current !== null) {
        auditedRouteRef.current = null;
        auditService.clearRouteDebounce();
      }
    }
  }, [currentPath, activeRole, userProfile?.uid, userProfile?.email, recordAuditLog]);

  const handleSelectRole = (newRole: UserRole) => {
    switchUserRole(newRole);
    setRole(newRole);
    if (newRole === 'student') navigate('/student');
    else if (newRole === 'driver') navigate('/driver');
    else if (newRole === 'admin') navigate('/admin');
  };

  const handleLaunchDemo = () => {
    setShowDemoBanner(true);
    navigate('/student');
  };

  // Determine what view to render based on URL route and Role-Based Access Control
  const renderRouteContent = () => {
    // 1. Split Screen Demo Mode
    if (viewMode === 'split_demo') {
      return (
        <>
          {showDemoBanner && <LiveDemoWalkthrough />}
          <SplitScreenDemo />
        </>
      );
    }

    // 2. Auth Routes
    if (currentPath === '/login') {
      return <AuthView initialMode="login" />;
    }
    if (currentPath === '/register') {
      return <AuthView initialMode="signup" />;
    }

    // 3. User Profile Route
    if (currentPath === '/profile') {
      return <ProfileView />;
    }

    // 4. Track Map Route (Dedicated Track Map page - completely separate from Student Portal)
    if (currentPath === '/track') {
      return <TrackMapView />;
    }

    // 5. Student Portal Route (Pure Student Dashboard - No Live Buses management, no driver/admin controls)
    if (currentPath === '/student') {
      return <StudentView />;
    }

    // 6. Live Buses Route (Protected: Restricted according to role - Students are BLOCKED)
    if (currentPath === '/buses') {
      if (activeRole === 'student') {
        return (
          <AccessDenied
            attemptedResource="buses"
            requiredRoleLabel="Fleet Operations / Transport Staff"
          />
        );
      }
      return <LiveBusesView />;
    }

    // 7. Driver Portal Route (Access Control: Block Students)
    if (currentPath === '/driver') {
      if (activeRole === 'student') {
        return (
          <AccessDenied
            attemptedResource="driver"
            requiredRoleLabel="Transit Driver"
          />
        );
      }
      return (
        <>
          {showDemoBanner && <LiveDemoWalkthrough />}
          <DriverView />
        </>
      );
    }

    // 8. Fleet Operations Admin Route (Access Control: Block Students & Drivers)
    if (currentPath === '/admin') {
      if (activeRole === 'student' || activeRole === 'driver') {
        return (
          <AccessDenied
            attemptedResource="admin"
            requiredRoleLabel="Fleet Operations Admin"
          />
        );
      }
      return (
        <>
          {showDemoBanner && <LiveDemoWalkthrough />}
          <AdminView />
        </>
      );
    }

    // 9. Default Root / Overview Route
    return (
      <LandingPage
        onSelectRole={handleSelectRole}
        onLaunchDemoWalkthrough={handleLaunchDemo}
      />
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-blue-600 selection:text-white transition-colors ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-800'
      }`}
    >
      {/* System Announcement Banner if configured in settings */}
      {settings.announcementBanner && (
        <div className="bg-blue-600 text-white text-xs font-semibold py-1.5 px-4 text-center">
          {settings.announcementBanner}
        </div>
      )}

      {/* Header Navigation with strict role-based items */}
      <Navbar
        isLanding={currentPath === '/'}
        onNavigateLanding={() => navigate('/')}
        onOpenSimulation={() => setSimulationDrawerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {renderRouteContent()}
      </main>

      {/* Persistent Notification Toast */}
      <NotificationToast />

      {/* Simulation Controls Drawer */}
      <SimulationDrawer
        isOpen={simulationDrawerOpen}
        onClose={() => setSimulationDrawerOpen(false)}
      />

      {/* Floating Quick Action: Simulation / Demo Controls */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          id="open-sim-drawer-fab"
          onClick={() => setSimulationDrawerOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-900/90 dark:bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold border border-slate-700 dark:border-slate-600 shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          title="Open Simulation and Demo Controls"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Simulation Controls</span>
          <span className="sm:hidden">Sim</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-900 dark:text-white">Cambus G0</span>
            <span>• College Transport, Clearly Connected</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-[11px]">
            <span>Real-time GPS Tracking</span>
            <span>•</span>
            <span>Dynamic ETA Math Engine</span>
            <span>•</span>
            <span>Zero-Cost Phone Hardware</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <TransportProvider>
          <MainAppContent />
        </TransportProvider>
      </AuthProvider>
    </NavigationProvider>
  );
}
