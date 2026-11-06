# StudyOn + ClassWatch — Unified Classroom Monitoring & Academic Platform

> A comprehensive classroom monitoring, academic management, and student education platform combining **ClassWatch** (real-time browsing monitor, screen lock, smart alerts, domain allowlists, parent timelines, and Chrome Extension) with **StudyOn** (curriculum notes, PDF reader, assignment grading, attendance tracking, and Android phone simulation).

---

## 🎨 Theme & Design System
Converted completely into a single color dark green aesthetic, featuring the user-requested ClassWatch palette and 6 curated green theme variations:
1. **ClassWatch Dark Green (Primary Default)**: `#0f1c18` background, `#16271f` cards, `#5cc79a` mint accent, `#233a30` border.
2. **Monochrome Pure Green**: `#061209` background, `#0d2012` cards, `#22c55e` pure green accent, `#163b26` border.
3. **Cyber Neon Emerald**: `#041009` background, `#0a2215` cards, `#00ff88` electric mint accent, `#144e2f` border.
4. **Deep Forest Canopy**: `#081711` background, `#122a1f` cards, `#34d399` woodland mint accent, `#204b39` border.
5. **Sage & Olive Minimal**: `#101712` background, `#18241d` cards, `#a3e635` bright lime sage accent, `#293e32` border.
6. **Jade Mineral Slate**: `#081617` background, `#0f2728` cards, `#2dd4bf` cool jade teal accent, `#1a4749` border.

* **Theme Gallery & Cycle**: Instant theme selection via the **Gallery** modal button or the **Cycle Theme** fast button in the top bar.
* **Device Switcher**: Instant toggle between Desktop Layout and Android Smartphone Frame.

---

## 🚀 Quick Start

### Installation & Run
```bash
# Install dependencies
npm install

# Start the development server (runs on port 3000)
npm run dev
```

### Running Automated Verification Tests
```bash
# Run the 9-scenario e2e test suite
node test/e2e.js
```

---

## 👥 Role-Based Features

### 1. Teacher Dashboard (`/teacher`)
* **4-Digit Class Code**: Create classrooms with large visual code display (e.g. `4892`, `1024`).
* **Allowlist Manager**: Manage study-permitted domains (`wikipedia.org`, `khanacademy.org`, `ncert.nic.in`, `docs.google.com`). Supports subdomains (e.g. `en.wikipedia.org`) and validates domain syntax.
* **Live Student Grid**: Real-time cards showing student name, ID, active domain, status (`On task`, `Off task`, `Away`, `Locked`, `Offline`), and last-seen timestamp.
* **Instant Actions**:
  * **Warn**: Sends an on-screen warning banner to the student with a warning audio tone.
  * **Lock / Unlock**: Immediately displays a full-screen lock overlay on student's screen; persists across refreshes.
  * **Reset Password**: Sets a temporary password for the student.
  * **Remove**: Two-step confirmation modal; removed students are blocked from rejoining.
* **Smart Alert Panel**:
  * Classifies infractions: `HIGH` (YouTube, Discord, social media, games, streaming) vs `MEDIUM` (other unapproved domains).
  * Merges repeats within 60 seconds into a single alert with an incremented counter.
  * Web Audio API sound chime toggle (On/Off).
  * Filter by Active vs Handled alerts, with one-click "Clear All Alerts".

### 2. Student Dashboard (`/student`)
* **Join Classroom**: Enter 4-digit class code to connect to the teacher's live roster.
* **Privacy Contract Banner**: Clearly indicates: *"Your teacher can see site names only, never page content, keystrokes or private messages."*
* **Full-Screen Screen Lock**: Takeover overlay when the teacher locks the screen.
* **Warning Banners**: Displays notifications sent by the teacher.
* **Parent Link Code**: Generates a 6-digit code (with Regenerate button) for parents to link their view.
* **Built-in Tab Reporter / Simulator**: Allows interactive testing without installing the extension:
  * Quick buttons: Wikipedia, Khan Academy, Google Docs, YouTube, Discord, Away, and custom URL input.
* **StudyOn Academic Tools**: Digital notes with interactive PDF reader, video lectures, assignment submissions, and attendance record.

### 3. Parent Dashboard (`/parent`)
* **Child Linking**: Link one or more children using Student ID + 6-digit Parent Link Code.
* **Multi-Child Switcher**: Switch between linked children seamlessly.
* **Live Focus Timeline**: Plain-language log showing site names and times only (zero URL query parameters or private paths).
* **Focus Metrics**: Real-time calculated focus percentage (% on-task vs off-task) and warning counter.
* **Unlink Child**: Option to disconnect a child profile.

### 4. Principal Dashboard (`/principal`)
* **Institutional Governance**: View live classroom telemetries across all departments.
* **User Accounts**: Create, edit, and deactivate accounts for Teachers, Students, and Parents.
* **Curriculum & Complaints**: Review submitted academic complaints and syllabus progress.

---

## 🧩 Chrome Extension (Manifest V3)

The repository includes a ready-to-use Manifest V3 Chrome Extension located in `/extension`.

### Installation in Google Chrome or Chromium:
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the `/extension` directory from this project.
5. Click the extension icon in Chrome, configure your server address (`http://localhost:3000`), and log in with your Student ID and password.
6. As you navigate between tabs, the extension automatically reports the normalized domain to your teacher's dashboard.

---

## 🌐 Deployment Architecture Note
* **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS.
* **Real-Time Synchronisation**: Uses state orchestration with WebSocket/Polling fallbacks.
* **Production Deployment**: Deploy on platforms supporting long-lived Node.js servers or WebSockets (e.g. Render, Fly.io, Railway, or Google Cloud Run). For serverless deployments (such as Vercel or Netlify), configure a persistent database and an external WebSocket relay (e.g., Pusher or Supabase Realtime).

---

## 📄 License & Verification
* 9/9 automated E2E tests passing (`node test/e2e.js`).
* Strict zero-error TypeScript linting (`tsc --noEmit`).
* Comprehensive bug audit documented in `BUGS.md`.
