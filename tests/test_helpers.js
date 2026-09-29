/**
 * Shared Test Helpers and Canonical Domain Model for ICRA E2E Test Suite
 * Conforms to ORIGINAL_REQUEST.md, PROJECT.md, and TEST_INFRA.md
 */

const fs = require('fs');
const path = require('path');

// Authoritative Student Profile (R1 / F03)
const MOCK_STUDENT = {
  name: "An Bá Thành",
  studentId: "DTC245210002",
  classGroup: "CNTT K24",
  major: "Kỹ thuật Phần mềm",
  accumulatedCredits: 45,
  targetCredits: 135,
  term: "Học kỳ 1 (2026 - 2027) — Đợt chính"
};

// Authoritative Mock Courses Dataset
const MOCK_COURSES = [
  {
    id: "CS101",
    code: "CS101-01",
    name: "Nhập môn Lập trình CNTT",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Trần Văn A",
    room: "P.302-A1",
    day: 2, // Monday
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "p1",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Hai (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
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
    day: 3, // Tuesday
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "p1",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Ba (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
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
    day: 4, // Wednesday
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "p1",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Tư (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
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
    day: 6, // Friday
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "p1",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Sáu (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
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
    day: 5, // Thursday
    startPeriod: 7,
    endPeriod: 9,
    periodSlot: "p3",
    periodText: "Tiết 7 - 9",
    scheduleText: "Thứ Năm (Tiết 7 - 9)",
    timeText: "12:45 - 15:10",
    shift: "AFTERNOON",
    status: "available",
    isAiRecommended: true,
    alternateCourseId: "CS202-02",
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
    day: 3, // Tuesday (Collides with CS201)
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "p1",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Ba (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
    alternateCourseId: "CS202-01",
    color: "red"
  },
  {
    id: "NET101",
    code: "NET101-01",
    name: "Mạng Máy tính Căn bản",
    faculty: "CNTT",
    credits: 3,
    lecturer: "TS. Đỗ Quang D",
    room: "P.501-A1",
    day: 5, // Thursday
    startPeriod: 1,
    endPeriod: 3,
    periodSlot: "p1",
    periodText: "Tiết 1 - 3",
    scheduleText: "Thứ Năm (Tiết 1 - 3)",
    timeText: "07:00 - 09:25",
    shift: "MORNING",
    status: "available",
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
    day: 7, // Saturday
    startPeriod: 7,
    endPeriod: 10,
    periodSlot: "p3",
    periodText: "Tiết 7 - 10",
    scheduleText: "Thứ Bảy (Tiết 7 - 10)",
    timeText: "12:45 - 16:15",
    shift: "AFTERNOON",
    status: "ineligible",
    prereqReason: "Chưa đủ 60 TC",
    color: "slate"
  }
];

// Timetable Grid Slot Definitions (8x4 Matrix)
const TIMETABLE_SLOTS = [
  { id: "p1", label: "Tiết 1 - 3", startPeriod: 1, endPeriod: 3, time: "07:00 - 09:25", shift: "Sáng" },
  { id: "p2", label: "Tiết 4 - 5", startPeriod: 4, endPeriod: 5, time: "09:35 - 11:10", shift: "Sáng" },
  { id: "p3", label: "Tiết 7 - 9", startPeriod: 7, endPeriod: 9, time: "12:45 - 15:10", shift: "Chiều" },
  { id: "p4", label: "Tiết 10 - 11", startPeriod: 10, endPeriod: 11, time: "15:20 - 16:55", shift: "Chiều" }
];

const TIMETABLE_DAYS = [
  { dayNumber: 2, label: "Thứ Hai" },
  { dayNumber: 3, label: "Thứ Ba" },
  { dayNumber: 4, label: "Thứ Tư" },
  { dayNumber: 5, label: "Thứ Năm" },
  { dayNumber: 6, label: "Thứ Sáu" },
  { dayNumber: 7, label: "Thứ Bảy" },
  { dayNumber: 8, label: "Chủ Nhật" }
];

/**
 * Universal Interval Collision Detection Algorithm
 * Conflict = (day_A == day_B) && (start_A <= end_B && end_A >= start_B)
 */
function checkIntervalConflict(courseA, courseB) {
  if (!courseA || !courseB) return false;
  if (courseA.id === courseB.id) return false;
  if (courseA.day !== courseB.day) return false;

  // If slot notation is used without exact period numbers, map or compare
  const startA = courseA.startPeriod ?? (courseA.periodSlot === 'p1' ? 1 : courseA.periodSlot === 'p2' ? 4 : courseA.periodSlot === 'p3' ? 7 : 10);
  const endA = courseA.endPeriod ?? (courseA.periodSlot === 'p1' ? 3 : courseA.periodSlot === 'p2' ? 5 : courseA.periodSlot === 'p3' ? 9 : 11);
  const startB = courseB.startPeriod ?? (courseB.periodSlot === 'p1' ? 1 : courseB.periodSlot === 'p2' ? 4 : courseB.periodSlot === 'p3' ? 7 : 10);
  const endB = courseB.endPeriod ?? (courseB.periodSlot === 'p1' ? 3 : courseB.periodSlot === 'p2' ? 5 : courseB.periodSlot === 'p3' ? 9 : 11);

  return startA <= endB && endA >= startB;
}

/**
 * Find collision in currently enrolled courses list
 */
function findConflict(incomingCourse, enrolledCourses) {
  return enrolledCourses.find(existing => checkIntervalConflict(incomingCourse, existing)) || null;
}

/**
 * Tuition Calculation Formula: credits * 450,000 VNĐ
 */
function calculateTuition(credits) {
  return credits * 450000;
}

/**
 * Workload Classification:
 * < 12 TC: Thiếu tải (Amber)
 * 12 - 18 TC: Cân đối (Lý tưởng) (Green)
 * > 18 TC: Tải cao / Căng thẳng (Red)
 */
function classifyWorkload(totalCredits) {
  if (totalCredits < 12) {
    return {
      tier: "underload",
      label: "Thiếu tải (<12 TC)",
      color: "amber",
      isEligible: false
    };
  } else if (totalCredits <= 18) {
    return {
      tier: "balanced",
      label: "Cân đối (Lý tưởng)",
      color: "emerald",
      isEligible: true
    };
  } else {
    return {
      tier: "overload",
      label: "Tải cao (>18 TC)",
      color: "red",
      isEligible: totalCredits <= 24 // Can submit up to max 24 TC with caution
    };
  }
}

/**
 * Can Submit Registration (Primary CTA Constraint)
 * Locked if totalCredits < 12 OR hasConflict is true
 */
function canSubmitRegistration(totalCredits, hasConflict) {
  return totalCredits >= 12 && !hasConflict;
}

/**
 * Faceted Course Filter Engine
 */
function filterCourses(courses, options = {}) {
  const {
    search = "",
    faculty = "ALL",
    shift = "ALL",
    day = "ALL",
    maxCredits = 4,
    onlyNonConflicting = false,
    selectedIds = []
  } = options;

  const query = search.trim().toLowerCase();

  return courses.filter(c => {
    // Search query matching code, name, lecturer
    const matchQuery = !query || 
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.lecturer.toLowerCase().includes(query);

    // Faculty filter
    const matchFaculty = faculty === "ALL" || c.faculty === faculty;

    // Shift filter
    const matchShift = shift === "ALL" || c.shift === shift;

    // Day filter
    const matchDay = day === "ALL" || c.day.toString() === day.toString();

    // Max credits
    const matchCredits = c.credits <= maxCredits;

    // Smart conflict filter: if checked, exclude courses that clash with already selected ones
    if (onlyNonConflicting && !selectedIds.includes(c.id)) {
      const enrolled = courses.filter(x => selectedIds.includes(x.id));
      const hasClash = enrolled.some(x => checkIntervalConflict(c, x));
      if (hasClash) return false;
    }

    return matchQuery && matchFaculty && matchShift && matchDay && matchCredits;
  });
}

/**
 * RFC 5545 iCalendar Generator (.ics)
 */
function generateICalendar(courses, student = MOCK_STUDENT) {
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Base semester week start: Monday 2026-09-28
  const baseSemesterMonday = new Date(Date.UTC(2026, 8, 28, 0, 0, 0));

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ICTU//ICRA Intelligent Course Registration//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Thời Khóa Biểu ICTU - ${student.name}`,
    "X-WR-TIMEZONE:Asia/Ho_Chi_Minh"
  ];

  for (const course of courses) {
    // Day offset: day 2 is Monday (offset 0), day 8 is Sunday (offset 6)
    const dayOffset = (course.day >= 2 && course.day <= 8) ? (course.day - 2) : 0;
    const eventDate = new Date(baseSemesterMonday);
    eventDate.setUTCDate(eventDate.getUTCDate() + dayOffset);

    // Timing
    const [startH, startM] = course.shift === 'MORNING' ? [7, 0] : [12, 45];
    const [endH, endM] = course.shift === 'MORNING' ? [9, 25] : [15, 10];

    const dtStartStr = `2026092${8 + dayOffset}T${String(startH).padStart(2, '0')}${String(startM).padStart(2, '0')}00`;
    const dtEndStr = `2026092${8 + dayOffset}T${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}00`;

    ics.push(
      "BEGIN:VEVENT",
      `UID:${course.id}-2026-ICTU@icra.ictu.edu.vn`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStartStr}`,
      `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEndStr}`,
      `SUMMARY:[${course.code}] ${course.name}`,
      `DESCRIPTION:Giảng viên: ${course.lecturer} | Tín chỉ: ${course.credits} TC | Thời gian: ${course.scheduleText}`,
      `LOCATION:${course.room || 'ICTU Campus'}`,
      "RRULE:FREQ=WEEKLY;COUNT=15",
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

/**
 * Calculate WCAG 2.1 Color Relative Luminance and Contrast Ratio
 */
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Locate Chrome or Edge on Windows
 */
function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

module.exports = {
  MOCK_STUDENT,
  MOCK_COURSES,
  TIMETABLE_SLOTS,
  TIMETABLE_DAYS,
  checkIntervalConflict,
  findConflict,
  calculateTuition,
  classifyWorkload,
  canSubmitRegistration,
  filterCourses,
  generateICalendar,
  calculateContrastRatio,
  findBrowserExecutable
};
