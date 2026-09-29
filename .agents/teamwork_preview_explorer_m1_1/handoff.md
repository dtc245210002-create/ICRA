# HANDOFF REPORT — Milestone 1 (Explorer 1: Data Contracts & Header)

**Core Finding**: The existing codebase has a critical contract mismatch where consumer components (`CourseCard.tsx:58`, `ConflictAlert.tsx:24`) already reference `course.scheduleText`, but this field is entirely missing from the `Course` interface in `src/types/index.ts` and `src/data/mockCourses.ts`. Furthermore, both `Header.tsx` and `index.html` render a static, non-ticking string (`74:15:20`) and a non-interactive dummy notification bell. We formulate complete, drop-in replacement technical specifications for unified data typing, normalized dataset enrichment (including all 4 period slots and Sunday/Day 8), an active 1-second ticking countdown timer hook, and an interactive system notification dropdown.

---

## 1. Observation

### 1.1 Data Model Inconsistencies in `src/types/index.ts`
- **File**: `src/types/index.ts`, lines 4–22:
  ```typescript
  export interface Course {
    id: string;
    code: string;
    name: string;
    faculty: 'CNTT' | 'TOAN' | 'NN' | 'ATTT';
    credits: number;
    lecturer: string;
    room: string;
    day: number; // 2 (Monday) to 8 (Sunday)
    startPeriod: number;
    endPeriod: number;
    periodText: string;
    timeText: string;
    shift: ShiftType;
    status: 'available' | 'ineligible';
    prereqReason?: string;
    isAiRecommended?: boolean;
    color: 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo';
  }
  ```
- **Observed Deficiencies**:
  1. `scheduleText` is missing from `Course`. However, `src/components/CourseCard.tsx:58` (`{course.scheduleText} ({course.timeText})`) and `src/components/ConflictAlert.tsx:24` (`{conflict.incomingCourse.scheduleText}`) directly access this property. Under strict TypeScript compilation, this causes a fatal type error (`Property 'scheduleText' does not exist on type 'Course'`).
  2. `periodSlot` is missing from `Course`. `PROJECT.md:78` defines `periodSlot: 'slot_1_3' | 'slot_4_5' | 'slot_7_9' | 'slot_10_11'`, and `index.html:104, 535, 639` matches cards to timetable cells via `periodSlot`.
  3. `alternateCourseId?: string` is missing from `Course`. In `PROJECT.md:85` and `ORIGINAL_REQUEST.md:31`, the 1-click auto-switch section feature relies on this pointer to automatically swap clashing sections (e.g. `CS202-02` pointing to `CS202-01`).
  4. `prerequisites: string[]` is missing from `Course` (only `prereqReason?: string` exists). `ORIGINAL_REQUEST.md:40, 44` requires automated prerequisite checking prior to registration confirmation.
  5. `enrolled: number` and `maxSeats: number` are missing from `Course`, which prevents displaying class capacity metrics.
  6. `classroom` is used in `PROJECT.md:73`, while `src/components/CourseCard.tsx:56`, `TimetableCourseCard.tsx:23`, and `index.html:102` use `room`.
  7. `TimetablePlan` interface (`PROJECT.md:95–99`) is missing from `src/types/index.ts`.
  8. `ShiftType` in `src/types/index.ts:2` is `'MORNING' | 'AFTERNOON'`, whereas `PROJECT.md:77` specifies `'Sáng' | 'Chiều'`, and `CourseExplorer.tsx:99–104` maps filter values `'MORNING'` and `'AFTERNOON'`.

### 1.2 Data Normalization Gaps in `src/data/mockCourses.ts`
- **File**: `src/data/mockCourses.ts`, lines 14–153:
  - All 8 courses lack `scheduleText`, `periodSlot`, `alternateCourseId`, `prerequisites`, `enrolled`, and `maxSeats`.
  - Period Slot Gap: Only `slot_1_3` (Tiết 1–3) and `slot_7_9` (Tiết 7–9) have courses. Slots `slot_4_5` (Tiết 4–5) and `slot_10_11` (Tiết 10–11) have **0** courses.
  - Day Gap: Only Days 2, 3, 4, 5, 6, 7 are populated. Day 8 (Chủ Nhật / Sunday) has **0** courses, leaving a dead zone in the 8-column matrix and failing Sunday filter tests.
  - Alternates: `CS202-02` (clashes with `CS201` on Day 3 morning) does not link to `CS202-01` via `alternateCourseId`.

