export type UserRole = 'student' | 'teacher' | 'parent' | 'principal';

export interface StudentProfile {
  id: string;
  name: string;
  regNumber: string;
  collegeName: string;
  course: string;
  semester: string;
  section: string;
  rollNo: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  attendanceRate: number; // e.g. 92%
}

export interface TeacherProfile {
  id: string;
  name: string;
  username: string;
  facultyId: string;
  collegeName: string;
  department: string;
  designation: string;
  subjects: string[];
  email: string;
  phone: string;
}

export interface ParentProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  relationship: string;
  linkedChild: {
    name: string;
    regNumber: string;
    course: string;
    semester: string;
    collegeName: string;
    attendanceRate: number;
    gpa: string;
  };
}

export interface PrincipalProfile {
  id: string;
  name: string;
  username: string;
  collegeName: string;
  campusCode: string;
  officeEmail: string;
  designation: string;
}

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  course: string;
  facultyName: string;
  uploadDate: string;
  pagesCount: number;
  fileSize: string;
  downloadAllowed: boolean;
  summary: string;
  contentSnippet: string[];
}

export interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  course: string;
  teacherName: string;
  dueDate: string;
  totalPoints: number;
  instructions: string;
  status: 'pending' | 'submitted' | 'reviewed';
  submission?: {
    submittedAt: string;
    textContent?: string;
    fileName?: string;
    grade?: string;
    pointsScored?: number;
    teacherFeedback?: string;
  };
}

export interface LearningVideoItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  teacherName: string;
  duration: string;
  videoUrl: string; // embed or sample or YouTube
  isYouTube?: boolean;
  playlistTitle?: string;
  description: string;
  addedByRole?: 'Teacher' | 'Principal';
  keyTimestamps: { time: string; label: string }[];
}

export interface EducationalWebsiteItem {
  id: string;
  title: string;
  url: string;
  subject: string;
  category: string;
  description: string;
  addedBy: string;
  addedByRole: 'Principal' | 'Teacher';
  addedDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNumber: string;
  date: string;
  subject: string;
  status: 'Present' | 'Absent' | 'Late';
  recordedBy: string;
  remarks?: string;
}

export interface CollegeClass {
  id: string;
  name: string;
  course: string;
  semester: string;
  section: string;
  assignedTeacherId: string;
  assignedTeacherName: string;
  subject: string;
  studentCount: number;
}

export interface StudentStudyActivityItem {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNumber: string;
  activityType:
    | 'video_watched'
    | 'website_opened'
    | 'study_material_accessed'
    | 'assignment_submitted'
    | 'assignment_viewed'
    | 'study_mode_session';
  activityTitle: string;
  subject: string;
  durationMinutes?: number;
  timestamp: string;
  details: string;
  accessStatus?: 'Allowed' | 'Blocked' | 'Restricted';
  blockedReason?: string;
  resourceId?: string;
  resourceType?: 'website' | 'video' | 'note' | 'assignment' | 'study_mode';
}

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  identifier: string; // unique username or registration number
  password: string;
  status: 'Active' | 'Suspended';
  createdAt: string;
  email: string;
  phone?: string;
  dept?: string;
  studentData?: {
    course: string;
    semester: string;
    section: string;
    rollNo: string;
    attendanceRate: number;
  };
  teacherData?: {
    facultyId: string;
    department: string;
    designation: string;
    subjects: string[];
  };
  parentData?: {
    relationship: string;
    linkedStudentRegNumber: string;
    linkedStudentName: string;
  };
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  publishDate: string;
  author: string;
  authorRole: 'Principal' | 'Teacher' | 'Dean';
  department: string;
  audience: 'All' | 'Students' | 'Parents' | 'Faculty';
  isImportant?: boolean;
  isRead?: boolean;
}

export interface ComplaintItem {
  id: string;
  ticketNumber: string;
  submittedBy: string;
  submitterRole: 'student' | 'parent';
  contactEmail: string;
  category: 'Academics' | 'Infrastructure' | 'Study Mode Policy' | 'Digital Notes' | 'Other';
  subject: string;
  description: string;
  submittedDate: string;
  status: 'Under Review' | 'In Progress' | 'Resolved';
  assignedTo?: string;
  resolutionNote?: string;
}

export interface StudyModePolicy {
  policyName: string;
  version: string;
  lastUpdated: string;
  allowedApps: { name: string; category: string; description: string }[];
  blockedCategories: string[];
  maxDurationMinutes: number;
  curfewHours: string;
  collegeApprovalStatus: 'Approved' | 'Pending Review';
}

export interface SearchResultItem {
  id: string;
  topic: string;
  subject: string;
  curriculumModule: string;
  definition: string;
  keyPoints: string[];
  recommendedNotesId?: string;
}

export type RestrictionScope = 'institution' | 'class' | 'student';
export type ResourceKind = 'website' | 'video' | 'note' | 'category' | 'all_external';

export interface ResourceRestrictionRule {
  id: string;
  scope: RestrictionScope;
  targetId?: string; // classId e.g. 'cls-01' or studentRegNumber e.g. 'STU-2026-4401'
  targetLabel: string; // "Institution-wide", "Class CSE-6B", "Aarav Verma"
  resourceType: ResourceKind;
  resourceId?: string;
  resourceTitle: string;
  category?: string;
  action: 'block' | 'allow';
  reason: string;
  createdByRole: 'principal' | 'parent' | 'teacher';
  createdByName: string;
  createdAt: string;
  startTime?: string; // e.g. "09:00"
  endTime?: string; // e.g. "17:00"
  isActive: boolean;
}

export interface StudentLiveActivityStatus {
  studentRegNumber: string;
  studentName: string;
  isOnline: boolean;
  lastActiveTimestamp: string;
  currentResource?: {
    type: 'website' | 'video' | 'note' | 'assignment' | 'study_mode';
    title: string;
    urlOrSubject: string;
    startedAt: string;
  };
}

export interface ResourceAccessRequest {
  id: string;
  studentName: string;
  studentRegNumber: string;
  resourceId?: string;
  resourceTitle: string;
  resourceType: string;
  reason: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  responseNote?: string;
}

export interface RestrictionAuditLogItem {
  id: string;
  action: 'created' | 'modified' | 'deleted' | 'override' | 'access_denied';
  ruleSummary: string;
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  details: string;
}

export interface AccessControlPolicyConfig {
  allowParentOverrideTeacher: boolean;
  enableLessonRestrictedMode: boolean;
  allowlistOnlyMode: boolean;
  defaultPriorityOrder: ('principal' | 'parent' | 'teacher')[];
  dataRetentionDays: number;
}

