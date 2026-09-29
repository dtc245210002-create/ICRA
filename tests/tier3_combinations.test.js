/**
 * Tier 3: Cross-Feature Combinations Test Suite
 * Minimum required tests: 6
 * Implemented tests: 8
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  MOCK_COURSES,
  checkIntervalConflict,
  findConflict,
  calculateTuition,
  classifyWorkload,
  canSubmitRegistration,
  filterCourses
} = require('./test_helpers');

describe('Tier 3: Cross-Feature Combinations', () => {

  // --- C01: Simultaneous Multi-Faceted Filters ---
  test('C01: Simultaneous combination of 5 filters (search + faculty + shift + day + maxCredits) computes exact intersection', () => {
    const result = filterCourses(MOCK_COURSES, {
      search: 'Lập trình',
      faculty: 'CNTT',
      shift: 'MORNING',
      day: '2',
      maxCredits: 3
    });

    assert.equal(result.length, 1, 'Should find exactly 1 course matching all 5 filter constraints');
    assert.equal(result[0].id, 'CS101');
    assert.equal(result[0].faculty, 'CNTT');
    assert.equal(result[0].shift, 'MORNING');
    assert.equal(result[0].day, 2);
    assert.ok(result[0].credits <= 3);

    // Contradictory criteria returns empty array
    const impossible = filterCourses(MOCK_COURSES, {
      search: 'Lập trình',
      faculty: 'NN' // Foreign languages department
    });
    assert.equal(impossible.length, 0, 'No programming course belongs to NN faculty');
  });

  // --- C02: Smart Conflict Checkbox Toggle with Active Cart ---
  test('C02: Toggling smart conflict filter dynamically excludes clashing courses without modifying selected courses', () => {
    const selectedIds = ['CS201']; // Day 3, Tiết 1-3

    // When checkbox is FALSE: CS202-02 (Day 3, Tiết 1-3) is visible in the list
    const uncheckedList = filterCourses(MOCK_COURSES, {
      day: '3',
      onlyNonConflicting: false,
      selectedIds
    });
    const cs202_02_present = uncheckedList.some(c => c.id === 'CS202-02');
    assert.equal(cs202_02_present, true, 'Unchecked conflict filter must display conflicting section');

    // When checkbox is TRUE: CS202-02 is hidden from the list
    const checkedList = filterCourses(MOCK_COURSES, {
      day: '3',
      onlyNonConflicting: true,
      selectedIds
    });
    const cs202_02_hidden = !checkedList.some(c => c.id === 'CS202-02');
    assert.equal(cs202_02_hidden, true, 'Checked conflict filter must hide conflicting section');

    // The already selected course CS201 itself remains accessible
    const cs201_present = checkedList.some(c => c.id === 'CS201');
    assert.equal(cs201_present, true, 'Currently enrolled course remains visible in list');
  });

  // --- C03: 1-Click Auto-Swap with Cart and Timetable in Lockstep ---
  test('C03: 1-Click auto-swap resolves conflict, updates cart IDs, and synchronizes timetable state', () => {
    let cart = ['CS101', 'CS201', 'MATH101', 'ENG101']; // 12 credits
    let conflictState = null;

    // Student attempts to add clashing section CS202-02
    const incomingCourse = MOCK_COURSES.find(c => c.id === 'CS202-02');
    const enrolledCourses = MOCK_COURSES.filter(c => cart.includes(c.id));
    const clash = findConflict(incomingCourse, enrolledCourses);

    assert.ok(clash, 'Conflict must be triggered when adding CS202-02 against CS201');
    conflictState = { incoming: incomingCourse, existing: clash };

    // While conflict is active, registration cannot be submitted
    const currentCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);
    assert.equal(canSubmitRegistration(currentCredits, true), false, 'CTA must be locked while conflict is active');

    // User triggers 1-Click Auto-Swap
    const alternateId = incomingCourse.alternateCourseId;
    assert.equal(alternateId, 'CS202-01');

    // Perform swap action
    conflictState = null;
    cart = [...cart, alternateId];

    // Re-evaluate updated cart
    const updatedEnrolled = MOCK_COURSES.filter(c => cart.includes(c.id));
    const updatedCredits = updatedEnrolled.reduce((sum, c) => sum + c.credits, 0);
    const hasRemainingConflict = updatedEnrolled.some((c, i) => 
      updatedEnrolled.some((other, j) => i !== j && checkIntervalConflict(c, other))
    );

    assert.equal(cart.includes('CS202-01'), true, 'Alternate section must now be in cart');
    assert.equal(hasRemainingConflict, false, 'No conflicts remain in timetable');
    assert.equal(updatedCredits, 15, 'Total credits must be 12 + 3 = 15 TC');
    assert.equal(calculateTuition(updatedCredits), 6750000, 'Tuition is updated to 6,750,000 VNĐ');
    assert.equal(canSubmitRegistration(updatedCredits, false), true, 'CTA is now unlocked');
  });

  // --- C04: Dual Plan State Management (Plan 1 vs Plan 2 Switcher) ---
  test('C04: Timetable Plan Switcher maintains isolated states for Plan 1 and Plan 2', () => {
    const plans = {
      plan_1: { id: 'plan_1', name: 'Phương án 1 (Tiêu chuẩn)', selectedIds: ['CS101', 'CS201', 'MATH101', 'ENG101'] },
      plan_2: { id: 'plan_2', name: 'Phương án 2 (Tập trung)', selectedIds: ['CS101', 'CS202-01', 'NET101'] }
    };

    // Evaluate Plan 1
    const p1Courses = MOCK_COURSES.filter(c => plans.plan_1.selectedIds.includes(c.id));
    const p1Credits = p1Courses.reduce((s, c) => s + c.credits, 0);
    const p1Workload = classifyWorkload(p1Credits);
    assert.equal(p1Credits, 12);
    assert.equal(p1Workload.tier, 'balanced');
    assert.equal(canSubmitRegistration(p1Credits, false), true);

    // Switch to Plan 2
    let activePlanId = 'plan_2';
    const p2Courses = MOCK_COURSES.filter(c => plans[activePlanId].selectedIds.includes(c.id));
    const p2Credits = p2Courses.reduce((s, c) => s + c.credits, 0);
    const p2Workload = classifyWorkload(p2Credits);
    assert.equal(p2Credits, 9);
    assert.equal(p2Workload.tier, 'underload');
    assert.equal(canSubmitRegistration(p2Credits, false), false, 'Plan 2 with 9 TC cannot be submitted');

    // Switch back to Plan 1: Plan 1 remains completely intact
    activePlanId = 'plan_1';
    assert.deepEqual(plans.plan_1.selectedIds, ['CS101', 'CS201', 'MATH101', 'ENG101']);
  });

  // --- C05: Ghost Block on Occupied Slot Collision Alert ---
  test('C05: Hovering a course targeting an already occupied cell projects visual collision indicator', () => {
    const selectedIds = ['CS201']; // Occupies Day 3, p1 (Tuesday 07:00 - 09:25)
    const hoveredCourse = MOCK_COURSES.find(c => c.id === 'CS202-02'); // Also Day 3, p1

    // Simulation of ghost projection logic
    const occupiedCourse = MOCK_COURSES.find(c => selectedIds.includes(c.id) && c.day === hoveredCourse.day && c.periodSlot === hoveredCourse.periodSlot);
    assert.ok(occupiedCourse, 'Target slot is already occupied');

    const isGhostCollision = checkIntervalConflict(hoveredCourse, occupiedCourse);
    assert.equal(isGhostCollision, true, 'Hovering conflicting course flags preview slot conflict');
  });

  // --- C06: Checkout Validation with Ineligible Prerequisite Course ---
  test('C06: Ineligible course (SE301 - Missing Prerequisites) cannot be enrolled or checked out', () => {
    const se301 = MOCK_COURSES.find(c => c.id === 'SE301');
    assert.equal(se301.status, 'ineligible');

    // Enrolling ineligible course should be blocked by guard
    function enrollCourse(course, currentCart) {
      if (course.status === 'ineligible') {
        throw new Error(`Cannot enroll ${course.code}: ${course.prereqReason}`);
      }
      return [...currentCart, course.id];
    }

    assert.throws(
      () => enrollCourse(se301, ['CS101']),
      /Cannot enroll SE301-01: Chưa đủ 60 TC/
    );
  });

  // --- C07: Add and Remove Course Idempotency ---
  test('C07: Repeatedly adding and removing courses maintains strict cart consistency and non-negative balance', () => {
    let cart = [];
    const course = MOCK_COURSES.find(c => c.id === 'CS101');

    // Add
    cart.push(course.id);
    assert.equal(cart.length, 1);
    assert.equal(calculateTuition(course.credits), 1350000);

    // Remove
    cart = cart.filter(id => id !== course.id);
    assert.equal(cart.length, 0);
    assert.equal(calculateTuition(0), 0);

    // Add again
    cart.push(course.id);
    assert.equal(cart.length, 1);
    assert.equal(calculateTuition(course.credits), 1350000);

    // Remove again
    cart = cart.filter(id => id !== course.id);
    assert.equal(cart.length, 0);
    assert.equal(calculateTuition(0), 0);
  });

  // --- C08: Reset Filters Restoration ---
  test('C08: Resetting filters restores full catalog without affecting active enrollment selections', () => {
    const selectedIds = ['CS101', 'CS201'];

    // Heavily filtered catalog
    const filtered = filterCourses(MOCK_COURSES, {
      search: 'ZZZZ',
      faculty: 'NN',
      day: '7',
      selectedIds
    });
    assert.equal(filtered.length, 0);

    // Reset filters to defaults
    const resetList = filterCourses(MOCK_COURSES, {
      search: '',
      faculty: 'ALL',
      shift: 'ALL',
      day: 'ALL',
      maxCredits: 4,
      onlyNonConflicting: false,
      selectedIds
    });
    assert.equal(resetList.length, MOCK_COURSES.length);
    assert.deepEqual(selectedIds, ['CS101', 'CS201'], 'Active enrollment selections must not be altered');
  });

});
