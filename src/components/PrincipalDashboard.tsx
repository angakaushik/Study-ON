import React, { useState } from 'react';
import {
  PrincipalProfile,
  UserAccount,
  CollegeClass,
  NoteItem,
  LearningVideoItem,
  EducationalWebsiteItem,
  AssignmentItem,
  AnnouncementItem,
  ComplaintItem,
  AttendanceRecord,
  StudentStudyActivityItem,
  StudyModePolicy,
} from '../types.ts';
import { Logo } from './Logo.tsx';
import {
  Building2,
  Users,
  Shield,
  FileText,
  Leaf,
  Bell,
  MessageSquare,
  LogOut,
  Plus,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  UserPlus,
  GraduationCap,
  BookOpen,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Radio,
  Send,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  Globe,
  Video,
  Activity,
  Layers,
  Award,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

interface PrincipalDashboardProps {
  profile: PrincipalProfile;
  accounts: UserAccount[];
  classes: CollegeClass[];
  notes: NoteItem[];
  videos: LearningVideoItem[];
  websites: EducationalWebsiteItem[];
  assignments: AssignmentItem[];
  announcements: AnnouncementItem[];
  complaints: ComplaintItem[];
  attendance: AttendanceRecord[];
  studyActivities: StudentStudyActivityItem[];
  policy: StudyModePolicy;
  onCreateAccount: (newAccount: UserAccount) => void;
  onUpdateAccount: (updatedAccount: UserAccount) => void;
  onDeleteAccount: (accountId: string) => void;
  onToggleAccountStatus: (accountId: string) => void;
  onAddClass: (newClass: CollegeClass) => void;
  onAssignTeacherToClass: (classId: string, teacherId: string, teacherName: string) => void;
  onAddVideo: (newVideo: LearningVideoItem) => void;
  onAddNote: (newNote: NoteItem) => void;
  onAddWebsite: (newWebsite: EducationalWebsiteItem) => void;
  onDeleteWebsite: (websiteId: string) => void;
  onDeleteVideo: (videoId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onPublishAnnouncement: (newAnnouncement: AnnouncementItem) => void;
  onDeleteAnnouncement: (announcementId: string) => void;
  onUpdatePolicy: (updatedPolicy: StudyModePolicy) => void;
  onResolveComplaint: (complaintId: string, resolution: string) => void;
  onLogout: () => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({
  profile,
  accounts,
  classes,
  notes,
  videos,
  websites,
  assignments,
  announcements,
  complaints,
  attendance,
  studyActivities,
  policy,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
  onToggleAccountStatus,
  onAddClass,
  onAssignTeacherToClass,
  onAddVideo,
  onAddNote,
  onAddWebsite,
  onDeleteWebsite,
  onDeleteVideo,
  onDeleteNote,
  onPublishAnnouncement,
  onDeleteAnnouncement,
  onUpdatePolicy,
  onResolveComplaint,
  onLogout,
}) => {
  type PrincipalTab =
    | 'overview'
    | 'accounts'
    | 'classes'
    | 'attendance'
    | 'resources'
    | 'reports'
    | 'announcements'
    | 'complaints'
    | 'policy';

  const [activeTab, setActiveTab] = useState<PrincipalTab>('overview');

  // Search & Filters for accounts
  const [rosterSearch, setRosterSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'student' | 'teacher' | 'parent'>('All');

  // Modal states for creating accounts
  const [activeCreateModal, setActiveCreateModal] = useState<'none' | 'student' | 'teacher' | 'parent'>('none');
  const [accountCreatedSuccess, setAccountCreatedSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // 1. ADD STUDENT FORM STATE
  const [stuName, setStuName] = useState('');
  const [stuRegNumber, setStuRegNumber] = useState('');
  const [stuPassword, setStuPassword] = useState('student123');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPhone, setStuPhone] = useState('');
  const [stuCourse, setStuCourse] = useState('B.Tech in Computer Science & Engineering');
  const [stuSemester, setStuSemester] = useState('Semester 6');
  const [stuSection, setStuSection] = useState('Section B');
  const [stuRollNo, setStuRollNo] = useState('');

  // 2. ADD TEACHER FORM STATE
  const [tchName, setTchName] = useState('');
  const [tchUsername, setTchUsername] = useState('');
  const [tchPassword, setTchPassword] = useState('teacher123');
  const [tchFacultyId, setTchFacultyId] = useState('');
  const [tchDepartment, setTchDepartment] = useState('Department of Computer Science');
  const [tchDesignation, setTchDesignation] = useState('Assistant Professor');
  const [tchSubjects, setTchSubjects] = useState('Data Structures & Algorithms, Database Systems');
  const [tchEmail, setTchEmail] = useState('');
  const [tchPhone, setTchPhone] = useState('');

  // 3. ADD PARENT FORM STATE
  const [parName, setParName] = useState('');
  const [parUsername, setParUsername] = useState('');
  const [parPassword, setParPassword] = useState('parent123');
  const [parEmail, setParEmail] = useState('');
  const [parPhone, setParPhone] = useState('');
  const [parRelationship, setParRelationship] = useState('Father');
  const [parLinkedStudentReg, setParLinkedStudentReg] = useState('STU-2026-4401');

  // Password visibility
  const [showPasswordMask, setShowPasswordMask] = useState(false);

  // Class Management State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [classNameInput, setClassNameInput] = useState('');
  const [classCourseInput, setClassCourseInput] = useState('B.Tech Computer Science & Engineering');
  const [classSemesterInput, setClassSemesterInput] = useState('Semester 6');
  const [classSectionInput, setClassSectionInput] = useState('Section B');
  const [classSubjectInput, setClassSubjectInput] = useState('Data Structures & Algorithms');
  const [classTeacherIdInput, setClassTeacherIdInput] = useState('');

  // Resource Management Modals
  const [showAddWebsiteModal, setShowAddWebsiteModal] = useState(false);
  const [webTitle, setWebTitle] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [webSubject, setWebSubject] = useState('Data Structures & Algorithms');
  const [webCategory, setWebCategory] = useState('Academic Library & Research');
  const [webDescription, setWebDescription] = useState('');

  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [vidTitle, setVidTitle] = useState('');
  const [vidSubject, setVidSubject] = useState('Applied Mathematics');
  const [vidDuration, setVidDuration] = useState('20 mins');
  const [vidDescription, setVidDescription] = useState('');

  // Announcement broadcast
  const [showPublishAnnouncementModal, setShowPublishAnnouncementModal] = useState(false);
  const [ancTitle, setAncTitle] = useState('');
  const [ancMessage, setAncMessage] = useState('');
  const [ancAudience, setAncAudience] = useState<'All' | 'Students' | 'Parents' | 'Faculty'>('All');
  const [ancIsImportant, setAncIsImportant] = useState(true);

  // Complaints Desk
  const [resolvingComplaint, setResolvingComplaint] = useState<ComplaintItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Attendance search filter
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // Teachers available for class assignment
  const facultyAccounts = accounts.filter((a) => a.role === 'teacher');

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesRole = roleFilter === 'All' || acc.role === roleFilter;
    const matchesSearch =
      acc.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      acc.identifier.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      acc.email.toLowerCase().includes(rosterSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Calculate Institutional Metrics
  const totalStudents = accounts.filter((a) => a.role === 'student').length;
  const totalFaculty = facultyAccounts.length;
  const totalParents = accounts.filter((a) => a.role === 'parent').length;
  const avgAttendance = 93.6;

  // Handlers for Add Account
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!stuName.trim() || !stuRegNumber.trim() || !stuPassword.trim()) {
      setFormError('Please fill in student name, registration number, and password.');
      return;
    }
    const cleanReg = stuRegNumber.trim().toUpperCase();
    if (accounts.some((a) => a.identifier.toLowerCase() === cleanReg.toLowerCase())) {
      setFormError(`Registration number ${cleanReg} is already assigned.`);
      return;
    }

    const newAcc: UserAccount = {
      id: `acc-stu-${Date.now()}`,
      name: stuName.trim(),
      role: 'student',
      identifier: cleanReg,
      password: stuPassword.trim(),
      status: 'Active',
      createdAt: 'Oct 19, 2026',
      email: stuEmail.trim() || `${stuName.toLowerCase().replace(/\s+/g, '.') || 'student'}@stjude.edu`,
      phone: stuPhone.trim() || '+91 98765 00000',
      dept: 'Computer Science',
      studentData: {
        course: stuCourse,
        semester: stuSemester,
        section: stuSection,
        rollNo: stuRollNo || '35',
        attendanceRate: 95,
      },
    };

    onCreateAccount(newAcc);
    setActiveCreateModal('none');
    setAccountCreatedSuccess(`Student account created for ${newAcc.name} (${newAcc.identifier}).`);
    setTimeout(() => setAccountCreatedSuccess(null), 5000);
    // Reset form
    setStuName('');
    setStuRegNumber('');
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!tchName.trim() || !tchUsername.trim() || !tchPassword.trim()) {
      setFormError('Please fill in teacher name, username, and password.');
      return;
    }
    const cleanUser = tchUsername.trim().toLowerCase();
    if (accounts.some((a) => a.identifier.toLowerCase() === cleanUser)) {
      setFormError(`Username ${cleanUser} is already taken.`);
      return;
    }

    const newAcc: UserAccount = {
      id: `acc-tch-${Date.now()}`,
      name: tchName.trim(),
      role: 'teacher',
      identifier: cleanUser,
      password: tchPassword.trim(),
      status: 'Active',
      createdAt: 'Oct 19, 2026',
      email: tchEmail.trim() || `${cleanUser}@stjude.edu`,
      phone: tchPhone.trim() || '+91 98111 00000',
      dept: tchDepartment,
      teacherData: {
        facultyId: tchFacultyId.trim() || `FAC-CS-${Math.floor(100 + Math.random() * 900)}`,
        department: tchDepartment,
        designation: tchDesignation,
        subjects: tchSubjects.split(',').map((s) => s.trim()),
      },
    };

    onCreateAccount(newAcc);
    setActiveCreateModal('none');
    setAccountCreatedSuccess(`Faculty account created for ${newAcc.name} (${newAcc.identifier}).`);
    setTimeout(() => setAccountCreatedSuccess(null), 5000);
    setTchName('');
    setTchUsername('');
  };

  const handleCreateParent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!parName.trim() || !parUsername.trim() || !parPassword.trim()) {
      setFormError('Please fill in parent name, username, and password.');
      return;
    }
    const cleanUser = parUsername.trim().toLowerCase();
    if (accounts.some((a) => a.identifier.toLowerCase() === cleanUser)) {
      setFormError(`Username ${cleanUser} is already taken.`);
      return;
    }

    const linkedStudent = accounts.find(
      (a) => a.role === 'student' && a.identifier.toLowerCase() === parLinkedStudentReg.trim().toLowerCase()
    );

    const newAcc: UserAccount = {
      id: `acc-par-${Date.now()}`,
      name: parName.trim(),
      role: 'parent',
      identifier: cleanUser,
      password: parPassword.trim(),
      status: 'Active',
      createdAt: 'Oct 19, 2026',
      email: parEmail.trim() || `${cleanUser}@gmail.com`,
      phone: parPhone.trim() || '+91 98220 00000',
      dept: `Ward: ${linkedStudent ? linkedStudent.name : parLinkedStudentReg}`,
      parentData: {
        relationship: parRelationship,
        linkedStudentRegNumber: parLinkedStudentReg.trim().toUpperCase(),
        linkedStudentName: linkedStudent ? linkedStudent.name : 'Enrolled Student',
      },
    };

    onCreateAccount(newAcc);
    setActiveCreateModal('none');
    setAccountCreatedSuccess(`Parent account created for ${newAcc.name} (Linked to ${newAcc.parentData?.linkedStudentRegNumber}).`);
    setTimeout(() => setAccountCreatedSuccess(null), 5000);
    setParName('');
    setParUsername('');
  };

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim() || !classSubjectInput.trim()) return;

    const teacher = facultyAccounts.find((t) => t.id === classTeacherIdInput) || facultyAccounts[0];

    const newClass: CollegeClass = {
      id: `cls-${Date.now()}`,
      name: classNameInput.trim(),
      course: classCourseInput,
      semester: classSemesterInput,
      section: classSectionInput,
      assignedTeacherId: teacher?.id || 'acc-tch-01',
      assignedTeacherName: teacher?.name || 'Dr. Ananya Sharma',
      subject: classSubjectInput.trim(),
      studentCount: 40,
    };

    onAddClass(newClass);
    setShowAddClassModal(false);
    setClassNameInput('');
  };

  const handleShareWebsiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webTitle.trim() || !webUrl.trim()) return;

    const newSite: EducationalWebsiteItem = {
      id: `web-${Date.now()}`,
      title: webTitle.trim(),
      url: webUrl.trim(),
      subject: webSubject,
      category: webCategory,
      description: webDescription.trim() || 'Institutional learning resource shared by Principal Office.',
      addedBy: profile.name,
      addedByRole: 'Principal',
      addedDate: 'Oct 19, 2026',
    };

    onAddWebsite(newSite);
    setShowAddWebsiteModal(false);
    setWebTitle('');
    setWebUrl('');
    setWebDescription('');
  };

  const handleUploadVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidTitle.trim()) return;

    const newVid: LearningVideoItem = {
      id: `vid-${Date.now()}`,
      title: vidTitle.trim(),
      subject: vidSubject,
      topic: 'Principal Keynote & Academic Integrity',
      teacherName: profile.name,
      duration: vidDuration,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      description: vidDescription.trim() || 'Institutional address delivered by Dr. K. S. Menon.',
      addedByRole: 'Principal',
      keyTimestamps: [
        { time: '01:00', label: 'Orientation' },
        { time: '09:00', label: 'Academic Rigor' },
      ],
    };

    onAddVideo(newVid);
    setShowAddVideoModal(false);
    setVidTitle('');
    setVidDescription('');
  };

  const handleBroadcastAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancMessage.trim()) return;

    const newAnc: AnnouncementItem = {
      id: `anc-${Date.now()}`,
      title: ancTitle.trim(),
      message: ancMessage.trim(),
      publishDate: 'Oct 19, 2026',
      author: profile.name,
      authorRole: 'Principal',
      department: 'Office of the Principal',
      audience: ancAudience,
      isImportant: ancIsImportant,
    };

    onPublishAnnouncement(newAnc);
    setShowPublishAnnouncementModal(false);
    setAncTitle('');
    setAncMessage('');
  };

  const handleResolveComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint || !resolutionText.trim()) return;
    onResolveComplaint(resolvingComplaint.id, resolutionText.trim());
    setResolvingComplaint(null);
    setResolutionText('');
  };

  return (
    <div className="min-h-screen bg-sky-50/50 pb-16">
      {/* Top Administrative Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Logo size="sm" />
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight leading-none">
                StudyOn
              </div>
              <div className="text-[11px] font-medium text-sky-700 tracking-wide">
                Principal Administrative Console
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
              onClick={() => setActiveTab('accounts')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Accounts & Permissions ({accounts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Manage Classes ({classes.length})</span>
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
              <span>Student Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'resources'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Educational Resources</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>Progress & Study Reports</span>
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
              <span>Broadcast Notices</span>
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
              <span>Grievances Desk</span>
            </button>
          </nav>

          {/* Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-900 leading-tight">{profile.name}</div>
              <div className="text-[10px] text-sky-700">{profile.designation}</div>
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
              'accounts',
              'classes',
              'attendance',
              'resources',
              'reports',
              'announcements',
              'complaints',
            ] as PrincipalTab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-lg shrink-0 capitalize cursor-pointer ${
                activeTab === tab
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-600 bg-sky-50'
              }`}
            >
              {tab === 'accounts' ? 'User Accounts' : tab === 'classes' ? 'Classes' : tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* SUCCESS NOTIFICATION */}
        {accountCreatedSuccess && (
          <div className="p-4 rounded-2xl bg-sky-600 text-white font-bold text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{accountCreatedSuccess}</span>
            </div>
            <button
              onClick={() => setAccountCreatedSuccess(null)}
              className="text-white hover:text-sky-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {profile.collegeName}
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Principal Executive Console · Campus Code: {profile.campusCode} · Office: {profile.officeEmail}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowPublishAnnouncementModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Broadcast Notice</span>
                </button>
                <button
                  onClick={() => setActiveCreateModal('student')}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-sky-700" />
                  <span>Add Student</span>
                </button>
                <button
                  onClick={() => setShowAddWebsiteModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-700" />
                  <span>Share Resource</span>
                </button>
              </div>
            </div>

            {/* Institutional KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => {
                  setRoleFilter('student');
                  setActiveTab('accounts');
                }}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-sky-700 uppercase">Enrolled Students</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{totalStudents} Active</div>
                <div className="text-xs text-slate-500 mt-0.5">Undergraduate & Graduate</div>
              </div>

              <div
                onClick={() => {
                  setRoleFilter('teacher');
                  setActiveTab('accounts');
                }}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-sky-700 uppercase">Faculty Members</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{totalFaculty} Teachers</div>
                <div className="text-xs text-slate-500 mt-0.5">Assigned to departments</div>
              </div>

              <div
                onClick={() => setActiveTab('classes')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-sky-700 uppercase">Academic Classes</div>
                <div className="text-2xl font-black text-sky-900 mt-1">{classes.length} Classes</div>
                <div className="text-xs text-slate-500 mt-0.5">Faculty allocated</div>
              </div>

              <div
                onClick={() => setActiveTab('attendance')}
                className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-sky-700 uppercase">College Attendance Rate</div>
                <div className="text-2xl font-black text-sky-900 mt-1">{avgAttendance}%</div>
                <div className="text-xs text-slate-500 mt-0.5">Institution-wide average</div>
              </div>
            </div>

            {/* Quick Management Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('accounts')}
                className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">User Account Administration</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Create and manage unique accounts for students, teachers, and parents with credentials and permissions.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('classes')}
                className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Class & Faculty Allocation</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Structure college classes, assign teachers to subjects, and configure authorized rosters.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('resources')}
                className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:border-sky-300 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Institution-Wide Resources</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Manage digital notes, upload institutional videos, and share educational website portals.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER ACCOUNTS & PERMISSIONS (CREATE & MANAGE) */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  <span>Account Roster & Permissions Management</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  The Principal manages and creates accounts for students, teachers, and parents with separate forms.
                </p>
              </div>

              {/* Create buttons for each role */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveCreateModal('student')}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Student</span>
                </button>
                <button
                  onClick={() => setActiveCreateModal('teacher')}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Teacher</span>
                </button>
                <button
                  onClick={() => setActiveCreateModal('parent')}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Parent</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-2xl border border-sky-200">
                  {(['All', 'student', 'teacher', 'parent'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                        roleFilter === r
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-sky-800'
                      }`}
                    >
                      {r === 'All' ? 'All Roles' : `${r}s`}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search accounts..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Accounts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-sky-100 text-[10px] uppercase">
                      <th className="pb-3 font-semibold">User Details</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Username / Reg No</th>
                      <th className="pb-3 font-semibold">Dept / Details</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {filteredAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-sky-50/50">
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{acc.name}</div>
                          <div className="text-[11px] text-slate-500">{acc.email}</div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              acc.role === 'student'
                                ? 'bg-sky-100 text-sky-900'
                                : acc.role === 'teacher'
                                ? 'bg-sky-200 text-sky-900'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-sky-900">{acc.identifier}</td>
                        <td className="py-3 text-slate-600">
                          {acc.dept || acc.studentData?.course || 'General'}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              acc.status === 'Active'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {acc.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onToggleAccountStatus(acc.id)}
                              className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                            >
                              {acc.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => onDeleteAccount(acc.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE CLASSES & ASSIGN TEACHERS */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-600" />
                  <span>College Classes & Faculty Assignment</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Manage academic classes and assign qualified faculty members to lead each course and subject.
                </p>
              </div>

              <button
                onClick={() => setShowAddClassModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Class</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        {cls.course}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {cls.semester} · {cls.section}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">Subject: <strong>{cls.subject}</strong></p>
                    <p className="text-xs text-slate-500 mt-0.5">Enrolled: {cls.studentCount} Students</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sky-50">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Assigned Faculty Instructor:
                    </label>
                    <select
                      value={cls.assignedTeacherId}
                      onChange={(e) => {
                        const tch = facultyAccounts.find((t) => t.id === e.target.value);
                        if (tch) {
                          onAssignTeacherToClass(cls.id, tch.id, tch.name);
                        }
                      }}
                      className="w-full text-xs p-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 font-semibold focus:outline-none"
                    >
                      {facultyAccounts.map((tch) => (
                        <option key={tch.id} value={tch.id}>
                          {tch.name} ({tch.identifier})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT ATTENDANCE RECORDS */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>College-Wide Student Attendance Ledger</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Institutional audit of student attendance recorded by department faculty. Minimum 75% required.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  placeholder="Filter student or subject..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-sky-100 text-[10px] uppercase">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Student Name & Reg No</th>
                      <th className="pb-3 font-semibold">Subject</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Recorded By Faculty</th>
                      <th className="pb-3 font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {attendance
                      .filter(
                        (att) =>
                          att.studentName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                          att.studentRegNumber.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                          att.subject.toLowerCase().includes(attendanceSearch.toLowerCase())
                      )
                      .map((att) => (
                        <tr key={att.id} className="hover:bg-sky-50/50">
                          <td className="py-3 font-bold text-slate-900">{att.date}</td>
                          <td className="py-3 font-semibold text-slate-800">
                            {att.studentName} <span className="text-sky-700">({att.studentRegNumber})</span>
                          </td>
                          <td className="py-3 text-slate-700">{att.subject}</td>
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

        {/* TAB 5: EDUCATIONAL RESOURCES MANAGEMENT */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-sky-600" />
                  <span>Institutional Educational Resources</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  The Principal manages academic website portals, institutional lectures, and verified course handouts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddWebsiteModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Share Website Link</span>
                </button>
                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-sky-700" />
                  <span>Upload Video</span>
                </button>
              </div>
            </div>

            {/* Websites section */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Curated Educational Websites ({websites.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websites.map((site) => (
                  <div key={site.id} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-sky-800 uppercase">{site.subject}</div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{site.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{site.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-sky-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Shared by: {site.addedBy}</span>
                      <button
                        onClick={() => onDeleteWebsite(site.id)}
                        className="text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos section */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Video Lectures & Playlists ({videos.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((vid) => (
                  <div key={vid.id} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-sky-800 uppercase">{vid.subject}</div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{vid.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{vid.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-sky-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{vid.teacherName} · {vid.duration}</span>
                      <button
                        onClick={() => onDeleteVideo(vid.id)}
                        className="text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PROGRESS & STUDY ACTIVITY REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-600" />
                <span>Assignment & Study Activity Reports</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Institutional study activity desk: Review student learning hours, assignment completion rates, and focus sessions.
              </p>
            </div>

            {/* Assignments summary */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Course Assignment Completion Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assignments.map((asg) => (
                  <div key={asg.id} className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                    <span className="text-[10px] font-bold uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      {asg.subject}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5">{asg.title}</h4>
                    <div className="text-[11px] text-slate-600 mt-1">Faculty: {asg.teacherName}</div>
                    <div className="mt-2 text-xs font-semibold text-sky-800">
                      Status: <span className="capitalize font-bold">{asg.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Student Study Activities */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Institutional Study Activity Stream</h3>
              <div className="space-y-3">
                {studyActivities.map((act) => (
                  <div key={act.id} className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-sky-700 flex items-center justify-center shrink-0 border border-sky-200 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          {act.studentName} ({act.studentRegNumber})
                        </span>
                        <span className="text-slate-500 text-[11px]">{act.timestamp}</span>
                      </div>
                      <div className="text-xs text-slate-800 font-medium mt-0.5">{act.activityTitle}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: BROADCAST NOTICES & ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-600" />
                  <span>Broadcast Institutional Notices & Announcements</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Publish notices across the entire institution. Announcements broadcast to student, teacher, and parent dashboards.
                </p>
              </div>

              <button
                onClick={() => setShowPublishAnnouncementModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Broadcast Notice</span>
              </button>
            </div>

            <div className="space-y-4">
              {announcements.map((anc) => (
                <div key={anc.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        Audience: {anc.audience}
                      </span>
                      {anc.isImportant && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-900 text-sky-100 px-2 py-0.5 rounded-full">
                          High Priority Broadcast
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{anc.publishDate}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{anc.title}</h3>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">{anc.message}</p>

                  <div className="mt-4 pt-4 border-t border-sky-50 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Published by: <strong>{anc.author}</strong> ({anc.department})</span>
                    <button
                      onClick={() => onDeleteAnnouncement(anc.id)}
                      className="text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Delete Notice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: COMPLAINTS DESK */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                <span>Institutional Grievance & Inquiries Desk</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Review and resolve concerns submitted by parents and students.
              </p>
            </div>

            <div className="space-y-4">
              {complaints.map((cmp) => (
                <div key={cmp.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-sky-900">{cmp.ticketNumber}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cmp.status === 'Resolved'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cmp.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{cmp.subject}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cmp.description}</p>

                  <div className="mt-3 text-[11px] text-slate-500">
                    Submitted by: <strong>{cmp.submittedBy}</strong> ({cmp.submitterRole}) · {cmp.submittedDate}
                  </div>

                  {cmp.resolutionNote ? (
                    <div className="mt-3 p-3 rounded-xl bg-sky-50 text-xs text-slate-800 border border-sky-200">
                      <strong>Resolution Note:</strong> {cmp.resolutionNote}
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-sky-50 flex justify-end">
                      <button
                        onClick={() => setResolvingComplaint(cmp)}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        Resolve Grievance
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD STUDENT */}
      {activeCreateModal === 'student' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Add New Student Account</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Assign a unique registration number and password for the student.
            </p>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  placeholder="e.g. Maya Krishnan"
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Registration Number (Unique Login)
                  </label>
                  <input
                    type="text"
                    value={stuRegNumber}
                    onChange={(e) => setStuRegNumber(e.target.value)}
                    placeholder="e.g. STU-2026-4409"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 uppercase font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type={showPasswordMask ? 'text' : 'password'}
                    value={stuPassword}
                    onChange={(e) => setStuPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Semester & Section
                  </label>
                  <input
                    type="text"
                    value={`${stuSemester} - ${stuSection}`}
                    onChange={(e) => setStuSection(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={stuRollNo}
                    onChange={(e) => setStuRollNo(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveCreateModal('none')}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Create Student Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TEACHER */}
      {activeCreateModal === 'teacher' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Add New Teacher Account</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Assign username, faculty ID, and authorized subjects.
            </p>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={tchName}
                  onChange={(e) => setTchName(e.target.value)}
                  placeholder="e.g. Prof. Meenakshi Iyer"
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Assigned Username (Login)
                  </label>
                  <input
                    type="text"
                    value={tchUsername}
                    onChange={(e) => setTchUsername(e.target.value)}
                    placeholder="e.g. prof.iyer"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type={showPasswordMask ? 'text' : 'password'}
                    value={tchPassword}
                    onChange={(e) => setTchPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Subjects Taught (comma separated)
                </label>
                <input
                  type="text"
                  value={tchSubjects}
                  onChange={(e) => setTchSubjects(e.target.value)}
                  placeholder="e.g. Applied Mathematics, Discrete Mathematics"
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveCreateModal('none')}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Create Teacher Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PARENT */}
      {activeCreateModal === 'parent' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Add New Parent Account</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Link the parent account to their child&apos;s registration number.
            </p>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateParent} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={parName}
                  onChange={(e) => setParName(e.target.value)}
                  placeholder="e.g. Sunita Verma"
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Assigned Username (Login)
                  </label>
                  <input
                    type="text"
                    value={parUsername}
                    onChange={(e) => setParUsername(e.target.value)}
                    placeholder="e.g. parent.sunita"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type={showPasswordMask ? 'text' : 'password'}
                    value={parPassword}
                    onChange={(e) => setParPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Linked Child Registration Number
                  </label>
                  <input
                    type="text"
                    value={parLinkedStudentReg}
                    onChange={(e) => setParLinkedStudentReg(e.target.value)}
                    placeholder="e.g. STU-2026-4401"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 uppercase font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Relationship
                  </label>
                  <select
                    value={parRelationship}
                    onChange={(e) => setParRelationship(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveCreateModal('none')}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Create Parent Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CLASS */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Create Academic Class</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Add a class and assign a qualified teacher.
            </p>

            <form onSubmit={handleAddClassSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="e.g. B.Tech CSE - 6B: Data Structures & Algorithms"
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={classSubjectInput}
                    onChange={(e) => setClassSubjectInput(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Assign Faculty Member
                  </label>
                  <select
                    value={classTeacherIdInput}
                    onChange={(e) => setClassTeacherIdInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  >
                    {facultyAccounts.map((tch) => (
                      <option key={tch.id} value={tch.id}>
                        {tch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Create Class
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
            <h3 className="text-base font-bold text-slate-900">Share Institutional Website Link</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Available to all students and parents across the institution.
            </p>

            <form onSubmit={handleShareWebsiteSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  placeholder="e.g. National Digital Library of India"
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Resource URL
                </label>
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={webDescription}
                  onChange={(e) => setWebDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
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

      {/* MODAL: BROADCAST ANNOUNCEMENT */}
      {showPublishAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Broadcast Institutional Announcement</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Notices will appear on all targeted user dashboards with priority notification tags.
            </p>

            <form onSubmit={handleBroadcastAnnouncementSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={ancTitle}
                  onChange={(e) => setAncTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Theory Examination Schedules"
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
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
                    onChange={(e) => setAncAudience(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  >
                    <option value="All">All Users (College-wide)</option>
                    <option value="Students">Students Only</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="ancPriHigh"
                    checked={ancIsImportant}
                    onChange={(e) => setAncIsImportant(e.target.checked)}
                    className="rounded text-sky-600"
                  />
                  <label htmlFor="ancPriHigh" className="text-xs font-semibold text-slate-800">
                    High Priority Banner
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
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
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

      {/* MODAL: RESOLVE COMPLAINT */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">
              Resolve Ticket: {resolvingComplaint.ticketNumber}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Subject: {resolvingComplaint.subject}
            </p>

            <form onSubmit={handleResolveComplaintSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Official Resolution Response Note
                </label>
                <textarea
                  rows={4}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Detail administrative decision and action taken..."
                  className="w-full text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setResolvingComplaint(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
