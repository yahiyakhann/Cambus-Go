import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { ShieldAlert, ArrowLeft, LogIn, Lock, GraduationCap, Bus, Shield } from 'lucide-react';

interface AccessDeniedProps {
  attemptedResource: 'admin' | 'driver' | 'buses';
  requiredRoleLabel: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  attemptedResource,
  requiredRoleLabel,
}) => {
  const { userProfile, switchUserRole } = useAuth();
  const { navigate } = useNavigation();

  const currentRole = userProfile?.role || 'guest';

  const handleReturnHome = () => {
    if (currentRole === 'driver') {
      navigate('/driver');
    } else if (currentRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  const handleQuickSwitchToAuthorized = () => {
    if (attemptedResource === 'admin' || attemptedResource === 'buses') {
      switchUserRole('admin');
      navigate(attemptedResource === 'buses' ? '/buses' : '/admin');
    } else if (attemptedResource === 'driver') {
      switchUserRole('driver');
      navigate('/driver');
    }
  };

  const resourceTitle =
    attemptedResource === 'admin'
      ? 'Fleet Operations Admin'
      : attemptedResource === 'buses'
      ? 'Live Buses Fleet Management'
      : 'Driver Console';

  return (
    <div
      id="access-denied-container"
      className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Warning Icon Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Title & Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold tracking-wider uppercase border border-red-200 dark:border-red-800">
            <Lock className="w-3.5 h-3.5" />
            <span>403 — Unauthorized Access Blocked</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Access Restricted
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            You do not have permission to view this section. The{' '}
            <span className="font-bold text-slate-900 dark:text-slate-200 uppercase">
              {resourceTitle}
            </span>{' '}
            portal requires <strong className="text-red-600 dark:text-red-400">{requiredRoleLabel}</strong> clearance.
          </p>
        </div>

        {/* Current Identity Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 text-left flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider">
              Signed-in Identity
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
              {userProfile?.displayName || 'Guest User'}
            </div>
            <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {userProfile?.email || 'unauthenticated'}
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase">
              {currentRole === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
              {currentRole === 'driver' && <Bus className="w-3.5 h-3.5" />}
              {currentRole === 'admin' && <Shield className="w-3.5 h-3.5" />}
              {currentRole} Role
            </span>
          </div>
        </div>

        {/* Security Audit Notice */}
        {attemptedResource === 'buses' && (
          <div className="bg-red-50/80 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl p-2.5 text-[11px] text-red-800 dark:text-red-300 flex items-center justify-center gap-1.5 font-semibold">
            <Lock className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>Navigation attempt logged to AuthContext security audit register.</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            id="return-to-authorized-portal-btn"
            onClick={handleReturnHome}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              Return to {currentRole === 'driver' ? 'Driver Console' : 'Student Portal'}
            </span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Other Account</span>
            </button>

            <button
              type="button"
              onClick={handleQuickSwitchToAuthorized}
              className="py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Switch to Demo {attemptedResource === 'admin' ? 'Admin' : 'Driver'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
