# ICRA Codebase Survey & Gap Analysis Report

**Project**: ICRA — Intelligent Course Registration Assistant (Trường ĐH Công nghệ Thông tin & Truyền thông - ICTU)  
**Author**: teamwork_preview_explorer  
**Date**: 2026-09-29  
**Working Directory**: `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_explorer_survey_code_1`  
**Reference Specification**: `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\ORIGINAL_REQUEST.md` (R1 - R5)

---

## 1. Executive Summary

The ICRA project codebase currently exists in a **dual-state paradox**:
1. **Standalone Single-File Prototype (`index.html`)**: A 1,086-line HTML file incorporating React 18, Babel Standalone, Tailwind CSS CDN, Lucide Icons, and Canvas Confetti. It executes smoothly in a browser and via Node `serve.js` on `http://127.0.0.1:8080`, providing a functioning visual UI for the 3-column layout (28% - 47% - 25%).
2. **Fragmented Modular Source Tree (`src/`)**: A collection of 9 React/TypeScript component files (`src/components/`), 1 data file (`src/data/mockCourses.ts`), and 1 type file (`src/types/index.ts`). **However, this modular source tree is completely inoperable**: it lacks `package.json`, `tsconfig.json`, Vite/Webpack configuration, `App.tsx`, and `main.tsx`. Furthermore, it suffers from breaking TypeScript interface mismatches (`course.scheduleText` is accessed in components but missing from `Course` interface and mock data).
3. **Requirement Gaps (R1 - R5)**: While the visual scaffolding closely reflects the wireframes in the ICTU final project report (`Bao_Cao_Do_An_UIUX_ICRA.docx`), several core features required by R1-R5 are either missing (Course Detail Modal, Timetable Plan Switcher Phương án 1/2, Sunday day filter) or implemented with dummy mockups (fake `.ics` file download alert, static countdown timer, hardcoded conflict resolution, static workload bar segments).

---

## 2. Inventory of Existing Files, Modules & Architecture

### 2.1 File Map

```
c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\
├── index.html                           [53,449 bytes, 1,086 lines] Standalone React 18 + Babel app
├── preview_ui_icra.html                 [53,449 bytes] Identical byte-for-byte copy (MD5: 79D727D4CC44C6332856FBB466EDB5C8)
├── serve.js                             [628 bytes, 20 lines] Node HTTP server serving index.html on :8080
├── public_deploy/
│   └── index.html                       [53,449 bytes] Identical byte-for-byte copy (MD5: 79D727D4CC44C6332856FBB466EDB5C8)
├── src/
│   ├── types/
│   │   └── index.ts                     [1,033 bytes, 47 lines] Types: ShiftType, Course, ConflictInfo, StudentInfo, ToastMessage
│   ├── data/
│   │   └── mockCourses.ts               [3,634 bytes, 154 lines] CURRENT_STUDENT, MOCK_COURSES (8 courses)
│   └── components/
│       ├── Header.tsx                   [3,424 bytes, 66 lines] Enterprise header
│       ├── CourseExplorer.tsx           [7,617 bytes, 172 lines] Left faceted filtering pane (28%)
│       ├── CourseCard.tsx               [3,884 bytes, 105 lines] Course item card with 4 states
│       ├── WeeklyTimetable.tsx          [5,186 bytes, 99 lines] Timetable matrix (47%)
│       ├── TimetableCourseCard.tsx      [1,354 bytes, 34 lines] Rendered course block in timetable
│       ├── ConflictAlert.tsx            [1,881 bytes, 44 lines] Conflict alert banner
│       ├── AIRecommendation.tsx        [2,258 bytes, 48 lines] AI recommendation card
│       ├── RegistrationSummary.tsx      [6,071 bytes, 123 lines] Right registration summary pane (25%)
│       └── ConfirmationModal.tsx        [3,720 bytes, 73 lines] Confirmation review modal
├── Bao_Cao_Do_An_UIUX_ICRA.docx         [69,918 bytes] Official ICTU Final Project Report (FR-01 to FR-08, UCD principles)
├── Software_Interface_Design_Lecture_*.txt [6 lecture summaries on UI/UX, HCI, Heuristics]
└── duanUI.jpg                           [59,326 bytes] UI visual mockup
```

