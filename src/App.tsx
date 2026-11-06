import React, { useState } from 'react';
import {
  UserRole,
  UserAccount,
  CollegeClass,
  StudentProfile,
  TeacherProfile,
  ParentProfile,
  NoteItem,
  AssignmentItem,
  LearningVideoItem,
  EducationalWebsiteItem,
  AnnouncementItem,
  ComplaintItem,
  AttendanceRecord,
  StudentStudyActivityItem,
  StudyModePolicy,
} from './types.ts';
import {
  INITIAL_STUDENT,
  INITIAL_TEACHER,
  INITIAL_PARENT,
  INITIAL_PRINCIPAL,
  INITIAL_ACCOUNTS,
  INITIAL_CLASSES,
  INITIAL_NOTES,
  INITIAL_ASSIGNMENTS,
  INITIAL_VIDEOS,
  INITIAL_WEBSITES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_STUDY_ACTIVITIES,
  INITIAL_COMPLAINTS,
  INITIAL_STUDY_POLICY,
  CURRICULUM_SEARCH_INDEX,
} from './data/mockData.ts';
import { SplashScreen } from './components/SplashScreen.tsx';
import { MainRoleSelect } from './components/MainRoleSelect.tsx';
import { RoleLoginScreen } from './components/RoleLoginScreen.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { ParentDashboard } from './components/ParentDashboard.tsx';
import { PrincipalDashboard } from './components/PrincipalDashboard.tsx';
import { PDFReaderModal } from './components/PDFReaderModal.tsx';
import { StudyModeModal } from './components/StudyModeModal.tsx';
import { VideoPlayerModal } from './components/VideoPlayerModal.tsx';
import { PaperSavedModal } from './components/PaperSavedModal.tsx';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  // App Navigation Flow State
  const [appStage, setAppStage] = useState<'splash' | 'role_select' | 'role_login' | 'dashboard'>('splash');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  // Active Authenticated Account
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);

  // Central User Account Store managed by the Principal
  const [accountsList, setAccountsList] = useState<UserAccount[]>(INITIAL_ACCOUNTS);

  // Device Preview Mode: Toggle between Desktop View and Android Phone Frame
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');

  // Centralized Academic State
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(INITIAL_STUDENT);
  const [classesList, setClassesList] = useState<CollegeClass[]>(INITIAL_CLASSES);
  const [notesList, setNotesList] = useState<NoteItem[]>(INITIAL_NOTES);
  const [assignmentsList, setAssignmentsList] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [videosList, setVideosList] = useState<LearningVideoItem[]>(INITIAL_VIDEOS);
  const [websitesList, setWebsitesList] = useState<EducationalWebsiteItem[]>(INITIAL_WEBSITES);
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [studyActivitiesList, setStudyActivitiesList] = useState<StudentStudyActivityItem[]>(INITIAL_STUDY_ACTIVITIES);
  const [complaintsList, setComplaintsList] = useState<ComplaintItem[]>(INITIAL_COMPLAINTS);
  const [studyPolicy, setStudyPolicy] = useState<StudyModePolicy>(INITIAL_STUDY_POLICY);

  // Study Mode State & Progress tracking
  const [isStudyModeActive, setIsStudyModeActive] = useState(false);
  const [showStudyModePreview, setShowStudyModePreview] = useState(false);
  const [studyMinutesCount, setStudyMinutesCount] = useState(55);
  const [notesReadCount, setNotesReadCount] = useState(4);

  // Modal states
  const [readingNote, setReadingNote] = useState<NoteItem | null>(null);
  const [watchingVideo, setWatchingVideo] = useState<LearningVideoItem | null>(null);
  const [showPaperSavedModal, setShowPaperSavedModal] = useState(false);

  // Handlers for Navigation & Login
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setAppStage('role_login');
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentUserRole(role);
    const defaultAcc = accountsList.find((a) => a.role === role);
    setCurrentAccount(defaultAcc || null);
    setAppStage('dashboard');
  };

  const handleLoginSuccess = (role: UserRole, account?: UserAccount) => {
    setCurrentUserRole(role);
    setCurrentAccount(account || accountsList.find((a) => a.role === role) || null);
    setAppStage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setCurrentAccount(null);
    setAppStage('role_select');
  };

  // Principal Account Management Handlers
  const handleCreateAccount = (newAccount: UserAccount) => {
    setAccountsList((prev) => [newAccount, ...prev]);
  };

  const handleUpdateAccount = (updatedAccount: UserAccount) => {
    setAccountsList((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
    if (currentAccount && currentAccount.id === updatedAccount.id) {
      setCurrentAccount(updatedAccount);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccountsList((prev) => prev.filter((acc) => acc.id !== accountId));
  };

  const handleToggleAccountStatus = (accountId: string) => {
    setAccountsList((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, status: acc.status === 'Active' ? 'Suspended' : 'Active' }
          : acc
      )
    );
  };

  // Class Management Handlers
  const handleAddClass = (newClass: CollegeClass) => {
    setClassesList((prev) => [...prev, newClass]);
  };

  const handleAssignTeacherToClass = (classId: string, teacherId: string, teacherName: string) => {
    setClassesList((prev) =>
      prev.map((c) =>
        c.id === classId
          ? { ...c, assignedTeacherId: teacherId, assignedTeacherName: teacherName }
          : c
      )
    );
  };

  // Educational Websites Handlers
  const handleAddWebsite = (newWebsite: EducationalWebsiteItem) => {
    setWebsitesList((prev) => [newWebsite, ...prev]);
  };

  const handleDeleteWebsite = (websiteId: string) => {
    setWebsitesList((prev) => prev.filter((w) => w.id !== websiteId));
  };

  // Educational Videos Handlers
  const handleAddVideo = (newVideo: LearningVideoItem) => {
    setVideosList((prev) => [newVideo, ...prev]);
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideosList((prev) => prev.filter((v) => v.id !== videoId));
  };

  // Notes Handlers
  const handleAddNote = (newNote: NoteItem) => {
    setNotesList((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotesList((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Attendance Handlers (Saves and Recalculates student's attendance rate)
  const handleRecordAttendance = (records: AttendanceRecord[]) => {
    setAttendanceList((prev) => [...records, ...prev]);

    // Recalculate attendance rates for affected students
    const affectedRegs = Array.from(new Set(records.map((r) => r.studentRegNumber)));

    setAccountsList((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.role === 'student' && affectedRegs.includes(acc.identifier)) {
          // Combined history
          const studentHistory = [
            ...records.filter((r) => r.studentRegNumber === acc.identifier),
            ...attendanceList.filter((r) => r.studentRegNumber === acc.identifier),
          ];
          const total = studentHistory.length;
          const present = studentHistory.filter((r) => r.status === 'Present').length;
          const late = studentHistory.filter((r) => r.status === 'Late').length;
          const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 95;

          return {
            ...acc,
            studentData: acc.studentData
              ? { ...acc.studentData, attendanceRate: rate }
              : undefined,
          };
        }
        return acc;
      })
    );

    // Also update current active student profile if applicable
    if (currentAccount && affectedRegs.includes(currentAccount.identifier)) {
      setStudentProfile((prev) => ({
        ...prev,
        attendanceRate: 95,
      }));
    }
  };

  // Student Study Activity Logging
  const logStudyActivity = (activity: Omit<StudentStudyActivityItem, 'id'>) => {
    const newAct: StudentStudyActivityItem = {
      ...activity,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setStudyActivitiesList((prev) => [newAct, ...prev]);
  };

  // Student Actions
  const handleSubmitAssignment = (assignmentId: string, text: string, fileName?: string) => {
    const target = assignmentsList.find((a) => a.id === assignmentId);
    setAssignmentsList((prev) =>
      prev.map((asg) =>
        asg.id === assignmentId
          ? {
              ...asg,
              status: 'submitted',
              submission: {
                submittedAt: 'Oct 19, 2026, 11:30 PM',
                textContent: text,
                fileName,
              },
            }
          : asg
      )
    );

    // Log study activity
    const activeStudent = getActiveStudentProfile();
    logStudyActivity({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      studentRegNumber: activeStudent.regNumber,
      activityType: 'assignment_submitted',
      activityTitle: `Submitted: ${target?.title || 'Course Assignment'}`,
      subject: target?.subject || 'Academics',
      timestamp: 'Just now',
      details: `Uploaded assignment submission document (${fileName || 'Text Submission'})`,
    });
  };

  const handleUpdateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudentProfile((prev) => ({ ...prev, ...updated }));
  };

  // Teacher Actions
  const handleCreateAssignment = (newAssignment: AssignmentItem) => {
    setAssignmentsList((prev) => [newAssignment, ...prev]);
  };

  const handleGradeAssignment = (assignmentId: string, grade: string, points: number, feedback: string) => {
    setAssignmentsList((prev) =>
      prev.map((asg) =>
        asg.id === assignmentId
          ? {
              ...asg,
              status: 'reviewed',
              submission: {
                ...asg.submission!,
                grade,
                pointsScored: points,
                teacherFeedback: feedback,
              },
            }
          : asg
      )
    );
  };

  const handlePublishAnnouncement = (newAnnouncement: AnnouncementItem) => {
    setAnnouncementsList((prev) => [newAnnouncement, ...prev]);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    setAnnouncementsList((prev) => prev.filter((a) => a.id !== announcementId));
  };

  const handleUpdateComplaint = (
    complaintId: string,
    status: 'Under Review' | 'In Progress' | 'Resolved',
    resolutionNote: string
  ) => {
    setComplaintsList((prev) =>
      prev.map((cmp) =>
        cmp.id === complaintId
          ? {
              ...cmp,
              status,
              resolutionNote: resolutionNote || cmp.resolutionNote,
            }
          : cmp
      )
    );
  };

  // Study Mode session end
  const handleDeactivateStudyMode = (minutesRecorded: number) => {
    setIsStudyModeActive(false);
    setShowStudyModePreview(false);
    setStudyMinutesCount((prev) => prev + minutesRecorded);

    const activeStudent = getActiveStudentProfile();
    logStudyActivity({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      studentRegNumber: activeStudent.regNumber,
      activityType: 'study_mode_session',
      activityTitle: 'Completed Focus Study Mode Session',
      subject: 'Distraction-Free Learning',
      durationMinutes: minutesRecorded,
      timestamp: 'Just now',
      details: `Completed ${minutesRecorded} minutes of continuous study with app restrictions.`,
    });
  };

  // Helper getters for Profiles
  const getActiveStudentProfile = (): StudentProfile => {
    if (currentAccount && currentAccount.role === 'student') {
      return {
        id: currentAccount.id,
        name: currentAccount.name,
        regNumber: currentAccount.identifier,
        collegeName: 'St. Jude Institute of Technology & Sciences',
        course: currentAccount.studentData?.course || studentProfile.course,
        semester: currentAccount.studentData?.semester || studentProfile.semester,
        section: currentAccount.studentData?.section || studentProfile.section,
        rollNo: currentAccount.studentData?.rollNo || studentProfile.rollNo,
        email: currentAccount.email,
        phone: currentAccount.phone || studentProfile.phone,
        attendanceRate: currentAccount.studentData?.attendanceRate || studentProfile.attendanceRate,
      };
    }
    return studentProfile;
  };

  const getActiveTeacherProfile = (): TeacherProfile => {
    if (currentAccount && currentAccount.role === 'teacher') {
      return {
        id: currentAccount.id,
        name: currentAccount.name,
        username: currentAccount.identifier,
        facultyId: currentAccount.teacherData?.facultyId || INITIAL_TEACHER.facultyId,
        collegeName: 'St. Jude Institute of Technology & Sciences',
        department: currentAccount.teacherData?.department || INITIAL_TEACHER.department,
        designation: currentAccount.teacherData?.designation || INITIAL_TEACHER.designation,
        subjects: currentAccount.teacherData?.subjects || INITIAL_TEACHER.subjects,
        email: currentAccount.email,
        phone: currentAccount.phone || INITIAL_TEACHER.phone,
      };
    }
    return INITIAL_TEACHER;
  };

  const getActiveParentProfile = (): ParentProfile => {
    if (currentAccount && currentAccount.role === 'parent') {
      const linkedReg = currentAccount.parentData?.linkedStudentRegNumber;
      const linkedStudent =
        accountsList.find(
          (a) => a.role === 'student' && a.identifier.toLowerCase() === (linkedReg || '').toLowerCase()
        ) || accountsList.find((a) => a.role === 'student');

      return {
        id: currentAccount.id,
        name: currentAccount.name,
        username: currentAccount.identifier,
        email: currentAccount.email,
        phone: currentAccount.phone || INITIAL_PARENT.phone,
        relationship: currentAccount.parentData?.relationship || 'Guardian',
        linkedChild: {
          name: linkedStudent ? linkedStudent.name : currentAccount.parentData?.linkedStudentName || 'Aarav Verma',
          regNumber: linkedStudent ? linkedStudent.identifier : linkedReg || 'STU-2026-4401',
          course: linkedStudent?.studentData?.course || 'B.Tech in Computer Science & Engineering',
          semester: linkedStudent?.studentData?.semester || 'Semester 6',
          collegeName: 'St. Jude Institute of Technology & Sciences',
          attendanceRate: linkedStudent?.studentData?.attendanceRate || 94,
          gpa: '8.82 / 10.0',
        },
      };
    }
    return INITIAL_PARENT;
  };

  // Render current view
  const renderCurrentView = () => {
    if (appStage === 'splash') {
      return <SplashScreen onComplete={() => setAppStage('role_select')} />;
    }

    if (appStage === 'role_select') {
      return (
        <MainRoleSelect
          onSelectRole={handleSelectRole}
          onQuickDemo={handleQuickDemoLogin}
        />
      );
    }

    if (appStage === 'role_login') {
      return (
        <RoleLoginScreen
          role={selectedRole}
          accounts={accountsList}
          onBack={() => setAppStage('role_select')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    // DASHBOARD VIEWS
    if (currentUserRole === 'student') {
      return (
        <StudentDashboard
          profile={getActiveStudentProfile()}
          notes={notesList}
          assignments={assignmentsList}
          videos={videosList}
          websites={websitesList}
          announcements={announcementsList}
          attendance={attendanceList}
          studyActivities={studyActivitiesList}
          policy={studyPolicy}
          searchIndex={CURRICULUM_SEARCH_INDEX}
          isStudyModeActive={isStudyModeActive}
          studyMinutes={studyMinutesCount}
          notesReadCount={notesReadCount}
          onOpenStudyModePreview={() => setShowStudyModePreview(true)}
          onOpenNoteReader={(note) => {
            setReadingNote(note);
            setNotesReadCount((prev) => prev + 1);
            const activeStu = getActiveStudentProfile();
            logStudyActivity({
              studentId: activeStu.id,
              studentName: activeStu.name,
              studentRegNumber: activeStu.regNumber,
              activityType: 'study_material_accessed',
              activityTitle: `Read: ${note.title}`,
              subject: note.subject,
              durationMinutes: 20,
              timestamp: 'Just now',
              details: `Accessed ${note.pagesCount} pages of lecture notes in in-app reader`,
            });
          }}
          onOpenVideo={(video) => {
            setWatchingVideo(video);
            const activeStu = getActiveStudentProfile();
            logStudyActivity({
              studentId: activeStu.id,
              studentName: activeStu.name,
              studentRegNumber: activeStu.regNumber,
              activityType: 'video_watched',
              activityTitle: `Watched: ${video.title}`,
              subject: video.subject,
              durationMinutes: parseInt(video.duration, 10) || 15,
              timestamp: 'Just now',
              details: `Streamed lecture video by ${video.teacherName}`,
            });
          }}
          onOpenWebsite={(website) => {
            const activeStu = getActiveStudentProfile();
            logStudyActivity({
              studentId: activeStu.id,
              studentName: activeStu.name,
              studentRegNumber: activeStu.regNumber,
              activityType: 'website_opened',
              activityTitle: `Explored: ${website.title}`,
              subject: website.subject,
              durationMinutes: 15,
              timestamp: 'Just now',
              details: `Opened educational portal: ${website.title} (${website.url})`,
            });
          }}
          onOpenPaperSavedModal={() => setShowPaperSavedModal(true)}
          onSubmitAssignment={handleSubmitAssignment}
          onUpdateProfile={handleUpdateStudentProfile}
          onLogout={handleLogout}
        />
      );
    }

    if (currentUserRole === 'teacher') {
      return (
        <TeacherDashboard
          profile={getActiveTeacherProfile()}
          accounts={accountsList}
          classes={classesList}
          notes={notesList}
          assignments={assignmentsList}
          videos={videosList}
          websites={websitesList}
          announcements={announcementsList}
          complaints={complaintsList}
          attendance={attendanceList}
          studyActivities={studyActivitiesList}
          policy={studyPolicy}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onAddVideo={handleAddVideo}
          onAddWebsite={handleAddWebsite}
          onDeleteWebsite={handleDeleteWebsite}
          onCreateAssignment={handleCreateAssignment}
          onGradeAssignment={handleGradeAssignment}
          onRecordAttendance={handleRecordAttendance}
          onPublishAnnouncement={handlePublishAnnouncement}
          onUpdateComplaint={handleUpdateComplaint}
          onUpdatePolicy={(p) => setStudyPolicy(p)}
          onLogout={handleLogout}
        />
      );
    }

    if (currentUserRole === 'parent') {
      return (
        <ParentDashboard
          profile={getActiveParentProfile()}
          assignments={assignmentsList}
          announcements={announcementsList}
          complaints={complaintsList}
          attendance={attendanceList}
          studyActivities={studyActivitiesList}
          websites={websitesList}
          notes={notesList}
          videos={videosList}
          policy={studyPolicy}
          studyMinutes={studyMinutesCount}
          onSubmitComplaint={(cmp) => setComplaintsList((prev) => [cmp, ...prev])}
          onLogout={handleLogout}
        />
      );
    }

    if (currentUserRole === 'principal') {
      return (
        <PrincipalDashboard
          profile={INITIAL_PRINCIPAL}
          accounts={accountsList}
          classes={classesList}
          notes={notesList}
          videos={videosList}
          websites={websitesList}
          assignments={assignmentsList}
          announcements={announcementsList}
          complaints={complaintsList}
          attendance={attendanceList}
          studyActivities={studyActivitiesList}
          policy={studyPolicy}
          onCreateAccount={handleCreateAccount}
          onUpdateAccount={handleUpdateAccount}
          onDeleteAccount={handleDeleteAccount}
          onToggleAccountStatus={handleToggleAccountStatus}
          onAddClass={handleAddClass}
          onAssignTeacherToClass={handleAssignTeacherToClass}
          onAddVideo={handleAddVideo}
          onAddNote={handleAddNote}
          onAddWebsite={handleAddWebsite}
          onDeleteWebsite={handleDeleteWebsite}
          onDeleteVideo={handleDeleteVideo}
          onDeleteNote={handleDeleteNote}
          onPublishAnnouncement={handlePublishAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
          onUpdatePolicy={(p) => setStudyPolicy(p)}
          onResolveComplaint={(id, res) => handleUpdateComplaint(id, 'Resolved', res)}
          onLogout={handleLogout}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 flex flex-col font-sans">
      {/* Viewport Preview Control Bar */}
      <div className="bg-sky-950 text-sky-200 text-xs px-4 py-1.5 flex items-center justify-between z-40 select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wide">StudyOn Prototype</span>
          <span className="text-[10px] text-sky-400 bg-sky-900/60 px-1.5 py-0.5 rounded">
            Student Educator v2.0 · Comprehensive Academic Platform
          </span>
        </div>

        <div className="flex items-center gap-1 bg-sky-900/80 p-0.5 rounded-lg border border-sky-800">
          <button
            onClick={() => setDevicePreview('desktop')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              devicePreview === 'desktop'
                ? 'bg-sky-500 text-white shadow-2xs'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span className="hidden sm:inline">Desktop Preview</span>
          </button>
          <button
            onClick={() => setDevicePreview('mobile')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              devicePreview === 'mobile'
                ? 'bg-sky-500 text-white shadow-2xs'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Android Frame</span>
          </button>
        </div>
      </div>

      {/* Main Container: Full viewport or Simulated Android Frame */}
      <div className="flex-1 flex justify-center items-stretch w-full overflow-x-hidden">
        {devicePreview === 'desktop' ? (
          <div className="w-full min-h-full">{renderCurrentView()}</div>
        ) : (
          <div className="py-6 px-2 flex justify-center w-full bg-slate-900/90 min-h-screen">
            {/* Sleek Android Device Bezel */}
            <div className="w-full max-w-[420px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 flex flex-col h-[860px] my-auto overflow-hidden relative">
              {/* Android Top Camera Punch Hole & Status Bar */}
              <div className="h-6 w-full flex items-center justify-between px-6 text-[11px] text-slate-400 select-none shrink-0 bg-slate-950">
                <span className="font-semibold text-white">09:41</span>
                <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 mx-auto" />
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Android Screen Body */}
              <div className="flex-1 bg-sky-50 overflow-y-auto rounded-3xl relative">
                {renderCurrentView()}
              </div>

              {/* Android Gesture Bar */}
              <div className="h-4 w-full flex items-center justify-center bg-slate-950 pt-1 shrink-0">
                <div className="w-32 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL MODALS */}
      {/* 1. PDF Notes Reader */}
      {readingNote && (
        <PDFReaderModal
          note={readingNote}
          onClose={() => setReadingNote(null)}
          onRecordReading={() => setNotesReadCount((prev) => prev + 1)}
        />
      )}

      {/* 2. Educational Video Player */}
      {watchingVideo && (
        <VideoPlayerModal
          video={watchingVideo}
          onClose={() => setWatchingVideo(null)}
        />
      )}

      {/* 3. Study Mode Focus Experience & Pre-dialog */}
      {(showStudyModePreview || isStudyModeActive) && (
        <StudyModeModal
          policy={studyPolicy}
          isActive={isStudyModeActive}
          onActivate={() => {
            setIsStudyModeActive(true);
            setShowStudyModePreview(false);
          }}
          onDeactivate={handleDeactivateStudyMode}
          onClosePreview={() => setShowStudyModePreview(false)}
        />
      )}

      {/* 4. Paper Saved Environmental Estimate Modal */}
      {showPaperSavedModal && (
        <PaperSavedModal
          isOpen={showPaperSavedModal}
          onClose={() => setShowPaperSavedModal(false)}
          notesReadCount={notesReadCount}
          assignmentsSubmittedCount={assignmentsList.filter((a) => a.status !== 'pending').length}
          studyMinutesCount={studyMinutesCount}
        />
      )}
    </div>
  );
}
