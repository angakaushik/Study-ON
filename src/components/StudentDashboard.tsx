import React, { useState } from 'react';
import {
  StudentProfile,
  NoteItem,
  AssignmentItem,
  LearningVideoItem,
  EducationalWebsiteItem,
  AnnouncementItem,
  AttendanceRecord,
  StudentStudyActivityItem,
  StudyModePolicy,
  SearchResultItem,
  ResourceRestrictionRule,
  AccessControlPolicyConfig,
  ClassWatchClass,
  ClassWatchStudent,
} from '../types.ts';
import { evaluateResourceAccess } from '../utils/accessControl.ts';
import { RestrictedResourceModal } from './RestrictedResourceModal.tsx';
import { WebsitePortalModal } from './WebsitePortalModal.tsx';
import { StudentTabSimulator } from './StudentTabSimulator.tsx';
import { Logo } from './Logo.tsx';
import {
  BookOpen,
  FileCheck2,
  Search,
  Video,
  Bell,
  Shield,
  Clock,
  Leaf,
  User,
  LogOut,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Send,
  Upload,
  Calendar,
  Sparkles,
  Layers,
  ChevronRight,
  Settings,
  Filter,
  Globe,
  ExternalLink,
  Youtube,
  GraduationCap,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  FileText,
  Lock,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface StudentDashboardProps {
  profile: StudentProfile;
  notes: NoteItem[];
  assignments: AssignmentItem[];
  videos: LearningVideoItem[];
  websites: EducationalWebsiteItem[];
  announcements: AnnouncementItem[];
  attendance: AttendanceRecord[];
  studyActivities: StudentStudyActivityItem[];
  restrictions?: ResourceRestrictionRule[];
  policy: StudyModePolicy;
  policyConfig?: AccessControlPolicyConfig;
  searchIndex: SearchResultItem[];
  isStudyModeActive: boolean;
  studyMinutes: number;
  notesReadCount: number;
  currentActiveResource?: {
    type: 'website' | 'video' | 'note' | 'assignment' | 'study_mode';
    title: string;
    urlOrSubject: string;
    startedAt: string;
  };
  onOpenStudyModePreview: () => void;
  onOpenNoteReader: (note: NoteItem) => void;
  onOpenVideo: (video: LearningVideoItem) => void;
  onOpenWebsite: (website: EducationalWebsiteItem) => void;
  onOpenPaperSavedModal: () => void;
  onAttemptBlockedResource?: (
    resourceTitle: string,
    resourceType: string,
    violatingRule?: ResourceRestrictionRule,
    reason?: string
  ) => void;
  onRequestAccess?: (resourceTitle: string, resourceType: string, reason: string) => void;
  onSubmitAssignment: (assignmentId: string, text: string, fileName?: string) => void;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onLogout: () => void;
  // ClassWatch Integration Props
  classWatchClasses?: ClassWatchClass[];
  classWatchStudentState?: ClassWatchStudent;
  soundEnabled?: boolean;
  onJoinClassWatch?: (code: string) => { success: boolean; message: string };
  onLeaveClassWatch?: () => void;
  onReportDomain?: (domain: string) => void;
  onRegenerateParentCode?: () => void;
  onDismissWarning?: () => void;
  onOpenExtensionModal?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  notes,
  assignments,
  videos,
  websites,
  announcements,
  attendance,
  studyActivities,
  restrictions = [],
  policy,
  policyConfig,
  searchIndex,
  isStudyModeActive,
  studyMinutes,
  notesReadCount,
  currentActiveResource,
  onOpenStudyModePreview,
  onOpenNoteReader,
  onOpenVideo,
  onOpenWebsite,
  onOpenPaperSavedModal,
  onAttemptBlockedResource,
  onRequestAccess,
  onSubmitAssignment,
  onUpdateProfile,
  onLogout,
  classWatchClasses = [],
  classWatchStudentState,
  soundEnabled = true,
  onJoinClassWatch = () => ({ success: true, message: 'Joined' }),
  onLeaveClassWatch = () => {},
  onReportDomain = () => {},
  onRegenerateParentCode = () => {},
  onDismissWarning = () => {},
  onOpenExtensionModal = () => {},
}) => {
  type StudentTab =
    | 'overview'
    | 'classwatch'
    | 'websites'
    | 'notes'
    | 'videos'
    | 'assignments'
    | 'attendance'
    | 'activity'
    | 'search'
    | 'announcements'
    | 'profile';

  const [activeTab, setActiveTab] = useState<StudentTab>('overview');

  // Subjects extracted across resources
  const allSubjects = [
    'All',
    ...Array.from(
      new Set([
        ...notes.map((n) => n.subject),
        ...videos.map((v) => v.subject),
        ...websites.map((w) => w.subject),
      ])
    ),
  ];

  // Notes filtering & searching
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedNoteSubject, setSelectedNoteSubject] = useState('All');

  // Websites filtering & searching
  const [websiteSearch, setWebsiteSearch] = useState('');
  const [selectedWebsiteSubject, setSelectedWebsiteSubject] = useState('All');

  // Videos filtering
  const [videoFilterCategory, setVideoFilterCategory] = useState<'All' | 'Teacher' | 'Principal' | 'YouTube'>('All');
  const [selectedVideoSubject, setSelectedVideoSubject] = useState('All');

  // Assignments filter
  const [assignmentTab, setAssignmentTab] = useState<'pending' | 'submitted' | 'reviewed'>('pending');

  // Educational search state
  const [eduSearchQuery, setEduSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Assignment submission modal state
  const [submittingAssignment, setSubmittingAssignment] = useState<AssignmentItem | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [simulatedFile, setSimulatedFile] = useState<string | null>(null);

  // Profile edit dialog state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);

  // Website Portal in-app viewer modal state
  const [activeViewingWebsite, setActiveViewingWebsite] = useState<EducationalWebsiteItem | null>(null);

  // Privacy & Transparency disclosure modal state
  const [showPrivacyNoticeModal, setShowPrivacyNoticeModal] = useState(false);

  // Restricted Resource Modal State
  const [restrictedModalData, setRestrictedModalData] = useState<{
    isOpen: boolean;
    resourceTitle: string;
    resourceType: string;
    resourceCategory?: string;
    violatingRule?: ResourceRestrictionRule;
    fallbackReason?: string;
    priorityLevel?: number;
    decidedByRole?: string;
  }>({
    isOpen: false,
    resourceTitle: '',
    resourceType: '',
  });

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSubject = selectedNoteSubject === 'All' || note.subject === selectedNoteSubject;
    const matchesSearch =
      note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      note.subject.toLowerCase().includes(noteSearch.toLowerCase()) ||
      note.facultyName.toLowerCase().includes(noteSearch.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Filter websites
  const filteredWebsites = websites.filter((site) => {
    const matchesSubject = selectedWebsiteSubject === 'All' || site.subject === selectedWebsiteSubject;
    const matchesSearch =
      site.title.toLowerCase().includes(websiteSearch.toLowerCase()) ||
      site.subject.toLowerCase().includes(websiteSearch.toLowerCase()) ||
      site.category.toLowerCase().includes(websiteSearch.toLowerCase()) ||
      site.description.toLowerCase().includes(websiteSearch.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Filter videos
  const filteredVideos = videos.filter((vid) => {
    const matchesSubject = selectedVideoSubject === 'All' || vid.subject === selectedVideoSubject;
    let matchesCategory = true;
    if (videoFilterCategory === 'Teacher') {
      matchesCategory = vid.addedByRole === 'Teacher' && !vid.isYouTube;
    } else if (videoFilterCategory === 'Principal') {
      matchesCategory = vid.addedByRole === 'Principal';
    } else if (videoFilterCategory === 'YouTube') {
      matchesCategory = !!vid.isYouTube;
    }
    return matchesSubject && matchesCategory;
  });

  // Intercept Note Opening with Access Control
  const handleOpenNote = (note: NoteItem) => {
    const evalResult = evaluateResourceAccess({
      studentRegNumber: profile.regNumber,
      resourceId: note.id,
      resourceTitle: note.title,
      resourceType: 'note',
      resourceCategory: note.subject,
      restrictions,
      policyConfig,
    });

    if (!evalResult.isAllowed) {
      setRestrictedModalData({
        isOpen: true,
        resourceTitle: note.title,
        resourceType: 'Digital Course Note',
        resourceCategory: note.subject,
        violatingRule: evalResult.violatingRule,
        fallbackReason: evalResult.reason,
        priorityLevel: evalResult.priorityLevel,
        decidedByRole: evalResult.decidedByRole,
      });
      onAttemptBlockedResource?.(note.title, 'note', evalResult.violatingRule, evalResult.reason);
      return;
    }

    onOpenNoteReader(note);
  };

  // Intercept Video Opening with Access Control
  const handleOpenVideo = (video: LearningVideoItem) => {
    const evalResult = evaluateResourceAccess({
      studentRegNumber: profile.regNumber,
      resourceId: video.id,
      resourceTitle: video.title,
      resourceType: 'video',
      resourceCategory: video.subject,
      restrictions,
      policyConfig,
    });

    if (!evalResult.isAllowed) {
      setRestrictedModalData({
        isOpen: true,
        resourceTitle: video.title,
        resourceType: video.isYouTube ? 'Educational YouTube Video' : 'Lecture Video',
        resourceCategory: video.subject,
        violatingRule: evalResult.violatingRule,
        fallbackReason: evalResult.reason,
        priorityLevel: evalResult.priorityLevel,
        decidedByRole: evalResult.decidedByRole,
      });
      onAttemptBlockedResource?.(video.title, 'video', evalResult.violatingRule, evalResult.reason);
      return;
    }

    onOpenVideo(video);
  };

  // Intercept Website Opening with Access Control
  const handleOpenWebsite = (site: EducationalWebsiteItem) => {
    const evalResult = evaluateResourceAccess({
      studentRegNumber: profile.regNumber,
      resourceId: site.id,
      resourceTitle: site.title,
      resourceType: 'website',
      resourceCategory: site.category,
      restrictions,
      policyConfig,
    });

    if (!evalResult.isAllowed) {
      setRestrictedModalData({
        isOpen: true,
        resourceTitle: site.title,
        resourceType: 'Study Website Portal',
        resourceCategory: site.category,
        violatingRule: evalResult.violatingRule,
        fallbackReason: evalResult.reason,
        priorityLevel: evalResult.priorityLevel,
        decidedByRole: evalResult.decidedByRole,
      });
      onAttemptBlockedResource?.(site.title, 'website', evalResult.violatingRule, evalResult.reason);
      return;
    }

    // Open in-app portal modal and notify parent handler
    setActiveViewingWebsite(site);
    onOpenWebsite(site);
  };

  // Attendance metrics for this student
  const studentAttendanceRecords = attendance.filter(
    (att) =>
      att.studentRegNumber.toLowerCase() === profile.regNumber.toLowerCase() ||
      att.studentName.toLowerCase() === profile.name.toLowerCase()
  );
  const totalClasses = studentAttendanceRecords.length;
  const presentCount = studentAttendanceRecords.filter((a) => a.status === 'Present').length;
  const lateCount = studentAttendanceRecords.filter((a) => a.status === 'Late').length;
  const absentCount = studentAttendanceRecords.filter((a) => a.status === 'Absent').length;
  const calculatedAttendanceRate =
    totalClasses > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalClasses) * 100) : profile.attendanceRate;

  // Filtered educational topics
  const searchResults = searchIndex.filter((item) => {
    if (!eduSearchQuery.trim()) return false;
    const q = eduSearchQuery.toLowerCase();
    return (
      item.topic.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q)
    );
  });

  const handleAssignmentSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !submissionText.trim()) return;
    onSubmitAssignment(
      submittingAssignment.id,
      submissionText,
      simulatedFile || `${profile.name.toLowerCase().replace(/\s+/g, '_')}_solution.pdf`
    );
    setSubmittingAssignment(null);
    setSubmissionText('');
    setSimulatedFile(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ email: editEmail, phone: editPhone });
    setShowEditProfile(false);
  };

  // Metrics
  const pendingAssignmentsCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedAssignmentsCount = assignments.filter((a) => a.status === 'submitted').length;
  const reviewedAssignmentsCount = assignments.filter((a) => a.status === 'reviewed').length;
  const estimatedPagesSaved =
    82 + notesReadCount * 14 + (submittedAssignmentsCount + reviewedAssignmentsCount) * 5 + Math.round((studyMinutes / 45) * 6);

  // Filter announcements for students (All or Students audience)
  const studentAnnouncements = announcements.filter(
    (a) => a.audience === 'All' || a.audience === 'Students'
  );
  const [dismissedNoticeId, setDismissedNoticeId] = useState<string | null>(null);
  const latestPrincipalNotice = studentAnnouncements.find(
    (a) => a.authorRole === 'Principal' && a.id !== dismissedNoticeId
  );

  return (
    <div className="min-h-screen bg-sky-50/50 pb-16">
      {/* Top Navigation Bar: Single row, clean zone layout */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand lockup with circular logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Logo size="sm" />
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight leading-none">
                StudyOn
              </div>
              <div className="text-[11px] font-medium text-sky-700 tracking-wide">
                Student Educator
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('classwatch')}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-bold ${
                activeTab === 'classwatch'
                  ? 'bg-[#16271f] text-[#5cc79a] border border-[#233a30] shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>ClassWatch Companion</span>
              {classWatchStudentState && !classWatchStudentState.isRemoved && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('websites')}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'websites'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Study Websites</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>Digital Notes</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-sky-600" />
              <span>Study Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'assignments'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Assignments</span>
              {pendingAssignmentsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-600 text-white font-bold">
                  {pendingAssignmentsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Attendance ({calculatedAttendanceRate}%)</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>My Activity</span>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notices</span>
              {studentAnnouncements.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-600 text-white font-bold">
                  {studentAnnouncements.length}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions - Study Mode trigger & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Study Mode Button */}
            <button
              onClick={onOpenStudyModePreview}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                isStudyModeActive
                  ? 'bg-sky-600 text-white ring-2 ring-sky-300'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
              title="Activate or view Study Mode"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isStudyModeActive ? 'Study Mode Active' : 'Study Mode'}
              </span>
            </button>

            {/* Profile trigger */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sky-50 border border-sky-200 transition-colors cursor-pointer"
              title="View Student Profile"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {profile.name.split(' ')[0]}
              </span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile secondary tab scroller */}
        <div className="flex lg:hidden overflow-x-auto gap-1 pt-2 pb-1 text-xs no-scrollbar">
          {(
            [
              'overview',
              'classwatch',
              'websites',
              'notes',
              'videos',
              'assignments',
              'attendance',
              'activity',
              'search',
              'announcements',
              'profile',
            ] as StudentTab[]
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
              {tab === 'classwatch'
                ? 'ClassWatch'
                : tab === 'websites'
                ? 'Websites'
                : tab === 'activity'
                ? 'Activity'
                : tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Live Active Resource Banner (if currently studying an item) */}
        {currentActiveResource && (
          <div className="p-3.5 rounded-2xl bg-sky-100 border border-sky-300/80 text-sky-950 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600"></span>
              </span>
              <div className="text-xs">
                <span className="font-bold">Active Educational Session: </span>
                <span>{currentActiveResource.title}</span>
                <span className="text-[11px] text-sky-700 ml-2">({currentActiveResource.urlOrSubject})</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-sky-800 bg-white px-2 py-0.5 rounded-lg border border-sky-200">
              Live Monitoring Active
            </span>
          </div>
        )}

        {/* Principal Announcement Alert Banner (Clear Notification) */}
        {latestPrincipalNotice && activeTab === 'overview' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md shadow-sky-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-sky-400/30">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 text-white px-2.5 py-0.5 rounded-full border border-white/30">
                    Official Notice from Principal
                  </span>
                  {latestPrincipalNotice.isImportant && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-900 text-sky-100 px-2 py-0.5 rounded-full">
                      High Priority
                    </span>
                  )}
                  <span className="text-[11px] text-sky-100">{latestPrincipalNotice.publishDate}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {latestPrincipalNotice.title}
                </h3>
                <p className="text-xs text-sky-100 mt-1 line-clamp-2 leading-relaxed">
                  {latestPrincipalNotice.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setActiveTab('announcements')}
                className="px-3.5 py-2 rounded-xl bg-white text-sky-900 font-bold text-xs hover:bg-sky-50 transition-colors shadow-sm cursor-pointer"
              >
                Read All Notices
              </button>
              <button
                onClick={() => setDismissedNoticeId(latestPrincipalNotice.id)}
                className="p-2 rounded-xl text-sky-100 hover:bg-white/10 transition-colors text-xs font-medium cursor-pointer"
                title="Dismiss"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* TAB: CLASSWATCH COMPANION & TAB SIMULATOR */}
        {activeTab === 'classwatch' && (
          <StudentTabSimulator
            profile={profile}
            classes={classWatchClasses}
            currentStudentState={classWatchStudentState}
            soundEnabled={soundEnabled}
            onJoinClass={onJoinClassWatch}
            onLeaveClass={onLeaveClassWatch}
            onReportDomain={onReportDomain}
            onRegenerateParentCode={onRegenerateParentCode}
            onDismissWarning={onDismissWarning}
          />
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Student Welcome & Profile Summary Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 font-bold text-xl flex items-center justify-center shrink-0 border border-sky-200">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Welcome, {profile.name}
                    </h1>
                    <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-lg border border-sky-200">
                      {profile.regNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {profile.course} · {profile.semester} · {profile.section} (Roll #{profile.rollNo})
                  </p>
                  <p className="text-[11px] text-sky-700 font-medium mt-0.5">
                    {profile.collegeName}
                  </p>
                </div>
              </div>

              {/* Quick Attendance & Paper Saved KPI badges */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="flex-1 md:flex-initial p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors text-left cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-600" />
                    <span>Attendance</span>
                  </div>
                  <div className="text-lg font-extrabold text-sky-900 mt-0.5">
                    {calculatedAttendanceRate}%
                  </div>
                  <div className="text-[10px] text-sky-600">
                    {presentCount} attended / {totalClasses} classes
                  </div>
                </button>

                <button
                  onClick={onOpenPaperSavedModal}
                  className="flex-1 md:flex-initial p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors text-left cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-sky-600" />
                    <span>Paper Saved</span>
                  </div>
                  <div className="text-lg font-extrabold text-sky-900 mt-0.5">
                    ~{estimatedPagesSaved} Pages
                  </div>
                  <div className="text-[10px] text-sky-600">View eco calculation</div>
                </button>
              </div>
            </div>

            {/* Quick Navigation Cards: 4 Main Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('websites')}
                className="bg-white rounded-3xl p-5 border border-sky-100 hover:border-sky-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Study Websites & Portals</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    Access verified educational documentation, coding sandboxes, and academic portals.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-sky-700 pt-3 border-t border-sky-50">
                  <span>{websites.length} Curated Websites</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('notes')}
                className="bg-white rounded-3xl p-5 border border-sky-100 hover:border-sky-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Digital Notes</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    Browse and read subject lecture notes with in-app PDF reader and chapter navigation.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-sky-700 pt-3 border-t border-sky-50">
                  <span>{notes.length} PDF Handouts</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('videos')}
                className="bg-white rounded-3xl p-5 border border-sky-100 hover:border-sky-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Educational Videos & Playlists</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    Watch lectures uploaded by teachers, principal keynotes, and YouTube study playlists.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-sky-700 pt-3 border-t border-sky-50">
                  <span>{videos.length} Video Lectures</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('assignments')}
                className="bg-white rounded-3xl p-5 border border-sky-100 hover:border-sky-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Assignments & Marks</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    Submit assignments, track evaluation status, and view marks and feedback.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-sky-700 pt-3 border-t border-sky-50">
                  <span>
                    {pendingAssignmentsCount} Due · {reviewedAssignmentsCount} Graded
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Privacy & Transparency Notice Banner */}
            <div className="p-4 rounded-3xl bg-white border border-sky-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Educational Transparency Policy: </span>
                  Study activity within StudyOn is recorded for your professors and parents to guide academic progress. External device apps and private files are never accessed.
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyNoticeModal(true)}
                className="text-xs font-bold text-sky-700 hover:underline shrink-0 cursor-pointer"
              >
                Learn More
              </button>
            </div>

            {/* Quick Grid: Recent Learning Activity & Pending Assignments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Personal Study Activity */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-600" />
                    <h2 className="text-sm font-bold text-slate-900">Recent Learning Activity</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                  >
                    View All ({studyActivities.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {studyActivities.slice(0, 4).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white text-sky-700 flex items-center justify-center shrink-0 border border-sky-200 mt-0.5">
                        {act.activityType === 'video_watched' && <Video className="w-4 h-4" />}
                        {act.activityType === 'website_opened' && <Globe className="w-4 h-4" />}
                        {act.activityType === 'study_material_accessed' && <BookOpen className="w-4 h-4" />}
                        {act.activityType === 'assignment_submitted' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                        {act.activityType === 'study_mode_session' && <Shield className="w-4 h-4" />}
                        {act.activityType === 'assignment_viewed' && <FileCheck2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {act.activityTitle}
                          </div>
                          {act.accessStatus === 'Blocked' ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Blocked
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                              Allowed
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                          {act.details}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-sky-700 font-medium">
                          <span>{act.subject}</span>
                          <span>•</span>
                          <span>{act.timestamp}</span>
                          {act.durationMinutes && (
                            <>
                              <span>•</span>
                              <span>{act.durationMinutes} mins</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Assignments & Next Deadlines */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    <h2 className="text-sm font-bold text-slate-900">Upcoming Assignments</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {assignments
                    .filter((a) => a.status === 'pending')
                    .map((asg) => (
                      <div
                        key={asg.id}
                        className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                            {asg.subject}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">
                            {asg.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                            <Clock className="w-3 h-3 text-sky-600" />
                            <span>Due: {asg.dueDate}</span>
                            <span>•</span>
                            <span>{asg.totalPoints} pts</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSubmittingAssignment(asg);
                            setActiveTab('assignments');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                        >
                          Submit Now
                        </button>
                      </div>
                    ))}

                  {assignments.filter((a) => a.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500">
                      <CheckCircle2 className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                      All assignments have been submitted. Great job!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDY WEBSITES & EDUCATIONAL RESOURCES */}
        {activeTab === 'websites' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-600" />
                    <span>Study-Related Websites & Educational Resources</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Faculty-verified portals, academic libraries, official language references, and interactive coding environments.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={websiteSearch}
                    onChange={(e) => setWebsiteSearch(e.target.value)}
                    placeholder="Search resources..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-sky-50/80 border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Subject Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 no-scrollbar">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Subject:</span>
                {allSubjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedWebsiteSubject(sub)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedWebsiteSubject === sub
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Websites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWebsites.map((site) => (
                <div
                  key={site.id}
                  className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                        {site.subject}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {site.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {site.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                      {site.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-50">
                    <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between">
                      <span>Shared by {site.addedBy} ({site.addedByRole})</span>
                      <span>{site.addedDate}</span>
                    </div>

                    <button
                      onClick={() => handleOpenWebsite(site)}
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Educational Portal</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredWebsites.length === 0 && (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-sky-100">
                  <Globe className="w-10 h-10 text-sky-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No websites match your filter</h4>
                  <p className="text-xs text-slate-500 mt-1">Try switching to &quot;All&quot; subjects or clearing your search query.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-600" />
                    <span>Digital Course Notes</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Browse lecture notes by subject, read directly in the in-app reader, and conserve paper.
                  </p>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    placeholder="Search notes title or topic..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-sky-50/80 border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Subject Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 no-scrollbar">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Subject:</span>
                {allSubjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedNoteSubject(sub)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedNoteSubject === sub
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                        {note.subject}
                      </span>
                      <span className="text-[11px] text-slate-500">{note.pagesCount} pages · {note.fileSize}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {note.summary}
                    </p>

                    {/* Chapter Snippet preview */}
                    <div className="mt-3 p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-[11px] text-slate-700 space-y-1">
                      {note.contentSnippet.slice(0, 2).map((ch, idx) => (
                        <div key={idx} className="line-clamp-1">
                          • {ch}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-50 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-500">
                      <div>Faculty: {note.facultyName}</div>
                      <div>Uploaded: {note.uploadDate}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenNote(note)}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read Note</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EDUCATIONAL VIDEOS & PLAYLISTS */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-sky-600" />
                    <span>Educational Videos & Study Playlists</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Stream lecture recordings from your professors, principal masterclasses, and curated educational YouTube playlists.
                  </p>
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 bg-sky-50 p-1 rounded-2xl border border-sky-200">
                  {(['All', 'Teacher', 'Principal', 'YouTube'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setVideoFilterCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        videoFilterCategory === cat
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-sky-800'
                      }`}
                    >
                      {cat === 'All' ? 'All Videos' : cat === 'Teacher' ? 'Teacher Uploads' : cat === 'Principal' ? 'Principal' : 'YouTube Playlists'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject filter */}
              <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 no-scrollbar">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Subject:</span>
                {allSubjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedVideoSubject(sub)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedVideoSubject === sub
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-3xl overflow-hidden border border-sky-100 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all group"
                >
                  <div>
                    {/* Simulated Video Thumbnail Preview */}
                    <div
                      onClick={() => handleOpenVideo(video)}
                      className="h-40 bg-gradient-to-br from-sky-800 to-slate-900 relative flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 text-sky-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs px-2 py-0.5 rounded-md">
                          {video.subject}
                        </span>
                        {video.isYouTube && (
                          <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Youtube className="w-3 h-3" />
                            YouTube
                          </span>
                        )}
                        {video.addedByRole === 'Principal' && (
                          <span className="text-[10px] font-bold bg-sky-900 text-sky-100 px-2 py-0.5 rounded-md">
                            Principal
                          </span>
                        )}
                      </div>

                      {/* Bottom Duration Badge */}
                      <div className="absolute bottom-3 right-3 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-md">
                        {video.duration}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5">
                      {video.playlistTitle && (
                        <div className="text-[11px] font-semibold text-sky-700 mb-1 flex items-center gap-1 truncate">
                          <Layers className="w-3.5 h-3.5 shrink-0" />
                          <span>{video.playlistTitle}</span>
                        </div>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {video.description}
                      </p>

                      <div className="mt-3 text-[11px] text-slate-500">
                        Instructor / Creator: <span className="font-semibold text-slate-800">{video.teacherName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleOpenVideo(video)}
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Lecture</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ASSIGNMENTS, SUBMISSIONS, MARKS & FEEDBACK */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-sky-600" />
                    <span>Assignments, Submissions & Marks</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Submit assignments, track submission dates, and view grades and detailed teacher feedback.
                  </p>
                </div>

                {/* Sub tabs */}
                <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-2xl border border-sky-200">
                  <button
                    onClick={() => setAssignmentTab('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      assignmentTab === 'pending'
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-sky-800'
                    }`}
                  >
                    Pending ({pendingAssignmentsCount})
                  </button>
                  <button
                    onClick={() => setAssignmentTab('submitted')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      assignmentTab === 'submitted'
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-sky-800'
                    }`}
                  >
                    Submitted ({submittedAssignmentsCount})
                  </button>
                  <button
                    onClick={() => setAssignmentTab('reviewed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      assignmentTab === 'reviewed'
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-sky-800'
                    }`}
                  >
                    Marks & Feedback ({reviewedAssignmentsCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
              {assignments
                .filter((asg) => asg.status === assignmentTab)
                .map((asg) => (
                  <div
                    key={asg.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                          {asg.subject}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Faculty: {asg.teacherName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Max Points: {asg.totalPoints}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {asg.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {asg.instructions}
                      </p>

                      {/* If Submitted or Graded, show submission details */}
                      {asg.submission && (
                        <div className="mt-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 text-xs">
                          <div className="font-bold text-sky-900 mb-1 flex items-center justify-between">
                            <span>Your Submission Details</span>
                            <span className="text-[11px] font-normal text-slate-500">{asg.submission.submittedAt}</span>
                          </div>
                          {asg.submission.fileName && (
                            <div className="text-[11px] text-slate-700 flex items-center gap-1.5 font-medium mb-1">
                              <FileText className="w-3.5 h-3.5 text-sky-600" />
                              <span>{asg.submission.fileName}</span>
                            </div>
                          )}
                          <p className="text-slate-700 italic mt-1 line-clamp-3">
                            &quot;{asg.submission.textContent}&quot;
                          </p>

                          {/* Marks & Teacher Feedback Card */}
                          {asg.submission.grade && (
                            <div className="mt-3 pt-3 border-t border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-sm shadow-2xs">
                                  Grade: {asg.submission.grade}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">
                                    Score: {asg.submission.pointsScored} / {asg.totalPoints}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    Awarded by {asg.teacherName}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-2.5 rounded-xl border border-sky-200 text-xs text-slate-800 max-w-md">
                                <div className="text-[10px] font-bold text-sky-700 uppercase">Teacher Feedback</div>
                                <p className="mt-0.5">{asg.submission.teacherFeedback}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                      {asg.status === 'pending' && (
                        <button
                          onClick={() => setSubmittingAssignment(asg)}
                          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Assignment</span>
                        </button>
                      )}
                      {asg.status === 'submitted' && (
                        <div className="px-4 py-2 rounded-xl bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-sky-600" />
                          <span>Submitted · Awaiting Review</span>
                        </div>
                      )}
                      {asg.status === 'reviewed' && (
                        <div className="px-4 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-sky-600" />
                          <span>Evaluated & Graded</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {assignments.filter((asg) => asg.status === assignmentTab).length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center border border-sky-100">
                  <FileCheck2 className="w-10 h-10 text-sky-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No {assignmentTab} assignments</h4>
                  <p className="text-xs text-slate-500 mt-1">Check the other assignment tabs for current activity.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: ATTENDANCE RECORDS */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Attendance Overview Card */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    <span>My Attendance Records</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Official attendance records verified by faculty and administrative registrar. Minimum 75% required for examination eligibility.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-sky-50 rounded-2xl border border-sky-200">
                    <div className="text-2xl font-black text-sky-900">{calculatedAttendanceRate}%</div>
                    <div className="text-[10px] font-bold text-sky-700 uppercase">Overall Rate</div>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600" />
                      <span>Present: {presentCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Late: {lateCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Absent: {absentCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Ledger Table */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Date-wise Attendance History</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-sky-100 text-slate-500 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Subject</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Recorded By</th>
                      <th className="pb-3 font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {studentAttendanceRecords.map((att) => (
                      <tr key={att.id} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-900">{att.date}</td>
                        <td className="py-3 font-medium text-slate-800">{att.subject}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              att.status === 'Present'
                                ? 'bg-sky-100 text-sky-900'
                                : att.status === 'Late'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {att.status === 'Present' && <CheckCircle2 className="w-3 h-3" />}
                            {att.status === 'Late' && <Clock className="w-3 h-3" />}
                            {att.status === 'Absent' && <XCircle className="w-3 h-3" />}
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

        {/* TAB 7: PERSONAL STUDY ACTIVITY TIMELINE */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-600" />
                    <span>My Learning & Study Activity</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Your personal learning footprint in StudyOn, including notes read, videos watched, websites visited, and focus sessions.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                    <div className="text-lg font-bold text-sky-900">{studyMinutes} mins</div>
                    <div className="text-[10px] text-sky-700 font-semibold uppercase">Study Mode Time</div>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                    <div className="text-lg font-bold text-sky-900">{notesReadCount}</div>
                    <div className="text-[10px] text-sky-700 font-semibold uppercase">Notes Read</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-900">Complete Learning Activity Stream</h3>
                <span className="text-[11px] text-slate-500">
                  Updates continuously with every learning event
                </span>
              </div>

              <div className="space-y-4">
                {studyActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-sky-50/50 border border-sky-100 hover:border-sky-200 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white text-sky-700 flex items-center justify-center shrink-0 border border-sky-200 shadow-2xs mt-0.5">
                      {act.activityType === 'video_watched' && <Video className="w-5 h-5" />}
                      {act.activityType === 'website_opened' && <Globe className="w-5 h-5" />}
                      {act.activityType === 'study_material_accessed' && <BookOpen className="w-5 h-5" />}
                      {act.activityType === 'assignment_submitted' && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
                      {act.activityType === 'study_mode_session' && <Shield className="w-5 h-5" />}
                      {act.activityType === 'assignment_viewed' && <FileCheck2 className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{act.activityTitle}</span>
                        <div className="flex items-center gap-2">
                          {act.accessStatus === 'Blocked' ? (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                              Blocked Attempt
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                              Allowed Session
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">{act.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.details}</p>
                      {act.blockedReason && (
                        <div className="mt-1 text-[11px] text-rose-700 font-medium">
                          Reason: {act.blockedReason}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-sky-700">
                        <span className="bg-sky-100 px-2 py-0.5 rounded-md">{act.subject}</span>
                        {act.durationMinutes && (
                          <span className="bg-sky-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {act.durationMinutes} minutes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: CURRICULUM SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-600" />
                <span>Curriculum Knowledge Search</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Search verified syllabus topics and definitions indexed directly from course materials.
              </p>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={eduSearchQuery}
                  onChange={(e) => {
                    setEduSearchQuery(e.target.value);
                    setHasSearched(true);
                  }}
                  placeholder="e.g. AVL Tree, BCNF, TCP slow start..."
                  className="flex-1 text-xs px-4 py-3 rounded-2xl bg-sky-50/70 border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>
            </div>

            {hasSearched && (
              <div className="space-y-4">
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                        {res.subject}
                      </span>
                      <span className="text-[11px] text-slate-500">{res.curriculumModule}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{res.topic}</h3>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed bg-sky-50/60 p-3.5 rounded-2xl border border-sky-100">
                      {res.definition}
                    </p>

                    <div className="mt-4 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Key Concepts:</div>
                      {res.keyPoints.map((pt, i) => (
                        <div key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-sky-600 font-bold">•</span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600" />
                <span>Notices & Announcements</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Official notices broadcast by the Principal, department heads, and faculty instructors.
              </p>
            </div>

            <div className="space-y-4">
              {studentAnnouncements.map((anc) => (
                <div
                  key={anc.id}
                  className={`bg-white rounded-3xl p-6 border shadow-sm ${
                    anc.isImportant ? 'border-sky-300 ring-2 ring-sky-100' : 'border-sky-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        {anc.authorRole} Notice
                      </span>
                      {anc.isImportant && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-900 text-sky-100 px-2 py-0.5 rounded-full">
                          High Priority
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{anc.publishDate}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{anc.title}</h3>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">{anc.message}</p>

                  <div className="mt-4 pt-4 border-t border-sky-50 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Published by: <strong className="text-slate-800">{anc.author}</strong></span>
                    <span>{anc.department}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                <span>My Profile & Class Settings</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                View your registered enrollment details and update contact preferences.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Student Name</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{profile.name}</div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Registration Number</div>
                  <div className="text-sm font-bold text-sky-900 mt-1">{profile.regNumber}</div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Institution</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{profile.collegeName}</div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Program / Course</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{profile.course}</div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Class & Roll Number</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {profile.semester} · {profile.section} (Roll #{profile.rollNo})
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Verified Attendance</div>
                  <div className="text-sm font-bold text-sky-900 mt-1">{calculatedAttendanceRate}%</div>
                </div>
              </div>

              {/* Editable contact section */}
              <div className="mt-6 pt-6 border-t border-sky-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-sky-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Registered Email</div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">{profile.email}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-sky-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Phone Number</div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">{profile.phone}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Edit Contact Details
                  </button>
                  <button
                    onClick={() => setShowPrivacyNoticeModal(true)}
                    className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200 transition-colors cursor-pointer"
                  >
                    Privacy & Data Protection Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RESTRICTED RESOURCE ACCESS MODAL */}
      <RestrictedResourceModal
        isOpen={restrictedModalData.isOpen}
        resourceTitle={restrictedModalData.resourceTitle}
        resourceType={restrictedModalData.resourceType}
        resourceCategory={restrictedModalData.resourceCategory}
        violatingRule={restrictedModalData.violatingRule}
        fallbackReason={restrictedModalData.fallbackReason}
        priorityLevel={restrictedModalData.priorityLevel}
        decidedByRole={restrictedModalData.decidedByRole}
        onClose={() => setRestrictedModalData((prev) => ({ ...prev, isOpen: false }))}
        onRequestAccess={(reason) => {
          onRequestAccess?.(restrictedModalData.resourceTitle, restrictedModalData.resourceType, reason);
        }}
        onNavigateToPermitted={() => {
          setActiveTab('notes');
        }}
      />

      {/* WEBSITE PORTAL VIEWER MODAL */}
      <WebsitePortalModal
        website={activeViewingWebsite}
        onClose={() => setActiveViewingWebsite(null)}
        onCompleteSession={(mins) => {
          // Handled via parent activity logging
        }}
      />

      {/* PRIVACY & TRANSPARENCY NOTICE MODAL */}
      {showPrivacyNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  StudyOn Student Privacy & Transparency Policy
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional data protection charter
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100">
                <div className="font-bold text-sky-950 mb-1">What StudyOn Monitors:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  <li>Digital notes and lecture handouts opened inside the app.</li>
                  <li>Educational videos and study playlists streamed through the app.</li>
                  <li>Educational website links opened from the curriculum repository.</li>
                  <li>Assignment submissions, grades, and teacher feedback.</li>
                  <li>Duration of focused Study Mode sessions.</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">What StudyOn NEVER Monitors:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  <li>No camera, microphone, or background audio access.</li>
                  <li>No screen recording or covert screenshots.</li>
                  <li>No tracking of outside applications, messaging, or personal device files.</li>
                  <li>No password capture or personal telemetry.</li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Data is stored securely according to college retention guidelines (90 days) and accessible strictly to authorized guardians, course faculty, and the principal.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPrivacyNoticeModal(false)}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Submit Assignment: {submittingAssignment.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Provide your solution summary, code notes, or simulated PDF assignment upload.
            </p>

            <form onSubmit={handleAssignmentSubmitClick} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Solution Summary or Written Code
                </label>
                <textarea
                  rows={5}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your documented solution, proofs, and answers..."
                  className="w-full text-xs p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Attach Solution Document
                </label>
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>{simulatedFile || `${profile.name.toLowerCase().replace(/\s+/g, '_')}_solution.pdf`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSimulatedFile(
                        `${profile.name.toLowerCase().replace(/\s+/g, '_')}_revised_v2.pdf`
                      )
                    }
                    className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                  >
                    Simulate Upload
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Confirm & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-sky-100 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Update Contact Details</h3>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