### 2.2 Environment & Runtime Architecture
- **Runtime Environment**:
  - Node.js `v24.19.0`, npm `11.17.0`, Python `3.11.9`, Windows 10/11 environment.
- **Standalone Mode (`index.html`)**:
  - React 18 production UMD + ReactDOM 18 production UMD loaded from unpkg.
  - Babel Standalone in-browser transpilation (`<script type="text/babel">`).
  - Tailwind CSS via `https://cdn.tailwindcss.com` with custom theme configuration (`primary`, `appbg`, `aiViolet`).
  - Lucide Icons loaded via `https://unpkg.com/lucide@latest` (`lucide.createIcons()` called on DOM updates).
  - Canvas Confetti via `https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js`.
  - Embedded CSS keyframes: `@keyframes pulse-conflict`, `@keyframes shake-subtle`.
- **Modular Mode (`src/`)**:
  - **Non-functional**: No build runner, no bundler, no entrypoint, missing root `App.tsx`.

---

## 3. Detailed Gap Analysis Against Requirements (R1 – R5)

### 3.1 Requirement R1: Enterprise Header & Student Identity
| Feature Spec | Implementation Status | Quality / Fidelity | Identified Bugs & Gaps |
| :--- | :---: | :---: | :--- |
| ICRA Logo & ICTU University Name | ✅ Implemented | High | Sparkles icon + "ICRA \| Trường ĐH Công nghệ Thông tin & Truyền thông" + Subtitle. |
| Current Semester (`Học kỳ 1 (2026 - 2027) — Đợt chính`) | ✅ Implemented | High | Rendered dynamically from student data. |
| Registration Open Badge | ✅ Implemented | High | "Cổng Đăng Ký Đang Mở" with pulsing emerald indicator dot (`animate-pulse`). |
| Countdown Timer (`74:15:20`) | ⚠️ Partial / Static | Low | Hardcoded static text `<span ...>74:15:20</span>`. **Does not count down per second**; no `setInterval` or reactive timer hook. |
| Student Identity | ✅ Implemented | High | Displays "An Bá Thành", "DTC245210002 • CNTT K24", avatar "AT". |
| System Notification Bell | ⚠️ Cosmetic Only | Low | Bell icon with unread badge is present, but clicking it does nothing. No notifications panel or popover. |

---

### 3.2 Requirement R2: Course Explorer with Faceted Filtering (28% Width)
| Feature Spec | Implementation Status | Quality / Fidelity | Identified Bugs & Gaps |
| :--- | :---: | :---: | :--- |
| Width Allocation | ✅ Implemented | Exact | `w-[28%]` in both `index.html` and `src/components/CourseExplorer.tsx`. |
| Instant Search (Mã môn, Tên môn, Giảng viên) | ✅ Implemented | High (<50ms) | Live client-side filter matching code, name, and lecturer. |
| Faculty Filter (CNTT, Toán - Tin, Ngoại ngữ) | ✅ Implemented | Good | Dropdown with ALL, CNTT, TOAN, NN. (Note: ATTT type exists in `types/index.ts` but has no courses in mock data). |
| Shift Filter (Ca Sáng: 1-5, Ca Chiều: 6-11) | ✅ Implemented | Good | Dropdown with ALL, MORNING, AFTERNOON. |
| Day Filter (Thứ 2 đến Chủ Nhật) | ❌ Incomplete | Medium | **Sunday (Chủ Nhật, Day 8) is missing from the dropdown** in both `index.html` and `src/components/CourseExplorer.tsx`. |
| Credit Slider (Tối đa 1-4 TC) | ✅ Implemented | High | Dynamic range input adjusting `maxCredits` state. |
| Smart Checkbox ("Chỉ hiện lớp không trùng lịch") | ⚠️ Buggy Algorithm | Medium | Uses flawed conflict comparison (`periodSlot === c.periodSlot` or `periodText === c.periodText`) rather than time-interval overlap. |
| 4 Visual Card States (*Available*, *Selected*, *Conflict*, *Ineligible*) | ✅ Implemented | High | Available (white), Selected (blue-50), Conflict (red-50), Ineligible (slate-50 opacity-60). |
| Ghost Block Preview on Timetable | ✅ Implemented | Good | Hovering triggers `ghostCourse`, rendering a dashed blue preview block on the timetable. |
| Course Detail Modal ("Xem chi tiết") | ❌ Missing | Broken | "Xem chi tiết" button sets `selectedDetailCourse` in state, but **no modal is ever rendered**! Clicking it produces zero visual response. |