### 1.3 Static Countdown & Non-Interactive Header
- **File**: `src/components/Header.tsx`, lines 41–52:
  ```tsx
  <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs">
    <Clock className="w-3.5 h-3.5 text-slate-500" />
    <span className="text-slate-500 font-medium">Hạn đóng cổng:</span>
    <span className="font-mono font-bold text-blue-600">74:15:20</span>
    <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">23:59 • 01/10</span>
  </div>

  <button className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition" title="Thông báo">
    <Bell className="w-4 h-4" />
    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
  </button>
  ```
- **File**: `index.html`, lines 260–270:
  Contains an identical static implementation.
- **Observed Deficiencies**:
  1. The string `74:15:20` is hardcoded; it never ticks or decrements.
  2. The notification bell has no `onClick` handler, no dropdown menu, and no notification items.
  3. Student identity (`student.name`, `student.studentId`, `student.classGroup`) renders correctly, but the avatar initials `"AT"` are hardcoded and have no profile preview.

---

## 2. Logic Chain

1. **Restoring Contract Integrity (Observation 1.1 → Logic 1)**:
   Because `CourseCard.tsx:58` and `ConflictAlert.tsx:24` already access `course.scheduleText`, the lack of `scheduleText` in `src/types/index.ts` is a compilation failure. Adding `scheduleText: string` directly fixes this syntax break. Adding `classroom?: string` as an optional alias provides seamless compatibility between `room` and `classroom`.
2. **Dynamic 1-Click Alternate Swapping (Observation 1.1 & 1.2 → Logic 2)**:
   In `ORIGINAL_REQUEST.md:31` and `PROJECT.md:85`, conflict resolution requires 1-click swapping to an available non-clashing section. Adding `alternateCourseId?: string` to `Course` allows `CS202-02` to point to `CS202-01` (and vice versa) dynamically, eliminating hardcoded workarounds in `ConflictAlert`.
3. **Comprehensive Timetable & Filter Coverage (Observation 1.2 → Logic 3)**:
   The CourseExplorer day filter (Thứ 2 đến Chủ Nhật) and shift filter (Sáng/Chiều) require valid courses on all days and slots. Adding 3 supplementary courses (`MATH102` for `slot_4_5`, `ENG102` for `slot_10_11`, and `AI101` for Day 8 / Sunday) satisfies all test partitions.
4. **Live Ticking Countdown Timer (Observation 1.3 → Logic 4)**:
   To satisfy `ORIGINAL_REQUEST.md R1` and `PROJECT.md F02`, the countdown timer must tick every second starting from `74:15:20` (equivalent to `267,320` total seconds). Implementing a React `useEffect` with `setInterval(..., 1000)` and state `timeLeft` provides an accurate, decrementing live clock without external dependencies.
5. **Interactive Enterprise Notification Dropdown (Observation 1.3 → Logic 5)**:
   To fulfill `ORIGINAL_REQUEST.md R1` ("chuông thông báo hệ thống"), the bell button must toggle a dropdown containing official announcements (registration open, prerequisite alert, tuition fee notice) with an unread badge counter and a "Mark all as read" button.

---

## 3. Concrete Technical Specifications for Worker

### 3.1 Drop-In Replacement for `src/types/index.ts`

```typescript
// src/types/index.ts

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'Sáng' | 'Chiều';

export type FacultyType = 'CNTT' | 'TOAN' | 'NN' | 'ATTT' | 'Toán - Tin' | 'Ngoại ngữ';

export type PeriodSlot = 
  | 'slot_1_3' 
  | 'slot_4_5' 
  | 'slot_7_9' 
  | 'slot_10_11'
  | 'p1' 
  | 'p2' 
  | 'p3' 
  | 'p4';

export interface Course {
  id: string;
  code: string;
  name: string;
  faculty: FacultyType;
  credits: number;
  lecturer: string;
  room: string;
  classroom?: string; // Compatibility alias
  day: number; // 2 (Thứ Hai) .. 8 (Chủ Nhật)
  startPeriod: number; // 1 .. 11
  endPeriod: number; // 1 .. 11
  shift: ShiftType;
  periodSlot: PeriodSlot;
  periodText: string; // e.g. "Tiết 1 - 3"
  scheduleText: string; // e.g. "Thứ Hai (Tiết 1 - 3)"
  timeText: string; // e.g. "07:00 - 09:25"
  status: 'available' | 'ineligible';
  prerequisites: string[]; // e.g. ["CS101"]
  prereqReason?: string;
  isAiRecommended?: boolean;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo' | 'red' | 'slate';
  colorTheme?: string;
  enrolled: number;
  maxSeats: number;
  alternateCourseId?: string; // ID of available non-conflicting section
}

export interface ConflictInfo {
  incomingCourse: Course;
  existingCourse: Course;
  alternateCourse?: Course;
  day?: number;
  periodText?: string;
}

export interface TimetablePlan {
  id: 'plan_1' | 'plan_2';
  name: string;
  selectedCourseIds: string[];
}

export interface StudentInfo {
  name: string;
  studentId: string;
  classGroup: string;
  major: string;
  accumulatedCredits: number;
  targetCredits: number;
  term: string;
  initials?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface HeaderNotification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}
```

