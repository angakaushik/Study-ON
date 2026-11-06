import React, { useState } from 'react';
import {
  TeacherProfile,
  UserAccount,
  CollegeClass,
  NoteItem,
  AssignmentItem,
  LearningVideoItem,
  EducationalWebsiteItem,
  AnnouncementItem,
  ComplaintItem,
  AttendanceRecord,
  StudentStudyActivityItem,
  StudyModePolicy,
  ClassWatchClass,
  ClassWatchStudent,
  ClassWatchAlert,
} from '../types.ts';
import { Logo } from './Logo.tsx';
import { ClassWatchMonitor } from './ClassWatchMonitor.tsx';
import {
  Shield,
  BookOpen,
  Plus,
  Upload,
  Video,
  FileCheck2,
  Bell,
  BarChart3,
  ShieldCheck,
  MessageSquare,
  LogOut,
  User,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Edit,
  Clock,
  Layers,
  ChevronRight,
  Filter,
  Globe,
  Calendar,
  Users,
  Activity,
  Award,
  AlertCircle,
  FileText,
  Search,
  Check,
  X,
  Youtube,
} from 'lucide-react';

interface TeacherDashboardProps {
  profile: TeacherProfile;
  accounts: UserAccount[];
  classes: CollegeClass[];
  notes: NoteItem[];
  assignments: AssignmentItem[];
  videos: LearningVideoItem[];
  websites: EducationalWebsiteItem[];
  announcements: AnnouncementItem[];
  complaints: ComplaintItem[];
  attendance: AttendanceRecord[];
  studyActivities: StudentStudyActivityItem[];
  policy: StudyModePolicy;
  onAddNote: (newNote: NoteItem) => void;
  onDeleteNote: (noteId: string) => void;
  onAddVideo: (newVideo: LearningVideoItem) => void;
  onAddWebsite: (newWebsite: EducationalWebsiteItem) => void;
  onDeleteWebsite: (websiteId: string) => void;
  onCreateAssignment: (newAssignment: AssignmentItem) => void;
  onGradeAssignment: (assignmentId: string, grade: string, points: number, feedback: string) => void;
  onRecordAttendance: (records: AttendanceRecord[]) => void;
  onPublishAnnouncement: (newAnnouncement: AnnouncementItem) => void;
  onUpdateComplaint: (complaintId: string, status: 'Under Review' | 'In Progress' | 'Resolved', note: string) => void;
  onUpdatePolicy: (updatedPolicy: StudyModePolicy) => void;
  onLogout: () => void;
  // ClassWatch Integration Props
  classWatchClasses?: ClassWatchClass[];
  activeClassWatchCode?: string;
  classWatchStudents?: ClassWatchStudent[];
  classWatchAlerts?: ClassWatchAlert[];
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onSelectClassWatch?: (code: string) => void;
  onCreateClassWatch?: (name: string) => void;
  onAddAllowedDomain?: (domain: string) => void;
  onRemoveAllowedDomain?: (domain: string) => void;
  onWarnStudent?: (studentId: string, customMessage?: string) => void;
  onToggleLockStudent?: (studentId: string) => void;
  onResetStudentPassword?: (studentRegNumber: string, newPass: string) => void;
  onRemoveClassWatchStudent?: (studentId: string) => void;
  onDismissAlert?: (alertId: string) => void;
  onClearAlerts?: () => void;
  onOpenExtensionModal?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  profile,
  accounts,
  classes,
  notes,
  assignments,
  videos,
  websites,
  announcements,
  complaints,
  attendance,
  studyActivities,
  policy,
  onAddNote,
  onDeleteNote,
  onAddVideo,
  onAddWebsite,
  onDeleteWebsite,
  onCreateAssignment,
  onGradeAssignment,
  onRecordAttendance,
  onPublishAnnouncement,
  onUpdateComplaint,
  onUpdatePolicy,
  onLogout,
  classWatchClasses = [],
  activeClassWatchCode = '4892',
  classWatchStudents = [],
  classWatchAlerts = [],
  soundEnabled = true,
  onToggleSound = () => {},
  onSelectClassWatch = () => {},
  onCreateClassWatch = () => {},
  onAddAllowedDomain = () => {},
  onRemoveAllowedDomain = () => {},
  onWarnStudent = () => {},
  onToggleLockStudent = () => {},
  onResetStudentPassword = () => {},
  onRemoveClassWatchStudent = () => {},
  onDismissAlert = () => {},
  onClearAlerts = () => {},
  onOpenExtensionModal = () => {},
}) => {
  type TeacherTab =
    | 'overview'
    | 'classwatch'
    | 'classes'
    | 'attendance'
    | 'assignments'
    | 'notes'
    | 'videos'
    | 'websites'
    | 'activity_reports'
    | 'announcements'
    | 'complaints';

  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');

  // Filter assigned classes for this teacher
  const assignedClasses = classes.filter(
    (c) =>
      c.assignedTeacherName === profile.name ||
      c.assignedTeacherId === profile.id ||
      profile.subjects.includes(c.subject)
  );

  // Filter authorized students (enrolled in courses taught by this teacher)
  const studentAccounts = accounts.filter((acc) => acc.role === 'student');

  // Modals state
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddWebsiteModal, setShowAddWebsiteModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showPublishAnnouncementModal, setShowPublishAnnouncementModal] = useState(false);
  const [gradingAssignment, setGradingAssignment] = useState<AssignmentItem | null>(null);

  // New Note Form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState(profile.subjects[0] || 'Data Structures & Algorithms');
  const [notePages, setNotePages] = useState('16');
  const [noteSummary, setNoteSummary] = useState('');
  const [noteDownloadAllowed, setNoteDownloadAllowed] = useState(true);

  // New Video Form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubject, setVideoSubject] = useState(profile.subjects[0] || 'Data Structures & Algorithms');
  const [videoTopic, setVideoTopic] = useState('');
  const [videoDuration, setVideoDuration] = useState('20 mins');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoIsYouTube, setVideoIsYouTube] = useState(false);
  const [videoPlaylistTitle, setVideoPlaylistTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  // New Website Form
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteSubject, setWebsiteSubject] = useState(profile.subjects[0] || 'Data Structures & Algorithms');
  const [websiteCategory, setWebsiteCategory] = useState('Interactive Tutorial & Reference');
  const [websiteDescription, setWebsiteDescription] = useState('');

  // New Assignment Form
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubject, setAsgSubject] = useState(profile.subjects[0] || 'Data Structures & Algorithms');
  const [asgCourse, setAsgCourse] = useState('B.Tech CSE - Sem 6');
  const [asgDueDate, setAsgDueDate] = useState('Oct 28, 2026, 11:59 PM');
  const [asgTotalPoints, setAsgTotalPoints] = useState('100');
  const [asgInstructions, setAsgInstructions] = useState('');

  // Grading Form
  const [gradePoints, setGradePoints] = useState('');
  const [gradeLetter, setGradeLetter] = useState('A+');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // New Announcement Form
  const [ancTitle, setAncTitle] = useState('');
  const [ancMessage, setAncMessage] = useState('');
  const [ancAudience, setAncAudience] = useState<'All' | 'Students' | 'Parents'>('Students');
  const [ancIsImportant, setAncIsImportant] = useState(false);

  // Attendance Recording State
  const [selectedAttendanceClassId, setSelectedAttendanceClassId] = useState<string>(
    assignedClasses[0]?.id || 'cls-01'
  );
  const [attendanceDate, setAttendanceDate] = useState('2026-10-19');
  const [attendanceSheet, setAttendanceSheet] = useState<{
    [studentId: string]: { status: 'Present' | 'Late' | 'Absent'; remarks: string };
  }>({});
  const [attendanceSavedMessage, setAttendanceSavedMessage] = useState<string | null>(null);

  // Selected student for study activity report
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string>(
    studentAccounts[0]?.identifier || 'STU-2026-4401'
  );

  // Initialize attendance sheet whenever class changes
  const activeAttendanceClass =
    assignedClasses.find((c) => c.id === selectedAttendanceClassId) || assignedClasses[0];

  const handleMarkStatus = (studentId: string, status: 'Present' | 'Late' | 'Absent') => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: {
        status,
        remarks: prev[studentId]?.remarks || '',
      },
    }));
  };

  const handleSetRemarks = (studentId: string, remarks: string) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Present',
        remarks,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: typeof attendanceSheet = {};
    studentAccounts.forEach((stu) => {
      updated[stu.id] = { status: 'Present', remarks: 'Marked present by batch' };
    });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = () => {
    if (!activeAttendanceClass) return;
    const recordsToSave: AttendanceRecord[] = studentAccounts.map((stu) => {
      const entry = attendanceSheet[stu.id] || { status: 'Present', remarks: '' };
      return {
        id: `att-${Date.now()}-${stu.id.slice(-4)}`,
        studentId: stu.id,
        studentName: stu.name,
        studentRegNumber: stu.identifier,
        date: attendanceDate,
        subject: activeAttendanceClass.subject,
        status: entry.status,
        recordedBy: profile.name,
        remarks: entry.remarks || undefined,
      };
    });

    onRecordAttendance(recordsToSave);
    setAttendanceSavedMessage(`Attendance saved successfully for ${activeAttendanceClass.name} on ${attendanceDate}!`);
    setTimeout(() => setAttendanceSavedMessage(null), 4000);
  };

  // Handlers for Add Operations
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteSummary.trim()) return;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim(),
      subject: noteSubject,
      course: 'B.Tech CSE - Sem 6',
      facultyName: profile.name,
      uploadDate: 'Oct 19, 2026',
      pagesCount: parseInt(notePages, 10) || 12,
      fileSize: '3.1 MB',
      downloadAllowed: noteDownloadAllowed,
      summary: noteSummary.trim(),
      contentSnippet: [
        'Chapter 1: Lecture Concepts & Principles',
        'Chapter 2: Algorithms, Proofs & Working Diagrams',
        'Chapter 3: Laboratory & Examination Practice Problems',
      ],
    };

    onAddNote(newNote);
    setShowAddNoteModal(false);
    setNoteTitle('');
    setNoteSummary('');
  };

  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoDescription.trim()) return;

    const newVideo: LearningVideoItem = {
      id: `vid-${Date.now()}`,
      title: videoTitle.trim(),
      subject: videoSubject,
      topic: videoTopic || 'Core Lecture Topic',
      teacherName: profile.name,
      duration: videoDuration || '20 mins',
      videoUrl:
        videoUrl ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isYouTube: videoIsYouTube,
      playlistTitle: videoPlaylistTitle || undefined,
      description: videoDescription.trim(),
      addedByRole: 'Teacher',
      keyTimestamps: [
        { time: '01:00', label: 'Introduction to subject module' },
        { time: '08:30', label: 'Detailed algorithmic trace' },
        { time: '16:00', label: 'Practical takeaways and lab setup' },
      ],
    };

    onAddVideo(newVideo);
    setShowAddVideoModal(false);
    setVideoTitle('');
    setVideoDescription('');
    setVideoTopic('');
    setVideoPlaylistTitle('');
  };

  const handleAddWebsiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteTitle.trim() || !websiteUrl.trim()) return;

    const newWebsite: EducationalWebsiteItem = {
      id: `web-${Date.now()}`,
      title: websiteTitle.trim(),
      url: websiteUrl.trim(),
      subject: websiteSubject,
      category: websiteCategory,
      description: websiteDescription.trim() || 'Verified learning reference and documentation portal.',
      addedBy: profile.name,
      addedByRole: 'Teacher',
      addedDate: 'Oct 19, 2026',
    };

    onAddWebsite(newWebsite);
    setShowAddWebsiteModal(false);
    setWebsiteTitle('');
    setWebsiteUrl('');
    setWebsiteDescription('');
  };

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgInstructions.trim()) return;

    const newAssignment: AssignmentItem = {
      id: `asg-${Date.now()}`,
      title: asgTitle.trim(),
      subject: asgSubject,
      course: asgCourse,
      teacherName: profile.name,
      dueDate: asgDueDate,
      totalPoints: parseInt(asgTotalPoints, 10) || 100,
      instructions: asgInstructions.trim(),
      status: 'pending',
    };

    onCreateAssignment(newAssignment);
    setShowCreateAssignmentModal(false);
    setAsgTitle('');
    setAsgInstructions('');
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAssignment || !gradeFeedback.trim()) return;

    onGradeAssignment(
      gradingAssignment.id,
      gradeLetter,
      parseInt(gradePoints, 10) || gradingAssignment.totalPoints,
      gradeFeedback.trim()
    );
    setGradingAssignment(null);
    setGradePoints('');
    setGradeFeedback('');
  };

  const handlePublishAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancMessage.trim()) return;

    const newAnc: AnnouncementItem = {
      id: `anc-${Date.now()}`,
      title: ancTitle.trim(),
      message: ancMessage.trim(),
      publishDate: 'Oct 19, 2026',
      author: profile.name,
      authorRole: 'Teacher',
      department: profile.department,
      audience: ancAudience,
      isImportant: ancIsImportant,
    };

    onPublishAnnouncement(newAnc);
    setShowPublishAnnouncementModal(false);
    setAncTitle('');
    setAncMessage('');
  };

  // Metrics
  const myNotes = notes.filter((n) => n.facultyName === profile.name || profile.subjects.includes(n.subject));
  const myAssignments = assignments.filter((a) => a.teacherName === profile.name || profile.subjects.includes(a.subject));
  const submittedToGradeCount = myAssignments.filter((a) => a.status === 'submitted').length;
  const myWebsites = websites.filter((w) => w.addedBy === profile.name || profile.subjects.includes(w.subject));
  const myVideos = videos.filter((v) => v.teacherName === profile.name || profile.subjects.includes(v.subject));

  return (
    <div className="min-h-screen bg-sky-50/50 pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Logo size="sm" />
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight leading-none">
                StudyOn
              </div>
              <div className="text-[11px] font-medium text-sky-700 tracking-wide">
                Teacher Educator Dashboard
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
              <span>Live ClassWatch</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Assigned Classes ({assignedClasses.length})</span>
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
              <span>Record Attendance</span>
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
              <span>Assignments ({submittedToGradeCount} to Grade)</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>Study Notes</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-sky-600" />
              <span>Upload Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('websites')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'websites'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Share Websites</span>
            </button>
            <button
              onClick={() => setActiveTab('activity_reports')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'activity_reports'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>Student Activity</span>
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
              <span>Announcements</span>
            </button>
          </nav>

          {/* User profile & actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {profile.name}
                </div>
                <div className="text-[10px] text-sky-700">{profile.facultyId}</div>
              </div>
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
              'classes',
              'attendance',
              'assignments',
              'notes',
              'videos',
              'websites',
              'activity_reports',
              'announcements',
            ] as TeacherTab[]
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
                ? 'Live ClassWatch'
                : tab === 'activity_reports'
                ? 'Activity Reports'
                : tab === 'classes'
                ? 'My Classes'
                : tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* SUCCESS NOTIFICATION */}
        {attendanceSavedMessage && (
          <div className="p-4 rounded-2xl bg-sky-600 text-white font-bold text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{attendanceSavedMessage}</span>
            </div>
            <button
              onClick={() => setAttendanceSavedMessage(null)}
              className="text-white hover:text-sky-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB: CLASSWATCH LIVE MONITOR */}
        {activeTab === 'classwatch' && (
          <ClassWatchMonitor
            classes={classWatchClasses}
            activeClassCode={activeClassWatchCode}
            students={classWatchStudents}
            alerts={classWatchAlerts}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            onSelectClass={onSelectClassWatch}
            onCreateClass={onCreateClassWatch}
            onAddAllowedDomain={onAddAllowedDomain}
            onRemoveAllowedDomain={onRemoveAllowedDomain}
            onWarnStudent={onWarnStudent}
            onToggleLockStudent={onToggleLockStudent}
            onResetStudentPassword={onResetStudentPassword}
            onRemoveStudent={onRemoveClassWatchStudent}
            onDismissAlert={onDismissAlert}
            onClearAlerts={onClearAlerts}
            onOpenExtensionModal={onOpenExtensionModal}
          />
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Faculty Welcome Card */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-lg border border-sky-200">
                    {profile.designation}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {profile.department} · {profile.collegeName}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Authorized Subjects:</span>
                  {profile.subjects.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold bg-sky-50 text-sky-900 px-2.5 py-0.5 rounded-full border border-sky-200"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowCreateAssignmentModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Assignment</span>
                </button>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                  <span>Publish Notes</span>
                </button>
                <button
                  onClick={() => setShowAddWebsiteModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-700" />
                  <span>Share Website</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('classes')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-sky-700 uppercase">Assigned Classes</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{assignedClasses.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Enrolled student rosters</div>
              </div>

              <div
                onClick={() => setActiveTab('attendance')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-sky-700 uppercase">Daily Attendance</div>
                <div className="text-2xl font-black text-sky-900 mt-1">Ready to Record</div>
                <div className="text-xs text-slate-500 mt-0.5">Single-click present marking</div>
              </div>

              <div
                onClick={() => setActiveTab('assignments')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-sky-700 uppercase">Submissions Pending Review</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{submittedToGradeCount}</div>
                <div className="text-xs text-slate-500 mt-0.5">Ready for grading & feedback</div>
              </div>

              <div
                onClick={() => setActiveTab('websites')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-sky-700 uppercase">Shared Resources</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{myNotes.length + myWebsites.length + myVideos.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Notes, videos & websites</div>
              </div>
            </div>

            {/* Submissions Pending Evaluation Alert Card */}
            {submittedToGradeCount > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-sky-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-sky-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Submissions Awaiting Your Review ({submittedToGradeCount})
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {myAssignments
                    .filter((a) => a.status === 'submitted')
                    .map((asg) => (
                      <div
                        key={asg.id}
                        className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                            {asg.subject}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">{asg.title}</h3>
                          <div className="text-xs text-slate-600 mt-0.5">
                            Submitted on {asg.submission?.submittedAt} · {asg.submission?.fileName}
                          </div>
                          <p className="text-xs text-slate-700 italic mt-1 line-clamp-1">
                            &quot;{asg.submission?.textContent}&quot;
                          </p>
                        </div>

                        <button
                          onClick={() => setGradingAssignment(asg)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Grade & Give Feedback</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ASSIGNED CLASSES & STUDENTS */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <span>My Assigned Classes & Authorized Student Rosters</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Faculty members only have authorization to view and manage classes assigned by the Principal.
              </p>
            </div>

            <div className="space-y-6">
              {assignedClasses.map((cls) => (
                <div key={cls.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                          {cls.course}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {cls.semester} · {cls.section}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{cls.name}</h3>
                      <p className="text-xs text-sky-700 font-medium">Subject: {cls.subject}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAttendanceClassId(cls.id);
                          setActiveTab('attendance');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Record Class Attendance</span>
                      </button>
                    </div>
                  </div>

                  {/* Student list for this class */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Enrolled Students ({studentAccounts.length})
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-500 border-b border-sky-100 text-[10px] uppercase">
                            <th className="pb-2 font-semibold">Reg Number</th>
                            <th className="pb-2 font-semibold">Student Name</th>
                            <th className="pb-2 font-semibold">Roll No</th>
                            <th className="pb-2 font-semibold">Email</th>
                            <th className="pb-2 font-semibold">Attendance Rate</th>
                            <th className="pb-2 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-50">
                          {studentAccounts.map((stu) => (
                            <tr key={stu.id} className="hover:bg-sky-50/50">
                              <td className="py-2.5 font-bold text-sky-900">{stu.identifier}</td>
                              <td className="py-2.5 font-semibold text-slate-900">{stu.name}</td>
                              <td className="py-2.5 text-slate-600">#{stu.studentData?.rollNo || '24'}</td>
                              <td className="py-2.5 text-slate-600">{stu.email}</td>
                              <td className="py-2.5">
                                <span className="font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                                  {stu.studentData?.attendanceRate || 94}%
                                </span>
                              </td>
                              <td className="py-2.5">
                                <button
                                  onClick={() => {
                                    setSelectedStudentForReport(stu.identifier);
                                    setActiveTab('activity_reports');
                                  }}
                                  className="text-sky-700 font-bold hover:underline cursor-pointer"
                                >
                                  View Study Activity
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RECORD & UPDATE ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    <span>Record & Update Student Attendance</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select your assigned class, set the session date, mark attendance for each student, and save. Updates reflect instantly in student and parent accounts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllPresent}
                    className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Update Attendance</span>
                  </button>
                </div>
              </div>

              {/* Class & Date Controls */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Select Assigned Class & Subject
                  </label>
                  <select
                    value={selectedAttendanceClassId}
                    onChange={(e) => setSelectedAttendanceClassId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-sky-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  >
                    {assignedClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Session Date
                  </label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-sky-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Attendance Marking Sheet */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Roll Call for {activeAttendanceClass?.name} ({studentAccounts.length} students)
              </h3>

              <div className="space-y-3">
                {studentAccounts.map((stu) => {
                  const currentStatus = attendanceSheet[stu.id]?.status || 'Present';
                  const remarks = attendanceSheet[stu.id]?.remarks || '';

                  return (
                    <div
                      key={stu.id}
                      className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{stu.name}</span>
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                            {stu.identifier}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Section B · Roll #{stu.studentData?.rollNo || '24'}
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMarkStatus(stu.id, 'Present')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'Present'
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-sky-200 hover:bg-sky-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkStatus(stu.id, 'Late')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'Late'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkStatus(stu.id, 'Absent')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'Absent'
                              ? 'bg-red-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-red-200 hover:bg-red-50'
                          }`}
                        >
                          Absent
                        </button>
                      </div>

                      {/* Optional Remarks input */}
                      <div className="w-full sm:w-48">
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => handleSetRemarks(stu.id, e.target.value)}
                          placeholder="Remarks (optional)"
                          className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveAttendance}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Attendance to Student Records</span>
                </button>
              </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Past Attendance Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-sky-100 text-[10px] uppercase">
                      <th className="pb-2 font-semibold">Date</th>
                      <th className="pb-2 font-semibold">Student Name</th>
                      <th className="pb-2 font-semibold">Subject</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {attendance.slice(0, 10).map((att) => (
                      <tr key={att.id} className="hover:bg-sky-50/50">
                        <td className="py-2.5 font-bold text-slate-900">{att.date}</td>
                        <td className="py-2.5 font-semibold text-slate-800">
                          {att.studentName} ({att.studentRegNumber})
                        </td>
                        <td className="py-2.5 text-slate-600">{att.subject}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                        <td className="py-2.5 text-slate-500 italic">{att.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGNMENTS & EVALUATION */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-sky-600" />
                  <span>Assignments & Submission Tracking</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Publish assignments to assigned classes, review student submissions, and award marks and feedback.
                </p>
              </div>

              <button
                onClick={() => setShowCreateAssignmentModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Assignment</span>
              </button>
            </div>

            <div className="space-y-4">
              {myAssignments.map((asg) => (
                <div key={asg.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                          {asg.subject}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Due: {asg.dueDate} · Total: {asg.totalPoints} pts
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{asg.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{asg.instructions}</p>
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
                          ? 'Graded & Evaluated'
                          : asg.status === 'submitted'
                          ? 'Submission Received'
                          : 'Pending Student Submissions'}
                      </span>
                    </div>
                  </div>

                  {/* Submission details */}
                  {asg.submission && (
                    <div className="mt-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                      <div className="flex items-center justify-between text-xs font-bold text-sky-900 mb-1">
                        <span>Submitted Student Answer (Aarav Verma)</span>
                        <span className="text-[11px] font-normal text-slate-500">{asg.submission.submittedAt}</span>
                      </div>
                      {asg.submission.fileName && (
                        <div className="text-xs text-slate-700 flex items-center gap-1.5 font-medium mb-1">
                          <FileText className="w-3.5 h-3.5 text-sky-600" />
                          <span>{asg.submission.fileName}</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-700 italic mt-1 leading-relaxed">
                        &quot;{asg.submission.textContent}&quot;
                      </p>

                      {asg.submission.grade ? (
                        <div className="mt-3 pt-3 border-t border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-900">
                              Score: {asg.submission.pointsScored} / {asg.totalPoints} (Grade {asg.submission.grade})
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-sky-200 text-slate-800">
                            <strong>Feedback:</strong> {asg.submission.teacherFeedback}
                          </div>
                          <button
                            onClick={() => setGradingAssignment(asg)}
                            className="text-xs font-bold text-sky-700 hover:underline cursor-pointer"
                          >
                            Update Feedback
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-sky-200 flex justify-end">
                          <button
                            onClick={() => setGradingAssignment(asg)}
                            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Award Marks & Provide Feedback</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: STUDY NOTES MANAGEMENT */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-600" />
                  <span>Publish & Manage Course Study Notes</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Publish digital lecture notes and syllabus handouts for your assigned subjects.
                </p>
              </div>

              <button
                onClick={() => setShowAddNoteModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload New Note</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        {note.subject}
                      </span>
                      <span className="text-[11px] text-slate-500">{note.pagesCount} pages</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{note.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{note.summary}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{note.uploadDate}</span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EDUCATIONAL VIDEOS */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-sky-600" />
                  <span>Educational Videos & Study Playlists</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Upload recorded class lectures or link educational YouTube videos and playlists for your students.
                </p>
              </div>

              <button
                onClick={() => setShowAddVideoModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Lecture Video</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myVideos.map((vid) => (
                <div key={vid.id} className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        {vid.subject}
                      </span>
                      <span className="text-[11px] text-slate-500">{vid.duration}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{vid.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{vid.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-50 text-[11px] text-slate-500">
                    Uploaded by {vid.teacherName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SHARE WEBSITES */}
        {activeTab === 'websites' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-sky-600" />
                  <span>Share Educational Website Links</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Share verified study portals, reference documentation, and interactive tools directly to your students&apos; dashboards.
                </p>
              </div>

              <button
                onClick={() => setShowAddWebsiteModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Share New Website Link</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myWebsites.map((site) => (
                <div key={site.id} className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        {site.subject}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {site.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{site.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{site.description}</p>
                    <div className="text-[11px] text-sky-700 truncate mt-1">{site.url}</div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{site.addedDate}</span>
                    <button
                      onClick={() => onDeleteWebsite(site.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete website link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: AUTHORIZED STUDENT STUDY ACTIVITY REPORTS */}
        {activeTab === 'activity_reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-600" />
                    <span>Authorized Student Study Activity Reports</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    View verified learning activity metrics, video watch history, notes access, and study mode sessions for students enrolled in your classes.
                  </p>
                </div>

                {/* Student Selector */}
                <div className="w-full sm:w-64">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Select Enrolled Student:
                  </label>
                  <select
                    value={selectedStudentForReport}
                    onChange={(e) => setSelectedStudentForReport(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 font-semibold focus:outline-none"
                  >
                    {studentAccounts.map((stu) => (
                      <option key={stu.id} value={stu.identifier}>
                        {stu.name} ({stu.identifier})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Student's Activity Report */}
            {(() => {
              const activeStudent = studentAccounts.find(
                (s) => s.identifier === selectedStudentForReport
              ) || studentAccounts[0];

              const studentLogs = studyActivities.filter(
                (a) =>
                  a.studentRegNumber.toLowerCase() === activeStudent.identifier.toLowerCase() ||
                  a.studentName.toLowerCase() === activeStudent.name.toLowerCase()
              );

              const totalMinutes = studentLogs.reduce(
                (acc, curr) => acc + (curr.durationMinutes || 0),
                0
              );

              return (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {activeStudent.name} ({activeStudent.identifier})
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {activeStudent.studentData?.course} · {activeStudent.studentData?.semester} · Section {activeStudent.studentData?.section}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                        <div className="text-lg font-bold text-sky-900">{totalMinutes} mins</div>
                        <div className="text-[10px] text-sky-700 font-semibold uppercase">Logged Time</div>
                      </div>
                      <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                        <div className="text-lg font-bold text-sky-900">{studentLogs.length}</div>
                        <div className="text-[10px] text-sky-700 font-semibold uppercase">Activities</div>
                      </div>
                      <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                        <div className="text-lg font-bold text-sky-900">{activeStudent.studentData?.attendanceRate || 94}%</div>
                        <div className="text-[10px] text-sky-700 font-semibold uppercase">Attendance</div>
                      </div>
                    </div>
                  </div>

                  {/* Activity stream */}
                  <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                      Learning Activity Log
                    </h4>

                    <div className="space-y-3">
                      {studentLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white text-sky-700 flex items-center justify-center shrink-0 border border-sky-200 mt-0.5">
                            {log.activityType === 'video_watched' && <Video className="w-4 h-4" />}
                            {log.activityType === 'website_opened' && <Globe className="w-4 h-4" />}
                            {log.activityType === 'study_material_accessed' && <BookOpen className="w-4 h-4" />}
                            {log.activityType === 'assignment_submitted' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                            {log.activityType === 'study_mode_session' && <ShieldCheck className="w-4 h-4" />}
                            {log.activityType === 'assignment_viewed' && <FileCheck2 className="w-4 h-4" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">{log.activityTitle}</span>
                              <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-sky-700">
                              <span>{log.subject}</span>
                              {log.durationMinutes && <span>• {log.durationMinutes} mins</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 9: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-600" />
                  <span>Publish Study Materials & Notices</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Broadcast notices and important dates to students, parents, or department colleagues.
                </p>
              </div>

              <button
                onClick={() => setShowPublishAnnouncementModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Notice</span>
              </button>
            </div>

            <div className="space-y-4">
              {announcements.map((anc) => (
                <div key={anc.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        Audience: {anc.audience}
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
                  <div className="mt-4 pt-4 border-t border-sky-50 text-[11px] text-slate-500">
                    By: {anc.author} ({anc.authorRole}) · {anc.department}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE ASSIGNMENT */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Create & Publish Assignment</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Assignments will immediately appear in your assigned students&apos; dashboards.
            </p>

            <form onSubmit={handleCreateAssignmentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Problem Set 5: B-Trees and Splay Trees"
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={asgSubject}
                    onChange={(e) => setAsgSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 font-medium"
                  >
                    {profile.subjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    value={asgTotalPoints}
                    onChange={(e) => setAsgTotalPoints(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="text"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  placeholder="e.g. Oct 28, 2026, 11:59 PM"
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Instructions & Question Details
                </label>
                <textarea
                  rows={4}
                  value={asgInstructions}
                  onChange={(e) => setAsgInstructions(e.target.value)}
                  placeholder="Write assignment instructions, requirements, and deliverables..."
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignmentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRADE ASSIGNMENT */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">
              Grade & Feedback: {gradingAssignment.title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Award points and write constructive guidance. The student and their parents will be able to review this.
            </p>

            <form onSubmit={handleGradeSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Points Scored (out of {gradingAssignment.totalPoints})
                  </label>
                  <input
                    type="number"
                    value={gradePoints}
                    onChange={(e) => setGradePoints(e.target.value)}
                    placeholder="e.g. 48"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Grade Letter
                  </label>
                  <select
                    value={gradeLetter}
                    onChange={(e) => setGradeLetter(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 font-bold"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Good)</option>
                    <option value="B">B (Satisfactory)</option>
                    <option value="C">C (Needs Improvement)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Constructive Feedback & Notes
                </label>
                <textarea
                  rows={4}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Detail positive highlights and specific areas to improve..."
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingAssignment(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Save Marks & Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHARE WEBSITE */}
      {showAddWebsiteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Share Educational Website Link</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Add verified references, documentation, and coding practice portals for students.
            </p>

            <form onSubmit={handleAddWebsiteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Website / Resource Title
                </label>
                <input
                  type="text"
                  value={websiteTitle}
                  onChange={(e) => setWebsiteTitle(e.target.value)}
                  placeholder="e.g. GeeksforGeeks Data Structures & Algorithms Portal"
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={websiteSubject}
                    onChange={(e) => setWebsiteSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 font-medium"
                  >
                    {profile.subjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={websiteCategory}
                    onChange={(e) => setWebsiteCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  >
                    <option value="Interactive Tutorial & Reference">Interactive Tutorial</option>
                    <option value="Official Documentation">Official Documentation</option>
                    <option value="Academic Library & Research">Academic Library</option>
                    <option value="Interactive Playground">Coding Playground</option>
                    <option value="University Courseware">University Courseware</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Brief Description
                </label>
                <textarea
                  rows={3}
                  value={websiteDescription}
                  onChange={(e) => setWebsiteDescription(e.target.value)}
                  placeholder="Summarize what students will learn from this portal..."
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWebsiteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Share Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD VIDEO */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Upload Educational Video</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Upload a recorded lecture or link an educational YouTube video/playlist.
            </p>

            <form onSubmit={handleAddVideoSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Video Lecture Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. AVL Trees Dynamic Rebalancing Walkthrough"
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={videoSubject}
                    onChange={(e) => setVideoSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 font-medium"
                  >
                    {profile.subjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="e.g. 25 mins"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-sky-50 border border-sky-200">
                <input
                  type="checkbox"
                  id="isYouTubeCheck"
                  checked={videoIsYouTube}
                  onChange={(e) => setVideoIsYouTube(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="isYouTubeCheck" className="text-xs font-semibold text-slate-800">
                  This is an educational YouTube video / Study Playlist
                </label>
              </div>

              {videoIsYouTube && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    YouTube Playlist Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={videoPlaylistTitle}
                    onChange={(e) => setVideoPlaylistTitle(e.target.value)}
                    placeholder="e.g. NPTEL Data Structures & Algorithms Complete Course"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Summarize key topics covered in this lecture..."
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVideoModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Publish Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD NOTES */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Publish Digital Study Notes</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Upload course handouts for students to read and conserve paper.
            </p>

            <form onSubmit={handleAddNoteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Unit 4: Splay Trees & Amortized Analysis"
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 font-medium"
                  >
                    {profile.subjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Number of Pages
                  </label>
                  <input
                    type="number"
                    value={notePages}
                    onChange={(e) => setNotePages(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Summary / Scope
                </label>
                <textarea
                  rows={3}
                  value={noteSummary}
                  onChange={(e) => setNoteSummary(e.target.value)}
                  placeholder="Summary of lecture concepts included..."
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Publish Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PUBLISH ANNOUNCEMENT */}
      {showPublishAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Publish Notice & Announcement</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Send notifications to your students or parents.
            </p>

            <form onSubmit={handlePublishAnnouncementSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={ancTitle}
                  onChange={(e) => setAncTitle(e.target.value)}
                  placeholder="e.g. Laboratory Mid-Term Viva Schedule"
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Audience
                  </label>
                  <select
                    value={ancAudience}
                    onChange={(e) => setAncAudience(e.target.value as 'All' | 'Students' | 'Parents')}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 font-medium"
                  >
                    <option value="Students">Students Only</option>
                    <option value="Parents">Parents Only</option>
                    <option value="All">All (Students & Parents)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="ancImportantCheck"
                    checked={ancIsImportant}
                    onChange={(e) => setAncIsImportant(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <label htmlFor="ancImportantCheck" className="text-xs font-semibold text-slate-800">
                    Mark as High Priority
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  value={ancMessage}
                  onChange={(e) => setAncMessage(e.target.value)}
                  placeholder="Write clear notice details..."
                  className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishAnnouncementModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
