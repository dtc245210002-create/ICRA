/**
 * Empirical Data Contract & Parity Test Suite
 * Milestone 1 Verification
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Helper to extract INITIAL_COURSES from index.html
function getIndexHtmlCourses() {
  const indexHtmlPath = path.resolve(__dirname, '../index.html');
  const content = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Find INITIAL_COURSES array in index.html
  const startMarker = 'const INITIAL_COURSES = [';
  const startIndex = content.indexOf(startMarker);
  assert.ok(startIndex !== -1, 'INITIAL_COURSES must exist in index.html');

  const afterStart = content.substring(startIndex + 'const INITIAL_COURSES = '.length);
  // Find matching closing bracket
  let depth = 0;
  let endIndex = -1;
  for (let i = 0; i < afterStart.length; i++) {
    if (afterStart[i] === '[') depth++;
    else if (afterStart[i] === ']') {
      depth--;
      if (depth === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  assert.ok(endIndex !== -1, 'Matching closing bracket for INITIAL_COURSES found');
  const jsonLike = afterStart.substring(0, endIndex);
  
  // Evaluate the array safely via Function
  const courses = new Function(`return ${jsonLike};`)();
  return courses;
}

// Helper to extract MOCK_COURSES from src/data/mockCourses.ts
function getMockCoursesTs() {
  const mockPath = path.resolve(__dirname, '../src/data/mockCourses.ts');
  const content = fs.readFileSync(mockPath, 'utf8');

  const startMarker = 'export const MOCK_COURSES: Course[] = [';
  const startIndex = content.indexOf(startMarker);
  assert.ok(startIndex !== -1, 'MOCK_COURSES must exist in src/data/mockCourses.ts');

  const afterStart = content.substring(startIndex + 'export const MOCK_COURSES: Course[] = '.length);
  let depth = 0;
  let endIndex = -1;
  for (let i = 0; i < afterStart.length; i++) {
    if (afterStart[i] === '[') depth++;
    else if (afterStart[i] === ']') {
      depth--;
      if (depth === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  assert.ok(endIndex !== -1, 'Matching closing bracket for MOCK_COURSES found');
  const code = afterStart.substring(0, endIndex);
  const courses = new Function(`return ${code};`)();
  return courses;
}

const REQUIRED_FIELDS = [
  'id',
  'code',
  'name',
  'faculty',
  'credits',
  'lecturer',
  'day',
  'startPeriod',
  'endPeriod',
  'shift',
  'periodSlot',
  'periodText',
  'scheduleText',
  'timeText',
  'prerequisites',
  'enrolled',
  'maxSeats'
];

test('Data Contract: src/data/mockCourses.ts Completeness and Validity', async (t) => {
  const courses = getMockCoursesTs();
  assert.ok(courses.length > 0, 'mockCourses.ts must have courses');

  await t.test('No required field is undefined or null', () => {
    for (const c of courses) {
      for (const field of REQUIRED_FIELDS) {
        assert.notStrictEqual(
          c[field],
          undefined,
          `Course ${c.id} field '${field}' must not be undefined`
        );
        assert.notStrictEqual(
          c[field],
          null,
          `Course ${c.id} field '${field}' must not be null`
        );
      }
      // room or classroom check
      const roomVal = c.room || c.classroom;
      assert.ok(roomVal, `Course ${c.id} must have room or classroom`);
    }
  });

  await t.test('All numeric fields have valid ranges', () => {
    for (const c of courses) {
      assert.ok(typeof c.credits === 'number' && c.credits > 0 && c.credits <= 10, `Valid credits for ${c.id}: ${c.credits}`);
      assert.ok(typeof c.day === 'number' && c.day >= 2 && c.day <= 8, `Valid day (2-8) for ${c.id}: ${c.day}`);
      assert.ok(typeof c.startPeriod === 'number' && c.startPeriod >= 1 && c.startPeriod <= 11, `Valid startPeriod (1-11) for ${c.id}: ${c.startPeriod}`);
      assert.ok(typeof c.endPeriod === 'number' && c.endPeriod >= 1 && c.endPeriod <= 11, `Valid endPeriod (1-11) for ${c.id}: ${c.endPeriod}`);
      assert.ok(c.startPeriod <= c.endPeriod, `startPeriod <= endPeriod for ${c.id}`);
      assert.ok(typeof c.enrolled === 'number' && c.enrolled >= 0, `Valid enrolled for ${c.id}: ${c.enrolled}`);
      assert.ok(typeof c.maxSeats === 'number' && c.maxSeats > 0, `Valid maxSeats for ${c.id}: ${c.maxSeats}`);
      assert.ok(c.enrolled <= c.maxSeats, `enrolled <= maxSeats for ${c.id} (${c.enrolled}/${c.maxSeats})`);
    }
  });

  await t.test('periodSlot values match canonical slot definition', () => {
    const validSlots = ['slot_1_3', 'slot_4_5', 'slot_7_9', 'slot_10_11'];
    for (const c of courses) {
      assert.ok(
        validSlots.includes(c.periodSlot),
        `Course ${c.id} has invalid periodSlot: '${c.periodSlot}'. Expected one of ${validSlots.join(', ')}`
      );

      // Verify mathematical alignment between periodSlot and start/end period
      if (c.periodSlot === 'slot_1_3') {
        assert.ok(c.startPeriod >= 1 && c.endPeriod <= 3, `${c.id} with slot_1_3 must fall within periods 1-3`);
      } else if (c.periodSlot === 'slot_4_5') {
        assert.ok(c.startPeriod >= 4 && c.endPeriod <= 5, `${c.id} with slot_4_5 must fall within periods 4-5`);
      } else if (c.periodSlot === 'slot_7_9') {
        assert.ok(c.startPeriod >= 7 && c.endPeriod <= 10, `${c.id} with slot_7_9 must fall within afternoon start 7`);
      } else if (c.periodSlot === 'slot_10_11') {
        assert.ok(c.startPeriod >= 10 && c.endPeriod <= 11, `${c.id} with slot_10_11 must fall within periods 10-11`);
      }
    }
  });

  await t.test('prerequisites is always an array of string identifiers', () => {
    for (const c of courses) {
      assert.ok(Array.isArray(c.prerequisites), `Course ${c.id} prerequisites must be an array`);
      for (const prereq of c.prerequisites) {
        assert.ok(typeof prereq === 'string' && prereq.length > 0, `Prerequisite for ${c.id} must be non-empty string`);
      }
    }
  });
});

test('Data Contract: index.html Completeness and Validity', async (t) => {
  const courses = getIndexHtmlCourses();
  assert.ok(courses.length > 0, 'index.html must have courses');

  await t.test('No required field is undefined or null', () => {
    for (const c of courses) {
      for (const field of REQUIRED_FIELDS) {
        assert.notStrictEqual(
          c[field],
          undefined,
          `Course ${c.id} field '${field}' in index.html must not be undefined`
        );
        assert.notStrictEqual(
          c[field],
          null,
          `Course ${c.id} field '${field}' in index.html must not be null`
        );
      }
      const roomVal = c.room || c.classroom;
      assert.ok(roomVal, `Course ${c.id} in index.html must have room or classroom`);
    }
  });

  await t.test('All numeric fields have valid ranges', () => {
    for (const c of courses) {
      assert.ok(typeof c.credits === 'number' && c.credits > 0 && c.credits <= 10, `Valid credits for ${c.id}: ${c.credits}`);
      assert.ok(typeof c.day === 'number' && c.day >= 2 && c.day <= 8, `Valid day (2-8) for ${c.id}: ${c.day}`);
      assert.ok(typeof c.startPeriod === 'number' && c.startPeriod >= 1 && c.startPeriod <= 11, `Valid startPeriod for ${c.id}: ${c.startPeriod}`);
      assert.ok(typeof c.endPeriod === 'number' && c.endPeriod >= 1 && c.endPeriod <= 11, `Valid endPeriod for ${c.id}: ${c.endPeriod}`);
      assert.ok(c.startPeriod <= c.endPeriod, `startPeriod <= endPeriod for ${c.id}`);
      assert.ok(typeof c.enrolled === 'number' && c.enrolled >= 0, `Valid enrolled for ${c.id}: ${c.enrolled}`);
      assert.ok(typeof c.maxSeats === 'number' && c.maxSeats > 0, `Valid maxSeats for ${c.id}: ${c.maxSeats}`);
      assert.ok(c.enrolled <= c.maxSeats, `enrolled <= maxSeats for ${c.id}`);
    }
  });
});

test('alternateCourseId Referential Integrity & Conflict Resolution', async (t) => {
  const tsCourses = getMockCoursesTs();
  const htmlCourses = getIndexHtmlCourses();

  for (const [datasetName, list] of [['mockCourses.ts', tsCourses], ['index.html', htmlCourses]]) {
    await t.test(`Verification for ${datasetName}`, () => {
      const courseMap = new Map(list.map(c => [c.id, c]));
      
      const coursesWithAlt = list.filter(c => c.alternateCourseId);
      assert.ok(coursesWithAlt.length > 0, `${datasetName} should have courses with alternateCourseId`);

      for (const c of coursesWithAlt) {
        const altId = c.alternateCourseId;
        const altCourse = courseMap.get(altId);
        assert.ok(altCourse, `Course ${c.id} references alternateCourseId '${altId}' which does not exist in ${datasetName}`);

        // Alternate course should be an alternate section of the same subject or compatible replacement
        assert.strictEqual(
          altCourse.faculty,
          c.faculty,
          `Alternate course ${altId} must belong to same faculty as ${c.id}`
        );
        assert.strictEqual(
          altCourse.credits,
          c.credits,
          `Alternate course ${altId} must have same credits (${altCourse.credits}) as ${c.id} (${c.credits})`
        );

        // Crucial: The alternate section must have a DIFFERENT schedule so it can resolve a conflict!
        const sameSchedule = altCourse.day === c.day && altCourse.startPeriod === c.startPeriod;
        assert.strictEqual(
          sameSchedule,
          false,
          `Alternate course ${altId} has identical schedule to ${c.id} (${c.scheduleText}); cannot resolve conflict!`
        );

        // Bidirectional or circular mapping check
        if (altCourse.alternateCourseId) {
          assert.strictEqual(
            altCourse.alternateCourseId,
            c.id,
            `Alternate mapping should be reciprocal: ${c.id} -> ${altId} -> ${altCourse.alternateCourseId}`
          );
        }
      }
    });
  }
});

test('Sunday (Day 8) Course Data Presence & Correctness', async (t) => {
  const tsCourses = getMockCoursesTs();
  const htmlCourses = getIndexHtmlCourses();

  for (const [datasetName, list] of [['mockCourses.ts', tsCourses], ['index.html', htmlCourses]]) {
    await t.test(`Sunday course verification in ${datasetName}`, () => {
      const sundayCourses = list.filter(c => c.day === 8);
      assert.ok(
        sundayCourses.length >= 1,
        `Expected at least 1 Sunday course (day = 8) in ${datasetName}, found ${sundayCourses.length}`
      );

      for (const c of sundayCourses) {
        assert.strictEqual(c.day, 8, `Sunday course must have day === 8`);
        assert.ok(
          c.scheduleText.includes('Chủ Nhật') || c.scheduleText.includes('Sunday'),
          `Sunday course ${c.id} scheduleText must mention 'Chủ Nhật', got: '${c.scheduleText}'`
        );
        assert.ok(c.startPeriod >= 1 && c.endPeriod <= 11, `Sunday course valid periods`);
        assert.ok(c.periodSlot, `Sunday course must have valid periodSlot`);
      }
    });
  }
});

test('Parity between src/data/mockCourses.ts and index.html', async (t) => {
  const tsCourses = getMockCoursesTs();
  const htmlCourses = getIndexHtmlCourses();

  await t.test('Course count parity', () => {
    assert.strictEqual(
      htmlCourses.length,
      tsCourses.length,
      `index.html course count (${htmlCourses.length}) must match mockCourses.ts (${tsCourses.length})`
    );
  });

  await t.test('All course IDs match exactly', () => {
    const tsIds = tsCourses.map(c => c.id).sort();
    const htmlIds = htmlCourses.map(c => c.id).sort();
    assert.deepStrictEqual(htmlIds, tsIds, 'Set of course IDs must be identical across both datasets');
  });

  await t.test('Course field-by-field parity', () => {
    const htmlMap = new Map(htmlCourses.map(c => [c.id, c]));

    for (const tsCourse of tsCourses) {
      const htmlCourse = htmlMap.get(tsCourse.id);
      assert.ok(htmlCourse, `Course ${tsCourse.id} must exist in index.html`);

      assert.strictEqual(htmlCourse.code, tsCourse.code, `${tsCourse.id} code mismatch`);
      assert.strictEqual(htmlCourse.name, tsCourse.name, `${tsCourse.id} name mismatch`);
      assert.strictEqual(htmlCourse.credits, tsCourse.credits, `${tsCourse.id} credits mismatch`);
      assert.strictEqual(htmlCourse.day, tsCourse.day, `${tsCourse.id} day mismatch`);
      assert.strictEqual(htmlCourse.startPeriod, tsCourse.startPeriod, `${tsCourse.id} startPeriod mismatch`);
      assert.strictEqual(htmlCourse.endPeriod, tsCourse.endPeriod, `${tsCourse.id} endPeriod mismatch`);
      assert.strictEqual(htmlCourse.shift, tsCourse.shift, `${tsCourse.id} shift mismatch`);
      assert.strictEqual(htmlCourse.status, tsCourse.status, `${tsCourse.id} status mismatch`);
      assert.deepStrictEqual(htmlCourse.prerequisites, tsCourse.prerequisites, `${tsCourse.id} prerequisites mismatch`);
      assert.strictEqual(htmlCourse.alternateCourseId, tsCourse.alternateCourseId, `${tsCourse.id} alternateCourseId mismatch`);
      assert.strictEqual(htmlCourse.enrolled, tsCourse.enrolled, `${tsCourse.id} enrolled mismatch`);
      assert.strictEqual(htmlCourse.maxSeats, tsCourse.maxSeats, `${tsCourse.id} maxSeats mismatch`);

      // Check periodSlot alignment
      // In PROJECT.md: 'slot_1_3' | 'slot_4_5' | 'slot_7_9' | 'slot_10_11'
      // Check whether index.html uses 'slot_X_Y' or 'pX' and how they map
      const slotMap = {
        'slot_1_3': 'p1',
        'slot_4_5': 'p2',
        'slot_7_9': 'p3',
        'slot_10_11': 'p4'
      };
      const expectedP = slotMap[tsCourse.periodSlot];
      const htmlSlot = htmlCourse.periodSlot;
      const isDirectMatch = htmlSlot === tsCourse.periodSlot;
      const isAliasMatch = htmlSlot === expectedP;
      assert.ok(
        isDirectMatch || isAliasMatch,
        `Course ${tsCourse.id} periodSlot in index.html ('${htmlSlot}') does not match or map to mockCourses.ts ('${tsCourse.periodSlot}')`
      );
    }
  });
});

test('Adversarial Stress Test: UI Access Path & Zero Undefined Regression', async (t) => {
  const tsCourses = getMockCoursesTs();
  const htmlCourses = getIndexHtmlCourses();

  for (const [name, list] of [['mockCourses.ts', tsCourses], ['index.html', htmlCourses]]) {
    await t.test(`Simulate UI render pipeline on all courses in ${name}`, () => {
      for (const course of list) {
        // CourseCard UI access simulator
        const cardTitle = `${course.code} - ${course.name}`;
        assert.ok(cardTitle && !cardTitle.includes('undefined'), `Card title must not contain undefined: ${cardTitle}`);

        const lecturerStr = `GV: ${course.lecturer}`;
        assert.ok(lecturerStr && !lecturerStr.includes('undefined'), `Lecturer must not contain undefined: ${lecturerStr}`);

        const roomStr = `Phòng: ${course.room || course.classroom}`;
        assert.ok(roomStr && !roomStr.includes('undefined'), `Room must not contain undefined: ${roomStr}`);

        const scheduleStr = `${course.scheduleText} | ${course.timeText}`;
        assert.ok(scheduleStr && !scheduleStr.includes('undefined'), `Schedule must not contain undefined: ${scheduleStr}`);

        const seatsStr = `${course.enrolled}/${course.maxSeats}`;
        assert.ok(seatsStr && !seatsStr.includes('undefined') && !seatsStr.includes('NaN'), `Seats must not contain undefined/NaN: ${seatsStr}`);

        const seatRatio = course.enrolled / course.maxSeats;
        assert.ok(!isNaN(seatRatio) && seatRatio >= 0 && seatRatio <= 1, `Seat ratio must be valid percentage: ${seatRatio}`);

        // Timetable matrix grid coordinate simulator (8 cols x 4 slots)
        const colIndex = course.day - 1; // Col 1: Time, Col 2: T2, ..., Col 8: CN
        assert.ok(colIndex >= 1 && colIndex <= 7, `Course ${course.id} day ${course.day} maps to valid grid column index ${colIndex}`);

        // Workload & tuition simulator
        const tuition = course.credits * 450000;
        assert.ok(!isNaN(tuition) && tuition > 0, `Course ${course.id} tuition must be valid number: ${tuition}`);
      }
    });
  }
});

test('Adversarial Stress Test: Sunday (AI101) Full Lifecycle Flow', async (t) => {
  const tsCourses = getMockCoursesTs();
  const ai101 = tsCourses.find(c => c.id === 'AI101');
  assert.ok(ai101, 'AI101 must exist in dataset');

  // Verify Day filter isolation: Day 8 filter must include AI101 and ONLY Day 8 courses
  const day8Courses = tsCourses.filter(c => c.day === 8);
  assert.strictEqual(day8Courses.length, 1);
  assert.strictEqual(day8Courses[0].id, 'AI101');

  // Shift filter: AI101 is morning (startPeriod = 1, endPeriod = 3)
  assert.strictEqual(ai101.shift, 'MORNING');
  assert.ok(ai101.startPeriod <= 5, 'Morning course startPeriod <= 5');

  // Faculty filter: AI101 belongs to CNTT
  assert.strictEqual(ai101.faculty, 'CNTT');

  // Timetable collision simulation:
  // Another course on Sunday at period 2-4 would clash with AI101 (periods 1-3)
  const overlappingSundayCourse = {
    id: 'DUMMY_SUN',
    day: 8,
    startPeriod: 2,
    endPeriod: 4
  };
  const clash = (ai101.day === overlappingSundayCourse.day) &&
    (ai101.startPeriod <= overlappingSundayCourse.endPeriod && ai101.endPeriod >= overlappingSundayCourse.startPeriod);
  assert.strictEqual(clash, true, 'Conflict math correctly detects collision on Sunday');

  // Non-overlapping Sunday course (periods 7-9)
  const nonOverlappingSundayCourse = {
    id: 'DUMMY_SUN_PM',
    day: 8,
    startPeriod: 7,
    endPeriod: 9
  };
  const noClash = (ai101.day === nonOverlappingSundayCourse.day) &&
    (ai101.startPeriod <= nonOverlappingSundayCourse.endPeriod && ai101.endPeriod >= nonOverlappingSundayCourse.startPeriod);
  assert.strictEqual(noClash, false, 'Conflict math correctly reports no collision for different period slot on Sunday');
});

test('Adversarial Stress Test: 1-Click Alternate Course Swap Execution', async (t) => {
  const tsCourses = getMockCoursesTs();
  const cs201 = tsCourses.find(c => c.id === 'CS201'); // T3 Tiết 1-3
  const cs202_02 = tsCourses.find(c => c.id === 'CS202-02'); // T3 Tiết 1-3 (conflicts with CS201)
  const cs202_01 = tsCourses.find(c => c.id === 'CS202-01'); // T5 Tiết 7-9 (alternate non-conflicting)

  assert.ok(cs201 && cs202_02 && cs202_01, 'All test sections must exist');

  // 1. Initial State: Student has CS201 selected
  let selected = [cs201];

  // 2. Incoming CS202-02 causes conflict
  const hasConflict = (cs202_02.day === cs201.day) &&
    (cs202_02.startPeriod <= cs201.endPeriod && cs202_02.endPeriod >= cs201.startPeriod);
  assert.strictEqual(hasConflict, true, 'CS202-02 must collide with CS201');

  // 3. Resolve by swapping to alternateCourseId
  const altId = cs202_02.alternateCourseId;
  assert.strictEqual(altId, 'CS202-01');
  const alternate = tsCourses.find(c => c.id === altId);
  assert.ok(alternate, 'Alternate course exists');

  // 4. Validate that alternate resolves the conflict
  const altConflictsWithCs201 = (alternate.day === cs201.day) &&
    (alternate.startPeriod <= cs201.endPeriod && alternate.endPeriod >= cs201.startPeriod);
  assert.strictEqual(altConflictsWithCs201, false, 'Alternate course CS202-01 must NOT conflict with CS201');

  // 5. Apply swap to selected list
  selected.push(alternate);
  assert.strictEqual(selected.length, 2);

  // Total credits calculation
  const totalCredits = selected.reduce((sum, c) => sum + c.credits, 0);
  assert.strictEqual(totalCredits, 6);
  assert.strictEqual(totalCredits * 450000, 2700000);
});

