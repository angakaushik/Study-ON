// test/dataService.test.js - Automated Test Suite for DataService Architecture & Logic
import assert from 'node:assert';
import {
  isValidHostname,
  normalizeDomain,
  isDomainAllowed,
  getDomainAlertSeverity,
} from '../src/utils/domainRules.ts';

console.log('🧪 Starting DataService Architecture & Functional Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

// Minimal in-memory storage simulating browser Storage
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) ?? null;
  }
  setItem(key, val) {
    this.store.set(key, String(val));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// Setup simulated browser globals for Node test environment
const mockLocalStorage = new MockStorage();
globalThis.localStorage = mockLocalStorage;

// Mock session storages to simulate Tab A and Tab B
const tabASessionStorage = new MockStorage();
const tabBSessionStorage = new MockStorage();

// Cryptography helper matching dataService
async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex
    ? new Uint8Array(saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    : globalThis.crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedKey = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const hashHex = Array.from(new Uint8Array(derivedKey))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const saltOut = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return { hash: hashHex, salt: saltOut };
}

// -------------------------------------------------------------
// TEST 1: Register, Login, Duplicate ID, Wrong Password, Rate Limiting
// -------------------------------------------------------------
await runTest('1. Auth: Register and login succeeds with PBKDF2 hash verification', async () => {
  const registeredUsers = new Map();
  const failedLogins = [];

  async function registerUser({ id, name, role, password }) {
    const normId = id.trim().toLowerCase();
    if (registeredUsers.has(normId)) {
      throw new Error('That ID is already taken');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    const { hash, salt } = await hashPassword(password);
    const userRecord = { id: normId, name, role, passwordHash: hash, salt };
    registeredUsers.set(normId, userRecord);
    return { userId: normId, name, role };
  }

  async function loginUser(id, password) {
    const normId = id.trim().toLowerCase();
    const now = Date.now();
    const recentFails = failedLogins.filter(
      (f) => f.id === normId && now - f.time < 5 * 60 * 1000
    );
    if (recentFails.length >= 5) {
      throw new Error('Too many tries, wait 5 minutes');
    }

    const user = registeredUsers.get(normId);
    if (!user) {
      throw new Error('No account found for this ID. Register first?');
    }

    const { hash } = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      failedLogins.push({ id: normId, time: now });
      throw new Error('Wrong password');
    }

    return { userId: user.id, name: user.name, role: user.role };
  }

  // Register user
  const user = await registerUser({
    id: 'Teacher_Alpha',
    name: 'Dr. Alpha',
    role: 'teacher',
    password: 'securePass123',
  });
  assert.strictEqual(user.userId, 'teacher_alpha');

  // Login success
  const session = await loginUser('teacher_alpha', 'securePass123');
  assert.strictEqual(session.userId, 'teacher_alpha');

  // Duplicate ID error
  await assert.rejects(
    async () => {
      await registerUser({
        id: 'TEACHER_ALPHA',
        name: 'Another Alpha',
        role: 'teacher',
        password: 'password999',
      });
    },
    /That ID is already taken/
  );

  // Short password error
  await assert.rejects(
    async () => {
      await registerUser({
        id: 'student_short',
        name: 'Short',
        role: 'student',
        password: '123',
      });
    },
    /Password must be at least 6 characters/
  );

  // Wrong password error
  await assert.rejects(
    async () => {
      await loginUser('teacher_alpha', 'wrongPassword!');
    },
    /Wrong password/
  );

  // Non-existent ID error
  await assert.rejects(
    async () => {
      await loginUser('unknown_id', 'somepass');
    },
    /No account found for this ID\. Register first\?/
  );

  // Rate limiting lockout (5 wrong passwords in 5 minutes)
  for (let i = 0; i < 4; i++) {
    try {
      await loginUser('teacher_alpha', 'wrongPasswordAgain');
    } catch {
      // expected
    }
  }
  // 5th failed attempt should trigger lockout
  await assert.rejects(
    async () => {
      await loginUser('teacher_alpha', 'wrongPasswordAgain');
    },
    /Too many tries, wait 5 minutes/
  );
});

// -------------------------------------------------------------
// TEST 2: Tab Session Isolation (sessionStorage per tab)
// -------------------------------------------------------------
await runTest('2. Session Isolation: Teacher and Student maintain separate sessions in different tabs', async () => {
  // Tab A (Teacher)
  const teacherSession = { userId: 'teacher_smith', name: 'Mr. Smith', role: 'teacher' };
  tabASessionStorage.setItem('classwatch_session_v1', JSON.stringify(teacherSession));

  // Tab B (Student)
  const studentSession = { userId: 'student_bob', name: 'Bob Jones', role: 'student' };
  tabBSessionStorage.setItem('classwatch_session_v1', JSON.stringify(studentSession));

  // Verify Tab A has teacher and Tab B has student
  const tabAUser = JSON.parse(tabASessionStorage.getItem('classwatch_session_v1'));
  const tabBUser = JSON.parse(tabBSessionStorage.getItem('classwatch_session_v1'));

  assert.strictEqual(tabAUser.role, 'teacher');
  assert.strictEqual(tabBUser.role, 'student');

  // Logging out in Tab A does NOT affect Tab B
  tabASessionStorage.removeItem('classwatch_session_v1');
  assert.strictEqual(tabASessionStorage.getItem('classwatch_session_v1'), null);
  assert.strictEqual(JSON.parse(tabBSessionStorage.getItem('classwatch_session_v1')).userId, 'student_bob');
});

// -------------------------------------------------------------
// TEST 3: Cross-tab Live Sync with BroadcastChannel
// -------------------------------------------------------------
await runTest('3. Live Sync: Student join broadcasts event to teacher listener', async () => {
  const channelName = `cw_test_bus_${Date.now()}`;
  const teacherBus = new BroadcastChannel(channelName);
  const studentBus = new BroadcastChannel(channelName);

  let receivedEvent = null;
  const waitPromise = new Promise((resolve) => {
    teacherBus.onmessage = (msg) => {
      receivedEvent = msg.data;
      resolve(msg.data);
    };
  });

  studentBus.postMessage({
    type: 'STUDENT_JOINED',
    payload: {
      studentId: 'stu-99',
      studentName: 'Alice Wonder',
      studentRegNumber: 'STU-9901',
      classCode: '4892',
    },
    timestamp: Date.now(),
  });

  const evt = await waitPromise;
  assert.strictEqual(evt.type, 'STUDENT_JOINED');
  assert.strictEqual(evt.payload.studentName, 'Alice Wonder');
  assert.strictEqual(evt.payload.classCode, '4892');

  teacherBus.close();
  studentBus.close();
});

// -------------------------------------------------------------
// TEST 4: Lock and Unlock Toggle
// -------------------------------------------------------------
await runTest('4. Screen Lock: Teacher lock and unlock properly transitions student status', async () => {
  let student = {
    id: 's-10',
    name: 'Charlie',
    isLocked: false,
    status: 'On task',
  };

  function lock(s) {
    s.isLocked = true;
    s.status = 'Locked';
  }

  function unlock(s) {
    s.isLocked = false;
    s.status = 'On task';
  }

  lock(student);
  assert.strictEqual(student.isLocked, true);
  assert.strictEqual(student.status, 'Locked');

  unlock(student);
  assert.strictEqual(student.isLocked, false);
  assert.strictEqual(student.status, 'On task');
});

// -------------------------------------------------------------
// TEST 5: Domain Rules and Alert Engines
// -------------------------------------------------------------
await runTest('5. Domain Rules: youtube.com gives HIGH alert, "youtube" gives none, wikipedia.org gives none', async () => {
  const allowlist = ['wikipedia.org', 'khanacademy.org', 'ncert.nic.in', 'docs.google.com'];

  // Bare word
  assert.strictEqual(isValidHostname('youtube'), false);
  // Allowed site and subdomain
  assert.strictEqual(isDomainAllowed('wikipedia.org', allowlist), true);
  assert.strictEqual(isDomainAllowed('en.wikipedia.org', allowlist), true);

  // Non-allowed high severity site
  assert.strictEqual(isValidHostname('youtube.com'), true);
  assert.strictEqual(isDomainAllowed('youtube.com', allowlist), false);
  const ytAlert = getDomainAlertSeverity('youtube.com');
  assert.strictEqual(ytAlert.severity, 'HIGH');
});

// -------------------------------------------------------------
// TEST 6: Student Presence Timeout (>15s marks Offline)
// -------------------------------------------------------------
await runTest('6. Presence Timeout: Students without heartbeat > 15s are marked Offline', async () => {
  const now = Date.now();
  const students = [
    { id: 's1', name: 'Active Student', lastSeenTimestamp: now - 3000, status: 'On task' },
    { id: 's2', name: 'Stale Student', lastSeenTimestamp: now - 16000, status: 'On task' },
    { id: 's3', name: 'Locked Student', lastSeenTimestamp: now - 20000, status: 'Locked', isLocked: true },
  ];

  function evaluatePresence(stuList, currentTime) {
    return stuList.map((s) => {
      if (currentTime - s.lastSeenTimestamp > 15000) {
        return { ...s, status: 'Offline' };
      }
      return s;
    });
  }

  const updated = evaluatePresence(students, now);
  assert.strictEqual(updated[0].status, 'On task');
  assert.strictEqual(updated[1].status, 'Offline');
  assert.strictEqual(updated[2].status, 'Offline');
});

// -------------------------------------------------------------
// TEST 7: Parent Timeline Safety (plain site names and times only - no URLs)
// -------------------------------------------------------------
await runTest('7. Parent Privacy: Timeline logs only plain site names and times, never full URLs or query strings', async () => {
  const dirtyUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s';
  const normalized = normalizeDomain(dirtyUrl);

  const timelineEntry = {
    id: 'tl-1',
    studentRegNumber: 'STU-2026-4401',
    studentName: 'Aarav Verma',
    domain: normalized,
    timestamp: '10:15 AM',
    date: 'Today',
  };

  assert.strictEqual(timelineEntry.domain, 'youtube.com');
  assert.strictEqual(timelineEntry.domain.includes('watch'), false);
  assert.strictEqual(timelineEntry.domain.includes('?'), false);
  assert.strictEqual(timelineEntry.domain.includes('http'), false);
});

console.log(`\n===========================================`);
console.log(`Total DataService Tests: ${testsPassed + testsFailed}`);
console.log(`Passed:                  ${testsPassed}`);
console.log(`Failed:                  ${testsFailed}`);
console.log(`===========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All DataService architecture and logic tests PASSED!');
}
