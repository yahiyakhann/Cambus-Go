import React, { useState } from 'react';
import { useTransport } from '../context/TransportContext';
import {
  Sliders,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    demoStep,
    setDemoStep,
    nextDemoStep,
    prevDemoStep,
    resetDemo,
    isAutoDrive,
    toggleAutoDrive,
    triggerEmergency,
    selectedBusId,
    buses,
  } = useTransport();

  const [showPitchNotes, setShowPitchNotes] = useState<boolean>(false);

  if (!isOpen) return null;

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
      instruction: 'Student selects boarding stop. System computes distance ÷ speed.',
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
  const targetBus = buses.find((b) => b.id === selectedBusId) || buses[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Simulation & Demo Data</h3>
                <p className="text-[11px] text-slate-500">Developer & Evaluator Controls</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-5 text-xs text-slate-700">
            {/* Auto Cruise Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Auto-Cruise Simulation</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Advances buses automatically along route polylines
                </div>
              </div>
              <button
                type="button"
                onClick={toggleAutoDrive}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  isAutoDrive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                {isAutoDrive ? 'ACTIVE' : 'PAUSED'}
              </button>
            </div>

            {/* Step Walkthrough sequence for evaluation */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  Guided Sequence: Step {demoStep} of 7
                </span>
                <button
                  type="button"
                  onClick={() => setShowPitchNotes(!showPitchNotes)}
                  className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showPitchNotes ? 'Hide Guide' : 'Guide Notes'}</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="grid grid-cols-7 gap-1">
                {DEMO_STEPS.map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setDemoStep(s.step)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      s.step === demoStep
                        ? 'bg-blue-600'
                        : s.step < demoStep
                        ? 'bg-teal-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div>
                <div className="font-bold text-slate-900 text-xs">{currentStepData.title}</div>
                <p className="text-slate-600 mt-1 leading-relaxed">{currentStepData.instruction}</p>
                <div className="text-[11px] text-blue-700 mt-1 bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                  <span className="font-semibold">Focus:</span> {currentStepData.evaluatorFocus}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={prevDemoStep}
                  disabled={demoStep <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 text-slate-700 font-semibold text-xs flex items-center gap-1 hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <button
                  type="button"
                  onClick={nextDemoStep}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <span>{demoStep === 7 ? 'Restart Sequence' : 'Next Step'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pitch / Evaluator Notes */}
            {showPitchNotes && (
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2 text-[11px] text-slate-700">
                <div className="font-bold text-slate-900">Evaluation Criteria Notes:</div>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                  <li>Zero Cost Hardware: Driver phone GPS eliminates expensive tracker modules.</li>
                  <li>Dynamic ETA: Velocity ÷ remaining polyline distance with traffic offset.</li>
                  <li>Incident Response: SOS distress pinpointed on fleet operations map.</li>
                </ul>
              </div>
            )}

            {/* Quick Simulation Triggers */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Quick Scenario Triggers
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => triggerEmergency(targetBus.id)}
                  className="p-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Trigger SOS ({targetBus.busNumber})</span>
                </button>

                <button
                  type="button"
                  onClick={resetDemo}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reset All Buses</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Cambus G0 • Demo Mode</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
