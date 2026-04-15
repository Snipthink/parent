# Gurukul ERP — Implementation Plan

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

---

## Module Checklist

| # | Module | Priority | Status |
|---|--------|----------|--------|
| 1 | Role entry + Auth (Student, Educator, Institute, School) | Medium | [x] Fixed — routing, sync auth, error handling |
| 2 | Admin hierarchy (Admin → Director → Principal → Teacher…) | High | [x] Written |
| 3 | Department & Course management (Nursery → PhD) | High | [x] Written |
| 4 | Classroom management (sections, timing, breaks, holidays) | High | [x] Written |
| 5 | Syllabus & curriculum planner (per class/course/medium) | High | [x] Written |
| 6 | Teacher assignment & calendar | Medium | [x] Written (in classroom.js) |
| 7 | Class sync + notifications (student & teacher) | High | [x] Complete — bell, panel, center, auto-push from exam/attendance/notice/fee |
| 8 | Notice board (school-wide + class + club, permission-based) | High | [x] Written |
| 9 | Clubs & activities (Sports, Quiz, Debate, Singing, etc.) | Medium | [x] Written |
| 10 | Admissions (form designer, QR, parent signature, status) | Very High | [x] Written |
| 11 | ID Card generator (bulk, custom size, bg remover, print) | Very High | [x] Written |
| 12 | Exams (class test, midterm, final, results, grade) | High | [x] Written |
| 13 | Fee & accounting (receipts, PDF download) | High | [x] Written |
| 14 | HR department (hire/fire, staff records) | High | [x] Written |
| 15 | Transportation (routes, buses, pickup/drop times, student assignment) | High | [x] Written |
| 16 | Main dashboard (admissions, passouts, suspended, top performers, teacher ratings) | High | [x] Redesigned — next-gen hero + stats + charts |
| 17 | Performance graphs (school/college level) | Medium | [x] Improved canvas chart with dots + labels |

---

## Critical Bugs to Fix First

- [x] **Router/Auth split-screen bug** — fixed: router.getView() detects which container is visible
- [x] **Async Auth.login()** — made synchronous to match DB.loginUser()
- [x] **Boot race condition** — removed window.load listener from router; boot() calls resolve()
- [x] **Dashboard redesign** — hero banner, animated counters, attendance ring, performers, notices feed

---

## Remaining Implementation Tasks

### Priority 1 — Make it run ✅
- [x] Fix router to use single `#view` with auth/shell toggling
- [x] Remove duplicate `window.load` listener from router
- [x] Fix doLogin / doSignup to handle sync DB calls correctly
- [x] showToast() utility added (was used everywhere, never defined)

### Priority 2 — Dashboard redesign ✅
- [x] Hero welcome banner with greeting + school name + date chip
- [x] Animated stat counters (count up on load)
- [x] Quick-action buttons (New Admission, Attendance, Notice, Fee)
- [x] Today's attendance donut ring (SVG)
- [x] Top performers with progress bars
- [x] Recent notices feed with type dots
- [x] Monthly admissions canvas chart (improved)
- [ ] Teacher performance ratings widget (future)

### Priority 3 — Module #7: Class Sync / Notifications ✅
- [x] In-app notification bell with unread badge in topbar
- [x] notifications table in SQLite (type, title, body, targetUserId/Role, isRead)
- [x] Auto-push on: exam scheduled, notice posted, attendance saved, fee collected
- [x] Notification panel dropdown (mark read, mark all, view all link)
- [x] Full /notifications center page (all / unread filter)
- [x] notifySchool / notifyRole / notifyUser / notifyStudents helpers

### Priority 4 — Polish ✅
- [x] Duplicate showToast removed from admin.js
- [x] Toast variants (success/error/info/warn) with slide-in animation
- [x] nav.notifications i18n key added to all 5 languages (en/hi/es/fr/de)
- [x] Notifications nav item added to sidebar
- [x] hashchange listener deduplication (_shellListenerAdded guard)
- [ ] Offline WASM bundle (vendors/ folder) — optional, needs file download

---

## File Map

```
gurukul/
├── index.html          ← App shell (boots everything)
├── style.css           ← All styles
├── plan.md             ← This file
├── js/
│   ├── db.js           ← SQLite data layer (sql.js WASM)
│   ├── i18n.js         ← Multi-language (en/hi/es/fr/de)
│   ├── router.js       ← Hash-based SPA router
│   ├── auth.js         ← RBAC + session
│   └── app.js          ← Boot, sidebar, shell
├── modules/
│   ├── role-select.js  ← #1 Role entry
│   ├── auth-screen.js  ← #1 Login / Signup / Setup
│   ├── dashboard.js    ← #16 Main dashboard
│   ├── admin.js        ← #2 Admin hierarchy
│   ├── departments.js  ← #3 Departments & Courses
│   ├── classroom.js    ← #4 #6 Classroom + Teacher calendar
│   ├── syllabus.js     ← #5 Syllabus planner
│   ├── attendance.js   ← Part of #7
│   ├── noticeboard.js  ← #8 Notice board
│   ├── clubs.js        ← #9 Clubs & activities
│   ├── admissions.js   ← #10 Admissions
│   ├── idcard.js       ← #11 ID Card generator
│   ├── exams.js        ← #12 Exams
│   ├── results.js      ← #12 Results & grades
│   ├── fees.js         ← #13 Fee & accounting
│   ├── hr.js           ← #14 HR department
│   └── transport.js    ← #15 Transport
└── i18n/
    ├── en.json hi.json es.json fr.json de.json
```
