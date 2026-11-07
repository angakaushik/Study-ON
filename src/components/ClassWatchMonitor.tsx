import React, { useState } from 'react';
import {
  ClassWatchClass,
  ClassWatchStudent,
  ClassWatchAlert,
  UserAccount,
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
import {
  Shield,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  AlertTriangle,
  UserX,
  KeyRound,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Globe,
  Radio,
  Search,
  Check,
  X,
  Info,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface ClassWatchMonitorProps {
  classes: ClassWatchClass[];
  activeClassCode: string;
  students: ClassWatchStudent[];
  alerts: ClassWatchAlert[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectClass: (code: string) => void;
  onCreateClass: (name: string) => void;
  onAddAllowedDomain: (domain: string) => void;
  onRemoveAllowedDomain: (domain: string) => void;
  onWarnStudent: (studentId: string, customMessage?: string) => void;
  onToggleLockStudent: (studentId: string) => void;
  onResetStudentPassword: (studentRegNumber: string, newPass: string) => void;
  onRemoveStudent: (studentId: string) => void;
  onAllowStudent?: (studentId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onClearAlerts: () => void;
  onOpenExtensionModal: () => void;
}

export const ClassWatchMonitor: React.FC<ClassWatchMonitorProps> = ({
  classes,
  activeClassCode,
  students,
  alerts,
  soundEnabled,
  onToggleSound,
  onSelectClass,
  onCreateClass,
  onAddAllowedDomain,
  onRemoveAllowedDomain,
  onWarnStudent,
  onToggleLockStudent,
  onResetStudentPassword,
  onRemoveStudent,
  onAllowStudent,
  onDismissAlert,
  onClearAlerts,
  onOpenExtensionModal,
}) => {
  const [newDomainInput, setNewDomainInput] = useState('');
  const [domainError, setDomainError] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  // Student removal confirmation modal
  const [studentToRemove, setStudentToRemove] = useState<ClassWatchStudent | null>(null);

  // Password reset modal
  const [studentToReset, setStudentToReset] = useState<ClassWatchStudent | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Custom warning modal
  const [studentToWarn, setStudentToWarn] = useState<ClassWatchStudent | null>(null);
  const [customWarningText, setCustomWarningText] = useState('Please close non-academic tabs and return to the lesson material.');

  // Alerts tab: 'active' vs 'handled'
  const [alertTab, setAlertTab] = useState<'active' | 'handled'>('active');
  const [handledAlerts, setHandledAlerts] = useState<ClassWatchAlert[]>([]);

  // Find active class
  const activeClass = classes.find((c) => c.code === activeClassCode) || classes[0];

  // Filter students for active class
  const classStudents = students.filter(
    (s) => s.classCode === activeClass?.code && !s.isRemoved
  );

  const removedStudents = students.filter(
    (s) => s.isRemoved
  );

  // Filter alerts for active class
  const activeAlerts = alerts.filter(
    (a) => a.classCode === activeClass?.code && a.status === 'active'
  );

  // Handle adding an allowed domain with validation
  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDomainError('');

    const trimmed = newDomainInput.trim();
    if (!trimmed) return;

    if (!isValidHostname(trimmed)) {
      setDomainError('Must be a valid domain with a dot and TLD (e.g. ncert.nic.in, docs.google.com).');
      return;
    }

    const normalized = normalizeDomain(trimmed);
    if (activeClass?.allowedDomains.includes(normalized)) {
      setDomainError('This domain is already in the allowlist.');
      return;
    }

    onAddAllowedDomain(normalized);
    setNewDomainInput('');
    if (soundEnabled) playSuccessChime();
  };

  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    onCreateClass(newClassName.trim());
    setNewClassName('');
    setShowCreateClassModal(false);
    if (soundEnabled) playSuccessChime();
  };

  const handleConfirmWarn = () => {
    if (!studentToWarn) return;
    onWarnStudent(studentToWarn.id, customWarningText);
    if (soundEnabled) playWarnTone();

    // Move matching alerts to handled
    const matching = activeAlerts.filter((a) => a.studentId === studentToWarn.id);
    setHandledAlerts((prev) => [
      ...matching.map((a) => ({ ...a, status: 'warned' as const })),
      ...prev,
    ]);
    matching.forEach((a) => onDismissAlert(a.id));

    setStudentToWarn(null);
  };

  const handleDismissAlertWithLog = (alert: ClassWatchAlert) => {
    onDismissAlert(alert.id);
    setHandledAlerts((prev) => [
      { ...alert, status: 'dismissed' as const },
      ...prev.slice(0, 49),
    ]);
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToReset || resetNewPassword.length < 6) return;
    onResetStudentPassword(studentToReset.regNumber, resetNewPassword);
    setResetSuccessMessage(`Password reset successfully for ${studentToReset.name}!`);
    setTimeout(() => {
      setStudentToReset(null);
      setResetNewPassword('');
      setResetSuccessMessage('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* ClassWatch Header & Controls Bar */}
      <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center text-[#5cc79a] shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">ClassWatch Live Monitor</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1a3a2e] text-[#5cc79a] border border-[#5cc79a]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5cc79a] animate-pulse mr-1.5"></span>
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Real-time classroom activity detection, instant screen lock, and site allowlisting.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 4-Digit Class Code Display */}
            <div className="bg-[#0f1c18] border border-[#2a473b] px-4 py-2 rounded-xl flex items-center gap-3">
              <span className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold">Class Code</span>
              <span className="text-2xl font-mono font-extrabold text-[#5cc79a] tracking-widest">
                {activeClass?.code || '----'}
              </span>
            </div>

            {/* Class Selector */}
            <select
              value={activeClassCode}
              onChange={(e) => onSelectClass(e.target.value)}
              className="bg-[#0f1c18] border border-[#2a473b] text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#5cc79a]"
            >
              {classes.map((cls) => (
                <option key={cls.code} value={cls.code}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCreateClassModal(true)}
              className="px-3 py-2.5 bg-[#1f3d30] hover:bg-[#284f3e] border border-[#3b6754] text-[#5cc79a] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Class
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-[#1a3328] border-[#5cc79a]/50 text-[#5cc79a]'
                  : 'bg-[#1c2420] border-[#334139] text-[#94a3b8]'
              }`}
              title={soundEnabled ? 'Alert sounds active' : 'Alert sounds muted'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#5cc79a]" />
                  <span>Sound ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#94a3b8]" />
                  <span>Sound OFF</span>
                </>
              )}
            </button>

            {/* Chrome Extension Modal Trigger */}
            <button
              onClick={onOpenExtensionModal}
              className="px-3.5 py-2.5 bg-[#5cc79a] hover:bg-[#6ee4b3] text-[#0f1c18] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Chrome Extension V3
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Students (Left/Center) & Alerts / Allowlist (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Student Grid */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Live Student Roster</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#16271f] text-[#5cc79a] border border-[#233a30]">
                  {classStudents.length} Connected
                </span>
              </h3>
            </div>
            <div className="text-xs text-[#94a3b8] flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> On task
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Off task
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Away
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> Locked
              </span>
            </div>
          </div>

          {classStudents.length === 0 ? (
            <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-10 text-center text-[#94a3b8]">
              <Radio className="w-10 h-10 text-[#5cc79a]/40 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-white">No students joined class {activeClass?.code} yet</p>
              <p className="text-xs mt-1 max-w-md mx-auto">
                Ask students to enter 4-digit code <strong className="text-[#5cc79a]">{activeClass?.code}</strong> in their Student Dashboard Tab Simulator or Chrome Extension to begin real-time monitoring.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classStudents.map((student) => {
                const isOffTask = student.status === 'Off task';
                const isLocked = student.isLocked;
                const isAway = student.status === 'Away';

                return (
                  <div
                    key={student.id}
                    className={`bg-[#16271f] rounded-xl p-4 border transition-all shadow-md relative ${
                      isLocked
                        ? 'border-purple-500/60 bg-purple-950/20'
                        : isOffTask
                        ? 'border-rose-500/60 bg-rose-950/15'
                        : 'border-[#233a30] hover:border-[#335645]'
                    }`}
                  >
                    {/* Card Top: Name, ID, Status Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {student.name}
                          {isLocked && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-500/40">
                              LOCKED
                            </span>
                          )}
                        </h4>
                        <span className="text-[11px] font-mono text-[#94a3b8]">{student.regNumber}</span>
                      </div>

                      {/* Status indicator badge */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          isLocked
                            ? 'bg-purple-900/40 text-purple-300 border-purple-500/40'
                            : student.status === 'On task'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : isOffTask
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>

                    {/* Active Domain Bar */}
                    <div className="bg-[#0f1c18] border border-[#233a30] rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Globe className="w-3.5 h-3.5 text-[#5cc79a] shrink-0" />
                        <span className="text-[#94a3b8] text-[11px] shrink-0">Active Tab:</span>
                        <span
                          className={`font-mono font-semibold truncate ${
                            isOffTask
                              ? 'text-rose-400 font-bold'
                              : student.status === 'On task'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                          title={student.currentDomain}
                        >
                          {student.currentDomain || 'Away'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#64748b] shrink-0">{student.lastSeen}</span>
                    </div>

                    {/* Action Buttons: Warn, Lock/Unlock, Reset Pwd, Remove */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#233a30]">
                      <button
                        onClick={() => {
                          setStudentToWarn(student);
                          if (soundEnabled) playWarnTone();
                        }}
                        className="px-2 py-1.5 bg-[#1f3028] hover:bg-[#284236] border border-[#305342] text-amber-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Send warning banner to student screen"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Warn
                      </button>

                      <button
                        onClick={() => {
                          onToggleLockStudent(student.id);
                          if (soundEnabled) playLockSound();
                        }}
                        className={`px-2 py-1.5 border text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isLocked
                            ? 'bg-purple-900/60 hover:bg-purple-800/80 border-purple-500 text-purple-200 font-bold'
                            : 'bg-[#1f3028] hover:bg-[#284236] border-[#305342] text-[#5cc79a]'
                        }`}
                        title={isLocked ? 'Unlock student screen' : 'Lock student screen'}
                      >
                        {isLocked ? (
                          <>
                            <Unlock className="w-3 h-3 text-purple-300" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-[#5cc79a]" />
                            Lock
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setStudentToReset(student);
                          setResetNewPassword('');
                        }}
                        className="px-2 py-1.5 bg-[#1f3028] hover:bg-[#284236] border border-[#305342] text-[#94a3b8] hover:text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Reset student password"
                      >
                        <KeyRound className="w-3 h-3" />
                        Reset
                      </button>

                      <button
                        onClick={() => setStudentToRemove(student)}
                        className="px-2 py-1.5 bg-[#261717] hover:bg-[#3d1f1f] border border-[#522929] text-rose-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Remove student from class"
                      >
                        <UserX className="w-3 h-3 text-rose-400" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Removed Students Roster & Allow Rejoin Action */}
          {removedStudents.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-[#141d18] border border-[#233a30]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Removed Students ({removedStudents.length})
                  </span>
                </div>
                <span className="text-[10px] text-[#94a3b8]">
                  Blocked from rejoining until allowed
                </span>
              </div>
              <div className="space-y-2">
                {removedStudents.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f1c18] border border-[#233a30] text-xs"
                  >
                    <div>
                      <span className="font-bold text-white mr-2">{s.name}</span>
                      <span className="font-mono text-[#94a3b8] text-[11px]">{s.regNumber}</span>
                    </div>
                    {onAllowStudent && (
                      <button
                        onClick={() => onAllowStudent(s.id)}
                        className="px-3 py-1 rounded-lg bg-[#1f3d30] hover:bg-[#284f3e] text-[#5cc79a] border border-[#3b6754] text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Allow Rejoin
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Alerts Panel & Allowlist Manager */}
        <div className="space-y-6">
          {/* Alerts Panel */}
          <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#233a30]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Classroom Alerts</h3>
                {activeAlerts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-600/50">
                    {activeAlerts.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-[#0f1c18] p-0.5 border border-[#233a30] text-[11px]">
                  <button
                    onClick={() => setAlertTab('active')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                      alertTab === 'active' ? 'bg-[#5cc79a] text-[#0f1c18]' : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    Active ({activeAlerts.length})
                  </button>
                  <button
                    onClick={() => setAlertTab('handled')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                      alertTab === 'handled' ? 'bg-[#5cc79a] text-[#0f1c18]' : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    Handled ({handledAlerts.length})
                  </button>
                </div>

                {activeAlerts.length > 0 && alertTab === 'active' && (
                  <button
                    onClick={onClearAlerts}
                    className="text-[11px] text-[#94a3b8] hover:text-rose-400 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Alert List View */}
            <div className="mt-3 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {alertTab === 'active' ? (
                activeAlerts.length === 0 ? (
                  <div className="py-8 text-center text-[#94a3b8]">
                    <CheckCircle2 className="w-8 h-8 text-[#5cc79a]/50 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-white">All students on task</p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">No infractions detected in {activeClass?.name}</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border transition-all ${
                        alert.severity === 'HIGH'
                          ? 'bg-rose-950/30 border-rose-500/50'
                          : 'bg-amber-950/20 border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                alert.severity === 'HIGH'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-500 text-black'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-xs font-bold text-white">{alert.studentName}</span>
                            {alert.count > 1 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#0f1c18] text-[#5cc79a] border border-[#5cc79a]/40">
                                {alert.count}x repeats
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-rose-400" />
                            <span className="font-mono text-xs font-bold text-rose-300">{alert.domain}</span>
                          </div>
                          <p className="text-[10px] text-[#94a3b8] mt-0.5">{alert.reason}</p>
                        </div>
                        <span className="text-[10px] text-[#64748b] shrink-0">{alert.timestamp}</span>
                      </div>

                      {/* Alert Action Buttons */}
                      <div className="mt-2.5 flex items-center justify-end gap-1.5 pt-2 border-t border-[#233a30]">
                        <button
                          onClick={() => {
                            const stu = students.find((s) => s.id === alert.studentId);
                            if (stu) setStudentToWarn(stu);
                            if (soundEnabled) playWarnTone();
                          }}
                          className="px-2 py-1 bg-[#1f3028] hover:bg-[#284236] border border-[#305342] text-amber-300 text-[10px] font-semibold rounded cursor-pointer"
                        >
                          Warn
                        </button>
                        <button
                          onClick={() => {
                            onToggleLockStudent(alert.studentId);
                            if (soundEnabled) playLockSound();
                            handleDismissAlertWithLog(alert);
                          }}
                          className="px-2 py-1 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-[10px] font-semibold rounded cursor-pointer"
                        >
                          Lock
                        </button>
                        <button
                          onClick={() => handleDismissAlertWithLog(alert)}
                          className="px-2 py-1 bg-[#1c2420] hover:bg-[#2a3630] text-[#94a3b8] text-[10px] font-semibold rounded cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* Handled Alerts List */
                handledAlerts.length === 0 ? (
                  <div className="py-6 text-center text-[#94a3b8] text-xs">
                    No handled alerts in this session.
                  </div>
                ) : (
                  handledAlerts.map((ha, idx) => (
                    <div key={`${ha.id}-${idx}`} className="p-2.5 rounded-lg bg-[#0f1c18] border border-[#233a30] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{ha.studentName}</span>
                        <span className="text-[10px] font-mono text-[#5cc79a] uppercase">{ha.status}</span>
                      </div>
                      <div className="text-[11px] text-[#94a3b8] font-mono mt-0.5">{ha.domain}</div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* Allowlist Manager */}
          <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#233a30]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5cc79a]" />
                <h3 className="text-sm font-bold text-white">Study Sites Allowlist</h3>
              </div>
              <span className="text-xs text-[#94a3b8]">
                {activeClass?.allowedDomains.length} allowed
              </span>
            </div>

            <p className="text-[11px] text-[#94a3b8] mt-2 mb-3">
              Students in this class may only browse these domains. Subdomains (e.g. <code>en.wikipedia.org</code>) are automatically allowed.
            </p>

            {/* Add Domain Input */}
            <form onSubmit={handleAddDomainSubmit} className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newDomainInput}
                  onChange={(e) => {
                    setNewDomainInput(e.target.value);
                    setDomainError('');
                  }}
                  placeholder="e.g. ncert.nic.in, docs.google.com"
                  className="flex-1 bg-[#0f1c18] border border-[#2a473b] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#5cc79a]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#5cc79a] hover:bg-[#6ee4b3] text-[#0f1c18] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
              {domainError && <p className="text-[11px] text-rose-400 font-medium">{domainError}</p>}
            </form>

            {/* List of Allowed Domains */}
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {activeClass?.allowedDomains.map((domain) => (
                <div
                  key={domain}
                  className="flex items-center justify-between bg-[#0f1c18] border border-[#233a30] rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Globe className="w-3.5 h-3.5 text-[#5cc79a] shrink-0" />
                    <span className="font-mono text-white truncate">{domain}</span>
                    <span className="text-[10px] text-[#64748b] bg-[#16271f] px-1.5 py-0.2 rounded border border-[#233a30]">
                      +subdomains
                    </span>
                  </div>
                  {activeClass.allowedDomains.length > 1 && (
                    <button
                      onClick={() => onRemoveAllowedDomain(domain)}
                      className="text-[#64748b] hover:text-rose-400 p-1 cursor-pointer transition-colors"
                      title="Remove domain"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Send Custom Warning */}
      {studentToWarn && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16271f] border border-[#233a30] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Send Warning to Student</h3>
                <p className="text-xs text-[#94a3b8]">Student: {studentToWarn.name} ({studentToWarn.regNumber})</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="text-xs text-[#94a3b8] font-semibold">Warning Message Banner</label>
              <textarea
                rows={3}
                value={customWarningText}
                onChange={(e) => setCustomWarningText(e.target.value)}
                className="w-full bg-[#0f1c18] border border-[#2a473b] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#5cc79a]"
              />
              <p className="text-[11px] text-[#64748b]">
                This will trigger an alert chime and display an instant warning banner on the student's screen.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setStudentToWarn(null)}
                className="px-4 py-2 rounded-xl bg-[#0f1c18] hover:bg-[#1a2e24] text-[#94a3b8] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWarn}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
              >
                Send Warning Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reset Student Password */}
      {studentToReset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16271f] border border-[#233a30] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center text-[#5cc79a]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Student Password</h3>
                <p className="text-xs text-[#94a3b8]">{studentToReset.name} ({studentToReset.regNumber})</p>
              </div>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4 mb-5">
              <div>
                <label className="text-xs text-[#94a3b8] font-semibold block mb-1">New Password (Min 6 characters)</label>
                <input
                  type="text"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  className="w-full bg-[#0f1c18] border border-[#2a473b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#5cc79a]"
                  minLength={6}
                  required
                />
              </div>

              {resetSuccessMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {resetSuccessMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStudentToReset(null)}
                  className="px-4 py-2 rounded-xl bg-[#0f1c18] hover:bg-[#1a2e24] text-[#94a3b8] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetNewPassword.length < 6}
                  className="px-4 py-2 rounded-xl bg-[#5cc79a] hover:bg-[#6ee4b3] text-[#0f1c18] font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Remove Student Confirmation */}
      {studentToRemove && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16271f] border border-[#233a30] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove Student From Class</h3>
                <p className="text-xs text-[#94a3b8]">{studentToRemove.name} ({studentToRemove.regNumber})</p>
              </div>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed mb-5">
              Are you sure you want to remove this student from <strong>{activeClass?.name}</strong>? The student will be disconnected from the live session and cannot rejoin with class code <strong>{activeClass?.code}</strong> until re-authorized.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setStudentToRemove(null)}
                className="px-4 py-2 rounded-xl bg-[#0f1c18] hover:bg-[#1a2e24] text-[#94a3b8] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRemoveStudent(studentToRemove.id);
                  setStudentToRemove(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create New Class */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16271f] border border-[#233a30] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center text-[#5cc79a]">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create New Classroom</h3>
                <p className="text-xs text-[#94a3b8]">Generates a unique 4-digit class code</p>
              </div>
            </div>

            <form onSubmit={handleCreateClassSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#94a3b8] font-semibold block mb-1">Classroom Name</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. CS305 - Operating Systems Lab"
                  className="w-full bg-[#0f1c18] border border-[#2a473b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#5cc79a]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0f1c18] hover:bg-[#1a2e24] text-[#94a3b8] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#5cc79a] hover:bg-[#6ee4b3] text-[#0f1c18] font-bold text-xs cursor-pointer"
                >
                  Create Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
