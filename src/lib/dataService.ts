import {
  UserRole,
  ClassWatchClass,
  ClassWatchStudent,
  ClassWatchAlert,
  ClassWatchTimelineEvent,
  ClassWatchStudentStatus,
} from '../types.ts';
import {
  isValidHostname,
  normalizeDomain,
  isDomainAllowed,
  getDomainAlertSeverity,
} from '../utils/domainRules.ts';

export interface UserSession {
  userId: string;
  name: string;
  role: UserRole;
  identifier: string;
  email?: string;
  studentData?: {
    regNumber: string;
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
    linkedChildren: Array<{
      studentId: string;
      studentRegNumber: string;
      studentName: string;
    }>;
  };
}

export type DataServiceEventType =
  | 'USER_REGISTERED'
  | 'CLASS_CREATED'
  | 'CLASS_UPDATED'
  | 'STUDENT_JOINED'
  | 'STUDENT_LEFT'
  | 'STUDENT_UPDATED'
  | 'STUDENT_REMOVED'
  | 'STUDENT_ALLOWED'
  | 'STUDENT_LOCKED'
  | 'STUDENT_WARNED'
  | 'STUDENT_PRESENCE'
  | 'ALERT_CREATED'
  | 'ALERT_DISMISSED'
  | 'ALERTS_CLEARED'
  | 'TIMELINE_UPDATED'
  | 'DATA_SYNC';

export interface DataServiceEvent {
  type: DataServiceEventType;
  payload?: any;
  timestamp: number;
  originTabId: string;
}

export interface IDataService {
  register(params: { id: string; name: string; role: UserRole; password: string }): Promise<UserSession>;
  login(id: string, password: string): Promise<UserSession>;
  logout(): Promise<void>;
  getSession(): Promise<UserSession | null>;
  createClass(params: { name: string; teacherId: string; teacherName: string }): Promise<ClassWatchClass>;
  joinClass(params: { studentId: string; studentName: string; studentRegNumber: string; classCode: string }): Promise<ClassWatchStudent>;
  leaveClass(studentId: string): Promise<void>;
  listStudents(classCode?: string): Promise<ClassWatchStudent[]>;
  sendPresence(studentId: string, isOffline?: boolean): Promise<void>;
  setStudentSite(studentId: string, domain: string): Promise<{ status: ClassWatchStudentStatus; alertCreated?: ClassWatchAlert }>;
  warn(studentId: string, customMessage?: string): Promise<void>;
  lock(studentId: string): Promise<void>;
  unlock(studentId: string): Promise<void>;
  removeStudent(studentId: string): Promise<void>;
  allowStudent(studentId: string): Promise<void>;
  addAllowedSite(classCode: string, domain: string): Promise<string[]>;
  removeAllowedSite(classCode: string, domain: string): Promise<string[]>;
  listAlerts(classCode?: string): Promise<ClassWatchAlert[]>;
  dismissAlert(alertId: string): Promise<void>;
  clearAlerts(classCode: string): Promise<void>;
  linkParent(parentId: string, childIdOrReg: string, linkCode: string): Promise<ClassWatchStudent>;
  getTimeline(studentRegNumberOrId: string): Promise<ClassWatchTimelineEvent[]>;
  changePassword(userId: string, oldPass: string, newPass: string): Promise<void>;
  resetStudentPassword(studentIdOrReg: string, newPass: string): Promise<void>;
  subscribe(callback: (event: DataServiceEvent) => void): () => void;
  // Utility methods
  getClass(classCode: string): Promise<ClassWatchClass | null>;
  listClasses(): Promise<ClassWatchClass[]>;
}

// ==========================================
// Cryptography: PBKDF2 with crypto.subtle
// ==========================================

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const enc = new TextEncoder();
  const salt = saltHex
    ? hexToBytes(saltHex)
    : globalThis.crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const derivedKey = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return {
    hash: bytesToHex(new Uint8Array(derivedKey)),
    salt: bytesToHex(salt),
  };
}

export async function verifyPassword(password: string, expectedHash: string, saltHex: string): Promise<boolean> {
  const { hash } = await hashPassword(password, saltHex);
  return timingSafeEqual(hash, expectedHash);
}

// ==========================================
// Local Storage & Shared State Schemas
// ==========================================

