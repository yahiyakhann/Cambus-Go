import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Monitor,
  HelpCircle,
  X,
} from 'lucide-react';

export const LiveDemoWalkthrough: React.FC = () => {
  const {
    demoStep,
    setDemoStep,
    nextDemoStep,
    prevDemoStep,
    resetDemo,
    viewMode,
    setViewMode,
  } = useTransport();

  const [showPitchNotes, setShowPitchNotes] = useState<boolean>(false);

  const DEMO_STEPS = [
    {
      step: 1,
      title: 'Driver Logs In & Starts Trip',
      instruction: 'Driver accesses dashboard and presses START TRIP on BUS-01.',
      rolePrompt: 'Driver Role Active',
      evaluatorFocus: 'Demonstrates trip initialization and Firebase session setup.',
    },
    {
      step: 2,
      title: 'Driver Phone Transmits GPS Telemetry',
      instruction: 'Transmitter broadcasts latitude, longitude, and speed in real time.',
      rolePrompt: 'GPS Transmitter Active',
      evaluatorFocus: 'Simulates Android phone acting as cost-effective GPS hardware.',
    },
    {
      step: 3,
      title: 'Projector / Map Shows Moving Bus',
      instruction: 'Live campus map smoothly interpolates bus movement along route polyline.',
      rolePrompt: 'Live Map Active',
      evaluatorFocus: 'Real-time sync between Driver Phone → Firebase → Student Display.',
    },
    {
      step: 4,
      title: 'Select Student Stop & Show Dynamic ETA',
      instruction: 'Student selects boarding stop (e.g. South Gate). System computes distance ÷ speed.',
      rolePrompt: 'Student View Active',
      evaluatorFocus: 'Math engine calculates dynamic arrival time: remaining distance ÷ transit velocity.',
    },
    {
      step: 5,
      title: 'Approaching Stop Notification Triggered',
      instruction: 'Bus approaches within 500m threshold; automated audio chime & push alert trigger.',
      rolePrompt: 'Arrival Chime & Notification',
      evaluatorFocus: 'Smart geofence proximity trigger (approaching-stop notification).',
    },
    {
      step: 6,
      title: 'Emergency SOS Distress Beacon',
      instruction: 'Driver presses Panic SOS; exact coordinates and siren alert broadcast to Admin.',
      rolePrompt: 'Emergency SOS Broadcast',
      evaluatorFocus: 'High-priority incident response with real-time GPS pinpointing.',
    },
    {
      step: 7,
      title: 'Admin Fleet Command Center',
      instruction: 'Admin oversees all college buses, routes, incident dispatch, and trip history.',
      rolePrompt: 'Admin Fleet Overview',
      evaluatorFocus: 'Complete campus transit ecosystem governance and safety auditing.',
    },
  ];

  const currentStepData = DEMO_STEPS[demoStep - 1] || DEMO_STEPS[0];

  return (
    <div
      id="tech-fest-live-demo-banner"
      className="bg-slate-900 border border-blue-500/40 rounded-2xl p-4 shadow-xl shadow-blue-950/20 relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Tech-Fest Live Demo Mode
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                Step-by-Step Guide
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Step {demoStep} of 7: {currentStepData.title}
            </h3>
          </div>
        </div>

        {/* View Mode & Helper Actions */}
        <div className="flex items-center gap-2">
          {/* Dual / Split Screen Switcher */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'standard' ? 'split_demo' : 'standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'split_demo'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Split-screen: Show Driver Transmitter on left and Student / Admin Map on right side-by-side"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{viewMode === 'split_demo' ? 'Split-Screen Active' : 'Split-Screen Mode'}</span>
          </button>

          {/* Tech Fest Pitch Notes Modal / Toggle */}
          <button
            type="button"
            onClick={() => setShowPitchNotes(!showPitchNotes)}
            className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Show Guide Notes"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Reset Demo */}
          <button
            type="button"
            onClick={resetDemo}
            className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Progress Tracker Pill Bar */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
        {DEMO_STEPS.map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setDemoStep(s.step)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              s.step === demoStep
                ? 'bg-blue-500 ring-2 ring-blue-400/40'
                : s.step < demoStep
                ? 'bg-emerald-500'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
            title={`Jump to Step ${s.step}: ${s.title}`}
          />
        ))}
      </div>

      {/* Current Step Instruction & Next Control */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px]">
          <p className="text-slate-200 font-medium">
            👉 <span className="font-bold text-white">{currentStepData.instruction}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Key Evaluator Insight: {currentStepData.evaluatorFocus}
          </p>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevDemoStep}
            disabled={demoStep <= 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <button
            type="button"
            id="demo-next-step-btn"
            onClick={nextDemoStep}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <span>{demoStep === 7 ? 'Restart Demo' : 'Run Next Step'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pitch Notes Dropdown / Drawer */}
      {showPitchNotes && (
        <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-200">
            <span>Smart College Transportation System Highlights</span>
            <button
              type="button"
              onClick={() => setShowPitchNotes(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-400">
            Smart College Transportation System combining real-time tracking, ETA, notifications, emergency
            response, analytics and student accessibility.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-semibold text-blue-400">Zero Cost Hardware</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Uses driver&apos;s phone as GPS emitter.
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-semibold text-emerald-400">Smart ETA Logic</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Distance ÷ current average speed + real-time traffic delay offsets.
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-semibold text-red-400">Distress & SOS Safety</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Instant bus ID and coordinate broadcast to transport control desk.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
