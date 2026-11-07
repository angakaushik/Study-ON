import React, { useState } from 'react';
import {
  ClassWatchClass,
  ClassWatchStudent,
  StudentProfile,
} from '../types.ts';
import {
  isValidHostname,
  normalizeDomain,
  isDomainAllowed,
  getDomainAlertSeverity,
} from '../utils/domainRules.ts';
import {
  playAlertChime,
  playWarnTone,
  playLockSound,
  playSuccessChime,
} from '../utils/soundEffects.ts';
import { dataService } from '../lib/dataService.ts';
import {
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  Globe,
  Radio,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  LogOut,
  Users,
  Eye,
  Info,
  Copy,
  Check,
  Smartphone,
} from 'lucide-react';

interface StudentTabSimulatorProps {
  profile: StudentProfile;
  classes: ClassWatchClass[];
  currentStudentState?: ClassWatchStudent;
  soundEnabled: boolean;
  onJoinClass: (code: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onLeaveClass: () => void;
  onReportDomain: (domain: string) => void;
  onRegenerateParentCode: () => void;
  onDismissWarning: () => void;
}

export const StudentTabSimulator: React.FC<StudentTabSimulatorProps> = ({
  profile,
  classes,
  currentStudentState,
  soundEnabled,
  onJoinClass,
  onLeaveClass,
  onReportDomain,
  onRegenerateParentCode,
  onDismissWarning,
}) => {
  const [inputClassCode, setInputClassCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [customDomainError, setCustomDomainError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // 5-second presence heartbeat & immediate offline mark on unload
  React.useEffect(() => {
    if (!currentStudentState?.id || !currentStudentState.classCode || currentStudentState.isRemoved) return;

    dataService.sendPresence(currentStudentState.id, false);

    const heartbeatTimer = setInterval(() => {
      dataService.sendPresence(currentStudentState.id, false);
    }, 5000);

    const handleUnload = () => {
      dataService.sendPresence(currentStudentState.id, true);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [currentStudentState?.id, currentStudentState?.classCode, currentStudentState?.isRemoved]);

  // Active joined class
  const joinedClass = currentStudentState
    ? classes.find((c) => c.code === currentStudentState.classCode)
    : null;

  const isLocked = currentStudentState?.isLocked || false;
  const isOffTask = currentStudentState?.status === 'Off task';

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    const trimmed = inputClassCode.trim();
    if (!trimmed || trimmed.length !== 4) {
      setJoinError('Please enter a valid 4-digit class code.');
      return;
    }

    try {
      const res = await onJoinClass(trimmed);
      if (!res.success) {
        setJoinError(res.message);
      } else {
        setInputClassCode('');
        if (soundEnabled) playSuccessChime();
      }
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join class');
    }
  };

  const handleSimulatePreset = (domain: string) => {
    onReportDomain(domain);
    if (domain === 'Away') return;

    if (joinedClass) {
      if (isDomainAllowed(domain, joinedClass.allowedDomains)) {
        if (soundEnabled) playSuccessChime();
      } else {
        if (soundEnabled) playAlertChime();
      }
    }
  };

  const handleCustomDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomDomainError('');

    const trimmed = customDomainInput.trim();
    if (!trimmed) return;

    if (!isValidHostname(trimmed)) {
      setCustomDomainError('Please enter a valid hostname with a dot and TLD (e.g. reddit.com or cs.wikipedia.org). Bare words like "youtube" are ignored.');
      return;
    }

    const normalized = normalizeDomain(trimmed);
    onReportDomain(normalized);
    setCustomDomainInput('');

    if (joinedClass) {
      if (isDomainAllowed(normalized, joinedClass.allowedDomains)) {
        if (soundEnabled) playSuccessChime();
      } else {
        if (soundEnabled) playAlertChime();
      }
    }
  };

  const copyParentCode = () => {
    if (currentStudentState?.parentLinkCode) {
      navigator.clipboard.writeText(currentStudentState.parentLinkCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* FULL SCREEN LOCK OVERLAY (When locked by teacher) */}
      {isLocked && (
        <div className="fixed inset-0 z-50 bg-[#0f1c18]/95 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="bg-[#16271f] border-2 border-purple-500/80 rounded-3xl p-8 max-w-lg w-full text-white shadow-2xl space-y-5">
            <div className="w-20 h-20 rounded-full bg-purple-950/80 border-2 border-purple-400 flex items-center justify-center mx-auto text-purple-300">
              <Lock className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-900 text-purple-200 border border-purple-400 mb-2">
                CLASSROOM SCREEN LOCKED
              </span>
              <h2 className="text-2xl font-black text-white">Focus on the Instructor</h2>
              <p className="text-sm text-[#94a3b8] mt-2 leading-relaxed">
                Your teacher in <strong>{joinedClass?.name || 'Classroom'}</strong> has paused student screens. Please direct your attention to the classroom board or discussion.
              </p>
            </div>

            <div className="bg-[#0f1c18] border border-[#233a30] rounded-xl p-3 text-xs text-[#64748b] flex items-center justify-center gap-2">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>Screen will instantly restore once unlocked by your teacher.</span>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE WARNING BANNER FROM TEACHER */}
      {currentStudentState?.warningMessage && (
        <div className="bg-amber-950/90 border-2 border-amber-500 rounded-2xl p-4 text-white shadow-lg flex items-start justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-300">Classroom Attention Notice from Teacher</h4>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  {currentStudentState.warningTimestamp || 'Just now'}
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-1 leading-relaxed">
                {currentStudentState.warningMessage}
              </p>
            </div>
          </div>

          <button
            onClick={onDismissWarning}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* PRIVACY GUARANTEE BANNER */}
      <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center text-[#5cc79a] shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Privacy-First Classroom Companion</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1a3328] text-[#5cc79a] border border-[#5cc79a]/30">
                Verified Safe
              </span>
            </h4>
            <p className="text-[11px] text-[#94a3b8]">
              Your teacher can see <strong>site names only</strong> (e.g. <code>wikipedia.org</code>), never page content, keystrokes, camera feeds, or private messages.
            </p>
          </div>
        </div>
      </div>

      {/* JOIN CLASSROOM VS ACTIVE CLASS SESSION */}
      {!currentStudentState || !currentStudentState.classCode || currentStudentState.isRemoved ? (
        <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-6 text-white shadow-xl max-w-lg mx-auto">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center mx-auto text-[#5cc79a] mb-3">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Join Classroom Monitoring Session</h3>
            <p className="text-xs text-[#94a3b8] mt-1">
              Enter the 4-digit code displayed on your teacher's projector or screen.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#94a3b8] block mb-1.5 uppercase tracking-wider text-center">
                4-Digit Class Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={inputClassCode}
                onChange={(e) => {
                  setInputClassCode(e.target.value.replace(/\D/g, ''));
                  setJoinError('');
                }}
                placeholder="e.g. 4892"
                className="w-full text-center text-3xl font-mono font-black tracking-widest bg-[#0f1c18] border-2 border-[#2a473b] focus:border-[#5cc79a] rounded-xl py-3 text-[#5cc79a] focus:outline-none"
              />
              <span className="block text-[11px] text-[#64748b] text-center mt-1">
                Demo code: <strong className="text-[#5cc79a]">4892</strong> (Dr. Sharma) or <strong className="text-[#5cc79a]">2045</strong> (Prof. Kulkarni)
              </span>
            </div>

            {joinError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs text-center font-medium">
                {joinError}
              </div>
            )}

            <button
              type="submit"
              disabled={inputClassCode.length !== 4}
              className="w-full py-3 bg-[#5cc79a] hover:bg-[#6ee4b3] text-[#0f1c18] font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-lg"
            >
              Join Live Class
            </button>
          </form>
        </div>
      ) : (
        /* CONNECTED CLASSROOM CONTROLS & TAB SIMULATOR */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Joined Class Info & Parent Link Code */}
          <div className="space-y-6">
            {/* Active Class Card */}
            <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-5 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#233a30]">
                <div>
                  <span className="text-[10px] font-bold text-[#5cc79a] uppercase tracking-wider">Connected Classroom</span>
                  <h3 className="text-base font-bold text-white">{joinedClass?.name}</h3>
                </div>
                <div className="px-3 py-1 rounded-xl bg-[#0f1c18] border border-[#2a473b] font-mono text-base font-extrabold text-[#5cc79a]">
                  {joinedClass?.code}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#94a3b8]">
                  <span>Instructor:</span>
                  <span className="text-white font-medium">{joinedClass?.teacherName}</span>
                </div>
                <div className="flex justify-between text-[#94a3b8]">
                  <span>Your Status:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      isOffTask
                        ? 'bg-rose-950 text-rose-400 border border-rose-600/40'
                        : currentStudentState.status === 'On task'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                        : 'bg-amber-950 text-amber-400 border border-amber-600/40'
                    }`}
                  >
                    {currentStudentState.status}
                  </span>
                </div>
                <div className="flex justify-between text-[#94a3b8]">
                  <span>Active Reported Domain:</span>
                  <span className="font-mono text-white font-semibold">{currentStudentState.currentDomain}</span>
                </div>
              </div>

              {/* Allowed Domains in this session */}
              <div className="pt-3 border-t border-[#233a30]">
                <h5 className="text-[11px] font-bold text-[#94a3b8] mb-2 uppercase tracking-wider">
                  Allowed Study Sites
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {joinedClass?.allowedDomains.map((dom) => (
                    <span
                      key={dom}
                      className="px-2 py-1 bg-[#0f1c18] border border-[#233a30] text-[11px] font-mono text-[#5cc79a] rounded-lg"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={onLeaveClass}
                className="w-full py-2 bg-[#1c2420] hover:bg-rose-950/60 hover:text-rose-300 border border-[#233a30] hover:border-rose-700/50 text-[#94a3b8] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Leave Classroom Session
              </button>
            </div>

            {/* Parent Link Code Card */}
            <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-5 text-white shadow-xl space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#233a30]">
                <Smartphone className="w-4 h-4 text-[#5cc79a]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">6-Digit Parent Link Code</h4>
              </div>

              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                Provide this code to your parent to link their Parent Portal account. They can see summary focus metrics and site names only.
              </p>

              <div className="bg-[#0f1c18] border border-[#2a473b] rounded-xl p-3 flex items-center justify-between">
                <span className="text-2xl font-mono font-extrabold text-[#5cc79a] tracking-widest">
                  {currentStudentState.parentLinkCode}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyParentCode}
                    className="p-2 rounded-lg bg-[#1f3d30] hover:bg-[#284f3e] text-[#5cc79a] transition-colors cursor-pointer"
                    title="Copy parent link code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={onRegenerateParentCode}
                    className="p-2 rounded-lg bg-[#1c2420] hover:bg-[#2a3630] text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
                    title="Regenerate new parent link code"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 2 Cols: Built-in Tab Reporter / Simulator */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-6 text-white shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#233a30]">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Built-in Tab Reporter & Simulator</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1a3328] text-[#5cc79a] border border-[#5cc79a]/30">
                      NO EXTENSION REQUIRED
                    </span>
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Click any simulated browser tab or input a domain below to demo instant real-time telemetry to the teacher's dashboard.
                  </p>
                </div>
              </div>

              {/* Quick Tab Presets */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">
                  Quick Tab Switching Simulator
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleSimulatePreset('wikipedia.org')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentStudentState.currentDomain === 'wikipedia.org'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                        : 'bg-[#0f1c18] border-[#233a30] hover:border-[#385e4c] text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Wikipedia</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-semibold">Allowed</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#5cc79a] block mt-1">wikipedia.org</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePreset('khanacademy.org')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentStudentState.currentDomain === 'khanacademy.org'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                        : 'bg-[#0f1c18] border-[#233a30] hover:border-[#385e4c] text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Khan Academy</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-semibold">Allowed</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#5cc79a] block mt-1">khanacademy.org</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePreset('docs.google.com')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentStudentState.currentDomain === 'docs.google.com'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                        : 'bg-[#0f1c18] border-[#233a30] hover:border-[#385e4c] text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Google Docs</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-semibold">Allowed</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#5cc79a] block mt-1">docs.google.com</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePreset('youtube.com')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentStudentState.currentDomain === 'youtube.com'
                        ? 'bg-rose-950/80 border-rose-500 text-white shadow-md'
                        : 'bg-[#0f1c18] border-[#233a30] hover:border-rose-800 text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">YouTube</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-300 font-semibold">HIGH Alert</span>
                    </div>
                    <span className="font-mono text-[11px] text-rose-400 block mt-1">youtube.com</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePreset('discord.com')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentStudentState.currentDomain === 'discord.com'
                        ? 'bg-rose-950/80 border-rose-500 text-white shadow-md'
                        : 'bg-[#0f1c18] border-[#233a30] hover:border-rose-800 text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Discord</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-300 font-semibold">HIGH Alert</span>
                    </div>
                    <span className="font-mono text-[11px] text-rose-400 block mt-1">discord.com</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePreset('Away')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentStudentState.currentDomain === 'Away'
                        ? 'bg-amber-950/60 border-amber-500 text-white shadow-md'
                        : 'bg-[#0f1c18] border-[#233a30] hover:border-amber-800 text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Focus Lost</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 font-semibold">Away</span>
                    </div>
                    <span className="font-mono text-[11px] text-amber-400 block mt-1">Browser Unfocused</span>
                  </button>
                </div>
              </div>

              {/* Custom Domain Input Simulator */}
              <div className="pt-4 border-t border-[#233a30] space-y-3">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">
                  Simulate Any Domain Input
                </label>
                <form onSubmit={handleCustomDomainSubmit} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customDomainInput}
                      onChange={(e) => {
                        setCustomDomainInput(e.target.value);
                        setCustomDomainError('');
                      }}
                      placeholder="e.g. reddit.com, en.wikipedia.org, coolmathgames.com"
                      className="flex-1 bg-[#0f1c18] border border-[#2a473b] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#5cc79a]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#5cc79a] hover:bg-[#6ee4b3] text-[#0f1c18] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Report Tab
                    </button>
                  </div>
                  {customDomainError && (
                    <p className="text-[11px] text-rose-400 font-medium">{customDomainError}</p>
                  )}
                  <p className="text-[10px] text-[#64748b]">
                    Subdomain test: typing <code>upload.wikimedia.org</code> or <code>en.wikipedia.org</code> will be recognized as allowed.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