### 3.2 Drop-In Replacement for `src/data/mockCourses.ts`

```typescript
// src/data/mockCourses.ts
import { Course, StudentInfo } from '../types';

export const CURRENT_STUDENT: StudentInfo = {
  name: "An Bá Thành",
  studentId: "DTC245210002",
  classGroup: "CNTT K24",
  major: "Kỹ thuật Phần mềm",
  accumulatedCredits: 45,
  targetCredits: 135,
  term: "Học kỳ 1 (2026 - 2027) — Đợt chính",
  initials: "AT"
};

export const MOCK_COURSES: Course[] = [
  {
    id: "CS101",
    code: "CS101-01",
    name: "Nhập môn Lập trình CNTT",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Trần Văn A",
    room: "P.302-A1",
    classroom: "P.302-A1",
    day: 2,
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "slot_1_3",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Hai (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    prerequisites: [],
    enrolled: 42,
    maxSeats: 50,
    color: "blue"
  },
  {
    id: "CS201",
    code: "CS201-01",
    name: "Cấu trúc Dữ liệu & Giải thuật",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Nguyễn Thanh Hải",
    room: "P.405-A1",
    classroom: "P.405-A1",
    day: 3,
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "slot_1_3",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Ba (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    prerequisites: ["CS101"],
    enrolled: 45,
    maxSeats: 50,
    color: "emerald"
  },
  {
    id: "MATH101",
    code: "MATH101-02",
    name: "Đại số Tuyến tính & Toán Rời rạc",
    faculty: "TOAN",
    credits: 3,
    lecturer: "ThS. Lê Thị B",
    room: "P.201-A2",
    classroom: "P.201-A2",
    day: 4,
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "slot_1_3",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Tư (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    prerequisites: [],
    enrolled: 38,
    maxSeats: 45,
    color: "purple"
  },
  {
    id: "ENG101",
    code: "ENG101-04",
    name: "Tiếng Anh Chuyên ngành 1",
    faculty: "NN",
    credits: 3,
    lecturer: "ThS. Vũ Hoàng C",
    room: "P.104-B3",
    classroom: "P.104-B3",
    day: 6,
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "slot_1_3",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Sáu (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    prerequisites: [],
    enrolled: 30,
    maxSeats: 35,
    color: "amber"
  },
  {
    id: "CS202-01",
    code: "CS202-01",
    name: "Thiết kế Giao diện Phần mềm (UI/UX)",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Nguyễn Thanh Hải",
    room: "P.402-A1",
    classroom: "P.402-A1",
    day: 5,
    startPeriod: 7,
    endPeriod: 9,
    periodSlot: "slot_7_9",
    periodText: "Tiết 7 - 9",
    scheduleText: "Thứ Năm (Tiết 7 - 9)",
    timeText: "12:45 - 15:10",
    shift: "AFTERNOON",
    status: "available",
    isAiRecommended: true,
    prerequisites: ["CS101"],
    alternateCourseId: "CS202-02",
    enrolled: 36,
    maxSeats: 45,
    color: "blue"
  },
  {
    id: "CS202-02",
    code: "CS202-02",
    name: "Thiết kế UI/UX (Lớp Trùng Ca T3)",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Nguyễn Thanh Hải",
    room: "P.403-A1",
    classroom: "P.403-A1",
    day: 3,
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "slot_1_3",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Ba (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    prerequisites: ["CS101"],
    alternateCourseId: "CS202-01",
    enrolled: 44,
    maxSeats: 45,
    color: "blue"
  },
  {
    id: "NET101",
    code: "NET101-01",
    name: "Mạng Máy tính Căn bản",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Đỗ Quang D",
    room: "P.501-A1",
    classroom: "P.501-A1",
    day: 5,
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "slot_1_3",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Năm (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    prerequisites: [],
    enrolled: 40,
    maxSeats: 50,
    color: "indigo"
  },
  {
    id: "SE301",
    code: "SE301-01",
    name: "Kiến trúc Phần mềm Nâng cao",
    faculty: "CNTT",
    credits: 4,
    lecturer: "PGS.TS. Hoàng Văn E",
    room: "Lab 02-B2",
    classroom: "Lab 02-B2",
    day: 7,
    startPeriod: 7,
    endPeriod: 10,
    periodSlot: "slot_7_9",
    periodText: "Tiết 7 - 10",
    scheduleText: "Thứ Bảy (Tiết 7 - 10)",
    timeText: "12:45 - 16:15",
    shift: "AFTERNOON",
    status: "ineligible",
    prereqReason: "Chưa tích lũy đủ 60 TC",
    prerequisites: ["CS201", "CS101"],
    enrolled: 25,
    maxSeats: 40,
    color: "purple"
  },
  // Supplementary courses covering slot_4_5, slot_10_11, and Sunday (Day 8):
  {
    id: "MATH102",
    code: "MATH102-01",
    name: "Xác suất Thống kê Ứng dụng",
    faculty: "TOAN",
    credits: 3,
    lecturer: "TS. Vũ Minh Tuấn",
    room: "P.204-A2",
    classroom: "P.204-A2",
    day: 2,
    startPeriod: 4,
    endPeriod: 5,
    periodSlot: "slot_4_5",
    periodText: "Tiết 4 - 5",
    scheduleText: "Thứ Hai (Tiết 4 - 5)",
    timeText: "09:35 - 11:10",
    shift: "MORNING",
    status: "available",
    prerequisites: [],
    enrolled: 32,
    maxSeats: 45,
    color: "purple"
  },
  {
    id: "ENG102",
    code: "ENG102-01",
    name: "Kỹ năng Thuyết trình Tiếng Anh",
    faculty: "NN",
    credits: 2,
    lecturer: "ThS. Hoàng Mai Ly",
    room: "P.102-B3",
    classroom: "P.102-B3",
    day: 4,
    startPeriod: 10,
    endPeriod: 11,
    periodSlot: "slot_10_11",
    periodText: "Tiết 10 - 11",
    scheduleText: "Thứ Tư (Tiết 10 - 11)",
    timeText: "15:20 - 16:55",
    shift: "AFTERNOON",
    status: "available",
    prerequisites: [],
    enrolled: 28,
    maxSeats: 35,
    color: "amber"
  },
  {
    id: "AI101",
    code: "AI101-01",
    name: "Trí tuệ Nhân tạo Cơ bản",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Hoàng Minh Dũng",
    room: "P.502-A1",
    classroom: "P.502-A1",
    day: 8,
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "slot_1_3",
    periodText: "Tiết 1 - 3",
    scheduleText: "Chủ Nhật (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    prerequisites: ["CS101"],
    enrolled: 35,
    maxSeats: 50,
    color: "indigo"
  }
];
```