---

### 3.3 Requirement R3: Weekly Timetable Matrix with Conflict Engine (47% Width)
| Feature Spec | Implementation Status | Quality / Fidelity | Identified Bugs & Gaps |
| :--- | :---: | :---: | :--- |
| Width Allocation | ✅ Implemented | Exact | `w-[47%]` in both `index.html` and `src/components/WeeklyTimetable.tsx`. |
| 8-Column Weekly Grid | ✅ Implemented | High | 1 Period/Hour column + 7 Day columns (Thứ Hai to Chủ Nhật). 4 Slots: Tiết 1-3, 4-5, 7-9, 10-11. |
| Interval Conflict Formula `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)` | ❌ Non-compliant in `index.html` | High Severity Bug | `index.html` courses only have `periodSlot: "p1"`/`"p3"` and checks `x.periodSlot === course.periodSlot`. Courses with spanning hours (e.g. Tiết 7-10) fail this check. |
| Conflict Visual Alarm (Red pulse + Shake) | ⚠️ Partial | Medium | `@keyframes pulse-conflict` and `@keyframes shake-subtle` are implemented. **However**, `handleAddCourse` completely rejects adding a conflicting course to `selectedIds`, meaning the conflicting course is never placed onto the timetable cell to clash visually! |
| 1-Click Auto-Switch Button | ⚠️ Hardcoded Mock | Low | Button text and action are hardcoded to `"CS202-01 (Chiều Thứ 5)"`. It does not dynamically calculate available alternate sections for arbitrary courses. |
| Week Navigation (Chuyển tuần) | ❌ Inactive | Low | Left/right chevron buttons in timetable toolbar have no `onClick` handlers. Week text is static `"Tuần 01: 29/09 - 05/10/2026"`. |
| Timetable Plans Switcher (*Phương án 1 / Phương án 2*) | ❌ Completely Missing | High Severity Gap | Explicitly mandated by R3, but neither `index.html` nor `src/` has tabs or state for toggling between plan options. Only a single "Khôi phục mặc định" button exists. |

---

### 3.4 Requirement R4: AI Course Recommendation & Registration Summary (25% Width)
| Feature Spec | Implementation Status | Quality / Fidelity | Identified Bugs & Gaps |
| :--- | :---: | :---: | :--- |
| Width Allocation | ✅ Implemented | Exact | `w-[25%]` in both `index.html` and `src/components/RegistrationSummary.tsx`. |
| Workload Meter (Thiếu tải <12 TC / Cân đối 12-18 TC / Căng thẳng >18 TC) | ⚠️ Visual Bug | Medium | The status badge text updates correctly, but the visual bar is composed of 3 hardcoded width segments (`40%`, `30%`, `55%`, `0%`) instead of a true continuous progress bar displaying `(credits / 24) * 100%`. |
| AI Recommendation Card (Violet `#8B5CF6`) | ⚠️ Static Single Course | Medium | Card is styled in violet with justification, 100% timetable fit, and prerequisite check. However, after adding `CS202-01`, the button remains enabled and does not change state or rotate to other suggestions. |
| Selected Courses Cart List with Instant Delete (✕) | ✅ Implemented | High | Displays enrolled courses with instant removal button (✕) updating credits and tuition immediately. |
| Tuition Calculation (`Total Credits × 450,000 VNĐ`) | ✅ Implemented | High | Accurate calculation and Vietnamese currency formatting (`450.000 VNĐ / tín chỉ`). |
| Primary CTA Button Lockout (<12 TC or Conflict) | ✅ Implemented | High | Button "Rà Soát & Xác Nhận Đăng Ký" is disabled and greyed out whenever `totalCredits < 12` or `hasConflict === true`. |

---

