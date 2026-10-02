import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TransportProvider, useTransport } from './context/TransportContext';
import { Navbar } from './components/Navbar';
import { StudentView } from './components/StudentView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';
import { LandingPage } from './components/LandingPage';
import { LiveDemoWalkthrough } from './components/LiveDemoWalkthrough';
import { SplitScreenDemo } from './components/SplitScreenDemo';
import { NotificationToast } from './components/NotificationToast';
import { SimulationDrawer } from './components/SimulationDrawer';
import { UserRole } from './types';
import { Sliders, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    role,
    setRole,
    viewMode,
    settings,
  } = useTransport();

  const [isLanding, setIsLanding] = useState<boolean>(false);
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(true);
  const [simulationDrawerOpen, setSimulationDrawerOpen] = useState<boolean>(false);

  const handleSelectRole = (newRole: UserRole) => {
    setRole(newRole);
    setIsLanding(false);
  };

  const handleLaunchDemo = () => {
    setIsLanding(false);
    setShowDemoBanner(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* System Announcement Banner if configured in settings */}
      {settings.announcementBanner && (
        <div className="bg-blue-600 text-white text-xs font-semibold py-1.5 px-4 text-center">
          {settings.announcementBanner}
        </div>
      )}

      {/* Header Navigation */}
      <Navbar
        isLanding={isLanding}
        onNavigateLanding={() => setIsLanding(true)}
        onOpenSimulation={() => setSimulationDrawerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* If Landing Page is Active */}
        {isLanding ? (
          <LandingPage
            onSelectRole={handleSelectRole}
            onLaunchDemoWalkthrough={handleLaunchDemo}
          />
        ) : (
          <>
            {/* Tech-Fest 7-Step Interactive Live Walkthrough Banner */}
            {showDemoBanner && <LiveDemoWalkthrough />}

            {/* Split Screen Mode (Driver GPS Transmitter on Left + Student Map on Right) */}
            {viewMode === 'split_demo' ? (
              <SplitScreenDemo />
            ) : (
              <>
                {/* Active Workspace View based on User Role */}
                {role === 'student' && <StudentView />}
                {role === 'driver' && <DriverView />}
                {role === 'admin' && <AdminView />}
              </>
            )}
          </>
        )}
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
          onClick={() => setSimulationDrawerOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold border border-slate-700 shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          title="Open Simulation and Demo Controls"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Simulation Controls</span>
          <span className="sm:hidden">Sim</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-900">Cambus G0</span>
            <span>• College Transport, Clearly Connected</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
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
    <AuthProvider>
      <TransportProvider>
        <MainAppContent />
      </TransportProvider>
    </AuthProvider>
  );
}