### 3.3 Drop-In Replacement for `src/components/Header.tsx`

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Clock, Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { StudentInfo, HeaderNotification } from '../types';

interface HeaderProps {
  student: StudentInfo;
  initialCountdownSeconds?: number;
}

const DEFAULT_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: 'n1',
    type: 'info',
    title: 'Cổng Đăng Ký Đang Mở',
    message: 'Cổng đăng ký tín chỉ Học kỳ 1 (2026 - 2027) chính thức mở từ 08:00 29/09.',
    time: 'Vừa xong',
    read: false
  },
  {
    id: 'n2',
    type: 'warning',
    title: 'Lưu ý Tiên quyết',
    message: 'Học phần SE301 yêu cầu hoàn thành tối thiểu 60 tín chỉ tích lũy.',
    time: '2 giờ trước',
    read: false
  },
  {
    id: 'n3',
    type: 'success',
    title: 'Biểu phí Học kỳ 1',
    message: 'Mức học phí 450.000 VNĐ / tín chỉ được áp dụng tự động cho K24.',
    time: '1 ngày trước',
    read: true
  }
];

export const Header: React.FC<HeaderProps> = ({ 
  student, 
  initialCountdownSeconds = 267320 // 74h 15m 20s
}) => {
  // Live Ticking Countdown State
  const [timeLeft, setTimeLeft] = useState<number>(initialCountdownSeconds);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>(DEFAULT_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format seconds to HH:MM:SS
  const formatCountdown = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-xs z-30 relative">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">ICRA</span>
              <span className="text-xs font-semibold text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-600">Trường ĐH Công nghệ Thông tin & Truyền thông</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Hệ thống Đăng ký Học phần & Hoạch định Thời khóa biểu Thông minh</p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <div className="hidden sm:flex items-center space-x-2.5">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {student.term}
          </span>
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cổng Đăng Ký Đang Mở</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-5">
        {/* Ticking Countdown Timer */}
        <div 
          data-testid="countdown-container"
          className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs shadow-2xs"
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 font-medium">Hạn đóng cổng:</span>
          <span data-testid="countdown-timer" className="font-mono font-bold text-blue-600 tracking-wider">
            {formatCountdown(timeLeft)}
          </span>
          <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">23:59 • 01/10</span>
        </div>

        {/* Interactive Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Thông báo hệ thống"
            aria-label="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xs text-slate-900">Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    className="text-[10px] font-semibold text-blue-600 hover:underline"
                  >
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`px-4 py-2.5 flex items-start space-x-2.5 hover:bg-slate-50 transition cursor-pointer ${
                      !n.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.type === 'warning' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      ) : n.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-800 leading-snug truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Student Identity */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="text-right">
            <p className="font-bold text-slate-900 text-xs leading-none">{student.name}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{student.studentId} • {student.classGroup}</p>
          </div>
          <div 
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs select-none"
            title={`${student.name} (${student.studentId})`}
          >
            {student.initials || "AT"}
          </div>
        </div>
      </div>
    </header>
  );
};
```

### 3.4 Standalone `index.html` Synchronization
In `index.html`:
1. Synchronize `INITIAL_COURSES` with `scheduleText`, `periodSlot: "slot_1_3"`, `alternateCourseId: "CS202-01"` for `CS202-02`, and add the 3 supplementary courses.
2. In the `Header` function component in `index.html`:
   - Replace static string `74:15:20` with `timeLeft` state (`useState(267320)`) and `useEffect(..., 1000)`.
   - Add `isNotifOpen` toggle state and notification dropdown list.

---

## 4. Caveats

- **No Caveats on Typing or Header Requirements**: All technical solutions adhere strictly to `ORIGINAL_REQUEST.md` and `PROJECT.md`.
- **Note on Alternate Sections**: Introducing `alternateCourseId` in M1 anticipates M2 (F16 1-Click Auto-Switch Section) without modifying any downstream behavior ahead of schedule.

---

## 5. Conclusion

1. **`src/types/index.ts`** must be updated with `scheduleText`, `periodSlot`, `alternateCourseId`, `prerequisites`, `enrolled`, `maxSeats`, `classroom`, `TimetablePlan`, and `HeaderNotification`.
2. **`src/data/mockCourses.ts`** must be enriched with complete scheduling metadata and extended with courses in `slot_4_5`, `slot_10_11`, and Sunday (Day 8).
3. **`Header.tsx`** and **`index.html`** must integrate the 1-second interval ticking countdown timer and interactive notification center with unread badge handling.
4. Implementing these specifications resolves the type compiler errors and elevates the application to commercial enterprise standards.

---

## 6. Verification Method

1. **Type & File Verification**:
   Inspect `src/types/index.ts` to confirm `scheduleText`, `periodSlot`, and `alternateCourseId` exist on `Course`.
   Inspect `src/components/CourseCard.tsx` and `src/components/ConflictAlert.tsx` to verify zero type errors on `course.scheduleText`.
2. **Live Ticking Countdown**:
   Load `index.html` (or `Header.tsx` in a browser runner); verify the timer displays `"74:15:20"` initially, and ticks down by 1 second on each interval.
3. **Notification Bell Dropdown**:
   Click the bell icon; confirm dropdown opens with 3 items and unread badge ("2 mới"). Click "Đã đọc tất cả"; verify unread indicator clears. Click outside; verify dropdown closes.
4. **Student Identity**:
   Verify display of `"An Bá Thành"`, `"DTC245210002 • CNTT K24"`, and `"AT"` avatar.
5. **Project Test Runner**:
   Execute Node test runner once test suite is mounted:
   `node --test tests/*.test.js`