### 3.5 Requirement R5: Interactive Modals, Toast Feedback & Standalone Deployability
| Feature Spec | Implementation Status | Quality / Fidelity | Identified Bugs & Gaps |
| :--- | :---: | :---: | :--- |
| Confirmation Review Modal | ✅ Implemented | High | Validates 0 conflicts, 100% prerequisites, displays student ID, course count, total credits, tuition, and CTA. |
| Success Confetti & Electronic Receipt Modal | ✅ Implemented in `index.html` | High | Triggers `canvas-confetti`, displays receipt modal with code `#ICRA-2026-9812-ICTU`. (Note: Missing in `src/`). |
| Google Calendar (.ics) Export | ❌ Fake Mock | Low | Button triggers a JavaScript `alert('Đã tải xuống file lịch học ThoiKhoaBieu_ICRA_ICTU.ics!')`. **No actual `.ics` iCalendar file is generated or downloaded**. |
| Course Detail Modal ("modal chi tiết môn học") | ❌ Missing | High Severity Gap | No modal component exists for viewing course syllabus, prerequisites tree, or detailed description. |
| Toast Notification System | ✅ Implemented in `index.html` | High | Supports `success`, `error`, `warning`, `info` with 4-second auto-dismiss. |
| Dual Deployability (Standalone + Modular `src/`) | ❌ Failed | Critical Gap | Standalone works via `index.html`. Modular `src/` **cannot run** due to missing `package.json`, `App.tsx`, `main.tsx`, and build configuration. |

---

## 4. Deep-Dive Code Health & Discrepancies Analysis

### 4.1 Schema Mismatch between `src/` and `index.html`

In `index.html`:
```javascript
const INITIAL_COURSES = [
  {
    id: "CS101",
    code: "CS101-01",
    name: "Nhập môn Lập trình CNTT",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Trần Văn A",
    room: "P.302-A1",
    day: 2,
    periodSlot: "p1", // <--- Used for grid and conflict
    shift: "MORNING",
    scheduleText: "Thứ Hai (Tiết 1 - 3)", // <--- String representation
    timeText: "07:00 - 09:25",
    status: "available",
    color: "blue"
  }, ...
];
```

In `src/types/index.ts`:
```typescript
export interface Course {
  id: string;
  code: string;
  name: string;
  faculty: 'CNTT' | 'TOAN' | 'NN' | 'ATTT';
  credits: number;
  lecturer: string;
  room: string;
  day: number;
  startPeriod: number; // <--- Numerical start
  endPeriod: number;   // <--- Numerical end
  periodText: string;
  timeText: string;
  shift: ShiftType;
  status: 'available' | 'ineligible';
  prereqReason?: string;
  isAiRecommended?: boolean;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo';
  // NOTICE: scheduleText is NOT defined here!
}
```

In `src/data/mockCourses.ts`:
```typescript
export const MOCK_COURSES: Course[] = [
  {
    id: "CS101",
    code: "CS101-01",
    name: "Nhập môn Lập trình CNTT",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Trần Văn A",
    room: "P.302-A1",
    day: 2,
    startPeriod: 1,
    endPeriod: 3,
    periodText: "Tiết 1 - 3",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    color: "blue"
    // NOTICE: scheduleText is NOT defined here!
  }, ...
];
```

In `src/components/CourseCard.tsx` (Line 58):
```tsx
<p className="text-[11px] font-semibold text-slate-700 mt-0.5">
  {course.scheduleText} ({course.timeText})  // <--- COMPILE & RUNTIME ERROR: undefined
</p>
```
In `src/components/ConflictAlert.tsx` (Line 24):
```tsx
Lớp <strong>{conflict.incomingCourse.code}</strong> bị trùng ca Thứ {conflict.incomingCourse.day} ({conflict.incomingCourse.scheduleText}) ... // <--- COMPILE & RUNTIME ERROR: undefined
```

### 4.2 Conflict Detection Algorithm Breakdown
The authoritative formula defined in R3:
$$\text{Conflict} = (\text{day}_A == \text{day}_B) \land (\text{start}_A \le \text{end}_B \land \text{end}_A \ge \text{start}_B)$$

