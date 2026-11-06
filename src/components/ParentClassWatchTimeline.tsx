import React, { useState } from 'react';
import {
  ParentProfile,
  ClassWatchStudent,
  ClassWatchTimelineEvent,
  ClassWatchAlert,
} from '../types.ts';
import {
  Shield,
  Smartphone,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

interface ParentClassWatchTimelineProps {
  profile: ParentProfile;
  students: ClassWatchStudent[];
  timeline: ClassWatchTimelineEvent[];
  alerts: ClassWatchAlert[];
  onLinkChild: (studentId: string, parentCode: string) => { success: boolean; message: string };
  onUnlinkChild: (studentRegNumber: string) => void;
}

export const ParentClassWatchTimeline: React.FC<ParentClassWatchTimelineProps> = ({
  profile,
  students,
  timeline,
  alerts,
  onLinkChild,
  onUnlinkChild,
}) => {
  // Input fields for linking another child
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [parentCodeInput, setParentCodeInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  // Primary linked student
  const primaryReg = profile.linkedChild.regNumber;
  const [selectedStudentReg, setSelectedStudentReg] = useState<string>(primaryReg);

  // Find linked student records
  const currentChildState = students.find(
    (s) => s.regNumber.toLowerCase() === selectedStudentReg.toLowerCase()
  );

  // Filter timeline for currently selected child (site names and time only - privacy first!)
  const childTimeline = timeline.filter(
    (t) => t.studentRegNumber.toLowerCase() === selectedStudentReg.toLowerCase()
  );

  // Filter alerts/warnings for selected child
  const childAlerts = alerts.filter(
    (a) => a.studentRegNumber.toLowerCase() === selectedStudentReg.toLowerCase()
  );

  // Compute focus metrics
  const totalEvents = childTimeline.length;
  const onTaskEvents = childTimeline.filter((t) => t.status === 'On task').length;
  const focusPercentage = totalEvents > 0 ? Math.round((onTaskEvents / totalEvents) * 100) : 95;

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');

    if (!studentIdInput.trim() || !parentCodeInput.trim()) {
      setLinkError('Please enter both the Student ID and the 6-digit Parent Code.');
      return;
    }

    const res = onLinkChild(studentIdInput.trim(), parentCodeInput.trim());
    if (!res.success) {
      setLinkError(res.message);
    } else {
      setLinkSuccess(res.message);
      setSelectedStudentReg(studentIdInput.trim());
      setTimeout(() => {
        setShowLinkModal(false);
        setStudentIdInput('');
        setParentCodeInput('');
        setLinkSuccess('');
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Header Bar */}
      <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center text-[#5cc79a]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">ClassWatch Parent Companion</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a3328] text-[#5cc79a] border border-[#5cc79a]/30 font-semibold">
                Live Focus Timeline
              </span>
            </div>
            <p className="text-xs text-[#94a3b8]">
              Clean, privacy-first view of your student's learning session. Shows <strong>site names and times only</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLinkModal(true)}
          className="px-3.5 py-2.5 bg-[#1f3d30] hover:bg-[#284f3e] border border-[#3b6754] text-[#5cc79a] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Link Another Child
        </button>
      </div>

      {/* Focus Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Focus Consistency</span>
            <TrendingUp className="w-4 h-4 text-[#5cc79a]" />
          </div>
          <div className="text-3xl font-extrabold text-[#5cc79a]">{focusPercentage}%</div>
          <p className="text-[11px] text-[#94a3b8] mt-1">Classroom academic study ratio</p>
        </div>

        <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Status</span>
            <Radio className="w-4 h-4 text-[#5cc79a] animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold px-2.5 py-0.5 rounded-lg border ${
                currentChildState?.status === 'On task'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                  : currentChildState?.status === 'Off task'
                  ? 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                  : 'bg-amber-950/80 text-amber-400 border-amber-500/40'
              }`}
            >
              {currentChildState?.status || 'Active'}
            </span>
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-1 font-mono">
            {currentChildState?.currentDomain || 'wikipedia.org'} ({currentChildState?.lastSeen || 'Live'})
          </p>
        </div>

        <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Warnings Received</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{childAlerts.length}</div>
          <p className="text-[11px] text-[#94a3b8] mt-1">Teacher attention notices in this session</p>
        </div>
      </div>

      {/* Child Information & Timeline */}
      <div className="bg-[#16271f] border border-[#233a30] rounded-2xl p-6 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#233a30]">
          <div>
            <h4 className="text-sm font-bold text-white">
              Student Activity Timeline: {profile.linkedChild.name}
            </h4>
            <span className="text-xs font-mono text-[#94a3b8]">{selectedStudentReg}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94a3b8]">Classroom: {currentChildState?.classCode || '4892'}</span>
            <button
              onClick={() => onUnlinkChild(selectedStudentReg)}
              className="text-xs text-[#94a3b8] hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Unlink
            </button>
          </div>
        </div>

        {/* Timeline Events List */}
        <div className="space-y-3">
          {childTimeline.length === 0 ? (
            <div className="py-8 text-center text-[#94a3b8] text-xs">
              No recent timeline events recorded yet.
            </div>
          ) : (
            childTimeline.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0f1c18] border border-[#233a30] text-xs transition-colors hover:border-[#335645]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status === 'On task'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-white">{item.domain}</span>
                    <span className="text-[11px] text-[#94a3b8] block">Classroom Study Activity</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'On task'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-600/30'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[11px] text-[#64748b] font-mono">{item.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: Link Another Child */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16271f] border border-[#233a30] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center text-[#5cc79a]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Link Student Account</h3>
                <p className="text-xs text-[#94a3b8]">Enter student ID and 6-digit parent code</p>
              </div>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#94a3b8] font-semibold block mb-1">Student Registration ID</label>
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. STU-2026-4402"
                  className="w-full bg-[#0f1c18] border border-[#2a473b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5cc79a]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#94a3b8] font-semibold block mb-1">6-Digit Parent Link Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={parentCodeInput}
                  onChange={(e) => setParentCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 629143"
                  className="w-full bg-[#0f1c18] border border-[#2a473b] rounded-xl px-3 py-2 text-xs text-[#5cc79a] font-mono tracking-widest text-center focus:outline-none focus:border-[#5cc79a]"
                  required
                />
                <p className="text-[10px] text-[#64748b] mt-1">
                  Your student generates this 6-digit code in their Student Portal under "Parent Link Code".
                </p>
              </div>

              {linkError && (
                <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
                  {linkError}
                </div>
              )}

              {linkSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs">
                  {linkSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0f1c18] hover:bg-[#1a2e24] text-[#94a3b8] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#5cc79a] hover:bg-[#6ee4b3] text-[#0f1c18] font-bold text-xs cursor-pointer"
                >
                  Link Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
