import React, { useEffect, useState } from 'react';
import { useTransport } from '../context/TransportContext';
import { AlertNotification } from '../types';
import { Bell, AlertTriangle, Flame, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeAlerts, resolveAlert } = useTransport();
  const [latestAlert, setLatestAlert] = useState<AlertNotification | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (activeAlerts.length > 0) {
      const top = activeAlerts[0];
      // Only show if recent (within 10 seconds) and unread
      if (Date.now() - top.timestamp < 10000 && !top.resolved) {
        setLatestAlert(top);
        setVisible(true);

        const timer = setTimeout(() => {
          setVisible(false);
        }, 6000);

        return () => clearTimeout(timer);
      }
    }
  }, [activeAlerts]);

  if (!visible || !latestAlert) return null;

  const isEmergency = latestAlert.type === 'emergency';
  const isApproaching = latestAlert.type === 'approaching_stop';

  return (
    <div
      id="notification-toast-container"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div
        className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3.5 ${
          isEmergency
            ? 'bg-red-950/90 border-red-600 text-red-100 shadow-red-950/60'
            : isApproaching
            ? 'bg-blue-950/90 border-blue-500 text-blue-100 shadow-blue-950/60'
            : 'bg-slate-900/95 border-slate-700 text-slate-100'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isEmergency
              ? 'bg-red-600 text-white animate-pulse'
              : isApproaching
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {isEmergency ? (
            <Flame className="w-5 h-5" />
          ) : isApproaching ? (
            <Bell className="w-5 h-5 animate-bounce" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider">
              {latestAlert.title}
            </h5>
            <span className="text-[10px] opacity-70 font-mono">Just now</span>
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{latestAlert.message}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
            resolveAlert(latestAlert.id);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
