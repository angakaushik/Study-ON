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
  ClassWatchClass,
  ClassWatchStudent,
  ClassWatchAlert,
  ClassWatchTimelineEvent,
  ClassWatchStudentStatus,
  AppThemeId,
  THEME_PRESETS,
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
  INITIAL_CLASSWATCH_CLASSES,
  INITIAL_CLASSWATCH_STUDENTS,
  INITIAL_CLASSWATCH_ALERTS,
  INITIAL_CLASSWATCH_TIMELINE,
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
import { ChromeExtensionModal } from './components/ChromeExtensionModal.tsx';
import { ThemeSelectorModal } from './components/ThemeSelectorModal.tsx';
import { AccountModal } from './components/AccountModal.tsx';
import { dataService, UserSession } from './lib/dataService.ts';
import {
  isValidHostname,
  normalizeDomain,
  isDomainAllowed,
  getDomainAlertSeverity,
} from './utils/domainRules.ts';
import {
  playAlertChime,
  playWarnTone,
  playLockSound,
  playSuccessChime,
} from './utils/soundEffects.ts';
import { Smartphone, Monitor, Shield, Palette, Sparkles, User, LogOut } from 'lucide-react';

export default function App() {
  // App Navigation Flow State
  const [appStage, setAppStage] = useState<'splash' | 'role_select' | 'role_login' | 'dashboard'>('splash');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  // Active Authenticated Account (isolated per tab in sessionStorage)
  const [currentAccount, setCurrentAccount] = useState<UserSession | null>(null);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);

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

  // ClassWatch Digital Classroom Monitoring Central State
  const [classWatchClassesList, setClassWatchClassesList] = useState<ClassWatchClass[]>(INITIAL_CLASSWATCH_CLASSES);
  const [activeClassWatchCode, setActiveClassWatchCode] = useState<string>('4892');
  const [classWatchStudentsList, setClassWatchStudentsList] = useState<ClassWatchStudent[]>(INITIAL_CLASSWATCH_STUDENTS);
  const [classWatchAlertsList, setClassWatchAlertsList] = useState<ClassWatchAlert[]>(INITIAL_CLASSWATCH_ALERTS);
  const [classWatchTimelineList, setClassWatchTimelineList] = useState<ClassWatchTimelineEvent[]>(INITIAL_CLASSWATCH_TIMELINE);
  const [classWatchSoundEnabled, setClassWatchSoundEnabled] = useState<boolean>(true);
  const [showChromeExtensionModal, setShowChromeExtensionModal] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<AppThemeId>('classwatch-green');
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  // Synchronize active theme attribute on root element
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // Initialize session and sync with dataService across browser tabs
  React.useEffect(() => {
    let mounted = true;

    const initData = async () => {
      try {
        const [sess, classes, students, alerts, timeline] = await Promise.all([
          dataService.getSession(),
          dataService.listClasses(),
          dataService.listStudents(),
          dataService.listAlerts(),
          dataService.getTimeline(''),
        ]);
        if (!mounted) return;

        if (classes.length > 0) {
          setClassWatchClassesList(classes);
          if (!activeClassWatchCode || !classes.some((c) => c.code === activeClassWatchCode)) {
            setActiveClassWatchCode(classes[0].code);
          }
        }
        if (students.length > 0) {
          setClassWatchStudentsList(students);
        }
        if (alerts.length > 0) {
          setClassWatchAlertsList(alerts);
        }
        if (timeline.length > 0) {
          setClassWatchTimelineList(timeline);
        }

        if (sess) {
          setCurrentAccount(sess);
          setCurrentUserRole(sess.role);
          setSelectedRole(sess.role);
          setAppStage('dashboard');
        }
      } catch (err) {
        console.error('Failed to init data from dataService:', err);
      }
    };

    initData();

    // Cross-tab real-time sync subscription
    const unsubscribe = dataService.subscribe(async (event) => {
      try {
        const [classes, students, alerts, timeline] = await Promise.all([
          dataService.listClasses(),
          dataService.listStudents(),
          dataService.listAlerts(),
          dataService.getTimeline(''),
        ]);
        if (!mounted) return;

        setClassWatchClassesList(classes);
        setClassWatchStudentsList(students);
        setClassWatchAlertsList(alerts);
        if (timeline.length > 0) {
          setClassWatchTimelineList(timeline);
        }

        if (event.type === 'ALERT_CREATED' && classWatchSoundEnabled) {
          playAlertChime();
        } else if (event.type === 'STUDENT_LOCKED' && classWatchSoundEnabled) {
          playLockSound();
        } else if (event.type === 'STUDENT_WARNED' && classWatchSoundEnabled) {
          playWarnTone();
        }
      } catch (err) {
        console.error('Error in subscription sync:', err);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [classWatchSoundEnabled]);

  // Handlers for Navigation & Login
  const handleSelectRole = (role: UserRole) => {
    // If already logged in to this or another role, redirect to dashboard if same or prompt
    if (currentAccount) {
      setCurrentUserRole(currentAccount.role);
      setSelectedRole(currentAccount.role);
      setAppStage('dashboard');
      return;
    }
    setSelectedRole(role);
    setAppStage('role_login');
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const demoCreds: Record<UserRole, { id: string; pass: string }> = {
      student: { id: 'student1', pass: 'student123' },
      teacher: { id: 'teacher1', pass: 'teacher123' },
      parent: { id: 'parent1', pass: 'parent123' },
      principal: { id: 'principal1', pass: 'admin123' },
    };
    try {
      const creds = demoCreds[role];
      const session = await dataService.login(creds.id, creds.pass);
      setSelectedRole(role);
      setCurrentUserRole(role);
      setCurrentAccount(session);
      setAppStage('dashboard');
    } catch {
      setSelectedRole(role);
      setCurrentUserRole(role);
      const defaultAcc = accountsList.find((a) => a.role === role);
      if (defaultAcc) {
        const sess: UserSession = {
          userId: defaultAcc.identifier,
          name: defaultAcc.name,
          role: defaultAcc.role,
          identifier: defaultAcc.identifier,
          email: defaultAcc.email,
        };
        setCurrentAccount(sess);
      }
      setAppStage('dashboard');
    }
  };

  const handleLoginSuccess = (_role: UserRole, session?: UserSession) => {
    const currentSess = session || null;
    if (currentSess) {
      // Role protection: logged-in role determines allowed views
      setCurrentUserRole(currentSess.role);
      setSelectedRole(currentSess.role);
      setCurrentAccount(currentSess);
    } else {
      setCurrentUserRole(_role);
      setSelectedRole(_role);
    }
    setAppStage('dashboard');
  };

  const handleLogout = async () => {
    await dataService.logout();
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

  // ==========================================
  // ClassWatch Digital Classroom Monitoring Handlers (Connected to dataService)
  // ==========================================

  const handleSelectClassWatch = (code: string) => {
    setActiveClassWatchCode(code);
  };

  const handleCreateClassWatch = async (name: string) => {
    try {
      const teacher = getActiveTeacherProfile();
      const newClass = await dataService.createClass({
        name,
        teacherId: teacher.id,
        teacherName: teacher.name,
      });
      setActiveClassWatchCode(newClass.code);
      const classes = await dataService.listClasses();
      setClassWatchClassesList(classes);
    } catch (err) {
      console.error('Failed to create classroom:', err);
    }
  };

  const handleAddAllowedDomain = async (domain: string) => {
    const norm = normalizeDomain(domain);
    if (!norm) return;
    try {
      await dataService.addAllowedSite(activeClassWatchCode, norm);
      const [classes, students] = await Promise.all([
        dataService.listClasses(),
        dataService.listStudents(),
      ]);
      setClassWatchClassesList(classes);
      setClassWatchStudentsList(students);
    } catch (err) {
      console.error('Failed to add allowed site:', err);
    }
  };

  const handleRemoveAllowedDomain = async (domain: string) => {
    try {
      await dataService.removeAllowedSite(activeClassWatchCode, domain);
      const [classes, students] = await Promise.all([
        dataService.listClasses(),
        dataService.listStudents(),
      ]);
      setClassWatchClassesList(classes);
      setClassWatchStudentsList(students);
    } catch (err) {
      console.error('Failed to remove allowed site:', err);
    }
  };

  const handleReportDomain = async (domain: string) => {
    try {
      const activeStudent = getActiveStudentProfile();
      const res = await dataService.setStudentSite(activeStudent.regNumber, domain);
      if (res.alertCreated && classWatchSoundEnabled) {
        playAlertChime();
      }
      const [students, alerts, timeline] = await Promise.all([
        dataService.listStudents(),
        dataService.listAlerts(),
        dataService.getTimeline(''),
      ]);
      setClassWatchStudentsList(students);
      setClassWatchAlertsList(alerts);
      if (timeline.length > 0) {
        setClassWatchTimelineList(timeline);
      }
    } catch (err) {
      console.error('Failed to report domain:', err);
    }
  };

  const handleToggleLockStudent = async (studentId: string) => {
    try {
      const student = classWatchStudentsList.find((s) => s.id === studentId || s.regNumber === studentId);
      if (!student) return;
      if (student.isLocked) {
        await dataService.unlock(student.regNumber);
      } else {
        await dataService.lock(student.regNumber);
        if (classWatchSoundEnabled) playLockSound();
      }
      const students = await dataService.listStudents();
      setClassWatchStudentsList(students);
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    }
  };

  const handleWarnStudent = async (studentId: string, customMessage?: string) => {
    try {
      const student = classWatchStudentsList.find((s) => s.id === studentId || s.regNumber === studentId);
      if (!student) return;
      await dataService.warn(student.regNumber, customMessage);
      if (classWatchSoundEnabled) playWarnTone();
      const students = await dataService.listStudents();
      setClassWatchStudentsList(students);
    } catch (err) {
      console.error('Failed to warn student:', err);
    }
  };

  const handleDismissWarning = async () => {
    try {
      const activeStudent = getActiveStudentProfile();
      await dataService.warn(activeStudent.regNumber, '');
      const students = await dataService.listStudents();
      setClassWatchStudentsList(students);
    } catch (err) {
      console.error('Failed to dismiss warning:', err);
    }
  };

  const handleJoinClassWatch = async (classCode: string): Promise<{ success: boolean; message: string }> => {
    try {
      const activeStudent = getActiveStudentProfile();
      await dataService.joinClass({
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        studentRegNumber: activeStudent.regNumber,
        classCode,
      });
      setActiveClassWatchCode(classCode);
      const students = await dataService.listStudents();
      setClassWatchStudentsList(students);
      return { success: true, message: `Successfully joined classroom ${classCode}!` };
    } catch (err: any) {
      return { success: false, message: err?.message || `Could not join classroom ${classCode}` };
    }
  };

  const handleLeaveClassWatch = async () => {
    try {
      const activeStudent = getActiveStudentProfile();
      await dataService.leaveClass(activeStudent.regNumber);
      const students = await dataService.listStudents();
      setClassWatchStudentsList(students);
    } catch (err) {
      console.error('Failed to leave classroom:', err);
    }
  };

  const handleRemoveClassWatchStudent = async (studentId: string) => {
    try {
      const student = classWatchStudentsList.find((s) => s.id === studentId || s.regNumber === studentId);
      if (!student) return;
      await dataService.removeStudent(student.regNumber);
      const students = await dataService.listStudents();
      setClassWatchStudentsList(students);
    } catch (err) {
      console.error('Failed to remove student:', err);
    }
  };

  const handleAllowStudent = async (studentId: string) => {
    try {
      const student = classWatchStudentsList.find((s) => s.id === studentId || s.regNumber === studentId);
      if (!student) return;
      await dataService.allowStudent(student.regNumber);
      const students = await dataService.listStudents();
      setClassWatchStudentsList(students);
    } catch (err) {
      console.error('Failed to allow student:', err);
    }
  };

  const handleResetStudentPassword = async (studentRegNumber: string, newPass: string) => {
    try {
      await dataService.resetStudentPassword(studentRegNumber, newPass);
    } catch (err) {
      console.error('Failed to reset student password:', err);
    }
  };

  const handleRegenerateParentCode = () => {
    // Parent link code is persistent and securely assigned per student
  };

  const handleLinkChild = async (studentId: string, parentCode: string): Promise<{ success: boolean; message: string }> => {
    try {
      const parentId = currentAccount?.userId || 'parent1';
      const linked = await dataService.linkParent(parentId, studentId, parentCode);
      const [students, timeline] = await Promise.all([
        dataService.listStudents(),
        dataService.getTimeline(studentId),
      ]);
      setClassWatchStudentsList(students);
      if (timeline.length > 0) {
        setClassWatchTimelineList(timeline);
      }
      return { success: true, message: `Successfully linked ${linked.name}!` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to link child.' };
    }
  };

  const handleUnlinkChild = (_studentRegNumber: string) => {
    // Handled locally
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dataService.dismissAlert(alertId);
      const alerts = await dataService.listAlerts();
      setClassWatchAlertsList(alerts);
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const handleClearAlerts = async () => {
    try {
      await dataService.clearAlerts(activeClassWatchCode);
      const alerts = await dataService.listAlerts();
      setClassWatchAlertsList(alerts);
    } catch (err) {
      console.error('Failed to clear alerts:', err);
    }
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
        id: currentAccount.userId,
        name: currentAccount.name,
        regNumber: currentAccount.identifier || currentAccount.userId,
        collegeName: 'St. Jude Institute of Technology & Sciences',
        course: currentAccount.studentData?.course || studentProfile.course,
        semester: currentAccount.studentData?.semester || studentProfile.semester,
        section: currentAccount.studentData?.section || studentProfile.section,
        rollNo: currentAccount.studentData?.rollNo || studentProfile.rollNo,
        email: currentAccount.email || `${currentAccount.userId}@college.edu`,
        phone: studentProfile.phone,
        attendanceRate: currentAccount.studentData?.attendanceRate || studentProfile.attendanceRate,
      };
    }
    return studentProfile;
  };

  const getActiveTeacherProfile = (): TeacherProfile => {
    if (currentAccount && currentAccount.role === 'teacher') {
      return {
        id: currentAccount.userId,
        name: currentAccount.name,
        username: currentAccount.identifier || currentAccount.userId,
        facultyId: currentAccount.teacherData?.facultyId || currentAccount.userId,
        collegeName: 'St. Jude Institute of Technology & Sciences',
        department: currentAccount.teacherData?.department || INITIAL_TEACHER.department,
        designation: currentAccount.teacherData?.designation || INITIAL_TEACHER.designation,
        subjects: currentAccount.teacherData?.subjects || INITIAL_TEACHER.subjects,
        email: currentAccount.email || `${currentAccount.userId}@college.edu`,
        phone: INITIAL_TEACHER.phone,
      };
    }
    return INITIAL_TEACHER;
  };

  const getActiveParentProfile = (): ParentProfile => {
    if (currentAccount && currentAccount.role === 'parent') {
      const linkedFromSession = currentAccount.parentData?.linkedChildren?.[0];
      const linkedReg = linkedFromSession?.studentRegNumber || 'STU-2026-4401';
      const studentMatch = classWatchStudentsList.find(
        (s) => s.regNumber.toLowerCase() === linkedReg.toLowerCase()
      ) || classWatchStudentsList[0];

      return {
        id: currentAccount.userId,
        name: currentAccount.name,
        username: currentAccount.identifier || currentAccount.userId,
        email: currentAccount.email || `${currentAccount.userId}@parent.edu`,
        phone: INITIAL_PARENT.phone,
        relationship: currentAccount.parentData?.relationship || 'Guardian',
        linkedChild: {
          name: studentMatch ? studentMatch.name : linkedFromSession?.studentName || 'Aarav Verma',
          regNumber: studentMatch ? studentMatch.regNumber : linkedReg,
          course: 'B.Tech in Computer Science & Engineering',
          semester: 'Semester 6',
          collegeName: 'St. Jude Institute of Technology & Sciences',
          attendanceRate: 94,
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
          classWatchClasses={classWatchClassesList}
          classWatchStudentState={classWatchStudentsList.find(
            (s) => s.regNumber.toLowerCase() === getActiveStudentProfile().regNumber.toLowerCase()
          )}
          soundEnabled={classWatchSoundEnabled}
          onJoinClassWatch={handleJoinClassWatch}
          onLeaveClassWatch={handleLeaveClassWatch}
          onReportDomain={handleReportDomain}
          onRegenerateParentCode={handleRegenerateParentCode}
          onDismissWarning={handleDismissWarning}
          onOpenExtensionModal={() => setShowChromeExtensionModal(true)}
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
          classWatchClasses={classWatchClassesList}
          activeClassWatchCode={activeClassWatchCode}
          classWatchStudents={classWatchStudentsList}
          classWatchAlerts={classWatchAlertsList}
          soundEnabled={classWatchSoundEnabled}
          onToggleSound={() => setClassWatchSoundEnabled((prev) => !prev)}
          onSelectClassWatch={handleSelectClassWatch}
          onCreateClassWatch={handleCreateClassWatch}
          onAddAllowedDomain={handleAddAllowedDomain}
          onRemoveAllowedDomain={handleRemoveAllowedDomain}
          onWarnStudent={handleWarnStudent}
          onToggleLockStudent={handleToggleLockStudent}
          onResetStudentPassword={handleResetStudentPassword}
          onRemoveClassWatchStudent={handleRemoveClassWatchStudent}
          onAllowStudent={handleAllowStudent}
          onDismissAlert={handleDismissAlert}
          onClearAlerts={handleClearAlerts}
          onOpenExtensionModal={() => setShowChromeExtensionModal(true)}
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
          classWatchStudents={classWatchStudentsList}
          classWatchTimeline={classWatchTimelineList}
          classWatchAlerts={classWatchAlertsList}
          onLinkChild={handleLinkChild}
          onUnlinkChild={handleUnlinkChild}
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
          classWatchClasses={classWatchClassesList}
          classWatchStudents={classWatchStudentsList}
          classWatchAlerts={classWatchAlertsList}
        />
      );
    }

    return null;
  };

  const currentPreset = THEME_PRESETS.find((t) => t.id === activeTheme) || THEME_PRESETS[0];

  const handleCycleTheme = () => {
    const currentIndex = THEME_PRESETS.findIndex((t) => t.id === activeTheme);
    const nextIndex = (currentIndex + 1) % THEME_PRESETS.length;
    setActiveTheme(THEME_PRESETS[nextIndex].id);
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors"
      style={{
        backgroundColor: 'var(--theme-bg-main)',
        color: 'var(--theme-text-main)',
      }}
    >
      {/* Viewport Preview & ClassWatch Green Theme Control Bar */}
      <div
        className="text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-40 select-none border-b transition-colors"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          color: 'var(--theme-text-muted)',
          borderColor: 'var(--theme-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentAccount) {
                setAppStage('dashboard');
              } else {
                setAppStage('role_select');
              }
            }}
            className="flex items-center gap-1.5 font-bold text-white tracking-wide hover:opacity-90 transition-opacity cursor-pointer text-left"
            title="Return to Home / Dashboard"
          >
            <Shield className="w-4 h-4 text-[var(--theme-accent)]" />
            <span>StudyOn + ClassWatch Suite</span>
          </button>
          <span
            className="hidden lg:inline-block text-[10px] px-2.5 py-0.5 rounded-full font-semibold border"
            style={{
              backgroundColor: 'var(--theme-tag-bg)',
              color: 'var(--theme-accent)',
              borderColor: 'var(--theme-border-strong)',
            }}
          >
            Digital Classroom Monitoring & Academic Portal
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Logged-in User Info & Account Actions */}
          {currentAccount && (
            <div className="flex items-center gap-1.5 mr-1">
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px]"
                style={{
                  backgroundColor: 'var(--theme-card-elevated)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-main)',
                }}
              >
                <User className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                <span className="font-bold truncate max-w-[120px]">{currentAccount.name}</span>
                <span
                  className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold"
                  style={{
                    backgroundColor: 'var(--theme-tag-bg)',
                    color: 'var(--theme-accent)',
                  }}
                >
                  {currentAccount.role}
                </span>
              </div>

              <button
                onClick={() => setShowAccountModal(true)}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--theme-card-elevated)',
                  borderColor: 'var(--theme-border-strong)',
                  color: 'var(--theme-accent)',
                }}
                title="Account Settings & Password"
              >
                <User className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 text-red-300 hover:text-red-200 border-red-900/60 bg-red-950/40 hover:bg-red-900/40 transition-colors cursor-pointer"
                title="Sign out of this session"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}

          {/* Chrome Extension Modal Trigger */}
          <button
            onClick={() => setShowChromeExtensionModal(true)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors border"
            style={{
              backgroundColor: 'var(--theme-card-elevated)',
              color: 'var(--theme-accent)',
              borderColor: 'var(--theme-border-strong)',
            }}
          >
            Extension V3
          </button>

          {/* Theme Gallery & Selector Trigger */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--theme-card-elevated)',
              borderColor: 'var(--theme-border-strong)',
              color: 'var(--theme-text-main)',
            }}
            title="Open Green Theme Gallery"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shadow-xs shrink-0"
              style={{ backgroundColor: currentPreset.accentHex }}
            />
            <Palette className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
            <span className="hidden sm:inline font-bold">{currentPreset.name}</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1"
              style={{
                backgroundColor: 'var(--theme-tag-bg)',
                color: 'var(--theme-accent)',
              }}
            >
              Gallery
            </span>
          </button>

          {/* Quick Next Theme Cycle Button */}
          <button
            onClick={handleCycleTheme}
            className="px-2 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--theme-card-hover)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-accent)',
            }}
            title="Cycle next green theme"
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="hidden md:inline">Cycle Theme</span>
          </button>

          {/* Device Preview Toggle */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg border"
            style={{
              backgroundColor: 'var(--theme-bg-main)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                devicePreview === 'desktop'
                  ? 'bg-[var(--theme-accent)] text-[var(--theme-bg-main)] font-bold shadow-2xs'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                devicePreview === 'mobile'
                  ? 'bg-[var(--theme-accent)] text-[var(--theme-bg-main)] font-bold shadow-2xs'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Android</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Full viewport or Simulated Android Frame */}
      <div className="flex-1 flex justify-center items-stretch w-full overflow-x-hidden">
        {devicePreview === 'desktop' ? (
          <div className="w-full min-h-full">{renderCurrentView()}</div>
        ) : (
          <div
            className="py-6 px-2 flex justify-center w-full min-h-screen"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
          >
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
              <div
                className="flex-1 overflow-y-auto rounded-3xl relative"
                style={{ backgroundColor: 'var(--theme-bg-main)' }}
              >
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

      {/* 5. Chrome Extension Manifest V3 Hub */}
      {showChromeExtensionModal && (
        <ChromeExtensionModal
          isOpen={showChromeExtensionModal}
          onClose={() => setShowChromeExtensionModal(false)}
        />
      )}

      {/* 6. Green Theme Gallery Modal */}
      <ThemeSelectorModal
        isOpen={showThemeModal}
        activeTheme={activeTheme}
        onSelectTheme={(themeId) => setActiveTheme(themeId)}
        onClose={() => setShowThemeModal(false)}
      />

      {/* 7. User Account & Password Modal */}
      <AccountModal
        isOpen={showAccountModal}
        session={currentAccount}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
}
