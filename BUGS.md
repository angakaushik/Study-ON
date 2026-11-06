# ClassWatch + StudyOn Self-Audit & Bug Verification Log (BUGS.md)

This document records the comprehensive self-audit, edge-case testing, and verified bug resolutions across authentication, teacher controls, student monitoring, parent timeline, and domain classification.

---

## 1. Authentication & Security
* **Bug 1.1: Rate Limiter Reset Window on Brute-Force Attacks**
  * *Symptom*: Rapid sequential password guesses could bypass rudimentary counters if stored in non-timestamped state.
  * *Fix*: Implemented `loginAttemptsMap` with window tracking (`5 minutes`) and sliding timestamp expiration. At 5 failed attempts, immediately blocks submission with exact message: `"Too many tries, wait 5 minutes"`.
* **Bug 1.2: Case-Insensitive User ID Collision**
  * *Symptom*: Registering `Student01` vs `student01` allowed duplicate usernames.
  * *Fix*: Normalized all user ID checks with `.toLowerCase().trim()` and validated against regex `/^[a-zA-Z0-9_]{3,20}$/`. Returns `"That ID is already taken"`.
* **Bug 1.3: Password Length and Password Hash Exposure**
  * *Symptom*: Passwords with fewer than 6 characters were permitted.
  * *Fix*: Enforced minimum 6-character check on registration and change password with `"Password must be at least 6 characters"`. Password hashes are never exposed in state or API payloads.

---

## 2. Domain Normalization & Rule Engine (`src/utils/domainRules.ts`)
* **Bug 2.1: False Positives on Internal URLs and Bare Words**
  * *Symptom*: Internal browser tabs (`chrome://extensions`, `about:blank`, `newtab`) and bare keywords like `youtube` or `localhost` triggered false alerts.
  * *Fix*: Added `isValidHostname()`: requires at least one dot, excludes browser prefixes (`chrome://`, `about:`, `file://`, `blob:`), ensures TLD is alphabetic and >= 2 characters.
* **Bug 2.2: Subdomain Mismatches on Allowed Sites**
  * *Symptom*: Legitimate academic subdomains (e.g., `en.wikipedia.org` or `classroom.google.com`) triggered unapproved site warnings when `wikipedia.org` or `google.com` was on the allowlist.
  * *Fix*: Enhanced `isDomainAllowed()` to test exact match OR subdomain suffix (`hostname.endsWith('.' + allowedDomain)`).
* **Bug 2.3: Alert Flooding & Multiple Severity Duplication**
  * *Symptom*: Students refreshing an unapproved site within seconds produced dozens of duplicate alerts.
  * *Fix*: Implemented 60-second infraction window deduplication (`handleReportDomain`). Merges alerts for the same student + domain, increments `repeatCount`, updates timestamp, and preserves higher severity (`HIGH` vs `MEDIUM`).

---

## 3. Teacher Controls & Live Grid (`src/components/ClassWatchMonitor.tsx`)
* **Bug 3.1: Inadvertent Student Removal Without Confirmation**
  * *Symptom*: Clicking "Remove" instantly dropped the student without confirmation.
  * *Fix*: Added a two-step confirmation modal with the student's name, ID, and explicit warning that the student cannot rejoin without teacher permission.
* **Bug 3.2: Screen Lock State Desynchronization**
  * *Symptom*: Locking a student did not reflect persistently if the teacher refreshed or switched views.
  * *Fix*: Stored `isLocked` in centralized state (`classWatchStudents`), toggles between `"Lock"` and `"Unlock"` buttons, and displays a prominent `"LOCKED"` badge.
* **Bug 3.3: Web Audio API Autoplay Blocking**
  * *Symptom*: Browsers block unprompted audio playback until user interaction occurs.
  * *Fix*: Built synthetic Web Audio oscillators (`playAlertChime`, `playWarnTone`, `playLockSound`) that lazily initialize or resume `AudioContext` only upon active user interaction or alert events. Includes a master Sound On/Off toggle.

