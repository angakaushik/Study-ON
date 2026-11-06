import React, { useState, useEffect } from 'react';
import { StudyModePolicy } from '../types.ts';
import {
  ShieldAlert,
  Clock,
  ExternalLink,
  BookOpen,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Info,
  PowerOff,
  FileEdit,
} from 'lucide-react';

interface StudyModeModalProps {
  policy: StudyModePolicy;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: (sessionMinutes: number) => void;
  onClosePreview: () => void;
}

export const StudyModeModal: React.FC<StudyModeModalProps> = ({
  policy,
  isActive,
  onActivate,
  onDeactivate,
  onClosePreview,
}) => {
  // If active, show the full immersion simulated focus screen
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [notes, setNotes] = useState('');
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    const minutesRecorded = Math.max(1, Math.round(secondsElapsed / 60));
    onDeactivate(minutesRecorded);
    setShowExitConfirm(false);
  };

  // Case 1: Pre-activation explanation dialog (when student clicked switch to turn on)
  if (!isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-sky-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-sky-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Activate Study Mode</h3>
                <p className="text-xs text-sky-100">StudyOn Focus Protection</p>
              </div>
            </div>
            <button
              onClick={onClosePreview}
              className="text-white/80 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/10"
            >
              Cancel
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Essential effect explanation before turning on */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2">
                What happens when Study Mode turns ON:
              </h4>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                <li>Non-academic device notifications and pop-ups are silenced.</li>
                <li>App access is strictly restricted to verified educational resources.</li>
                <li>Continuous focus session duration is tracked towards your learning goals.</li>
                <li>Contributes to your digital paper savings counter.</li>
              </ul>
            </div>

            {/* Mandatory Prototype Simulation Disclosure */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Simulated Restrictions Notice</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                In this web preview prototype, device-level restrictions and OS lockouts are <strong>simulated in-app</strong>. Production deployment on Android smartphones requires integration with the <strong>Android Management API / Knox Device Administrator</strong> to enforce hardware-level app blocking.
              </p>
            </div>

            {/* Approved Learning Whitelist */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Approved Whitelisted Learning Resources ({policy.allowedApps.length}):
              </h4>
              <div className="space-y-2">
                {policy.allowedApps.map((app, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border border-sky-100 bg-white flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{app.name}</span>
                        <span className="text-[10px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {app.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{app.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Curfew & Max Duration */}
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 flex flex-col sm:flex-row justify-between gap-2">
              <span>Policy: {policy.policyName}</span>
              <span>Curfew Window: {policy.curfewHours}</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-sky-50/70 border-t border-sky-100 flex items-center justify-between">
            <button
              onClick={onClosePreview}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onActivate}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm & Start Study Mode</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: ACTIVE Study Mode full focus overlay
  return (
    <div className="fixed inset-0 z-50 bg-sky-950/95 text-white flex flex-col justify-between p-4 sm:p-8 backdrop-blur-md overflow-y-auto">
      {/* Top Banner: Status and Simulation Warning */}
      <div className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-sky-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500/30 border border-sky-400 flex items-center justify-center text-sky-300">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Study Mode Active</h2>
              <span className="text-[11px] bg-sky-400/20 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-full font-medium">
                Simulated Restrictions
              </span>
            </div>
            <p className="text-xs text-sky-300">Distractions Protected · Deep Focus Session</p>
          </div>
        </div>

        {/* Ambient white noise toggle & Exit trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmbientAudio(!ambientAudio)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              ambientAudio
                ? 'bg-sky-500 border-sky-400 text-white'
                : 'bg-white/10 border-white/20 text-sky-200 hover:bg-white/20'
            }`}
          >
            {ambientAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{ambientAudio ? 'Focus Audio (Rain) ON' : 'Mute Audio'}</span>
          </button>

          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <PowerOff className="w-3.5 h-3.5" />
            <span>End Study Mode</span>
          </button>
        </div>
      </div>

      {/* Main Focus Zone */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Timer and Session Stats */}
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/5 border border-sky-800/60 shadow-xl">
          <div className="text-xs font-semibold tracking-widest text-sky-300 uppercase mb-2">
            Active Study Timer
          </div>
          <div className="text-6xl font-black font-mono tracking-wider text-sky-100 my-3">
            {formatTimer(secondsElapsed)}
          </div>
          <div className="flex items-center gap-2 text-xs text-sky-300 mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Max Duration: {policy.maxDurationMinutes} mins</span>
          </div>

          {/* Quick Notice */}
          <div className="mt-6 p-3 rounded-xl bg-sky-900/50 border border-sky-700/60 text-[11px] text-sky-200 text-left">
            <strong>Device Restriction Simulation:</strong> Social media, games, and entertainment sites are blocked. Only approved study tools below are accessible.
          </div>
        </div>

        {/* Right: Permitted Tools Launcher & Quick Focus Notes */}
        <div className="space-y-4">
          <div className="bg-white/5 p-5 rounded-3xl border border-sky-800/60">
            <h3 className="text-xs font-bold text-sky-200 uppercase tracking-wider mb-3">
              Approved Learning Apps & Tools
            </h3>
            <div className="space-y-2">
              {policy.allowedApps.slice(0, 4).map((app, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedApp(app.name)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedApp === app.name
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-sky-100'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{app.name}</p>
                    <p className="text-[11px] text-sky-300">{app.category}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                </div>
              ))}
            </div>
            {selectedApp && (
              <div className="mt-3 p-2.5 rounded-lg bg-sky-900/60 border border-sky-600 text-xs text-sky-200">
                Switched focus to <strong>{selectedApp}</strong>. Working within approved educational sandbox.
              </div>
            )}
          </div>

          {/* Scratchpad for fast notes */}
          <div className="bg-white/5 p-5 rounded-3xl border border-sky-800/60">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-200 uppercase tracking-wider mb-2">
              <FileEdit className="w-3.5 h-3.5" />
              <span>Digital Focus Scratchpad</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down formulas, derivations, or questions to ask the teacher without leaving Study Mode..."
              rows={3}
              className="w-full p-3 rounded-xl bg-sky-950/70 border border-sky-700/60 text-xs text-white placeholder:text-sky-400/60 outline-none focus:border-sky-400"
            />
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-sky-200">
            <h4 className="text-base font-bold text-slate-900 mb-2">
              End Focus Session?
            </h4>
            <p className="text-xs text-slate-600 mb-5">
              You have completed <strong>{Math.floor(secondsElapsed / 60)} minutes</strong> of uninterrupted study. Your progress and paper saved metrics will be recorded.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Keep Studying
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-sky-600 text-white hover:bg-sky-500"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="max-w-4xl w-full mx-auto text-center text-[11px] text-sky-300/80 pt-3 border-t border-sky-800/80">
        StudyOn Focus Engine · Educational Whitelist Approved by {policy.policyName}
      </div>
    </div>
  );
};
