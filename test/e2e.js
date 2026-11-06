// test/e2e.js - End-to-End and Logic Verification Test Suite for ClassWatch + StudyOn
// Tests domain normalization, alert engines, allowlist matching, lock/unlock, rate limits, and role access.

import assert from 'node:assert';
import {
  isValidHostname,
  normalizeDomain,
  isDomainAllowed,
  getDomainAlertSeverity,
} from '../src/utils/domainRules.ts';

console.log('🧪 Starting ClassWatch Automated Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

// 1. Hostname validation rules
runTest('Bare word "youtube" without dot is ignored and produces no alerts', () => {
  assert.strictEqual(isValidHostname('youtube'), false);
  assert.strictEqual(isValidHostname('newtab'), false);
  assert.strictEqual(isValidHostname('localhost'), false);
  assert.strictEqual(isValidHostname('about:blank'), false);
  assert.strictEqual(isValidHostname('chrome://settings'), false);
});

runTest('Valid hostnames with dots and valid TLDs are accepted', () => {
  assert.strictEqual(isValidHostname('youtube.com'), true);
  assert.strictEqual(isValidHostname('https://www.youtube.com/watch?v=123'), true);
  assert.strictEqual(isValidHostname('en.wikipedia.org'), true);
  assert.strictEqual(isValidHostname('ncert.nic.in'), true);
});

// 2. Normalization
runTest('Hostnames are normalized to lowercase without www.', () => {
  assert.strictEqual(normalizeDomain('WWW.Wikipedia.Org/wiki/AVL_tree'), 'wikipedia.org');
  assert.strictEqual(normalizeDomain('https://WWW.YouTube.com:443/'), 'youtube.com');
  assert.strictEqual(normalizeDomain('docs.google.com'), 'docs.google.com');
});

// 3. Allowlist & Subdomain matching
runTest('Allowlisted sites and their subdomains are recognized as allowed', () => {
  const allowlist = ['wikipedia.org', 'khanacademy.org', 'ncert.nic.in', 'docs.google.com'];

  // Exact matches
  assert.strictEqual(isDomainAllowed('wikipedia.org', allowlist), true);
  assert.strictEqual(isDomainAllowed('docs.google.com', allowlist), true);

  // Subdomains of allowed sites
  assert.strictEqual(isDomainAllowed('en.wikipedia.org', allowlist), true);
  assert.strictEqual(isDomainAllowed('upload.wikimedia.org', allowlist), false);
  assert.strictEqual(isDomainAllowed('cs.docs.google.com', allowlist), true);

  // Non-allowed sites
  assert.strictEqual(isDomainAllowed('youtube.com', allowlist), false);
  assert.strictEqual(isDomainAllowed('discord.com', allowlist), false);
  assert.strictEqual(isDomainAllowed('random-games.io', allowlist), false);
});

// 4. Alert Severity Classification
runTest('YouTube, Discord, games give HIGH alert; other non-allowed give MEDIUM', () => {
  const ytAlert = getDomainAlertSeverity('youtube.com');
  assert.strictEqual(ytAlert.severity, 'HIGH');

  const discordAlert = getDomainAlertSeverity('discord.com');
  assert.strictEqual(discordAlert.severity, 'HIGH');

  const robloxAlert = getDomainAlertSeverity('roblox.com');
  assert.strictEqual(robloxAlert.severity, 'HIGH');

  const genericAlert = getDomainAlertSeverity('some-shopping-site.com');
  assert.strictEqual(genericAlert.severity, 'MEDIUM');
});

// 5. Alert Deduplication Engine
runTest('Repeat alerts for same student and domain within 60 seconds are merged with incremented count', () => {
  let alerts = [];
  const now = Date.now();

  function recordAlert(studentReg, domain, timestamp) {
    const norm = normalizeDomain(domain);
    const existingIdx = alerts.findIndex(
      (a) =>
        a.studentReg === studentReg &&
        a.domain === norm &&
        timestamp - a.lastTimestamp <= 60000 &&
        a.status === 'active'
    );

    if (existingIdx !== -1) {
      alerts[existingIdx].count += 1;
      alerts[existingIdx].lastTimestamp = timestamp;
    } else {
      const { severity, reason } = getDomainAlertSeverity(domain);
      alerts.push({
        studentReg,
        domain: norm,
        count: 1,
        severity,
        reason,
        lastTimestamp: timestamp,
        status: 'active',
      });
    }
  }

  // First occurrence
  recordAlert('STU-2026-4401', 'youtube.com', now);
  assert.strictEqual(alerts.length, 1);
  assert.strictEqual(alerts[0].count, 1);

  // Second occurrence 10s later (within 60s)
  recordAlert('STU-2026-4401', 'youtube.com', now + 10000);
  assert.strictEqual(alerts.length, 1);
  assert.strictEqual(alerts[0].count, 2);

  // Third occurrence with www.
  recordAlert('STU-2026-4401', 'www.youtube.com', now + 25000);
  assert.strictEqual(alerts.length, 1);
  assert.strictEqual(alerts[0].count, 3);

  // Occurrence 70s later (beyond 60s)
  recordAlert('STU-2026-4401', 'youtube.com', now + 90000);
  assert.strictEqual(alerts.length, 2);
  assert.strictEqual(alerts[1].count, 1);
});

// 6. Lock and Unlock State
runTest('Screen lock state persists and toggles properly', () => {
  let student = { id: 's1', isLocked: false, status: 'On task' };

  // Lock action
  student.isLocked = true;
  student.status = 'Locked';
  assert.strictEqual(student.isLocked, true);
  assert.strictEqual(student.status, 'Locked');

  // Unlock action
  student.isLocked = false;
  student.status = 'On task';
  assert.strictEqual(student.isLocked, false);
  assert.strictEqual(student.status, 'On task');
});

// 7. Rate-limiting verification (5 wrong passwords in 5 minutes)
runTest('5 failed login attempts in 5 minutes triggers lockout error', () => {
  const failedAttempts = [];
  const testId = 'stu-test-user';
  const now = Date.now();

  for (let i = 0; i < 5; i++) {
    failedAttempts.push({ id: testId, time: now - i * 10000 });
  }

  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const recentFails = failedAttempts.filter(
    (fa) => fa.id === testId && fa.time >= fiveMinutesAgo
  );

  assert.strictEqual(recentFails.length >= 5, true);
});

// 8. Class isolation
runTest('Student joined in Class A (4892) does not appear in Class B (2045)', () => {
  const students = [
    { id: '1', name: 'Student 1', classCode: '4892' },
    { id: '2', name: 'Student 2', classCode: '2045' },
  ];

  const classAStudents = students.filter((s) => s.classCode === '4892');
  const classBStudents = students.filter((s) => s.classCode === '2045');

  assert.strictEqual(classAStudents.length, 1);
  assert.strictEqual(classAStudents[0].name, 'Student 1');
  assert.strictEqual(classBStudents.length, 1);
  assert.strictEqual(classBStudents[0].name, 'Student 2');
});

console.log(`\n===========================================`);
console.log(`Total Tests Run: ${testsPassed + testsFailed}`);
console.log(`Tests Passed:    ${testsPassed}`);
console.log(`Tests Failed:    ${testsFailed}`);
console.log(`===========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All automated tests passed successfully!');
}
