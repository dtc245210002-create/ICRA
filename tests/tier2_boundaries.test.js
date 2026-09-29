/**
 * Tier 2: Boundary and Corner Cases Test Suite
 * Minimum required tests: 8
 * Implemented tests: 12
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  MOCK_COURSES,
  checkIntervalConflict,
  calculateTuition,
  classifyWorkload,
  canSubmitRegistration,
  filterCourses
} = require('./test_helpers');

describe('Tier 2: Boundary & Corner Cases', () => {

  // --- B01: Empty Search Query ---
  test('B01: Empty search query or whitespace returns all courses without filtering', () => {
    const emptyQuery = filterCourses(MOCK_COURSES, { search: '' });
    assert.equal(emptyQuery.length, MOCK_COURSES.length, 'Empty search string should return all courses');

    const spacesOnly = filterCourses(MOCK_COURSES, { search: '   ' });
    assert.equal(spacesOnly.length, MOCK_COURSES.length, 'Whitespace query should trim and return all courses');
  });

  // --- B02: Punctuation and Regex Metacharacters in Search ---
  test('B02: Search containing regex metacharacters (*, +, ?, (, [, \\) does not throw syntax error', () => {
    const dangerousQueries = ['[UI/UX]', '(Tiết', 'CS*101', 'C++?', 'C\\N', '.*'];

    for (const q of dangerousQueries) {
      assert.doesNotThrow(() => {
        const results = filterCourses(MOCK_COURSES, { search: q });
        assert.ok(Array.isArray(results), `Query '${q}' should safely return an array`);
      }, `Search with metacharacter query '${q}' must not throw`);
    }

    // Exact string with parentheses should match
    const withParens = filterCourses(MOCK_COURSES, { search: '(UI/UX)' });
    assert.ok(withParens.length >= 1, 'Should find courses with parentheses in title');
  });

  // --- B03: Non-Matching Search Query ---
  test('B03: Non-matching search query gracefully returns empty array with length 0', () => {
    const nonExistent = filterCourses(MOCK_COURSES, { search: 'ZZZ999_NON_EXISTENT_COURSE' });
    assert.equal(Array.isArray(nonExistent), true);
    assert.equal(nonExistent.length, 0);
  });

  // --- B04: Boundary Credit Threshold - Exactly 11 Credits ---
  test('B04: Exactly 11 credits is classified as Underload (Amber) and CTA remains locked', () => {
    const credits = 11;
    const workload = classifyWorkload(credits);
    assert.equal(workload.tier, 'underload');
    assert.equal(workload.color, 'amber');
    assert.equal(workload.isEligible, false);

    const canSubmit = canSubmitRegistration(credits, false);
    assert.equal(canSubmit, false, '11 credits must not allow registration submission');
  });

  // --- B05: Boundary Credit Threshold - Exactly 12 Credits (Lower Feasible Bound) ---
  test('B05: Exactly 12 credits unlocks CTA and transitions workload to Balanced (Green)', () => {
    const credits = 12;
    const workload = classifyWorkload(credits);
    assert.equal(workload.tier, 'balanced');
    assert.equal(workload.color, 'emerald');
    assert.equal(workload.isEligible, true);

    const canSubmit = canSubmitRegistration(credits, false);
    assert.equal(canSubmit, true, '12 credits without conflict must allow registration submission');
  });

  // --- B06: Boundary Credit Threshold - Exactly 18 Credits (Upper Ideal Bound) ---
  test('B06: Exactly 18 credits remains in Balanced workload tier (Green) and unlocks CTA', () => {
    const credits = 18;
    const workload = classifyWorkload(credits);
    assert.equal(workload.tier, 'balanced');
    assert.equal(workload.color, 'emerald');
    assert.equal(workload.isEligible, true);

    const canSubmit = canSubmitRegistration(credits, false);
    assert.equal(canSubmit, true, '18 credits without conflict must allow registration submission');
  });

  // --- B07: Boundary Credit Threshold - Exactly 19 Credits (Overload Bound) ---
  test('B07: Exactly 19 credits transitions workload to Overload (Red)', () => {
    const credits = 19;
    const workload = classifyWorkload(credits);
    assert.equal(workload.tier, 'overload');
    assert.equal(workload.color, 'red');

    // Overload can still be submitted if within max 24 limit, provided no conflict
    const canSubmit = canSubmitRegistration(credits, false);
    assert.equal(canSubmit, true);
  });

  // --- B08: Cart Boundary - 0 Credits (Empty Cart State) ---
  test('B08: Empty cart (0 credits) calculates 0 VNĐ tuition and locks CTA', () => {
    const credits = 0;
    const tuition = calculateTuition(credits);
    assert.equal(tuition, 0);

    const workload = classifyWorkload(credits);
    assert.equal(workload.tier, 'underload');
    assert.equal(workload.isEligible, false);

    const canSubmit = canSubmitRegistration(credits, false);
    assert.equal(canSubmit, false);
  });

  // --- B09: Maximum Academic Load Limit (24 Credits vs >24 Credits) ---
  test('B09: Maximum academic load 24 credits vs >24 credits upper limit boundary', () => {
    const tuition24 = calculateTuition(24);
    assert.equal(tuition24, 10800000);

    const workload24 = classifyWorkload(24);
    assert.equal(workload24.isEligible, true, '24 credits is permissible maximum load');

    const workload25 = classifyWorkload(25);
    assert.equal(workload25.isEligible, false, '25 credits exceeds allowable maximum load limit');
  });

  // --- B10: Multi-Slot Spanning Interval Collisions ---
  test('B10: Course spanning across slot boundaries (e.g. periods 7 to 10) collides with both sub-slots', () => {
    // Course spanning periods 7-10 (like SE301)
    const longCourse = { id: 'LONG', day: 6, startPeriod: 7, endPeriod: 10 };

    // Course in slot 7-9
    const slotP3Course = { id: 'P3', day: 6, startPeriod: 7, endPeriod: 9 };
    // Course in slot 10-11
    const slotP4Course = { id: 'P4', day: 6, startPeriod: 10, endPeriod: 11 };
    // Course in morning slot 1-3
    const morningCourse = { id: 'P1', day: 6, startPeriod: 1, endPeriod: 3 };

    assert.equal(checkIntervalConflict(longCourse, slotP3Course), true, 'Spanning 7-10 must conflict with 7-9');
    assert.equal(checkIntervalConflict(longCourse, slotP4Course), true, 'Spanning 7-10 must conflict with 10-11');
    assert.equal(checkIntervalConflict(longCourse, morningCourse), false, 'Spanning 7-10 must not conflict with 1-3');
  });

  // --- B11: Exact Period Boundary Collision (endPeriod === startPeriod) ---
  test('B11: Colliding on exact single boundary period (endPeriod === startPeriod) constitutes a conflict', () => {
    // Course A ends at period 3, Course B starts at period 3 on the same day
    const courseA = { id: 'A', day: 2, startPeriod: 1, endPeriod: 3 };
    const courseB = { id: 'B', day: 2, startPeriod: 3, endPeriod: 5 };

    assert.equal(checkIntervalConflict(courseA, courseB), true, 'End of period 3 and start of period 3 share period 3 and must collide');
  });

  // --- B12: Non-Colliding Adjacent Boundary (endPeriod + 1 === startPeriod) ---
  test('B12: Strictly adjacent periods without overlap (endPeriod = 3, startPeriod = 4) do NOT conflict', () => {
    // Course A periods 1-3, Course B periods 4-5 on the same day
    const courseA = { id: 'A', day: 2, startPeriod: 1, endPeriod: 3 };
    const courseB = { id: 'B', day: 2, startPeriod: 4, endPeriod: 5 };

    assert.equal(checkIntervalConflict(courseA, courseB), false, 'Period 1-3 and period 4-5 are adjacent with 0 period overlap');
  });

});
