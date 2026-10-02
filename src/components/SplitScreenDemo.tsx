import React from 'react';
import { DriverView } from './DriverView';
import { StudentView } from './StudentView';
import { Smartphone, Monitor, ArrowRight } from 'lucide-react';

export const SplitScreenDemo: React.FC = () => {
  return (
    <div id="split-screen-demo-wrapper" className="space-y-4">
      {/* Live Sync Architecture Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white uppercase tracking-wider">
            Live Architecture Sync Mode
          </span>
          <span className="text-slate-400 hidden sm:inline">
            (Simulating Driver Phone & Student Phone concurrently)
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-slate-300">
          <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-blue-400 font-semibold">
            Driver GPS Phone
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-semibold">
            Firebase Real-time Sync
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-400 font-semibold">
            Student & Admin Display
          </span>
        </div>
      </div>

      {/* Dual Pane Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Column: Driver Phone Cockpit */}
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">Transmitter: Driver Device</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 font-mono">
              GPS SENDER
            </span>
          </div>
          <DriverView />
        </div>

        {/* Right Column: Student Phone & Live Map Receiver */}
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Receiver: Student & Projector Map</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-300 font-mono">
              REAL-TIME LISTENER
            </span>
          </div>
          <StudentView />
        </div>
      </div>
    </div>
  );
};
