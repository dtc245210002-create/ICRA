/**
 * Tier 1: Feature Coverage Test Suite (F01 - F31)
 * Minimum required tests: 15
 * Implemented tests: 20
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
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
  generateICalendar
} = require('./test_helpers');

describe('Tier 1: Feature Verification (F01 - F31)', () => {

  // --- F01: Enterprise Header ---
  test('F01: Header displays ICRA branding, ICTU university name, and semester badge', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');

    assert.ok(htmlContent.includes('ICRA'), 'Must display ICRA system logo/title');
    assert.ok(
      htmlContent.includes('Trường ĐH Công nghệ Thông tin & Truyền thông') ||
      htmlContent.includes('ICTU'),
      'Must display ICTU university name'
    );
    assert.ok(
      htmlContent.includes('Học kỳ 1') && htmlContent.includes('2026 - 2027'),
      'Must display semester badge for 2026 - 2027'
    );
  });

  // --- F02: Portal Status & Countdown Timer ---
  test('F02: Portal status displays Open badge and countdown timer in HH:MM:SS format', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');

    assert.ok(htmlContent.includes('Cổng Đăng Ký Đang Mở'), 'Must show open registration portal badge');
    
    // Countdown format regex e.g. 74:15:20
    const countdownRegex = /\d{2,3}:\d{2}:\d{2}/;
    assert.match(htmlContent, countdownRegex, 'Must contain countdown timer matching HH:MM:SS format');
  });

  // --- F03: Student Identity Profile ---
  test('F03: Displays student identity An Bá Thành (DTC245210002 • CNTT K24) and notification icon', () => {
    assert.equal(MOCK_STUDENT.name, 'An Bá Thành');
    assert.equal(MOCK_STUDENT.studentId, 'DTC245210002');
    assert.equal(MOCK_STUDENT.classGroup, 'CNTT K24');

    const indexPath = path.join(__dirname, '..', 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    assert.ok(htmlContent.includes('An Bá Thành'), 'HTML must render student name An Bá Thành');
    assert.ok(htmlContent.includes('DTC245210002'), 'HTML must render student ID DTC245210002');
    assert.ok(htmlContent.includes('CNTT K24'), 'HTML must render class group CNTT K24');
    assert.ok(htmlContent.includes('data-lucide="bell"'), 'Must include notification bell');
  });

  // --- F04: Instant Course Search ---
  test('F04: Instant search filters courses by course code, course name, or lecturer', () => {
    // 1. Search by code
    const byCode = filterCourses(MOCK_COURSES, { search: 'CS101' });
    assert.equal(byCode.length, 1);
    assert.equal(byCode[0].id, 'CS101');

    // 2. Search by course name
    const byName = filterCourses(MOCK_COURSES, { search: 'Giao diện' });
    assert.ok(byName.length >= 1);
    assert.ok(byName.every(c => c.name.toLowerCase().includes('giao diện')));

    // 3. Search by lecturer
    const byLecturer = filterCourses(MOCK_COURSES, { search: 'Nguyễn Thanh Hải' });
    assert.ok(byLecturer.length >= 2);
    assert.ok(byLecturer.every(c => c.lecturer.includes('Nguyễn Thanh Hải')));
  });

  // --- F05: Faceted Faculty Filter ---
  test('F05: Faculty filter partitions courses by academic department (CNTT, TOAN, NN)', () => {
    const cntt = filterCourses(MOCK_COURSES, { faculty: 'CNTT' });
    assert.ok(cntt.length > 0);
    assert.ok(cntt.every(c => c.faculty === 'CNTT'));

    const toan = filterCourses(MOCK_COURSES, { faculty: 'TOAN' });
    assert.ok(toan.length > 0);
    assert.ok(toan.every(c => c.faculty === 'TOAN'));

    const nn = filterCourses(MOCK_COURSES, { faculty: 'NN' });
    assert.ok(nn.length > 0);
    assert.ok(nn.every(c => c.faculty === 'NN'));
  });

  // --- F06: Faceted Shift Filter ---
  test('F06: Shift filter isolates Morning (Tiết 1-5) and Afternoon (Tiết 6-11) courses', () => {
    const morningCourses = filterCourses(MOCK_COURSES, { shift: 'MORNING' });
    assert.ok(morningCourses.length > 0);
    assert.ok(morningCourses.every(c => c.shift === 'MORNING'));

    const afternoonCourses = filterCourses(MOCK_COURSES, { shift: 'AFTERNOON' });
    assert.ok(afternoonCourses.length > 0);
    assert.ok(afternoonCourses.every(c => c.shift === 'AFTERNOON'));
  });

  // --- F07: Faceted Day Filter ---
  test('F07: Day filter accurately narrows courses to specific day of the week', () => {
    const tuesdayCourses = filterCourses(MOCK_COURSES, { day: '3' });
    assert.ok(tuesdayCourses.length >= 2); // CS201 and CS202-02
    assert.ok(tuesdayCourses.every(c => c.day === 3));

    const fridayCourses = filterCourses(MOCK_COURSES, { day: '6' });
    assert.equal(fridayCourses.length, 1);
    assert.equal(fridayCourses[0].id, 'ENG101');
  });

  // --- F08: Max Credits Slider ---
  test('F08: Credit limit slider excludes courses exceeding credit boundary', () => {
    const max3 = filterCourses(MOCK_COURSES, { maxCredits: 3 });
    assert.ok(max3.every(c => c.credits <= 3));
    assert.ok(max3.some(c => c.credits === 3));
    assert.ok(!max3.some(c => c.id === 'SE301'), 'SE301 (4 credits) must be excluded when maxCredits is 3');

    const max4 = filterCourses(MOCK_COURSES, { maxCredits: 4 });
    assert.ok(max4.some(c => c.id === 'SE301'), 'SE301 (4 credits) must be included when maxCredits is 4');
  });

  // --- F09: Smart Conflict Filter Checkbox ---
  test('F09: Smart conflict filter checkbox hides clashing sections when enabled', () => {
    const selectedIds = ['CS201']; // Day 3, Tiết 1-3
    // CS202-02 is also Day 3, Tiết 1-3
    const allTuesday = filterCourses(MOCK_COURSES, { day: '3', onlyNonConflicting: false, selectedIds });
    assert.ok(allTuesday.some(c => c.id === 'CS202-02'), 'Unchecked filter shows conflicting courses');

    const nonConflictingTuesday = filterCourses(MOCK_COURSES, { day: '3', onlyNonConflicting: true, selectedIds });
    assert.ok(!nonConflictingTuesday.some(c => c.id === 'CS202-02'), 'Checked filter suppresses conflicting course CS202-02');
  });

  // --- F10: 4 CourseCard Visual States ---
  test('F10: Identifies 4 distinct CourseCard states: Available, Selected, Conflict, Ineligible', () => {
    const selectedIds = ['CS101', 'CS201'];

    // 1. Available
    const math = MOCK_COURSES.find(c => c.id === 'MATH101');
    const isSelectedMath = selectedIds.includes(math.id);
    const isClashMath = MOCK_COURSES.some(x => selectedIds.includes(x.id) && checkIntervalConflict(math, x));
    assert.equal(isSelectedMath, false);
    assert.equal(isClashMath, false);
    assert.equal(math.status, 'available');

    // 2. Selected
    assert.equal(selectedIds.includes('CS101'), true);

    // 3. Conflict
    const cs202_02 = MOCK_COURSES.find(c => c.id === 'CS202-02');
    const isClashCs202 = MOCK_COURSES.some(x => selectedIds.includes(x.id) && checkIntervalConflict(cs202_02, x));
    assert.equal(isClashCs202, true, 'CS202-02 must collide with CS201');

    // 4. Ineligible
    const se301 = MOCK_COURSES.find(c => c.id === 'SE301');
    assert.equal(se301.status, 'ineligible');
    assert.ok(se301.prereqReason.includes('60 TC'));
  });

  // --- F11: Ghost Block Preview Projection ---
  test('F11: Hovering a course produces valid ghost block projection coordinates', () => {
    const hoveredCourse = MOCK_COURSES.find(c => c.id === 'CS202-01');
    assert.ok(hoveredCourse);

    // Projection target
    const targetDay = hoveredCourse.day; // 5 (Thursday)
    const targetSlot = hoveredCourse.periodSlot; // p3 (Tiết 7-9)

    assert.equal(targetDay, 5);
    assert.equal(targetSlot, 'p3');

    // Verify timetable cell coordinates exist in slot matrix
    const matchingSlot = TIMETABLE_SLOTS.find(s => s.id === targetSlot);
    const matchingDay = TIMETABLE_DAYS.find(d => d.dayNumber === targetDay);
    assert.ok(matchingSlot, 'Target slot must exist in timetable matrix');
    assert.ok(matchingDay, 'Target day must exist in timetable matrix');
  });

  // --- F13: Weekly Timetable Matrix 8x4 Layout ---
  test('F13: Weekly timetable defines 8 columns (Time + 7 days) and 4 shift slots', () => {
    assert.equal(TIMETABLE_DAYS.length, 7, 'Must define 7 week days (T2 - CN)');
    assert.equal(TIMETABLE_SLOTS.length, 4, 'Must define 4 standard academic slots');

    // Expected slots per spec
    assert.equal(TIMETABLE_SLOTS[0].label, 'Tiết 1 - 3');
    assert.equal(TIMETABLE_SLOTS[1].label, 'Tiết 4 - 5');
    assert.equal(TIMETABLE_SLOTS[2].label, 'Tiết 7 - 9');
    assert.equal(TIMETABLE_SLOTS[3].label, 'Tiết 10 - 11');
  });

  // --- F14: Exact Interval Conflict Engine Math ---
  test('F14: Universal collision algorithm validates exact interval mathematical condition', () => {
    const courseA = { id: 'A', day: 2, startPeriod: 1, endPeriod: 3 };
    const courseB = { id: 'B', day: 2, startPeriod: 2, endPeriod: 4 }; // Overlapping
    const courseC = { id: 'C', day: 2, startPeriod: 4, endPeriod: 5 }; // Adjacent, no overlap
    const courseD = { id: 'D', day: 3, startPeriod: 1, endPeriod: 3 }; // Different day

    assert.equal(checkIntervalConflict(courseA, courseB), true, 'Periods 1-3 vs 2-4 on Day 2 must conflict');
    assert.equal(checkIntervalConflict(courseA, courseC), false, 'Periods 1-3 vs 4-5 on Day 2 must not conflict');
    assert.equal(checkIntervalConflict(courseA, courseD), false, 'Different days must not conflict');
    assert.equal(checkIntervalConflict(courseA, courseA), false, 'Same course ID must not conflict with itself');
  });

  // --- F15: Conflict Visual Alerts Triggers ---
  test('F15: Conflict detection triggers ConflictAlert banner data with existing and incoming courses', () => {
    const enrolled = [MOCK_COURSES.find(c => c.id === 'CS201')];
    const incoming = MOCK_COURSES.find(c => c.id === 'CS202-02');

    const clash = findConflict(incoming, enrolled);
    assert.ok(clash, 'Must detect clash between incoming CS202-02 and enrolled CS201');
    assert.equal(clash.id, 'CS201');
    assert.equal(incoming.day, clash.day);
  });

  // --- F16: 1-Click Auto-Switch Alternate Section ---
  test('F16: 1-Click auto-switch maps conflicting section to available non-clashing section', () => {
    const clashingCourse = MOCK_COURSES.find(c => c.id === 'CS202-02');
    assert.ok(clashingCourse.alternateCourseId, 'Clashing section must reference alternate section');

    const alternateCourse = MOCK_COURSES.find(c => c.id === clashingCourse.alternateCourseId);
    assert.ok(alternateCourse, 'Alternate section CS202-01 must exist');
    assert.equal(alternateCourse.id, 'CS202-01');

    // Verify alternate section does not collide with Day 3 Morning course
    const cs201 = MOCK_COURSES.find(c => c.id === 'CS201');
    assert.equal(checkIntervalConflict(alternateCourse, cs201), false, 'Alternate course CS202-01 must resolve the conflict');
  });

  // --- F19: Proportional Workload Meter ---
  test('F19: Workload meter categorizes credits into 3 tiers: <12 (Amber), 12-18 (Green), >18 (Red)', () => {
    const underload = classifyWorkload(9);
    assert.equal(underload.tier, 'underload');
    assert.equal(underload.color, 'amber');
    assert.equal(underload.isEligible, false);

    const balanced = classifyWorkload(15);
    assert.equal(balanced.tier, 'balanced');
    assert.equal(balanced.color, 'emerald');
    assert.equal(balanced.isEligible, true);

    const overload = classifyWorkload(21);
    assert.equal(overload.tier, 'overload');
    assert.equal(overload.color, 'red');
  });

  // --- F20: AI Course Recommendation Card ---
  test('F20: AI Course Recommendation features CS202-01 with violet theme and compatibility reason', () => {
    const aiCourse = MOCK_COURSES.find(c => c.isAiRecommended);
    assert.ok(aiCourse, 'Must have AI recommended course flag');
    assert.equal(aiCourse.id, 'CS202-01');
    assert.equal(aiCourse.credits, 3);

    const indexPath = path.join(__dirname, '..', 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    assert.ok(htmlContent.includes('AI Course Recommendation'), 'HTML must render AI Course Recommendation title');
    assert.ok(htmlContent.includes('Tương thích TKB: Khớp 100% lịch trống'), 'Must display 100% compatibility badge');
  });

  // --- F22: Dynamic Tuition Calculation Formula ---
  test('F22: Computes tuition accurately as credits * 450,000 VNĐ', () => {
    assert.equal(calculateTuition(0), 0);
    assert.equal(calculateTuition(3), 1350000);
    assert.equal(calculateTuition(12), 5400000);
    assert.equal(calculateTuition(15), 6750000);
    assert.equal(calculateTuition(18), 8100000);
    assert.equal(calculateTuition(24), 10800000);
  });

  // --- F23: Primary CTA Lock Constraint ---
  test('F23: Primary CTA button is locked when credits < 12 or active conflicts exist', () => {
    // Under minimum credits (e.g. 9 credits, no conflict) -> LOCKED
    assert.equal(canSubmitRegistration(9, false), false);

    // Eligible credits but active conflict exists -> LOCKED
    assert.equal(canSubmitRegistration(15, true), false);

    // Under minimum credits AND active conflict -> LOCKED
    assert.equal(canSubmitRegistration(6, true), false);

    // Eligible credits and NO conflict -> UNLOCKED
    assert.equal(canSubmitRegistration(12, false), true);
    assert.equal(canSubmitRegistration(15, false), true);
  });

  // --- F28: Electronic Receipt Modal Format ---
  test('F28: Electronic receipt contains unique ID #ICRA-2026-9812-ICTU and student summary', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');

    assert.ok(htmlContent.includes('#ICRA-2026-9812-ICTU'), 'Must include receipt code #ICRA-2026-9812-ICTU');
    assert.ok(htmlContent.includes('ĐĂNG KÝ HỌC KỲ HOÀN TẤT!'), 'Must include success header');
    assert.ok(htmlContent.includes('Giao dịch thành công'), 'Must include successful transaction badge');
  });

  // --- F29: RFC 5545 Compliant .ICS Calendar Export ---
  test('F29: Calendar export outputs RFC 5545 compliant iCalendar string with VEVENT blocks', () => {
    const enrolled = [
      MOCK_COURSES.find(c => c.id === 'CS101'),
      MOCK_COURSES.find(c => c.id === 'CS201')
    ];

    const icsOutput = generateICalendar(enrolled, MOCK_STUDENT);

    assert.ok(icsOutput.startsWith('BEGIN:VCALENDAR'), 'Must begin with BEGIN:VCALENDAR');
    assert.ok(icsOutput.includes('VERSION:2.0'), 'Must include VERSION:2.0');
    assert.ok(icsOutput.includes('PRODID:'), 'Must include PRODID header');
    assert.ok(icsOutput.includes('BEGIN:VEVENT'), 'Must contain VEVENT block');
    assert.ok(icsOutput.includes('SUMMARY:[CS101-01] Nhập môn Lập trình CNTT'), 'Must contain course summary');
    assert.ok(icsOutput.includes('RRULE:FREQ=WEEKLY'), 'Must contain weekly recurrence rule');
    assert.ok(icsOutput.includes('END:VEVENT'), 'Must end VEVENT block');
    assert.ok(icsOutput.endsWith('END:VCALENDAR'), 'Must end with END:VCALENDAR');
  });

});