const SHARED_STORAGE_KEY = 'classwatch_shared_db_v1';
const SESSION_STORAGE_KEY = 'classwatch_session_v1';
const LOGIN_ATTEMPTS_KEY = 'classwatch_login_attempts_v1';
const BROADCAST_CHANNEL_NAME = 'classwatch_cross_tab_bus';

export interface StoredUser {
  id: string;
  identifier: string; // Lowercase
  name: string;
  role: UserRole;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  studentData?: {
    regNumber: string;
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
    linkedChildren: Array<{
      studentId: string;
      studentRegNumber: string;
      studentName: string;
    }>;
  };
}

export interface SharedDatabase {
  version: number;
  users: StoredUser[];
  classes: ClassWatchClass[];
  students: ClassWatchStudent[];
  alerts: ClassWatchAlert[];
  timeline: ClassWatchTimelineEvent[];
  removedStudentIds: string[];
}

// Generate unique tab ID for session isolation
const TAB_ID = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

export class LocalDataService implements IDataService {
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<(event: DataServiceEvent) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.setupBroadcastChannel();
    this.setupStorageFallback();
    this.ensureInitialized();
  }

  private setupBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (messageEvent) => {
          const event: DataServiceEvent = messageEvent.data;
          if (event && event.originTabId !== TAB_ID) {
            this.notifySubscribers(event);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel initialization failed, using storage event fallback', e);
      }
    }
  }

  private setupStorageFallback() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (storageEvent) => {
        if (storageEvent.key === SHARED_STORAGE_KEY) {
          this.notifySubscribers({
            type: 'DATA_SYNC',
            timestamp: Date.now(),
            originTabId: 'external',
          });
        }
      });
    }
  }

  private notifySubscribers(event: DataServiceEvent) {
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    }
  }

  private broadcast(type: DataServiceEventType, payload?: any) {
    const event: DataServiceEvent = {
      type,
      payload,
      timestamp: Date.now(),
      originTabId: TAB_ID,
    };
    // Send to other tabs
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (e) {
        // Ignored
      }
    }
    // Also trigger in current tab immediately
    this.notifySubscribers(event);
  }

  public subscribe(callback: (event: DataServiceEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // ==========================================
  // Storage read / write helpers
  // ==========================================

  private getDB(): SharedDatabase {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.getDefaultDB();
    }
    try {
      const raw = window.localStorage.getItem(SHARED_STORAGE_KEY);
      if (!raw) {
        const initial = this.getDefaultDB();
        this.saveDB(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return this.getDefaultDB();
    }
  }

  private saveDB(db: SharedDatabase) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save shared database to localStorage', e);
    }
  }

  private getDefaultDB(): SharedDatabase {
    // Seed default data with pre-calculated PBKDF2 hash for password 'demo123'
    // Salt: 00000000000000000000000000000000 (16 zero bytes)
    // Hash: 627c6ef39bc7ce773809e2423467a5f006f15819c42dcc6412197683a1915340
    const demoSalt = '00000000000000000000000000000000';
    const demoHash = '627c6ef39bc7ce773809e2423467a5f006f15819c42dcc6412197683a1915340';

    const defaultUsers: StoredUser[] = [
      {
        id: 'acc-teacher-1',
        identifier: 'teacher.menon',
        name: 'Dr. Rajesh Menon',
        role: 'teacher',
        passwordHash: demoHash,
        passwordSalt: demoSalt,
        createdAt: 'Oct 15, 2026',
        teacherData: {
          facultyId: 'FAC-2026-8802',
          department: 'Computer Science & Engineering',
          designation: 'Associate Professor',
          subjects: ['Data Structures & Algorithms', 'Database Management Systems'],
        },
      },
      {
        id: 'acc-student-1',
        identifier: 'aarav.verma',
        name: 'Aarav Verma',
        role: 'student',
        passwordHash: demoHash,
        passwordSalt: demoSalt,
        createdAt: 'Oct 15, 2026',
        studentData: {
          regNumber: 'STU-2026-4401',
          course: 'B.Tech in Computer Science & Engineering',
          semester: 'Semester 6',
          section: 'Section B',
          rollNo: '24',
          attendanceRate: 92,
        },
      },
      {
        id: 'acc-parent-1',
        identifier: 'parent.verma',
        name: 'Suresh Verma',
        role: 'parent',
        passwordHash: demoHash,
        passwordSalt: demoSalt,
        createdAt: 'Oct 15, 2026',
        parentData: {
          relationship: 'Father / Guardian',
          linkedChildren: [
            {
              studentId: 'acc-student-1',
              studentRegNumber: 'STU-2026-4401',
              studentName: 'Aarav Verma',
            },
          ],
        },
      },
      {
        id: 'acc-principal-1',
        identifier: 'principal.menon',
        name: 'Dr. Arthur Vance',
        role: 'principal',
        passwordHash: demoHash,
        passwordSalt: demoSalt,
        createdAt: 'Oct 10, 2026',
      },
    ];

    const defaultClasses: ClassWatchClass[] = [
      {
        code: '4892',
        name: 'B.Tech CSE - 6B (Lab 3)',
        teacherId: 'acc-teacher-1',
        teacherName: 'Dr. Rajesh Menon',
        allowedDomains: ['wikipedia.org', 'khanacademy.org', 'ncert.nic.in', 'docs.google.com'],
        createdAt: 'Today',
      },
    ];

    const defaultStudents: ClassWatchStudent[] = [
      {
        id: 'acc-student-1',
        regNumber: 'STU-2026-4401',
        name: 'Aarav Verma',
        classCode: '4892',
        currentDomain: 'wikipedia.org',
        status: 'On task',
        lastSeen: 'Just now',
        lastSeenTimestamp: Date.now(),
        parentLinkCode: '719304',
        isLocked: false,
        joinedAt: 'Today, 09:15 AM',
      },
    ];

    const defaultTimeline: ClassWatchTimelineEvent[] = [
      {
        id: 'time-init-1',
        studentRegNumber: 'STU-2026-4401',
        studentName: 'Aarav Verma',
        domain: 'docs.google.com',
        status: 'On task',
        timestamp: '09:20 AM',
        date: 'Today',
        classCode: '4892',
      },
      {
        id: 'time-init-2',
        studentRegNumber: 'STU-2026-4401',
        studentName: 'Aarav Verma',
        domain: 'wikipedia.org',
        status: 'On task',
        timestamp: '09:35 AM',
        date: 'Today',
        classCode: '4892',
      },
    ];

    return {
      version: 1,
      users: defaultUsers,
      classes: defaultClasses,
      students: defaultStudents,
      alerts: [],
      timeline: defaultTimeline,
      removedStudentIds: [],
    };
  }

  private ensureInitialized() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    const db = this.getDB();
    // Verify schema integrity
    if (!db.classes || !db.students || !db.users) {
      const reset = this.getDefaultDB();
      this.saveDB(reset);
    }
  }

  // ==========================================
  // Rate-limiting: 5 wrong passwords in 5 minutes
  // ==========================================

  private getFailedAttempts(identifier: string): number[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = window.localStorage.getItem(LOGIN_ATTEMPTS_KEY);
      if (!raw) return [];
      const map: Record<string, number[]> = JSON.parse(raw);
      const times = map[identifier.toLowerCase()] || [];
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      return times.filter((t) => t > fiveMinAgo);
    } catch {
      return [];
    }
  }

  private recordFailedAttempt(identifier: string) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const clean = identifier.toLowerCase();
      const raw = window.localStorage.getItem(LOGIN_ATTEMPTS_KEY);
      const map: Record<string, number[]> = raw ? JSON.parse(raw) : {};
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      const existing = (map[clean] || []).filter((t) => t > fiveMinAgo);
      existing.push(Date.now());
      map[clean] = existing;
      window.localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(map));
    } catch {
      // Ignored
    }
  }

  private clearFailedAttempts(identifier: string) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const clean = identifier.toLowerCase();
      const raw = window.localStorage.getItem(LOGIN_ATTEMPTS_KEY);
      if (!raw) return;
      const map: Record<string, number[]> = JSON.parse(raw);
      delete map[clean];
      window.localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(map));
    } catch {
      // Ignored
    }
  }

  // ==========================================
  // Authentication (Tab-Isolated Session)
  // ==========================================

  public async register(params: {
    id: string;
    name: string;
    role: UserRole;
    password: string;
  }): Promise<UserSession> {
    const cleanId = params.id.trim().toLowerCase();
    const cleanName = params.name.trim();

    // User ID validation: letters, numbers, underscore, 3-20 characters
    const idRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!idRegex.test(cleanId)) {
      throw new Error('User ID must be 3-20 characters using letters, numbers, and underscores only.');
    }

    if (!cleanName) {
      throw new Error('Please enter your full name.');
    }

    if (params.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const db = this.getDB();

    // Check unique ID (case-insensitive)
    const exists = db.users.some((u) => u.identifier.toLowerCase() === cleanId);
    if (exists) {
      throw new Error('That ID is already taken');
    }

    // Hash password with PBKDF2 using crypto.subtle
    const { hash, salt } = await hashPassword(params.password);

    const newUserId = `acc-${params.role}-${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const studentReg = `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: StoredUser = {
      id: newUserId,
      identifier: cleanId,
      name: cleanName,
      role: params.role,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: 'Today',
      studentData:
        params.role === 'student'
          ? {
              regNumber: studentReg,
              course: 'B.Tech in Computer Science & Engineering',
              semester: 'Semester 6',
              section: 'Section B',
              rollNo: String(Math.floor(20 + Math.random() * 50)),
              attendanceRate: 100,
            }
          : undefined,
      teacherData:
        params.role === 'teacher'
          ? {
              facultyId: `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              department: 'Computer Science & Engineering',
              designation: 'Faculty Instructor',
              subjects: ['Data Structures & Algorithms'],
            }
          : undefined,
      parentData:
        params.role === 'parent'
          ? {
              relationship: 'Parent / Guardian',
              linkedChildren: [],
            }
          : undefined,
    };

    db.users.push(newUser);
    this.saveDB(db);

    // Save session in sessionStorage (THIS TAB ONLY)
    const session: UserSession = {
      userId: newUser.id,
      name: newUser.name,
      role: newUser.role,
      identifier: newUser.identifier,
      email: `${newUser.identifier}@stjude.edu`,
      studentData: newUser.studentData,
      teacherData: newUser.teacherData,
      parentData: newUser.parentData,
    };

    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    this.broadcast('USER_REGISTERED', { userId: newUser.id, identifier: newUser.identifier, role: newUser.role });
    return session;
  }

  public async login(id: string, password: string): Promise<UserSession> {
    const cleanId = id.trim().toLowerCase();

    // Check rate limit: 5 wrong attempts in 5 minutes
    const recentFails = this.getFailedAttempts(cleanId);
    if (recentFails.length >= 5) {
      throw new Error('Too many tries, wait 5 minutes');
    }

    const db = this.getDB();
    const user = db.users.find((u) => u.identifier.toLowerCase() === cleanId);

    if (!user) {
      this.recordFailedAttempt(cleanId);
      throw new Error('No account found for this ID. Register first?');
    }

    // Verify password with PBKDF2 in constant time
    const isMatch = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isMatch) {
      this.recordFailedAttempt(cleanId);
      const newFails = this.getFailedAttempts(cleanId);
      if (newFails.length >= 5) {
        throw new Error('Too many tries, wait 5 minutes');
      }
      throw new Error('Wrong password');
    }

    // Clear failed attempts upon success
    this.clearFailedAttempts(cleanId);

    // Store in sessionStorage (current tab only)
    const session: UserSession = {
      userId: user.id,
      name: user.name,
      role: user.role,
      identifier: user.identifier,
      email: `${user.identifier}@stjude.edu`,
      studentData: user.studentData,
      teacherData: user.teacherData,
      parentData: user.parentData,
    };

    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
  }

  public async logout(): Promise<void> {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  public async getSession(): Promise<UserSession | null> {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    try {
      const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed: UserSession = JSON.parse(raw);

      // Verify user still exists in database
      const db = this.getDB();
      const user = db.users.find((u) => u.id === parsed.userId || u.identifier.toLowerCase() === parsed.identifier.toLowerCase());
      if (!user) {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      // Refresh any updated metadata
      return {
        ...parsed,
        name: user.name,
        role: user.role,
        studentData: user.studentData,
        teacherData: user.teacherData,
        parentData: user.parentData,
      };
    } catch {
      return null;
    }
  }

  // ==========================================
  // Class Management (Teacher)
  // ==========================================

  public async createClass(params: {
    name: string;
    teacherId: string;
    teacherName: string;
  }): Promise<ClassWatchClass> {
    const db = this.getDB();

    // Generate unique 4-digit code
    let code = '';
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (db.classes.some((c) => c.code === code));

    const newClass: ClassWatchClass = {
      code,
      name: params.name.trim() || `Classroom ${code}`,
      teacherId: params.teacherId,
      teacherName: params.teacherName,
      allowedDomains: ['wikipedia.org', 'khanacademy.org', 'ncert.nic.in', 'docs.google.com'],
      createdAt: 'Today',
    };

    db.classes.unshift(newClass);
    this.saveDB(db);
    this.broadcast('CLASS_CREATED', newClass);
    return newClass;
  }

  public async getClass(classCode: string): Promise<ClassWatchClass | null> {
    const db = this.getDB();
    return db.classes.find((c) => c.code === classCode) || null;
  }

  public async listClasses(): Promise<ClassWatchClass[]> {
    const db = this.getDB();
    return db.classes;
  }

  public async addAllowedSite(classCode: string, domain: string): Promise<string[]> {
    const normalized = normalizeDomain(domain);
    if (!normalized || !isValidHostname(normalized)) {
      throw new Error('Please enter a valid domain name (e.g. docs.google.com)');
    }

    const db = this.getDB();
    const targetClass = db.classes.find((c) => c.code === classCode);
    if (!targetClass) throw new Error('Classroom not found');

    if (!targetClass.allowedDomains.includes(normalized)) {
      targetClass.allowedDomains.push(normalized);
      this.saveDB(db);
      this.broadcast('CLASS_UPDATED', targetClass);
    }

    return targetClass.allowedDomains;
  }

  public async removeAllowedSite(classCode: string, domain: string): Promise<string[]> {
    const normalized = normalizeDomain(domain);
    const db = this.getDB();
    const targetClass = db.classes.find((c) => c.code === classCode);
    if (!targetClass) throw new Error('Classroom not found');

    targetClass.allowedDomains = targetClass.allowedDomains.filter((d) => normalizeDomain(d) !== normalized);
    this.saveDB(db);
    this.broadcast('CLASS_UPDATED', targetClass);
    return targetClass.allowedDomains;
  }

  // ==========================================
  // Student Actions & Roster
  // ==========================================

  public async joinClass(params: {
    studentId: string;
    studentName: string;
    studentRegNumber: string;
    classCode: string;
  }): Promise<ClassWatchStudent> {
    const db = this.getDB();
    const targetClass = db.classes.find((c) => c.code === params.classCode.trim());

    if (!targetClass) {
      throw new Error(`Class code "${params.classCode}" not found. Please check with your teacher.`);
    }

    // Check if student was removed by teacher and has not been allowed yet
    if (db.removedStudentIds && db.removedStudentIds.includes(params.studentId)) {
      throw new Error('You were removed from this class by the teacher. Please ask your teacher to allow you to rejoin.');
    }

    // Check if student already enrolled
    const existingIndex = db.students.findIndex(
      (s) => s.id === params.studentId || (s.regNumber && s.regNumber === params.studentRegNumber)
    );

    const now = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let studentRecord: ClassWatchStudent;

    if (existingIndex !== -1) {
      studentRecord = {
        ...db.students[existingIndex],
        classCode: targetClass.code,
        name: params.studentName,
        status: db.students[existingIndex].isLocked ? 'Locked' : 'On task',
        lastSeen: 'Just now',
        lastSeenTimestamp: now,
        isRemoved: false,
      };
      db.students[existingIndex] = studentRecord;
    } else {
      const parentCode = Math.floor(100000 + Math.random() * 900000).toString();
      studentRecord = {
        id: params.studentId,
        regNumber: params.studentRegNumber || `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: params.studentName,
        classCode: targetClass.code,
        currentDomain: 'wikipedia.org',
        status: 'On task',
        lastSeen: 'Just now',
        lastSeenTimestamp: now,
        parentLinkCode: parentCode,
        isLocked: false,
        joinedAt: `Today, ${timeStr}`,
        isRemoved: false,
      };
      db.students.push(studentRecord);
    }

    this.saveDB(db);
    this.broadcast('STUDENT_JOINED', studentRecord);
    return studentRecord;
  }

  public async leaveClass(studentId: string): Promise<void> {
    const db = this.getDB();
    const index = db.students.findIndex((s) => s.id === studentId);
    if (index !== -1) {
      db.students[index].classCode = '';
      db.students[index].status = 'Offline';
      db.students[index].lastSeenTimestamp = Date.now();
      this.saveDB(db);
      this.broadcast('STUDENT_LEFT', { studentId });
    }
  }

  public async listStudents(classCode?: string): Promise<ClassWatchStudent[]> {
    const db = this.getDB();
    const now = Date.now();
    let updated = false;

    // Filter students
    const list = classCode ? db.students.filter((s) => s.classCode === classCode && !s.isRemoved) : db.students;

    // Presence timeout check: if no heartbeat for > 15 seconds, mark Offline (unless Locked)
    for (const student of list) {
      if (student.status !== 'Locked' && student.status !== 'Offline') {
        if (now - (student.lastSeenTimestamp || 0) > 15000) {
          student.status = 'Offline';
          student.lastSeen = 'Offline (>15s)';
          updated = true;
        }
      }
    }

    if (updated) {
      this.saveDB(db);
    }

    return list;
  }

  public async sendPresence(studentId: string, isOffline = false): Promise<void> {
    const db = this.getDB();
    const student = db.students.find((s) => s.id === studentId);
    if (!student) return;

    const now = Date.now();
    student.lastSeenTimestamp = now;

    if (isOffline) {
      student.status = 'Offline';
      student.lastSeen = 'Offline';
    } else {
      student.lastSeen = 'Just now';
      if (student.status === 'Offline') {
        student.status = student.isLocked ? 'Locked' : 'On task';
      }
    }

    this.saveDB(db);
    this.broadcast('STUDENT_PRESENCE', { studentId, status: student.status, lastSeen: student.lastSeen });
  }

  public async setStudentSite(
    studentId: string,
    domain: string
  ): Promise<{ status: ClassWatchStudentStatus; alertCreated?: ClassWatchAlert }> {
    const db = this.getDB();
    const student = db.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const cleanDomain = normalizeDomain(domain);
    student.currentDomain = cleanDomain || domain;
    student.lastSeenTimestamp = Date.now();
    student.lastSeen = 'Just now';

    let targetClass = db.classes.find((c) => c.code === student.classCode);
    const allowed = targetClass ? targetClass.allowedDomains : ['wikipedia.org', 'khanacademy.org', 'ncert.nic.in', 'docs.google.com'];

    let finalStatus: ClassWatchStudentStatus = 'On task';
    let newAlert: ClassWatchAlert | undefined;

    if (student.isLocked) {
      finalStatus = 'Locked';
    } else if (cleanDomain.toLowerCase() === 'away') {
      finalStatus = 'Away';
    } else if (isDomainAllowed(cleanDomain, allowed)) {
      finalStatus = 'On task';
    } else {
      finalStatus = 'Off task';

      // Create alert only for valid hostnames (must contain dot and valid TLD; ignore bare words)
      if (isValidHostname(cleanDomain)) {
        const severityInfo = getDomainAlertSeverity(cleanDomain);
        const now = Date.now();
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Merge repeat infractions for same student + domain within 60 seconds into single alert with count
        const existingAlert = db.alerts.find(
          (a) =>
            a.studentId === student.id &&
            a.domain === cleanDomain &&
            a.status === 'active' &&
            now - a.lastTimestamp <= 60000
        );

        if (existingAlert) {
          existingAlert.count += 1;
          existingAlert.lastTimestamp = now;
          existingAlert.timestamp = timeStr;
          // Never downgrade HIGH to MEDIUM
          if (severityInfo.severity === 'HIGH') {
            existingAlert.severity = 'HIGH';
          }
          newAlert = existingAlert;
        } else {
          newAlert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            studentId: student.id,
            studentName: student.name,
            studentRegNumber: student.regNumber,
            domain: cleanDomain,
            severity: severityInfo.severity,
            reason: severityInfo.reason,
            count: 1,
            timestamp: timeStr,
            lastTimestamp: now,
            status: 'active',
            classCode: student.classCode,
          };
          db.alerts.unshift(newAlert);
        }
      }
    }

    student.status = finalStatus;

    // Log plain timeline event (site name and time only, never full URLs)
    if (cleanDomain && cleanDomain !== 'away') {
      const timelineEvent: ClassWatchTimelineEvent = {
        id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentRegNumber: student.regNumber,
        studentName: student.name,
        domain: cleanDomain,
        status: finalStatus,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        classCode: student.classCode,
      };
      db.timeline.unshift(timelineEvent);
      // Keep last 100 timeline entries
      if (db.timeline.length > 100) {
        db.timeline = db.timeline.slice(0, 100);
      }
    }

    this.saveDB(db);
    this.broadcast('STUDENT_UPDATED', student);
    if (newAlert) {
      this.broadcast('ALERT_CREATED', newAlert);
    }
    return { status: finalStatus, alertCreated: newAlert };
  }

  public async warn(studentId: string, customMessage?: string): Promise<void> {
    const db = this.getDB();
    const student = db.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');

    student.warningMessage = customMessage || 'Please return to the assigned learning resources immediately.';
    student.warningTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.saveDB(db);
    this.broadcast('STUDENT_UPDATED', student);
  }

  public async lock(studentId: string): Promise<void> {
    const db = this.getDB();
    const student = db.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');

    student.isLocked = true;
    student.status = 'Locked';
    this.saveDB(db);
    this.broadcast('STUDENT_UPDATED', student);
  }

  public async unlock(studentId: string): Promise<void> {
    const db = this.getDB();
    const student = db.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');

    student.isLocked = false;
    student.status = 'On task';
    this.saveDB(db);
    this.broadcast('STUDENT_UPDATED', student);
  }

  public async removeStudent(studentId: string): Promise<void> {
    const db = this.getDB();
    const student = db.students.find((s) => s.id === studentId);
    if (!student) return;

    student.isRemoved = true;
    student.status = 'Offline';

    if (!db.removedStudentIds) db.removedStudentIds = [];
    if (!db.removedStudentIds.includes(studentId)) {
      db.removedStudentIds.push(studentId);
    }

    this.saveDB(db);
    this.broadcast('STUDENT_REMOVED', { studentId });
  }

  public async allowStudent(studentId: string): Promise<void> {
    const db = this.getDB();
    if (db.removedStudentIds) {
      db.removedStudentIds = db.removedStudentIds.filter((id) => id !== studentId);
    }
    const student = db.students.find((s) => s.id === studentId);
    if (student) {
      student.isRemoved = false;
    }
    this.saveDB(db);
    this.broadcast('STUDENT_ALLOWED', { studentId });
  }

  // ==========================================
  // Alerts
  // ==========================================

  public async listAlerts(classCode?: string): Promise<ClassWatchAlert[]> {
    const db = this.getDB();
    if (classCode) {
      return db.alerts.filter((a) => a.classCode === classCode);
    }
    return db.alerts;
  }

  public async dismissAlert(alertId: string): Promise<void> {
    const db = this.getDB();
    const alert = db.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'dismissed';
      this.saveDB(db);
      this.broadcast('ALERT_DISMISSED', { alertId });
    }
  }

  public async clearAlerts(classCode: string): Promise<void> {
    const db = this.getDB();
    for (const a of db.alerts) {
      if (a.classCode === classCode && a.status === 'active') {
        a.status = 'dismissed';
      }
    }
    this.saveDB(db);
    this.broadcast('ALERTS_CLEARED', { classCode });
  }

  // ==========================================
  // Parent Linking & Timeline
  // ==========================================

  public async linkParent(parentId: string, childIdOrReg: string, linkCode: string): Promise<ClassWatchStudent> {
    const db = this.getDB();
    const cleanQuery = childIdOrReg.trim().toLowerCase();
    const cleanCode = linkCode.trim();

    const student = db.students.find(
      (s) =>
        (s.id.toLowerCase() === cleanQuery || s.regNumber.toLowerCase() === cleanQuery) &&
        s.parentLinkCode === cleanCode
    );

    if (!student) {
      throw new Error('Invalid student ID or 6-digit link code. Please check with your child.');
    }

    // Update parent's linked children in database
    const parent = db.users.find((u) => u.id === parentId);
    if (parent) {
      if (!parent.parentData) {
        parent.parentData = { relationship: 'Parent / Guardian', linkedChildren: [] };
      }
      const alreadyLinked = parent.parentData.linkedChildren.some((c) => c.studentId === student.id);
      if (!alreadyLinked) {
        parent.parentData.linkedChildren.push({
          studentId: student.id,
          studentRegNumber: student.regNumber,
          studentName: student.name,
        });
      }
      this.saveDB(db);

      // Update current tab's session if this parent is logged in
      const session = await this.getSession();
      if (session && session.userId === parentId) {
        session.parentData = parent.parentData;
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        }
      }
    }

    this.broadcast('DATA_SYNC', { parentId, studentId: student.id });
    return student;
  }

  public async getTimeline(studentRegNumberOrId: string): Promise<ClassWatchTimelineEvent[]> {
    const db = this.getDB();
    const clean = studentRegNumberOrId.trim().toLowerCase();
    return db.timeline.filter(
      (t) => t.studentRegNumber.toLowerCase() === clean || t.studentName.toLowerCase() === clean
    );
  }

  // ==========================================
  // Account & Password Maintenance
  // ==========================================

  public async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
    if (newPass.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    const db = this.getDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const isValid = await verifyPassword(oldPass, user.passwordHash, user.passwordSalt);
    if (!isValid) throw new Error('Wrong password');

    const { hash, salt } = await hashPassword(newPass);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    this.saveDB(db);
  }

  public async resetStudentPassword(studentIdOrReg: string, newPass: string): Promise<void> {
    if (newPass.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    const db = this.getDB();
    const clean = studentIdOrReg.trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.id.toLowerCase() === clean ||
        u.identifier.toLowerCase() === clean ||
        (u.studentData && u.studentData.regNumber.toLowerCase() === clean)
    );
    if (!user) throw new Error('Student account not found');

    const { hash, salt } = await hashPassword(newPass);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    this.saveDB(db);
  }
}

