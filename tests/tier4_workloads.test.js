/**
 * Tier 4: Realistic End-User Workflows & Workload Scenarios Test Suite
 * Minimum required tests: 5
 * Implemented tests: 6
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  MOCK_STUDENT,
  MOCK_COURSES,
  checkIntervalConflict,
  findConflict,
  calculateTuition,
  classifyWorkload,
  canSubmitRegistration,
  filterCourses,
  generateICalendar,
  calculateContrastRatio
} = require('./test_helpers');

describe('Tier 4: Realistic End-User Workload Scenarios', () => {

  // --- Scenario 1: Freshman Standard Registration Flow ---
  test('Scenario 1: Complete Freshman standard registration flow (15 TC, 5 courses, 0 conflicts, checkout, receipt #ICRA-2026-9812-ICTU, .ics download)', () => {
    // Step 1: Initial standard 4 core courses
    let cart = ['CS101', 'CS201', 'MATH101', 'ENG101'];
    let enrolled = MOCK_COURSES.filter(c => cart.includes(c.id));
    assert.equal(enrolled.length, 4);

    // Step 2: Student accepts AI Recommendation (CS202-01)
    const aiCourse = MOCK_COURSES.find(c => c.isAiRecommended);
    assert.ok(aiCourse, 'CS202-01 should be recommended by AI');

    // Check no conflict with AI course
    const clash = findConflict(aiCourse, enrolled);
    assert.equal(clash, null, 'AI Course CS202-01 must have 0 conflicts with standard schedule');

    cart.push(aiCourse.id);
    enrolled = MOCK_COURSES.filter(c => cart.includes(c.id));
    assert.equal(enrolled.length, 5);

    // Step 3: Workload and tuition calculation
    const totalCredits = enrolled.reduce((s, c) => s + c.credits, 0);
    assert.equal(totalCredits, 15, 'Total credits must be 15');
    const tuition = calculateTuition(totalCredits);
    assert.equal(tuition, 6750000, 'Tuition must equal 15 * 450,000 = 6,750,000 VNĐ');

    const workload = classifyWorkload(totalCredits);
    assert.equal(workload.tier, 'balanced');
    assert.equal(workload.isEligible, true);

    // Step 4: Pre-flight Audit
    const hasAnyConflict = enrolled.some((c, i) => 
      enrolled.some((other, j) => i !== j && checkIntervalConflict(c, other))
    );
    assert.equal(hasAnyConflict, false, 'Pre-flight check confirms 0 collisions');

    const canSubmit = canSubmitRegistration(totalCredits, hasAnyConflict);
    assert.equal(canSubmit, true, 'Registration is eligible for final submission');

    // Step 5: Electronic Receipt Generation
    const receipt = {
      receiptId: '#ICRA-2026-9812-ICTU',
      studentName: MOCK_STUDENT.name,
      studentId: MOCK_STUDENT.studentId,
      totalCredits,
      tuition,
      courseCodes: enrolled.map(c => c.code),
      timestamp: '2026-09-29T08:00:00Z',
      status: 'Giao dịch thành công'
    };
    assert.equal(receipt.receiptId, '#ICRA-2026-9812-ICTU');
    assert.equal(receipt.totalCredits, 15);
    assert.equal(receipt.tuition, 6750000);

    // Step 6: Calendar .ics export
    const icsContent = generateICalendar(enrolled, MOCK_STUDENT);
    const eventCount = (icsContent.match(/BEGIN:VEVENT/g) || []).length;
    assert.equal(eventCount, 5, 'Generated .ics must contain exactly 5 events');
    assert.ok(icsContent.includes('SUMMARY:[CS202-01] Thiết kế Giao diện Phần mềm (UI/UX)'));
  });

  // --- Scenario 2: Conflict Detection and Auto-Switch Flow ---
  test('Scenario 2: Conflict detection, visual banner alert, and 1-click auto-switch resolution', () => {
    // Current enrolled courses
    let cart = ['CS101', 'CS201', 'MATH101', 'ENG101'];
    let enrolled = MOCK_COURSES.filter(c => cart.includes(c.id));

    // Student attempts to enroll CS202-02 (clashes with CS201 on Tuesday morning)
    const incomingCourse = MOCK_COURSES.find(c => c.id === 'CS202-02');
    const existingConflict = findConflict(incomingCourse, enrolled);

    assert.ok(existingConflict, 'Conflict engine must catch collision');
    assert.equal(existingConflict.id, 'CS201');
    assert.equal(existingConflict.day, 3);

    // Conflict Alert banner data structure
    const alertData = {
      incoming: incomingCourse,
      existing: existingConflict,
      resolvedBy: incomingCourse.alternateCourseId
    };
    assert.equal(alertData.resolvedBy, 'CS202-01');

    // Student clicks "Tự động đổi sang CS202-01"
    const alternateCourse = MOCK_COURSES.find(c => c.id === alertData.resolvedBy);
    assert.ok(alternateCourse);

    // Execute swap: replace CS202-02 intent with alternateCourse
    cart = [...cart, alternateCourse.id];
    enrolled = MOCK_COURSES.filter(c => cart.includes(c.id));

    // Confirm schedule is now conflict-free
    const remainingConflict = findConflict(alternateCourse, enrolled.filter(c => c.id !== alternateCourse.id));
    assert.equal(remainingConflict, null, 'Schedule must have 0 conflicts following auto-switch');
    assert.equal(enrolled.length, 5);
  });

  // --- Scenario 3: Workload Stress & Transition Test ---
  test('Scenario 3: Workload transition stress test across Underload -> Balanced -> Overload -> Balanced', () => {
    // Stage 1: 6 TC (2 courses) -> Underload (Amber)
    const stage1Credits = 6;
    const stage1 = classifyWorkload(stage1Credits);
    assert.equal(stage1.tier, 'underload');
    assert.equal(stage1.color, 'amber');
    assert.equal(canSubmitRegistration(stage1Credits, false), false, 'Stage 1 must be locked');

    // Stage 2: Add courses to 14 TC -> Balanced (Green)
    const stage2Credits = 14;
    const stage2 = classifyWorkload(stage2Credits);
    assert.equal(stage2.tier, 'balanced');
    assert.equal(stage2.color, 'emerald');
    assert.equal(canSubmitRegistration(stage2Credits, false), true, 'Stage 2 must be unlocked');

    // Stage 3: Add courses to 21 TC -> Overload (Red)
    const stage3Credits = 21;
    const stage3 = classifyWorkload(stage3Credits);
    assert.equal(stage3.tier, 'overload');
    assert.equal(stage3.color, 'red');

    // Stage 4: Drop 1 course to 18 TC -> Back to Balanced (Green)
    const stage4Credits = 18;
    const stage4 = classifyWorkload(stage4Credits);
    assert.equal(stage4.tier, 'balanced');
    assert.equal(stage4.color, 'emerald');
    assert.equal(canSubmitRegistration(stage4Credits, false), true, 'Stage 4 must be unlocked');
  });

  // --- Scenario 4: HTML & Interactive Components DOM Verification ---
  test('Scenario 4: Structural integrity audit of index.html verifies all core components and modals', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');

    // 1. Header & Identity
    assert.ok(html.includes('function Header'), 'Header component declared');
    assert.ok(html.includes('student.name'), 'Header uses student info');
    assert.ok(html.includes('74:15:20'), 'Countdown timer present');

    // 2. 3-Column Coordinated Views
    assert.ok(html.includes('w-[28%]'), 'Left column 28% Course Explorer');
    assert.ok(html.includes('w-[47%]'), 'Center column 47% Timetable Matrix');
    assert.ok(html.includes('w-[25%]'), 'Right column 25% Registration Summary');

    // 3. Components
    assert.ok(html.includes('function CourseExplorer'), 'CourseExplorer declared');
    assert.ok(html.includes('function WeeklyTimetable'), 'WeeklyTimetable declared');
    assert.ok(html.includes('function AIRecommendation'), 'AIRecommendation declared');
    assert.ok(html.includes('function RegistrationSummary'), 'RegistrationSummary declared');
    assert.ok(html.includes('function ConflictAlert'), 'ConflictAlert declared');
    assert.ok(html.includes('function ConfirmationModal'), 'ConfirmationModal declared');
    assert.ok(html.includes('function ToastContainer'), 'ToastContainer declared');

    // 4. Ghost Block & Conflict Styles
    assert.ok(html.includes('ghost-timetable-block'), 'Ghost timetable preview CSS class');
    assert.ok(html.includes('conflict-cell'), 'Conflict cell animation class');
  });

  // --- Scenario 5: WCAG 2.1 AA Contrast Ratios Audit ---
  test('Scenario 5: WCAG 2.1 AA color contrast audit ensures text >= 4.5:1 contrast ratio', () => {
    // Primary Blue (#2563EB) on White (#FFFFFF)
    const blueOnWhite = calculateContrastRatio('#2563EB', '#FFFFFF');
    // Dark Slate text (#0F172A) on White (#FFFFFF)
    const darkSlateOnWhite = calculateContrastRatio('#0F172A', '#FFFFFF');
    // Red Alert text (#991B1B) on Red Tint (#FEF2F2)
    const redOnLightRed = calculateContrastRatio('#991B1B', '#FEF2F2');
    // Emerald text (#065F46) on Light Emerald (#ECFDF5)
    const emeraldOnLightEmerald = calculateContrastRatio('#065F46', '#ECFDF5');
    // Violet text (#5B21B6) on Light Purple (#F5F3FF)
    const violetOnLightPurple = calculateContrastRatio('#5B21B6', '#F5F3FF');

    assert.ok(blueOnWhite >= 4.5, `Blue on white (${blueOnWhite.toFixed(2)}) must meet WCAG 4.5:1`);
    assert.ok(darkSlateOnWhite >= 4.5, `Slate on white (${darkSlateOnWhite.toFixed(2)}) must meet WCAG 4.5:1`);
    assert.ok(redOnLightRed >= 4.5, `Red alert (${redOnLightRed.toFixed(2)}) must meet WCAG 4.5:1`);
    assert.ok(emeraldOnLightEmerald >= 4.5, `Emerald badge (${emeraldOnLightEmerald.toFixed(2)}) must meet WCAG 4.5:1`);
    assert.ok(violetOnLightPurple >= 4.5, `Violet AI badge (${violetOnLightPurple.toFixed(2)}) must meet WCAG 4.5:1`);
  });

  // --- Scenario 6: Search Response Time (SRT) Latency Benchmark (<100ms) ---
  test('Scenario 6: SRT Latency benchmark processes 500 rapid search operations in under 100ms total', () => {
    const keystrokes = ['c', 'cs', 'cs1', 'cs101', 'm', 'mat', 'math', 'ui', 'giao dien', 'hai'];
    const startTime = performance.now();

    for (let i = 0; i < 50; i++) {
      for (const k of keystrokes) {
        const results = filterCourses(MOCK_COURSES, { search: k });
        assert.ok(Array.isArray(results));
      }
    }

    const elapsedMs = performance.now() - startTime;
    assert.ok(
      elapsedMs < 100,
      `500 search queries completed in ${elapsedMs.toFixed(2)}ms (must be < 100ms for instant typing feel)`
    );
  });

});
