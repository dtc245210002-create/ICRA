# Project: ICRA (Intelligent Course Registration Assistant) — ICTU

## Architecture
- **Application Type**: Educational Enterprise SaaS Web Application for Course Registration.
- **Client Architecture**: React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Layout Paradigm**: 3-Column Coordinated Views (Direct Manipulation per Lecture 6):
  - Left Column (28%): Course Explorer with Faceted Filtering & Search.
  - Center Column (47%): Weekly Timetable Matrix (8 columns x 4 shift slots) with Ghost Block preview and Conflict Engine.
  - Right Column (25%): AI Recommendation Assistant, Workload Meter & Registration Summary Cart.
- **Deployment Dual Track**:
  - Modular Source (`src/`): Standard React + TypeScript architecture with `src/App.tsx`, components, data, types, utils, `package.json`, `vite.config.ts`, `tsconfig.json`.
  - Standalone Application (`index.html`): Self-contained single-page application with in-browser Babel, CDN Tailwind, Lucide, Confetti, served via `serve.js` (:8080) for instant offline or zero-install demonstration.

## Feature Inventory
Every feature from the Survey phase appears here with its assigned milestone.
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Enterprise Header | ICRA Logo, ICTU university name, semester badge 'Học kỳ 1, 2026 - 2027' | M1 | ORIGINAL_REQUEST R1 |
| F02 | Portal Status & Countdown | Registration open badge, live ticking countdown timer (74:15:20) | M1 | ORIGINAL_REQUEST R1 |
| F03 | Student Identity Profile | An Bá Thành (DTC245210002 • CNTT K24) with notification bell | M1 | ORIGINAL_REQUEST R1 |
| F04 | Instant Course Search | Real-time query by course code, name, or lecturer (<100ms) | M1 | ORIGINAL_REQUEST R2 |
| F05 | Faceted Faculty Filter | Filter by Khoa: CNTT, Toán - Tin, Ngoại ngữ | M1 | ORIGINAL_REQUEST R2 |
| F06 | Faceted Shift Filter | Filter by Ca học: Sáng (Tiết 1-5), Chiều (Tiết 6-11) | M1 | ORIGINAL_REQUEST R2 |
| F07 | Faceted Day Filter | Filter by Ngày học: Thứ 2 đến Chủ Nhật (Day 2 - Day 8) | M1 | ORIGINAL_REQUEST R2 |
| F08 | Max Credits Slider | Interactive range slider filtering courses by credit limit | M1 | ORIGINAL_REQUEST R2 |
| F09 | Smart Conflict Filter Checkbox | Checkbox: "Chỉ hiển thị lớp không trùng lịch" | M1 | ORIGINAL_REQUEST R2 |
| F10 | 4 CourseCard Visual States | Available, Selected, Conflict, Ineligible states with distinct badges & WCAG contrast | M1 | ORIGINAL_REQUEST R2 |
| F11 | Ghost Block Preview | Hovering course card projects semi-transparent preview block on timetable | M1 | ORIGINAL_REQUEST R2 |
| F12 | Course Detail Modal Trigger | Clicking course opens comprehensive CourseDetailModal with prerequisite tree | M1 | ORIGINAL_REQUEST R2, R5 |
| F13 | Weekly Timetable Matrix 8x4 | 8 columns (Time slot + T2 to CN) x 4 period slots (1-3, 4-5, 7-9, 10-11) | M2 | ORIGINAL_REQUEST R3 |
| F14 | Exact Interval Conflict Engine | Mathematical collision: (day_A == day_B) && (start_A <= end_B && end_A >= start_B) | M2 | ORIGINAL_REQUEST R3 |
| F15 | Conflict Visual Alerts | Flashing red border (pulse-conflict), card shake (shake-alert), ConflictAlert banner | M2 | ORIGINAL_REQUEST R3 |
| F16 | 1-Click Auto-Switch Section | Button dynamically switches conflicting course to available non-clashing section | M2 | ORIGINAL_REQUEST R3 |
| F17 | Week Switcher Navigation | Next/Previous week navigation with current week indicator | M2 | ORIGINAL_REQUEST R3 |
| F18 | Timetable Plan Switcher | Toggle between 'Phương án 1' and 'Phương án 2' with independent schedule states | M2 | ORIGINAL_REQUEST R3 |
| F19 | Proportional Workload Meter | Tiered meter: <12 TC (Amber), 12-18 TC (Green), >18 TC (Red) with proportional bar | M3 | ORIGINAL_REQUEST R4 |
| F20 | AI Course Recommendation | Violet (#8B5CF6) card with explanation, 100% compatibility badge, prerequisite check | M3 | ORIGINAL_REQUEST R4 |
| F21 | Registration Cart List | List of enrolled courses with credits, schedule, and instant removal (✕) | M3 | ORIGINAL_REQUEST R4 |
| F22 | Tuition Calculation Engine | Dynamic tuition calculation: Total Credits x 450,000 VNĐ | M3 | ORIGINAL_REQUEST R4 |
| F23 | Primary CTA Lock Constraint | "Rà Soát & Xác Nhận Đăng Ký" locked if total credits < 12 or active conflicts > 0 | M3 | ORIGINAL_REQUEST R4 |
| F24 | Confirmation Pre-flight Modal | Pre-flight audit modal verifying 0 conflicts and 100% satisfied prerequisites | M4 | ORIGINAL_REQUEST R5 |
| F25 | Course Detail & Prerequisite Modal | Modal rendering syllabus, teacher, schedule, prerequisites graph & enrollment status | M4 | ORIGINAL_REQUEST R5 |
| F26 | Toast Notification System | Instant floating feedback toasts on add, remove, auto-swap, and validation events | M4 | ORIGINAL_REQUEST R5 |
| F27 | Confetti Fireworks Effect | Canvas confetti celebratory explosion upon confirmed registration | M4 | ORIGINAL_REQUEST R5 |
| F28 | Electronic Receipt Modal | Modal issuing receipt #ICRA-2026-9812-ICTU with timestamp, student ID & course summary | M4 | ORIGINAL_REQUEST R5 |
| F29 | Genuine .ICS Calendar Export | Downloadable RFC 5545 compliant iCalendar file for Google/Apple Calendar | M4 | ORIGINAL_REQUEST R5 |
| F30 | Modular Source Packaging | Complete src/ with App.tsx, types, data, components, package.json, vite.config.ts | M4 | ORIGINAL_REQUEST R5 |
| F31 | Standalone Deployability | Standalone index.html running smoothly via CDN and Node serve.js (:8080) | M4 | ORIGINAL_REQUEST R5 |
| F32 | Full 4-Tier E2E Verification | 100% pass on 35+ test cases (Tiers 1-4) across unit, integration, and browser runs | M5 | Acceptance Criteria |
| F33 | WCAG 2.1 AA Accessibility | All elements maintain >= 4.5:1 text contrast and non-color dependent status cues | M5 | Acceptance Criteria |
| F34 | SRT Performance Benchmark | Filter & search response under 100ms, smooth 60fps timetable interactions | M5 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Header, Identity & Course Explorer | F01 - F12: Header, countdown, student profile, faceted filters, CourseCard states, ghost block | None | DONE |
| M2 | Timetable Matrix & Conflict Engine | F13 - F18: Weekly grid, interval conflict math, visual alerts, 1-click swap, plan 1/2 switcher | M1 | PLANNED |
| M3 | AI Recommendation & Summary Cart | F19 - F23: Workload meter, violet AI recommendation, tuition math, cart list, lock CTA | M1, M2 | PLANNED |
| M4 | Modals, .ICS Export & Dual Packaging | F24 - F31: Confirmation modal, CourseDetailModal, receipt, genuine .ics export, src/ & index.html | M1, M2, M3 | PLANNED |
| M5 | E2E Testing, Adversarial & Audit | F32 - F34: 100% test pass on 4 tiers, adversarial coverage hardening, forensic audit, report | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### Course Data Model (`src/types/index.ts` & `index.html`)
```typescript
export interface Course {
  id: string;
  code: string;
  name: string;
  faculty: 'CNTT' | 'Toán - Tin' | 'Ngoại ngữ';
  credits: number;
  lecturer: string;
  classroom: string;
  day: number; // 2 (T2) .. 8 (CN)
  startPeriod: number; // 1 .. 11
  endPeriod: number; // 1 .. 11
  shift: 'Sáng' | 'Chiều';
  periodSlot: 'slot_1_3' | 'slot_4_5' | 'slot_7_9' | 'slot_10_11';
  periodText: string; // e.g. "Tiết 1-3"
  scheduleText: string; // e.g. "Thứ 2 (Tiết 1-3)"
  timeText: string; // e.g. "07:00 - 09:25"
  prerequisites: string[]; // e.g. ["IT101"]
  enrolled: number;
  maxSeats: number;
  alternateCourseId?: string; // id of non-conflicting alternate section
  colorTheme?: string;
}

export interface ConflictInfo {
  incomingCourse: Course;
  existingCourse: Course;
  alternateCourse?: Course;
}

export interface TimetablePlan {
  id: 'plan_1' | 'plan_2';
  name: string;
  selectedCourseIds: string[];
}
```

### Universal Conflict Engine (`src/utils/conflictEngine.ts`)
```typescript
export function checkIntervalConflict(courseA: Course, courseB: Course): boolean {
  if (courseA.id === courseB.id) return false;
  if (courseA.day !== courseB.day) return false;
  return courseA.startPeriod <= courseB.endPeriod && courseA.endPeriod >= courseB.startPeriod;
}

export function findConflict(incoming: Course, selectedCourses: Course[]): Course | null {
  return selectedCourses.find(existing => checkIntervalConflict(incoming, existing)) || null;
}
```

### Calendar ICS Export (`src/utils/calendarExport.ts`)
```typescript
export function generateICalendar(courses: Course[]): string;
export function downloadICalendarFile(courses: Course[], filename?: string): void;
```

## Code Layout
```
c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\
├── package.json               # Root build and test scripts
├── tsconfig.json              # TypeScript compilation config
├── vite.config.ts             # Vite bundler config
├── index.html                 # Standalone zero-install application (CDN / Babel / Tailwind)
├── preview_ui_icra.html       # Standalone mirror
├── serve.js                   # Node HTTP server on port 8080
├── public_deploy/             # Deployment mirror
├── tests/                     # 4-Tier E2E automated test suite
│   ├── tier1_features.test.js
│   ├── tier2_boundaries.test.js
│   ├── tier3_combinations.test.js
│   ├── tier4_workloads.test.js
│   └── browser_e2e.test.js    # Headless Chrome/Edge validation
├── src/
│   ├── main.tsx               # Modular React entrypoint
│   ├── App.tsx                # Modular Root Application connecting all components
│   ├── index.css              # Global Tailwind CSS directives & custom animations
│   ├── types/
│   │   └── index.ts           # Unified data contracts
│   ├── data/
│   │   └── mockCourses.ts     # Rich dataset covering all faculties and shifts
│   ├── utils/
│   │   ├── conflictEngine.ts  # Canonical interval conflict detection
│   │   └── calendarExport.ts  # RFC 5545 iCalendar generator
│   └── components/
│       ├── Header.tsx
│       ├── CourseExplorer.tsx
│       ├── CourseCard.tsx
│       ├── WeeklyTimetable.tsx
│       ├── TimetableCourseCard.tsx
│       ├── ConflictAlert.tsx
│       ├── AIRecommendation.tsx
│       ├── RegistrationSummary.tsx
│       ├── ConfirmationModal.tsx
│       ├── CourseDetailModal.tsx
│       └── ReceiptModal.tsx
└── .agents/                   # Orchestrator and agent metadata
```