// ==========================================
// Clean Extension Point: Firebase / Supabase Stub
// ==========================================

export class FirebaseDataService implements IDataService {
  constructor() {
    console.info('FirebaseDataService stub initialized. Backend switched via VITE_DATA_BACKEND.');
  }

  private notConfigured(): never {
    throw new Error('FirebaseDataService: Cloud backend not provisioned. To enable multi-device sync across different networks, configure Firebase in environment variables.');
  }

  public async register(): Promise<UserSession> { this.notConfigured(); }
  public async login(): Promise<UserSession> { this.notConfigured(); }
  public async logout(): Promise<void> { this.notConfigured(); }
  public async getSession(): Promise<UserSession | null> { return null; }
  public async createClass(): Promise<ClassWatchClass> { this.notConfigured(); }
  public async joinClass(): Promise<ClassWatchStudent> { this.notConfigured(); }
  public async leaveClass(): Promise<void> { this.notConfigured(); }
  public async listStudents(): Promise<ClassWatchStudent[]> { return []; }
  public async sendPresence(): Promise<void> { this.notConfigured(); }
  public async setStudentSite(): Promise<{ status: ClassWatchStudentStatus; alertCreated?: ClassWatchAlert }> { this.notConfigured(); }
  public async warn(): Promise<void> { this.notConfigured(); }
  public async lock(): Promise<void> { this.notConfigured(); }
  public async unlock(): Promise<void> { this.notConfigured(); }
  public async removeStudent(): Promise<void> { this.notConfigured(); }
  public async allowStudent(): Promise<void> { this.notConfigured(); }
  public async addAllowedSite(): Promise<string[]> { this.notConfigured(); }
  public async removeAllowedSite(): Promise<string[]> { this.notConfigured(); }
  public async listAlerts(): Promise<ClassWatchAlert[]> { return []; }
  public async dismissAlert(): Promise<void> { this.notConfigured(); }
  public async clearAlerts(): Promise<void> { this.notConfigured(); }
  public async linkParent(): Promise<ClassWatchStudent> { this.notConfigured(); }
  public async getTimeline(): Promise<ClassWatchTimelineEvent[]> { return []; }
  public async changePassword(): Promise<void> { this.notConfigured(); }
  public async resetStudentPassword(): Promise<void> { this.notConfigured(); }
  public subscribe(): () => void { return () => {}; }
  public async getClass(): Promise<ClassWatchClass | null> { return null; }
  public async listClasses(): Promise<ClassWatchClass[]> { return []; }
}

// Single active instance exported to all components
export const dataService: IDataService =
  typeof process !== 'undefined' && process.env?.VITE_DATA_BACKEND === 'firebase'
    ? new FirebaseDataService()
    : new LocalDataService();
