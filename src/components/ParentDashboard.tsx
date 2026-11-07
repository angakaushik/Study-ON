import React, { useState } from 'react';
import {
  ParentProfile,
  AssignmentItem,
  AnnouncementItem,
  ComplaintItem,
  AttendanceRecord,
  StudentStudyActivityItem,
  EducationalWebsiteItem,
  NoteItem,
  LearningVideoItem,
  StudyModePolicy,
  ClassWatchStudent,
  ClassWatchTimelineEvent,
  ClassWatchAlert,
} from '../types.ts';
import { Logo } from './Logo.tsx';
import { ParentClassWatchTimeline } from './ParentClassWatchTimeline.tsx';
import {
  User,
  Users,
  GraduationCap,
  FileCheck2,
  Clock,
  Shield,
  Bell,
  MessageSquare,
  LogOut,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Calendar,
  Activity,
  Globe,
  BookOpen,
  Video,
  FileText,
  Award,
  XCircle,
  ExternalLink,
} from 'lucide-react';

interface ParentDashboardProps {
  profile: ParentProfile;
  assignments: AssignmentItem[];
  announcements: AnnouncementItem[];
  complaints: ComplaintItem[];
  attendance: AttendanceRecord[];
  studyActivities: StudentStudyActivityItem[];
  websites: EducationalWebsiteItem[];
  notes: NoteItem[];
  videos: LearningVideoItem[];
  policy: StudyModePolicy;
  studyMinutes: number;
  onSubmitComplaint: (newComplaint: ComplaintItem) => void;
  onLogout: () => void;
  // ClassWatch Integration Props
  classWatchStudents?: ClassWatchStudent[];
  classWatchTimeline?: ClassWatchTimelineEvent[];
  classWatchAlerts?: ClassWatchAlert[];
  onLinkChild?: (studentId: string, parentCode: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onUnlinkChild?: (studentRegNumber: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  assignments,
  announcements,
  complaints,
  attendance,
  studyActivities,
  websites,
  notes,
  videos,
  policy,
  studyMinutes,
  onSubmitComplaint,
  onLogout,
  classWatchStudents = [],
  classWatchTimeline = [],
  classWatchAlerts = [],
  onLinkChild = () => ({ success: true, message: 'Linked' }),
  onUnlinkChild = () => {},
}) => {
  type ParentTab =
    | 'overview'
    | 'classwatch'
    | 'attendance'
    | 'assignments'
    | 'resources'
    | 'activity'
    | 'announcements'
    | 'complaints';

  const [activeTab, setActiveTab] = useState<ParentTab>('overview');

  // Complaint submission form
  const [category, setCategory] = useState<
    'Academics' | 'Study Mode Policy' | 'Infrastructure' | 'Digital Notes' | 'Other'
  >('Academics');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const ward = profile.linkedChild;

  // Filter attendance for linked child
  const childAttendance = attendance.filter(
    (att) =>
      att.studentRegNumber.toLowerCase() === ward.regNumber.toLowerCase() ||
      att.studentName.toLowerCase() === ward.name.toLowerCase()
  );
  const totalClasses = childAttendance.length;
  const presentCount = childAttendance.filter((a) => a.status === 'Present').length;
  const lateCount = childAttendance.filter((a) => a.status === 'Late').length;
  const absentCount = childAttendance.filter((a) => a.status === 'Absent').length;
  const calculatedAttendanceRate =
    totalClasses > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalClasses) * 100) : ward.attendanceRate;

  // Filter study activity for linked child
  const childActivities = studyActivities.filter(
    (act) =>
      act.studentRegNumber.toLowerCase() === ward.regNumber.toLowerCase() ||
      act.studentName.toLowerCase() === ward.name.toLowerCase()
  );
  const totalMinutesSpent = childActivities.reduce(
    (acc, curr) => acc + (curr.durationMinutes || 0),
    0
  );

  // Filter complaints submitted by this parent
  const parentComplaints = complaints.filter(
    (c) => c.submitterRole === 'parent' || c.submittedBy === profile.name
  );

  // Filter announcements for parents (All or Parents audience)
  const parentAnnouncements = announcements.filter(
    (a) => a.audience === 'All' || a.audience === 'Parents'
  );
  const [dismissedNoticeId, setDismissedNoticeId] = useState<string | null>(null);
  const latestPrincipalNotice = parentAnnouncements.find(
    (a) => a.authorRole === 'Principal' && a.id !== dismissedNoticeId
  );

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newTicket: ComplaintItem = {
      id: `cmp-${Date.now()}`,
      ticketNumber: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      submittedBy: profile.name,
      submitterRole: 'parent',
      contactEmail: profile.email,
      category,
      subject: subject.trim(),
      description: description.trim(),
      submittedDate: 'Oct 19, 2026',
      status: 'Under Review',
      assignedTo: 'Academic Coordination Desk',
    };

    onSubmitComplaint(newTicket);
    setSubject('');
    setDescription('');
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-sky-50/50 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Logo size="sm" />
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight leading-none">
                StudyOn
              </div>
              <div className="text-[11px] font-medium text-sky-700 tracking-wide">
                Parent Portal · Linked to {ward.name}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('classwatch')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                activeTab === 'classwatch'
                  ? 'bg-[#16271f] text-[#5cc79a] border border-[#233a30] shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>ClassWatch Live</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Child Attendance ({calculatedAttendanceRate}%)</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'assignments'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Assignments & Marks</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'resources'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>Assigned Resources</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>Study Activity ({totalMinutesSpent}m)</span>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-sky-600" />
              <span>Notices</span>
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'complaints'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
              <span>Contact / Grievances</span>
            </button>
          </nav>

          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-900 leading-tight">{profile.name}</div>
              <div className="text-[10px] text-sky-700">Ward: {ward.name}</div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile secondary tab scroller */}
        <div className="flex xl:hidden overflow-x-auto gap-1 pt-2 pb-1 text-xs no-scrollbar">
          {(
            [
              'overview',
              'classwatch',
              'attendance',
              'assignments',
              'resources',
              'activity',
              'announcements',
              'complaints',
            ] as ParentTab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-lg shrink-0 capitalize cursor-pointer ${
                activeTab === tab
                  ? tab === 'classwatch'
                    ? 'bg-[#16271f] text-[#5cc79a] font-bold border border-[#233a30]'
                    : 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-600 bg-sky-50'
              }`}
            >
              {tab === 'classwatch' ? 'ClassWatch' : tab === 'assignments' ? 'Assignments' : tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Principal Alert Banner */}
        {latestPrincipalNotice && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Official Principal Notice
                </span>
                <h3 className="text-sm font-bold mt-0.5">{latestPrincipalNotice.title}</h3>
                <p className="text-xs text-sky-100 line-clamp-1">{latestPrincipalNotice.message}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('announcements')}
              className="px-3 py-1.5 rounded-xl bg-white text-sky-900 font-bold text-xs shrink-0 cursor-pointer"
            >
              Read
            </button>
          </div>
        )}

        {/* TAB: CLASSWATCH LIVE TIMELINE */}
        {activeTab === 'classwatch' && (
          <ParentClassWatchTimeline
            profile={profile}
            students={classWatchStudents}
            timeline={classWatchTimeline}
            alerts={classWatchAlerts}
            onLinkChild={onLinkChild}
            onUnlinkChild={onUnlinkChild}
          />
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Child Profile Card */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 font-bold text-xl flex items-center justify-center shrink-0 border border-sky-200">
                  {ward.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {ward.name}
                    </h1>
                    <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-lg border border-sky-200">
                      {ward.regNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {ward.course} · {ward.semester}
                  </p>
                  <p className="text-[11px] text-sky-700 font-medium">{ward.collegeName}</p>
                </div>
              </div>

              {/* Child Status Highlights */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div
                  onClick={() => setActiveTab('attendance')}
                  className="flex-1 md:flex-initial p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-left cursor-pointer hover:bg-sky-100 transition-colors"
                >
                  <div className="text-[10px] font-bold text-sky-700 uppercase">Attendance</div>
                  <div className="text-xl font-black text-sky-900 mt-0.5">{calculatedAttendanceRate}%</div>
                  <div className="text-[10px] text-sky-600">{presentCount} of {totalClasses} classes</div>
                </div>

                <div
                  onClick={() => setActiveTab('assignments')}
                  className="flex-1 md:flex-initial p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-left cursor-pointer hover:bg-sky-100 transition-colors"
                >
                  <div className="text-[10px] font-bold text-sky-700 uppercase">Academic GPA</div>
                  <div className="text-xl font-black text-sky-900 mt-0.5">{ward.gpa}</div>
                  <div className="text-[10px] text-sky-600">Excellent Standing</div>
                </div>

                <div
                  onClick={() => setActiveTab('activity')}
                  className="flex-1 md:flex-initial p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-left cursor-pointer hover:bg-sky-100 transition-colors"
                >
                  <div className="text-[10px] font-bold text-sky-700 uppercase">Study Time</div>
                  <div className="text-xl font-black text-sky-900 mt-0.5">{totalMinutesSpent}m</div>
                  <div className="text-[10px] text-sky-600">Active learning time</div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('attendance')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Child Attendance Records</h3>
                <p className="text-xs text-slate-600 mt-1">
                  View daily roll call, subject attendance, and verified attendance rates.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('assignments')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Assignments & Feedback</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Inspect assignments submitted by your child, marks scored, and teacher feedback.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('resources')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Assigned Educational Resources</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Browse digital notes, educational website links, and video lectures.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('activity')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Study Activity & Screen Time</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Monitor time spent on educational content and focus study sessions.
                </p>
              </div>
            </div>

            {/* Recent Study Activity Preview */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  {ward.name}&apos;s Recent Learning Stream
                </h3>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                >
                  View Full Stream
                </button>
              </div>

              <div className="space-y-3">
                {childActivities.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white text-sky-700 flex items-center justify-center shrink-0 border border-sky-200 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{act.activityTitle}</span>
                        <span className="text-slate-500 text-[11px]">{act.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHILD ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>{ward.name}&apos;s Attendance Records</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Real-time attendance entries recorded by faculty professors during class sessions.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center p-3 bg-sky-50 rounded-2xl border border-sky-200">
                  <div className="text-2xl font-black text-sky-900">{calculatedAttendanceRate}%</div>
                  <div className="text-[10px] font-bold text-sky-700 uppercase">Attendance Rate</div>
                </div>
                <div className="text-xs space-y-1 text-slate-600">
                  <div>Present: <strong className="text-slate-900">{presentCount}</strong></div>
                  <div>Late: <strong className="text-slate-900">{lateCount}</strong></div>
                  <div>Absent: <strong className="text-slate-900">{absentCount}</strong></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Date-wise Attendance Entries</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-sky-100 text-[10px] uppercase">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Subject</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Recorded By Faculty</th>
                      <th className="pb-3 font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {childAttendance.map((att) => (
                      <tr key={att.id} className="hover:bg-sky-50/50">
                        <td className="py-3 font-bold text-slate-900">{att.date}</td>
                        <td className="py-3 font-semibold text-slate-800">{att.subject}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              att.status === 'Present'
                                ? 'bg-sky-100 text-sky-900'
                                : att.status === 'Late'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">{att.recordedBy}</td>
                        <td className="py-3 text-slate-500 italic">{att.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ASSIGNMENTS, MARKS & TEACHER FEEDBACK */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-sky-600" />
                <span>Assignment Submissions, Marks & Teacher Feedback</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Inspect coursework submitted by your child, grades awarded, and personalized teacher guidance.
              </p>
            </div>

            <div className="space-y-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        {asg.subject}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{asg.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Assigned by {asg.teacherName} · Total: {asg.totalPoints} points
                      </p>
                    </div>

                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          asg.status === 'reviewed'
                            ? 'bg-sky-100 text-sky-900'
                            : asg.status === 'submitted'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {asg.status === 'reviewed'
                          ? 'Graded by Teacher'
                          : asg.status === 'submitted'
                          ? 'Submitted & Under Review'
                          : 'Pending Submission'}
                      </span>
                    </div>
                  </div>

                  {/* Submission and Feedback Details */}
                  {asg.submission && (
                    <div className="mt-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs">
                      <div className="flex items-center justify-between text-sky-900 font-bold mb-1">
                        <span>Child&apos;s Submitted Solution</span>
                        <span className="text-[11px] font-normal text-slate-500">{asg.submission.submittedAt}</span>
                      </div>
                      <p className="text-slate-700 italic leading-relaxed">
                        &quot;{asg.submission.textContent}&quot;
                      </p>

                      {asg.submission.grade && (
                        <div className="mt-3 pt-3 border-t border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm px-3 py-1 rounded-xl bg-sky-600 text-white">
                              Grade: {asg.submission.grade}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              Score: {asg.submission.pointsScored} / {asg.totalPoints}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-sky-200 text-xs text-slate-800">
                            <strong>Teacher Feedback:</strong> {asg.submission.teacherFeedback}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EDUCATIONAL RESOURCES ASSIGNED TO CHILD */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <span>Educational Resources Assigned to {ward.name}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Inspect the approved digital notes, curated academic websites, and study videos provided by the institution.
              </p>
            </div>

            {/* Websites */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Study Websites & Reference Portals</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {websites.map((site) => (
                  <div key={site.id} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                    <span className="text-[10px] font-bold text-sky-800 uppercase">{site.subject}</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{site.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{site.description}</p>
                    <div className="text-[10px] text-slate-500 mt-2">Added by: {site.addedBy}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Course Handouts & Digital Notes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                    <span className="text-[10px] font-bold text-sky-800 uppercase">{note.subject}</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{note.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1">{note.summary}</p>
                    <div className="text-[10px] text-slate-500 mt-2">Faculty: {note.facultyName} · {note.pagesCount} pages</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STUDY ACTIVITY & TIME SPENT */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-600" />
                  <span>{ward.name}&apos;s Study Activity & Time Spent</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Monitor safe, focused screen time spent reading notes, watching lecture videos, and engaging in Study Mode.
                </p>
              </div>

              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                <div className="text-2xl font-black text-sky-900">{totalMinutesSpent} mins</div>
                <div className="text-[10px] font-bold text-sky-700 uppercase">Productive Study Time</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Chronological Learning Footprint</h3>
              <div className="space-y-3">
                {childActivities.map((act) => (
                  <div key={act.id} className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-sky-700 flex items-center justify-center shrink-0 border border-sky-200 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{act.activityTitle}</span>
                        <span className="text-slate-500 text-[11px]">{act.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{act.details}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-sky-700 font-semibold">
                        <span>{act.subject}</span>
                        {act.durationMinutes && <span>• {act.durationMinutes} mins</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: NOTICES */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600" />
                <span>College Notices & Academic Announcements</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Official institutional communications directed to parents and guardians.
              </p>
            </div>

            <div className="space-y-4">
              {parentAnnouncements.map((anc) => (
                <div key={anc.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                      {anc.authorRole} Notice
                    </span>
                    <span className="text-[11px] text-slate-500">{anc.publishDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{anc.title}</h3>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">{anc.message}</p>
                  <div className="mt-4 pt-4 border-t border-sky-50 text-[11px] text-slate-500">
                    Published by: {anc.author} · {anc.department}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: CONTACT / GRIEVANCES DESK */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                <span>Contact College & Grievance Desk</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Submit academic inquiries or grievances to the Principal and Academic Coordinator. Track status in real-time.
              </p>

              {formSubmitted && (
                <div className="mt-4 p-4 rounded-2xl bg-sky-600 text-white font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your inquiry has been submitted and assigned ticket tracking!</span>
                </div>
              )}

              <form onSubmit={handleComplaintSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    >
                      <option value="Academics">Academics & Examination</option>
                      <option value="Study Mode Policy">Study Mode Policy</option>
                      <option value="Infrastructure">Infrastructure & Facilities</option>
                      <option value="Digital Notes">Digital Notes & Resources</option>
                      <option value="Other">Other Administrative Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Question regarding semester examination schedule"
                      className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Detailed Message
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about your query..."
                    className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Past Inquiries */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">My Submitted Inquiries & Status</h3>
              <div className="space-y-4">
                {parentComplaints.map((cmp) => (
                  <div key={cmp.id} className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-sky-900">{cmp.ticketNumber} · {cmp.category}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        {cmp.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{cmp.subject}</h4>
                    <p className="text-xs text-slate-600 mt-1">{cmp.description}</p>
                    {cmp.resolutionNote && (
                      <div className="mt-3 p-3 rounded-xl bg-white border border-sky-200 text-xs text-slate-800">
                        <strong>Official Resolution:</strong> {cmp.resolutionNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