- **In `index.html`**:
  ```javascript
  const clash = courses.find(x => selectedIds.includes(x.id) && x.day === course.day && x.periodSlot === course.periodSlot);
  ```
  This is an exact-slot match (`p1` == `p1`). It fails if course A occupies periods 1-4 and course B occupies periods 3-5.
- **In `src/components/CourseExplorer.tsx`**:
  ```typescript
  const isConflict = courses.some(x => selectedIds.includes(x.id) && x.id !== c.id && x.day === c.day && x.periodText === c.periodText);
  ```
  This is a string equality check on `periodText`. If Course A is `"Tiết 7 - 10"` and Course B is `"Tiết 7 - 9"`, they overlap between periods 7 and 9, but the strings are different, so the algorithm returns `false`!
- **Resolution**:
  All courses must specify `startPeriod` and `endPeriod` integers (1 to 12), and all conflict checking across Explorer, Timetable, and App state must use interval overlap:
  ```typescript
  export function checkConflict(a: Course, b: Course): boolean {
    return a.day === b.day && a.startPeriod <= b.endPeriod && a.endPeriod >= b.startPeriod;
  }
  ```

### 4.3 Missing Build & Development Infrastructure
To make the project a true modern SaaS application that conforms to R5 ("Đóng gói ứng dụng chạy được cả ở chế độ modular source trong src/ và chạy độc lập qua index.html"):
1. Need a root `package.json` declaring dependencies (`react`, `react-dom`, `lucide-react`, `canvas-confetti`, `tailwindcss`, `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `@types/canvas-confetti`).
2. Need a standard `vite.config.ts` configured for rapid hot-reloading and static production build.
3. Need `tsconfig.json` enabling strict TypeScript typing.
4. Need `src/App.tsx` orchestrating all state, handlers, modals, toasts, conflict detection, plan switching, and countdown timer.
5. Need `src/main.tsx` bootstrapping the React application into `#root`.
6. Need `src/index.css` importing Tailwind directives and keyframe animations (`pulse-conflict`, `shake-subtle`, `ghost-timetable-block`).
7. Need `src/components/CourseDetailModal.tsx` and `src/components/ReceiptModal.tsx`.
8. Need an automated synchronization / build script to ensure `index.html` (standalone) and `src/` (modular) remain 100% feature-identical and bug-free.

---

## 5. Prioritized Actionable Recommendations for Implementation

| Priority | Area | Required Action |
| :---: | :--- | :--- |
| **P0** | **Conflict Engine** | Implement canonical interval collision function `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)` across both `index.html` and `src/`. Unify schema so all courses have `startPeriod`, `endPeriod`, `scheduleText`, and `periodText`. |
| **P0** | **Missing Modals** | Create `CourseDetailModal` (Course information, lecturer, description, prerequisites status) and connect it to "Xem chi tiết" and Timetable click events. |
| **P0** | **Modular Source Setup** | Add `package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`, `src/main.tsx`, and `src/index.css` so `npm run dev` and `npm run build` succeed seamlessly. |
| **P1** | **Timetable Plan Switcher** | Add toggle between "Phương án 1" and "Phương án 2" in WeeklyTimetable toolbar, maintaining separate cart states per plan. |
| **P1** | **Real Calendar Export** | Replace dummy `alert()` with a true client-side `.ics` generator and download function creating real VEVENT records for all enrolled courses. |
| **P1** | **Live Countdown & Bell** | Implement a 1-second interval countdown timer in Header and an interactive dropdown for system notifications. |
| **P1** | **Dynamic Workload Meter** | Convert Workload Meter bar into a dynamic continuous percentage bar `(credits / 24) * 100%` with smooth color transitions. |
| **P2** | **Filter Completeness** | Add Sunday (Chủ Nhật, Day 8) to the Day filter dropdown in CourseExplorer. |
| **P2** | **Rich Mock Dataset** | Expand `mockCourses` to 14-18 courses covering all days (T2-CN), morning/afternoon shifts, and diverse departments (CNTT, TOAN, NN, ATTT) for comprehensive testing. |
| **P2** | **WCAG & Responsive Polish** | Eliminate `select-none` on body, adjust minimum font sizes to >= 11px for text-slate-500, and ensure viewport adaptability on 1366x768 screens. |