---

## 4. Student Companion & Privacy Controls (`src/components/StudentTabSimulator.tsx`)
* **Bug 4.1: Removed Student Rejoining Exploitation**
  * *Symptom*: A student removed by the teacher could immediately re-enter the 4-digit class code.
  * *Fix*: Teacher `handleRemoveClassWatchStudent` marks the student's ID in `removedStudentIds`. When the student attempts to join, displays clear error: `"You were removed from this class by the teacher. Please speak with your teacher to rejoin."`
* **Bug 4.2: Privacy Leakage in Timeline**
  * *Symptom*: Risk of full URL query parameters (which may contain search queries or private tokens) leaking to teacher or parent.
  * *Fix*: Enforced privacy contract: Tab simulator strips all query parameters and paths, reporting *only* normalized domain names. Displayed prominent privacy notice: *"Your teacher can see site names only, never page content, keystrokes or private messages."*
* **Bug 4.3: Full-Screen Lock Evasion**
  * *Symptom*: When locked, students could still click simulated tabs.
  * *Fix*: Rendered an unclosable full-screen overlay (`z-50`) with lock icon and message `"Classroom Screen Locked by Teacher - Please look up at the board"`.

---

## 5. Parent Dashboard & Child Link (`src/components/ParentClassWatchTimeline.tsx`)
* **Bug 5.1: Cross-Child Data Confusion**
  * *Symptom*: Parents with multiple linked children had mixed activity streams.
  * *Fix*: Implemented multi-child selector tabs with independent focus percentages (% on task vs off task), warning counts, and unlink capability.
* **Bug 5.2: Invalid 6-Digit Link Code Handling**
  * *Symptom*: Entering an invalid or expired parent link code failed silently.
  * *Fix*: Verified student ID + 6-digit link code matching, displaying explicit error: `"Invalid Student ID or 6-digit Link Code. Please verify with your child."`

---

## 6. Mobile & Theme Audit
* **Bug 6.1: Dark Green Theme Contrast**
  * *Symptom*: Light borders caused low contrast against `#0f1c18` background.
  * *Fix*: Styled cards with `#16271f`, borders with emerald/green subtle accents (`rgba(92,199,154,0.15)`), and primary buttons with `#5cc79a` and text `#0f1c18`.
* **Bug 6.2: Android Phone Frame Overflow**
  * *Symptom*: Tab simulators and live student grids overflowed horizontally on 375px/390px viewport previews.
  * *Fix*: Added responsive grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), horizontal scroll pills for navigation, and touch-friendly target sizes.

---

## 7. Single Color Green & Theme Gallery Conversion
* **Bug 7.1: Fragmented Legacy Sky-Blue Elements**
  * *Symptom*: Legacy StudyOn views contained hardcoded sky-blue/white backgrounds (`bg-sky-50`, `bg-white`, `text-slate-900`) that clashed with the ClassWatch dark green aesthetic.
  * *Fix*: Implemented a universal CSS custom property mapping in `/src/index.css` (`[data-theme]`) and refactored `Logo.tsx`, `SplashScreen.tsx`, `MainRoleSelect.tsx`, `RoleLoginScreen.tsx`, and `App.tsx` to unify the entire platform into the single green palette.
* **Bug 7.2: Dynamic Theme Switching without Flash or Desynchronization**
  * *Symptom*: Changing theme palettes previously required page reloads or left form inputs and dialogs in stale colors.
  * *Fix*: Bound root `data-theme` attribute to `activeTheme` state and created `ThemeSelectorModal.tsx` supporting 6 curated green variations: ClassWatch Dark Green (`#0f1c18`), Monochrome Pure Green (`#061209`), Cyber Neon Emerald (`#041009`), Deep Forest Canopy (`#081711`), Sage & Olive Minimal (`#101712`), and Jade Mineral Slate (`#081617`).
